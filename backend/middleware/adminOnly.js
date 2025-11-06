const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'eventpro_secret_key_2024';

// Middleware للتحقق من أن المستخدم أدمن
const adminOnly = (req, res, next) => {
  try {
    // الحصول على الـ token من الـ header
    const authHeader = req.header('Authorization');
    console.log('🔐 Admin auth check - header received:', authHeader ? 'موجود' : 'غير موجود');
    
    if (!authHeader) {
      return res.status(401).json({ 
        success: false,
        message: 'غير مصرح لك بالوصول - يجب تسجيل الدخول كأدمن' 
      });
    }

    const token = authHeader.replace('Bearer ', '');
    
    if (!token || token === 'null' || token === 'undefined') {
      return res.status(401).json({ 
        success: false,
        message: 'رمز المصادقة غير صالح' 
      });
    }

    // التحقق من صحة الـ token
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('🔍 Token decoded for admin check:', { 
      email: decoded.email, 
      role: decoded.role 
    });
    
    // التحقق من أن المستخدم أدمن
    if (!decoded.role || decoded.role !== 'admin') {
      console.log('❌ Access denied - User is not admin:', decoded);
      return res.status(403).json({ 
        success: false,
        message: 'غير مصرح لك بهذا الإجراء - مخصص للأدمن فقط' 
      });
    }

    // إضافة بيانات المستخدم للطلب
    req.user = {
      ...decoded,
      _id: decoded.userId || decoded._id
    };
    
    console.log('✅ Admin access granted');
    next();

  } catch (error) {
    console.error('💥 خطأ في التحقق من صلاحيات الأدمن:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false,
        message: 'رمز المصادقة غير صالح أو تالف' 
      });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        message: 'انتهت صلاحية رمز المصادقة' 
      });
    } else {
      return res.status(401).json({ 
        success: false,
        message: 'خطأ في المصادقة' 
      });
    }
  }
};

module.exports = adminOnly;