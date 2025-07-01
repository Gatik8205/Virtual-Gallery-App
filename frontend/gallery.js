if (!isLoggedIn()) window.location.href = "login.html";

const gallery = document.getElementById("gallery");
const logoutBtn = document.getElementById("logoutBtn");
const mediaItems = []; // Stores all media elements for navigation
let currentIndex = 0;  // Tracks current fullscreen item

// Logout
logoutBtn.addEventListener("click", () => {
  logout();
  window.location.href = "login.html?loggedout=true";
});

// Fetch and display gallery items
fetch("https://virtual-gallery-app.onrender.com/images", {
  headers: { "Authorization": getToken() }
})
.then(res => res.json())
.then(images => {
  images.forEach((item, index) => {
    const wrapper = document.createElement("div");
    wrapper.classList.add("image-item");

    const url = item.url;
    const ext = url.split('.').pop().toLowerCase();

    let media;
    if (["mp4","webm","ogg"].includes(ext)) {
      media = document.createElement("video");
      media.src = item.url;
      media.controls = true;
    } else {
      media = document.createElement("img");
      media.src = url;
      media.alt = "Uploaded Image";
    }

    // Delete button
    const deleteBtn = document.createElement("button");
    deleteBtn.classList.add("delete-btn");
    deleteBtn.innerHTML = "🗑";
    deleteBtn.onclick = async () => {
      const res = await fetch(`https://virtual-gallery-app.onrender.com/image/${item.id}`, {
        method: "DELETE",
        headers: { "Authorization": getToken() }
      });
      const result = await res.json();
      if (result.message) {
        showMessage("✅ Deleted!", "success");
        wrapper.remove();
      } else {
        showMessage(result.error || "Deletion Failed.", "error");
      }
    };

    // Fullscreen button
    const fullscreenBtn = document.createElement("button");
    fullscreenBtn.classList.add("fullscreen-btn");
    fullscreenBtn.innerHTML = "⛶";
    fullscreenBtn.onclick = (e) => {
      e.stopPropagation();
      currentIndex = index;
      openFullscreen(media);
    };

    wrapper.appendChild(media);
    wrapper.appendChild(deleteBtn);
    wrapper.appendChild(fullscreenBtn);
    gallery.appendChild(wrapper);

    mediaItems.push(media); // Add to navigation array
  });
})
.catch(err => {
  console.error("Error loading gallery:", err);
  showMessage("Error loading gallery", "error");
});

// Fullscreen with navigation
function openFullscreen(media) {
  const overlay = document.createElement("div");
  overlay.classList.add("fullscreen-overlay");

  const clonedMedia = media.cloneNode(true);
  clonedMedia.classList.add("fullscreen-media");

  // Navigation buttons
  const prevBtn = document.createElement("button");
  prevBtn.classList.add("nav-btn", "prev-btn");
  prevBtn.innerHTML = "◀";
  prevBtn.onclick = (e) => {
    e.stopPropagation();
    navigate(-1);
  };

  const nextBtn = document.createElement("button");
  nextBtn.classList.add("nav-btn", "next-btn");
  nextBtn.innerHTML = "▶";
  nextBtn.onclick = (e) => {
    e.stopPropagation();
    navigate(1);
  };

  // Keyboard navigation
  document.addEventListener("keydown", handleKeyPress);

  function navigate(direction) {
    currentIndex = (currentIndex + direction + mediaItems.length) % mediaItems.length;
    clonedMedia.replaceWith(mediaItems[currentIndex].cloneNode(true));
  }

  function handleKeyPress(e) {
    if (e.key === "ArrowLeft") navigate(-1);
    if (e.key === "ArrowRight") navigate(1);
    if (e.key === "Escape") overlay.remove();
  }

  overlay.appendChild(prevBtn);
  overlay.appendChild(clonedMedia);
  overlay.appendChild(nextBtn);

  overlay.onclick = () => {
    document.removeEventListener("keydown", handleKeyPress);
    overlay.remove();
  };

  document.body.appendChild(overlay);
}

// Helper: Show toast messages
function showMessage(text, type = 'success') {
  const box = document.getElementById('messageBox');
  box.textContent = text;
  box.className = `message-box ${type}`;
  setTimeout(() => box.classList.add('hidden'), 3000);
  box.classList.remove('hidden');
}