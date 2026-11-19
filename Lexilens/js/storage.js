// storage helper functions

// default demo teacher
const DEMO_TEACHER = {
  id: "t_1",
  name: "Prof. Sarah Jenkins",
  email: "teacher@demo.com",
  password: "teacher123",
  role: "teacher"
};

// default demo students
const DEMO_STUDENTS = [
  {
    id: "s_1",
    name: "Aarav Sharma",
    email: "student@demo.com",
    alternateEmail: "aarav@demo.com",
    password: "student123",
    role: "student",
    studentClass: "Grade 6",
    rollNo: "101"
  },
  {
    id: "s_2",
    name: "Ananya Patel",
    email: "ananya@demo.com",
    password: "1234",
    role: "student",
    studentClass: "Grade 6",
    rollNo: "102"
  },
  {
    id: "s_3",
    name: "Rohan Verma",
    email: "rohan@demo.com",
    password: "1234",
    role: "student",
    studentClass: "Grade 7",
    rollNo: "103"
  },
  {
    id: "s_4",
    name: "Meera Iyer",
    email: "meera@demo.com",
    password: "1234",
    role: "student",
    studentClass: "Grade 7",
    rollNo: "104"
  },
  {
    id: "s_5",
    name: "Kabir Sen",
    email: "kabir@demo.com",
    password: "1234",
    role: "student",
    studentClass: "Grade 6",
    rollNo: "105"
  }
];

// demo screening results
const DEMO_RESULTS = {
  "s_1": [
    {
      id: "res_1_1",
      date: "2026-10-10",
      readingScore: 50,
      letterFlipScore: 38,
      focusScore: 72,
      typingScore: 55,
      overallScore: 54,
      level: "Needs Support",
      remark: "Difficulty with letter reversals b/d and reading fluency. Needs visual pacing."
    },
    {
      id: "res_1_2",
      date: "2026-10-24",
      readingScore: 58,
      letterFlipScore: 45,
      focusScore: 76,
      typingScore: 62,
      overallScore: 60,
      level: "Needs Support",
      remark: "Good progress with reading speed. Still working on letter-flip accuracy."
    }
  ],
  "s_2": [
    {
      id: "res_2_1",
      date: "2026-10-12",
      readingScore: 82,
      letterFlipScore: 85,
      focusScore: 42,
      typingScore: 74,
      overallScore: 71,
      level: "Needs Attention",
      remark: "Strong reading comprehension. Attention drifts after sustained tasks."
    },
    {
      id: "res_2_2",
      date: "2026-10-26",
      readingScore: 85,
      letterFlipScore: 88,
      focusScore: 50,
      typingScore: 78,
      overallScore: 75,
      level: "Needs Attention",
      remark: "Focus improving with break intervals. Letter recognition is high."
    }
  ],
  "s_3": [
    {
      id: "res_3_1",
      date: "2026-10-20",
      readingScore: 90,
      letterFlipScore: 94,
      focusScore: 88,
      typingScore: 86,
      overallScore: 90,
      level: "On Track",
      remark: "Excellent visual tracking and steady reading pace. Highly confident."
    }
  ],
  "s_4": [
    {
      id: "res_4_1",
      date: "2026-10-15",
      readingScore: 68,
      letterFlipScore: 55,
      focusScore: 82,
      typingScore: 50,
      overallScore: 64,
      level: "Needs Attention",
      remark: "Benefits from increased letter spacing and audio narration assistance."
    }
  ],
  "s_5": [
    {
      id: "res_5_1",
      date: "2026-10-22",
      readingScore: 84,
      letterFlipScore: 82,
      focusScore: 85,
      typingScore: 88,
      overallScore: 85,
      level: "On Track",
      remark: "Balanced performance across all screening metrics."
    }
  ]
};

// demo teacher remarks
const DEMO_REMARKS = {
  "s_1": [
    {
      id: "rem_1",
      teacherName: "Prof. Sarah Jenkins",
      date: "2026-10-11",
      text: "Seat in the first row. Provide worksheets with OpenDyslexic or weighted fonts."
    },
    {
      id: "rem_2",
      teacherName: "Prof. Sarah Jenkins",
      date: "2026-10-25",
      text: "Showed noticeable excitement using the Reading Ruler in the adaptive reader."
    }
  ],
  "s_2": [
    {
      id: "rem_3",
      teacherName: "Prof. Sarah Jenkins",
      date: "2026-10-14",
      text: "Break 40-minute reading sessions into two 20-minute chunks with quick stretch breaks."
    }
  ]
};

// read data storage
function getData(key, defaultValue) {
  const item = localStorage.getItem(key);
  if (!item) {
    return defaultValue;
  }
  try {
    return JSON.parse(item);
  } catch (e) {
    return defaultValue;
  }
}

// save data storage
function setData(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// initialize demo data
function initDemoData(forceReset) {
  const initialized = localStorage.getItem("lexilens_initialized");
  if (!initialized || forceReset) {
    const allUsers = [DEMO_TEACHER, ...DEMO_STUDENTS];
    setData("lexilens_users", allUsers);
    setData("lexilens_results", DEMO_RESULTS);
    setData("lexilens_remarks", DEMO_REMARKS);

    // default reader preferences
    setData("lexilens_reader_settings", {
      fontFamily: "dyslexic",
      fontSize: 20,
      letterSpacing: 2,
      wordSpacing: 4,
      lineHeight: 1.8,
      theme: "cream",
      readingRuler: true,
      speechRate: 1.0,
      focusMode: false
    });

    localStorage.setItem("lexilens_initialized", "true");
  } else {
    // Ensure demo accounts (teacher@demo.com & student@demo.com) exist even if initialized previously
    let existingUsers = getData("lexilens_users", []);
    let modified = false;

    // Check teacher demo account
    const teacherIdx = existingUsers.findIndex(u => u.role === "teacher" || (u.email && u.email.toLowerCase() === "teacher@demo.com"));
    if (teacherIdx >= 0) {
      if (existingUsers[teacherIdx].password !== "teacher123" && existingUsers[teacherIdx].password !== "1234") {
        existingUsers[teacherIdx].password = "teacher123";
        modified = true;
      }
    } else {
      existingUsers.unshift(DEMO_TEACHER);
      modified = true;
    }

    // Check student demo account (student@demo.com)
    const studentIdx = existingUsers.findIndex(u => u.email && u.email.toLowerCase() === "student@demo.com");
    if (studentIdx < 0) {
      const s1Idx = existingUsers.findIndex(u => u.id === "s_1" || (u.email && u.email.toLowerCase() === "aarav@demo.com"));
      if (s1Idx >= 0) {
        existingUsers[s1Idx].email = "student@demo.com";
        existingUsers[s1Idx].alternateEmail = "aarav@demo.com";
        existingUsers[s1Idx].password = "student123";
      } else {
        existingUsers.push(DEMO_STUDENTS[0]);
      }
      modified = true;
    }

    if (modified) {
      setData("lexilens_users", existingUsers);
    }
  }
}

// get all users
function getAllUsers() {
  const users = getData("lexilens_users", []);
  if (!users || users.length === 0) {
    const defaultUsers = [DEMO_TEACHER, ...DEMO_STUDENTS];
    setData("lexilens_users", defaultUsers);
    return defaultUsers;
  }
  return users;
}

// get all students
function getAllStudents() {
  const users = getAllUsers();
  return users.filter(user => user.role === "student");
}

// get single student
function getStudentById(id) {
  const students = getAllStudents();
  return students.find(student => student.id === id) || null;
}

// get logged user
function getCurrentUser() {
  return getData("lexilens_current_user", null);
}

// set logged user
function setCurrentUser(user) {
  setData("lexilens_current_user", user);
}

// remove logged user
function clearCurrentUser() {
  localStorage.removeItem("lexilens_current_user");
}

// get student results
function getStudentResults(studentId) {
  const allResults = getData("lexilens_results", {});
  return allResults[studentId] || [];
}

// get latest result
function getLatestResult(studentId) {
  const results = getStudentResults(studentId);
  if (results.length === 0) {
    return null;
  }
  return results[results.length - 1];
}

// save new result
function saveTestResult(studentId, testData) {
  const allResults = getData("lexilens_results", {});
  if (!allResults[studentId]) {
    allResults[studentId] = [];
  }

  const newId = "res_" + Date.now();
  const today = new Date().toISOString().split("T")[0];

  const newEntry = {
    id: newId,
    date: today,
    letterFlipScore: testData.letterFlipScore !== undefined ? testData.letterFlipScore : 70,
    focusScore: testData.focusScore !== undefined ? testData.focusScore : 70,
    typingScore: testData.typingScore !== undefined ? testData.typingScore : 70,
    overallScore: testData.overallScore !== undefined ? testData.overallScore : 70,
    level: testData.level || "On Track",
    remark: testData.remark || "Screening completed successfully."
  };
  if (testData.readingScore !== undefined) {
    newEntry.readingScore = testData.readingScore;
  }

  allResults[studentId].push(newEntry);
  setData("lexilens_results", allResults);
  return newEntry;
}

// get student remarks
function getStudentRemarks(studentId) {
  const allRemarks = getData("lexilens_remarks", {});
  return allRemarks[studentId] || [];
}

// add teacher remark
function addTeacherRemark(studentId, teacherName, text) {
  const allRemarks = getData("lexilens_remarks", {});
  if (!allRemarks[studentId]) {
    allRemarks[studentId] = [];
  }

  const newRemark = {
    id: "rem_" + Date.now(),
    teacherName: teacherName || "Teacher",
    date: new Date().toISOString().split("T")[0],
    text: text
  };

  allRemarks[studentId].unshift(newRemark);
  setData("lexilens_remarks", allRemarks);
  return newRemark;
}

// delete teacher remark
function deleteTeacherRemark(studentId, remarkId) {
  const allRemarks = getData("lexilens_remarks", {});
  if (!allRemarks[studentId]) {
    return;
  }
  allRemarks[studentId] = allRemarks[studentId].filter(rem => rem.id !== remarkId);
  setData("lexilens_remarks", allRemarks);
}

// get reader settings
function getReaderSettings(studentId) {
  const allSettings = getData("lexilens_reader_settings_map", {});
  if (studentId && allSettings[studentId]) {
    return allSettings[studentId];
  }
  return getData("lexilens_reader_settings", {
    fontFamily: "dyslexic",
    fontSize: 20,
    letterSpacing: 2,
    wordSpacing: 4,
    lineHeight: 1.8,
    theme: "cream",
    readingRuler: true,
    speechRate: 1.0,
    focusMode: false
  });
}

// save reader settings
function saveReaderSettings(studentId, settings) {
  const allSettings = getData("lexilens_reader_settings_map", {});
  if (studentId) {
    allSettings[studentId] = settings;
    setData("lexilens_reader_settings_map", allSettings);
  }
  setData("lexilens_reader_settings", settings);
}

// show toast message
function showToast(message, type) {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.className = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `toast toast-${type || "info"} toast-enter`;

  let icon = "•";
  if (type === "success") icon = "✓";
  if (type === "error") icon = "✕";
  if (type === "warning") icon = "▲";

  toast.innerHTML = `
    <span class="toast-icon">${icon}</span>
    <span class="toast-message">${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.remove("toast-enter");
    toast.classList.add("toast-exit");
    setTimeout(() => {
      toast.remove();
    }, 250);
  }, 3000);
}

// initialize on load
initDemoData(false);
