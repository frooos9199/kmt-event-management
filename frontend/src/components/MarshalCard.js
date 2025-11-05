import React from 'react';
import '../styles/MarshalCard.css';

const MarshalCard = ({ 
  marshal, 
  variant = 'default', 
  showActions = true, 
  showDetails = true,
  onViewDetails,
  onAssign,
  onContact,
  onEdit,
  onClick
}) => {
  const getExperienceColor = (level) => {
    switch(level) {
      case 'مبتدئ': return '#ffd700';
      case 'متوسط': return '#ff8c00';
      case 'متقدم': return '#ff4500';
      case 'خبير': return '#e31e24';
      default: return '#ccc';
    }
  };

  const getStatusColor = (status) => {
    const accountStatus = typeof status === 'string' ? status : (status?.profileStatus || 'pending');
    switch(accountStatus) {
      case 'approved': return '#28a745';
      case 'pending': return '#ffc107';
      case 'rejected': return '#dc3545';
      case 'متاح': return '#28a745';
      case 'مشغول': return '#ffc107';
      case 'غير متاح': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getStatusText = (status) => {
    const accountStatus = typeof status === 'string' ? status : (status?.profileStatus || 'pending');
    switch(accountStatus) {
      case 'approved': return 'معتمد';
      case 'pending': return 'قيد المراجعة';
      case 'rejected': return 'مرفوض';
      case 'متاح': return 'متاح';
      case 'مشغول': return 'مشغول';
      case 'غير متاح': return 'غير متاح';
      default: return 'قيد المراجعة';
    }
  };

  const handleCardClick = () => {
    if (onClick) {
      onClick(marshal);
    }
  };

  return (
    <div 
      className={`marshal-card ${variant} ${onClick ? 'clickable' : ''}`}
      onClick={handleCardClick}
    >
      {/* صورة المارشال */}
      <div className="marshal-avatar">
        {marshal.marshallInfo?.profileImage || marshal.profileImage ? (
          <img 
            src={marshal.marshallInfo?.profileImage || marshal.profileImage} 
            alt={marshal.fullName}
            className="avatar-image"
            onError={(e) => {
              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(marshal.fullName || 'مارشال')}&background=1a5490&color=fff&size=120&font-size=0.4&bold=true&rounded=true`;
            }}
          />
        ) : (
          <div className="avatar-placeholder">
            <span>{marshal.fullName?.charAt(0) || 'M'}</span>
          </div>
        )}
        
        {/* حالة الاتصال */}
        <div className={`status-indicator ${marshal.isOnline ? 'online' : 'offline'}`}></div>
      </div>

      {/* معلومات المارشال */}
      <div className="marshal-info">
        <div className="marshal-header">
          <h3 className="marshal-name">{marshal.fullName || 'غير محدد'}</h3>
          <span 
            className="marshal-id" 
            style={{ 
              background: '#1a5490', 
              color: 'white', 
              padding: '4px 8px', 
              borderRadius: '12px', 
              fontSize: '12px',
              fontWeight: 'bold',
              display: 'inline-block'
            }}
          >
            🏁 {marshal.marshallInfo?.marshalId || 'KMT-XXX'}
          </span>
        </div>

        {showDetails && (
          <>
            <div className="marshal-details">
              <div className="detail-item">
                <span className="detail-icon">📧</span>
                <span className="detail-text">{marshal.email || 'غير محدد'}</span>
              </div>
              
              <div className="detail-item">
                <span className="detail-icon">📱</span>
                <span className="detail-text">{marshal.phone || 'غير محدد'}</span>
              </div>

              <div className="detail-item">
                <span className="detail-icon">🏳️</span>
                <span className="detail-text">{marshal.marshallInfo?.nationality || 'غير محدد'}</span>
              </div>

              <div className="detail-item">
                <span className="detail-icon">📅</span>
                <span className="detail-text">
                  تسجيل: {new Date(marshal.createdAt).toLocaleDateString('en-GB')}
                </span>
              </div>

              <div className="detail-item">
                <span className="detail-icon">⭐</span>
                <span 
                  className="experience-badge"
                  style={{ backgroundColor: getExperienceColor(marshal.marshallInfo?.experienceLevel) }}
                >
                  {marshal.marshallInfo?.experienceLevel || 'مبتدئ'}
                </span>
              </div>

              {/* حالة الحساب */}
              <div className="detail-item">
                <span className="detail-icon">✅</span>
                <span 
                  className="status-badge"
                  style={{ 
                    backgroundColor: getStatusColor(marshal.accountStatus),
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}
                >
                  {getStatusText(marshal.accountStatus)}
                </span>
              </div>
            </div>

            {/* التخصصات */}
            {marshal.marshallInfo?.trackSpecializations?.length > 0 && (
              <div className="specializations">
                {marshal.marshallInfo.trackSpecializations.slice(0, 3).map((spec, index) => (
                  <span key={index} className="specialization-tag">
                    {spec}
                  </span>
                ))}
                {marshal.marshallInfo.trackSpecializations.length > 3 && (
                  <span className="more-specs">
                    +{marshal.marshallInfo.trackSpecializations.length - 3}
                  </span>
                )}
              </div>
            )}

            {/* حالة العمل */}
            <div className="work-status">
              <span 
                className="status-badge"
                style={{ backgroundColor: getStatusColor(marshal.workStatus || 'متاح') }}
              >
                {marshal.workStatus || 'متاح'}
              </span>
            </div>
          </>
        )}
      </div>

      {/* أزرار الإجراءات */}
      {showActions && (
        <div className="marshal-actions">
          {onViewDetails && (
            <button 
              className="action-btn view-btn"
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails(marshal);
              }}
              title="عرض التفاصيل"
            >
              <span className="action-icon">👁️</span>
            </button>
          )}
          
          {onContact && (
            <button 
              className="action-btn contact-btn"
              onClick={(e) => {
                e.stopPropagation();
                onContact(marshal);
              }}
              title="التواصل"
            >
              <span className="action-icon">💬</span>
            </button>
          )}
          
          {onAssign && (
            <button 
              className="action-btn assign-btn"
              onClick={(e) => {
                e.stopPropagation();
                onAssign(marshal);
              }}
              title="تعيين في سباق"
            >
              <span className="action-icon">🏁</span>
            </button>
          )}
          
          {onEdit && (
            <button 
              className="action-btn edit-btn"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(marshal);
              }}
              title="تعديل"
            >
              <span className="action-icon">✏️</span>
            </button>
          )}
        </div>
      )}

      {/* معلومات إضافية للنسخة المدمجة */}
      {variant === 'compact' && (
        <div className="compact-stats">
          <div className="stat-item">
            <span className="stat-number">{marshal.completedRaces || 0}</span>
            <span className="stat-label">سباق</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{marshal.rating || '4.5'}</span>
            <span className="stat-label">⭐</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarshalCard;