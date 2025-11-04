const puppeteer = require('puppeteer');
const path = require('path');

async function convertToPDF() {
  console.log('🚀 بدء تحويل كتاب العرض إلى PDF...');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  console.log('📄 تحميل ملف HTML...');
  await page.goto(`http://localhost:8080/KMT_PRESENTATION_BOOK.html`, { 
    waitUntil: 'networkidle2',
    timeout: 15000 
  });
  
  console.log('🎨 تطبيق إعدادات PDF...');
  
  // إنشاء PDF بسيط
  await page.pdf({
    path: path.join(__dirname, 'KMT_Marshall_System_Presentation.pdf'),
    format: 'A4',
    printBackground: true,
    margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' },
  });
  
  await browser.close();
  
  console.log('✅ تم إنشاء ملف PDF بنجاح!');
  console.log('📂 جاهز للاستخدام!');
}

convertToPDF().catch(console.error);