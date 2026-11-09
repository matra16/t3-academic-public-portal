/**
 * PBL LMS V16 — owner-only, staged Apps Script adapter (NOT deployed by this commit).
 * Execute as: owner; access: Anyone, only after school approval & security UAT.
 * No student national IDs, passwords, roster or secrets in source/GitHub.
 * Reuses existing PBL 22-tab master; four additive tabs require owner gate.
 */
const PBL11 = Object.freeze({
  admin: 'matra160114',
  eligibleClasses: ['6.1','6.2','6.3'],
  tabs: {users:'22_LMS_ACCOUNTS', groups:'23_LMS_GROUPS', work:'24_LMS_WORK', audit:'25_LMS_AUDIT'},
  headers: {
    users:['UID','CLASS','DISPLAY_NAME','ROLE','SALT','PASSWORD_HASH','MUST_CHANGE','ACTIVE','PASSWORD_VERSION','CREATED_AT','UPDATED_AT'],
    groups:['GROUP_ID','CLASS','GROUP_NAME','PROJECT_ID','MEMBER_UIDS_JSON','UPDATED_AT'],
    work:['OWNER_KEY','STEP','MODE','NOTE','DONE','REVISION','UPDATED_BY','UPDATED_AT'],
    audit:['EVENT_ID','ACTOR_UID','ACTION','TARGET_ID','CLASS','TIMESTAMP']
  },
  individual: [1,2,9,13,20], stepCount:20,
  sessionSeconds:1800, failedLimit:6, failedSeconds:900
});

function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('ห้องเรียนโครงงานภาษาอังกฤษ · ป.6')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.DENY);
}

/* Only public RPC entry point. All other helpers end in "_". */
function apiV12(req) {
  try {
    req = req && typeof req==='object' ? req : {};
    const action = String(req.action||'');
    const data = req.data && typeof req.data==='object' ? req.data : {};
    let result;
    if(action==='classes') result = {classes:PBL11.eligibleClasses.slice()};
    else if(action==='searchStudents') result = searchStudents_(data);
    else if(action==='login') result = login_(data);
    else {
      const session = authorize_(req.token);
      if(publicUser_(session.user).mustChange && !['changePassword','logout'].includes(action))
        throw Error('กรุณาเปลี่ยนรหัสผ่านเริ่มต้นก่อน');
      if(action==='dashboard') result = dashboard_(session);
      else if(action==='logout') {CacheService.getScriptCache().remove('pbl11_s_'+String(req.token));result={ok:true};}
      else if(action==='changePassword') result=changePassword_(session,data);
      else if(action==='saveStep') result=saveStep_(session,data);
      else if(action==='adminList') {admin_(session);result=adminList_();}
      else if(action==='adminRosterCandidates') {admin_(session);result=adminRosterCandidates_();}
      else if(action==='adminEnrollBatch') {admin_(session);result=adminEnrollBatch_(data);}
      else if(action==='adminProgress') {admin_(session);result=adminProgress_();}
      else if(action==='adminReviewQueue') {admin_(session);result=adminReviewQueue_();}
      else if(action==='adminReviewStep') {admin_(session);result=adminReviewStep_(data);}
      else if(action==='studentReviews') {result=studentReviews_(session);}
      else if(action==='adminAddStudent') {admin_(session);result=adminAddStudent_(data);}
      else if(action==='adminResetPassword') {admin_(session);result=adminResetPassword_(data);}
      else if(action==='adminSetActive') {admin_(session);result=adminSetActive_(data);}
      else if(action==='adminSaveGroup') {admin_(session);result=adminSaveGroup_(data);}
      else throw Error('ไม่รองรับคำสั่ง');
    }
    return {ok:true,data:result};
  } catch(e) {
    const msg=String(e&&e.message||'เกิดข้อผิดพลาด');
    // Deliberately avoid stack traces, hashes, IDs of files, or raw internal errors.
    return {ok:false,error:msg.slice(0,170)};
  }
}
function properties_(){return PropertiesService.getScriptProperties();}
function ss_() {
  const id=properties_().getProperty('PBL_V11_MASTER_ID');
  if(!id) throw Error('ยังไม่ได้เชื่อมฐานข้อมูลโรงเรียน');
  return SpreadsheetApp.openById(id);
}
function sheet_(type) {
  const sh=ss_().getSheetByName(PBL11.tabs[type]);
  if(!sh) throw Error('ยังไม่ได้ติดตั้งตาราง V11 ที่ผ่านการอนุมัติ');
  return sh;
}
function rows_(type) {
  const values=sheet_(type).getDataRange().getValues(), headers=PBL11.headers[type];
  if(!values.length || headers.some((h,i)=>String(values[0][i])!==h)) throw Error('โครงสร้างตารางไม่ตรงกับ V11');
  return values.slice(1).map((v,i)=>Object.fromEntries(headers.map((h,j)=>[h,v[j]===undefined?'':v[j]]).concat([['_row',i+2]])));
}
function add_(type,row) {
  const sh=sheet_(type);
  const v=PBL11.headers[type].map(h=>row[h]===undefined?'':row[h]);
  sh.appendRow(v);
}
function update_(type,n,row) {
  const sh=sheet_(type), v=PBL11.headers[type].map(h=>row[h]===undefined?'':row[h]);
  sh.getRange(n,1,1,v.length).setValues([v]);
}
function audit_(actor,action,target,cls){
  add_('audit',{EVENT_ID:'E'+random_().slice(0,24),ACTOR_UID:String(actor),ACTION:String(action),
    TARGET_ID:String(target||''),CLASS:String(cls||''),TIMESTAMP:new Date()});
}
function withLock_(fn) {
  const lock=LockService.getScriptLock();
  if(!lock.tryLock(12000)) throw Error('ระบบกำลังบันทึก โปรดลองใหม่');
  try {return fn();} finally {lock.releaseLock();}
}
function isP6Class_(classId) {
  return PBL11.eligibleClasses.indexOf(String(classId))!==-1;
}
function requireP6Class_(classId) {
  if(!isP6Class_(classId)) throw Error('โครงงานนี้รับเฉพาะนักเรียน ป.6/1, ป.6/2 และ ป.6/3');
  return String(classId);
}
function classCodes_() {
  try {
    const v=JSON.parse(properties_().getProperty('PBL_V11_CLASS_CODES_JSON')||'{}');
    if(!v||typeof v!=='object'||Array.isArray(v))return {};
    // Ignore any legacy class codes from a broader school pilot.
    return Object.fromEntries(Object.entries(v).filter(([cls])=>isP6Class_(cls)));
  }catch(e){throw Error('รหัสเข้าห้องเรียนยังไม่พร้อม');}
}
function required_(value,max) {
  const s=String(value===undefined?'':value).trim();
  if(!s||s.length>max||/[\u0000-\u001F\u007F]/.test(s)) throw Error('ข้อมูลไม่ถูกต้อง');
  return s;
}
function plain_(value,max) {
  return String(value||'').slice(0,max).replace(/[\u0000-\u001F\u007F]/g,' ').trim();
}
function validPassword_(s) {
  s=String(s||'');
  if(s.length<10||s.length>72||/[\u0000-\u001F\u007F]/.test(s)) throw Error('รหัสผ่านต้องมี 10–72 ตัวอักษร');
  if(/^\d{13}$/.test(s)) throw Error('ห้ามใช้เลขประจำตัวประชาชนเป็นรหัสผ่าน');
  return s;
}
function random_(){return Utilities.getUuid().replace(/-/g,'')+Utilities.getUuid().replace(/-/g,'');}
function temporaryPassword_(){return random_().slice(0,16);}
function hash_(password,salt) {
  const pepper=properties_().getProperty('PBL_V11_PEPPER');
  if(!pepper||pepper.length<40) throw Error('ต้องตั้งค่า Security Pepper โดยเจ้าของระบบก่อน');
  // Server-only per-account salt + hidden pepper; repeated HMAC. Upgrade to a
  // stronger audited password KDF (e.g. Argon2id) before high-scale PROD.
  let value=String(salt)+':'+String(password);
  for(let n=0;n<4500;n++) {
    value=Utilities.base64EncodeWebSafe(Utilities.computeHmacSha256Signature(value,pepper)).replace(/=+$/,'');
  }
  return value;
}
function same_(a,b) {
  a=String(a);b=String(b);let difference=a.length^b.length;
  for(let i=0;i<Math.max(a.length,b.length);i++) difference|=(a.charCodeAt(i)||0)^(b.charCodeAt(i)||0);
  return difference===0;
}
function makeCredential_(password) {
  const salt=random_().slice(0,32);return {salt,hash:hash_(password,salt)};
}
function findUser_(uid) {return rows_('users').find(x=>String(x.UID)===String(uid));}
function publicUser_(u) {
  return {uid:String(u.UID),classId:String(u.CLASS||''),name:String(u.DISPLAY_NAME||''),
    role:String(u.ROLE),mustChange:String(u.MUST_CHANGE)==='TRUE'||u.MUST_CHANGE===true,
    active:String(u.ACTIVE)==='TRUE'||u.ACTIVE===true};
}
function requireClassCode_(classId,code) {
  requireP6Class_(classId);
  const c=classCodes_();
  if(!c[classId]||!same_(String(c[classId]),String(code||''))) throw Error('ข้อมูลห้องเรียนหรือรหัสเข้าห้องไม่ถูกต้อง');
}
/**
 * School-controlled P6-only search. PRIVATE PII LIVE SEARCH REQUIRES
 * school-owner specific consent/privacy approval and a GAS authenticated
 * runtime audit; 3-char minimum and 8-result cap do NOT prevent enumeration.
 * Never publish an enrolled roster in GitHub Pages or a public JSON file.
 */
function searchStudents_(d) {
  const query=String(d.query||'').trim().replace(/\s+/g,' ').toLocaleLowerCase('th');
  if(query.length<3||query.length>60) return {students:[]};
  if(/[\u0000-\u001f]/.test(query)) return {students:[]};
  const eligible=rows_('users').filter(u=>
    u.ROLE==='STUDENT'&&isP6Class_(u.CLASS) &&
    (u.ACTIVE===true||String(u.ACTIVE)==='TRUE') &&
    String(u.DISPLAY_NAME||'').toLocaleLowerCase('th').includes(query)
  ).slice(0,8);
  return {students:eligible.map(u=>({uid:String(u.UID),name:String(u.DISPLAY_NAME),classId:String(u.CLASS)}))};
}
function failureKey_(uid){
  return 'pbl11_fail_'+Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,String(uid))).slice(0,44);
}
function blocked_(uid){
  return Number(CacheService.getScriptCache().get(failureKey_(uid))||0)>=PBL11.failedLimit;
}
function recordAttempt_(uid,success){
  const lock=LockService.getScriptLock();
  if(!lock.tryLock(5000))throw Error('กรุณาลองใหม่อีกครั้ง');
  try{
    const cache=CacheService.getScriptCache(),key=failureKey_(uid);
    if(success)cache.remove(key);
    else cache.put(key,String(Number(cache.get(key)||0)+1),PBL11.failedSeconds);
  }finally{lock.releaseLock();}
}
function login_(d) {
  const role=String(d.role||'');
  const uid=required_(d.uid,90),pass=String(d.password||'');
  if(pass.length>80) throw Error('ชื่อหรือรหัสผ่านไม่ถูกต้อง');
  if(role!=='STUDENT'&&role!=='ADMIN') throw Error('ชื่อหรือรหัสผ่านไม่ถูกต้อง');
  if(role==='ADMIN' && uid!==PBL11.admin) throw Error('ชื่อหรือรหัสผ่านไม่ถูกต้อง');
  if(role==='STUDENT' && !isP6Class_(d.classId)) throw Error('ชื่อหรือรหัสผ่านไม่ถูกต้อง');
  const u=findUser_(uid);
  const eligible=u && String(u.ROLE)===role && (u.ACTIVE===true||String(u.ACTIVE)==='TRUE') &&
    (role==='ADMIN'||(isP6Class_(u.CLASS)&&String(u.CLASS)===String(d.classId)));
  const failMessage='ชื่อหรือรหัสผ่านไม่ถูกต้อง หรือบัญชีไม่พร้อมใช้งาน';
  const hasLock=blocked_('login:'+uid);
  // No credential value or password hash is returned to browser.
  if(!eligible||hasLock) {if(!hasLock)recordAttempt_('login:'+uid,false);throw Error(failMessage);}
  const matched=same_(hash_(pass,String(u.SALT)),String(u.PASSWORD_HASH));
  if(!matched) {recordAttempt_('login:'+uid,false);throw Error(failMessage);}
  recordAttempt_('login:'+uid,true);
  const token=random_();
  CacheService.getScriptCache().put('pbl11_s_'+token,JSON.stringify({uid,role,v:Number(u.PASSWORD_VERSION)||1}),PBL11.sessionSeconds);
  return {token,user:publicUser_(u),expiresIn:PBL11.sessionSeconds};
}
function authorize_(token) {
  token=String(token||'');
  if(!/^[0-9a-f]{64}$/.test(token)) throw Error('กรุณาเข้าสู่ระบบอีกครั้ง');
  const raw=CacheService.getScriptCache().get('pbl11_s_'+token);
  if(!raw) throw Error('เซสชันหมดอายุ กรุณาเข้าสู่ระบบอีกครั้ง');
  const s=JSON.parse(raw),u=findUser_(s.uid);
  if(!u || !(u.ACTIVE===true||String(u.ACTIVE)==='TRUE') ||String(u.ROLE)!==s.role||
    (s.role==='STUDENT'&&!isP6Class_(u.CLASS))||
    Number(u.PASSWORD_VERSION)!==s.v) throw Error('สิทธิ์การเข้าใช้เปลี่ยนแปลง กรุณาเข้าสู่ระบบอีกครั้ง');
  return {uid:String(u.UID),role:String(u.ROLE),user:u};
}
function admin_(session) {
  if(session.role!=='ADMIN'||session.uid!==PBL11.admin) throw Error('ไม่มีสิทธิ์ผู้ดูแลระบบ');
}
function changePassword_(s,d) {
  const current=String(d.current||''),next=validPassword_(d.next);
  if(!same_(hash_(current,String(s.user.SALT)),String(s.user.PASSWORD_HASH))) throw Error('รหัสผ่านเดิมไม่ถูกต้อง');
  if(same_(current,next)) throw Error('ต้องใช้รหัสผ่านใหม่ที่แตกต่างจากเดิม');
  return withLock_(()=>{
    const u=findUser_(s.uid);if(!u||Number(u.PASSWORD_VERSION)!==Number(s.user.PASSWORD_VERSION))throw Error('บัญชีถูกปรับปรุงแล้ว กรุณาเข้าสู่ระบบใหม่');
    const c=makeCredential_(next);
    u.SALT=c.salt;u.PASSWORD_HASH=c.hash;u.MUST_CHANGE=false;u.PASSWORD_VERSION=Number(u.PASSWORD_VERSION)+1;u.UPDATED_AT=new Date();
    update_('users',u._row,u);
    audit_(s.uid,'PASSWORD_CHANGED',s.uid,String(u.CLASS||''));
    return {changed:true,loginRequired:true};
  });
}
function groups_(){return rows_('groups');}
function groupFor_(uid,cls) {
  return groups_().find(g=>String(g.CLASS)===cls && String(g.PROJECT_ID)==='VLOG20'&&
    JSON.parse(String(g.MEMBER_UIDS_JSON)||'[]').includes(uid));
}
function ownerKey_(s,step) {
  if(PBL11.individual.includes(step))return {key:'USER:'+s.uid,mode:'individual'};
  const grp=groupFor_(s.uid,String(s.user.CLASS));
  if(!grp)throw Error('ขั้นตอนกลุ่มรอ Admin จัดกลุ่มให้ก่อน');
  return {key:'GROUP:'+String(grp.GROUP_ID),mode:'group'};
}
function stepRows_(s) {
  const group= s.role==='STUDENT'?groupFor_(s.uid,String(s.user.CLASS)):null;
  const allowed=['USER:'+s.uid];
  if(group)allowed.push('GROUP:'+String(group.GROUP_ID));
  return rows_('work').filter(x=>allowed.includes(String(x.OWNER_KEY))).map(x=>({
    step:Number(x.STEP),mode:String(x.MODE),note:String(x.NOTE||''),done:String(x.DONE)==='TRUE'||x.DONE===true,
    revision:Number(x.REVISION)||0,updatedAt:String(x.UPDATED_AT||'')
  }));
}
function dashboard_(s) {
  if(s.role==='ADMIN') return {user:publicUser_(s.user),admin:true};
  const group=groupFor_(s.uid,String(s.user.CLASS));
  return {user:publicUser_(s.user),projectId:'VLOG20',
    group:group?{id:String(group.GROUP_ID),name:String(group.GROUP_NAME),members:JSON.parse(String(group.MEMBER_UIDS_JSON)||'[]').length}:null,
    steps:stepRows_(s),individualSteps:PBL11.individual};
}
function saveStep_(s,d) {
  if(s.role!=='STUDENT') throw Error('สิทธิ์ไม่ถูกต้อง');
  if(publicUser_(s.user).mustChange) throw Error('กรุณาเปลี่ยนรหัสผ่านเริ่มต้นก่อน');
  const step=Number(d.step);
  if(!Number.isInteger(step)||step<1||step>PBL11.stepCount)throw Error('ขั้นตอนการเรียนไม่ถูกต้อง');
  const note=plain_(d.note,1500);
  if(!note)throw Error('กรุณาบันทึกแนวคิดก่อน');
  if(/[=+@]/.test(note.charAt(0))||note.charAt(0)==='-')throw Error('โปรดเริ่มบันทึกด้วยข้อความปกติ');
  return withLock_(()=>{
    // Sequence is enforced on the server, not just disabled client buttons.
    if(step>1) {
      const prior=ownerKey_(s,step-1);
      const priorRow=rows_('work').find(x=>String(x.OWNER_KEY)===prior.key&&Number(x.STEP)===step-1);
      if(!priorRow || !(priorRow.DONE===true||String(priorRow.DONE)==='TRUE'))
        throw Error('กรุณาทำขั้นที่ '+(step-1)+' ให้เสร็จก่อน');
    }
    const target=ownerKey_(s,step),old=rows_('work').find(x=>String(x.OWNER_KEY)===target.key&&Number(x.STEP)===step);
    const expect=Number(d.revision)||0;
    if(old&&Number(old.REVISION)!==expect)throw Error('มีการแก้ไขงานจากอีกอุปกรณ์ โปรดโหลดข้อมูลใหม่');
    if(!old&&expect!==0)throw Error('ข้อมูลเปลี่ยนแปลง โปรดโหลดใหม่');
    const rev=expect+1,now=new Date();
    const rec={OWNER_KEY:target.key,STEP:step,MODE:target.mode,NOTE:note,DONE:true,REVISION:rev,UPDATED_BY:s.uid,UPDATED_AT:now};
    if(old)update_('work',old._row,rec);else add_('work',rec);
    return {step,revision:rev,mode:target.mode,updatedAt:now.toISOString()};
  });
}
function adminList_() {
  return {
    users:rows_('users').filter(u=>String(u.ROLE)==='STUDENT'&&isP6Class_(u.CLASS)).map(u=>publicUser_(u)),
    groups:groups_().filter(g=>isP6Class_(g.CLASS)).map(g=>({id:String(g.GROUP_ID),classId:String(g.CLASS),name:String(g.GROUP_NAME),
      projectId:String(g.PROJECT_ID),memberIds:JSON.parse(String(g.MEMBER_UIDS_JSON)||'[]')})),
    classIds:PBL11.eligibleClasses.slice()
  };
}
function adminAddStudent_(d) {
  const name=required_(d.name,110),cls=requireP6Class_(required_(d.classId,16));
  requireP6Class_(cls);
  if(/^[=+@-]/.test(name))throw Error('ชื่อไม่ถูกต้อง');
  return withLock_(()=>{
    const uid='S'+random_().slice(0,18),pwd=temporaryPassword_(),c=makeCredential_(pwd),now=new Date();
    add_('users',{UID:uid,CLASS:cls,DISPLAY_NAME:name,ROLE:'STUDENT',SALT:c.salt,PASSWORD_HASH:c.hash,
      MUST_CHANGE:true,ACTIVE:true,PASSWORD_VERSION:1,CREATED_AT:now,UPDATED_AT:now});
    audit_(PBL11.admin,'STUDENT_CREATED',uid,cls);
    return {user:{uid,classId:cls,name,role:'STUDENT',mustChange:true,active:true},temporaryPassword:pwd};
  });
}
function adminResetPassword_(d) {
  const uid=required_(d.uid,80);if(uid===PBL11.admin)throw Error('Admin เปลี่ยนรหัสของตนเองผ่านเมนูเปลี่ยนรหัสผ่าน');
  return withLock_(()=>{
    const u=findUser_(uid);if(!u||u.ROLE!=='STUDENT'||!isP6Class_(u.CLASS))throw Error('ไม่พบบัญชีนักเรียน');
    const pwd=temporaryPassword_(),c=makeCredential_(pwd);
    u.SALT=c.salt;u.PASSWORD_HASH=c.hash;u.MUST_CHANGE=true;u.PASSWORD_VERSION=Number(u.PASSWORD_VERSION)+1;u.UPDATED_AT=new Date();
    update_('users',u._row,u);audit_(PBL11.admin,'STUDENT_PASSWORD_RESET',uid,String(u.CLASS));return {temporaryPassword:pwd,uid};
  });
}
function adminSetActive_(d) {
  const uid=required_(d.uid,80),active=d.active===true;
  return withLock_(()=>{
    const u=findUser_(uid);if(!u||u.ROLE!=='STUDENT'||!isP6Class_(u.CLASS))throw Error('ไม่พบบัญชีนักเรียน');
    u.ACTIVE=active;u.PASSWORD_VERSION=Number(u.PASSWORD_VERSION)+1;u.UPDATED_AT=new Date();update_('users',u._row,u);
    audit_(PBL11.admin,active?'STUDENT_ENABLED':'STUDENT_DISABLED',uid,String(u.CLASS));
    return {uid,active};
  });
}
function adminSaveGroup_(d) {
  const cls=requireP6Class_(required_(d.classId,16)),name=required_(d.name,60),ids=Array.isArray(d.memberIds)?d.memberIds.map(String):[];
  requireP6Class_(cls);
  if(ids.length<4||ids.length>5||new Set(ids).size!==ids.length)throw Error('กลุ่มต้องมีสมาชิกไม่ซ้ำกัน 4–5 คน');
  return withLock_(()=>{
    const members=rows_('users').filter(u=>ids.includes(String(u.UID)));
    if(members.length!==ids.length||members.some(u=>String(u.CLASS)!==cls||u.ROLE!=='STUDENT'||!publicUser_(u).active))
      throw Error('สมาชิกต้องเป็นนักเรียนที่ใช้งานได้ในห้องเดียวกัน');
    const groupId=d.groupId?required_(d.groupId,80):'G'+random_().slice(0,15);
    if(groups_().some(g=>String(g.PROJECT_ID)==='VLOG20'&&String(g.GROUP_ID)!==groupId&&
       JSON.parse(String(g.MEMBER_UIDS_JSON)||'[]').some(id=>ids.includes(id))))throw Error('มีสมาชิกอยู่ในกลุ่มอื่นแล้ว');
    const rec={GROUP_ID:groupId,CLASS:cls,GROUP_NAME:name,PROJECT_ID:'VLOG20',MEMBER_UIDS_JSON:JSON.stringify(ids),UPDATED_AT:new Date()};
    const old=groups_().find(g=>String(g.GROUP_ID)===groupId);
    if(old)throw Error('กลุ่มเดิมถูกล็อกสมาชิกไว้ การเปลี่ยนกลุ่มต้องผ่านเวิร์กโฟลว์อนุมัติแยก');
    add_('groups',rec);audit_(PBL11.admin,'GROUP_CREATED',groupId,cls);
    return {groupId,classId:cls,name,memberCount:ids.length};
  });
}
function adminSetClassCode_(d) {
  const cls=requireP6Class_(required_(d.classId,16));
  return withLock_(()=>{
    const c=classCodes_(),newCode=random_().slice(0,16);
    c[cls]=newCode;properties_().setProperty('PBL_V11_CLASS_CODES_JSON',JSON.stringify(c));
    audit_(PBL11.admin,'CLASS_CODE_ROTATED',cls,cls);
    return {classId:cls,classCode:newCode,rotated:true};
  });
}
/**
 * OWNER-ONLY MANUAL BOOTSTRAP (not callable via google.script.run).
 * Before running: owner sets PBL_V11_MASTER_ID and PBL_V11_ADMIN_INIT_PASSWORD in Script Properties,
 * reviews/backs up the existing 22-tab Master, and explicitly approves additive schema.
 * Create no separate spreadsheet; re-run is idempotent for schema, does not reset admin.
 */
function ownerSetupV11_() {
  const props=properties_(),id=props.getProperty('PBL_V11_MASTER_ID'),
    first=props.getProperty('PBL_V11_ADMIN_INIT_PASSWORD');
  if(!id||!first)throw Error('Set PBL_V11_MASTER_ID and PBL_V11_ADMIN_INIT_PASSWORD in Script Properties first');
  validPassword_(first);
  if(!props.getProperty('PBL_V11_PEPPER'))props.setProperty('PBL_V11_PEPPER',random_()+random_());
  const ss=ss_();
  Object.keys(PBL11.tabs).forEach(type=>{
    const title=PBL11.tabs[type];let sh=ss.getSheetByName(title);
    if(!sh){sh=ss.insertSheet(title);sh.appendRow(PBL11.headers[type]);sh.setFrozenRows(1);}
    else if(PBL11.headers[type].some((h,i)=>String(sh.getRange(1,i+1).getValue())!==h))
      throw Error('Existing tab has different schema: '+title);
  });
  if(!findUser_(PBL11.admin)){
    const c=makeCredential_(first),now=new Date();
    add_('users',{UID:PBL11.admin,CLASS:'',DISPLAY_NAME:'ผู้ดูแลระบบ',ROLE:'ADMIN',
      SALT:c.salt,PASSWORD_HASH:c.hash,MUST_CHANGE:true,ACTIVE:true,PASSWORD_VERSION:1,CREATED_AT:now,UPDATED_AT:now});
  }
  props.deleteProperty('PBL_V11_ADMIN_INIT_PASSWORD');
  return {installed:true,master:ss.getName(),admin:PBL11.admin,tabNames:Object.values(PBL11.tabs)};
}


/**
 * V16 approved-roster bridge (ADMIN ONLY).
 * Inspired by LMS cohort/SIS enrolment; no parallel DB and NO roster access
 * until the school owner approves an exact existing source + header mapping.
 *
 * Required private Script Properties (NEVER in public HTML/JS/GitHub):
 * PBL_V16_ROSTER_APPROVED=YES
 * PBL_V16_ROSTER_SPREADSHEET_ID=existing authorised roster Sheet ID
 * PBL_V16_ROSTER_SHEET_NAME=existing tab name
 * PBL_V16_SOURCE_ID_HEADER=verified non-national-ID stable identifier
 * PBL_V16_SOURCE_NAME_HEADER=verified display-name header
 * PBL_V16_SOURCE_CLASS_HEADER=verified grade/class header
 * Optional PBL_V16_SOURCE_STATUS_HEADER and PBL_V16_ACTIVE_STATUS_VALUE
 */
function v16RosterConfigured_(){
 const p=properties_();
 return String(p.getProperty('PBL_V16_ROSTER_APPROVED')||'')==='YES'&&
 ['PBL_V16_ROSTER_SPREADSHEET_ID','PBL_V16_ROSTER_SHEET_NAME',
  'PBL_V16_SOURCE_ID_HEADER','PBL_V16_SOURCE_NAME_HEADER',
  'PBL_V16_SOURCE_CLASS_HEADER'].every(k=>Boolean(p.getProperty(k)));
}
function v16NormalClass_(v){
 const x=String(v||'').trim().replace(/\s+/g,'');
 const m=x.match(/^(?:ป\.?)?6[./]([123])$/i);
 return m?'6.'+m[1]:'';
}
function v16Digest_(stableId){
 // Do not expose a raw source identifier, especially if school source is
 // potentially personally identifying. Only keyed opaque IDs reach browser.
 const p=properties_();
 const pepper=p.getProperty('PBL_V11_PEPPER');
 if(!pepper||pepper.length<40)throw Error('ยังไม่ได้ตั้งค่าการรักษาความปลอดภัย');
 const id=String(p.getProperty('PBL_V16_ROSTER_SPREADSHEET_ID'));
 const input='PBL-V16-ROSTER|'+id+'|'+String(stableId);
 const bytes=Utilities.computeHmacSha256Signature(input,pepper);
 return bytes.map(n=>('0'+((n+256)%256).toString(16)).slice(-2)).join('');
}
function v16Roster_(){
 if(!v16RosterConfigured_())return null;
 const p=properties_();
 const id=p.getProperty('PBL_V16_ROSTER_SPREADSHEET_ID');
 const sheetName=p.getProperty('PBL_V16_ROSTER_SHEET_NAME');
 // Read an existing, authorized school Sheet, never clone or write it.
 const ss=SpreadsheetApp.openById(id),sh=ss.getSheetByName(sheetName);
 if(!sh)throw Error('ไม่พบแท็บทะเบียนที่โรงเรียนอนุมัติ');
 const grid=sh.getDataRange().getValues();
 if(!grid.length)throw Error('ทะเบียนไม่มีข้อมูลหัวตาราง');
 const headers=grid[0].map(x=>String(x).trim());
 const propKeys=['PBL_V16_SOURCE_ID_HEADER','PBL_V16_SOURCE_NAME_HEADER','PBL_V16_SOURCE_CLASS_HEADER'];
 const headerNames=propKeys.map(k=>String(p.getProperty(k)||'').trim());
 if(headerNames.some(h=>!h||headers.filter(x=>x===h).length!==1))
   throw Error('หัวตารางรหัส/ชื่อ/ห้องเรียนไม่ตรงกับทะเบียนที่อนุมัติ');
 const col=headerNames.map(h=>headers.indexOf(h));
 const statusHeader=String(p.getProperty('PBL_V16_SOURCE_STATUS_HEADER')||'').trim();
 if(statusHeader&&headers.filter(h=>h===statusHeader).length!==1)
   throw Error('หัวตารางสถานะไม่ตรงกับทะเบียน');
 const statusCol=statusHeader?headers.indexOf(statusHeader):-1;
 const activeValue=String(p.getProperty('PBL_V16_ACTIVE_STATUS_VALUE')||'ACTIVE').trim();
 const seen=new Set(),out=[];
 for(let i=1;i<grid.length;i++){
  const row=grid[i],schoolId=String(row[col[0]]||'').trim();
  const name=String(row[col[1]]||'').trim().replace(/\s+/g,' ');
  const classId=v16NormalClass_(row[col[2]]);
  if(!classId)continue; // P6/1, P6/2, P6/3 only
  if(statusCol>=0&&String(row[statusCol]||'').trim()!==activeValue)continue;
  if(!schoolId||!name||name.length>110||/^[=+@-]/.test(name))
   throw Error('ทะเบียนมีรายการชั้น ป.6 ที่ข้อมูลไม่ครบ กรุณาตรวจสอบต้นทาง');
  if(seen.has(schoolId))throw Error('พบรหัสนักเรียนซ้ำในทะเบียน กรุณาตรวจสอบต้นทาง');
  seen.add(schoolId);
  const digest=v16Digest_(schoolId);
  out.push({sourceId:'SRC'+digest.slice(0,24),uid:'S'+digest.slice(0,18),
    name,classId});
  if(out.length>300)throw Error('รายชื่อมากเกินขอบเขตที่ตรวจรับ กรุณาตรวจสอบทะเบียน');
 }
 return out;
}
function v16CandidateRows_(source,existing){
 const uids=new Set(existing.map(u=>String(u.UID)));
 const names=new Set(existing.filter(u=>String(u.ROLE)==='STUDENT')
  .map(u=>String(u.CLASS)+'|'+String(u.DISPLAY_NAME||'').trim().toLocaleLowerCase('th')));
 return source.map(x=>{
  const byId=uids.has(x.uid);
  const byName=names.has(x.classId+'|'+x.name.toLocaleLowerCase('th'));
  return {sourceId:x.sourceId,name:x.name,classId:x.classId,
    alreadyEnrolled:byId||byName,existingStatus:byId?'ENROLLED':byName?'REVIEW_MATCH':'NEW'};
 });
}
function adminRosterCandidates_(){
 const source=v16Roster_();
 if(source===null)return {status:'NOT_CONFIGURED',candidates:[]};
 return {status:'READY',candidates:v16CandidateRows_(source,rows_('users'))};
}
function adminEnrollBatch_(d){
 // Caller has been checked by admin_(session) in apiV12.
 if(!v16RosterConfigured_())throw Error('ยังไม่ผ่านการอนุมัติทะเบียนโรงเรียน');
 const ids=Array.isArray(d.sourceIds)?d.sourceIds.map(x=>String(x)):[];
 if(!ids.length||ids.length>30||new Set(ids).size!==ids.length)
   throw Error('เลือกนักเรียน 1–30 คนโดยไม่ซ้ำกัน');
 if(ids.some(x=>!/^SRC[0-9a-f]{24}$/.test(x)))
   throw Error('รายการนักเรียนไม่ถูกต้อง');
 return withLock_(()=>{
  // Re-check the authoritative roster and existing accounts under the lock.
  const source=v16Roster_();
  const sourceMap=new Map(source.map(x=>[x.sourceId,x]));
  const accounts=rows_('users');
  const byUid=new Set(accounts.map(u=>String(u.UID)));
  const byName=new Set(accounts.filter(u=>String(u.ROLE)==='STUDENT')
    .map(u=>String(u.CLASS)+'|'+String(u.DISPLAY_NAME||'').trim().toLocaleLowerCase('th')));
  // Fail the whole request for an unapproved or invalid selected source.
  if(ids.some(id=>!sourceMap.has(id)))throw Error('พบรายชื่อที่ไม่ตรงทะเบียนล่าสุด กรุณาโหลดรายชื่อใหม่');
  const created=[],skipped=[],failed=[];
  ids.forEach(id=>{
   const sourceStudent=sourceMap.get(id);
   const match=sourceStudent.classId+'|'+sourceStudent.name.toLocaleLowerCase('th');
   if(byUid.has(sourceStudent.uid)||byName.has(match)){
    skipped.push({sourceId:id,name:sourceStudent.name,classId:sourceStudent.classId,
      reason:byUid.has(sourceStudent.uid)?'มีบัญชีอยู่แล้ว':'ชื่อ/ห้องตรงกับบัญชีเดิม ต้องตรวจจับคู่บัญชี'});
    return;
   }
   try{
    const pwd=temporaryPassword_(),cred=makeCredential_(pwd),now=new Date();
    add_('users',{UID:sourceStudent.uid,CLASS:sourceStudent.classId,
      DISPLAY_NAME:sourceStudent.name,ROLE:'STUDENT',SALT:cred.salt,
      PASSWORD_HASH:cred.hash,MUST_CHANGE:true,ACTIVE:true,PASSWORD_VERSION:1,
      CREATED_AT:now,UPDATED_AT:now});
    byUid.add(sourceStudent.uid);byName.add(match);
    audit_(PBL11.admin,'BULK_STUDENT_ENROLLED',sourceStudent.uid,sourceStudent.classId);
    created.push({sourceId:id,uid:sourceStudent.uid,name:sourceStudent.name,
      classId:sourceStudent.classId,temporaryPassword:pwd});
   }catch(e){
    // Do not return internal errors or secret hashes to the client.
    failed.push({sourceId:id,name:sourceStudent.name,classId:sourceStudent.classId,
      reason:'บันทึกไม่สำเร็จ กรุณาตรวจสอบกับผู้ดูแล'});
   }
  });
  return {status:'READY',created,skipped,failed};
 });
}


/* V16.2 read-only learning progress: authorised Admin ONLY (apiV12 guard).
 * Reuses the existing V11 accounts, groups and work tables; no new sheets,
 * grades, rubrics or inferred learning outcomes. Never returns work notes,
 * credential hashes, source roster, audio or raw per-pupil evidence.
 */
function adminProgress_(){
 const individual=PBL11.individual.slice(),indSet=new Set(individual);
 const groupSteps=Array.from({length:PBL11.stepCount},(_,i)=>i+1).filter(i=>!indSet.has(i));
 const users=rows_('users').filter(u=>String(u.ROLE)==='STUDENT'&&isP6Class_(u.CLASS))
  .map(u=>publicUser_(u));
 if(users.length>300)throw Error('จำนวนบัญชีนักเรียนเกินขอบเขตที่ตรวจรับ');
 const groups=groups_().filter(g=>isP6Class_(g.CLASS)&&String(g.PROJECT_ID)==='VLOG20').map(g=>({
  id:String(g.GROUP_ID),name:String(g.GROUP_NAME),classId:String(g.CLASS),
  memberIds:JSON.parse(String(g.MEMBER_UIDS_JSON)||'[]').map(String)
 }));
 const workRows=rows_('work').filter(r=>Number(r.STEP)>=1&&Number(r.STEP)<=PBL11.stepCount);
 const record=new Map();
 workRows.forEach(r=>{
  const key=String(r.OWNER_KEY),step=Number(r.STEP);
  if(!/^USER:S[0-9a-zA-Z-]+$/.test(key)&&!/^GROUP:G[0-9a-zA-Z-]+$/.test(key))return;
  const rowKey=key+'|'+step,prior=record.get(rowKey);
  // For inconsistent legacy duplicates prefer the highest committed revision.
  if(!prior||Number(r.REVISION)>Number(prior.REVISION))record.set(rowKey,r);
 });
 const done=r=>!!r&&(r.DONE===true||String(r.DONE)==='TRUE');
 const updated=r=>{
  if(!r||!r.UPDATED_AT)return '';
  const dt=new Date(r.UPDATED_AT);return isNaN(dt.getTime())?'':dt.toISOString();
 };
 function stepsFor(owner,positions,mode){
  return positions.map(step=>{
   const r=owner?record.get(owner+'|'+step):null;
   return {step,mode,done:done(r),revision:r?Number(r.REVISION)||0:0,updatedAt:updated(r)};
  });
 }
 const maxDate=list=>list.reduce((a,x)=>x.updatedAt&&x.updatedAt>a?x.updatedAt:a,'');
 const studentRows=users.map(u=>{
  const group=groups.find(g=>g.classId===u.classId&&g.memberIds.includes(u.uid));
  const own=stepsFor('USER:'+u.uid,individual,'individual');
  const shared=stepsFor(group?'GROUP:'+group.id:null,groupSteps,'group');
  const steps=[...own,...shared].sort((a,b)=>a.step-b.step);
  const personalDone=own.filter(x=>x.done).length,groupDone=shared.filter(x=>x.done).length;
  return {uid:u.uid,name:u.name,classId:u.classId,active:u.active,groupId:group?.id||'',
   groupName:group?.name||'',individual:{done:personalDone,total:individual.length},
   shared:{done:groupDone,total:groupSteps.length},
   overall:{done:personalDone+groupDone,total:PBL11.stepCount},
   lastUpdated:maxDate(steps),steps};
 });
 const byUid=new Map(studentRows.map(x=>[x.uid,x]));
 const groupRows=groups.map(g=>{
  const shared=stepsFor('GROUP:'+g.id,groupSteps,'group');
  const members=g.memberIds.map(uid=>byUid.get(uid)).filter(Boolean);
  return {id:g.id,name:g.name,classId:g.classId,memberCount:members.length,
   memberIds:members.map(u=>u.uid),
   shared:{done:shared.filter(x=>x.done).length,total:groupSteps.length},
   memberIndividual:{done:members.reduce((n,u)=>n+u.individual.done,0),total:members.length*individual.length},
   members:members.map(u=>({uid:u.uid,name:u.name,individualDone:u.individual.done,individualTotal:individual.length})),
   lastUpdated:maxDate(shared),steps:shared};
 });
 return {source:'LIVE',generatedAt:new Date().toISOString(),projectId:'VLOG20',
  individualSteps:individual,groupSteps,students:studentRows,groups:groupRows,
  measure:'COMPLETED_WORK_NOT_GRADES'};
}


/** V17 controlled addition to existing master — NEVER automatically installed.
 * REQUIRES human gate/backup/source readback and PBL_V17_SCHEMA_APPROVED=YES.
 * The current public GitHub Pages build uses no real school roster/notes.
 */
const PBL17_REVIEW_TAB='26_LMS_REVIEWS';
const PBL17_REVIEW_HEADERS=[
 'REVIEW_ID','OWNER_KEY','STEP','SUBMISSION_REVISION','REVIEW_STATUS',
 'FEEDBACK','RUBRIC_JSON','REVIEWED_BY','REVIEWED_AT','CREATED_AT'
];
function v17ReviewGate_(){
 return properties_().getProperty('PBL_V17_SCHEMA_APPROVED')==='YES';
}
function v17ReviewSheet_(required){
 if(!v17ReviewGate_()){
  if(required)throw Error('ระบบข้อเสนอแนะรออนุมัติจากเจ้าของระบบ');
  return null;
 }
 const sh=ss_().getSheetByName(PBL17_REVIEW_TAB);
 if(!sh){
  if(required)throw Error('ยังไม่ได้ติดตั้งตารางข้อเสนอแนะที่ผ่านการอนุมัติ');
  return null;
 }
 const row=sh.getRange(1,1,1,PBL17_REVIEW_HEADERS.length).getValues()[0];
 if(PBL17_REVIEW_HEADERS.some((v,i)=>row[i]!==v))
  throw Error('โครงสร้างตารางข้อเสนอแนะไม่ตรงรุ่น');
 return sh;
}
function v17ReviewRows_(){
 const sh=v17ReviewSheet_(false);if(!sh)return [];
 const all=sh.getDataRange().getValues();
 if(all.length>12000)throw Error('จำนวนประวัติการตรวจเกินขอบเขตที่รองรับ');
 return all.slice(1).map((r,i)=>Object.fromEntries(PBL17_REVIEW_HEADERS.map((k,j)=>[k,r[j]]).concat([['_row',i+2]])));
}
function v17ReviewPublic_(r){
 const parsed=(()=>{try{return JSON.parse(String(r.RUBRIC_JSON||'{}'))}catch(e){return {}}})();
 return {ownerKey:String(r.OWNER_KEY),step:Number(r.STEP),revision:Number(r.SUBMISSION_REVISION),
  status:String(r.REVIEW_STATUS),feedback:String(r.FEEDBACK||''),
  rubric:{
   language:Number(parsed.language)||0,inquiry:Number(parsed.inquiry)||0,
   collaboration:Number(parsed.collaboration)||0,reflection:Number(parsed.reflection)||0
  },reviewedAt:r.REVIEWED_AT?new Date(r.REVIEWED_AT).toISOString():'',
  reviewer:'ครูผู้ตรวจ'}; // no teacher personal identifier in student-facing payload
}
function v17WorkCandidates_(){
 const students=rows_('users').filter(u=>String(u.ROLE)==='STUDENT'&&isP6Class_(u.CLASS))
  .map(u=>publicUser_(u));
 const groups=groups_().filter(g=>isP6Class_(g.CLASS)&&String(g.PROJECT_ID)==='VLOG20')
  .map(g=>({id:String(g.GROUP_ID),name:String(g.GROUP_NAME),classId:String(g.CLASS),
   memberIds:JSON.parse(String(g.MEMBER_UIDS_JSON)||'[]').map(String)}));
 const byUid=new Map(students.map(x=>[x.uid,x]));
 const byId=new Map(groups.map(x=>[x.id,x]));
 const candidate=new Map();
 const submissions=rows_('work');
 if(submissions.length>12000)throw Error('จำนวนบันทึกงานเกินขอบเขตที่รองรับ');
 submissions.forEach(w=>{
  if(w.DONE!==true&&String(w.DONE)!=='TRUE')return;
  const ownerKey=String(w.OWNER_KEY),step=Number(w.STEP),revision=Number(w.REVISION)||0;
  if(!Number.isInteger(step)||step<1||step>20||revision<1)return;
  const personal=PBL11.individual.includes(step);
  let mode,name,classId,groupId='';
  if(personal && ownerKey.startsWith('USER:')){
   const u=byUid.get(ownerKey.slice(5));if(!u)return;
   mode='individual';name=u.name;classId=u.classId;
  }else if(!personal && ownerKey.startsWith('GROUP:')){
   const g=byId.get(ownerKey.slice(6));if(!g)return;
   mode='group';name=g.name;classId=g.classId;groupId=g.id;
  }else return;
  const key=ownerKey+'|'+step;
  const current=candidate.get(key);
  if(!current||revision>current.revision){
   let when='';
   try{const d=new Date(w.UPDATED_AT);when=isNaN(d.getTime())?'':d.toISOString()}catch(e){}
   candidate.set(key,{ownerKey,step,mode,revision,classId,name,groupId,
    note:String(w.NOTE||'').slice(0,1500),submittedAt:when});
  }
 });
 return [...candidate.values()].sort((a,b)=>b.submittedAt.localeCompare(a.submittedAt)||a.step-b.step);
}
function adminReviewQueue_(){
 const works=v17WorkCandidates_(),reviews=v17ReviewRows_();
 const byKey=new Map();
 reviews.forEach(r=>{
  const k=String(r.OWNER_KEY)+'|'+Number(r.STEP);
  if(!byKey.has(k))byKey.set(k,[]);
  byKey.get(k).push(r);
 });
 const items=works.map(w=>{
  const hist=(byKey.get(w.ownerKey+'|'+w.step)||[]).map(v17ReviewPublic_)
   .sort((a,b)=>a.revision-b.revision);
  const current=hist.findLast(x=>x.revision===w.revision)||null;
  return {...w,status:current?current.status:'PENDING',review:current,history:hist.slice(-10)};
 });
 return {source:'LIVE',reviewSchema:v17ReviewSheet_(false)?'READY':'NOT_CONFIGURED',
  generatedAt:new Date().toISOString(),items,
  rubricVersion:'FORMATIVE_DRAFT_V1',scoreType:'NOT_OFFICIAL_GRADE'};
}
function adminReviewStep_(d){
 if(!v17ReviewGate_())throw Error('ยังไม่ผ่านอนุมัติเปิดระบบข้อเสนอแนะ');
 const ownerKey=required_(d.ownerKey,105),step=Number(d.step),revision=Number(d.revision);
 const status=String(d.status||''),feedback=required_(d.feedback,1200);
 if(!Number.isInteger(step)||step<1||step>20||!Number.isInteger(revision)||revision<1)
  throw Error('ข้อมูลขั้นหรือรุ่นงานไม่ถูกต้อง');
 if(!['APPROVED','NEEDS_REVISION'].includes(status)||feedback.length<5)
  throw Error('ข้อเสนอแนะหรือผลการตรวจไม่ถูกต้อง');
 if(/^[=+@-]/.test(feedback))throw Error('กรุณาขึ้นต้นด้วยข้อความทั่วไป');
 const incoming=d.rubric;
 if(!incoming||typeof incoming!=='object'||Array.isArray(incoming))throw Error('กรุณาระบุเกณฑ์การประเมิน');
 const criteria=['language','inquiry','collaboration','reflection'];
 const rubric={};
 for(const k of criteria){
  const v=incoming[k];
  if(!Number.isInteger(v)||v<0||v>4)throw Error('ระดับสังเกตตามเกณฑ์ไม่ถูกต้อง');
  rubric[k]=v;
 }
 return withLock_(()=>{
  const work=v17WorkCandidates_().find(x=>x.ownerKey===ownerKey&&x.step===step);
  if(!work||work.revision!==revision)throw Error('งานมีการเปลี่ยนแปลงแล้ว กรุณาโหลดใหม่');
  const existing=v17ReviewRows_();
  if(existing.some(x=>String(x.OWNER_KEY)===ownerKey&&Number(x.STEP)===step&&Number(x.SUBMISSION_REVISION)===revision))
   throw Error('งานรุ่นนี้ได้รับการตรวจแล้ว');
  const sh=v17ReviewSheet_(true),now=new Date();
  sh.appendRow(['R'+random_().slice(0,26),ownerKey,step,revision,status,feedback,
   JSON.stringify(rubric),PBL11.admin,now,now]);
  audit_(PBL11.admin,'FORMATIVE_REVIEW',ownerKey,work.classId);
  return {review:{ownerKey,step,revision,status,feedback,rubric,reviewedAt:now.toISOString(),reviewer:'ครูผู้ตรวจ'}};
 });
}
function studentReviews_(session){
 if(session.role!=='STUDENT')throw Error('ต้องเป็นนักเรียนที่เข้าสู่ระบบ');
 const uid=String(session.uid),cls=String(session.user.CLASS);
 requireP6Class_(cls);
 const group=groupFor_(uid,cls);
 const allowed=new Set(['USER:'+uid]);
 if(group)allowed.add('GROUP:'+String(group.GROUP_ID));
 // Only reviewed and published status rows are returned, not work notes or other pupils.
 const reviews=v17ReviewRows_().filter(r=>allowed.has(String(r.OWNER_KEY))&&
  Number(r.STEP)>=1&&Number(r.STEP)<=20);
 return {source:'LIVE',reviews:reviews.map(v17ReviewPublic_).sort((a,b)=>a.step-b.step||a.revision-b.revision)
  .slice(-100),measure:'FORMATIVE_FEEDBACK_NOT_FINAL_GRADE'};
}
/** OWNER MANUAL ONLY — no public RPC or automatic creation on deployment.
 * Owner must record change approval, backup, schema review, and rollback.
 */
function ownerSetupV17Reviews_(){
 if(!v17ReviewGate_())throw Error('ต้องได้รับอนุมัติจากเจ้าของระบบก่อน');
 return withLock_(()=>{
  // Validate controlled V11 additive tables already present.
  Object.keys(PBL11.tabs).forEach(t=>rows_(t));
  const ss=ss_();let sh=ss.getSheetByName(PBL17_REVIEW_TAB);
  if(!sh){
   sh=ss.insertSheet(PBL17_REVIEW_TAB);
   sh.appendRow(PBL17_REVIEW_HEADERS);sh.setFrozenRows(1);
  }
  v17ReviewSheet_(true);
  return {schema:'V17_FORMATIVE_REVIEW',table:PBL17_REVIEW_TAB,status:'VERIFIED_BY_SCHEMA'};
 });
}
