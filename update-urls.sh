#!/bin/bash
# تحديث جميع URLs في مشروع React

echo "تحديث URLs في المشروع..."

# تحديث جميع الملفات التي تحتوي على localhost:5001
find frontend/src -name "*.js" -type f -exec sed -i '' 's|http://localhost:5001|https://kmt-event-management.onrender.com|g' {} +

# تحديث المسارات التي تستخدم متغير البيئة مع localhost كافتراضي
find frontend/src -name "*.js" -type f -exec sed -i '' "s|process.env.REACT_APP_API_URL \|\| 'http://localhost:5001'|process.env.REACT_APP_API_URL \|\| 'https://kmt-event-management.onrender.com'|g" {} +

echo "تم تحديث جميع URLs بنجاح!"