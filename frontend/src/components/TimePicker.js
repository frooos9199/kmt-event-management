import React from 'react';
import './TimePicker.css';

const TimePicker = ({ 
  value = '', 
  onChange, 
  name,
  label,
  required = false,
  className = ''
}) => {
  // تحويل الوقت من string إلى ساعة ودقيقة
  const parseTime = (timeString) => {
    if (!timeString) return { hours: '09', minutes: '00' };
    const [hours, minutes] = timeString.split(':');
    return { hours: hours || '09', minutes: minutes || '00' };
  };

  const { hours, minutes } = parseTime(value);

  // تحديث الوقت
  const updateTime = (newHours, newMinutes) => {
    const timeValue = `${newHours}:${newMinutes}`;
    onChange({
      target: {
        name: name,
        value: timeValue
      }
    });
  };

  // إنشاء قائمة الساعات (24 ساعة)
  const hourOptions = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, '0');
    return (
      <option key={hour} value={hour}>
        {hour}
      </option>
    );
  });

  // إنشاء قائمة الدقائق (كل 5 دقائق للمرونة أكثر)
  const minuteOptions = [];
  for (let i = 0; i < 60; i += 5) {
    const minute = i.toString().padStart(2, '0');
    minuteOptions.push(
      <option key={minute} value={minute}>
        {minute}
      </option>
    );
  }

  return (
    <div className={`time-picker-container ${className}`}>
      {label && (
        <label className="time-picker-label">
          {label} {required && '*'}
        </label>
      )}
      
      <div className="time-picker-wrapper">
        <div className="time-section">
          <label className="time-section-label">🕐 الساعة</label>
          <select
            className="time-select hours-select"
            value={hours}
            onChange={(e) => updateTime(e.target.value, minutes)}
          >
            {hourOptions}
          </select>
        </div>
        
        <div className="time-separator">:</div>
        
        <div className="time-section">
          <label className="time-section-label">⏰ الدقيقة</label>
          <select
            className="time-select minutes-select"
            value={minutes}
            onChange={(e) => updateTime(hours, e.target.value)}
          >
            {minuteOptions}
          </select>
        </div>
        
        <div className="time-display">
          <span className="time-preview">🕐 {hours}:{minutes}</span>
        </div>
      </div>
    </div>
  );
};

export default TimePicker;