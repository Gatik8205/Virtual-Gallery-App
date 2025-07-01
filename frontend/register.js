function showMessage(text, type = 'success') {
    const box = document.getElementById('messageBox');
    box.textContent = text;
    box.className = `message-box ${type}`;
    setTimeout(() => box.classList.add('hidden'), 3000);
    box.classList.remove('hidden');
  }

  document.getElementById("registerForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const res = await fetch("https://virtual-gallery-app.onrender.com/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password })
    });

    const data = await res.json();
    if (data.message) {
      showMessage("✅Registered Successfully","success");
      window.location.href = "login.html";
    } else {
       showMessage(data.error || "Registration failed","error");
    }
  });

    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');

    togglePassword.addEventListener('click', () => {
      const type = passwordInput.type === 'password' ? 'text' : 'password';
      passwordInput.type = type;
      togglePassword.textContent = type === 'password' ? '👁️' : '🙈';
    });