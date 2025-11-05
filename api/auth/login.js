// Vercel Serverless Function for authentication
export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email, password, marshalNumber } = req.body;

  // Mock marshals data
  const mockMarshals = generateMarshals();

  // Admin login
  if (email && email === 'admin@kmt.com' && password === 'admin123') {
    return res.json({
      success: true,
      token: 'mock-admin-token',
      user: { id: 'admin', email, userType: 'manager', fullName: 'مدير النظام' }
    });
  }

  // Marshal login by number
  if (marshalNumber) {
    const searchNumber = marshalNumber.startsWith('KMT-') ? marshalNumber : `KMT-${marshalNumber}`;
    const marshal = mockMarshals.find(m => m.id === searchNumber || m.marshalNumber === marshalNumber);
    
    if (marshal && marshal.password === password) {
      marshal.lastLogin = new Date().toISOString();
      
      return res.json({
        success: true,
        token: 'mock-marshal-token',
        user: { ...marshal, userType: 'marshall' }
      });
    }
  }

  // Fallback email login
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
}

// Generate marshals function
function generateMarshals() {
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
      lastLogin: null
    });
  }

  // Add test marshals
  marshals[0] = {
    id: 'KMT-100',
    marshalNumber: '100',
    fullName: 'أحمد محمد الكويتي',
    email: 'marshal100@kmt.com',
    phone: '+96599100100',
    nationality: 'الكويت',
    status: 'active',
    password: '123456',
    hasChangedPassword: true,
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString()
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

  return marshals;
}