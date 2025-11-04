const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// تقديم الملفات الثابتة (الصور)
app.use('/uploads', express.static('uploads'));

// Database connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/eventpro';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ تم الاتصال بقاعدة البيانات بنجاح'))
  .catch(err => console.error('❌ خطأ في الاتصال بقاعدة البيانات:', err));

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Kuwait Motor Town Event Management API 🏁',
    version: '1.0.0',
    status: 'running',
    environment: process.env.NODE_ENV || 'development'
  });
});

// User routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/events', require('./routes/events'));
app.use('/api/clubs', require('./routes/clubs'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/setup', require('./routes/setup'));
app.use('/api/races', require('./routes/races'));
app.use('/api/stats', require('./routes/stats'));
app.use('/api/marshals', require('./routes/marshals'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/notifications', require('./routes/notifications'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'حدث خطأ في الخادم' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 الخادم يعمل على البورت ${PORT}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
});

module.exports = app;