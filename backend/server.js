// حل مؤقت: Backend بسيط للعرض التوضيحي
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS
app.use(cors({
  origin: ['https://kmt-event-management.netlify.app', 'http://localhost:3000'],
  credentials: true
}));

app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.json({ 
    message: 'KMT Backend API - Demo Version',
    status: 'running',
    time: new Date().toISOString()
  });
});

// Mock data - نظام المارشال الجديد مع أرقام متسلسلة من 100
const generateMarshals = () => {
  const marshals = [];
  for (let i = 0; i < 50; i++) {
    const marshalNumber = 100 + i; // يبدأ من 100 إلى 149
    const passwordIndex = (i % 6) + 1; // كلمات مرور من 1 إلى 6 (تتكرر)
    
    marshals.push({
      id: `KMT-${marshalNumber}`,
      marshalNumber: marshalNumber.toString(),
      fullName: `مارشال رقم ${marshalNumber}`,
      email: `marshal${marshalNumber}@kmt.com`,
      phone: `+965${99000000 + marshalNumber}`,
      nationality: 'الكويت',
      status: 'pending', // في انتظار تسجيل الدخول الأول
      password: passwordIndex.toString(),
      hasChangedPassword: false, // لم يغير كلمة المرور بعد
      createdAt: new Date().toISOString(),
      lastLogin: null
    });
  }
  return marshals;
};

const mockMarshals = generateMarshals();

// إضافة بعض المارشال المُفعلين للاختبار (بدءاً من 100)
mockMarshals[0] = {
  id: 'KMT-100',
  marshalNumber: '100',
  fullName: 'أحمد محمد الكويتي',
  email: 'marshal100@kmt.com',
  phone: '+96599100100',
  nationality: 'الكويت',
  status: 'active',
  password: '123456', // غير كلمة المرور
  hasChangedPassword: true,
  createdAt: new Date().toISOString(),
  lastLogin: new Date().toISOString()
};

mockMarshals[1] = {
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

const mockRaces = [
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
    time: '18:00', 
    location: 'حلبة التدريب',
    assignedMarshals: ['KMT-102'],
    status: 'pending'
  }
];

// Auth endpoints
app.post('/api/auth/login', (req, res) => {
  const { email, password, marshalNumber } = req.body;
  
  // إذا كان تسجيل دخول بالبريد الإلكتروني (للمدير)
  if (email && email === 'admin@kmt.com' && password === 'admin123') {
    return res.json({
      success: true,
      token: 'mock-admin-token',
      user: { id: 'admin', email, userType: 'manager', fullName: 'مدير النظام' }
    });
  }
  
  // إذا كان تسجيل دخول برقم المارشال
  if (marshalNumber) {
    // البحث برقم المارشال الكامل (KMT-XXX) أو الرقم فقط
    const searchNumber = marshalNumber.startsWith('KMT-') ? marshalNumber : `KMT-${marshalNumber}`;
    const marshal = mockMarshals.find(m => m.id === searchNumber || m.marshalNumber === marshalNumber);
    
    if (marshal && marshal.password === password) {
      // تحديث آخر دخول
      marshal.lastLogin = new Date().toISOString();
      
      return res.json({
        success: true,
        token: 'mock-marshal-token',
        user: { ...marshal, userType: 'marshall' }
      });
    }
  }
  
  // محاولة البحث بالبريد الإلكتروني (للتوافق مع النظام القديم)
  if (email) {
    const marshal = mockMarshals.find(m => m.email === email);
    if (marshal && marshal.password === password) {
      marshal.lastLogin = new Date().toISOString();
      return res.json({
        success: true,
        token: 'mock-marshal-token',
        user: { ...marshal, userType: 'marshall' }
      });
    }
  }
  
  res.status(401).json({ message: 'بيانات دخول غير صحيحة' });
});

// إنشاء المارشال بالجملة
app.post('/api/users/create-bulk-marshals', (req, res) => {
  const { count } = req.body;
  
  // التحقق من البيانات
  if (!count || count < 1 || count > 100) {
    return res.status(400).json({ 
      message: 'عدد المارشال يجب أن يكون بين 1 و 100' 
    });
  }

  // العثور على آخر رقم مارشال موجود
  const existingNumbers = mockMarshals.map(m => parseInt(m.marshalNumber)).filter(n => !isNaN(n));
  const lastNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) : 99;
  
  const newMarshals = [];
  const startId = lastNumber + 1;
  const endId = startId + count - 1;
  
  for (let i = 0; i < count; i++) {
    const marshalNumber = startId + i;
    
    const newMarshal = {
      id: `KMT-${marshalNumber}`,
      marshalNumber: marshalNumber.toString(),
      fullName: `مارشال رقم ${marshalNumber}`,
      email: `marshal${marshalNumber}@kmt.com`,
      phone: `+965${99000000 + marshalNumber}`,
      nationality: 'الكويت',
      status: 'pending',
      password: '123456', // كلمة مرور موحدة
      hasChangedPassword: false,
      createdAt: new Date().toISOString(),
      lastLogin: null
    };
    
    newMarshals.push(newMarshal);
    mockMarshals.push(newMarshal);
  }
  
  res.json({
    message: `تم إنشاء ${count} مارشال بنجاح`,
    created: count,
    startId: startId,
    endId: endId,
    marshals: newMarshals
  });
});

// Marshals endpoints
app.get('/api/users/marshals', (req, res) => {
  res.json({ marshals: mockMarshals });
});

// تحديث ملف المارشال الشخصي
app.put('/api/users/profile', (req, res) => {
  const { marshallInfo } = req.body;
  
  // التحقق من وجود Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: 'مطلوب تسجيل الدخول' });
  }

  // في النظام التوضيحي، نحدث المارشال الأول
  // في النظام الحقيقي، نحصل على معرف المستخدم من الـ token
  const marshalIndex = mockMarshals.findIndex(m => m.id === 'KMT-100');
  
  if (marshalIndex === -1) {
    return res.status(404).json({ message: 'المارشال غير موجود' });
  }

  // دمج البيانات الجديدة مع البيانات الموجودة
  const updatedMarshal = {
    ...mockMarshals[marshalIndex],
    ...marshallInfo,
    updatedAt: new Date().toISOString()
  };

  // تحديث المارشال في القائمة
  mockMarshals[marshalIndex] = updatedMarshal;

  res.json({
    message: 'تم تحديث الملف الشخصي بنجاح',
    user: {
      ...updatedMarshal,
      userType: 'marshall'
    }
  });
});

// الحصول على معلومات المارشال الشخصية
app.get('/api/users/profile', (req, res) => {
  // التحقق من وجود Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: 'مطلوب تسجيل الدخول' });
  }

  // في النظام التوضيحي، نعرض المارشال الأول
  // في النظام الحقيقي، نحصل على معرف المستخدم من الـ token
  const marshal = mockMarshals.find(m => m.id === 'KMT-100');
  
  if (!marshal) {
    return res.status(404).json({ message: 'المارشال غير موجود' });
  }

  res.json({
    user: {
      ...marshal,
      userType: 'marshall'
    }
  });
});

// Races endpoints
app.get('/api/races', (req, res) => {
  res.json({ races: mockRaces });
});

app.post('/api/races', (req, res) => {
  const newRace = {
    id: 'race-' + (mockRaces.length + 1),
    ...req.body,
    assignedMarshals: [],
    status: 'pending'
  };
  mockRaces.push(newRace);
  res.json({ success: true, race: newRace });
});

// Marshal assignment
app.post('/api/races/:raceId/assign-marshal', (req, res) => {
  const { raceId } = req.params;
  const { marshalId } = req.body;
  
  const race = mockRaces.find(r => r.id === raceId);
  if (race && !race.assignedMarshals.includes(marshalId)) {
    race.assignedMarshals.push(marshalId);
  }
  
  res.json({ success: true, race });
});

app.listen(PORT, () => {
  console.log(`🚀 KMT Demo API running on port ${PORT}`);
  console.log(`🌐 Access at: http://localhost:${PORT}`);
});