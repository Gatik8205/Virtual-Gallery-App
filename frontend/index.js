if (window.location.search.includes("loggedout=true")) {
      showMessage("👋 Logged out successfully!", "success");
      window.history.replaceState(null, '', window.location.pathname);
    }
    if (!isLoggedIn()) {
      window.location.href = "login.html";
    }
    const logoutBtn = document.getElementById("logoutBtn");
    logoutBtn.addEventListener("click", logout);