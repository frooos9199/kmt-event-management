const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // المعلومات الأساسية
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  phone: {
    type: String,
    required: true
  },
  
  // نوع المستخدم - نظام المارشال
  userType: {
    type: String,
    enum: ['marshall', 'manager'],
    required: true
  },
  
  // معلومات المارشال المحترف
  marshallInfo: {
    employeeId: {
      type: String,
      unique: true,
      sparse: true
    },
    dateOfBirth: Date,
    age: Number,
    nationality: String,
    nationalId: String,
    profileImage: String,
    
    // التخصصات في الحلبات
    trackSpecializations: [{
      type: String,
      enum: [
        'الحلبة الرئيسية', // GP Track
        'حلبة الكارتينغ', // Karting
        'مضمار الدراق', // Drag Strip
        'حلبة الدريفت', // Drift Track
        'ساحة الدريفت', // Drift Pad
        'حلبة الموتوكروس', // Motocross
        'منطقة الدفع الرباعي' // 4WD Area
      ]
    }],
    
    // مستوى الخبرة
    experienceLevel: {
      type: String,
      enum: ['مبتدئ', 'متوسط', 'متقدم', 'خبير'],
      default: 'مبتدئ'
    },
    
    // سنوات الخبرة
    yearsOfExperience: {
      type: Number,
      min: 0,
      max: 30
    },
    
    // العنوان - الكويت
    address: {
      governorate: {
        type: String,
        enum: ['الكويت', 'الأحمدي', 'الفروانية', 'الجهراء', 'حولي', 'مبارك الكبير'],
        default: 'الكويت'
      },
      area: String,
      district: String,
      street: String,
      buildingNumber: String
    },
    
    // إعدادات التوفر
    availability: {
      isActive: {
        type: Boolean,
        default: true
      },
      preferredShifts: [{
        type: String,
        enum: ['صباحي', 'مسائي', 'ليلي', 'نهاية الأسبوع']
      }],
      maxHoursPerWeek: {
        type: Number,
        default: 40
      }
    }
  },
      },
      area: String,
      district: String,
      street: String,
      block: String,
      building: String
    }
  },
  
  // المعلومات المهنية
  professionalInfo: {
    // التخصص
    specialization: {
      type: String,
      enum: [
        'مارشال', 
        'أمن ومراقبة', 
        'خدمة عملاء', 
        'تنظيم وترتيب',
        'إدارة حشود',
        'خدمات عامة',
        'تقنية وصوتيات',
        'ضيافة وإعاشة'
      ],
      default: 'مارشال'
    },
    
    skills: [{
      name: String,
      level: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced', 'expert']
      }
    }],
    
    experiences: [{
      eventName: String,
      eventType: String,
      role: String,
      clubName: String,
      date: Date,
      description: String,
      rating: Number
    }],
    
    // التفضيلات
    preferences: {
      availableDays: [String], // ['monday', 'tuesday', etc.]
      preferredTimes: [String], // ['morning', 'evening', etc.]
      unavailableDates: [Date],
      preferredEventTypes: [String]
    }
  },
  
  // معلومات النادي (للمدراء)
  clubInfo: {
    clubName: String,
    clubType: String,
    position: String,
    clubDescription: String
  },
  
  // حالة الحساب
  accountStatus: {
    isVerified: {
      type: Boolean,
      default: false
    },
    isApproved: {
      type: Boolean,
      default: false
    },
    profileStatus: {
      type: String,
      enum: ['draft', 'pending', 'approved', 'rejected'],
      default: 'draft'
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    approvedAt: Date,
    rejectionReason: String
  },
  
  // الإحصائيات
  stats: {
    totalEvents: {
      type: Number,
      default: 0
    },
    completedEvents: {
      type: Number,
      default: 0
    },
    averageRating: {
      type: Number,
      default: 0
    },
    totalEarnings: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Calculate age from date of birth
userSchema.methods.calculateAge = function() {
  if (this.personalInfo.dateOfBirth) {
    const today = new Date();
    const birthDate = new Date(this.personalInfo.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    this.personalInfo.age = age;
    return age;
  }
  return null;
};

module.exports = mongoose.model('User', userSchema);