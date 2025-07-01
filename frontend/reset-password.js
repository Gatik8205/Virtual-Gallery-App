const form = document.getElementById("resetForm");
const messageBox = document.getElementById("messageBox");

function showMessage(msg, type = "success") {
    messageBox.textContent = msg;
    messageBox.className = `message-box ${type}`;
    setTimeout(() => messageBox.classList.add("hidden"), 3000);
    messageBox.classList.remove("hidden");
}

const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get("token");

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const newPassword = document.getElementById("newPassword").value;

    const res = await fetch("https://virtual-gallery-app.onrender.com//reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword })
      });

      const data = await res.json();
      if (data.message) {
        showMessage(data.message, "success");
        setTimeout(() => window.location.href = "login.html", 2000);
      } else {
        showMessage(data.error || "Reset failed", "error");
      }
    });

    // const togglePassword = document.getElementById('togglePassword');
    // const passwordInput = document.getElementById('password');
    // togglePassword.addEventListener('click', () => {
    //   const type = passwordInput.type === 'password' ? 'text' : 'password';
    //   passwordInput.type = type;
    //   togglePassword.textContent = type === 'password' ? '👁️' : '🙈';
    // });