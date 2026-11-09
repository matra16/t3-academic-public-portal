/* PBL LMS V19 ADMIN EXPERIENCE — SYNTHETIC PUBLIC DEMO ONLY.
   Extends the V18.1 admin information architecture, preserving the 20-step curriculum.
   No school data, credentials, backend calls, cookies, external AI, or network writes.
   Client-side demo state MUST NOT be interpreted as authentication or authorization. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const escapeHtml = input => String(input ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const safe = input => String(input ?? '').trim().toLowerCase();
  const INDIVIDUAL = new Set([1, 2, 9, 13, 20]);
  const STEPS = [
    'Project Entry · เริ่มต้นโครงงาน',
    'Challenge & Criteria · โจทย์และเกณฑ์',
    'Team Formation · เตรียมจัดทีม',
    'Role Rotation · หมุนเวียนบทบาท',
    'Project Planning · วางแผนงาน',
    'Site Selection · เลือกสถานที่',
    'Inquiry & Research · สืบค้น',
    'Fact Checking · ตรวจสอบข้อเท็จจริง',
    'English Input · ฝึกภาษา',
    'Scriptwriting · เขียนบท',
    'Storyboard · วาดลำดับภาพ',
    'Production Planning · เตรียมถ่าย',
    'Speaking Rehearsal · ซ้อมพูด',
    'Filming & Audio · ถ่ายทำ',
    'File Management · จัดไฟล์',
    'Editing · ตัดต่อ',
    'Critique & Feedback · รับข้อเสนอแนะ',
    'Revision · ปรับปรุง',
    'Audience & Review · นำเสนอ',
    'Reflection · สะท้อนคิด'
  ];
  const PAGE_INFO = {
    overview: ['ภาพรวมการจัดการ','มองเห็นภาพรวม ติดตามงานสำคัญ และจัดการโครงงานจากศูนย์กลางเดียว'],
    students: ['ผู้เรียนและห้องเรียน','ทะเบียนตัวอย่าง: ค้นหา กรอง และดูภาพรวมรายบุคคล'],
    groups: ['กลุ่มโครงงาน','ตรวจโครงสร้างสมาชิกและความก้าวหน้าของผลงานกลุ่ม'],
    reviews: ['คิวตรวจและข้อเสนอแนะ','การตรวจงานตามเกณฑ์และวงจรปรับปรุงงานอย่างต่อเนื่อง'],
    courses: ['บทเรียนและ 20 ขั้น','ภาพรวม Project-Based Learning VLOG ที่คงโครงสร้างเดิม'],
    analytics: ['ติดตามและรายงาน','รายงานจากข้อมูลสมมติ ไม่แทนคะแนนภาษาอังกฤษ'],
    access: ['บทบาทและสิทธิ์','แผนการกำหนดสิทธิ์แบบ Least Privilege และ Class Scope'],
    audit: ['ประวัติการดำเนินการ','ดูรายการเหตุการณ์จำลองในหน้านี้เท่านั้น'],
    settings: ['ตั้งค่าและความปลอดภัย','ตรวจ Gate ก่อนนำไปเชื่อมต่อระบบโรงเรียนจริง']
  };
  const students = Array.from({length:18},(_,i)=>({
    id:'S'+String(i+1).padStart(3,'0'),
    room:'6.'+(Math.floor(i/6)+1),
    status:[5,11,16].includes(i)?'PAUSED':'ACTIVE',
    completed:Math.min(20,3+((i*7+5)%15)),
    lastActive:'2026-11-'+String(1+(i%9)).padStart(2,'0')
  }));
  const groups = [
    {id:'G-A01',name:'ทีมตัวอย่าง A',room:'6.1',members:['S001','S002','S003','S004'],completed:11},
    {id:'G-B01',name:'ทีมตัวอย่าง B',room:'6.2',members:['S007','S008','S009','S010'],completed:7},
    {id:'G-C01',name:'ทีมตัวอย่าง C',room:'6.3',members:['S013','S014','S015','S016','S017'],completed:15}
  ];
  const titles={PENDING:'รอตรวจ',NEEDS_REVISION:'ให้ปรับปรุง',APPROVED:'ตรวจรับแล้ว'};
  const typeNames={individual:'รายบุคคล',group:'รายกลุ่ม'};
  const seeded = [
    ['W001','S001',1,'individual','PENDING','Our audience is local visitors. We will introduce interesting places.'],
    ['W002','G-A01',4,'group','NEEDS_REVISION','We plan to share tasks. First, we find two sources.'],
    ['W003','G-B01',7,'group','PENDING','This place is important to our community because it is useful.'],
    ['W004','S009',9,'individual','APPROVED','Welcome to our local guide. You can visit the place on weekends.'],
    ['W005','G-C01',12,'group','PENDING','May we record here? We must ask for permission first.'],
    ['W006','S013',13,'individual','NEEDS_REVISION','I can explain our project without reading the whole script.'],
    ['W007','G-A01',17,'group','PENDING','Our feedback says to speak more clearly and verify sources.'],
    ['W008','G-C01',18,'group','APPROVED','We improved our script because the audience needs simple directions.'],
    ['W009','S006',2,'individual','PENDING','Our video will help visitors learn about the community.'],
    ['W010','G-B01',10,'group','PENDING','Scene 1: Hello and welcome. Scene 2: Where is the place?'],
    ['W011','S018',20,'individual','PENDING','I learned how to ask questions. I will practise speaking more.'],
    ['W012','G-A01',8,'group','APPROVED','We checked two sources for the location and opening information.'],
    ['W013','S012',13,'individual','NEEDS_REVISION','I will explain the place using my own English words.'],
    ['W014','G-C01',19,'group','PENDING','Our video will be shared only after receiving school permission.']
  ];
  const reviews = seeded.map(([id,owner,step,type,status,note],i)=>({id,owner,step,type,status,note,room:(owner.startsWith('G')?groups.find(g=>g.id===owner)?.room:students.find(s=>s.id===owner)?.room)||'',revision:1+(i%3),history: status==='PENDING'?[]:[{status,feedback:'ตัวอย่างข้อเสนอแนะจากการตรวจครั้งก่อน (ข้อมูลสมมติ)',at:'DEMO',rubric:{}}]}));
  const state={page:'overview',selectedReview:null,audit:[{label:'เปิดหน้าจอ Admin V19 (ข้อมูลสมมติ)',time:new Date().toISOString()}],studentSort:'id'};
  let toastTimeout=0;
  const localeNum = n=>Number(n||0).toLocaleString('th-TH');
  const percentage = v=>Math.max(0,Math.min(100,Math.round(Number(v)||0)));
  function toast(msg){
    const n=$('toast'); n.textContent=msg; n.hidden=false;
    clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>{n.hidden=true},3500);
  }
  function audit(label){state.audit.unshift({label,time:new Date().toISOString()}); if(state.page==='audit')renderAudit()}
  function badge(status){const color={PENDING:'status-warn',NEEDS_REVISION:'status-blue',APPROVED:'status-ok',ACTIVE:'status-ok',PAUSED:'status-warn'}[status]||'status-gray';return `<span class="status ${color}">${escapeHtml(titles[status]||({ACTIVE:'เข้าร่วม',PAUSED:'ต้องติดตาม'}[status])||status)}</span>`}
  function navigate(page){
    if(!PAGE_INFO[page])return;
    state.page=page;
    $('breadcrumb').textContent=$('pageTitle').textContent=PAGE_INFO[page][0];
    $('pageSubtitle').textContent=PAGE_INFO[page][1];
    document.querySelectorAll('[data-page-panel]').forEach(el=>el.hidden=el.dataset.pagePanel!==page);
    document.querySelectorAll('.nav-btn').forEach(btn=>{
      const active=btn.dataset.page===page;btn.classList.toggle('active',active);
      if(active)btn.setAttribute('aria-current','page');else btn.removeAttribute('aria-current');
    });
    const renders={overview:renderOverview,students:renderStudents,groups:renderGroups,reviews:renderReviews,courses:renderCourses,analytics:renderAnalytics,access:()=>{},audit:renderAudit,settings:()=>{}};
    renders[page](); closeMenu();
    $('workspace').focus({preventScroll:true});window.scrollTo({top:0,behavior:'instant'});
  }
  function openMenu(){ $('sidebar').classList.add('open');$('mobileOverlay').hidden=false;$('menuBtn').setAttribute('aria-expanded','true'); }
  function closeMenu(){ $('sidebar').classList.remove('open');$('mobileOverlay').hidden=true;$('menuBtn').setAttribute('aria-expanded','false'); }
  function renderOverview(){
    const pending=reviews.filter(w=>w.status==='PENDING').length;
    const needs=reviews.filter(w=>w.status==='NEEDS_REVISION').length;
    const data=[['บัญชีผู้เรียนตัวอย่าง',students.length,'♙','จาก 3 ห้องเรียน'],['กลุ่มโครงงานจำลอง',groups.length,'♧','ทีมละ 4–5 คน'],['งานรอตรวจ',pending,'▤','ต้องได้รับข้อเสนอแนะ'],['งานต้องปรับปรุง',needs,'↺','วงจร Revision']];
    $('kpiGrid').innerHTML=data.map(([title,value,symbol,hint])=>`<article class="kpi-card"><div class="kpi-top"><span>${title}</span><span class="kpi-symbol" aria-hidden="true">${symbol}</span></div><strong class="kpi-value">${localeNum(value)}</strong><span class="kpi-bottom">${hint}</span></article>`).join('');
    $('overviewChart').innerHTML=['6.1','6.2','6.3'].map(room=>{
      const ss=students.filter(s=>s.room===room);const pct=percentage(ss.reduce((sum,s)=>sum+s.completed,0)/(ss.length*20)*100);
      return `<div class="bar-item"><span class="bar-label">ป.${escapeHtml(room.replace('.', '/'))}</span><div class="bar-rail" aria-label="${pct} เปอร์เซ็นต์"><div class="bar-fill" style="width:${pct}%"></div></div><span class="bar-value">${pct}%</span></div>`
    }).join('');
    $('priorityList').innerHTML=reviews.filter(w=>w.status!=='APPROVED').slice(0,4).map(w=>`<div class="priority-row"><span class="priority-dot" aria-hidden="true">!</span><div class="priority-copy"><strong>${escapeHtml(w.id)} · ขั้น ${w.step}</strong><small>${escapeHtml(w.owner)} · ${escapeHtml(titles[w.status])}</small></div><button type="button" data-open-review="${w.id}">ตรวจงาน</button></div>`).join('') || '<p class="empty-state">ไม่มีงานที่ต้องดำเนินการ</p>';
    updateCount();
  }
  function updateCount(){ $('reviewCountNav').textContent=String(reviews.filter(w=>w.status==='PENDING').length); }
  function filteredStudents(){let items=students.filter(s=>(!$('studentRoom').value||s.room===$('studentRoom').value)&&(!$('studentStatus').value||s.status===$('studentStatus').value)&&(!safe($('studentSearchV19').value)||safe(s.id).includes(safe($('studentSearchV19').value))));return items.sort((a,b)=>state.studentSort==='completed'?b.completed-a.completed:a.id.localeCompare(b.id))}
  function renderStudents(){
    const items=filteredStudents();$('studentTotal').textContent=`แสดง ${items.length} / ${students.length} รายการ`;
    $('studentTable').innerHTML=`<table class="data-table"><thead><tr><th scope="col"><button class="text-link" data-sort="id">รหัสตัวอย่าง ↕</button></th><th scope="col">ห้องเรียน</th><th scope="col">สถานะ</th><th scope="col"><button class="text-link" data-sort="completed">กิจกรรมที่บันทึก ↕</button></th><th scope="col">เข้าร่วมล่าสุด</th><th scope="col">รายละเอียด</th></tr></thead><tbody>${items.map(s=>`<tr><th scope="row"><span class="code-label">${s.id}</span><br><span class="small-muted">ผู้เรียนสมมติ</span></th><td>ป.${escapeHtml(s.room.replace('.','/'))}</td><td>${badge(s.status)}</td><td>${s.completed} / 20<div class="tiny-bar"><span style="width:${percentage(s.completed/20*100)}%"></span></div></td><td>${s.lastActive}</td><td><button type="button" class="table-button" data-student="${s.id}">ดูข้อมูล</button></td></tr>`).join('') || '<tr><td colspan="6" class="empty-state">ไม่พบรายการตรงกับเงื่อนไข</td></tr>'}</tbody></table>`;
  }
  function showStudent(id){
    const s=students.find(x=>x.id===id);if(!s)return;
    const g=groups.find(g=>g.members.includes(s.id));
    $('detailTitle').textContent=`ผู้เรียนตัวอย่าง ${s.id}`;
    $('dialogBody').innerHTML=`<p class="metric-note">ตัวอย่างเท่านั้น · ไม่มีชื่อหรือตัวตนของนักเรียนจริง</p>${[['รหัส',s.id],['ห้องเรียน','ป.'+s.room.replace('.','/')],['สถานะ',s.status==='ACTIVE'?'เข้าร่วม':'ต้องติดตาม'],['กลุ่ม',g?.name||'ยังไม่จัดกลุ่ม'],['กิจกรรมที่บันทึก',s.completed+' / 20'],['หลักฐานการประเมินรายบุคคล','ต้องตรวจโดยครู']].map(([a,b])=>`<div class="dialog-line"><span>${escapeHtml(a)}</span><span>${escapeHtml(b)}</span></div>`).join('')}`;
    $('detailDialog').showModal();
  }
  function validateGroups(){
    const seen=new Set(),fail=[];
    groups.forEach(g=>{
      if(g.members.length<4||g.members.length>5)fail.push(`${g.id}: สมาชิกไม่ใช่ 4–5 คน`);
      if(new Set(g.members).size!==g.members.length)fail.push(`${g.id}: สมาชิกซ้ำ`);
      g.members.forEach(id=>{
        const s=students.find(x=>x.id===id);
        if(!s||s.room!==g.room)fail.push(`${g.id}: พบสมาชิกต่างห้อง/ไม่มีรหัส`);
        if(seen.has(id))fail.push(`${g.id}: สมาชิก ${id} อยู่หลายกลุ่ม`);
        seen.add(id);
      });
    });return fail;
  }
  function renderGroups(){
    $('groupGrid').innerHTML=groups.map(g=>`<article class="group-card"><div class="group-head"><span class="group-mark" aria-hidden="true">♧</span><span class="status status-ok">${g.members.length} สมาชิก</span></div><h3>${escapeHtml(g.name)}</h3><small>${g.id} · ห้อง ป.${escapeHtml(g.room.replace('.','/'))}</small><div class="member-chips">${g.members.map(id=>`<span class="member-chip">${escapeHtml(id)}</span>`).join('')}</div><div class="group-foot"><span>ขั้นที่บันทึก ${g.completed} / 20</span><strong>${percentage(g.completed/20*100)}%</strong></div><div class="tiny-bar"><span style="width:${percentage(g.completed/20*100)}%"></span></div></article>`).join('');
    const problems=validateGroups(); $('groupValidation').textContent=problems.length?`พบ ${problems.length} รายการที่ต้องแก้: ${problems.join(' / ')}`:`ผ่านการตรวจข้อมูลจำลอง: ${groups.length} กลุ่ม ไม่มีสมาชิกข้ามห้องหรือซ้ำกลุ่ม`;
  }
  function filteredReviews(){const status=$('reviewStatus').value,type=$('reviewType').value,q=safe($('reviewSearch').value);return reviews.filter(w=>(!status||w.status===status)&&(!type||w.type===type)&&(!q||safe(w.id+' '+w.owner+' '+STEPS[w.step-1]).includes(q)))}
  function renderReviews(){
    const filtered=filteredReviews();$('queueTotal').textContent=`แสดง ${filtered.length} / ${reviews.length} งาน`;
    $('reviewList').innerHTML=filtered.map(w=>`<button type="button" class="review-item ${state.selectedReview===w.id?'selected':''}" data-review="${w.id}" ${state.selectedReview===w.id?'aria-current="true"':''}><strong>${escapeHtml(w.id)} · ${escapeHtml(w.owner)}</strong><div class="review-meta"><span>ขั้น ${w.step} · ${escapeHtml(typeNames[w.type])}</span>${badge(w.status)}</div></button>`).join('') || '<p class="empty-state">ไม่พบงานตามตัวกรอง</p>';
    if(state.selectedReview&&!filtered.some(w=>w.id===state.selectedReview))state.selectedReview=null;
    renderReviewDetail();updateCount();
  }
  function renderReviewDetail(){
    const w=reviews.find(w=>w.id===state.selectedReview);
    if(!w){$('reviewDetail').innerHTML='<div class="empty-detail"><span>▤</span><h3>เลือกรายการเพื่ออ่านงาน</h3><p>จำลองการให้ข้อเสนอแนะ โดยไม่ใช้ข้อมูลจริงหรือการตัดสินแทนครู</p></div>';return}
    $('reviewDetail').innerHTML=`<h3>${escapeHtml(w.id)} · ขั้น ${w.step}</h3><p>${escapeHtml(STEPS[w.step-1])} · ${escapeHtml(w.owner)} · รุ่นที่ส่ง ${w.revision}</p><div>${badge(w.status)}</div><div class="submission-preview">${escapeHtml(w.note)}</div><form id="reviewFormV19"><label for="reviewDecisionV19">ผลการตรวจ (จำลอง)</label><select id="reviewDecisionV19" required><option value="NEEDS_REVISION">ให้แก้ไขและส่งงานใหม่</option><option value="APPROVED">ตรวจรับงาน</option></select><label for="reviewFeedbackV19">ข้อเสนอแนะที่นำไปปรับปรุงได้</label><textarea id="reviewFeedbackV19" minlength="10" maxlength="800" placeholder="ระบุสิ่งที่ทำได้ดีและสิ่งที่ควรปรับ พร้อมคำแนะนำที่ลงมือทำได้" required></textarea><label>การประเมินตามเกณฑ์ (ตัวอย่าง ไม่ใช่คะแนนโรงเรียน)</label><div class="rubric-grid">${[['content','เนื้อหาและความถูกต้อง'],['english','ภาษาอังกฤษ'],['collaboration','กระบวนการทำงาน'],['revision','การปรับปรุงงาน']].map(([key,title])=>`<label for="rubric-${key}">${title}<select id="rubric-${key}" required><option value="">เลือกระดับ</option><option value="1">1 · เริ่มต้น</option><option value="2">2 · กำลังพัฒนา</option><option value="3">3 · ทำได้ตามเกณฑ์</option><option value="4">4 · ดีเด่น</option></select></label>`).join('')}</div><div class="review-actions"><button type="submit" class="primary-btn">บันทึกผลตรวจ (จำลอง)</button><span class="small-muted">ไม่มีการบันทึกลงเซิร์ฟเวอร์</span></div></form><div class="review-history"><strong>ประวัติการตรวจจำลอง ${w.history.length} รายการ</strong><div id="reviewHistoryV19"></div></div>`;
    const history=$('reviewHistoryV19');
    w.history.slice().reverse().forEach(h=>{const item=document.createElement('p');item.textContent=`${titles[h.status]} · ${h.at} — ${h.feedback}`;history.append(item)});
    $('reviewFormV19').addEventListener('submit',event=>saveDemoReview(event,w.id));
  }
  function saveDemoReview(event,id){
    event.preventDefault();const w=reviews.find(w=>w.id===id);if(!w)return;
    const text=$('reviewFeedbackV19').value.trim();
    if(text.length<10){toast('กรุณาระบุข้อเสนอแนะอย่างน้อย 10 ตัวอักษร');return}
    const rubric={};for(const k of ['content','english','collaboration','revision']){let v=Number($('rubric-'+k).value);if(!Number.isInteger(v)||v<1||v>4){toast('กรุณาเลือกระดับครบทุกเกณฑ์');return}rubric[k]=v}
    const decision=$('reviewDecisionV19').value;
    if(!['APPROVED','NEEDS_REVISION'].includes(decision))return;
    w.status=decision;w.history.push({status:decision,feedback:text,at:new Date().toLocaleString('th-TH'),rubric});
    audit(`ตรวจงานจำลอง ${w.id}: ${titles[decision]} (รุ่น ${w.revision})`);
    renderReviews();toast('บันทึกเฉพาะในหน้าจอจำลองแล้ว · ไม่ส่งข้อมูลไปโรงเรียน');
  }
  function renderCourses(){
    const type=$('courseFilter').value,q=safe($('courseSearch').value);
    $('courseList').innerHTML=STEPS.map((name,i)=>({name,step:i+1,type:INDIVIDUAL.has(i+1)?'individual':'group'})).filter(x=>(!type||x.type===type)&&(!q||safe(x.name+' '+x.step).includes(q))).map(x=>`<article class="course-card"><span class="course-id">STEP ${String(x.step).padStart(2,'0')}</span><h3>${escapeHtml(x.name)}</h3><p>${x.type==='individual'?'เก็บหลักฐานการฝึกภาษาอังกฤษรายบุคคล':'ร่วมมือกับกลุ่มโดยคงร่องรอยการมีส่วนร่วมของสมาชิก'}</p><div class="course-foot"><span class="status ${x.type==='individual'?'status-blue':'status-gray'}">${typeNames[x.type]}</span><small>V18.1 preserved</small></div></article>`).join('') || '<p class="empty-state">ไม่พบกิจกรรม</p>';
  }
  function renderAnalytics(){
    $('analyticsChart').innerHTML=['6.1','6.2','6.3'].map(room=>{const ss=students.filter(s=>s.room===room);const completed=ss.reduce((a,s)=>a+s.completed,0);const pct=percentage(completed/(20*ss.length)*100);return `<div class="bar-item"><span class="bar-label">ป.${room.replace('.','/')}</span><div class="bar-rail"><div class="bar-fill" style="width:${pct}%"></div></div><span class="bar-value">${pct}%</span></div>`}).join('');
    $('analyticsReviews').innerHTML=['PENDING','NEEDS_REVISION','APPROVED'].map(s=>`<div class="analytics-stat"><span>${titles[s]}</span><strong>${reviews.filter(w=>w.status===s).length}</strong></div>`).join('');
  }
  function renderAudit(){
    $('auditList').innerHTML='';if(!state.audit.length){$('auditList').innerHTML='<li><strong>ไม่มีเหตุการณ์ในรอบการเปิดหน้านี้</strong></li>';return}
    state.audit.slice(0,60).forEach(entry=>{const li=document.createElement('li'),strong=document.createElement('strong'),small=document.createElement('small');strong.textContent=entry.label;small.textContent=new Date(entry.time).toLocaleString('th-TH',{dateStyle:'medium',timeStyle:'short'});li.append(strong,small);$('auditList').append(li)});
  }
  function currentExport(){
    const k=state.page;let header=[],rows=[];
    if(k==='students'){header=['student_code_demo','class','status','completed_of_20'];rows=filteredStudents().map(x=>[x.id,x.room,x.status,x.completed])}
    else if(k==='groups'){header=['group_code_demo','class','member_count','completed_of_20'];rows=groups.map(x=>[x.id,x.room,x.members.length,x.completed])}
    else if(k==='reviews'){header=['work_code_demo','owner_code_demo','step','type','status','revision'];rows=filteredReviews().map(x=>[x.id,x.owner,x.step,x.type,x.status,x.revision])}
    else{header=['class','fictional_students','completion_rate_percent'];rows=['6.1','6.2','6.3'].map(room=>{let ss=students.filter(s=>s.room===room);return [room,ss.length,percentage(ss.reduce((a,s)=>a+s.completed,0)/(ss.length*20)*100)]})}
    const cell=v=>'"'+String(v).replace(/"/g,'""')+'"';const csv='\uFEFF'+[header,...rows].map(r=>r.map(cell).join(',')).join('\r\n');
    const blob=new Blob([csv],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');
    a.href=url;a.download=`PBL_V19_DEMO_${k}.csv`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);audit(`ส่งออก CSV จำลอง: ${k}`);toast('ส่งออกเฉพาะข้อมูลสมมติของ V19');
  }
  function selfCheck(){
    const problems=[];
    if(STEPS.length!==20)problems.push('steps != 20');
    if(INDIVIDUAL.size!==5)problems.push('individual count != 5');
    if(students.some(s=>!['6.1','6.2','6.3'].includes(s.room)))problems.push('invalid class');
    problems.push(...validateGroups());
    if(reviews.some(w=>w.step<1||w.step>20||w.type!==(INDIVIDUAL.has(w.step)?'individual':'group')))problems.push('invalid review step/type');
    if(reviews.some(w=>!students.some(s=>s.id===w.owner)&&!groups.some(g=>g.id===w.owner)))problems.push('invalid owner');
    if(typeof window.google!=='undefined'&&window.google?.script?.run)problems.push('staging preview unexpectedly running inside Apps Script');
    return {ok:problems.length===0,problems,counts:{students:students.length,groups:groups.length,steps:STEPS.length,reviews:reviews.length}};
  }
  function init(){
    $('sideNav').addEventListener('click',e=>{const b=e.target.closest('[data-page]');if(b)navigate(b.dataset.page)});
    document.addEventListener('click',e=>{
      const link=e.target.closest('[data-target]');if(link)navigate(link.dataset.target);
      const open=e.target.closest('[data-open-review]');if(open){state.selectedReview=open.dataset.openReview;$('reviewStatus').value='';$('reviewType').value='';$('reviewSearch').value='';navigate('reviews')}
      const item=e.target.closest('[data-review]');if(item){state.selectedReview=item.dataset.review;renderReviews()}
      const student=e.target.closest('[data-student]');if(student)showStudent(student.dataset.student);
      const sort=e.target.closest('[data-sort]');if(sort){state.studentSort=sort.dataset.sort;renderStudents()}
    });
    $('menuBtn').addEventListener('click',()=>$('sidebar').classList.contains('open')?closeMenu():openMenu());
    $('closeMenu').addEventListener('click',closeMenu);$('mobileOverlay').addEventListener('click',closeMenu);
    document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu()});
    $('closeDialog').addEventListener('click',()=>$('detailDialog').close());
    for(const id of ['studentSearchV19','studentRoom','studentStatus'])$(id).addEventListener(id==='studentSearchV19'?'input':'change',renderStudents);
    $('studentReset').addEventListener('click',()=>{$('studentSearchV19').value='';$('studentRoom').value='';$('studentStatus').value='';renderStudents()});
    for(const id of ['reviewSearch','reviewStatus','reviewType'])$(id).addEventListener(id==='reviewSearch'?'input':'change',renderReviews);
    for(const id of ['courseFilter','courseSearch'])$(id).addEventListener(id==='courseFilter'?'change':'input',renderCourses);
    $('checkGroups').addEventListener('click',()=>{renderGroups();audit('ตรวจสอบโครงสร้างกลุ่มจำลอง');toast(validateGroups().length?'พบข้อผิดพลาดในข้อมูลกลุ่มจำลอง':'กลุ่มจำลองผ่านการตรวจโครงสร้าง')});
    $('clearDemoAudit').addEventListener('click',()=>{state.audit=[];renderAudit();toast('ล้างประวัติจำลองในหน้าจอนี้แล้ว')});
    $('exportBtn').addEventListener('click',currentExport);
    window.PBLV19={selfCheck,version:'19.0.0-public-demo',dataClassification:'SYNTHETIC_ONLY'};
    renderOverview();const qa=selfCheck();if(!qa.ok)console.error('V19 local preflight failed',qa.problems);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
