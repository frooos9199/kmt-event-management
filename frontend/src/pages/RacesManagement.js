import React, { useState, useEffect } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import './KMT-Original.css';

const RacesManagement = ({ onPageChange }) => {
  const [races, setRaces] = useState([]);
  const [loading, setLoading] = useState(false); // تبدأ بدون loading
  const [selectedRace, setSelectedRace] = useState(null);
  const [applications, setApplications] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [pageReady, setPageReady] = useState(false);

  useEffect(() => {
    // عرض الصفحة فوراً
    setPageReady(true);
    
    // جلب البيانات في الخلفية
    setTimeout(() => {
      fetchRaces();
      fetchCurrentUser();
    }, 100);
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const response = await fetch('https://kmt-event-management.onrender.com/api/auth/verify', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentUser(data.user);
      }
    } catch (err) {
      console.error('خطأ في جلب بيانات المستخدم:', err);
    }
  };

  const fetchRaces = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://kmt-event-management.onrender.com/api/races', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRaces(data);
      }
    } catch (error) {
      console.error('خطأ في جلب السباقات:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRaceApplications = async (raceId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://kmt-event-management.onrender.com/api/applications/race/${raceId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setApplications(data);
      }
    } catch (error) {
      console.error('خطأ في جلب طلبات السباق:', error);
    }
  };

  const updateRaceStatus = async (raceId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://kmt-event-management.onrender.com/api/races/${raceId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        alert('تم تحديث حالة السباق بنجاح');
        fetchRaces();
      } else {
        alert('حدث خطأ في تحديث الحالة');
      }
    } catch (error) {
      console.error('خطأ في تحديث الحالة:', error);
      alert('حدث خطأ في الاتصال');
    }
  };

  const deleteRace = async (raceId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا السباق؟')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://kmt-event-management.onrender.com/api/races/${raceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert('تم حذف السباق بنجاح');
        fetchRaces();
        setSelectedRace(null);
      } else {
        alert('حدث خطأ في حذف السباق');
      }
    } catch (error) {
      console.error('خطأ في حذف السباق:', error);
      alert('حدث خطأ في الاتصال');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'مجدول': return '#007bff';
      case 'قيد التنفيذ': return '#28a745';
      case 'مكتمل': return '#6c757d';
      case 'ملغي': return '#dc3545';
      case 'مؤجل': return '#ffc107';
      default: return '#6c757d';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!pageReady) {
    return (
      <div className="page-loading-overlay">
        <LoadingSpinner message="جاري تحضير صفحة إدارة السباقات..." size="large" />
      </div>
    );
  }

  return (
    <div className="kmt-page">
      <div className="kmt-header">
        <button 
          onClick={() => onPageChange('manager-dashboard')}
          className="kmt-back-btn"
        >
          ← العودة
        </button>
        <h1 className="kmt-title">🏁 إدارة السباقات</h1>
        <button 
          onClick={() => onPageChange('create-race')}
          className="kmt-button primary"
        >
          + إنشاء سباق جديد
        </button>
      </div>

      <div className="kmt-container">
        <div className="races-management-layout">
          {/* قائمة السباقات */}
          <div className="races-list">
            <h2>قائمة السباقات ({races.length})</h2>
            
            {loading && races.length === 0 ? (
              <div className="inline-loading" style={{textAlign: 'center', padding: '40px'}}>
                <LoadingSpinner message="جاري تحميل السباقات..." size="medium" />
              </div>
            ) : races.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🏁</div>
                <h3>لا توجد سباقات</h3>
                <p>ابدأ بإنشاء سباق جديد</p>
                <button 
                  onClick={() => onPageChange('create-race')}
                  className="kmt-button primary"
                >
                  إنشاء سباق جديد
                </button>
              </div>
            ) : (
              <div className="races-grid">
                {races.map(race => (
                  <div 
                    key={race._id} 
                    className={`race-card ${selectedRace?._id === race._id ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedRace(race);
                      fetchRaceApplications(race._id);
                    }}
                  >
                    <div className="race-header">
                      <h3>{race.title}</h3>
                      <span 
                        className="race-status"
                        style={{ backgroundColor: getStatusColor(race.status) }}
                      >
                        {race.status}
                      </span>
                    </div>
                    
                    <div className="race-details">
                      <p><strong>النوع:</strong> {race.raceType}</p>
                      <p><strong>المسار:</strong> {race.track}</p>
                      <p><strong>التاريخ:</strong> {formatDate(race.startDate)}</p>
                      <p><strong>المارشال المطلوب:</strong> {race.requiredMarshalls}</p>
                    </div>
                    
                    <div className="race-actions">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          fetchRaceApplications(race._id);
                          setSelectedRace(race);
                        }}
                        className="btn-view"
                      >
                        عرض التفاصيل
                      </button>

                      {/* إظهار زر الحذف فقط إذا كان المدير نفسه هو منشئ السباق */}
                      {currentUser && currentUser.userType === 'manager' &&
                        String(currentUser.id) === String(race.createdBy?._id) && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteRace(race._id);
                          }}
                          className="btn-delete"
                          title="حذف السباق"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* تفاصيل السباق المحدد */}
          {selectedRace && (
            <div className="race-details-panel">
              <div className="panel-header">
                <h2>{selectedRace.title}</h2>
                <button 
                  onClick={() => setSelectedRace(null)}
                  className="close-btn"
                >
                  ✕
                </button>
              </div>

              <div className="race-info">
                <div className="info-section">
                  <h3>معلومات السباق</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>العنوان العربي:</label>
                      <span>{selectedRace.title}</span>
                    </div>
                    <div className="info-item">
                      <label>العنوان الإنجليزي:</label>
                      <span>{selectedRace.titleEnglish}</span>
                    </div>
                    <div className="info-item">
                      <label>النوع:</label>
                      <span>{selectedRace.raceType}</span>
                    </div>
                    <div className="info-item">
                      <label>المسار:</label>
                      <span>{selectedRace.track}</span>
                    </div>
                    <div className="info-item">
                      <label>تاريخ البداية:</label>
                      <span>{formatDate(selectedRace.startDate)}</span>
                    </div>
                    <div className="info-item">
                      <label>تاريخ النهاية:</label>
                      <span>{formatDate(selectedRace.endDate)}</span>
                    </div>
                    <div className="info-item">
                      <label>المارشال المطلوب:</label>
                      <span>{selectedRace.requiredMarshalls}</span>
                    </div>
                    <div className="info-item">
                      <label>الحالة:</label>
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(selectedRace.status) }}
                      >
                        {selectedRace.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="info-section">
                  <h3>الوصف</h3>
                  <p>{selectedRace.description}</p>
                </div>

                <div className="info-section">
                  <h3>أنواع المارشال المطلوبة</h3>
                  {selectedRace.marshalTypes && selectedRace.marshalTypes.length > 0 ? (
                    <div className="marshal-types">
                      {selectedRace.marshalTypes.map((type, index) => (
                        <div key={index} className="marshal-type">
                          <span className="type-name">{type.type}</span>
                          <span className="type-count">{type.count} مارشال</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>لا توجد تفاصيل أنواع المارشال</p>
                  )}
                </div>

                <div className="info-section">
                  <h3>طلبات المشاركة ({applications.length})</h3>
                  {applications.length > 0 ? (
                    <div className="applications-list">
                      {applications.map(app => (
                        <div key={app._id} className="application-item">
                          <div className="applicant-info">
                            <strong>{app.applicant.fullName}</strong>
                            <span className="marshal-id">{app.applicant.marshallInfo?.marshalId}</span>
                          </div>
                          <div className="application-status">
                            <span className={`status-badge ${app.status}`}>
                              {app.status === 'pending' ? 'قيد المراجعة' : 
                               app.status === 'approved' ? 'مقبول' : 'مرفوض'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>لا توجد طلبات مشاركة</p>
                  )}
                </div>

                <div className="race-management-actions">
                  <h3>إجراءات الإدارة</h3>
                  <div className="action-buttons">
                    <select 
                      onChange={(e) => updateRaceStatus(selectedRace._id, e.target.value)}
                      value={selectedRace.status}
                      className="status-select"
                    >
                      <option value="مجدول">مجدول</option>
                      <option value="قيد التنفيذ">قيد التنفيذ</option>
                      <option value="مكتمل">مكتمل</option>
                      <option value="ملغي">ملغي</option>
                      <option value="مؤجل">مؤجل</option>
                    </select>
                    
                    <button 
                      onClick={() => onPageChange('applications-management')}
                      className="kmt-button secondary"
                    >
                      إدارة الطلبات
                    </button>
                    
                    {currentUser && currentUser.userType === 'manager' && String(currentUser.id) === String(selectedRace.createdBy?._id) && (
                      <button 
                        onClick={() => deleteRace(selectedRace._id)}
                        className="kmt-button danger"
                      >
                        حذف السباق
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RacesManagement;