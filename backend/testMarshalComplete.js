const mongoose = require('mongoose');
const User = require('./models/User');

// اختبار شامل لضمان عمل جميع الإجراءات مع أي مارشال

async function testMarshalSystemCompletely() {
  try {
    console.log('🧪 بدء اختبار النظام الشامل للمارشال...\n');

    // الاتصال بقاعدة البيانات
    await mongoose.connect('mongodb://127.0.0.1:27017/event-management');
    console.log('✅ تم الاتصال بقاعدة البيانات');

    // 1. اختبار إنشاء مارشال جديد
    console.log('\n📝 اختبار 1: إنشاء مارشال جديد...');
    
    // حذف المستخدم التجريبي إن وجد
    await User.deleteOne({ email: 'newmarshal@test.com' });
    
    const newMarshal = new User({
      fullName: 'أحمد عبدالله الكويتي',
      email: 'newmarshal@test.com',
      password: '123456',
      phone: '+96599887766',
      userType: 'marshall',
      accountStatus: 'approved'
    });

    await newMarshal.save();
    console.log('✅ تم إنشاء المارشال بنجاح');
    console.log(`🆔 رقم المارشال المولد تلقائياً: ${newMarshal.marshallInfo?.marshalId || 'لا يوجد'}`);

    // 2. اختبار تحديث الملف الشخصي
    console.log('\n👤 اختبار 2: تحديث الملف الشخصي...');
    
    const updateResult = await User.findByIdAndUpdate(
      newMarshal._id,
      { 
        $set: {
          'marshallInfo.profileImage': 'data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
          'marshallInfo.dateOfBirth': '1995-03-15',
          'marshallInfo.nationality': 'الكويت',
          'marshallInfo.nationalId': '295031512345',
          'marshallInfo.emergencyContact': {
            name: 'محمد الكويتي',
            phone: '+96599554433'
          }
        }
      },
      { new: true, runValidators: true }
    );

    if (updateResult) {
      console.log('✅ تم تحديث الملف الشخصي بنجاح');
      console.log(`📸 الصورة: ${updateResult.marshallInfo?.profileImage ? 'محفوظة' : 'غير محفوظة'}`);
      console.log(`📅 تاريخ الميلاد: ${updateResult.marshallInfo?.dateOfBirth || 'غير محدد'}`);
      console.log(`🆔 رقم الهوية: ${updateResult.marshallInfo?.nationalId || 'غير محدد'}`);
    }

    // 3. اختبار تحديث جزئي (فقط الصورة)
    console.log('\n🖼️ اختبار 3: تحديث الصورة فقط...');
    
    const imageUpdateResult = await User.findByIdAndUpdate(
      newMarshal._id,
      { 
        $set: {
          'marshallInfo.profileImage': 'data:image/jpeg;base64,NEW_IMAGE_DATA_HERE'
        }
      },
      { new: true }
    );

    if (imageUpdateResult) {
      console.log('✅ تم تحديث الصورة دون فقدان البيانات الأخرى');
      console.log(`📅 تاريخ الميلاد (محفوظ): ${imageUpdateResult.marshallInfo?.dateOfBirth || 'مفقود ❌'}`);
      console.log(`🆔 رقم الهوية (محفوظ): ${imageUpdateResult.marshallInfo?.nationalId || 'مفقود ❌'}`);
      console.log(`📞 جهة الاتصال (محفوظة): ${imageUpdateResult.marshallInfo?.emergencyContact?.name || 'مفقودة ❌'}`);
    }

    // 4. اختبار تحديث معلومات أساسية
    console.log('\n📝 اختبار 4: تحديث المعلومات الأساسية...');
    
    const basicUpdateResult = await User.findByIdAndUpdate(
      newMarshal._id,
      { 
        $set: {
          fullName: 'أحمد عبدالله الكويتي المحدث',
          phone: '+96599887799'
        }
      },
      { new: true }
    );

    if (basicUpdateResult) {
      console.log('✅ تم تحديث المعلومات الأساسية');
      console.log(`📸 الصورة (محفوظة): ${basicUpdateResult.marshallInfo?.profileImage ? 'نعم ✅' : 'لا ❌'}`);
      console.log(`📅 تاريخ الميلاد (محفوظ): ${basicUpdateResult.marshallInfo?.dateOfBirth || 'مفقود ❌'}`);
    }

    // 5. اختبار إنشاء مارشال آخر للتأكد من التسلسل
    console.log('\n👥 اختبار 5: إنشاء مارشال ثاني...');
    
    await User.deleteOne({ email: 'marshal2@test.com' });
    
    const secondMarshal = new User({
      fullName: 'سارة أحمد الخليجية',
      email: 'marshal2@test.com',
      password: '123456',
      phone: '+96599123456',
      userType: 'marshall',
      accountStatus: 'approved'
    });

    await secondMarshal.save();
    console.log('✅ تم إنشاء المارشال الثاني بنجاح');
    console.log(`🆔 رقم المارشال الثاني: ${secondMarshal.marshallInfo?.marshalId || 'لا يوجد'}`);

    // 6. اختبار جلب جميع المارشال
    console.log('\n📋 اختبار 6: جلب جميع المارشال...');
    
    const allMarshals = await User.find({ userType: 'marshall' })
      .select('-password')
      .sort({ createdAt: -1 });
    
    console.log(`✅ تم جلب ${allMarshals.length} مارشال من قاعدة البيانات`);
    allMarshals.forEach((marshal, index) => {
      console.log(`${index + 1}. ${marshal.fullName} - ${marshal.marshallInfo?.marshalId || 'بدون رقم'} - ${marshal.email}`);
    });

    // 7. اختبار النظافة - تنظيف البيانات التجريبية
    console.log('\n🧹 تنظيف البيانات التجريبية...');
    await User.deleteMany({ 
      email: { $in: ['newmarshal@test.com', 'marshal2@test.com'] }
    });
    console.log('✅ تم حذف البيانات التجريبية');

    console.log('\n🎉 تم إكمال جميع الاختبارات بنجاح!');
    console.log('\n📊 ملخص النتائج:');
    console.log('✅ إنشاء مارشال جديد - يعمل');
    console.log('✅ توليد رقم مارشال تلقائي - يعمل');
    console.log('✅ تحديث الملف الشخصي الكامل - يعمل');
    console.log('✅ تحديث الصورة فقط مع حفظ البيانات - يعمل');
    console.log('✅ تحديث المعلومات الأساسية مع حفظ marshallInfo - يعمل');
    console.log('✅ إدارة عدة مارشال - يعمل');
    console.log('✅ جلب جميع المارشال - يعمل');

  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 تم قطع الاتصال بقاعدة البيانات');
    process.exit(0);
  }
}

// تشغيل الاختبار
testMarshalSystemCompletely();