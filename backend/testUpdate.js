require('dotenv').config();
const mongoose = require('mongoose');
const Marshal = require('./models/Marshal');

async function testUpdate() {
  try {
    // الاتصال بقاعدة البيانات
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ متصل بقاعدة البيانات');

    // البحث عن أول مارشال
    const marshal = await Marshal.findOne();
    if (!marshal) {
      console.log('❌ لا يوجد مارشال في قاعدة البيانات');
      return;
    }

    console.log('📋 المارشال قبل التحديث:', marshal.name);

    // تحديث البيانات
    const updatedMarshal = await Marshal.findByIdAndUpdate(
      marshal._id,
      {
        name: 'أحمد محمد المحدث',
        phone: '12345678',
        experience: 'خبير',
        availability: 'مشغول'
      },
      { new: true, runValidators: true }
    );

    console.log('✅ تم التحديث بنجاح:', updatedMarshal.name);
    console.log('📱 الهاتف الجديد:', updatedMarshal.phone);
    console.log('🎯 الخبرة الجديدة:', updatedMarshal.experience);
    console.log('⏰ الحالة الجديدة:', updatedMarshal.availability);

  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 تم قطع الاتصال');
  }
}

testUpdate();