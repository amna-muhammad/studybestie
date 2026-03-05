// js/backend.js
"use strict";

/* =========================
   STORAGE KEYS
========================= */
const ACCOUNTS_KEY = "studyBestie_accounts";
const SESSION_KEY = "studyBestie_session";
const LAST_LOGIN_KEY = "studyBestie_lastLogin";

/* =========================
   HELPERS
========================= */
function readJSON(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function isEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

function isPhone(v) {
  // simple: 10-15 digits (lets you type 4044444444 or +1404...)
  const digits = v.replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 15;
}

function passwordValid(pw) {
  if (!pw || pw.length < 8) return false;
  // must contain at least 1 special character
  return /[^A-Za-z0-9]/.test(pw);
}

function normalizePhone(v) {
  return v.replace(/\D/g, ""); // store digits only
}

/* =========================
   ACCOUNTS
========================= */
function getAccounts() {
  return readJSON(ACCOUNTS_KEY, []);
}

function saveAccounts(accs) {
  writeJSON(ACCOUNTS_KEY, accs);
}

function findUserByEmailOrPhone(emailOrPhone) {
  const accounts = getAccounts();
  const input = emailOrPhone.trim();

  // match email exact
  if (isEmail(input)) {
    const e = input.toLowerCase();
    return accounts.find(a => (a.email || "").toLowerCase() === e) || null;
  }

  // match phone by digits
  const p = normalizePhone(input);
  return accounts.find(a => normalizePhone(a.phone || "") === p) || null;
}

/* =========================
   SESSION
========================= */
function getSession() {
  return readJSON(SESSION_KEY, null);
}

function setSession(user) {
  writeJSON(SESSION_KEY, {
    name: user.name || "Bestie",
    email: user.email || "",
    phone: user.phone || ""
  });
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

/* =========================
   UI ERROR (works on any page)
========================= */
function sbShowError(message) {
  const box = document.getElementById("errorBox");
  if (box) {
    box.textContent = message;
    box.classList.remove("hidden");
  } else {
    alert(message);
  }
}

function sbClearError() {
  const box = document.getElementById("errorBox");
  if (box) box.classList.add("hidden");
}

/* =========================
   PUBLIC FUNCTIONS YOU CALL
========================= */

// ---- Login (index.html)
function sbLogin() {
  sbClearError();

  const emailOrPhoneEl = document.getElementById("email");
  const passwordEl = document.getElementById("password");

  if (!emailOrPhoneEl || !passwordEl) {
    sbShowError("Login inputs not found on this page.");
    return;
  }

  const emailOrPhone = emailOrPhoneEl.value.trim();
  const password = passwordEl.value;

  if (!emailOrPhone || !password) {
    sbShowError("Please enter your email/phone AND password 😭");
    return;
  }

  if (!passwordValid(password)) {
    sbShowError("Password must be 8+ characters and include 1 special character (like ! @ #).");
    return;
  }

  const user = findUserByEmailOrPhone(emailOrPhone);

  if (!user) {
    sbShowError("No account found. Click Create to make one ✨");
    return;
  }

  if (user.password !== password) {
    sbShowError("Wrong password bestie 😭 Try again.");
    return;
  }

  // remember me (optional)
  const remember = document.getElementById("rememberMe");
  if (remember && remember.checked) {
    localStorage.setItem(LAST_LOGIN_KEY, emailOrPhone);
  } else {
    localStorage.removeItem(LAST_LOGIN_KEY);
  }

  setSession(user);
  window.location.href = "dashboard.html";
}

// ---- Create Account (create-account.html)
function sbCreateAccount() {
  sbClearError();

  const nameEl = document.getElementById("firstName");
  const contactEl = document.getElementById("contact");
  const passwordEl = document.getElementById("password");
  const typeEl = document.querySelector('input[name="contactType"]:checked');

  if (!nameEl || !contactEl || !passwordEl || !typeEl) {
    sbShowError("Create account inputs not found on this page.");
    return;
  }

  const name = nameEl.value.trim();
  const contact = contactEl.value.trim();
  const pw = passwordEl.value;
  const type = typeEl.value; // "email" or "phone"

  if (!name || !contact || !pw) {
    sbShowError("Please fill all fields 😭");
    return;
  }

  if (!passwordValid(pw)) {
    sbShowError("Password must be 8+ characters and include 1 special character (like ! @ #).");
    return;
  }

  let email = "";
  let phone = "";

  if (type === "email") {
    if (!isEmail(contact)) {
      sbShowError("Please enter a valid email (example: amna@gmail.com).");
      return;
    }
    email = contact.toLowerCase();
  } else {
    if (!isPhone(contact)) {
      sbShowError("Please enter a valid phone number (10-15 digits).");
      return;
    }
    phone = normalizePhone(contact);
  }

  // prevent duplicates
  const accounts = getAccounts();
  const already =
    (email && accounts.some(a => (a.email || "").toLowerCase() === email)) ||
    (phone && accounts.some(a => normalizePhone(a.phone || "") === phone));

  if (already) {
    sbShowError("An account with that email/phone already exists 💀 Try logging in.");
    return;
  }

  const newUser = { name, email, phone, password: pw };
  accounts.push(newUser);
  saveAccounts(accounts);

  setSession(newUser);
  window.location.href = "dashboard.html";
}

// ---- Logout (dashboard.html button)
function sbLogout() {
  clearSession();
  window.location.href = "index.html";
}

/* =========================
   PAGE GUARDS (AUTO)
========================= */

// Call this on pages that REQUIRE login (dashboard.html)
function sbRequireLogin() {
  if (!getSession()) window.location.href = "index.html";
}

// Call this on pages that should NOT show when logged in (index.html)
function sbRedirectIfLoggedIn() {
  if (getSession()) window.location.href = "dashboard.html";
}

// Auto-fill last login on index page (optional)
function sbFillRememberedLogin() {
  const last = localStorage.getItem(LAST_LOGIN_KEY);
  const emailEl = document.getElementById("email");
  const remember = document.getElementById("rememberMe");
  if (last && emailEl) {
    emailEl.value = last;
    if (remember) remember.checked = true;
  }
}

/* =========================
   EXPOSE GLOBALS
========================= */
window.sbLogin = sbLogin;
window.sbCreateAccount = sbCreateAccount;
window.sbLogout = sbLogout;

window.sbRequireLogin = sbRequireLogin;
window.sbRedirectIfLoggedIn = sbRedirectIfLoggedIn;
window.sbFillRememberedLogin = sbFillRememberedLogin;