# PBL LMS V15 — British listening & speaking laboratory

**Route**: `/pbl/v15/` (GitHub Pages Anyone public-safe preview). **Base**: the previously verified `/pbl/v14.1/`. V10–V14.1 stay untouched. **Scope**: P6-only project-based English with 20 steps; language scaffolds are drawn from the current task question and English sentence frame.

## Student learning interaction

- Select **British female / British male** voice when an installed `en-GB` voice with a recognisable name is available. The system detects the browser's actual installed voices and clearly explains when the requested voice or gender cannot be verified. Gender guessing is based only on provider voice names, not a demographic inference about a person.
- The voice selector shows the exact available UK voice; voice is taken from `SpeechSynthesis.getVoices()`. Only **on-device** `localService===true` voices are offered to avoid uploading student-authored text to a remote voice provider. If no suitable local UK voice is installed, the Speak/Repeat buttons are disabled and Thai instructions explain how to add one. **No fallback to American English falsely labelled British.**
- Three actual speech rates: **Normal 1.00**, **Slow 0.78**, **Very slow 0.56**, independent of device selection. Listen, replay, stop, switch between lesson question and example sentence, or type a short English practice sentence.
- **Speaking practice**: explicit microphone permission, record for up to 30 seconds, stop, privately replay your own voice. Recording exists only in a tab-local memory Blob URL and is cleared when leaving learning, switching lessons or closing the page. No server POST, external analytics, upload, school assessment, recording backup or teacher access.
- Where strictly **on-device English-GB speech recognition** is supported, an additional button invites the learner to *say the sentence again* and shows recognised words for self-comparison. This uses `SpeechRecognition.processLocally=true` **only after** `SpeechRecognition.available({langs:['en-GB'],processLocally:true})` returns `available`. No remote/default speech recognition is ever started, and no recognition score/accuracy grade is claimed. If the feature is unavailable, learners can still record and listen to themselves.
- UI reuses V14 responsive device-aware constraints, V14.1 friendly design and the existing individual/group workflow. No login, password, database, GAS/ACL, learner roster or institutional system was changed.

## Testing / limits

- **90/90 PASS** synthetic Chrome headless end-to-end checks at 1440×900, 390×844, 320×568 and 844×390, plus unavailable-voice, denied-mic and unsupported-on-device-recognition branches. Validated voice choice, rate, repeat, task question/frame switching, microphone start/stop, playback and object-URL cleanup, on-device recogniser privacy guard, lesson navigation, zero JS errors and no page horizontal overflow. Node JS syntax PASS. No real student data, real pupil voice or live microphone permission used.
- Device compatibility smoke test in local Chrome: SpeechSynthesis, MediaRecorder and getUserMedia APIs were present; that headless session **did not have a local en-GB voice**. The public application therefore presents a truthful installation notice. Actual audible male/female voice performance depends on installed OS/browser voices, speakers and accessibility settings; actual microphone quality must be checked on teacher-authorised physical devices.
- Browser-dependent local speech recognition is optional; many browsers do not provide local en-GB recognition, so this is not a full AI pronunciation scorer. No automatic pronunciation scores, cloud transcription, feedback model or microphone upload is claimed.
- GitHub Pages is public static preview; secure real student/Admin accounts still require separate owner-approved GAS deployment. No extra paid TTS model or PAYG charge.

**For Windows voice installation**, Microsoft lists British voice George (male), Hazel/Susan (female), and natural voices Ryan (male) and Sonia (female), subject to device/OS availability. Install English (United Kingdom) speech/TTS voices through Windows settings, then restart the browser. The website never silently downloads language packages.

**References for implementation**: MDN Web Speech API, MediaRecorder/getUserMedia and on-device SpeechRecognition; Microsoft Windows Narrator language/voice support. Source files: `index.html`, `voice-lab.css`, `voice-lab.js`.

**NEXT_EXACT_ACTION**: Public-safe V15 route → GitHub Pages live readback → teacher UAT on physical UK-voice/microphone devices → owner review for any future cloud-voice model, consent and pupil evidence capture.
