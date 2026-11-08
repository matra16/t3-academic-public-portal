/* PBL V14.1 — Focus manager and immediate-search affordances.
   Local browser only; no tracking, no credential or roster persistence. */
(() => {
'use strict';
const $=id=>document.getElementById(id);
const q=(selector,parent=document)=>parent?.querySelector(selector);
const visible=el=>Boolean(el && el.isConnected && !el.disabled &&
  !el.closest('[hidden]') && el.getClientRects().length);
const focus=el=>{
 if(!visible(el))return false;
 try{el.focus({preventScroll:true})}catch(e){el.focus()}
 return document.activeElement===el;
};
let lastScreen='',lastOverlay='',queued=false;
function screenName(){
 return ['welcome','studentScreen','adminScreen','passwordScreen'].find(id=>!$(id)?.hidden)||'other';
}
function overlayName(){
 if($('secretDialog')&&!$('secretDialog').hidden)return 'secret';
 if($('adminBackdrop')&&!$('adminBackdrop').hidden)return 'admin';
 return '';
}
function focusScreen(id){
 if(id==='welcome')focus($('studentSearch'));
 if(id==='studentScreen')focus($('v14StepSelect')||$('changeStudentPass'));
 if(id==='adminScreen')focus(q('#v14AdminTabs [aria-selected=true]')||$('changeAdminPass'));
 if(id==='passwordScreen')focus($('oldPassword'));
}
function focusOverlay(id){
 if(id==='admin'){
  // On public static Pages passwords are disabled; focus the real usable action.
  // With owner-approved backend, focus the actual Admin password input.
  focus(visible($('adminPassword'))?$('adminPassword'):$('demoAdminBtn')||$('closeAdmin'));
 }
 if(id==='secret')focus($('hideSecret'));
}
function sync(){
 queued=false;
 const screen=screenName(),overlay=overlayName();
 const screenChanged=screen!==lastScreen;
 const overlayChanged=overlay!==lastOverlay;
 const overlayClosed=lastOverlay&&!overlay;
 lastScreen=screen;lastOverlay=overlay;
 if(overlay){if(overlayChanged)focusOverlay(overlay);return}
 if(screenChanged){focusScreen(screen);return}
 // On closing the dialog, preserve the trigger focus restored by the controller.
 if(overlayClosed)return;
}
function schedule(){
 if(queued)return;queued=true;
 requestAnimationFrame(()=>requestAnimationFrame(sync));
}
function improveSearch(){
 const input=$('studentSearch'),box=$('searchResults');
 if(!input||!box)return;
 const wrapper=input.closest('.field-with-icon');
 if(wrapper&&!$('clearStudentQuery')){
  const clear=document.createElement('button');
  clear.type='button';clear.id='clearStudentQuery';clear.textContent='×';
  clear.hidden=true;clear.title='ล้างคำค้นหา';clear.setAttribute('aria-label','ล้างข้อความค้นหาชื่อ');
  wrapper.append(clear);
  clear.addEventListener('click',()=>{
   input.value='';input.dispatchEvent(new Event('input',{bubbles:true}));
   focus(input);
  });
 }
 const status=document.createElement('p');status.id='searchStatus';
 status.setAttribute('role','status');status.setAttribute('aria-live','polite');
 status.hidden=true;box.after(status);
 function refresh(){
  const text=input.value.trim(),names=box.querySelectorAll('[role=option]');
  const clear=$('clearStudentQuery');
  if(clear)clear.hidden=!text||!$('studentSelection').hidden;
  const shouldShow=Boolean(text&&names.length&&!box.hidden);
  status.hidden=!shouldShow;
  if(shouldShow)status.textContent='พบ '+names.length+' รายชื่อ — เลือกชื่อของตนเอง';
  else status.textContent='';
 }
 input.addEventListener('input',refresh);
 new MutationObserver(refresh).observe(box,{childList:true,attributes:true,attributeFilter:['hidden']});
 new MutationObserver(refresh).observe($('studentSelection'),{attributes:true,attributeFilter:['hidden']});
 refresh();
}
function panelAutofocus(){
 const tabs=$('v14AdminTabs');
 if(tabs){
  tabs.addEventListener('click',e=>{
   const button=e.target.closest('[role=tab]');
   if(!button)return;
   // Focus the first actionable control in the chosen panel, otherwise retain tab focus.
   requestAnimationFrame(()=>requestAnimationFrame(()=>{
    const panel=$(button.getAttribute('aria-controls'));
    if(!panel || panel.getAttribute('aria-hidden')==='true')return;
    const candidate=q('input:not([disabled]):not([readonly]),select:not([disabled]),textarea:not([disabled]),button:not([disabled])',panel);
    if(!focus(candidate))focus(button);
   }));
  });
 }
 const chooser=$('v14StepSelect');
 if(chooser){
  chooser.addEventListener('change',()=>requestAnimationFrame(()=>focus(chooser)));
 }
}
function init(){
 improveSearch();panelAutofocus();
 const ids=['welcome','studentScreen','adminScreen','passwordScreen','adminBackdrop','secretDialog'];
 const observer=new MutationObserver(schedule);
 ids.map($).filter(Boolean).forEach(el=>observer.observe(el,{attributes:true,attributeFilter:['hidden']}));
 document.addEventListener('keydown',e=>{
  if(e.key==='/'&&!e.ctrlKey&&!e.altKey&&!e.metaKey){
   const active=document.activeElement;
   const alreadyEditing=active&&/^(INPUT|TEXTAREA|SELECT)$/.test(active.tagName);
   if(!alreadyEditing&&screenName()==='welcome'&&!overlayName()){
    e.preventDefault();focus($('studentSearch'));
   }
  }
 });
 schedule();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
else init();
})();
