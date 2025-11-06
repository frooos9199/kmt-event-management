import React, { useState, useEffect } from 'react';
import LoadingSpinner from './LoadingSpinner';
import './MarshalManagement.css';

const MarshalManagement = ({ onPageChange }) => {
  const [marshals, setMarshals] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingMarshal, setEditingMarshal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pageReady, setPageReady] = useState(false);

  console.log('🏁 تم تحميل مكون إدارة المارشال، عدد المارشال:', marshals.length);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    nationality: 'الكويت',
    marshalNumber: '',
    experience: 'مبتدئ',
    specializations: [],
    certifications: [],
    availability: 'متاح',
    notes: '',
    status: 'نشط',
    profileImage: null
  });

  const experiences = ['مبتدئ', 'متوسط', 'خبير', 'محترف'];
  const availabilityOptions = ['متاح', 'مشغول', 'إجازة', 'غير متاح'];
  const statusOptions = ['نشط', 'معطل', 'تحت المراجعة'];
  const specializationOptions = [
    'Flag Marshal',
    'Track Marshal', 
    'Pit Marshal',
    'Start Marshal',
    'Chief Marshal',
    'Safety Marshal'
  ];

  // جلب المارشال
  const fetchMarshals = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      console.log('🔍 جاري جلب المارشال...', { token: !!token });
      
      const response = await fetch('https://kmt-event-management.onrender.com/api/users/marshals', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📡 استجابة الخادم:', response.status, response.ok);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📊 البيانات المستلمة:', data);
        
        // إصلاح تنسيق البيانات
        const marshalsData = data.marshals || data || [];
        console.log('👥 المارشال المعالج:', marshalsData);
        
        setMarshals(marshalsData);
        
        if (marshalsData.length === 0) {
          console.log('⚠️ لا يوجد مارشال في النظام');
        }
      } else {
        console.error('❌ فشل في جلب المارشال:', response.status, response.statusText);
        alert('فشل في جلب بيانات المارشال. تحقق من اتصال الإنترنت.');
      }
    } catch (error) {
      console.error('💥 خطأ في جلب المارشال:', error);
      alert('خطأ في الاتصال بالخادم: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // بيانات وهمية للاختبار
  const getMockMarshals = () => [
    {
      id: 'KMT-100',
      marshalNumber: '100',
      fullName: 'أحمد محمد الكويتي',
      email: 'marshal100@kmt.com',
      phone: '+96599100100',
      nationality: 'الكويت',
      status: 'active',
      experience: 'خبير'
    },
    {
      id: 'KMT-101',
      marshalNumber: '101',
      fullName: 'فاطمة الزهراء',
      email: 'marshal101@kmt.com',
      phone: '+96599100101',
      nationality: 'الكويت',
      status: 'active',
      experience: 'متوسط'
    },
    {
      id: 'KMT-102',
      marshalNumber: '102',
      fullName: 'خالد العتيبي',
      email: 'marshal102@kmt.com',
      phone: '+96599100102',
      nationality: 'السعودية',
      status: 'pending',
      experience: 'مبتدئ'
    }
  ];

  useEffect(() => {
    // عرض الصفحة فوراً
    setPageReady(true);
    
    const token = localStorage.getItem('token');
    console.log('🚀 تشغيل صفحة إدارة المارشال:', { token: !!token });
    
    // جلب البيانات في الخلفية
    setTimeout(() => {
      if (token) {
        fetchMarshals();
      } else {
        console.log('⚠️ لا يوجد رمز تفويض - يجب تسجيل الدخول أولاً');
        // محاولة تسجيل دخول تلقائي للاختبار
        autoLogin();
      }
    }, 100);
  }, []);

  // تسجيل دخول تلقائي للاختبار
  const autoLogin = async () => {
    try {
      console.log('🔐 محاولة تسجيل دخول تلقائي...');
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

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.token) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('userData', JSON.stringify(data.user));
          console.log('✅ تم تسجيل الدخول التلقائي بنجاح');
          fetchMarshals();
        }
      }
    } catch (error) {
      console.log('❌ فشل في تسجيل الدخول التلقائي:', error);
    }
  };

  // معالجة رفع الصورة
  const handleImageUpload = async (marshalId, imageFile) => {
    try {
      const formData = new FormData();
      formData.append('profileImage', imageFile);

      const response = await fetch(`https://kmt-event-management.onrender.com/api/users/marshals/${marshalId}/upload-image`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        alert('تم رفع الصورة بنجاح');
        fetchMarshals(); // إعادة تحميل القائمة
        return result.imageUrl;
      } else {
        const error = await response.json();
        alert(error.message || 'خطأ في رفع الصورة');
      }
    } catch (error) {
      console.error('خطأ في رفع الصورة:', error);
      alert('خطأ في الاتصال');
    }
  };

  // معالجة النموذج
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingMarshal 
        ? `https://kmt-event-management.onrender.com/api/users/marshals/${editingMarshal.id}`
        : 'https://kmt-event-management.onrender.com/api/users/marshals';
      
      const method = editingMarshal ? 'PUT' : 'POST';
      
      console.log('إرسال طلب:', method, url);
      console.log('البيانات المرسلة:', formData);
      
      // إعداد البيانات للإرسال
      const submitData = { ...formData };
      if (editingMarshal && !submitData.password) {
        delete submitData.password; // لا نرسل كلمة مرور فارغة عند التحديث
      }
      // إزالة الصورة من البيانات المرسلة لأنها ستُرفع منفصلة
      delete submitData.profileImage;

      const token = localStorage.getItem('token');
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      console.log('حالة الاستجابة:', response.status);
      console.log('نص الاستجابة:', response.statusText);

      const result = await response.json();
      console.log('نتيجة الاستجابة:', result);

      if (response.ok && result.success) {
        const action = editingMarshal ? 'تحديث' : 'إضافة';
        alert(`✅ تم ${action} المارشال بنجاح\n\n${result.message || ''}`);
        
        // رفع الصورة إذا تم اختيار واحدة
        if (formData.profileImage) {
          let marshalId;
          if (editingMarshal) {
            marshalId = editingMarshal._id || editingMarshal.id;
          } else if (result.marshal && result.marshal._id) {
            marshalId = result.marshal._id;
          }
          
          if (marshalId) {
            await handleImageUpload(marshalId, formData.profileImage);
          }
        }
        
        setShowForm(false);
        setEditingMarshal(null);
        resetForm();
        fetchMarshals();
      } else {
        // معالجة أخطاء الصلاحيات
        if (response.status === 403) {
          alert(`🚫 غير مصرح لك بهذا الإجراء\n\n` +
                `${editingMarshal ? 'تعديل' : 'إضافة'} المارشال يتطلب صلاحيات الأدمن.\n` +
                `الرجاء التواصل مع مدير النظام.`);
        } else if (response.status === 401) {
          alert(`🔐 يجب تسجيل الدخول كأدمن\n\n` +
                `العملية تتطلب صلاحيات الأدمن.\n` +
                `الرجاء تسجيل الدخول بحساب الأدمن.`);
        } else {
          alert(`❌ ${result.message || 'حدث خطأ في العملية'}`);
        }
      }
    } catch (error) {
      console.error('خطأ في العملية:', error);
      alert('خطأ في الاتصال');
    } finally {
      setLoading(false);
    }
  };

  // إعادة تعيين النموذج
  const resetForm = () => {
    setFormData({
      fullName: '',
      email: '',
      password: '',
      phone: '',
      nationality: 'الكويت',
      marshalNumber: '',
      experience: 'مبتدئ',
      specializations: [],
      certifications: [],
      availability: 'متاح',
      notes: '',
      status: 'نشط',
      profileImage: null
    });
  };

  // تحرير مارشال
  const editMarshal = (marshal) => {
    setEditingMarshal(marshal);
    setFormData({
      fullName: marshal.fullName || marshal.name || '',
      email: marshal.email || '',
      password: '', // نتركها فارغة عند التحديث
      phone: marshal.phone || '',
      nationality: marshal.nationality || 'الكويت',
      marshalNumber: marshal.marshalNumber || '',
      experience: marshal.experience || 'مبتدئ',
      specializations: marshal.specializations || [],
      certifications: marshal.certifications || [],
      availability: marshal.availability || 'متاح',
      notes: marshal.notes || '',
      status: marshal.status || 'نشط',
      profileImage: null // لا نعرض الصورة الحالية في النموذج
    });
    setShowForm(true);
  };

  // حذف مارشال - للأدمن فقط
  const deleteMarshal = async (id) => {
    // الحصول على بيانات المارشال المراد حذفه
    const marshal = marshals.find(m => m.id === id || m._id === id);
    const marshalName = marshal ? marshal.fullName : 'غير محدد';
    
    const reason = window.prompt(
      `⚠️ تحذير: أنت على وشك حذف المارشال "${marshalName}"\n\n` +
      `هذا الإجراء لا يمكن التراجع عنه وسيتم توثيقه في سجل النظام.\n\n` +
      `الرجاء إدخال سبب الحذف:`, 
      'تم الحذف بناءً على طلب الإدارة'
    );
    
    if (!reason) {
      alert('❌ تم إلغاء عملية الحذف - يجب إدخال سبب الحذف');
      return;
    }

    const confirmed = window.confirm(
      `🚨 تأكيد الحذف النهائي\n\n` +
      `المارشال: ${marshalName}\n` +
      `السبب: ${reason}\n\n` +
      `هل أنت متأكد من المتابعة؟`
    );
    
    if (!confirmed) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      console.log('🗑️ محاولة حذف المارشال:', id, 'السبب:', reason);
      
      const response = await fetch(`https://kmt-event-management.onrender.com/api/users/marshals/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: reason })
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        alert(`✅ ${result.message}\n\n📋 تم توثيق العملية في سجل النظام`);
        fetchMarshals();
      } else {
        if (response.status === 403) {
          alert(`🚫 غير مصرح لك بحذف المارشال\n\n` +
                `هذا الإجراء مخصص للأدمن فقط.\n` +
                `الرجاء التواصل مع مدير النظام إذا كنت تحتاج لحذف هذا المارشال.`);
        } else if (response.status === 401) {
          alert(`🔐 يجب تسجيل الدخول كأدمن\n\n` +
                `عملية حذف المارشال تتطلب صلاحيات الأدمن.\n` +
                `الرجاء تسجيل الدخول بحساب الأدمن أولاً.`);
        } else {
          alert(`❌ فشل في حذف المارشال\n\n` +
                `السبب: ${result.message || 'خطأ غير معروف'}`);
        }
      }
    } catch (error) {
      console.error('💥 خطأ في حذف المارشال:', error);
      alert(`❌ خطأ في الاتصال بالخادم\n\n` +
            `تعذر إكمال عملية الحذف. الرجاء المحاولة مرة أخرى.`);
    } finally {
      setLoading(false);
    }
  };

  // معالجة تغيير التخصصات
  const handleSpecializationChange = (spec, checked) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        specializations: [...prev.specializations, spec]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        specializations: prev.specializations.filter(s => s !== spec)
      }));
    }
  };

  // عرض loading إذا لم تكن الصفحة جاهزة
  if (!pageReady) {
    return (
      <div className="page-loading-overlay">
        <LoadingSpinner message="جاري تحضير صفحة إدارة المارشال..." size="large" />
      </div>
    );
  }

  return (
    <div className="marshal-management">
      <div className="marshal-header">
        <div className="header-content">
          <button 
            className="back-button"
            onClick={() => onPageChange('manager-dashboard')}
          >
            ← العودة للوحة التحكم
          </button>
          <h1>🏁 إدارة المارشال</h1>
        </div>
        <button 
          className="add-button"
          onClick={() => {
            setShowForm(true);
            setEditingMarshal(null);
            resetForm();
          }}
          disabled={loading}
        >
          ➕ إضافة مارشال جديد
        </button>
      </div>

      {/* تنبيه صلاحيات الأدمن */}
      <div style={{
        backgroundColor: '#fff3cd',
        border: '1px solid #ffeaa7',
        borderRadius: '8px',
        padding: '15px',
        margin: '20px 0',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        direction: 'rtl'
      }}>
        <span style={{ fontSize: '1.5rem' }}>🔐</span>
        <div>
          <strong style={{ color: '#856404' }}>ملاحظة مهمة للأدمن:</strong>
          <p style={{ margin: '5px 0 0 0', color: '#856404', fontSize: '0.9rem' }}>
            • جميع البيانات محفوظة بشكل دائم في النظام<br/>
            • عمليات التحديث والحذف تتطلب صلاحيات الأدمن<br/>
            • سيتم توثيق جميع العمليات في سجل النظام<br/>
            • المارشال المحذوف يُحفظ في أرشيف النظام
          </p>
        </div>
      </div>

      {/* النموذج */}
      {showForm && (
        <div className="form-overlay">
          <div className="form-container">
            <div className="form-header">
              <h2>{editingMarshal ? '✏️ تحديث المارشال' : '➕ إضافة مارشال جديد'}</h2>
              <button 
                className="close-button"
                onClick={() => {
                  setShowForm(false);
                  setEditingMarshal(null);
                  resetForm();
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="marshal-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>📝 الاسم الكامل:</label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                    placeholder="أدخل اسم المارشال الكامل"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>🔢 رقم المارشال:</label>
                  <input
                    type="text"
                    value={formData.marshalNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, marshalNumber: e.target.value }))}
                    placeholder="مثال: 150"
                    required={!editingMarshal}
                  />
                </div>

                <div className="form-group">
                  <label>🌍 الجنسية:</label>
                  <input
                    type="text"
                    value={formData.nationality}
                    onChange={(e) => setFormData(prev => ({ ...prev, nationality: e.target.value }))}
                    placeholder="مثال: الكويت"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>📧 البريد الإلكتروني:</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="marshal@example.com"
                  />
                </div>

                <div className="form-group">
                  <label>🔒 كلمة المرور {editingMarshal && '(اتركها فارغة للحفاظ على الحالية)'}:</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder={editingMarshal ? "اتركها فارغة للحفاظ على الحالية" : "أدخل كلمة المرور"}
                  />
                </div>

                <div className="form-group">
                  <label>📱 رقم الهاتف:</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+965 XXXX XXXX"
                  />
                </div>

                <div className="form-group">
                  <label>📷 صورة المارشال:</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFormData(prev => ({ ...prev, profileImage: e.target.files[0] }))}
                    className="file-input"
                  />
                  <small style={{color: '#666', fontSize: '0.9em'}}>
                    اختر صورة (الحد الأقصى 5 ميجابايت)
                  </small>
                </div>

                <div className="form-group">
                  <label>⭐ مستوى الخبرة:</label>
                  <select
                    value={formData.experience}
                    onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
                  >
                    {experiences.map(exp => (
                      <option key={exp} value={exp}>{exp}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>🎯 الحالة:</label>
                  <select
                    value={formData.availability}
                    onChange={(e) => setFormData(prev => ({ ...prev, availability: e.target.value }))}
                  >
                    {availabilityOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>🔄 حالة الحساب:</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                  >
                    {statusOptions.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group full-width">
                <label>🏆 التخصصات:</label>
                <div className="specializations-grid">
                  {specializationOptions.map(spec => (
                    <label key={spec} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.specializations.includes(spec)}
                        onChange={(e) => handleSpecializationChange(spec, e.target.checked)}
                      />
                      {spec}
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group full-width">
                <label>📝 ملاحظات:</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="أي ملاحظات إضافية..."
                  rows="3"
                />
              </div>

              <div className="form-actions">
                <button 
                  type="submit" 
                  className="submit-button"
                  disabled={loading}
                >
                  {loading ? '⏳ جاري الحفظ...' : (editingMarshal ? '💾 تحديث' : '➕ إضافة')}
                </button>
                <button 
                  type="button" 
                  className="cancel-button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingMarshal(null);
                    resetForm();
                  }}
                >
                  ❌ إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* قائمة المارشال */}
      <div className="marshals-list">
        {loading && !showForm && (
          <div style={{textAlign: 'center', padding: '20px'}}>
            <LoadingSpinner message="جاري تحميل بيانات المارشال..." size="medium" />
          </div>
        )}
        
        {marshals.length === 0 && !loading && (
          <div className="empty-state" style={{
            textAlign: 'center',
            padding: '40px',
            border: '2px dashed #ddd',
            borderRadius: '12px',
            backgroundColor: '#f8f9fa',
            margin: '20px 0'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🏁</div>
            <h3 style={{ color: '#e31e24', marginBottom: '10px' }}>📝 لا يوجد مارشال مسجلين</h3>
            <p style={{ color: '#666', marginBottom: '20px' }}>ابدأ بإضافة أول مارشال للنظام</p>
            <p style={{ fontSize: '0.9rem', color: '#999' }}>
              💡 تلميح: تأكد من تسجيل الدخول والاتصال بالإنترنت
            </p>
            <button 
              onClick={() => setShowForm(true)}
              style={{
                marginTop: '15px',
                padding: '10px 20px',
                backgroundColor: '#e31e24',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              ➕ إضافة مارشال جديد
            </button>
          </div>
        )}

        <div className="marshals-grid">
          {marshals.map(marshal => (
            <div key={marshal.id || marshal._id} className="marshal-card">
              {/* صورة المارشال */}
              <div className="marshal-image-container">
                {marshal.profileImage ? (
                  <img 
                    src={`https://kmt-event-management.onrender.com/uploads/marshals/${marshal.profileImage}`}
                    alt={marshal.fullName || 'صورة المارشال'}
                    className="marshal-image"
                    onError={(e) => {
                      console.log('❌ فشل تحميل الصورة:', marshal.profileImage);
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div 
                  className="marshal-avatar" 
                  style={{ 
                    display: marshal.profileImage ? 'none' : 'flex',
                    width: '100%',
                    height: '100%',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#f0f0f0',
                    fontSize: '2rem'
                  }}
                >
                  👤
                </div>
              </div>
              
              {/* معلومات المارشال */}
              <div className="marshal-header">
                <h3 style={{ margin: '0 0 8px 0', color: '#e31e24', fontSize: '1.2rem' }}>
                  {marshal.fullName || marshal.name || 'غير محدد'}
                </h3>
                <div className="marshal-number" style={{ 
                  backgroundColor: '#e31e24', 
                  color: 'white', 
                  padding: '4px 8px', 
                  borderRadius: '12px', 
                  fontSize: '0.9rem',
                  display: 'inline-block',
                  marginBottom: '8px'
                }}>
                  🏁 رقم: {marshal.marshalNumber || 'غير محدد'}
                </div>
                <div className="marshal-status">
                  <span className={`status-badge ${marshal.status || 'pending'}`} style={{
                    padding: '4px 12px',
                    borderRadius: '15px',
                    fontSize: '0.85rem',
                    fontWeight: 'bold',
                    backgroundColor: marshal.status === 'active' ? '#d4edda' : '#fff3cd',
                    color: marshal.status === 'active' ? '#155724' : '#856404',
                    border: `1px solid ${marshal.status === 'active' ? '#c3e6cb' : '#ffeaa7'}`
                  }}>
                    {marshal.status === 'active' ? '✅ نشط' : marshal.status === 'pending' ? '⏳ في الانتظار' : marshal.status || 'غير محدد'}
                  </span>
                </div>
              </div>
              
              <div className="marshal-info">
                <p><strong>📧 الإيميل:</strong> {marshal.email || 'غير محدد'}</p>
                <p><strong>📱 الهاتف:</strong> {marshal.phone || 'غير محدد'}</p>
                <p><strong>🌍 الجنسية:</strong> {marshal.nationality || 'غير محدد'}</p>
                <p><strong>⭐ الخبرة:</strong> {marshal.experience || 'مبتدئ'}</p>
                <p><strong>🏆 التخصصات:</strong> {marshal.specializations?.length ? marshal.specializations.join(', ') : 'لا يوجد'}</p>
                {marshal.notes && <p><strong>📝 ملاحظات:</strong> {marshal.notes}</p>}
              </div>

              <div className="marshal-actions">
                <button 
                  className="edit-button"
                  onClick={() => editMarshal(marshal)}
                  disabled={loading}
                >
                  ✏️ تحرير
                </button>
                <button 
                  className="delete-button"
                  onClick={() => deleteMarshal(marshal.id || marshal._id)}
                  disabled={loading}
                >
                  🗑️ حذف
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MarshalManagement;