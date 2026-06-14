import { findAccount, initDataStore, loadAccounts, saveAccount, signInAccount, saveAttendanceRecord, saveNotification, loadNotifications, clearNotifications } from "./firebase-service.js";

const classes = [
      { id: 1, subject: "Applied Mathematics", code: "MAT201", faculty: "Prof. S. Reddy", start: "09:00", end: "10:00", room: "302", floor: "Block A, 3rd Floor", type: "theory" },
      { id: 2, subject: "C Programming", code: "CS101", faculty: "Prof. R. Reddy", start: "10:00", end: "11:00", room: "104", floor: "Block B, 1st Floor", type: "theory" },
      { id: 3, subject: "Engineering Physics", code: "PHY101", faculty: "Dr. V. Mehta", start: "11:00", end: "12:00", room: "205", floor: "Block A, 2nd Floor", type: "theory" },
      { id: 4, subject: "Physics Lab", code: "PHY101L", faculty: "Dr. V. Mehta", start: "12:00", end: "14:00", room: "Lab B2", floor: "Block C, Ground Floor", type: "lab" },
      { id: 5, subject: "C Programming Lab", code: "CS101L", faculty: "Prof. R. Reddy", start: "14:00", end: "16:00", room: "Lab A1", floor: "Block B, Ground Floor", type: "lab" },
      { id: 6, subject: "Engineering Drawing", code: "ME101", faculty: "Prof. K. Rao", start: "15:00", end: "16:00", room: "201", floor: "Block D, 2nd Floor", type: "theory" },
      { id: 7, subject: "Linear Algebra", code: "MAT203", faculty: "Prof. S. Reddy", start: "12:00", end: "13:00", room: "308", floor: "Block A, 3rd Floor", type: "theory" },
      { id: 8, subject: "Math Tutorial", code: "MAT201T", faculty: "Prof. S. Reddy", start: "15:00", end: "16:00", room: "306", floor: "Block A, 3rd Floor", type: "theory" }
    ];

    const students = [
      { name: "Aarav Sharma", roll: "1BM22CS001", att: 88 },
      { name: "Bhavna Patel", roll: "1BM22CS007", att: 74 },
      { name: "Chetan Nair", roll: "1BM22CS012", att: 91 },
      { name: "Divya Rao", roll: "1BM22CS018", att: 62 },
      { name: "Eshan Gupta", roll: "1BM22CS023", att: 55 },
      { name: "Farhan Sheikh", roll: "1BM22CS029", att: 83 },
      { name: "Geetha Iyer", roll: "1BM22CS034", att: 79 },
      { name: "Harish Kumar", roll: "1BM22CS040", att: 90 },
      { name: "Isha Menon", roll: "1BM22CS041", att: 68 },
      { name: "Nayan K", roll: "1BM22CS045", att: 78 },
      { name: "Kavya Joshi", roll: "1BM22CS051", att: 85 }
    ];

    const attendance = [
      { icon: "M", sub: "Applied Mathematics", code: "MAT201", present: 38, total: 42 },
      { icon: "C", sub: "C Programming", code: "CS101", present: 35, total: 40 },
      { icon: "P", sub: "Engineering Physics", code: "PHY101", present: 26, total: 36 },
      { icon: "L", sub: "Physics Lab", code: "PHY101L", present: 13, total: 18 },
      { icon: "D", sub: "Engineering Drawing", code: "ME101", present: 22, total: 36 },
      { icon: "CL", sub: "C Programming Lab", code: "CS101L", present: 16, total: 18 }
    ];

    const facultyName = "Prof. S. Reddy";
    const markedStorageKey = "attendx-marked-sessions-v1";

    let punchState = 0;
    let activeClassId = null;
    let markedSessions = loadMarkedSessions();
    let createdAccounts = [];
    let dataStoreMode = "local";
    let currentUser = null;

    const els = {
      loginPage: document.getElementById("login-page"),
      loginForm: document.getElementById("loginForm"),
      signinTab: document.getElementById("signinTab"),
      createTab: document.getElementById("createTab"),
      signinPanel: document.getElementById("signinPanel"),
      createPanel: document.getElementById("createPanel"),
      loginId: document.getElementById("loginId"),
      loginPass: document.getElementById("loginPass"),
      loginError: document.getElementById("loginError"),
      createRole: document.getElementById("createRole"),
      createAccountBtn: document.getElementById("createAccountBtn"),
      studentCreateFields: document.getElementById("studentCreateFields"),
      facultyCreateFields: document.getElementById("facultyCreateFields"),
      studentApp: document.getElementById("studentApp"),
      facultyApp: document.getElementById("facultyApp"),
      studentClock: document.getElementById("studentClock"),
      facultyClock: document.getElementById("facultyClock"),
      facultyDate: document.getElementById("facultyDate"),
      studentStats: document.getElementById("studentStats"),
      facultyStats: document.getElementById("facultyStats"),
      studentToday: document.getElementById("studentToday"),
      studentTimetable: document.getElementById("studentTimetable"),
      facultyTimetable: document.getElementById("facultyTimetable"),
      studentAttendance: document.getElementById("studentAttendance"),
      facultyClasses: document.getElementById("facultyClasses"),
      facultyStudents: document.getElementById("facultyStudents"),
      studentSearch: document.getElementById("studentSearch"),
      attendanceModal: document.getElementById("attendanceModal"),
      modalTitle: document.getElementById("modalTitle"),
      modalSub: document.getElementById("modalSub"),
      modalStudents: document.getElementById("modalStudents"),
      modalSave: document.getElementById("modalSave"),
      punchButton: document.getElementById("punchButton"),
      punchInBox: document.getElementById("punchInBox"),
      punchOutBox: document.getElementById("punchOutBox"),
      punchInTime: document.getElementById("punchInTime"),
      punchOutTime: document.getElementById("punchOutTime"),
      toast: document.getElementById("toast"),
      notifyParents: document.getElementById("notifyParents"),
      studentNotifBtn: document.getElementById("studentNotifBtn"),
      studentNotifPanel: document.getElementById("studentNotifPanel"),
      studentNotifList: document.getElementById("studentNotifList"),
      studentNotifDot: document.getElementById("studentNotifDot"),
      studentNotifClear: document.getElementById("studentNotifClear"),
      facultyNotifBtn: document.getElementById("facultyNotifBtn"),
      facultyNotifPanel: document.getElementById("facultyNotifPanel"),
      facultyNotifList: document.getElementById("facultyNotifList"),
      facultyNotifDot: document.getElementById("facultyNotifDot"),
      facultyNotifClear: document.getElementById("facultyNotifClear"),
      loginBtn: document.getElementById("loginBtn"),
      loginPassEye: document.getElementById("loginPassEye"),
      createPassEye: document.getElementById("createPassEye"),
      studentProfileContent: document.getElementById("studentProfileContent"),
      studentAvatar: document.getElementById("studentAvatar"),
      studentGreetingName: document.getElementById("studentGreetingName"),
      facultyAvatar: document.getElementById("facultyAvatar"),
      facultyGreetingName: document.getElementById("facultyGreetingName")
    };

    init();

    async function init() {
      const store = await initDataStore();
      dataStoreMode = store.mode;
      createdAccounts = await loadAccounts();
      renderStudent();
      renderFaculty();
      bindEvents();
      updateClock();
      window.setInterval(updateClock, 1000);
    }

    function bindEvents() {
      els.loginForm.addEventListener("submit", login);
      els.signinTab.addEventListener("click", () => setAuthMode("signin"));
      els.createTab.addEventListener("click", () => setAuthMode("create"));
      els.createAccountBtn.addEventListener("click", createAccount);
      document.querySelectorAll("[data-logout]").forEach((button) => button.addEventListener("click", logout));
      document.querySelectorAll("[data-stab]").forEach((button) => button.addEventListener("click", () => switchTab("student", button.dataset.stab, button)));
      document.querySelectorAll("[data-ftab]").forEach((button) => button.addEventListener("click", () => switchTab("faculty", button.dataset.ftab, button)));
      els.studentSearch.addEventListener("input", renderStudents);
      els.punchButton.addEventListener("click", punch);
      els.attendanceModal.addEventListener("click", (event) => {
        if (event.target === els.attendanceModal) closeModal();
      });
      els.modalSave.addEventListener("click", handleSaveAttendance);

      els.studentApp.querySelector(".avatar").addEventListener("click", () => switchTab("student", "sProfile"));
      els.facultyApp.querySelector(".avatar").addEventListener("click", () => switchTab("faculty", "fProfile"));

      // Notification panel toggles
      els.studentNotifBtn.addEventListener("click", (e) => { e.stopPropagation(); toggleNotifPanel("student"); });
      els.facultyNotifBtn.addEventListener("click", (e) => { e.stopPropagation(); toggleNotifPanel("faculty"); });
      els.studentNotifClear.addEventListener("click", () => handleClearNotifs("student"));
      els.facultyNotifClear.addEventListener("click", () => handleClearNotifs("faculty"));

      document.addEventListener("click", () => {
        els.studentNotifPanel.classList.remove("active");
        els.facultyNotifPanel.classList.remove("active");
      });
      els.studentNotifPanel.addEventListener("click", (e) => e.stopPropagation());
      els.facultyNotifPanel.addEventListener("click", (e) => e.stopPropagation());

      // Password eye toggles
      if (els.loginPassEye) {
        els.loginPassEye.addEventListener("click", () => togglePassVisibility("loginPass", els.loginPassEye));
      }
      if (els.createPassEye) {
        els.createPassEye.addEventListener("click", () => togglePassVisibility("createPassword", els.createPassEye));
      }
    }

    function togglePassVisibility(inputId, eyeBtn) {
      const input = document.getElementById(inputId);
      if (input.type === "password") {
        input.type = "text";
        eyeBtn.classList.add("active");
      } else {
        input.type = "password";
        eyeBtn.classList.remove("active");
      }
    }

    function setAuthMode(mode) {
      const isCreate = mode === "create";
      els.signinTab.classList.toggle("active", !isCreate);
      els.createTab.classList.toggle("active", isCreate);
      els.signinPanel.classList.toggle("active", !isCreate);
      els.createPanel.classList.toggle("active", isCreate);
      els.loginError.textContent = "";
    }

    function updateCreateFields() {
      const isFaculty = els.createRole.value === "faculty";
      els.studentCreateFields.classList.toggle("active", !isFaculty);
      els.facultyCreateFields.classList.toggle("active", isFaculty);
    }

    async function login(event) {
      event.preventDefault();
      const id = els.loginId.value.trim();
      const pass = els.loginPass.value.trim();

      if (!id || !pass) {
        els.loginError.textContent = "Please enter your ID and password.";
        return;
      }

      // Show loading
      const btn = els.loginBtn;
      const originalText = btn.textContent;
      btn.textContent = "Signing in";
      btn.classList.add("loading");
      els.loginError.textContent = "";

      try {
        const result = await signInAccount(id, pass);
        
        // Allow demo login bypass
        const isDemo = (!result.ok && result.reason === "not-found" && pass === "demo123") || 
                       (result.ok && !result.account && pass === "demo123");

        if (!result.ok && !isDemo) {
          btn.textContent = originalText;
          btn.classList.remove("loading");
          if (result.reason === "bad-password" || result.reason === "invalid-credential") {
            els.loginError.textContent = "Incorrect password. Please try again.";
          } else if (result.reason === "not-found") {
            els.loginError.textContent = "No account found with this ID.";
          } else if (result.reason === "too-many-requests") {
            els.loginError.textContent = "Too many attempts. Please wait and try again.";
          } else {
            els.loginError.textContent = "Sign-in failed. Please check your credentials.";
          }
          return;
        }

        if (!result.account && pass !== "demo123") {
          btn.textContent = originalText;
          btn.classList.remove("loading");
          els.loginError.textContent = "No account found. Use demo123 for demo login.";
          return;
        }

        currentUser = result.account || null;
        els.loginError.textContent = "";
        els.loginPage.classList.add("hidden");
        btn.textContent = originalText;
        btn.classList.remove("loading");

        const role = currentUser?.role || inferRole(id);
        updateUIAfterLogin(role, id);
        
        if (role === "faculty") {
          els.facultyApp.classList.add("active");
          switchTab("faculty", "fHome");
        } else {
          renderUserProfile();
          els.studentApp.classList.add("active");
          switchTab("student", "sHome");
        }
        showToast(role === "faculty" ? "Faculty portal opened" : "Student portal opened");
      } catch (error) {
        console.error("Login error:", error);
        btn.textContent = originalText;
        btn.classList.remove("loading");
        els.loginError.textContent = "Sign-in failed. Please check your credentials.";
      }
    }

    async function createAccount() {
      const role = getValue("createRole");
      const name = getValue("createName");
      const id = getValue("createId");
      const email = getValue("createEmail");
      const password = getValue("createPassword");
      const phone = getValue("createPhone");
      const address = getValue("createAddress");

      // Name validation
      if (!name || name.length < 3) {
        els.loginError.textContent = "Full name must be at least 3 characters.";
        return;
      }

      // College ID validation
      if (!id || id.length < 4) {
        els.loginError.textContent = "College ID must be at least 4 characters.";
        return;
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email)) {
        els.loginError.textContent = "Enter a valid email address.";
        return;
      }

      // Password validation — min 8 chars, 1 uppercase, 1 number, 1 special character
      if (password.length < 8) {
        els.loginError.textContent = "Password must be at least 8 characters.";
        return;
      }
      if (!/[A-Z]/.test(password)) {
        els.loginError.textContent = "Password needs at least one uppercase letter.";
        return;
      }
      if (!/[0-9]/.test(password)) {
        els.loginError.textContent = "Password needs at least one number.";
        return;
      }
      if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        els.loginError.textContent = "Password needs at least one special character (!@#$%^&*).";
        return;
      }

      // Phone validation — 10 to 13 digits
      const phoneClean = phone.replace(/[\s\-]/g, "");
      if (!phoneClean || !/^\+?\d{10,13}$/.test(phoneClean)) {
        els.loginError.textContent = "Enter a valid phone number (10-13 digits).";
        return;
      }

      // Address validation — minimum 10 characters, must contain letters
      if (!address || address.length < 10) {
        els.loginError.textContent = "Address must be at least 10 characters.";
        return;
      }
      if (!/[a-zA-Z]/.test(address)) {
        els.loginError.textContent = "Address must contain valid location text.";
        return;
      }

      // Student-specific required fields
      const dept = getValue("createDepartment");
      const section = getValue("createSection");
      const guardian = getValue("createParent");
      const guardianPhone = getValue("createParentPhone");
      if (!dept || !section) {
        els.loginError.textContent = "Department and Section are required.";
        return;
      }
      if (!guardian || guardian.length < 3) {
        els.loginError.textContent = "Guardian name must be at least 3 characters.";
        return;
      }
      const gpClean = guardianPhone.replace(/[\s\-]/g, "");
      if (!gpClean || !/^\+?\d{10,13}$/.test(gpClean)) {
        els.loginError.textContent = "Enter a valid guardian phone number.";
        return;
      }

      // Duplicate check
      if (findAccount(createdAccounts, id) || findAccount(createdAccounts, email)) {
        els.loginError.textContent = "Account already exists for this ID or email.";
        return;
      }

      const account = {
        role: "student",
        name,
        id,
        email,
        password,
        phone,
        address,
        photo: getValue("createPhoto"),
        createdAt: new Date().toISOString(),
        student: {
          department: dept,
          section: section,
          guardianName: guardian,
          guardianPhone: guardianPhone
        },
        faculty: null
      };

      await saveAccount(account);
      createdAccounts = await loadAccounts();
      els.loginId.value = id;
      els.loginPass.value = password;
      setAuthMode("signin");
      showToast(dataStoreMode === "firebase" ? "Account created in Firebase" : "Account created locally");
    }

    function getValue(id) {
      return document.getElementById(id)?.value.trim() || "";
    }

    function inferRole(id) {
      const value = id.trim().toLowerCase();
      return value.startsWith("fac") || value.includes("faculty") || value.includes("prof") ? "faculty" : "student";
    }

    function logout() {
      currentUser = null;
      els.studentApp.classList.remove("active");
      els.facultyApp.classList.remove("active");
      els.loginPage.classList.remove("hidden");
      els.loginPass.value = "";
      els.loginError.textContent = "";
    }

    function getTimeGreeting() {
      const hour = new Date().getHours();
      if (hour < 12) return "Good morning ☀️";
      if (hour < 17) return "Good afternoon 🌤️";
      if (hour < 20) return "Good evening 🌇";
      return "Good night 🌙";
    }

    function updateUIAfterLogin(role, fallbackId) {
      const greeting = getTimeGreeting();
      const user = currentUser || {
        name: role === "faculty" ? "Prof. Reddy" : "Nayan K",
        id: fallbackId,
        photo: role === "faculty" ? "https://i.pravatar.cc/120?u=sunita-reddy-faculty" : "https://i.pravatar.cc/120?u=nayan-k-student"
      };

      // Get short name (first name) for greeting
      const shortName = user.name.split(" ")[0];

      // Set photo fallback if no photo URL provided
      const photoUrl = user.photo || ('https://i.pravatar.cc/120?u=' + encodeURIComponent(user.name));
      const fallbackInitials = initials(user.name);

      if (role === "faculty") {
        if (els.facultyGreetingName) els.facultyGreetingName.textContent = greeting + ", " + shortName;
        if (els.facultyAvatar) {
          els.facultyAvatar.innerHTML = '<img src="' + photoUrl + '" alt="' + user.name + '" onerror="this.remove();this.parentElement.textContent=\'' + fallbackInitials + '\';">';
        }
      } else {
        if (els.studentGreetingName) els.studentGreetingName.textContent = greeting + ", " + shortName;
        if (els.studentAvatar) {
          els.studentAvatar.innerHTML = '<img src="' + photoUrl + '" alt="' + user.name + '" onerror="this.remove();this.parentElement.textContent=\'' + fallbackInitials + '\';">';
        }
      }
    }

    function switchTab(app, tabId, clickedButton) {
      const root = app === "student" ? els.studentApp : els.facultyApp;
      root.querySelectorAll(".tab-section").forEach((section) => section.classList.remove("active"));
      root.querySelector("#" + tabId).classList.add("active");
      root.querySelectorAll(".nav-item").forEach((nav) => nav.classList.remove("active"));
      const button = clickedButton || root.querySelector(`[data-${app === "student" ? "stab" : "ftab"}="${tabId}"]`);
      if (button) button.classList.add("active");
    }

    function renderStudent() {
      const totalPresent = attendance.reduce((sum, item) => sum + item.present, 0);
      const totalClasses = attendance.reduce((sum, item) => sum + item.total, 0);
      const overall = Math.round((totalPresent / totalClasses) * 100);
      const low = attendance.filter((item) => Math.round((item.present / item.total) * 100) < 75).length;

      els.studentStats.innerHTML = [
        stat(overall + "%", "Overall", "green"),
        stat(low, "Low subjects", "amber"),
        stat(totalPresent, "Attended", "")
      ].join("");

      els.studentToday.innerHTML = classes.slice(0, 4).map((item) => timetableItem(item, true)).join("");
      els.studentTimetable.innerHTML = classes.map((item) => timetableItem(item, false)).join("");
      els.studentAttendance.innerHTML = attendance.map((item) => attendanceItem(item)).join("");
    }

    function renderFaculty() {
      const myClasses = facultyClasses();
      els.facultyStats.innerHTML = [
        stat(myClasses.length, "Today's lectures", "teal"),
        stat(students.length, "My students", "green"),
        stat(students.filter((student) => student.att < 75).length, "Low attendance", "amber")
      ].join("");

      els.facultyClasses.innerHTML = myClasses.map((item) => facultyClass(item)).join("");
      els.facultyTimetable.innerHTML = myClasses.map((item) => timetableItem(item, true)).join("");
      renderStudents();
      els.facultyClasses.querySelectorAll("[data-class-id]").forEach((button) => {
        button.addEventListener("click", () => openModal(Number(button.dataset.classId)));
      });
    }

    function renderUserProfile() {
      if (!els.studentProfileContent) return;

      const user = currentUser || {
        name: "Nayan K",
        id: "1BM22CS045",
        email: "nayan.k@college.edu.in",
        phone: "+91 98765 43210",
        address: "Bengaluru, Karnataka",
        photo: "https://i.pravatar.cc/180?u=nayan-k-student",
        student: {
          department: "Computer Science & Engineering",
          section: "Sem 2 / B",
          guardianName: "Kiran Kumar",
          guardianPhone: "+91 99887 77665"
        }
      };

      const stu = user.student || {};

      els.studentProfileContent.innerHTML = `
        <div class="profile-card profile-hero">
          <div class="profile-big-av"><img class="profile-pic" src="${user.photo || 'https://i.pravatar.cc/180?u=' + encodeURIComponent(user.name)}" alt="${user.name}" onerror="this.remove();this.parentElement.textContent='${initials(user.name)}';"></div>
          <div class="profile-name">${user.name}</div>
          <div class="profile-meta">${user.id} · ${stu.section || 'N/A'}</div>
          <div class="profile-meta">${stu.department || 'N/A'}</div>
        </div>
        <div class="profile-section-title">Academic Info</div>
        <div class="profile-card">
          <div class="profile-row"><span class="profile-row-label">Roll No</span><span class="profile-row-val">${user.id}</span></div>
          <div class="profile-row"><span class="profile-row-label">Department</span><span class="profile-row-val">${stu.department || 'N/A'}</span></div>
          <div class="profile-row"><span class="profile-row-label">Section</span><span class="profile-row-val">${stu.section || 'N/A'}</span></div>
          <div class="profile-row"><span class="profile-row-label">College email</span><span class="profile-row-val">${user.email}</span></div>
          <div class="profile-row"><span class="profile-row-label">Advisor</span><span class="profile-row-val">Prof. S. Reddy</span></div>
        </div>
        <div class="profile-section-title">Personal Details</div>
        <div class="profile-card">
          <div class="profile-row"><span class="profile-row-label">Phone</span><span class="profile-row-val">${user.phone}</span></div>
          <div class="profile-row"><span class="profile-row-label">Address</span><span class="profile-row-val">${user.address}</span></div>
        </div>
        <div class="profile-section-title">Parent / Guardian</div>
        <div class="profile-card">
          <div class="profile-row"><span class="profile-row-label">Name</span><span class="profile-row-val">${stu.guardianName || 'N/A'}</span></div>
          <div class="profile-row"><span class="profile-row-label">Emergency</span><span class="profile-row-val">${stu.guardianPhone || 'N/A'}</span></div>
        </div>
      `;
    }

    function facultyClasses() {
      return classes.filter((item) => item.faculty === facultyName);
    }

    function renderStudents() {
      const query = els.studentSearch.value.trim().toLowerCase();
      const filtered = students.filter((student) => student.name.toLowerCase().includes(query) || student.roll.toLowerCase().includes(query));
      els.facultyStudents.innerHTML = filtered.map((student) => {
        const color = attColor(student.att);
        return `<div class="stu-card">
          <div class="stu-av">${initials(student.name)}</div>
          <div class="stu-card-info">
            <div class="stu-card-name">${student.name}</div>
            <div class="stu-card-meta">${student.roll}</div>
          </div>
          <div class="stu-card-pct" style="color:var(--${color === "good" ? "green" : color === "warn" ? "amber" : "red"})">${student.att}%</div>
        </div>`;
      }).join("");
    }

    function stat(value, label, color) {
      return `<div class="stat-card"><div class="stat-val ${color}">${value}</div><div class="stat-label">${label}</div></div>`;
    }

    function timetableItem(item, showStatus) {
      const live = showStatus && isClassLive(item);
      const marked = isMarked(item.id);
      const open = showStatus && isAttendanceOpen(item);
      const badgeClass = marked ? "done" : live ? "live" : open ? "live" : item.type === "lab" ? "lab" : "theory";
      const badgeText = marked ? "Marked" : live ? "Ongoing" : open ? "Open" : item.type === "lab" ? "Lab" : "Theory";
      return `<div class="tt-item ${live ? "ongoing" : ""}">
        <div class="tt-time-col">
          <div class="tt-time">${item.start}</div>
          <div class="tt-range">${item.start}-${item.end}</div>
        </div>
        <div class="tt-divider"></div>
        <div class="tt-info">
          <div class="tt-sub">${item.subject}</div>
          <div class="tt-faculty">${item.faculty}</div>
          <div class="tt-room">Room ${item.room} Â· ${item.floor}</div>
        </div>
        <span class="pill ${badgeClass}">${badgeText}</span>
      </div>`;
    }

    function attendanceItem(item) {
      const pct = Math.round((item.present / item.total) * 100);
      const color = attColor(pct);
      return `<div class="att-item">
        <div class="att-icon ${color}">${item.icon}</div>
        <div class="att-info">
          <div class="att-sub">${item.sub}</div>
          <div class="att-code">${item.code} Â· ${item.present}/${item.total} classes</div>
          <div class="prog-bar"><div class="prog-fill ${color}" style="width:${pct}%"></div></div>
        </div>
        <div class="att-right">
          <div class="att-pct ${color}">${pct}%</div>
          <div class="att-classes">${item.total - item.present} absent</div>
        </div>
      </div>`;
    }

    function facultyClass(item) {
      const live = isClassLive(item);
      const marked = isMarked(item.id);
      const open = isAttendanceOpen(item);
      const upcoming = isClassUpcoming(item);
      const isLocked = !open || marked;
      const label = marked
        ? "Attendance Marked"
        : open
          ? "Mark Attendance"
          : upcoming
            ? "Opens After Start"
            : "Closed";
      const status = marked ? "Marked" : live ? "Live Now" : open ? "Open Till Midnight" : "Upcoming";
      return `<div class="fac-class-card">
        <div class="fac-class-top">
          <div class="fac-class-icon">B</div>
          <div class="fac-class-info">
            <div class="fac-class-name">${item.subject}</div>
            <div class="fac-class-meta">${item.start}-${item.end} Â· Room ${item.room} Â· ${item.floor}</div>
          </div>
          <span class="pill ${open && !marked ? "live" : "done"}">${status}</span>
        </div>
        <button class="mark-att-btn ${isLocked ? "locked" : ""}" type="button" data-class-id="${item.id}">${label}</button>
      </div>`;
    }

    function openModal(classId) {
      const item = classes.find((entry) => entry.id === classId);
      if (isMarked(classId)) {
        showToast("Attendance is already marked and locked");
        return;
      }
      if (!isAttendanceOpen(item)) {
        showToast("Attendance opens after class starts");
        return;
      }
      activeClassId = classId;
      els.modalTitle.textContent = "Mark Attendance - " + item.subject;
      els.modalSub.textContent = `${item.start}-${item.end} Â· Room ${item.room} Â· Section B`;
      els.modalStudents.innerHTML = students.map((student, index) => `<div class="student-att-row">
        <div class="stu-av">${initials(student.name)}</div>
        <div style="flex:1"><div class="stu-name">${student.name}</div><div class="stu-roll">${student.roll}</div></div>
        <div class="att-toggle">
          <button class="att-toggle-btn present sel" type="button" data-present="${index}">P</button>
          <button class="att-toggle-btn absent" type="button" data-absent="${index}">A</button>
        </div>
      </div>`).join("");
      els.modalStudents.querySelectorAll(".att-toggle-btn").forEach((button) => {
        button.addEventListener("click", () => {
          const group = button.parentElement;
          group.querySelectorAll(".att-toggle-btn").forEach((item) => item.classList.remove("sel"));
          button.classList.add("sel");
        });
      });
      els.attendanceModal.classList.add("active");
    }

    function closeModal() {
      els.attendanceModal.classList.remove("active");
      activeClassId = null;
    }

    function punch() {
      const time = new Date().toTimeString().slice(0, 5);
      if (punchState === 0) {
        punchState = 1;
        els.punchInTime.textContent = time;
        els.punchInTime.classList.add("green");
        els.punchInBox.classList.add("in");
        els.punchButton.textContent = "Punch Out";
        els.punchButton.classList.add("out");
      } else if (punchState === 1) {
        punchState = 2;
        els.punchOutTime.textContent = time;
        els.punchOutTime.classList.add("red");
        els.punchOutBox.classList.add("out");
        els.punchButton.textContent = "Punched Out at " + time;
        els.punchButton.disabled = true;
      }
    }

    function updateClock() {
      const now = new Date();
      const time = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      els.studentClock.textContent = time;
      els.facultyClock.textContent = time;
      els.facultyDate.textContent = now.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
      if (els.facultyApp.classList.contains("active")) renderFaculty();
    }

    function todayDate() {
      return new Date().toISOString().slice(0, 10);
    }

    function todayKey(classId) {
      return `${todayDate()}-${classId}`;
    }

    function isMarked(classId) {
      return Boolean(markedSessions[todayKey(classId)]);
    }

    function timeToMinutes(time) {
      const [hours, minutes] = time.split(":").map(Number);
      return hours * 60 + minutes;
    }

    function nowMinutes() {
      const now = new Date();
      return now.getHours() * 60 + now.getMinutes();
    }

    function isClassLive(item) {
      const now = nowMinutes();
      return now >= timeToMinutes(item.start) && now < timeToMinutes(item.end);
    }

    function isClassEnded(item) {
      return nowMinutes() >= timeToMinutes(item.end);
    }

    function isClassUpcoming(item) {
      return nowMinutes() < timeToMinutes(item.start);
    }

    function isAttendanceOpen(item) {
      return nowMinutes() >= timeToMinutes(item.start);
    }

    function loadMarkedSessions() {
      try {
        return JSON.parse(localStorage.getItem(markedStorageKey)) || {};
      } catch (error) {
        return {};
      }
    }

    function saveMarkedSessions() {
      localStorage.setItem(markedStorageKey, JSON.stringify(markedSessions));
    }
function attColor(percent) {
      if (percent >= 75) return "good";
      if (percent >= 65) return "warn";
      return "low";
    }

    function initials(name) {
      return name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
    }

    function showToast(message) {
      els.toast.textContent = message;
      els.toast.classList.add("show");
      window.clearTimeout(showToast.timer);
      showToast.timer = window.setTimeout(() => els.toast.classList.remove("show"), 2200);
    }

    // --- Attendance Save with Notifications ---

    async function handleSaveAttendance() {
      if (activeClassId === null) return;

      const classItem = classes.find((c) => c.id === activeClassId);
      const rows = els.modalStudents.querySelectorAll(".student-att-row");
      const presentList = [];
      const absentList = [];

      rows.forEach((row, index) => {
        const isAbsent = row.querySelector(".att-toggle-btn.absent.sel");
        if (isAbsent) {
          absentList.push(students[index]);
        } else {
          presentList.push(students[index]);
        }
      });

      // Save attendance record to Firebase
      const record = {
        classId: activeClassId,
        subject: classItem.subject,
        code: classItem.code,
        date: todayDate(),
        time: classItem.start + "-" + classItem.end,
        faculty: facultyName,
        totalStudents: students.length,
        presentCount: presentList.length,
        absentCount: absentList.length,
        presentRolls: presentList.map((s) => s.roll),
        absentRolls: absentList.map((s) => s.roll),
        savedAt: new Date().toISOString()
      };

      try {
        await saveAttendanceRecord(record);
      } catch (err) {
        console.error("Failed to save attendance record:", err);
      }

      // Create notifications for absent students
      const shouldNotifyParents = els.notifyParents.checked;
      const now = new Date().toISOString();

      for (const student of absentList) {
        // Notification to student
        try {
          await saveNotification({
            type: "absent",
            targetId: student.roll,
            targetRole: "student",
            title: "Absent: " + classItem.subject,
            message: "You were marked absent in " + classItem.subject + " (" + classItem.start + "-" + classItem.end + ") by " + facultyName + ".",
            date: todayDate(),
            createdAt: now
          });
        } catch (err) {
          console.error("Failed to save student notification:", err);
        }

        // Notification to parent/guardian
        if (shouldNotifyParents) {
          try {
            await saveNotification({
              type: "parent",
              targetId: student.roll + "-parent",
              targetRole: "guardian",
              title: "Absence Alert: " + student.name,
              message: student.name + " (" + student.roll + ") was absent in " + classItem.subject + " on " + todayDate() + ". Faculty: " + facultyName + ".",
              studentName: student.name,
              studentRoll: student.roll,
              date: todayDate(),
              createdAt: now
            });
          } catch (err) {
            console.error("Failed to save parent notification:", err);
          }
        }
      }

      // Notification to faculty (summary)
      try {
        await saveNotification({
          type: "info",
          targetId: "FAC2019018",
          targetRole: "faculty",
          title: "Attendance Saved: " + classItem.subject,
          message: presentList.length + " present, " + absentList.length + " absent." + (shouldNotifyParents && absentList.length > 0 ? " Parent alerts sent for " + absentList.length + " student(s)." : ""),
          date: todayDate(),
          createdAt: now
        });
      } catch (err) {
        console.error("Failed to save faculty notification:", err);
      }

      // Mark session locally
      markedSessions[todayKey(activeClassId)] = {
        classId: activeClassId,
        markedAt: now
      };
      saveMarkedSessions();

      closeModal();
      renderFaculty();

      const msg = absentList.length > 0
        ? "Attendance saved — " + absentList.length + " absent" + (shouldNotifyParents ? ", parents notified" : "")
        : "Attendance saved — all present!";
      showToast(msg);

      // Refresh notification dots
      updateNotifDot("faculty", "FAC2019018");
    }

    // --- Notification Panel ---

    async function toggleNotifPanel(role) {
      const panel = role === "student" ? els.studentNotifPanel : els.facultyNotifPanel;
      const isOpen = panel.classList.contains("active");

      // Close all panels first
      els.studentNotifPanel.classList.remove("active");
      els.facultyNotifPanel.classList.remove("active");

      if (!isOpen) {
        panel.classList.add("active");
        const identifier = role === "student" ? "1BM22CS045" : "FAC2019018";
        await renderNotifications(role, identifier);
      }
    }

    async function renderNotifications(role, identifier) {
      const list = role === "student" ? els.studentNotifList : els.facultyNotifList;

      try {
        const notifs = await loadNotifications(role, identifier);
        if (notifs.length === 0) {
          list.innerHTML = '<div class="notif-empty">No notifications yet</div>';
          return;
        }

        list.innerHTML = notifs.slice(0, 20).map((n) => {
          const iconClass = n.type === "absent" ? "absent" : n.type === "parent" ? "parent" : "info";
          const iconLetter = n.type === "absent" ? "A" : n.type === "parent" ? "P" : "i";
          return '<div class="notif-item">' +
            '<div class="notif-item-icon ' + iconClass + '">' + iconLetter + '</div>' +
            '<div><div class="notif-item-text">' + n.message + '</div>' +
            '<div class="notif-item-time">' + timeAgo(n.createdAt) + '</div></div>' +
            '</div>';
        }).join("");
      } catch (err) {
        console.error("Failed to load notifications:", err);
        list.innerHTML = '<div class="notif-empty">Failed to load notifications</div>';
      }
    }

    async function handleClearNotifs(role) {
      const identifier = role === "student" ? "1BM22CS045" : "FAC2019018";
      const list = role === "student" ? els.studentNotifList : els.facultyNotifList;
      const dot = role === "student" ? els.studentNotifDot : els.facultyNotifDot;

      try {
        await clearNotifications(role, identifier);
        list.innerHTML = '<div class="notif-empty">No notifications yet</div>';
        dot.classList.remove("active");
        showToast("Notifications cleared");
      } catch (err) {
        console.error("Failed to clear notifications:", err);
      }
    }

    async function updateNotifDot(role, identifier) {
      try {
        const notifs = await loadNotifications(role, identifier);
        const dot = role === "student" ? els.studentNotifDot : els.facultyNotifDot;
        dot.classList.toggle("active", notifs.length > 0);
      } catch (err) {
        // silent
      }
    }

    function timeAgo(dateStr) {
      const now = Date.now();
      const then = new Date(dateStr).getTime();
      const diff = Math.floor((now - then) / 1000);
      if (diff < 60) return "Just now";
      if (diff < 3600) return Math.floor(diff / 60) + "m ago";
      if (diff < 86400) return Math.floor(diff / 3600) + "h ago";
      return Math.floor(diff / 86400) + "d ago";
    }
