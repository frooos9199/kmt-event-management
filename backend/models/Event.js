const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  // معلومات الحدث الأساسية
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  eventType: {
    type: String,
    required: true,
    enum: ['football_match', 'basketball_match', 'conference', 'ceremony', 'training', 'tournament', 'other']
  },
  
  // معلومات النادي المنظم
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  clubName: {
    type: String,
    required: true
  },
  
  // التواريخ والأوقات
  schedule: {
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    startTime: String,
    endTime: String,
    setupTime: String, // وقت التحضير قبل الحدث
    cleanupTime: String // وقت التنظيف بعد الحدث
  },
  
  // الموقع - الكويت
  location: {
    venue: {
      type: String,
      required: true
    },
    governorate: {
      type: String,
      enum: ['الكويت', 'الأحمدي', 'الفروانية', 'الجهراء', 'حولي', 'مبارك الكبير'],
      required: true
    },
    area: String,
    district: String,
    street: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  
  // متطلبات العمال - مع المارشال والدينار الكويتي
  workerRequirements: [{
    role: {
      type: String,
      required: true,
      enum: [
        'مارشال', 
        'أمن ومراقبة', 
        'خدمة عملاء', 
        'تنظيم وترتيب',
        'إدارة حشود',
        'خدمات عامة',
        'تقنية وصوتيات',
        'ضيافة وإعاشة'
      ]
    },
    count: {
      type: Number,
      required: true,
      min: 1
    },
    salary: {
      amount: {
        type: Number,
        required: true
      },
      currency: {
        type: String,
        default: 'KWD' // الدينار الكويتي
      },
      paymentType: {
        type: String,
        enum: ['hourly', 'daily', 'event'],
        default: 'daily'
      }
    },
    requirements: String,
    experienceLevel: {
      type: String,
      enum: ['none', 'beginner', 'intermediate', 'advanced']
    }
  }],
  
  // التطبيقات والعمال المقبولين
  applications: [{
    worker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: String,
    appliedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'withdrawn'],
      default: 'pending'
    },
    message: String, // رسالة من العامل
    managerResponse: String, // رد المدير
    responseAt: Date
  }],
  
  // حالة الحدث
  status: {
    type: String,
    enum: ['draft', 'published', 'in_progress', 'completed', 'cancelled'],
    default: 'draft'
  },
  
  // الميزانية والدفع - بالدينار الكويتي
  budget: {
    totalBudget: {
      amount: Number,
      currency: {
        type: String,
        default: 'KWD'
      }
    },
    totalWorkersCost: {
      amount: Number,
      currency: {
        type: String,
        default: 'KWD'
      }
    },
    otherExpenses: {
      amount: Number,
      currency: {
        type: String,
        default: 'KWD'
      }
    }
  },
  
  // معلومات إضافية
  additionalInfo: {
    dress_code: String,
    meal_provided: Boolean,
    transportation_provided: Boolean,
    accommodation_provided: Boolean,
    special_instructions: String,
    contact_person: {
      name: String,
      phone: String,
      email: String
    }
  },
  
  // الصور والملفات
  media: {
    images: [String],
    documents: [String]
  },
  
  // إعدادات التقديم
  applicationSettings: {
    applicationDeadline: Date,
    autoAccept: {
      type: Boolean,
      default: false
    },
    requireMessage: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true
});

// فهرسة للبحث
eventSchema.index({ title: 'text', description: 'text' });
eventSchema.index({ 'schedule.startDate': 1 });
eventSchema.index({ status: 1 });
eventSchema.index({ organizer: 1 });
eventSchema.index({ 'location.governorate': 1 });

// حساب إجمالي العمال المطلوبين
eventSchema.virtual('totalWorkersNeeded').get(function() {
  return this.workerRequirements.reduce((total, req) => total + req.count, 0);
});

// حساب إجمالي المتقدمين
eventSchema.virtual('totalApplications').get(function() {
  return this.applications.length;
});

// حساب العمال المقبولين
eventSchema.virtual('acceptedWorkers').get(function() {
  return this.applications.filter(app => app.status === 'accepted').length;
});

// حساب إجمالي تكلفة العمال بالدينار الكويتي
eventSchema.virtual('totalWorkersCostKWD').get(function() {
  return this.workerRequirements.reduce((total, req) => {
    return total + (req.salary.amount * req.count);
  }, 0);
});

// التحقق من إمكانية التقديم
eventSchema.methods.canApply = function() {
  const now = new Date();
  const deadline = this.applicationSettings.applicationDeadline;
  
  return this.status === 'published' && 
         (!deadline || now <= deadline) &&
         this.acceptedWorkers < this.totalWorkersNeeded;
};

module.exports = mongoose.model('Event', eventSchema);