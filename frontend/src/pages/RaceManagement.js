import React, { useState, useEffect } from 'react';
import MarshalCard from '../components/MarshalCard';
import './KMT-Original.css';
import '../styles/MarshalCard.css';

const RaceManagement = ({ onPageChange }) => {
  const [races, setRaces] = useState([]);
  const [selectedRace, setSelectedRace] = useState(null);
  const [availableMarshals, setAvailableMarshals] = useState([]);
  const [assignedMarshals, setAssignedMarshals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAssignModal, setShowAssignModal] = useState(false);

  useEffect(() => {
    fetchRaces();
    fetchMarshals();
  }, []);

  const fetchRaces = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/races', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRaces(data);
        if (data.length > 0) {
          setSelectedRace(data[0]);
        }
      }
    } catch (error) {
      console.error('خطأ في جلب السباقات:', error);
    }
  };

  const fetchMarshals = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/users/marshals', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        // تقسيم المارشال إلى متاحين ومعينين
        const available = data.filter(m => !m.currentRace);
        const assigned = data.filter(m => m.currentRace);
        
        setAvailableMarshals(available);
        setAssignedMarshals(assigned);
      }
    } catch (error) {
      console.error('خطأ في جلب المارشال:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignMarshal = (marshal) => {
    if (!selectedRace) {
      alert('يرجى اختيار سباق أولاً');
      return;
    }
    
    // محاكاة تعيين المارشال
    const updatedMarshal = {
      ...marshal,
      currentRace: selectedRace._id,
      workStatus: 'مشغول'
    };
    
    // تحديث القوائم
    setAvailableMarshals(prev => prev.filter(m => m._id !== marshal._id));
    setAssignedMarshals(prev => [...prev, updatedMarshal]);
    
    alert(`تم تعيين ${marshal.fullName} في سباق ${selectedRace.title}`);
  };

  const handleUnassignMarshal = (marshal) => {
    const updatedMarshal = {
      ...marshal,
      currentRace: null,
      workStatus: 'متاح'
    };
    
    // تحديث القوائم
    setAssignedMarshals(prev => prev.filter(m => m._id !== marshal._id));
    setAvailableMarshals(prev => [...prev, updatedMarshal]);
    
    alert(`تم إلغاء تعيين ${marshal.fullName}`);
  };

  const handleViewMarshalDetails = (marshal) => {
    alert(`عرض تفاصيل ${marshal.fullName}\nالرقم: ${marshal.marshallInfo?.marshalId}\nالخبرة: ${marshal.marshallInfo?.experienceLevel}`);
  };

  const handleContactMarshal = (marshal) => {
    alert(`التواصل مع ${marshal.fullName}\nرقم الهاتف: ${marshal.phone || 'غير متوفر'}`);
  };

  if (isLoading) {
    return (
      <div className="kmt-page">
        <div className="loading-container">
          <div className="loading-spinner">⏳ جاري تحميل بيانات السباقات...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="kmt-page">
      {/* Header */}
      <div className="kmt-header">
        <button 
          onClick={() => onPageChange('manager-dashboard')}
          className="kmt-back-btn"
        >
          ← العودة للرئيسية
        </button>
        <h1 className="kmt-title">
          🏁 إدارة السباقات والمارشال - Kuwait Motor Town
        </h1>
      </div>

      <div className="kmt-container">
        {/* اختيار السباق */}
        <div className="race-selector">
          <h2>اختيار السباق</h2>
          <div className="races-grid">
            {races.length > 0 ? races.map((race) => (
              <div 
                key={race._id}
                className={`race-card ${selectedRace?._id === race._id ? 'selected' : ''}`}
                onClick={() => setSelectedRace(race)}
              >
                <div className="race-header">
                  <h3>{race.title}</h3>
                  <span className="race-date">
                    {new Date(race.date).toLocaleDateString('en-GB')}
                  </span>
                </div>
                <div className="race-details">
                  <div className="race-detail">
                    <span className="detail-icon">🏁</span>
                    <span>{race.track}</span>
                  </div>
                  <div className="race-detail">
                    <span className="detail-icon">⏰</span>
                    <span>{race.startTime}</span>
                  </div>
                  <div className="race-detail">
                    <span className="detail-icon">👥</span>
                    <span>{race.requiredMarshals || 0} مارشال مطلوب</span>
                  </div>
                </div>
                <div className="race-status">
                  <span className={`status-badge ${race.status}`}>
                    {race.status === 'scheduled' ? 'مجدول' : 
                     race.status === 'active' ? 'نشط' : 'مكتمل'}
                  </span>
                </div>
              </div>
            )) : (
              <div className="no-races">
                <span className="no-data-icon">🏁</span>
                <p>لا توجد سباقات متاحة</p>
                <button 
                  className="create-race-btn"
                  onClick={() => onPageChange('create-race')}
                >
                  إنشاء سباق جديد
                </button>
              </div>
            )}
          </div>
        </div>

        {/* عرض المارشال */}
        <div className="marshals-management">
          {/* المارشال المتاحين */}
          <div className="marshals-section">
            <div className="section-header">
              <h2>👥 المارشال المتاحين ({availableMarshals.length})</h2>
              <div className="filters">
                <button className="filter-btn active">الكل</button>
                <button className="filter-btn">خبراء</button>
                <button className="filter-btn">متقدمين</button>
              </div>
            </div>
            
            {availableMarshals.length > 0 ? (
              <div className="marshals-grid">
                {availableMarshals.map((marshal) => (
                  <MarshalCard
                    key={marshal._id}
                    marshal={marshal}
                    variant="grid-item"
                    showActions={true}
                    showDetails={true}
                    onViewDetails={handleViewMarshalDetails}
                    onContact={handleContactMarshal}
                    onAssign={handleAssignMarshal}
                  />
                ))}
              </div>
            ) : (
              <div className="no-marshals">
                <span className="no-data-icon">👥</span>
                <p>لا يوجد مارشال متاحين حالياً</p>
              </div>
            )}
          </div>

          {/* المارشال المعينين */}
          <div className="marshals-section assigned">
            <div className="section-header">
              <h2>🏁 المارشال المعينين ({assignedMarshals.length})</h2>
              <span className="race-info">
                {selectedRace ? `في سباق: ${selectedRace.title}` : 'لم يتم اختيار سباق'}
              </span>
            </div>
            
            {assignedMarshals.length > 0 ? (
              <div className="marshals-grid">
                {assignedMarshals.map((marshal) => (
                  <MarshalCard
                    key={marshal._id}
                    marshal={marshal}
                    variant="grid-item"
                    showActions={true}
                    showDetails={true}
                    onViewDetails={handleViewMarshalDetails}
                    onContact={handleContactMarshal}
                    onAssign={handleUnassignMarshal}
                  />
                ))}
              </div>
            ) : (
              <div className="no-marshals">
                <span className="no-data-icon">🏁</span>
                <p>لم يتم تعيين أي مارشال بعد</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RaceManagement;