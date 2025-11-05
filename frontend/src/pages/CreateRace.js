import React, { useState } from 'react';
import TimePicker from '../components/TimePicker';
import './KMT-Original.css';

const CreateRace = ({ onPageChange }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    titleEnglish: '',
    description: '',
    raceType: 'فورمولا 4',
    track: 'الحلبة الرئيسية',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    marshalTypes: []
  });

  // أنواع السباقات
  const raceTypeOptions = [
    { value: 'فورمولا 1', label: 'فورمولا 1', icon: '🏁' },
    { value: 'فورمولا 2', label: 'فورمولا 2', icon: '🏁' },
    { value: 'فورمولا 3', label: 'فورمولا 3', icon: '🏁' },
    { value: 'فورمولا 4', label: 'فورمولا 4', icon: '�' },
    { value: 'كارتينغ', label: 'كارتينغ', icon: '🏃' },
    { value: 'دريفت', label: 'دريفت', icon: '🌪️' },
    { value: 'دراق', label: 'دراق', icon: '🏎️' },
    { value: 'موتوكروس', label: 'موتوكروس', icon: '🏍️' },
    { value: 'تحمل', label: 'تحمل', icon: '⏱️' },
    { value: 'سرعة', label: 'سرعة', icon: '⚡' }
  ];

  // أنواع المسارات
  const trackOptions = [
    { value: 'الحلبة الرئيسية', label: 'الحلبة الرئيسية', icon: '🛣️' },
    { value: 'حلبة الكارتينغ', label: 'حلبة الكارتينغ', icon: '🏃' },
    { value: 'مضمار الدراق', label: 'مضمار الدراق', icon: '➡️' },
    { value: 'حلبة الدريفت', label: 'حلبة الدريفت', icon: '🌀' },
    { value: 'ساحة الدريفت', label: 'ساحة الدريفت', icon: '�️' },
    { value: 'مضمار الموتوكروس', label: 'مضمار الموتوكروس', icon: '🏔️' },
    { value: 'حلبة التدريب', label: 'حلبة التدريب', icon: '�' }
  ];

  // أنواع المارشال المختلفة
  const marshalOptions = [
    { value: 'flag_marshal', label: 'فلاق مارشال', icon: '🏁' },
    { value: 'rescue_marshal', label: 'رسكيو مارشال', icon: '🚑' },
    { value: 'pit_lane_marshal', label: 'بت لين مارشال', icon: '🏁' },
    { value: 'drag_race_marshal', label: 'دراق ريس مارشال', icon: '🏎️' },
    { value: 'drift_marshal', label: 'درفت مارشال', icon: '🌪️' },
    { value: 'motocross_marshal', label: 'موتور كروس مارشال', icon: '🏍️' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMarshalTypeChange = (marshalType, count) => {
    setFormData(prev => {
      const updatedMarshalTypes = prev.marshalTypes.filter(
        item => item.type !== marshalType
      );
      
      if (count > 0) {
        updatedMarshalTypes.push({
          type: marshalType,
          count: parseInt(count)
        });
      }
      
      return {
        ...prev,
        marshalTypes: updatedMarshalTypes
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.marshalTypes.length === 0) {
      alert('يجب اختيار نوع مارشال واحد على الأقل');
      return;
    }

    setIsLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert('يجب تسجيل الدخول أولاً');
        onPageChange('auth');
        return;
      }
      
      // تحويل marshalTypes إلى requiredMarshalls (مجموع العدد)
      const totalMarshalls = formData.marshalTypes.reduce((total, marshal) => {
        return total + parseInt(marshal.count || 0);
      }, 0);

      // إعداد البيانات للإرسال
      const submitData = {
        title: formData.title,
        titleEnglish: formData.titleEnglish,
        description: formData.description,
        raceType: formData.raceType,
        track: formData.track,
        startDate: formData.startDate,
        endDate: formData.endDate,
        startTime: formData.startTime,
        endTime: formData.endTime,
        requiredMarshalls: totalMarshalls,
        marshalTypes: formData.marshalTypes // معلومات إضافية عن أنواع المارشال
      };

      console.log('إرسال البيانات:', submitData);

      const response = await fetch('http://localhost:5001/api/races', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(submitData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('نجح الإنشاء:', result);
        alert('تم إنشاء السباق بنجاح!');
        onPageChange('manager-dashboard');
      } else {
        const error = await response.json();
        console.error('خطأ من الخادم:', error);
        
        if (response.status === 401) {
          alert('رمز المصادقة غير صالح. يجب تسجيل الدخول مرة أخرى.');
          localStorage.removeItem('token');
          localStorage.removeItem('userData');
          onPageChange('auth');
        } else {
          alert(error.message || 'حدث خطأ أثناء إنشاء السباق');
        }
      }
    } catch (error) {
      console.error('خطأ في الشبكة:', error);
      alert('حدث خطأ في الاتصال بالخادم');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="kmt-page">
      <div className="kmt-header">
        <button 
          onClick={() => onPageChange('manager-dashboard')}
          className="kmt-back-btn"
        >
          ← العودة
        </button>
        <h1 className="kmt-title">🏁 إنشاء سباق جديد</h1>
      </div>

      <div className="kmt-container">
        <form onSubmit={handleSubmit} className="create-race-form">
          {/* عنوان الحدث */}
          <div className="form-group">
            <label>🏆 عنوان الحدث (عربي)</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="مثال: بطولة الكويت للفورمولا 4"
              required
              className="form-input"
            />
          </div>

          {/* العنوان بالإنجليزية */}
          <div className="form-group">
            <label>🏆 عنوان الحدث (إنجليزي)</label>
            <input
              type="text"
              name="titleEnglish"
              value={formData.titleEnglish}
              onChange={handleInputChange}
              placeholder="Kuwait Formula 4 Championship"
              required
              className="form-input"
            />
          </div>

          {/* الوصف */}
          <div className="form-group">
            <label>📝 وصف الحدث</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="اكتب وصفاً مفصلاً عن السباق..."
              required
              className="form-textarea"
              rows="4"
            />
          </div>

          {/* نوع السباق */}
          <div className="form-group">
            <label>🏁 نوع السباق</label>
            <select
              name="raceType"
              value={formData.raceType}
              onChange={handleInputChange}
              required
              className="form-select"
            >
              {raceTypeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.icon} {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* المسار */}
          <div className="form-group">
            <label>🛣️ المسار</label>
            <select
              name="track"
              value={formData.track}
              onChange={handleInputChange}
              required
              className="form-select"
            >
              {trackOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.icon} {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* التواريخ */}
          <div className="form-row">
            <div className="form-group">
              <label>📅 تاريخ البداية</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                required
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>📅 تاريخ النهاية</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                required
                className="form-input"
              />
            </div>
          </div>

          {/* الأوقات */}
          <div className="form-row">
            <div className="form-group">
              <TimePicker
                name="startTime"
                value={formData.startTime}
                onChange={handleInputChange}
                label="⏰ وقت البداية"
                required
              />
            </div>
            <div className="form-group">
              <TimePicker
                name="endTime"
                value={formData.endTime}
                onChange={handleInputChange}
                label="⏰ وقت النهاية"
                required
              />
            </div>
          </div>

          {/* أنواع المارشال */}
          <div className="form-group">
            <label>👥 أنواع المارشال المطلوبة</label>
            <div className="marshal-types-grid">
              {marshalOptions.map(option => (
                <div key={option.value} className="marshal-type-card">
                  <div className="marshal-type-header">
                    <span className="marshal-icon">{option.icon}</span>
                    <span className="marshal-label">{option.label}</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    placeholder="العدد"
                    onChange={(e) => handleMarshalTypeChange(option.value, e.target.value)}
                    className="marshal-count-input"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* معاينة المارشال المختارة */}
          {formData.marshalTypes.length > 0 && (
            <div className="selected-marshals">
              <h3>👥 المارشال المطلوبة:</h3>
              <div className="marshal-summary">
                {formData.marshalTypes.map(marshal => {
                  const option = marshalOptions.find(opt => opt.type === marshal.type);
                  return (
                    <div key={marshal.type} className="marshal-summary-item">
                      <span>{option?.icon} {option?.label}</span>
                      <span className="marshal-count">{marshal.count} مارشال</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <button 
            type="submit" 
            disabled={isLoading}
            className="kmt-button submit-btn"
          >
            {isLoading ? '⏳ جاري الإنشاء...' : '🏁 إنشاء السباق'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateRace;