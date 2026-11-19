// adaptive reader logic

// state variables for reader
let activeStudentId = null;
let currentText = "";
let currentSentenceIndex = 0;
let sentenceList = [];
let speechUtterance = null;
let isSpeaking = false;
let isPaused = false;
let wordsSpans = [];

// sample reading passages
const SAMPLE_TEXTS = [
  "Dolphins are extraordinary marine mammals known for their playful intelligence and empathy. They leap through ocean waves and communicate using intricate series of clicks, whistles, and body movements. Scientists believe dolphins even possess individual signature whistles, much like human names. When a dolphin sleeps, only half of its brain rests at a time, allowing it to stay alert for air and predators.",
  "Mars, the red planet, has captured human imagination for centuries. Its rusty red surface is covered in iron oxide, surrounded by a thin carbon dioxide atmosphere. Giant extinct volcanoes, including Olympus Mons—the largest volcano in the entire solar system—tower miles above the dusty plains. Rovers like Curiosity and Perseverance continue to search for ancient microscopic signs of water and life beneath Martian rocks.",
  "Deep beneath the soil, tree roots connect with underground fungal networks called mycorrhizae. Through this hidden biological highway, often nicknamed the Wood Wide Web, trees share water, carbon, and vital nutrients. Older parent trees can even send warning chemicals and extra nourishment to fragile young saplings growing in their shade.",
  "Honeybees are essential pollinators that sustain countless blooming flowers, fruit orchards, and vegetables across our planet. Inside a busy hive, worker bees perform a remarkable waggle dance to communicate the exact angle and distance of rich blossom patches relative to the sun. Each bee visits hundreds of flowers each day, gathering golden pollen and sweet nectar.",
  "High above the polar skies, the breathtaking Aurora Borealis shimmers in waves of emerald green, violet, and soft rose. These northern lights occur when charged particles from solar winds collide with gases in Earth's upper atmosphere. The gentle glowing ribbons twist and fold like luminous celestial curtains against the starry night.",
  "Coral reefs are vibrant underwater cities that shelter a quarter of all marine species in warm tropical waters. Tiny coral polyps build massive calcium limestone skeletons over centuries, creating safe homes for clownfish, sea turtles, and graceful manta rays. Preserving these delicate coral ecosystems protects our living oceans for generations to come."
];

let currentSampleIndex = 0;

// default reader settings
let readerSettings = {
  fontFamily: "dyslexic",
  fontSize: 20,
  letterSpacing: 2,
  wordSpacing: 4,
  lineHeight: 1.8,
  theme: "cream",
  readingRuler: true,
  speechRate: 1.0,
  focusMode: false
};

// initialize adaptive reader
function initAdaptiveReader(studentId) {
  activeStudentId = studentId;

  // load saved settings
  const saved = getReaderSettings(studentId);
  if (saved) {
    readerSettings = { ...readerSettings, ...saved };
  }

  // update control forms
  syncControlsWithSettings();

  // set initial sample text
  const initialText = SAMPLE_TEXTS[0];
  const input = document.getElementById("reader-input-textarea");
  if (input) input.value = initialText;
  setReaderText(initialText);

  // apply settings view
  applyReaderSettings();

  // setup event listeners
  setupReaderControls();
  setupReadingRuler();
  setupTTS();
}

// sync controls with settings
function syncControlsWithSettings() {
  const fontSelect = document.getElementById("select-font");
  const sizeSlider = document.getElementById("slider-font-size");
  const letterSlider = document.getElementById("slider-letter-spacing");
  const wordSlider = document.getElementById("slider-word-spacing");
  const lineSlider = document.getElementById("slider-line-height");
  const speechSlider = document.getElementById("slider-speech-rate");
  const rulerToggle = document.getElementById("toggle-ruler");
  const focusToggle = document.getElementById("toggle-focus-mode");

  if (fontSelect) fontSelect.value = readerSettings.fontFamily;
  if (sizeSlider) sizeSlider.value = readerSettings.fontSize;
  if (letterSlider) letterSlider.value = readerSettings.letterSpacing;
  if (wordSlider) wordSlider.value = readerSettings.wordSpacing;
  if (lineSlider) lineSlider.value = readerSettings.lineHeight;
  if (speechSlider) speechSlider.value = readerSettings.speechRate;
  if (rulerToggle) rulerToggle.checked = readerSettings.readingRuler;
  if (focusToggle) focusToggle.checked = readerSettings.focusMode;

  // update slider labels
  updateControlLabels();

  // highlight active theme
  highlightActiveTheme(readerSettings.theme);
}

// update slider labels
function updateControlLabels() {
  const lblSize = document.getElementById("val-font-size");
  const lblLetter = document.getElementById("val-letter-spacing");
  const lblWord = document.getElementById("val-word-spacing");
  const lblLine = document.getElementById("val-line-height");
  const lblSpeech = document.getElementById("val-speech-rate");

  if (lblSize) lblSize.textContent = `${readerSettings.fontSize}px`;
  if (lblLetter) lblLetter.textContent = `${readerSettings.letterSpacing}px`;
  if (lblWord) lblWord.textContent = `${readerSettings.wordSpacing}px`;
  if (lblLine) lblLine.textContent = `${readerSettings.lineHeight}`;
  if (lblSpeech) lblSpeech.textContent = `${readerSettings.speechRate}x`;
}

// highlight active theme
function highlightActiveTheme(themeName) {
  const buttons = document.querySelectorAll(".theme-preset-btn");
  buttons.forEach(btn => {
    if (btn.getAttribute("data-theme") === themeName) {
      btn.classList.add("active-theme");
    } else {
      btn.classList.remove("active-theme");
    }
  });
}

// apply settings to reader
function applyReaderSettings() {
  const display = document.getElementById("reader-display-box");
  const ruler = document.getElementById("reading-ruler-overlay");
  const focusControls = document.getElementById("focus-mode-controls");

  if (!display) return;

  // font family option
  if (readerSettings.fontFamily === "dyslexic") {
    display.style.fontFamily = "var(--font-dyslexic)";
  } else if (readerSettings.fontFamily === "serif") {
    display.style.fontFamily = "Georgia, Cambria, 'Times New Roman', serif";
  } else if (readerSettings.fontFamily === "mono") {
    display.style.fontFamily = "'Courier New', Courier, monospace";
  } else {
    display.style.fontFamily = "var(--font-body)";
  }

  // typography metrics values
  display.style.fontSize = `${readerSettings.fontSize}px`;
  display.style.letterSpacing = `${readerSettings.letterSpacing}px`;
  display.style.wordSpacing = `${readerSettings.wordSpacing}px`;
  display.style.lineHeight = `${readerSettings.lineHeight}`;

  // 6 student tints
  const themes = {
    cream: { bg: "#FAF3E0", text: "#23304A", border: "#E4DDCF" },
    blue: { bg: "#E3F2FD", text: "#23304A", border: "#CFE2F3" },
    green: { bg: "#E6F4EA", text: "#23304A", border: "#CDE5D3" },
    peach: { bg: "#FDEBE3", text: "#23304A", border: "#F5D7C8" },
    yellow: { bg: "#FFF8C6", text: "#23304A", border: "#F0E7A6" },
    grey: { bg: "#F1F1F1", text: "#23304A", border: "#E0E0E0" }
  };

  const currentTheme = themes[readerSettings.theme] || themes.cream;
  display.style.backgroundColor = currentTheme.bg;
  display.style.color = currentTheme.text;
  display.style.borderColor = currentTheme.border;

  // reading ruler visibility
  if (ruler) {
    ruler.style.display = readerSettings.readingRuler ? "block" : "none";
  }

  // focus mode bar
  if (focusControls) {
    focusControls.style.display = readerSettings.focusMode ? "flex" : "none";
  }

  renderReaderContent();
  if (readerSettings.readingRuler && readerSettings.focusMode) {
    positionRulerOnFocusSentence();
  }
}

// set reader text
function setReaderText(text) {
  currentText = text.trim();
  // split text sentences
  sentenceList = currentText
    .split(/(?<=[.?!])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 0);

  currentSentenceIndex = 0;
  renderReaderContent();
}

// render text content
function renderReaderContent() {
  const display = document.getElementById("reader-display-box");
  if (!display) return;

  // check focus mode
  if (readerSettings.focusMode && sentenceList.length > 0) {
    const activeSentence = sentenceList[currentSentenceIndex] || sentenceList[0];
    const sentenceProgress = `${currentSentenceIndex + 1} / ${sentenceList.length}`;

    const progressEl = document.getElementById("focus-sentence-indicator");
    if (progressEl) progressEl.textContent = sentenceProgress;

    const words = activeSentence.split(" ");
    display.innerHTML = `
      <div class="focus-sentence-wrap">
        ${words.map((w, i) => `<span class="reader-word" id="r-word-${i}">${w}</span>`).join(" ")}
      </div>
    `;
  } else {
    // full text display
    const words = currentText.split(/\s+/);
    display.innerHTML = words.map((w, i) => `<span class="reader-word" id="r-word-${i}">${w}</span>`).join(" ");
  }

  wordsSpans = display.querySelectorAll(".reader-word");

  if (readerSettings.readingRuler && readerSettings.focusMode) {
    positionRulerOnFocusSentence();
  }
}

// setup controls listeners
function setupReaderControls() {
  const fontSelect = document.getElementById("select-font");
  const sizeSlider = document.getElementById("slider-font-size");
  const letterSlider = document.getElementById("slider-letter-spacing");
  const wordSlider = document.getElementById("slider-word-spacing");
  const lineSlider = document.getElementById("slider-line-height");
  const speechSlider = document.getElementById("slider-speech-rate");
  const rulerToggle = document.getElementById("toggle-ruler");
  const focusToggle = document.getElementById("toggle-focus-mode");

  if (fontSelect) {
    fontSelect.addEventListener("change", (e) => {
      readerSettings.fontFamily = e.target.value;
      applyReaderSettings();
      saveReaderSettings(activeStudentId, readerSettings);
    });
  }

  if (sizeSlider) {
    sizeSlider.addEventListener("input", (e) => {
      readerSettings.fontSize = parseInt(e.target.value);
      updateControlLabels();
      applyReaderSettings();
      saveReaderSettings(activeStudentId, readerSettings);
    });
  }

  if (letterSlider) {
    letterSlider.addEventListener("input", (e) => {
      readerSettings.letterSpacing = parseInt(e.target.value);
      updateControlLabels();
      applyReaderSettings();
      saveReaderSettings(activeStudentId, readerSettings);
    });
  }

  if (wordSlider) {
    wordSlider.addEventListener("input", (e) => {
      readerSettings.wordSpacing = parseInt(e.target.value);
      updateControlLabels();
      applyReaderSettings();
      saveReaderSettings(activeStudentId, readerSettings);
    });
  }

  if (lineSlider) {
    lineSlider.addEventListener("input", (e) => {
      readerSettings.lineHeight = parseFloat(e.target.value);
      updateControlLabels();
      applyReaderSettings();
      saveReaderSettings(activeStudentId, readerSettings);
    });
  }

  if (speechSlider) {
    speechSlider.addEventListener("input", (e) => {
      readerSettings.speechRate = parseFloat(e.target.value);
      updateControlLabels();
      saveReaderSettings(activeStudentId, readerSettings);
      if (isSpeaking) {
        stopSpeech();
        playSpeech();
      }
    });
  }

  if (rulerToggle) {
    rulerToggle.addEventListener("change", (e) => {
      readerSettings.readingRuler = e.target.checked;
      applyReaderSettings();
      saveReaderSettings(activeStudentId, readerSettings);
    });
  }

  if (focusToggle) {
    focusToggle.addEventListener("change", (e) => {
      readerSettings.focusMode = e.target.checked;
      applyReaderSettings();
      saveReaderSettings(activeStudentId, readerSettings);
    });
  }

  // theme presets buttons
  const themeBtns = document.querySelectorAll(".theme-preset-btn");
  themeBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const theme = btn.getAttribute("data-theme");
      readerSettings.theme = theme;
      highlightActiveTheme(theme);
      applyReaderSettings();
      saveReaderSettings(activeStudentId, readerSettings);
    });
  });

  // focus sentence buttons
  const prevBtn = document.getElementById("btn-focus-prev");
  const nextBtn = document.getElementById("btn-focus-next");

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      if (currentSentenceIndex > 0) {
        stopSpeech();
        currentSentenceIndex--;
        renderReaderContent();
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      if (currentSentenceIndex < sentenceList.length - 1) {
        stopSpeech();
        currentSentenceIndex++;
        renderReaderContent();
      }
    });
  }

  // sample text button
  const sampleBtn = document.getElementById("btn-load-sample");
  if (sampleBtn) {
    sampleBtn.addEventListener("click", () => {
      currentSampleIndex = (currentSampleIndex + 1) % SAMPLE_TEXTS.length;
      const nextStory = SAMPLE_TEXTS[currentSampleIndex];
      const textarea = document.getElementById("reader-input-textarea");
      if (textarea) {
        textarea.value = nextStory;
        textarea.focus();
      }
      showToast("Story loaded in editor. Click Apply Text to read.", "info");
    });
  }

  // apply text button
  const rawInput = document.getElementById("reader-input-textarea");
  const applyTextBtn = document.getElementById("btn-apply-text");
  if (applyTextBtn && rawInput) {
    applyTextBtn.addEventListener("click", () => {
      if (rawInput.value.trim().length > 0) {
        stopSpeech();
        setReaderText(rawInput.value);
        showToast("Text applied to reader", "success");
      } else {
        showToast("Please enter some text", "warning");
      }
    });
  }

  // auto adjust button
  const autoAdjustBtn = document.getElementById("btn-auto-adjust");
  if (autoAdjustBtn) {
    autoAdjustBtn.addEventListener("click", autoAdjustSettings);
  }
}

// load sample passage
function loadSampleText(index) {
  const text = SAMPLE_TEXTS[index] || SAMPLE_TEXTS[0];
  const input = document.getElementById("reader-input-textarea");
  if (input) input.value = text;
}

// auto adjust settings
function autoAdjustSettings() {
  const latest = getLatestResult(activeStudentId);

  if (!latest) {
    showToast("No test results found", "info");
    readerSettings.fontSize = 22;
    readerSettings.letterSpacing = 3;
    readerSettings.wordSpacing = 5;
    readerSettings.lineHeight = 2.0;
    readerSettings.theme = "cream";
    readerSettings.readingRuler = true;
    syncControlsWithSettings();
    applyReaderSettings();
    saveReaderSettings(activeStudentId, readerSettings);
    return;
  }

  let adjustments = [];

  // low reading score
  if (latest.readingScore < 70) {
    readerSettings.fontSize = 24;
    readerSettings.letterSpacing = 3;
    readerSettings.wordSpacing = 6;
    readerSettings.lineHeight = 2.1;
    readerSettings.readingRuler = true;
    readerSettings.theme = "cream";
    adjustments.push("increased letter spacing & reading ruler");
  }

  // low letter flip
  if (latest.letterFlipScore < 70) {
    readerSettings.fontFamily = "dyslexic";
    readerSettings.letterSpacing = Math.max(readerSettings.letterSpacing, 3);
    adjustments.push("dyslexia-friendly weighted font");
  }

  // low focus score
  if (latest.focusScore < 65) {
    readerSettings.focusMode = true;
    readerSettings.theme = "blue";
    adjustments.push("sentence-by-sentence focus mode & calming blue tint");
  }

  syncControlsWithSettings();
  applyReaderSettings();
  saveReaderSettings(activeStudentId, readerSettings);

  showToast(`Auto-adjusted: ${adjustments.join(", ")}`, "success");
}

// setup reading ruler
function setupReadingRuler() {
  const container = document.querySelector(".display-box-container");
  const display = document.getElementById("reader-display-box");
  const ruler = document.getElementById("reading-ruler-overlay");

  if (!display || !ruler) return;

    const updateRulerPosition = (clientY) => {
      if (!readerSettings.readingRuler) return;
      const rect = display.getBoundingClientRect();
      const relativeY = clientY - rect.top;

      // position reading ruler
      const rulerHeight = Math.max(34, Math.round(readerSettings.fontSize * (readerSettings.lineHeight || 1.8)));
      const topPos = Math.max(0, Math.min(rect.height - rulerHeight, relativeY - rulerHeight / 2));
      ruler.style.top = `${topPos}px`;
      ruler.style.height = `${rulerHeight}px`;
    };

    display.addEventListener("mousemove", (e) => {
      updateRulerPosition(e.clientY);
    });

    if (container) {
      container.addEventListener("mousemove", (e) => {
        updateRulerPosition(e.clientY);
      });
    }

    display.addEventListener("touchmove", (e) => {
      if (e.touches && e.touches[0]) {
        updateRulerPosition(e.touches[0].clientY);
      }
    }, { passive: true });
  }

// position reading ruler over focus sentence
function positionRulerOnFocusSentence() {
      const ruler = document.getElementById("reading-ruler-overlay");
      const display = document.getElementById("reader-display-box");

      if (!ruler || !display || !readerSettings.readingRuler) return;

      const rulerHeight = Math.max(34, Math.round(readerSettings.fontSize * (readerSettings.lineHeight || 1.8)));
      ruler.style.height = `${rulerHeight}px`;

      requestAnimationFrame(() => {
        const wrap = display.querySelector(".focus-sentence-wrap");
        if (wrap) {
          const wrapRect = wrap.getBoundingClientRect();
          const displayRect = display.getBoundingClientRect();
          if (displayRect.height > 0) {
            const relativeCenter = (wrapRect.top + wrapRect.height / 2) - displayRect.top;
            const topPos = Math.max(0, Math.min(displayRect.height - rulerHeight, relativeCenter - rulerHeight / 2));
            ruler.style.top = `${topPos}px`;
            return;
          }
        }
        const fallbackTop = Math.max(0, (display.clientHeight - rulerHeight) / 2);
        ruler.style.top = `${fallbackTop}px`;
      });
    }

// setup speech synthesis
function setupTTS() {
      const playBtn = document.getElementById("btn-tts-play");
      const pauseBtn = document.getElementById("btn-tts-pause");
      const stopBtn = document.getElementById("btn-tts-stop");

      if (playBtn) playBtn.addEventListener("click", playSpeech);
      if (pauseBtn) pauseBtn.addEventListener("click", pauseSpeech);
      if (stopBtn) stopBtn.addEventListener("click", stopSpeech);

      updateTTSButtons();
    }

// play speech synthesis
function playSpeech() {
      if (!("speechSynthesis" in window)) {
        showToast("Speech not supported in this browser", "warning");
        return;
      }

      // If paused, clicking Read Aloud acts as Resume
      if (isPaused) {
        window.speechSynthesis.resume();
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
        isPaused = false;
        isSpeaking = true;
        updateTTSButtons();
        showToast("Audio resumed", "info");
        return;
      }

      // Stop any active speech before starting fresh
      window.speechSynthesis.cancel();
      clearWordHighlights();

      // text to read
      let textToRead = currentText;
      if (readerSettings.focusMode && sentenceList.length > 0) {
        textToRead = sentenceList[currentSentenceIndex] || currentText;
      }

      if (!textToRead || textToRead.trim().length === 0) {
        showToast("No text to read", "warning");
        return;
      }

      speechUtterance = new SpeechSynthesisUtterance(textToRead);
      speechUtterance.rate = readerSettings.speechRate || 1.0;
      speechUtterance.pitch = 1.0;

      // word boundary tracking
      speechUtterance.onboundary = (event) => {
        if (event.name === "word") {
          highlightSpokenWord(event.charIndex, event.charLength);
        }
      };

      speechUtterance.onend = () => {
        isSpeaking = false;
        isPaused = false;
        clearWordHighlights();
        updateTTSButtons();

        // advance in focus mode
        if (readerSettings.focusMode && currentSentenceIndex < sentenceList.length - 1) {
          currentSentenceIndex++;
          renderReaderContent();
          setTimeout(playSpeech, 400);
        }
      };

        speechUtterance.onerror = (e) => {
          if (e && e.error !== "canceled" && e.error !== "interrupted") {
            console.warn("Speech synthesis error:", e);
          }
          isSpeaking = false;
          isPaused = false;
          clearWordHighlights();
          updateTTSButtons();
        };

        window.speechSynthesis.speak(speechUtterance);
        isSpeaking = true;
        isPaused = false;
        updateTTSButtons();
      }

      // pause or resume speech synthesis
      function pauseSpeech() {
          if (!("speechSynthesis" in window)) {
            showToast("Speech not supported", "warning");
            return;
          }

          if (!isSpeaking) {
            return;
          }

          if (isPaused) {
            // Resume playback
            window.speechSynthesis.resume();
            if (window.speechSynthesis.paused) {
              window.speechSynthesis.resume();
            }
            isPaused = false;
            isSpeaking = true;
            updateTTSButtons();
            showToast("Audio resumed", "info");
          } else {
            // Pause playback
            window.speechSynthesis.pause();
            isPaused = true;
            updateTTSButtons();
            showToast("Audio paused", "info");
          }
        }

        // stop speech synthesis
        function stopSpeech() {
          if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
          }
          isSpeaking = false;
          isPaused = false;
          clearWordHighlights();
          updateTTSButtons();
        }

        // highlight active word
        function highlightSpokenWord(charIndex, charLength) {
          clearWordHighlights();

          const sourceText = (readerSettings.focusMode && sentenceList.length > 0)
            ? (sentenceList[currentSentenceIndex] || currentText)
            : currentText;

          const textBefore = sourceText.substring(0, charIndex);
          const wordIndex = textBefore.trim().split(/\s+/).filter(Boolean).length;

          const targetSpan = document.getElementById(`r-word-${wordIndex}`);
          if (targetSpan) {
            targetSpan.classList.add("spoken-highlight");
          }
        }

        // clear word highlights
        function clearWordHighlights() {
          const highlights = document.querySelectorAll(".spoken-highlight");
          highlights.forEach(el => el.classList.remove("spoken-highlight"));
        }

        // update audio buttons
        function updateTTSButtons() {
          const playBtn = document.getElementById("btn-tts-play");
          const pauseBtn = document.getElementById("btn-tts-pause");
          const stopBtn = document.getElementById("btn-tts-stop");

          if (playBtn) {
            playBtn.textContent = isSpeaking && !isPaused ? "Reading Aloud..." : "Read Aloud";
          }
          if (pauseBtn) {
            if (isPaused) {
              pauseBtn.textContent = "Resume";
              pauseBtn.disabled = false;
            } else {
              pauseBtn.textContent = "Pause";
              pauseBtn.disabled = !isSpeaking;
            }
          }
          if (stopBtn) {
            stopBtn.disabled = !isSpeaking && !isPaused;
          }
        }
