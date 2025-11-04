const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Counter = require('./Counter');

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
  
  // معلومات المارشال
  marshallInfo: {
    marshalId: {
      type: String,
      unique: true,
      sparse: true  // يسمح بقيم null للمدراء
    },
    employeeId: String,
    profileImage: String,
    dateOfBirth: Date,
    nationality: String,
    nationalId: String,
    
    // التخصصات في الحلبات
    trackSpecializations: [{
      type: String,
      enum: [
        'الحلبة الرئيسية',
        'حلبة الكارتينغ', 
        'مضمار الدراق',
        'حلبة الدريفت',
        'ساحة الدريفت',
        'مضمار الموتوكروس',
        'حلبة التدريب'
      ]
    }],
    
    // مستوى الخبرة
    experienceLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      default: 'beginner'
    },
    
    // المعلومات الطبية
    medicalInfo: {
      bloodType: {
        type: String,
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
      },
      allergies: String,
      medications: String
    },
    
    // الشهادات والتراخيص
    certifications: [String],
    
    // اللغات
    languages: [String],
    
    // سنوات الخبرة
    yearsOfExperience: {
      type: Number,
      min: 0,
      max: 30,
      default: 0
    },
    
    // العنوان في الكويت
    address: {
      governorate: {
        type: String,
        enum: ['الكويت', 'الأحمدي', 'الفروانية', 'الجهراء', 'حولي', 'مبارك الكبير'],
        default: 'الكويت'
      },
      area: String,
      district: String,
      street: String
    },
    
    // إعدادات التوفر
    availability: {
      isActive: {
        type: Boolean,
        default: true
      },
      preferredShifts: [String]
    },
    
    // حالة العمل
    workStatus: {
      type: String,
      enum: ['متاح', 'مشغول', 'في إجازة', 'غير نشط'],
      default: 'متاح'
    }
  },
  
  // معلومات المدير
  managerInfo: {
    position: String,
    department: String
  },
  
  // حالة الحساب
  accountStatus: {
    type: String,
    enum: ['pending', 'approved', 'suspended', 'rejected'],
    default: 'pending'
  },
  
  // الإشعارات
  notifications: [{
    title: String,
    message: String,
    type: {
      type: String,
      enum: ['new_race', 'application_status', 'general']
    },
    raceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Race'
    },
    isRead: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // التقييمات
  ratings: {
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    totalRatings: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// تشفير كلمة المرور قبل الحفظ
userSchema.pre('save', async function(next) {
  // إنشاء رقم مارشال للمارشال الجديد
  if (this.isNew && this.userType === 'marshall' && !this.marshallInfo.marshalId) {
    try {
      const Counter = require('./Counter');
      const counter = await Counter.findByIdAndUpdate(
        'marshal_id',
        { $inc: { sequence_value: 1 } },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );
      
      this.marshallInfo.marshalId = `KMT-${counter.sequence_value}`;
    } catch (error) {
      return next(error);
    }
  }

  // تشفير كلمة المرور
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// طريقة للتحقق من كلمة المرور
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// فهرسة للبحث
userSchema.index({ userType: 1 });
userSchema.index({ 'marshallInfo.trackSpecializations': 1 });

module.exports = mongoose.model('User', userSchema);