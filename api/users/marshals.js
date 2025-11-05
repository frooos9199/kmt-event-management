// Vercel Serverless Function for getting marshals
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

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Generate and return marshals
  const mockMarshals = generateMarshals();
  res.json({ marshals: mockMarshals });
}

// Generate marshals function (same as login)
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