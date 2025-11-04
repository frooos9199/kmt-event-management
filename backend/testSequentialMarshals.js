const mongoose = require('mongoose');
const User = require('./models/User');
const Counter = require('./models/Counter');

mongoose.connect('mongodb://127.0.0.1:27017/event-management')
  .then(async () => {
    console.log('🔗 متصل بقاعدة البيانات');
    
    // حذف جميع المارشالات السابقة لاختبار الترقيم
    await User.deleteMany({ userType: 'marshall' });
    console.log('🗑️ تم حذف جميع المارشالات السابقة');
    
    // التأكد من وجود العداد بالقيمة الصحيحة
    let counter = await Counter.findById('marshal_id');
    if (!counter) {
      counter = new Counter({
        _id: 'marshal_id',
        sequence_value: 99  // ليصبح أول مارشال KMT-100
      });
      await counter.save();
      console.log('✅ تم إنشاء العداد بقيمة 99');
    } else {
      console.log(`📊 العداد الحالي: ${counter.sequence_value}`);
    }
    
    // إنشاء مارشالات جديدة لاختبار النظام
    const marshals = [
      {
        fullName: 'أحمد محمد الكويتي',
        email: 'ahmed@kmt.com',
        password: '123456',
        phone: '+96599112233',
        userType: 'marshall',
        accountStatus: 'approved',
        marshallInfo: {
          dateOfBirth: '1990-05-15',
          nationality: 'كويتي',
          nationalId: '290051534567'
        }
      },
      {
        fullName: 'فاطمة الزهراء',
        email: 'fatima@kmt.com',
        password: '123456',
        phone: '+96599445566',
        userType: 'marshall',
        accountStatus: 'approved',
        marshallInfo: {
          dateOfBirth: '1992-08-20',
          nationality: 'كويتية',
          nationalId: '292082056789'
        }
      },
      {
        fullName: 'خالد العتيبي',
        email: 'khalid@kmt.com',
        password: '123456',
        phone: '+96599778899',
        userType: 'marshall',
        accountStatus: 'approved',
        marshallInfo: {
          dateOfBirth: '1988-12-10',
          nationality: 'سعودي',
          nationalId: '188121089012'
        }
      },
      {
        fullName: 'نورا الأحمد',
        email: 'nora@kmt.com',
        password: '123456',
        phone: '+96599556677',
        userType: 'marshall',
        accountStatus: 'pending',
        marshallInfo: {
          dateOfBirth: '1995-03-25',
          nationality: 'كويتية',
          nationalId: '195032589123'
        }
      },
      {
        fullName: 'محمد الصباح',
        email: 'mohammed@kmt.com',
        password: '123456',
        phone: '+96599998877',
        userType: 'marshall',
        accountStatus: 'approved',
        marshallInfo: {
          dateOfBirth: '1987-11-18',
          nationality: 'كويتي',
          nationalId: '187111890456'
        }
      }
    ];

    console.log('📝 بدء إنشاء المارشالات...');
    
    for (let i = 0; i < marshals.length; i++) {
      const marshalData = marshals[i];
      try {
        const marshal = new User(marshalData);
        await marshal.save();
        
        console.log(`✅ [${i + 1}] تم إنشاء: ${marshal.fullName}`);
        console.log(`   📋 رقم المارشال: ${marshal.marshallInfo?.marshalId}`);
        console.log(`   📧 الإيميل: ${marshal.email}`);
        console.log(`   🏳️ الجنسية: ${marshal.marshallInfo?.nationality}`);
        console.log('   ─────────────────────────────');
      } catch (error) {
        console.error(`❌ خطأ في إنشاء ${marshalData.fullName}:`, error.message);
      }
    }
    
    // التحقق من العداد النهائي
    const finalCounter = await Counter.findById('marshal_id');
    console.log('📊 العداد النهائي:', finalCounter?.sequence_value || 'غير موجود');
    
    console.log('\n🎉 تم إنشاء جميع المارشالات بنجاح!');
    console.log('🔢 الترقيم التسلسلي يبدأ من KMT-100');
    
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ خطأ في الاتصال:', err.message);
    process.exit(1);
  });