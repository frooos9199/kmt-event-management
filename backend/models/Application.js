const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  // المتقدم (المارشال)
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // السباق
  race: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Race',
    required: true
  },
  
  // رسالة التقديم
  message: {
    type: String,
    default: ''
  },
  
  // حالة الطلب
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'withdrawn'],
    default: 'pending'
  },
  
  // تاريخ التقديم
  appliedAt: {
    type: Date,
    default: Date.now
  },
  
  // تاريخ الرد
  respondedAt: {
    type: Date
  },
  
  // من قام بالرد (المدير)
  respondedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // ملاحظات المدير
  managerNotes: {
    type: String,
    default: ''
  },
  
  // الموقع المخصص
  assignedPosition: {
    type: String,
    default: ''
  },
  
  // تقييم الأداء (بعد انتهاء السباق)
  performance: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    feedback: String,
    ratedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    ratedAt: Date
  }
}, {
  timestamps: true
});

// فهرسة للبحث السريع
applicationSchema.index({ applicant: 1, race: 1 }, { unique: true }); // منع التقديم المكرر
applicationSchema.index({ race: 1, status: 1 });
applicationSchema.index({ applicant: 1, status: 1 });

// دالة للتحقق من إمكانية التقديم
applicationSchema.statics.canApply = async function(userId, raceId) {
  const existingApplication = await this.findOne({
    applicant: userId,
    race: raceId
  });
  
  return !existingApplication;
};

// دالة لحساب عدد المتقدمين المقبولين
applicationSchema.statics.getApprovedCount = async function(raceId) {
  return await this.countDocuments({
    race: raceId,
    status: 'approved'
  });
};

module.exports = mongoose.model('Application', applicationSchema);