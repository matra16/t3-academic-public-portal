'use strict';
const {test}=require('node:test'), assert=require('node:assert/strict'), crypto=require('node:crypto'), fs=require('fs'), vm=require('vm'), path=require('path');
const ctx={}; vm.createContext(ctx); vm.runInContext(fs.readFileSync(path.join(__dirname,'LearnerGateway.gs'),'utf8'),ctx);
const make=ctx.pblCreateLearnerGateway_, dig=x=>crypto.createHash('sha256').update(String(x)).digest('hex');
const INV_A='EXAMPLE_A_INVITATION_01', INV_B='EXAMPLE_B_INVITATION_02', PIN='Fictional-First-Only-1234',PASS='Fictional-New-Password-7295';
function fixture(approved=true){
 let clock=1700000000000,seq=0,tok=0,badReadback=false,badWrite=false,denyRate=false;
 const A=new Map([
  ['S-A01',{uid:'S-A01',tenant:'PBL_LEARNING',role:'STUDENT',classId:'A',displayName:'Synthetic Learner A',active:true,firstLogin:true,passwordEpoch:1}],
  ['S-B01',{uid:'S-B01',tenant:'PBL_LEARNING',role:'STUDENT',classId:'B',displayName:'Synthetic Learner B',active:true,firstLogin:true,passwordEpoch:1}],
  ['T-A01',{uid:'T-A01',tenant:'PBL_LEARNING',role:'TEACHER',active:true,assignedClasses:['A'],passwordEpoch:1}]
 ]);
 const I=new Map([[INV_A,{uid:'S-A01',classId:'A',used:false,expiresAt:clock+180000}],[INV_B,{uid:'S-B01',classId:'B',used:false,expiresAt:clock+180000}]]);
 const P=new Map([['S-A01',PIN],['S-B01',PIN]]),S=new Map(),W=new Map(),E=[],R=new Map(),T=new Map([['task-A',{classId:'A',status:'OPEN'}],['task-B',{classId:'B',status:'OPEN'}],['task-closed',{classId:'A',status:'CLOSED'}]]);
 const snapshot=()=>JSON.stringify({a:[...A],i:[...I],p:[...P],w:[...W],e:E,r:[...R],seq});
 const restore=z=>{const x=JSON.parse(z);[[A,x.a],[I,x.i],[P,x.p],[W,x.w],[R,x.r]].forEach(v=>{v[0].clear();v[1].forEach(([k,val])=>v[0].set(k,val))});E.splice(0,E.length,...x.e);seq=x.seq};
 const repo={
  transaction(fn){const snap=snapshot();try{return fn({test:true})}catch(e){restore(snap);throw e}},
  task:id=>T.get(id), nextId:()=>('EV-'+(++seq)),
  getEventByRequest:id=>badReadback?null:E.find(e=>e.requestId===id),
  appendEvent:e=>{if(badWrite)throw Error('WRITE_FAIL');E.push({...e})},
  getWork:(uid,id)=>W.get(uid+'|'+id),
  upsertWork:w=>{if(badWrite)throw Error('WRITE_FAIL');W.set(w.owner+'|'+w.taskId,{...w,id:'W-'+w.owner+'-'+w.taskId})},
  listOwn:(uid,room)=>[...W.values()].filter(x=>x.owner===uid&&x.classId===room),
  listOwnEvents:(uid,room)=>E.filter(x=>x.actor===uid&&x.classId===room),
  listClass:room=>[...W.values()].filter(x=>x.classId===room),
  getWorkById:id=>[...W.values()].find(w=>w.id===id),
  review:(id,feedback,revision)=>{R.set(id,{feedback,revision});const row=[...W.values()].find(w=>w.id===id);if(row){row.status='NEEDS_REVISION';row.revision=revision}}
 };
 const deps={
  release:approved?{mode:'SYNTHETIC_QA',syntheticOnly:true}:{mode:'SCHOOL_PRODUCTION',ownerApproved:false},
  directory:{get:uid=>A.get(uid),activate:(uid,epoch)=>{const a=A.get(uid);A.set(uid,{...a,firstLogin:false,passwordEpoch:epoch})}},
  invites:{preview:code=>I.get(code),consume:code=>{const v=I.get(code);I.set(code,{...v,used:true})}},
  credentials:{verifyBootstrap:(uid,pw)=>P.get(uid)===pw,validateStrength:pw=>pw.length>=12&&/[A-Z]/.test(pw)&&/\d/.test(pw),replaceBootstrap:(uid,pw)=>{P.set(uid,pw);return A.get(uid).passwordEpoch+1},verifyPassword:(uid,pw)=>P.get(uid)===pw,change:(uid,pw)=>{const a=A.get(uid),epoch=a.passwordEpoch+1;P.set(uid,pw);A.set(uid,{...a,passwordEpoch:epoch});return epoch}},
  sessions:{ttlSeconds:1200,issue:(actor,t)=>{const token='EXAMPLE_FAKE_SESSION_TOKEN_'+String(++tok).padStart(10,'0');S.set(token,{...actor,expiresAt:t+1200000});return token},verify:token=>S.get(token),revoke:token=>S.delete(token),revokeAll:uid=>{for(const [token,v] of S)if(v.uid===uid)S.delete(token)}},
  throttle:{allow:()=>!denyRate},repository:repo,digest:dig,now:()=>clock
 };
 const api=make(deps).dispatch;
 const act=(inviteCode=INV_A)=>api({op:'ACTIVATE',inviteCode,initialPassword:PIN,newPassword:PASS});
 const login=(uid='S-A01',password=PASS)=>api({op:'LOGIN',learnerUid:uid,password});
 const teacher=()=>deps.sessions.issue({uid:'T-A01',role:'TEACHER',assignedClasses:['A'],passwordEpoch:1,verifiedByServer:true,tenant:'PBL_LEARNING'},clock);
 const submit=(token,req='request_000001',extra={})=>api({op:'TASK_SUBMIT',authToken:token,requestId:req,payload:{taskId:'task-A',note:'English community research and presentation',expectedRevision:0,...extra}});
 return {api,A,I,S,W,E,R,deps,repo,act,login,teacher,submit,advance:n=>{clock+=n},readback:x=>{badReadback=x},failwrite:x=>{badWrite=x},ratelimit:x=>{denyRate=x}};
}
const rejects=(fn,msg)=>assert.throws(fn,e=>String(e.message).includes(msg));
test('release denies when owner gate closed',()=>{const f=fixture(false);rejects(()=>f.api({op:'CLAIM',inviteCode:INV_A}),'SCHOOL_RELEASE_GATE_CLOSED')});
test('unique invitation selects only matching student',()=>{const f=fixture(),r=f.api({op:'CLAIM',inviteCode:INV_A});assert.equal(r.learnerUid,'S-A01');assert.ok(!JSON.stringify(r).includes('S-B01'))});
test('wrong invite rejected',()=>{const f=fixture();rejects(()=>f.api({op:'CLAIM',inviteCode:'EXAMPLE_BAD_INVITATION_99'}),'INVITE_INVALID')});
test('expired invite rejected',()=>{const f=fixture();f.advance(181000);rejects(()=>f.api({op:'CLAIM',inviteCode:INV_A}),'INVITE_INVALID')});
test('bootstrap credential required',()=>{const f=fixture();rejects(()=>f.api({op:'ACTIVATE',inviteCode:INV_A,initialPassword:'BAD',newPassword:PASS}),'INVALID_CREDENTIAL')});
test('weak change rejected',()=>{const f=fixture();rejects(()=>f.api({op:'ACTIVATE',inviteCode:INV_A,initialPassword:PIN,newPassword:'weak'}),'WEAK_NEW_CREDENTIAL')});
test('activation consumes invite and changes epoch',()=>{const f=fixture();f.act();assert.equal(f.I.get(INV_A).used,true);assert.equal(f.A.get('S-A01').passwordEpoch,2)});
test('activation cannot replay',()=>{const f=fixture();f.act();rejects(()=>f.act(),'INVITE_INVALID')});
test('login requires activation',()=>{const f=fixture();rejects(()=>f.api({op:'LOGIN',learnerUid:'S-A01',password:PIN}),'ACTIVATION_REQUIRED')});
test('login rejects wrong password',()=>{const f=fixture();f.act();rejects(()=>f.login('S-A01','WRONG_12345678'),'INVALID_CREDENTIAL')});
test('login gives server session',()=>{const f=fixture();f.act();const r=f.login();assert.equal(r.learner.classId,'A');assert.ok(r.token.length>=24);assert.ok(!JSON.stringify(r).includes(PIN))});
test('unauthenticated read denied',()=>{const f=fixture();f.act();rejects(()=>f.api({op:'READ_OWN'}),'INVALID_INPUT')});
test('client student identity override denied',()=>{const f=fixture();f.act();const t=f.login().token;rejects(()=>f.submit(t,'request_000002',{studentId:'S-B01'}),'CLIENT_IDENTITY_OVERRIDE')});
test('cross-class work denied',()=>{const f=fixture();f.act();const t=f.login().token;rejects(()=>f.submit(t,'request_000003',{taskId:'task-B'}),'TASK_SCOPE_OR_STATUS_DENIED')});
test('closed assignment denied',()=>{const f=fixture();f.act();const t=f.login().token;rejects(()=>f.submit(t,'request_000004',{taskId:'task-closed'}),'TASK_SCOPE_OR_STATUS_DENIED')});
test('submission writes durable work and event',()=>{const f=fixture();f.act();const t=f.login().token;const out=f.submit(t);assert.equal(out.revision,1);assert.equal(f.E.length,1);assert.equal(f.api({op:'READ_OWN',authToken:t}).works.length,1)});
test('idempotent retry returns old receipt',()=>{const f=fixture();f.act();const t=f.login().token,r=f.submit(t),q=f.submit(t);assert.equal(q.repeated,true);assert.equal(q.eventId,r.eventId);assert.equal(f.E.length,1)});
test('same request id different payload blocked',()=>{const f=fixture();f.act();const t=f.login().token;f.submit(t);rejects(()=>f.submit(t,'request_000001',{note:'Replaced content'}),'REQUEST_ID_REUSED')});
test('stale revision blocked',()=>{const f=fixture();f.act();const t=f.login().token;f.submit(t);rejects(()=>f.submit(t,'request_000007',{note:'Revision two',expectedRevision:0}),'STALE_REVISION')});
test('new revision accepted',()=>{const f=fixture();f.act();const t=f.login().token;f.submit(t);assert.equal(f.submit(t,'request_000008',{note:'Revision two',expectedRevision:1}).revision,2)});
test('failed write rollback',()=>{const f=fixture();f.act();const t=f.login().token;f.failwrite(true);rejects(()=>f.submit(t),'WRITE_FAIL');assert.equal(f.E.length,0);assert.equal(f.W.size,0)});
test('failed readback rollback',()=>{const f=fixture();f.act();const t=f.login().token;f.readback(true);rejects(()=>f.submit(t),'EVENT_READBACK_FAILED');assert.equal(f.W.size,0)});
test('teacher can read only assigned class',()=>{const f=fixture(),t=f.teacher();assert.equal(f.api({op:'READ_CLASS',authToken:t,room:'A'}).ok,true);rejects(()=>f.api({op:'READ_CLASS',authToken:t,room:'B'}),'CLASS_GRANT_REQUIRED')});
test('student cannot self-assign teacher role',()=>{const f=fixture();f.act();const t=f.login().token;rejects(()=>f.api({op:'READ_CLASS',authToken:t,role:'TEACHER',room:'A'}),'CLASS_GRANT_REQUIRED')});
test('teacher reviews own class work',()=>{const f=fixture();f.act();const t=f.login().token;f.submit(t);const r=f.api({op:'TEACHER_REVIEW',authToken:f.teacher(),room:'A',requestId:'request_000109',payload:{taskId:'task-A',workId:'W-S-A01-task-A',feedback:'Please revise the first paragraph.',expectedRevision:1}});assert.equal(r.ok,true);assert.equal(f.R.size,1)});
test('teacher cross-class review denied',()=>{const f=fixture();rejects(()=>f.api({op:'TEACHER_REVIEW',authToken:f.teacher(),room:'B',requestId:'request_000110',payload:{taskId:'task-B',workId:'W-S-B01-task-B',feedback:'Please revise.',expectedRevision:1}}),'CLASS_GRANT_REQUIRED')});
test('password change revokes session',()=>{const f=fixture();f.act();const t=f.login().token;f.api({op:'CHANGE_PASSWORD',authToken:t,oldPassword:PASS,newPassword:'Synthetic-Final-Password-7586'});rejects(()=>f.api({op:'READ_OWN',authToken:t}),'SESSION_INVALID')});
test('logout revokes session',()=>{const f=fixture();f.act();const t=f.login().token;f.api({op:'LOGOUT',authToken:t});rejects(()=>f.api({op:'READ_OWN',authToken:t}),'SESSION_INVALID')});
test('expiry revokes session',()=>{const f=fixture();f.act();const t=f.login().token;f.advance(1200001);rejects(()=>f.api({op:'READ_OWN',authToken:t}),'SESSION_INVALID')});
test('throttle blocks claims',()=>{const f=fixture();f.ratelimit(true);rejects(()=>f.api({op:'CLAIM',inviteCode:INV_A}),'RATE_LIMITED')});
test('no public school RPC and no real children present',()=>{assert.equal(typeof ctx.pbl20SchoolRpc,'undefined');const src=fs.readFileSync(path.join(__dirname,'LearnerGateway.gs'),'utf8');assert.ok(!src.includes('@tamaprang'));assert.ok(!/\b\d{9}\b/.test(src))});
