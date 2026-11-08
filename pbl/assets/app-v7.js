(() => {
'use strict';
const BASE = 'https://matra16.github.io/t3-academic-public-portal/pbl/';
const LANG_KEY = 'T3_PBL_CLASSROOM_V7_LANG';
const PROFILE_KEY = 'T3_PBL_CLASSROOM_V6_PROFILE'; // Preserve V6 browser-local settings.
const NOTE_PREFIX = 'T3_PBL_CLASSROOM_V6_NOTE_'; // Preserve V6 notes on this same GitHub Pages origin.
const $ = id => document.getElementById(id);
const dict = {
 th: {
  documentTitle:'ระบบห้องเรียนโครงงาน | T3 PBL Classroom V7', metaDescription:'ระบบห้องเรียนโครงงานภาษาอังกฤษ ป.5–6',
  skip:'ข้ามไปเนื้อหาหลัก',brandSub:'ระบบห้องเรียนโครงงาน · ป.5–6',primaryNav:'การนำทางหลัก',languageSelect:'เลือกภาษาของระบบ',
  navHome:'หน้าแรก',navCourses:'ห้องเรียน',navHow:'วิธีเรียน',navProfile:'พื้นที่ของฉัน',navShare:'แชร์ห้องเรียน / QR',navAbout:'เกี่ยวกับระบบ',menu:'เมนู',openMenu:'เปิดเมนู',closeMenu:'ปิดเมนู',
  heroEyebrow:'PROJECT-BASED ENGLISH · ป.5–6',heroTitle:'ระบบห้องเรียนโครงงาน',
  heroDescription:'เรียนรู้ภาษาอังกฤษผ่านการตั้งคำถาม สำรวจ ทดลอง สร้างชิ้นงาน และสื่อสารแนวคิดผ่านโครงงาน',
  exploreProjects:'สำรวจห้องเรียน',howItWorks:'เรียนอย่างไร',skillCommunicate:'สื่อสารภาษาอังกฤษ',skillInquiry:'เรียนรู้ผ่านการสืบค้น',
  pathHeading:'เส้นทางการเรียนรู้',pathAsk:'ตั้งคำถาม',pathExplore:'ค้นคว้าและสำรวจ',pathCreate:'ออกแบบและสร้างสรรค์',pathShare:'นำเสนอและสะท้อนคิด',
  learningSummary:'สรุปการเรียนรู้บนอุปกรณ์นี้',sampleProjects:'โครงงานตัวอย่าง',savedNotes:'บันทึกบนอุปกรณ์นี้',openClassQR:'เปิด QR ห้องเรียน',
  courseEyebrow:'EXPLORE PROJECTS',coursesHeading:'เลือกโครงงานที่สนใจ',courseIntro:'เลือกหัวข้อ ฝึกใช้ภาษาอังกฤษ และบันทึกแนวคิดของตนเอง',viewAll:'ดูห้องเรียนทั้งหมด',
  pathEyebrow:'HOW IT WORKS',pathTitle:'เรียนรู้แบบโครงงาน 4 ขั้น',pathIntro:'กิจกรรมสั้น ๆ ที่ช่วยให้คิดเป็น สื่อสารเป็น และลงมือทำจริง',
  pathAskDesc:'สังเกตปัญหาหรือสิ่งน่าสนใจ และตั้งคำถามที่อยากค้นหา',pathExploreDesc:'รวบรวมข้อมูลจากแหล่งที่เหมาะสมและแลกเปลี่ยนความคิด',
  pathCreateDesc:'ทดลองปรับปรุงแนวคิด และสร้างชิ้นงานที่สื่อความหมาย',pathShareDesc:'ฝึกพูดภาษาอังกฤษ รับข้อเสนอแนะ และปรับปรุงผลงาน',
  allCoursesTitle:'ห้องเรียนโครงงาน',allCoursesDesc:'เลือกหัวข้อโครงงานและเริ่มเรียนรู้ตามความสนใจ',searchLabel:'ค้นหาห้องเรียน',searchPlaceholder:'ค้นหาชื่อหรือหัวข้อโครงงาน',noCourses:'ไม่พบโครงงานที่ตรงกับคำค้น',
  backCourses:'กลับไปห้องเรียน',notebookHeading:'สมุดบันทึกการเรียนรู้',notebookDesc:'บันทึกแนวคิดไว้เฉพาะบนอุปกรณ์นี้ ไม่ใช่การส่งงานหรือคะแนนทางการ',
  clearClassNotes:'ล้างบันทึกของโครงงานนี้',mySpace:'MY LEARNING SPACE',profileTitle:'พื้นที่ของฉัน',profileIntro:'ตั้งค่าการแสดงผลและชื่อเล่นบนอุปกรณ์นี้เท่านั้น',
  aliasLabel:'ชื่อเล่น (ไม่จำเป็นต้องใช้ชื่อจริง)',aliasPlaceholder:'เช่น Little Explorer',avatarLabel:'สัญลักษณ์แทนตัว',
  avatarStar:'🌟 ดาว',avatarFlower:'🌻 ดอกไม้',avatarCompass:'🧭 นักสำรวจ',avatarArt:'🎨 นักสร้างสรรค์',avatarScience:'🔬 นักวิทยาศาสตร์',avatarSeed:'🌱 ต้นอ่อน',
  languageLabel:'ภาษาของระบบ',fontScaleLabel:'ขนาดตัวอักษร',normalFont:'ปกติ',largeFont:'ใหญ่',saveProfile:'บันทึกการตั้งค่า',
  privacyTipTitle:'ใช้เครื่องร่วมกันอย่างปลอดภัย',privacyTip:'ชื่อเล่นและโน้ตที่เก็บในเบราว์เซอร์อาจปรากฏให้ผู้ใช้เครื่องเดียวกันเห็นได้',
  clearAll:'ล้างชื่อเล่นและบันทึกในเครื่อง',noCloud:'ไม่มีการซิงก์ข้อมูลไปยังระบบของโรงเรียน',
  shareEyebrow:'CLASSROOM INVITE',shareTitle:'ลิงก์และ QR ห้องเรียน',shareIntro:'เลือกหัวข้อโครงงาน แล้วคัดลอกลิงก์หรือแสดง QR ได้ทันที',
  shareChoose:'เลือกห้องเรียน',copyLink:'คัดลอกลิงก์ห้องเรียน',printQR:'พิมพ์ QR',qrLabel:'QR Code สำหรับเข้าห้องเรียน',shareHomeTitle:'ลิงก์หน้าแรกของระบบ',copyHomeLink:'คัดลอกลิงก์หน้าแรก',
  aboutTitle:'เกี่ยวกับระบบ',aboutLead:'พื้นที่สำหรับเรียนรู้ภาษาอังกฤษผ่านโครงงานตัวอย่างระดับ ป.5–6',
  scopeTitle:'ขอบเขตการใช้งาน',scopeBody:'ระบบนี้แสดงบทเรียนตัวอย่าง ไม่เชื่อมทะเบียนนักเรียนหรือคะแนนของโรงเรียน',
  privacyTitle:'การเก็บข้อมูล',privacyBody:'ชื่อเล่นและบันทึกของผู้เรียนเก็บในเบราว์เซอร์บนอุปกรณ์นี้เท่านั้น',
  languagePolicyTitle:'การเรียนรู้สองภาษา',languagePolicyBody:'เปลี่ยนภาษาไทยหรืออังกฤษได้ทุกหน้า แต่ประโยคฝึกสื่อสารภาษาอังกฤษยังคงเป็นภาษาอังกฤษเพื่อการเรียนรู้',
  footerScope:'ห้องเรียนโครงงานตัวอย่าง · ไม่มีระบบส่งงานหรือคะแนนทางการ',
  courseLabel:'โครงงานภาษาอังกฤษ · ป.5–6',courseOpen:'เข้าสู่โครงงาน',phaseCount:'กิจกรรม',lessonStep:'ขั้นที่',lessonPrompt:'คำถามฝึกภาษาอังกฤษ',lessonTranslation:'ความหมาย',sentenceFrame:'ตัวอย่างประโยค',ideaLabel:'แนวคิดและคำตอบของฉัน',
  notePlaceholder:'พิมพ์แนวคิดสั้น ๆ ของฉัน…',saveNote:'บันทึกในเครื่องนี้',savedProgress:'กิจกรรมที่บันทึกในอุปกรณ์นี้',emptyLesson:'กรุณาเลือกห้องเรียนก่อน',
  shareStatus:'QR นี้เชื่อมไปยังห้องเรียนตัวอย่างบน GitHub Pages โดยไม่มีรหัสประจำตัวนักเรียน',qrUnavailable:'QR ไม่พร้อมใช้งาน โปรดคัดลอกลิงก์แทน',
  copied:'คัดลอกลิงก์แล้ว',copyPrompt:'คัดลอกลิงก์นี้',saved:'บันทึกในอุปกรณ์แล้ว',profileSaved:'บันทึกการตั้งค่าแล้ว',
  storageBlocked:'เบราว์เซอร์นี้ไม่อนุญาตให้เก็บบันทึก',noteTooLong:'บันทึกยาวเกิน 1,000 ตัวอักษร',aliasTooLong:'ชื่อเล่นยาวเกิน 24 ตัวอักษร',
  cleared:'ล้างบันทึกของโครงงานแล้ว',allCleared:'ล้างข้อมูลในอุปกรณ์แล้ว',confirmClear:'ต้องการล้างบันทึกของโครงงานนี้หรือไม่?',confirmAll:'ล้างชื่อเล่นและบันทึกทุกโครงงานในอุปกรณ์นี้หรือไม่?',
  searchEmpty:'ไม่พบโครงงาน',coursePreview:'บทเรียนตัวอย่าง',getStarted:'เริ่มเรียน',noUserData:'ข้อมูลในเบราว์เซอร์นี้เท่านั้น'
 },
 en: {
  documentTitle:'Project Learning Classroom | T3 PBL Classroom V7',metaDescription:'English project-based learning classroom for Grades 5–6',
  skip:'Skip to main content',brandSub:'Project Learning Classroom · Grades 5–6',primaryNav:'Main navigation',languageSelect:'Choose the interface language',
  navHome:'Home',navCourses:'Projects',navHow:'How it works',navProfile:'My space',navShare:'Share / QR',navAbout:'About',menu:'Menu',openMenu:'Open menu',closeMenu:'Close menu',
  heroEyebrow:'PROJECT-BASED ENGLISH · GRADES 5–6',heroTitle:'Project Learning Classroom',
  heroDescription:'Learn English by asking questions, exploring ideas, creating products and sharing what you discover through projects.',
  exploreProjects:'Explore projects',howItWorks:'How it works',skillCommunicate:'Communicate in English',skillInquiry:'Learn through inquiry',
  pathHeading:'Your learning journey',pathAsk:'Ask a question',pathExplore:'Explore and investigate',pathCreate:'Design and create',pathShare:'Present and reflect',
  learningSummary:'Learning summary on this device',sampleProjects:'Sample projects',savedNotes:'Notes on this device',openClassQR:'Open classroom QR',
  courseEyebrow:'EXPLORE PROJECTS',coursesHeading:'Choose a project',courseIntro:'Pick a topic, practise English and record your own ideas.',viewAll:'View all projects',
  pathEyebrow:'HOW IT WORKS',pathTitle:'Four steps in a project',pathIntro:'Simple learning activities to think, communicate and make something meaningful.',
  pathAskDesc:'Notice a problem or something interesting, then write a question to investigate.',pathExploreDesc:'Gather information from suitable sources and discuss ideas.',
  pathCreateDesc:'Test and improve ideas, then create something that communicates a message.',pathShareDesc:'Practise presenting in English, receive feedback and revise your work.',
  allCoursesTitle:'Project classrooms',allCoursesDesc:'Choose a project topic and learn at your own pace.',searchLabel:'Search projects',searchPlaceholder:'Search projects by title or topic',noCourses:'No projects match your search.',
  backCourses:'Back to projects',notebookHeading:'My learning notebook',notebookDesc:'Your ideas are stored on this device only. This is not official homework submission or grading.',
  clearClassNotes:'Clear notes for this project',mySpace:'MY LEARNING SPACE',profileTitle:'My space',profileIntro:'Set a nickname and display preferences for this device.',
  aliasLabel:'Nickname (do not use your real name)',aliasPlaceholder:'e.g. Little Explorer',avatarLabel:'Choose an avatar',
  avatarStar:'🌟 Star',avatarFlower:'🌻 Flower',avatarCompass:'🧭 Explorer',avatarArt:'🎨 Creator',avatarScience:'🔬 Scientist',avatarSeed:'🌱 Seedling',
  languageLabel:'Interface language',fontScaleLabel:'Text size',normalFont:'Normal',largeFont:'Large',saveProfile:'Save preferences',
  privacyTipTitle:'Stay safe on shared devices',privacyTip:'Your nickname and notes may be visible to other people using this browser on the same device.',
  clearAll:'Clear nickname and all notes',noCloud:'This page does not sync notes to the school system.',
  shareEyebrow:'CLASSROOM INVITE',shareTitle:'Class links and QR codes',shareIntro:'Choose a project, then copy its link or show its QR code.',
  shareChoose:'Choose a project',copyLink:'Copy class link',printQR:'Print QR',qrLabel:'QR code for the classroom',shareHomeTitle:'Classroom home link',copyHomeLink:'Copy home link',
  aboutTitle:'About this classroom',aboutLead:'English project-based learning samples for Grades 5–6.',
  scopeTitle:'What this site does',scopeBody:'This site shows sample lessons. It does not connect to school rosters or grades.',
  privacyTitle:'Where notes are stored',privacyBody:'Nicknames and learning notes stay in this browser on the current device.',
  languagePolicyTitle:'Bilingual learning',languagePolicyBody:'You can switch the whole interface between Thai and English. English practice sentences stay in English because they are part of the learning task.',
  footerScope:'Sample project classroom · no official submission or gradebook',
  courseLabel:'English project · Grades 5–6',courseOpen:'Open project',phaseCount:'activities',lessonStep:'Step',lessonPrompt:'English practice question',lessonTranslation:'Meaning',sentenceFrame:'Useful sentence',ideaLabel:'My idea and answer',
  notePlaceholder:'Write a short idea or reflection…',saveNote:'Save on this device',savedProgress:'activities saved on this device',emptyLesson:'Choose a project to begin.',
  shareStatus:'This QR links to a sample classroom on GitHub Pages. It contains no student identity.',qrUnavailable:'QR code is unavailable. Please copy the link instead.',
  copied:'Link copied',copyPrompt:'Copy this link',saved:'Saved on this device',profileSaved:'Preferences saved',
  storageBlocked:'This browser does not allow local note storage.',noteTooLong:'Notes must be 1,000 characters or fewer.',aliasTooLong:'Nicknames must be 24 characters or fewer.',
  cleared:'Project notes cleared',allCleared:'Local nickname and notes cleared',confirmClear:'Clear all notes for this project?',confirmAll:'Clear your nickname and all project notes on this device?',
  searchEmpty:'No projects found',coursePreview:'Sample lesson',getStarted:'Start learning',noUserData:'Local browser data only'
 }
};
const CATALOG = [
 {id:'clean-school',icon:'🌱',title:{th:'โรงเรียนสะอาดและน่าอยู่',en:'Our Clean & Green School'},englishTitle:'Our Clean & Green School',
  desc:{th:'สำรวจปัญหาในโรงเรียนและออกแบบวิธีแก้ไขด้วยภาษาอังกฤษ',en:'Explore a school issue and propose a solution in English.'},
  topic:{th:'เราจะช่วยทำให้โรงเรียนสะอาด ปลอดภัย และน่าอยู่ขึ้นได้อย่างไร?',en:'How can we make our school cleaner, safer and happier?'},
  phases:[
   {id:'observe',title:{th:'สังเกตและตั้งคำถาม',en:'Observe & Ask'},prompt:'What problem can you see?',translation:'คุณพบปัญหาอะไรบ้าง?',frame:'I can see…',task:{th:'สังเกตบริเวณโรงเรียน แล้วเลือกหนึ่งปัญหามาอธิบาย',en:'Observe a school area and describe one problem.'}},
   {id:'investigate',title:{th:'สำรวจและค้นหาสาเหตุ',en:'Investigate'},prompt:'Why does this problem happen?',translation:'ทำไมจึงเกิดปัญหานี้?',frame:'Because…',task:{th:'สอบถามหรือสำรวจสาเหตุอย่างปลอดภัย',en:'Ask questions or investigate possible causes safely.'}},
   {id:'create',title:{th:'ออกแบบแนวคิดแก้ปัญหา',en:'Design a Solution'},prompt:'How can we solve it?',translation:'เราจะแก้ปัญหานี้ได้อย่างไร?',frame:'We can…',task:{th:'วาดแบบร่างและอธิบายวิธีแก้ปัญหาของกลุ่ม',en:'Sketch and explain your team’s possible solution.'}},
   {id:'share',title:{th:'นำเสนอและสะท้อนการเรียนรู้',en:'Share & Reflect'},prompt:'What did you learn?',translation:'คุณได้เรียนรู้อะไร?',frame:'I learned…',task:{th:'นำเสนอแนวคิด รับข้อเสนอแนะ และบอกสิ่งที่ได้เรียนรู้',en:'Present, receive feedback and reflect on your learning.'}}
  ]},
 {id:'my-community',icon:'🧭',title:{th:'ชุมชนแสนพิเศษของฉัน',en:'My Wonderful Community'},englishTitle:'My Wonderful Community',
  desc:{th:'สำรวจสถานที่ในชุมชน แล้วสร้างสื่อภาษาอังกฤษแนะนำสถานที่',en:'Explore a local place and create an English guide.'},
  topic:{th:'สถานที่ใดในชุมชนที่อยากแนะนำให้ผู้อื่นรู้จัก?',en:'Which place in your community would you like to introduce?'},
  phases:[
   {id:'explore',title:{th:'สำรวจสถานที่สำคัญ',en:'Explore Places'},prompt:'What places are important?',translation:'สถานที่ใดมีความสำคัญ?',frame:'There is a…',task:{th:'เลือกสถานที่ในชุมชนที่สนใจ',en:'Choose a place you want to explore.'}},
   {id:'investigate',title:{th:'ค้นหาจุดเด่นของสถานที่',en:'Discover What Is Special'},prompt:'What makes this place special?',translation:'สถานที่นี้มีอะไรพิเศษ?',frame:'It is…',task:{th:'รวบรวมข้อมูลจากแหล่งที่น่าเชื่อถือ',en:'Find information from reliable sources.'}},
   {id:'create',title:{th:'สร้างสื่อแนะนำสถานที่',en:'Create a Place Guide'},prompt:'What will you share?',translation:'คุณจะแบ่งปันข้อมูลอะไร?',frame:'You can…',task:{th:'สร้างโปสเตอร์หรือแผ่นพับภาษาอังกฤษ',en:'Create a simple English poster or guide.'}},
   {id:'reflect',title:{th:'นำเสนอและสะท้อนคิด',en:'Present & Reflect'},prompt:'What did you learn?',translation:'คุณได้เรียนรู้อะไร?',frame:'I learned…',task:{th:'นำเสนอสื่อ รับข้อเสนอแนะ และบันทึกข้อคิด',en:'Present your guide, receive feedback and reflect.'}}
  ]}
];
const ALL_VIEWS = ['home','classes','lesson','profile','share','about'];

const safeLocal = {
 get(key){try{return localStorage.getItem(key)}catch(e){return null}},
 set(key,val){try{localStorage.setItem(key,val);return true}catch(e){return false}},
 del(key){try{localStorage.removeItem(key)}catch(e){}}
};
let locale='th',currentView='home',currentClass='',shareClass='clean-school',drafts={},toastTimeout=null,searchTerm='';
const t = key => dict[locale][key] ?? dict.th[key] ?? key;
const prop=(obj)=>obj[locale] ?? obj.th ?? obj.en ?? '';
const node=(tag,txt,cls)=>{const el=document.createElement(tag);if(txt!==undefined&&txt!==null)el.textContent=txt;if(cls)el.className=cls;return el};
function toast(key){const el=$('toast');if(!el)return;el.textContent=t(key);el.hidden=false;clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>el.hidden=true,2700)}
function storageSet(key,val){if(!safeLocal.set(key,val)){toast('storageBlocked');return false}return true}
function countNotes(){
 return CATALOG.reduce((sum,c)=>sum+c.phases.filter(p=>!!(safeLocal.get(NOTE_PREFIX+c.id+'_'+p.id)||'').trim()).length,0);
}
function refreshCounts(){$('courseCount').textContent=String(CATALOG.length);$('notesCount').textContent=String(countNotes())}
function readProfile(){let obj={};try{obj=JSON.parse(safeLocal.get(PROFILE_KEY)||'{}')}catch(e){};return obj&&typeof obj==='object'?obj:{}}
function setFontScale(scale){document.documentElement.dataset.fontScale=scale==='large'?'large':'normal'}
function captureDrafts(){if(currentView!=='lesson'||!currentClass)return;document.querySelectorAll('#lessonList textarea[data-phase]').forEach(a=>{drafts[currentClass+':'+a.dataset.phase]=a.value})}
function syncLanguageUI(){
 document.documentElement.lang=locale;
 document.title=t('documentTitle');
 const meta=document.querySelector('meta[name="description"]');if(meta)meta.content=t('metaDescription');
 document.querySelectorAll('[data-i18n]').forEach(el=>{const key=el.dataset.i18n;el.textContent=t(key)});
 document.querySelectorAll('[data-i18n-aria]').forEach(el=>{el.setAttribute('aria-label',t(el.dataset.i18nAria))});
 document.querySelectorAll('[data-i18n-placeholder]').forEach(el=>{el.setAttribute('placeholder',t(el.dataset.i18nPlaceholder))});
 document.querySelectorAll('[data-set-lang]').forEach(el=>{el.setAttribute('aria-pressed',String(el.dataset.setLang===locale))});
 $('language').value=locale;
}
function setLanguage(next,{save=true}={}){
 if(!['th','en'].includes(next))return;
 captureDrafts();locale=next;
 if(save)safeLocal.set(LANG_KEY,locale);
 syncLanguageUI();refreshCounts();renderCourses();renderLesson();renderShare();renderProfile(false);
}
function renderCourses(){
 function put(container,term){container.replaceChildren();let count=0;const q=(term||'').trim().toLocaleLowerCase();
  CATALOG.forEach(c=>{
   const hay=[c.title.th,c.title.en,c.desc.th,c.desc.en,c.englishTitle].join(' ').toLocaleLowerCase();
   if(q&&!hay.includes(q))return;
   count++;
   const card=node('article',undefined,'course-card');
   const glyph=node('div',c.icon,'course-card__icon');glyph.setAttribute('aria-hidden','true');
   const body=node('div',undefined,'course-card__body');
   body.appendChild(node('span',t('courseLabel'),'course-card__label'));
   body.appendChild(node('h3',prop(c.title)));
   if(locale==='th')body.appendChild(node('p',c.englishTitle,'course-card__english'));
   body.appendChild(node('p',prop(c.desc),'course-card__desc'));
   const bottom=node('div',undefined,'course-card__bottom');
   bottom.appendChild(node('small',c.phases.length+' '+t('phaseCount')));
   const btn=node('button',t('courseOpen')+' →');btn.type='button';
   btn.setAttribute('aria-label',t('courseOpen')+': '+prop(c.title));
   btn.addEventListener('click',()=>openClass(c.id));bottom.appendChild(btn);body.appendChild(bottom);
   card.append(glyph,body);container.appendChild(card);
  });return count;
 }
 put($('homeCourses'),'');
 const found=put($('allCourses'),searchTerm);
 $('noCourses').hidden=!!found;
}
function renderLesson(){
 const wrap=$('lessonList');wrap.replaceChildren();
 const course=CATALOG.find(c=>c.id===currentClass);
 if(!course){$('lessonTitle').textContent=t('emptyLesson');$('lessonDescription').textContent='';$('localProgress').textContent='';return}
 $('classTag').textContent=t('courseLabel');
 $('lessonTitle').textContent=course.icon+'  '+prop(course.title);
 $('lessonDescription').textContent=prop(course.topic);
 course.phases.forEach((p,i)=>{
  const section=node('article',undefined,'lesson-step');
  section.appendChild(node('span',t('lessonStep')+' '+(i+1),'pill'));
  section.appendChild(node('h3',prop(p.title)));
  const prompt=node('p',p.prompt,'prompt');prompt.lang='en';section.appendChild(prompt);
  if(locale==='th'){const translation=node('p',p.translation,'translation');translation.lang='th';section.appendChild(translation)}
  const frame=node('blockquote',p.frame);frame.lang='en';section.appendChild(frame);
  section.appendChild(node('p',prop(p.task),'task'));
  const id='note-'+i;
  const label=node('label',t('ideaLabel'));label.htmlFor=id;section.appendChild(label);
  const field=node('textarea');field.id=id;field.dataset.phase=p.id;field.maxLength=1000;
  field.setAttribute('aria-label',t('ideaLabel')+' · '+prop(p.title));
  field.placeholder=t('notePlaceholder');
  const key=course.id+':'+p.id;
  field.value=Object.prototype.hasOwnProperty.call(drafts,key)?drafts[key]:(safeLocal.get(NOTE_PREFIX+course.id+'_'+p.id)||'');
  field.addEventListener('input',()=>{drafts[key]=field.value});
  section.appendChild(field);
  const save=node('button',t('saveNote'),'button button--outline');save.type='button';
  save.addEventListener('click',()=>{
   if(field.value.length>1000){toast('noteTooLong');return}
   if(storageSet(NOTE_PREFIX+course.id+'_'+p.id,field.value)){drafts[key]=field.value;refreshCounts();updateProgress();toast('saved')}
  });section.appendChild(save);wrap.appendChild(section);
 });
 updateProgress();
}
function updateProgress(){
 const c=CATALOG.find(x=>x.id===currentClass);if(!c)return;
 const n=c.phases.filter(p=>!!(safeLocal.get(NOTE_PREFIX+c.id+'_'+p.id)||'').trim()).length;
 $('localProgress').textContent=n+' / '+c.phases.length+' '+t('savedProgress');
}
function renderProfile(withData=true){
 if(withData){const p=readProfile();$('alias').value=typeof p.alias==='string'?p.alias:'';$('avatar').value=['🌟','🌻','🧭','🎨','🔬','🌱'].includes(p.avatar)?p.avatar:'🌟';$('fontScale').value=p.fontScale==='large'?'large':'normal'}
 $('profileAvatar').textContent=$('avatar').value;
 $('language').value=locale;
 setFontScale($('fontScale').value);
}
function getClassURL(id){if(!CATALOG.some(c=>c.id===id))return'';const u=new URL(BASE);u.searchParams.set('class',id);u.searchParams.set('lang',locale);return u.href}
function renderShare(){
 const select=$('shareClass'),before=select.value||shareClass;select.replaceChildren();
 CATALOG.forEach(c=>{const opt=node('option',prop(c.title));opt.value=c.id;select.appendChild(opt)});
 select.value=CATALOG.some(c=>c.id===before)?before:CATALOG[0].id;shareClass=select.value;
 const u=getClassURL(shareClass),link=$('shareUrl');link.href=u;link.textContent=u;
 $('copyLink').disabled=!u;$('printQR').disabled=!u;
 const qr=$('qr');qr.replaceChildren();
 if(typeof QRCode==='function'&&u){
  new QRCode(qr,{text:u,width:180,height:180,colorDark:'#172b3f',colorLight:'#ffffff',correctLevel:QRCode.CorrectLevel.M});
  $('shareStatus').textContent=t('shareStatus');
 }else{qr.textContent='QR';$('shareStatus').textContent=t('qrUnavailable')}
 const home=new URL(BASE);home.searchParams.set('lang',locale);
 $('homeLink').href=home.href;$('homeLink').textContent=home.href;
}
function copyText(s){
 if(navigator.clipboard&&navigator.clipboard.writeText){return navigator.clipboard.writeText(s).then(()=>toast('copied')).catch(()=>window.prompt(t('copyPrompt'),s))}
 window.prompt(t('copyPrompt'),s);return Promise.resolve();
}
function updateActiveNav(){
 document.querySelectorAll('.nav-button').forEach(btn=>{
  const active=btn.dataset.go===currentView || (currentView==='lesson'&&btn.dataset.go==='classes');
  btn.classList.toggle('is-active',active);
  if(active)btn.setAttribute('aria-current','page');else btn.removeAttribute('aria-current');
 });
}
function closeMenu(){
 $('mobileMenu').hidden=true;$('menuOverlay').hidden=true;$('openMenu').setAttribute('aria-expanded','false');
}
function go(view,{focus=true}={}){
 if(view==='how'){go('home',{focus:false});$('learningPath').scrollIntoView({behavior:'smooth',block:'start'});$('pathTitle').setAttribute('tabindex','-1');$('pathTitle').focus({preventScroll:true});return}
 if(!ALL_VIEWS.includes(view))return;
 if(currentView==='lesson'&&view!=='lesson')captureDrafts();
 currentView=view;
 ALL_VIEWS.forEach(id=>$(id).hidden=id!==view);
 closeMenu();updateActiveNav();
 if(view==='classes')renderCourses();
 if(view==='profile')renderProfile();
 if(view==='share')renderShare();
 if(view==='lesson')renderLesson();
 if(view==='home'){refreshCounts();renderCourses()}
 if(focus){window.scrollTo({top:0,behavior:'instant'});$('main').focus({preventScroll:true})}
}
function openClass(id){if(!CATALOG.some(c=>c.id===id))return;captureDrafts();currentClass=id;go('lesson')}
function boot(){
 const params=new URLSearchParams(window.location.search);
 const langArg=params.get('lang');const p=readProfile();
 const savedLang=safeLocal.get(LANG_KEY);
 locale=['th','en'].includes(langArg)?langArg:(['th','en'].includes(savedLang)?savedLang:(['th','en'].includes(p.language)?p.language:'th'));
 setFontScale(p.fontScale);
 document.querySelectorAll('[data-set-lang]').forEach(b=>b.addEventListener('click',()=>setLanguage(b.dataset.setLang)));
 document.querySelectorAll('[data-go]').forEach(b=>b.addEventListener('click',()=>go(b.dataset.go)));
 $('courseSearch').addEventListener('input',e=>{searchTerm=e.target.value||'';renderCourses()});
 $('openMenu').addEventListener('click',()=>{$('mobileMenu').hidden=false;$('menuOverlay').hidden=false;$('openMenu').setAttribute('aria-expanded','true');$('closeMenu').focus()});
 $('closeMenu').addEventListener('click',()=>{$('openMenu').focus();closeMenu()});
 $('menuOverlay').addEventListener('click',closeMenu);
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('mobileMenu').hidden){closeMenu();$('openMenu').focus()}if(e.key==='Tab'&&!$('mobileMenu').hidden){const items=[...$('mobileMenu').querySelectorAll('button')];const first=items[0],last=items.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}});
 $('avatar').addEventListener('change',()=>{$('profileAvatar').textContent=$('avatar').value});
 $('language').addEventListener('change',()=>setLanguage($('language').value));
 $('fontScale').addEventListener('change',()=>setFontScale($('fontScale').value));
 $('saveProfile').addEventListener('click',()=>{
  const alias=$('alias').value.trim().replace(/[<>\u0000-\u001f]/g,'');
  if(alias.length>24){toast('aliasTooLong');return}
  const data={alias,avatar:$('avatar').value,fontScale:$('fontScale').value,language:locale};
  if(storageSet(PROFILE_KEY,JSON.stringify(data))){setFontScale(data.fontScale);toast('profileSaved')}
 });
 $('clearProfile').addEventListener('click',()=>{
  if(!window.confirm(t('confirmAll')))return;
  safeLocal.del(PROFILE_KEY);CATALOG.forEach(c=>c.phases.forEach(p=>safeLocal.del(NOTE_PREFIX+c.id+'_'+p.id)));
  drafts={};renderProfile();renderLesson();refreshCounts();toast('allCleared');
 });
 $('clearLesson').addEventListener('click',()=>{
  if(!currentClass||!window.confirm(t('confirmClear')))return;
  const c=CATALOG.find(x=>x.id===currentClass);c.phases.forEach(p=>{safeLocal.del(NOTE_PREFIX+c.id+'_'+p.id);delete drafts[c.id+':'+p.id]});
  renderLesson();refreshCounts();toast('cleared');
 });
 $('shareClass').addEventListener('change',()=>{shareClass=$('shareClass').value;renderShare()});
 $('copyLink').addEventListener('click',()=>{const u=getClassURL(shareClass);if(u)copyText(u)});
 $('copyHomeLink').addEventListener('click',()=>copyText($('homeLink').href));
 $('printQR').addEventListener('click',()=>{if(getClassURL(shareClass))window.print()});
 syncLanguageUI();renderProfile();renderCourses();renderShare();refreshCounts();
 const classId=params.get('class');
 if(CATALOG.some(c=>c.id===classId))openClass(classId);
 else go('home',{focus:false});
}
boot();
})();