import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ 
  message = 'جاري التحميل...', 
  size = 'medium', 
  style = 'default',
  rpm = false 
}) => {
  
  // تحديد نوع العداد حسب السياق
  const getRPMLabel = () => {
    if (message.includes('مارشال')) return 'MAR';
    if (message.includes('سباق')) return 'RCE';
    if (message.includes('لوحة')) return 'DSH';
    if (message.includes('إحصائ')) return 'STS';
    return 'RPM';
  };

  // تحديد القيم حسب نوع التحميل
  const getMaxValue = () => {
    if (message.includes('مارشال')) return '10';
    if (message.includes('سباق')) return '15';
    if (message.includes('لوحة')) return '20'; 
    return 'x1K';
  };

  const gaugeStyle = style === 'formula' ? 'formula-style' : '';

  return (
    <div className={`loading-spinner-container ${size}`}>
      <div className={`rpm-gauge ${gaugeStyle}`}>
        {/* خلفية العداد */}
        <div className="gauge-background">
          {/* خطوط العداد */}
          <div className="gauge-marks">
            {[...Array(8)].map((_, i) => (
              <div 
                key={i} 
                className="gauge-mark" 
                style={{
                  transform: `rotate(${-135 + (i * 33.75)}deg)`
                }}
              >
                <div className="mark-line"></div>
                <div className="mark-number">{i === 7 ? 'R' : i}</div>
              </div>
            ))}
          </div>
          
          {/* مؤشر العداد المتحرك */}
          <div className="gauge-needle">
            <div className="needle"></div>
          </div>
          
          {/* مركز العداد */}
          <div className="gauge-center">
            <div className="center-dot"></div>
          </div>
          
          {/* نص RPM */}
          <div className="rpm-text">
            <span className="rpm-label">{getRPMLabel()}</span>
            <span className="rpm-value">{getMaxValue()}</span>
          </div>
          
          {/* شعار KMT */}
          <div className="kmt-logo">
            <span>🏁</span>
          </div>
        </div>
        
        {/* مؤشرات LED */}
        <div className="led-indicators">
          <div className="led green"></div>
          <div className="led yellow"></div>
          <div className="led red"></div>
        </div>
        
        {/* عداد رقمي */}
        <div className="digital-counter">
          <span className="counter-value">
            {Math.floor(Math.random() * 7000) + 1000}
          </span>
        </div>
      </div>
      
      <p className="loading-message">
        <span className="loading-icon">🚀</span>
        {message}
      </p>
    </div>
  );
};

export default LoadingSpinner;