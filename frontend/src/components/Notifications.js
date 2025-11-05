import React, { useState, useEffect } from 'react';
import '../pages/KMT-Original.css';

const Notifications = ({ onPageChange }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, unread: 0, read: 0 });

  useEffect(() => {
    fetchNotifications();
    fetchStats();
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://kmt-event-management.onrender.com/api/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error('خطأ في جلب الإشعارات:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://kmt-event-management.onrender.com/api/notifications/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('خطأ في جلب إحصائيات الإشعارات:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://kmt-event-management.onrender.com/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => 
            notif._id === notificationId 
              ? { ...notif, isRead: true }
              : notif
          )
        );
        fetchStats();
      }
    } catch (error) {
      console.error('خطأ في تحديث الإشعار:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://kmt-event-management.onrender.com/api/notifications/mark-all-read', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => ({ ...notif, isRead: true }))
        );
        fetchStats();
      }
    } catch (error) {
      console.error('خطأ في تحديث الإشعارات:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://kmt-event-management.onrender.com/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.filter(notif => notif._id !== notificationId)
        );
        fetchStats();
      }
    } catch (error) {
      console.error('خطأ في حذف الإشعار:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'new_race': return '🏁';
      case 'application_status': return '📝';
      default: return '📢';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="kmt-page">
        <div className="kmt-container">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>جاري تحميل الإشعارات...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="kmt-page">
      <div className="kmt-header">
        <button 
          onClick={() => onPageChange('worker-dashboard')}
          className="kmt-back-btn"
        >
          ← العودة
        </button>
        <h1 className="kmt-title">🔔 الإشعارات</h1>
      </div>

      <div className="kmt-container">
        {/* إحصائيات الإشعارات */}
        <div className="notifications-stats">
          <div className="stat-card">
            <span className="stat-number">{stats.total}</span>
            <span className="stat-label">المجموع</span>
          </div>
          <div className="stat-card unread">
            <span className="stat-number">{stats.unread}</span>
            <span className="stat-label">غير مقروءة</span>
          </div>
          <div className="stat-card read">
            <span className="stat-number">{stats.read}</span>
            <span className="stat-label">مقروءة</span>
          </div>
        </div>

        {/* أزرار الإجراءات */}
        {stats.unread > 0 && (
          <div className="notifications-actions">
            <button 
              onClick={markAllAsRead}
              className="kmt-button secondary"
            >
              ✓ تحديد الكل كمقروء
            </button>
          </div>
        )}

        {/* قائمة الإشعارات */}
        <div className="notifications-list">
          {notifications.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🔔</div>
              <h3>لا توجد إشعارات</h3>
              <p>ستظهر هنا الإشعارات الخاصة بك</p>
            </div>
          ) : (
            notifications.map(notification => (
              <div 
                key={notification._id} 
                className={`notification-card ${!notification.isRead ? 'unread' : 'read'}`}
              >
                <div className="notification-icon">
                  {getNotificationIcon(notification.type)}
                </div>
                
                <div className="notification-content">
                  <h4 className="notification-title">{notification.title}</h4>
                  <p className="notification-message">{notification.message}</p>
                  <span className="notification-time">
                    {formatDate(notification.createdAt)}
                  </span>
                </div>

                <div className="notification-actions">
                  {!notification.isRead && (
                    <button
                      onClick={() => markAsRead(notification._id)}
                      className="notification-btn read-btn"
                      title="تحديد كمقروء"
                    >
                      ✓
                    </button>
                  )}
                  
                  <button
                    onClick={() => deleteNotification(notification._id)}
                    className="notification-btn delete-btn"
                    title="حذف"
                  >
                    🗑️
                  </button>

                  {notification.type === 'new_race' && notification.raceId && (
                    <button
                      onClick={() => onPageChange('available-races')}
                      className="notification-btn view-btn"
                      title="عرض السباقات"
                    >
                      👁️
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;