require('dotenv').config();
const mongoose = require('mongoose');
const Application = require('./models/Application');
const Race = require('./models/Race');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

async function createDemoApplications() {
  try {
    // الاتصال بقاعدة البيانات
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ متصل بقاعدة البيانات');

    // حذف الطلبات السابقة
    await Application.deleteMany({});
    console.log('🗑️ تم حذف الطلبات السابقة');

    // البحث عن السباقات
    const races = await Race.find();
    if (races.length === 0) {
      console.log('❌ لا توجد سباقات، قم بإنشاء السباقات أولاً');
      return;
    }

    // إنشاء مستخدمين تجريبيين (مارشال)
    const marshals = [
      {
        fullName: 'أحمد محمد الكويتي',
        email: 'ahmed@kmt.com',
        password: 'password123',
        userType: 'marshall',
        phone: '+965 5555 1111',
        experience: 'خبير',
        specializations: ['فلاق مارشال', 'رسكيو مارشال']
      },
      {
        fullName: 'فاطمة علي الخالد',
        email: 'fatima@kmt.com',
        password: 'password123',
        userType: 'marshall',
        phone: '+965 5555 2222',
        experience: 'متقدم',
        specializations: ['بت لين مارشال', 'درفت مارشال']
      },
      {
        fullName: 'سالم عبدالله السالم',
        email: 'salem@kmt.com',
        password: 'password123',
        userType: 'marshall',
        phone: '+965 5555 3333',
        experience: 'متوسط',
        specializations: ['موتور كروس مارشال']
      },
      {
        fullName: 'نورا خالد العتيبي',
        email: 'nora@kmt.com',
        password: 'password123',
        userType: 'marshall',
        phone: '+965 5555 4444',
        experience: 'مبتدئ',
        specializations: ['فلاق مارشال']
      }
    ];

    // إنشاء المستخدمين
    const createdMarshals = [];
    for (const marshalData of marshals) {
      // التحقق من وجود المستخدم
      let existingUser = await User.findOne({ email: marshalData.email });
      if (!existingUser) {
        const hashedPassword = await bcrypt.hash(marshalData.password, 10);
        const newUser = new User({
          ...marshalData,
          password: hashedPassword
        });
        existingUser = await newUser.save();
        console.log(`👤 تم إنشاء المستخدم: ${marshalData.fullName}`);
      }
      createdMarshals.push(existingUser);
    }

    // إنشاء طلبات تجريبية
    const applicationMessages = [
      'أرغب في العمل كمارشال في هذا السباق المثير. لدي خبرة سابقة في سباقات مماثلة.',
      'أتطلع للمشاركة في هذا الحدث الرائع والمساهمة في إنجاحه.',
      'لدي شغف كبير برياضة السيارات وأرغب في الحصول على هذه الفرصة.',
      'أملك الخبرة والمهارات المطلوبة لضمان سلامة وسير السباق بشكل مثالي.',
      'أسعى للمشاركة في هذا السباق لاكتساب المزيد من الخبرة العملية.'
    ];

    const applications = [];
    
    // إنشاء طلبات متنوعة لكل سباق
    for (let i = 0; i < races.length; i++) {
      const race = races[i];
      
      // إنشاء 2-3 طلبات لكل سباق
      const numApplications = Math.floor(Math.random() * 2) + 2; // 2-3 طلبات
      
      for (let j = 0; j < numApplications && j < createdMarshals.length; j++) {
        const marshal = createdMarshals[j];
        const randomMessage = applicationMessages[Math.floor(Math.random() * applicationMessages.length)];
        
        try {
          const application = new Application({
            applicant: marshal._id,
            race: race._id,
            message: randomMessage,
            status: 'pending',
            appliedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // خلال الأسبوع الماضي
          });
          
          await application.save();
          applications.push(application);
          console.log(`📝 تم إنشاء طلب: ${marshal.fullName} → ${race.title}`);
        } catch (error) {
          if (error.code === 11000) {
            console.log(`⚠️ طلب موجود مسبقاً: ${marshal.fullName} → ${race.title}`);
          } else {
            console.error('خطأ في إنشاء الطلب:', error.message);
          }
        }
      }
    }

    // إنشاء بعض الطلبات المقبولة والمرفوضة لأغراض التجريب
    if (applications.length > 0) {
      // قبول أول طلبين
      if (applications[0]) {
        applications[0].status = 'approved';
        applications[0].respondedAt = new Date();
        applications[0].assignedPosition = 'مارشال الحلبة الرئيسية';
        applications[0].managerNotes = 'مرحب بك! تم قبولك بناءً على خبرتك الممتازة.';
        await applications[0].save();
        console.log(`✅ تم قبول طلب: ${applications[0].applicant}`);
      }

      if (applications[1]) {
        applications[1].status = 'approved';
        applications[1].respondedAt = new Date();
        applications[1].assignedPosition = 'مارشال السلامة';
        applications[1].managerNotes = 'مقبول! نتطلع للعمل معك.';
        await applications[1].save();
        console.log(`✅ تم قبول طلب: ${applications[1].applicant}`);
      }

      // رفض طلب واحد
      if (applications[2]) {
        applications[2].status = 'rejected';
        applications[2].respondedAt = new Date();
        applications[2].managerNotes = 'نأسف، تم الوصول للعدد المطلوب من المارشال لهذا السباق.';
        await applications[2].save();
        console.log(`❌ تم رفض طلب: ${applications[2].applicant}`);
      }
    }

    console.log('🎉 تم إنشاء الطلبات التجريبية بنجاح!');
    console.log(`📊 عدد الطلبات: ${applications.length}`);
    console.log(`👥 عدد المارشال: ${createdMarshals.length}`);

  } catch (error) {
    console.error('❌ خطأ في إنشاء الطلبات:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 تم قطع الاتصال');
  }
}

createDemoApplications();