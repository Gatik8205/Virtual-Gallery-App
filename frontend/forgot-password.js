const form = document.getElementById("forgotForm");
    const messageBox = document.getElementById("messageBox");

    function showMessage(msg, type = "success") {
      messageBox.textContent = msg;
      messageBox.className = `message-box ${type}`;
      setTimeout(() => messageBox.classList.add("hidden"), 3000);
      messageBox.classList.remove("hidden");
    }

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("email").value;

      const res = await fetch("https://virtual-gallery-app.onrender.com/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      const data = await res.json();
      if (data.message) {
        showMessage(data.message, "success");
      } else {
        showMessage(data.error || "Something went wrong", "error");
      }
    });