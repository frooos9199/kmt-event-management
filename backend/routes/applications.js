const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const Race = require('../models/Race');
const User = require('../models/User');
const auth = require('../middleware/auth');

// إنشاء طلب جديد (للمارشال)
router.post('/', auth, async (req, res) => {
  try {
    const { raceId, message } = req.body;

    // التحقق من وجود السباق
    const race = await Race.findById(raceId);
    if (!race) {
      return res.status(404).json({ message: 'السباق غير موجود' });
    }

    // التحقق من أن السباق لم يبدأ بعد
    if (new Date(race.startDate) <= new Date()) {
      return res.status(400).json({ message: 'لا يمكن التقديم على سباق بدأ بالفعل' });
    }

    // التحقق من عدم وجود طلب سابق
    const canApply = await Application.canApply(req.user._id, raceId);
    if (!canApply) {
      return res.status(400).json({ message: 'لقد تقدمت بالفعل على هذا السباق' });
    }

    // إنشاء الطلب
    const application = new Application({
      applicant: req.user._id,
      race: raceId,
      message: message || ''
    });

    await application.save();

    // جلب الطلب مع البيانات المرتبطة
    const populatedApplication = await Application.findById(application._id)
      .populate('applicant', 'fullName email phone')
      .populate('race', 'title titleEnglish startDate endDate');

    res.status(201).json({
      message: 'تم إرسال طلبك بنجاح',
      application: populatedApplication
    });

  } catch (error) {
    console.error('خطأ في إنشاء الطلب:', error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
});

// جلب طلبات المستخدم (للمارشال)
router.get('/my-applications', auth, async (req, res) => {
  try {
    const applications = await Application.find({ applicant: req.user._id })
      .populate('race', 'title titleEnglish startDate endDate raceType track')
      .sort({ appliedAt: -1 });

    res.json(applications);
  } catch (error) {
    console.error('خطأ في جلب الطلبات:', error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
});

// جلب طلبات سباق محدد (للمدير)
router.get('/race/:raceId', auth, async (req, res) => {
  try {
    // التحقق من أن المستخدم مدير
    if (req.user.userType !== 'manager') {
      return res.status(403).json({ message: 'غير مصرح لك بهذا الإجراء' });
    }

    const applications = await Application.find({ race: req.params.raceId })
      .populate('applicant', 'fullName email phone experience specializations')
      .sort({ appliedAt: -1 });

    res.json(applications);
  } catch (error) {
    console.error('خطأ في جلب طلبات السباق:', error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
});

// جلب جميع الطلبات (للمدير)
router.get('/', auth, async (req, res) => {
  try {
    // التحقق من أن المستخدم مدير
    if (req.user.userType !== 'manager') {
      return res.status(403).json({ message: 'غير مصرح لك بهذا الإجراء' });
    }

    const { status, raceId } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (raceId) filter.race = raceId;

    const applications = await Application.find(filter)
      .populate('applicant', 'fullName email phone experience specializations')
      .populate('race', 'title titleEnglish startDate endDate')
      .sort({ appliedAt: -1 });

    res.json(applications);
  } catch (error) {
    console.error('خطأ في جلب الطلبات:', error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
});

// الرد على طلب (قبول/رفض) - للمدير
router.put('/:id/respond', auth, async (req, res) => {
  try {
    // التحقق من أن المستخدم مدير
    if (req.user.userType !== 'manager') {
      return res.status(403).json({ message: 'غير مصرح لك بهذا الإجراء' });
    }

    const { status, managerNotes, assignedPosition } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'حالة غير صحيحة' });
    }

    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ message: 'الطلب غير موجود' });
    }

    // التحقق من عدد المارشال المقبولين إذا كان الرد بالقبول
    if (status === 'approved') {
      const race = await Race.findById(application.race);
      const approvedCount = await Application.getApprovedCount(application.race);
      
      if (approvedCount >= race.requiredMarshalls) {
        return res.status(400).json({ 
          message: 'تم الوصول للعدد المطلوب من المارشال لهذا السباق' 
        });
      }
    }

    application.status = status;
    application.respondedAt = new Date();
    application.respondedBy = req.user._id;
    if (managerNotes) application.managerNotes = managerNotes;
    if (assignedPosition && status === 'approved') {
      application.assignedPosition = assignedPosition;
    }

    await application.save();

    const populatedApplication = await Application.findById(application._id)
      .populate('applicant', 'fullName email phone')
      .populate('race', 'title titleEnglish startDate endDate')
      .populate('respondedBy', 'fullName');

    res.json({
      message: status === 'approved' ? 'تم قبول الطلب' : 'تم رفض الطلب',
      application: populatedApplication
    });

  } catch (error) {
    console.error('خطأ في الرد على الطلب:', error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
});

// سحب طلب (للمارشال)
router.put('/:id/withdraw', auth, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    
    if (!application) {
      return res.status(404).json({ message: 'الطلب غير موجود' });
    }

    // التحقق من أن الطلب ملك المستخدم
    if (application.applicant.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'غير مصرح لك بهذا الإجراء' });
    }

    // التحقق من أن الطلب يمكن سحبه
    if (!['pending', 'approved'].includes(application.status)) {
      return res.status(400).json({ message: 'لا يمكن سحب هذا الطلب' });
    }

    application.status = 'withdrawn';
    await application.save();

    res.json({ message: 'تم سحب الطلب بنجاح' });

  } catch (error) {
    console.error('خطأ في سحب الطلب:', error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
});

// تقييم أداء المارشال (بعد انتهاء السباق) - للمدير
router.put('/:id/rate', auth, async (req, res) => {
  try {
    // التحقق من أن المستخدم مدير
    if (req.user.userType !== 'manager') {
      return res.status(403).json({ message: 'غير مصرح لك بهذا الإجراء' });
    }

    const { rating, feedback } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'التقييم يجب أن يكون بين 1 و 5' });
    }

    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ message: 'الطلب غير موجود' });
    }

    if (application.status !== 'approved') {
      return res.status(400).json({ message: 'يمكن تقييم المارشال المقبولين فقط' });
    }

    application.performance = {
      rating,
      feedback: feedback || '',
      ratedBy: req.user._id,
      ratedAt: new Date()
    };

    await application.save();

    res.json({ message: 'تم حفظ التقييم بنجاح' });

  } catch (error) {
    console.error('خطأ في حفظ التقييم:', error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
});

// جلب طلبات سباق معين (للمدراء)
router.get('/race/:raceId', auth, async (req, res) => {
  try {
    const { raceId } = req.params;

    // التحقق من أن المستخدم مدير
    if (req.user.userType !== 'manager') {
      return res.status(403).json({ message: 'غير مسموح لك بعرض هذه البيانات' });
    }

    const applications = await Application.find({ race: raceId })
      .populate('applicant', 'fullName email phone marshallInfo')
      .populate('race', 'title titleEnglish')
      .sort({ createdAt: -1 });

    res.json(applications);

  } catch (error) {
    console.error('خطأ في جلب طلبات السباق:', error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
});

module.exports = router;