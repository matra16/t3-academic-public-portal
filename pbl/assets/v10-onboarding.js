/* T3 PBL Classroom V10 — strictly local demo onboarding.
 * The public browser must never receive the school student roster, actual IDs, or real group membership.
 * To build authenticated profiles later, use school-controlled server session/RBAC and verified roster readback.
 */
(()=>{'use strict';
const PROFILE_SESSION_KEY='T3_PBL_V10_SESSION_PROFILE', PROFILE_LOCAL_KEY='T3_PBL_V10_OPT_IN_PROFILE',
      GROUP_KEY='T3_PBL_V10_LOCAL_GROUPS',ACTIVE_GROUP='T3_PBL_V10_ACTIVE_GROUP';
const avatars=['🎬','🌱','🧭','📚','🎨','🗺️'];
const $=id=>document.getElementById(id),all=s=>[...document.querySelectorAll(s)];
const classes=new Set(['5.1','5.2','5.3','6.1','6.2','6.3']);
const text={
 th:{
 title:'สร้างโปรไฟล์เพื่อเริ่มโครงงาน',subtitle:'สแกน QR แล้วเลือกโปรไฟล์ของตนเอง ก่อนเริ่มเรียนรายบุคคลและเตรียมสร้างกลุ่ม Vlog',
 privacyHead:'พื้นที่ทดลองบนอุปกรณ์นี้เท่านั้น',privacyText:'ใช้ชื่อสมมติเท่านั้น ห้ามกรอกชื่อจริง นามสกุล เลขประจำตัว หรือข้อมูลส่วนตัว ระบบยังไม่เชื่อมทะเบียนนักเรียนจริง',
 stepProfile:'STEP 1 · PROFILE',profileTitle:'โปรไฟล์ของฉัน',aliasLabel:'ชื่อสมมติของฉัน',aliasHelp:'ใช้อักษรอังกฤษและตัวเลข 2–16 ตัวเท่านั้น ไม่ใช้ชื่อจริง',
 classLabel:'ห้องเรียน',avatarLabel:'สัญลักษณ์โปรไฟล์',
 rememberLabel:'จำโปรไฟล์ในเบราว์เซอร์นี้ (อุปกรณ์ส่วนตัวเท่านั้น)',rememberHelp:'ไม่เลือก = เก็บเพียงในเซสชันนี้ ลบโปรไฟล์ได้ทุกเมื่อ',
 saveProfile:'บันทึกโปรไฟล์',clearProfile:'ล้างโปรไฟล์',stepGroup:'STEP 2 · GROUP',groupTitle:'สร้างกลุ่มโครงงาน',
 teacherGate:'ให้เริ่มเรียนรายบุคคลก่อน ครูจะเป็นผู้อนุมัติกลุ่มจริงขนาด 4–5 คน ส่วนกลุ่มในหน้านี้เป็นการทดลองบนเบราว์เซอร์เท่านั้น',
 groupNameLabel:'ชื่อกลุ่มตัวอย่าง',createGroup:'สร้างกลุ่มตัวอย่าง',leaveGroup:'ออกจากกลุ่ม',
 joinLabel:'รหัสกลุ่มตัวอย่างในอุปกรณ์นี้',joinGroup:'เข้าร่วม',crossDevice:'ยังไม่รองรับการเข้ากลุ่มข้ามอุปกรณ์หรือการเชื่อมรายชื่อเด็กจริง',
 continue:'เข้าสู่พื้นที่เรียนรู้รายบุคคล →',backHome:'กลับหน้าแรก',profileMissing:'กรุณาสร้างโปรไฟล์ตัวอย่างก่อน',
 invalidAlias:'กรุณาใช้ชื่อสมมติเป็นอักษรอังกฤษและตัวเลข 2–16 ตัว ไม่ใช้ชื่อจริง',
 profileSaved:'บันทึกโปรไฟล์ตัวอย่างแล้ว',profileCleared:'ล้างโปรไฟล์ทดลองแล้ว',
 groupNeedName:'กรุณาใส่ชื่อกลุ่มตัวอย่าง 2–24 ตัวอักษร',groupCreated:'สร้างกลุ่มทดลองแล้ว แต่ยังไม่ใช่กลุ่มจริงที่ครูรับรอง',
 groupUnknown:'ไม่พบรหัสกลุ่มนี้ในเบราว์เซอร์นี้',groupJoined:'เข้ากลุ่มตัวอย่างในเบราว์เซอร์นี้แล้ว',
 groupFull:'กลุ่มตัวอย่างเต็ม 5 คน',groupDifferent:'กลุ่มนี้เป็นคนละห้องเรียน จึงเข้าร่วมไม่ได้',
 groupLeft:'ออกจากกลุ่มทดลองแล้ว',groupExists:'โปรไฟล์นี้อยู่ในกลุ่มตัวอย่างแล้ว',
 groupPending:'รอครูจัดกลุ่มจริง · กลุ่มทดลองบนอุปกรณ์นี้เท่านั้น',
 aliasPlaceholder:'Explorer7',confirmClear:'ล้างโปรไฟล์ตัวอย่างและออกจากกลุ่มทดลองของคุณหรือไม่?'
 },
 en:{
 title:'Create your project profile',subtitle:'Scan the QR, create a practice profile, learn independently first, then prepare a Vlog group.',
 privacyHead:'Practice on this device only',privacyText:'Use a made-up alias. Do not enter your real name, student number or private information. This demo is not connected to the official school roster.',
 stepProfile:'STEP 1 · PROFILE',profileTitle:'My profile',aliasLabel:'My practice alias',aliasHelp:'English letters and numbers, 2–16 characters. No real names.',
 classLabel:'My class',avatarLabel:'Choose an avatar',rememberLabel:'Remember this demo profile on my personal browser',
 rememberHelp:'Unchecked means this session only. You can clear the profile at any time.',saveProfile:'Save demo profile',clearProfile:'Clear profile',
 stepGroup:'STEP 2 · GROUP',groupTitle:'Plan a Vlog group',
 teacherGate:'Practise individually first. Teachers must approve real groups of about four to five learners. This is a same-browser demonstration only.',
 groupNameLabel:'Sample group name',createGroup:'Create sample group',leaveGroup:'Leave sample group',
 joinLabel:'Sample group code on this device',joinGroup:'Join group',crossDevice:'Cross-device membership and official student roster linking are not enabled yet.',
 continue:'Go to individual learning →',backHome:'Back to homepage',
 profileMissing:'Create your demo profile first',invalidAlias:'Use a made-up 2–16 character English-letter-and-number alias. No real names.',
 profileSaved:'Demo profile saved',profileCleared:'Demo profile cleared',
 groupNeedName:'Enter a sample group name with 2–24 characters',groupCreated:'Sample group created, pending a real teacher-group approval',
 groupUnknown:'No matching code found in this browser',groupJoined:'Joined the browser-local sample group',
 groupFull:'Sample group has five members already',groupDifferent:'This sample group belongs to another class',
 groupLeft:'Left the sample group',groupExists:'This profile already belongs to a sample group',
 groupPending:'Teacher approval required · Browser-only group preview',
 aliasPlaceholder:'Explorer7',confirmClear:'Clear your sample profile and leave the demo group?'
 }
};
const t=k=>(text[document.documentElement.lang==='en'?'en':'th'][k]||k);
const json=(store,key,fallback)=>{try{const s=store.getItem(key);return s?JSON.parse(s):fallback}catch{return fallback}};
const set=(store,key,value)=>{try{store.setItem(key,JSON.stringify(value));return true}catch{return false}};
const remove=(store,key)=>{try{store.removeItem(key)}catch{}};
function groups(){const data=json(sessionStorage,GROUP_KEY,[]);return Array.isArray(data)?data.filter(g=>g&&typeof g.code==='string'&&classes.has(g.classId)):[]}
function saveGroups(arr){set(sessionStorage,GROUP_KEY,arr.slice(-24))}
function currentProfile(){return json(sessionStorage,PROFILE_SESSION_KEY,null)||json(localStorage,PROFILE_LOCAL_KEY,null)}
function activeGroup(){const id=sessionStorage.getItem(ACTIVE_GROUP);return groups().find(g=>g.id===id)||null}
function message(id,value){$(id).textContent=t(value)}
function randomCode(len=6){const chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789',bytes=new Uint8Array(len);crypto.getRandomValues(bytes);return [...bytes].map(b=>chars[b%chars.length]).join('')}
function randomId(){return crypto.randomUUID?crypto.randomUUID():randomCode(20)}
function renderLocale(){
 all('[data-v10]').forEach(el=>{const val=el.dataset.v10;if(text.th[val])el.textContent=t(val)});
 const input=$('v10Alias');input.placeholder=t('aliasPlaceholder');renderProfile();renderGroup();
}
function renderAvatars(){
 const container=$('v10Avatars');container.replaceChildren();
 avatars.forEach((a,i)=>{
 const label=document.createElement('label');label.className='v10-avatar';
 const radio=document.createElement('input');radio.type='radio';radio.name='v10Avatar';radio.value=a;radio.checked=i===0;
 const icon=document.createElement('span');icon.textContent=a;icon.setAttribute('aria-hidden','true');
 label.append(radio,icon);container.appendChild(label)
 });
}
function renderProfile(){
 const profile=currentProfile(),box=$('v10ProfileCard');box.replaceChildren();box.hidden=!profile;
 if(profile){
   const icon=document.createElement('strong');icon.textContent=profile.avatar+'  '+profile.alias;
   const hint=document.createElement('p');hint.textContent='ป.'+profile.classId+' · DEMO '+profile.id.slice(0,6);
   box.append(icon,hint);
 }
}
function renderGroup(){
 const box=$('v10GroupCard');box.replaceChildren();const g=activeGroup();box.hidden=!g;
 if(g){
  const name=document.createElement('strong');name.textContent=g.name+' · '+g.code;
  const count=document.createElement('p');count.textContent=g.memberIds.length+'/5 · '+t('groupPending');
  box.append(name,count);
 }
}
function show(){
 const q=new URLSearchParams(location.search);
 $('landing').hidden=true;$('studio').hidden=true;$('v10Onboarding').hidden=false;
 const classFromQr=q.get('class');if(classes.has(classFromQr))$('v10Class').value=classFromQr;
 const p=currentProfile();
 if(p){$('v10Alias').value=p.alias;if(!classes.has(classFromQr))$('v10Class').value=p.classId;$('v10Remember').checked=!!json(localStorage,PROFILE_LOCAL_KEY,null);
 const matching=all('[name=v10Avatar]').find(x=>x.value===p.avatar);if(matching)matching.checked=true}
 renderLocale();
 window.scrollTo({top:0,behavior:'instant'});
}
function profileSaved(e){
 e.preventDefault();
 const alias=$('v10Alias').value.trim();
 if(!/^[A-Za-z][A-Za-z0-9_-]{1,15}$/.test(alias)){message('v10ProfileMessage','invalidAlias');$('v10Alias').focus();return}
 const classId=$('v10Class').value;if(!classes.has(classId))return;
 const prior=currentProfile();
 const p={id:prior?.alias===alias&&prior?.classId===classId?prior.id:randomId(),alias,classId,avatar:document.querySelector('input[name=v10Avatar]:checked')?.value||avatars[0]};
 if($('v10Remember').checked){set(localStorage,PROFILE_LOCAL_KEY,p);remove(sessionStorage,PROFILE_SESSION_KEY)}
 else{set(sessionStorage,PROFILE_SESSION_KEY,p);remove(localStorage,PROFILE_LOCAL_KEY)}
 window.__PBL_V10_PROFILE_ID=p.id;
 message('v10ProfileMessage','profileSaved');renderProfile();renderGroup();
}
function clearProfile(){
 if(!confirm(t('confirmClear')))return;
 const current=currentProfile();
 if(current){const allGroups=groups();for(const g of allGroups){g.memberIds=g.memberIds.filter(x=>x!==current.id)}saveGroups(allGroups)}
 remove(localStorage,PROFILE_LOCAL_KEY);remove(sessionStorage,PROFILE_SESSION_KEY);remove(sessionStorage,ACTIVE_GROUP);
 window.__PBL_V10_PROFILE_ID=null;
 $('v10Alias').value='';$('v10Remember').checked=false;
 message('v10ProfileMessage','profileCleared');renderProfile();renderGroup();
}
function createGroup(){
 const p=currentProfile();if(!p){message('v10GroupMessage','profileMissing');return}
 const name=$('v10GroupName').value.trim();
 if(name.length<2||name.length>24||/[<>]/.test(name)){message('v10GroupMessage','groupNeedName');return}
 let gs=groups(),existing=gs.find(g=>g.memberIds.includes(p.id));
 if(existing){sessionStorage.setItem(ACTIVE_GROUP,existing.id);message('v10GroupMessage','groupExists');renderGroup();return}
 const g={id:randomId(),code:randomCode(),name,classId:p.classId,memberIds:[p.id],approval:'PENDING_TEACHER',createdAt:new Date().toISOString()};
 gs.push(g);saveGroups(gs);sessionStorage.setItem(ACTIVE_GROUP,g.id);
 message('v10GroupMessage','groupCreated');renderGroup();
}
function joinGroup(){
 const p=currentProfile();if(!p){message('v10GroupMessage','profileMissing');return}
 const code=$('v10GroupCode').value.trim().toUpperCase(),gs=groups(),g=gs.find(x=>x.code===code);
 if(!g){message('v10GroupMessage','groupUnknown');return}
 if(g.classId!==p.classId){message('v10GroupMessage','groupDifferent');return}
 if(gs.some(x=>x.memberIds.includes(p.id)&&x.id!==g.id)){message('v10GroupMessage','groupExists');return}
 if(!g.memberIds.includes(p.id)){if(g.memberIds.length>=5){message('v10GroupMessage','groupFull');return}g.memberIds.push(p.id)}
 saveGroups(gs);sessionStorage.setItem(ACTIVE_GROUP,g.id);message('v10GroupMessage','groupJoined');renderGroup();
}
function leaveGroup(){
 const p=currentProfile(),gs=groups();
 if(p)for(const g of gs)g.memberIds=g.memberIds.filter(id=>id!==p.id);
 saveGroups(gs);remove(sessionStorage,ACTIVE_GROUP);message('v10GroupMessage','groupLeft');renderGroup();
}
function goLearn(){
 const p=currentProfile();if(!p){message('v10ProfileMessage','profileMissing');$('v10Alias').focus();return}
 const invited=new URLSearchParams(location.search).get('class');if(classes.has(invited)&&p.classId!==invited){message('v10ProfileMessage','profileMissing');$('v10Class').focus();return}
 window.__PBL_V10_PROFILE_ID=p.id;const open=window.__PBL_V10_OPEN_LEARNING;
 if(typeof open==='function'){open();document.querySelector('[data-mode=individual]')?.click();}
}
function init(){
 renderAvatars();
 window.addEventListener('v10:enter',show);
 $('v10ProfileForm').addEventListener('submit',profileSaved);
 $('v10ClearProfile').addEventListener('click',clearProfile);
 $('v10CreateGroup').addEventListener('click',createGroup);
 $('v10JoinGroup').addEventListener('click',joinGroup);
 $('v10LeaveGroup').addEventListener('click',leaveGroup);
 $('v10Continue').addEventListener('click',goLearn);
 $('v10Back').addEventListener('click',()=>window.__PBL_V10_HOME?.());
 all('[data-lang]').forEach(b=>b.addEventListener('click',()=>queueMicrotask(renderLocale)));
 window.__PBL_V10_PROFILE_ID=currentProfile()?.id||null;
 renderLocale();
}
document.addEventListener('DOMContentLoaded',init,{once:true});
})();