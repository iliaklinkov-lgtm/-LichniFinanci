

const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const loginCard = document.getElementById('loginCard');
const signupCard = document.getElementById('signupCard');
const showSignupBtn = document.getElementById('showSignupBtn');
const showLoginBtn = document.getElementById('showLoginBtn');

function getUsers() {
  const users = localStorage.getItem('users');
  return users ? JSON.parse(users) : [];
}

function saveUsers(users) {
  localStorage.setItem('users', JSON.stringify(users));
}

function getLoggedInUser() {
  return localStorage.getItem('currentUser') ? JSON.parse(localStorage.getItem('currentUser')) : null;
}

function setLoggedInUser(user) {
  localStorage.setItem('currentUser', JSON.stringify(user));
}

function showMessage(elementId, message, type) {
  const messageEl = document.getElementById(elementId);
  messageEl.textContent = message;
  messageEl.className = `message show ${type}`;
  setTimeout(() => {
    messageEl.classList.remove('show');
  }, 4000);
}

showSignupBtn.addEventListener('click', (e) => {
  e.preventDefault();
  loginCard.classList.add('hidden');
  signupCard.classList.remove('hidden');
  document.getElementById('loginMessage').classList.remove('show');
});

showLoginBtn.addEventListener('click', (e) => {
  e.preventDefault();
  signupCard.classList.add('hidden');
  loginCard.classList.remove('hidden');
  document.getElementById('signupMessage').classList.remove('show');
});

signupForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const name = document.getElementById('signupName').value.trim();
  const email = document.getElementById('signupEmail').value.trim();
  const password = document.getElementById('signupPassword').value;
  const confirmPassword = document.getElementById('signupConfirmPassword').value;


  if (!name || !email || !password || !confirmPassword) {
    showMessage('signupMessage', 'Моля, попълни всички полета', 'error');
    return;
  }

  if (name.length < 2) {
    showMessage('signupMessage', 'Името трябва да бъде поне 2 символа', 'error');
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showMessage('signupMessage', 'Моля, въведи валиден email адрес', 'error');
    return;
  }

  if (password.length < 6) {
    showMessage('signupMessage', 'Паролата трябва да бъде поне 6 символа', 'error');
    return;
  }

  if (password !== confirmPassword) {
    showMessage('signupMessage', 'Паролите не съвпадат', 'error');
    return;
  }

  const users = getUsers();
  if (users.some(u => u.email === email)) {
    showMessage('signupMessage', 'Този email вече е регистриран', 'error');
    return;
  }

  const newUser = {
    id: Date.now(),
    name: name,
    email: email,
    password: password, // In production, this should be hashed!
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  saveUsers(users);

  showMessage('signupMessage', 'Акаунтът е успешно създаден! Пренасочване...', 'success');

  signupForm.reset();


  setTimeout(() => {
    signupCard.classList.add('hidden');
    loginCard.classList.remove('hidden');
    document.getElementById('loginEmail').focus();
  }, 2000);
});

loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  const rememberMe = document.getElementById('rememberMe').checked;

  if (!email || !password) {
    showMessage('loginMessage', 'Моля, попълни всички полета', 'error');
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showMessage('loginMessage', 'Моля, въведи валиден email адрес', 'error');
    return;
  }

  const users = getUsers();
  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    showMessage('loginMessage', 'Неправилен email или пароля', 'error');
    return;
  }

  // Store remember me preference
  if (rememberMe) {
    localStorage.setItem('rememberedEmail', email);
  } else {
    localStorage.removeItem('rememberedEmail');
  }

  const userSession = {
    id: user.id,
    name: user.name,
    email: user.email,
    loginTime: new Date().toISOString()
  };
  setLoggedInUser(userSession);

  showMessage('loginMessage', `Добре дошъл, ${user.name}!`, 'success');

  setTimeout(() => {
    window.location.href = './index.html';
  }, 1500);
});


window.addEventListener('DOMContentLoaded', () => {
  const loggedInUser = getLoggedInUser();
  if (loggedInUser) {
    window.location.href = './index.html';
    return;
  }

  const rememberedEmail = localStorage.getItem('rememberedEmail');
  if (rememberedEmail) {
    document.getElementById('loginEmail').value = rememberedEmail;
    document.getElementById('rememberMe').checked = true;
  }
});

const forgotPasswordLink = document.querySelector('.forgot-password');
if (forgotPasswordLink) {
  forgotPasswordLink.addEventListener('click', (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    
    if (!email) {
      showMessage('loginMessage', 'Моля, въведи емейл адреса си', 'error');
      return;
    }

    const users = getUsers();
    const user = users.find(u => u.email === email);

    if (!user) {
      showMessage('loginMessage', 'Email не е намерен в системата', 'error');
      return;
    }

    showMessage('loginMessage', `Линк за нулиране на парола е изпратен на ${email}`, 'success');
  });
}

