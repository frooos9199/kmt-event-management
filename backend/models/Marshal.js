const mongoose = require('mongoose');

const marshalSchema = new mongoose.Schema({
  name: {
    type: String,
    default: ''
  },
  email: {
    type: String,
    default: '',
    sparse: true // يسمح بقيم فارغة متعددة
  },
  password: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    default: ''
  },
  profileImage: {
    type: String,
    default: '' // مسار الصورة أو base64
  },
  experience: {
    type: String,
    enum: ['مبتدئ', 'متوسط', 'خبير', 'محترف'],
    default: 'مبتدئ'
  },
  specializations: {
    type: [String],
    default: []
  },
  certifications: {
    type: [String],
    default: []
  },
  availability: {
    type: String,
    enum: ['متاح', 'مشغول', 'إجازة', 'غير متاح'],
    default: 'متاح'
  },
  personalInfo: {
    dateOfBirth: {
      type: String,
      default: ''
    },
    nationalId: {
      type: String,
      default: ''
    },
    address: {
      type: String,
      default: ''
    }
  },
  emergencyContact: {
    name: {
      type: String,
      default: ''
    },
    phone: {
      type: String,
      default: ''
    },
    relationship: {
      type: String,
      default: ''
    }
  },
  notes: {
    type: String,
    default: ''
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalRaces: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['نشط', 'معطل', 'تحت المراجعة'],
    default: 'نشط'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index للبحث السريع
marshalSchema.index({ name: 1 });
marshalSchema.index({ status: 1 });
marshalSchema.index({ availability: 1 });

module.exports = mongoose.model('Marshal', marshalSchema);