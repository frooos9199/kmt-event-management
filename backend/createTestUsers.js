const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

// الاتصال بقاعدة البيانات
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eventpro')
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

async function createTestUsers() {
  try {
    // حذف المستخدمين الموجودين إذا وجدوا
    await User.deleteMany({ email: { $in: ['A@A.com', 'B@B.com'] } });

    // إنشاء مدير
    const manager = new User({
      fullName: 'Manager Admin',
      email: 'A@A.com',
      password: '123456', // سيتم تشفيرها تلقائياً
      phone: '+966501234567',
      userType: 'manager',
      clubInfo: {
        clubName: 'Al Hilal Club',
        clubType: 'Football',
        position: 'Event Manager',
        clubDescription: 'Professional football club'
      },
      accountStatus: 'approved'
    });

    // إنشاء عامل
    const worker = new User({
      fullName: 'Worker User',
      email: 'B@B.com',
      password: '123456', // سيتم تشفيرها تلقائياً
      phone: '+966507654321',
      userType: 'marshall',
      personalInfo: {
        dateOfBirth: new Date('1995-05-15'),
        age: 28,
        nationality: 'Saudi',
        nationalId: '1234567890'
      },
      professionalInfo: {
        skills: [
          { name: 'Security', level: 'advanced' },
          { name: 'Organization', level: 'intermediate' },
          { name: 'Customer Service', level: 'advanced' }
        ],
        experiences: [
          {
            eventName: 'World Cup 2022',
            eventType: 'Sports',
            role: 'Security Officer',
            clubName: 'FIFA',
            date: new Date('2022-11-01'),
            description: 'Worked as security officer during World Cup',
            rating: 5
          },
          {
            eventName: 'Riyadh Season 2023',
            eventType: 'Entertainment',
            role: 'Event Coordinator',
            clubName: 'GCAP',
            date: new Date('2023-10-01'),
            description: 'Coordinated multiple events during Riyadh Season',
            rating: 4.5
          }
        ],
        preferences: {
          availableDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
          preferredTimes: ['morning', 'evening'],
          preferredEventTypes: ['sports', 'entertainment', 'corporate']
        }
      },
      accountStatus: 'approved',
      marshallInfo: {
        marshalId: 'KMT-M001',
        certificationLevel: 'advanced',
        specializations: ['flag_marshal', 'rescue_marshal']
      },
      stats: {
        totalEvents: 15,
        completedEvents: 14,
        averageRating: 4.7,
        totalEarnings: 21000
      }
    });

    // حفظ المستخدمين
    await manager.save();
    await worker.save();

    console.log('🎉 Test users created successfully!');
    console.log('');
    console.log('👔 Manager Account:');
    console.log('   Email: A');
    console.log('   Password: A');
    console.log('   Type: Manager');
    console.log('');
    console.log('👷‍♂️ Worker Account:');
    console.log('   Email: B');
    console.log('   Password: B');
    console.log('   Type: Worker');
    console.log('');
    console.log('🌐 Login at: http://localhost:3000');

  } catch (error) {
    console.error('❌ Error creating test users:', error);
  } finally {
    mongoose.connection.close();
  }
}

createTestUsers();