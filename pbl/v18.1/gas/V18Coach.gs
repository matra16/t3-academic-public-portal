/**
 * PBL LMS V18 — SCHOOL-PRIVATE LEARNING COACH + ACTIVITY LEDGER.
 * STAGED ONLY. Neither public GitHub Pages nor adding this file creates school DB tables.
 * Requires PBL_V18_SCHEMA_APPROVED=YES + existing four PBL11 LMS tables installed,
 * PBL_V18_CHAT_CONTENT_APPROVED=YES for saving any conversation, explicit retention/
 * guardian/teacher child data approval, source-specific RBAC QA, principal approval.
 * No external AI calls are made. Actual generative provider gateway is a separate human gate.
 * Fully original source. xAPI/Caliper-influenced fields, NOT standards certification.
 */
const PBL18=Object.freeze({
  tables:{message:'27_LMS_COACH_MESSAGES',event:'28_LMS_LEARNING_EVENTS'},
  header:{
    message:['MESSAGE_ID','OWNER_KEY','STEP','ROLE','ACTOR_UID','PLACE',
      'CONTENT_TEXT','CLIENT_REQUEST_ID','CREATED_AT','COACH_MODE','SESSION_ID','QUALITY_FLAG'],
    event:['EVENT_ID','ACTOR_UID','OWNER_KEY','CLASS','STEP','EVENT_TYPE','OBJECT_ID',
      'SESSION_ID','EVENT_AT','DURATION_SEC','CLIENT_REQUEST_ID','CHANNEL','DETAIL_JSON','DATA_POLICY_VERSION']
  },
  eventAllow:['STEP_VIEW','VOICE_PLAY','VOICE_RECORD_START','VOICE_RECORD_STOP','TASK_DRAFT',
   'TASK_SUBMIT','SESSION_PULSE','SESSION_END','SESSION_START','LOGIN','LOGOUT','TASK_SAVED',
   'COACH_ASK','COACH_REPLY'],
  placeAllow:['school','temple','market','community','other'],
  policy:'PBL18-CHILD-MINIMISE-01'
});
function v18Gate_(){return properties_().getProperty('PBL_V18_SCHEMA_APPROVED')==='YES'}
function v18ChatGate_(){return v18Gate_()&&properties_().getProperty('PBL_V18_CHAT_CONTENT_APPROVED')==='YES'}
function v18Sheet_(type,required){
 if(!v18Gate_()){
  if(required)throw Error('ระบบ AI Coach รอการอนุมัติการเก็บข้อมูลของโรงเรียน');
  return null;
 }
 const sh=ss_().getSheetByName(PBL18.tables[type]);
 if(!sh){
  if(required)throw Error('ยังไม่มีตารางบันทึก Coach ที่อนุมัติ');
  return null;
 }
 const header=PBL18.header[type],actual=sh.getRange(1,1,1,header.length).getValues()[0];
 if(header.some((key,i)=>actual[i]!==key))throw Error('ตารางกิจกรรมมีโครงสร้างไม่ตรง');
 return sh;
}
function v18Rows_(type){
 const sh=v18Sheet_(type,false);if(!sh)return [];
 const rows=sh.getDataRange().getValues(),header=PBL18.header[type];
 if(rows.length>16000)throw Error('บันทึกกิจกรรมเต็มขอบเขตที่รองรับ ต้องทำงานเก็บถาวรภายใต้สิทธิ์เจ้าของ');
 return rows.slice(1).filter(r=>r.some(v=>String(v||'').trim())).map(r=>
  Object.fromEntries(header.map((key,i)=>[key,r[i]])));
}
function v18Id_(prefix){return prefix+random_().slice(0,27)}
function v18Class_(session){
 if(session.role!=='STUDENT'||!session.user)throw Error('ฟังก์ชันนี้สำหรับนักเรียน ป.6 ที่เข้าสู่ระบบ');
 return requireP6Class_(session.user.CLASS);
}
/**
 * Membership-epoch scoping. A new school-approved group membership set yields
 * a DIFFERENT thread id, so newly joined learners cannot read prior members'
 * chat history. This is not a substitute for explicit school retention policy.
 * No raw member IDs or salt are stored in the thread key.
 */
function v181GroupEpoch_(group,cls,uid){
 const gid=String(group.GROUP_ID||''),pepper=properties_().getProperty('PBL_V18_GROUP_SCOPE_PEPPER')||'';
 if(pepper.length<32)throw Error('ผู้ดูแลโรงเรียนยังไม่ได้ตั้งค่าการแยกประวัติกลุ่ม');
 if(!/^[A-Za-z0-9_-]{2,90}$/.test(gid))throw Error('รหัสกลุ่มไม่ถูกต้อง');
 let memberIds;try{memberIds=JSON.parse(String(group.MEMBER_UIDS_JSON||'[]'))}catch(e){throw Error('รายชื่อสมาชิกกลุ่มไม่ถูกต้อง')}
 if(!Array.isArray(memberIds)||memberIds.length<1||memberIds.length>12||
   memberIds.some(x=>typeof x!=='string'||!x||x.length>120))throw Error('รายชื่อสมาชิกกลุ่มไม่ถูกต้อง');
 const members=[...new Set(memberIds)].sort();
 if(members.length!==memberIds.length||!members.includes(String(uid)))throw Error('ไม่พบสิทธิ์สมาชิกของผู้ใช้');
 const source='PBL18_GROUP_EPOCH_V1|'+gid+'|'+cls+'|'+members.join('|');
 const signed=Utilities.computeHmacSha256Signature(source,pepper);
 const epoch=Utilities.base64EncodeWebSafe(signed).replace(/=+$/,'').slice(0,22);
 return 'GROUP:'+gid+':E'+epoch;
}
function v18Scope_(session,scope){
 const cls=v18Class_(session),uid=String(session.uid),mode=String(scope||'individual');
 if(mode==='individual')return{ownerKey:'USER:'+uid,scope:mode,cls,uid};
 if(mode!=='group')throw Error('ประเภทกิจกรรมไม่ถูกต้อง');
 const group=groupFor_(uid,cls);
 if(!group||String(group.CLASS)!==cls||String(group.PROJECT_ID)!=='VLOG20')
  throw Error('ยังไม่ได้รับการจัดกลุ่มจากครู');
 if(properties_().getProperty('PBL_V18_GROUP_HISTORY_APPROVED')!=='YES')
  throw Error('พื้นที่กลุ่มรอการอนุมัติสิทธิ์ประวัติสมาชิก');
 return{ownerKey:v181GroupEpoch_(group,cls,uid),scope:mode,cls,uid};
}
function v18Step_(raw){
 const n=Number(raw);
 if(!Number.isInteger(n)||n<1||n>PBL11.stepCount)throw Error('ขั้นโครงงานไม่ถูกต้อง');
 return n;
}
function v18Place_(raw){
 const x=String(raw||'school');if(!PBL18.placeAllow.includes(x))throw Error('ประเภทสถานที่ไม่ถูกต้อง');return x;
}
function v18Request_(raw){
 const s=String(raw||'');if(!/^[a-zA-Z0-9_-]{8,80}$/.test(s))throw Error('คำขอไม่ถูกต้อง');return s;
}
function v18PII_(text){
 return /\b\d{9,13}\b|(?:\+?66|0)[689]\d{8}\b|[\w.+-]+@[\w.-]+\.[a-z]{2,}|รหัสผ่าน|เลขบัตร|password|ที่อยู่บ้าน/i.test(text);
}
function v18Text_(input){
 const s=required_(input,500);
 if(s.length<2||v18PII_(s)||/^[=+@-]/.test(s))
  throw Error('อย่าพิมพ์ข้อมูลส่วนตัว รหัสผ่าน หรือคำสั่งสูตร');
 return s;
}
function v18EchoSafe_(s){
 // Spreadsheet formula guard for any generated content.
 return String(s||'').replace(/[\u0000-\u001F\u007F]/g,' ').slice(0,1800)
  .replace(/^[=+@-]/," $&");
}
function v18Cache_(){return CacheService.getScriptCache()}
function v18ReadSession_(session,raw){
 const sid=String(raw||'');
 if(!/^[A-Za-z0-9_-]{12,60}$/.test(sid))throw Error('กรุณาเริ่มพื้นที่สนทนาอีกครั้ง');
 const rawSession=v18Cache_().get('pbl18_s_'+sid);
 if(!rawSession)throw Error('หมดเวลาใช้งาน กรุณาเริ่มพื้นที่สนทนาอีกครั้ง');
 let state;try{state=JSON.parse(rawSession)}catch(e){throw Error('ข้อมูลเซสชันไม่ถูกต้อง')}
 if(String(state.uid)!==String(session.uid))throw Error('เซสชันไม่ตรงบัญชี');
 return{sid,state};
}
function v18EventRecord_(session,ctx){
 if(!v18Sheet_('event',false))return {skipped:'EVENT_STORAGE_NOT_ENABLED'};
 const context=v18Scope_(session,ctx.scope||'individual');
 const type=String(ctx.eventType||'');
 if(!PBL18.eventAllow.includes(type))throw Error('เหตุการณ์ไม่ถูกต้อง');
 const step=v18Step_(ctx.step||1),seconds=Math.min(30,Math.max(0,Number(ctx.durationSec)||0));
 const request=String(ctx.requestId||'');
 const id=/^[a-zA-Z0-9_-]{8,80}$/.test(request)?request:v18Id_('SYS');
 const detail=ctx.meta&&typeof ctx.meta==='object'&&!Array.isArray(ctx.meta)?ctx.meta:{};
 const slim={kind:String(detail.kind||'').replace(/[^A-Z_]/g,'').slice(0,35),
  place:String(detail.place||'').replace(/[^a-z]/g,'').slice(0,16),
  chars:Math.min(1800,Math.max(0,Number(detail.characters)||0))};
 const row=[v18Id_('EV'),context.uid,context.ownerKey,context.cls,step,type,
  'VLOG20_STEP_'+step,String(ctx.sessionId||'').slice(0,60),new Date(),seconds,
  id,'SCHOOL_GAS',JSON.stringify(slim),PBL18.policy];
 v18Sheet_('event',true).appendRow(row);
 return{accepted:true,eventId:row[0],at:row[8].toISOString()};
}
function v18OptionalAccessEvent_(session,type,opts){
 if(!v18Gate_()||!v18Sheet_('event',false))return {skipped:true};
 if(!session||session.role!=='STUDENT')return {skipped:true};
 const base={scope:'individual',step:opts?.step||1,eventType:type,sessionId:'SYSTEM',requestId:v18Id_('SYS')};
 return v18EventRecord_(session,base);
}
function v18LearningEvent_(session,d){
 const type=String(d.eventType||''),step=v18Step_(d.step),scope=String(d.scope||'individual');
 if(!['STEP_VIEW','VOICE_PLAY','VOICE_RECORD_START','VOICE_RECORD_STOP','TASK_DRAFT',
  'TASK_SUBMIT','SESSION_PULSE','SESSION_END'].includes(type))throw Error('เหตุการณ์ไม่รองรับ');
 const req=v18Request_(d.requestId);
 const state=v18ReadSession_(session,d.sessionId);
 const owner=v18Scope_(session,scope);
 if(state.state.ownerKey!==owner.ownerKey||state.state.step!==step)throw Error('ขอบเขตเซสชันไม่ตรง');
 return withLock_(()=>{
  const old=v18Rows_('event').some(x=>x.CLIENT_REQUEST_ID===req&&x.ACTOR_UID===owner.uid);
  if(old)return{accepted:true,duplicate:true};
  return v18EventRecord_(session,{scope,step,eventType:type,sessionId:state.sid,
   durationSec:d.durationSec,requestId:req});
 });
}
function v18CoachSessionStart_(session,d){
 if(!v18ChatGate_())throw Error('ยังไม่ได้เปิดการเก็บประวัติสนทนาของนักเรียน');
 const owner=v18Scope_(session,d.scope);
 const step=v18Step_(d.step),place=v18Place_(d.place);
 const sid=v18Id_('SID');
 v18Cache_().put('pbl18_s_'+sid,JSON.stringify({uid:owner.uid,ownerKey:owner.ownerKey,
  step,place,startedAt:new Date().toISOString()}),Math.min(PBL11.sessionSeconds,1800));
 withLock_(()=>v18EventRecord_(session,{scope:owner.scope,step,eventType:'SESSION_START',sessionId:sid,
  requestId:v18Id_('SYS'),meta:{place}}));
 return{source:'LIVE',sessionId:sid,ownerKey:owner.ownerKey,mode:'GUIDED_SCHOOL'};
}
function v18PublicMessage_(r){
 return{id:String(r.MESSAGE_ID),role:String(r.ROLE),text:String(r.CONTENT_TEXT||''),
  actorId:String(r.ACTOR_UID||''),at:new Date(r.CREATED_AT).toISOString(),mode:String(r.COACH_MODE)};
}
function v18CoachHistory_(session,d){
 if(!v18ChatGate_())throw Error('ยังไม่ได้เปิดประวัติสนทนาของโรงเรียน');
 const owner=v18Scope_(session,d.scope),step=v18Step_(d.step);
 const msgs=v18Rows_('message').filter(r=>r.OWNER_KEY===owner.ownerKey&&Number(r.STEP)===step);
 return{source:'LIVE',ownerKey:owner.ownerKey,mode:'GUIDED_SCHOOL',
  messages:msgs.slice(-32).map(v18PublicMessage_)};
}
function v18GuidedReply_(text,step,place){
 const topic=({school:'โรงเรียน',temple:'วัด',market:'ตลาด',community:'ชุมชน',other:'สถานที่'})[place];
 let body;
 if(/บท|script|english|พูด|grammar|translate|ภาษาอังกฤษ/i.test(text)){
  body='ลองเขียนบทพูดด้วยตนเอง 2 ประโยค: “Welcome to our '+(place==='market'?'local market':place==='temple'?'temple':place==='school'?'school':'community')+'.” และ “Let me show you…” จากนั้นเพิ่มชื่อจุดเด่นที่ตรวจสอบแล้ว คุณจะอธิบายจุดแรกอย่างไร?';
 }else if(/วิดีโอ|video|vlog|ฉาก|storyboard|ตัดต่อ|ถ่าย/i.test(text)){
  body='วางโครง 6 ฉาก: แนะนำสถานที่ → ตำแหน่ง → จุดเด่น 1 → จุดเด่น 2 → ข้อควรรู้ → ขอบคุณผู้ชม สมาชิกทุกคนควรฝึกพูดและอธิบายบทบาทของตนเอง ฉากที่ 3 จะถ่ายสิ่งใด และรู้ได้อย่างไรว่าเป็นข้อมูลจริง?';
 }else if(/ความปลอดภัย|อนุญาต|permission|consent|กฎหมาย|ส่วนตัว/i.test(text)){
  body='ก่อนถ่าย ให้ถามผู้ดูแลสถานที่ ครู และผู้เกี่ยวข้องตามกติกา ไม่ถ่ายบุคคลหรือเด็กที่ไม่ได้รับความยินยอม ไม่เผยแพร่ข้อมูลระบุตัวบุคคล ทีมมีแผนถ่ายเฉพาะสถานที่และป้ายที่อนุญาตอย่างไร?';
 }else if(/ข้อมูล|แหล่ง|research|facts|สืบค้น|ประวัติ|ตรวจสอบ/i.test(text)){
  body='สืบค้นข้อเท็จจริงเกี่ยวกับ'+topic+'จากอย่างน้อยสองแหล่งหรือแหล่งหลักและผู้ดูแลพื้นที่ ระบุผู้ให้ข้อมูล วันที่ และสิ่งที่ยังไม่แน่ใจ คุณมีหลักฐานใดที่ตรวจสอบซ้ำแล้ว?';
 }else if(/หน้าที่|role|กลุ่ม|team|สมาชิก|ร่วมกัน/i.test(text)){
  body='แบ่งผู้ค้นข้อมูล ผู้เขียนบท ผู้พูด และผู้ดูแลภาพ/เสียง หมุนเวียนหน้าที่ และให้แต่ละคนฝึกภาษาอังกฤษด้วยตนเอง ขั้นนี้ใครยังไม่ได้ฝึกพูด (อ้างรหัสสมาชิกเท่านั้น)?';
 }else{
  body='ฉันจะถามแทนการเขียนคำตอบให้: ผู้ชมควรรู้อะไรเกี่ยวกับ'+topic+'? ลองขึ้นต้น “Our visitors want to know…” แล้วเติมคำตอบจากการสืบค้นของคุณ ถ้าผู้ชมถาม “How do you know?” คุณจะยืนยันอย่างไร?';
 }
 return 'โครงงาน Vlog — ขั้นที่ '+step+'\n'+body+'\nคำแนะนำนี้เป็นแบบฝึกชวนคิด ไม่ใช่ข้อเท็จจริงที่ตรวจสอบแล้วหรือคะแนนจากครู';
}
function v18CoachAsk_(session,d){
 if(!v18ChatGate_())throw Error('การสนทนาจริงยังไม่ผ่านอนุมัติข้อมูลนักเรียน');
 const owner=v18Scope_(session,d.scope),step=v18Step_(d.step),place=v18Place_(d.place);
 const text=v18Text_(d.message),req=v18Request_(d.requestId);
 const sessionRecord=v18ReadSession_(session,d.sessionId);
 if(sessionRecord.state.ownerKey!==owner.ownerKey||sessionRecord.state.step!==step||
    sessionRecord.state.place!==place)throw Error('กรุณาเริ่มบทสนทนาใหม่เมื่อเปลี่ยนสถานที่หรือขั้น');
 const rateKey='pbl18_rate_'+owner.uid+'_'+owner.ownerKey.replace(/[^A-Za-z0-9]/g,'');
 const reply=v18GuidedReply_(text,step,place);
 return withLock_(()=>{
  const messages=v18Rows_('message');
  const old=messages.find(x=>x.CLIENT_REQUEST_ID===req&&x.ACTOR_UID===owner.uid&&x.ROLE==='student');
  if(old){
   const response=messages.find(x=>x.CLIENT_REQUEST_ID===req&&x.ROLE==='coach'&&x.OWNER_KEY===owner.ownerKey);
   return{source:'LIVE',mode:'GUIDED_SCHOOL',reply:response?v18PublicMessage_(response):null,duplicate:true,
    messages:messages.filter(x=>x.OWNER_KEY===owner.ownerKey&&Number(x.STEP)===step).slice(-32).map(v18PublicMessage_)};
  }
  if(v18Cache_().get(rateKey))throw Error('โปรดรอสักครู่ก่อนส่งคำถามถัดไป');
  const ownToday=messages.filter(x=>x.ACTOR_UID===owner.uid&&x.ROLE==='student'&&
   new Date(x.CREATED_AT).toISOString().slice(0,10)===new Date().toISOString().slice(0,10)).length;
  if(ownToday>=80)throw Error('ครบจำนวนคำถามของวันนี้แล้ว ให้ครูช่วยวางแผนต่อ');
  const sh=v18Sheet_('message',true),now=new Date(),when=new Date(now.getTime()+1);
  // Never store session auth tokens or password; chat content requires explicit owner approval.
  const pair=[
   [v18Id_('MSG'),owner.ownerKey,step,'student',owner.uid,place,
    v18EchoSafe_(text),req,now,'GUIDED_SCHOOL',sessionRecord.sid,'SOURCE_USER'],
   [v18Id_('MSG'),owner.ownerKey,step,'coach','SYSTEM',place,
    v18EchoSafe_(reply),req,when,'GUIDED_SCHOOL',sessionRecord.sid,'MODEL_NOT_USED']
  ];
  // One two-row write under ScriptLock; more reliable than two appendRow calls.
  sh.getRange(sh.getDataRange().getValues().length+1,1,2,PBL18.header.message.length).setValues(pair);
  v18EventRecord_(session,{scope:owner.scope,step,eventType:'COACH_ASK',sessionId:sessionRecord.sid,
   requestId:req,meta:{place,characters:text.length,kind:'GUIDED_SCHOOL'}});
  v18EventRecord_(session,{scope:owner.scope,step,eventType:'COACH_REPLY',sessionId:sessionRecord.sid,
   requestId:v18Id_('SYS'),meta:{place,characters:reply.length,kind:'GUIDED_SCHOOL'}});
  v18Cache_().put(rateKey,'1',2);
  const updated=v18Rows_('message').filter(x=>x.OWNER_KEY===owner.ownerKey&&Number(x.STEP)===step);
  return{source:'LIVE',mode:'GUIDED_SCHOOL',
   reply:v18PublicMessage_(updated[updated.length-1]),
   messages:updated.slice(-32).map(v18PublicMessage_)};
 });
}
function v18AdminAnalytics_(d){
 const rows=v18Rows_('event'); // never contains raw chat content
 const events=rows.filter(x=>isP6Class_(x.CLASS)).slice(-500).map(x=>{
  let meta={};try{const raw=JSON.parse(String(x.DETAIL_JSON||'{}'));meta={
   kind:plain_(raw.kind,35),place:plain_(raw.place,16),characters:Number(raw.chars)||0};}catch(e){}
  return{id:String(x.EVENT_ID),actorId:String(x.ACTOR_UID),ownerKey:String(x.OWNER_KEY),
   classId:String(x.CLASS),step:Number(x.STEP),eventType:String(x.EVENT_TYPE),
   at:new Date(x.EVENT_AT).toISOString(),durationSec:Math.min(30,Math.max(0,Number(x.DURATION_SEC)||0)),
   scope:String(x.OWNER_KEY).startsWith('GROUP:')?'group':'individual',meta};
 });
 return{source:'LIVE',schema:v18Sheet_('event',false)?'READY':'NOT_CONFIGURED',
  generatedAt:new Date().toISOString(),window:'LATEST_500_EVENTS',truncated:rows.length>500,events,summary:{events:events.length,
   actors:new Set(events.map(e=>e.actorId)).size,
   groups:new Set(events.filter(e=>e.scope==='group').map(e=>e.ownerKey)).size,
   coachQuestions:events.filter(e=>e.eventType==='COACH_ASK').length},
  dataPolicy:PBL18.policy,rawStudentTextIncluded:false,assessment:'NOT_GRADE'};
}
/** MANUAL OWNER EXECUTION ONLY; never callable from public RPC. */
function ownerSetupV18Coach_(){
 if(!v18Gate_()||!v18ChatGate_())throw Error('เจ้าของระบบต้องอนุมัติฐานข้อมูล การเก็บข้อความ และสิทธิ์ก่อน');
 return withLock_(()=>{
  Object.keys(PBL11.tabs).forEach(t=>rows_(t)); // existing 4 tables first
  const ss=ss_(),created=[];
  ['message','event'].forEach(type=>{
   const name=PBL18.tables[type];let sh=ss.getSheetByName(name);
   if(!sh){
    sh=ss.insertSheet(name);sh.appendRow(PBL18.header[type]);sh.setFrozenRows(1);created.push(name);
   }
   v18Sheet_(type,true);
  });
  return{status:'OWNER_MANUAL_SCHEMA_VERIFIED',created,tables:{...PBL18.tables},
   classification:'RESTRICTED_CHILDREN',notProductionApproval:true};
 });
}

/**
 * Owner-only read-only retention readiness inspection.
 * No purge action is exposed: real deletion needs consent, backup, exact
 * principals, retention policy, irreversible-operation approval, and audit.
 */
function ownerPreviewV181Retention_(){
 if(!v18Gate_())throw Error('โครงสร้างยังไม่ผ่านอนุมัติ');
 const messages=v18Rows_('message'),events=v18Rows_('event'),now=Date.now();
 const aged=(rows,col,days)=>rows.filter(x=>{
  const ts=new Date(x[col]).getTime();
  return Number.isFinite(ts)&&now-ts>days*86400000;
 }).length;
 return{classification:'RESTRICTED_CHILDREN',mode:'READ_ONLY_NO_PURGE',
   policy:'PBL18-CHILD-MINIMISE-01',
   messageCount:messages.length,eventCount:events.length,
   messagesOlderThan30Days:aged(messages,'CREATED_AT',30),
   eventsOlderThan90Days:aged(events,'EVENT_AT',90),
   approverRequired:true,writePerformed:false};
}
