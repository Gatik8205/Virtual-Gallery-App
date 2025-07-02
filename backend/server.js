require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');

const User = require('./models/User');
const Image = require('./models/Image');
const { cloudinary, storage } = require('./cloudinary');
const nodemailer= require('nodemailer')
const crypto= require('crypto');

const upload = multer({ storage });
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname,'frontend')));

app.get('/', (req, res) => {
   res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => console.error('❌ MongoDB Error:', err));

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

app.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email already exists' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed });
    res.json({ message: 'User registered successfully' });
  } catch (err) {
    console.error("Registration Error:", err);
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

app.post('/upload', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    if(!req.file){
      console.error("No file received in upload.");
      return res.status(400).json({error:"No file uploaded"});
    }

    console.log("File Uploaded",req.file);

    const newImage = await Image.create({
      url: req.file.path,
      public_id: req.file.filename,
      uploadedBy: req.userId
    });
    res.json({ message: 'Upload successful', url: req.file.path });
  } catch (err) {
    console.error("Upload failed:",err);
    res.status(500).json({ error: 'Upload failed',details:err.message });
  }
});

app.get('/images',authMiddleware, async (req, res) => {
  try {
    const images = await Image.find({uploadedBy: req.userId}).sort({ createdAt: -1 });
    const imageUrls = images.map(img => ({
      url: img.url,
      id: img._id,
      uploadedBy: img.uploadedBy
    }));
    res.json(imageUrls);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch images' });
  }
});

app.delete('/image/:id', authMiddleware, async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);
    console.log("🧾 Image:", image);
    console.log("🔐 Request User ID:", req.userId);

    if (!image) return res.status(404).json({ error: 'Image not found' });

    if (!image.uploadedBy || image.uploadedBy.toString() !== req.userId) {
      console.log("⛔ Not authorized to delete this image");
      return res.status(403).json({ error: 'Not authorized' });
    }

    await cloudinary.uploader.destroy(image.public_id);
    await Image.deleteOne({_id: req.params.id});
    res.json({ message: 'Image deleted successfully' });

  } catch (err) {
    console.error("❌ Delete Error:", err);
    res.status(500).json({ error: 'Deletion failed' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}/`);
});

function adminMiddleware(req,res,next){
  const token =req.headers.authorization;
  if(!token) return res.status(401).json({error: 'No token'});

  try{
    const decoded= jwt.verify(token,process.env.JWT_SECRET);

    const ADMIN_USER_ID= "684734e26c43a19ebfbb571e";

    if(decoded.userId !== ADMIN_USER_ID){
      return res.status(403).json({error:'Not an admin'});
    }

    req.userId= decoded.userId;
    next();
  }catch(err){
    return res.status(401).json({error:'Invalid token'})
  }
}

app.get('/admin/upload', adminMiddleware,async (req,res) =>{
  try{
    const upload= await Image.find()
    .sort({createdAt:-1})
    .populate('uploadedBy','name email');

    res.status(200).json(upload);
  }catch(err){
    console.error("Admin Upload Fetch Error:",err);
    res.status(500).json({error:'Could not fetch uploads'});
  }
})

app.post('/forgot-password', async (req,res) => {
  const {email} = req.body;
  try{
    const user= await User.findOne({email});
    if(!user) return res.status(404).json({error:'User not found'});

    const token= crypto.randomBytes(32).toString('hex');
    user.resetToken=token;
    user.resetTokenExpiry= Date.now() + 1000*60*15;
    await user.save();

    const resetURL= `https://virtual-gallery-app.onrender.com/reset-password.html?token=${token}`;

    const transporter = nodemailer.createTransport({
      service:'gmail',
      auth:{
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    await transporter.sendMail({
      to :email,
      from: process.env.EMAIL,
      subject: 'Reset Your Password',
      html: `<p>Click On the link to reset your password:</p><a href="${resetURL}">${resetURL}</a>`
    });

    res.json({message:'Reset Link sent to your email'});
  }catch(err){
    console.error("Forgot Your Password");
    res.status(500).json({error:'Server Error'});
  }
});

app.post('/reset-password',async(req,res)=>{
  const{token,newPassword}=req.body;
  try{
    const user= await User.findOne({
      resetToken: token,
      resetTokenExpiry: {$gt:Date.now()}
    });
    if(!user) return res.status(400).json({error:'Invalid or expired token'});

    const hashed= await bcrypt.hash(newPassword, 10);
    user.password=hashed;
    user.resetToken=undefined;
    user.resetTokenExpiry=undefined;
    await user.save();

    res.json({message:'Password Reset Successfull!'});
  }catch(err){
    console.error('Reset Password Error:',err);
    res.status(500).json({error:'Server Error'});
  }
});