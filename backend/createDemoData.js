const mongoose = require('mongoose');
const User = require('./models/User');
const Race = require('./models/Race');
require('dotenv').config();

// بيانات تجريبية للمارشال
const sampleMarshals = [
  {
    fullName: "أحمد محمد الكويتي",
    email: "ahmed.kuwait@kmt.com",
    phone: "+96599123456",
    password: "123456",
    userType: "marshall",
    experience: "expert",
    specialization: ["flagMarshal", "chiefMarshal"],
    certifications: ["FIA Level 2", "Safety Training"],
    availability: "available"
  },
  {
    fullName: "سارة عبدالله النجار", 
    email: "sara.najjar@kmt.com",
    phone: "+96599234567",
    password: "123456",
    userType: "marshall",
    experience: "intermediate",
    specialization: ["trackMarshal", "emergencyMarshal"],
    certifications: ["First Aid", "Fire Safety"],
    availability: "available"
  },
  {
    fullName: "Mohammad Al-Rashid",
    email: "mohammad.rashid@kmt.com", 
    phone: "+96599345678",
    password: "123456",
    userType: "marshall",
    experience: "expert",
    specialization: ["pitMarshal", "trackMarshal"],
    certifications: ["FIA Level 3", "Technical Inspection"],
    availability: "available"
  },
  {
    fullName: "فاطمة الزهراء الصباح",
    email: "fatima.sabah@kmt.com",
    phone: "+96599456789", 
    password: "123456",
    userType: "marshall",
    experience: "intermediate",
    specialization: ["flagMarshal", "emergencyMarshal"],
    certifications: ["Safety Training", "Communication"],
    availability: "available"
  },
  {
    fullName: "Khalid Al-Mutawa",
    email: "khalid.mutawa@kmt.com",
    phone: "+96599567890",
    password: "123456", 
    userType: "marshall",
    experience: "expert",
    specialization: ["chiefMarshal", "trackMarshal"],
    certifications: ["FIA Level 3", "Race Director"],
    availability: "busy"
  }
];

// بيانات تجريبية للسباقات
const sampleRaces = [
  {
    title: "بطولة الكويت للفورمولا 2",
    titleEnglish: "Kuwait Formula 2 Championship",
    description: "سباق رسمي ضمن بطولة الكويت للفورمولا 2 - الجولة الثالثة",
    raceType: "فورمولا 2",
    track: "الحلبة الرئيسية",
    startDate: new Date("2025-11-10T15:00:00Z"),
    endDate: new Date("2025-11-10T18:00:00Z"), 
    startTime: "15:00",
    endTime: "18:00",
    maxParticipants: 20,
    requiredMarshalls: {
      total: 16,
      flagMarshal: 4,
      trackMarshal: 6,
      pitMarshal: 3,
      emergencyMarshal: 2,
      chiefMarshal: 1
    },
    experienceLevel: "expert",
    status: "مجدول"
  },
  {
    title: "تحدي الكارتينغ الأسبوعي",
    titleEnglish: "Weekly Karting Challenge", 
    description: "سباق كارتينغ للهواة والمحترفين - مفتوح لجميع الأعمار",
    raceType: "كارتينغ",
    track: "حلبة الكارتينغ",
    startDate: new Date("2025-11-07T16:00:00Z"),
    endDate: new Date("2025-11-07T19:00:00Z"),
    startTime: "16:00", 
    endTime: "19:00",
    maxParticipants: 32,
    requiredMarshalls: {
      total: 10,
      flagMarshal: 2,
      trackMarshal: 4,
      pitMarshal: 2,
      emergencyMarshal: 1,
      chiefMarshal: 1
    },
    experienceLevel: "beginner",
    status: "قيد التنفيذ"
  },
  {
    title: "عرض الدريفت الاحترافي",
    titleEnglish: "Professional Drift Show",
    description: "عرض دريفت احترافي مع أفضل السائقين في المنطقة",
    raceType: "دريفت", 
    track: "حلبة الدريفت",
    startDate: new Date("2025-11-15T19:00:00Z"),
    endDate: new Date("2025-11-15T22:00:00Z"),
    startTime: "19:00",
    endTime: "22:00",
    maxParticipants: 12,
    requiredMarshalls: {
      total: 13,
      flagMarshal: 3,
      trackMarshal: 5,
      pitMarshal: 2,
      emergencyMarshal: 2,
      chiefMarshal: 1
    },
    experienceLevel: "expert",
    status: "مجدول"
  }
];

async function createDemoData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('🔗 متصل بقاعدة البيانات');

    // حذف البيانات الموجودة (اختياري)
    await User.deleteMany({ userType: 'marshall' });
    await Race.deleteMany({});
    console.log('🗑️ تم حذف البيانات القديمة');

    // إنشاء المارشال التجريبيين
    const marshals = await User.create(sampleMarshals);
    console.log(`👥 تم إنشاء ${marshals.length} مارشال تجريبي`);

    // إنشاء السباقات التجريبية
    const races = await Race.create(sampleRaces.map(race => ({
      ...race,
      createdBy: marshals[0]._id // استخدام أول مارشال كمنشئ
    })));
    console.log(`🏁 تم إنشاء ${races.length} سباق تجريبي`);

    // تعيين بعض المارشال للسباقات
    for (let i = 0; i < races.length; i++) {
      const race = races[i];
      const assignedMarshals = marshals.slice(0, 3).map((marshal, index) => ({
        marshal: marshal._id,
        marshalType: ['flagMarshal', 'trackMarshal', 'pitMarshal'][index],
        assignedAt: new Date()
      }));
      
      race.assignedMarshals = assignedMarshals;
      await race.save();
    }

    console.log('✅ تم إنشاء جميع البيانات التجريبية بنجاح!');
    console.log('\n📊 ملخص البيانات:');
    console.log(`- ${marshals.length} مارشال`);
    console.log(`- ${races.length} سباق`); 
    console.log('- تعيينات مارشال متنوعة');
    console.log('\n🚀 جاهز للعرض التقديمي!');

  } catch (error) {
    console.error('❌ خطأ في إنشاء البيانات:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// تشغيل إنشاء البيانات
createDemoData();