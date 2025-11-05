const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'eventpro_secret_key_2024';

const auth = (req, res, next) => {
  try {
    // الحصول على الـ token من الـ header
    const authHeader = req.header('Authorization');
    console.log('Auth header received:', authHeader ? 'موجود' : 'غير موجود');
    
    if (!authHeader) {
      return res.status(401).json({ message: 'لا يوجد رمز مصادقة، الوصول مرفوض' });
    }

    const token = authHeader.replace('Bearer ', '');
    
    if (!token || token === 'null' || token === 'undefined') {
      return res.status(401).json({ message: 'رمز المصادقة غير صالح أو فارغ' });
    }

    console.log('Token to verify:', token.substring(0, 20) + '...');

    // التحقق من صحة الـ token
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Token decoded successfully:', decoded);
    
    // تحويل userId إلى _id للتوافق مع باقي الكود
    req.user = {
      ...decoded,
      _id: decoded.userId || decoded._id
    };
    
    next();

  } catch (error) {
    console.error('خطأ في التحقق من الـ token:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'رمز المصادقة غير صالح أو تالف' });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'انتهت صلاحية رمز المصادقة' });
    } else {
      return res.status(401).json({ message: 'خطأ في المصادقة' });
    }
  }
};

module.exports = auth;