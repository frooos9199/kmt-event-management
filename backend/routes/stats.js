const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Race = require('../models/Race');
const Application = require('../models/Application');
const auth = require('../middleware/auth');

// إحصائيات لوحة التحكم - Dashboard Statistics
router.get('/dashboard', auth, async (req, res) => {
  try {
    // إجمالي المارشال
    const totalMarshalls = await User.countDocuments({ 
      userType: 'marshall',
      accountStatus: 'approved' 
    });

    // المارشال المتاحين (غير مشغولين)
    const availableMarshalls = await User.countDocuments({ 
      userType: 'marshall',
      accountStatus: 'approved',
      $or: [
        { 'marshallInfo.workStatus': { $ne: 'مشغول' } },
        { 'marshallInfo.workStatus': { $exists: false } }
      ]
    });

    // المارشال المشغولين
    const busyMarshalls = await User.countDocuments({ 
      userType: 'marshall',
      accountStatus: 'approved',
      'marshallInfo.workStatus': 'مشغول'
    });

    // إجمالي المدراء
    const totalManagers = await User.countDocuments({ 
      userType: 'manager',
      accountStatus: 'approved' 
    });

    // إحصائيات حسب مستوى الخبرة
    const experienceStats = await User.aggregate([
      {
        $match: { 
          userType: 'marshall',
          accountStatus: 'approved'
        }
      },
      {
        $group: {
          _id: '$marshallInfo.experienceLevel',
          count: { $sum: 1 }
        }
      }
    ]);

    // إحصائيات حسب الحلبات المتخصصة
    const trackStats = await User.aggregate([
      {
        $match: { 
          userType: 'marshall',
          accountStatus: 'approved'
        }
      },
      {
        $unwind: '$marshallInfo.trackSpecializations'
      },
      {
        $group: {
          _id: '$marshallInfo.trackSpecializations',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // المارشال الجدد (آخر أسبوع)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const newMarshalls = await User.countDocuments({
      userType: 'marshall',
      accountStatus: 'approved',
      createdAt: { $gte: oneWeekAgo }
    });

    // إحصائيات السباقات
    const totalRaces = await Race.countDocuments();
    
    const activeRaces = await Race.countDocuments({
      status: { $in: ['مجدول', 'قيد التنفيذ'] },
      startDate: { $gte: new Date() }
    });
    
    const completedRaces = await Race.countDocuments({
      status: 'مكتمل'
    });
    
    const upcomingEvents = await Race.countDocuments({
      startDate: { $gte: new Date() },
      status: 'مجدول'
    });

    // إحصائيات الطلبات
    const totalApplications = await Application.countDocuments();
    const pendingApplications = await Application.countDocuments({
      status: 'pending'
    });
    const approvedApplications = await Application.countDocuments({
      status: 'approved'
    });

    // إحصائيات إضافية
    const stats = {
      // الإحصائيات الرئيسية
      totalRaces,
      activeRaces,
      completedRaces,
      totalMarshalls,
      availableMarshalls,
      busyMarshalls,
      tracksInUse: trackStats.length, // عدد الحلبات المختلفة
      upcomingEvents,
      totalManagers,
      newMarshalls,
      totalApplications,
      pendingApplications,
      approvedApplications,
      
      // تفاصيل إضافية
      experienceBreakdown: experienceStats.reduce((acc, item) => {
        acc[item._id || 'غير محدد'] = item.count;
        return acc;
      }, {}),
      
      trackSpecializations: trackStats.slice(0, 10), // أهم 10 حلبات
      
      // نسب مئوية
      availability: totalMarshalls > 0 ? Math.round((availableMarshalls / totalMarshalls) * 100) : 0,
      utilization: totalMarshalls > 0 ? Math.round((busyMarshalls / totalMarshalls) * 100) : 0,
      
      // آخر تحديث
      lastUpdated: new Date()
    };

    res.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('خطأ في جلب الإحصائيات:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في جلب الإحصائيات',
      error: error.message
    });
  }
});

// إحصائيات المارشال المفصلة
router.get('/marshalls/detailed', auth, async (req, res) => {
  try {
    const marshalls = await User.find(
      { 
        userType: 'marshall',
        accountStatus: 'approved' 
      },
      {
        fullName: 1,
        'marshallInfo.marshalId': 1,
        'marshallInfo.experienceLevel': 1,
        'marshallInfo.trackSpecializations': 1,
        'marshallInfo.workStatus': 1,
        'marshallInfo.nationality': 1,
        createdAt: 1,
        updatedAt: 1
      }
    ).sort({ createdAt: -1 });

    // إحصائيات مجمعة
    const summary = {
      total: marshalls.length,
      byExperience: {},
      byNationality: {},
      byWorkStatus: {},
      recentlyAdded: 0
    };

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    marshalls.forEach(marshall => {
      // حسب الخبرة
      const exp = marshall.marshallInfo?.experienceLevel || 'غير محدد';
      summary.byExperience[exp] = (summary.byExperience[exp] || 0) + 1;
      
      // حسب الجنسية
      const nat = marshall.marshallInfo?.nationality || 'غير محدد';
      summary.byNationality[nat] = (summary.byNationality[nat] || 0) + 1;
      
      // حسب حالة العمل
      const status = marshall.marshallInfo?.workStatus || 'متاح';
      summary.byWorkStatus[status] = (summary.byWorkStatus[status] || 0) + 1;
      
      // المضافين حديثاً
      if (marshall.createdAt >= oneWeekAgo) {
        summary.recentlyAdded++;
      }
    });

    res.json({
      success: true,
      marshalls,
      summary
    });

  } catch (error) {
    console.error('خطأ في جلب إحصائيات المارشال:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في جلب إحصائيات المارشال',
      error: error.message
    });
  }
});

// تحديث حالة عمل المارشال
router.patch('/marshalls/:id/status', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { workStatus } = req.body;

    const validStatuses = ['متاح', 'مشغول', 'في إجازة', 'غير نشط'];
    
    if (!validStatuses.includes(workStatus)) {
      return res.status(400).json({
        success: false,
        message: 'حالة العمل غير صحيحة'
      });
    }

    const marshall = await User.findOneAndUpdate(
      { _id: id, userType: 'marshall' },
      { 
        $set: { 
          'marshallInfo.workStatus': workStatus,
          updatedAt: new Date()
        }
      },
      { new: true }
    );

    if (!marshall) {
      return res.status(404).json({
        success: false,
        message: 'المارشال غير موجود'
      });
    }

    res.json({
      success: true,
      message: 'تم تحديث حالة المارشال بنجاح',
      marshall: {
        id: marshall._id,
        name: marshall.fullName,
        marshalId: marshall.marshallInfo?.marshalId,
        workStatus: marshall.marshallInfo?.workStatus
      }
    });

  } catch (error) {
    console.error('خطأ في تحديث حالة المارشال:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في تحديث حالة المارشال',
      error: error.message
    });
  }
});

module.exports = router;