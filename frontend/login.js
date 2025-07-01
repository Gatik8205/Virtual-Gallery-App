function showMessage(text, type = 'success') {
      const box = document.getElementById('messageBox');
      box.textContent = text;
      box.className = `message-box ${type}`;
      setTimeout(() => box.classList.add('hidden'), 3000);
      box.classList.remove('hidden');
    }

    document.getElementById("loginForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      const res = await fetch("https://virtual-gallery-app.onrender.com/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (data.token) {
        saveToken(data.token);
        showMessage("✅ Login Successful", "success");
        setTimeout(() => window.location.href = "index.html", 1500);
      } else {
        showMessage(data.error || "Login failed", "error");
      }
    });

    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');
    togglePassword.addEventListener('click', () => {
      const type = passwordInput.type === 'password' ? 'text' : 'password';
      passwordInput.type = type;
      togglePassword.textContent = type === 'password' ? '👁️' : '🙈';
    });

    if (window.location.search.includes("loggedout=true")) {
      showMessage("👋 Logged out successfully!", "success");
      window.history.replaceState(null, '', window.location.pathname);
    }