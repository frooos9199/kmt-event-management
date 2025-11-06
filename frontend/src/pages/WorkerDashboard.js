import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import WorkerAnalytics from '../components/WorkerAnalytics';
import LoadingSpinner from '../components/LoadingSpinner';
import './WorkerDashboard.css';
import './KMT-Original.css';
import './Formula-Enhancement.css';
import AvailableRaces from '../components/AvailableRaces';
import MarshalProfile from '../components/MarshalProfile';

const WorkerDashboard = ({ onPageChange }) => {
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [currentPage, setCurrentPage] = useState('dashboard');

  const loadUserData = async () => {
    // جلب بيانات المستخدم من localStorage
    const userData = localStorage.getItem('userData');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      
      // محاولة جلب أحدث البيانات من الخادم
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const API_URL = process.env.REACT_APP_API_URL || 'https://kmt-event-management.onrender.com';
          const response = await fetch(`${API_URL}/api/users/profile`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const serverUser = await response.json();
            // دمج البيانات من localStorage مع البيانات من الخادم
            const mergedUser = {
              ...parsedUser,
              ...serverUser.user,
              marshallInfo: {
                ...parsedUser.marshallInfo,
                ...serverUser.user.marshallInfo
              }
            };
            
            setUser(mergedUser);
            localStorage.setItem('userData', JSON.stringify(mergedUser));
            return;
          }
        }
      } catch (error) {
        console.log('استخدام البيانات المحلية:', error.message);
      }
      
      // استخدام البيانات المحلية في حالة عدم توفر الخادم
      setUser(parsedUser);
    }
  };

  const fetchRaces = () => {
    // جلب الأحداث المتاحة (مؤقت) - أحداث مدينة الكويت لرياضة المحركات
    setEvents([
      {
        id: 1,
        title: 'بطولة الفورمولا 4 السعودية - الجولة الثانية',
        date: '2025-11-15',
        time: '14:00 - 18:00',
        track: 'الحلبة الرئيسية',
        eventType: 'سباق فورمولا',
        roles: ['مارشال الحلبة', 'مارشال الأمان'],
        salary: 25, // KWD
        description: 'سباق احترافي للفورمولا 4 مع المتسابقين السعوديين والخليجيين'
      },
      {
        id: 2,
        title: 'اليوم المفتوح للكارتينغ',
        date: '2025-11-18',
        time: '09:00 - 17:00',
        track: 'حلبة الكارتينغ',
        eventType: 'تجربة قيادة',
        roles: ['مارشال كارتينغ', 'مشرف السلامة'],
        salary: 18, // KWD
        description: 'يوم مفتوح للعائلات لتجربة قيادة الكارت في بيئة آمنة'
      },
      {
        id: 3,
        title: 'بطولة الدريفت الليلية',
        date: '2025-11-22',
        time: '19:00 - 23:00',
        track: 'ساحة الدريفت',
        eventType: 'عرض دريفت',
        roles: ['مارشال دريفت', 'مارشال إطفاء'],
        salary: 30, // KWD
        description: 'عرض مثير للدريفت الاحترافي تحت الأضواء مع نخبة السائقين'
      }
    ]);
  };

  useEffect(() => {
    loadUserData();
    fetchRaces();
  }, []);

  // useEffect لمراقبة تحديثات المكونات الفرعية
  useEffect(() => {
    // إعادة تحميل البيانات عند العودة من صفحة أخرى
    const handleFocus = () => {
      loadUserData();
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadUserData();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  const handleChangePhoto = async () => {
    // إنشاء input مخفي لرفع الصور
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = async (event) => {
          const newImageUrl = event.target.result;
          
          try {
            // إرسال الصورة للخادم مع الحفاظ على جميع البيانات الموجودة
            const token = localStorage.getItem('token');
            const API_URL = process.env.REACT_APP_API_URL || 'https://kmt-event-management.onrender.com';
            const response = await fetch(`${API_URL}/api/users/profile`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                marshallInfo: {
                  profileImage: newImageUrl
                }
              })
            });

            if (response.ok) {
              const updatedData = await response.json();
              
              // دمج البيانات الجديدة مع البيانات الموجودة
              const currentUserData = JSON.parse(localStorage.getItem('userData') || '{}');
              const mergedUserData = {
                ...currentUserData,
                ...updatedData.user,
                marshallInfo: {
                  ...currentUserData.marshallInfo,
                  ...updatedData.user.marshallInfo
                }
              };
              
              // استخدام البيانات المدموجة
              setUser(mergedUserData);
              localStorage.setItem('userData', JSON.stringify(mergedUserData));
              
              console.log('تم تحديث الصورة بنجاح');
            } else {
              console.error('خطأ في حفظ الصورة');
            }
          } catch (error) {
            console.error('خطأ في رفع الصورة:', error);
          }
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  if (!user) {
    return (
      <div className="page-loading-overlay">
        <LoadingSpinner 
          message="🏎️ جاري تحميل لوحة تحكم العامل..."
          size="large"
          style="formula"
          rpm="WRK"
        />
      </div>
    );
  }

  // التنقل بين الصفحات
  if (currentPage === 'available-races') {
    return <AvailableRaces onPageChange={setCurrentPage} />;
  }

  if (currentPage === 'marshal-profile') {
    return (
      <MarshalProfile 
        onPageChange={(page) => {
          setCurrentPage(page);
          // إعادة تحميل البيانات عند العودة
          if (page === 'dashboard') {
            setTimeout(loadUserData, 100);
          }
        }}
        onProfileUpdate={() => {
          loadUserData();
        }}
      />
    );
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>🏁 مدينة الكويت لرياضة المحركات - لوحة المارشال</h1>
        <div className="user-info">
          <div className="user-welcome">
            <div className="marshal-name-section">
              <span className="marshal-name">{user.fullName}</span>
              {user.marshalId && (
                <span className="marshal-badge">🏁 {user.marshalId}</span>
              )}
            </div>
          </div>
          <button onClick={handleLogout} className="logout-btn">
            تسجيل خروج | Logout
          </button>
        </div>
      </header>

      <div className="dashboard-content">
        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-image-container">
              <img 
                src={user.marshallInfo?.profileImage || user.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=ff6b6b&color=fff&size=120&font-size=0.4&bold=true`}
                alt="صورة المارشال"
                className="profile-image"
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=ff6b6b&color=fff&size=120&font-size=0.4&bold=true`;
                }}
              />
              <button className="change-photo-btn" title="تغيير الصورة" onClick={handleChangePhoto}>
                📷
              </button>
            </div>
            <div className="profile-info">
              <div className="marshal-header">
                <h2>🏁 ملف المارشال</h2>
                {user.marshalId && (
                  <span className="marshal-id-highlight">{user.marshalId}</span>
                )}
              </div>
              <div className="marshal-details">
                <p><strong>الاسم الكامل:</strong> {user.fullName}</p>
                <p><strong>البريد الإلكتروني:</strong> {user.email}</p>
                <p><strong>الرتبة:</strong> مارشال معتمد - KMT</p>
                
                {/* عرض المعلومات الشخصية المحفوظة */}
                {user.marshallInfo && (
                  <div className="personal-info-summary">
                    {user.marshallInfo.dateOfBirth && (
                      <p><strong>تاريخ الميلاد:</strong> {new Date(user.marshallInfo.dateOfBirth).toLocaleDateString('ar-EG')}</p>
                    )}
                    {user.marshallInfo.nationality && (
                      <p><strong>الجنسية:</strong> {user.marshallInfo.nationality}</p>
                    )}
                    {user.marshallInfo.nationalId && (
                      <p><strong>رقم الهوية:</strong> {user.marshallInfo.nationalId}</p>
                    )}
                    {user.marshallInfo.experienceLevel && (
                      <p><strong>مستوى الخبرة:</strong> 
                        {user.marshallInfo.experienceLevel === 'beginner' ? 'مبتدئ' :
                         user.marshallInfo.experienceLevel === 'intermediate' ? 'متوسط' :
                         user.marshallInfo.experienceLevel === 'advanced' ? 'متقدم' : user.marshallInfo.experienceLevel}
                      </p>
                    )}
                  </div>
                )}
                
                <p><strong>حالة الحساب:</strong> 
                  <span className={`status ${user.accountStatus?.profileStatus || 'approved'}`}>
                    {user.accountStatus?.profileStatus === 'approved' ? 'معتمد ✅' : 
                     user.accountStatus?.profileStatus === 'pending' ? 'قيد المراجعة ⏳' : 
                     'معتمد ✅'}
                  </span>
                </p>
              </div>
            </div>
          </div>
          <button 
            className="complete-profile-btn"
            onClick={() => setCurrentPage('marshal-profile')}
          >
            عرض المعلومات الشخصية
          </button>
        </div>

        <div className="events-section">
          <div className="section-header">
            <h2>🏁 الفعاليات والسباقات</h2>
            <div className="header-buttons">
              <button 
                className="notifications-btn"
                onClick={() => onPageChange('notifications')}
                title="الإشعارات"
              >
                🔔 الإشعارات
              </button>
              <button 
                className="view-races-btn"
                onClick={() => setCurrentPage('available-races')}
              >
                🚀 عرض السباقات المتاحة
              </button>
            </div>
          </div>
          <div className="events-grid">
            {events.map(event => (
              <div key={event.id} className="event-card" data-track={event.track}>
                <div className="event-header">
                  <h3>{event.title}</h3>
                  <span className="event-type">{event.eventType}</span>
                </div>
                <div className="event-details">
                  <p><strong>📅 التاريخ:</strong> {event.date}</p>
                  <p><strong>🕐 الوقت:</strong> {event.time}</p>
                  <p><strong>🏁 الحلبة:</strong> {event.track}</p>
                  <p><strong>👨‍💼 الأدوار المطلوبة:</strong> {event.roles.join(', ')}</p>
                  <p><strong>💰 الراتب:</strong> {event.salary} دينار كويتي</p>
                  <p><strong>📝 الوصف:</strong> {event.description}</p>
                </div>
                <button className="apply-btn">
                  التقديم للعمل في هذا السباق
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkerDashboard;