// -------- i18n copy --------
const I18N = {
    ar: {
      title:"لعبة تنظيف الأسنان",
      sub:"نظّف أسنانك لمدة دقيقتين لتصبح لامعة! ✨",
      start:"ابدأ", pause:"إيقاف مؤقّت", reset:"إعادة", done:"تم",
      streak:"سِجل متتابع:", tipsHead:"🪥 نصائح سريعة لتنظيف أفضل",
      tips:[
        "قسّم الوقت بين اليمين واليسار، الأعلى والأسفل.",
        "نظّف السطح الأمامي والخلفي وأطراف الأسنان.",
        "لا تنسَ اللسان في آخر 10–15 ثانية!"
      ],
      msgGo:"هيا! استمر بالتفريش…",
      msgPause:"تم الإيقاف مؤقتًا. اضغط ابدأ للمتابعة.",
      msgFinish:"عمل رائع! اضغط «تم» لحفظ اليوم ✅"
    },
    en: {
      title:"Toothbrushing Game",
      sub:"Brush for 2 minutes to make your teeth sparkle! ✨",
      start:"Start", pause:"Pause", reset:"Reset", done:"Done",
      streak:"Streak:", tipsHead:"🪥 Quick tips for super clean teeth",
      tips:[
        "Split time across left/right, top/bottom.",
        "Brush front, back and chewing surfaces.",
        "Don’t forget the tongue in the last 10–15s!"
      ],
      msgGo:"Nice! Keep brushing…",
      msgPause:"Paused. Tap Start to continue.",
      msgFinish:"Great job! Tap Done to log today ✅"
    }
  };
  
  // -------- element refs --------
  const $ = s => document.querySelector(s);
  const els = {
    title: $('#t_title'), sub: $('#t_sub'),
    start: $('#t_start'), pause: $('#t_pause'), reset: $('#t_reset'), done: $('#t_done'),
    streakLabel: $('#t_streak'), tipsHead: $('#t_tips_head'), tipsList: $('#t_tips_list'),
    arBtn: $('#arBtn'), enBtn: $('#enBtn'),
    timer: $('#timer'), bar: $('#bar'), teeth: $('#teeth'),
    btnStart: $('#start'), btnPause: $('#pause'), btnReset: $('#reset'), btnDone: $('#done'),
    msg: $('#msg'), stickers: $('#stickers'), streak: $('#streak')
  };
  
  let lang = 'ar';
  function setLang(next){
    lang = next;
    const L = I18N[lang];
    document.documentElement.lang = lang;
    document.documentElement.dir = (lang==='ar'?'rtl':'ltr');
  
    els.title.textContent = L.title;
    els.sub.textContent   = L.sub;
    els.start.textContent = L.start;
    els.pause.textContent = L.pause;
    els.reset.textContent = L.reset;
    els.done.textContent  = L.done;
    els.streakLabel.textContent = L.streak;
    els.tipsHead.textContent = L.tipsHead;
    els.tipsList.innerHTML = L.tips.map(t=>`<li>${t}</li>`).join('');
  
    els.arBtn.classList.toggle('active', lang==='ar');
    els.enBtn.classList.toggle('active', lang==='en');
  }
  
  // -------- timer logic --------
  const TOTAL = 120;       // seconds
  const SEGMENTS = 8;      // number of teeth
  let left = TOTAL, tick=null, running=false, paused=false;
  
  // streak persistence
  const get = k => localStorage.getItem(k);
  const set = (k,v) => localStorage.setItem(k,v);
  let streak = parseInt(get('brushStreak')||'0',10);
  els.streak.textContent = String(streak);
  const todayKey = new Date().toDateString();
  
  // build teeth segments
  const faces = ["😐","🙂","😊","😁"];
  for(let i=0;i<SEGMENTS;i++){
    const d = document.createElement('div');
    d.className = 'tooth';
    d.dataset.index = i;
    d.textContent = faces[0];
    els.teeth.appendChild(d);
  }
  const teethEls = [...document.querySelectorAll('.tooth')];
  
  const fmt = s => `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;
  
  function updateUI(){
    els.timer.textContent = fmt(left);
    const pct = 100 * (1 - left / TOTAL);
    els.bar.style.width = `${pct}%`;
  
    // animate each tooth segment based on progress within its chunk
    const perSeg = TOTAL / SEGMENTS;
    teethEls.forEach((t,i)=>{
      const segProg = Math.min(Math.max((TOTAL-left) - i*perSeg, 0), perSeg) / perSeg;
      if(segProg >= 1){ t.classList.add('done'); t.textContent = faces[3]; }
      else if(segProg >= .66){ t.textContent = faces[2]; t.classList.add('done'); }
      else if(segProg >= .33){ t.textContent = faces[1]; t.classList.remove('done'); }
      else { t.textContent = faces[0]; t.classList.remove('done'); }
    });
  
    if(left<=0){
      stop();
      els.timer.textContent = (lang==='ar' ? "انتهى!" : "Done!");
      els.msg.textContent = I18N[lang].msgFinish;
      els.stickers.textContent = "🌟🫧🦷✨";
      enable({start:true,pause:false,reset:true,done:true});
    }
  }
  
  function enable(map){
    [['btnStart','start'],['btnPause','pause'],['btnReset','reset'],['btnDone','done']].forEach(([k,n])=>{
      els[k].classList.toggle('disabled', !map[n]);
    });
  }
  
  function start(){
    if(running && !paused) return;
    running = true; paused = false;
    els.msg.textContent = I18N[lang].msgGo;
    enable({start:false,pause:true,reset:true,done:false});
    tick = setInterval(()=>{ left--; updateUI(); }, 1000);
  }
  function pause(){
    if(!running || paused) return;
    paused = true; clearInterval(tick);
    els.msg.textContent = I18N[lang].msgPause;
    enable({start:true,pause:false,reset:true,done:false});
  }
  function reset(){
    clearInterval(tick); running=false; paused=false; left = TOTAL;
    els.stickers.textContent = ''; els.msg.textContent='';
    enable({start:true,pause:false,reset:false,done:false});
    updateUI();
  }
  function done(){
    if(get('lastBrush') !== todayKey){
      streak += 1; set('brushStreak', String(streak)); set('lastBrush', todayKey);
      els.streak.textContent = String(streak);
    }
    reset();
  }
  function stop(){ clearInterval(tick); running=false; paused=false; }
  
  // init
  setLang('ar');
  updateUI();
  enable({start:true,pause:false,reset:false,done:false});
  
  // events
  els.btnStart.addEventListener('click', ()=> paused ? start() : start());
  els.btnPause.addEventListener('click', pause);
  els.btnReset.addEventListener('click', reset);
  els.btnDone .addEventListener('click', done);
  
  // language toggle
  els.arBtn.addEventListener('click', ()=> setLang('ar'));
  els.enBtn.addEventListener('click', ()=> setLang('en'));
  