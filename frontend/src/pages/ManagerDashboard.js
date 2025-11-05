import React, { useEffect, useState } from 'react';
import CreateEvent from '../components/CreateEvent';
import MarshalCard from '../components/MarshalCard';
import MarshalsManagement from '../components/MarshalsManagement';
import './KMT-Original.css';
import './Formula-Enhancement.css';
import '../styles/MarshalCard.css';

const ManagerDashboard = ({ onPageChange }) => {
  const [user, setUser] = useState(null);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [recentMarshals, setRecentMarshals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRaces: 0,
    activeRaces: 0,
    totalMarshalls: 0,
    availableMarshalls: 0,
    tracksInUse: 0,
    upcomingEvents: 0
  });

  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    
    // جلب المارشال الحديثين والإحصائيات
    fetchRecentMarshals();
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setStatsLoading(true);
      const token = localStorage.getItem('token');
      const API_URL = process.env.REACT_APP_API_URL || 'https://kmt-event-management.onrender.com';
      const response = await fetch(`${API_URL}/api/stats/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setStats({
            totalRaces: data.stats.totalRaces || 8,
            activeRaces: data.stats.activeRaces || 3,
            totalMarshalls: data.stats.totalMarshalls || 0,
            availableMarshalls: data.stats.availableMarshalls || 0,
            tracksInUse: data.stats.tracksInUse || 0,
            upcomingEvents: data.stats.upcomingEvents || 5
          });
        }
      } else {
        console.error('فشل في جلب الإحصائيات');
        // في حالة فشل الاتصال، استخدم البيانات الافتراضية
        setStats({
          totalRaces: 8,
          activeRaces: 3,
          totalMarshalls: 3, // عدد المارشال التجريبيين
          availableMarshalls: 3,
          tracksInUse: 4,
          upcomingEvents: 5
        });
      }
    } catch (error) {
      console.error('خطأ في جلب الإحصائيات:', error);
      // في حالة الخطأ، استخدم البيانات الافتراضية
      setStats({
        totalRaces: 8,
        activeRaces: 3,
        totalMarshalls: 3,
        availableMarshalls: 3,
        tracksInUse: 4,
        upcomingEvents: 5
      });
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchRecentMarshals = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const API_URL = process.env.REACT_APP_API_URL || 'https://kmt-event-management.onrender.com';
      const response = await fetch(`${API_URL}/api/users/marshals`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });      if (response.ok) {
        const data = await response.json();
        // أخذ آخر 3 مارشال فقط للعرض السريع
        setRecentMarshals(data.slice(0, 3));
      }
    } catch (error) {
      console.error('خطأ في جلب بيانات المارشال:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    onPageChange('auth');
  };

  const handleEventCreated = (eventData) => {
    console.log('Event created:', eventData);
    setShowCreateEvent(false);
  };

  if (!user) {
    return <div>Loading... | جاري التحميل...</div>;
  }

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
        {/* الإحصائيات */}
        <div className="stats-grid">
          <div 
            className="stat-card primary clickable-stat"
            onClick={() => onPageChange('stats-detail', { type: 'races' })}
          >
            <div className="stat-icon">🏁</div>
            <div className="stat-info">
              <h3>إجمالي السباقات</h3>
              <p>Total Races</p>
              <div className="stat-number">
                {statsLoading ? '⏳' : stats.totalRaces}
              </div>
            </div>
            <div className="stat-arrow">→</div>
          </div>
          
          <div 
            className="stat-card success clickable-stat"
            onClick={() => onPageChange('stats-detail', { type: 'active-races' })}
          >
            <div className="stat-icon">⚡</div>
            <div className="stat-info">
              <h3>السباقات النشطة</h3>
              <p>Active Races</p>
              <div className="stat-number">
                {statsLoading ? '⏳' : stats.activeRaces}
              </div>
            </div>
            <div className="stat-arrow">→</div>
          </div>
          
          <div 
            className="stat-card info clickable-stat"
            onClick={() => onPageChange('stats-detail', { type: 'marshalls' })}
          >
            <div className="stat-icon">👥</div>
            <div className="stat-info">
              <h3>إجمالي المارشال</h3>
              <p>Total Marshalls</p>
              <div className="stat-number">
                {statsLoading ? '⏳' : stats.totalMarshalls}
              </div>
            </div>
            <div className="stat-arrow">→</div>
          </div>
          
          <div 
            className="stat-card warning clickable-stat"
            onClick={() => onPageChange('stats-detail', { type: 'available-marshalls' })}
          >
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <h3>المارشال المتاحين</h3>
              <p>Available Marshalls</p>
              <div className="stat-number">
                {statsLoading ? '⏳' : stats.availableMarshalls}
              </div>
            </div>
            <div className="stat-arrow">→</div>
          </div>
          
          <div 
            className="stat-card accent clickable-stat"
            onClick={() => onPageChange('stats-detail', { type: 'tracks' })}
          >
            <div className="stat-icon">🏁</div>
            <div className="stat-info">
              <h3>الحلبات النشطة</h3>
              <p>Active Tracks</p>
              <div className="stat-number">
                {statsLoading ? '⏳' : stats.tracksInUse}
              </div>
            </div>
            <div className="stat-arrow">→</div>
          </div>
          
          <div 
            className="stat-card secondary clickable-stat"
            onClick={() => onPageChange('stats-detail', { type: 'events' })}
          >
            <div className="stat-icon">📅</div>
            <div className="stat-info">
              <h3>الأحداث القادمة</h3>
              <p>Upcoming Events</p>
              <div className="stat-number">
                {statsLoading ? '⏳' : stats.upcomingEvents}
              </div>
            </div>
            <div className="stat-arrow">→</div>
          </div>
        </div>

        {/* كروت الإجراءات السريعة */}
        <div className="quick-actions">
          <h2>⚡ إجراءات سريعة | Quick Actions</h2>
          <div className="actions-grid">
            <div 
              className="action-card primary-card"
              onClick={() => onPageChange('create-race')}
            >
              <div className="card-icon">🏁</div>
              <div className="card-content">
                <h3>إنشاء سباق جديد</h3>
                <p>Create New Race</p>
                <span className="card-description">تنظيم بطولة أو حدث جديد</span>
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
              className="action-card warning-card"
              onClick={() => onPageChange('marshal-management')}
            >
              <div className="card-icon">👨‍💼</div>
              <div className="card-content">
                <h3>إدارة المارشال</h3>
                <p>Marshal Management</p>
                <span className="card-description">إضافة وتحرير وإدارة حسابات المارشال</span>
              </div>
              <div className="card-arrow">→</div>
            </div>
            
            <div 
              className="action-card success-card"
              onClick={() => onPageChange('applications-management')}
            >
              <div className="card-icon">📋</div>
              <div className="card-content">
                <h3>إدارة طلبات المارشال</h3>
                <p>Applications Management</p>
                <span className="card-description">مراجعة والموافقة على طلبات المارشال للسباقات</span>
              </div>
              <div className="card-arrow">→</div>
            </div>
            
            <div 
              className="action-card accent-card"
              onClick={() => onPageChange && onPageChange('tracks')}
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
              onClick={() => onPageChange('races-management')}
            >
              <div className="card-icon">🏁</div>
              <div className="card-content">
                <h3>إدارة السباقات الشاملة</h3>
                <p>Comprehensive Race Management</p>
                <span className="card-description">إدارة جميع السباقات والحالات والتفاصيل</span>
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

        {/* قسم إحصائيات المارشال السريعة */}
        <div className="marshals-summary-section">
          <h2>📊 ملخص المارشال | Marshals Summary</h2>
          <div className="marshals-summary-grid">
            <div className="summary-card total">
              <div className="summary-icon">👥</div>
              <div className="summary-content">
                <h3>{stats.totalMarshalls}</h3>
                <p>إجمالي المارشال</p>
                <span>Total Marshals</span>
              </div>
            </div>
            
            <div className="summary-card available">
              <div className="summary-icon">✅</div>
              <div className="summary-content">
                <h3>{stats.availableMarshalls}</h3>
                <p>متاح للعمل</p>
                <span>Available</span>
              </div>
            </div>
            
            <div className="summary-card active">
              <div className="summary-icon">🏁</div>
              <div className="summary-content">
                <h3>{recentMarshals.length}</h3>
                <p>نشط مؤخراً</p>
                <span>Recently Active</span>
              </div>
            </div>
            
            <div className="summary-card new">
              <div className="summary-icon">🆕</div>
              <div className="summary-content">
                <h3>{recentMarshals.filter(m => {
                  const regDate = new Date(m.createdAt);
                  const daysDiff = (new Date() - regDate) / (1000 * 60 * 60 * 24);
                  return daysDiff <= 7;
                }).length}</h3>
                <p>جديد هذا الأسبوع</p>
                <span>New This Week</span>
              </div>
            </div>
          </div>
        </div>

        {/* قسم المارشال الحديثين */}
        <div className="recent-marshals-section">
          <div className="section-header">
            <h2>👥 المارشال الحديثين | Recent Marshals</h2>
            <button 
              className="view-all-btn"
              onClick={() => onPageChange('marshal-management')}
            >
              إدارة المارشال →
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
                  onClick={() => onPageChange('marshal-management')}
                />
              ))}
            </div>
          ) : (
            <div className="no-marshals">
              <span className="no-data-icon">📋</span>
              <p>لا توجد بيانات مارشال حتى الآن</p>
              <button 
                className="add-marshal-btn"
                onClick={() => onPageChange('marshal-management')}
              >
                إدارة المارشال
              </button>
            </div>
          )}
        </div>

        {/* النشاط الأخير */}
        <div className="recent-section">
          <h2>📰 Recent Activity | النشاط الأخير</h2>
          <div className="activity-list">
            <div className="activity-item">
              <span className="activity-icon">✅</span>
              <div className="activity-content">
                <p><strong>خالد المارشال</strong> تم تعيينه في سباق فورمولا 4 | <strong>Khalid Marshal</strong> assigned to Formula 4 race</p>
                <span className="activity-time">30 minutes ago | منذ 30 دقيقة</span>
              </div>
            </div>
            <div className="activity-item">
              <span className="activity-icon">🎪</span>
              <div className="activity-content">
                <p>New race created: <strong>"KMT Championship Round 3"</strong> | تم إنشاء سباق جديد: <strong>"بطولة KMT الجولة الثالثة"</strong></p>
                <span className="activity-time">2 hours ago | منذ ساعتين</span>
              </div>
            </div>
            <div className="activity-item">
              <span className="activity-icon">👤</span>
              <div className="activity-content">
                <p><strong>محمد السريع</strong> أكمل ملفه الشخصي | <strong>Mohamed Fast</strong> completed his profile</p>
                <span className="activity-time">3 hours ago | منذ 3 ساعات</span>
              </div>
            </div>
          </div>
        </div>
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