import React, { useState } from 'react';
import './KMT-Original.css';

const MarshalRegistration = ({ onPageChange }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    dateOfBirth: '',
    nationality: '',
    nationalId: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // التحقق من صحة البيانات
    if (formData.password !== formData.confirmPassword) {
      setMessage('كلمات المرور غير متطابقة');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setMessage('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      setLoading(false);
      return;
    }

    try {
      const registrationData = {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        userType: 'marshall'
      };

      const response = await fetch('https://kmt-event-management.onrender.com/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      });

      const data = await response.json();

      if (response.ok) {
        // حفظ Token و بيانات المستخدم
        localStorage.setItem('token', data.token);
        
        // إضافة البيانات الإضافية للمارشال
        const enhancedUser = {
          ...data.user,
          marshallInfo: {
            dateOfBirth: formData.dateOfBirth,
            nationality: formData.nationality,
            nationalId: formData.nationalId,
            profileImage: '',
            emergencyContact: {
              name: '',
              phone: ''
            }
          }
        };

        localStorage.setItem('userData', JSON.stringify(enhancedUser));

        setMessage('✅ تم إنشاء الحساب بنجاح! سيتم توجيهك للملف الشخصي لاستكمال بياناتك');
        
        // تحديث البيانات في الخادم
        setTimeout(async () => {
          try {
            const API_URL = process.env.REACT_APP_API_URL || 'https://kmt-event-management.onrender.com';
            await fetch(`${API_URL}/api/users/profile`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${data.token}`
              },
              body: JSON.stringify({
                marshallInfo: {
                  dateOfBirth: formData.dateOfBirth,
                  nationality: formData.nationality,
                  nationalId: formData.nationalId
                }
              })
            });
          } catch (error) {
            console.log('خطأ في تحديث البيانات الإضافية:', error);
          }
        }, 500);

        // الانتقال إلى لوحة التحكم
        setTimeout(() => {
          onPageChange('worker-dashboard', enhancedUser);
        }, 2000);
      } else {
        setMessage(data.message || 'حدث خطأ أثناء إنشاء الحساب');
      }
    } catch (error) {
      console.error('خطأ في التسجيل:', error);
      setMessage('خطأ في الاتصال بالخادم');
    }

    setLoading(false);
  };

  return (
    <div className="kmt-page">
      <div className="kmt-header">
        <button 
          onClick={() => onPageChange('auth')}
          className="kmt-back-btn"
        >
          ← العودة لتسجيل الدخول
        </button>
        <h1 className="kmt-title">🏁 تسجيل مارشال جديد</h1>
      </div>

      <div className="kmt-container">
        <div className="profile-form-container">
          {message && (
            <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-section">
              <h3>📝 البيانات الأساسية</h3>
              
              <div className="form-group">
                <label>الاسم الكامل *</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                  placeholder="أدخل الاسم الكامل"
                />
              </div>

              <div className="form-group">
                <label>البريد الإلكتروني *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="example@email.com"
                />
              </div>

              <div className="form-group">
                <label>رقم الهاتف *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  placeholder="مثال: 99887766"
                />
              </div>
            </div>

            <div className="form-section">
              <h3>🔒 كلمة المرور</h3>
              
              <div className="form-group">
                <label>كلمة المرور *</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  minLength={6}
                  placeholder="6 أحرف على الأقل"
                />
              </div>

              <div className="form-group">
                <label>تأكيد كلمة المرور *</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  placeholder="أعد كتابة كلمة المرور"
                />
              </div>
            </div>

            <div className="form-section">
              <h3>🆔 بيانات الهوية</h3>
              
              <div className="form-group">
                <label>تاريخ الميلاد</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>الجنسية</label>
                <input
                  type="text"
                  name="nationality"
                  value={formData.nationality}
                  onChange={handleInputChange}
                  placeholder="مثال: كويتي، سعودي، إماراتي"
                />
              </div>

              <div className="form-group">
                <label>رقم الهوية / الإقامة</label>
                <input
                  type="text"
                  name="nationalId"
                  value={formData.nationalId}
                  onChange={handleInputChange}
                  placeholder="رقم الهوية أو الإقامة"
                />
              </div>
            </div>

            <div className="form-actions">
              <button 
                type="submit" 
                className="save-btn"
                disabled={loading}
              >
                {loading ? 'جاري إنشاء الحساب...' : '🏁 إنشاء حساب مارشال'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MarshalRegistration;