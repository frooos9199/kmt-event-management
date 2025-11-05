import React, { useState } from 'react';
import TestUsers from '../components/TestUsers';
import './KMT-Auth-Original.css';

const Auth = ({ onPageChange }) => {
  const [showTestUsers, setShowTestUsers] = useState(false);
  const [formData, setFormData] = useState({
    username: '', // حقل موحد للإيميل أو رقم المارشال
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleLogin = (user) => {
    setMessage(`Login successful! | تم تسجيل الدخول بنجاح! 🎉`);
    setShowTestUsers(false);
    
    // إعادة توجيه حسب نوع المستخدم
    setTimeout(() => {
      if (user.userType === 'manager') {
        onPageChange('manager-dashboard', user);
      } else {
        onPageChange('worker-dashboard', user);
      }
    }, 1000);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // تحديد نوع البيانات بذكاء
      const { username, password } = formData;
      
      // إذا كان يحتوي على @ فهو إيميل (إدمن)
      // إذا كان رقم أو يبدأ بـ KMT فهو مارشال
      const isEmail = username.includes('@');
      const requestData = isEmail 
        ? { email: username, password }
        : { marshalNumber: username, password };

      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://kmt-event-management.onrender.com'}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userData', JSON.stringify(data.user));
        setMessage(`Login successful! | تم تسجيل الدخول بنجاح! 🎉`);
        
        // إعادة توجيه حسب نوع المستخدم
        setTimeout(() => {
          if (data.user.userType === 'manager') {
            onPageChange('manager-dashboard', data.user);
          } else {
            onPageChange('worker-dashboard', data.user);
          }
        }, 1500);
      } else {
        setMessage(data.message || 'Something went wrong | حدث خطأ ما');
      }
    } catch (error) {
      setMessage('Connection error | خطأ في الاتصال بالخادم');
    }

    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-wrapper">
        <div className="auth-header">
          <h1>🏁 مدينة الكويت لرياضة المحركات</h1>
          <p className="subtitle">Kuwait Motor Town - نظام إدارة المارشال</p>
        </div>
        
        <div className="auth-content">
          <div className="auth-tabs">
            <button className="auth-tab active">
              🏁 تسجيل الدخول | Login
            </button>
          </div>

          {message && (
            <div className={`auth-message ${message.includes('successful') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">👤 اسم المستخدم | Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                required
                placeholder="admin@kmt.com أو 100 أو KMT-100"
                className="form-input"
              />
              <small className="form-help">
                💡 أدخل الإيميل للإدمن أو رقم المارشال
              </small>
            </div>

            <div className="form-group">
              <label className="form-label">🔒 كلمة المرور | Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                placeholder="كلمة المرور"
                className="form-input"
              />
            </div>

            <button 
              type="submit" 
              className="auth-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  جاري تسجيل الدخول...
                </>
              ) : (
                '🚀 دخول | Login'
              )}
            </button>
          </form>

          <button 
            onClick={() => setShowTestUsers(!showTestUsers)}
            className="demo-btn"
          >
            {showTestUsers ? '❌ إخفاء' : '👥 عرض'} المستخدمين التجريبيين | Demo Users
          </button>

          {showTestUsers && (
            <div className="test-users-section">
              <h3 className="test-users-title">👥 المستخدمون التجريبيون | Test Users</h3>
              <div className="test-user-cards">
                <div 
                  className="test-user-card manager"
                  onClick={() => handleLogin({
                    email: 'admin@kmt.com',
                    userType: 'manager',
                    fullName: 'مدير النظام'
                  })}
                >
                  <div className="test-user-role">👔 مدير | Manager</div>
                  <div className="test-user-email">📧 admin@kmt.com</div>
                  <div className="test-user-password">🔒 admin123</div>
                </div>
                
                <div 
                  className="test-user-card worker"
                  onClick={() => handleLogin({
                    id: 'KMT-100',
                    marshalNumber: '100',
                    userType: 'marshall', 
                    fullName: 'أحمد محمد الكويتي'
                  })}
                >
                  <div className="test-user-role">🏁 مارشال | Marshal</div>
                  <div className="test-user-email">🏁 KMT-100</div>
                  <div className="test-user-password">🔒 123456</div>
                </div>
                
                <div 
                  className="test-user-card worker"
                  onClick={() => handleLogin({
                    id: 'KMT-102',
                    marshalNumber: '102',
                    userType: 'marshall', 
                    fullName: 'مارشال رقم 102'
                  })}
                >
                  <div className="test-user-role">🏁 مارشال جديد | New Marshal</div>
                  <div className="test-user-email">🏁 KMT-102</div>
                  <div className="test-user-password">🔒 3</div>
                </div>
              </div>
              
              <div style={{
                marginTop: '1rem',
                padding: '1rem',
                backgroundColor: '#f0f9ff',
                borderRadius: '8px',
                fontSize: '0.9rem',
                color: '#1e40af',
                borderLeft: '4px solid #3b82f6'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <strong>💡 طريقة تسجيل الدخول | How to Login</strong>
                </div>
                <div style={{ marginBottom: '0.5rem' }}>
                  <strong>🛡️ للإدمن:</strong> admin@kmt.com + admin123
                </div>
                <div>
                  <strong>🏁 للمارشال:</strong> 100 أو KMT-100 + 123456
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showTestUsers && (
        <TestUsers 
          onUserCreated={() => {
            setShowTestUsers(false);
            setMessage('Test users created! You can now login with A@A.com/123456 or B@B.com/123456 | تم إنشاء المستخدمين! يمكنك تسجيل الدخول بـ A@A.com/123456 أو B@B.com/123456');
          }}
          onLogin={handleLogin}
        />
      )}
    </div>
  );
};

export default Auth;