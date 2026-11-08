(() => {
'use strict';
const BASE='https://matra16.github.io/t3-academic-public-portal/pbl/';
const CONFIG_URL='assets/v10.public.json?v=10';
const LANG_KEY='T3_PBL_CLASSROOM_V8_UI_LANG';
const NOTE_PREFIX='T3_PBL_V8_DEMO_NOTE_';
const LOG_KEY='T3_PBL_V8_LOCAL_DEMO_LOG';
const MAX_LOG=100,RETENTION_MS=7*86400000;
// This URL flag is a public read-only rendering mode, NEVER an authentication or admin role.
const IS_STUDENT_PREVIEW=new URLSearchParams(window.location.search).get('preview')==='admin';
const DEFAULT_CONFIG=Object.freeze({version:10,uiLanguageSwitchEnabled:true,defaultUiLanguage:'th',aiExpertEnabled:false,centralActivityLogEnabled:false,cloudGroupSyncEnabled:false,videoUploadsEnabled:false});
const $=id=>document.getElementById(id);
const T={
 th:{
 skip:'ข้ามไปเนื้อหาหลัก',headerSub:'ระบบห้องเรียนโครงงาน · V10',adminEntry:'ผู้ดูแลระบบ',returnLearning:'กลับไปเรียนรู้',
 appTitle:'ระบบห้องเรียนโครงงาน',appSubtitle:'Project-Based English Learning',enterLearning:'เข้าสู่การเรียนรู้',
 studioEyebrow:'ENGLISH VIDEO TOUR · VLOG',studioTitle:'สร้าง Vlog แนะนำสถานที่ด้วยภาษาอังกฤษ',
 studioIntro:'พื้นที่ฝึกสร้างสรรค์สำหรับโครงงานตัวอย่าง ป.6 โดยใช้แนวทางการเรียนร่วมและการทำงานเป็นกลุ่ม',demoNotice:'พื้นที่ฝึกทดลองบนอุปกรณ์นี้',
 tabProject:'🎯 โครงงาน',tabWorkspace:'📝 ลงมือสร้าง',tabCoach:'💡 โค้ชฝึกคิด',tabRecords:'🕒 บันทึกกิจกรรม',
 planNotice:'เนื้อหานี้อ้างอิงแผนโครงงานเดิมซึ่งยังไม่ใช่ตารางเรียนหรือเกณฑ์ประเมินที่อนุมัติใช้จริง',
 projectEyebrow:'T3 ENGLISH VIDEO TOUR',projectHeading:'โครงงานของเรา: วิดีโอแนะนำสถานที่',
 projectDescription:'สร้าง Vlog ภาษาอังกฤษ 6 ฉาก ความยาวประมาณ 3–4 นาที เพื่อแนะนำสถานที่ให้ผู้มาเยือนเข้าใจ โดยตรวจสอบข้อมูล ซ้อมพูด รับคำเสนอแนะ และปรับปรุงผลงาน',
 chooseSite:'เลือกสถานที่ตัวอย่าง',siteWarning:'การถ่ายทำหรือเผยแพร่จริงต้องได้รับอนุญาตจากโรงเรียน ผู้ดูแลพื้นที่ และผู้เกี่ยวข้องก่อน',
 learningMode:'รูปแบบการเรียนรู้',individual:'👤 รายบุคคล',team:'👥 กลุ่มทดลอง',
 individualInfo:'ฝึกภาษาอังกฤษและบันทึกความคิดรายบุคคล ก่อนเริ่มจัดกลุ่มตามแผนการสอน',
 teamInfo:'ทดลองสร้างผลงานกลุ่ม G-DEMO บนเบราว์เซอร์นี้เท่านั้น ยังไม่ได้ทำงานร่วมกันข้ามเครื่องจริง',
 scopeHeading:'ขอบเขตของ V10',scopeExplanation:'ยังไม่มีระบบบัญชีผู้เรียน การทำงานพร้อมกันข้ามเครื่อง หรือทะเบียนรายชื่อจริง โปรดใช้รหัสตัวอย่างเท่านั้น',
 beginProject:'เริ่มทำโครงงาน',workflowHeading:'ขั้นตอนการสร้าง Vlog',
 workflowSub:'กระบวนการ 20 ขั้นจากแผนเดิม ครอบคลุมการสืบค้น พัฒนาภาษาอังกฤษ การผลิต และการสะท้อนคิด',
 workspaceSteps:'กระบวนการเรียนรู้',selectStep:'เลือกกิจกรรม',draftSaved:'บันทึกไว้บนอุปกรณ์',draftPrivacy:'ข้อความที่บันทึกจะอยู่เฉพาะในเบราว์เซอร์นี้ ไม่ใช่การส่งงานให้ครู',
 englishPrompt:'ENGLISH PRACTICE · ไม่เปลี่ยนตามภาษาของเมนู',noteLabel:'แนวคิดและร่างงานของฉัน',
 notePlaceholder:'บันทึกแนวคิดสั้น ๆ',saveWork:'บันทึกในอุปกรณ์นี้',nextStep:'ไปขั้นต่อไป →',
 saveHint:'ไม่มีการอัปโหลดข้อมูลไปยังฐานข้อมูลโรงเรียน',
 coachEyebrow:'GUIDED PRACTICE · SAFETY FIRST',coachHeading:'โค้ชฝึกคิดสำหรับงาน Vlog',
 offlineCoachNotice:'ขณะนี้เป็นโค้ชแบบกฎและคำถามชี้แนะที่ทำงานในเบราว์เซอร์ ไม่ใช่ AI สร้างข้อความจริง และไม่มีการส่งคำตอบออกนอกอุปกรณ์',
 coachQuestionLabel:'สิ่งที่อยากขอคำแนะนำ',coachPlaceholder:'เช่น เราจะเริ่มเขียนบท Vlog อย่างไรดี',askCoach:'ส่งคำถามฝึกคิด',resetCoach:'เริ่มบทสนทนาใหม่',
 aiGate:'โหมด AI ผู้เชี่ยวชาญสำหรับรายบุคคลและหลายกลุ่มยังไม่เปิดจริง เนื่องจากต้องตรวจผู้ให้บริการที่อนุญาตให้เด็กใช้ ระบบสิทธิ์ การควบคุมข้อมูล และค่าใช้จ่ายก่อน',
 aiNotLive:'สถานะ: รอระบบ AI ฝั่งเซิร์ฟเวอร์ที่ผ่านการตรวจรับ — ไม่ใช่ AI ที่ออนไลน์',coachTopics:'ตัวอย่างเรื่องที่ปรึกษาได้',
 recordsHeading:'บันทึกกิจกรรมในอุปกรณ์นี้',
 recordsExplanation:'เป็นบันทึกเฉพาะเบราว์เซอร์นี้เพื่อทดสอบขั้นตอน ไม่ใช่ระบบติดตามการเข้าใช้งานนักเรียนหลายคนหรือหลายเครื่องของโรงเรียน และไม่เก็บข้อความสนทนาหรือไฟล์วิดีโอในรายการเหตุการณ์',
 clearLogs:'ล้างบันทึกทดลอง',recordsRetention:'เก็บสูงสุด 100 เหตุการณ์ล่าสุด ไม่เกิน 7 วัน',
 eventTime:'เวลา',eventAction:'เหตุการณ์',eventScope:'รูปแบบ',
 shareProjectHeading:'ลิงก์และ QR เข้าห้องเรียนโครงงาน',shareProjectNotice:'QR นี้เปิดเฉพาะพื้นที่เรียนรู้ตัวอย่าง ไม่บรรจุข้อมูลผู้เรียนหรือรหัสกลุ่ม',copyProjectURL:'คัดลอกลิงก์โครงงาน',printProjectQR:'พิมพ์ QR',copiedURL:'คัดลอกลิงก์แล้ว',
 previewWarning:'มุมมองนักเรียนสำหรับตรวจหน้าจอเท่านั้น — อ่านอย่างเดียว ไม่บันทึกกิจกรรม',returnToAdmin:'กลับหน้า Admin',
 studioFooter:'เว็บไซต์นี้เป็นพื้นที่ฝึกทดลองสาธารณะ ไม่ใช่ระบบส่งงาน การประเมินคะแนน หรือการเก็บหลักฐานส่วนบุคคลอย่างเป็นทางการ',
 saved:'บันทึกในอุปกรณ์นี้แล้ว',blocked:'เบราว์เซอร์ไม่อนุญาตให้เก็บข้อมูลในอุปกรณ์นี้',
 logsCleared:'ล้างบันทึกทดลองแล้ว',confirmLogs:'ล้างรายการเหตุการณ์ทดลองในอุปกรณ์นี้?',emptyLogs:'ยังไม่มีเหตุการณ์ที่บันทึก',
 coachEmpty:'กรุณาพิมพ์คำถามก่อน',tooLong:'ข้อความยาวเกินกำหนด',languageLocked:'ผู้ดูแลปิดตัวเลือกภาษาในระบบนี้'
 },
 en:{
 skip:'Skip to main content',headerSub:'Project Learning Classroom · V10',adminEntry:'Admin',returnLearning:'Back to learning',
 appTitle:'Project Learning Classroom',appSubtitle:'Project-Based English Learning',enterLearning:'Enter learning',
 studioEyebrow:'ENGLISH VIDEO TOUR · VLOG',studioTitle:'Create an English video tour',
 studioIntro:'A practice workspace for the Grade 6 project, including independent learning and group production.',demoNotice:'Practice area on this device',
 tabProject:'🎯 Project',tabWorkspace:'📝 Create',tabCoach:'💡 Guided coach',tabRecords:'🕒 Activity history',
 planNotice:'This content follows the earlier draft project plan, not an officially approved school schedule or grading plan.',
 projectEyebrow:'T3 ENGLISH VIDEO TOUR',projectHeading:'Our project: A place-introduction Vlog',
 projectDescription:'Create a six-scene English Vlog of approximately 3–4 minutes to introduce a place. Verify facts, rehearse, seek feedback and improve the final video.',
 chooseSite:'Choose a sample place',siteWarning:'Filming and publication require permission from the school, site owner and anyone appearing in the footage.',
 learningMode:'Learning mode',individual:'👤 Individual',team:'👥 Demo group',
 individualInfo:'Practise English and record individual ideas before team formation in the lesson sequence.',
 teamInfo:'Try a sample team workspace G-DEMO on this browser only. Cross-device group collaboration is not yet enabled.',
 scopeHeading:'V10 scope',scopeExplanation:'No learner accounts, real multi-device collaboration or official student roster exist yet. Use sample IDs only.',
 beginProject:'Start project',workflowHeading:'Vlog creation process',
 workflowSub:'Twenty steps from the previous project plan: research, English practice, production and reflection.',
 workspaceSteps:'Learning process',selectStep:'Choose a step',draftSaved:'Notes on this device',draftPrivacy:'Notes remain in this browser. They are not official work submissions.',
 englishPrompt:'ENGLISH PRACTICE · not changed by the UI language',noteLabel:'My ideas and draft',
 notePlaceholder:'Write a short idea',saveWork:'Save on this device',nextStep:'Next step →',saveHint:'Nothing is uploaded to the school database.',
 coachEyebrow:'GUIDED PRACTICE · SAFETY FIRST',coachHeading:'Vlog thinking coach',
 offlineCoachNotice:'This is a browser-based, rule-guided coach, not a live generative AI model. Your text is not transmitted from this device.',
 coachQuestionLabel:'What do you want help with?',coachPlaceholder:'For example: How can we begin our Vlog script?',askCoach:'Ask the coach',resetCoach:'New practice conversation',
 aiGate:'The expert AI for individual learners and simultaneous groups is not activated. The provider must permit access by children, and secure authorization, privacy and cost controls are required first.',
 aiNotLive:'Status: awaiting a verified server-side AI service — no live generative AI',
 coachTopics:'Suggested topics',
 recordsHeading:'Activity history on this device',
 recordsExplanation:'These are browser-local test events, not a central attendance, identity or group monitoring system. Prompts and video files are not stored as event logs.',
 clearLogs:'Clear local demo log',recordsRetention:'Up to 100 recent events, retained no longer than 7 days',
 eventTime:'Time',eventAction:'Event',eventScope:'Mode',
 shareProjectHeading:'Project classroom link and QR',shareProjectNotice:'This QR opens the sample learning workspace. It contains no learner or group identity.',copyProjectURL:'Copy project link',printProjectQR:'Print QR',copiedURL:'Link copied',
 previewWarning:'Student view preview — read-only, no activity recording',returnToAdmin:'Back to Admin',
 studioFooter:'This is a public practice site, not an official assignment, gradebook or student audit system.',
 saved:'Saved on this device',blocked:'This browser does not allow local storage',
 logsCleared:'Local demo events cleared',confirmLogs:'Clear demo activity events on this device?',emptyLogs:'No saved demo events',
 coachEmpty:'Write a question first',tooLong:'Your message is too long',languageLocked:'The interface language selector is disabled by the site administrator'
 }
};
const LOCATIONS=[
 {id:'school',icon:'🏫',label:'School · โรงเรียน'},
 {id:'grounds',icon:'🌳',label:'School Grounds · บริเวณโรงเรียน'},
 {id:'temple',icon:'🛕',label:'Temple · วัด'},
 {id:'market',icon:'🛍️',label:'Market · ตลาด'},
 {id:'community',icon:'🏘️',label:'Community · ชุมชน'},
 {id:'other',icon:'🗺️',label:'Other place · สถานที่อื่น'}
];
// Vlog learning content is intentionally independent of the interface locale.
const STEPS=[
 ['Project Entry · เริ่มต้นโครงงาน','Who is our audience? What do visitors want to know?','Our visitors want to know…','ดูตัวอย่างที่ใช้ได้ตามสิทธิ์ แล้วระบุผู้ชมและคำถามที่ต้องรู้ 3 ข้อ'],
 ['Challenge & Criteria · โจทย์และเกณฑ์','How can we help visitors understand our place?','We will create a video that…','กำหนดคำถามขับเคลื่อน ผู้ชม และเกณฑ์ความสำเร็จ'],
 ['Team Formation · เตรียมจัดทีม','How can everyone participate?','Everyone can contribute by…','ฝึกรายบุคคลก่อน ครูพิจารณาจัดกลุ่มตามหลักฐานและความพร้อม'],
 ['Role Rotation · หมุนเวียนบทบาท','What role can I try today?','My role is…','สำรวจหน้าที่ผู้ค้นข้อมูล ผู้เขียนบท ผู้นำเสนอ และผู้ทำสื่อ โดยทุกคนมีโอกาสพูด'],
 ['Project Planning · วางแผนงาน','What should we do first, next and last?','First, we will… Next, we will…','กำหนดงานย่อย ความรับผิดชอบ และจุดตรวจงาน'],
 ['Site Selection · เลือกสถานที่','Why is this place useful for visitors?','This place is important because…','เลือกสถานที่ตัวอย่าง และตรวจข้อจำกัดความปลอดภัย/สิทธิ์'],
 ['Inquiry & Research · สืบค้น','Where is it? What happens here?','It is located… It is used for…','รวบรวมข้อมูลจากแหล่งที่เชื่อถือได้ โดยยังไม่ใช้ข้อมูลที่ยืนยันไม่ได้'],
 ['Fact Checking · ตรวจสอบข้อเท็จจริง','Can you check this fact with another source?','According to our sources…','ตรวจข้อมูลจากสองแหล่ง หรือแหล่งหลักและผู้ดูแลพื้นที่'],
 ['English Input · ฝึกภาษา','How can you introduce this place politely?','Welcome to… Let me show you…','ฝึกศัพท์ การบอกทิศทาง การถามตอบและการออกเสียงเป็นรายบุคคล'],
 ['Scriptwriting · เขียนบท','What do visitors need to hear in each scene?','In this scene, we will say…','จัดลำดับบทพูด 6 ฉาก เขียนร่างที่ใช้ข้อมูลยืนยันแล้ว'],
 ['Storyboard · วาดลำดับภาพ','What will the camera show in scene three?','In scene three, we show…','วาด Storyboard 6 ช่อง พร้อมภาพ เสียง และบทที่เกี่ยวข้อง'],
 ['Production Planning · เตรียมถ่าย','May we record here?','May we record at this place?','ทำรายการภาพและเสียง เตรียมอุปกรณ์ และตรวจสิทธิ์ก่อนถ่าย'],
 ['Speaking Rehearsal · ซ้อมพูด','Can you explain this without reading your script?','Let me explain…','ฝึกพูดตอบคำถามใหม่ด้วยตัวเอง ไม่ท่องบทอย่างเดียว'],
 ['Filming & Audio · ถ่ายทำ','Can visitors hear and understand us?','Please speak slowly and clearly.','ถ่ายเฉพาะสถานที่/บุคคลที่ได้รับอนุญาต และตรวจเสียงตัวอย่าง'],
 ['File Management · จัดไฟล์','Which scene is this file for?','This is scene… version…','ตั้งชื่อด้วยรหัสงาน ไม่ใส่ชื่อเด็ก แยก RAW/EDIT/FINAL'],
 ['Editing · ตัดต่อ','Does each scene help the audience?','This scene explains…','เรียงหกฉาก ใส่เสียง/ข้อความที่อ่านได้ ตรวจสิทธิ์สื่อประกอบ'],
 ['Critique & Feedback · รับข้อเสนอแนะ','What could make our video clearer?','We could improve…','ให้เพื่อน/ครูใช้เกณฑ์สะท้อนข้อดีและสิ่งที่ควรแก้'],
 ['Revision · ปรับปรุง','What did we change after the feedback?','We revised… because…','แก้บท/เสียง/ภาพตามข้อเสนอแนะ แล้วจดเวอร์ชัน'],
 ['Audience & Review · นำเสนอ','How does our video help its viewers?','Our video helps visitors…','จัดชมเฉพาะผู้มีสิทธิ์และได้รับอนุมัติ ไม่ต้องโพสต์สาธารณะ'],
 ['Reflection · สะท้อนคิด','What did I learn and contribute?','I learned… I contributed by…','สะท้อนรายบุคคลและกลุ่ม สรุปทักษะที่ฝึกและสิ่งที่ควรพัฒนา']
];
const COACH_TOPICS=['วางแผน 6 ฉาก','ตรวจข้อมูลสถานที่','ฝึกพูดภาษาอังกฤษ','ปรับ Storyboard','ตรวจความปลอดภัยก่อนถ่าย','รับข้อเสนอแนะและแก้ไข'];
const doc=document,ui=id=>doc.getElementById(id),all=selector=>[...doc.querySelectorAll(selector)];
let cfg={...DEFAULT_CONFIG},locale='th',currentTab='project',mode='individual',site='school',step=0,entered=false,coachChat=[],toastId=null;
const tr=k=>(T[locale]&&T[locale][k])||T.th[k]||k;
const safeGet=k=>{if(IS_STUDENT_PREVIEW)return null;try{return localStorage.getItem(k)}catch(e){return null}};
const safeSet=(k,v)=>{if(IS_STUDENT_PREVIEW)return false;try{localStorage.setItem(k,v);return true}catch(e){showToast('blocked');return false}};
const safeDel=k=>{if(IS_STUDENT_PREVIEW)return;try{localStorage.removeItem(k)}catch(e){}};
function showToast(k){const e=ui('toast');e.textContent=tr(k);e.hidden=false;clearTimeout(toastId);toastId=setTimeout(()=>e.hidden=true,2300)}
function applyLang(){
 doc.documentElement.lang=locale;
 doc.title=locale==='th'?'T3 PBL Classroom V10 — ระบบห้องเรียนโครงงาน':'T3 PBL Classroom V10 — Project Learning Classroom';
 all('[data-ui]').forEach(el=>el.textContent=tr(el.dataset.ui));
 all('[data-ui-placeholder]').forEach(el=>el.setAttribute('placeholder',tr(el.dataset.uiPlaceholder)));
 all('[data-lang]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.lang===locale)));
 const modeInfo=ui('modeExplanation');if(modeInfo)modeInfo.textContent=tr(mode==='team'?'teamInfo':'individualInfo');
 renderEvents();
}
function switchLang(lang){
 if(!cfg.uiLanguageSwitchEnabled){locale=cfg.defaultUiLanguage;applyLang();return}
 if(!['th','en'].includes(lang))return;
 locale=lang;safeSet(LANG_KEY,locale);applyLang();
 // STEPS, location labels, English prompt, saved student work and coaching messages are intentionally immutable.
}
function applyPublicConfig(data){
 // Fail-closed on sensitive features: the public config can only disable, never enable live AI/logging/upload.
 cfg={...DEFAULT_CONFIG,
   uiLanguageSwitchEnabled:data?.uiLanguageSwitchEnabled!==false,
   defaultUiLanguage:['th','en'].includes(data?.defaultUiLanguage)?data.defaultUiLanguage:'th',
   aiExpertEnabled:false,centralActivityLogEnabled:false,cloudGroupSyncEnabled:false,videoUploadsEnabled:false
 };
 ui('languageControl').hidden=!cfg.uiLanguageSwitchEnabled;
 if(!cfg.uiLanguageSwitchEnabled){locale=cfg.defaultUiLanguage;applyLang()}
}
async function loadConfig(){
 try{const r=await fetch(CONFIG_URL,{cache:'no-store'});if(!r.ok)throw Error('missing');applyPublicConfig(await r.json())}
 catch(e){applyPublicConfig(DEFAULT_CONFIG)}
}
function demoLog(action){
 if(IS_STUDENT_PREVIEW)return;
 // Synthetic, browser-local, bounded metadata only; never student IDs, text, media, IP or device fingerprints.
 const now=Date.now(),entry={at:new Date(Math.floor(now/60000)*60000).toISOString(),action,scope:mode==='team'?'GROUP_DEMO':'INDIVIDUAL_DEMO'};
 let list=[];
 try{const a=JSON.parse(safeGet(LOG_KEY)||'[]');if(Array.isArray(a))list=a.filter(x=>x&&Date.parse(x.at)>now-RETENTION_MS&&typeof x.action==='string').slice(-99)}catch(e){}
 list.push(entry);safeSet(LOG_KEY,JSON.stringify(list));renderEvents();
}
function readLogs(){try{const a=JSON.parse(safeGet(LOG_KEY)||'[]');return Array.isArray(a)?a.filter(x=>x&&Date.parse(x.at)>Date.now()-RETENTION_MS).slice(-MAX_LOG):[]}catch(e){return[]}}
function renderEvents(){
 const tbody=ui('logRows');if(!tbody)return;tbody.replaceChildren();
 const logs=readLogs().reverse();if(!logs.length){const trr=doc.createElement('tr'),td=doc.createElement('td');td.colSpan=3;td.textContent=tr('emptyLogs');trr.appendChild(td);tbody.appendChild(trr);return}
 logs.forEach(v=>{const row=doc.createElement('tr');for(const item of [new Date(v.at).toLocaleString(locale==='th'?'th-TH':'en-US'),v.action,v.scope]){const cell=doc.createElement('td');cell.textContent=String(item);row.appendChild(cell)}tbody.appendChild(row)})
}
function fillSites(){
 const el=ui('siteGrid');el.replaceChildren();
 LOCATIONS.forEach(v=>{const b=doc.createElement('button');b.type='button';b.textContent=v.icon+' '+v.label;b.dataset.site=v.id;b.setAttribute('aria-pressed',String(site===v.id));b.addEventListener('click',()=>{site=v.id;all('[data-site]').forEach(a=>a.setAttribute('aria-pressed',String(a.dataset.site===site)));demoLog('site_selected')});el.appendChild(b)})
}
function setMode(v){if(!['individual','team'].includes(v))return;mode=v;all('[data-mode]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.mode===v)));
 ui('modeExplanation').textContent=tr(mode==='team'?'teamInfo':'individualInfo');showStep();demoLog('learning_mode_selected')}
function tabs(name){
 if(!['project','workspace','coach','records'].includes(name))return;
 currentTab=name;
 all('[data-tab]').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.tab===name)));
 all('.tab-panel').forEach(p=>p.hidden=p.id!=='tab-'+name);
 if(name==='workspace')showStep();if(name==='records')renderEvents();
 demoLog('section_opened_'+name);
}
function openLearning(){
 ui('v10Onboarding').hidden=true;
 entered=true;ui('landing').hidden=true;ui('studio').hidden=false;ui('returnLearning').hidden=true;tabs('project');
 window.scrollTo({top:0,behavior:'instant'});demoLog('learning_entered');
}
function landing(){
 ui('v10Onboarding').hidden=true;
 entered=false;ui('landing').hidden=false;ui('studio').hidden=true;ui('returnLearning').hidden=true;
 window.scrollTo({top:0,behavior:'instant'});
}
function noteKey(){return NOTE_PREFIX+(window.__PBL_V10_PROFILE_ID||'guest')+'_'+mode+'_'+site+'_'+String(step+1).padStart(2,'0')}
function savedCount(){
 let n=0;for(let i=0;i<STEPS.length;i++)if((safeGet(NOTE_PREFIX+(window.__PBL_V10_PROFILE_ID||'guest')+'_'+mode+'_'+site+'_'+String(i+1).padStart(2,'0'))||'').trim())n++;
 return n;
}
function showStep(){
 const st=STEPS[step];ui('stepCounter').textContent='STEP '+String(step+1).padStart(2,'0')+' / 20';
 ui('stepName').textContent=st[0];ui('stepTask').textContent=st[3];ui('englishQuestion').textContent=st[1];ui('englishFrame').textContent=st[2];
 ui('stepSelect').value=String(step);ui('workNote').value=safeGet(noteKey())||'';
 ui('savedCount').textContent=savedCount()+' / 20';
}
function makeMilestones(){
 const list=ui('milestoneOverview'),select=ui('stepSelect');list.replaceChildren();select.replaceChildren();
 STEPS.forEach((s,i)=>{const li=doc.createElement('li');li.textContent=s[0];list.appendChild(li);
 const opt=doc.createElement('option');opt.value=String(i);opt.textContent=String(i+1).padStart(2,'0')+' · '+s[0];select.appendChild(opt)});
 showStep();
}
function speakBubble(text,who){
 const item=doc.createElement('div');item.className='chat-bubble chat-bubble--'+who;item.textContent=text;ui('chatHistory').appendChild(item);
 ui('chatHistory').scrollTop=ui('chatHistory').scrollHeight;
}
function showCoachStart(){
 ui('chatHistory').replaceChildren();coachChat=[];
 speakBubble('สวัสดี! ฉันคือโค้ชฝึกคิดตามกฎที่ทำงานแบบออฟไลน์ ไม่ใช่ AI สำหรับ English Video Tour 🎬\nบอกฉันได้ว่าอยากปรึกษาเรื่องการค้นข้อมูล เขียนบท ซ้อมพูด หรือทำ Vlog ส่วนใด แล้วเราจะลองคิดเป็นขั้นตอนด้วยกัน','coach');
}
function guideReply(input){
 const q=input.toLowerCase();
 if(/(?:script|บทพูด|เขียนบท|dialog|ฉาก)/.test(q))return 'ลองแบ่ง Vlog เป็น 6 ฉาก: Welcome → Location → Interesting facts → Directions → Highlights → Goodbye.\nก่อนเขียนบท ให้ตรวจข้อเท็จจริงแล้วหรือยัง? เริ่มด้วยประโยคของตัวเอง: “Welcome to our…”';
 if(/(?:fact|ข้อมูล|ประวัติ|research|จริง|ตรวจสอบ)/.test(q))return 'ก่อนพูดข้อเท็จจริงในวิดีโอ ลองหาหลักฐานจากอย่างน้อย 2 แหล่ง หรือแหล่งหลักกับผู้ดูแลสถานที่.\nคุณยืนยันชื่อสถานที่ ที่ตั้ง และความสำคัญได้อย่างไร?';
 if(/(?:pronoun|speak|พูด|ออกเสียง|rehears|ซ้อม)/.test(q))return 'ลองฝึกแนะนำสถานที่ด้วยประโยค “This is our … . It is near … . Visitors can … .”\nลองพูดสั้น ๆ โดยไม่อ่านบท แล้วถามเพื่อนว่าฟังเข้าใจหรือไม่';
 if(/(?:film|video|camera|ถ่าย|ตัดต่อ|vlog|เสียง)/.test(q))return 'ก่อนถ่ายทำ: ตรวจผู้อนุญาตพื้นที่และผู้ปรากฏในภาพ แล้วลองถ่ายคลิปตัวอย่างสั้น ๆ แบบไม่มีบุคคลที่ไม่ได้อนุญาต.\nลองฟังว่าเสียงชัดหรือไม่ และแต่ละฉากช่วยให้ผู้ชมเข้าใจอะไร';
 if(/(?:group|ทีม|เพื่อน|กลุ่ม|role|แบ่งงาน)/.test(q))return 'ลองทำข้อตกลงทีมและหมุนเวียนหน้าที่เพื่อให้ทุกคนได้ฝึกภาษาอังกฤษ.\nแต่ละคนจะมีช่วงพูดหรือหลักฐานการเรียนรู้ของตัวเองอย่างไร? ครูจะเป็นผู้ยืนยันการจัดกลุ่มจริง';
 if(/(?:temple|market|community|วัด|ตลาด|ชุมชน|นอกโรงเรียน)/.test(q))return 'สถานที่นอกโรงเรียนเป็นหัวข้อที่ดี แต่ต้องตรวจสิทธิ์และความปลอดภัยก่อน: ใครดูแลพื้นที่? ใครอาจติดภาพ? ต้องขออนุญาตใคร?\nหากยังไม่ผ่าน ให้ฝึกบทกับภาพ/ข้อมูลจำลองในห้องเรียนก่อน';
 if(/(?:feedback|review|แก้ไข|ปรับปรุง|ประเมิน)/.test(q))return 'ลองถามผู้ชมว่า “What is clear? What could we improve?”\nเลือกข้อเสนอแนะ 1 ข้อ แล้วอธิบายว่าได้ปรับภาพ บท หรือเสียงอย่างไร โดยบันทึกฉบับก่อนและหลัง';
 const s=STEPS[step];return 'ลองเริ่มจากกิจกรรมขั้นที่ '+(step+1)+' — '+s[0]+'\nEnglish question: '+s[1]+'\nคุณคิดว่าจะหาหลักฐานอะไร และจะอธิบายให้ผู้ชมเข้าใจด้วยคำพูดของตนเองอย่างไร?';
}
function toast(k){showToast(k)}
function renderProjectQR(){
 const url=new URL(BASE);url.searchParams.set('view','learning');
 const anchor=ui('projectInviteLink');anchor.href=url.href;anchor.textContent=url.href;
 const mount=ui('projectQR');mount.replaceChildren();
 if(typeof window.QRCode==='function')new window.QRCode(mount,{text:url.href,width:154,height:154,colorDark:'#122f3c',colorLight:'#fff',correctLevel:window.QRCode.CorrectLevel.M});
 else mount.textContent='QR';
}
function copyProjectURL(){
 const url=ui('projectInviteLink').href;
 if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(url).then(()=>showToast('copiedURL')).catch(()=>window.prompt('Copy link',url))}
 else window.prompt('Copy link',url);
}
window.__PBL_V10_OPEN_LEARNING=openLearning;
window.__PBL_V10_HOME=landing;
function boot(){
 if(IS_STUDENT_PREVIEW){
  ui('studentPreviewBanner').hidden=false;
  ui('workNote').disabled=true;ui('coachInput').disabled=true;
  for(const k of ['saveWork','askCoach','clearLogs'])ui(k).disabled=true;
 }
 const saved=safeGet(LANG_KEY);locale=['th','en'].includes(saved)?saved:'th';
 applyLang();fillSites();makeMilestones();showCoachStart();renderProjectQR();
 const topics=ui('coachTopics');COACH_TOPICS.forEach(s=>{const li=doc.createElement('li');li.textContent=s;topics.appendChild(li)});
 all('[data-lang]').forEach(b=>b.addEventListener('click',()=>switchLang(b.dataset.lang)));
 all('[data-mode]').forEach(b=>b.addEventListener('click',()=>setMode(b.dataset.mode)));
 all('[data-tab]').forEach(b=>b.addEventListener('click',()=>tabs(b.dataset.tab)));
 ui('enterLearning').addEventListener('click',()=>window.dispatchEvent(new Event('v10:enter')));
 ui('goHome').addEventListener('click',landing);
 ui('returnLearning').addEventListener('click',openLearning);
 ui('startProject').addEventListener('click',()=>tabs('workspace'));
 ui('copyProjectLink').addEventListener('click',copyProjectURL);
 ui('printProjectQR').addEventListener('click',()=>window.print());
 ui('stepSelect').addEventListener('change',e=>{step=Number(e.target.value)||0;showStep();demoLog('step_opened')});
 ui('nextStep').addEventListener('click',()=>{step=(step+1)%STEPS.length;showStep();demoLog('step_opened')});
 ui('saveWork').addEventListener('click',()=>{if(IS_STUDENT_PREVIEW)return;const txt=ui('workNote').value;if(txt.length>1500){toast('tooLong');return}if(safeSet(noteKey(),txt)){showStep();toast('saved');demoLog('draft_saved')}});
 ui('askCoach').addEventListener('click',()=>{if(IS_STUDENT_PREVIEW)return;const input=ui('coachInput').value.trim();if(!input){toast('coachEmpty');return}
  if(input.length>500){toast('tooLong');return} speakBubble(input,'student');speakBubble(guideReply(input),'coach');ui('coachInput').value='';
  demoLog('offline_guided_coach_used'); /* Never store student prompt text in audit */
 });
 ui('resetCoach').addEventListener('click',()=>{showCoachStart();demoLog('coach_dialogue_reset')});
 ui('clearLogs').addEventListener('click',()=>{if(IS_STUDENT_PREVIEW)return;if(!confirm(tr('confirmLogs')))return;safeDel(LOG_KEY);renderEvents();showToast('logsCleared')});
 loadConfig();
 // Entry is an explicit user action: no student-activity tracking merely on page load.
 const url=new URL(window.location.href);
 if(IS_STUDENT_PREVIEW)openLearning();else {landing();if(url.searchParams.get('view')==='learning')window.addEventListener('load',()=>window.dispatchEvent(new Event('v10:enter')),{once:true});}
}
boot();
})();