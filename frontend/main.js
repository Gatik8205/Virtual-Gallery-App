function handleLoginOrRegister(endpoint, payload, successRedirect, successMessage) {
  fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  })
    .then(res => res.json())
    .then(data => {
      if (data.token || data.message) {
        if (data.token) saveToken(data.token);
        showMessage(successMessage, "success");
        setTimeout(() => window.location.href = successRedirect, 1500);
      } else {
        showMessage(data.error || "Something went wrong", "error");
      }
    })
    .catch(() => showMessage("Network error", "error"));
}

const uploadArea = document.getElementById("uploadArea");
const fileInput = document.getElementById("fileInput");
const uploadBtn = document.getElementById("uploadBtn");
let selectedFile = null;

['dragenter', 'dragover', 'dragleave', 'drop'].forEach(event => {
  window.addEventListener(event, e => {
    e.preventDefault();
    e.stopPropagation();
  });
});

uploadArea.addEventListener("click", () => { fileInput.click(); });

uploadArea.addEventListener("dragover", (e) => {
  uploadArea.classList.add("dragover");
});
uploadArea.addEventListener("dragleave", () => {
  uploadArea.classList.remove("dragover");
});

uploadArea.addEventListener("drop", (e) => {
  const files = e.dataTransfer.files;
  if (files.length > 0) {
    selectedFile = files[0];
    previewSelectedFile(selectedFile);
  }
});

fileInput.addEventListener("change", () => {
  if (fileInput.files.length > 0) {
    selectedFile = fileInput.files[0];
    previewSelectedFile(selectedFile);
  }
});

uploadBtn.addEventListener("click", () => {
  if (!selectedFile) {
    return showMessage("⚠️ Please select a file first.", "error");
  }
  uploadImage(selectedFile);
});

function previewSelectedFile(file) {
  if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
    return showMessage("Only images or videos are allowed.", "error");
  }

  const ext = file.name.split('.').pop().toLowerCase();
  const container = document.createElement('div');

  if (['mp4', 'webm', 'ogg'].includes(ext)) {
    const video = document.createElement('video');
    video.src = URL.createObjectURL(file);
    video.controls = true;
    video.width = 300;
    container.appendChild(video);
  } else {
    const img = document.createElement('img');
    img.src = URL.createObjectURL(file);
    img.alt = "Preview";
    container.appendChild(img);
  }

  uploadArea.innerHTML = "";
  uploadArea.appendChild(container);
}

function uploadImage(file) {
  const formData = new FormData();
  formData.append("image", file);

  fetch("https://virtual-gallery-app.onrender.com/upload", {
    method: "POST",
    headers: {
      Authorization: getToken(),
    },
    body: formData,
  })
    .then(async (res) => {
      const contentType = res.headers.get("content-type");
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText);
      }
      return contentType.includes("application/json") ? res.json() : {};
    })
    .then((data) => {
      showMessage("✅ Upload successful!", "success");
      selectedFile = null;
      fileInput.value = "";
    })
    .catch(err => {
      console.error(err);
      showMessage("Upload failed.", "error");
    });
}

if (window.location.search.includes("loggedout=true")) {
  showMessage("LogOut Sucessfull", "success");
  window.history.replaceState(null, '', window.location.pathname);
}
