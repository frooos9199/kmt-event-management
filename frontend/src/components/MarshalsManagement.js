import React, { useState, useEffect } from 'react';
import '../pages/KMT-Original.css';

const MarshalsManagement = ({ onPageChange }) => {
  const [marshals, setMarshals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMarshal, setSelectedMarshal] = useState(null);
  const [showBulkCreateModal, setShowBulkCreateModal] = useState(false);
  const [bulkCreateCount, setBulkCreateCount] = useState(20);
  const [bulkCreateLoading, setBulkCreateLoading] = useState(false);

  useEffect(() => {
    fetchMarshals();
  }, []);

  const fetchMarshals = async () => {
    try {
      const token = localStorage.getItem('token');
      const API_URL = process.env.REACT_APP_API_URL || 'https://kmt-event-management.onrender.com';
      const response = await fetch(`${API_URL}/api/users/marshals`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMarshals(data);
      }
    } catch (error) {
      console.error('خطأ في جلب المارشال:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkCreateMarshals = async () => {
    setBulkCreateLoading(true);
    try {
      const token = localStorage.getItem('token');
      const API_URL = process.env.REACT_APP_API_URL || 'https://kmt-event-management.onrender.com';
      const response = await fetch(`${API_URL}/api/users/create-bulk-marshals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ count: bulkCreateCount })
      });

      if (response.ok) {
        const result = await response.json();
        alert(`تم إنشاء ${result.created} مارشال بنجاح!\nالأرقام من: ${result.startId} إلى ${result.endId}\nكلمة المرور للجميع: 123456`);
        fetchMarshals(); // إعادة تحميل القائمة
        setShowBulkCreateModal(false);
      } else {
        const error = await response.json();
        alert('خطأ في إنشاء المارشال: ' + error.message);
      }
    } catch (error) {
      console.error('خطأ في إنشاء المارشال:', error);
      alert('خطأ في الاتصال بالخادم');
    } finally {
      setBulkCreateLoading(false);
    }
  };

  const getStatusColor = (accountStatus) => {
    // إذا كان accountStatus نص مباشر، استخدمه. إذا كان object، استخدم profileStatus
    const status = typeof accountStatus === 'string' ? accountStatus : (accountStatus?.profileStatus || 'pending');
    switch (status) {
      case 'approved': return '#28a745';
      case 'pending': return '#ffc107';
      case 'rejected': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getStatusText = (accountStatus) => {
    // إذا كان accountStatus نص مباشر، استخدمه. إذا كان object، استخدم profileStatus
    const status = typeof accountStatus === 'string' ? accountStatus : (accountStatus?.profileStatus || 'pending');
    switch (status) {
      case 'approved': return 'معتمد';
      case 'pending': return 'قيد المراجعة';
      case 'rejected': return 'مرفوض';
      default: return 'قيد المراجعة';
    }
  };

  if (loading) {
    return (
      <div className="kmt-page">
        <div className="kmt-container">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>جاري تحميل المارشال...</p>
          </div>
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
          ← العودة
        </button>
        <h1 className="kmt-title">👥 إدارة المارشال</h1>
        <button 
          onClick={() => setShowBulkCreateModal(true)}
          className="kmt-primary-btn"
          style={{ marginLeft: 'auto' }}
        >
          ➕ إضافة مارشال بالجملة
        </button>
      </div>

      <div className="kmt-container">
        <div className="marshals-management-layout">
          {/* قائمة المارشال */}
          <div className="marshals-list">
            <h2>قائمة المارشال ({marshals.length})</h2>
            
            {marshals.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">👥</div>
                <h3>لا يوجد مارشال مسجل</h3>
                <p>لم يتم تسجيل أي مارشال في النظام بعد</p>
              </div>
            ) : (
              <div className="marshals-grid">
                {marshals.map(marshal => (
                  <div 
                    key={marshal._id} 
                    className={`marshal-card ${selectedMarshal?._id === marshal._id ? 'selected' : ''}`}
                    onClick={() => setSelectedMarshal(marshal)}
                  >
                    <div className="marshal-header" style={{ display: 'flex', alignItems: 'center', padding: '16px', gap: '16px' }}>
                      <div className="marshal-avatar">
                        <img 
                          src={
                            marshal.marshallInfo?.profileImage || 
                            marshal.profileImage || 
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(marshal.fullName || 'مارشال')}&background=1a5490&color=fff&size=80&font-size=0.33&bold=true&rounded=true`
                          }
                          alt={marshal.fullName || 'مارشال'}
                          className="avatar-image"
                          onError={(e) => {
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(marshal.fullName || 'مارشال')}&background=1a5490&color=fff&size=80&font-size=0.33&bold=true&rounded=true`;
                          }}
                        />
                      </div>
                      <div className="marshal-info" style={{ flex: 1 }}>
                        <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 'bold' }}>
                          {marshal.fullName || 'غير محدد'}
                        </h3>
                        {marshal.marshallInfo?.marshalId && (
                          <span className="marshal-id" style={{ background: '#1a5490', color: 'white', padding: '4px 8px', borderRadius: '12px', fontSize: '12px' }}>
                            🏁 {marshal.marshallInfo.marshalId}
                          </span>
                        )}
                        {marshal.email && (
                          <p className="marshal-email" style={{ margin: '8px 0 0 0', fontSize: '14px', color: '#666' }}>
                            {marshal.email}
                          </p>
                        )}
                      </div>
                      <span 
                        className="marshal-status"
                        style={{ 
                          backgroundColor: getStatusColor(marshal.accountStatus),
                          color: 'white',
                          padding: '8px 12px',
                          borderRadius: '16px',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}
                      >
                        {getStatusText(marshal.accountStatus)}
                      </span>
                    </div>
                    
                    <div className="marshal-details" style={{ padding: '16px', borderTop: '1px solid #eee' }}>
                      <p style={{ margin: '0 0 8px 0', fontSize: '14px' }}>
                        <strong>الإيميل:</strong> {marshal.email}
                      </p>
                      <p style={{ margin: '0 0 8px 0', fontSize: '14px' }}>
                        <strong>الهاتف:</strong> {marshal.phone || 'غير محدد'}
                      </p>
                      <p style={{ margin: '0 0 8px 0', fontSize: '14px' }}>
                        <strong>تاريخ التسجيل:</strong> {new Date(marshal.createdAt).toLocaleDateString('en-GB')}
                      </p>
                      {marshal.marshallInfo?.certificationLevel && (
                        <p style={{ margin: '0 0 8px 0', fontSize: '14px' }}>
                          <strong>مستوى الشهادة:</strong> {marshal.marshallInfo.certificationLevel}
                        </p>
                      )}
                    </div>
                    </div>
                ))}
              </div>
            )}
          </div>

          {/* تفاصيل المارشال المحدد */}
          {selectedMarshal && (
            <div className="marshal-details-panel">
              <div className="panel-header">
                <h2>👤 تفاصيل المارشال</h2>
                <button 
                  onClick={() => setSelectedMarshal(null)}
                  className="close-btn"
                >
                  ✕
                </button>
              </div>

              <div className="marshal-full-info">
                {/* صورة المارشال */}
                <div className="marshal-image-section">
                  <img 
                    src={selectedMarshal.marshallInfo?.profileImage || selectedMarshal.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedMarshal.fullName)}&background=e31e24&color=fff&size=150`}
                    alt={selectedMarshal.fullName}
                    className="marshal-profile-image"
                  />
                </div>

                {/* المعلومات الأساسية */}
                <div className="info-section">
                  <h3>📋 المعلومات الأساسية</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>الاسم الكامل:</label>
                      <span>{selectedMarshal.fullName}</span>
                    </div>
                    <div className="info-item">
                      <label>البريد الإلكتروني:</label>
                      <span>{selectedMarshal.email}</span>
                    </div>
                    <div className="info-item">
                      <label>رقم الهاتف:</label>
                      <span>{selectedMarshal.phone || 'غير محدد'}</span>
                    </div>
                    <div className="info-item">
                      <label>حالة الحساب:</label>
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(selectedMarshal.accountStatus) }}
                      >
                        {getStatusText(selectedMarshal.accountStatus)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* المعلومات الشخصية */}
                {selectedMarshal.marshallInfo && (
                  <div className="info-section">
                    <h3>🆔 المعلومات الشخصية</h3>
                    <div className="info-grid">
                      {selectedMarshal.marshallInfo.dateOfBirth && (
                        <div className="info-item">
                          <label>تاريخ الميلاد:</label>
                          <span>{new Date(selectedMarshal.marshallInfo.dateOfBirth).toLocaleDateString('en-GB')}</span>
                        </div>
                      )}
                      {selectedMarshal.marshallInfo.age && (
                        <div className="info-item">
                          <label>العمر:</label>
                          <span>{selectedMarshal.marshallInfo.age} سنة</span>
                        </div>
                      )}
                      {selectedMarshal.marshallInfo.nationality && (
                        <div className="info-item">
                          <label>الجنسية:</label>
                          <span>{selectedMarshal.marshallInfo.nationality}</span>
                        </div>
                      )}
                      {selectedMarshal.marshallInfo.nationalId && (
                        <div className="info-item">
                          <label>الرقم المدني:</label>
                          <span>{selectedMarshal.marshallInfo.nationalId}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* معلومات المارشال */}
                {selectedMarshal.marshallInfo && (
                  <div className="info-section">
                    <h3>🏁 معلومات المارشال</h3>
                    <div className="info-grid">
                      <div className="info-item">
                        <label>رقم المارشال:</label>
                        <span className="marshal-id-highlight">{selectedMarshal.marshallInfo.marshalId}</span>
                      </div>
                      {selectedMarshal.marshallInfo.certificationLevel && (
                        <div className="info-item">
                          <label>مستوى الشهادة:</label>
                          <span>{selectedMarshal.marshallInfo.certificationLevel}</span>
                        </div>
                      )}
                      {selectedMarshal.marshallInfo.specializations && (
                        <div className="info-item">
                          <label>التخصصات:</label>
                          <span>{selectedMarshal.marshallInfo.specializations.join(', ')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* إحصائيات المارشال */}
                {selectedMarshal.stats && (
                  <div className="info-section">
                    <h3>📊 الإحصائيات</h3>
                    <div className="stats-grid">
                      <div className="stat-item">
                        <span className="stat-value">{selectedMarshal.stats.totalEvents || 0}</span>
                        <span className="stat-label">إجمالي الفعاليات</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-value">{selectedMarshal.stats.completedEvents || 0}</span>
                        <span className="stat-label">الفعاليات المكتملة</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-value">{selectedMarshal.stats.averageRating || 0}⭐</span>
                        <span className="stat-label">متوسط التقييم</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* مودال إنشاء المارشال بالجملة */}
      {showBulkCreateModal && (
        <div className="modal-backdrop" onClick={() => setShowBulkCreateModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>➕ إنشاء مارشال بالجملة</h2>
              <button 
                onClick={() => setShowBulkCreateModal(false)}
                className="modal-close-btn"
              >
                ✕
              </button>
            </div>
            
            <div className="modal-body">
              <div className="input-group">
                <label htmlFor="bulkCount">عدد المارشال المطلوب إنشاؤها:</label>
                <input
                  id="bulkCount"
                  type="number"
                  min="1"
                  max="100"
                  value={bulkCreateCount}
                  onChange={(e) => setBulkCreateCount(parseInt(e.target.value) || 1)}
                  className="form-input"
                />
                <small className="help-text">
                  سيتم إنشاء {bulkCreateCount} حساب مارشال بأرقام تسلسلية
                  <br />
                  كلمة المرور لجميع الحسابات: <strong>123456</strong>
                </small>
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                onClick={() => setShowBulkCreateModal(false)}
                className="kmt-secondary-btn"
                disabled={bulkCreateLoading}
              >
                إلغاء
              </button>
              <button 
                onClick={handleBulkCreateMarshals}
                className="kmt-primary-btn"
                disabled={bulkCreateLoading}
              >
                {bulkCreateLoading ? 'جاري الإنشاء...' : `إنشاء ${bulkCreateCount} مارشال`}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .marshals-management-layout {
          display: grid;
          grid-template-columns: 1fr 400px;
          gap: 2rem;
          height: calc(100vh - 200px);
        }

        .marshals-list {
          background: white;
          padding: 1.5rem;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          overflow-y: auto;
        }

        .marshals-grid {
          display: grid;
          gap: 1rem;
          margin-top: 1rem;
        }

        .marshal-card {
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          padding: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          background: white;
        }

        .marshal-card:hover {
          border-color: var(--kmt-secondary);
          box-shadow: 0 4px 12px rgba(227, 30, 36, 0.1);
        }

        .marshal-card.selected {
          border-color: var(--kmt-secondary);
          background: #fff5f5;
        }

        .marshal-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 0.5rem;
        }

        .marshal-avatar .avatar-image {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          object-fit: cover;
        }

        .marshal-info {
          flex: 1;
        }

        .marshal-info h3 {
          margin: 0;
          color: var(--kmt-primary);
        }

        .marshal-id {
          color: var(--kmt-secondary);
          font-size: 0.9rem;
          font-weight: 500;
        }

        .marshal-status {
          color: white;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .marshal-details-panel {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          max-height: 100%;
          display: flex;
          flex-direction: column;
        }

        .panel-header {
          padding: 1.5rem;
          background: var(--kmt-gray-light);
          border-bottom: 1px solid #e0e0e0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .marshal-full-info {
          padding: 1.5rem;
          overflow-y: auto;
          flex: 1;
        }

        .marshal-image-section {
          text-align: center;
          margin-bottom: 2rem;
        }

        .marshal-profile-image {
          width: 150px;
          height: 150px;
          border-radius: 50%;
          object-fit: cover;
          border: 4px solid var(--kmt-secondary);
        }

        .info-section {
          margin-bottom: 2rem;
          padding: 1rem;
          background: var(--kmt-gray-light);
          border-radius: 8px;
        }

        .info-section h3 {
          margin-bottom: 1rem;
          color: var(--kmt-primary);
        }

        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .info-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .info-item label {
          font-weight: 600;
          color: var(--kmt-gray-dark);
          font-size: 0.9rem;
        }

        .info-item span {
          color: var(--kmt-primary);
          font-weight: 500;
        }

        .status-badge {
          color: white;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 500;
          display: inline-block;
        }

        .marshal-id-highlight {
          background: var(--kmt-secondary);
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-weight: 600;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
        }

        .stat-item {
          text-align: center;
          padding: 1rem;
          background: white;
          border-radius: 8px;
          border: 1px solid #e0e0e0;
        }

        .stat-value {
          display: block;
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--kmt-secondary);
        }

        .stat-label {
          font-size: 0.85rem;
          color: var(--kmt-gray-dark);
        }

        @media (max-width: 1024px) {
          .marshals-management-layout {
            grid-template-columns: 1fr;
            height: auto;
          }
          
          .info-grid {
            grid-template-columns: 1fr;
          }
        }

        /* مودال إنشاء المارشال بالجملة */
        .modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          border-radius: 12px;
          width: 90%;
          max-width: 500px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        }

        .modal-header {
          padding: 20px;
          border-bottom: 1px solid #eee;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-header h2 {
          margin: 0;
          color: var(--kmt-primary);
          font-size: 18px;
        }

        .modal-close-btn {
          background: none;
          border: none;
          font-size: 20px;
          cursor: pointer;
          color: #999;
          padding: 5px;
          border-radius: 50%;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .modal-close-btn:hover {
          background: #f5f5f5;
          color: #333;
        }

        .modal-body {
          padding: 20px;
        }

        .input-group {
          margin-bottom: 20px;
        }

        .input-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: var(--kmt-primary);
        }

        .form-input {
          width: 100%;
          padding: 12px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 16px;
          transition: border-color 0.3s;
        }

        .form-input:focus {
          outline: none;
          border-color: var(--kmt-primary);
        }

        .help-text {
          display: block;
          margin-top: 8px;
          color: #666;
          font-size: 14px;
          line-height: 1.4;
        }

        .modal-footer {
          padding: 20px;
          border-top: 1px solid #eee;
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }

        .kmt-secondary-btn {
          padding: 12px 24px;
          border: 2px solid var(--kmt-primary);
          background: white;
          color: var(--kmt-primary);
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s;
        }

        .kmt-secondary-btn:hover:not(:disabled) {
          background: var(--kmt-primary);
          color: white;
        }

        .kmt-secondary-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .kmt-primary-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default MarshalsManagement;