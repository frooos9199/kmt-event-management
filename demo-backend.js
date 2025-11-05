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

// Mock data
const mockMarshals = [
  {
    id: 'KMT-100',
    fullName: 'أحمد محمد الكويتي',
    email: 'ahmed@kmt.com',
    phone: '+96599112233',
    nationality: 'الكويت',
    status: 'approved'
  },
  {
    id: 'KMT-101', 
    fullName: 'فاطمة الزهراء',
    email: 'fatima@kmt.com',
    phone: '+96599445566',
    nationality: 'الكويت',
    status: 'approved'
  },
  {
    id: 'KMT-102',
    fullName: 'خالد العتيبي', 
    email: 'khalid@kmt.com',
    phone: '+96599778899',
    nationality: 'السعودية',
    status: 'approved'
  }
];

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
  const { email, password } = req.body;
  
  // Mock authentication
  if (email === 'admin@kmt.com' && password === 'admin123') {
    return res.json({
      success: true,
      token: 'mock-admin-token',
      user: { id: 'admin', email, userType: 'manager', fullName: 'مدير النظام' }
    });
  }
  
  const marshal = mockMarshals.find(m => m.email === email);
  if (marshal && password === '123456') {
    return res.json({
      success: true,
      token: 'mock-marshal-token',
      user: { ...marshal, userType: 'marshall' }
    });
  }
  
  res.status(401).json({ message: 'بيانات دخول غير صحيحة' });
});

// Marshals endpoints
app.get('/api/users/marshals', (req, res) => {
  res.json({ marshals: mockMarshals });
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