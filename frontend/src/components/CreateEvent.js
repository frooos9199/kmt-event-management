import React, { useState } from 'react';
import TimePicker from './TimePicker';
import '../pages/KMT-Original.css';
import './CreateEvent.css';

const CreateEvent = ({ onClose, onEventCreated }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eventType: 'football_match',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    venue: '',
    governorate: 'الكويت',
    area: '',
    district: '',
    street: '',
    workerRequirements: [
      { 
        role: 'مارشال', 
        count: 2, 
        salary: { amount: 15, currency: 'KWD', paymentType: 'daily' }, 
        skills: ['إدارة الحشود', 'معرفة قوانين كرة القدم'], 
        experienceLevel: 'intermediate' 
      },
      { 
        role: 'أمن ومراقبة', 
        count: 3, 
        salary: { amount: 12, currency: 'KWD', paymentType: 'daily' }, 
        skills: ['الأمن والحماية'], 
        experienceLevel: 'beginner' 
      }
    ],
    additionalInfo: {
      dressCode: '',
      mealProvided: false,
      transportationProvided: false,
      specialInstructions: ''
    }
  });
  
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const eventTypes = [
    { value: 'football_match', label: 'Football Match | مباراة كرة قدم' },
    { value: 'basketball_match', label: 'Basketball Match | مباراة كرة سلة' },
    { value: 'conference', label: 'Conference | مؤتمر' },
    { value: 'ceremony', label: 'Ceremony | حفل' },
    { value: 'training', label: 'Training | تدريب' },
    { value: 'tournament', label: 'Tournament | بطولة' },
    { value: 'other', label: 'Other | أخرى' }
  ];

  const kuwaithGovernorates = [
    'الكويت',
    'الأحمدي', 
    'الفروانية',
    'الجهراء',
    'حولي',
    'مبارك الكبير'
  ];

  const roleOptions = [
    'مارشال',
    'أمن ومراقبة',
    'خدمة عملاء',
    'تنظيم وترتيب',
    'إدارة حشود',
    'خدمات عامة',
    'تقنية وصوتيات',
    'ضيافة وإعاشة'
  ];

  const experienceLevels = [
    { value: 'none', label: 'بدون خبرة' },
    { value: 'beginner', label: 'مبتدئ' },
    { value: 'intermediate', label: 'متوسط' },
    { value: 'advanced', label: 'متقدم' }
  ];

  const paymentTypes = [
    { value: 'hourly', label: 'بالساعة' },
    { value: 'daily', label: 'يومي' },
    { value: 'event', label: 'للحدث كامل' }
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleWorkerRequirementChange = (index, field, value) => {
    const updatedRequirements = [...formData.workerRequirements];
    updatedRequirements[index] = {
      ...updatedRequirements[index],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      workerRequirements: updatedRequirements
    }));
  };

  const addWorkerRequirement = () => {
    setFormData(prev => ({
      ...prev,
      workerRequirements: [
        ...prev.workerRequirements,
        { 
          role: 'مارشال', 
          count: 1, 
          salary: { amount: 15, currency: 'KWD', paymentType: 'daily' }, 
          skills: [], 
          experienceLevel: 'beginner' 
        }
      ]
    }));
  };

  const removeWorkerRequirement = (index) => {
    const updatedRequirements = formData.workerRequirements.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      workerRequirements: updatedRequirements
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...formData,
          schedule: {
            startDate: formData.startDate,
            endDate: formData.endDate,
            startTime: formData.startTime,
            endTime: formData.endTime
          },
          location: {
            venue: formData.venue,
            governorate: formData.governorate,
            area: formData.area,
            district: formData.district,
            street: formData.street
          },
          status: 'published'
        })
      });

      if (response.ok) {
        const newEvent = await response.json();
        onEventCreated(newEvent);
        onClose();
      } else {
        alert('Error creating event | خطأ في إنشاء الحدث');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Connection error | خطأ في الاتصال');
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="form-step">
      <h3>📋 Basic Information | المعلومات الأساسية</h3>
      
      <div className="form-row">
        <div className="form-group">
          <label>Event Title | عنوان الحدث *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Enter event title | أدخل عنوان الحدث"
            required
          />
        </div>
        
        <div className="form-group">
          <label>Event Type | نوع الحدث *</label>
          <select
            name="eventType"
            value={formData.eventType}
            onChange={handleInputChange}
            required
          >
            {eventTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-group">
        <label>Description | الوصف *</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Describe your event | صف حدثك"
          rows="4"
          required
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="form-step">
      <h3>📅 Date & Location | التاريخ والموقع</h3>
      
      <div className="form-row">
        <div className="form-group">
          <label>Start Date | تاريخ البداية *</label>
          <input
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label>End Date | تاريخ النهاية *</label>
          <input
            type="date"
            name="endDate"
            value={formData.endDate}
            onChange={handleInputChange}
            required
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <TimePicker
            name="startTime"
            value={formData.startTime}
            onChange={handleInputChange}
            label="Start Time | وقت البداية"
            required
          />
        </div>
        
        <div className="form-group">
          <TimePicker
            name="endTime"
            value={formData.endTime}
            onChange={handleInputChange}
            label="End Time | وقت النهاية"
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label>Venue | المكان *</label>
        <input
          type="text"
          name="venue"
          value={formData.venue}
          onChange={handleInputChange}
          placeholder="Stadium, Hall, etc. | ملعب، قاعة، إلخ"
          required
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>المحافظة *</label>
          <select
            name="governorate"
            value={formData.governorate}
            onChange={handleInputChange}
            required
          >
            {kuwaithGovernorates.map(gov => (
              <option key={gov} value={gov}>{gov}</option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label>المنطقة</label>
          <input
            type="text"
            name="area"
            value={formData.area}
            onChange={handleInputChange}
            placeholder="السالمية، الفروانية، إلخ"
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>الحي</label>
          <input
            type="text"
            name="district"
            value={formData.district}
            onChange={handleInputChange}
            placeholder="بلاطة، شرق، إلخ"
          />
        </div>
        
        <div className="form-group">
          <label>الشارع</label>
          <input
            type="text"
            name="street"
            value={formData.street}
            onChange={handleInputChange}
            placeholder="اسم الشارع أو الرقم"
          />
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="form-step">
      <h3>👥 Worker Requirements | متطلبات العمال</h3>
      
      {formData.workerRequirements.map((requirement, index) => (
        <div key={index} className="worker-requirement-card">
          <div className="requirement-header">
            <h4>Role {index + 1} | دور {index + 1}</h4>
            {formData.workerRequirements.length > 1 && (
              <button
                type="button"
                className="remove-btn"
                onClick={() => removeWorkerRequirement(index)}
              >
                ✕
              </button>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Role | الدور *</label>
              <select
                value={requirement.role}
                onChange={(e) => handleWorkerRequirementChange(index, 'role', e.target.value)}
                required
              >
                {roleOptions.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>Count | العدد *</label>
              <input
                type="number"
                value={requirement.count}
                onChange={(e) => handleWorkerRequirementChange(index, 'count', parseInt(e.target.value))}
                min="1"
                max="50"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>الراتب (دينار كويتي) *</label>
              <input
                type="number"
                value={requirement.salary?.amount || 0}
                onChange={(e) => handleWorkerRequirementChange(index, 'salary', {
                  ...requirement.salary,
                  amount: parseFloat(e.target.value)
                })}
                min="5"
                max="100"
                step="0.5"
                required
              />
              <small>KWD</small>
            </div>
            
            <div className="form-group">
              <label>نوع الدفع *</label>
              <select
                value={requirement.salary?.paymentType || 'daily'}
                onChange={(e) => handleWorkerRequirementChange(index, 'salary', {
                  ...requirement.salary,
                  paymentType: e.target.value
                })}
                required
              >
                {paymentTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>مستوى الخبرة *</label>
              <select
                value={requirement.experienceLevel}
                onChange={(e) => handleWorkerRequirementChange(index, 'experienceLevel', e.target.value)}
                required
              >
                {experienceLevels.map(level => (
                  <option key={level.value} value={level.value}>{level.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      ))}

      <button
        type="button"
        className="add-requirement-btn"
        onClick={addWorkerRequirement}
      >
        + Add Another Role | إضافة دور آخر
      </button>
    </div>
  );

  const renderStep4 = () => (
    <div className="form-step">
      <h3>ℹ️ Additional Information | معلومات إضافية</h3>
      
      <div className="form-group">
        <label>Dress Code | قواعد اللباس</label>
        <input
          type="text"
          name="additionalInfo.dressCode"
          value={formData.additionalInfo.dressCode}
          onChange={handleInputChange}
          placeholder="Formal, Casual, Uniform, etc. | رسمي، كاجوال، زي موحد، إلخ"
        />
      </div>

      <div className="form-group">
        <label>Special Instructions | تعليمات خاصة</label>
        <textarea
          name="additionalInfo.specialInstructions"
          value={formData.additionalInfo.specialInstructions}
          onChange={handleInputChange}
          placeholder="Any special requirements or instructions | أي متطلبات أو تعليمات خاصة"
          rows="3"
        />
      </div>

      <div className="checkbox-group">
        <div className="checkbox-item">
          <label>
            <input
              type="checkbox"
              name="additionalInfo.mealProvided"
              checked={formData.additionalInfo.mealProvided}
              onChange={handleInputChange}
            />
            <span>Meal Provided | وجبة مقدمة</span>
          </label>
        </div>
        
        <div className="checkbox-item">
          <label>
            <input
              type="checkbox"
              name="additionalInfo.transportationProvided"
              checked={formData.additionalInfo.transportationProvided}
              onChange={handleInputChange}
            />
            <span>Transportation Provided | مواصلات مقدمة</span>
          </label>
        </div>
      </div>
    </div>
  );

  return (
    <div className="create-event-overlay">
      <div className="create-event-modal">
        <div className="modal-header">
          <h2>🎪 Create New Event | إنشاء حدث جديد</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="step-indicator">
          {[1, 2, 3, 4].map(step => (
            <div
              key={step}
              className={`step ${currentStep >= step ? 'active' : ''} ${currentStep === step ? 'current' : ''}`}
            >
              {step}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="create-event-form">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}

          <div className="form-navigation">
            {currentStep > 1 && (
              <button
                type="button"
                className="nav-btn prev"
                onClick={() => setCurrentStep(currentStep - 1)}
              >
                ← Previous | السابق
              </button>
            )}
            
            {currentStep < 4 ? (
              <button
                type="button"
                className="nav-btn next"
                onClick={() => setCurrentStep(currentStep + 1)}
              >
                Next | التالي →
              </button>
            ) : (
              <button
                type="submit"
                className="submit-btn"
                disabled={loading}
              >
                {loading ? 'Creating... | جاري الإنشاء...' : 'Publish Event | نشر الحدث'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEvent;