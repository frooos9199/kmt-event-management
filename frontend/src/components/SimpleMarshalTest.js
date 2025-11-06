import React, { useState, useEffect } from 'react';

const SimpleMarshalTest = () => {
  const [marshals, setMarshals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState('');

  // تسجيل الدخول والحصول على الرمز المميز
  const login = async () => {
    try {
      const response = await fetch('https://kmt-event-management.onrender.com/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'admin@kmt.com',
          password: 'admin123'
        }),
      });

      const data = await response.json();
      if (data.success) {
        setToken(data.token);
        localStorage.setItem('token', data.token);
        alert('تم تسجيل الدخول بنجاح');
        fetchMarshals(data.token);
      } else {
        alert('فشل في تسجيل الدخول');
      }
    } catch (error) {
      console.error('خطأ في تسجيل الدخول:', error);
      alert('خطأ في الاتصال');
    }
  };

  // جلب المارشال
  const fetchMarshals = async (authToken = token) => {
    try {
      setLoading(true);
      const response = await fetch('https://kmt-event-management.onrender.com/api/users/marshals', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMarshals(data.marshals || []);
        console.log('تم جلب المارشال:', data.marshals);
      } else {
        console.error('فشل في جلب المارشال:', response.status);
        alert('فشل في جلب المارشال');
      }
    } catch (error) {
      console.error('خطأ في جلب المارشال:', error);
      alert('خطأ في الاتصال');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setToken(savedToken);
      fetchMarshals(savedToken);
    }
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🔧 اختبار إدارة المارشال</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={login}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          🔑 تسجيل دخول
        </button>
        
        <button 
          onClick={() => fetchMarshals()}
          disabled={!token || loading}
          style={{
            padding: '10px 20px',
            backgroundColor: token ? '#28a745' : '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: token ? 'pointer' : 'not-allowed'
          }}
        >
          🔄 تحديث القائمة
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <strong>🔑 الرمز المميز:</strong> {token ? 'متاح ✅' : 'غير متاح ❌'}
      </div>

      {loading && (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          ⏳ جاري التحميل...
        </div>
      )}

      <h2>📋 قائمة المارشال ({marshals.length})</h2>
      
      {marshals.length === 0 && !loading && (
        <div style={{ padding: '20px', textAlign: 'center', border: '1px dashed #ccc' }}>
          📝 لا يوجد مارشال مسجلين أو لم يتم تحميل البيانات بعد
        </div>
      )}

      <div style={{ display: 'grid', gap: '10px' }}>
        {marshals.map(marshal => (
          <div 
            key={marshal.id} 
            style={{
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '15px',
              backgroundColor: '#f8f9fa'
            }}
          >
            <h3 style={{ margin: '0 0 10px 0', color: '#007bff' }}>
              👤 {marshal.fullName}
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div><strong>🔢 رقم المارشال:</strong> {marshal.marshalNumber}</div>
              <div><strong>📧 الإيميل:</strong> {marshal.email}</div>
              <div><strong>📱 الهاتف:</strong> {marshal.phone}</div>
              <div><strong>🌍 الجنسية:</strong> {marshal.nationality}</div>
              <div>
                <strong>🔄 الحالة:</strong> 
                <span style={{
                  marginLeft: '5px',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  backgroundColor: marshal.status === 'active' ? '#d4edda' : '#fff3cd',
                  color: marshal.status === 'active' ? '#155724' : '#856404'
                }}>
                  {marshal.status === 'active' ? 'نشط' : 'في الانتظار'}
                </span>
              </div>
              <div><strong>📅 تاريخ الإنشاء:</strong> {new Date(marshal.createdAt).toLocaleDateString('ar-SA')}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SimpleMarshalTest;