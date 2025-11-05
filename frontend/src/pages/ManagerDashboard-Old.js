import React, { useEffect, useState } from 'react';
import WorkerAnalytics from '../components/WorkerAnalytics';
import CreateEvent from '../components/CreateEvent';
import MarshalCard from '../components/MarshalCard';
import './KMT-Original.css';
import './Formula-Enhancement.css';
import '../styles/MarshalCard.css';

const ManagerDashboard = ({ onPageChange }) => {
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard'); // dashboard, analytics, events
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [recentMarshals, setRecentMarshals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRaces: 8,
    activeRaces: 3,
    totalMarshalls: 25,
    availableMarshalls: 18,
    tracksInUse: 4,
    upcomingEvents: 5
  });

  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    
    // جلب المارشال الحديثين
    fetchRecentMarshals();
  }, []);

  const fetchRecentMarshals = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://kmt-event-management.onrender.com/api/users/marshals', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        // أخذ آخر 3 مارشال فقط للعرض السريع
        setRecentMarshals(data.slice(0, 3));
        
        // تحديث الإحصائيات
        setStats(prev => ({
          ...prev,
          totalMarshalls: data.length,
          availableMarshalls: data.filter(m => m.workStatus !== 'مشغول').length
        }));
      }
    } catch (error) {
      console.error('خطأ في جلب بيانات المارشال:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  const handleEventCreated = (newEvent) => {
    setStats(prev => ({
      ...prev,
      totalRaces: prev.totalRaces + 1,
      activeRaces: prev.activeRaces + 1,
      upcomingEvents: prev.upcomingEvents + 1
    }));
    setCurrentView('dashboard');
  };

  if (!user) {
    return <div>Loading... | جاري التحميل...</div>;
  }

  const renderNavigation = () => (
    <div className="dashboard-navigation">
      <button 
        className={`nav-item ${currentView === 'dashboard' ? 'active' : ''}`}
        onClick={() => setCurrentView('dashboard')}
      >
        � الرئيسية | Dashboard
      </button>
      <button 
        className={`nav-item ${currentView === 'marshalls' ? 'active' : ''}`}
        onClick={() => setCurrentView('marshalls')}
      >
        � إدارة المارشال | Marshall Management
      </button>
      <button 
        className={`nav-item ${currentView === 'races' ? 'active' : ''}`}
        onClick={() => setCurrentView('races')}
      >
        🏎️ إدارة السباقات | Race Management
      </button>
      <button 
        className={`nav-item ${currentView === 'tracks' ? 'active' : ''}`}
        onClick={() => setCurrentView('tracks')}
      >
        � إدارة الحلبات | Track Management
      </button>
    </div>
  );

  const renderDashboard = () => (
    <>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>🏎️ إجمالي السباقات | Total Races</h3>
          <div className="stat-number">{stats.totalRaces}</div>
        </div>
        <div className="stat-card">
          <h3>🏁 السباقات النشطة | Active Races</h3>
          <div className="stat-number">{stats.activeRaces}</div>
        </div>
        <div className="stat-card">
          <h3>👥 إجمالي المارشال | Total Marshalls</h3>
          <div className="stat-number">{stats.totalMarshalls}</div>
        </div>
        <div className="stat-card">
          <h3>✅ المارشال المتاحين | Available Marshalls</h3>
          <div className="stat-number">{stats.availableMarshalls}</div>
        </div>
        <div className="stat-card">
          <h3>🏁 الحلبات قيد الاستخدام | Tracks in Use</h3>
          <div className="stat-number">{stats.tracksInUse}</div>
        </div>
        <div className="stat-card">
          <h3>📅 الفعاليات القادمة | Upcoming Events</h3>
          <div className="stat-number">{stats.upcomingEvents}</div>
        </div>
      </div>

      <div className="actions-section">
        <h2>⚡ الإجراءات السريعة | Quick Actions</h2>
        <div className="action-cards-grid">
          <div 
            className="action-card primary-card"
            onClick={() => onPageChange('create-race')}
          >
            <div className="card-icon">🏁</div>
            <div className="card-content">
              <h3>إنشاء سباق جديد</h3>
              <p>Create New Race</p>
              <span className="card-description">إضافة حدث سباق جديد للجدولة</span>
            </div>
            <div className="card-arrow">→</div>
          </div>
          <div 
            className="action-card secondary-card"
            onClick={() => onPageChange('marshals-view')}
          >
            <div className="card-icon">👥</div>
            <div className="card-content">
              <h3>توزيع المارشال</h3>
              <p>Assign Marshalls</p>
              <span className="card-description">تعيين المارشال للسباقات</span>
            </div>
            <div className="card-arrow">→</div>
          </div>
          <div 
            className="action-card accent-card"
            onClick={() => setCurrentView('tracks')}
          >
            <div className="card-icon">🏁</div>
            <div className="card-content">
              <h3>إدارة الحلبات</h3>
              <p>Manage Tracks</p>
              <span className="card-description">مراقبة حالة الحلبات</span>
            </div>
            <div className="card-arrow">→</div>
          </div>
          <div 
            className="action-card info-card"
            onClick={() => onPageChange('race-management')}
          >
            <div className="card-icon">📋</div>
            <div className="card-content">
              <h3>جدولة السباقات</h3>
              <p>Schedule Races</p>
              <span className="card-description">تنظيم التقويم والأحداث</span>
            </div>
            <div className="card-arrow">→</div>
          </div>
          <div 
            className="action-card success-card"
            onClick={() => onPageChange('marshal-ratings')}
          >
            <div className="card-icon">📈</div>
            <div className="card-content">
              <h3>تقارير الأداء</h3>
              <p>Performance Reports</p>
              <span className="card-description">مراجعة إحصائيات الأداء</span>
            </div>
            <div className="card-arrow">→</div>
          </div>
          <div className="action-card warning-card">
            <div className="card-icon">🛡️</div>
            <div className="card-content">
              <h3>تقارير السلامة</h3>
              <p>Safety Reports</p>
              <span className="card-description">مراجعة بيانات السلامة</span>
            </div>
            <div className="card-arrow">→</div>
          </div>
        </div>
      </div>

      {/* قسم المارشال الحديثين */}
      <div className="recent-marshals-section">
        <div className="section-header">
          <h2>👥 المارشال الحديثين | Recent Marshals</h2>
          <button 
            className="view-all-btn"
            onClick={() => onPageChange('marshals-view')}
          >
            عرض الكل →
          </button>
        </div>
        
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner">⏳ جاري التحميل...</div>
          </div>
        ) : recentMarshals.length > 0 ? (
          <div className="recent-marshals-grid">
            {recentMarshals.map((marshal) => (
              <MarshalCard
                key={marshal._id}
                marshal={marshal}
                variant="compact"
                showActions={false}
                showDetails={true}
                onClick={() => onPageChange('marshals-view')}
              />
            ))}
          </div>
        ) : (
          <div className="no-marshals">
            <span className="no-data-icon">📋</span>
            <p>لا توجد بيانات مارشال حتى الآن</p>
            <button 
              className="add-marshal-btn"
              onClick={() => onPageChange('marshals-view')}
            >
              إدارة المارشال
            </button>
          </div>
        )}
      </div>

      <div className="recent-section">
        <h2>📰 Recent Activity | النشاط الأخير</h2>
        <div className="activity-list">
          <div className="activity-item">
            <span className="activity-icon">✅</span>
            <div className="activity-content">
              <p><strong>Ahmed Mohammed</strong> applied for "El Clasico Match" | <strong>أحمد محمد</strong> تقدم للعمل في حدث "مباراة الكلاسيكو"</p>
              <span className="activity-time">30 minutes ago | منذ 30 دقيقة</span>
            </div>
          </div>
          <div className="activity-item">
            <span className="activity-icon">🎪</span>
            <div className="activity-content">
              <p>New event created: <strong>"Player Awards Ceremony"</strong> | تم إنشاء حدث جديد: <strong>"حفل تكريم اللاعبين"</strong></p>
              <span className="activity-time">2 hours ago | منذ ساعتين</span>
            </div>
          </div>
          <div className="activity-item">
            <span className="activity-icon">👤</span>
            <div className="activity-content">
              <p><strong>Sarah Ahmed</strong> completed her profile | <strong>سارة أحمد</strong> أكملت ملفها الشخصي</p>
              <span className="activity-time">3 hours ago | منذ 3 ساعات</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  const renderContent = () => {
    switch (currentView) {
      case 'marshalls':
        return (
          <div className="marshalls-management">
            <h2>👥 إدارة المارشال | Marshall Management</h2>
            <div className="marshall-grid">
              <div className="marshall-card">
                <h3>أحمد المارشال</h3>
                <p><strong>التخصص:</strong> الحلبة الرئيسية، حلبة الكارتينغ</p>
                <p><strong>سنوات الخبرة:</strong> 5 سنوات</p>
                <p><strong>الحالة:</strong> <span className="status available">متاح</span></p>
                <button className="assign-btn">تعيين لسباق</button>
              </div>
              <div className="marshall-card">
                <h3>محمد السباق</h3>
                <p><strong>التخصص:</strong> حلبة الدريفت، ساحة الدريفت</p>
                <p><strong>سنوات الخبرة:</strong> 8 سنوات</p>
                <p><strong>الحالة:</strong> <span className="status busy">مشغول</span></p>
                <button className="assign-btn" disabled>غير متاح</button>
              </div>
              <div className="marshall-card">
                <h3>خالد الأمان</h3>
                <p><strong>التخصص:</strong> جميع الحلبات</p>
                <p><strong>سنوات الخبرة:</strong> 12 سنة</p>
                <p><strong>الحالة:</strong> <span className="status available">متاح</span></p>
                <button className="assign-btn">تعيين لسباق</button>
              </div>
            </div>
          </div>
        );
      case 'races':
        return (
          <div className="races-management">
            <h2>�️ إدارة السباقات | Race Management</h2>
            <div className="race-schedule">
              <div className="race-event">
                <h3>بطولة الفورمولا 4 السعودية - الجولة الثانية</h3>
                <p><strong>التاريخ:</strong> 2025-11-15 | <strong>الوقت:</strong> 14:00 - 18:00</p>
                <p><strong>الحلبة:</strong> الحلبة الرئيسية</p>
                <p><strong>المارشال المطلوبين:</strong> 6 | <strong>المعينين:</strong> 4</p>
                <button className="manage-btn">إدارة السباق</button>
              </div>
              <div className="race-event">
                <h3>اليوم المفتوح للكارتينغ</h3>
                <p><strong>التاريخ:</strong> 2025-11-18 | <strong>الوقت:</strong> 09:00 - 17:00</p>
                <p><strong>الحلبة:</strong> حلبة الكارتينغ</p>
                <p><strong>المارشال المطلوبين:</strong> 4 | <strong>المعينين:</strong> 4</p>
                <button className="manage-btn">إدارة السباق</button>
              </div>
            </div>
          </div>
        );
      case 'tracks':
        return (
          <div className="tracks-management">
            <h2>🏁 إدارة الحلبات | Track Management</h2>
            <div className="tracks-grid">
              <div className="track-card active">
                <h3>🏁 الحلبة الرئيسية</h3>
                <p><strong>الحالة:</strong> نشطة - بطولة الفورمولا 4</p>
                <p><strong>المارشال:</strong> 4/6</p>
                <p><strong>مستوى السلامة:</strong> عالي ✅</p>
              </div>
              <div className="track-card available">
                <h3>🏎️ حلبة الكارتينغ</h3>
                <p><strong>الحالة:</strong> متاحة</p>
                <p><strong>المارشال:</strong> 2/4</p>
                <p><strong>مستوى السلامة:</strong> عالي ✅</p>
              </div>
              <div className="track-card maintenance">
                <h3>🔄 ساحة الدريفت</h3>
                <p><strong>الحالة:</strong> صيانة</p>
                <p><strong>المارشال:</strong> 0/3</p>
                <p><strong>مستوى السلامة:</strong> متوسط ⚠️</p>
              </div>
            </div>
          </div>
        );
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>🏁 مدينة الكويت لرياضة المحركات - مركز التحكم</h1>
        <div className="user-info">
          <span>أهلاً وسهلاً، {user.fullName} | Welcome, {user.fullName}</span>
          <button onClick={handleLogout} className="logout-btn">
            تسجيل خروج | Logout
          </button>
        </div>
      </header>

      <div className="dashboard-content">
        {renderDashboard()}
      </div>

      {showCreateEvent && (
        <CreateEvent 
          onClose={() => setShowCreateEvent(false)}
          onEventCreated={handleEventCreated}
        />
      )}
    </div>
  );
};

export default ManagerDashboard;