# Render Deployment Alternative

## 🚀 نشر Backend على Render (أسهل من Railway)

### الخطوات:

#### 1. إنشاء حساب Render
- اذهب إلى https://render.com
- إنشاء حساب مجاني
- ربط حساب GitHub

#### 2. إنشاء Web Service جديد
- اختر "New Web Service"
- ربط repository: frooos9199/kmt-event-management
- اختر branch: main
- Root Directory: backend

#### 3. إعدادات النشر
```
Name: kmt-backend
Environment: Node
Build Command: npm install
Start Command: npm start
```

#### 4. متغيرات البيئة
```
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/kmt-db
JWT_SECRET=kmt-super-secret-key-2025
CLIENT_URL=https://kmt-event-management.netlify.app
```

#### 5. MongoDB Atlas Setup
- اذهب إلى https://cloud.mongodb.com
- إنشاء cluster مجاني (M0)
- إنشاء database user
- إضافة IP: 0.0.0.0/0
- نسخ connection string

### مزايا Render:
✅ مجاني تماماً
✅ سهل الإعداد
✅ تحديث تلقائي من GitHub
✅ SSL مجاني
✅ لا يحتاج CLI

### النتيجة:
ستحصل على رابط مثل: https://kmt-backend.onrender.com