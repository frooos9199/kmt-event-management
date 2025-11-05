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
  try {
    const { count } = req.body;
    
    if (!count || count < 1 || count > 100) {
      return res.status(400).json({ 
        message: 'عدد المارشال يجب أن يكون بين 1 و 100' 
      });
    }

    const marshals = dataManager.getMarshals();
    const existingNumbers = marshals.map(m => parseInt(m.marshalNumber)).filter(n => !isNaN(n));
    const lastNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) : 99;
    
    const newMarshals = [];
    const startId = lastNumber + 1;
    
    for (let i = 0; i < count; i++) {
      const marshalNumber = startId + i;
      
      const newMarshal = dataManager.addMarshal({
        fullName: `مارشال رقم ${marshalNumber}`,
        email: `marshal${marshalNumber}@kmt.com`,
        phone: `+965${99000000 + marshalNumber}`,
        nationality: 'الكويت',
        password: '123456'
      });
      
      if (newMarshal) {
        newMarshals.push(newMarshal);
      }
    }
    
    res.json({
      message: `تم إنشاء ${newMarshals.length} مارشال بنجاح`,
      created: newMarshals.length,
      startId: startId,
      endId: startId + newMarshals.length - 1,
      marshals: newMarshals
    });
  } catch (error) {
    console.error('Error creating bulk marshals:', error);
    res.status(500).json({ 
      success: false, 
      message: 'خطأ في إنشاء المارشال' 
    });
  }
});

// Marshal management routes
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

app.get('/api/users/marshals/:id', (req, res) => {
  try {
    const marshals = dataManager.getMarshals();
    const marshal = marshals.find(m => m.id === req.params.id);
    
    if (!marshal) {
      return res.status(404).json({ 
        success: false, 
        message: 'المارشال غير موجود' 
      });
    }
    
    res.json({ marshal });
  } catch (error) {
    console.error('Error fetching marshal:', error);
    res.status(500).json({ 
      success: false, 
      message: 'خطأ في جلب بيانات المارشال' 
    });
  }
});

app.put('/api/users/marshals/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Add update timestamp
    updates.updatedAt = new Date().toISOString();
    
    const success = dataManager.updateMarshal(id, updates);
    
    if (success) {
      const marshals = dataManager.getMarshals();
      const updatedMarshal = marshals.find(m => m.id === id);
      res.json({ 
        success: true, 
        marshal: updatedMarshal,
        message: 'تم تحديث بيانات المارشال بنجاح' 
      });
    } else {
      res.status(404).json({ 
        success: false, 
        message: 'المارشال غير موجود' 
      });
    }
  } catch (error) {
    console.error('Error updating marshal:', error);
    res.status(500).json({ 
      success: false, 
      message: 'خطأ في تحديث بيانات المارشال' 
    });
  }
});

app.post('/api/users/marshals', auth, async (req, res) => {
  try {
    const marshalData = req.body;
    const newMarshal = dataManager.addMarshal(marshalData);
    
    if (newMarshal) {
      res.status(201).json({ 
        success: true, 
        marshal: newMarshal,
        message: 'تم إضافة المارشال بنجاح' 
      });
    } else {
      res.status(500).json({ 
        success: false, 
        message: 'فشل في إضافة المارشال' 
      });
    }
  } catch (error) {
    console.error('Error creating marshal:', error);
    res.status(500).json({ 
      success: false, 
      message: 'خطأ في إضافة المارشال' 
    });
  }
});

app.delete('/api/users/marshals/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const marshals = dataManager.getMarshals();
    const filteredMarshals = marshals.filter(m => m.id !== id);
    
    if (marshals.length !== filteredMarshals.length) {
      dataManager.saveMarshals(filteredMarshals);
      res.json({ 
        success: true, 
        message: 'تم حذف المارشال بنجاح' 
      });
    } else {
      res.status(404).json({ 
        success: false, 
        message: 'المارشال غير موجود' 
      });
    }
  } catch (error) {
    console.error('Error deleting marshal:', error);
    res.status(500).json({ 
      success: false, 
      message: 'خطأ في حذف المارشال' 
    });
  }
});

// تحديث ملف المارشال الشخصي
app.put('/api/users/profile', auth, async (req, res) => {
  try {
    const { marshallInfo, fullName, phone } = req.body;
    const userId = req.user.userId || req.user.id;

    console.log('Profile update request received for user:', userId);

    // البحث عن المارشال
    const marshals = dataManager.getMarshals();
    let marshal = marshals.find(m => m.id === userId);

    if (!marshal) {
      console.log('Marshal not found');
      return res.status(404).json({
        success: false,
        message: 'المارشال غير موجود'
      });
    }

    // تحديث بيانات المارشال
    const updateData = {
      updatedAt: new Date().toISOString()
    };

    if (fullName) updateData.fullName = fullName;
    if (phone) updateData.phone = phone;
    if (marshallInfo) {
      updateData.marshallInfo = {
        ...marshal.marshallInfo,
        ...marshallInfo
      };
    }

    const success = dataManager.updateMarshal(marshal.id, updateData);

    if (success) {
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

// الحصول على معلومات المارشال الشخصية
app.get('/api/users/profile', auth, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    
    const marshals = dataManager.getMarshals();
    const marshal = marshals.find(m => m.id === userId);

    if (!marshal) {
      return res.status(404).json({ 
        success: false,
        message: 'المارشال غير موجود' 
      });
    }

    res.json({
      success: true,
      user: {
        ...marshal,
        userType: 'marshall'
      }
    });

  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ 
      success: false,
      message: 'خطأ في الخادم' 
    });
  }
});

// Race management routes
app.get('/api/races', (req, res) => {
  try {
    const races = dataManager.getRaces();
    res.json({ races });
  } catch (error) {
    console.error('Error fetching races:', error);
    res.status(500).json({ 
      success: false, 
      message: 'خطأ في جلب بيانات السباقات' 
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    success: false, 
    message: 'خطأ في الخادم' 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'المسار غير موجود' 
  });
});

app.listen(PORT, () => {
  console.log(`🚀 KMT Event Management Server running on port ${PORT}`);
  console.log(`💾 Using persistent data storage`);
  console.log(`🌐 CORS enabled for production domains`);
  console.log(`🔐 JWT authentication enabled`);
});