const express = require('express');
const Event = require('../models/Event');
const auth = require('../middleware/auth');
const router = express.Router();

// إنشاء حدث جديد (المدراء فقط)
router.post('/', auth, async (req, res) => {
  try {
    // التحقق من أن المستخدم مدير
    if (req.user.userType !== 'manager') {
      return res.status(403).json({ message: 'غير مسموح لك بإنشاء الأحداث' });
    }

    const eventData = {
      ...req.body,
      organizer: req.user.userId
    };

    const event = new Event(eventData);
    await event.save();

    res.status(201).json({
      message: 'تم إنشاء الحدث بنجاح',
      event
    });

  } catch (error) {
    console.error('خطأ في إنشاء الحدث:', error);
    res.status(500).json({ message: 'حدث خطأ في الخادم' });
  }
});

// الحصول على جميع الأحداث المنشورة (للعمال)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, eventType, city, startDate } = req.query;
    const query = { status: 'published' };

    // الفلترة
    if (eventType) query.eventType = eventType;
    if (city) query['location.city'] = city;
    if (startDate) {
      query['schedule.startDate'] = { $gte: new Date(startDate) };
    }

    const events = await Event.find(query)
      .populate('organizer', 'fullName clubInfo.clubName')
      .sort({ 'schedule.startDate': 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Event.countDocuments(query);

    res.json({
      events,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });

  } catch (error) {
    console.error('خطأ في جلب الأحداث:', error);
    res.status(500).json({ message: 'حدث خطأ في الخادم' });
  }
});

// الحصول على أحداث المدير
router.get('/my-events', auth, async (req, res) => {
  try {
    if (req.user.userType !== 'manager') {
      return res.status(403).json({ message: 'غير مسموح لك بهذا الإجراء' });
    }

    const { status, page = 1, limit = 10 } = req.query;
    const query = { organizer: req.user.userId };

    if (status) query.status = status;

    const events = await Event.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Event.countDocuments(query);

    res.json({
      events,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });

  } catch (error) {
    console.error('خطأ في جلب أحداث المدير:', error);
    res.status(500).json({ message: 'حدث خطأ في الخادم' });
  }
});

// الحصول على تفاصيل حدث محدد
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'fullName clubInfo.clubName email phone')
      .populate('applications.worker', 'fullName personalInfo.profileImage stats.averageRating');

    if (!event) {
      return res.status(404).json({ message: 'الحدث غير موجود' });
    }

    res.json({ event });

  } catch (error) {
    console.error('خطأ في جلب تفاصيل الحدث:', error);
    res.status(500).json({ message: 'حدث خطأ في الخادم' });
  }
});

// التقديم على حدث (العمال فقط)
router.post('/:id/apply', auth, async (req, res) => {
  try {
    // التحقق من أن المستخدم عامل
    if (req.user.userType !== 'worker') {
      return res.status(403).json({ message: 'فقط العمال يمكنهم التقديم على الأحداث' });
    }

    const { role, message } = req.body;
    const eventId = req.params.id;
    const workerId = req.user.userId;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'الحدث غير موجود' });
    }

    // التحقق من إمكانية التقديم
    if (!event.canApply()) {
      return res.status(400).json({ message: 'لا يمكن التقديم على هذا الحدث' });
    }

    // التحقق من عدم التقديم مسبقاً
    const existingApplication = event.applications.find(
      app => app.worker.toString() === workerId
    );

    if (existingApplication) {
      return res.status(400).json({ message: 'لقد تقدمت على هذا الحدث مسبقاً' });
    }

    // إضافة التطبيق
    event.applications.push({
      worker: workerId,
      role,
      message,
      status: 'pending'
    });

    await event.save();

    res.json({
      message: 'تم التقديم على الحدث بنجاح',
      application: event.applications[event.applications.length - 1]
    });

  } catch (error) {
    console.error('خطأ في التقديم على الحدث:', error);
    res.status(500).json({ message: 'حدث خطأ في الخادم' });
  }
});

// قبول/رفض طلب عمل (المدراء فقط)
router.post('/:id/applications/:applicationId/respond', auth, async (req, res) => {
  try {
    if (req.user.userType !== 'manager') {
      return res.status(403).json({ message: 'غير مسموح لك بهذا الإجراء' });
    }

    const { action, managerResponse } = req.body; // action: 'accept' or 'reject'
    const { id: eventId, applicationId } = req.params;

    const event = await Event.findOne({
      _id: eventId,
      organizer: req.user.userId
    });

    if (!event) {
      return res.status(404).json({ message: 'الحدث غير موجود أو ليس لديك صلاحية' });
    }

    const application = event.applications.id(applicationId);
    if (!application) {
      return res.status(404).json({ message: 'الطلب غير موجود' });
    }

    application.status = action === 'accept' ? 'accepted' : 'rejected';
    application.managerResponse = managerResponse;
    application.responseAt = new Date();

    await event.save();

    res.json({
      message: action === 'accept' ? 'تم قبول الطلب' : 'تم رفض الطلب',
      application
    });

  } catch (error) {
    console.error('خطأ في الرد على الطلب:', error);
    res.status(500).json({ message: 'حدث خطأ في الخادم' });
  }
});

// تحديث حدث (المدراء فقط)
router.put('/:id', auth, async (req, res) => {
  try {
    if (req.user.userType !== 'manager') {
      return res.status(403).json({ message: 'غير مسموح لك بهذا الإجراء' });
    }

    const event = await Event.findOneAndUpdate(
      { _id: req.params.id, organizer: req.user.userId },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!event) {
      return res.status(404).json({ message: 'الحدث غير موجود أو ليس لديك صلاحية' });
    }

    res.json({
      message: 'تم تحديث الحدث بنجاح',
      event
    });

  } catch (error) {
    console.error('خطأ في تحديث الحدث:', error);
    res.status(500).json({ message: 'حدث خطأ في الخادم' });
  }
});

module.exports = router;