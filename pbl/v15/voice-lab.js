/* PBL V15: private British listening & speaking studio.
 * Browser speech synthesis + local MediaRecorder; no API keys, audio uploads,
 * external AI services, learner IDs, persistence or backend writes.
 * Browser speech-recognition MUST prove on-device processing before activation.
 */
(() => {
  'use strict';
  const $=id=>document.getElementById(id);
  const lab=$('voiceLab');
  if(!lab)return;

  const synth=typeof window.speechSynthesis!=='undefined'?window.speechSynthesis:null;
  const SpeechUtterance=window.SpeechSynthesisUtterance;
  const genders={
    female:/(female|woman|sonia|libby|hazel|kate|serena|amy|emma|martha|stephanie|susan|fiona|alice|olivia|sophie|moira|victoria|samantha|amelia|maisie|vicki)/i,
    male:/(male|man|ryan|george|daniel|oliver|arthur|thomas|james|brian|david|alfie|harry|peter|graham|fred|mark|jon)/i
  };
  // Neutral/unlabelled names are NOT assigned an invented sex.
  const guessGender=name=>{
    const n=String(name||'');
    // "female" includes "male"; test the female expression first.
    if(genders.female.test(n))return 'female';
    if(genders.male.test(n))return 'male';
    return 'unknown';
  };
  let ukVoices=[];
  let playText='';
  let speakingId=0;
  let recorder=null;
  let recordingStream=null;
  let recordChunks=[];
  let discardRecording=false;
  let audioUrl='';
  let maxTimer=null;
  let activeRecognition=null;
  let onDeviceRecognitionReady=false;
  const $play=$('voicePlay'),$repeat=$('voiceRepeat'),$stop=$('voiceStop');
  const $record=$('voiceRecord'),$recordStop=$('voiceRecordStop');
  const $gender=$('voiceGender'),$speed=$('voiceSpeed'),$select=$('voiceSelect');
  const $text=$('voicePracticeText'),$available=$('voiceAvailability');
  const $audio=$('voiceRecordingPlayback'),$local=$('voiceCheckLocal');
  const $spoken=$('voiceRecognised'),$status=$('voiceLabStatus');
  const $question=$('taskQuestion'),$frame=$('taskFrame');
  const $useQuestion=$('voiceUseQuestion'),$useFrame=$('voiceUseFrame');

  const status=(message,kind='')=>{
    $status.textContent=message;$status.dataset.kind=kind;
  };
  const availability=(message,kind='')=>{
    $available.textContent=message;$available.dataset.alert=kind;
  };
  const recognized=(message='')=>{
    $spoken.hidden=!message;$spoken.textContent=message;
  };
  function resetPlay(){
    speakingId++;
    if(synth){try{synth.cancel()}catch(e){}}
    $stop.disabled=true;
  }
  function stopTracks(){
    if(recordingStream){
      try{recordingStream.getTracks().forEach(t=>t.stop())}catch(e){}
      recordingStream=null;
    }
  }
  function releaseAudio(){
    if($audio){try{$audio.pause()}catch(e){}$audio.removeAttribute('src');$audio.load();$audio.hidden=true}
    if(audioUrl){URL.revokeObjectURL(audioUrl);audioUrl=''}
  }
  function finishRecording(){
    if(maxTimer){clearTimeout(maxTimer);maxTimer=null}
    if(recorder && recorder.state!=='inactive'){try{recorder.stop()}catch(e){}}
    stopTracks();
    $record.disabled=false;$recordStop.disabled=true;
  }
  function cancelRecording(){
    discardRecording=true;
    recordChunks=[];
    finishRecording();
    releaseAudio();
  }
  const clean=s=>String(s||'').replace(/\s+/g,' ').trim().slice(0,350);
  function setText(value,selection){
    const text=clean(value);
    $text.value=text;
    if(selection){
      $useQuestion.setAttribute('aria-pressed',String(selection==='question'));
      $useFrame.setAttribute('aria-pressed',String(selection==='frame'));
    }
    resetPlay();
    playText='';
    recognized('');
  }
  function taskText(){
    return {question:clean($question?.textContent),frame:clean($frame?.textContent)};
  }
  function refreshTask(){
    if($('studentScreen')?.hidden)return;
    const {frame,question}=taskText();
    const auto=$text.dataset.autoTask||'';
    const newKey=frame+'|'+question;
    if(auto===newKey)return;
    $text.dataset.autoTask=newKey;
    // New lesson: discard previous phrase and audio. Nothing is uploaded.
    setText(frame||question,'frame');
    if(audioUrl)releaseAudio();
    if(recorder&&recorder.state!=='inactive')cancelRecording();
    status('เลือกเสียง British แล้วกดฟัง จากนั้นฝึกพูดตามได้');
  }
  const ukVoice=v=>v&&v.localService===true&&/^en[-_]GB$/i.test(String(v.lang||'').replace('_','-')); // avoid sending learner-written text to remote voice services
  function availableVoices(){
    try{return [...synth.getVoices()].filter(ukVoice)}catch(e){return []}
  }
  function fillVoices(){
    const previous=$select.value;
    ukVoices=synth?availableVoices():[];
    $select.replaceChildren();
    if(!synth||!SpeechUtterance){
      const o=document.createElement('option');o.value='';o.textContent='เบราว์เซอร์นี้ไม่มีระบบอ่านออกเสียง';$select.append(o);
      $select.disabled=true;$play.disabled=true;$repeat.disabled=true;$stop.disabled=true;
      availability('เบราว์เซอร์นี้ไม่รองรับการอ่านออกเสียง ลองใช้ Chrome, Edge หรือ Safari รุ่นใหม่','warning');
      return;
    }
    const gender=$gender.value;
    const options=ukVoices.map((v,i)=>({voice:v,i,gender:guessGender(v.name)}));
    const matches=options.filter(x=>x.gender===gender);
    const selectable=matches.length?matches:options;
    if(!options.length){
      const o=document.createElement('option');o.value='';o.textContent='ไม่พบเสียง British ที่ติดตั้งในเครื่อง';$select.append(o);
      $select.disabled=true;$play.disabled=true;$repeat.disabled=true;
      availability('อุปกรณ์นี้ยังไม่พบเสียง British แบบภายในเครื่อง (en-GB) กรุณาติดตั้งเสียงภาษาอังกฤษ UK ในการตั้งค่าอุปกรณ์ แล้วเปิดหน้าเว็บใหม่','warning');
      return;
    }
    selectable.forEach(({voice,i,gender:g})=>{
      const o=document.createElement('option');o.value=String(i);
      o.textContent=voice.name+(g==='unknown'?' · ไม่ระบุเพศ':'')+' · en-GB';
      $select.append(o);
    });
    $select.disabled=false;$play.disabled=false;$repeat.disabled=false;
    if(selectable.some(x=>String(x.i)===previous))$select.value=previous;
    else $select.value=String(selectable[0].i);
    if(matches.length){
      availability('พร้อมใช้เสียง British ภายในเครื่อง '+(gender==='female'?'ผู้หญิง':'ผู้ชาย')+' จากอุปกรณ์นี้ ('+matches.length+' เสียง)');
    }else{
      availability('ไม่พบเสียง British '+(gender==='female'?'ผู้หญิง':'ผู้ชาย')+' ที่ระบุชัดในอุปกรณ์นี้ มีเสียง English (UK) ให้เลือกแทน แต่ไม่สามารถยืนยันเพศเสียงได้','warning');
    }
  }
  function selectedVoice(){
    const index=Number($select.value);
    return $select.value!==''&&Number.isInteger(index)&&ukVoices[index]||null;
  }
  function speak(repeat=false){
    const text=clean($text.value);
    if(!/[a-z]/i.test(text)){status('กรุณาใส่ประโยคภาษาอังกฤษก่อนกดฟัง','warning');$text.focus();return}
    const voice=selectedVoice();
    if(!synth||!SpeechUtterance||!voice){
      status('ยังไม่มีเสียง British บนอุปกรณ์นี้ กรุณาตรวจสอบรายการเสียง','warning');return;
    }
    if(recordingStream)finishRecording();
    resetPlay();
    const serial=++speakingId;
    const utt=new SpeechUtterance(text);
    utt.lang='en-GB';
    utt.voice=voice;
    utt.rate=Math.max(.5,Math.min(1,Number($speed.value)||1));
    utt.pitch=1;utt.volume=1;
    utt.onstart=()=>{
      if(serial!==speakingId)return;
      $stop.disabled=false;
      status('กำลังอ่านเสียง British '+(Number($speed.value)===1?'ความเร็วปกติ':Number($speed.value)>.6?'ช้า':'ช้ามาก'));
    };
    utt.onend=()=>{
      if(serial!==speakingId)return;
      $stop.disabled=true;
      status('ฟังจบแล้ว สามารถกดฟังซ้ำหรือฝึกพูดตามได้','success');
    };
    utt.onerror=e=>{
      if(serial!==speakingId)return;
      $stop.disabled=true;
      if(e.error!=='interrupted'&&e.error!=='canceled')
        status('ไม่สามารถเล่นเสียงได้ในขณะนี้ ลองกดฟังอีกครั้ง','warning');
    };
    playText=text;
    try{synth.speak(utt);status(repeat?'กำลังฟังซ้ำ…':'กำลังเตรียมเสียง…')}
    catch(e){$stop.disabled=true;status('ระบบอ่านเสียงของอุปกรณ์ไม่พร้อม','warning')}
  }
  function setupMic(){
    if(!window.isSecureContext||!navigator.mediaDevices?.getUserMedia||!window.MediaRecorder){
      $record.disabled=true;$recordStop.disabled=true;
      $record.title='ต้องใช้เว็บไซต์ HTTPS และเบราว์เซอร์ที่รองรับไมโครโฟน';
      status('ยังอัดเสียงไม่ได้บนอุปกรณ์นี้ แต่ยังฝึกฟังได้','warning');
    }
    $recordStop.disabled=true;
  }
  async function record(){
    if($record.disabled||recorder?.state==='recording')return;
    if(activeRecognition){try{activeRecognition.abort()}catch(e){}activeRecognition=null}
    resetPlay();releaseAudio();recordChunks=[];discardRecording=false;recognized('');
    try{
      // Gesture-gated microphone permission. Audio is kept in a local Blob URL only.
      const stream=await navigator.mediaDevices.getUserMedia({audio:true,video:false});
      recordingStream=stream;
      const formats=['audio/webm;codecs=opus','audio/mp4','audio/webm'];
      const mime=formats.find(s=>window.MediaRecorder.isTypeSupported?.(s))||'';
      const mr=mime?new MediaRecorder(stream,{mimeType:mime}):new MediaRecorder(stream);
      recorder=mr;
      mr.ondataavailable=e=>{if(!discardRecording&&e.data&&e.data.size)recordChunks.push(e.data)};
      mr.onstop=()=>{
        stopTracks();
        if(discardRecording){recordChunks=[];releaseAudio();return}
        if(maxTimer){clearTimeout(maxTimer);maxTimer=null}
        $record.disabled=false;$recordStop.disabled=true;
        if(!recordChunks.length){status('ยังไม่มีเสียงที่บันทึก ลองอีกครั้ง','warning');return}
        const blob=new Blob(recordChunks,{type:mr.mimeType||recordChunks[0].type||'audio/webm'});
        recordChunks=[];
        releaseAudio();
        audioUrl=URL.createObjectURL(blob);
        $audio.src=audioUrl;$audio.hidden=false;
        status('อัดเสียงสำเร็จ กด ▶ บนแถบเสียงเพื่อฟังการพูดของตนเอง','success');
      };
      mr.onerror=()=>{finishRecording();status('อัดเสียงไม่สำเร็จ กรุณาลองใหม่','warning')};
      mr.start();
      $record.disabled=true;$recordStop.disabled=false;
      maxTimer=setTimeout(()=>{finishRecording();status('ครบ 30 วินาที ระบบหยุดอัดเสียงให้อัตโนมัติ')},30000);
      status('กำลังอัดเสียง… พูดประโยคภาษาอังกฤษ แล้วกดหยุดอัดเสียง');
    }catch(err){
      stopTracks();recorder=null;
      $record.disabled=false;$recordStop.disabled=true;
      const denied=err?.name==='NotAllowedError'||err?.name==='PermissionDeniedError';
      status(denied?'ยังไม่ได้อนุญาตใช้ไมโครโฟน สามารถเปิดสิทธิ์ในเบราว์เซอร์แล้วลองใหม่':'ไม่พบหรือไม่สามารถใช้งานไมโครโฟนได้','warning');
    }
  }
  async function checkLocalCapability(){
    // Strict privacy: remote / default Web Speech recognition is NEVER activated.
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!SR||typeof SR.available!=='function'){
      $local.disabled=true;
      $local.title='เบราว์เซอร์นี้ไม่รองรับการแปลงเสียงเป็นข้อความภายในเครื่อง';
      return;
    }
    let sample;
    try{sample=new SR()}catch(e){return}
    if(!('processLocally' in sample))return;
    try{
      const state=await SR.available({langs:['en-GB'],processLocally:true});
      onDeviceRecognitionReady=state==='available';
      $local.disabled=!onDeviceRecognitionReady;
      if(!onDeviceRecognitionReady){
        $local.title='ยังไม่มีชุดแปลงเสียง en-GB ภายในเครื่อง ใช้อัดเสียงแล้วฟังซ้ำได้';
      }
    }catch(e){$local.disabled=true}
  }
  function transcribeLocal(){
    if(!onDeviceRecognitionReady||activeRecognition)return;
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!SR)return;
    resetPlay();
    let r;
    try{r=new SR()}catch(e){return}
    if(!('processLocally' in r))return;
    r.processLocally=true;r.lang='en-GB';
    r.interimResults=false;r.continuous=false;r.maxAlternatives=1;
    activeRecognition=r;$local.disabled=true;
    status('พูดอีกครั้ง ระบบจะฟังและแสดงข้อความเฉพาะภายในอุปกรณ์นี้');
    r.onresult=e=>{
      const transcription=clean(e.results?.[0]?.[0]?.transcript||'');
      if(!transcription){status('ระบบยังฟังคำพูดไม่ชัด ลองอีกครั้ง','warning');return}
      recognized('ข้อความที่ระบบฟังได้: '+transcription);
      status('อ่านข้อความที่ระบบฟังได้ แล้วเปรียบเทียบกับประโยคต้นฉบับด้วยตนเอง (ไม่ใช่คะแนนออกเสียง)','success');
    };
    r.onerror=()=>{status('ระบบแปลงเสียงภายในเครื่องยังไม่พร้อม ใช้การฟังเสียงตัวเองแทนได้','warning')};
    r.onend=()=>{activeRecognition=null;$local.disabled=!onDeviceRecognitionReady};
    try{r.start()}catch(e){activeRecognition=null;$local.disabled=!onDeviceRecognitionReady;
      status('ไม่สามารถเริ่มการฟังเสียงภายในเครื่องได้','warning')}
  }
  function cleanup(){
    resetPlay();cancelRecording();
    if(activeRecognition){try{activeRecognition.abort()}catch(e){}activeRecognition=null}
    recognized('');
    $local.disabled=!onDeviceRecognitionReady;
  }
  $useQuestion.addEventListener('click',()=>setText(taskText().question,'question'));
  $useFrame.addEventListener('click',()=>setText(taskText().frame,'frame'));
  $text.addEventListener('input',()=>{
    $useFrame.setAttribute('aria-pressed','false');
    $useQuestion.setAttribute('aria-pressed','false');
    resetPlay();playText='';
  });
  $gender.addEventListener('change',()=>{resetPlay();fillVoices()});
  $speed.addEventListener('change',()=>{resetPlay();status('เลือกความเร็วแล้ว กดฟังเสียงหรือฟังซ้ำได้')});
  $select.addEventListener('change',()=>{resetPlay();status('เลือกเสียง British แล้ว')});
  $play.addEventListener('click',()=>speak(false));
  $repeat.addEventListener('click',()=>speak(true));
  $stop.addEventListener('click',()=>{resetPlay();status('หยุดเสียงแล้ว')});
  $record.addEventListener('click',record);
  $recordStop.addEventListener('click',finishRecording);
  $local.addEventListener('click',transcribeLocal);
  // When lesson changes or user signs out, release microphones/Blob URLs immediately.
  const screen=$('studentScreen');
  if(screen)new MutationObserver(()=>{
    if(screen.hidden)cleanup();
    else refreshTask();
  }).observe(screen,{attributes:true,attributeFilter:['hidden']});
  const observers=[$question,$frame].filter(Boolean);
  observers.forEach(el=>new MutationObserver(()=>{if(!screen?.hidden)refreshTask()})
    .observe(el,{childList:true,characterData:true,subtree:true}));
  window.addEventListener('pagehide',cleanup);
  if(synth){
    if(typeof synth.addEventListener==='function')synth.addEventListener('voiceschanged',fillVoices);
    else{const old=synth.onvoiceschanged;synth.onvoiceschanged=e=>{if(typeof old==='function')old.call(synth,e);fillVoices()}}
  }
  $stop.disabled=true;$play.disabled=true;$repeat.disabled=true;
  fillVoices();setupMic();checkLocalCapability();
  // Loaded after app.js; task preview may already be open after session restore.
  if(screen&&!screen.hidden)refreshTask();
})();
