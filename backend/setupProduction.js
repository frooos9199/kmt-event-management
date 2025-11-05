// إعداد المارشال في قاعدة البيانات السحابية
const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function setupProductionData() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/kmt-event-management';
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ متصل بقاعدة البيانات');

    // إنشاء مدير عام
    const adminExists = await User.findOne({ email: 'admin@kmt.com' });
    if (!adminExists) {
      const admin = new User({
        fullName: 'مدير نظام KMT',
        email: 'admin@kmt.com',
        password: 'admin123456',
        userType: 'manager',
        accountStatus: 'approved'
      });
      await admin.save();
      console.log('✅ تم إنشاء المدير العام');
    }

    // إنشاء مارشال تجريبيين
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
          nationality: 'الكويت',
          nationalId: '290051534567',
          emergencyContact: {
            name: 'محمد أحمد',
            phone: '+96599887755'
          }
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
          nationality: 'الكويت',
          nationalId: '292082056789',
          emergencyContact: {
            name: 'علي الزهراء',
            phone: '+96599123456'
          }
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
          nationality: 'السعودية',
          nationalId: '188121089012',
          emergencyContact: {
            name: 'سعد العتيبي',
            phone: '+96599334455'
          }
        }
      }
    ];

    for (const marshalData of marshals) {
      const exists = await User.findOne({ email: marshalData.email });
      if (!exists) {
        const marshal = new User(marshalData);
        await marshal.save();
        console.log('✅ تم إنشاء:', marshal.fullName, '- رقم:', marshal.marshallInfo?.marshalId);
      }
    }

    console.log('🎉 تم إعداد البيانات الأساسية بنجاح');
    process.exit(0);
  } catch (error) {
    console.error('❌ خطأ:', error.message);
    process.exit(1);
  }
}

setupProductionData();