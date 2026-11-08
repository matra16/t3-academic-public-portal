(() => {
'use strict';
const $=id=>document.getElementById(id);
const backend=Boolean(window.google&&window.google.script&&window.google.script.run);
const SESSION_KEY='PBL_V12_SESSION_ONLY';
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
const show=id=>{hide();$(id).hidden=false;scrollTo({top:0,behavior:'instant'})};
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

const sampleUsers=[{uid:'DEMO01',name:'นักเรียนตัวอย่าง 1',classId:'6.1'},{uid:'DEMO02',name:'นักเรียนตัวอย่าง 2',classId:'6.2'},{uid:'DEMO03',name:'นักเรียนตัวอย่าง 3',classId:'6.3'}];
let searchTicket=0,searchTimer=0;
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
 S.preview=true;S.role='STUDENT';S.dashboard={user:{name:'ผู้เรียนตัวอย่าง',classId:'6.3',mustChange:false},group:{name:'กลุ่มโครงงานตัวอย่าง',members:4},steps:[],individualSteps};
 S.step=1;renderStudent();$('logoutBtn').hidden=false;show('studentScreen');
}
function previewAdmin(){
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
 $('adminPassword').placeholder='ยังไม่เปิดการเข้าใช้บัญชีจริง';
 const b=document.createElement('button');b.id='demoAdminBtn';b.type='button';b.className='btn neutral full';
 b.textContent='ชมหน้าจัดการตัวอย่าง';b.addEventListener('click',previewAdmin);$('adminLogin').after(b);
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
function showSearchResults(people,query){
 if($('studentSearch').value.trim()!==query)return;
 const el=$('searchResults');el.replaceChildren();
 const list=(people||[]).filter(p=>p&&p.uid&&p.name&&p6Classes.includes(String(p.classId))).slice(0,8);
 if(!list.length){const p=document.createElement('p');p.className='hint';p.textContent='ไม่พบรายชื่อ กรุณาลองพิมพ์ใหม่';el.append(p)}
 else list.forEach(person=>{
  const b=document.createElement('button');b.type='button';b.setAttribute('role','option');
  const name=document.createElement('span');name.textContent=person.name;
  const cls=document.createElement('span');cls.className='result-class';cls.textContent='ป.'+person.classId;
  b.append(name,cls);b.addEventListener('click',()=>chooseStudent(person));el.append(b);
 });
 el.hidden=false;$('studentSearch').setAttribute('aria-expanded','true');
}
async function searchStudents(){
 const query=$('studentSearch').value.trim();
 if(query.length<3){$('searchResults').hidden=true;$('searchResults').replaceChildren();$('studentSearch').setAttribute('aria-expanded','false');return}
 const ticket=++searchTicket;
 if(!backend){
  showSearchResults(sampleUsers.filter(p=>p.name.includes(query)||p.uid.toLowerCase().includes(query.toLowerCase())),query);
  return;
 }
 try{const r=await api('searchStudents',{query});if(ticket===searchTicket)showSearchResults(r.students||[],query)}
 catch(e){if(ticket===searchTicket)notify('ค้นหาชื่อไม่สำเร็จ กรุณาลองใหม่')}
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
$('studentSearch').addEventListener('input',()=>{clearTimeout(searchTimer);searchTimer=setTimeout(searchStudents,320)});
$('studentSearch').addEventListener('keydown',e=>{
 if(e.key==='ArrowDown'){const first=$('searchResults').querySelector('button');if(first){e.preventDefault();first.focus()}}
 if(e.key==='Escape'){$('searchResults').hidden=true;$('studentSearch').setAttribute('aria-expanded','false')}
});
$('changeSelection').addEventListener('click',clearStudentSelection);
$('exploreLessons').addEventListener('click',previewLessons);
$('adminEntry').addEventListener('click',()=>{$('adminAccess').hidden=!$('adminAccess').hidden;if(!$('adminAccess').hidden)$('adminPassword').focus()});
$('closeAdmin').addEventListener('click',()=>{$('adminAccess').hidden=true});
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
initialize();
})();