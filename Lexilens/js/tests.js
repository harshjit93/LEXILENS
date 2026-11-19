// screening activities logic

// state tracking variables
let currentStudentId = null;
let currentActivity = null;
let activityTimer = null;
let currentScores = {
  reading: null,
  letterFlip: null,
  focus: null,
  typing: null
};

// reading passage options
const READING_PASSAGES = {
  easy: "The little bird sat on a tall green tree. It sang a happy song as the morning sun warmed the flowers.",
  medium: "Curious dolphins leap gracefully through the sparkling ocean waves. They use clever whistling sounds to speak with their playful friends.",
  hard: "Scientists explore dense tropical rainforests where mysterious creatures camouflage amidst vibrant emerald foliage and ancient towering trees."
};

// letter flip questions
const LETTER_FLIP_QUESTIONS = [
  { prompt: "Which letter is:", target: "b", options: ["b", "d"], correct: "b" },
  { prompt: "Which letter is:", target: "d", options: ["d", "b"], correct: "d" },
  { prompt: "Which letter is:", target: "p", options: ["p", "q"], correct: "p" },
  { prompt: "Which letter is:", target: "q", options: ["b", "q"], correct: "q" },
  { prompt: "Which letter is:", target: "m", options: ["m", "w"], correct: "m" },
  { prompt: "Which letter is:", target: "w", options: ["w", "m"], correct: "w" },
  { prompt: "Select the word:", target: "was", options: ["was", "saw"], correct: "was" },
  { prompt: "Select the word:", target: "saw", options: ["saw", "was"], correct: "saw" },
  { prompt: "Select the word:", target: "on", options: ["no", "on"], correct: "on" },
  { prompt: "Select the word:", target: "from", options: ["form", "from"], correct: "from" }
];

// sentence for typing
const TYPING_TARGET = "The gentle morning breeze brought the sweet scent of fresh rain across the peaceful green valley.";

// initialize student scores
function initTestRunner(studentId) {
  currentStudentId = studentId;
  const latest = getLatestResult(studentId);
  if (latest) {
    currentScores.reading = latest.readingScore;
    currentScores.letterFlip = latest.letterFlipScore;
    currentScores.focus = latest.focusScore;
    currentScores.typing = latest.typingScore;
  }
}

// open activity modal
function openActivityModal(activityKey) {
  currentActivity = activityKey;
  const modal = document.getElementById("activity-modal");
  const modalContent = document.getElementById("modal-test-content");

  if (!modal || !modalContent) return;

  modal.classList.add("active");
  renderInstructions(activityKey);
}

// close activity modal
function closeActivityModal() {
  const modal = document.getElementById("activity-modal");
  if (modal) {
    modal.classList.remove("active");
  }
  if (activityTimer) {
    clearInterval(activityTimer);
    activityTimer = null;
  }
}

// render activity instructions
function renderInstructions(activityKey) {
  const container = document.getElementById("modal-test-content");
  let title = "";
  let iconSvg = "";
  let description = "";
  let tips = [];

  if (activityKey === "reading") {
    title = "Reading Voice & Fluency Task";
    iconSvg = `<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#3E7C8C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>`;
    description = "Read a short paragraph aloud into your microphone or tap along. We screen for reading pace, pauses, and missing words.";
    tips = ["Find a quiet room", "Speak clearly at your normal pace", "Click fallback if you don't have a mic"];
  } else if (activityKey === "letterFlip") {
    title = "Letter-Flip Challenge";
    iconSvg = `<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#3E7C8C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 7 4 4 20 4 20 7"></polyline><line x1="9" y1="20" x2="15" y2="20"></line><line x1="12" y1="4" x2="12" y2="20"></line></svg>`;
    description = "Identify confusing letter and word pairs like b/d, p/q, and was/saw as fast and accurately as you can.";
    tips = ["10 quick questions", "Look carefully at letter stems", "Take your time to be accurate"];
  } else if (activityKey === "focus") {
    title = "Focus-Tracking Task";
    iconSvg = `<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#3E7C8C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>`;
    description = "Keep your mouse pointer or finger on the guide for 30 seconds as it smoothly glides around the arena.";
    tips = ["Follow the guide circle smoothly", "Try not to let your cursor drift away", "Screens visual-motor attention"];
  } else if (activityKey === "typing") {
    title = "Typing Rhythm Test";
    iconSvg = `<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#3E7C8C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" ry="2"></rect><line x1="6" y1="8" x2="6" y2="8"></line><line x1="10" y1="8" x2="10" y2="8"></line><line x1="14" y1="8" x2="14" y2="8"></line><line x1="18" y1="8" x2="18" y2="8"></line><line x1="6" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="18" y2="12"></line><line x1="7" y1="16" x2="17" y2="16"></line></svg>`;
    description = "Type the given sentence in the text box. We look for typing flow, pause lengths, and correction rhythm.";
    tips = ["Type naturally and steadily", "Take your time without rushing", "Screens motor rhythm and fluency"];
  }

  container.innerHTML = `
    <div style="text-align: center; padding: 12px 0;">
      <div style="display: flex; justify-content: center; margin-bottom: 12px;">${iconSvg}</div>
      <h2 style="margin-bottom: 8px;">${title}</h2>
      <p style="margin: 0 auto 20px auto; font-size: 0.95rem; max-width: 500px;">${description}</p>
      
      <div style="background: var(--surface-soft); border: 1px solid var(--border); border-radius: 10px; padding: 16px; margin-bottom: 24px; text-align: left;">
        <p style="font-weight: 600; color: var(--text); margin-bottom: 8px; font-size: 0.88rem;">Activity Tips:</p>
        <ul style="padding-left: 20px; color: var(--text-soft); font-size: 0.88rem; line-height: 1.6;">
          ${tips.map(tip => `<li>${tip}</li>`).join("")}
        </ul>
      </div>

      <div style="display: flex; gap: 12px; justify-content: center;">
        <button class="btn btn-secondary" onclick="closeActivityModal()">Cancel</button>
        <button class="btn btn-primary" onclick="startCountdown('${activityKey}')">I'm Ready — Start!</button>
      </div>
    </div>
  `;
}

// 3-2-1 countdown step
function startCountdown(activityKey) {
  const container = document.getElementById("modal-test-content");
  let count = 3;

  container.innerHTML = `
    <div style="min-height: 260px; display: flex; flex-direction: column; align-items: center; justify-content: center;">
      <p style="font-size: 0.9rem; color: var(--text-soft); letter-spacing: 1px; font-weight: 600;">Starting in...</p>
      <div id="countdown-number" style="font-family: var(--font-heading); font-size: 4.5rem; font-weight: 700; color: var(--primary); margin: 8px 0;">
        ${count}
      </div>
      <p style="font-size: 0.9rem; color: var(--text-soft);">Take a relaxed breath</p>
    </div>
  `;

  const countdownTimer = setInterval(() => {
    count--;
    const numEl = document.getElementById("countdown-number");
    if (numEl) {
      if (count > 0) {
        numEl.textContent = count;
      } else if (count === 0) {
        numEl.textContent = "Go!";
      } else {
        clearInterval(countdownTimer);
        if (activityKey === "reading") launchReadingTask();
        else if (activityKey === "letterFlip") launchLetterFlipTask();
        else if (activityKey === "focus") launchFocusTask();
        else if (activityKey === "typing") launchTypingTask();
      }
    } else {
      clearInterval(countdownTimer);
    }
  }, 850);
}

// ==========================================
// ACTIVITY 1: READING TASK
// ==========================================
function launchReadingTask() {
  const container = document.getElementById("modal-test-content");
  const defaultPassage = READING_PASSAGES.easy;
  const words = defaultPassage.split(" ");

  container.innerHTML = `
    <div>
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <h3 style="font-size: 1.15rem;">Read Aloud Task</h3>
        <div style="display: flex; gap: 6px;">
          <button class="btn btn-sm btn-secondary active-level" onclick="changePassageLevel('easy')">Easy</button>
          <button class="btn btn-sm btn-secondary" onclick="changePassageLevel('medium')">Medium</button>
          <button class="btn btn-sm btn-secondary" onclick="changePassageLevel('hard')">Hard</button>
        </div>
      </div>

      <div id="reading-passage-box" style="background: var(--surface-soft); border: 1px solid var(--border); border-radius: 10px; padding: 22px; font-size: 1.25rem; line-height: 1.8; margin-bottom: 20px; min-height: 120px; color: var(--text);">
        ${words.map((w, i) => `<span id="read-word-${i}" style="padding: 2px 4px; border-radius: 4px; transition: background-color 0.18s;">${w}</span>`).join(" ")}
      </div>

      <div style="background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 12px 18px; margin-bottom: 20px; display: flex; justify-content: space-around; font-size: 0.9rem;">
        <div>Timer: <strong id="read-timer" style="color: var(--primary);">0s</strong></div>
        <div>Words Read: <strong id="read-word-count" style="color: var(--success);">0 / ${words.length}</strong></div>
        <div>Status: <strong id="read-status" style="color: var(--text-soft);">Listening...</strong></div>
      </div>

      <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
        <button id="btn-next-word-fallback" class="btn btn-secondary">
          <span>Tap Next Word (Spacebar / Click)</span>
        </button>
        <button id="btn-finish-reading" class="btn btn-primary">
          <span>Finish Reading ✓</span>
        </button>
      </div>
    </div>
  `;

  let currentWordIdx = 0;
  let startTime = Date.now();
  let readingFinished = false;
  let readTimerInterval = setInterval(() => {
    if (!readingFinished) {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const timerEl = document.getElementById("read-timer");
      if (timerEl) timerEl.textContent = `${elapsed}s`;
    }
  }, 1000);

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  let recognition = null;

  if (SpeechRecognition) {
    try {
      recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (event) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript.toLowerCase();
        }
        const spokenTokens = transcript.split(/\s+/);
        spokenTokens.forEach(spToken => {
          if (currentWordIdx < words.length) {
            const cleanTarget = words[currentWordIdx].replace(/[^a-zA-Z]/g, "").toLowerCase();
            const cleanSpoken = spToken.replace(/[^a-zA-Z]/g, "").toLowerCase();
            if (cleanTarget === cleanSpoken || cleanTarget.includes(cleanSpoken)) {
              advanceReadingWord();
            }
          }
        });
      };

      recognition.onerror = () => {
        const statusEl = document.getElementById("read-status");
        if (statusEl) statusEl.textContent = "Mic mode or Tap mode ready";
      };

      recognition.start();
    } catch (e) {
      // recognition fallback
    }
  }

  function advanceReadingWord() {
    if (currentWordIdx < words.length) {
      const el = document.getElementById(`read-word-${currentWordIdx}`);
      if (el) {
        el.style.background = "#EAF5EE";
        el.style.color = "#4E9A6B";
      }
      currentWordIdx++;
      const countEl = document.getElementById("read-word-count");
      if (countEl) countEl.textContent = `${currentWordIdx} / ${words.length}`;

      if (currentWordIdx < words.length) {
        const nextEl = document.getElementById(`read-word-${currentWordIdx}`);
        if (nextEl) {
          nextEl.style.background = "rgba(62, 124, 140, 0.18)";
          nextEl.style.color = "var(--text)";
        }
      }
    }
  }

  const firstEl = document.getElementById("read-word-0");
  if (firstEl) {
    firstEl.style.background = "rgba(62, 124, 140, 0.18)";
  }

  const fallbackBtn = document.getElementById("btn-next-word-fallback");
  if (fallbackBtn) {
    fallbackBtn.addEventListener("click", advanceReadingWord);
  }

  const handleSpace = (e) => {
    if (e.code === "Space" && !readingFinished) {
      e.preventDefault();
      advanceReadingWord();
    }
  };
  window.addEventListener("keydown", handleSpace);

  document.getElementById("btn-finish-reading").addEventListener("click", () => {
    readingFinished = true;
    clearInterval(readTimerInterval);
    window.removeEventListener("keydown", handleSpace);
    if (recognition) {
      try { recognition.stop(); } catch(e) {}
    }

    const elapsedSeconds = Math.max(1, Math.floor((Date.now() - startTime) / 1000));
    const wordsPerMinute = Math.round((currentWordIdx / elapsedSeconds) * 60) || 45;
    const accuracy = Math.round((currentWordIdx / words.length) * 100);

    let score = Math.round((accuracy * 0.7) + (Math.min(100, (wordsPerMinute / 90) * 100) * 0.3));
    score = Math.max(30, Math.min(100, score));

    currentScores.reading = score;
    renderResult("reading", score, {
      "Reading Speed": `${wordsPerMinute} WPM`,
      "Words Completed": `${currentWordIdx} / ${words.length}`,
      "Accuracy": `${accuracy}%`,
      "Duration": `${elapsedSeconds}s`
    });
  });
}

// switch passage difficulty
function changePassageLevel(lvl) {
  const passage = READING_PASSAGES[lvl] || READING_PASSAGES.easy;
  const words = passage.split(" ");
  const box = document.getElementById("reading-passage-box");
  if (box) {
    box.innerHTML = words.map((w, i) => `<span id="read-word-${i}" style="padding: 2px 4px; border-radius: 4px; transition: background-color 0.18s;">${w}</span>`).join(" ");
    const first = document.getElementById("read-word-0");
    if (first) first.style.background = "rgba(62, 124, 140, 0.18)";
  }
}

// ==========================================
// ACTIVITY 2: LETTER-FLIP CHALLENGE
// ==========================================
function launchLetterFlipTask() {
  const container = document.getElementById("modal-test-content");
  let questionIdx = 0;
  let correctCount = 0;
  let streak = 0;
  let maxStreak = 0;
  let responseTimes = [];
  let questionStartTime = Date.now();

  function renderQuestion() {
    if (questionIdx >= LETTER_FLIP_QUESTIONS.length) {
      finishLetterFlip();
      return;
    }

    const q = LETTER_FLIP_QUESTIONS[questionIdx];
    questionStartTime = Date.now();

    container.innerHTML = `
      <div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <h3 style="font-size: 1.15rem;">Letter-Flip Challenge</h3>
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 0.85rem; color: var(--text-soft);">Question ${questionIdx + 1} of ${LETTER_FLIP_QUESTIONS.length}</span>
            <span class="badge badge-warning" id="streak-badge"><span class="badge-icon">▲</span> Streak: ${streak}</span>
          </div>
        </div>

        <div style="background: var(--surface-soft); border: 1px solid var(--border); border-radius: 12px; padding: 32px 20px; text-align: center; margin-bottom: 24px;">
          <p style="font-size: 0.92rem; color: var(--text-soft); margin-bottom: 6px;">${q.prompt}</p>
          <div style="font-size: 3.5rem; font-weight: 700; color: var(--text); font-family: var(--font-heading);">
            ${q.target}
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(${q.options.length}, 1fr); gap: 14px;">
          ${q.options.map(opt => `
            <button class="btn btn-secondary opt-btn" style="padding: 16px; font-size: 1.4rem; font-weight: 600; border-radius: 10px;" data-val="${opt}">
              ${opt}
            </button>
          `).join("")}
        </div>
      </div>
    `;

    const btns = container.querySelectorAll(".opt-btn");
    btns.forEach(btn => {
      btn.addEventListener("click", () => {
        const val = btn.getAttribute("data-val");
        const reactionTime = Date.now() - questionStartTime;
        responseTimes.push(reactionTime);

        if (val === q.correct) {
          correctCount++;
          streak++;
          if (streak > maxStreak) maxStreak = streak;
          btn.style.background = "#EAF5EE";
          btn.style.borderColor = "var(--success)";
          btn.style.color = "var(--success)";
        } else {
          streak = 0;
          btn.style.background = "#FDF2F2";
          btn.style.borderColor = "var(--danger)";
          btn.style.color = "var(--danger)";
        }

        setTimeout(() => {
          questionIdx++;
          renderQuestion();
        }, 250);
      });
    });
  }

  function finishLetterFlip() {
    const total = LETTER_FLIP_QUESTIONS.length;
    const accuracy = Math.round((correctCount / total) * 100);
    const avgTimeMs = responseTimes.length > 0 
      ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
      : 1200;

    let speedBonus = avgTimeMs < 1500 ? 15 : (avgTimeMs < 2500 ? 5 : 0);
    let score = Math.min(100, Math.round((accuracy * 0.85) + speedBonus));

    currentScores.letterFlip = score;
    renderResult("letterFlip", score, {
      "Accuracy": `${accuracy}% (${correctCount}/${total})`,
      "Max Streak": `${maxStreak}`,
      "Average Reaction": `${(avgTimeMs / 1000).toFixed(2)}s`,
      "Questions": `${total}`
    });
  }

  renderQuestion();
}

// ==========================================
// ACTIVITY 3: FOCUS-TRACKING TASK
// ==========================================
function launchFocusTask() {
  const container = document.getElementById("modal-test-content");

  container.innerHTML = `
    <div>
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <h3 style="font-size: 1.15rem;">Focus Tracking Arena</h3>
        <div style="display: flex; gap: 14px; font-size: 0.9rem;">
          <div>Time: <strong id="focus-time" style="color: var(--primary);">30s</strong></div>
          <div>Focus Score: <strong id="live-focus-pct" style="color: var(--success);">100%</strong></div>
        </div>
      </div>

      <p style="font-size: 0.88rem; color: var(--text-soft); margin-bottom: 12px;">Keep your pointer smoothly on the guide circle as it glides around:</p>

      <div id="focus-arena" style="position: relative; width: 100%; height: 300px; background: var(--surface-soft); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; cursor: crosshair;">
        <div id="focus-orb" style="position: absolute; width: 44px; height: 44px; border-radius: 50%; background: var(--primary); top: 128px; left: calc(50% - 22px); pointer-events: none; transition: transform 0.1s linear;"></div>
        <div id="focus-status-pill" style="position: absolute; bottom: 12px; left: 12px; font-size: 0.78rem; padding: 4px 10px; border-radius: 999px; background: var(--surface); border: 1px solid var(--border); color: var(--text-soft);">
          Ready
        </div>
      </div>
    </div>
  `;

  const arena = document.getElementById("focus-arena");
  const orb = document.getElementById("focus-orb");
  const statusPill = document.getElementById("focus-status-pill");

  let arenaRect = arena.getBoundingClientRect();
  let orbX = arenaRect.width / 2;
  let orbY = arenaRect.height / 2;
  let velX = 2.2;
  let velY = 1.7;
  const orbRadius = 22;

  let pointerX = -999;
  let pointerY = -999;
  let inFocusFrames = 0;
  let totalFrames = 0;
  let driftCount = 0;
  let isCurrentlyFocused = false;

  arena.addEventListener("mousemove", (e) => {
    const rect = arena.getBoundingClientRect();
    pointerX = e.clientX - rect.left;
    pointerY = e.clientY - rect.top;
  });

  arena.addEventListener("touchmove", (e) => {
    if (e.touches.length > 0) {
      const rect = arena.getBoundingClientRect();
      pointerX = e.touches[0].clientX - rect.left;
      pointerY = e.touches[0].clientY - rect.top;
    }
  });

  let timeLeft = 30;
  const timeEl = document.getElementById("focus-time");
  const livePctEl = document.getElementById("live-focus-pct");

  let animationFrameId = null;
  function updateArena() {
    arenaRect = arena.getBoundingClientRect();

    orbX += velX;
    orbY += velY;

    if (orbX - orbRadius <= 0 || orbX + orbRadius >= arenaRect.width) {
      velX = -velX;
      orbX = Math.max(orbRadius, Math.min(arenaRect.width - orbRadius, orbX));
    }
    if (orbY - orbRadius <= 0 || orbY + orbRadius >= arenaRect.height) {
      velY = -velY;
      orbY = Math.max(orbRadius, Math.min(arenaRect.height - orbRadius, orbY));
    }

    orb.style.left = `${orbX - orbRadius}px`;
    orb.style.top = `${orbY - orbRadius}px`;

    const dist = Math.hypot(pointerX - orbX, pointerY - orbY);
    totalFrames++;

    if (dist <= 48) {
      inFocusFrames++;
      if (!isCurrentlyFocused) {
        isCurrentlyFocused = true;
        orb.style.background = "var(--success)";
        if (statusPill) {
          statusPill.textContent = "✓ On Target";
          statusPill.style.color = "var(--success)";
        }
      }
    } else {
      if (isCurrentlyFocused) {
        isCurrentlyFocused = false;
        driftCount++;
        orb.style.background = "var(--primary)";
        if (statusPill) {
          statusPill.textContent = "○ Cursor Drifted";
          statusPill.style.color = "var(--text-soft)";
        }
      }
    }

    if (totalFrames > 0 && livePctEl) {
      const livePct = Math.round((inFocusFrames / totalFrames) * 100);
      livePctEl.textContent = `${livePct}%`;
    }

    animationFrameId = requestAnimationFrame(updateArena);
  }

  animationFrameId = requestAnimationFrame(updateArena);

  const timerInterval = setInterval(() => {
    timeLeft--;
    if (timeEl) timeEl.textContent = `${timeLeft}s`;

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      cancelAnimationFrame(animationFrameId);

      const focusPercentage = Math.round((inFocusFrames / Math.max(1, totalFrames)) * 100);
      currentScores.focus = focusPercentage;

      renderResult("focus", focusPercentage, {
        "Focus Score": `${focusPercentage}%`,
        "Time on Target": `${((focusPercentage * 30) / 100).toFixed(1)}s`,
        "Drift Count": `${driftCount}`,
        "Total Duration": "30 seconds"
      });
    }
  }, 1000);
}

// ==========================================
// ACTIVITY 4: TYPING RHYTHM TEST
// ==========================================
function launchTypingTask() {
  const container = document.getElementById("modal-test-content");
  const targetText = TYPING_TARGET;

  container.innerHTML = `
    <div>
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <h3 style="font-size: 1.15rem;">Typing Rhythm Test</h3>
        <div style="display: flex; gap: 14px; font-size: 0.9rem;">
          <div>WPM: <strong id="typing-wpm" style="color: var(--primary);">0</strong></div>
          <div>Accuracy: <strong id="typing-acc" style="color: var(--success);">100%</strong></div>
          <div>Corrections: <strong id="typing-backspaces" style="color: var(--warning);">0</strong></div>
        </div>
      </div>

      <p style="font-size: 0.88rem; color: var(--text-soft); margin-bottom: 12px;">Type the sentence below calmly and smoothly:</p>

      <div id="typing-preview-box" style="background: var(--surface-soft); border: 1px solid var(--border); border-radius: 8px; padding: 18px; font-size: 1.15rem; line-height: 1.7; margin-bottom: 16px; min-height: 80px; user-select: none;">
        ${targetText.split("").map((ch, i) => `<span id="type-char-${i}" style="color: var(--text-soft);">${ch}</span>`).join("")}
      </div>

      <div class="form-group">
        <textarea id="typing-input" class="form-textarea" rows="3" placeholder="Click here and start typing..." autofocus style="font-size: 1.05rem;"></textarea>
      </div>

      <div style="text-align: right;">
        <button id="btn-submit-typing" class="btn btn-primary" disabled>
          <span>Complete Test ✓</span>
        </button>
      </div>
    </div>
  `;

  const input = document.getElementById("typing-input");
  const submitBtn = document.getElementById("btn-submit-typing");
  const wpmEl = document.getElementById("typing-wpm");
  const accEl = document.getElementById("typing-acc");
  const backspacesEl = document.getElementById("typing-backspaces");

  let startTime = null;
  let backspaceCount = 0;
  let lastKeystrokeTime = Date.now();
  let pausesOver2s = 0;

  input.focus();

  input.addEventListener("keydown", (e) => {
    if (!startTime) {
      startTime = Date.now();
    }

    const now = Date.now();
    if (now - lastKeystrokeTime > 2000) {
      pausesOver2s++;
    }
    lastKeystrokeTime = now;

    if (e.key === "Backspace") {
      backspaceCount++;
      if (backspacesEl) backspacesEl.textContent = backspaceCount;
    }
  });

  input.addEventListener("input", () => {
    const entered = input.value;
    const len = entered.length;

    let correctChars = 0;
    for (let i = 0; i < targetText.length; i++) {
      const charSpan = document.getElementById(`type-char-${i}`);
      if (!charSpan) continue;

      if (i < len) {
        if (entered[i] === targetText[i]) {
          charSpan.style.color = "var(--success)";
          charSpan.style.background = "transparent";
          correctChars++;
        } else {
          charSpan.style.color = "var(--danger)";
          charSpan.style.background = "#FDF2F2";
        }
      } else if (i === len) {
        charSpan.style.color = "var(--text)";
        charSpan.style.background = "rgba(62, 124, 140, 0.18)";
      } else {
        charSpan.style.color = "var(--text-soft)";
        charSpan.style.background = "transparent";
      }
    }

    const elapsedMinutes = (Date.now() - (startTime || Date.now())) / 60000;
    const wpm = elapsedMinutes > 0 ? Math.round((entered.split(" ").length / elapsedMinutes)) : 0;
    const acc = len > 0 ? Math.round((correctChars / len) * 100) : 100;

    if (wpmEl) wpmEl.textContent = wpm;
    if (accEl) accEl.textContent = `${acc}%`;

    if (len >= targetText.length * 0.8) {
      submitBtn.removeAttribute("disabled");
    }
  });

  submitBtn.addEventListener("click", () => {
    const entered = input.value;
    const elapsedMinutes = Math.max(0.1, (Date.now() - (startTime || Date.now())) / 60000);
    const wpm = Math.round((entered.split(" ").length / elapsedMinutes));
    
    let correctChars = 0;
    for (let i = 0; i < entered.length; i++) {
      if (entered[i] === targetText[i]) correctChars++;
    }
    const accuracy = Math.round((correctChars / Math.max(1, entered.length)) * 100);

    let rhythmScore = Math.max(40, 100 - (backspaceCount * 3) - (pausesOver2s * 5));
    let score = Math.round((accuracy * 0.6) + (rhythmScore * 0.4));
    score = Math.max(30, Math.min(100, score));

    currentScores.typing = score;
    renderResult("typing", score, {
      "Typing Speed": `${wpm} WPM`,
      "Accuracy": `${accuracy}%`,
      "Corrections (Backspaces)": `${backspaceCount}`,
      "Hesitations (>2s pauses)": `${pausesOver2s}`
    });
  });
}

// ==========================================
// RESULTS & SCORING MODAL
// ==========================================
function getScoreLevel(score) {
  if (score >= 75) return { label: "On Track", badge: "badge-success", color: "var(--success)", icon: "✓" };
  if (score >= 50) return { label: "Needs Attention", badge: "badge-warning", color: "var(--warning)", icon: "▲" };
  return { label: "Needs Support", badge: "badge-danger", color: "var(--danger)", icon: "●" };
}

function renderResult(activityKey, score, metrics) {
  const container = document.getElementById("modal-test-content");
  const levelInfo = getScoreLevel(score);

  let observation = "";
  if (score >= 75) {
    observation = "Great effort! Your pace and accuracy are steady and comfortable.";
  } else if (score >= 50) {
    observation = "Good work! Taking gentle pauses and using the Adaptive Reader will make reading even smoother.";
  } else {
    observation = "Thank you for completing this! Extra spacing, reading ruler, and speech assistance will provide comfortable support.";
  }

  container.innerHTML = `
    <div style="text-align: center; padding: 10px 0;">
      <span class="badge ${levelInfo.badge}" style="font-size: 0.9rem; padding: 6px 16px; margin-bottom: 12px;">
        <span class="badge-icon">${levelInfo.icon}</span> ${levelInfo.label}
      </span>

      <h2 style="font-size: 1.6rem; margin-bottom: 6px;">Activity Result</h2>
      <p style="color: var(--text-soft); font-size: 0.95rem; margin-bottom: 20px;">${observation}</p>

      <div style="width: 110px; height: 110px; border-radius: 50%; border: 5px solid ${levelInfo.color}; margin: 0 auto 20px auto; display: flex; flex-direction: column; align-items: center; justify-content: center; background: var(--surface);">
        <span style="font-family: var(--font-heading); font-size: 2rem; font-weight: 700; color: var(--text); line-height: 1;">${score}</span>
        <span style="font-size: 0.72rem; color: var(--text-soft); text-transform: uppercase;">out of 100</span>
      </div>

      <div style="background: var(--surface-soft); border: 1px solid var(--border); border-radius: 10px; padding: 16px; margin-bottom: 20px; text-align: left;">
        <p style="font-weight: 600; color: var(--text); font-size: 0.84rem; text-transform: uppercase; margin-bottom: 10px;">Performance Breakdown:</p>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 0.88rem;">
          ${Object.entries(metrics).map(([key, val]) => `
            <div>
              <span style="color: var(--text-soft);">${key}:</span>
              <strong style="color: var(--text); margin-left: 4px;">${val}</strong>
            </div>
          `).join("")}
        </div>
      </div>

      <button class="btn btn-primary" onclick="saveAndReturn()" style="width: 100%;">
        <span>Save & Return to Activities</span>
        <span>✓</span>
      </button>
    </div>
  `;
}

// save test results
function saveAndReturn() {
  if (currentStudentId) {
    const validScores = [
      currentScores.letterFlip,
      currentScores.focus,
      currentScores.typing
    ].filter(s => s !== null && s !== undefined);

    const overall = validScores.length > 0 
      ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length)
      : 70;

    const level = getScoreLevel(overall).label;

    let remark = "Screening complete. ";
    if (currentScores.letterFlip !== null && currentScores.letterFlip < 60) {
      remark += "Shows letter orientation sensitivity (b/d). ";
    }
    if (currentScores.focus !== null && currentScores.focus < 60) {
      remark += "Focus benefits from shorter chunked sessions. ";
    }
    if (currentScores.typing !== null && currentScores.typing < 60) {
      remark += "Typing rhythm benefits from relaxed practice. ";
    }
    if (validScores.length >= 3 && overall >= 75) {
      remark += "All skills currently on track.";
    }

    saveTestResult(currentStudentId, {
      letterFlipScore: currentScores.letterFlip || 70,
      focusScore: currentScores.focus || 70,
      typingScore: currentScores.typing || 70,
      overallScore: overall,
      level: level,
      remark: remark
    });

    showToast("Screening results saved", "success");
  }

  closeActivityModal();

  if (typeof updateStudentDashboardUI === "function") {
    updateStudentDashboardUI();
  }
}
