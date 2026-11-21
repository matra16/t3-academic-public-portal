'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('fs'),path=require('path'),vm=require('vm'),crypto=require('crypto');
const source=fs.readFileSync(path.join(__dirname,'17_GuestPassport.js'),'utf8');
function fixture(){
 const store=new Map(),cache=new Map();
 let locked=false;
 const context={
  PropertiesService:{getScriptProperties:()=>({getProperty:k=>store.get(k)||null,
   setProperty:(k,v)=>{store.set(k,String(v))},getProperties:()=>Object.fromEntries(store)})},
  CacheService:{getScriptCache:()=>({get:k=>cache.get(k)||null,
   put:(k,v)=>cache.set(k,String(v)),remove:k=>cache.delete(k)})},
  LockService:{getScriptLock:()=>({tryLock:()=>{if(locked)return false;locked=true;return true},
   releaseLock:()=>{locked=false}})},
  Utilities:{getUuid:()=>crypto.randomUUID(),DigestAlgorithm:{SHA_256:'SHA_256'},
   Charset:{UTF_8:'UTF_8'},computeDigest:(_a,t)=>[...crypto.createHash('sha256').update(String(t)).digest()].map(x=>x>127?x-256:x)},
  p20Course_:id=>{if(id!=='vlog20')throw Error('BAD_COURSE');return {id,steps:Array(20).fill({})}},
  p201RequireRole_:(role,token)=>{if(role!=='TEACHER'||token!=='DEMO_TEACHER_AUTH')throw Error('STAFF_UNAUTHENTICATED')},
  Date,JSON,Math,String,Number,Array,Object,Error
 };
 vm.createContext(context);vm.runInContext(source,context,{filename:'17_GuestPassport.js'});
 return {rpc:context.pbl203GuestRpc,store,cache,context};
}
function newPassport(f){const out=f.rpc({op:'CREATE'});assert.ok(out.ok);
 assert.match(out.guestId,/^GP-[A-F0-9]{12}$/);assert.match(out.passphrase,/^[a-f0-9]{32}$/);
 assert.match(out.token,/^[a-f0-9]{64}$/);return out}
const submit=(f,a,id='request_sample_0001',choice='B',rev=0)=>f.rpc({
 op:'SUBMIT',token:a.token,courseId:'vlog20',step:2,choice,requestId:id,expectedRevision:rev
});
test('new guest generates high-entropy independent access and no real names',()=>{
 const f=fixture(),p=newPassport(f);assert.equal(p.passport.works.length,0);
 const raw=f.store.get('P203_FAKE_'+p.guestId);
 assert.ok(raw&&!raw.includes(p.passphrase));assert.ok(!/@[a-z0-9.-]+/i.test(raw));
});
test('fresh personal account is durable in script properties',()=>{
 const f=fixture(),p=newPassport(f);const saved=submit(f,p);
 assert.equal(saved.works.length,1);
 f.cache.clear();assert.throws(()=>f.rpc({op:'WHOAMI',token:p.token}),/SESSION_EXPIRED/);
 const logged=f.rpc({op:'LOGIN',guestId:p.guestId,passphrase:p.passphrase});
 assert.equal(logged.passport.works.length,1);assert.equal(logged.passport.works[0].choice,'B');
});
test('wrong passphrase cannot impersonate learner',()=>{
 const f=fixture(),p=newPassport(f);
 assert.throws(()=>f.rpc({op:'LOGIN',guestId:p.guestId,passphrase:'0'.repeat(32)}),/INVALID_LOGIN/);
});
test('unknown guest does not return records',()=>{
 const f=fixture();assert.throws(()=>f.rpc({op:'LOGIN',guestId:'GP-111111111111',passphrase:'0'.repeat(32)}),/INVALID_LOGIN/);
});
test('anonymous cannot read private progress',()=>{
 const f=fixture();newPassport(f);
 assert.throws(()=>f.rpc({op:'WHOAMI',token:'f'.repeat(64)}),/SESSION_EXPIRED/);
});
test('fake choice writes an append-only journal and work receipt',()=>{
 const f=fixture(),p=newPassport(f),x=submit(f,p);assert.equal(x.works[0].revision,1);
 assert.equal(x.works[0].status,'PENDING');assert.equal(x.events[0].type,'SAMPLE_SUBMIT');
});
test('repeat same request is idempotent',()=>{
 const f=fixture(),p=newPassport(f);submit(f,p);
 const again=submit(f,p);assert.equal(again.repeated,true);assert.equal(again.events.length,1);
});
test('duplicate request with different choice is rejected',()=>{
 const f=fixture(),p=newPassport(f);submit(f,p);
 assert.throws(()=>submit(f,p,'request_sample_0001','C'),/REQUEST_COLLISION/);
});
test('stale optimistic revision is rejected',()=>{
 const f=fixture(),p=newPassport(f);submit(f,p);
 assert.throws(()=>submit(f,p,'request_sample_0002','D',0),/STALE_REVISION/);
});
test('valid work revision adds another event',()=>{
 const f=fixture(),p=newPassport(f);submit(f,p);const out=submit(f,p,'request_sample_0003','D',1);
 assert.equal(out.works[0].revision,2);assert.equal(out.events.length,2);
});
test('malformed request and answer are denied',()=>{
 const f=fixture(),p=newPassport(f);
 assert.throws(()=>submit(f,p,'bad','A'),/REQUEST_ID_INVALID/);
 assert.throws(()=>submit(f,p,'request_sample_0004','K'),/CHOICE_INVALID/);
 assert.throws(()=>f.rpc({op:'SUBMIT',token:p.token,courseId:'vlog20',step:55,choice:'A',
  requestId:'request_sample_0005',expectedRevision:0}),/STEP_INVALID/);
});
test('teacher inbox is protected by staff role session',()=>{
 const f=fixture(),p=newPassport(f);submit(f,p);
 assert.throws(()=>f.rpc({op:'TEACHER_LIST',authToken:'ANONYMOUS'}),/STAFF_UNAUTHENTICATED/);
 const rows=f.rpc({op:'TEACHER_LIST',authToken:'DEMO_TEACHER_AUTH'}).records;
 assert.equal(rows[0].guestId,p.guestId);assert.equal(rows[0].works.length,1);
});
test('teacher feedback persists and learner reads it',()=>{
 const f=fixture(),p=newPassport(f);submit(f,p);
 const r=f.rpc({op:'TEACHER_FEEDBACK',authToken:'DEMO_TEACHER_AUTH',guestId:p.guestId,
  courseId:'vlog20',step:2,feedbackCode:'REVISE',expectedRevision:1});
 assert.equal(r.status,'NEEDS_REVISION');
 const own=f.rpc({op:'WHOAMI',token:p.token});
 assert.match(own.works[0].feedback,/Try again/);assert.equal(own.works[0].revision,2);
});
test('teacher feedback requires server role',()=>{
 const f=fixture(),p=newPassport(f);submit(f,p);
 assert.throws(()=>f.rpc({op:'TEACHER_FEEDBACK',authToken:'ANONYMOUS',guestId:p.guestId,
   courseId:'vlog20',step:2,feedbackCode:'GOOD',expectedRevision:1}),/STAFF_UNAUTHENTICATED/);
});
test('teacher feedback rejects old revision',()=>{
 const f=fixture(),p=newPassport(f);submit(f,p);
 assert.throws(()=>f.rpc({op:'TEACHER_FEEDBACK',authToken:'DEMO_TEACHER_AUTH',guestId:p.guestId,
  courseId:'vlog20',step:2,feedbackCode:'GOOD',expectedRevision:2}),/WORK_STALE/);
});
test('logout invalidates token immediately',()=>{
 const f=fixture(),p=newPassport(f);assert.ok(f.rpc({op:'LOGOUT',token:p.token}).ok);
 assert.throws(()=>f.rpc({op:'WHOAMI',token:p.token}),/SESSION_EXPIRED/);
});
test('guest creation throttled to protect shared script storage',()=>{
 const f=fixture();newPassport(f);assert.throws(()=>f.rpc({op:'CREATE'}),/CREATE_RATE_LIMIT/);
});
test('no real school RPC is available in this module',()=>{
 const f=fixture();assert.equal(f.context.pbl20SchoolRpc,undefined);
 assert.ok(!/\b\d{9}\b/.test(source));assert.ok(!/\b\d{6}\b/.test(source));
});
