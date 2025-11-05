#!/bin/bash

# KMT Backend Deployment Script

echo "🚀 بدء نشر KMT Backend على Railway..."

# التحقق من وجود Railway CLI
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI غير مثبت. تثبيت الآن..."
    npm install -g @railway/cli
fi

# الانتقال إلى مجلد Backend
cd backend || {
    echo "❌ لا يمكن العثور على مجلد backend"
    exit 1
}

# تثبيت Dependencies
echo "📦 تثبيت Dependencies..."
npm install

# إنشاء مشروع Railway جديد
echo "🛤️ إعداد Railway..."
railway login
railway init --name "kmt-backend"

# إضافة متغيرات البيئة
echo "🔧 إعداد متغيرات البيئة..."
railway variables set NODE_ENV=production
railway variables set JWT_SECRET=kmt-super-secret-key-2025
railway variables set CLIENT_URL=https://kmt-event-management.netlify.app

# نشر المشروع
echo "🚀 نشر Backend..."
railway up

echo "✅ تم نشر Backend بنجاح!"
echo "🔗 يمكنك الوصول إلى logs من خلال: railway logs"
echo "📊 يمكنك فتح dashboard من خلال: railway open"