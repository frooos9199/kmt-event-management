import React, { useState, useEffect } from 'react';
import MarshalCard from '../components/MarshalCard';
import './KMT-Original.css';
import './Formula-Enhancement.css';
import '../styles/MarshalCard.css';

const StatsDetail = ({ onPageChange, statsType }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});

  useEffect(() => {
    fetchStatsData();
  }, [statsType]);

  const fetchStatsData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (statsType?.type === 'marshalls' || statsType?.type === 'available-marshalls') {
        // جلب بيانات المارشال
        const response = await fetch('https://kmt-event-management.onrender.com/api/users/marshals', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          let marshalls = await response.json();
          
          if (statsType?.type === 'available-marshalls') {
            marshalls = marshalls.filter(m => 
              !m.marshallInfo?.workStatus || m.marshallInfo.workStatus === 'متاح'
            );
          }
          
          setData(marshalls);
        }
      } else {
        // بيانات أخرى (سباقات، حلبات، إلخ)
        setData(generateMockData(statsType?.type));
      }

      // جلب الإحصائيات العامة
      const statsResponse = await fetch('https://kmt-event-management.onrender.com/api/stats/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.stats || {});
      }

    } catch (error) {
      console.error('خطأ في جلب البيانات:', error);
      setData(generateMockData(statsType?.type));
    } finally {
      setLoading(false);
    }
  };

  const generateMockData = (type) => {
    switch (type) {
      case 'races':
        return [
          { id: 1, name: 'بطولة الكويت للفورمولا 4', status: 'مكتملة', date: '2024-10-15', participants: 24 },
          { id: 2, name: 'سباق الدريفت الليلي', status: 'نشط', date: '2024-11-10', participants: 16 },
          { id: 3, name: 'بطولة الكارتينغ', status: 'قادم', date: '2024-11-20', participants: 32 },
          { id: 4, name: 'سباق التحمل 6 ساعات', status: 'مكتمل', date: '2024-09-30', participants: 18 },
          { id: 5, name: 'بطولة المبتدئين', status: 'نشط', date: '2024-11-05', participants: 12 },
          { id: 6, name: 'سباق السرعة القصوى', status: 'قادم', date: '2024-12-01', participants: 20 },
          { id: 7, name: 'بطولة النساء', status: 'مكتمل', date: '2024-10-25', participants: 14 },
          { id: 8, name: 'سباق المحترفين', status: 'نشط', date: '2024-11-12', participants: 28 }
        ];
      
      case 'active-races':
        return [
          { id: 2, name: 'سباق الدريفت الليلي', status: 'نشط', date: '2024-11-10', participants: 16, track: 'حلبة الدريفت' },
          { id: 5, name: 'بطولة المبتدئين', status: 'نشط', date: '2024-11-05', participants: 12, track: 'الحلبة الرئيسية' },
          { id: 8, name: 'سباق المحترفين', status: 'نشط', date: '2024-11-12', participants: 28, track: 'حلبة الكارتينغ' }
        ];
      
      case 'tracks':
        return [
          { id: 1, name: 'الحلبة الرئيسية', length: '5.2 كم', type: 'فورمولا', status: 'نشط', races: 3 },
          { id: 2, name: 'حلبة الكارتينغ', length: '1.8 كم', type: 'كارتينغ', status: 'نشط', races: 2 },
          { id: 3, name: 'حلبة الدريفت', length: '2.1 كم', type: 'دريفت', status: 'نشط', races: 1 },
          { id: 4, name: 'مضمار الدراق', length: '400 م', type: 'دراق', status: 'صيانة', races: 0 }
        ];
      
      case 'events':
        return [
          { id: 1, name: 'معرض السيارات الرياضية', date: '2024-11-15', type: 'معرض', attendees: 500 },
          { id: 2, name: 'ورشة القيادة الآمنة', date: '2024-11-18', type: 'تدريب', attendees: 30 },
          { id: 3, name: 'مهرجان السرعة والإثارة', date: '2024-11-25', type: 'مهرجان', attendees: 1200 },
          { id: 4, name: 'دورة صيانة السيارات', date: '2024-12-05', type: 'تدريب', attendees: 25 },
          { id: 5, name: 'ليلة التتويج', date: '2024-12-15', type: 'حفل', attendees: 200 }
        ];
      
      default:
        return [];
    }
  };

  const getPageTitle = () => {
    switch (statsType?.type) {
      case 'races': return 'جميع السباقات | All Races';
      case 'active-races': return 'السباقات النشطة | Active Races';
      case 'marshalls': return 'جميع المارشال | All Marshalls';
      case 'available-marshalls': return 'المارشال المتاحين | Available Marshalls';
      case 'tracks': return 'الحلبات النشطة | Active Tracks';
      case 'events': return 'الأحداث القادمة | Upcoming Events';
      default: return 'الإحصائيات | Statistics';
    }
  };

  const getPageIcon = () => {
    switch (statsType?.type) {
      case 'races': return '🏁';
      case 'active-races': return '⚡';
      case 'marshalls': return '👥';
      case 'available-marshalls': return '✅';
      case 'tracks': return '🏁';
      case 'events': return '📅';
      default: return '📊';
    }
  };

  const renderContent = () => {
    if (statsType?.type === 'marshalls' || statsType?.type === 'available-marshalls') {
      return (
        <div className="marshals-grid">
          {data.map((marshal) => (
            <MarshalCard
              key={marshal._id}
              marshal={marshal}
              variant="detailed"
              showActions={true}
              showDetails={true}
            />
          ))}
        </div>
      );
    }

    // بقية الأنواع
    return (
      <div className="stats-cards-grid">
        {data.map((item) => (
          <div key={item.id} className="detail-card">
            {renderCardContent(item)}
          </div>
        ))}
      </div>
    );
  };

  const renderCardContent = (item) => {
    switch (statsType?.type) {
      case 'races':
      case 'active-races':
        return (
          <>
            <div className="card-header">
              <span className="race-status" data-status={item.status}>
                {item.status}
              </span>
              <h3>{item.name}</h3>
            </div>
            <div className="card-details">
              <p><strong>التاريخ:</strong> {item.date}</p>
              <p><strong>المشاركين:</strong> {item.participants}</p>
              {item.track && <p><strong>الحلبة:</strong> {item.track}</p>}
            </div>
          </>
        );
      
      case 'tracks':
        return (
          <>
            <div className="card-header">
              <span className="track-status" data-status={item.status}>
                {item.status}
              </span>
              <h3>{item.name}</h3>
            </div>
            <div className="card-details">
              <p><strong>الطول:</strong> {item.length}</p>
              <p><strong>النوع:</strong> {item.type}</p>
              <p><strong>السباقات النشطة:</strong> {item.races}</p>
            </div>
          </>
        );
      
      case 'events':
        return (
          <>
            <div className="card-header">
              <span className="event-type" data-type={item.type}>
                {item.type}
              </span>
              <h3>{item.name}</h3>
            </div>
            <div className="card-details">
              <p><strong>التاريخ:</strong> {item.date}</p>
              <p><strong>المتوقع:</strong> {item.attendees} شخص</p>
            </div>
          </>
        );
      
      default:
        return <p>لا توجد بيانات</p>;
    }
  };

  return (
    <div className="stats-detail-container">
      <header className="page-header">
        <button 
          className="back-btn"
          onClick={() => onPageChange('manager-dashboard')}
        >
          ← العودة للوحة التحكم
        </button>
        <div className="page-title">
          <span className="page-icon">{getPageIcon()}</span>
          <h1>{getPageTitle()}</h1>
        </div>
      </header>

      <div className="stats-summary">
        <div className="summary-cards">
          <div className="summary-card">
            <span className="summary-icon">📊</span>
            <div className="summary-info">
              <h3>إجمالي العناصر</h3>
              <p className="summary-number">{data.length}</p>
            </div>
          </div>
          
          {(statsType?.type === 'marshalls' || statsType?.type === 'available-marshalls') && (
            <>
              <div className="summary-card">
                <span className="summary-icon">🎯</span>
                <div className="summary-info">
                  <h3>المتاحين</h3>
                  <p className="summary-number">
                    {data.filter(m => !m.marshallInfo?.workStatus || m.marshallInfo.workStatus === 'متاح').length}
                  </p>
                </div>
              </div>
              <div className="summary-card">
                <span className="summary-icon">⭐</span>
                <div className="summary-info">
                  <h3>الخبراء</h3>
                  <p className="summary-number">
                    {data.filter(m => m.marshallInfo?.experienceLevel === 'expert').length}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="content-section">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner">⏳ جاري التحميل...</div>
          </div>
        ) : data.length > 0 ? (
          renderContent()
        ) : (
          <div className="no-data">
            <span className="no-data-icon">📋</span>
            <p>لا توجد بيانات متاحة حالياً</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsDetail;