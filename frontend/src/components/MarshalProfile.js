import React, { useState, useEffect } from 'react';
import '../pages/KMT-Original.css';

const MarshalProfile = ({ onPageChange, onProfileUpdate }) => {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    nationality: '',
    nationalId: '',
    profileImage: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setFormData({
        fullName: parsedUser.fullName || '',
        email: parsedUser.email || '',
        phone: parsedUser.phone || '',
        dateOfBirth: parsedUser.marshallInfo?.dateOfBirth?.split('T')[0] || '',
        nationality: parsedUser.marshallInfo?.nationality || '',
        nationalId: parsedUser.marshallInfo?.nationalId || '',
        profileImage: parsedUser.marshallInfo?.profileImage || parsedUser.profileImage || ''
      });
    }
  }, []);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData({
          ...formData,
          profileImage: event.target.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      
      // إنشاء object للتحديث يحتوي فقط على البيانات المُحدثة
      const updateData = {
        fullName: formData.fullName,
        phone: formData.phone,
        marshallInfo: {}
      };

      // إضافة فقط الحقول المُحدثة في marshallInfo
      if (formData.profileImage) {
        updateData.marshallInfo.profileImage = formData.profileImage;
      }
      if (formData.dateOfBirth) {
        updateData.marshallInfo.dateOfBirth = formData.dateOfBirth;
      }
      if (formData.nationality) {
        updateData.marshallInfo.nationality = formData.nationality;
      }
      if (formData.nationalId) {
        updateData.marshallInfo.nationalId = formData.nationalId;
      }

      const API_URL = process.env.REACT_APP_API_URL || 'https://kmt-event-management.onrender.com';
      const response = await fetch(`${API_URL}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        const updatedUser = await response.json();
        
        // تحديث localStorage مع البيانات المُحدثة
        const currentUserData = JSON.parse(localStorage.getItem('userData') || '{}');
        const mergedUserData = {
          ...currentUserData,
          ...updatedUser.user,
          marshallInfo: {
            ...currentUserData.marshallInfo,
            ...updatedUser.user.marshallInfo
          }
        };
        
        localStorage.setItem('userData', JSON.stringify(mergedUserData));
        
        // تحديث حالة المستخدم الحالية
        setUser(mergedUserData);
        
        setMessage('تم حفظ المعلومات بنجاح! ✅');
        
        // استدعاء دالة تحديث البيانات في المكون الأب
        if (onProfileUpdate) {
          onProfileUpdate();
        }
        
        // العودة للوحة التحكم بعد التحديث
        setTimeout(() => {
          onPageChange('dashboard');
        }, 1500);
      } else {
        const error = await response.json();
        setMessage(error.message || 'حدث خطأ أثناء حفظ المعلومات');
      }
    } catch (error) {
      console.error('خطأ في حفظ الملف الشخصي:', error);
      setMessage('حدث خطأ في الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div className="loading">جاري التحميل...</div>;
  }

  return (
    <div className="kmt-page">
      <div className="kmt-header">
        <button 
          onClick={() => onPageChange('worker-dashboard')}
          className="kmt-back-btn"
        >
          ← العودة
        </button>
        <h1 className="kmt-title">👤 الملف الشخصي</h1>
      </div>

      <div className="kmt-container">
        <div className="profile-form-container">
          {message && (
            <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="profile-form">
            {/* صورة الملف الشخصي */}
            <div className="profile-image-section">
              <div className="profile-image-container large">
                <img 
                  src={formData.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.fullName)}&background=e31e24&color=fff&size=150`}
                  alt="صورة الملف الشخصي"
                  className="profile-image"
                />
                <label htmlFor="profileImage" className="change-image-btn">
                  📷 تغيير الصورة
                </label>
                <input
                  type="file"
                  id="profileImage"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
              </div>
            </div>

            {/* المعلومات الأساسية */}
            <div className="form-section">
              <h3>📋 المعلومات الأساسية</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label>الاسم الكامل *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>البريد الإلكتروني</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    disabled
                    className="form-input disabled"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>رقم الهاتف *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="form-input"
                    placeholder="+965 xxxxxxxx"
                  />
                </div>

                <div className="form-group">
                  <label>تاريخ الميلاد</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </div>
              </div>
            </div>

            {/* المعلومات الشخصية */}
            <div className="form-section">
              <h3>🆔 المعلومات الشخصية</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label>الجنسية</label>
                  <input
                    type="text"
                    name="nationality"
                    value={formData.nationality}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="مثال: كويتي، سعودي، إماراتي"
                  />
                </div>

                <div className="form-group">
                  <label>الرقم المدني</label>
                  <input
                    type="text"
                    name="nationalId"
                    value={formData.nationalId}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="123456789012"
                  />
                </div>
              </div>
            </div>

            {/* معلومات المارشال */}
            {user.marshallInfo && (
              <div className="form-section">
                <h3>🏁 معلومات المارشال</h3>
                <div className="marshal-info-display">
                  <p><strong>رقم المارشال:</strong> {user.marshallInfo.marshalId}</p>
                  <p><strong>مستوى الشهادة:</strong> {user.marshallInfo.certificationLevel}</p>
                  {user.marshallInfo.specializations && (
                    <p><strong>التخصصات:</strong> {user.marshallInfo.specializations.join(', ')}</p>
                  )}
                </div>
              </div>
            )}

            <div className="form-actions">
              <button 
                type="button" 
                onClick={() => onPageChange('worker-dashboard')}
                className="kmt-button secondary"
              >
                إلغاء
              </button>
              <button 
                type="submit" 
                disabled={loading}
                className="kmt-button primary"
              >
                {loading ? 'جاري الحفظ...' : 'حفظ المعلومات'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
        .profile-form-container {
          max-width: 800px;
          margin: 0 auto;
          background: white;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }

        .profile-image-section {
          text-align: center;
          margin-bottom: 2rem;
        }

        .profile-image-container.large {
          position: relative;
          display: inline-block;
        }

        .profile-image-container.large .profile-image {
          width: 150px;
          height: 150px;
          border-radius: 50%;
          object-fit: cover;
          border: 4px solid var(--kmt-secondary);
        }

        .change-image-btn {
          position: absolute;
          bottom: 0;
          right: 0;
          background: var(--kmt-secondary);
          color: white;
          border: none;
          padding: 8px 12px;
          border-radius: 20px;
          cursor: pointer;
          font-size: 0.8rem;
          transition: all 0.3s ease;
        }

        .change-image-btn:hover {
          background: #c41920;
          transform: scale(1.05);
        }

        .form-section {
          margin-bottom: 2rem;
          padding: 1.5rem;
          border: 1px solid var(--kmt-gray-medium);
          border-radius: 8px;
          background: var(--kmt-gray-light);
        }

        .form-section h3 {
          margin-bottom: 1rem;
          color: var(--kmt-primary);
          font-size: 1.2rem;
        }

        .marshal-info-display {
          background: white;
          padding: 1rem;
          border-radius: 8px;
          border-left: 4px solid var(--kmt-secondary);
        }

        .marshal-info-display p {
          margin: 0.5rem 0;
          color: var(--kmt-primary);
        }

        .message {
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1rem;
          text-align: center;
          font-weight: 500;
        }

        .message.success {
          background: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }

        .message.error {
          background: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }

        .form-input.disabled {
          background-color: #f8f9fa;
          color: #6c757d;
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          margin-top: 2rem;
          padding-top: 1rem;
          border-top: 1px solid var(--kmt-gray-medium);
        }

        @media (max-width: 768px) {
          .profile-form-container {
            padding: 1rem;
          }
          
          .form-row {
            grid-template-columns: 1fr;
          }
          
          .form-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default MarshalProfile;