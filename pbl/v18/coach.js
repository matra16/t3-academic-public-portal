/* PBL V18 — group / individual Vlog learning assistant and evidence-backed analytics.
 * Public Page uses deterministic guided practice only; real LLM requires owner-approved backend.
 * Avoid DOM innerHTML for any student/teacher data; no mic recordings or raw prompt telemetry.
 */
(() => {
'use strict';
const $=id=>document.getElementById(id);
const E={},state={scope:'individual',place:'school',step:1,sessionId:'',historyKey:'',waiting:false,
 admin:null,lastView:'',loggingTimer:0,pollTimer:0,lastPulse:0,token:0};
const B=()=>window.PBLV18Bridge;
const tasks={question:'เราจะตั้งคำถามค้นคว้าเกี่ยวกับสถานที่นี้อย่างไร',
script:'ช่วยตรวจบทพูดภาษาอังกฤษให้เป็นภาษาที่เข้าใจง่ายได้ไหม',
scenes:'ช่วยวางแผน Vlog ให้มี 6 ฉาก และให้ทุกคนได้ฝึกพูด',
safety:'ช่วยตรวจสิ่งที่ต้องขออนุญาตและความปลอดภัยก่อนถ่ายทำ'};
const allowed=['6.1','6.2','6.3'];
const make=(tag,text,cls)=>{
 const el=document.createElement(tag);el.textContent=String(text??'');
 if(cls)el.className=cls;return el;
};
const date=s=>{
 const d=new Date(s);return isNaN(+d)?'—':d.toLocaleString('th-TH',{dateStyle:'short',timeStyle:'short',timeZone:'Asia/Bangkok'});
};
const roleName=r=>r==='student'?'แนวคิดของเรา':'ผู้ช่วยการเรียนรู้';
const clip=s=>String(s||'').slice(0,2400);
const valid=()=>B()?.isStudent?.()&&$('studentScreen')&&!$('studentScreen').hidden;
function scopeForStep(n){
 const x=[1,2,9,13,20].includes(n)?'individual':'group';
 return x==='group'&&!B()?.identity()?.groupId?'individual':x;
}
function qs(){return{scope:state.scope,step:state.step,place:state.place,sessionId:state.sessionId}}
function safeId(){return 'req'+Date.now().toString(36)+Math.random().toString(36).slice(2,11)}
function showInfo(msg,err=false){
 E.info.textContent=msg;E.info.dataset.error=err?'true':'false';
}
function draw(messages){
 E.messages.replaceChildren();
 if(!messages||!messages.length){E.messages.append(make('p','เลือกคำถามตัวอย่าง หรือพิมพ์สิ่งที่กำลังคิดเกี่ยวกับโครงงานได้เลย','v18-coach-empty'));return}
 const frag=document.createDocumentFragment();
 messages.slice(-32).forEach(item=>{
  const box=document.createElement('article');box.className='v18-bubble';
  box.dataset.role=item.role==='student'?'student':'coach';
  const title=document.createElement('div');title.className='v18-bubble-title';
  title.append(make('strong',item.role==='student'?'ผู้เรียน':'ผู้ช่วย'),make('time',date(item.at)));
  const para=make('p',clip(item.text));para.setAttribute('lang',item.role==='coach'?'th':'auto');
  box.append(title,para);frag.append(box);
 });
 E.messages.append(frag);E.messages.scrollTop=E.messages.scrollHeight;
}
async function refreshHistory(silent=false){
 if(!valid())return;
 const ticket=state.token,ctx=qs();
 try{
  const data=await B().coachHistory(ctx);
  if(ticket!==state.token||!valid())return;
  draw(data.messages||[]);
  if(!silent)showInfo(data.source==='DEMO'?'ตัวอย่างผู้ช่วยแบบคำแนะนำ • ข้อความไม่ส่งออกจากเครื่อง':'แสดงข้อความที่มีสิทธิ์เข้าถึง');
 }catch(err){if(!silent&&ticket===state.token)showInfo(String(err?.message||'โหลดข้อความไม่สำเร็จ'),true)}
}
async function begin(keepScope=false){
 if(!valid())return;
 ++state.token;
 const ticket=state.token;
 state.step=Number(B().currentStep())||1;
 state.scope=keepScope&&['individual','group'].includes(state.scope)?state.scope:scopeForStep(state.step);
 state.place=E.place.value;
 E.scope.value=state.scope;
 E.scope.querySelector('option[value="group"]').disabled=!B().identity()?.groupId;
 E.mode.textContent='ขั้น '+state.step+' · '+(state.scope==='group'?'ร่วมกันเป็นกลุ่ม':'ฝึกส่วนบุคคล');
 E.send.disabled=false;E.input.disabled=false;
 draw([]);showInfo('กำลังเริ่มพื้นที่ฝึกคิด…');
 try{
  const result=await B().coachStart(qs());
  if(ticket!==state.token||!valid())return;
  state.sessionId=result.sessionId||'';
  state.historyKey=(result.ownerKey||'')+'|'+state.step;
  showInfo(result.source==='DEMO'?'ตัวอย่างผู้ช่วยแบบคำแนะนำ • ยังไม่เชื่อม AI เชิงสร้างสรรค์และฐานโรงเรียน':
   result.mode==='GENAI_APPROVED'?'ผู้ช่วย AI เชื่อมบริการที่โรงเรียนอนุมัติแล้ว':'ผู้ช่วยแบบคำแนะนำของโรงเรียน');
  await refreshHistory(true);
 }catch(e){if(ticket===state.token)showInfo(e.message,true)}
}
async function send(event){
 event.preventDefault();
 if(!valid()||state.waiting||E.input.disabled)return;
 const message=E.input.value.trim();
 if(message.length<2||message.length>500){E.input.focus();return}
 if(/(?:\b\d{9,13}\b|(?:\+?66|0)[689]\d{8}\b|[\w.+-]+@[\w.-]+\.[a-z]{2,}|password|รหัสผ่าน|เลขบัตร)/i.test(message)){
  showInfo('กรุณาลบข้อมูลส่วนตัวหรือรหัสผ่านออกจากข้อความก่อนส่ง',true);return;
 }
 state.waiting=true;E.send.disabled=true;E.input.disabled=true;
 const ticket=state.token,ctx={...qs(),message,requestId:safeId()};
 showInfo('กำลังคิดคำถามชวนค้นคว้า…');
 try{
  const r=await B().coachAsk(ctx);
  if(ticket!==state.token||!valid())return;
  E.input.value='';
  if(r.messages)draw(r.messages);else await refreshHistory(true);
  showInfo(r.source==='DEMO'?'คำแนะนำแบบฝึกที่กำหนดไว้ • ไม่ใช่การตอบของ AI สร้างสรรค์':
   r.mode==='GENAI_APPROVED'?'คำแนะนำ AI • ตรวจสอบข้อเท็จจริงกับแหล่งจริงเสมอ':'คำแนะนำจากแบบฝึกของโรงเรียน');
 }catch(e){if(ticket===state.token)showInfo(e.message,true)}
 finally{if(ticket===state.token){state.waiting=false;E.input.disabled=false;E.send.disabled=false;E.input.focus({preventScroll:true})}}
}
async function record(type,ctx={}){
 if(!valid()||!state.sessionId)return;
 try{await B().logEvent(type,{...qs(),...ctx,requestId:safeId()})}catch(e){/* optional telemetry; do not interfere with student work */}
}
function stepChanged(){
 if(!valid())return;
 const n=Number(B().currentStep())||1;
 if(n===state.step)return;
 const old=state.sessionId;
 if(old)record('SESSION_END');
 begin();
}
function studentChanged(){
 if(valid()){
  if(!state.sessionId)begin();
 }else{
  state.token++;state.sessionId='';state.historyKey='';
  state.waiting=false;draw([]);E.input.value='';showInfo('รอเข้าสู่ห้องเรียน');
 }
}
function startLoops(){
 clearInterval(state.pollTimer);clearInterval(state.loggingTimer);
 state.pollTimer=setInterval(()=>{if(valid()&&document.visibilityState==='visible'&&state.sessionId&&!state.waiting&&state.scope==='group')refreshHistory(true)},12000);
 state.loggingTimer=setInterval(()=>{
  if(valid()&&document.visibilityState==='visible'&&state.sessionId){
   const now=Date.now();if(state.lastPulse&&now-state.lastPulse<25000)return;
   state.lastPulse=now;record('SESSION_PULSE',{durationSec:30});
  }
 },30000);
}
function metric(label,value){
 const card=document.createElement('div');card.className='v18-analytic-metric';
 card.append(make('small',label),make('strong',value));return card;
}
function filterEvents(){
 if(!state.admin)return [];
 const cls=E.room.value,scope=E.filterScope.value,q=E.search.value.trim().toLowerCase();
 return (state.admin.events||[]).filter(x=>
  allowed.includes(String(x.classId))&&(!cls||x.classId===cls)&&(!scope||x.scope===scope)&&
  (!q||[x.actorId,x.ownerKey,x.eventType,x.step].some(v=>String(v??'').toLowerCase().includes(q)))
 ).slice(-500).reverse();
}
function drawLogs(){
 const rows=filterEvents();
 E.logList.replaceChildren();E.metrics.replaceChildren();
 const events=rows.length,actors=new Set(rows.map(x=>x.actorId)).size;
 const groups=new Set(rows.filter(x=>x.scope==='group').map(x=>x.ownerKey)).size;
 const questions=rows.filter(x=>x.eventType==='COACH_ASK').length;
 [['กิจกรรมที่บันทึก',events],['ผู้ใช้งานที่แตกต่าง',actors],['กลุ่มที่มีกิจกรรม',groups],['คำถามถึงผู้ช่วย',questions]]
 .forEach(([k,v])=>E.metrics.append(metric(k,v)));
 if(!rows.length){E.logList.append(make('p','ยังไม่มีเหตุการณ์ที่ตรงกับตัวกรอง','v18-analytics-empty'));return}
 const table=document.createElement('table');table.className='v18-log-table';
 const thead=document.createElement('thead');const hr=document.createElement('tr');
 ['เวลาระบบ','ผู้ทำกิจกรรม','ขอบเขต','ขั้น','เหตุการณ์','รายละเอียดที่ไม่ระบุตัวตน'].forEach(x=>hr.append(make('th',x)));
 thead.append(hr);const tbody=document.createElement('tbody');
 rows.forEach(evt=>{
  const tr=document.createElement('tr');
  const cells=[date(evt.at),String(evt.actorId||'—'),String(evt.ownerKey||'—'),
   String(evt.step||'—'),String(evt.eventType||'—'),evt.meta?JSON.stringify(evt.meta).slice(0,150):'—'];
  cells.forEach(t=>tr.append(make('td',t)));
  tbody.append(tr);
 });
 table.append(thead,tbody);E.logList.append(table);
}
async function adminReload(){
 if(!B()?.isAdmin?.())return;
 E.source.textContent='กำลังดึงกิจกรรม…';
 try{
  const data=await B().adminLogs({});
  if(!B()?.isAdmin?.())return;
  state.admin=data;
  E.source.textContent=(data.source==='DEMO'?'ข้อมูลสมมติสำหรับทดลอง':'ข้อมูลจากฐานโรงเรียนที่ได้รับอนุญาต')+
   ' • อัปเดต '+date(data.generatedAt);
  drawLogs();
 }catch(e){state.admin=null;E.source.textContent=String(e?.message||'โหลดไม่สำเร็จ');drawLogs()}
}
function init(){
 E.scope=$('v18CoachScope');E.place=$('v18CoachPlace');E.messages=$('v18CoachMessages');E.info=$('v18CoachInfo');
 E.mode=$('v18CoachModeBadge');E.form=$('v18CoachForm');E.input=$('v18CoachInput');E.send=$('v18CoachSend');
 E.source=$('v18AnalyticsSource');E.metrics=$('v18AnalyticsMetrics');E.logList=$('v18AnalyticsList');
 E.room=$('v18AnalyticsRoom');E.filterScope=$('v18AnalyticsScope');E.search=$('v18AnalyticsSearch');
 if(!E.form||!E.scope||!E.messages||!E.logList)return;
 E.form.addEventListener('submit',send);
 E.scope.addEventListener('change',()=>{if(state.sessionId)record('SESSION_END');state.scope=E.scope.value;begin(true)});
 E.place.addEventListener('change',()=>{if(state.sessionId)record('SESSION_END');state.place=E.place.value;begin(true)});
 document.querySelectorAll('[data-v18-hint]').forEach(btn=>btn.addEventListener('click',()=>{
  E.input.value=tasks[btn.dataset.v18Hint]||'';E.input.focus({preventScroll:true});
 }));
 $('v18AnalyticsRefresh')?.addEventListener('click',adminReload);
 const tab=$('v14AdminTab5');tab?.addEventListener('click',adminReload);
 [E.room,E.filterScope].forEach(el=>el.addEventListener('change',drawLogs));
 E.search.addEventListener('input',drawLogs);
 const student=$('studentScreen'),admin=$('adminScreen');
 new MutationObserver(()=>studentChanged()).observe(student,{attributes:true,attributeFilter:['hidden']});
 new MutationObserver(()=>{if(admin.hidden){state.admin=null;E.logList.replaceChildren();E.metrics.replaceChildren();E.source.textContent='รอข้อมูลจากระบบ'}})
 .observe(admin,{attributes:true,attributeFilter:['hidden']});
 const step=$('taskCounter');
 if(step)new MutationObserver(stepChanged).observe(step,{subtree:true,childList:true,characterData:true});
 const inputNote=$('taskNote');
 inputNote?.addEventListener('change',()=>record('TASK_DRAFT'));
 /* TASK_SUBMIT is logged after server-acknowledged saveStep in app.js, not merely on click. */
 $('voicePlay')?.addEventListener('click',()=>record('VOICE_PLAY'));
 $('voiceRecord')?.addEventListener('click',()=>record('VOICE_RECORD_START'));
 $('voiceRecordStop')?.addEventListener('click',()=>record('VOICE_RECORD_STOP'));
 $('logoutBtn')?.addEventListener('click',()=>{if(valid())record('SESSION_END')},{capture:true});
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden'&&valid())record('SESSION_END')});
 startLoops();studentChanged();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
