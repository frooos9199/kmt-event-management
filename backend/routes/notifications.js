const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// جلب إشعارات المستخدم
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('notifications.raceId', 'title titleEnglish startDate')
      .select('notifications');

    if (!user) {
      return res.status(404).json({ message: 'المستخدم غير موجود' });
    }

    // ترتيب الإشعارات حسب التاريخ (الأحدث أولاً)
    const sortedNotifications = user.notifications.sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );

    res.json(sortedNotifications);
  } catch (error) {
    console.error('خطأ في جلب الإشعارات:', error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
});

// تحديد إشعار كمقروء
router.put('/:notificationId/read', auth, async (req, res) => {
  try {
    const { notificationId } = req.params;
    
    const user = await User.findOneAndUpdate(
      { _id: req.user._id, 'notifications._id': notificationId },
      { $set: { 'notifications.$.isRead': true } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'الإشعار غير موجود' });
    }

    res.json({ message: 'تم تحديث الإشعار' });
  } catch (error) {
    console.error('خطأ في تحديث الإشعار:', error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
});

// تحديد جميع الإشعارات كمقروءة
router.put('/mark-all-read', auth, async (req, res) => {
  try {
    await User.findByIdAndUpdate(
      req.user._id,
      { $set: { 'notifications.$[].isRead': true } },
      { new: true }
    );

    res.json({ message: 'تم تحديث جميع الإشعارات' });
  } catch (error) {
    console.error('خطأ في تحديث الإشعارات:', error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
});

// حذف إشعار
router.delete('/:notificationId', auth, async (req, res) => {
  try {
    const { notificationId } = req.params;
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { notifications: { _id: notificationId } } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'الإشعار غير موجود' });
    }

    res.json({ message: 'تم حذف الإشعار' });
  } catch (error) {
    console.error('خطأ في حذف الإشعار:', error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
});

// إحصائيات الإشعارات
router.get('/stats', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('notifications');
    
    if (!user) {
      return res.status(404).json({ message: 'المستخدم غير موجود' });
    }

    const total = user.notifications.length;
    const unread = user.notifications.filter(n => !n.isRead).length;
    
    res.json({
      total,
      unread,
      read: total - unread
    });
  } catch (error) {
    console.error('خطأ في جلب إحصائيات الإشعارات:', error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
});

module.exports = router;