import React, { useState, useEffect } from 'react';
import MarshalCard from '../components/MarshalCard';
import './KMT-Original.css';
import '../styles/MarshalCard.css';

const MarshalRatings = ({ onPageChange }) => {
  const [marshals, setMarshals] = useState([]);
  const [filteredMarshals, setFilteredMarshals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [sortBy, setSortBy] = useState('rating');

  useEffect(() => {
    fetchMarshals();
  }, []);

  useEffect(() => {
    filterAndSortMarshals();
  }, [marshals, selectedFilter, sortBy]);

  const fetchMarshals = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/users/marshals', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        // إضافة بيانات التقييم المؤقتة
        const marshalsWithRatings = data.map(marshal => ({
          ...marshal,
          rating: (Math.random() * 2 + 3).toFixed(1), // تقييم بين 3-5
          completedRaces: Math.floor(Math.random() * 20) + 1,
          totalHours: Math.floor(Math.random() * 200) + 10,
          punctuality: (Math.random() * 2 + 3).toFixed(1),
          communication: (Math.random() * 2 + 3).toFixed(1),
          performance: (Math.random() * 2 + 3).toFixed(1),
          lastRace: `Formula ${Math.floor(Math.random() * 4) + 1} Championship`,
          achievements: getRandomAchievements(),
          feedback: getRandomFeedback()
        }));
        
        setMarshals(marshalsWithRatings);
        setFilteredMarshals(marshalsWithRatings);
      }
    } catch (error) {
      console.error('خطأ في جلب بيانات المارشال:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRandomAchievements = () => {
    const achievements = [
      '🏆 أفضل مارشال للشهر',
      '⭐ 5 نجوم متتالية',
      '🎯 100% حضور',
      '🚀 مارشال متميز',
      '💯 إنجاز مثالي'
    ];
    const count = Math.floor(Math.random() * 3) + 1;
    return achievements.slice(0, count);
  };

  const getRandomFeedback = () => {
    const feedbacks = [
      'مارشال ممتاز ومتعاون',
      'أداء مميز في جميع السباقات',
      'التزام عالي بالمواعيد',
      'تواصل ممتاز مع الفريق',
      'مهارات قيادية رائعة'
    ];
    return feedbacks[Math.floor(Math.random() * feedbacks.length)];
  };

  const filterAndSortMarshals = () => {
    let filtered = [...marshals];

    // التصفية
    switch (selectedFilter) {
      case 'excellent':
        filtered = filtered.filter(m => parseFloat(m.rating) >= 4.5);
        break;
      case 'good':
        filtered = filtered.filter(m => parseFloat(m.rating) >= 4.0 && parseFloat(m.rating) < 4.5);
        break;
      case 'active':
        filtered = filtered.filter(m => m.completedRaces >= 10);
        break;
      case 'new':
        filtered = filtered.filter(m => m.completedRaces <= 5);
        break;
      default:
        break;
    }

    // الترتيب
    switch (sortBy) {
      case 'rating':
        filtered.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
        break;
      case 'races':
        filtered.sort((a, b) => b.completedRaces - a.completedRaces);
        break;
      case 'hours':
        filtered.sort((a, b) => b.totalHours - a.totalHours);
        break;
      case 'name':
        filtered.sort((a, b) => a.fullName.localeCompare(b.fullName, 'ar'));
        break;
      default:
        break;
    }

    setFilteredMarshals(filtered);
  };

  const handleViewDetails = (marshal) => {
    alert(`تفاصيل ${marshal.fullName}\n\nالتقييم العام: ${marshal.rating}/5\nعدد السباقات: ${marshal.completedRaces}\nساعات العمل: ${marshal.totalHours}\n\nالتقييمات:\n- الالتزام: ${marshal.punctuality}/5\n- التواصل: ${marshal.communication}/5\n- الأداء: ${marshal.performance}/5\n\nآخر سباق: ${marshal.lastRace}\n\nملاحظات: ${marshal.feedback}`);
  };

  const handleContact = (marshal) => {
    alert(`التواصل مع ${marshal.fullName}\nرقم الهاتف: ${marshal.phone || 'غير متوفر'}\nالإيميل: ${marshal.email}`);
  };

  const handleAssign = (marshal) => {
    alert(`تعيين ${marshal.fullName} في سباق جديد`);
  };

  const handleEdit = (marshal) => {
    alert(`تعديل تقييمات ${marshal.fullName}`);
  };

  if (isLoading) {
    return (
      <div className="kmt-page">
        <div className="loading-container">
          <div className="loading-spinner">⏳ جاري تحميل تقييمات المارشال...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="kmt-page">
      {/* Header */}
      <div className="kmt-header">
        <button 
          onClick={() => onPageChange('manager-dashboard')}
          className="kmt-back-btn"
        >
          ← العودة للرئيسية
        </button>
        <h1 className="kmt-title">
          ⭐ تقييمات المارشال - Kuwait Motor Town
        </h1>
      </div>

      <div className="kmt-container">
        {/* الفلاتر والإحصائيات */}
        <div className="ratings-controls">
          <div className="stats-summary">
            <div className="stat-card small">
              <h3>متوسط التقييم</h3>
              <div className="stat-number">
                {marshals.length > 0 ? 
                  (marshals.reduce((sum, m) => sum + parseFloat(m.rating), 0) / marshals.length).toFixed(1) 
                  : '0'
                }
              </div>
            </div>
            <div className="stat-card small">
              <h3>المارشال المتميزين</h3>
              <div className="stat-number">
                {marshals.filter(m => parseFloat(m.rating) >= 4.5).length}
              </div>
            </div>
            <div className="stat-card small">
              <h3>إجمالي السباقات</h3>
              <div className="stat-number">
                {marshals.reduce((sum, m) => sum + m.completedRaces, 0)}
              </div>
            </div>
            <div className="stat-card small">
              <h3>ساعات العمل</h3>
              <div className="stat-number">
                {marshals.reduce((sum, m) => sum + m.totalHours, 0)}
              </div>
            </div>
          </div>

          <div className="filters-section">
            <div className="filter-group">
              <label>تصفية حسب:</label>
              <select 
                value={selectedFilter} 
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">جميع المارشال</option>
                <option value="excellent">متميزين (4.5+)</option>
                <option value="good">جيدين (4.0+)</option>
                <option value="active">نشطين (10+ سباقات)</option>
                <option value="new">جدد (أقل من 5 سباقات)</option>
              </select>
            </div>

            <div className="filter-group">
              <label>ترتيب حسب:</label>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="filter-select"
              >
                <option value="rating">التقييم</option>
                <option value="races">عدد السباقات</option>
                <option value="hours">ساعات العمل</option>
                <option value="name">الاسم</option>
              </select>
            </div>
          </div>
        </div>

        {/* عرض المارشال */}
        <div className="ratings-section">
          <div className="section-header">
            <h2>📊 تقييمات المارشال ({filteredMarshals.length})</h2>
          </div>
          
          {filteredMarshals.length > 0 ? (
            <div className="marshals-ratings-grid">
              {filteredMarshals.map((marshal) => (
                <div key={marshal._id} className="marshal-rating-card">
                  {/* معلومات المارشال الأساسية */}
                  <div className="marshal-basic-info">
                    <div className="marshal-avatar">
                      {marshal.profileImage ? (
                        <img 
                          src={marshal.profileImage} 
                          alt={marshal.fullName}
                          className="avatar-image"
                        />
                      ) : (
                        <div className="avatar-placeholder">
                          <span>{marshal.fullName?.charAt(0) || 'M'}</span>
                        </div>
                      )}
                      <div className="rating-badge">
                        ⭐ {marshal.rating}
                      </div>
                    </div>
                    
                    <div className="marshal-details">
                      <h3 className="marshal-name">{marshal.fullName}</h3>
                      <span className="marshal-id">{marshal.marshallInfo?.marshalId || 'KMT-XXX'}</span>
                      <div className="nationality">
                        🏳️ {marshal.marshallInfo?.nationality || 'غير محدد'}
                      </div>
                    </div>
                  </div>

                  {/* إحصائيات الأداء */}
                  <div className="performance-stats">
                    <div className="stat-row">
                      <div className="stat-item">
                        <span className="stat-icon">🏁</span>
                        <span className="stat-value">{marshal.completedRaces}</span>
                        <span className="stat-label">سباق</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-icon">⏰</span>
                        <span className="stat-value">{marshal.totalHours}</span>
                        <span className="stat-label">ساعة</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-icon">🎯</span>
                        <span className="stat-value">{marshal.punctuality}</span>
                        <span className="stat-label">التزام</span>
                      </div>
                    </div>
                  </div>

                  {/* التقييمات التفصيلية */}
                  <div className="detailed-ratings">
                    <div className="rating-bar">
                      <span>التواصل</span>
                      <div className="bar">
                        <div 
                          className="fill" 
                          style={{ width: `${(marshal.communication / 5) * 100}%` }}
                        ></div>
                      </div>
                      <span>{marshal.communication}</span>
                    </div>
                    <div className="rating-bar">
                      <span>الأداء</span>
                      <div className="bar">
                        <div 
                          className="fill" 
                          style={{ width: `${(marshal.performance / 5) * 100}%` }}
                        ></div>
                      </div>
                      <span>{marshal.performance}</span>
                    </div>
                  </div>

                  {/* الإنجازات */}
                  {marshal.achievements && marshal.achievements.length > 0 && (
                    <div className="achievements">
                      <h4>الإنجازات:</h4>
                      <div className="achievement-tags">
                        {marshal.achievements.map((achievement, index) => (
                          <span key={index} className="achievement-tag">
                            {achievement}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* آخر نشاط */}
                  <div className="last-activity">
                    <span className="activity-label">آخر سباق:</span>
                    <span className="activity-value">{marshal.lastRace}</span>
                  </div>

                  {/* الملاحظات */}
                  <div className="feedback-section">
                    <p className="feedback-text">"{marshal.feedback}"</p>
                  </div>

                  {/* أزرار الإجراءات */}
                  <div className="marshal-actions">
                    <button 
                      className="action-btn view-btn"
                      onClick={() => handleViewDetails(marshal)}
                      title="عرض التفاصيل الكاملة"
                    >
                      <span className="action-icon">📊</span>
                    </button>
                    
                    <button 
                      className="action-btn contact-btn"
                      onClick={() => handleContact(marshal)}
                      title="التواصل"
                    >
                      <span className="action-icon">💬</span>
                    </button>
                    
                    <button 
                      className="action-btn assign-btn"
                      onClick={() => handleAssign(marshal)}
                      title="تعيين في سباق"
                    >
                      <span className="action-icon">🏁</span>
                    </button>
                    
                    <button 
                      className="action-btn edit-btn"
                      onClick={() => handleEdit(marshal)}
                      title="تعديل التقييم"
                    >
                      <span className="action-icon">✏️</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-marshals">
              <span className="no-data-icon">⭐</span>
              <p>لا توجد تقييمات متاحة للعرض</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MarshalRatings;