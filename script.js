/* =========================================================================
   CUTE DATE INVITATION — script.js
   Pure vanilla JS. Organized into small focused sections:
   1. Ambient background (floating hearts + sparkles)
   2. Cursor heart trail
   3. Music toggle + sound effects
   4. Envelope open -> question card flow
   5. Typewriter effect for the question
   6. YES / NO button game
   7. Celebration: confetti + fireworks
   8. Misc fun: disable right-click, prevent selection safety net
   ========================================================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ============================ 1. FLOATING HEARTS + SPARKLES ============================ */

  const heartsContainer = document.getElementById('floatingHearts');
  const sparklesContainer = document.getElementById('sparkles');
  const HEART_EMOJIS = ['💗', '💖', '💕', '❤️', '💘', '💓'];

  function spawnFloatingHeart() {
    const heart = document.createElement('span');
    heart.className = 'floating-heart';
    heart.textContent = HEART_EMOJIS[Math.floor(Math.random() * HEART_EMOJIS.length)];

    const startX = Math.random() * 100; // vw
    const size = 14 + Math.random() * 20; // px
    const duration = 8 + Math.random() * 8; // seconds
    const drift = (Math.random() * 80 - 40) + 'px';

    heart.style.left = startX + 'vw';
    heart.style.fontSize = size + 'px';
    heart.style.animationDuration = duration + 's';
    heart.style.setProperty('--drift', drift);

    heartsContainer.appendChild(heart);

    // Clean up once the animation finishes so the DOM doesn't grow forever
    setTimeout(() => heart.remove(), duration * 1000 + 200);
  }

  function spawnSparkle() {
    const sparkle = document.createElement('span');
    sparkle.className = 'sparkle';
    sparkle.textContent = Math.random() > 0.5 ? '✨' : '⭐';
    sparkle.style.left = Math.random() * 100 + 'vw';
    sparkle.style.top = Math.random() * 100 + 'vh';
    sparkle.style.animationDuration = (1.8 + Math.random() * 1.6) + 's';
    sparklesContainer.appendChild(sparkle);
    setTimeout(() => sparkle.remove(), 4000);
  }

  // Keep a gentle steady stream of hearts and sparkles going the whole time
  setInterval(spawnFloatingHeart, 900);
  setInterval(spawnSparkle, 1400);
  // Seed a few immediately so the page doesn't feel empty on load
  for (let i = 0; i < 6; i++) setTimeout(spawnFloatingHeart, i * 250);


  /* ============================ 2. CURSOR HEART TRAIL ============================ */

  let lastTrailTime = 0;
  function handleCursorTrail(x, y) {
    const now = Date.now();
    if (now - lastTrailTime < 60) return; // throttle so it doesn't flood the DOM
    lastTrailTime = now;

    const dot = document.createElement('span');
    dot.className = 'cursor-heart';
    dot.textContent = '💕';
    dot.style.left = x + 'px';
    dot.style.top = y + 'px';
    document.body.appendChild(dot);
    setTimeout(() => dot.remove(), 700);
  }

  window.addEventListener('mousemove', (e) => handleCursorTrail(e.clientX, e.clientY));
  window.addEventListener('touchmove', (e) => {
    if (e.touches[0]) handleCursorTrail(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: true });


  /* ============================ 3. MUSIC TOGGLE + SOUND FX ============================ */

  const musicToggle = document.getElementById('musicToggle');
  const popSound = document.getElementById('popSound');
  let musicPlaying = false;

  // Background music is a hidden YouTube embed, loaded via the YouTube
  // IFrame API. The video ID below is from the chosen track's watch URL.
  const YT_VIDEO_ID = '9OyZznPFCeo'; // TORPE by JAO
  let ytPlayer = null;
  let ytReady = false;

  // The YouTube IFrame API calls this global function once it has loaded.
  window.onYouTubeIframeAPIReady = function () {
    ytPlayer = new YT.Player('ytPlayer', {
      videoId: YT_VIDEO_ID,
      playerVars: {
        autoplay: 0,
        controls: 0,
        loop: 1,
        playlist: YT_VIDEO_ID, // required for loop to work on a single video
        playsinline: 1
      },
      events: {
        onReady: () => {
          ytReady = true;
          ytPlayer.setVolume(40);
        }
      }
    });
  };

  musicToggle.addEventListener('click', () => {
    if (!ytReady) return; // API still loading; ignore clicks until ready

    musicPlaying = !musicPlaying;
    if (musicPlaying) {
      ytPlayer.playVideo();
      musicToggle.textContent = '🔊';
    } else {
      ytPlayer.pauseVideo();
      musicToggle.textContent = '🔇';
    }
  });

  function playPop() {
    try {
      popSound.currentTime = 0;
      popSound.volume = 0.5;
      popSound.play().catch(() => {});
    } catch (err) { /* audio is a nice-to-have, never block the UI on it */ }
  }


  /* ============================ 4. ENVELOPE -> QUESTION FLOW ============================ */

  const envelopeBtn = document.getElementById('envelopeBtn');
  const envelope = document.getElementById('envelope');
  const landingScreen = document.getElementById('landingScreen');
  const questionScreen = document.getElementById('questionScreen');

  let envelopeOpened = false;

  envelopeBtn.addEventListener('click', () => {
    if (envelopeOpened) return;
    envelopeOpened = true;

    envelope.classList.add('is-open');
    playPop();

    // Let the open animation play, then swap screens
    setTimeout(() => {
      landingScreen.classList.add('hidden');
      questionScreen.classList.remove('hidden');
      questionScreen.classList.add('screen-enter');
      startTypewriter();
    }, 750);
  });


  /* ============================ 5. TYPEWRITER EFFECT ============================ */

  const questionText = document.getElementById('questionText');
  const FULL_QUESTION = 'Would you like to go on a date with me? ❤️';

  function startTypewriter() {
    questionText.textContent = '';
    questionText.classList.add('typing-caret');
    let i = 0;

    function typeNext() {
      if (i < FULL_QUESTION.length) {
        questionText.textContent += FULL_QUESTION.charAt(i);
        i++;
        setTimeout(typeNext, 45);
      } else {
        questionText.classList.remove('typing-caret');
      }
    }
    typeNext();
  }


  /* ============================ 6. YES / NO BUTTON GAME ============================ */

  const yesBtn = document.getElementById('yesBtn');
  const noBtn = document.getElementById('noBtn');
  const buttonRow = document.getElementById('buttonRow');
  const teasingMsg = document.getElementById('teasingMsg');
  const questionCard = document.getElementById('questionCard');

  const TEASE_MESSAGES = [
    'Are you sure? 🥺',
    'Think again...',
    'Please?',
    'Pretty please?',
    "I'll buy you food 🍕",
    'Last chance...',
    "Don't break my heart 💔",
    'Come on 😭',
    'Just say yes already 🥹',
    'The YES button is right there 👉'
  ];

  let noClicks = 0;
  const MIN_SCALE = 0.15; // NO button shrinks down to nearly nothing but stays technically clickable
  const MAX_YES_SCALE = 2.2;

  noBtn.addEventListener('click', () => {
    noClicks++;

    // Shrink NO, grow YES — clamped so things stay usable/visible
    const noScale = Math.max(MIN_SCALE, 1 - noClicks * 0.12);
    const yesScale = Math.min(MAX_YES_SCALE, 1 + noClicks * 0.16);

    noBtn.style.transform = `scale(${noScale})`;
    yesBtn.style.transform = `scale(${yesScale})`;

    // Funny message that cycles/escalates
    const msgIndex = Math.min(noClicks - 1, TEASE_MESSAGES.length - 1);
    teasingMsg.textContent = TEASE_MESSAGES[msgIndex];
    teasingMsg.style.animation = 'none';
    // Force reflow so the fade animation can retrigger on repeat clicks
    void teasingMsg.offsetWidth;
    teasingMsg.style.animation = 'fadeFlicker 0.4s ease';

    // After a couple of clicks, start making it flee to a random spot
    // inside the card so it becomes genuinely hard to pin down
    if (noClicks >= 2) {
      makeNoButtonFlee();
    }

    playPop();
  });

  function makeNoButtonFlee() {
    if (!noBtn.classList.contains('is-fleeing')) {
      noBtn.classList.add('is-fleeing');
      // Lock button-row height so the layout doesn't jump once NO becomes absolute
      buttonRow.style.minHeight = buttonRow.offsetHeight + 'px';
    }

    const cardRect = questionCard.getBoundingClientRect();
    const btnRect = noBtn.getBoundingClientRect();

    // Keep some padding so the button never leaves the card entirely
    const padding = 20;
    const maxLeft = Math.max(padding, cardRect.width - btnRect.width - padding);
    const maxTop = Math.max(padding, cardRect.height - btnRect.height - padding);

    const randomLeft = padding + Math.random() * (maxLeft - padding);
    const randomTop = padding + Math.random() * (maxTop - padding);

    noBtn.style.left = randomLeft + 'px';
    noBtn.style.top = randomTop + 'px';
  }

  // Also dodge on hover/pointer-near for extra chaos on desktop, once it's
  // already fleeing (keeps early clicks easy so the joke lands)
  noBtn.addEventListener('mouseenter', () => {
    if (noClicks >= 3) {
      makeNoButtonFlee();
    }
  });

  yesBtn.addEventListener('click', () => {
    playPop();
    goToPlanScreen();
  });


  /* ============================ 6b. PLAN THE DATE (type + calendar) ============================ */

  const planScreen = document.getElementById('planScreen');
  const dateTypeGrid = document.getElementById('dateTypeGrid');
  const calendarGrid = document.getElementById('calendarGrid');
  const calendarMonthLabel = document.getElementById('calendarMonthLabel');
  const prevMonthBtn = document.getElementById('prevMonthBtn');
  const nextMonthBtn = document.getElementById('nextMonthBtn');
  const planSelectionSummary = document.getElementById('planSelectionSummary');
  const confirmPlanBtn = document.getElementById('confirmPlanBtn');

  const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  let selectedDateType = null;
  let selectedDateObj = null; // JS Date of the chosen day
  let calendarViewYear;
  let calendarViewMonth; // 0-indexed

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  function goToPlanScreen() {
    questionScreen.classList.add('hidden');
    planScreen.classList.remove('hidden');
    planScreen.classList.add('screen-enter');

    calendarViewYear = today.getFullYear();
    calendarViewMonth = today.getMonth();
    renderCalendar();
  }

  // ---- Date type selection ----
  dateTypeGrid.addEventListener('click', (e) => {
    const btn = e.target.closest('.date-type-btn');
    if (!btn) return;

    dateTypeGrid.querySelectorAll('.date-type-btn').forEach((b) => b.classList.remove('selected'));
    btn.classList.add('selected');
    selectedDateType = btn.dataset.type;

    playPop();
    updatePlanSummary();
  });

  // ---- Calendar rendering ----
  function renderCalendar() {
    calendarMonthLabel.textContent = `${MONTH_NAMES[calendarViewMonth]} ${calendarViewYear}`;
    calendarGrid.innerHTML = '';

    const firstDayIndex = new Date(calendarViewYear, calendarViewMonth, 1).getDay();
    const daysInMonth = new Date(calendarViewYear, calendarViewMonth + 1, 0).getDate();

    // Leading blank cells so the 1st lines up under the correct weekday
    for (let i = 0; i < firstDayIndex; i++) {
      const empty = document.createElement('span');
      empty.className = 'cal-day empty';
      calendarGrid.appendChild(empty);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const cellDate = new Date(calendarViewYear, calendarViewMonth, day);
      cellDate.setHours(0, 0, 0, 0);

      const cell = document.createElement('button');
      cell.type = 'button';
      cell.className = 'cal-day';
      cell.textContent = day;

      if (cellDate.getTime() === today.getTime()) {
        cell.classList.add('today');
      }

      if (cellDate < today) {
        // Don't let anyone pick a date in the past
        cell.classList.add('disabled');
        cell.disabled = true;
      } else {
        cell.addEventListener('click', () => {
          calendarGrid.querySelectorAll('.cal-day').forEach((c) => c.classList.remove('selected'));
          cell.classList.add('selected');
          selectedDateObj = cellDate;
          playPop();
          updatePlanSummary();
        });
      }

      // Re-highlight if this is the already-selected day (e.g. after nav back)
      if (selectedDateObj && cellDate.getTime() === selectedDateObj.getTime()) {
        cell.classList.add('selected');
      }

      calendarGrid.appendChild(cell);
    }
  }

  prevMonthBtn.addEventListener('click', () => {
    calendarViewMonth--;
    if (calendarViewMonth < 0) { calendarViewMonth = 11; calendarViewYear--; }
    renderCalendar();
  });

  nextMonthBtn.addEventListener('click', () => {
    calendarViewMonth++;
    if (calendarViewMonth > 11) { calendarViewMonth = 0; calendarViewYear++; }
    renderCalendar();
  });

  function updatePlanSummary() {
    if (selectedDateType && selectedDateObj) {
      const dateStr = selectedDateObj.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
      planSelectionSummary.textContent = `${selectedDateType} on ${dateStr}`;
      confirmPlanBtn.disabled = false;
    } else {
      planSelectionSummary.textContent = 'Pick a date type and a day \u2728';
      confirmPlanBtn.disabled = true;
    }
  }

  confirmPlanBtn.addEventListener('click', () => {
    if (!selectedDateType || !selectedDateObj) return;
    playPop();
    goToCelebration();
  });


  /* ============================ 7. CELEBRATION: CONFETTI + FIREWORKS ============================ */

  const celebrationScreen = document.getElementById('celebrationScreen');
  const yaySub2 = document.getElementById('yaySub2');
  const sendMessageBtn = document.getElementById('sendMessageBtn');
  const RECIPIENT_EMAIL = 'mike.sablayan@gmail.com';
  const confettiLayer = document.getElementById('confettiLayer');
  const CONFETTI_COLORS = ['#ff5d8f', '#ffb3c6', '#ff9ebb', '#e8385f', '#fff0f5', '#ffd6e2'];

  function goToCelebration() {
    planScreen.classList.add('hidden');
    celebrationScreen.classList.remove('hidden');
    celebrationScreen.classList.add('screen-enter');

    // Reflect whatever the user picked on the plan screen, if anything,
    // and build a pre-filled email so Gab actually receives the answer
    if (selectedDateType && selectedDateObj) {
      const dateStr = selectedDateObj.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
      yaySub2.textContent = `${selectedDateType} on ${dateStr}! 🌹`;

      const subject = "She said YES! 💕";
      const body = `I said YES! 🎉\n\nDate type: ${selectedDateType}\nDate: ${dateStr}\n\nCan't wait! ❤️`;
      sendMessageBtn.href = `mailto:${RECIPIENT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }

    launchConfetti();
    launchFireworks();

    // Extra heart bloom for the celebration moment
    for (let i = 0; i < 20; i++) {
      setTimeout(spawnFloatingHeart, i * 80);
    }
  }

  function launchConfetti() {
    const pieceCount = 80;
    for (let i = 0; i < pieceCount; i++) {
      setTimeout(() => {
        const piece = document.createElement('span');
        piece.className = 'confetti-piece';
        piece.style.left = Math.random() * 100 + 'vw';
        piece.style.background = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
        piece.style.animationDuration = (2.5 + Math.random() * 2) + 's';
        piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
        piece.style.transform = `rotate(${Math.random() * 360}deg)`;
        confettiLayer.appendChild(piece);
        setTimeout(() => piece.remove(), 5000);
      }, i * 25);
    }
  }

  /* --- Lightweight canvas fireworks --- */
  const canvas = document.getElementById('fireworksCanvas');
  const ctx = canvas.getContext('2d');
  let fireworkParticles = [];
  let fireworksAnimationId = null;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  function createFireworkBurst(x, y) {
    const particleCount = 36;
    const hueBase = 330 + Math.random() * 30; // stay in the pink/red family
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount;
      const speed = 2 + Math.random() * 3;
      fireworkParticles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 60 + Math.random() * 20,
        maxLife: 80,
        color: `hsl(${hueBase + Math.random() * 20 - 10}, 90%, ${60 + Math.random() * 20}%)`
      });
    }
  }

  function animateFireworks() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    fireworkParticles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.04; // gentle gravity
      p.life -= 1;

      ctx.globalAlpha = Math.max(p.life / p.maxLife, 0);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.globalAlpha = 1;
    fireworkParticles = fireworkParticles.filter((p) => p.life > 0);

    if (fireworkParticles.length > 0) {
      fireworksAnimationId = requestAnimationFrame(animateFireworks);
    } else {
      canvas.style.display = 'none';
      fireworksAnimationId = null;
    }
  }

  function launchFireworks() {
    canvas.style.display = 'block';

    const bursts = 5;
    for (let i = 0; i < bursts; i++) {
      setTimeout(() => {
        const x = canvas.width * (0.2 + Math.random() * 0.6);
        const y = canvas.height * (0.15 + Math.random() * 0.35);
        createFireworkBurst(x, y);
        if (!fireworksAnimationId) {
          fireworksAnimationId = requestAnimationFrame(animateFireworks);
        }
      }, i * 400);
    }
  }


  /* ============================ 8. MISC FUN ============================ */

  // Disable right-click, purely for playful effect (as requested)
  document.addEventListener('contextmenu', (e) => e.preventDefault());

  // Belt-and-suspenders against accidental text selection/drag on mobile
  document.addEventListener('selectstart', (e) => e.preventDefault());
  document.addEventListener('dragstart', (e) => e.preventDefault());

});
