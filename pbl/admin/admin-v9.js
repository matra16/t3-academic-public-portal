(()=>{'use strict';
const el=id=>document.getElementById(id),all=q=>[...document.querySelectorAll(q)];
const REPO_EDITOR='https://github.com/matra16/t3-academic-public-portal/edit/main/pbl/assets/v9.public.json';
const ALLOWED_PANELS=new Set(['overview','settings','student','security']);
const DEFAULT_CONFIG=Object.freeze({version:9,uiLanguageSwitchEnabled:true,defaultUiLanguage:'th',aiExpertEnabled:false,centralActivityLogEnabled:false,cloudGroupSyncEnabled:false,videoUploadsEnabled:false,changedBy:'authenticated-github-repository-contributor-only',scope:'public-ui-config; editing requires Github repo access; protected admin RBAC is not enabled'});
let staged=structuredClone(DEFAULT_CONFIG),loaded=false;
function status(t){el('settingsStatus').textContent=t}
function goto(panel){
 if(!ALLOWED_PANELS.has(panel))panel='overview';
 all('.panel').forEach(n=>n.hidden=n.id!=='panel-'+panel);
 all('[data-panel]').forEach(n=>{const active=n.dataset.panel===panel;n.classList.toggle('selected',active);active?n.setAttribute('aria-current','page'):n.removeAttribute('aria-current')});
 if(location.hash!=='#'+panel)history.replaceState(null,'','#'+panel);
 window.scrollTo({top:0,behavior:'instant'});
}
function sanitizePublishedConfig(value){
 if(value===null||typeof value!=='object'||Array.isArray(value)||value.version!==9)throw Error('INVALID_V9_PUBLIC_CONFIG');
 return {
  version:9,uiLanguageSwitchEnabled:value.uiLanguageSwitchEnabled!==false,
  defaultUiLanguage:['th','en'].includes(value.defaultUiLanguage)?value.defaultUiLanguage:'th',
  // Privileged switches must stay disabled in all published public configs.
  aiExpertEnabled:false,centralActivityLogEnabled:false,cloudGroupSyncEnabled:false,videoUploadsEnabled:false,
  changedBy:DEFAULT_CONFIG.changedBy,scope:DEFAULT_CONFIG.scope
 };
}
function render(){
 el('langEnabled').checked=staged.uiLanguageSwitchEnabled;
 el('switchValue').textContent=staged.uiLanguageSwitchEnabled?'เปิด':'ปิด';
 el('defaultLang').value=staged.defaultUiLanguage;
 el('summaryLanguage').textContent=staged.uiLanguageSwitchEnabled?'เปิด':'ปิด';
 el('jsonPreview').value=JSON.stringify(staged,null,2)+'\n';
}
async function load(){
 const url=new URL('../assets/v9.public.json',location.href);
 url.searchParams.set('qa','fresh');
 try{
  const response=await fetch(url,{cache:'no-store',credentials:'omit'});
  if(!response.ok)throw Error('HTTP '+response.status);
  const actual=await response.json();staged=sanitizePublishedConfig(actual);loaded=true;
  render();status('อ่านค่าที่เผยแพร่ได้แล้ว · การแก้ไขในหน้านี้ยังไม่บันทึกลง GitHub');
 }catch(e){
  // Never suggest a live configuration was fetched if it was not verified.
  loaded=false;staged=structuredClone(DEFAULT_CONFIG);render();
  status('ยังอ่าน Config จากเว็บไซต์ไม่ได้ — ค่าในฟอร์มเป็นค่าเริ่มต้นตัวอย่าง ห้ามอ้างว่าเป็นค่าที่เผยแพร่');
 }
}
function setDraft(){
 staged.uiLanguageSwitchEnabled=el('langEnabled').checked;
 staged.defaultUiLanguage=el('defaultLang').value==='en'?'en':'th';
 staged=sanitizePublishedConfig(staged);
 render();status('ค่าที่ปรับเป็นแบบร่างในเบราว์เซอร์เท่านั้น ยังไม่ได้เผยแพร่ · คัดลอก JSON แล้ว Commit ผ่าน GitHub');
}
async function copyDraft(){
 const text=el('jsonPreview').value;
 try{
  await navigator.clipboard.writeText(text);
  status('คัดลอก JSON แล้ว · เปิด GitHub Editor วางแทนเนื้อหาเดิมและ Commit ด้วยบัญชีที่มีสิทธิ์');
 }catch(e){
  const area=el('jsonPreview');area.focus();area.select();
  status('เลือกข้อความ JSON ไว้แล้ว · กด Ctrl+C แล้วเปิด GitHub Editor');
 }
}
function init(){
 el('editGitHub').href=REPO_EDITOR;
 all('[data-panel]').forEach(a=>a.addEventListener('click',event=>{event.preventDefault();goto(a.dataset.panel)}));
 all('[data-go]').forEach(b=>b.addEventListener('click',()=>goto(b.dataset.go)));
 window.addEventListener('hashchange',()=>goto(location.hash.slice(1)));
 el('langEnabled').addEventListener('change',setDraft);
 el('defaultLang').addEventListener('change',setDraft);
 el('copySettings').addEventListener('click',copyDraft);
 el('reloadSettings').addEventListener('click',load);
 goto(location.hash.slice(1)||'overview');load();
}
document.addEventListener('DOMContentLoaded',init);
})();