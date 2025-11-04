const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect('mongodb://127.0.0.1:27017/event-management')
  .then(async () => {
    console.log('🔍 جلب جميع المستخدمين...\n');
    
    const allUsers = await User.find({});
    
    console.log(`📊 العدد الإجمالي: ${allUsers.length} مستخدم\n`);
    
    allUsers.forEach((user, index) => {
      const marshalId = user.marshalId || user.marshallInfo?.marshalId || 'غير محدد';
      console.log(`${index + 1}. ${user.fullName}`);
      console.log(`   📧 البريد: ${user.email}`);
      console.log(`   👤 النوع: ${user.userType}`);
      console.log(`   🆔 الرقم: ${marshalId}`);
      console.log(`   📊 الحالة: ${user.accountStatus}`);
      console.log(`   📅 التسجيل: ${user.createdAt.toLocaleDateString('ar-SA')}\n`);
    });
    
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ خطأ:', err.message);
    process.exit(1);
  });