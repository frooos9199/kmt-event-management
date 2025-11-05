import React, { useState, useEffect } from 'react';
import '../pages/KMT-Original.css';
import './AvailableRaces.css';

const AvailableRaces = ({ onPageChange }) => {
  const [races, setRaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userApplications, setUserApplications] = useState([]);

  useEffect(() => {
    fetchAvailableRaces();
    fetchUserApplications();
  }, []);

  // جلب السباقات المتاحة
  const fetchAvailableRaces = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://kmt-event-management.onrender.com/api/races', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('جميع السباقات المجلبة:', data);
        
        // فلترة السباقات المتاحة فقط
        const availableRaces = data.filter(race => {
          const raceDate = new Date(race.startDate);
          const today = new Date();
          today.setHours(0, 0, 0, 0); // بداية اليوم
          return raceDate >= today && race.status !== 'cancelled';
        });
        
        console.log('السباقات المتاحة بعد الفلترة:', availableRaces);
        setRaces(availableRaces);
      } else {
        console.error('فشل في جلب السباقات:', response.status);
      }
    } catch (error) {
      console.error('خطأ في جلب السباقات:', error);
    } finally {
      setLoading(false);
    }
  };

  // جلب طلبات المستخدم
  const fetchUserApplications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://kmt-event-management.onrender.com/api/applications/my-applications', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUserApplications(data);
      }
    } catch (error) {
      console.error('خطأ في جلب الطلبات:', error);
    }
  };

  // التقديم على السباق
  const applyForRace = async (raceId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://kmt-event-management.onrender.com/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          raceId: raceId,
          message: 'أرغب في العمل كمارشال في هذا السباق'
        })
      });

      if (response.ok) {
        alert('تم إرسال طلبك بنجاح!');
        fetchUserApplications(); // إعادة تحميل الطلبات
      } else {
        const error = await response.json();
        alert(error.message || 'حدث خطأ أثناء إرسال الطلب');
      }
    } catch (error) {
      console.error('خطأ في إرسال الطلب:', error);
      alert('حدث خطأ في الاتصال');
    }
  };

  // التحقق من حالة التقديم
  const getApplicationStatus = (raceId) => {
    const application = userApplications.find(app => app.raceId === raceId);
    return application ? application.status : null;
  };

  // أيقونة نوع السباق
  const getRaceTypeIcon = (raceType) => {
    const icons = {
      'circuit': '🏁',
      'drag': '🏎️',
      'drift': '🌪️',
      'motocross': '🏍️',
      'autocross': '⚡'
    };
    return icons[raceType] || '🏁';
  };

  // أيقونة المسار
  const getTrackIcon = (track) => {
    const icons = {
      'main_track': '🛣️',
      'drag_strip': '➡️',
      'drift_course': '🌀',
      'motocross_track': '🏔️',
      'karting_track': '🏃'
    };
    return icons[track] || '🛣️';
  };

  if (loading) {
    return (
      <div className="kmt-page">
        <div className="loading">⏳ جاري تحميل السباقات...</div>
      </div>
    );
  }

  return (
    <div className="kmt-page">
      <div className="kmt-header">
        <button 
          onClick={() => onPageChange('worker-dashboard')}
          className="kmt-back-btn"
        >
          ← العودة للوحة التحكم
        </button>
        <h1 className="kmt-title">🏁 السباقات المتاحة</h1>
      </div>

      <div className="kmt-container">
        {races.length === 0 ? (
          <div className="no-data">
            <h3>📭 لا توجد سباقات متاحة حالياً</h3>
            <p>تحقق مرة أخرى لاحقاً للسباقات الجديدة</p>
          </div>
        ) : (
          <div className="races-grid">
            {races.map(race => {
              const applicationStatus = getApplicationStatus(race._id);
              
              return (
                <div key={race._id} className="race-card">
                  <div className="race-header">
                    <div className="race-type">
                      {getRaceTypeIcon(race.raceType)} {race.raceType}
                    </div>
                    <div className="race-track">
                      {getTrackIcon(race.track)} {race.track}
                    </div>
                  </div>

                  <div className="race-content">
                    <h3 className="race-title">{race.title}</h3>
                    <h4 className="race-title-en">{race.titleEnglish}</h4>
                    <p className="race-description">{race.description}</p>

                    <div className="race-details">
                      <div className="detail-item">
                        <span className="icon">📅</span>
                        <span>
                          {new Date(race.startDate).toLocaleDateString('en-GB')} - 
                          {new Date(race.endDate).toLocaleDateString('en-GB')}
                        </span>
                      </div>
                      
                      <div className="detail-item">
                        <span className="icon">⏰</span>
                        <span>{race.startTime} - {race.endTime}</span>
                      </div>

                      <div className="detail-item">
                        <span className="icon">👥</span>
                        <span>{race.requiredMarshalls} مارشال مطلوب</span>
                      </div>

                      {race.marshalTypes && race.marshalTypes.length > 0 && (
                        <div className="marshal-types">
                          <h4>أنواع المارشال المطلوبة:</h4>
                          <div className="marshal-types-list">
                            {race.marshalTypes.map((type, index) => (
                              <div key={index} className="marshal-type-item">
                                <span className="type-name">{type.type}</span>
                                <span className="type-count">{type.count}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="race-actions">
                    {applicationStatus === 'pending' && (
                      <div className="application-status pending">
                        ⏳ قيد المراجعة
                      </div>
                    )}
                    {applicationStatus === 'approved' && (
                      <div className="application-status approved">
                        ✅ تم قبولك
                      </div>
                    )}
                    {applicationStatus === 'rejected' && (
                      <div className="application-status rejected">
                        ❌ تم الرفض
                      </div>
                    )}
                    {!applicationStatus && (
                      <button 
                        className="apply-btn"
                        onClick={() => applyForRace(race._id)}
                      >
                        🚀 تقدم للعمل
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AvailableRaces;