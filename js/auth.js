const ACCOUNTS_KEY = 'studyBestie_accounts';
const SESSION_KEY = 'studyBestie_session';

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

  console.log('attempting login for', emailOrPhone);
  const accounts = getAccounts();
  console.log('stored accounts', accounts);

  if (!emailOrPhone || !password) {
    alert('Please enter both email/phone and password');
    return;
  }

  const user = accounts.find(a =>
    (a.email && a.email === emailOrPhone) || (a.phone && a.phone === emailOrPhone)
  );

  if (!user) {
    alert('No account found. Please create one.');
    return;
  }

  if (user.password !== password) {
    alert('Wrong password.');
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