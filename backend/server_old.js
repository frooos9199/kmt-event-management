// KMT Event Management System - Backend with Persistent Data Storage
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const auth = require('./middleware/auth');
const dataManager = require('./utils/dataManager');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'eventpro_secret_key_2024';

// تهيئة قاعدة البيانات عند بدء تشغيل الخادم
dataManager.initDatabase();

// CORS
app.use(cors({
  origin: [
    'https://kmt-event-management.vercel.app',
    'https://kmt-event-management.netlify.app', 
    'http://localhost:3000',
    'http://localhost:3001'
  ],
  credentials: true
}));

app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.json({ 
    message: 'KMT Backend API - Persistent Data Version',
    status: 'running',
    time: new Date().toISOString(),
    dataStatus: 'persistent storage enabled'
  });
});

// Admin user for system management
const adminUser = {
  email: 'admin@kmt.com',
  password: 'admin123',
  role: 'admin',
  name: 'مدير النظام'
};

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

// Auth routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check admin login
    if (email === adminUser.email && password === adminUser.password) {
      const token = jwt.sign(
        { 
          userId: 'admin', 
          email: adminUser.email, 
          role: 'admin' 
        }, 
        JWT_SECRET, 
        { expiresIn: '24h' }
      );
      
      return res.json({
        success: true,
        token,
        user: {
          id: 'admin',
          email: adminUser.email,
          name: adminUser.name,
          role: 'admin'
        }
      });
    }
    
    // Check marshal login
    const marshals = dataManager.getMarshals();
    const marshal = marshals.find(m => m.email === email && m.password === password);
    
    if (marshal) {
      // Update last login time
      dataManager.updateMarshal(marshal.id, { 
        lastLogin: new Date().toISOString(),
        status: 'active'
      });
      
      const token = jwt.sign(
        { 
          userId: marshal.id, 
          email: marshal.email, 
          role: 'marshal' 
        }, 
        JWT_SECRET, 
        { expiresIn: '24h' }
      );
      
      return res.json({
        success: true,
        token,
        user: {
          id: marshal.id,
          email: marshal.email,
          name: marshal.fullName,
          role: 'marshal',
          marshalNumber: marshal.marshalNumber,
          hasChangedPassword: marshal.hasChangedPassword
        }
      });
    }
    
    res.status(401).json({ 
      success: false, 
      message: 'بيانات الدخول غير صحيحة' 
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'خطأ في الخادم' 
    });
  }
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
  try {
    const marshals = dataManager.getMarshals();
    res.json({ marshals });
  } catch (error) {
    console.error('Error fetching marshals:', error);
    res.status(500).json({ 
      success: false, 
      message: 'خطأ في جلب بيانات المارشال' 
    });
  }
});

// تحديث ملف المارشال الشخصي
app.put('/api/users/profile', auth, async (req, res) => {
  try {
    const { marshallInfo } = req.body;
    const userId = req.user._id || req.user.userId || req.user.id;

    console.log('Profile update request received');
    console.log('User ID from token:', userId);
    console.log('Marshall info to update:', JSON.stringify(marshallInfo, null, 2));

    // البحث عن المارشال
    const marshals = dataManager.getMarshals();
    let marshal = null;
    
    if (typeof userId === 'string' && userId.startsWith('KMT-')) {
      marshal = marshals.find(m => m.id === userId);
    } else if (req.user.marshalNumber) {
      marshal = marshals.find(m => m.marshalNumber === req.user.marshalNumber);
    }

    if (!marshal) {
      console.log('Marshal not found');
      return res.status(404).json({
        success: false,
        message: 'المارشال غير موجود'
      });
    }

    console.log('Found marshal:', marshal.id);

    // تحديث بيانات المارشال
    const updateData = {
      marshallInfo: {
        ...marshal.marshallInfo,
        ...marshallInfo
      },
      updatedAt: new Date().toISOString()
    };

    const success = dataManager.updateMarshal(marshal.id, updateData);

    if (success) {
      console.log('Profile updated successfully');
      const updatedMarshals = dataManager.getMarshals();
      const updatedMarshal = updatedMarshals.find(m => m.id === marshal.id);
      
      res.json({
        success: true,
        message: 'تم حفظ الملف الشخصي بنجاح',
        marshal: updatedMarshal
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'فشل في حفظ البيانات'
      });
    }

  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم أثناء تحديث الملف الشخصي'
    });
  }
});
      marshalIndex = mockMarshals.findIndex(m => 
        m.id === userId || 
        m.marshalNumber === userId || 
        m.email === req.user.email
      );
      console.log('Searching by various fields');
    }

    console.log('Marshal index found:', marshalIndex);

    if (marshalIndex === -1) {
      console.log('Marshal not found. Available marshals:');
      mockMarshals.forEach((m, i) => {
        console.log(`${i}: { id: ${m.id}, marshalNumber: ${m.marshalNumber}, email: ${m.email} }`);
      });
      return res.status(404).json({ message: 'المارشال غير موجود' });
    }

    // دمج البيانات الجديدة مع البيانات الموجودة
    const currentMarshal = mockMarshals[marshalIndex];
    const updatedMarshal = {
      ...currentMarshal,
      // تحديث الاسم إذا تم إرساله
      ...(req.body.fullName && { fullName: req.body.fullName }),
      // تحديث الهاتف إذا تم إرساله
      ...(req.body.phone && { phone: req.body.phone }),
      marshallInfo: {
        ...currentMarshal.marshallInfo,
        ...marshallInfo
      },
      updatedAt: new Date().toISOString()
    };

    // تحديث المارشال في القائمة
    mockMarshals[marshalIndex] = updatedMarshal;

    console.log('Profile updated successfully for marshal:', updatedMarshal.id);

    res.json({
      message: 'تم تحديث الملف الشخصي بنجاح',
      user: {
        ...updatedMarshal,
        userType: 'marshall'
      }
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'خطأ في الخادم: ' + error.message });
  }
});

// الحصول على معلومات المارشال الشخصية
app.get('/api/users/profile', auth, async (req, res) => {
  try {
    const userId = req.user._id || req.user.userId || req.user.id;

    console.log('Profile fetch request:', { userId });

    // البحث عن المارشال باستخدام معرف المستخدم
    let marshal = null;
    
    // البحث بطرق مختلفة للعثور على المارشال
    if (typeof userId === 'string' && userId.startsWith('KMT-')) {
      marshal = mockMarshals.find(m => m.id === userId);
    } else if (req.user.marshalNumber) {
      marshal = mockMarshals.find(m => m.marshalNumber === req.user.marshalNumber);
    } else {
      // البحث في حقول أخرى
      marshal = mockMarshals.find(m => 
        m.id === userId || 
        m.marshalNumber === userId || 
        m.email === req.user.email
      );
    }
    
    if (!marshal) {
      console.log('Marshal not found. Available marshals:', mockMarshals.map(m => ({ id: m.id, marshalNumber: m.marshalNumber })));
      return res.status(404).json({ message: 'المارشال غير موجود' });
    }

    res.json({
      user: {
        ...marshal,
        userType: 'marshall'
      }
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
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