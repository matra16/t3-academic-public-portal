/* PBL LMS V16.2 — read-only teacher progress analytics and A4 printing.
   All evidence comes from the Admin-authorised existing work table or from
   explicitly marked fictional demo records. Completion ≠ grade or mastery. */
(() => {
'use strict';
const $=id=>document.getElementById(id);
if(!$('v162ProgressPanel'))return;
const bridge=()=>window.PBLV162Bridge;
const source=$('v162Source'),updated=$('v162Updated'),kpis=$('v162KPIs');
const scope=$('v162Scope'),room=$('v162Class'),query=$('v162Query');
const table=$('v162ProgressTable'),details=$('v162Details'),printBtn=$('v162Print');
const refreshBtn=$('v162Refresh');
let snapshot=null,loading=false,serial=0,selected=null,printRoot=null;
const ownSteps=[1,2,9,13,20];
const safe=x=>String(x===undefined||x===null?'':x);
const norm=x=>safe(x).normalize('NFC').replace(/\s+/g,' ').trim().toLocaleLowerCase('th');
const percent=(done,total)=>total>0?Math.max(0,Math.min(100,Math.round(100*done/total))):0;
const formatDate=s=>{
 if(!s)return 'ยังไม่มีบันทึก';
 const d=new Date(s);return isNaN(d.getTime())?'ไม่ทราบเวลา':d.toLocaleString('th-TH',{dateStyle:'medium',timeStyle:'short',timeZone:'Asia/Bangkok'});
};
function txt(tag,value,cls){
 const el=document.createElement(tag);el.textContent=safe(value);if(cls)el.className=cls;return el;
}
function button(label,cls,callback){
 const b=txt('button',label,cls);b.type='button';b.addEventListener('click',callback);return b;
}
function blank(message){
 table.replaceChildren();table.append(txt('p',message,'v162-empty'));
 details.replaceChildren();details.hidden=true;
}
function validate(input){
 if(!input||!['LIVE','DEMO'].includes(input.source)||input.measure!=='COMPLETED_WORK_NOT_GRADES')throw Error('รูปแบบข้อมูลความก้าวหน้าไม่ถูกต้อง');
 if(!Array.isArray(input.students)||!Array.isArray(input.groups)||input.students.length>300||input.groups.length>100)throw Error('จำนวนข้อมูลไม่อยู่ในขอบเขตที่รองรับ');
 const students=input.students.filter(x=>x&&['6.1','6.2','6.3'].includes(safe(x.classId))&&safe(x.uid));
 const groups=input.groups.filter(x=>x&&['6.1','6.2','6.3'].includes(safe(x.classId))&&safe(x.id));
 return {...input,students,groups};
}
function displayed(){
 if(!snapshot)return [];
 const records=scope.value==='group'?snapshot.groups:snapshot.students;
 const q=norm(query.value),c=room.value;
 return records.filter(x=>(!c||x.classId===c)&&(!q||
  norm(x.name).includes(q)||norm(x.groupName).includes(q)||
  (scope.value==='group'&&(x.members||[]).some(m=>norm(m.name).includes(q)))))
 .sort((a,b)=>a.classId.localeCompare(b.classId)||safe(a.name).localeCompare(safe(b.name),'th'));
}
function makeBar(done,total){
 const holder=document.createElement('div');holder.className='v162-stat';
 const caption=document.createElement('div');caption.append(txt('strong',safe(done)+' / '+safe(total)),txt('small',' ('+percent(done,total)+'%)'));
 const track=document.createElement('span');track.className='v162-progress-track';
 track.setAttribute('role','progressbar');track.setAttribute('aria-valuenow',safe(done));
 track.setAttribute('aria-valuemin','0');track.setAttribute('aria-valuemax',safe(total));
 const fill=document.createElement('span');fill.className='v162-progress-fill';
 fill.style.width=percent(done,total)+'%';track.append(fill);holder.append(caption,track);
 return holder;
}
function setSummary(){
 kpis.replaceChildren();
 if(!snapshot)return;
 const c=room.value;
 const users=snapshot.students.filter(x=>!c||x.classId===c);
 const teams=snapshot.groups.filter(x=>!c||x.classId===c);
 const personal=users.reduce((sum,x)=>sum+(Number(x.individual?.done)||0),0);
 const shared=teams.reduce((sum,x)=>sum+(Number(x.shared?.done)||0),0);
 const values=[
  ['นักเรียนในระบบ',users.length,'เฉพาะ ป.6'],
  ['กลุ่มโครงงาน',teams.length,'กลุ่มที่จัดแล้ว'],
  ['งานรายบุคคลเสร็จ',personal+' / '+users.length*5,'นับคนละ 5 ขั้น'],
  ['งานกลุ่มเสร็จ',shared+' / '+teams.length*15,'นับกลุ่มละ 15 ขั้น']
 ];
 values.forEach(([label,value,note])=>{
  const card=document.createElement('div');card.className='v162-kpi';
  card.append(txt('small',label),txt('strong',value),txt('em',note));kpis.append(card);
 });
}
function statusOf(u,isGroup){
 const n=Number(isGroup?u.shared?.done:u.overall?.done)||0;
 const max=isGroup?15:20;
 return n===0?'ยังไม่มีงานที่เสร็จ':n>=max?'บันทึกงานครบตามขั้น':'กำลังดำเนินการ';
}
function renderTable(){
 if(!snapshot){blank('ยังไม่มีข้อมูลสำหรับรายงาน');printBtn.disabled=true;return}
 const records=displayed(),isGroup=scope.value==='group';
 setSummary();
 printBtn.disabled=records.length===0;
 table.replaceChildren();
 if(!records.length){blank('ไม่พบข้อมูลที่ตรงกับเงื่อนไข');return}
 const t=document.createElement('table');t.className='v162-table';
 const widths=isGroup?['25%','11%','10%','22%','20%','12%']:['26%','11%','22%','21%','12%','8%'];
 const headings=isGroup?
  ['ชื่อกลุ่ม','ห้อง','สมาชิก','งานกลุ่ม (15 ขั้น)','งานรายบุคคลของสมาชิก','รายละเอียด']:
  ['นักเรียน','ห้อง','งานรายบุคคล (5 ขั้น)','งานกลุ่ม (15 ขั้น)','รวม (20 ขั้น)','รายละเอียด'];
 const cg=document.createElement('colgroup');
 widths.forEach(width=>{const col=document.createElement('col');col.style.width=width;cg.append(col)});
 t.append(cg);
 const thead=document.createElement('thead'),throw=document.createElement('tr');
 headings.forEach(label=>throw.append(txt('th',label)));thead.append(throw);t.append(thead);
 const body=document.createElement('tbody');
 records.forEach(u=>{
  const tr=document.createElement('tr');
  const first=document.createElement('td');first.append(txt('span',u.name,'v162-name'),txt('span',statusOf(u,isGroup),'v162-sub'));tr.append(first);
  tr.append(txt('td','ป.'+u.classId));
  if(isGroup){
   tr.append(txt('td',u.memberCount));
   const groupProgress=document.createElement('td');groupProgress.append(makeBar(u.shared?.done||0,15));tr.append(groupProgress);
   const indiv=document.createElement('td');indiv.append(makeBar(u.memberIndividual?.done||0,u.memberIndividual?.total||0));tr.append(indiv);
  }else{
   const ind=document.createElement('td');ind.append(makeBar(u.individual?.done||0,5));tr.append(ind);
   const g=document.createElement('td');g.append(makeBar(u.shared?.done||0,15));tr.append(g);
   const full=document.createElement('td');full.append(makeBar(u.overall?.done||0,20));tr.append(full);
  }
  const action=document.createElement('td');
  action.append(button('ดู 20 ขั้น','v162-detail-btn',()=>showDetail(u,isGroup)));
  tr.append(action);body.append(tr);
 });
 t.append(body);table.append(t);
 if(selected){
  const found=records.find(x=>(isGroup?x.id:x.uid)===selected.id);
  if(found)showDetail(found,isGroup);else{selected=null;details.hidden=true;details.replaceChildren()}
 }
}
function showDetail(row,isGroup){
 selected={kind:isGroup?'group':'individual',id:isGroup?row.id:row.uid};
 details.replaceChildren();details.hidden=false;
 const head=document.createElement('div');head.className='v162-details-head';
 const h=txt('h3',(isGroup?'กลุ่ม ':'นักเรียน ')+row.name+' · ป.'+row.classId);
 head.append(h,button('พิมพ์เฉพาะรายการนี้','v162-secondary',()=>preparePrint(row)));
 details.append(head);
 const groupText=isGroup?'งานร่วมกลุ่ม: '+(row.shared?.done||0)+'/15 ขั้น · งานรายบุคคลของสมาชิก: '+(row.memberIndividual?.done||0)+'/'+(row.memberIndividual?.total||0):
  'งานรายบุคคล: '+(row.individual?.done||0)+'/5 · งานกลุ่ม: '+(row.shared?.done||0)+'/15 · รวมบันทึกเสร็จ '+(row.overall?.done||0)+'/20';
 details.append(txt('p',groupText));
 details.append(txt('p','อัปเดตล่าสุด: '+formatDate(row.lastUpdated)));
 const stepGrid=document.createElement('div');stepGrid.className='v162-step-grid';
 (row.steps||[]).forEach(step=>{
  const el=txt('span',String(step.step).padStart(2,'0'),'v162-step');
  el.dataset.done=step.done?'true':'false';
  el.title='ขั้นที่ '+step.step+' · '+(step.mode==='individual'?'รายบุคคล':'กลุ่ม')+' · '+(step.done?'บันทึกงานแล้ว':'ยังไม่มีงานที่เสร็จ');
  stepGrid.append(el);
 });
 details.append(stepGrid);
 if(isGroup){
  details.append(txt('p','รายละเอียดรายสมาชิก — แสดงเฉพาะจำนวนงานรายบุคคลที่บันทึกเสร็จ ไม่ใช้แทนคะแนนภาษาของแต่ละคน'));
  const ul=document.createElement('ul');ul.className='v162-member-list';
  (row.members||[]).forEach(m=>ul.append(txt('li',m.name+' · '+m.individualDone+'/'+m.individualTotal+' ขั้น')));
  details.append(ul);
 }else{
  details.append(txt('p','ช่องสีมิ้นต์คือมีบันทึกงานสำเร็จ; สีกรมท่าคือยังไม่มีบันทึก สำเร็จงานกลุ่มไม่ได้หมายถึงนักเรียนทุกคนมีผลสัมฤทธิ์เท่ากัน'));
 }
}
async function load(){
 const b=bridge();
 if(!b?.canView?.())return;
 const seq=++serial;loading=true;refreshBtn.disabled=true;
 source.textContent='กำลังอ่านหลักฐานจากระบบ…';source.dataset.source='';
 updated.textContent='';printBtn.disabled=true;
 blank('กำลังโหลดผลการเรียนรู้…');
 try{
  const data=validate(await b.progress());
  if(seq!==serial||!b.canView())return;
  snapshot=data;selected=null;
  source.textContent=data.source==='DEMO'?'ข้อมูลสมมติเพื่อทดลอง':'ข้อมูลการส่งงานจากระบบ';
  source.dataset.source=data.source;
  updated.textContent='สถานะข้อมูล ณ '+formatDate(data.generatedAt);
  renderTable();
 }catch(e){
  if(seq!==serial)return;
  snapshot=null;selected=null;source.textContent='ยังไม่สามารถอ่านข้อมูล';
  updated.textContent='';
  blank('ไม่สามารถแสดงรายงานได้: '+safe(e?.message||'โปรดลองใหม่'));
 }finally{if(seq===serial){loading=false;refreshBtn.disabled=false}}
}
function clearPrivate(){
 ++serial;snapshot=null;selected=null;loading=false;refreshBtn.disabled=false;
 source.textContent='รอเปิดหน้าติดตามการเรียน';source.dataset.source='';updated.textContent='';
 kpis.replaceChildren();query.value='';room.value='';scope.value='individual';
 blank('เลือกแท็บติดตามการเรียนเพื่อแสดงข้อมูล');
 printBtn.disabled=true;
 if(printRoot)printRoot.replaceChildren();
 document.body.classList.remove('v162-print');
}
function printTableCell(row,value){row.append(txt('td',value))}
function renderPrint(rowOnly){
 const demo=snapshot.source==='DEMO';
 const selectedRows=rowOnly?[rowOnly]:displayed();
 const group=scope.value==='group'&&!rowOnly||Boolean(rowOnly&&'memberCount' in rowOnly);
 const root=document.createElement('section');root.id='v162PrintRoot';
 const head=document.createElement('header');head.className='v162-report-head';
 head.append(txt('small','โรงเรียนเทศบาล ๓ (วัดท่ามะปราง) · กลุ่มบริหารงานวิชาการ'));
 head.append(txt('h1','รายงานติดตามความก้าวหน้าการเรียนรู้แบบโครงงานภาษาอังกฤษ'));
 head.append(txt('small','ระดับชั้นประถมศึกษาปีที่ 6 · '+(group?'รายกลุ่ม':'รายบุคคล')+
  ' · '+(room.value?'ห้อง ป.'+room.value:'ทุกห้อง')+' · วันที่พิมพ์ '+formatDate(new Date().toISOString())));
 root.append(head);
 if(demo)root.append(txt('div','ตัวอย่างเพื่อทดสอบระบบ — ข้อมูลสมมติ ไม่ใช่ผลการเรียนจริง','v162-report-demo'));
 const stats=document.createElement('div');stats.className='v162-report-summary';
 const doneSum=selectedRows.reduce((sum,u)=>sum+(group?u.shared?.done||0:u.overall?.done||0),0);
 for(const [key,val] of [
  ['จำนวน'+(group?'กลุ่ม':'นักเรียน'),String(selectedRows.length)],
  ['งานที่บันทึกเสร็จ',doneSum+' ขั้น'],
  ['ขั้นทั้งหมดตามขอบเขต',selectedRows.length*(group?15:20)+' ขั้น']
 ]){
  const box=document.createElement('div');box.className='v162-report-stat';
  box.append(txt('span',key),txt('strong',val));stats.append(box);
 }
 root.append(stats);
 const table=document.createElement('table');
 const trHead=document.createElement('tr');
 const cols=group?['ลำดับ','กลุ่ม','ห้อง','จำนวนสมาชิก','งานกลุ่ม (15)','รายบุคคลของสมาชิก']:
  ['ลำดับ','นักเรียน','ห้อง','รายบุคคล (5)','งานกลุ่ม (15)','รวมงาน (20)'];
 cols.forEach(c=>trHead.append(txt('th',c)));
 const th=document.createElement('thead');th.append(trHead);table.append(th);
 const tbody=document.createElement('tbody');
 selectedRows.forEach((item,i)=>{
  const row=document.createElement('tr');printTableCell(row,i+1);
  printTableCell(row,item.name);printTableCell(row,'ป.'+item.classId);
  if(group){
   printTableCell(row,item.memberCount);
   printTableCell(row,item.shared?.done+'/15');
   printTableCell(row,(item.memberIndividual?.done||0)+'/'+(item.memberIndividual?.total||0));
  }else{
   printTableCell(row,(item.individual?.done||0)+'/5');
   printTableCell(row,(item.shared?.done||0)+'/15');
   printTableCell(row,(item.overall?.done||0)+'/20');
  }
  tbody.append(row);
 });
 table.append(tbody);root.append(table);
 if(rowOnly){
  root.append(txt('h2','รายละเอียดสถานะกิจกรรมตามลำดับ','v162-report-subtitle'));
  const steps=document.createElement('div');steps.className='v162-report-step';
  const arr=(rowOnly.steps||[]).map(s=>'ขั้น '+String(s.step).padStart(2,'0')+
   ' ('+(s.mode==='individual'?'รายบุคคล':'กลุ่ม')+') '+
   (s.done?'✓ บันทึกเสร็จ':'– ยังไม่มีบันทึก'));
  steps.textContent=arr.join('  •  ');root.append(steps);
  if(group){
   root.append(txt('h2','การบันทึกงานรายบุคคลของสมาชิก','v162-report-subtitle'));
   const memberTable=document.createElement('table'),mh=document.createElement('tr');
   ['ชื่อสมาชิก','งานรายบุคคลที่เสร็จ','จำนวนขั้นทั้งหมด'].forEach(x=>mh.append(txt('th',x)));
   const mt=document.createElement('thead');mt.append(mh);memberTable.append(mt);
   const mb=document.createElement('tbody');
   (rowOnly.members||[]).forEach(m=>{
    const tr=document.createElement('tr');
    printTableCell(tr,m.name);printTableCell(tr,m.individualDone);printTableCell(tr,m.individualTotal);
    mb.append(tr);
   });memberTable.append(mb);root.append(memberTable);
  }
 }
 root.append(txt('p','คำอธิบาย: จำนวนขั้นที่เสร็จคำนวณจากบันทึกกิจกรรมในระบบเท่านั้น ไม่ใช่คะแนน ความถูกต้องของภาษาอังกฤษ หรือการรับรองสมรรถนะรายบุคคล ผลงานกลุ่มเป็นหลักฐานระดับกลุ่ม ผู้สอนต้องตรวจประเมินรายบุคคลแยกต่างหาก','v162-report-note'));
 root.append(txt('p','แหล่งข้อมูล: '+(demo?'บัญชีและงานจำลองเพื่อทดสอบ':'บันทึกงานจากระบบ LMS ของโรงเรียนที่ผู้ดูแลมีสิทธิ์อ่าน')+
  ' · สถานะข้อมูล ณ '+formatDate(snapshot.generatedAt),'v162-report-note'));
 const signatures=document.createElement('div');signatures.className='v162-report-signatures';
 signatures.append(txt('span','ผู้จัดทำรายงาน'),txt('span','ผู้ตรวจสอบ'));root.append(signatures);
 root.append(txt('p','© 2569 พัฒนาโดย Mr.Matra Yodchan','v162-report-foot'));
 return root;
}
function preparePrint(rowOnly=null){
 if(!bridge()?.canView?.()||!snapshot||loading)return;
 const filtered=rowOnly?[rowOnly]:displayed();if(!filtered.length)return;
 if(snapshot.source==='LIVE'&&!window.confirm('รายงานนี้อาจมีข้อมูลนักเรียนส่วนบุคคล ยืนยันพิมพ์หรือบันทึก PDF ในพื้นที่ที่ได้รับอนุญาต?'))return;
 if(printRoot)printRoot.remove();
 printRoot=renderPrint(rowOnly);
 document.body.append(printRoot);
 document.body.classList.add('v162-print');
 // Native print dialog supports A4 and Save as PDF without external services.
 try{window.print()}catch(e){document.body.classList.remove('v162-print')}
}
window.addEventListener('afterprint',()=>{
 document.body.classList.remove('v162-print');
 if(printRoot){printRoot.replaceChildren();printRoot.remove();printRoot=null}
});
for(const el of [scope,room])el.addEventListener('change',()=>{selected=null;renderTable()});
query.addEventListener('input',()=>{selected=null;renderTable()});
refreshBtn.addEventListener('click',load);
printBtn.addEventListener('click',()=>preparePrint(null));
function init(){
 const tab=$('v14AdminTab3');
 if(tab)tab.addEventListener('click',()=>{if(bridge()?.canView?.())load()});
 const screen=$('adminScreen');
 if(screen)new MutationObserver(()=>{
  if(screen.hidden)clearPrivate();
 }).observe(screen,{attributes:true,attributeFilter:['hidden']});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
else init();
})();
