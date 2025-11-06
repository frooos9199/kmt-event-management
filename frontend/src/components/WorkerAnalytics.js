import React, { useState, useEffect } from 'react';
import LoadingSpinner from './LoadingSpinner';
import './WorkerAnalytics.css';

const WorkerAnalytics = () => {
  const [analytics, setAnalytics] = useState({
    totalWorkers: 0,
    availableWorkers: 0,
    skillsBreakdown: [],
    experienceLevel: {},
    ageGroups: {},
    availability: {}
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWorkerAnalytics();
  }, []);

  const fetchWorkerAnalytics = async () => {
    try {
      // API call للحصول على الإحصائيات (بدون أسماء)
      const response = await fetch('http://localhost:5000/api/analytics/workers', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      } else {
        // بيانات تجريبية
        setAnalytics({
          totalWorkers: 142,
          availableWorkers: 89,
          skillsBreakdown: [
            { skill: 'Security | أمن', count: 45, avgRating: 4.3 },
            { skill: 'Organization | تنظيم', count: 32, avgRating: 4.1 },
            { skill: 'Customer Service | خدمة عملاء', count: 28, avgRating: 4.5 },
            { skill: 'Photography | تصوير', count: 15, avgRating: 4.7 },
            { skill: 'Sound Tech | صوتيات', count: 12, avgRating: 4.2 },
            { skill: 'Cleaning | نظافة', count: 25, avgRating: 4.0 }
          ],
          experienceLevel: {
            'Beginner | مبتدئ': 28,
            'Intermediate | متوسط': 52,
            'Advanced | متقدم': 38,
            'Expert | خبير': 24
          },
          ageGroups: {
            '18-25': 35,
            '26-35': 58,
            '36-45': 32,
            '46+': 17
          },
          availability: {
            'Weekdays | أيام العمل': 89,
            'Weekends | عطلة أسبوع': 112,
            'Evenings | مساء': 95,
            'Full Time | دوام كامل': 45
          }
        });
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="analytics-loading-container">
        <LoadingSpinner 
          message="📊 جاري تحميل إحصائيات الأداء..."
          size="medium"
          style="default"
          rpm="STS"
        />
      </div>
    );
  }

  return (
    <div className="worker-analytics">
      <div className="analytics-header">
        <h2>📊 Worker Pool Analytics | تحليل مجموعة العمال</h2>
        <p>Get insights about available workers without seeing personal information</p>
        <p>احصل على إحصائيات العمال المتاحين بدون رؤية المعلومات الشخصية</p>
      </div>

      <div className="analytics-grid">
        {/* إجمالي العمال */}
        <div className="analytics-card overview">
          <h3>👥 Worker Overview | نظرة عامة</h3>
          <div className="overview-stats">
            <div className="stat-item">
              <span className="stat-number">{analytics.totalWorkers}</span>
              <span className="stat-label">Total Registered | مسجل إجمالي</span>
            </div>
            <div className="stat-item">
              <span className="stat-number available">{analytics.availableWorkers}</span>
              <span className="stat-label">Available Now | متاح الآن</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{Math.round((analytics.availableWorkers / analytics.totalWorkers) * 100)}%</span>
              <span className="stat-label">Availability Rate | معدل التوفر</span>
            </div>
          </div>
        </div>

        {/* توزيع المهارات */}
        <div className="analytics-card skills">
          <h3>🛠️ Skills Distribution | توزيع المهارات</h3>
          <div className="skills-list">
            {analytics.skillsBreakdown.map((skill, index) => (
              <div key={index} className="skill-item">
                <div className="skill-header">
                  <span className="skill-name">{skill.skill}</span>
                  <span className="skill-count">{skill.count} workers</span>
                </div>
                <div className="skill-bar">
                  <div 
                    className="skill-fill" 
                    style={{ width: `${(skill.count / analytics.totalWorkers) * 100}%` }}
                  ></div>
                </div>
                <div className="skill-rating">
                  ⭐ {skill.avgRating} average rating | متوسط التقييم
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* مستوى الخبرة */}
        <div className="analytics-card experience">
          <h3>📈 Experience Levels | مستويات الخبرة</h3>
          <div className="experience-chart">
            {Object.entries(analytics.experienceLevel).map(([level, count]) => (
              <div key={level} className="experience-bar">
                <span className="experience-label">{level}</span>
                <div className="bar-container">
                  <div 
                    className="bar-fill" 
                    style={{ width: `${(count / analytics.totalWorkers) * 100}%` }}
                  ></div>
                  <span className="bar-count">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* الفئات العمرية */}
        <div className="analytics-card age-groups">
          <h3>🎂 Age Distribution | التوزيع العمري</h3>
          <div className="age-grid">
            {Object.entries(analytics.ageGroups).map(([ageRange, count]) => (
              <div key={ageRange} className="age-item">
                <div className="age-number">{count}</div>
                <div className="age-label">{ageRange}</div>
                <div className="age-percentage">
                  {Math.round((count / analytics.totalWorkers) * 100)}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* التوفر الزمني */}
        <div className="analytics-card availability">
          <h3>⏰ Availability Patterns | أنماط التوفر</h3>
          <div className="availability-list">
            {Object.entries(analytics.availability).map(([timeSlot, count]) => (
              <div key={timeSlot} className="availability-item">
                <span className="time-slot">{timeSlot}</span>
                <div className="availability-bar">
                  <div 
                    className="availability-fill" 
                    style={{ width: `${(count / analytics.totalWorkers) * 100}%` }}
                  ></div>
                </div>
                <span className="availability-count">{count} available</span>
              </div>
            ))}
          </div>
        </div>

        {/* اقتراحات ذكية */}
        <div className="analytics-card suggestions">
          <h3>💡 Smart Suggestions | اقتراحات ذكية</h3>
          <div className="suggestions-list">
            <div className="suggestion-item success">
              <span className="suggestion-icon">✅</span>
              <div className="suggestion-content">
                <h4>High Security Availability | توفر عالي للأمن</h4>
                <p>45 security workers available - Perfect for large events</p>
                <p>45 عامل أمن متاح - مثالي للأحداث الكبيرة</p>
              </div>
            </div>
            <div className="suggestion-item warning">
              <span className="suggestion-icon">⚠️</span>
              <div className="suggestion-content">
                <h4>Limited Photography Staff | طاقم تصوير محدود</h4>
                <p>Only 15 photographers available - Book early</p>
                <p>15 مصور فقط متاح - احجز مبكراً</p>
              </div>
            </div>
            <div className="suggestion-item info">
              <span className="suggestion-icon">ℹ️</span>
              <div className="suggestion-content">
                <h4>Weekend Peak Availability | ذروة التوفر في نهاية الأسبوع</h4>
                <p>79% of workers prefer weekend events</p>
                <p>79% من العمال يفضلون أحداث نهاية الأسبوع</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="analytics-footer">
        <div className="privacy-note">
          <span className="privacy-icon">🔒</span>
          <p>
            <strong>Privacy Protected | محمية الخصوصية:</strong> 
            All data is anonymized. Personal information is only revealed when workers apply to your events.
          </p>
          <p>
            جميع البيانات مجهولة المصدر. المعلومات الشخصية تظهر فقط عندما يتقدم العمال لأحداثك.
          </p>
        </div>
      </div>
    </div>
  );
};

export default WorkerAnalytics;