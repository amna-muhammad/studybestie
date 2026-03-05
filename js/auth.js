const ACCOUNTS_KEY = 'studyBestie_accounts';
const SESSION_KEY = 'studyBestie_session';

function notifyAuth(title, message) {
  if (typeof window !== 'undefined' && typeof window.showAuthPopup === 'function') {
    window.showAuthPopup(title, message);
    return;
  }
  alert(message);
}

function normalizeKey(value) {
  const v = String(value || '').trim();
  if (v.includes('@')) return v.toLowerCase();
  return v.replace(/\D/g, '');
}

function getAccounts() {
  try {
    return JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveAccounts(accs) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accs));
}

function login() {
  const emailOrPhone = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const accounts = getAccounts();

  if (!emailOrPhone || !password) {
    notifyAuth('Missing details', 'Please enter both email/phone and password.');
    return;
  }

  const typedKey = normalizeKey(emailOrPhone);
  const user = accounts.find(a =>
    (a.email && normalizeKey(a.email) === typedKey) || (a.phone && normalizeKey(a.phone) === typedKey)
  );

  if (!user) {
    notifyAuth('Account not found', 'No account matches that email/phone. Create an account first.');
    return;
  }

  if (user.password !== password) {
    notifyAuth('Incorrect password', 'That password is not correct. Please try again.');
    return;
  }

  localStorage.setItem(SESSION_KEY, JSON.stringify({
    name: user.name,
    email: user.email || '',
    phone: user.phone || ''
  }));

  window.location.href = 'dashboard.html';
}

// optional helper: logout
function logout() {
  localStorage.removeItem(SESSION_KEY);
  window.location.href = 'index.html';
}

window.login = login;
window.logout = logout;
