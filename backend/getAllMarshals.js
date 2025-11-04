const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect('mongodb://127.0.0.1:27017/event-management')
  .then(async () => {
    console.log('🔍 جلب جميع المارشالز...\n');
    
    const marshals = await User.find({}).select('fullName email marshalId marshallInfo accountStatus createdAt userType');
    
    console.log(`📊 العدد الإجمالي: ${marshals.length} مارشال\n`);
    
    marshals.forEach((marshal, index) => {
      if (marshal.userType === 'marshall') {
        const marshalId = marshal.marshalId || marshal.marshallInfo?.marshalId || 'غير محدد';
        console.log(`${index + 1}. ${marshal.fullName}`);
        console.log(`   📧 البريد: ${marshal.email}`);
        console.log(`   🆔 الرقم: ${marshalId}`);
        console.log(`   📊 الحالة: ${marshal.accountStatus}`);
        console.log(`   📅 التسجيل: ${marshal.createdAt.toLocaleDateString('ar-SA')}\n`);
      }
    });
    
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ خطأ:', err.message);
    process.exit(1);
  });