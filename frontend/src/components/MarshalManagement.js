import React, { useState, useEffect } from 'react';
import './MarshalManagement.css';

const MarshalManagement = ({ onPageChange }) => {
  const [marshals, setMarshals] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingMarshal, setEditingMarshal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
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
      
      // إضافة timeout للطلب
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 ثواني timeout
      
      const response = await fetch('https://kmt-event-management.onrender.com/api/users/marshals', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        // إصلاح تنسيق البيانات
        const marshalsData = data.marshals || data || [];
        setMarshals(marshalsData);
      } else {
        console.error('فشل في جلب المارشال:', response.status);
        // استخدام بيانات وهمية في حالة الفشل
        setMarshals(getMockMarshals());
        alert('تم تحميل البيانات التجريبية');
      }
    } catch (error) {
      console.error('خطأ في جلب المارشال:', error);
      // استخدام بيانات وهمية في حالة الخطأ
      setMarshals(getMockMarshals());
      alert('تم تحميل البيانات التجريبية');
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
    fetchMarshals();
  }, []);

  // معالجة رفع الصورة
  const handleImageUpload = async (marshalId, imageFile) => {
    try {
      const formData = new FormData();
      formData.append('profileImage', imageFile);

      const response = await fetch(`https://kmt-event-management.onrender.com/api/marshals/${marshalId}/upload-image`, {
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
        ? `https://kmt-event-management.onrender.com/api/marshals/${editingMarshal._id}`
        : 'https://kmt-event-management.onrender.com/api/marshals/register';
      
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

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      console.log('حالة الاستجابة:', response.status);
      console.log('نص الاستجابة:', response.statusText);

      const result = await response.json();
      console.log('نتيجة الاستجابة:', result);

      if (response.ok) {
        alert(editingMarshal ? 'تم تحديث المارشال بنجاح' : 'تم إضافة المارشال بنجاح');
        
        // رفع الصورة إذا تم اختيار واحدة
        if (formData.profileImage) {
          let marshalId;
          if (editingMarshal) {
            marshalId = editingMarshal._id;
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
        alert(result.message || 'حدث خطأ');
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
      name: '',
      email: '',
      password: '',
      phone: '',
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
      name: marshal.name || '',
      email: marshal.email || '',
      password: '', // نتركها فارغة عند التحديث
      phone: marshal.phone || '',
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

  // حذف مارشال
  const deleteMarshal = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المارشال؟')) return;

    try {
      setLoading(true);
      const response = await fetch(`https://kmt-event-management.onrender.com/api/marshals/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('تم حذف المارشال بنجاح');
        fetchMarshals();
      } else {
        const result = await response.json();
        alert(result.message || 'خطأ في الحذف');
      }
    } catch (error) {
      console.error('خطأ في الحذف:', error);
      alert('خطأ في الاتصال');
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
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="أدخل اسم المارشال"
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
        {loading && !showForm && <div className="loading">⏳ جاري التحميل...</div>}
        
        {marshals.length === 0 && !loading && (
          <div className="empty-state">
            <h3>📝 لا يوجد مارشال مسجلين</h3>
            <p>ابدأ بإضافة أول مارشال</p>
          </div>
        )}

        <div className="marshals-grid">
          {marshals.map(marshal => (
            <div key={marshal._id} className="marshal-card">
              <div className="marshal-image-container">
                {marshal.profileImage ? (
                  <img 
                    src={`http://localhost:5001/uploads/marshals/${marshal.profileImage}`}
                    alt={marshal.name || 'صورة المارشال'}
                    className="marshal-image"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div 
                  className="marshal-avatar" 
                  style={{ display: marshal.profileImage ? 'none' : 'flex' }}
                >
                  👤
                </div>
              </div>
              
              <div className="marshal-header">
                <h3>{marshal.name || 'غير محدد'}</h3>
                <div className="marshal-status">
                  <span className={`status-badge ${marshal.status}`}>
                    {marshal.status}
                  </span>
                  <span className={`availability-badge ${marshal.availability}`}>
                    {marshal.availability}
                  </span>
                </div>
              </div>
              
              <div className="marshal-info">
                <p><strong>📧 الإيميل:</strong> {marshal.email || 'غير محدد'}</p>
                <p><strong>📱 الهاتف:</strong> {marshal.phone || 'غير محدد'}</p>
                <p><strong>⭐ الخبرة:</strong> {marshal.experience}</p>
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
                  onClick={() => deleteMarshal(marshal._id)}
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