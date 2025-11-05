import React, { useState } from 'react';
import TestUsers from '../components/TestUsers';
import './KMT-Auth-Original.css';

const Auth = ({ onPageChange }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [userType, setUserType] = useState('marshall');
  const [showTestUsers, setShowTestUsers] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    employeeId: ''
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
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const body = isLogin 
        ? { email: formData.email, password: formData.password }
        : { ...formData, userType };

      const response = await fetch(`http://localhost:5001${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userData', JSON.stringify(data.user));
        setMessage(`${isLogin ? 'Login' : 'Registration'} successful! | تم ${isLogin ? 'تسجيل الدخول' : 'إنشاء الحساب'} بنجاح! 🎉`);
        
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
      <div className="auth-background">
        <div className="floating-shapes">
          <div className="shape shape1"></div>
          <div className="shape shape2"></div>
          <div className="shape shape3"></div>
        </div>
      </div>

      <div className="auth-card">
                <div className="auth-header">
          <h1 className="auth-title">
            <span className="logo-icon">🏁</span>
            مدينة الكويت لرياضة المحركات
          </h1>
          <p className="auth-subtitle">
            Kuwait Motor Town - نظام إدارة المارشال
          </p>
          <p className="auth-description">
            للمارشال المعتمدين فقط | Certified Marshals Only
          </p>
        </div>

        <div className="auth-tabs">
          <div className="single-tab active">
            تسجيل دخول المارشال المعتمد
          </div>
          <p className="login-note">
            لا يمكن إنشاء حساب جديد - للمارشال المعتمدين فقط
          </p>
        </div>

        {!isLogin && (
          <div className="user-type-selector">
            <div className="user-type-option">
              <input
                type="radio"
                id="worker"
                name="userType"
                value="worker"
                checked={userType === 'worker'}
                onChange={(e) => setUserType(e.target.value)}
              />
              <label htmlFor="worker" className="user-type-label">
                <span className="user-type-icon">👷‍♂️</span>
                <div>
                  <h3>Worker | عامل</h3>
                  <p>Looking for work opportunities in events | أبحث عن فرص عمل في الأحداث</p>
                </div>
              </label>
            </div>

            <div className="user-type-option">
              <input
                type="radio"
                id="manager"
                name="userType"
                value="manager"
                checked={userType === 'manager'}
                onChange={(e) => setUserType(e.target.value)}
              />
              <label htmlFor="manager" className="user-type-label">
                <span className="user-type-icon">👔</span>
                <div>
                  <h3>Manager | مدير</h3>
                  <p>I manage a club and need workers for events | أدير نادي وأحتاج عمال للأحداث</p>
                </div>
              </label>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <div className="form-group">
              <label>Full Name | الاسم الكامل</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                required={!isLogin}
                placeholder="Enter your full name | أدخل اسمك الكامل"
              />
            </div>
          )}

          <div className="form-group">
            <label>Email | البريد الإلكتروني</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              placeholder="example@email.com"
            />
          </div>

          <div className="form-group">
            <label>Password | كلمة المرور</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              placeholder="Enter password | أدخل كلمة المرور"
              minLength="6"
            />
          </div>

          {!isLogin && (
            <>
              <div className="form-group">
                <label>Confirm Password | تأكيد كلمة المرور</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required={!isLogin}
                  placeholder="Confirm password | أعد إدخال كلمة المرور"
                />
              </div>

              <div className="form-group">
                <label>Phone Number | رقم الهاتف</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required={!isLogin}
                  placeholder="+966 5X XXX XXXX"
                />
              </div>
            </>
          )}

          {message && (
            <div className={`message ${message.includes('بنجاح') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? (
              <span className="loading-spinner">⏳</span>
            ) : (
              isLogin ? 'Login | دخول' : 'Sign Up | تسجيل'
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            {isLogin ? "Don't have an account? | ليس لديك حساب؟ " : "Already have an account? | لديك حساب بالفعل؟ "}
            <button 
              type="button"
              className="link-button"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? 'Sign Up | إنشاء حساب' : 'Login | تسجيل دخول'}
            </button>
          </p>
          
          <div className="test-users-section">
            <p className="test-info">🛠️ For testing purposes | لأغراض التجربة</p>
            <button 
              type="button"
              className="test-users-btn"
              onClick={() => setShowTestUsers(true)}
            >
              Create Test Users | إنشاء مستخدمين تجريبيين
            </button>
          </div>
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