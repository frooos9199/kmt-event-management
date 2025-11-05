import React, { useState } from 'react';
import './TestUsers.css';

const TestUsers = ({ onUserCreated, onLogin }) => {
  const [creating, setCreating] = useState(false);
  const [result, setResult] = useState(null);
  const [loggingIn, setLoggingIn] = useState(null);

  const createTestUsers = async () => {
    setCreating(true);
    setResult(null);

    try {
      // إنشاء المدير
      const managerResponse = await fetch('http://localhost:5001/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: 'مدير النظام',
          email: 'A@A.com',
          password: '123456',
          phone: '+96560123456',
          userType: 'manager'
        }),
      });

        // إنشاء المارشال
        const marshallResponse = await fetch('http://localhost:5001/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fullName: 'أحمد المارشال',
            email: 'B@B.com',
            password: '123456',
            phone: '+96550123456',
            userType: 'marshall'
          }),
        });      if (managerResponse.ok && marshallResponse.ok) {
        setResult({
          success: true,
          message: 'تم إنشاء المستخدمين بنجاح! 🎉',
          users: [
            { email: 'A@A.com', password: '123456', type: 'مدير الحلبة', name: 'مدير النظام' },
            { email: 'B@B.com', password: '123456', type: 'مارشال معتمد', name: 'أحمد المارشال' }
          ]
        });
        if (onUserCreated) onUserCreated();
      } else {
        setResult({
          success: false,
          message: 'Some users might already exist or there was an error'
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'Connection error: ' + error.message
      });
    } finally {
      setCreating(false);
    }
  };

  const quickLogin = async (email, password, userType) => {
    setLoggingIn(userType);
    
    // محاكاة تسجيل الدخول بدون API للتجربة
    setTimeout(() => {
      const userData = {
        id: userType === 'manager' ? '1' : '2',
        fullName: userType === 'manager' ? 'Manager Admin' : 'Worker User',
        email: email,
        userType: userType,
        accountStatus: 'approved'
      };
      
      // حفظ البيانات
      localStorage.setItem('token', 'demo_token_' + Date.now());
      localStorage.setItem('userType', userData.userType);
      localStorage.setItem('userData', JSON.stringify(userData));
      
      if (onLogin) {
        onLogin(userData);
      }
      
      setLoggingIn(null);
    }, 1000);
  };

  return (
    <div className="test-users-container">
      <div className="test-users-card">
        <h2>🏁 مدينة الكويت لرياضة المحركات</h2>
        <h3>نظام إدارة المارشال - وضع التجربة</h3>
        <p>استخدم الحسابات التجريبية للدخول إلى النظام</p>

        <div className="users-preview">
          <div 
            className={`user-preview clickable ${loggingIn === 'manager' ? 'logging-in' : ''}`}
            onClick={() => quickLogin('A@A.com', '123456', 'manager')}
            disabled={loggingIn}
          >
            <h3>👔 Manager Account</h3>
            <p><strong>Email:</strong> A@A.com</p>
            <p><strong>Password:</strong> 123456</p>
            <p><strong>Type:</strong> Manager</p>
            {loggingIn === 'manager' && <p className="loading">🔄 Logging in...</p>}
            <div className="click-hint">👆 Click to login | اضغط لتسجيل الدخول</div>
          </div>
          
          <div 
            className={`user-preview clickable ${loggingIn === 'worker' ? 'logging-in' : ''}`}
            onClick={() => quickLogin('B@B.com', '123456', 'worker')}
            disabled={loggingIn}
          >
            <h3>👷‍♂️ Worker Account</h3>
            <p><strong>Email:</strong> B@B.com</p>
            <p><strong>Password:</strong> 123456</p>
            <p><strong>Type:</strong> Worker</p>
            {loggingIn === 'worker' && <p className="loading">🔄 Logging in...</p>}
            <div className="click-hint">👆 Click to login | اضغط لتسجيل الدخول</div>
          </div>
        </div>

        <button 
          className="create-btn"
          onClick={createTestUsers}
          disabled={creating}
        >
          {creating ? 'Creating... | جاري الإنشاء...' : 'Create Test Users | إنشاء المستخدمين'}
        </button>

        {result && (
          <div className={`result ${result.success ? 'success' : 'error'}`}>
            <p>{result.message}</p>
            {result.success && result.users && (
              <div className="users-created">
                <h4>✅ Created Users:</h4>
                {result.users.map((user, index) => (
                  <div key={index} className="created-user">
                    <strong>{user.name}</strong> - {user.email} ({user.type})
                  </div>
                ))}
                <p className="instruction">
                  Now you can login with these credentials! | يمكنك الآن تسجيل الدخول بهذه البيانات!
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TestUsers;