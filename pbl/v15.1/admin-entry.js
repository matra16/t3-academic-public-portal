/* PBL V15.1 — immediate Admin password entry.
 * Static public Pages: the owner-requested 160114 is a DEMO PIN, not
 * production authentication. It unlocks only synthetic/read-only preview.
 * If an approved GAS server is present, V14.1's existing server-side
 * login handles all actual credentials and this adapter never intercepts.
 */
(() => {
'use strict';
const ADMIN_DEMO_PIN='160114';
const $=id=>document.getElementById(id);
const hasServer=Boolean(window.google?.script?.run);
function init(){
 const form=$('adminLogin');
 const input=$('adminPassword');
 const submit=form?.querySelector('button[type=submit]');
 const open=$('adminEntry');
 const demo=$('demoAdminBtn');
 const note=$('adminPreviewHelp');
 if(!form||!input||!submit||!open)return;
 if(hasServer){
  // Server-side credential verification must never fall back to a public PIN.
  return;
 }
 input.disabled=false;
 input.placeholder='กรอกรหัสผ่าน';
 input.autocomplete='off';
 input.inputMode='numeric';
 input.maxLength=6;
 input.setAttribute('aria-describedby','v151AdminHelp');
 submit.disabled=false;
 submit.textContent='เข้าสู่ระบบผู้ดูแล';
 // Retain the tested synthetic preview route but do not display its
 // alternate button; Admin now enters through the same password form.
 if(demo){
  demo.hidden=true;
  demo.tabIndex=-1;
  demo.setAttribute('aria-hidden','true');
 }
 if(note)note.hidden=true;
 const help=document.createElement('p');
 help.id='v151AdminHelp';
 help.className='v151-admin-help';
 help.textContent='เข้าสู่หน้าจัดการตัวอย่างด้วยรหัสที่ได้รับจากผู้ดูแล';
 form.after(help);
 const result=document.createElement('p');
 result.id='v151AdminFeedback';
 result.className='v151-admin-feedback';
 result.setAttribute('role','alert');
 result.setAttribute('aria-live','polite');
 result.hidden=true;
 help.after(result);
 function feedback(message){
  result.textContent=message;
  result.hidden=!message;
 }
 input.addEventListener('input',()=>feedback(''));
 open.addEventListener('click',()=>{
  feedback('');
  requestAnimationFrame(()=>{
   if(!$('adminBackdrop')?.hidden){
    try{input.focus({preventScroll:true})}catch(e){input.focus()}
   }
  });
 });
 // The Pages build has no account service. This capture listener intercepts
 // the legacy "no backend" submit handler; no entered PIN is sent or saved.
 form.addEventListener('submit',event=>{
  event.preventDefault();
  event.stopImmediatePropagation();
  const typed=input.value;
  if(typed!==ADMIN_DEMO_PIN){
   input.value='';
   feedback('รหัสผ่านไม่ถูกต้อง กรุณากรอกใหม่');
   input.focus({preventScroll:true});
   return;
  }
  input.value='';
  feedback('');
  if(!demo){
   feedback('ยังไม่สามารถเปิดหน้าจัดการตัวอย่างได้');
   return;
  }
  demo.click();
  const workspace=$('adminScreen');
  if(workspace&&!$('v151PreviewNotice')){
   const notice=document.createElement('p');
   notice.id='v151PreviewNotice';
   notice.className='v151-preview-notice';
   notice.textContent='หน้าจัดการตัวอย่าง — ไม่มีรายชื่อนักเรียนจริง และยังไม่สามารถแก้ไขข้อมูลโรงเรียน';
   const head=workspace.querySelector('.dashboard-head');
   if(head)head.after(notice);
   else workspace.prepend(notice);
  }
 },true);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
else init();
})();
