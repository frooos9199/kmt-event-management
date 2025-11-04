const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect('mongodb://127.0.0.1:27017/event-management')
  .then(async () => {
    console.log('🔍 فحص وإصلاح بيانات المستخدمين...\n');
    
    // حذف المستخدم القديم بدون marshalId
    const oldUser = await User.findOne({ email: 'b@b.com' });
    if (oldUser) {
      console.log('🗑️ حذف المستخدم القديم:', oldUser.fullName);
      await User.deleteOne({ _id: oldUser._id });
    }
    
    // التأكد من أن جميع المارشالز لديهم marshalId
    const marshalsWithoutId = await User.find({ 
      userType: 'marshall',
      $or: [
        { marshalId: { $exists: false } },
        { marshalId: null },
        { marshalId: '' }
      ]
    });
    
    console.log(`🔧 مارشالز بدون أرقام: ${marshalsWithoutId.length}`);
    
    // الآن جلب جميع المارشالز
    const allMarshals = await User.find({ userType: 'marshall' })
      .select('-password')
      .sort({ createdAt: -1 });
    
    console.log(`✅ إجمالي المارشالز النهائي: ${allMarshals.length}\n`);
    
    allMarshals.forEach((marshal, index) => {
      const marshalId = marshal.marshalId || marshal.marshallInfo?.marshalId || 'غير محدد';
      console.log(`${index + 1}. ${marshal.fullName} - ${marshal.email} - ID: ${marshalId}`);
    });
    
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ خطأ:', err.message);
    process.exit(1);
  });