/* PBL V16 — source-backed, admin-only bulk enrolment selection.
   UI derived from documented LMS design patterns (Moodle cohorts, Canvas SIS import,
   Open edX batch enrolment). Does not access school roster without verified owner setup. */
(() => {
 'use strict';
 const $=id=>document.getElementById(id);
 const box=$('v16RosterImport');
 if(!box)return;
 const bridge=()=>window.PBLV16Bridge;
 const classFilter=$('v16SourceClass'),search=$('v16SourceSearch'),
  list=$('v16SourceList'),state=$('v16SourceState'),
  status=$('v16EnrolHelp'),selectAll=$('v16SelectAll'),clear=$('v16ClearSelection'),
  count=$('v16SelectionCount'),submit=$('v16EnrollStudents'),results=$('v16ImportResults');
 const selected=new Set();
 let all=[],loaded=false,generation=0,busy=false,preview=false;
 let secretsTimer=0;
 const norm=x=>String(x||'').normalize('NFC').replace(/\s+/g,' ').trim().toLocaleLowerCase('th');
 const safe=x=>String(x||'');
 const p6=cls=>['6.1','6.2','6.3'].includes(safe(cls));
 function clearResults(){
  if(secretsTimer){clearTimeout(secretsTimer);secretsTimer=0}
  results.replaceChildren();results.hidden=true;
 }
 function setState(label,kind=''){
  state.textContent=label;
  state.dataset.kind=kind;
 }
 function showMessage(msg,type=''){
  status.textContent=msg;status.dataset.kind=type;
 }
 function eligible(u){
  return u&&!u.alreadyEnrolled&&p6(u.classId)&&u.sourceId&&u.name;
 }
 function filtered(){
  const text=norm(search.value),room=classFilter.value;
  return all.filter(u=>(!room||u.classId===room)&&(!text||norm(u.name).includes(text)||norm(u.sourceId).includes(text)));
 }
 function updateControls(){
  const pool=all.filter(eligible);
  const permissible=new Set(pool.map(u=>u.sourceId));
  for(const id of selected)if(!permissible.has(id))selected.delete(id);
  count.textContent='เลือก '+selected.size+' คน';
  submit.textContent='นำเข้าระบบเรียนรู้โครงงาน ('+selected.size+' คน)';
  submit.disabled=busy||!loaded||selected.size===0;
  selectAll.disabled=busy||!loaded||!filtered().some(eligible);
  clear.disabled=busy||selected.size===0;
 }
 function render(){
  list.replaceChildren();
  if(!loaded){
   const p=document.createElement('p');p.className='v16-empty';p.textContent='กำลังตรวจสอบทะเบียนรายชื่อ…';list.append(p);
   updateControls();return;
  }
  const entries=filtered();
  if(!entries.length){
   const p=document.createElement('p');p.className='v16-empty';
   p.textContent=all.length?'ไม่พบชื่อที่ตรงกับคำค้นหา':'ยังไม่มีรายชื่อนักเรียนจากทะเบียนที่ได้รับอนุมัติ';
   list.append(p);updateControls();return;
  }
  const fragment=document.createDocumentFragment();
  entries.forEach(u=>{
   if(!p6(u.classId))return;
   const label=document.createElement('label');label.className='v16-learner'+(u.alreadyEnrolled?' v16-existing':'');
   const cb=document.createElement('input');cb.type='checkbox';cb.value=u.sourceId;
   cb.checked=selected.has(u.sourceId);cb.disabled=u.alreadyEnrolled||busy;
   cb.setAttribute('aria-label','เลือก '+u.name+' ป.'+u.classId);
   cb.addEventListener('change',()=>{
    if(cb.checked)selected.add(u.sourceId);
    else selected.delete(u.sourceId);
    updateControls();
   });
   const name=document.createElement('span');name.className='v16-person';
   const title=document.createElement('strong');title.textContent=u.name;
   const meta=document.createElement('small');meta.textContent='ป.'+u.classId;
   name.append(title,meta);
   const badge=document.createElement('span');badge.className='v16-learner-status';
   badge.textContent=u.alreadyEnrolled?'อยู่ในระบบแล้ว':'พร้อมนำเข้า';
   label.append(cb,name,badge);fragment.append(label);
  });
  list.append(fragment);
  updateControls();
 }
 async function refresh(){
  const api=bridge();
  if(!api?.adminVisible?.())return;
  const ticket=++generation;
  busy=true;loaded=false;setState('กำลังโหลดรายชื่อ');showMessage('ตรวจสอบทะเบียนที่โรงเรียนรับรอง');
  render();
  try{
   const r=await api.list();
   if(ticket!==generation)return;
   preview=Boolean(r.preview||r.status==='DEMO'||api.isPreview());
   all=Array.isArray(r.candidates)?r.candidates.filter(u=>p6(u.classId)).slice(0,300)
    .map(u=>({sourceId:safe(u.sourceId),name:safe(u.name),classId:safe(u.classId),
     alreadyEnrolled:Boolean(u.alreadyEnrolled)})):[];
   all.sort((a,b)=>a.classId.localeCompare(b.classId)||a.name.localeCompare(b.name,'th'));
   loaded=true;
   if(r.status==='NOT_CONFIGURED'){
    setState('ยังไม่เชื่อมทะเบียนจริง','warning');
    showMessage('ต้องตรวจแหล่งทะเบียนรายชื่อนักเรียน ป.6 ที่โรงเรียนรับรองก่อนนำเข้าบัญชีจริง','warning');
   }else if(preview){
    setState('ข้อมูลสมมติ','preview');
    showMessage('ตัวอย่างการเลือกหลายชื่อและนำเข้าระบบ — ไม่มีการบันทึกนักเรียนจริง');
   }else{
    setState('ทะเบียนโรงเรียน','ready');
    showMessage('เลือกหลายชื่อได้ครั้งละไม่เกิน 30 คน ระบบตรวจและข้ามบัญชีที่มีแล้ว');
   }
   busy=false;render();
  }catch(e){
   if(ticket!==generation)return;
   busy=false;loaded=true;all=[];
   setState('ไม่สามารถโหลดรายชื่อ','warning');
   showMessage('ไม่สามารถอ่านทะเบียนได้: '+String(e?.message||'กรุณาตรวจสิทธิ์'), 'warning');
   render();
  }
 }
 function addText(el,s){const p=document.createElement('p');p.textContent=s;el.append(p)}
 function renderResult(result){
  clearResults();results.hidden=false;
  const created=Array.isArray(result.created)?result.created:[];
  const skipped=Array.isArray(result.skipped)?result.skipped:[];
  const failed=Array.isArray(result.failed)?result.failed:[];
  const title=document.createElement('h4');title.textContent='ผลการนำเข้าระบบ';results.append(title);
  addText(results,'นำเข้าใหม่ '+created.length+' คน · ข้ามรายการซ้ำ '+skipped.length+' คน · ไม่สำเร็จ '+failed.length+' คน');
  if(result.preview)addText(results,'ผลการทดลองเท่านั้น ไม่มีข้อมูลนักเรียนจริงถูกแก้ไข');
  const group=(label,records)=>{
   if(!records.length)return;
   const details=document.createElement('details');
   const summary=document.createElement('summary');summary.textContent=label+' ('+records.length+')';details.append(summary);
   const ul=document.createElement('ul');
   records.forEach(u=>{
    const li=document.createElement('li');
    li.textContent=safe(u.name||u.sourceId)+' · ป.'+safe(u.classId||'')+(u.reason?' · '+safe(u.reason):'');
    if(u.temporaryPassword&&!result.preview){
     // One-time reveal after real protected server enrolment. Never persisted.
     const secret=document.createElement('code');secret.textContent=' รหัสชั่วคราว: '+u.temporaryPassword;li.append(secret);
    }
    ul.append(li);
   });
   details.append(ul);results.append(details);
  };
  group('บัญชีใหม่',created);group('มีแล้ว',skipped);group('ตรวจสอบเพิ่ม',failed);
  const dismiss=document.createElement('button');dismiss.type='button';dismiss.className='v16-minibtn';
  dismiss.textContent='ปิดผลลัพธ์และลบรหัสจากหน้าจอ';
  dismiss.addEventListener('click',clearResults);
  results.append(dismiss);
  // Do not leave temporary passwords visible indefinitely.
  if(created.some(x=>x.temporaryPassword))secretsTimer=setTimeout(clearResults,60000);
  try{results.focus({preventScroll:true})}catch(e){}
 }
 function selectVisible(){
  let n=selected.size;
  for(const u of filtered()){
   if(!eligible(u)||selected.has(u.sourceId))continue;
   if(n>=30)break;selected.add(u.sourceId);n++;
  }
  render();
  if(n===30)showMessage('เลือกได้สูงสุด 30 คนต่อครั้ง');
 }
 async function submitImport(){
  const api=bridge();
  if(!loaded||busy||!api?.adminVisible?.())return;
  const ids=[...selected];
  if(!ids.length)return;
  if(ids.length>30){showMessage('เลือกได้ครั้งละไม่เกิน 30 คน','warning');return}
  const candidates=ids.map(id=>all.find(x=>x.sourceId===id));
  if(candidates.some(u=>!eligible(u))){
   showMessage('พบรายชื่อที่ไม่พร้อมนำเข้า กรุณาตรวจสอบใหม่','warning');return
  }
  if(!window.confirm('ยืนยันนำเข้านักเรียน '+ids.length+' คนเข้าสู่ห้องเรียนโครงงาน?\nข้อมูลทะเบียนต้นทางจะไม่ถูกลบหรือย้ายออก')){
    return;
  }
  busy=true;updateControls();clearResults();
  showMessage('กำลังตรวจสอบและนำเข้าบัญชี…');
  try{
   const r=await api.enroll(ids);
   selected.clear();
   renderResult(r);
   // Refresh source list and account roster after a batch; no bulk overwrite.
   await refresh();
   showMessage('ดำเนินการเสร็จแล้ว กรุณาตรวจผลการนำเข้าด้านล่าง','success');
  }catch(e){
   showMessage('ไม่สามารถนำเข้าได้: '+String(e?.message||'กรุณาลองใหม่'),'warning');
  }finally{busy=false;updateControls()}
 }
 classFilter.addEventListener('change',render);
 search.addEventListener('input',render);
 selectAll.addEventListener('click',selectVisible);
 clear.addEventListener('click',()=>{selected.clear();render()});
 submit.addEventListener('click',submitImport);
 // When the Admin screen is closed, clear all roster data and one-time secrets in RAM/UI.
 const screen=$('adminScreen');
 if(screen)new MutationObserver(()=>{
  if(screen.hidden){
   ++generation;all=[];selected.clear();loaded=false;clearResults();list.replaceChildren();
   search.value='';classFilter.value='';setState('เลือกทะเบียนรายชื่อ');
  }else refresh();
 }).observe(screen,{attributes:true,attributeFilter:['hidden']});

 // Full dark mode is tied to the authenticated Admin workspace, never to student UI.
 let adminPasswordContext=false;
 const adminScreen=$('adminScreen'),passwordScreen=$('passwordScreen');
 const welcome=$('welcome'),studentScreen=$('studentScreen');
 const adminForm=$('adminLogin');
 if(adminForm)adminForm.addEventListener('submit',()=>{adminPasswordContext=true},true);
 const changeAdmin=$('changeAdminPass');
 if(changeAdmin)changeAdmin.addEventListener('click',()=>{adminPasswordContext=true});
 function syncAdminTheme(){
  if((welcome&&!welcome.hidden)||(studentScreen&&!studentScreen.hidden))adminPasswordContext=false;
  if(adminScreen&&!adminScreen.hidden)adminPasswordContext=true;
  const isAdmin=Boolean((adminScreen&&!adminScreen.hidden)||
    (passwordScreen&&!passwordScreen.hidden&&adminPasswordContext));
  document.body.classList.toggle('v16-admin-dark',isAdmin);
 }
 const appearance=new MutationObserver(syncAdminTheme);
 [adminScreen,passwordScreen,welcome,studentScreen].filter(Boolean)
  .forEach(x=>appearance.observe(x,{attributes:true,attributeFilter:['hidden']}));
 syncAdminTheme();
 window.PBLV16Admin=Object.freeze({refresh});
})();
