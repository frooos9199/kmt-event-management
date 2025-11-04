const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'eventpro_secret_key_2024';

// تسجيل حساب جديد
router.post('/register', async (req, res) => {
  try {
    const { fullName, email, password, phone, userType } = req.body;

    // التحقق من وجود المستخدم
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'البريد الإلكتروني مسجل مسبقاً' });
    }

    // إنشاء مستخدم جديد
    const user = new User({
      fullName,
      email,
      password,
      phone,
      userType
    });

    await user.save();

    // إنشاء JWT token
    const token = jwt.sign(
      { 
        userId: user._id, 
        userType: user.userType 
      }, 
      JWT_SECRET, 
      { expiresIn: '7d' }
    );

    const responseUser = {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      userType: user.userType,
      accountStatus: user.accountStatus
    };

    // إضافة رقم المارشال إذا كان مارشال
    if (user.userType === 'marshall' && user.marshallInfo?.marshalId) {
      responseUser.marshalId = user.marshallInfo.marshalId;
    }

    res.status(201).json({
      message: 'تم إنشاء الحساب بنجاح',
      token,
      user: responseUser
    });

  } catch (error) {
    console.error('خطأ في التسجيل:', error);
    res.status(500).json({ message: 'حدث خطأ في الخادم' });
  }
});

// تسجيل الدخول
router.post('/login', async (req, res) => {
  try {
    console.log('🔑 Login attempt:', req.body);
    const { email, password } = req.body;

    // البحث عن المستخدم
    const user = await User.findOne({ email });
    console.log('👤 User found:', user ? 'Yes' : 'No');
    
    if (!user) {
      return res.status(400).json({ message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
    }

    // التحقق من كلمة المرور (مؤقت - للتجربة)
    let isPasswordValid = false;
    
    console.log('🔐 Password check:', user.password, '===', password);
    
    if (user.password === password) {
      // كلمة مرور غير مشفرة (للتجربة)
      isPasswordValid = true;
      console.log('✅ Plain password match');
    } else {
      // كلمة مرور مشفرة
      isPasswordValid = await user.comparePassword(password);
      console.log('🔒 Encrypted password result:', isPasswordValid);
    }
    
    if (!isPasswordValid) {
      console.log('❌ Password invalid');
      return res.status(400).json({ message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
    }

    console.log('🎉 Login successful');
    
    // إنشاء JWT token
    const token = jwt.sign(
      { 
        userId: user._id, 
        userType: user.userType 
      }, 
      JWT_SECRET, 
      { expiresIn: '7d' }
    );

    const responseUser = {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      userType: user.userType,
      accountStatus: user.accountStatus
    };

    // إضافة رقم المارشال إذا كان مارشال
    if (user.userType === 'marshall' && user.marshallInfo?.marshalId) {
      responseUser.marshalId = user.marshallInfo.marshalId;
    }

    res.json({
      message: 'تم تسجيل الدخول بنجاح',
      token,
      user: responseUser
    });

  } catch (error) {
    console.error('خطأ في تسجيل الدخول:', error);
    res.status(500).json({ message: 'حدث خطأ في الخادم' });
  }
});

// التحقق من صحة الـ token
router.get('/verify', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'لا يوجد رمز مصادقة' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'المستخدم غير موجود' });
    }

    const responseUser = {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      userType: user.userType,
      accountStatus: user.accountStatus
    };

    // إضافة رقم المارشال إذا كان مارشال
    if (user.userType === 'marshall' && user.marshallInfo?.marshalId) {
      responseUser.marshalId = user.marshallInfo.marshalId;
    }

    res.json({
      valid: true,
      user: responseUser
    });

  } catch (error) {
    res.status(401).json({ message: 'رمز المصادقة غير صالح' });
  }
});

module.exports = router;