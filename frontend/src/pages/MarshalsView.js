import React, { useState, useEffect } from 'react';
import MarshalCard from '../components/MarshalCard';
import './KMT-Original.css';
import '../styles/MarshalCard.css';

const MarshalsView = ({ onPageChange }) => {
  const [marshals, setMarshals] = useState([]);
  const [filteredMarshals, setFilteredMarshals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMarshal, setSelectedMarshal] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchMarshals();
  }, []);

  const fetchMarshals = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://kmt-event-management.onrender.com/api/users/marshals', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMarshals(data);
        setFilteredMarshals(data);
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
      <div className="kmt-page">
        <div className="loading-container">
          <div className="loading-spinner">⏳ جاري تحميل بيانات المارشال...</div>
        </div>
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
              {marshals.filter(m => m.marshallInfo?.trackSpecializations?.length > 0).length}
            </div>
          </div>
          <div className="stat-card">
            <h3>المارشال الخبراء</h3>
            <div className="stat-number">
              {marshals.filter(m => m.marshallInfo?.experienceLevel === 'expert').length}
            </div>
          </div>
        </div>

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