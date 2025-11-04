const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

mongoose.connect('mongodb://127.0.0.1:27017/event-management')
  .then(async () => {
    console.log('🔍 إنشاء 3 مارشالز وهميين جدد...\n');
    
    const newMarshals = [
      {
        fullName: 'سارة القحطاني',
        email: 'sara.demo@kmt.com',
        password: await bcrypt.hash('123456', 10),
        phone: '50456789',
        userType: 'marshall',
        accountStatus: 'approved',
        nationality: 'الكويت',
        marshallInfo: {
          experienceLevel: 'advanced',
          trackSpecializations: ['الحلبة الرئيسية', 'حلبة الكارتينغ'],
          nationality: 'الكويت',
          workStatus: 'متاح'
        }
      },
      {
        fullName: 'يوسف الهاجري',
        email: 'yusuf.demo@kmt.com',
        password: await bcrypt.hash('123456', 10),
        phone: '50567890',
        userType: 'marshall',
        accountStatus: 'approved',
        nationality: 'قطر',
        marshallInfo: {
          experienceLevel: 'expert',
          trackSpecializations: ['حلبة الدريفت', 'مضمار الدراق'],
          nationality: 'قطر',
          workStatus: 'متاح'
        }
      },
      {
        fullName: 'عبدالله الرشيد',
        email: 'abdullah.demo@kmt.com',
        password: await bcrypt.hash('123456', 10),
        phone: '50678901',
        userType: 'marshall',
        accountStatus: 'pending',
        nationality: 'الإمارات',
        marshallInfo: {
          experienceLevel: 'intermediate',
          trackSpecializations: ['حلبة الكارتينغ', 'مضمار الموتوكروس'],
          nationality: 'الإمارات',
          workStatus: 'متاح'
        }
      }
    ];

    for (const marshalData of newMarshals) {
      const marshal = new User(marshalData);
      await marshal.save();
      console.log(`✅ تم إنشاء: ${marshal.fullName} - رقم: ${marshal.marshalId}`);
    }
    
    console.log('\n🎉 تم إنشاء جميع المارشالز بنجاح!');
    
    // عرض النتيجة النهائية
    const allMarshals = await User.find({ userType: 'marshall' });
    console.log(`\n📊 إجمالي المارشالز الآن: ${allMarshals.length}`);
    
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ خطأ:', err.message);
    process.exit(1);
  });