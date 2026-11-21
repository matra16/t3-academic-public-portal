/**
 * PBL LMS V20.3 — fictional Learning Passport, public synthetic studio only.
 * No real child identity / school records. All text submitted is selected from
 * fixed sample choices; no arbitrary PII is accepted or stored.
 * Reuses the existing Apps Script ScriptProperties, not a new DB.
 */
const P203_G_PREFIX='P203_FAKE_',P203_G_INDEX='P203_FAKE_INDEX';
const P203_G_MAX=40,P203_G_TTL=21600,P203_G_MAX_EVENTS=70;
const P203_G_CHOICES={A:'I explored the question.',B:'I planned with my group.',
  C:'I created and checked my work.',D:'I shared and reflected.'};
const P203_G_FEEDBACK={GOOD:'Well done. Keep learning!',REVISE:'Try again and improve this step.',
  DETAIL:'Add one useful example.'};
function p203Err(s){throw Error('P203_'+s)}
function p203Prop(){return PropertiesService.getScriptProperties()}
function p203Cache(){return CacheService.getScriptCache()}
function p203Random(n){let s='';while(s.length<n)s+=Utilities.getUuid().replace(/-/g,'');
  return s.slice(0,n).toLowerCase()}
function p203Sha(s){return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,s,Utilities.Charset.UTF_8)
  .map(x=>('0'+(x&255).toString(16)).slice(-2)).join('')}
function p203Digest(pass,salt){let x=salt+'|'+pass+'|P203_SYNTHETIC';
  for(let i=0;i<160;i++)x=p203Sha(x);return x}
function p203Eq(a,b){if(typeof a!=='string'||typeof b!=='string'||a.length!==64||b.length!==64)return false;
  let x=0;for(let i=0;i<64;i++)x|=a.charCodeAt(i)^b.charCodeAt(i);return x===0}
function p203Id(s){const id=String(s||'').toUpperCase();
  if(!/^GP-[A-F0-9]{12}$/.test(id))p203Err('INVALID_GUEST_ID');return id}
function p203Key(s){const key=String(s||'');
  if(!/^[a-f0-9]{32}$/.test(key))p203Err('INVALID_KEY');return key}
function p203Token(s){const key=String(s||'');
  if(!/^[a-f0-9]{64}$/.test(key))p203Err('SESSION_REQUIRED');return 'P203_SES_'+key}
function p203WithLock(cb){const lock=LockService.getScriptLock();
  if(!lock.tryLock(6000))p203Err('BUSY_RETRY');
  try{return cb()}finally{lock.releaseLock()}}
function p203Load(id){id=p203Id(id);
  const raw=p203Prop().getProperty(P203_G_PREFIX+id);if(!raw)p203Err('NOT_FOUND');
  let a;try{a=JSON.parse(raw)}catch(_){p203Err('CORRUPT_RECORD')}
  if(!a||a.id!==id||a.scope!=='SYNTHETIC_ONLY'||!Array.isArray(a.works)||
    !Array.isArray(a.events)||!Number.isSafeInteger(a.epoch))p203Err('RECORD_INVALID');
  return a}
function p203Save(a){const s=JSON.stringify(a);if(s.length>8500)p203Err('CAPACITY_REACHED');
  const key=P203_G_PREFIX+a.id,props=p203Prop();props.setProperty(key,s);
  if(props.getProperty(key)!==s)p203Err('READBACK_FAILED')}
function p203Public(a){return {ok:true,scope:'SYNTHETIC_ONLY',guestId:a.id,revision:a.revision,
  works:a.works.map(w=>({courseId:w.courseId,step:w.step,choice:w.choice,
    note:P203_G_CHOICES[w.choice],revision:w.revision,status:w.status,feedbackCode:w.feedbackCode||'',
    feedback:P203_G_FEEDBACK[w.feedbackCode]||'',at:w.at})),
  events:a.events.slice(-18).map(e=>({type:e.type,courseId:e.courseId,step:e.step,at:e.at})),
  persistence:'DURABLE_SYNTHETIC_ONLY'} }
function p203Issue(a){const token=p203Random(64);
  p203Cache().put(p203Token(token),JSON.stringify({id:a.id,epoch:a.epoch}),P203_G_TTL);
  return token}
function p203Session(token){let j=p203Cache().get(p203Token(token));
  if(!j)p203Err('SESSION_EXPIRED');let s;try{s=JSON.parse(j)}catch(_){p203Err('SESSION_INVALID')}
  const a=p203Load(s.id);if(a.epoch!==s.epoch)p203Err('SESSION_REVOKED');return a}
function p203Create(){return p203WithLock(()=>{
  const props=p203Prop(),cache=p203Cache();
  if(cache.get('P203_CREATE_RATE'))p203Err('CREATE_RATE_LIMIT');
  let ids;try{ids=JSON.parse(props.getProperty(P203_G_INDEX)||'[]')}catch(_){p203Err('INDEX_ERROR')}
  if(!Array.isArray(ids)||ids.length>=P203_G_MAX)p203Err('DEMO_ACCOUNT_LIMIT');
  const id='GP-'+p203Random(12).toUpperCase(),key=p203Random(32),salt=p203Random(32);
  const a={id,scope:'SYNTHETIC_ONLY',salt,hash:p203Digest(key,salt),epoch:1,
    revision:0,works:[],events:[],createdAt:new Date().toISOString()};
  p203Save(a);ids.push(id);
  const json=JSON.stringify(ids);props.setProperty(P203_G_INDEX,json);
  if(props.getProperty(P203_G_INDEX)!==json)p203Err('INDEX_READBACK_FAILED');
  cache.put('P203_CREATE_RATE','1',5);
  return {ok:true,created:true,guestId:id,passphrase:key,token:p203Issue(a),passport:p203Public(a)}
})}
function p203Login(r){const id=p203Id(r.guestId),key=p203Key(r.passphrase);
  const cache=p203Cache(),attemptKey='P203_FAIL_'+id,attempt=Number(cache.get(attemptKey)||0);
  if(attempt>=8)p203Err('RATE_LIMIT');
  let a;try{a=p203Load(id)}catch(_){p203Err('INVALID_LOGIN')}
  if(!p203Eq(a.hash,p203Digest(key,a.salt))){
    cache.put(attemptKey,String(attempt+1),360);p203Err('INVALID_LOGIN')}
  cache.remove(attemptKey);
  return {ok:true,token:p203Issue(a),passport:p203Public(a)}
}
function p203Submit(r){const id=p203Session(r.token).id;
  const rid=String(r.requestId||'');if(!/^[A-Za-z0-9_-]{12,64}$/.test(rid))p203Err('REQUEST_ID_INVALID');
  const course=p20Course_(String(r.courseId||'')),step=r.step,choice=String(r.choice||'');
  if(!Number.isSafeInteger(step)||step<1||step>course.steps.length)p203Err('STEP_INVALID');
  if(!Object.prototype.hasOwnProperty.call(P203_G_CHOICES,choice))p203Err('CHOICE_INVALID');
  if(!Number.isSafeInteger(r.expectedRevision)||r.expectedRevision<0)p203Err('REVISION_INVALID');
  return p203WithLock(()=>{
    const a=p203Session(r.token),repeat=a.events.find(e=>e.requestId===rid);
    if(repeat){if(repeat.courseId!==course.id||repeat.step!==step||repeat.choice!==choice)
      p203Err('REQUEST_COLLISION');return {...p203Public(a),repeated:true}}
    const old=a.works.find(w=>w.courseId===course.id&&w.step===step);
    if(r.expectedRevision!==(old?old.revision:0))p203Err('STALE_REVISION');
    if(!old&&a.works.length>=30)p203Err('WORK_LIMIT');
    if(a.events.length>=P203_G_MAX_EVENTS)p203Err('EVENT_LIMIT');
    const next={courseId:course.id,step,choice,status:'PENDING',
      revision:(old?old.revision:0)+1,feedbackCode:'',at:new Date().toISOString()};
    if(old)Object.assign(old,next);else a.works.push(next);
    a.revision++;a.events.push({requestId:rid,type:'SAMPLE_SUBMIT',
      courseId:course.id,step,choice,at:next.at});
    p203Save(a);const verify=p203Load(id);
    if(!verify.works.some(w=>w.courseId===course.id&&w.step===step&&w.choice===choice&&
       w.revision===next.revision)||!verify.events.some(e=>e.requestId===rid))
      p203Err('SUBMISSION_READBACK_FAILED');
    return p203Public(verify)
  })}
function p203StaffList(r){p201RequireRole_('TEACHER',r.authToken);
  let ids=JSON.parse(p203Prop().getProperty(P203_G_INDEX)||'[]');
  if(!Array.isArray(ids))p203Err('INDEX_INVALID');
  const records=[];for(const id of ids.slice(-P203_G_MAX)){try{
    const a=p203Load(id);records.push({guestId:a.id,works:a.works.map(w=>({
      courseId:w.courseId,step:w.step,choice:w.choice,revision:w.revision,
      status:w.status,feedbackCode:w.feedbackCode||''}))})
  }catch(_){}}return {ok:true,records,scope:'SYNTHETIC_ONLY'}}
function p203Feedback(r){p201RequireRole_('TEACHER',r.authToken);
  const id=p203Id(r.guestId),code=String(r.feedbackCode||'');
  if(!Object.prototype.hasOwnProperty.call(P203_G_FEEDBACK,code))p203Err('FEEDBACK_INVALID');
  if(!Number.isSafeInteger(r.expectedRevision)||r.expectedRevision<1)p203Err('REVISION_INVALID');
  return p203WithLock(()=>{
    p201RequireRole_('TEACHER',r.authToken);
    const a=p203Load(id),w=a.works.find(w=>w.courseId===r.courseId&&w.step===r.step);
    if(!w||w.revision!==r.expectedRevision)p203Err('WORK_STALE');
    if(a.events.length>=P203_G_MAX_EVENTS)p203Err('EVENT_LIMIT');
    w.feedbackCode=code;w.status=code==='GOOD'?'APPROVED':'NEEDS_REVISION';
    w.revision++;a.revision++;
    a.events.push({type:'SAMPLE_FEEDBACK',courseId:w.courseId,
      step:w.step,at:new Date().toISOString()});
    p203Save(a);const saved=p203Load(id).works.find(x=>x.courseId===w.courseId&&x.step===w.step);
    if(!saved||saved.feedbackCode!==code||saved.revision!==w.revision)
      p203Err('FEEDBACK_READBACK_FAILED');
    return {ok:true,status:saved.status,revision:saved.revision}
  })}
function pbl203GuestRpc(input){const r=input&&typeof input==='object'&&!Array.isArray(input)?input:{};
  switch(String(r.op||'').toUpperCase()){
    case 'CREATE':return p203Create();
    case 'LOGIN':return p203Login(r);
    case 'WHOAMI':return p203Public(p203Session(r.token));
    case 'SUBMIT':return p203Submit(r);
    case 'TEACHER_LIST':return p203StaffList(r);
    case 'TEACHER_FEEDBACK':return p203Feedback(r);
    case 'LOGOUT':p203Session(r.token);p203Cache().remove(p203Token(r.token));return {ok:true};
    default:p203Err('OP_DENIED')
  }
}
