require('dotenv').config();
const mongoose = require('mongoose');
const Race = require('./models/Race');
const User = require('./models/User');
const Application = require('./models/Application');

async function createDemoRaces() {
  try {
    // الاتصال بقاعدة البيانات
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ متصل بقاعدة البيانات');

    // حذف السباقات السابقة
    await Race.deleteMany({});
    await Application.deleteMany({});
    console.log('🗑️ تم حذف البيانات السابقة');

    // البحث عن مدير لربط السباقات به
    let manager = await User.findOne({ userType: 'manager' });
    if (!manager) {
      // إنشاء مدير إذا لم يكن موجود
      manager = new User({
        fullName: 'مدير النظام',
        email: 'manager@kmt.com',
        password: 'password123',
        userType: 'manager'
      });
      await manager.save();
      console.log('👤 تم إنشاء مدير النظام');
    }

    // إنشاء سباقات تجريبية
    const races = [
      {
        title: 'بطولة الكويت للفورمولا 4',
        titleEnglish: 'Kuwait Formula 4 Championship',
        description: 'سباق احترافي للفورمولا 4 مع المتسابقين الخليجيين والعرب. سباق مثير على الحلبة الرئيسية بمدينة الكويت لرياضة المحركات.',
        raceType: 'فورمولا 4',
        track: 'الحلبة الرئيسية',
        startDate: new Date('2025-11-20'),
        endDate: new Date('2025-11-21'),
        startTime: '14:00',
        endTime: '18:00',
        maxParticipants: 24,
        requiredMarshalls: 12,
        experienceLevel: 'advanced',
        marshalTypes: [
          { type: 'flag_marshal', count: 4 },
          { type: 'rescue_marshal', count: 3 },
          { type: 'pit_lane_marshal', count: 5 }
        ],
        createdBy: manager._id
      },
      {
        title: 'بطولة الدراق الليلية',
        titleEnglish: 'Night Drag Racing Championship',
        description: 'سباقات دراق ليلية مثيرة على مضمار الدراق الاحترافي. سباقات سريعة ومثيرة تحت الأضواء.',
        raceType: 'دراق',
        track: 'مضمار الدراق',
        startDate: new Date('2025-11-25'),
        endDate: new Date('2025-11-26'),
        startTime: '19:00',
        endTime: '23:00',
        maxParticipants: 32,
        requiredMarshalls: 8,
        experienceLevel: 'intermediate',
        marshalTypes: [
          { type: 'drag_race_marshal', count: 6 },
          { type: 'rescue_marshal', count: 2 }
        ],
        createdBy: manager._id
      },
      {
        title: 'مهرجان الدريفت الخليجي',
        titleEnglish: 'Gulf Drift Festival',
        description: 'مهرجان دريفت ضخم يجمع أفضل سائقي الدريفت من دول الخليج. عروض مذهلة ومنافسات حامية.',
        raceType: 'دريفت',
        track: 'حلبة الدريفت',
        startDate: new Date('2025-12-05'),
        endDate: new Date('2025-12-06'),
        startTime: '16:00',
        endTime: '22:00',
        maxParticipants: 20,
        requiredMarshalls: 10,
        experienceLevel: 'expert',
        marshalTypes: [
          { type: 'drift_marshal', count: 8 },
          { type: 'rescue_marshal', count: 2 }
        ],
        createdBy: manager._id
      },
      {
        title: 'بطولة الموتور كروس',
        titleEnglish: 'Motocross Championship',
        description: 'بطولة موتور كروس مثيرة على المسار الوعر. مغامرة حقيقية لعشاق الدراجات النارية.',
        raceType: 'موتوكروس',
        track: 'مضمار الموتوكروس',
        startDate: new Date('2025-12-15'),
        endDate: new Date('2025-12-16'),
        startTime: '09:00',
        endTime: '17:00',
        maxParticipants: 40,
        requiredMarshalls: 15,
        experienceLevel: 'advanced',
        marshalTypes: [
          { type: 'motocross_marshal', count: 10 },
          { type: 'rescue_marshal', count: 5 }
        ],
        createdBy: manager._id
      },
      {
        title: 'اليوم المفتوح للكارتنج',
        titleEnglish: 'Open Karting Day',
        description: 'يوم مفتوح للعائلات والأطفال لتجربة قيادة الكارت في بيئة آمنة ومراقبة.',
        raceType: 'كارتينغ',
        track: 'حلبة الكارتينغ',
        startDate: new Date('2025-11-30'),
        endDate: new Date('2025-12-01'),
        startTime: '10:00',
        endTime: '18:00',
        maxParticipants: 50,
        requiredMarshalls: 6,
        experienceLevel: 'beginner',
        marshalTypes: [
          { type: 'flag_marshal', count: 4 },
          { type: 'rescue_marshal', count: 2 }
        ],
        createdBy: manager._id
      }
    ];

    // حفظ السباقات
    for (const raceData of races) {
      const race = new Race(raceData);
      await race.save();
      console.log(`✅ تم إنشاء السباق: ${race.title}`);
    }

    console.log('🎉 تم إنشاء جميع السباقات التجريبية بنجاح!');
    console.log(`📊 عدد السباقات: ${races.length}`);

  } catch (error) {
    console.error('❌ خطأ في إنشاء السباقات:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 تم قطع الاتصال');
  }
}

createDemoRaces();