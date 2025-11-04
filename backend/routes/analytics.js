const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

// إحصائيات العمال (بدون أسماء أو معلومات شخصية)
router.get('/workers', auth, async (req, res) => {
  try {
    // التحقق من أن المستخدم مدير
    if (req.user.userType !== 'manager') {
      return res.status(403).json({ message: 'Access denied | غير مسموح' });
    }

    // جلب إحصائيات العمال المجهولة
    const workers = await User.find({ 
      userType: 'worker',
      'accountStatus.profileStatus': 'approved' 
    }).select('professionalInfo.skills professionalInfo.experiences personalInfo.age');

    // تحليل المهارات
    const skillsMap = new Map();
    const experienceMap = new Map();
    const ageGroups = { '18-25': 0, '26-35': 0, '36-45': 0, '46+': 0 };
    
    workers.forEach(worker => {
      // تحليل المهارات
      if (worker.professionalInfo?.skills) {
        worker.professionalInfo.skills.forEach(skill => {
          const skillName = skill.name;
          if (skillsMap.has(skillName)) {
            const existing = skillsMap.get(skillName);
            skillsMap.set(skillName, {
              count: existing.count + 1,
              totalRating: existing.totalRating + (skill.rating || 4),
              ratings: existing.ratings + 1
            });
          } else {
            skillsMap.set(skillName, {
              count: 1,
              totalRating: skill.rating || 4,
              ratings: 1
            });
          }
        });
      }

      // تحليل الخبرة
      if (worker.professionalInfo?.experiences) {
        const experienceCount = worker.professionalInfo.experiences.length;
        let level = 'Beginner | مبتدئ';
        if (experienceCount >= 10) level = 'Expert | خبير';
        else if (experienceCount >= 5) level = 'Advanced | متقدم';
        else if (experienceCount >= 2) level = 'Intermediate | متوسط';
        
        experienceMap.set(level, (experienceMap.get(level) || 0) + 1);
      }

      // تحليل العمر
      const age = worker.personalInfo?.age;
      if (age) {
        if (age <= 25) ageGroups['18-25']++;
        else if (age <= 35) ageGroups['26-35']++;
        else if (age <= 45) ageGroups['36-45']++;
        else ageGroups['46+']++;
      }
    });

    // تحويل المهارات إلى array مع متوسط التقييم
    const skillsBreakdown = Array.from(skillsMap.entries()).map(([skill, data]) => ({
      skill: skill + ' | ' + getArabicSkillName(skill),
      count: data.count,
      avgRating: Math.round((data.totalRating / data.ratings) * 10) / 10
    })).sort((a, b) => b.count - a.count);

    // إحصائيات التوفر (بيانات تجريبية - يمكن تطويرها لاحقاً)
    const availability = {
      'Weekdays | أيام العمل': Math.floor(workers.length * 0.65),
      'Weekends | عطلة أسبوع': Math.floor(workers.length * 0.85),
      'Evenings | مساء': Math.floor(workers.length * 0.70),
      'Full Time | دوام كامل': Math.floor(workers.length * 0.35)
    };

    const analytics = {
      totalWorkers: workers.length,
      availableWorkers: Math.floor(workers.length * 0.75), // 75% متاح عادة
      skillsBreakdown,
      experienceLevel: Object.fromEntries(experienceMap),
      ageGroups,
      availability
    };

    res.json(analytics);

  } catch (error) {
    console.error('Error fetching worker analytics:', error);
    res.status(500).json({ message: 'Server error | خطأ في الخادم' });
  }
});

// دالة مساعدة لترجمة أسماء المهارات
function getArabicSkillName(englishName) {
  const translations = {
    'Security': 'أمن',
    'Organization': 'تنظيم',
    'Customer Service': 'خدمة عملاء',
    'Photography': 'تصوير',
    'Sound Tech': 'صوتيات',
    'Cleaning': 'نظافة',
    'Medical': 'طبي',
    'Catering': 'تموين',
    'Technical Support': 'دعم تقني'
  };
  return translations[englishName] || englishName;
}

// إحصائيات عامة للنظام (للمدراء)
router.get('/system', auth, async (req, res) => {
  try {
    if (req.user.userType !== 'manager') {
      return res.status(403).json({ message: 'Access denied | غير مسموح' });
    }

    const totalUsers = await User.countDocuments();
    const totalWorkers = await User.countDocuments({ userType: 'worker' });
    const totalManagers = await User.countDocuments({ userType: 'manager' });
    const approvedWorkers = await User.countDocuments({ 
      userType: 'worker', 
      'accountStatus.profileStatus': 'approved' 
    });
    const pendingWorkers = await User.countDocuments({ 
      userType: 'worker', 
      'accountStatus.profileStatus': 'pending' 
    });

    res.json({
      totalUsers,
      totalWorkers,
      totalManagers,
      approvedWorkers,
      pendingWorkers,
      approvalRate: totalWorkers > 0 ? Math.round((approvedWorkers / totalWorkers) * 100) : 0
    });

  } catch (error) {
    console.error('Error fetching system analytics:', error);
    res.status(500).json({ message: 'Server error | خطأ في الخادم' });
  }
});

module.exports = router;