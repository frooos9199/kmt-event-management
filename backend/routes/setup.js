const express = require('express');
const User = require('../models/User');
const router = express.Router();

// إنشاء مستخدمين تجريبيين
router.post('/create-test-users', async (req, res) => {
  try {
    // حذف المستخدمين الموجودين إذا وجدوا
    await User.deleteMany({ email: { $in: ['A@A.com', 'B'] } });

    // إنشاء مدير
    const manager = new User({
      fullName: 'Manager Admin',
      email: 'A@A.com',
      password: '123456',
      phone: '+966501234567',
      userType: 'manager',
      clubInfo: {
        clubName: 'Al Hilal Club',
        clubType: 'Football',
        position: 'Event Manager',
        clubDescription: 'Professional football club'
      },
      accountStatus: {
        isVerified: true,
        isApproved: true,
        profileStatus: 'approved'
      }
    });

    // إنشاء عامل
    const worker = new User({
      fullName: 'Worker User',
      email: 'B',
      password: 'B',
      phone: '+966507654321',
      userType: 'worker',
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
          }
        ],
        preferences: {
          availableDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
          preferredTimes: ['morning', 'evening'],
          preferredEventTypes: ['sports', 'entertainment', 'corporate']
        }
      },
      accountStatus: {
        isVerified: true,
        isApproved: true,
        profileStatus: 'approved'
      },
      stats: {
        totalEvents: 15,
        completedEvents: 14,
        averageRating: 4.7,
        totalEarnings: 21000
      }
    });

    await manager.save();
    await worker.save();

    res.json({
      success: true,
      message: 'Test users created successfully! 🎉',
      users: [
        {
          email: 'A',
          password: 'A',
          type: 'Manager',
          name: 'Manager Admin'
        },
        {
          email: 'B',
          password: 'B',
          type: 'Worker',
          name: 'Worker User'
        }
      ]
    });

  } catch (error) {
    console.error('Error creating test users:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating test users',
      error: error.message
    });
  }
});

module.exports = router;