import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import LoadingSpinner from '../components/LoadingSpinner';
import './MarshalsView.css';
import MarshalCard from '../components/MarshalCard';
import './KMT-Original.css';
import '../styles/MarshalCard.css';

const MarshalsView = ({ onPageChange }) => {
  const [marshals, setMarshals] = useState([]);
  const [filteredMarshals, setFilteredMarshals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMarshal, setSelectedMarshal] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [recentUpdates, setRecentUpdates] = useState([]);

  useEffect(() => {
    fetchMarshals();
    
    // تحديث البيانات دورياً كل 30 ثانية
    const interval = setInterval(() => {
      fetchMarshals();
    }, 30000);

    // مستمع لأحداث الصفحة لتحديث البيانات عند العودة للصفحة
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchMarshals();
      }
    };

    const handleFocus = () => {
      fetchMarshals();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const fetchMarshals = async () => {
    try {
      const token = localStorage.getItem('token');
      const API_URL = process.env.REACT_APP_API_URL || 'https://kmt-event-management.onrender.com';
      const response = await fetch(`${API_URL}/api/users/marshals`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const marshalsArray = Array.isArray(data) ? data : (data.marshals || []);
        
        // ترتيب المارشال حسب آخر تحديث
        const sortedMarshals = marshalsArray.sort((a, b) => {
          const dateA = new Date(a.updatedAt || a.createdAt || 0);
          const dateB = new Date(b.updatedAt || b.createdAt || 0);
          return dateB - dateA;
        });
        
        // تتبع التحديثات الحديثة
        const now = new Date();
        const thirtyMinutesAgo = new Date(now - 30 * 60 * 1000);
        const recentlyUpdated = sortedMarshals.filter(marshal => {
          const updateTime = new Date(marshal.updatedAt || marshal.createdAt || 0);
          return updateTime > thirtyMinutesAgo && marshal.updatedAt;
        });
        
        setRecentUpdates(recentlyUpdated);
        setMarshals(sortedMarshals);
        setFilteredMarshals(sortedMarshals);
      } else {
        console.error('خطأ في جلب المارشال');
      }
    } catch (error) {
      console.error('خطأ:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getExperienceLabel = (level) => {
    const levels = {
      'beginner': 'مبتدئ',
      'intermediate': 'متوسط',
      'advanced': 'متقدم',
      'expert': 'خبير'
    };
    return levels[level] || 'غير محدد';
  };

  const getExperienceColor = (level) => {
    const colors = {
      'beginner': '#28a745',
      'intermediate': '#ffc107',
      'advanced': '#fd7e14',
      'expert': '#dc3545'
    };
    return colors[level] || '#6c757d';
  };

  const handleViewDetails = (marshal) => {
    setSelectedMarshal(marshal);
    setShowModal(true);
  };

  const handleContact = (marshal) => {
    // فتح نافذة التواصل
    alert(`التواصل مع ${marshal.fullName}\nرقم الهاتف: ${marshal.phone || 'غير متوفر'}`);
  };

  const handleAssign = (marshal) => {
    // الانتقال لصفحة تعيين السباق
    alert(`تعيين ${marshal.fullName} في سباق جديد`);
  };

  const handleEdit = (marshal) => {
    // فتح نافذة التعديل
    alert(`تعديل بيانات ${marshal.fullName}`);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedMarshal(null);
  };

  if (isLoading) {
    return (
      <div className="page-loading-overlay">
        <LoadingSpinner 
          message="👥 جاري تحميل بيانات المارشال..."
          size="large"
          style="formula"
          rpm="MAR"
        />
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
          ← العودة للرئيسية
        </button>
        <h1 className="kmt-title">
          👥 إدارة المارشال - Kuwait Motor Town
        </h1>
      </div>

      <div className="kmt-container">
        <div className="marshals-stats">
          <div className="stat-card">
            <h3>إجمالي المارشال</h3>
            <div className="stat-number">{marshals.length}</div>
          </div>
          <div className="stat-card">
            <h3>المارشال النشطين</h3>
            <div className="stat-number">
              {marshals.filter(m => m.status === 'active').length}
            </div>
          </div>
          <div className="stat-card">
            <h3>التحديثات الحديثة</h3>
            <div className="stat-number" style={{color: '#28a745'}}>
              {recentUpdates.length}
            </div>
            {recentUpdates.length > 0 && (
              <small style={{fontSize: '10px', color: '#666'}}>
                آخر 30 دقيقة
              </small>
            )}
          </div>
          <div className="stat-card">
            <h3>المارشال الخبراء</h3>
            <div className="stat-number">
              {marshals.filter(m => m.marshallInfo?.experienceLevel === 'expert').length}
            </div>
          </div>
        </div>

        {/* إشعار التحديثات الحديثة */}
        {recentUpdates.length > 0 && (
          <div style={{
            background: 'linear-gradient(135deg, #e8f5e8, #f0f8f0)',
            border: '2px solid #28a745',
            borderRadius: '12px',
            padding: '15px',
            marginBottom: '20px',
            boxShadow: '0 4px 12px rgba(40, 167, 69, 0.1)'
          }}>
            <h3 style={{color: '#28a745', marginBottom: '10px', fontSize: '16px'}}>
              🔄 تحديثات حديثة ({recentUpdates.length})
            </h3>
            <div style={{display: 'flex', flexWrap: 'wrap', gap: '8px'}}>
              {recentUpdates.slice(0, 5).map(marshal => (
                <span key={marshal.id} style={{
                  background: '#28a745',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  {marshal.fullName} - {new Date(marshal.updatedAt).toLocaleTimeString('ar-EG', {hour: '2-digit', minute: '2-digit'})}
                </span>
              ))}
              {recentUpdates.length > 5 && (
                <span style={{
                  background: '#6c757d',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}>
                  +{recentUpdates.length - 5} أكثر
                </span>
              )}
            </div>
          </div>
        )}

        {/* شبكة المارشال */}
          <div className="marshals-grid">
            {filteredMarshals.map((marshal) => (
              <MarshalCard
                key={marshal._id}
                marshal={marshal}
                variant="grid-item"
                showActions={true}
                showDetails={true}
                onViewDetails={handleViewDetails}
                onContact={handleContact}
                onAssign={handleAssign}
                onEdit={handleEdit}
              />
            ))}
          </div>

        {marshals.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">👥</div>
            <h3>لا يوجد مارشال مسجلين حالياً</h3>
            <p>سيتم عرض المارشال هنا بمجرد تسجيلهم في النظام</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarshalsView;