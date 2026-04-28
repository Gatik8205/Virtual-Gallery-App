function saveToken(token){
    localStorage.setItem("token",token);
}

function getToken(){
    return localStorage.getItem("token");
}

function isLoggedIn(){
    return !!getToken();
}

function logout(){
    localStorage.removeItem("token");
    showMessage("Loggedout Successfully","success");
    setTimeout(()=>{
      window.location.href="login.html?loggedout=true",1000
    });
}
function showMessage(text, type = 'success') {
  const box = document.getElementById('messageBox');
  box.textContent = text;
  box.className = `message-box ${type}`;
  
  setTimeout(() => {
    box.classList.add('hidden');
  }, 3000);
  
  box.classList.remove('hidden');
}
