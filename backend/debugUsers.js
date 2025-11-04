const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect('mongodb://127.0.0.1:27017/event-management')
  .then(async () => {
    console.log('🔍 فحص جميع المستخدمين في قاعدة البيانات...\n');
    
    const allUsers = await User.find({});
    console.log(`📊 إجمالي المستخدمين: ${allUsers.length}\n`);
    
    // فحص نوع كل مستخدم
    const userTypes = {};
    allUsers.forEach(user => {
      const type = user.userType;
      userTypes[type] = (userTypes[type] || 0) + 1;
      
      if (user.userType === 'marshall') {
        const marshalId = user.marshalId || user.marshallInfo?.marshalId || 'غير محدد';
        console.log(`👤 ${user.fullName} - ${user.email} - ID: ${marshalId}`);
      }
    });
    
    console.log('\n📈 إحصائيات نوع المستخدمين:');
    Object.keys(userTypes).forEach(type => {
      console.log(`   ${type}: ${userTypes[type]}`);
    });
    
    // البحث عن المارشالز بطريقة مختلفة
    console.log('\n🔍 البحث عن المارشالز بطرق مختلفة:');
    
    const marshalsExact = await User.find({ userType: 'marshall' });
    console.log(`   البحث الدقيق (marshall): ${marshalsExact.length}`);
    
    const marshalsCase = await User.find({ userType: /marshall/i });
    console.log(`   البحث غير حساس للحالة: ${marshalsCase.length}`);
    
    const marshalsRegex = await User.find({ userType: { $regex: 'marsh', $options: 'i' } });
    console.log(`   البحث بالتعبير النمطي: ${marshalsRegex.length}`);
    
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ خطأ:', err.message);
    process.exit(1);
  });