const express = require('express');
const router = express.Router();
const Race = require('../models/Race');
const User = require('../models/User');
const auth = require('../middleware/auth');

// إنشاء سباق جديد
router.post('/', auth, async (req, res) => {
  try {
    console.log('Received request body:', req.body);
    
    // التحقق من أن المستخدم مدير
    if (req.user.userType !== 'manager') {
      return res.status(403).json({ message: 'غير مصرح لك بإنشاء السباقات' });
    }

    const {
      title,
      titleEnglish,
      description,
      raceType,
      track,
      startDate,
      endDate,
      startTime,
      endTime,
      maxParticipants,
      requiredMarshalls,
      marshalTypes
    } = req.body;

    console.log('Extracted values:', {
      title, titleEnglish, description, raceType, track,
      startDate, endDate, startTime, endTime, requiredMarshalls
    });

    // التحقق من البيانات المطلوبة
    if (!title || !titleEnglish || !description || !raceType || !track || 
        !startDate || !endDate || !startTime || !endTime || !requiredMarshalls) {
      console.log('Missing required fields');
      return res.status(400).json({ 
        message: 'جميع الحقول المطلوبة يجب أن تكون مملوءة',
        required: ['title', 'titleEnglish', 'description', 'raceType', 'track', 
                  'startDate', 'endDate', 'startTime', 'endTime', 'requiredMarshalls']
      });
    }

    // التحقق من صحة التواريخ
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (end <= start) {
      return res.status(400).json({ message: 'تاريخ النهاية يجب أن يكون بعد تاريخ البداية' });
    }

    if (start < new Date()) {
      return res.status(400).json({ message: 'لا يمكن إنشاء سباق في الماضي' });
    }

    const race = new Race({
      title,
      titleEnglish,
      description,
      raceType,
      track,
      startDate: start,
      endDate: end,
      startTime,
      endTime,
      maxParticipants: maxParticipants || 20,
      requiredMarshalls,
      marshalTypes: marshalTypes || [],
      createdBy: req.user._id
    });

    await race.save();

    // إرسال إشعار لجميع المارشال
    try {
      const User = require('../models/User');
      
      // البحث عن جميع المارشال النشطين
      const marshals = await User.find({ 
        userType: 'marshall', 
        isActive: true 
      });

      if (marshals.length > 0) {
        const notification = {
          title: 'سباق جديد متاح',
          message: `تم إنشاء سباق جديد: ${title}. يمكنك التقديم الآن!`,
          type: 'new_race',
          raceId: race._id,
          isRead: false,
          createdAt: new Date()
        };

        // إضافة الإشعار لجميع المارشال
        const updatePromises = marshals.map(marshal => 
          User.findByIdAndUpdate(
            marshal._id,
            { $push: { notifications: notification } },
            { new: true }
          )
        );

        await Promise.all(updatePromises);
        console.log(`تم إرسال إشعار للمارشال (${marshals.length} مارشال)`);
      }
    } catch (notificationError) {
      console.error('خطأ في إرسال الإشعارات:', notificationError);
      // لا نوقف العملية إذا فشل الإشعار
    }

    res.status(201).json({
      message: 'تم إنشاء السباق بنجاح',
      race
    });

  } catch (error) {
    console.error('خطأ في إنشاء السباق:', error);
    res.status(500).json({ message: error.message || 'خطأ في الخادم' });
  }
});

// جلب جميع السباقات
router.get('/', auth, async (req, res) => {
  try {
    const races = await Race.find()
      .populate('createdBy', 'fullName email')
      .populate('assignedMarshals.marshal', 'fullName email phone')
      .sort({ createdAt: -1 });

    res.json(races);
  } catch (error) {
    console.error('خطأ في جلب السباقات:', error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
});

// جلب سباق محدد
router.get('/:id', auth, async (req, res) => {
  try {
    const race = await Race.findById(req.params.id)
      .populate('createdBy', 'fullName email')
      .populate('assignedMarshals.marshal', 'fullName email phone');

    if (!race) {
      return res.status(404).json({ message: 'السباق غير موجود' });
    }

    res.json(race);
  } catch (error) {
    console.error('خطأ في جلب السباق:', error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
});

// تحديث سباق
router.put('/:id', auth, async (req, res) => {
  try {
    if (req.user.userType !== 'manager') {
      return res.status(403).json({ message: 'غير مصرح لك بتعديل السباقات' });
    }

    const race = await Race.findById(req.params.id);
    
    if (!race) {
      return res.status(404).json({ message: 'السباق غير موجود' });
    }

    // التحقق من أن المدير هو منشئ السباق
    if (race.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'يمكنك تعديل السباقات التي أنشأتها فقط' });
    }

    const updates = req.body;
    
    // التحقق من صحة التواريخ إذا تم تحديثها
    if (updates.startDate && updates.endDate) {
      const start = new Date(updates.startDate);
      const end = new Date(updates.endDate);
      
      if (end <= start) {
        return res.status(400).json({ message: 'تاريخ النهاية يجب أن يكون بعد تاريخ البداية' });
      }
    }

    Object.keys(updates).forEach(key => {
      race[key] = updates[key];
    });

    await race.save();

    const updatedRace = await Race.findById(race._id)
      .populate('createdBy', 'fullName email')
      .populate('assignedMarshals.marshal', 'fullName email phone');

    res.json({
      message: 'تم تحديث السباق بنجاح',
      race: updatedRace
    });

  } catch (error) {
    console.error('خطأ في تحديث السباق:', error);
    res.status(500).json({ message: error.message || 'خطأ في الخادم' });
  }
});

// تعيين مارشال لسباق
router.post('/:id/assign-marshal', auth, async (req, res) => {
  try {
    if (req.user.userType !== 'manager') {
      return res.status(403).json({ message: 'غير مصرح لك بتعيين المارشال' });
    }

    const { marshalId, marshalType } = req.body;

    const race = await Race.findById(req.params.id);
    if (!race) {
      return res.status(404).json({ message: 'السباق غير موجود' });
    }

    // التحقق من عدم تعيين المارشال مسبقاً
    const alreadyAssigned = race.assignedMarshals.find(
      assignment => assignment.marshal.toString() === marshalId && assignment.marshalType === marshalType
    );

    if (alreadyAssigned) {
      return res.status(400).json({ message: 'المارشال معين مسبقاً لهذا الدور' });
    }

    race.assignedMarshals.push({
      marshal: marshalId,
      marshalType: marshalType
    });

    await race.save();

    const updatedRace = await Race.findById(race._id)
      .populate('assignedMarshals.marshal', 'fullName email phone');

    res.json({
      message: 'تم تعيين المارشال بنجاح',
      race: updatedRace
    });

  } catch (error) {
    console.error('خطأ في تعيين المارشال:', error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
});

// تحديث حالة السباق
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['مجدول', 'قيد التنفيذ', 'مكتمل', 'ملغي', 'مؤجل'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'حالة السباق غير صحيحة' });
    }

    const race = await Race.findByIdAndUpdate(
      id, 
      { status },
      { new: true }
    );

    if (!race) {
      return res.status(404).json({ message: 'السباق غير موجود' });
    }

    res.json({
      message: 'تم تحديث حالة السباق بنجاح',
      race
    });

  } catch (error) {
    console.error('خطأ في تحديث حالة السباق:', error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
});

// حذف سباق
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    // التحقق من أن المستخدم مدير
    if (req.user.userType !== 'manager') {
      return res.status(403).json({ message: 'غير مسموح لك بحذف السباقات' });
    }

    const race = await Race.findById(id);
    if (!race) {
      return res.status(404).json({ message: 'السباق غير موجود' });
    }

    // التحقق من أن السباق لم يبدأ
    if (race.status === 'قيد التنفيذ') {
      return res.status(400).json({ message: 'لا يمكن حذف سباق قيد التنفيذ' });
    }

    await Race.findByIdAndDelete(id);

    res.json({ message: 'تم حذف السباق بنجاح' });

  } catch (error) {
    console.error('خطأ في حذف السباق:', error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
});

module.exports = router;