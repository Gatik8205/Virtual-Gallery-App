require("dotenv").config();
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const User = require('./backend/models/User');
const Image = require('./backend/models/Image');
const { cloudinary, storage } = require('./backend/cloudinary');

const upload = multer({ storage });
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// 🔥 Serve frontend static files
app.use(express.static(path.join(__dirname, 'frontend')));

// 🔒 Auth middleware
function authMiddleware(req, res, next) {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ error: 'Missing token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// 🔐 Admin middleware
function adminMiddleware(req, res, next) {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ error: 'No token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.userId !== process.env.ADMIN_USER_ID) {
      return res.status(403).json({ error: 'Not an admin' });
    }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// 🌐 MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB Error:', err));

// 📩 Nodemailer setup
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// ==================== ROUTES ====================

// Home redirects to login
app.get('/', (req, res) => {
  res.redirect('/login.html');
});

// Serve reset-password.html directly (important for ?token links)
app.get('/reset-password.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'reset-password.html'));
});

// 🔐 Auth Routes
app.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);
    await User.create({ name, email, password: hashed });
    res.json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Incorrect password' });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// 📥 Upload
app.post('/upload', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const newMedia = await Image.create({
      url: req.file.path,
      public_id: req.file.filename,
      uploadedBy: req.userId
    });
    res.json({ message: 'Upload successful', url: req.file.path });
  } catch (err) {
    res.status(500).json({ error: 'Upload failed' });
  }
});

// 🖼 Fetch images
app.get('/images', authMiddleware, async (req, res) => {
  try {
    const images = await Image.find({ uploadedBy: req.userId }).sort({ createdAt: -1 });
    const media = images.map(img => ({
      url: img.url,
      id: img._id,
      uploadedBy: img.uploadedBy
    }));
    res.json(media);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch images' });
  }
});

// ❌ Delete media
app.delete('/image/:id', authMiddleware, async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);
    if (!image) return res.status(404).json({ error: 'Not found' });
    if (image.uploadedBy.toString() !== req.userId) return res.status(403).json({ error: 'Forbidden' });

    await cloudinary.uploader.destroy(image.public_id);
    await Image.deleteOne({ _id: req.params.id });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Deletion failed' });
  }
});

// 🔐 Forgot Password
app.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const token = crypto.randomBytes(32).toString('hex');
    user.resetToken = token;
    user.resetTokenExpires = Date.now() + 3600000;
    await user.save();

    const resetLink = `${process.env.CLIENT_URL}/reset-password.html?token=${token}`;
    await transporter.sendMail({
      to: email,
      subject: 'Reset Your Password',
      html: `<h3>Click below to reset your password:</h3><p><a href="${resetLink}">${resetLink}</a></p>`
    });

    res.json({ message: 'Reset link sent' });
  } catch (err) {
    console.error("Reset Error",err);
    res.status(500).json({ error: 'Reset failed' });
  }
});

// 🔑 Reset Password
app.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpires: { $gt: Date.now() }
    });
    if (!user) return res.status(400).json({ error: 'Invalid or expired token' });

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetToken = undefined;
    user.resetTokenExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (err) {
    res.status(500).json({ error: 'Reset failed' });
  }
});

// 👁 Admin view
app.get('/admin/uploads', adminMiddleware, async (req, res) => {
  try {
    const uploads = await Image.find().populate('uploadedBy', 'name email');
    res.json(uploads);
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch uploads' });
  }
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
