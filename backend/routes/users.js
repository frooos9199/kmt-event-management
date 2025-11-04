const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

// الحصول على بروفايل المستخدم
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId || req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'المستخدم غير موجود' });
    }

    res.json({ user });
  } catch (error) {
    console.error('خطأ في جلب البروفايل:', error);
    res.status(500).json({ message: 'حدث خطأ في الخادم' });
  }
});

// جلب جميع المارشال (للمدراء فقط)
router.get('/marshals', auth, async (req, res) => {
  try {
    // التحقق من أن المستخدم مدير
    if (req.user.userType !== 'manager') {
      return res.status(403).json({ message: 'غير مسموح لك بهذا الإجراء' });
    }

    const marshals = await User.find({ userType: 'marshall' })
      .select('-password')
      .sort({ createdAt: -1 });

    res.json(marshals);
  } catch (error) {
    console.error('خطأ في جلب المارشال:', error);
    res.status(500).json({ message: 'حدث خطأ في الخادم' });
  }
});

// تحديث البروفايل الشخصي
router.put('/profile', auth, async (req, res) => {
  try {
    const userId = req.user.userId || req.user._id;
    const updateData = req.body;

    console.log('تحديث الملف الشخصي للمستخدم:', userId);
    console.log('البيانات المرسلة:', updateData);

    // حساب العمر إذا تم تحديث تاريخ الميلاد
    if (updateData.marshallInfo?.dateOfBirth) {
      const birthDate = new Date(updateData.marshallInfo.dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      if (!updateData.marshallInfo.age) {
        updateData.marshallInfo.age = age;
      }
    }

    // بناء البيانات للتحديث بطريقة آمنة
    const updateQuery = {};
    
    // تحديث الحقول الأساسية
    if (updateData.fullName) updateQuery.fullName = updateData.fullName;
    if (updateData.phone) updateQuery.phone = updateData.phone;
    if (updateData.email) updateQuery.email = updateData.email;
    
    // تحديث حقول marshallInfo بشكل منفصل لتجنب محو البيانات الموجودة
    if (updateData.marshallInfo) {
      for (const [key, value] of Object.entries(updateData.marshallInfo)) {
        updateQuery[`marshallInfo.${key}`] = value;
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateQuery },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'المستخدم غير موجود' });
    }

    console.log('تم تحديث المستخدم بنجاح');

    res.json({
      message: 'تم تحديث البروفايل بنجاح',
      user: updatedUser
    });

  } catch (error) {
    console.error('خطأ في تحديث البروفايل:', error);
    res.status(500).json({ message: 'حدث خطأ في الخادم' });
  }
});

// إرسال البروفايل للمراجعة
router.post('/profile/submit', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const user = await User.findByIdAndUpdate(
      userId,
      { 
        'accountStatus.profileStatus': 'pending'
      },
      { new: true }
    ).select('-password');

    res.json({
      message: 'تم إرسال البروفايل للمراجعة بنجاح',
      user
    });

  } catch (error) {
    console.error('خطأ في إرسال البروفايل:', error);
    res.status(500).json({ message: 'حدث خطأ في الخادم' });
  }
});

// اعتماد/رفض البروفايل (للمدراء فقط)
router.post('/profile/:userId/review', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { action, rejectionReason } = req.body; // action: 'approve' or 'reject'

    // التحقق من أن المستخدم مدير
    if (req.user.userType !== 'manager') {
      return res.status(403).json({ message: 'غير مسموح لك بهذا الإجراء' });
    }

    const updateData = {
      'accountStatus.profileStatus': action === 'approve' ? 'approved' : 'rejected',
      'accountStatus.approvedBy': req.user.userId,
      'accountStatus.approvedAt': new Date()
    };

    if (action === 'reject' && rejectionReason) {
      updateData['accountStatus.rejectionReason'] = rejectionReason;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true }
    ).select('-password');

    res.json({
      message: action === 'approve' ? 'تم اعتماد البروفايل بنجاح' : 'تم رفض البروفايل',
      user: updatedUser
    });

  } catch (error) {
    console.error('خطأ في مراجعة البروفايل:', error);
    res.status(500).json({ message: 'حدث خطأ في الخادم' });
  }
});

// الحصول على قائمة العمال (للمدراء)
router.get('/workers', auth, async (req, res) => {
  try {
    // التحقق من أن المستخدم مدير
    if (req.user.userType !== 'manager') {
      return res.status(403).json({ message: 'غير مسموح لك بهذا الإجراء' });
    }

    const { status, page = 1, limit = 10 } = req.query;
    const query = { userType: 'worker' };

    if (status) {
      query['accountStatus.profileStatus'] = status;
    }

    const workers = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      workers,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });

  } catch (error) {
    console.error('خطأ في جلب العمال:', error);
    res.status(500).json({ message: 'حدث خطأ في الخادم' });
  }
});

// جلب جميع المارشال (للمدير)
router.get('/marshals', auth, async (req, res) => {
  try {
    if (req.user.userType !== 'manager') {
      return res.status(403).json({ message: 'غير مصرح لك بالوصول' });
    }

    const marshals = await User.find({ 
      userType: 'marshall',
      accountStatus: 'approved' 
    }).select('-password');

    res.json(marshals);

  } catch (error) {
    console.error('خطأ في جلب المارشال:', error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
});

// جلب مارشال محدد
router.get('/marshal/:id', auth, async (req, res) => {
  try {
    if (req.user.userType !== 'manager') {
      return res.status(403).json({ message: 'غير مصرح لك بالوصول' });
    }

    const marshal = await User.findById(req.params.id).select('-password');
    
    if (!marshal || marshal.userType !== 'marshall') {
      return res.status(404).json({ message: 'المارشال غير موجود' });
    }

    res.json(marshal);

  } catch (error) {
    console.error('خطأ في جلب المارشال:', error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
});

module.exports = router;