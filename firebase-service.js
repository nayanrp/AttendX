const firebaseConfig = {
  apiKey: "AIzaSyCbW4FJUa7IMNTWdieID66ShxfbADCyKoA",
  authDomain: "hydra-99b35.firebaseapp.com",
  projectId: "hydra-99b35",
  storageBucket: "hydra-99b35.firebasestorage.app",
  messagingSenderId: "490750240270",
  appId: "1:490750240270:web:dc7231bae58a31b4933e5f",
  measurementId: "G-6LLVNFT6YQ"
};

const accountsStorageKey = "attendx-created-accounts-v1";
const attendanceStorageKey = "attendx-attendance-v1";
const notificationsStorageKey = "attendx-notifications-v1";
let firebaseApi = null;

export async function initDataStore() {
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    return { mode: "local" };
  }

  try {
    const appModule = await import("https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js");
    const authModule = await import("https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js");
    const firestoreModule = await import("https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js");
    const app = appModule.initializeApp(firebaseConfig);
    const auth = authModule.getAuth(app);
    const db = firestoreModule.getFirestore(app);
    firebaseApi = { auth, db, authModule, firestoreModule };
    return { mode: "firebase" };
  } catch (error) {
    console.warn("Firebase unavailable; using local storage fallback.", error);
    return { mode: "local" };
  }
}

export async function loadAccounts() {
  if (!firebaseApi) return loadLocalAccounts();

  const { db, firestoreModule } = firebaseApi;
  const snapshot = await firestoreModule.getDocs(firestoreModule.collection(db, "accounts"));
  return snapshot.docs.map((doc) => ({ firebaseDocId: doc.id, ...doc.data() }));
}

export async function saveAccount(account) {
  if (!firebaseApi) {
    const accounts = loadLocalAccounts();
    accounts.push(account);
    localStorage.setItem(accountsStorageKey, JSON.stringify(accounts));
    return { mode: "local" };
  }

  const { auth, db, authModule, firestoreModule } = firebaseApi;
  const credential = await authModule.createUserWithEmailAndPassword(auth, account.email, account.password);
  const safeAccount = { ...account, uid: credential.user.uid };
  delete safeAccount.password;
  await firestoreModule.setDoc(firestoreModule.doc(db, "accounts", credential.user.uid), safeAccount);
  return { mode: "firebase", uid: credential.user.uid };
}

export async function signInAccount(identifier, password) {
  const accounts = firebaseApi ? await loadAccounts() : loadLocalAccounts();
  const account = findAccount(accounts, identifier);

  if (!firebaseApi) {
    if (account && account.password !== password) return { ok: false, reason: "bad-password" };
    return { ok: true, account };
  }

  if (!account) return { ok: false, reason: "not-found" };

  try {
    await firebaseApi.authModule.signInWithEmailAndPassword(firebaseApi.auth, account.email, password);
    return { ok: true, account };
  } catch (error) {
    const code = error.code || "";
    if (code.includes("wrong-password") || code.includes("invalid-credential")) {
      return { ok: false, reason: "bad-password" };
    }
    if (code.includes("user-not-found")) {
      return { ok: false, reason: "not-found" };
    }
    if (code.includes("too-many-requests")) {
      return { ok: false, reason: "too-many-requests" };
    }
    return { ok: false, reason: code || "unknown" };
  }
}

export function findAccount(accounts, identifier) {
  const value = identifier.trim().toLowerCase();
  return accounts.find((account) => account.id.toLowerCase() === value || account.email.toLowerCase() === value);
}

// --- Attendance Records ---

export async function saveAttendanceRecord(record) {
  if (!firebaseApi) {
    const records = JSON.parse(localStorage.getItem(attendanceStorageKey) || "[]");
    records.push(record);
    localStorage.setItem(attendanceStorageKey, JSON.stringify(records));
    return { mode: "local" };
  }

  const { db, firestoreModule } = firebaseApi;
  await firestoreModule.addDoc(firestoreModule.collection(db, "attendance"), record);
  return { mode: "firebase" };
}

// --- Notifications ---

export async function saveNotification(notification) {
  if (!firebaseApi) {
    const notifs = JSON.parse(localStorage.getItem(notificationsStorageKey) || "[]");
    notifs.push(notification);
    localStorage.setItem(notificationsStorageKey, JSON.stringify(notifs));
    return { mode: "local" };
  }

  const { db, firestoreModule } = firebaseApi;
  await firestoreModule.addDoc(firestoreModule.collection(db, "notifications"), notification);
  return { mode: "firebase" };
}

export async function loadNotifications(role, identifier) {
  if (!firebaseApi) {
    const notifs = JSON.parse(localStorage.getItem(notificationsStorageKey) || "[]");
    return notifs.filter(n => n.targetId === identifier || n.targetRole === role).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  const { db, firestoreModule } = firebaseApi;
  const snapshot = await firestoreModule.getDocs(firestoreModule.collection(db, "notifications"));
  return snapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() }))
    .filter(n => n.targetId === identifier || n.targetRole === role)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export async function clearNotifications(role, identifier) {
  if (!firebaseApi) {
    const notifs = JSON.parse(localStorage.getItem(notificationsStorageKey) || "[]");
    const remaining = notifs.filter(n => n.targetId !== identifier && n.targetRole !== role);
    localStorage.setItem(notificationsStorageKey, JSON.stringify(remaining));
    return;
  }

  const { db, firestoreModule } = firebaseApi;
  const snapshot = await firestoreModule.getDocs(firestoreModule.collection(db, "notifications"));
  const batch = firestoreModule.writeBatch(db);
  snapshot.docs
    .filter(doc => { const d = doc.data(); return d.targetId === identifier || d.targetRole === role; })
    .forEach(doc => batch.delete(doc.ref));
  await batch.commit();
}

function loadLocalAccounts() {
  try {
    return JSON.parse(localStorage.getItem(accountsStorageKey)) || [];
  } catch (error) {
    return [];
  }
}
