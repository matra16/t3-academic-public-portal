/**
 * PBL LMS protected learner gateway — contract implementation, NOT a deployment.
 * No roster, credentials, school IDs, domain names, storage locations or auth secrets.
 * The existing production/public school RPC MUST remain fail-closed until approved.
 *
 * Required injected adapters:
 *   release, directory, invites, credentials, sessions, throttle, repository,
 *   digest, now.
 * Repository transaction callback MUST guarantee serialized journal + recovery
 * and read-after-write. Google Sheets alone does NOT supply ACID transactions.
 */
function pblCreateLearnerGateway_(dependencies) {
  'use strict';
  const d = dependencies || {};
  const actions = ['STEP_VIEW','TASK_START','TASK_SUBMIT','FEEDBACK_READ','REVISION','SESSION_END'];
  const ACCESS_ERROR = 'PBL_LEARNER_ACCESS_DENIED';
  function deny(code) { throw Error(code || ACCESS_ERROR); }
  function now() { return d.now ? d.now() : Date.now(); }
  function str(v,max,pattern) {
    const s=String(v==null?'':v).trim();
    if(!s||s.length>max||(pattern&&!pattern.test(s)))deny('INVALID_INPUT');
    return s;
  }
  function ensure() {
    const r=d.release||{};
    const sandbox=r.mode==='SYNTHETIC_QA'&&r.syntheticOnly===true;
    const prod=r.mode==='SCHOOL_PRODUCTION'&&r.ownerApproved===true&&
      r.privacyApproved===true&&r.schemaApproved===true&&r.authProviderApproved===true&&
      r.teacherGrantsVerified===true&&r.revisionAccepted===true;
    if(!sandbox&&!prod)deny('SCHOOL_RELEASE_GATE_CLOSED');
    if(!d.directory||!d.invites||!d.credentials||!d.sessions||!d.throttle||
       !d.repository||!d.digest||!d.repository.transaction)deny('ADAPTER_NOT_CONFIGURED');
    return r;
  }
  function rate(key){if(!d.throttle.allow(key,now()))deny('RATE_LIMITED');}
  function account(uid,tx){
    const x=d.directory.get(uid,tx);
    if(!x||x.active!==true||x.tenant!=='PBL_LEARNING')deny();
    return x;
  }
  function trusted(token,tx) {
    const t=str(token,256,/^[A-Za-z0-9_-]{24,256}$/);
    const principal=d.sessions.verify(t,now(),tx);
    const expiresAt=Number(principal&&principal.expiresAt);
    if(!principal||principal.verifiedByServer!==true||!Number.isFinite(expiresAt)||expiresAt<=now()||
       principal.tenant!=='PBL_LEARNING')deny('SESSION_INVALID');
    const a=account(principal.uid,tx);
    if(a.role!==principal.role||a.passwordEpoch!==principal.passwordEpoch)deny('SESSION_REVOKED');
    if(a.role==='STUDENT'&&a.classId!==principal.classId)deny('SCOPE_MISMATCH');
    if(a.role==='TEACHER'&&JSON.stringify(a.assignedClasses||[])!==
       JSON.stringify(principal.assignedClasses||[]))deny('TEACHER_GRANT_CHANGED');
    return {actor:principal,acct:a};
  }
  function needStudent(auth,tx) {
    const v=trusted(auth,tx);
    if(v.actor.role!=='STUDENT'||v.acct.firstLogin===true)deny('STUDENT_ACTIVATION_REQUIRED');
    return v;
  }
  function needTeacher(auth,room,tx) {
    const v=trusted(auth,tx);
    if(v.actor.role!=='TEACHER'||!v.actor.assignedClasses||
       v.actor.assignedClasses.indexOf(room)===-1)deny('CLASS_GRANT_REQUIRED');
    return v;
  }
  function safePayload(input){
    const p=input&&typeof input==='object'&&!Array.isArray(input)?input:{};
    if(['studentId','learnerUid','ownerId','role','verifiedByServer','tenant','classId',
        'schoolId','teacherUid','password','credential'].some(k=>Object.prototype.hasOwnProperty.call(p,k)))
      deny('CLIENT_IDENTITY_OVERRIDE');
    return p;
  }
  function inviteClaim(input){
    const code=str(input.inviteCode,90,/^[A-Za-z0-9_-]{16,90}$/);
    rate('invite:'+d.digest(code).slice(0,20));
    const invite=d.invites.preview(code,now());
    if(!invite||invite.used||!Number.isFinite(Number(invite.expiresAt))||Number(invite.expiresAt)<=now())deny('INVITE_INVALID');
    const acct=account(invite.uid);
    if(acct.role!=='STUDENT'||acct.classId!==invite.classId)deny('INVITE_SCOPE_INVALID');
    // Return only the person associated with this unique one-time invitation.
    return {ok:true,classId:acct.classId,displayName:acct.displayName,learnerUid:acct.uid,
      needsActivation:acct.firstLogin===true};
  }
  function activate(input) {
    const code=str(input.inviteCode,90,/^[A-Za-z0-9_-]{16,90}$/);
    rate('activate:'+d.digest(code).slice(0,20));
    const invite=d.invites.preview(code,now());
    if(!invite||invite.used||!Number.isFinite(Number(invite.expiresAt))||Number(invite.expiresAt)<=now())deny('INVITE_INVALID');
    const a=account(invite.uid);
    if(a.role!=='STUDENT'||a.classId!==invite.classId||a.firstLogin!==true)
      deny('ACTIVATION_NOT_ALLOWED');
    if(!d.credentials.verifyBootstrap(a.uid,String(input.initialPassword||'')))
      deny('INVALID_CREDENTIAL');
    const replacement=str(input.newPassword,128);
    if(!d.credentials.validateStrength(replacement)||replacement===String(input.initialPassword||''))
      deny('WEAK_NEW_CREDENTIAL');
    return d.repository.transaction(function(tx){
      // Repository adapter must handle rollback/recovery for invite and credential changes.
      const fresh=d.invites.preview(code,now(),tx);
      const freshAcct=d.directory.get(a.uid,tx);
      if(!fresh||fresh.used||!Number.isFinite(Number(fresh.expiresAt))||
         Number(fresh.expiresAt)<=now()||fresh.uid!==a.uid||
         fresh.classId!==a.classId||!freshAcct||freshAcct.active!==true||
         freshAcct.tenant!=='PBL_LEARNING'||freshAcct.role!=='STUDENT'||
         freshAcct.classId!==fresh.classId||freshAcct.firstLogin!==true)
        deny('ACTIVATION_RACE');
      if(!d.credentials.verifyBootstrap(a.uid,String(input.initialPassword||''),tx))
        deny('INVALID_CREDENTIAL');
      const epoch=d.credentials.replaceBootstrap(a.uid,replacement,tx);
      if(!Number.isInteger(epoch)||epoch<=freshAcct.passwordEpoch)deny('CREDENTIAL_NOT_REVOKED');
      d.directory.activate(a.uid,epoch,tx);
      d.invites.consume(code,tx);
      const chk=d.directory.get(a.uid,tx);
      if(!chk||chk.firstLogin!==false||chk.passwordEpoch!==epoch)
        deny('ACTIVATION_READBACK_FAILED');
      return {ok:true,activated:true,learnerUid:a.uid,requiresLogin:true};
    });
  }
  function login(input){
    const uid=str(input.learnerUid,70,/^[A-Za-z0-9_-]{3,70}$/);
    rate('login:global');
    rate('login:'+uid);
    let a;
    try{a=account(uid)}catch(e){deny('INVALID_CREDENTIAL')}
    if(a.role!=='STUDENT'||a.firstLogin===true)deny('INVALID_CREDENTIAL');
    if(!d.credentials.verifyPassword(uid,String(input.password||'')))deny('INVALID_CREDENTIAL');
    const token=d.sessions.issue({
      uid:a.uid,role:'STUDENT',classId:a.classId,
      passwordEpoch:a.passwordEpoch,tenant:'PBL_LEARNING',
      verifiedByServer:true},now());
    return {ok:true,token,expiresInSeconds:d.sessions.ttlSeconds,
      learner:{displayName:a.displayName,classId:a.classId}};
  }
  function logout(input){
    const auth=trusted(input.authToken);
    d.sessions.revoke(input.authToken);
    return {ok:true,loggedOut:true,role:auth.actor.role};
  }
  function change(input){
    const s=needStudent(input.authToken);
    rate('password-change:'+s.acct.uid);
    const replacement=str(input.newPassword,128);
    if(!d.credentials.validateStrength(replacement))deny('WEAK_NEW_CREDENTIAL');
    return d.repository.transaction(function(tx){
      const fresh=needStudent(input.authToken,tx);
      if(!d.credentials.verifyPassword(fresh.acct.uid,String(input.oldPassword||''),tx))
        deny('INVALID_CREDENTIAL');
      const epoch=d.credentials.change(fresh.acct.uid,replacement,tx);
      if(!Number.isSafeInteger(epoch)||epoch<=fresh.acct.passwordEpoch)
        deny('EPOCH_NOT_ADVANCED');
      const verify=d.directory.get(fresh.acct.uid,tx);
      if(!verify||verify.passwordEpoch!==epoch)
        deny('PASSWORD_READBACK_FAILED');
      d.sessions.revokeAll(fresh.acct.uid,tx);
      if(d.sessions.verify(input.authToken,now(),tx))
        deny('SESSION_REVOKE_FAILED');
      return {ok:true,credentialChanged:true,loginRequired:true};
    });
  }
  function own(input){
    const s=needStudent(input.authToken);
    return {ok:true,works:d.repository.listOwn(s.acct.uid,s.acct.classId),
      events:d.repository.listOwnEvents(s.acct.uid,s.acct.classId)};
  }
  function classRead(input){
    const room=str(input.room,32,/^[A-Za-z0-9_.-]{1,32}$/);
    needTeacher(input.authToken,room);
    return {ok:true,room,works:d.repository.listClass(room)};
  }
  function record(input) {
    const action=str(input.op,30,/^[A-Z_]{3,30}$/);
    const allowed=actions.indexOf(action)!==-1;
    if(!allowed)deny('UNSUPPORTED_EVENT');
    const s=needStudent(input.authToken);
    const payload=safePayload(input.payload);
    const requestId=str(input.requestId,70,/^[A-Za-z0-9_-]{12,70}$/);
    const taskId=str(payload.taskId,70,/^[A-Za-z0-9_.-]{2,70}$/);
    const task=d.repository.task(taskId);
    const passive=action==='FEEDBACK_READ'||action==='SESSION_END';
    if(!task||task.classId!==s.acct.classId||
       !(task.status==='OPEN'||(passive&&task.status==='CLOSED')))
      deny('TASK_SCOPE_OR_STATUS_DENIED');
    const content=(action==='TASK_SUBMIT'||action==='REVISION')
      ?str(payload.note,3000):'';
    if(/[<>]/.test(content))deny('UNSAFE_CONTENT');
    const fingerprint=d.digest([s.acct.uid,action,taskId,content].join('|'));
    if(!/^[a-f0-9]{64}$/i.test(fingerprint))deny('DIGEST_ADAPTER_INVALID');
    return d.repository.transaction(function(tx){
      const fresh=needStudent(input.authToken,tx);
      const currentTask=d.repository.task(taskId,tx);
      if(fresh.acct.uid!==s.acct.uid||fresh.acct.classId!==s.acct.classId||
         !currentTask||currentTask.classId!==fresh.acct.classId||
         !(currentTask.status==='OPEN'||(passive&&currentTask.status==='CLOSED')))
        deny('TASK_SCOPE_OR_STATUS_DENIED');
      const previous=d.repository.getEventByRequest(requestId,tx);
      if(previous){
        if(previous.actor!==s.acct.uid||previous.fingerprint!==fingerprint)
          deny('REQUEST_ID_REUSED');
        return {ok:true,repeated:true,eventId:previous.id,revision:previous.revision};
      }
      const current=d.repository.getWork(s.acct.uid,taskId,tx);
      const expected=payload.expectedRevision;
      const changesWork=action==='TASK_SUBMIT'||action==='REVISION';
      if(changesWork&&(!Number.isSafeInteger(expected)||expected<0||
         expected!==(current?current.revision:0)))
        deny('STALE_REVISION');
      const nextRev=changesWork?expected+1:(current?current.revision:0);
      const stamp=now();
      const event={id:d.repository.nextId(tx),requestId,actor:s.acct.uid,
        classId:s.acct.classId,taskId,action,fingerprint,revision:nextRev,at:stamp};
      d.repository.appendEvent(event,tx);
      if(content){
        d.repository.upsertWork({owner:s.acct.uid,classId:s.acct.classId,
          taskId,note:content,status:'PENDING',revision:nextRev,updatedAt:stamp},tx);
      }
      const audit=d.repository.getEventByRequest(requestId,tx);
      if(!audit||audit.id!==event.id||audit.actor!==s.acct.uid||
         audit.classId!==s.acct.classId||audit.taskId!==taskId||
         audit.fingerprint!==fingerprint||audit.action!==action||
         audit.requestId!==requestId||audit.revision!==nextRev)
        deny('EVENT_READBACK_FAILED');
      if(content){
        const verify=d.repository.getWork(s.acct.uid,taskId,tx);
        if(!verify||verify.owner!==s.acct.uid||verify.classId!==s.acct.classId||
           verify.taskId!==taskId||verify.status!=='PENDING'||
           verify.revision!==nextRev||verify.note!==content)
          deny('WORK_READBACK_FAILED');
      }
      return {ok:true,eventId:event.id,revision:nextRev,repeated:false};
    });
  }
  function review(input){
    const payload=safePayload(input.payload);
    const taskId=str(payload.taskId,70,/^[A-Za-z0-9_.-]{2,70}$/);
    const room=str(input.room,32,/^[A-Za-z0-9_.-]{1,32}$/);
    const t=needTeacher(input.authToken,room);
    const work=d.repository.getWorkById(str(payload.workId,70,/^[A-Za-z0-9_-]{2,70}$/));
    if(!work||work.classId!==room||work.taskId!==taskId)deny('WORK_SCOPE_DENIED');
    const feedback=str(payload.feedback,1200);
    if(/[<>]/.test(feedback))deny('UNSAFE_CONTENT');
    const requestId=str(input.requestId,70,/^[A-Za-z0-9_-]{12,70}$/);
    const expected=payload.expectedRevision;
    if(!Number.isSafeInteger(expected)||expected<0)deny('STALE_REVISION');
    const fingerprint=d.digest([t.acct.uid,work.id,feedback].join('|'));
    return d.repository.transaction(function(tx){
      const currentTeacher=needTeacher(input.authToken,room,tx);
      if(currentTeacher.acct.uid!==t.acct.uid)deny('TEACHER_GRANT_CHANGED');
      const prior=d.repository.getEventByRequest(requestId,tx);
      if(prior){
        if(prior.actor!==t.acct.uid||prior.fingerprint!==fingerprint)deny('REQUEST_ID_REUSED');
        return {ok:true,repeated:true,eventId:prior.id};
      }
      const latest=d.repository.getWorkById(work.id,tx);
      if(!latest||latest.classId!==room||latest.taskId!==taskId||
         latest.owner!==work.owner||latest.revision!==expected)
        deny('STALE_REVISION');
      const event={id:d.repository.nextId(tx),actor:t.acct.uid,classId:room,
        taskId,requestId,action:'TEACHER_REVIEW',fingerprint,revision:latest.revision+1,at:now()};
      d.repository.appendEvent(event,tx);
      d.repository.review(work.id,feedback,latest.revision+1,tx);
      const check=d.repository.getEventByRequest(requestId,tx);
      const saved=d.repository.getWorkById(work.id,tx);
      if(!check||check.id!==event.id||check.actor!==t.acct.uid||
         check.action!=='TEACHER_REVIEW'||check.fingerprint!==fingerprint||
         check.classId!==room||check.taskId!==taskId||
         !saved||saved.classId!==room||saved.taskId!==taskId||
         saved.feedback!==feedback||saved.revision!==event.revision||
         saved.status!=='NEEDS_REVISION')deny('REVIEW_READBACK_FAILED');
      return {ok:true,eventId:event.id,revision:event.revision};
    });
  }
  function dispatch(req){
    const input=req&&typeof req==='object'&&!Array.isArray(req)?req:{};
    ensure();
    const op=String(input.op||'').toUpperCase();
    if(op==='CLAIM')return inviteClaim(input);
    if(op==='ACTIVATE')return activate(input);
    if(op==='LOGIN')return login(input);
    if(op==='LOGOUT')return logout(input);
    if(op==='CHANGE_PASSWORD')return change(input);
    if(op==='READ_OWN')return own(input);
    if(op==='READ_CLASS')return classRead(input);
    if(op==='TEACHER_REVIEW')return review(input);
    return record(input);
  }
  return {dispatch};
}
