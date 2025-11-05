import React, { useState, useEffect } from 'react';
import TimePicker from '../components/TimePicker';
import './KMT-Original.css';
import './Formula-Enhancement.css';

const CreateRaceNew = ({ onPageChange }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // معلومات أساسية
    title: '',
    titleEnglish: '',
    description: '',
    raceType: '',
    track: '',
    
    // التوقيت
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    
  // المارشال
    requiredMarshalls: {
      total: 5,
      bySpecialization: []
    }
  });

  // أنواع السباقات
  const raceTypes = [
    { value: 'فورمولا 4', label: 'فورمولا 4', icon: '🏎️' },
    { value: 'كارتينغ', label: 'كارتينغ', icon: '🏁' },
    { value: 'دريفت', label: 'دريفت', icon: '🌪️' },
    { value: 'دراق', label: 'دراق', icon: '⚡' },
    { value: 'موتوكروس', label: 'موتوكروس', icon: '🏍️' },
    { value: 'تحمل', label: 'سباق التحمل', icon: '⏱️' }
  ];

  // الحلبات المتاحة
  const tracks = [
    { value: 'الحلبة الرئيسية', label: 'الحلبة الرئيسية', length: '5.2 كم' },
    { value: 'حلبة الكارتينغ', label: 'حلبة الكارتينغ', length: '1.8 كم' },
    { value: 'مضمار الدراق', label: 'مضمار الدراق', length: '400 م' },
    { value: 'حلبة الدريفت', label: 'حلبة الدريفت', length: '2.1 كم' },
    { value: 'ساحة الدريفت', label: 'ساحة الدريفت', length: '1.5 كم' },
    { value: 'مضمار الموتوكروس', label: 'مضمار الموتوكروس', length: '3.2 كم' },
    { value: 'حلبة التدريب', label: 'حلبة التدريب', length: '2.8 كم' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNestedChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://kmt-event-management.onrender.com/api/races', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const result = await response.json();
        alert('🎉 تم إنشاء السباق بنجاح!\\nرقم السباق: ' + result.race.raceId);
        onPageChange('manager-dashboard');
      } else {
        const error = await response.json();
        alert('❌ خطأ: ' + error.message);
      }
    } catch (error) {
      console.error('خطأ في إنشاء السباق:', error);
      alert('❌ حدث خطأ في الاتصال بالخادم');
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return 'المعلومات الأساسية | Basic Information';
      case 2: return 'التوقيت والجدولة | Timing & Schedule';
      case 3: return 'إدارة المارشال | Marshall Management';
      case 4: return 'المراجعة والتأكيد | Review & Confirm';
      default: return 'إنشاء سباق جديد | Create New Race';
    }
  };

  const renderStep1 = () => (
    <div className="form-step">
      <div className="form-row">
        <div className="form-group">
          <label>اسم السباق بالعربية *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="مثال: بطولة الكويت للفورمولا 4"
            required
          />
        </div>
        <div className="form-group">
          <label>Race Name in English *</label>
          <input
            type="text"
            name="titleEnglish"
            value={formData.titleEnglish}
            onChange={handleInputChange}
            placeholder="Example: Kuwait Formula 4 Championship"
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label>وصف السباق | Race Description *</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="وصف مفصل عن السباق، القوانين، والأهداف..."
          rows="4"
          required
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>نوع السباق | Race Type *</label>
          <div className="options-grid">
            {raceTypes.map(type => (
              <div
                key={type.value}
                className={`option-card ${formData.raceType === type.value ? 'selected' : ''}`}
                onClick={() => handleInputChange({ target: { name: 'raceType', value: type.value } })}
              >
                <span className="option-icon">{type.icon}</span>
                <span className="option-label">{type.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="form-group">
        <label>الحلبة المستخدمة | Track *</label>
        <div className="track-options">
          {tracks.map(track => (
            <div
              key={track.value}
              className={`track-card ${formData.track === track.value ? 'selected' : ''}`}
              onClick={() => handleInputChange({ target: { name: 'track', value: track.value } })}
            >
              <div className="track-info">
                <h4>{track.label}</h4>
                <span className="track-length">{track.length}</span>
              </div>
              <div className="track-icon">🏁</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="form-step">
      <div className="form-row">
        <div className="form-group">
          <label>تاريخ البداية | Start Date *</label>
          <input
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleInputChange}
            min={new Date().toISOString().split('T')[0]}
            required
          />
        </div>
        <div className="form-group">
          <label>تاريخ النهاية | End Date *</label>
          <input
            type="date"
            name="endDate"
            value={formData.endDate}
            onChange={handleInputChange}
            min={formData.startDate || new Date().toISOString().split('T')[0]}
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
            label="وقت البداية | Start Time"
            required
          />
        </div>
        <div className="form-group">
          <TimePicker
            name="endTime"
            value={formData.endTime}
            onChange={handleInputChange}
            label="وقت النهاية | End Time"
            required
          />
        </div>
      </div>

      

      {formData.startDate && formData.endDate && (
        <div className="schedule-preview">
          <h4>📅 معاينة الجدولة | Schedule Preview</h4>
          <div className="schedule-info">
            <p><strong>المدة:</strong> {
              Math.ceil((new Date(formData.endDate) - new Date(formData.startDate)) / (1000 * 60 * 60 * 24)) + 1
            } يوم</p>
            <p><strong>التوقيت:</strong> {formData.startTime} - {formData.endTime}</p>
          </div>
        </div>
      )}
    </div>
  );

  const renderStep3 = () => (
    <div className="form-step">
      <div className="form-group">
        <label>عدد المارشال المطلوب | Required Marshalls *</label>
        <input
          type="number"
          value={formData.requiredMarshalls.total}
          onChange={(e) => handleNestedChange('requiredMarshalls', 'total', parseInt(e.target.value))}
          min="1"
          max="50"
          required
        />
      </div>

      <div className="marshall-summary">
        <h4>📊 ملخص المارشال | Marshall Summary</h4>
        <div className="summary-info">
          <div className="summary-item">
            <span className="summary-label">المطلوب:</span>
            <span className="summary-value">{formData.requiredMarshalls.total} مارشال</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">التخصص:</span>
            <span className="summary-value">{formData.track}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="form-step review-step">
      <h3>📋 مراجعة بيانات السباق | Race Review</h3>
      
      <div className="review-section">
        <h4>📌 المعلومات الأساسية</h4>
        <div className="review-item">
          <span>الاسم:</span>
          <span>{formData.title}</span>
        </div>
        <div className="review-item">
          <span>النوع:</span>
          <span>{formData.raceType}</span>
        </div>
        <div className="review-item">
          <span>الحلبة:</span>
          <span>{formData.track}</span>
        </div>
      </div>

      <div className="review-section">
        <h4>📅 التوقيت</h4>
        <div className="review-item">
          <span>التاريخ:</span>
          <span>{formData.startDate} إلى {formData.endDate}</span>
        </div>
        <div className="review-item">
          <span>الوقت:</span>
          <span>{formData.startTime} - {formData.endTime}</span>
        </div>
      </div>

      <div className="review-section">
        <h4>👥 المارشال</h4>
        <div className="review-item">
          <span>العدد المطلوب:</span>
          <span>{formData.requiredMarshalls.total} مارشال</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="create-race-container">
      <header className="page-header">
        <button 
          className="back-btn"
          onClick={() => onPageChange('manager-dashboard')}
        >
          ← العودة للوحة التحكم
        </button>
        <div className="page-title">
          <span className="page-icon">🏁</span>
          <h1>{getStepTitle()}</h1>
        </div>
      </header>

      <div className="step-progress">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${(currentStep / 4) * 100}%` }}
          ></div>
        </div>
        <div className="step-indicators">
          {[1, 2, 3, 4].map(step => (
            <div 
              key={step} 
              className={`step-indicator ${currentStep >= step ? 'active' : ''}`}
            >
              {step}
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="race-form">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}

        <div className="form-navigation">
          {currentStep > 1 && (
            <button type="button" onClick={prevStep} className="btn-secondary">
              ← الخطوة السابقة
            </button>
          )}
          
          {currentStep < 4 ? (
            <button 
              type="button" 
              onClick={nextStep} 
              className="btn-primary"
              disabled={!isStepValid()}
            >
              الخطوة التالية →
            </button>
          ) : (
            <button 
              type="submit" 
              className="btn-success"
              disabled={isLoading}
            >
              {isLoading ? '⏳ جاري الإنشاء...' : '🏁 إنشاء السباق'}
            </button>
          )}
        </div>
      </form>
    </div>
  );

  function isStepValid() {
    switch (currentStep) {
      case 1:
        return formData.title && formData.titleEnglish && formData.description && 
               formData.raceType && formData.track;
      case 2:
        return formData.startDate && formData.endDate && formData.startTime && formData.endTime;
      case 3:
        return formData.requiredMarshalls.total > 0;
      default:
        return true;
    }
  }
};

export default CreateRaceNew;