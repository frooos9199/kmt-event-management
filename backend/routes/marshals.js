const express = require('express');
const router = express.Router();
const Marshal = require('../models/Marshal');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// إعداد multer لرفع الصور
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../uploads/marshals');
    // التأكد من وجود المجلد
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // إنشاء اسم فريد للملف
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'marshal-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB حد أقصى
  },
  fileFilter: function (req, file, cb) {
    // قبول الصور فقط
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('يُسمح بالصور فقط'));
    }
  }
});

// الحصول على جميع المارشال
router.get('/', async (req, res) => {
  try {
    const marshals = await Marshal.find().select('-password');
    res.json(marshals);
  } catch (error) {
    res.status(500).json({ message: 'خطأ في جلب بيانات المارشال', error: error.message });
  }
});

// الحصول على مارشال واحد
router.get('/:id', async (req, res) => {
  try {
    const marshal = await Marshal.findById(req.params.id).select('-password');
    if (!marshal) {
      return res.status(404).json({ message: 'المارشال غير موجود' });
    }
    res.json(marshal);
  } catch (error) {
    res.status(500).json({ message: 'خطأ في جلب بيانات المارشال', error: error.message });
  }
});

// إضافة مارشال جديد (للمدير)
router.post('/register', async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      experience,
      specializations,
      certifications,
      availability,
      notes
    } = req.body;

    // التحقق من وجود الإيميل
    const existingMarshal = await Marshal.findOne({ email });
    if (existingMarshal) {
      return res.status(400).json({ message: 'الإيميل مستخدم مسبقاً' });
    }

    // تشفير كلمة المرور
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // إنشاء مارشال جديد
    const newMarshal = new Marshal({
      name: name || '',
      email: email || '',
      password: hashedPassword,
      phone: phone || '',
      experience: experience || 'مبتدئ',
      specializations: specializations || [],
      certifications: certifications || [],
      availability: availability || 'متاح',
      personalInfo: {
        dateOfBirth: '',
        nationalId: '',
        address: ''
      },
      emergencyContact: {
        name: '',
        phone: '',
        relationship: ''
      },
      notes: notes || '',
      rating: 0,
      totalRaces: 0,
      status: 'نشط'
    });

    const savedMarshal = await newMarshal.save();
    
    // إرجاع البيانات بدون كلمة المرور
    const marshalResponse = savedMarshal.toObject();
    delete marshalResponse.password;
    
    res.status(201).json({
      message: 'تم تسجيل المارشال بنجاح',
      marshal: marshalResponse
    });
  } catch (error) {
    res.status(500).json({ message: 'خطأ في تسجيل المارشال', error: error.message });
  }
});

// تحديث بيانات المارشال
router.put('/:id', async (req, res) => {
  try {
    console.log('PUT Request received for marshal:', req.params.id);
    console.log('Request body:', req.body);
    
    const {
      name,
      email,
      phone,
      experience,
      specializations,
      certifications,
      availability,
      personalInfo,
      emergencyContact,
      notes,
      status,
      profileImage
    } = req.body;

    // إعداد البيانات للتحديث
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (experience !== undefined) updateData.experience = experience;
    if (specializations !== undefined) updateData.specializations = specializations;
    if (certifications !== undefined) updateData.certifications = certifications;
    if (availability !== undefined) updateData.availability = availability;
    if (personalInfo !== undefined) updateData.personalInfo = personalInfo;
    if (emergencyContact !== undefined) updateData.emergencyContact = emergencyContact;
    if (notes !== undefined) updateData.notes = notes;
    if (status !== undefined) updateData.status = status;
    if (profileImage !== undefined) updateData.profileImage = profileImage;

    // التحقق من وجود إيميل مكرر (إذا تم تغيير الإيميل)
    if (email) {
      const existingMarshal = await Marshal.findOne({ 
        email, 
        _id: { $ne: req.params.id } 
      });
      if (existingMarshal) {
        return res.status(400).json({ message: 'الإيميل مستخدم مسبقاً' });
      }
    }

    const updatedMarshal = await Marshal.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedMarshal) {
      return res.status(404).json({ message: 'المارشال غير موجود' });
    }

    res.json({
      message: 'تم تحديث بيانات المارشال بنجاح',
      marshal: updatedMarshal
    });
  } catch (error) {
    console.error('Error updating marshal:', error);
    res.status(500).json({ message: 'خطأ في تحديث بيانات المارشال', error: error.message });
  }
});

// تغيير كلمة المرور
router.put('/:id/password', async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: 'كلمة المرور مطلوبة' });
    }

    // تشفير كلمة المرور الجديدة
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const updatedMarshal = await Marshal.findByIdAndUpdate(
      req.params.id,
      { password: hashedPassword },
      { new: true }
    ).select('-password');

    if (!updatedMarshal) {
      return res.status(404).json({ message: 'المارشال غير موجود' });
    }

    res.json({ message: 'تم تغيير كلمة المرور بنجاح' });
  } catch (error) {
    res.status(500).json({ message: 'خطأ في تغيير كلمة المرور', error: error.message });
  }
});

// حذف مارشال
router.delete('/:id', async (req, res) => {
  try {
    const deletedMarshal = await Marshal.findByIdAndDelete(req.params.id);
    
    if (!deletedMarshal) {
      return res.status(404).json({ message: 'المارشال غير موجود' });
    }

    res.json({ message: 'تم حذف المارشال بنجاح' });
  } catch (error) {
    res.status(500).json({ message: 'خطأ في حذف المارشال', error: error.message });
  }
});

// رفع صورة المارشال
router.post('/:id/upload-image', upload.single('profileImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'لم يتم رفع أي صورة' });
    }

    const marshal = await Marshal.findById(req.params.id);
    if (!marshal) {
      return res.status(404).json({ message: 'المارشال غير موجود' });
    }

    // حذف الصورة القديمة إن وجدت
    if (marshal.profileImage) {
      const oldImagePath = path.join(__dirname, '../uploads/marshals', marshal.profileImage);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    // تحديث مسار الصورة الجديدة
    marshal.profileImage = req.file.filename;
    await marshal.save();

    res.json({
      message: 'تم رفع الصورة بنجاح',
      imageUrl: `/uploads/marshals/${req.file.filename}`
    });
  } catch (error) {
    res.status(500).json({ message: 'خطأ في رفع الصورة', error: error.message });
  }
});

module.exports = router;