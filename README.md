
# 📸 Virtual Gallery App

A full-stack web application that allows users to upload, view, and manage their personal collection of images and videos. Built with Node.js, Express, MongoDB, Cloudinary, and plain HTML/CSS/JavaScript. Users can register, log in, and securely view only their own uploaded content.

---

## 🚀 Live Demo

- **Frontend**: [https://your-frontend-url.vercel.app](https://your-frontend-url.vercel.app)
- **Backend API**: [https://your-backend-url.onrender.com](https://your-backend-url.onrender.com)

---

## 🛠 Tech Stack

| Layer      | Tech Used                   |
|------------|-----------------------------|
| Frontend   | HTML, CSS, JavaScript        |
| Backend    | Node.js, Express.js          |
| Database   | MongoDB Atlas                |
| Hosting    | Cloudinary (Image/Video)     |
| Auth       | JWT (JSON Web Token)         |
| Deployment | Vercel (frontend), Render (backend) |

---

## 📁 Folder Structure

```
virtual-gallery-app/
│
├── backend/
│   ├── server.js
│   ├── cloudinary.js
│   ├── .env.example
│   ├── models/
│   └── package.json
│
├── frontend/
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   ├── gallery.html
│   ├── main.js, auth.js, gallery.css
│
├── README.md
└── .gitignore
```

---

## 🔒 Environment Variables

In `backend/.env` file:

```
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
```

Use `.env.example` to share config template.

---

## ✨ Features

- 🧑 User Registration & Login (JWT auth)
- 📤 Upload Images and Videos
- 🎞 Preview Fullscreen Media
- 🗑 Authenticated Delete Option
- 🧑‍💻 Each User Sees Only Their Own Media
- 💬 Toast Notifications for actions
- 🌈 Animated Gradient UI

---

## 🧪 Future Improvements

- Image/video captions & titles
- Profile settings
- Pagination/lazy load for gallery

---

## 🧑 Author

**Gatik Yadav**  
🔗 [LinkedIn](https://www.linkedin.com/in/gatik-yadav-449915259)  
💻 [GitHub](https://github.com/Gatik8205)

---

## 📄 License

MIT License – feel free to use and modify!
