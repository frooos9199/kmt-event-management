const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eventpro')
  .then(() => console.log('✅ متصل بقاعدة البيانات'))
  .catch(err => console.error('❌ خطأ في الاتصال:', err));

// Marshal Model
const marshalSchema = new mongoose.Schema({
  name: { type: String, default: '' },
  email: { type: String, default: '', sparse: true },
  password: { type: String, default: '' },
  phone: { type: String, default: '' },
  experience: { type: String, enum: ['مبتدئ', 'متوسط', 'خبير', 'محترف'], default: 'مبتدئ' },
  specializations: { type: [String], default: [] },
  availability: { type: String, enum: ['متاح', 'مشغول', 'إجازة', 'غير متاح'], default: 'متاح' },
  status: { type: String, enum: ['نشط', 'معطل', 'تحت المراجعة'], default: 'نشط' },
  notes: { type: String, default: '' }
}, { timestamps: true });

const Marshal = mongoose.model('Marshal', marshalSchema);

async function testMarshalCreation() {
  try {
    console.log('🧪 اختبار إنشاء مارشال...');
    
    // حذف البيانات السابقة
    await Marshal.deleteMany({});
    console.log('🗑️ تم حذف البيانات السابقة');
    
    // تشفير كلمة مرور
    const hashedPassword = await bcrypt.hash('123456', 10);
    
    // إنشاء مارشال تجريبي
    const testMarshal = new Marshal({
      name: 'أحمد محمد',
      email: 'ahmed@test.com',
      password: hashedPassword,
      phone: '+965 9999 9999',
      experience: 'خبير',
      specializations: ['Flag Marshal', 'Track Marshal'],
      availability: 'متاح',
      status: 'نشط',
      notes: 'مارشال تجريبي'
    });
    
    const savedMarshal = await testMarshal.save();
    console.log('✅ تم إنشاء المارشال بنجاح:', savedMarshal.name);
    
    // اختبار جلب البيانات
    const marshals = await Marshal.find().select('-password');
    console.log('📋 عدد المارشال:', marshals.length);
    console.log('📄 المارشال الموجودين:', marshals.map(m => m.name));
    
    console.log('🎉 الاختبار نجح! النظام يعمل بشكل صحيح');
    
  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error.message);
  } finally {
    mongoose.connection.close();
  }
}

testMarshalCreation();