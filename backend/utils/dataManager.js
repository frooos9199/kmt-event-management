const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DATABASE_FILE = path.join(DATA_DIR, 'database.json');

// التأكد من وجود مجلد البيانات
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// تهيئة قاعدة البيانات إذا لم تكن موجودة
const initDatabase = () => {
  if (!fs.existsSync(DATABASE_FILE)) {
    const initialData = {
      marshals: generateInitialMarshals(),
      races: generateInitialRaces(),
      users: [],
      lastMarshalNumber: 149
    };
    saveData(initialData);
  }
};

// توليد بيانات المارشال الأولية
const generateInitialMarshals = () => {
  const marshals = [];
  for (let i = 0; i < 50; i++) {
    const marshalNumber = 100 + i;
    const passwordIndex = (i % 6) + 1;
    
    marshals.push({
      id: `KMT-${marshalNumber}`,
      marshalNumber: marshalNumber.toString(),
      fullName: `مارشال رقم ${marshalNumber}`,
      email: `marshal${marshalNumber}@kmt.com`,
      phone: `+965${99000000 + marshalNumber}`,
      nationality: 'الكويت',
      status: 'pending',
      password: passwordIndex.toString(),
      hasChangedPassword: false,
      createdAt: new Date().toISOString(),
      lastLogin: null,
      marshallInfo: {}
    });
  }
  
  // إضافة مارشال مُفعل للاختبار
  marshals[0] = {
    id: 'KMT-100',
    marshalNumber: '100',
    fullName: 'أحمد محمد ',
    email: 'marshal100@kmt.com',
    phone: '+96544889977',
    nationality: 'الكويت',
    status: 'active',
    password: '123456',
    hasChangedPassword: true,
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
    marshallInfo: {
      profileImage: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD//gA7Q1JFQVRPUjogZ2QtanBlZyB2MS4wICh1c2luZyBJSkcgSlBFRyB2NjIpLCBxdWFsaXR5ID0gOTAK/9sAQwADAgIDAgIDAwMDBAMDBAUIBQUEBAUKBwcGCAwKDAwLCgsLDQ4SEA0OEQ4LCxAWEBETFBUVFQwPFxgWFBgSFBUU/9sAQwEDBAQFBAUJBQUJFA0LDRQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQU/8AAEQgCWAJYAwERAAIRAQMRAf/EAB8AAAEFAQEBAQEBAAAAAAAAAAABAgMEBQYHCAkKC//EALUQAAIBAwMCBAMFBQQEAAABfQECAwAEEQUSITFBBhNRYQcicRQygZGhCCNCscEVUtHwJDNicoIJChYXGBkaJSYnKCkqNDU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6g4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebn6Onq8fLz9PX29/j5+v/EAB8BAAMBAQEBAQEBAQEAAAAAAAABAgMEBQYHCAkKC//EALURAAIBAgQEAwQHBQQEAAECdwABAgMRBAUhMQYSQVEHYXETIjKBCBRCkaGxwQkjM1LwFWJy0QoWJDThJfEXGBkaJicoKSo1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoKDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uLj5OXm5+jp6vLz9PX29/j5+v/aAAwDAQACEQMRAD8A/U1QSei0AO2n0WgBQPp+FAC4oACOP8aAEVTnkD8KAArmgBAnHPNACbT/AHVoAdt9qAAqe2PzoAcft6D8aADafRaADafRaAA0AFABQAUAJtPotABtPoKADafRaADafRaADafRaADafRaAA0AFABigANABQAUAFABQAUAFABigANABQA1KAFoAO9ABQAUAHegAoAKACgAoAKACgAoAKAFoAKACgAoAKACgAoAKAFoAKAFoAKACgAoAKACgAoAKADigBKAFoAKACgAoAKAEoAWgAoAKACgAoAKACgAoAKACgBaACgBT0oAQ9KBMYn3vz/AEoGSUAFABQAlAC0AFABQAdaACgAoAKACgA7UAFAAaACgAoAKACgAoAKACgAoAKACgAoAKAAigBKAF60AFABQAUAFABQAUAFABQAGgAoAKACgAoABQAUABFACUALQAUAFABQAUAFAAaAD1oAKACgAoAKACgAoAO9ABQAUAFABQAUAFABQAUAFABQAd6ACgA70AJQAtACHpQJjE+9+f9KBklABQAUAJQAtABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAJQAuaAEoAWgAoAKACgAoAKACgAoAKACgAoAKAA0AFABQAUAFABQAUAFABQAdKAEoAWgAoAKACgAoAKAAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFAB0oASgBaACgAoASgBaAEPSgTGJ978/6UDJEAUJQA6gAoAKACgAoAKACgAoAKACgAoAKAFJwKAEoAMUAGKAFNABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAdqAFoAKACgAoASgBaADtQAUAFABQAdKACgAoAKACgANABQAlAC9KACgAoAKACgAoAKACgAoAKACgAoAO9ABQAUAFABQAlAC0AFACHpQJjE+9+f8ASgZJQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAGKACgAoAKACgAoAKACgANABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAlAC0AFAB0oAKAEoAWgBD0oExqfe/P+lAx9ABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUABoAKACgAoAKACgAoADQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAlAC0AFABQAlAC0AFACHpQJjU+9+f9KBj6ACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAlAC0AFABQAUAFABQAUAJQAtACUAIelAmNT735/wBKBj6ADFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAJQAtACUAFACHpQJjU+9+f9KBj6ACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgBKAFoAKACgBD0oExqfe/P+lAx9ABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAlAC0AFABQAUAFABQA2T/Vt9KBPY1Pvfn/SgY+gAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgBsn+rb6UCex//9k=",
      nationality: "india",
      nationalId: "223345566"
    },
    updatedAt: new Date().toISOString()
  };
  
  marshals[1] = {
    id: 'KMT-101',
    marshalNumber: '101',
    fullName: 'فاطمة الزهراء',
    email: 'marshal101@kmt.com',
    phone: '+96599100101',
    nationality: 'الكويت',
    status: 'active',
    password: '654321',
    hasChangedPassword: true,
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString()
  };
  
  // إضافة مارشال 150 بالاسم الصحيح
  marshals[50] = {
    id: 'KMT-150',
    marshalNumber: '150',
    fullName: 'مارشال رقم 150',
    email: 'marshal150@kmt.com',
    phone: '+96599000150',
    nationality: 'الكويت',
    status: 'active',
    password: '123456',
    hasChangedPassword: false,
    createdAt: new Date().toISOString(),
    lastLogin: null,
    marshallInfo: {}
  };
  
  return marshals;
};

// توليد بيانات السباقات الأولية
const generateInitialRaces = () => {
  return [
    {
      id: 'race-1',
      name: 'سباق الكأس الذهبي',
      date: '2025-11-15',
      time: '15:00',
      location: 'حلبة الكويت الرئيسية',
      assignedMarshals: ['KMT-100', 'KMT-101'],
      status: 'active'
    },
    {
      id: 'race-2',
      name: 'سباق السرعة المفتوح',
      date: '2025-11-20',
      time: '14:30',
      location: 'حلبة الكويت الفرعية',
      assignedMarshals: ['KMT-100'],
      status: 'pending'
    }
  ];
};

// قراءة البيانات
const loadData = () => {
  try {
    if (fs.existsSync(DATABASE_FILE)) {
      const data = fs.readFileSync(DATABASE_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading data:', error);
  }
  return null;
};

// حفظ البيانات
const saveData = (data) => {
  try {
    fs.writeFileSync(DATABASE_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error saving data:', error);
    return false;
  }
};

// الحصول على جميع المارشال
const getMarshals = () => {
  const data = loadData();
  return data ? data.marshals : [];
};

// حفظ المارشال
const saveMarshals = (marshals) => {
  const data = loadData() || { marshals: [], races: [], users: [], lastMarshalNumber: 149 };
  data.marshals = marshals;
  return saveData(data);
};

// إضافة أو تحديث مارشال
const updateMarshal = (marshalId, updates) => {
  const data = loadData();
  if (!data) return false;
  
  const marshalIndex = data.marshals.findIndex(m => m.id === marshalId);
  if (marshalIndex !== -1) {
    data.marshals[marshalIndex] = { ...data.marshals[marshalIndex], ...updates };
    return saveData(data);
  }
  return false;
};

// إضافة مارشال جديد
const addMarshal = (marshalData) => {
  const data = loadData();
  if (!data) return false;
  
  // إنشاء رقم مارشال جديد
  data.lastMarshalNumber = (data.lastMarshalNumber || 149) + 1;
  const newMarshal = {
    id: `KMT-${data.lastMarshalNumber}`,
    marshalNumber: data.lastMarshalNumber.toString(),
    createdAt: new Date().toISOString(),
    status: 'pending',
    hasChangedPassword: false,
    lastLogin: null,
    marshallInfo: {},
    ...marshalData
  };
  
  data.marshals.push(newMarshal);
  return saveData(data) ? newMarshal : false;
};

// الحصول على السباقات
const getRaces = () => {
  const data = loadData();
  return data ? data.races : [];
};

// حفظ السباقات
const saveRaces = (races) => {
  const data = loadData() || { marshals: [], races: [], users: [], lastMarshalNumber: 149 };
  data.races = races;
  return saveData(data);
};

// إضافة سباق جديد
const addRace = (race) => {
  try {
    const races = getRaces();
    races.push(race);
    return saveRaces(races);
  } catch (error) {
    console.error('Error adding race:', error);
    return false;
  }
};

// حذف سباق
const deleteRace = (raceId) => {
  try {
    const races = getRaces();
    const filteredRaces = races.filter(race => race.id !== raceId);
    return saveRaces(filteredRaces);
  } catch (error) {
    console.error('Error deleting race:', error);
    return false;
  }
};

// تحديث سباق
const updateRace = (raceId, updates) => {
  try {
    const races = getRaces();
    const raceIndex = races.findIndex(race => race.id === raceId);
    
    if (raceIndex === -1) {
      return false;
    }
    
    races[raceIndex] = { ...races[raceIndex], ...updates };
    return saveRaces(races);
  } catch (error) {
    console.error('Error updating race:', error);
    throw error;
  }
};

// تسجيل عمليات الحذف
const logDeletion = (type, deletionData) => {
  try {
    const LOGS_FILE = path.join(DATA_DIR, 'deletion_logs.json');
    let logs = [];
    
    // قراءة السجلات الموجودة
    if (fs.existsSync(LOGS_FILE)) {
      const logData = fs.readFileSync(LOGS_FILE, 'utf8');
      logs = JSON.parse(logData);
    }
    
    // إضافة السجل الجديد
    logs.push({
      type: type,
      ...deletionData,
      logId: `LOG-${Date.now()}`
    });
    
    // حفظ السجلات
    fs.writeFileSync(LOGS_FILE, JSON.stringify(logs, null, 2), 'utf8');
    console.log('📝 Deletion logged successfully:', type, deletionData.marshalId || deletionData.raceId);
    
  } catch (error) {
    console.error('❌ Error logging deletion:', error);
  }
};

// الحصول على سجلات الحذف
const getDeletionLogs = () => {
  try {
    const LOGS_FILE = path.join(DATA_DIR, 'deletion_logs.json');
    
    if (fs.existsSync(LOGS_FILE)) {
      const logData = fs.readFileSync(LOGS_FILE, 'utf8');
      return JSON.parse(logData);
    }
    
    return [];
  } catch (error) {
    console.error('❌ Error reading deletion logs:', error);
    return [];
  }
};

module.exports = {
  initDatabase,
  loadData,
  saveData,
  getMarshals,
  saveMarshals,
  updateMarshal,
  addMarshal,
  getRaces,
  saveRaces,
  addRace,
  deleteRace,
  updateRace,
  logDeletion,
  getDeletionLogs
};