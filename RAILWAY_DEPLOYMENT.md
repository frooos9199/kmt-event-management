# KMT Backend Deployment Guide

## نشر Backend على Railway

### 1. تثبيت Railway CLI
```bash
npm install -g @railway/cli
railway login
```

### 2. رفع المشروع
```bash
cd /Users/mac/Documents/GitHub/event
railway init
railway link
```

### 3. إعداد متغيرات البيئة في Railway
- `NODE_ENV`: production
- `MONGODB_URI`: (سيتم الحصول عليه من MongoDB Atlas)
- `JWT_SECRET`: kmt-super-secret-key-2025
- `CLIENT_URL`: https://kmt-event-management.netlify.app

### 4. نشر المشروع
```bash
railway up
```

## MongoDB Atlas Setup

### 1. إنشاء حساب MongoDB Atlas
- اذهب إلى https://cloud.mongodb.com
- إنشاء حساب مجاني
- إنشاء cluster جديد (M0 مجاني)

### 2. إعداد قاعدة البيانات
- اسم قاعدة البيانات: kmt-event-management
- Username: kmtadmin
- Password: (سيتم إنشاؤه)

### 3. الحصول على Connection String
- Network Access → Add IP (0.0.0.0/0 للوصول العام)
- Database Access → إنشاء مستخدم
- Connect → Connect your application
- نسخ connection string

## تحديث Frontend

### في frontend/.env.production:
```env
REACT_APP_API_URL=https://[railway-domain]/api
```

## الاختبار النهائي
1. تشغيل النظام المحلي للتأكد
2. نشر على Railway
3. اختبار الاتصال
4. اختبار إنشاء السباقات والمارشال