const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'eventpro_secret_key_2024';

const auth = (req, res, next) => {
  try {
    // الحصول على الـ token من الـ header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'لا يوجد رمز مصادقة، الوصول مرفوض' });
    }

    // التحقق من صحة الـ token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // تحويل userId إلى _id للتوافق مع باقي الكود
    req.user = {
      ...decoded,
      _id: decoded.userId || decoded._id
    };
    
    next();

  } catch (error) {
    console.error('خطأ في التحقق من الـ token:', error);
    res.status(401).json({ message: 'رمز المصادقة غير صالح' });
  }
};

module.exports = auth;