import React, { useState, useEffect } from 'react';
import '../pages/KMT-Original.css';
import './ApplicationsManagement.css';

const ApplicationsManagement = ({ onPageChange }) => {
  const [applications, setApplications] = useState([]);
  const [races, setRaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, approved, rejected
  const [selectedRace, setSelectedRace] = useState('');

  useEffect(() => {
    fetchApplications();
    fetchRaces();
  }, []);

  // جلب جميع الطلبات
  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams();
      
      if (filter !== 'all') queryParams.append('status', filter);
      if (selectedRace) queryParams.append('raceId', selectedRace);
      
      const response = await fetch(`https://kmt-event-management.onrender.com/api/applications?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setApplications(data);
      } else {
        console.error('خطأ في جلب الطلبات');
      }
    } catch (error) {
      console.error('خطأ في الشبكة:', error);
    } finally {
      setLoading(false);
    }
  };

  // جلب السباقات
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
    }
  };

  // الرد على الطلب (قبول/رفض)
  const respondToApplication = async (applicationId, status, managerNotes = '', assignedPosition = '') => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://kmt-event-management.onrender.com/api/applications/${applicationId}/respond`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status,
          managerNotes,
          assignedPosition
        })
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.message);
        fetchApplications(); // إعادة تحميل الطلبات
      } else {
        const error = await response.json();
        alert(error.message || 'حدث خطأ');
      }
    } catch (error) {
      console.error('خطأ في الرد على الطلب:', error);
      alert('حدث خطأ في الاتصال');
    }
  };

  // تطبيق الفلاتر
  useEffect(() => {
    fetchApplications();
  }, [filter, selectedRace]); // eslint-disable-line react-hooks/exhaustive-deps

  // حساب الإحصائيات
  const stats = {
    total: applications.length,
    pending: applications.filter(app => app.status === 'pending').length,
    approved: applications.filter(app => app.status === 'approved').length,
    rejected: applications.filter(app => app.status === 'rejected').length
  };

  if (loading) {
    return (
      <div className="kmt-page">
        <div className="loading">⏳ جاري تحميل الطلبات...</div>
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
          ← العودة للوحة التحكم
        </button>
        <h1 className="kmt-title">📋 إدارة طلبات المارشال</h1>
      </div>

      <div className="kmt-container">
        {/* إحصائيات سريعة */}
        <div className="stats-cards">
          <div className="stat-card total">
            <div className="stat-icon">📊</div>
            <div className="stat-info">
              <h3>{stats.total}</h3>
              <p>إجمالي الطلبات</p>
            </div>
          </div>
          
          <div className="stat-card pending">
            <div className="stat-icon">⏳</div>
            <div className="stat-info">
              <h3>{stats.pending}</h3>
              <p>قيد المراجعة</p>
            </div>
          </div>
          
          <div className="stat-card approved">
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <h3>{stats.approved}</h3>
              <p>مقبولة</p>
            </div>
          </div>
          
          <div className="stat-card rejected">
            <div className="stat-icon">❌</div>
            <div className="stat-info">
              <h3>{stats.rejected}</h3>
              <p>مرفوضة</p>
            </div>
          </div>
        </div>

        {/* فلاتر البحث */}
        <div className="filters-section">
          <div className="filter-group">
            <label>🔍 فلترة حسب الحالة:</label>
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">جميع الطلبات</option>
              <option value="pending">قيد المراجعة</option>
              <option value="approved">مقبولة</option>
              <option value="rejected">مرفوضة</option>
            </select>
          </div>

          <div className="filter-group">
            <label>🏁 فلترة حسب السباق:</label>
            <select 
              value={selectedRace} 
              onChange={(e) => setSelectedRace(e.target.value)}
              className="filter-select"
            >
              <option value="">جميع السباقات</option>
              {races.map(race => (
                <option key={race._id} value={race._id}>
                  {race.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* قائمة الطلبات */}
        {applications.length === 0 ? (
          <div className="no-data">
            <h3>📭 لا توجد طلبات</h3>
            <p>لا توجد طلبات تطابق الفلاتر المحددة</p>
          </div>
        ) : (
          <div className="applications-list">
            {applications.map(application => (
              <ApplicationCard
                key={application._id}
                application={application}
                onRespond={respondToApplication}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// مكون بطاقة الطلب
const ApplicationCard = ({ application, onRespond }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [managerNotes, setManagerNotes] = useState('');
  const [assignedPosition, setAssignedPosition] = useState('');

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'approved': return '✅';
      case 'rejected': return '❌';
      case 'withdrawn': return '🔄';
      default: return '📋';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'قيد المراجعة';
      case 'approved': return 'مقبول';
      case 'rejected': return 'مرفوض';
      case 'withdrawn': return 'مسحوب';
      default: return 'غير محدد';
    }
  };

  const handleApprove = () => {
    if (window.confirm('هل أنت متأكد من قبول هذا الطلب؟')) {
      onRespond(application._id, 'approved', managerNotes, assignedPosition);
    }
  };

  const handleReject = () => {
    const reason = window.prompt('سبب الرفض (اختياري):');
    if (reason !== null) { // إذا لم يضغط إلغاء
      onRespond(application._id, 'rejected', reason || managerNotes);
    }
  };

  return (
    <div className={`application-card ${application.status}`}>
      <div className="application-header">
        <div className="applicant-info">
          <h3>{application.applicant.fullName}</h3>
          <p>{application.applicant.email}</p>
          <p>📱 {application.applicant.phone}</p>
        </div>
        
        <div className="race-info">
          <h4>{application.race.title}</h4>
          <p>{new Date(application.race.startDate).toLocaleDateString('en-GB')}</p>
        </div>
        
        <div className={`status-badge ${application.status}`}>
          {getStatusIcon(application.status)} {getStatusText(application.status)}
        </div>
      </div>

      <div className="application-content">
        {application.message && (
          <div className="application-message">
            <strong>رسالة المتقدم:</strong>
            <p>"{application.message}"</p>
          </div>
        )}

        <div className="application-meta">
          <p><strong>تاريخ التقديم:</strong> {new Date(application.appliedAt).toLocaleString('ar-SA')}</p>
          {application.applicant.experience && (
            <p><strong>مستوى الخبرة:</strong> {application.applicant.experience}</p>
          )}
          {application.applicant.specializations && application.applicant.specializations.length > 0 && (
            <p><strong>التخصصات:</strong> {application.applicant.specializations.join(', ')}</p>
          )}
        </div>

        <button 
          className="toggle-details-btn"
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? '🔼 إخفاء التفاصيل' : '🔽 عرض التفاصيل'}
        </button>

        {showDetails && (
          <div className="application-details">
            {application.status === 'pending' && (
              <div className="response-section">
                <h4>الرد على الطلب:</h4>
                
                <div className="input-group">
                  <label>الموقع المخصص:</label>
                  <input
                    type="text"
                    value={assignedPosition}
                    onChange={(e) => setAssignedPosition(e.target.value)}
                    placeholder="مثال: مارشال الحلبة الرئيسية"
                    className="form-input"
                  />
                </div>

                <div className="input-group">
                  <label>ملاحظات المدير:</label>
                  <textarea
                    value={managerNotes}
                    onChange={(e) => setManagerNotes(e.target.value)}
                    placeholder="ملاحظات أو تعليمات إضافية..."
                    className="form-textarea"
                    rows="3"
                  />
                </div>

                <div className="action-buttons">
                  <button 
                    className="approve-btn"
                    onClick={handleApprove}
                  >
                    ✅ قبول الطلب
                  </button>
                  <button 
                    className="reject-btn"
                    onClick={handleReject}
                  >
                    ❌ رفض الطلب
                  </button>
                </div>
              </div>
            )}

            {application.status !== 'pending' && (
              <div className="response-info">
                <h4>معلومات الرد:</h4>
                <p><strong>تاريخ الرد:</strong> {new Date(application.respondedAt).toLocaleString('ar-SA')}</p>
                {application.assignedPosition && (
                  <p><strong>الموقع المخصص:</strong> {application.assignedPosition}</p>
                )}
                {application.managerNotes && (
                  <p><strong>ملاحظات المدير:</strong> {application.managerNotes}</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicationsManagement;