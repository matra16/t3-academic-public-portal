/* PBL V14 Adaptive Device Layout
   No fingerprinting and no remote AI inference: device family is only a hint.
   The actual responsive decision uses live viewport, safe-area, orientation,
   pointer precision, keyboard, and screen content. */
(() => {
'use strict';
const root=document.documentElement;
const body=document.body;
const $=id=>document.getElementById(id);
const q=(selector,parent=document)=>parent.querySelector(selector);
const qa=(selector,parent=document)=>Array.from(parent.querySelectorAll(selector));
const UA=String(navigator.userAgent||'').toLowerCase();
const MM=query=>window.matchMedia?window.matchMedia(query).matches:false;
const clamp=(n,low,high)=>Math.min(high,Math.max(low,n));
let raf=0;

function detectProfile(){
 const vv=window.visualViewport;
 const width=Math.round(vv?.width||window.innerWidth||root.clientWidth);
 const height=Math.round(vv?.height||window.innerHeight||root.clientHeight);
 const touch=Number(navigator.maxTouchPoints||0)>0;
 const coarse=MM('(pointer:coarse)');
 const orientation=width>height?'landscape':'portrait';
 const reportedMobile=Boolean(navigator.userAgentData?.mobile);
 const tabletUA=/(ipad|tablet|kindle|silk|playbook|android(?!.*mobile))/.test(UA);
 const phoneUA=reportedMobile||/(iphone|ipod|android.*mobile|windows phone|mobi)/.test(UA);
 // Hardware separation desktop vs laptop is intentionally not claimed:
 // browsers do not reliably reveal chassis form factor.
 let family;
 if(tabletUA)family='tablet'; // iPad user agents include "Mobile": tablet takes precedence
 else if(phoneUA)family='phone';
 else if(coarse&&width<=650)family='phone-like';
 else if(coarse&&width<=1300)family='tablet-like';
 else if(width<570)family='compact-window';
 else family='computer';
 const layout=height<=470?(orientation==='landscape'?'short-landscape':'very-short'):
   height<=610?'short':height<=760?'compact':'regular';
 const pointer=coarse?'touch':MM('(pointer:fine)')?'precise':'unknown';
 const focused=document.activeElement;
 const typing=focused&&/^(INPUT|TEXTAREA|SELECT)$/.test(focused.tagName) &&
    !focused.disabled && !focused.readOnly;
 const keyboard=Boolean(typing&&vv&&(window.innerHeight-vv.height)>120);
 return {family,layout,pointer,orientation,width,height,keyboard,screen:
   ['welcome','studentScreen','adminScreen','passwordScreen'].find(id=>!$(id)?.hidden)||'other'};
}
function relocateExplore(p){
 const card=q('#welcome .student-card'),launch=q('#welcome .admin-launch'),explore=q('#welcome .lesson-explore')||q('#welcome .admin-launch > .lesson-explore');
 if(!card||!launch||!explore)return;
 const inline=p.orientation==='landscape'&&p.height<=520&&p.width>=600;
 if(inline && explore.parentNode!==launch)launch.insertBefore(explore,launch.firstChild);
 else if(!inline && explore.parentNode!==card)card.append(explore);
}
function applyProfile(){
 raf=0;
 const p=detectProfile();
 relocateExplore(p);
 root.dataset.deviceFamily=p.family;
 root.dataset.screenLayout=p.layout;
 root.dataset.pointerMode=p.pointer;
 root.dataset.orientation=p.orientation;
 root.dataset.activeScreen=p.screen;
 body.dataset.keyboardOpen=p.keyboard?'true':'false';
 root.style.setProperty('--v14-height',p.height+'px');
 root.style.setProperty('--v14-width',p.width+'px');
 root.style.setProperty('--v14-ui',String(clamp(Math.min(p.width/390,p.height/735),.8,1.08)));
 root.style.setProperty('--v14-foot-h',p.height<620?'31px':'44px');
 return p;
}
function scheduleProfile(){if(!raf)raf=requestAnimationFrame(applyProfile)}

function addStepPicker(){
 const steps=$('stepList'),sidebar=q('#studentScreen .sidebar');
 if(!steps||!sidebar||$('v14StepSelect'))return;
 const wrapper=document.createElement('div');
 wrapper.className='v14-step-controls';
 wrapper.setAttribute('role','group');
 wrapper.setAttribute('aria-label','นำทางบทเรียน 20 ขั้น');
 const label=document.createElement('label');label.htmlFor='v14StepSelect';label.textContent='เลือกขั้นการเรียนรู้';
 const nav=document.createElement('div');nav.className='v14-step-actions';
 const prev=document.createElement('button'),picker=document.createElement('select'),next=document.createElement('button');
 prev.type='button';prev.id='v14PrevStep';prev.textContent='ก่อนหน้า';
 picker.id='v14StepSelect';picker.setAttribute('aria-label','เลือกบทเรียนที่ปลดล็อกแล้ว');
 next.type='button';next.id='v14NextStep';next.textContent='ถัดไป';
 nav.append(prev,picker,next);wrapper.append(label,nav);sidebar.insertBefore(wrapper,steps);
 steps.setAttribute('aria-hidden','true');
 function sync(){
  const existing=qa('button.step',steps);
  if(!existing.length){picker.replaceChildren();prev.disabled=next.disabled=true;return}
  const active=Math.max(0,existing.findIndex(el=>el.getAttribute('aria-current')==='step'));
  picker.replaceChildren();
  existing.forEach((item,i)=>{
   const opt=document.createElement('option');opt.value=String(i);opt.disabled=item.disabled;
   const clean=item.textContent.replace(/^\s*\d{1,2}\s*/,'').trim();
   opt.textContent=String(i+1).padStart(2,'0')+' · '+clean.slice(0,55);
   picker.append(opt);
  });
  picker.value=String(active);
  prev.disabled=active===0||Boolean(existing[active-1]?.disabled);
  next.disabled=active===existing.length-1||Boolean(existing[active+1]?.disabled);
  picker.disabled=false;
 }
 const go=index=>{
  const item=qa('button.step',steps)[index];
  if(item&&!item.disabled){item.click();requestAnimationFrame(sync)}
 };
 prev.addEventListener('click',()=>go(Number(picker.value)-1));
 next.addEventListener('click',()=>go(Number(picker.value)+1));
 picker.addEventListener('change',()=>go(Number(picker.value)));
 let updatePending=false;
 new MutationObserver(()=>{
  if(updatePending)return;updatePending=true;
  requestAnimationFrame(()=>{updatePending=false;sync();scheduleProfile()});
 }).observe(steps,{childList:true});
 sync();
}

function addAdminPanelTabs(){
 const screen=$('adminScreen'),grid=q('.admin-grid',screen),overview=q('.group-overview',screen);
 if(!screen||!grid||!overview||$('v14AdminTabs'))return;
 const panels=qa(':scope > .panel',grid);
 if(panels.length<3)return;
 const tabs=document.createElement('nav');tabs.id='v14AdminTabs';tabs.className='v14-admin-tabs';
 tabs.setAttribute('role','tablist');tabs.setAttribute('aria-label','ส่วนจัดการห้องเรียน');
 const all=[...panels,overview],labels=['เพิ่มนักเรียน','กำหนดกลุ่ม','บัญชีผู้เรียน','กลุ่มที่จัดแล้ว'];
 const buttons=all.map((panel,index)=>{
  panel.id=panel.id||('v14AdminPanel'+index);
  panel.setAttribute('role','tabpanel');
  panel.setAttribute('aria-labelledby','v14AdminTab'+index);
  const b=document.createElement('button');b.type='button';b.id='v14AdminTab'+index;
  b.textContent=labels[index];b.setAttribute('role','tab');b.setAttribute('aria-controls',panel.id);
  tabs.append(b);return b;
 });
 screen.insertBefore(tabs,grid);
 let active=0;
 function select(index){
  active=clamp(index,0,all.length-1);
  all.forEach((panel,i)=>{
    panel.classList.toggle('v14-active-panel',i===active);
    panel.setAttribute('aria-hidden',i===active?'false':'true');
    buttons[i].setAttribute('aria-selected',i===active?'true':'false');
    buttons[i].tabIndex=i===active?0:-1;
  });
  scheduleProfile();
 }
 buttons.forEach((btn,i)=>{
  btn.addEventListener('click',()=>select(i));
  btn.addEventListener('keydown',e=>{
   if(e.key!=='ArrowLeft'&&e.key!=='ArrowRight'&&e.key!=='Home'&&e.key!=='End')return;
   e.preventDefault();
   const next=e.key==='Home'?0:e.key==='End'?buttons.length-1:
     (i+(e.key==='ArrowRight'?1:-1)+buttons.length)%buttons.length;
   select(next);buttons[next].focus();
  });
 });
 select(0);
}

function init(){
 addStepPicker();
 addAdminPanelTabs();
 applyProfile();
 ['resize','orientationchange','pageshow'].forEach(evt=>window.addEventListener(evt,scheduleProfile,{passive:true}));
 if(window.visualViewport){
  window.visualViewport.addEventListener('resize',scheduleProfile,{passive:true});
  window.visualViewport.addEventListener('scroll',scheduleProfile,{passive:true});
 }
 document.addEventListener('focusin',scheduleProfile,true);
 document.addEventListener('focusout',scheduleProfile,true);
 const observed=['welcome','studentScreen','adminScreen','passwordScreen','adminBackdrop','secretDialog'];
 const targets=observed.map($).filter(Boolean);
 const mutations=new MutationObserver(scheduleProfile);
 targets.forEach(el=>mutations.observe(el,{attributes:true,attributeFilter:['hidden','class']}));
 // Keep title/fields readable as installed fonts and device zoom become available.
 if(document.fonts?.ready)document.fonts.ready.then(scheduleProfile).catch(()=>{});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
else init();
// Inspectable, no-user-PII diagnostic. Deliberately does not persist or send data.
Object.defineProperty(window,'PBLV14Layout',{value:Object.freeze({profile:()=>({...detectProfile()})}),configurable:false});
})();
