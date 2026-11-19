// teacher dashboard logic

// dashboard state variables
let allStudentsList = [];
let activeFilterRisk = "all";
let activeFilterClass = "all";
let activeSearchQuery = "";
let activeSortBy = "name-asc";
let selectedStudentForModal = null;

// initialize teacher dashboard
function initDashboard() {
  loadDashboardData();
  setupDashboardControls();
  renderOverviewCards();
  renderBarChart();
  renderDonutChart();
  renderStudentsTable();
}

// load students list
function loadDashboardData() {
  allStudentsList = getAllStudents();
}

// setup controls listeners
function setupDashboardControls() {
  const searchInput = document.getElementById("search-student-input");
  const filterRisk = document.getElementById("filter-risk-select");
  const filterClass = document.getElementById("filter-class-select");
  const sortSelect = document.getElementById("sort-student-select");

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      activeSearchQuery = e.target.value.toLowerCase().trim();
      renderStudentsTable();
    });
  }

  if (filterRisk) {
    filterRisk.addEventListener("change", (e) => {
      activeFilterRisk = e.target.value;
      renderStudentsTable();
    });
  }

  if (filterClass) {
    filterClass.addEventListener("change", (e) => {
      activeFilterClass = e.target.value;
      renderStudentsTable();
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener("change", (e) => {
      activeSortBy = e.target.value;
      renderStudentsTable();
    });
  }

  // remark form submit
  const addRemarkBtn = document.getElementById("btn-add-remark");
  if (addRemarkBtn) {
    addRemarkBtn.addEventListener("click", handleAddRemark);
  }
}

// render overview cards
function renderOverviewCards() {
  const totalCount = allStudentsList.length;
  let totalTests = 0;
  let needsHelpCount = 0;
  let scoreSum = 0;
  let studentsWithScores = 0;

  allStudentsList.forEach(student => {
    const results = getStudentResults(student.id);
    totalTests += results.length;
    const latest = getLatestResult(student.id);
    if (latest) {
      studentsWithScores++;
      scoreSum += latest.overallScore;
      if (latest.overallScore < 75) {
        needsHelpCount++;
      }
    }
  });

  const avgScore = studentsWithScores > 0 ? Math.round(scoreSum / studentsWithScores) : 0;

  animateCounter("stat-total-students", totalCount);
  animateCounter("stat-total-tests", totalTests);
  animateCounter("stat-needs-attention", needsHelpCount);
  animateCounter("stat-avg-score", avgScore);
}

// animated counter helper
function animateCounter(elementId, targetValue) {
  const el = document.getElementById(elementId);
  if (!el) return;

  let current = 0;
  const step = Math.max(1, Math.ceil(targetValue / 15));
  const timer = setInterval(() => {
    current += step;
    if (current >= targetValue) {
      el.textContent = targetValue + (elementId === "stat-avg-score" ? "%" : "");
      clearInterval(timer);
    } else {
      el.textContent = current + (elementId === "stat-avg-score" ? "%" : "");
    }
  }, 20);
}

// render activity barchart
function renderBarChart() {
  const canvas = document.getElementById("canvas-bar-chart");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  const width = canvas.parentElement.clientWidth;
  const height = canvas.parentElement.clientHeight || 230;

  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.scale(dpr, dpr);

  let totals = { letterFlip: 0, focus: 0, typing: 0 };
  let count = 0;

  allStudentsList.forEach(s => {
    const latest = getLatestResult(s.id);
    if (latest) {
      totals.letterFlip += latest.letterFlipScore || 0;
      totals.focus += latest.focusScore || 0;
      totals.typing += latest.typingScore || 0;
      count++;
    }
  });

  const categories = [
    { label: "Letter-Flip", val: count ? Math.round(totals.letterFlip / count) : 65, color: "#E8A15D" },
    { label: "Focus", val: count ? Math.round(totals.focus / count) : 72, color: "#4E9A6B" },
    { label: "Typing", val: count ? Math.round(totals.typing / count) : 68, color: "#2F6270" }
  ];

  ctx.clearRect(0, 0, width, height);

  const topPad = 25;
  const bottomPad = 35;
  const leftPad = 40;
  const rightPad = 20;
  const chartHeight = height - topPad - bottomPad;
  const chartWidth = width - leftPad - rightPad;

  // grid horizontal lines
  ctx.strokeStyle = "#E4DDCF";
  ctx.lineWidth = 1;
  ctx.fillStyle = "#5B6578";
  ctx.font = "12px 'Lexend', sans-serif";

  for (let i = 0; i <= 4; i++) {
    const yVal = i * 25;
    const yPos = topPad + chartHeight - (i / 4) * chartHeight;
    ctx.beginPath();
    ctx.moveTo(leftPad, yPos);
    ctx.lineTo(leftPad + chartWidth, yPos);
    ctx.stroke();
    ctx.fillText(`${yVal}`, leftPad - 28, yPos + 4);
  }

  // draw activity bars
  const barWidth = Math.min(48, chartWidth / (categories.length * 1.8));
  const spacing = chartWidth / categories.length;

  categories.forEach((cat, idx) => {
    const xPos = leftPad + idx * spacing + (spacing - barWidth) / 2;
    const barHeight = (cat.val / 100) * chartHeight;
    const yPos = topPad + chartHeight - barHeight;

    ctx.fillStyle = cat.color;
    ctx.beginPath();
    ctx.roundRect(xPos, yPos, barWidth, barHeight, [6, 6, 0, 0]);
    ctx.fill();

    // label under bar
    ctx.fillStyle = "#23304A";
    ctx.font = "500 12px 'Lexend', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(cat.label, xPos + barWidth / 2, height - 12);

    // score over bar
    ctx.fillStyle = "#23304A";
    ctx.font = "600 12px 'Lexend', sans-serif";
    ctx.fillText(`${cat.val}%`, xPos + barWidth / 2, yPos - 6);
  });
}

// render risk donutchart
function renderDonutChart() {
  const canvas = document.getElementById("canvas-donut-chart");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  const width = canvas.parentElement.clientWidth;
  const height = canvas.parentElement.clientHeight || 230;

  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.scale(dpr, dpr);

  let onTrack = 0;
  let attention = 0;
  let support = 0;

  allStudentsList.forEach(s => {
    const latest = getLatestResult(s.id);
    if (latest) {
      if (latest.overallScore >= 75) onTrack++;
      else if (latest.overallScore >= 50) attention++;
      else support++;
    } else {
      onTrack++;
    }
  });

  const total = Math.max(1, onTrack + attention + support);
  const segments = [
    { label: "On Track", count: onTrack, color: "#4E9A6B" },
    { label: "Needs Attention", count: attention, color: "#D99A2B" },
    { label: "Needs Support", count: support, color: "#C65D5D" }
  ];

  ctx.clearRect(0, 0, width, height);

  const centerX = width * 0.35;
  const centerY = height / 2;
  const outerRadius = Math.min(centerX, centerY) - 15;
  const innerRadius = outerRadius * 0.62;

  let startAngle = -Math.PI / 2;

  segments.forEach(seg => {
    const sliceAngle = (seg.count / total) * (2 * Math.PI);
    const endAngle = startAngle + sliceAngle;

    ctx.beginPath();
    ctx.arc(centerX, centerY, outerRadius, startAngle, endAngle);
    ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
    ctx.closePath();
    ctx.fillStyle = seg.color;
    ctx.fill();

    startAngle = endAngle;
  });

  // center total text
  ctx.fillStyle = "#23304A";
  ctx.font = "bold 20px 'Lexend', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(`${total}`, centerX, centerY + 2);

  ctx.fillStyle = "#5B6578";
  ctx.font = "11px 'Lexend', sans-serif";
  ctx.fillText("Students", centerX, centerY + 18);

  // chart side legend
  const legendX = width * 0.65;
  let legendY = height / 2 - 32;

  segments.forEach(seg => {
    ctx.fillStyle = seg.color;
    ctx.beginPath();
    ctx.roundRect(legendX, legendY, 12, 12, [3, 3, 3, 3]);
    ctx.fill();

    ctx.fillStyle = "#23304A";
    ctx.font = "500 12px 'Lexend', sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(`${seg.label} (${seg.count})`, legendX + 20, legendY + 10);

    legendY += 26;
  });
}

// render students table
function renderStudentsTable() {
  const tbody = document.getElementById("students-table-body");
  const emptyState = document.getElementById("table-empty-state");
  if (!tbody) return;

  let filtered = allStudentsList.filter(student => {
    const latest = getLatestResult(student.id);

    // search name roll
    if (activeSearchQuery) {
      const matchName = student.name.toLowerCase().includes(activeSearchQuery);
      const matchEmail = student.email.toLowerCase().includes(activeSearchQuery);
      const matchRoll = (student.rollNo || "").toLowerCase().includes(activeSearchQuery);
      if (!matchName && !matchEmail && !matchRoll) return false;
    }

    // class filter check
    if (activeFilterClass !== "all") {
      if (student.studentClass !== activeFilterClass) return false;
    }

    // support level filter
    if (activeFilterRisk !== "all") {
      if (!latest) return false;
      const score = latest.overallScore;
      if (activeFilterRisk === "on-track" && score < 75) return false;
      if (activeFilterRisk === "attention" && (score < 50 || score >= 75)) return false;
      if (activeFilterRisk === "support" && score >= 50) return false;
    }

    return true;
  });

  // sort filtered list
  filtered.sort((a, b) => {
    const resA = getLatestResult(a.id);
    const resB = getLatestResult(b.id);
    const scoreA = resA ? resA.overallScore : 0;
    const scoreB = resB ? resB.overallScore : 0;

    if (activeSortBy === "name-asc") return a.name.localeCompare(b.name);
    if (activeSortBy === "name-desc") return b.name.localeCompare(a.name);
    if (activeSortBy === "score-high") return scoreB - scoreA;
    if (activeSortBy === "score-low") return scoreA - scoreB;
    return 0;
  });

  tbody.innerHTML = "";

  if (filtered.length === 0) {
    if (emptyState) emptyState.style.display = "block";
    return;
  }
  if (emptyState) emptyState.style.display = "none";

  filtered.forEach(student => {
    const latest = getLatestResult(student.id);
    const tr = document.createElement("tr");

    let levelBadge = '<span class="badge badge-neutral"><span class="badge-icon">○</span> Unscreened</span>';
    let overallScoreText = "—";
    let lastDateText = "Never";
    let letterPill = "—";
    let focusPill = "—";
    let typingPill = "—";

    if (latest) {
      if (latest.overallScore >= 75) {
        levelBadge = '<span class="badge badge-success"><span class="badge-icon">✓</span> On Track</span>';
      } else if (latest.overallScore >= 50) {
        levelBadge = '<span class="badge badge-warning"><span class="badge-icon">▲</span> Needs Attention</span>';
      } else {
        levelBadge = '<span class="badge badge-danger"><span class="badge-icon">●</span> Needs Support</span>';
      }

      overallScoreText = `<strong>${latest.overallScore}</strong> / 100`;
      lastDateText = latest.date;

      letterPill = `<span class="mini-score-pill" title="Letter-Flip">${latest.letterFlipScore}%</span>`;
      focusPill = `<span class="mini-score-pill" title="Focus">${latest.focusScore}%</span>`;
      typingPill = `<span class="mini-score-pill" title="Typing">${latest.typingScore}%</span>`;
    }

    tr.innerHTML = `
      <td>
        <div class="student-cell">
          <div class="student-avatar">${student.name.charAt(0)}</div>
          <div class="student-meta">
            <span class="student-name-link" onclick="openStudentProfile('${student.id}')">${student.name}</span>
            <span class="student-email-sub">${student.email}</span>
          </div>
        </div>
      </td>
      <td>
        <span style="font-weight: 600; color: var(--text);">${student.rollNo || "—"}</span>
        <div style="font-size: 0.78rem; color: var(--text-soft);">${student.studentClass || "Grade 6"}</div>
      </td>
      <td>
        <div class="score-pills">
          ${letterPill} ${focusPill} ${typingPill}
        </div>
      </td>
      <td>${overallScoreText}</td>
      <td>${levelBadge}</td>
      <td><span style="font-size: 0.82rem; color: var(--text-soft);">${lastDateText}</span></td>
      <td>
        <button class="btn btn-sm btn-secondary" onclick="openStudentProfile('${student.id}')">
          <span>Inspect</span>
          <span>→</span>
        </button>
      </td>
    `;

    tbody.appendChild(tr);
  });
}

// open student profile
function openStudentProfile(studentId) {
  const student = getStudentById(studentId);
  if (!student) return;

  selectedStudentForModal = student;
  const modal = document.getElementById("student-profile-modal");
  if (!modal) return;

  // set personal details
  document.getElementById("modal-student-name").textContent = student.name;
  document.getElementById("modal-student-email").textContent = student.email;
  document.getElementById("modal-student-avatar").textContent = student.name.charAt(0);
  document.getElementById("modal-student-roll").textContent = student.rollNo || "101";
  document.getElementById("modal-student-class").textContent = student.studentClass || "Grade 6";

  const latest = getLatestResult(studentId);
  const results = getStudentResults(studentId);

  const scoreEl = document.getElementById("modal-overall-score");
  const badgeEl = document.getElementById("modal-level-badge");

  if (latest) {
    if (scoreEl) scoreEl.textContent = `${latest.overallScore} / 100`;
    if (badgeEl) {
      if (latest.overallScore >= 75) {
        badgeEl.className = "badge badge-success";
        badgeEl.innerHTML = '<span class="badge-icon">✓</span> On Track';
      } else if (latest.overallScore >= 50) {
        badgeEl.className = "badge badge-warning";
        badgeEl.innerHTML = '<span class="badge-icon">▲</span> Needs Attention';
      } else {
        badgeEl.className = "badge badge-danger";
        badgeEl.innerHTML = '<span class="badge-icon">●</span> Needs Support';
      }
    }

    // fill skill bars
    updateSkillBar("skill-bar-reading", latest.readingScore, "val-skill-reading");
    updateSkillBar("skill-bar-letter", latest.letterFlipScore, "val-skill-letter");
    updateSkillBar("skill-bar-focus", latest.focusScore, "val-skill-focus");
    updateSkillBar("skill-bar-typing", latest.typingScore, "val-skill-typing");

    // render recommendations
    renderAccommodations(latest);
  } else {
    if (scoreEl) scoreEl.textContent = "No Tests";
    if (badgeEl) {
      badgeEl.className = "badge badge-neutral";
      badgeEl.innerHTML = '<span class="badge-icon">○</span> Unscreened';
    }
  }

  // render line chart
  renderHistoryLineChart(results);

  // load teacher remarks
  renderRemarksList(studentId);

  modal.classList.add("active");
}

// close student profile
function closeStudentProfile() {
  const modal = document.getElementById("student-profile-modal");
  if (modal) modal.classList.remove("active");
}

// update skill bar
function updateSkillBar(barId, score, valLabelId) {
  const bar = document.getElementById(barId);
  const label = document.getElementById(valLabelId);
  if (!bar) return;

  const safeScore = score || 0;
  bar.style.width = `${safeScore}%`;

  if (safeScore >= 75) bar.style.background = "var(--success)";
  else if (safeScore >= 50) bar.style.background = "var(--warning)";
  else bar.style.background = "var(--danger)";

  if (label) label.textContent = `${safeScore}%`;
}

// render tailored accommodations
function renderAccommodations(latest) {
  const listEl = document.getElementById("accommodations-list");
  if (!listEl) return;

  let items = [];

  if (latest.readingScore < 70) {
    items.push("Provide 25% extended time for reading comprehension tests.");
    items.push("Encourage using the LexiLens Adaptive Reader with warm cream background & high line spacing.");
  }
  if (latest.letterFlipScore < 70) {
    items.push("Supply worksheets formatted with dyslexia-weighted fonts (e.g. OpenDyslexic or Atkinson).");
    items.push("Highlight key instructions with colored underlines rather than pure italics.");
  }
  if (latest.focusScore < 65) {
    items.push("Seat the student in the front center row away from doorways and windows.");
    items.push("Chunk reading assignments into 15-minute intervals with quick stretch breaks.");
  }
  if (latest.typingScore < 65) {
    items.push("Allow oral presentations or speech-to-text input as alternative assignment formats.");
  }

  if (items.length === 0) {
    items.push("Continue regular classroom curriculum; student exhibits well-rounded phonological fluency.");
    items.push("Encourage advanced independent reading and creative writing.");
  }

  listEl.innerHTML = items.map(item => `<li><span>•</span><span>${item}</span></li>`).join("");
}

// render line chart
function renderHistoryLineChart(results) {
  const canvas = document.getElementById("canvas-history-line");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  const width = canvas.parentElement.clientWidth;
  const height = canvas.parentElement.clientHeight || 170;

  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.scale(dpr, dpr);

  ctx.clearRect(0, 0, width, height);

  if (!results || results.length === 0) {
    ctx.fillStyle = "#5B6578";
    ctx.font = "12px 'Lexend', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("No historical test attempts recorded yet", width / 2, height / 2);
    return;
  }

  const topPad = 25;
  const bottomPad = 25;
  const leftPad = 35;
  const rightPad = 25;
  const chartHeight = height - topPad - bottomPad;
  const chartWidth = width - leftPad - rightPad;

  // grid horizontal lines
  ctx.strokeStyle = "#E4DDCF";
  ctx.lineWidth = 1;
  ctx.fillStyle = "#5B6578";
  ctx.font = "11px 'Lexend', sans-serif";
  ctx.textAlign = "right";

  for (let i = 0; i <= 4; i++) {
    const yVal = i * 25;
    const yPos = topPad + chartHeight - (i / 4) * chartHeight;
    ctx.beginPath();
    ctx.moveTo(leftPad, yPos);
    ctx.lineTo(leftPad + chartWidth, yPos);
    ctx.stroke();
    ctx.fillText(`${yVal}`, leftPad - 6, yPos + 3);
  }

  // plot points array
  const points = results.map((res, idx) => {
    const x = results.length === 1
      ? leftPad + chartWidth / 2
      : leftPad + (idx / (results.length - 1)) * chartWidth;
    const y = topPad + chartHeight - (res.overallScore / 100) * chartHeight;
    return { x, y, score: res.overallScore, date: res.date };
  });

  // draw connecting line
  if (points.length > 1) {
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.strokeStyle = "#3E7C8C";
    ctx.lineWidth = 3;
    ctx.stroke();

    // subtle area fill
    ctx.lineTo(points[points.length - 1].x, topPad + chartHeight);
    ctx.lineTo(points[0].x, topPad + chartHeight);
    ctx.closePath();
    ctx.fillStyle = "rgba(62, 124, 140, 0.1)";
    ctx.fill();
  }

  // draw points
  points.forEach(pt => {
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, 5, 0, 2 * Math.PI);
    ctx.fillStyle = "#E8A15D";
    ctx.fill();
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "#23304A";
    ctx.font = "bold 11px 'Lexend', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`${pt.score}`, pt.x, pt.y - 8);

    ctx.fillStyle = "#5B6578";
    ctx.font = "10px 'Lexend', sans-serif";
    ctx.fillText(pt.date.substring(5), pt.x, height - 6);
  });
}

// render remarks list
function renderRemarksList(studentId) {
  const container = document.getElementById("remarks-list-container");
  if (!container) return;

  const remarks = getStudentRemarks(studentId);

  if (remarks.length === 0) {
    container.innerHTML = `
      <p style="font-size: 0.88rem; color: var(--text-soft); font-style: italic; padding: 6px 0;">
        No remarks recorded yet. Add your first observation above!
      </p>
    `;
    return;
  }

  container.innerHTML = remarks.map(rem => `
    <div class="remark-card">
      <div style="flex-grow: 1;">
        <div class="remark-meta">
          <strong>${rem.teacherName}</strong> • <span>${rem.date}</span>
        </div>
        <p class="remark-text">${rem.text}</p>
      </div>
      <button class="btn btn-sm btn-outline" style="color: var(--danger); border-color: transparent; padding: 4px;" onclick="removeRemark('${studentId}', '${rem.id}')" title="Delete remark">
        ✕
      </button>
    </div>
  `).join("");
}

// add remark handler
function handleAddRemark() {
  if (!selectedStudentForModal) return;
  const input = document.getElementById("new-remark-text");
  if (!input || !input.value.trim()) {
    showToast("Please enter remark text", "warning");
    return;
  }

  const currentUser = getCurrentUser();
  const teacherName = currentUser ? currentUser.name : "Teacher";

  addTeacherRemark(selectedStudentForModal.id, teacherName, input.value.trim());
  input.value = "";
  renderRemarksList(selectedStudentForModal.id);
  showToast("Remark added", "success");
}

// delete remark handler
function removeRemark(studentId, remarkId) {
  deleteTeacherRemark(studentId, remarkId);
  renderRemarksList(studentId);
  showToast("Remark deleted", "info");
}
