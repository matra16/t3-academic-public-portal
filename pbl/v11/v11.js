(() => {
'use strict';
const $=id=>document.getElementById(id);
const backend=Boolean(window.google&&window.google.script&&window.google.script.run);
const SESSION_KEY='PBL_V11_SESSION_ONLY';
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
const S={token:'',role:'',dashboard:null,admin:null,step:1,preview:false};
const status=(message,type='')=>{const b=$('banner');b.textContent=message;b.className='banner '+type;};
let toastTimer;
function notify(message){const el=$('toast');el.textContent=message;el.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>{el.hidden=true;},6200)}
const value=id=>$(id).value.trim();
const hide=()=>{['welcome','passwordScreen','studentScreen','adminScreen'].forEach(id=>$(id).hidden=true)};
const show=id=>{hide();$(id).hidden=false;scrollTo({top:0,behavior:'instant'})};
function api(action,data={}) {
 if(!backend)return Promise.reject(Error('ยังไม่ได้เชื่อมระบบตรวจสอบสิทธิ์ของโรงเรียน'));
 return new Promise((resolve,reject)=>{
  window.google.script.run.withSuccessHandler(r=>r&&r.ok?resolve(r.data):reject(Error(r&&r.error||'ระบบไม่พร้อมใช้งาน')))
  .withFailureHandler(()=>reject(Error('ไม่สามารถติดต่อระบบโรงเรียนได้'))).apiV11({action,data,token:S.token});
 });
}
function updateToken(token) {
 S.token=String(token||'');
 try{if(token)sessionStorage.setItem(SESSION_KEY,S.token);else sessionStorage.removeItem(SESSION_KEY)}catch(e){/* shared device may restrict storage */}
}
function togglePrivateInputs(){
 if(backend)return;
 $('studentPassword').disabled=true;$('adminPassword').disabled=true;
 $('studentPassword').placeholder='ต้องเปิดผ่านระบบโรงเรียน';$('adminPassword').placeholder='ต้องเปิดผ่านระบบโรงเรียน';
 const tools=document.createElement('div');tools.className='preview-links';
 const student=document.createElement('button');student.className='btn neutral';student.type='button';student.textContent='ชมตัวอย่างหน้าบทเรียน 20 ขั้น';
 const admin=document.createElement('button');admin.className='btn neutral';admin.type='button';admin.textContent='ชมตัวอย่างหน้า Admin';
 student.addEventListener('click',()=>{S.preview=true;S.role='STUDENT';S.dashboard={
  user:{name:'EXPLORER DEMO',classId:'6.3',mustChange:false},group:{name:'VLOG TEAM DEMO',members:4},
  steps:[],individualSteps
 };renderStudent();show('studentScreen');});
 admin.addEventListener('click',()=>{S.preview=true;S.role='ADMIN';S.admin={
  users:Array.from({length:5},(_,i)=>({uid:'DEMO'+i,name:'นักเรียนตัวอย่าง '+(i+1),classId:'6.3',active:true,mustChange:true})),
  groups:[{id:'G-DEMO',name:'VLOG TEAM DEMO',classId:'6.3',memberIds:['DEMO0','DEMO1','DEMO2','DEMO3']}],classIds:['6.3']
 };renderAdmin();show('adminScreen');});
 tools.append(student,admin);document.querySelector('.preview-links').after(tools);
 $('environment').textContent='PUBLIC UI DEMO — NO AUTH';
 status('V11 ตัวอย่างหน้าจอสาธารณะเท่านั้น • ยังไม่มีการเข้าใช้บัญชีจริงหรือข้อมูลนักเรียน • โปรดอย่ากรอกรหัสผ่าน','error');
}
async function initialize() {
 if(!backend){togglePrivateInputs();return}
 $('environment').textContent='SCHOOL APPS SCRIPT';
 status('ระบบโรงเรียนกำลังเชื่อมต่อ…');
 try{
  const c=await api('classes');fillClasses(c.classes||[]);
  try{const t=sessionStorage.getItem(SESSION_KEY);if(t){S.token=t;await loadDashboard();return}}catch(e){updateToken('')}
  status('พร้อมให้เข้าสู่ระบบด้วยบัญชีโรงเรียน โดยไม่ต้องใช้บัญชี Google','ready');
 }catch(e){status('ระบบบัญชียังไม่พร้อม: '+e.message,'error')}
}
function fillSelect(sel,items,placeholder) {
 const chosen=sel.value;sel.replaceChildren();
 const o=document.createElement('option');o.value='';o.textContent=placeholder;sel.append(o);
 items.forEach(s=>{const n=document.createElement('option');n.value=String(s);n.textContent=String(s);sel.append(n)});
 if(items.includes(chosen))sel.value=chosen;
}
function fillClasses(items){
 ['studentClass','addClass','groupClass','rosterFilter'].forEach(id=>fillSelect($(id),items,id==='rosterFilter'?'ทุกห้อง':'เลือกห้องเรียน'));
 const params=new URLSearchParams(location.search),cls=params.get('class'),code=params.get('gate');
 if(cls&&items.includes(cls))$('studentClass').value=cls;
 if(code&&/^[0-9a-f]{16}$/i.test(code))$('classCode').value=code;
 if(cls&&code&&items.includes(cls))loadNames().catch(()=>{});
}
async function loadNames(){
 const classId=value('studentClass'),classCode=value('classCode');
 if(!classId||!classCode){notify('เลือกห้องเรียนและกรอกรหัสเข้าห้องก่อน');return}
 try{
  const res=await api('names',{classId,classCode});
  const sel=$('studentName');sel.replaceChildren();const first=document.createElement('option');first.value='';first.textContent='เลือกชื่อนักเรียน';sel.append(first);
  res.students.forEach(u=>{const o=document.createElement('option');o.value=u.uid;o.textContent=u.name;sel.append(o)});
  sel.disabled=false;notify('เลือกรายชื่อของตนเองแล้วกรอกรหัสผ่าน');
 }catch(e){$('studentName').disabled=true;notify(e.message)}
}
async function login(role,event){
 event.preventDefault();
 if(!backend){notify('ตัวอย่างหน้าจอเท่านั้น ไม่รับรหัสผ่านจริง');return}
 const data=role==='ADMIN'?{role,uid:value('adminUser'),password:$('adminPassword').value}:
 {role,uid:value('studentName'),password:$('studentPassword').value,classId:value('studentClass'),classCode:value('classCode')};
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
 status('เข้าสู่ระบบแล้ว • '+(S.role==='ADMIN'?'Admin':'Student')+' • เซสชันปลอดภัย','ready');
}
function logout(){
 updateToken('');S.dashboard=null;S.admin=null;S.role='';S.preview=false;$('logoutBtn').hidden=true;
 $('oldPassword').value='';$('newPassword').value='';$('confirmPassword').value='';
 show('welcome');status(backend?'ออกจากระบบแล้ว':'ตัวอย่างหน้า UI ยังไม่มีระบบเข้าสู่บัญชีจริง',backend?'ready':'error');
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
 if(S.preview)return notify('ตัวอย่างหน้าจอ ไม่บันทึกข้อมูล');
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
 ['newClass','addName','groupName'].forEach(id=>$(id).disabled=block);
 ['classForm','addStudentForm','groupForm'].forEach(id=>$(id).querySelector('button[type=submit]').disabled=block);
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
 if(S.preview)return notify('ตัวอย่าง UI: ไม่อนุญาตให้แก้บัญชี');
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
 if(S.preview){notify('ตัวอย่าง UI: ไม่มีบัญชีจริง');return}
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
$('loadNames').addEventListener('click',()=>loadNames());
$('studentClass').addEventListener('change',()=>{$('studentName').replaceChildren();$('studentName').disabled=true});
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
$('classForm').addEventListener('submit',e=>{
 e.preventDefault();const classId=value('newClass');
 if(!confirm('สร้างหรือเปลี่ยนรหัสเข้าห้อง ป.'+classId+'? รหัสเดิมจะใช้ไม่ได้'))return;
 adminAction('adminSetClassCode',{classId},r=>showSecret('รหัสเข้าห้อง ป.'+classId,r.classCode));
});
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