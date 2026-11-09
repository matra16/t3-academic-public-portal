(() => {
'use strict';
const $=id=>document.getElementById(id);
const backend=Boolean(window.google&&window.google.script&&window.google.script.run);
const SESSION_KEY='PBL_V16_SESSION_ONLY';
const STEPS=[
 ['Project Entry · เริ่มต้นโครงงาน','Who is our audience? What do visitors want to know?','Our visitors want to know…','ดูตัวอย่างที่ใช้ได้ตามสิทธิ์ แล้วระบุผู้ชมและคำถามที่ต้องรู้ 3 ข้อ'],
 ['Challenge & Criteria · โจทย์และเกณฑ์','How can we help visitors understand our place?','We will create a video that…','กำหนดคำถามขับเคลื่อน ผู้ชม และเกณฑ์ความสำเร็จ'],
 ['Team Formation · เตรียมจัดทีม','How can everyone participate?','Everyone can contribute by…','ครูเป็นผู้กำหนดสมาชิกกลุ่ม นักเรียนวางแผนการมีส่วนร่วม'],
 ['Role Rotation · หมุนเวียนบทบาท','What role can I try today?','My role is…','สำรวจหน้าที่ผู้ค้นข้อมูล ผู้เขียนบท ผู้นำเสนอ และผู้ทำสื่อ'],
 ['Project Planning · วางแผนงาน','What should we do first, next and last?','First, we will… Next, we will…','กำหนดงานย่อย ความรับผิดชอบ และจุดตรวจงาน'],
 ['Site Selection · เลือกสถานที่','Why is this place useful for visitors?','This place is important because…','เลือกสถานที่ตัวอย่าง และตรวจข้อจำกัดความปลอดภัย/สิทธิ์'],
 ['Inquiry & Research · สืบค้น','Where is it? What happens here?','It is located… It is used for…','รวบรวมข้อมูลจากแหล่งที่เชื่อถือได้'],
 ['Fact Checking · ตรวจสอบข้อเท็จจริง','Can you check this fact with another source?','According to our sources…','ตรวจข้อมูลจากสองแหล่ง หรือแหล่งหลักและผู้ดูแลพื้นที่'],
 ['English Input · ฝึกภาษา','How can you introduce this place politely?','Welcome to… Let me show you…','ฝึกศัพท์ การบอกทิศทาง การถามตอบและการออกเสียงรายบุคคล'],
 ['Scriptwriting · เขียนบท','What do visitors need to hear in each scene?','In this scene, we will say…','จัดลำดับบทพูด 6 ฉาก เขียนร่างที่ใช้ข้อมูลยืนยันแล้ว'],
 ['Storyboard · วาดลำดับภาพ','What will the camera show in scene three?','In scene three, we show…','วาด Storyboard 6 ช่อง พร้อมภาพ เสียง และบทที่เกี่ยวข้อง'],
 ['Production Planning · เตรียมถ่าย','May we record here?','May we record at this place?','ทำรายการภาพและเสียง เตรียมอุปกรณ์ และตรวจสิทธิ์ก่อนถ่าย'],
 ['Speaking Rehearsal · ซ้อมพูด','Can you explain this without reading your script?','Let me explain…','ฝึกพูดตอบคำถามใหม่ด้วยตัวเอง ไม่ท่องบทอย่างเดียว'],
 ['Filming & Audio · ถ่ายทำ','Can visitors hear and understand us?','Please speak slowly and clearly.','ถ่ายเฉพาะสถานที่/บุคคลที่ได้รับอนุญาต และตรวจเสียงตัวอย่าง'],
 ['File Management · จัดไฟล์','Which scene is this file for?','This is scene… version…','ตั้งชื่อด้วยรหัสงาน ไม่ใส่ชื่อเด็ก แยก RAW/EDIT/FINAL'],
 ['Editing · ตัดต่อ','Does each scene help the audience?','This scene explains…','เรียงหกฉาก ใส่เสียง/ข้อความที่อ่านได้ ตรวจสิทธิ์สื่อประกอบ'],
 ['Critique & Feedback · รับข้อเสนอแนะ','What could make our video clearer?','We could improve…','ใช้เกณฑ์สะท้อนข้อดีและสิ่งที่ควรแก้'],
 ['Revision · ปรับปรุง','What did we change after the feedback?','We revised… because…','แก้บท/เสียง/ภาพตามข้อเสนอแนะ แล้วจดเวอร์ชัน'],
 ['Audience & Review · นำเสนอ','How does our video help its viewers?','Our video helps visitors…','จัดชมเฉพาะผู้มีสิทธิ์และได้รับอนุมัติ'],
 ['Reflection · สะท้อนคิด','What did I learn and contribute?','I learned… I contributed by…','สะท้อนรายบุคคลและกลุ่ม สรุปทักษะที่ฝึกและสิ่งที่ควรพัฒนา']
];
const individualSteps=[1,2,9,13,20];
const p6Classes=['6.1','6.2','6.3'];
const S={token:'',role:'',dashboard:null,admin:null,step:1,preview:false,selected:null};
const status=(message,type='')=>{const b=$('banner');b.hidden=type!=='error';if(!b.hidden){b.textContent='ไม่สามารถเปิดระบบได้ในขณะนี้';b.className='banner error'}};
let toastTimer;
function notify(message){const el=$('toast');el.textContent=message;el.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>{el.hidden=true;},6200)}
const value=id=>$(id).value.trim();
const hide=()=>{['welcome','passwordScreen','studentScreen','adminScreen'].forEach(id=>$(id).hidden=true)};
const show=id=>{closeAdminDialog();hide();$(id).hidden=false;scrollTo({top:0,behavior:'instant'})};
function api(action,data={}) {
 if(!backend)return Promise.reject(Error('ยังไม่ได้เชื่อมระบบตรวจสอบสิทธิ์ของโรงเรียน'));
 return new Promise((resolve,reject)=>{
  window.google.script.run.withSuccessHandler(r=>r&&r.ok?resolve(r.data):reject(Error(r&&r.error||'ระบบไม่พร้อมใช้งาน')))
  .withFailureHandler(()=>reject(Error('ไม่สามารถติดต่อระบบโรงเรียนได้'))).apiV12({action,data,token:S.token});
 });
}
function updateToken(token) {
 S.token=String(token||'');
 try{if(token)sessionStorage.setItem(SESSION_KEY,S.token);else sessionStorage.removeItem(SESSION_KEY)}catch(e){/* shared device may restrict storage */}
}

/* Root-level modal keeps the Admin panel visible even when the landing card
   is tall or the user is on a short mobile screen. */
let adminBackdrop=null;
let adminPreviousFocus=null;
function installAdminDialog(){
  const panel=$('adminAccess');
  if(!panel)return;
  const wrap=document.createElement('div');
  wrap.id='adminBackdrop';
  wrap.className='admin-backdrop';
  wrap.hidden=true;
  wrap.setAttribute('aria-label','หน้าต่างผู้ดูแลระบบ');
  document.body.append(wrap);
  wrap.append(panel);
  panel.hidden=true;
  adminBackdrop=wrap;
  wrap.addEventListener('click',e=>{
    if(e.target===wrap)closeAdminDialog();
  });
  document.addEventListener('keydown',e=>{
    if(!adminBackdrop||adminBackdrop.hidden)return;
    if(e.key==='Escape'){e.preventDefault();closeAdminDialog();return}
    if(e.key!=='Tab')return;
    const items=Array.from(panel.querySelectorAll('button:not([disabled]),input:not([disabled]):not([type=hidden]),select:not([disabled]),a[href]'))
      .filter(n=>n.getClientRects().length>0&&!n.closest('[hidden]'));
    if(!items.length)return;
    const first=items[0],last=items[items.length-1];
    if(e.shiftKey && document.activeElement===first){e.preventDefault();last.focus()}
    else if(!e.shiftKey && document.activeElement===last){e.preventDefault();first.focus()}
  });
}
function openAdminDialog(){
 if(!adminBackdrop)return;
 adminPreviousFocus=document.activeElement;
 $('adminAccess').hidden=false;
 adminBackdrop.hidden=false;
 document.body.classList.add('admin-dialog-open','admin-theme-dark');
 $('adminEntry').setAttribute('aria-expanded','true');
 const target=backend ? $('adminPassword') : $('adminUser');
 if(target&&!target.disabled)target.focus();else $('closeAdmin').focus();
}
function closeAdminDialog(){
 if(!adminBackdrop||adminBackdrop.hidden)return;
 adminBackdrop.hidden=true;
 $('adminAccess').hidden=true;
 document.body.classList.remove('admin-dialog-open','admin-theme-dark');
 $('adminEntry').setAttribute('aria-expanded','false');
 if(adminPreviousFocus&&adminPreviousFocus.isConnected&&typeof adminPreviousFocus.focus==='function')adminPreviousFocus.focus();
 adminPreviousFocus=null;
}
const sampleUsers=[{uid:'DEMO01',name:'นักเรียนตัวอย่าง 1',classId:'6.1'},{uid:'DEMO02',name:'นักเรียนตัวอย่าง 2',classId:'6.2'},{uid:'DEMO03',name:'นักเรียนตัวอย่าง 3',classId:'6.3'}];
let searchTicket=0,searchTimer=0;
const searchCache=new Map(); // nonpersistent ephemeral results
const normalized=s=>String(s||'').normalize('NFC').replace(/[\u200B-\u200D\uFEFF]/g,'').replace(/\s+/g,' ').trim().toLocaleLowerCase('th');
const matchName=p=>normalized(p.name);
function sortedResults(people,query){
 const needle=normalized(query),used=new Set();
 return (people||[]).filter(p=>p?.uid&&p?.name&&p6Classes.includes(String(p.classId)))
 .filter(p=>{const id=String(p.uid);if(used.has(id)||!matchName(p).includes(needle))return false;used.add(id);return true})
 .sort((a,b)=>{
  const rank=x=>matchName(x).startsWith(needle)?0:matchName(x).split(' ').some(t=>t.startsWith(needle))?1:2;
  return rank(a)-rank(b)||matchName(a).localeCompare(matchName(b),'th')||String(a.classId).localeCompare(String(b.classId));
 }).slice(0,8);
}

function fillSelect(sel,items,placeholder){
 const v=sel.value;sel.replaceChildren();const blank=document.createElement('option');
 blank.value='';blank.textContent=placeholder;sel.append(blank);
 items.forEach(s=>{const o=document.createElement('option');o.value=String(s);o.textContent=String(s);sel.append(o)});
 if(items.includes(v))sel.value=v;
}
function fillClasses(items){
 items=(items||[]).filter(s=>p6Classes.includes(s));
 ['studentClass','addClass','groupClass','rosterFilter'].forEach(id=>fillSelect($(id),items,id==='rosterFilter'?'ทุกห้อง':'เลือกห้อง'));
}
function previewLessons(){
 S.preview=true;S.role='STUDENT';S.dashboard={user:{uid:'DEMO0',name:'ผู้เรียนตัวอย่าง',classId:'6.3',mustChange:false},group:{id:'G-DEMO',name:'กลุ่มโครงงานตัวอย่าง',members:4},steps:[{step:1,mode:'individual',done:true,revision:1},{step:3,mode:'group',done:true,revision:1},{step:4,mode:'group',done:true,revision:2}],individualSteps};
 S.step=1;renderStudent();$('logoutBtn').hidden=false;show('studentScreen');
}
const PBLV16_DEMO_SOURCE=[
 {sourceId:'P6-SAMPLE-001',name:'นักเรียนสาธิต 01',classId:'6.1'},
 {sourceId:'P6-SAMPLE-002',name:'นักเรียนสาธิต 02',classId:'6.1'},
 {sourceId:'P6-SAMPLE-003',name:'นักเรียนสาธิต 03',classId:'6.1'},
 {sourceId:'P6-SAMPLE-004',name:'นักเรียนสาธิต 04',classId:'6.1'},
 {sourceId:'P6-SAMPLE-005',name:'นักเรียนสาธิต 05',classId:'6.2'},
 {sourceId:'P6-SAMPLE-006',name:'นักเรียนสาธิต 06',classId:'6.2'},
 {sourceId:'P6-SAMPLE-007',name:'นักเรียนสาธิต 07',classId:'6.3'},
 {sourceId:'P6-SAMPLE-008',name:'นักเรียนสาธิต 08',classId:'6.3'}
];
const v16DemoEnrolled=new Set();
function v16PreviewCandidates(){
 return {status:'DEMO',candidates:PBLV16_DEMO_SOURCE.map(x=>({
  ...x,alreadyEnrolled:v16DemoEnrolled.has(x.sourceId)
 }))};
}
async function v16RosterCandidates(){
 if(S.role!=='ADMIN'||!S.admin)throw Error('กรุณาเข้าระบบผู้ดูแลก่อน');
 if(S.preview)return v16PreviewCandidates();
 return api('adminRosterCandidates');
}
async function v16EnrollBatch(ids){
 if(S.role!=='ADMIN'||!S.admin)throw Error('ไม่มีสิทธิ์ผู้ดูแลระบบ');
 if(!Array.isArray(ids)||ids.length===0||ids.length>30||new Set(ids).size!==ids.length)
  throw Error('เลือกนักเรียน 1–30 คน โดยไม่เลือกรายการซ้ำ');
 if(S.preview){
  const created=[],skipped=[];
  ids.forEach(id=>{
   const source=PBLV16_DEMO_SOURCE.find(x=>x.sourceId===id);
   if(!source||!p6Classes.includes(source.classId))throw Error('พบรายการที่ไม่ถูกต้อง');
   if(v16DemoEnrolled.has(id)){
    skipped.push({sourceId:id,name:source.name,classId:source.classId,reason:'เพิ่มแล้ว'});return
   }
   v16DemoEnrolled.add(id);
   const uid='DEMO-ENROLLED-'+id;
   S.admin.users.push({uid,name:source.name,classId:source.classId,active:true,mustChange:true});
   created.push({sourceId:id,uid,name:source.name,classId:source.classId});
  });
  renderRoster();renderMembers();
  return {preview:true,created,skipped,failed:[],status:'DEMO'};
 }
 const res=await api('adminEnrollBatch',{sourceIds:ids});
 // No passwords/tokens are put in localStorage, console, or public roster.
 await reloadAdmin();
 return res;
}
window.PBLV16Bridge=Object.freeze({
 list:v16RosterCandidates,enroll:v16EnrollBatch,
 isPreview:()=>Boolean(S.preview),
 adminVisible:()=>Boolean(S.role==='ADMIN'&&S.admin)
});


const PBLV162_INDIVIDUAL=[1,2,9,13,20];
const PBLV162_GROUP_STEPS=Array.from({length:20},(_,i)=>i+1)
 .filter(step=>!PBLV162_INDIVIDUAL.includes(step));
function v162PreviewProgress(){
 const demo=S.admin||{users:[],groups:[]};
 const groups=(demo.groups||[]).filter(g=>p6Classes.includes(String(g.classId)));
 const now=new Date().toISOString();
 const completedIndividual=new Map([
  ['DEMO0',[1,2]],['DEMO1',[1]],['DEMO2',[1,2]],['DEMO3',[]],['DEMO4',[1]]
 ]);
 const completedGroup=new Map([['G-DEMO',[3,4,5,6]]]);
 const memberRows=(demo.users||[]).filter(u=>p6Classes.includes(String(u.classId))).map(u=>{
  const group=groups.find(g=>g.classId===u.classId&&(g.memberIds||[]).includes(u.uid));
  const individual=completedIndividual.get(u.uid)||[];
  const shared=group?(completedGroup.get(group.id)||[]):[];
  const steps=Array.from({length:20},(_,i)=>{
   const step=i+1,personal=PBLV162_INDIVIDUAL.includes(step);
   const done=personal?individual.includes(step):shared.includes(step);
   return {step,mode:personal?'individual':'group',done,
    revision:done?1:0,updatedAt:done?now:''};
  });
  return {uid:u.uid,name:u.name,classId:u.classId,active:!!u.active,
   groupId:group?.id||'',groupName:group?.name||'',
   individual:{done:individual.length,total:5},
   shared:{done:shared.length,total:15},overall:{done:individual.length+shared.length,total:20},
   lastUpdated:steps.some(x=>x.done)?now:'',steps};
 });
 const groupRows=groups.map(g=>{
  const shared=completedGroup.get(g.id)||[];
  const members=memberRows.filter(u=>(g.memberIds||[]).includes(u.uid));
  return {id:g.id,name:g.name,classId:g.classId,memberIds:members.map(u=>u.uid),
   memberCount:members.length,shared:{done:shared.length,total:15},
   memberIndividual:{done:members.reduce((sum,u)=>sum+u.individual.done,0),total:members.length*5},
   members:members.map(u=>({uid:u.uid,name:u.name,individualDone:u.individual.done,individualTotal:5})),
   lastUpdated:shared.length?now:'',
   steps:PBLV162_GROUP_STEPS.map(step=>({step,mode:'group',
    done:shared.includes(step),revision:shared.includes(step)?1:0,updatedAt:shared.includes(step)?now:''}))};
 });
 return {source:'DEMO',generatedAt:now,projectId:'VLOG20',individualSteps:PBLV162_INDIVIDUAL.slice(),
  groupSteps:PBLV162_GROUP_STEPS.slice(),students:memberRows,groups:groupRows,
  measure:'COMPLETED_WORK_NOT_GRADES'};
}
async function v162Progress(){
 if(S.role!=='ADMIN'||!S.admin)throw Error('ไม่มีสิทธิ์ผู้ดูแลระบบ');
 return S.preview?v162PreviewProgress():api('adminProgress');
}
window.PBLV162Bridge=Object.freeze({
 progress:v162Progress,
 canView:()=>Boolean(S.role==='ADMIN'&&S.admin),
 isPreview:()=>Boolean(S.preview)
});


/* V17 bridge: closed school backend vs fictional demonstration.
 * Student can only read own feedback. Admin can review role-scoped work.
 * Never persist fake pupil data or comments outside this browser session.
 */
const V17_DEMO_SUBMISSIONS=[
 {ownerKey:'USER:DEMO0',step:1,mode:'individual',revision:1,
  classId:'6.3',name:'นักเรียนตัวอย่าง 1',groupId:'',
  note:'Our visitors want to know about the local community and its history.',
  submittedAt:'2026-11-08T08:30:00Z'},
 {ownerKey:'USER:DEMO1',step:2,mode:'individual',revision:1,
  classId:'6.3',name:'นักเรียนตัวอย่าง 2',groupId:'',
  note:'We will create a short English video about our school community.',
  submittedAt:'2026-11-08T08:35:00Z'},
 {ownerKey:'GROUP:G-DEMO',step:3,mode:'group',revision:1,
  classId:'6.3',name:'กลุ่มตัวอย่าง',groupId:'G-DEMO',
  note:'We will share the roles of researcher, writer, speaker and video editor.',
  submittedAt:'2026-11-08T08:45:00Z'},
 {ownerKey:'GROUP:G-DEMO',step:4,mode:'group',revision:2,
  classId:'6.3',name:'กลุ่มตัวอย่าง',groupId:'G-DEMO',
  note:'We will rotate roles so that every member can speak English.',
  submittedAt:'2026-11-08T09:30:00Z'}
];
const v17DemoReviews=[
 {ownerKey:'GROUP:G-DEMO',step:4,revision:1,status:'NEEDS_REVISION',
  feedback:'เพิ่มแผนการหมุนเวียนบทบาทและการฝึกพูดของสมาชิกแต่ละคน',
  rubric:{language:0,inquiry:0,collaboration:2,reflection:0},reviewedAt:'2026-11-08T09:00:00Z',
  reviewer:'ครูผู้สอนตัวอย่าง'}
];
function v17DemoQueue(){
 const now=new Date().toISOString();
 return {source:'DEMO',generatedAt:now,reviewSchema:'DEMO',
  items:V17_DEMO_SUBMISSIONS.map(work=>{
   const history=v17DemoReviews.filter(r=>r.ownerKey===work.ownerKey&&r.step===work.step)
     .sort((a,b)=>a.revision-b.revision);
   const current=history.filter(r=>r.revision===work.revision).at(-1)||null;
   return {...work,status:current?.status||'PENDING',
    review:current?{...current}:null,history:history.map(r=>({...r}))};
  })};
}
async function v17ReviewQueue(){
 if(S.role!=='ADMIN'||!S.admin)throw Error('เฉพาะผู้ดูแลระบบ');
 if(S.preview)return v17DemoQueue();
 return api('adminReviewQueue');
}
async function v17SaveReview(payload){
 if(S.role!=='ADMIN'||!S.admin)throw Error('เฉพาะผู้ดูแลระบบ');
 if(!['APPROVED','NEEDS_REVISION'].includes(payload?.status))throw Error('สถานะไม่ถูกต้อง');
 if(!Number.isInteger(payload?.step)||payload.step<1||payload.step>20)throw Error('ขั้นไม่ถูกต้อง');
 const note=String(payload.feedback||'').trim();
 if(note.length<5||note.length>1200)throw Error('ข้อเสนอแนะต้องยาว 5–1200 ตัวอักษร');
 const rubric=payload.rubric||{};
 if(['language','inquiry','collaboration','reflection'].some(k=>!Number.isInteger(rubric[k])||rubric[k]<0||rubric[k]>4))
  throw Error('ค่าระดับ Rubric ไม่ถูกต้อง');
 if(S.preview){
  const work=V17_DEMO_SUBMISSIONS.find(x=>x.ownerKey===payload.ownerKey&&x.step===payload.step&&x.revision===payload.revision);
  if(!work)throw Error('งานถูกเปลี่ยนแปลง กรุณาโหลดใหม่');
  if(v17DemoReviews.some(x=>x.ownerKey===payload.ownerKey&&x.step===payload.step&&x.revision===payload.revision))
   throw Error('งานรุ่นนี้ตรวจแล้ว กรุณาเลือกงานที่ยังรอตรวจ');
  const result={ownerKey:payload.ownerKey,step:payload.step,revision:payload.revision,
    status:payload.status,feedback:note,rubric,reviewedAt:new Date().toISOString(),reviewer:'ผู้ดูแลตัวอย่าง'};
  v17DemoReviews.push(result);return {source:'DEMO',review:result};
 }
 return api('adminReviewStep',{ownerKey:payload.ownerKey,step:payload.step,revision:payload.revision,
  status:payload.status,feedback:note,rubric});
}
async function v17StudentFeedback(){
 if(S.role!=='STUDENT'||!S.dashboard)throw Error('ต้องเข้าสู่ระบบนักเรียน');
 if(S.preview){
  const u=S.dashboard.user?.uid;
  const group=S.dashboard.group?.id;
  return {source:'DEMO',reviews:v17DemoReviews.filter(r=>r.ownerKey==='USER:'+u||(group&&r.ownerKey==='GROUP:'+group))
    .map(r=>({...r}))};
 }
 return api('studentReviews');
}
window.PBLV17Bridge=Object.freeze({
 reviewQueue:v17ReviewQueue,
 saveReview:v17SaveReview,
 studentFeedback:v17StudentFeedback,
 isAdmin:()=>Boolean(S.role==='ADMIN'&&S.admin),
 isStudent:()=>Boolean(S.role==='STUDENT'&&S.dashboard),
 isDemo:()=>Boolean(S.preview),
 studentSteps:()=>S.role==='STUDENT'&&S.dashboard?(S.dashboard.steps||[]).map(x=>({...x})):[],
 currentStep:()=>S.role==='STUDENT'?S.step:0,
 lessonTitles:()=>STEPS.map(x=>x[0])
});


/* PBL V18 Vlog coaching adapter. Public demo is local, fictional and not GenAI;
   live flows require the existing server-authorised GAS RPC and owner gates. */
const PBL18_DEMO_THREADS=new Map(),PBL18_DEMO_EVENTS=[],PBL18_DEMO_SESSIONS=new Map();
let PBL18_DEMO_SEQ=0;
const PBL18_PLACE={
 school:{label:'โรงเรียน',opening:'Welcome to our school.',check:'ชื่อจุดสำคัญและการอนุญาตใช้ภาพในโรงเรียน'},
 temple:{label:'วัด',opening:'This temple is important to our community.',check:'การขออนุญาตผู้ดูแลวัด กติกาสถานที่ และแหล่งข้อมูลประวัติ'},
 market:{label:'ตลาด',opening:'Welcome to our local market.',check:'ความยินยอมของผู้ค้า ราคาและข้อมูลที่ตรวจสอบแล้ว'},
 community:{label:'ชุมชน',opening:'This is an important place in our community.',check:'สิทธิ์การบันทึกภาพบุคคล ความปลอดภัยและแหล่งข้อมูล'},
 other:{label:'สถานที่',opening:'Let me show you this place.',check:'แหล่งข้อมูลที่ตรวจสอบได้ สิทธิ์และความปลอดภัย'}
};
const PBL18_BLOCK_PII=/(\b\d{9,13}\b|(?:\+?66|0)[689]\d{8}\b|[\w.+-]+@[\w.-]+\.[a-z]{2,})/i;
function v18Context(step,place){
 const p=PBL18_PLACE[place]||PBL18_PLACE.other;
 return {p,title:STEPS[step-1]?.[0]||'PBL',prompt:STEPS[step-1]?.[1]||''};
}
function v18GuidedCoach(message,step,place){
 const ctx=v18Context(step,place),m=String(message||'').toLowerCase();
 if(PBL18_BLOCK_PII.test(message)||/password|รหัสผ่าน|เลขบัตร|เบอร์โทร|ที่อยู่บ้าน/i.test(m))
  return {text:'เพื่อความปลอดภัย ไม่ต้องส่งข้อมูลส่วนตัวของตัวเองหรือคนอื่นให้ผู้ช่วยนะครับ ลองเปลี่ยนเป็นรหัสกลุ่มหรือชื่อสถานที่ทั่วไป แล้วถามใหม่ได้เลย',kind:'SAFETY',language:'th'};
 const prefix='กำลังทำขั้น '+step+' — '+ctx.title.split(' · ')[0]+' • '+ctx.p.label+'\n';
 if(/บทพูด|script|ภาษาอังกฤษ|ตรวจบท|english|grammar|ประโยค|translate|พูด/.test(m)){
  return {text:prefix+'ประโยคเริ่มต้นที่ปรับใช้ได้: “'+ctx.p.opening+'”\n1) ลองเขียนด้วยตัวเองอีก 2 ประโยคว่าอยู่ที่ไหนและผู้ชมจะเห็นอะไร\n2) อ่านให้เพื่อนฟัง แล้วถามว่าเข้าใจจุดสำคัญหรือไม่\n3) สิ่งที่ไม่แน่ใจให้ตรวจจากแหล่งข้อมูล อย่าแต่งข้อมูลสถานที่ขึ้นเอง\nคำถามต่อไป: Which place or feature would you like to show first?',kind:'LANGUAGE_SCAFFOLD',language:'th'};
 }
 if(/ฉาก|storyboard|video|vlog|วิดีโอ|ถ่าย|camera|ตัดต่อ|scenes/.test(m)){
  return {text:prefix+'ลองแบ่ง Vlog เป็น 6 ฉาก: 1) แนะนำผู้ชมและสถานที่ 2) สถานที่อยู่ตรงไหน 3) จุดเด่นแรก 4) จุดเด่นที่สอง 5) ข้อควรรู้หรือมารยาท 6) สรุปและกล่าวขอบคุณ\nแต่ละฉากให้สมาชิกเลือกภาพจริงหนึ่งมุมและประโยคอังกฤษหนึ่งประโยค พร้อมตรวจสิทธิ์การถ่ายทำ\nคำถาม: ใครจะพูดในฉากที่ 3 และจะใช้หลักฐานจากแหล่งใด?',kind:'STORYBOARD',language:'th'};
 }
 if(/ปลอดภัย|permission|consent|อนุญาต|เด็ก|บุคคล|ถ่ายคน|วัด|โรงเรียน/.test(m)){
  return {text:prefix+'จุดตรวจความปลอดภัย: '+ctx.p.check+'\nถามผู้รับผิดชอบสถานที่ก่อนถ่าย หลีกเลี่ยงถ่ายเด็กหรือผู้ที่ไม่ได้ยินยอม ไม่เปิดเผยชื่อ–ที่อยู่–เบอร์โทร และให้ครูอนุมัติก่อนเผยแพร่วิดีโอ\nคำถาม: ทีมของเราจะถ่ายเฉพาะสิ่งใดได้โดยไม่กระทบความเป็นส่วนตัว?',kind:'SAFETY',language:'th'};
 }
 if(/ข้อมูล|แหล่ง|research|fact|จริง|ประวัติ|สืบค้น|อ้างอิง/.test(m)){
  return {text:prefix+'ตั้งคำถามค้นคว้า 3 ข้อ: 1) สถานที่นี้สำคัญต่อคนในชุมชนอย่างไร 2) ข้อมูลนั้นมาจากใครหรือเอกสารใด 3) ตรวจซ้ำด้วยอีกแหล่งได้หรือไม่\nบันทึกชื่อแหล่งข้อมูล วันที่ และข้อจำกัด ก่อนใช้เป็นคำบรรยาย Vlog\nคำถาม: ตอนนี้เรามีหลักฐานข้อใดที่ตรวจสอบซ้ำได้แล้ว?',kind:'INQUIRY',language:'th'};
 }
 if(/กลุ่ม|สมาชิก|หน้าที่|แบ่งงาน|team|role|ร่วมกัน/.test(m)){
  return {text:prefix+'แบ่งบทบาทผู้ค้นข้อมูล ผู้เขียนบท ผู้พูด และผู้ถ่าย/ตัดต่อ แล้วสลับบทบาทอย่างน้อยหนึ่งครั้ง ให้สมาชิกทุกคนมีหลักฐานการพูดของตนเองแยกจากผลงานกลุ่ม\nคำถาม: สมาชิกคนใดยังไม่ได้ฝึกพูดอังกฤษในแผนงาน (ใช้รหัสสมาชิก ไม่ใช้ชื่อจริง)?',kind:'COLLABORATION',language:'th'};
 }
 if(/สวัสดี|hello|hi|ช่วย|เริ่ม|คิดไม่ออก/.test(m)){
  return {text:prefix+'เราจะเริ่มจากความคิดของคุณ ไม่ต้องให้ผู้ช่วยทำงานแทนนะครับ\nก่อนอื่นตอบเป็นภาษาอังกฤษสั้น ๆ: “Our visitors want to know about…”\nจากนั้นระบุผู้ชม สถานที่ และคำถามที่อยากให้วิดีโอช่วยตอบอย่างละหนึ่งอย่าง\nอยากเริ่มที่การค้นคว้า การฝึกพูด หรือการวางภาพ 6 ฉาก?',kind:'SOCRATIC_START',language:'th'};
 }
 return {text:prefix+'ผมอยากเข้าใจแนวคิดของคุณก่อน: คุณต้องการสื่อสารอะไรให้ผู้ชมรู้เกี่ยวกับ'+ctx.p.label+'?\nลองใช้ “I want to show… because…” แล้วเพิ่มข้อเท็จจริงที่ตรวจสอบได้หนึ่งข้อ\nคำถามต่อไป: ถ้าผู้ชมถามว่า “How do you know?” คุณจะนำหลักฐานอะไรมาตอบ?',kind:'SOCRATIC',language:'th'};
}
function v18DemoOwner(scope){
 const u=S.dashboard?.user?.uid||'DEMO0';
 return scope==='group'&&S.dashboard?.group?.id?'GROUP:'+S.dashboard.group.id:'USER:'+u;
}
function v18DemoEvent(type,scope,step,extra={}){
 if(S.role!=='STUDENT'||!S.dashboard)return;
 PBL18_DEMO_EVENTS.push({id:'EV-DEMO-'+(++PBL18_DEMO_SEQ),eventType:type,
 actorId:S.dashboard.user.uid||'DEMO0',classId:S.dashboard.user.classId||'6.3',
 ownerKey:v18DemoOwner(scope),scope,step,at:new Date().toISOString(),
 meta:{...extra}});
 if(PBL18_DEMO_EVENTS.length>400)PBL18_DEMO_EVENTS.splice(0,PBL18_DEMO_EVENTS.length-400);
}
async function v18CoachStart(context){
 if(S.role!=='STUDENT'||!S.dashboard)throw Error('กรุณาเข้าสู่ห้องเรียนก่อน');
 if(!Number.isInteger(context.step)||context.step<1||context.step>20)throw Error('ขั้นเรียนรู้ไม่ถูกต้อง');
 if(!['individual','group'].includes(context.scope))throw Error('ประเภทพื้นที่ไม่ถูกต้อง');
 if(context.scope==='group'&&!S.dashboard.group)throw Error('รอครูกำหนดกลุ่มก่อน');
 if(S.preview){
  const key=v18DemoOwner(context.scope)+'|'+context.step;
  const sessionId='SID-DEMO-'+(S.dashboard.user.uid||'DEMO0')+'-'+context.scope;
  PBL18_DEMO_SESSIONS.set(sessionId,{owner:key,startedAt:Date.now()});
  v18DemoEvent('SESSION_START',context.scope,context.step);
  return {source:'DEMO',sessionId,ownerKey:v18DemoOwner(context.scope),mode:'GUIDED_DEMO'};
 }
 return api('coachSessionStart',{scope:context.scope,step:context.step,place:context.place});
}
async function v18CoachHistory(context){
 if(!S.dashboard||S.role!=='STUDENT')throw Error('ต้องเข้าสู่ห้องเรียน');
 if(S.preview){
  const key=v18DemoOwner(context.scope)+'|'+context.step;
  return {source:'DEMO',ownerKey:v18DemoOwner(context.scope),
   messages:(PBL18_DEMO_THREADS.get(key)||[]).slice(-32).map(x=>({...x})),
   mode:'GUIDED_DEMO'};
 }
 return api('coachHistory',{scope:context.scope,step:context.step});
}
async function v18CoachAsk(context){
 if(!S.dashboard||S.role!=='STUDENT')throw Error('ต้องเข้าสู่ห้องเรียน');
 if(!Number.isInteger(context.step)||context.step<1||context.step>20)throw Error('ขั้นเรียนรู้ไม่ถูกต้อง');
 if(!['individual','group'].includes(context.scope)||!PBL18_PLACE[context.place])throw Error('ข้อมูลโครงงานไม่ถูกต้อง');
 const message=String(context.message||'').trim();
 if(message.length<2||message.length>500)throw Error('กรุณาพิมพ์ข้อความ 2–500 ตัวอักษร');
 if(PBL18_BLOCK_PII.test(message)||/รหัสผ่าน|เลขบัตร|ที่อยู่บ้าน|password/i.test(message))
  throw Error('อย่าส่งข้อมูลส่วนตัวหรือรหัสผ่าน ให้พิมพ์เฉพาะคำถามเกี่ยวกับ Vlog');
 if(S.preview){
  const owner=v18DemoOwner(context.scope),key=owner+'|'+context.step,thread=PBL18_DEMO_THREADS.get(key)||[];
  if(thread.length>120)thread.splice(0,thread.length-120);
  const id='M-DEMO-'+(++PBL18_DEMO_SEQ),at=new Date().toISOString();
  thread.push({id,role:'student',text:message,actorId:S.dashboard.user.uid||'DEMO0',at});
  const answer=v18GuidedCoach(message,context.step,context.place);
  const reply={id:'M-DEMO-'+(++PBL18_DEMO_SEQ),role:'coach',text:answer.text,at:new Date().toISOString(),mode:'GUIDED_DEMO',kind:answer.kind};
  thread.push(reply);PBL18_DEMO_THREADS.set(key,thread);
  v18DemoEvent('COACH_ASK',context.scope,context.step,{characters:message.length,kind:answer.kind,place:context.place});
  v18DemoEvent('COACH_REPLY',context.scope,context.step,{characters:answer.text.length,mode:'GUIDED_DEMO'});
  return {source:'DEMO',ownerKey:owner,reply,messages:thread.slice(-32),mode:'GUIDED_DEMO'};
 }
 return api('coachAsk',{scope:context.scope,step:context.step,place:context.place,
  message,sessionId:context.sessionId,requestId:context.requestId});
}
async function v18Event(type,context={}){
 if(S.role!=='STUDENT'||!S.dashboard)return {ignored:true};
 if(!/^(STEP_VIEW|VOICE_PLAY|VOICE_RECORD_START|VOICE_RECORD_STOP|TASK_DRAFT|TASK_SUBMIT|SESSION_PULSE|SESSION_END)$/.test(type))
  throw Error('รูปแบบเหตุการณ์ไม่ถูกต้อง');
 if(S.preview){v18DemoEvent(type,context.scope||'individual',context.step||S.step,{durationSec:Math.min(30,Number(context.durationSec)||0)});return {source:'DEMO',accepted:true}}
 return api('learningEvent',{eventType:type,step:context.step||S.step,scope:context.scope||'individual',
  sessionId:context.sessionId||'',durationSec:Math.max(0,Math.min(30,Number(context.durationSec)||0)),
  requestId:context.requestId||''});
}
async function v18AdminLogs(params={}){
 if(S.role!=='ADMIN'||!S.admin)throw Error('เฉพาะผู้ดูแลระบบ');
 if(S.preview){
  const events=PBL18_DEMO_EVENTS.slice();
  if(!events.length){
   events.push({id:'EV-DEMO-INTRO',eventType:'SESSION_START',actorId:'DEMO0',
    classId:'6.3',ownerKey:'USER:DEMO0',scope:'individual',step:1,at:new Date().toISOString(),meta:{}});}
  return {source:'DEMO',schema:'SYNTHETIC',events,summary:{events:events.length,
    actors:new Set(events.map(x=>x.actorId)).size,groups:new Set(events.filter(x=>x.scope==='group').map(x=>x.ownerKey)).size,
    coachQuestions:events.filter(x=>x.eventType==='COACH_ASK').length},generatedAt:new Date().toISOString()};
 }
 return api('adminLearningAnalytics',params);
}
window.PBLV18Bridge=Object.freeze({
 isStudent:()=>S.role==='STUDENT'&&Boolean(S.dashboard),
 isAdmin:()=>S.role==='ADMIN'&&Boolean(S.admin),
 isDemo:()=>S.preview,
 identity:()=>S.dashboard?{uid:S.dashboard.user?.uid||'',classId:S.dashboard.user?.classId||'',
  groupId:S.dashboard.group?.id||'',groupName:S.dashboard.group?.name||''}:null,
 currentStep:()=>S.step,lesson:step=>STEPS[step-1]?.slice()||[],
 coachStart:v18CoachStart,coachHistory:v18CoachHistory,coachAsk:v18CoachAsk,
 logEvent:v18Event,adminLogs:v18AdminLogs
});

function previewAdmin(){
 closeAdminDialog();
 S.preview=true;S.role='ADMIN';S.admin={
  users:Array.from({length:5},(_,i)=>({uid:'DEMO'+i,name:'นักเรียนตัวอย่าง '+(i+1),classId:'6.3',active:true,mustChange:true})),
  groups:[{id:'G-DEMO',name:'กลุ่มตัวอย่าง',classId:'6.3',memberIds:['DEMO0','DEMO1','DEMO2','DEMO3']}],classIds:p6Classes
 };
 renderAdmin();$('logoutBtn').hidden=false;show('adminScreen');
}
function togglePrivateInputs(){
 fillClasses(p6Classes);
 $('studentPassword').disabled=true;$('adminPassword').disabled=true;
 $('studentPassword').placeholder='ยังไม่เปิดการเข้าใช้บัญชีจริง';
 $('adminPassword').placeholder='รอเปิดใช้งานบัญชีผู้ดูแล';
 $('adminLogin').hidden=false; // visible but disabled until secure school authentication exists
 $('adminLogin').querySelector('button[type=submit]').disabled=true;
 const b=document.createElement('button');b.id='demoAdminBtn';b.type='button';b.className='btn neutral full';
 b.textContent='ดูหน้าจัดการตัวอย่าง';b.addEventListener('click',previewAdmin);$('adminLogin').after(b);
 const info=document.createElement('p');info.className='help';info.id='adminPreviewHelp';
 info.textContent='ขณะนี้ยังไม่เปิดการเข้าสู่ระบบบัญชีจริง';
 b.after(info);
 status('','ready');
}
async function initialize(){
 fillClasses(p6Classes);
 if(!backend){togglePrivateInputs();return}
 try{
  const c=await api('classes');fillClasses(c.classes||p6Classes);
  try{const t=sessionStorage.getItem(SESSION_KEY);if(t){S.token=t;await loadDashboard();return}}catch(e){updateToken('')}
  status('','ready');
 }catch(e){status('','error')}
}
function chooseStudent(person){
 if(!person||!p6Classes.includes(String(person.classId)))return;
 S.selected={uid:String(person.uid),name:String(person.name),classId:String(person.classId)};
 $('selectedName').textContent=person.name+' · ป.'+person.classId;
 $('studentName').replaceChildren();
 const opt=document.createElement('option');opt.value=person.uid;opt.textContent=person.name;$('studentName').append(opt);$('studentName').value=person.uid;
 $('studentClass').value=person.classId;
 $('studentSearch').value=person.name;
 $('studentSearch').closest('.field-with-icon').hidden=true;$('studentSelection').hidden=false;
 $('searchResults').hidden=true;$('searchResults').replaceChildren();
 $('studentSearch').setAttribute('aria-expanded','false');
 $('passwordFields').hidden=false;
 $('studentSubmit').disabled=!backend;
 if(backend)$('studentPassword').focus();else notify('กรุณาติดต่อผู้ดูแลระบบเพื่อเข้าใช้บัญชีจริง');
}
function clearStudentSelection(){
 S.selected=null;$('studentSearch').value='';$('studentSearch').closest('.field-with-icon').hidden=false;
 $('studentSelection').hidden=true;$('passwordFields').hidden=true;$('studentPassword').value='';
 $('studentSubmit').disabled=true;$('studentName').replaceChildren();$('studentClass').value='';
 $('searchResults').hidden=true;$('searchResults').replaceChildren();$('studentSearch').setAttribute('aria-expanded','false');
 $('studentSearch').focus();
}
function clearSuggestions(){
 const el=$('searchResults');el.replaceChildren();el.hidden=true;
 $('studentSearch').setAttribute('aria-expanded','false');
}
function suggestMessage(msg){
 const el=$('searchResults');el.replaceChildren();
 const p=document.createElement('p');p.className='hint';p.textContent=msg;el.append(p);el.hidden=false;
 $('studentSearch').setAttribute('aria-expanded','true');
}
function showSearchResults(people,query){
 if(normalized($('studentSearch').value)!==normalized(query))return;
 const el=$('searchResults');el.replaceChildren();
 const list=sortedResults(people,query);
 if(!list.length){suggestMessage('ไม่พบรายชื่อ กรุณาตรวจสอบการสะกด');return}
 list.forEach((person,i)=>{
  const button=document.createElement('button');button.type='button';button.id='v141Result'+i;
  button.setAttribute('role','option');button.setAttribute('aria-selected','false');
  const name=document.createElement('span');name.className='result-name';name.textContent=person.name;
  const cls=document.createElement('span');cls.className='result-class';cls.textContent='ป.'+person.classId;
  button.append(name,cls);button.addEventListener('click',()=>chooseStudent(person));el.append(button);
 });
 el.hidden=false;$('studentSearch').setAttribute('aria-expanded','true');
}
async function searchStudents(){
 const query=$('studentSearch').value.trim(),needle=normalized(query);
 const ticket=++searchTicket;
 if(!needle){clearSuggestions();return}
 if(!backend){showSearchResults(sampleUsers,query);return}
 // Private P6 records: anonymous backend requests stay 3+ chars, with capped results.
 if(Array.from(needle).length<3){suggestMessage('พิมพ์เพิ่มอีก '+(3-Array.from(needle).length)+' ตัวอักษร');return}
 const cached=searchCache.get(needle);
 if(cached && Date.now()-cached.at<15000){showSearchResults(cached.list,query);return}
 suggestMessage('กำลังค้นหารายชื่อ…');
 try{
  const response=await api('searchStudents',{query});
  if(ticket!==searchTicket||normalized($('studentSearch').value)!==needle)return;
  const list=Array.isArray(response.students)?response.students:[];
  if(searchCache.size>=24)searchCache.delete(searchCache.keys().next().value);
  searchCache.set(needle,{at:Date.now(),list});
  showSearchResults(list,query);
 }catch(e){if(ticket===searchTicket)suggestMessage('ค้นหาไม่สำเร็จ กรุณาลองใหม่อีกครั้ง')}
}
async function login(role,event){
 event.preventDefault();
 if(!backend){notify('กรุณาติดต่อผู้ดูแลระบบเพื่อเข้าใช้บัญชีจริง');return}
 const data=role==='ADMIN'?{role,uid:value('adminUser'),password:$('adminPassword').value}:
 {role,uid:S.selected?.uid||'',password:$('studentPassword').value,classId:S.selected?.classId||'',};
 try{
  const res=await api('login',data);
  $('studentPassword').value='';$('adminPassword').value='';
  updateToken(res.token);S.role=res.user.role;S.preview=false;
  if(res.user.mustChange){S.dashboard={user:res.user};$('passwordTitle').textContent='กรุณาเปลี่ยนรหัสผ่านเริ่มต้น';show('passwordScreen');}
  else await loadDashboard();
 }catch(e){notify(e.message)}
}
async function loadDashboard(){
 const data=await api('dashboard');S.dashboard=data;S.role=data.user.role;
 if(data.user.mustChange){$('passwordTitle').textContent='กรุณาเปลี่ยนรหัสผ่านเริ่มต้น';show('passwordScreen');return}
 $('logoutBtn').hidden=false;
 if(S.role==='ADMIN'){await reloadAdmin();show('adminScreen')}
 else {S.step=1;renderStudent();show('studentScreen')}
 status('','ready');
}
function logout(){
 updateToken('');S.dashboard=null;S.admin=null;S.role='';S.preview=false;$('logoutBtn').hidden=true;
 $('oldPassword').value='';$('newPassword').value='';$('confirmPassword').value='';
 show('welcome');$('adminAccess').hidden=true;status('','ready');
}
function currentProgress(n){return (S.dashboard&&S.dashboard.steps||[]).find(x=>Number(x.step)===n)}
function firstUnfinished(){
 for(let n=1;n<=20;n++)if(!currentProgress(n)?.done)return n;
 return 20;
}
function canOpen(n){return S.preview||n<=firstUnfinished()}
function currentMode(n){return individualSteps.includes(n)?'individual':'group'}
function renderStudent(){
 const d=S.dashboard;if(!d)return;
 $('studentGreeting').textContent='สวัสดี '+d.user.name;
 $('studentMeta').textContent='ชั้น ป.'+d.user.classId+' • '+(d.group?'กลุ่ม '+d.group.name+' ('+d.group.members+' คน)':'ยังไม่ได้กำหนดกลุ่ม');
 const list=$('stepList');list.replaceChildren();
 STEPS.forEach((s,i)=>{
  const n=i+1,btn=document.createElement('button');btn.type='button';btn.className='step'+(S.step===n?' active':'')+(currentProgress(n)?.done?' done':'')+(canOpen(n)?'':' locked');
  btn.disabled=!canOpen(n);btn.setAttribute('aria-current',S.step===n?'step':'false');
  const digit=document.createElement('strong');digit.textContent=currentProgress(n)?.done?'✓':String(n).padStart(2,'0');
  const title=document.createElement('span');title.textContent=s[0];btn.append(digit,title);
  btn.addEventListener('click',()=>{S.step=n;renderStudent()});list.append(btn);
 });
 const n=S.step,step=STEPS[n-1],group=currentMode(n)==='group',unassigned=group&&!d.group;
 $('taskMode').textContent=group?'GROUP TASK · ครูกำหนดสมาชิก':'INDIVIDUAL · ฝึกและประเมินรายบุคคล';
 $('taskCounter').textContent='STEP '+String(n).padStart(2,'0')+' / 20';
 $('taskTitle').textContent=step[0];$('taskDescription').textContent=step[3];$('taskQuestion').textContent=step[1];$('taskFrame').textContent=step[2];
 $('taskNote').value=currentProgress(n)?.note||'';
 $('taskNote').disabled=S.preview||unassigned;
 $('saveStep').disabled=S.preview||unassigned||!canOpen(n);
 $('taskHelp').textContent=S.preview?'ตัวอย่างหน้าจอ: ไม่บันทึกข้อมูลจริง':unassigned?'ต้องรอ Admin จัดกลุ่มก่อนจึงจะบันทึกงานขั้นนี้ได้':
 group?'งานขั้นนี้เป็นของกลุ่มที่ Admin กำหนด และสมาชิกทุกคนในกลุ่มร่วมกันปรับปรุงได้':'งานขั้นนี้บันทึกแยกตามนักเรียนแต่ละคน';
 $('nextStep').disabled=!canOpen(Math.min(20,n+1))||n===20;
}
async function saveStep(){
 if(S.preview)return notify('กำลังชมบทเรียนตัวอย่าง ยังไม่บันทึกงาน');
 const n=S.step,note=value('taskNote'),revision=currentProgress(n)?.revision||0;
 if(!note){notify('กรุณากรอกคำตอบก่อนบันทึก');return}
 try{
  const result=await api('saveStep',{step:n,note,revision});
  S.dashboard=await api('dashboard');
  renderStudent();notify('บันทึกขั้นที่ '+n+' แล้ว ('+result.mode+')');
  if(window.PBLV18Bridge?.logEvent){window.PBLV18Bridge.logEvent('TASK_SUBMIT',{step:n,scope:individualSteps.includes(n)?'individual':'group',requestId:'save'+Date.now().toString(36)}).catch(()=>{})}
 }catch(e){notify(e.message)}
}
async function reloadAdmin(){
 S.admin=await api('adminList');renderAdmin();
}
function renderAdmin(){
 const a=S.admin;if(!a)return;
 fillSelect($('addClass'),a.classIds,'เลือกห้อง');
 fillSelect($('groupClass'),a.classIds,'เลือกห้อง');
 fillSelect($('rosterFilter'),a.classIds,'ทุกห้อง');
 renderRoster();renderMembers();renderGroups();
 if(window.PBLV16Admin?.refresh)window.PBLV16Admin.refresh();
 const block=S.preview;
 ['addName','groupName'].forEach(id=>$(id).disabled=block);
 ['addStudentForm','groupForm'].forEach(id=>$(id).querySelector('button[type=submit]').disabled=block);
}
function renderRoster(){
 if(!S.admin)return;
 const cls=value('rosterFilter'),list=$('rosterList');list.replaceChildren();
 const all=S.admin.users.filter(u=>!cls||u.classId===cls);
 if(!all.length){const p=document.createElement('p');p.className='help';p.textContent='ยังไม่มีรายชื่อในห้องนี้';list.append(p);return}
 all.forEach(u=>{
  const row=document.createElement('div');row.className='roster-item';
  const identity=document.createElement('div'),strong=document.createElement('strong'),small=document.createElement('small');
  strong.textContent=u.name;small.textContent='ป.'+u.classId+' • '+(u.active?'ใช้งาน':'ระงับ')+(u.mustChange?' • รอเปลี่ยนรหัส':'');
  identity.append(strong,small);const buttons=document.createElement('div');buttons.className='roster-tools';
  const reset=document.createElement('button');reset.className='mini';reset.type='button';reset.textContent='รีเซตรหัส';
  reset.disabled=S.preview;reset.addEventListener('click',()=>resetStudent(u));
  const toggle=document.createElement('button');toggle.className='mini warn';toggle.type='button';toggle.textContent=u.active?'ระงับ':'เปิดใช้';
  toggle.disabled=S.preview;toggle.addEventListener('click',()=>toggleStudent(u));
  buttons.append(reset,toggle);row.append(identity,buttons);list.append(row);
 });
}
function renderMembers(){
 if(!S.admin)return;
 const cls=value('groupClass'),sel=$('groupMembers');sel.replaceChildren();
 const taken=new Set(S.admin.groups.flatMap(g=>g.memberIds||[]));
 S.admin.users.filter(u=>u.classId===cls&&u.active).forEach(u=>{
  const opt=document.createElement('option');opt.value=u.uid;opt.textContent=u.name+(taken.has(u.uid)?' · มีกลุ่มแล้ว':'');
  opt.disabled=taken.has(u.uid);sel.append(opt);
 });
}
function renderGroups(){
 if(!S.admin)return;
 const el=$('groupList');el.replaceChildren();
 if(!S.admin.groups.length){const p=document.createElement('p');p.className='muted';p.textContent='ยังไม่มีการกำหนดกลุ่ม';el.append(p);return}
 S.admin.groups.forEach(g=>{const card=document.createElement('div');card.className='group-chip';const strong=document.createElement('strong');strong.textContent=g.name;
 const small=document.createElement('span');small.textContent='ป.'+g.classId+' · สมาชิก '+g.memberIds.length+' คน';card.append(strong,small);el.append(card)});
}
function showSecret(heading,value){
 $('secretTitle').textContent=heading;$('secretValue').textContent=String(value);$('secretDialog').hidden=false;
 $('hideSecret').focus();
}
function clearSecret(){ $('secretValue').textContent='';$('secretDialog').hidden=true}
async function adminAction(action,data,onSuccess){
 if(S.preview)return notify('หน้านี้ไม่สามารถแก้ไขข้อมูลจริงได้');
 try{const r=await api(action,data);await reloadAdmin();if(onSuccess)onSuccess(r);else notify('บันทึกเรียบร้อย');}
 catch(e){notify(e.message)}
}
function resetStudent(u){
 if(!confirm('รีเซตรหัสผ่านของ '+u.name+' และยกเลิกเซสชันเดิม?'))return;
 adminAction('adminResetPassword',{uid:u.uid},r=>showSecret('รหัสผ่านชั่วคราวของ '+u.name,r.temporaryPassword));
}
function toggleStudent(u){
 if(!confirm((u.active?'ระงับ':'เปิดใช้')+' บัญชี '+u.name+' ?'))return;
 adminAction('adminSetActive',{uid:u.uid,active:!u.active});
}
function showPassword(){
 if(S.preview){notify('ยังไม่เปิดใช้งานบัญชี');return}
 $('passwordTitle').textContent='เปลี่ยนรหัสผ่าน';show('passwordScreen');
}
async function changePassword(event){
 event.preventDefault();if(S.preview)return;
 const old=$('oldPassword').value,next=$('newPassword').value,confirmValue=$('confirmPassword').value;
 if(next!==confirmValue){notify('รหัสผ่านใหม่และยืนยันไม่ตรงกัน');return}
 if(/^\d{13}$/.test(next)){notify('ห้ามใช้เลขบัตรประชาชนเป็นรหัสผ่าน');return}
 try{await api('changePassword',{current:old,next});try{await api('logout')}catch(e){/* password change has already revoked old session */}logout();notify('เปลี่ยนรหัสผ่านแล้ว กรุณาเข้าสู่ระบบอีกครั้ง')}
 catch(e){notify(e.message)}
}
$('studentSearch').addEventListener('input',()=>{
 clearTimeout(searchTimer);searchTicket++; // invalidate all in-flight lookups
 if(!backend)searchStudents();
 else if(Array.from(normalized($('studentSearch').value)).length<3)searchStudents();
 else {suggestMessage('กำลังค้นหารายชื่อ…');searchTimer=setTimeout(searchStudents,120)}
});
$('studentSearch').addEventListener('keydown',e=>{
 const list=Array.from($('searchResults').querySelectorAll('[role=option]'));
 if((e.key==='ArrowDown'||e.key==='ArrowUp')&&list.length){e.preventDefault();(e.key==='ArrowDown'?list[0]:list[list.length-1]).focus()}
 else if(e.key==='Enter'&&list.length===1){e.preventDefault();list[0].click()}
 else if(e.key==='Escape'){e.preventDefault();clearSuggestions()}
});
$('searchResults').addEventListener('keydown',e=>{
 const list=Array.from($('searchResults').querySelectorAll('[role=option]'));
 const i=list.indexOf(document.activeElement);
 if(i<0)return;
 if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();list[(i+(e.key==='ArrowDown'?1:-1)+list.length)%list.length].focus()}
 if(e.key==='Escape'){e.preventDefault();clearSuggestions();$('studentSearch').focus({preventScroll:true})}
});
$('changeSelection').addEventListener('click',clearStudentSelection);
$('exploreLessons').addEventListener('click',previewLessons);
$('adminEntry').addEventListener('click',()=>{
 if(S.role==='ADMIN'&&S.admin){show('adminScreen');return}
 openAdminDialog();
});
$('closeAdmin').addEventListener('click',closeAdminDialog);
$('studentLogin').addEventListener('submit',e=>login('STUDENT',e));
$('adminLogin').addEventListener('submit',e=>login('ADMIN',e));
$('changePasswordForm').addEventListener('submit',changePassword);
$('logoutBtn').addEventListener('click',async()=>{try{if(backend&&S.token)await api('logout')}catch(e){}logout()});
$('backFromPassword').addEventListener('click',()=>S.dashboard&&S.dashboard.user&&!S.dashboard.user.mustChange&&S.token?loadDashboard():logout());
$('changeStudentPass').addEventListener('click',showPassword);
$('changeAdminPass').addEventListener('click',showPassword);
$('saveStep').addEventListener('click',saveStep);
$('nextStep').addEventListener('click',()=>{S.step=Math.min(20,S.step+1);renderStudent()});
$('rosterFilter').addEventListener('change',renderRoster);
$('groupClass').addEventListener('change',renderMembers);
$('hideSecret').addEventListener('click',clearSecret);
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('secretDialog').hidden)clearSecret()});
document.querySelectorAll('[data-toggle]').forEach(btn=>btn.addEventListener('click',()=>{
 const input=$(btn.dataset.toggle);input.type=input.type==='password'?'text':'password';
}));
$('addStudentForm').addEventListener('submit',e=>{
 e.preventDefault();const name=value('addName'),classId=value('addClass');
 if(!name||!classId)return;
 adminAction('adminAddStudent',{name,classId},r=>{$('addName').value='';showSecret('รหัสเริ่มต้นของ '+r.user.name,r.temporaryPassword)});
});
$('groupForm').addEventListener('submit',e=>{
 e.preventDefault();const name=value('groupName'),classId=value('groupClass'),memberIds=Array.from($('groupMembers').selectedOptions).map(o=>o.value);
 if(memberIds.length<4||memberIds.length>5)return notify('เลือกนักเรียน 4–5 คนต่อกลุ่ม');
 adminAction('adminSaveGroup',{name,classId,memberIds},()=>{$('groupName').value='';notify('บันทึกกลุ่มแล้ว')});
});
installAdminDialog();
initialize();
})();