(function () {
  if (localStorage.getItem('chat_token')) {
    window.location.href = '/chat.html';
    return;
  }

  const loginForm = document.getElementById('loginForm');
  const cpForm = document.getElementById('changePwForm');
  const showCpBtn = document.getElementById('showChangePw');
  const showLoginBtn = document.getElementById('showLogin');

  // ---- switch between Login and Change Password ----
  showCpBtn.addEventListener('click', () => {
    loginForm.classList.remove('is-active');
    cpForm.classList.add('is-active');
  });
  showLoginBtn.addEventListener('click', () => {
    cpForm.classList.remove('is-active');
    loginForm.classList.add('is-active');
  });

  // ---- eye icon: show/hide password on every pw field ----
  document.querySelectorAll('.pw-toggle').forEach((btn) => {
    btn.addEventListener('click', () => {
      const input = document.getElementById(btn.dataset.target);
      const isHidden = input.type === 'password';
      input.type = isHidden ? 'text' : 'password';
      btn.querySelector('.eye-open').hidden = isHidden;
      btn.querySelector('.eye-closed').hidden = !isHidden;
    });
  });

  // ---- LOGIN ----
  const errorEl = document.getElementById('loginError');
  const loginBtn = document.getElementById('loginBtn');

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorEl.textContent = '';
    loginBtn.disabled = true;
    const originalLabel = loginBtn.textContent;
    loginBtn.innerHTML = '<span class="btn-spinner"></span>';

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();

      if (!res.ok) {
        errorEl.textContent = data.message || 'Login fail ho gaya';
        return;
      }

      localStorage.setItem('chat_token', data.token);
      localStorage.setItem('chat_username', data.username);
      localStorage.setItem('chat_otherUser', data.otherUser || '');
      window.location.href = '/chat.html';
    } catch (err) {
      errorEl.textContent = 'Server se connect nahi ho saka. Internet check karo.';
    } finally {
      loginBtn.disabled = false;
      loginBtn.textContent = originalLabel;
    }
  });

  // ---- CHANGE PASSWORD ----
  const cpError = document.getElementById('cpError');
  const cpSuccess = document.getElementById('cpSuccess');
  const cpBtn = document.getElementById('cpBtn');

  cpForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    cpError.textContent = '';
    cpSuccess.textContent = '';

    const username = document.getElementById('cpUsername').value.trim();
    const currentPassword = document.getElementById('cpCurrent').value;
    const newPassword = document.getElementById('cpNew').value;
    const confirmPassword = document.getElementById('cpConfirm').value;

    if (newPassword !== confirmPassword) {
      cpError.textContent = 'Naya password dono jagah same nahi hai';
      return;
    }
    if (newPassword.length < 6) {
      cpError.textContent = 'Naya password kam se kam 6 characters ka ho';
      return;
    }

    cpBtn.disabled = true;
    const originalLabel = cpBtn.textContent;
    cpBtn.innerHTML = '<span class="btn-spinner"></span>';

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, currentPassword, newPassword })
      });
      const data = await res.json();

      if (!res.ok) {
        cpError.textContent = data.message || 'Password update nahi ho saka';
        return;
      }

      cpSuccess.textContent = 'Password update ho gaya! Ab login karo.';
      cpForm.reset();
      setTimeout(() => {
        cpForm.classList.remove('is-active');
        loginForm.classList.add('is-active');
        cpSuccess.textContent = '';
      }, 1500);
    } catch (err) {
      cpError.textContent = 'Server se connect nahi ho saka. Internet check karo.';
    } finally {
      cpBtn.disabled = false;
      cpBtn.textContent = originalLabel;
    }
  });
})();