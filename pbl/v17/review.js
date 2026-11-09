/* PBL LMS V17: educator review/feedback/revision + student portfolio.
   Read P6 records only after an authenticated Admin/Student bridge.
   Strictly fake data on public Pages. Do not use innerHTML for user content. */
(() => {
 'use strict';
 const $=id=>document.getElementById(id);
 if(!$('v17ReviewPanel')||!$('v17StudentReview'))return;
 const bridge=()=>window.PBLV17Bridge;
 const el={
  list:$('v17ReviewList'),source:$('v17ReviewSource'),updated:$('v17ReviewUpdated'),
  metrics:$('v17ReviewMetrics'),refresh:$('v17ReviewRefresh'),
  room:$('v17ReviewRoom'),type:$('v17ReviewType'),status:$('v17ReviewStatus'),query:$('v17ReviewSearch'),
  reviewer:$('v17Reviewer'),heading:$('v17ReviewSelectedTitle'),meta:$('v17ReviewSelectedMeta'),
  submission:$('v17SubmissionText'),decision:$('v17Decision'),feedback:$('v17FeedbackText'),
  rubric:$('v17RubricInputs'),form:$('v17ReviewForm'),send:$('v17SendFeedback'),
  history:$('v17ReviewHistory'),
  student:$('v17StudentReview'),studentBadge:$('v17StudentBadge'),
  studentGuide:$('v17StudentGuidance'),studentComment:$('v17StudentComment'),
  studentCommentText:$('v17StudentCommentText'),studentCommentMeta:$('v17StudentCommentMeta'),
  studentRubric:$('v17StudentRubric'),studentFocus:$('v17FocusRevision'),
  portfolio:$('v17Portfolio')
 };
 const criteria=[
  ['language','การสื่อสารภาษาอังกฤษ'],
  ['inquiry','การสืบค้นและใช้หลักฐาน'],
  ['collaboration','การทำงานร่วมกัน'],
  ['reflection','การสะท้อนและพัฒนางาน']
 ];
 const levels=['ยังไม่ประเมิน','เริ่มต้น','กำลังพัฒนา','บรรลุเป้าหมาย','ก้าวหน้าเด่นชัด'];
 const labels={PENDING:'รอครูตรวจ',NEEDS_REVISION:'ปรับปรุงแล้วส่งใหม่',APPROVED:'ตรวจรับแล้ว'};
 const allowed=['6.1','6.2','6.3'];
 let snapshot=null,selected=null,loadToken=0,studentToken=0,studentReviews=[],busy=false;
 const make=(tag,label,cls)=>{
  const node=document.createElement(tag);node.textContent=String(label??'');
  if(cls)node.className=cls;return node;
 };
 const iso=s=>{
  if(!s)return 'ไม่พบเวลา';
  const d=new Date(s);
  return isNaN(+d)?'ไม่พบเวลา':d.toLocaleString('th-TH',{dateStyle:'medium',timeStyle:'short',timeZone:'Asia/Bangkok'});
 };
 const normal=s=>String(s||'').normalize('NFC').trim().toLocaleLowerCase('th');
 const rating=v=>levels[Number.isInteger(v)&&v>=0&&v<=4?v:0];
 function safeSnapshot(data){
  if(!data||!['DEMO','LIVE'].includes(data.source)||!Array.isArray(data.items)||data.items.length>5000)
   throw Error('ไม่สามารถอ่านรายการงานที่ส่งได้');
  return {...data,items:data.items.filter(x=>x&&allowed.includes(String(x.classId))&&
   /^((USER:)|(GROUP:))/.test(String(x.ownerKey))&&Number.isInteger(x.step)&&x.step>=1&&x.step<=20)};
 }
 function statusColor(status){
  return status==='APPROVED'?'approved':status==='NEEDS_REVISION'?'revise':'pending';
 }
 function metric(label,value){
  const x=document.createElement('div');x.className='v17-review-metric';
  x.append(make('small',label),make('strong',value));return x;
 }
 function setMetrics(){
  el.metrics.replaceChildren();const rows=snapshot?.items||[];
  [['ส่งงานเข้าระบบ',rows.length],['รอตรวจ',rows.filter(x=>x.status==='PENDING').length],
   ['ส่งกลับปรับปรุง',rows.filter(x=>x.status==='NEEDS_REVISION').length],
   ['ตรวจรับแล้ว',rows.filter(x=>x.status==='APPROVED').length]]
   .forEach(([k,v])=>el.metrics.append(metric(k,v)));
 }
 function filtered(){
  const q=normal(el.query.value),r=el.room.value,t=el.type.value,st=el.status.value;
  return (snapshot?.items||[]).filter(x=>
    (!r||x.classId===r)&&(!t||x.mode===t)&&(!st||x.status===st)&&
    (!q||normal(x.name).includes(q)||String(x.step).includes(q))
  );
 }
 function empty(message){
  el.list.replaceChildren();el.list.append(make('p',message,'v17-empty'));
 }
 function renderQueue(){
  if(!snapshot){empty('รอโหลดข้อมูลที่ส่ง');return}
  el.list.replaceChildren();
  const rows=filtered();
  if(!rows.length){empty('ไม่พบงานที่ตรงกับตัวกรอง');return}
  const fragment=document.createDocumentFragment();
  rows.forEach(item=>{
   const entry=document.createElement('button');entry.type='button';entry.className='v17-review-item';
   entry.setAttribute('aria-label','ตรวจขั้นที่ '+item.step+' '+item.name);
   entry.dataset.active=selected?.ownerKey===item.ownerKey&&selected?.step===item.step?'true':'false';
   const title=document.createElement('div');title.className='v17-review-item-title';
   title.append(make('strong',item.name),make('span','ขั้น '+String(item.step).padStart(2,'0')));
   const detail=make('small','ป.'+item.classId+' · '+(item.mode==='individual'?'รายบุคคล':'กลุ่ม')+' · รุ่นงาน '+item.revision);
   const bottom=document.createElement('div');bottom.className='v17-review-item-bottom';
   const badge=make('span',labels[item.status]||'รอตรวจ','v17-review-badge');
   badge.dataset.status=statusColor(item.status);
   bottom.append(badge,make('time',iso(item.submittedAt)));
   entry.append(title,detail,bottom);
   entry.addEventListener('click',()=>selectItem(item));
   fragment.append(entry);
  });
  el.list.append(fragment);
 }
 function setupRubric(){
  el.rubric.replaceChildren();
  criteria.forEach(([key,title])=>{
   const label=document.createElement('label');label.textContent=title;
   const sel=document.createElement('select');sel.dataset.key=key;
   for(let n=0;n<=4;n++){
    const option=document.createElement('option');option.value=String(n);
    option.textContent=n+' · '+levels[n];sel.append(option);
   }
   label.append(sel);el.rubric.append(label);
  });
 }
 function showHistory(item){
  el.history.replaceChildren();
  const h=make('h4','ประวัติข้อเสนอแนะของงานขั้นนี้');el.history.append(h);
  const records=Array.isArray(item.history)?item.history.slice(-8):[];
  if(!records.length){el.history.append(make('p','ยังไม่มีการตรวจงานขั้นนี้'));return}
  records.forEach(r=>{
   const entry=document.createElement('article');entry.className='v17-history-item';
   entry.append(make('strong','รุ่นงาน '+r.revision+' · '+(labels[r.status]||r.status)));
   entry.append(make('small','ตรวจเมื่อ '+iso(r.reviewedAt)));
   entry.append(make('p',r.feedback));
   el.history.append(entry);
  });
 }
 function selectItem(item){
  selected={ownerKey:item.ownerKey,step:item.step};
  renderQueue();el.reviewer.hidden=false;
  el.heading.textContent='ขั้น '+String(item.step).padStart(2,'0')+' · '+item.name;
  el.meta.textContent='ป.'+item.classId+' · '+(item.mode==='individual'?'งานรายบุคคล':'งานกลุ่ม')+
   ' · ส่งรุ่นที่ '+item.revision+' · '+iso(item.submittedAt);
  el.submission.textContent=item.note||'ไม่มีข้อความบันทึก';
  el.feedback.value='';el.decision.value='NEEDS_REVISION';
  for(const x of el.rubric.querySelectorAll('select'))x.value='0';
  const blocked=item.status!=='PENDING'||(snapshot.source==='LIVE'&&snapshot.reviewSchema!=='READY');
  el.send.disabled=blocked;el.feedback.disabled=blocked;el.decision.disabled=blocked;
  for(const x of el.rubric.querySelectorAll('select'))x.disabled=blocked;
  if(blocked){
   el.send.textContent=snapshot.source==='LIVE'&&snapshot.reviewSchema!=='READY'?'รออนุมัติระบบบันทึกการตรวจ':'งานรุ่นนี้ตรวจแล้ว';
  }else{
   el.send.textContent='บันทึกและส่งข้อเสนอแนะ';
   el.feedback.focus({preventScroll:true});
  }
  showHistory(item);
 }
 async function loadQueue(){
  if(!bridge()?.isAdmin?.())return;
  const ticket=++loadToken;busy=true;el.refresh.disabled=true;
  el.source.textContent='กำลังตรวจสอบข้อมูล…';el.updated.textContent='';
  empty('กำลังโหลดงานเพื่อให้ครูตรวจ');
  try{
   const response=safeSnapshot(await bridge().reviewQueue());
   if(ticket!==loadToken||!bridge()?.isAdmin?.())return;
   snapshot=response;
   el.source.textContent=response.source==='DEMO'?'ตัวอย่างเพื่อทดลองระบบ':'รายการส่งงานจากฐานโรงเรียน';
   el.source.dataset.source=response.source;
   el.updated.textContent='ข้อมูล ณ '+iso(response.generatedAt);
   setMetrics();renderQueue();
   if(selected){
    const current=response.items.find(x=>x.ownerKey===selected.ownerKey&&x.step===selected.step);
    if(current)selectItem(current);else{selected=null;el.reviewer.hidden=true}
   }
  }catch(e){
   if(ticket!==loadToken)return;
   snapshot=null;selected=null;el.reviewer.hidden=true;el.source.textContent='ไม่สามารถโหลดงาน';
   empty(String(e?.message||'เกิดข้อผิดพลาด'));
  }finally{if(ticket===loadToken){busy=false;el.refresh.disabled=false}}
 }
 async function submitReview(event){
  event.preventDefault();
  if(busy||!bridge()?.isAdmin?.()||!selected||!snapshot)return;
  const item=snapshot.items.find(x=>x.ownerKey===selected.ownerKey&&x.step===selected.step);
  if(!item||item.status!=='PENDING')return;
  const rubric=Object.fromEntries([...el.rubric.querySelectorAll('select')].map(x=>[x.dataset.key,Number(x.value)]));
  const payload={ownerKey:item.ownerKey,step:item.step,revision:item.revision,
   status:el.decision.value,feedback:el.feedback.value.trim(),rubric};
  if(payload.feedback.length<5){el.feedback.focus();return}
  busy=true;el.send.disabled=true;el.send.textContent='กำลังส่งข้อเสนอแนะ…';
  try{
   await bridge().saveReview(payload);await loadQueue();
  }catch(e){
   el.send.disabled=false;el.send.textContent='ส่งข้อเสนอแนะอีกครั้ง';
   const msg=make('p',String(e?.message||'บันทึกไม่สำเร็จ'),'v17-review-error');
   el.history.prepend(msg);
  }finally{busy=false}
 }
 function clearTeacher(){
  ++loadToken;snapshot=null;selected=null;busy=false;el.reviewer.hidden=true;
  el.feedback.value='';el.submission.textContent='';
  el.rubric.querySelectorAll('select').forEach(x=>{x.value='0';x.disabled=false});
  el.history.replaceChildren();el.metrics.replaceChildren();el.room.value='';el.query.value='';
  el.type.value='';el.status.value='';
  el.source.textContent='รอเปิดแท็บตรวจงาน';el.source.dataset.source='';el.updated.textContent='';
  empty('เปิดแท็บนี้เพื่อแสดงงานที่นักเรียนส่ง');
 }
 function currentStep(){
  const n=bridge()?.currentStep?.();
  return Number.isInteger(n)&&n>=1&&n<=20?n:1;
 }
 function makePortfolio(){
  el.portfolio.replaceChildren();
  const studentSteps=bridge()?.studentSteps?.()||[];
  const byStep=new Map(studentSteps.map(x=>[Number(x.step),x]));
  const own=new Set([1,2,9,13,20]);
  const latest=studentReviews.reduce((map,r)=>{
   const key=Number(r.step),old=map.get(key);
   if(!old||r.revision>old.revision)map.set(key,r);
   return map;
  },new Map());
  for(let n=1;n<=20;n++){
   const info=byStep.get(n),review=latest.get(n);
   const btn=document.createElement('button');btn.type='button';
   btn.className='v17-portfolio-step';
   const complete=Boolean(info?.done);
   btn.dataset.state=review?.status==='NEEDS_REVISION'?'revise':
    review?.status==='APPROVED'?'approved':complete?'submitted':'open';
   btn.append(make('strong',String(n).padStart(2,'0')));
   btn.append(make('span',own.has(n)?'ของฉัน':'กลุ่ม'));
   btn.title='ขั้น '+n+' · '+(review?.status?labels[review.status]:complete?'ส่งงานแล้ว':'ยังไม่ส่ง');
   btn.setAttribute('aria-label',btn.title);
   btn.addEventListener('click',()=>{
    const steps=$('stepList')?.querySelectorAll('button');
    const target=steps?.[n-1];if(target&&!target.disabled)target.click();
   });
   el.portfolio.append(btn);
  }
 }
 function showStudentStep(){
  if(!bridge()?.isStudent?.())return;
  const n=currentStep(),current=bridge().studentSteps().find(x=>Number(x.step)===n);
  const history=studentReviews.filter(r=>Number(r.step)===n);
  const last=history.sort((a,b)=>a.revision-b.revision).at(-1);
  const revision=Number(current?.revision||0);
  el.studentComment.hidden=true;el.studentRubric.hidden=true;el.studentFocus.hidden=true;
  el.studentBadge.dataset.status='pending';
  if(!last){
   el.studentBadge.textContent=revision>0?'ส่งงานแล้ว · รอครูตรวจ':'เริ่มกิจกรรม';
   el.studentGuide.textContent=revision>0?'ส่งงานแล้ว เมื่อครูตรวจจะพบข้อเสนอแนะที่นี่':'ทำงานในขั้นนี้แล้วกดบันทึกเมื่อพร้อม';
  }else if(revision>Number(last.revision)){
   el.studentBadge.textContent='แก้ไขและส่งใหม่แล้ว';el.studentBadge.dataset.status='pending';
   el.studentGuide.textContent='ส่งงานรุ่นใหม่แล้ว กำลังรอครูตรวจอีกครั้ง';
   el.studentComment.hidden=false;el.studentCommentText.textContent=last.feedback;
   el.studentCommentMeta.textContent='ข้อเสนอแนะครั้งก่อน · รุ่น '+last.revision+' · '+iso(last.reviewedAt);
  }else{
   el.studentBadge.dataset.status=statusColor(last.status);
   el.studentBadge.textContent=labels[last.status]||'ครูตรวจแล้ว';
   el.studentGuide.textContent=last.status==='NEEDS_REVISION'?
    'อ่านข้อเสนอแนะ แล้วแก้ไขงานในช่องบันทึกเพื่อส่งรุ่นใหม่':'ครูตรวจรับงานตามหลักฐานขั้นนี้แล้ว';
   el.studentComment.hidden=false;el.studentCommentText.textContent=last.feedback;
   el.studentCommentMeta.textContent='รุ่นงาน '+last.revision+' · '+iso(last.reviewedAt);
   el.studentFocus.hidden=last.status!=='NEEDS_REVISION';
  }
  if(last?.rubric&&Object.values(last.rubric).some(x=>Number(x)>0)){
   el.studentRubric.hidden=false;el.studentRubric.replaceChildren();
   criteria.forEach(([key,label])=>{
    if(Number(last.rubric[key])>0){
     const item=document.createElement('p');
     item.append(make('strong',label+': '),make('span',rating(last.rubric[key])));
     el.studentRubric.append(item);
    }
   });
  }
  makePortfolio();
 }
 async function loadStudent(){
  if(!bridge()?.isStudent?.())return;
  const ticket=++studentToken;el.studentBadge.textContent='กำลังโหลดข้อเสนอแนะ';
  try{
   const data=await bridge().studentFeedback();
   if(ticket!==studentToken||!bridge()?.isStudent?.())return;
   studentReviews=Array.isArray(data.reviews)?data.reviews.filter(x=>x.step>=1&&x.step<=20).slice(-100):[];
  }catch(e){
   if(ticket!==studentToken)return;
   studentReviews=[];el.studentBadge.textContent='ยังโหลดข้อเสนอแนะไม่ได้';
  }
  showStudentStep();
 }
 function clearStudent(){
  ++studentToken;studentReviews=[];el.studentBadge.textContent='รอข้อมูล';el.studentBadge.dataset.status='';
  el.studentGuide.textContent='ครูจะให้ข้อเสนอแนะหลังจากส่งกิจกรรม';
  el.studentComment.hidden=true;el.studentCommentText.textContent='';el.studentCommentMeta.textContent='';
  el.studentRubric.hidden=true;el.studentRubric.replaceChildren();
  el.portfolio.replaceChildren();el.studentFocus.hidden=true;
 }
 function init(){
  setupRubric();
  const tab=$('v14AdminTab4');
  if(tab)tab.addEventListener('click',loadQueue);
  el.refresh.addEventListener('click',loadQueue);
  [el.room,el.type,el.status].forEach(x=>x.addEventListener('change',renderQueue));
  el.query.addEventListener('input',renderQueue);
  el.form.addEventListener('submit',submitReview);
  el.studentFocus.addEventListener('click',()=>{const note=$('taskNote');if(!note.disabled)note.focus({preventScroll:true})});
  const admin=$('adminScreen'),student=$('studentScreen');
  if(admin)new MutationObserver(()=>{if(admin.hidden)clearTeacher()})
    .observe(admin,{attributes:true,attributeFilter:['hidden']});
  if(student)new MutationObserver(()=>{if(student.hidden)clearStudent();else loadStudent()})
    .observe(student,{attributes:true,attributeFilter:['hidden']});
  const title=$('taskCounter');
  if(title)new MutationObserver(()=>{if(student&&!student.hidden)showStudentStep()})
    .observe(title,{childList:true,characterData:true,subtree:true});
  const help=$('taskHelp');
  if(help)new MutationObserver(()=>{
    if(student&&!student.hidden&&/บันทึก.*(สำเร็จ|แล้ว)/.test(help.textContent))loadStudent();
  }).observe(help,{childList:true,characterData:true,subtree:true});
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
 else init();
})();
