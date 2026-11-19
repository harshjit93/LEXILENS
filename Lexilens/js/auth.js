// user authentication logic

// register new user
function handleSignup(name, email, password, role, studentClass, rollNo) {
  const cleanName = (name || "").trim();
  const cleanEmail = (email || "").trim().toLowerCase();
  const cleanPass = (password || "").trim();
  const cleanRole = (role || "").trim() || "student";

  if (!cleanName || !cleanEmail || !cleanPass) {
    showToast("Please fill all required fields", "warning");
    return false;
  }

  if (cleanPass.length < 4) {
    showToast("Password must be at least 4 characters", "warning");
    return false;
  }

  const users = getAllUsers();
  const existingUser = users.find(u => u.email && u.email.toLowerCase() === cleanEmail);
  if (existingUser) {
    showToast("An account with this email already exists", "error");
    return false;
  }

  const cleanClass = (studentClass || "").trim() || (cleanRole === "student" ? "Grade 6" : "");
  const cleanRoll = (rollNo || "").trim() || (cleanRole === "student" ? String(Math.floor(100 + Math.random() * 900)) : "");

  const newUser = {
    id: (cleanRole === "teacher" ? "t_" : "s_") + Date.now(),
    name: cleanName,
    email: cleanEmail,
    password: cleanPass,
    role: cleanRole,
    studentClass: cleanClass,
    rollNo: cleanRoll
  };

  users.push(newUser);
  setData("lexilens_users", users);

  setCurrentUser(newUser);
  showToast(`Account created! Welcome, ${newUser.name}!`, "success");

  setTimeout(() => {
    if (newUser.role === "teacher") {
      window.location.href = "teacher.html";
    } else {
      window.location.href = "student.html";
    }
  }, 400);

  return true;
}

// login existing user
function handleLogin(email, password) {
  const cleanEmail = (email || "").trim().toLowerCase();
  const cleanPass = (password || "").trim();

  if (!cleanEmail || !cleanPass) {
    showToast("Please enter email and password", "warning");
    return false;
  }

  const users = getAllUsers();
  
  // Find user by exact email or alternateEmail
  let user = users.find(u => 
    (u.email && u.email.toLowerCase() === cleanEmail) ||
    (u.alternateEmail && u.alternateEmail.toLowerCase() === cleanEmail)
  );

  // Fallbacks for demo accounts if not found by exact email
  if (!user && (cleanEmail === "teacher@demo.com" || cleanEmail === "teacher")) {
    user = users.find(u => u.role === "teacher") || DEMO_TEACHER;
  }
  if (!user && (cleanEmail === "student@demo.com" || cleanEmail === "aarav@demo.com" || cleanEmail === "student")) {
    user = users.find(u => u.id === "s_1" || u.role === "student") || DEMO_STUDENTS[0];
  }

  if (!user) {
    showToast("Invalid email or password", "error");
    return false;
  }

  // Password matching:
  // 1. Exact stored password
  // 2. Teacher demo: accept "teacher123", "1234", or "admin"
  // 3. Student demo: accept "student123" or "1234"
  const isTeacherDemo = user.role === "teacher" && (cleanEmail === "teacher@demo.com" || user.id === "t_1");
  const isStudentDemo = user.role === "student" && (cleanEmail === "student@demo.com" || cleanEmail === "aarav@demo.com" || user.id === "s_1");

  const passwordValid = (user.password === cleanPass) ||
    (isTeacherDemo && (cleanPass === "teacher123" || cleanPass === "1234" || cleanPass === "admin")) ||
    (isStudentDemo && (cleanPass === "student123" || cleanPass === "1234"));

  if (!passwordValid) {
    showToast("Invalid email or password", "error");
    return false;
  }

  setCurrentUser(user);
  showToast(`Welcome back, ${user.name}!`, "success");

  setTimeout(() => {
    if (user.role === "teacher") {
      window.location.href = "teacher.html";
    } else {
      window.location.href = "student.html";
    }
  }, 400);

  return true;
}

// logout current user
function handleLogout() {
  clearCurrentUser();
  showToast("Logged out successfully", "info");
  setTimeout(() => {
    window.location.href = "index.html";
  }, 400);
}

// protect page access
function protectPage(allowedRole) {
  const currentUser = getCurrentUser();

  if (!currentUser) {
    window.location.href = "index.html";
    return null;
  }

  if (allowedRole && currentUser.role !== allowedRole) {
    if (currentUser.role === "teacher") {
      window.location.href = "teacher.html";
    } else {
      window.location.href = "student.html";
    }
    return null;
  }

  return currentUser;
}

// redirect if logged in
function redirectIfLoggedIn() {
  const currentUser = getCurrentUser();
  if (currentUser) {
    if (currentUser.role === "teacher") {
      window.location.href = "teacher.html";
    } else {
      window.location.href = "student.html";
    }
  }
}

// setup password toggle
function setupPasswordToggles() {
  const toggleButtons = document.querySelectorAll(".toggle-password");
  toggleButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-target");
      const input = document.getElementById(targetId);
      if (input) {
        const isPassword = input.type === "password";
        input.type = isPassword ? "text" : "password";
        btn.setAttribute("aria-label", isPassword ? "Hide password" : "Show password");
        btn.innerHTML = isPassword
          ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
              <line x1="1" y1="1" x2="23" y2="23"></line>
            </svg>`
          : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>`;
      }
    });
  });
}
