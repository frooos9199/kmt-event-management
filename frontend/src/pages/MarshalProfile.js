import React, { useState, useEffect } from 'react';
import './KMT-Original.css';

const MarshalProfile = ({ onPageChange }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    profileImage: '',
    dateOfBirth: '',
    nationality: '',
    nationalId: '',
    trackSpecializations: [],
    medicalInfo: {
      bloodType: '',
      allergies: '',
      medications: ''
    },
    experienceLevel: 'beginner',
    certifications: [],
    languages: []
  });

  // التخصصات المتاحة
  const trackOptions = [
    'الحلبة الرئيسية',
    'حلبة الكارتينغ',
    'مضمار الدراق',
    'حلبة الدريفت',
    'ساحة الدريفت',
    'مضمار الموتوكروس',
    'حلبة التدريب'
  ];

  // مستويات الخبرة
  const experienceLevels = [
    { value: 'beginner', label: 'مبتدئ' },
    { value: 'intermediate', label: 'متوسط' },
    { value: 'advanced', label: 'متقدم' },
    { value: 'expert', label: 'خبير' }
  ];

  // فصائل الدم
  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  // اللغات
  const languageOptions = ['العربية', 'الإنجليزية', 'الفرنسية', 'الألمانية', 'الإسبانية'];

  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      
      // تحميل البيانات الموجودة إذا كانت متوفرة
      if (parsedUser.marshallInfo) {
        setFormData({
          profileImage: parsedUser.marshallInfo.profileImage || '',
          dateOfBirth: parsedUser.marshallInfo.dateOfBirth || '',
          nationality: parsedUser.marshallInfo.nationality || '',
          nationalId: parsedUser.marshallInfo.nationalId || '',
          trackSpecializations: parsedUser.marshallInfo.trackSpecializations || [],
          medicalInfo: parsedUser.marshallInfo.medicalInfo || {
            bloodType: '', allergies: '', medications: ''
          },
          experienceLevel: parsedUser.marshallInfo.experienceLevel || 'beginner',
          certifications: parsedUser.marshallInfo.certifications || [],
          languages: parsedUser.marshallInfo.languages || []
        });
      }
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSpecializationChange = (specialization) => {
    setFormData(prev => ({
      ...prev,
      trackSpecializations: prev.trackSpecializations.includes(specialization)
        ? prev.trackSpecializations.filter(s => s !== specialization)
        : [...prev.trackSpecializations, specialization]
    }));
  };

  const handleLanguageChange = (language) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.includes(language)
        ? prev.languages.filter(l => l !== language)
        : [...prev.languages, language]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';
      const response = await fetch(`${API_URL}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ marshallInfo: formData })
      });

      if (response.ok) {
        const updatedUser = await response.json();
        localStorage.setItem('userData', JSON.stringify(updatedUser.user));
        alert('تم حفظ المعلومات بنجاح!');
        onPageChange('worker-dashboard');
      } else {
        const error = await response.json();
        alert(error.message || 'حدث خطأ أثناء الحفظ');
      }
    } catch (error) {
      console.error('خطأ:', error);
      alert('حدث خطأ في الاتصال بالخادم');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="kmt-page">
      <div className="kmt-header">
        <button 
          onClick={() => onPageChange('worker-dashboard')}
          className="kmt-back-btn"
        >
          ← العودة للرئيسية
        </button>
        <h1 className="kmt-title">
          🏁 المعلومات الشخصية - {user.marshalId || 'مارشال KMT'}
        </h1>
      </div>

      <div className="kmt-container">
        <form onSubmit={handleSubmit} className="marshal-profile-form">
          
          {/* المعلومات الأساسية */}
          <div className="form-section">
            <h2>📋 المعلومات الأساسية</h2>
            
            <div className="form-row">
              <div className="form-group">
                <label>🎂 تاريخ الميلاد</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>🌍 الجنسية</label>
                <input
                  type="text"
                  name="nationality"
                  value={formData.nationality}
                  onChange={handleInputChange}
                  placeholder="مثال: كويتي"
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label>🆔 رقم الهوية المدنية</label>
              <input
                type="text"
                name="nationalId"
                value={formData.nationalId}
                onChange={handleInputChange}
                placeholder="رقم الهوية المدنية"
                className="form-input"
              />
            </div>
          </div>

          {/* التخصصات */}
          <div className="form-section">
            <h2>🏁 التخصصات في الحلبات</h2>
            <div className="specializations-grid">
              {trackOptions.map(track => (
                <div key={track} className="specialization-card">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.trackSpecializations.includes(track)}
                      onChange={() => handleSpecializationChange(track)}
                    />
                    <span className="checkmark"></span>
                    {track}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* مستوى الخبرة */}
          <div className="form-section">
            <h2>📈 مستوى الخبرة</h2>
            <select
              name="experienceLevel"
              value={formData.experienceLevel}
              onChange={handleInputChange}
              className="form-select"
            >
              {experienceLevels.map(level => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>

          {/* المعلومات الطبية */}
          <div className="form-section">
            <h2>🏥 المعلومات الطبية</h2>
            <div className="form-row">
              <div className="form-group">
                <label>فصيلة الدم</label>
                <select
                  name="medicalInfo.bloodType"
                  value={formData.medicalInfo.bloodType}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  <option value="">اختر فصيلة الدم</option>
                  {bloodTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>الحساسيات</label>
                <input
                  type="text"
                  name="medicalInfo.allergies"
                  value={formData.medicalInfo.allergies}
                  onChange={handleInputChange}
                  placeholder="أي حساسيات معروفة"
                  className="form-input"
                />
              </div>
            </div>
            <div className="form-group">
              <label>الأدوية المستمرة</label>
              <textarea
                name="medicalInfo.medications"
                value={formData.medicalInfo.medications}
                onChange={handleInputChange}
                placeholder="أي أدوية تتناولها بانتظام"
                className="form-textarea"
                rows="3"
              />
            </div>
          </div>

          {/* اللغات */}
          <div className="form-section">
            <h2>🗣️ اللغات</h2>
            <div className="languages-grid">
              {languageOptions.map(language => (
                <div key={language} className="language-card">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.languages.includes(language)}
                      onChange={() => handleLanguageChange(language)}
                    />
                    <span className="checkmark"></span>
                    {language}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="kmt-button submit-btn"
          >
            {isLoading ? '⏳ جاري الحفظ...' : '💾 حفظ المعلومات'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default MarshalProfile;