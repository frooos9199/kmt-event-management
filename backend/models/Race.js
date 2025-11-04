const mongoose = require('mongoose');

const raceSchema = new mongoose.Schema({
  // معرف السباق الفريد
  raceId: {
    type: String,
    unique: true
  },
  
  title: {
    type: String,
    required: true,
    trim: true
  },
  
  titleEnglish: {
    type: String,
    required: true,
    trim: true
  },
  
  description: {
    type: String,
    required: true
  },
  
  // نوع السباق
  raceType: {
    type: String,
    enum: [
      'فورمولا 1', 'فورمولا 2', 'فورمولا 3', 'فورمولا 4',
      'كارتينغ', 'دريفت', 'دراق', 'موتوكروس', 'تحمل', 'سرعة'
    ],
    required: true
  },
  
  // الحلبة المستخدمة
  track: {
    type: String,
    enum: [
      'الحلبة الرئيسية',
      'حلبة الكارتينغ',
      'مضمار الدراق',
      'حلبة الدريفت',
      'ساحة الدريفت',
      'مضمار الموتوكروس',
      'حلبة التدريب'
    ],
    required: true
  },
  
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  
  // المشاركة
  maxParticipants: {
    type: Number,
    default: 20
  },
  
  currentParticipants: {
    type: Number,
    default: 0
  },
  
  // المارشال المطلوبين
  requiredMarshalls: {
    type: Number,
    required: true,
    min: 1
  },
  
  // تفاصيل أنواع المارشال المطلوبة
  marshalTypes: [{
    type: {
      type: String,
      enum: [
        'flag_marshal',
        'rescue_marshal', 
        'pit_lane_marshal',
        'drag_race_marshal',
        'drift_marshal',
        'motocross_marshal'
      ]
    },
    count: {
      type: Number,
      min: 1
    }
  }],
  
  // المارشال المعينين
  assignedMarshalls: [{
    marshallId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    position: String,
    assignedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['معين', 'تأكيد', 'حضر', 'غائب'],
      default: 'معين'
    }
  }],
  
  marshalTypes: [{
    type: {
      type: String,
      enum: ['flag_marshal', 'rescue_marshal', 'pit_lane_marshal', 'drag_race_marshal', 'drift_marshal', 'motocross_marshal'],
      required: true
    },
    count: {
      type: Number,
      required: true,
      min: 1
    }
  }],
  experienceLevel: {
    type: String,
    enum: ['all_levels', 'beginner', 'intermediate', 'advanced', 'expert'],
    default: 'all_levels'
  },
  status: {
    type: String,
    enum: ['مجدول', 'قيد التنفيذ', 'مكتمل', 'ملغي', 'مؤجل'],
    default: 'مجدول'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedMarshals: [{
    marshal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    marshalType: {
      type: String,
      enum: ['flag_marshal', 'rescue_marshal', 'pit_lane_marshal', 'drag_race_marshal', 'drift_marshal', 'motocross_marshal']
    },
    assignedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// إضافة validation للتأكد من أن تاريخ النهاية بعد تاريخ البداية
raceSchema.pre('save', async function(next) {
  // توليد raceId تلقائياً إذا لم يكن موجوداً
  if (!this.raceId) {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const day = String(new Date().getDate()).padStart(2, '0');
    
    // البحث عن آخر رقم للسباق في هذا اليوم
    const lastRace = await this.constructor.findOne({
      raceId: new RegExp(`^KMT-R${year}${month}${day}`)
    }).sort({ raceId: -1 });
    
    let sequence = 1;
    if (lastRace) {
      const lastSequence = parseInt(lastRace.raceId.split('-')[1].substr(-2));
      sequence = lastSequence + 1;
    }
    
    this.raceId = `KMT-R${year}${month}${day}${String(sequence).padStart(2, '0')}`;
  }
  
  // التحقق من التواريخ
  if (this.endDate <= this.startDate) {
    next(new Error('تاريخ النهاية يجب أن يكون بعد تاريخ البداية'));
  }
  next();
});

// Virtual للحصول على المارشال المتبقيين المطلوبين
raceSchema.virtual('remainingMarshalls').get(function() {
  const required = this.requiredMarshalls ? this.requiredMarshalls.total : 0;
  const assigned = this.assignedMarshalls ? this.assignedMarshalls.length : 0;
  return Math.max(0, required - assigned);
});

// Methods لإدارة المارشال
raceSchema.methods.assignMarshall = function(marshallId, position) {
  const required = this.requiredMarshalls ? this.requiredMarshalls.total : 0;
  if (this.assignedMarshalls.length >= required) {
    throw new Error('تم الوصول للحد الأقصى من المارشال المطلوبين');
  }
  
  const existing = this.assignedMarshalls.find(m => 
    m.marshallId && m.marshallId.toString() === marshallId.toString()
  );
  
  if (existing) {
    throw new Error('هذا المارشال معين بالفعل في هذا السباق');
  }
  
  this.assignedMarshalls.push({
    marshallId,
    position: position || 'عام',
    status: 'معين'
  });
  
  return this.save();
};

module.exports = mongoose.model('Race', raceSchema);