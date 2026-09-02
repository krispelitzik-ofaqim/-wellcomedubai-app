import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Linking, Alert, Modal, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { Colors } from '../../constants/colors';
import { useI18n } from '../../constants/i18n';

const SECTIONS: Record<string, { title: string; titleEn: string; color: string; body: string; bodyEn: string; bodyAr: string; bodyHi: string; bodyRu: string }> = {
  about: {
    title: 'אודותינו', titleEn: 'About Us', color: '#2A9D8F',
    body: `WellCome Dubai — המדריך הישראלי המלא לדובאי.

החזון שלנו
להיות הכתובת העברית הראשונה של תייר ישראלי שמתכנן ביקור באמירויות. אנחנו מאמינים שטיול חכם מתחיל במידע אמין, נגיש ועדכני — בעברית, עם רגישות לקודים המקומיים.

מה תמצאו כאן
• מלונות — מדורגים לפי כוכבים ויוקרה
• מסעדות — דגש על מסעדות כשרות, ישראליות וים-תיכוניות
• אטרקציות — חובה לראות, פעילויות מים, פארקי שעשועים, ספארי מדבר
• תחבורה — מטרו, מוניות, השכרת רכב, אפליקציות הסעה
• בילוי, קניות, ילדים — והכל במפה אחת
• מסלולי יום מוכנים, מזג אוויר חי, המרת מטבעות, לוחות טיסות חיים

מקורות המידע
הנתונים נאספים ממקורות פתוחים (Google Maps, אתרי הספקים, Wikipedia), מתחזקים ע"י משתמשי האתר ומעודכנים באופן שוטף. אנחנו לא מקבלים תשלום מאף ספק — הדירוגים אובייקטיביים.

ישראלים בדובאי
מאז הסכמי אברהם (2020), דובאי הפכה ליעד פופולרי לישראלים. האפליקציה נבנתה תוך הבנה של הצרכים הייחודיים של המטייל הישראלי — כשרות, שפה, מנהגים מקומיים וביטחון.`,
    bodyEn: `WellCome Dubai — your complete guide to Dubai.

Our Vision
To be the first go-to address for a traveler planning a visit to the Emirates. We believe a smart trip starts with reliable, accessible and up-to-date information — with sensitivity to local customs.

What You'll Find Here
• Hotels — ranked by stars and luxury level
• Restaurants — with an emphasis on kosher and Mediterranean dining
• Attractions — must-sees, water activities, theme parks, desert safaris
• Transport — metro, taxis, car rental, ride-hailing apps
• Nightlife, shopping, kids — all on a single map
• Ready-made day itineraries, live weather, currency conversion, live flight boards

Our Sources
Data is gathered from open sources (Google Maps, provider websites, Wikipedia), maintained by our users and updated regularly. We receive no payment from any provider — the rankings are objective.

Visitors in Dubai
Since the Abraham Accords (2020), Dubai has become a popular destination. The app was built with an understanding of travelers' unique needs — kosher food, language, local customs and safety.`,
    bodyAr: `WellCome Dubai — دليلك الكامل لدبي.

رؤيتنا
أن نكون العنوان الأول للمسافر الذي يخطط لزيارة الإمارات. نؤمن أن الرحلة الذكية تبدأ بمعلومات موثوقة وسهلة الوصول ومحدّثة — مع مراعاة العادات المحلية.

ماذا ستجد هنا
• الفنادق — مصنّفة حسب النجوم ومستوى الفخامة
• المطاعم — مع تركيز على المطاعم الحلال والمتوسطية
• المعالم — أماكن يجب زيارتها، أنشطة مائية، مدن ملاهٍ، رحلات سفاري صحراوية
• المواصلات — المترو، سيارات الأجرة، تأجير السيارات، تطبيقات النقل
• الحياة الليلية والتسوق والأطفال — كل ذلك على خريطة واحدة
• برامج يومية جاهزة، طقس مباشر، تحويل العملات، لوحات رحلات مباشرة

مصادرنا
تُجمع البيانات من مصادر مفتوحة (خرائط Google، مواقع المزوّدين، ويكيبيديا)، ويحدّثها مستخدمونا بشكل دوري. لا نتقاضى أي مبلغ من أي مزوّد — التصنيفات موضوعية.

الزوّار في دبي
أصبحت دبي وجهة سياحية شائعة. صُمّم التطبيق مع فهم الاحتياجات الخاصة للمسافرين — الطعام الحلال، اللغة، العادات المحلية والأمان.`,
    bodyHi: `WellCome Dubai — दुबई के लिए आपकी संपूर्ण गाइड।

हमारा दृष्टिकोण
अमीरात की यात्रा की योजना बना रहे यात्री के लिए पहला भरोसेमंद पता बनना। हम मानते हैं कि स्मार्ट यात्रा विश्वसनीय, सुलभ और अद्यतन जानकारी से शुरू होती है — स्थानीय रीति-रिवाजों के प्रति संवेदनशीलता के साथ।

यहाँ आपको क्या मिलेगा
• होटल — सितारों और विलासिता के स्तर के अनुसार क्रमबद्ध
• रेस्तरां — कोषेर और भूमध्यसागरीय भोजन पर ज़ोर
• आकर्षण — अवश्य देखने योग्य स्थान, जल गतिविधियाँ, थीम पार्क, रेगिस्तान सफारी
• परिवहन — मेट्रो, टैक्सी, कार किराया, राइड-हेलिंग ऐप्स
• नाइटलाइफ़, खरीदारी, बच्चे — सब एक ही नक़्शे पर
• तैयार दैनिक कार्यक्रम, लाइव मौसम, मुद्रा रूपांतरण, लाइव फ़्लाइट बोर्ड

हमारे स्रोत
डेटा खुले स्रोतों (Google Maps, प्रदाता वेबसाइट, Wikipedia) से एकत्र किया जाता है, हमारे उपयोगकर्ताओं द्वारा नियमित रूप से बनाए रखा जाता है। हम किसी भी प्रदाता से भुगतान नहीं लेते — रैंकिंग वस्तुनिष्ठ है।

दुबई में आगंतुक
दुबई एक लोकप्रिय गंतव्य बन गया है। ऐप को यात्रियों की विशेष ज़रूरतों — कोषेर भोजन, भाषा, स्थानीय रीति-रिवाज और सुरक्षा — की समझ के साथ बनाया गया है।`,
    bodyRu: `WellCome Dubai — ваш полный путеводитель по Дубаю.

Наше видение
Стать первым надёжным адресом для путешественника, планирующего поездку в Эмираты. Мы верим, что умное путешествие начинается с надёжной, доступной и актуальной информации — с уважением к местным обычаям.

Что вы здесь найдёте
• Отели — по звёздам и уровню роскоши
• Рестораны — с акцентом на кошерную и средиземноморскую кухню
• Достопримечательности — must-see, водные развлечения, парки, сафари в пустыне
• Транспорт — метро, такси, аренда авто, приложения для поездок
• Ночная жизнь, шопинг, дети — всё на одной карте
• Готовые дневные маршруты, погода в реальном времени, конвертация валют, онлайн-табло рейсов

Наши источники
Данные собираются из открытых источников (Google Maps, сайты поставщиков, Wikipedia), поддерживаются нашими пользователями и регулярно обновляются. Мы не получаем оплату ни от одного поставщика — рейтинги объективны.

Гости в Дубае
Дубай стал популярным направлением. Приложение создано с пониманием особых потребностей путешественников — кошерная еда, язык, местные обычаи и безопасность.`,
  },
  terms: {
    title: 'תקנון השימוש', titleEn: 'Terms of Use', color: '#E76F51',
    body: `עודכן לאחרונה: מאי 2026

1. כללי
השימוש באפליקציית WellCome Dubai (להלן: "האפליקציה") כפוף לתנאי שימוש אלה. הורדת האפליקציה והשימוש בה מהווים הסכמה לכל הסעיפים שלהלן.

2. מהות השירות
האפליקציה מספקת מידע תיירותי על דובאי לקהל הישראלי. השירות ניתן ללא תשלום, ללא רישום, וללא איסוף נתונים אישיים.

3. אחריות והגבלות
• כל המידע מסופק "כפי שהוא" (AS-IS), ללא אחריות מפורשת או משתמעת.
• מחירים, שעות פתיחה, אזורי שירות ופרטי קשר עלולים להשתנות — חובה לוודא ישירות מול בית העסק לפני קבלת החלטות.
• WellCome Dubai אינו אחראי לטעויות, השמטות, או נזק כלשהו שנגרם משימוש במידע.

4. צד שלישי
קישורים, מפות, מידע על מלונות/מסעדות/חברות תחבורה הם לצורכי נוחות בלבד. WellCome Dubai אינו אחראי לעסקאות, חוויות או שירותים שמספק כל גורם חיצוני.

5. שימוש מותר
שימוש באפליקציה מותר למטרות פרטיות בלבד. אסור להעתיק, להפיץ, או לעשות שימוש מסחרי בתכנים ללא אישור בכתב.

6. קניין רוחני
כל הזכויות שמורות. תמונות הספקים שייכות לבעליהן ומופיעות לצורך זיהוי בלבד.

7. שינויים בתקנון
WellCome Dubai רשאי לעדכן תנאים אלו בכל עת. המשך שימוש לאחר עדכון מהווה הסכמה לשינויים.

8. סמכות שיפוט
על תנאי שימוש אלה יחול הדין הישראלי. סמכות שיפוט בלעדית לבתי המשפט בתל אביב.`,
    bodyEn: `Last updated: May 2026

1. General
Use of the WellCome Dubai app (the "App") is subject to these terms of use. Downloading and using the App constitutes agreement to all of the clauses below.

2. Nature of the Service
The App provides tourist information about Dubai. The service is free, requires no registration, and does not collect personal data.

3. Liability and Limitations
• All information is provided "AS-IS", without any express or implied warranty.
• Prices, opening hours, service areas and contact details may change — you must verify directly with the business before making decisions.
• WellCome Dubai is not responsible for errors, omissions, or any damage arising from use of the information.

4. Third Parties
Links, maps, and information about hotels/restaurants/transport companies are provided for convenience only. WellCome Dubai is not responsible for transactions, experiences or services provided by any external party.

5. Permitted Use
Use of the App is permitted for private purposes only. Copying, distributing, or making commercial use of the content without written permission is prohibited.

6. Intellectual Property
All rights reserved. Provider images belong to their owners and appear for identification purposes only.

7. Changes to the Terms
WellCome Dubai may update these terms at any time. Continued use after an update constitutes agreement to the changes.

8. Governing Law
These terms are governed by Israeli law. Exclusive jurisdiction lies with the courts of Tel Aviv.`,
    bodyAr: `آخر تحديث: مايو 2026

1. عام
يخضع استخدام تطبيق WellCome Dubai ("التطبيق") لشروط الاستخدام هذه. يشكّل تنزيل التطبيق واستخدامه موافقة على جميع البنود أدناه.

2. طبيعة الخدمة
يقدّم التطبيق معلومات سياحية عن دبي. الخدمة مجانية، دون تسجيل، ودون جمع بيانات شخصية.

3. المسؤولية والقيود
• تُقدَّم جميع المعلومات "كما هي" دون أي ضمان صريح أو ضمني.
• قد تتغيّر الأسعار وساعات العمل ومناطق الخدمة وبيانات الاتصال — يجب التحقق مباشرةً من الجهة قبل اتخاذ القرارات.
• لا يتحمّل WellCome Dubai مسؤولية أي أخطاء أو سهو أو ضرر ناتج عن استخدام المعلومات.

4. أطراف ثالثة
الروابط والخرائط ومعلومات الفنادق/المطاعم/شركات النقل مقدَّمة للراحة فقط. لا يتحمّل WellCome Dubai مسؤولية أي معاملات أو تجارب أو خدمات يقدّمها أي طرف خارجي.

5. الاستخدام المسموح
يُسمح باستخدام التطبيق للأغراض الشخصية فقط. يُحظر نسخ المحتوى أو توزيعه أو استخدامه تجاريًا دون إذن كتابي.

6. الملكية الفكرية
جميع الحقوق محفوظة. صور المزوّدين ملك لأصحابها وتظهر لأغراض التعريف فقط.

7. تغييرات على الشروط
يجوز لـ WellCome Dubai تحديث هذه الشروط في أي وقت. يشكّل الاستمرار في الاستخدام بعد التحديث موافقة على التغييرات.

8. القانون الحاكم
تخضع هذه الشروط للقانون الإسرائيلي. الاختصاص القضائي الحصري لمحاكم تل أبيب.`,
    bodyHi: `अंतिम अद्यतन: मई 2026

1. सामान्य
WellCome Dubai ऐप ("ऐप") का उपयोग इन उपयोग की शर्तों के अधीन है। ऐप डाउनलोड और उपयोग करना नीचे दिए गए सभी खंडों की स्वीकृति है।

2. सेवा की प्रकृति
ऐप दुबई के बारे में पर्यटन जानकारी प्रदान करता है। सेवा निःशुल्क है, पंजीकरण की आवश्यकता नहीं, और व्यक्तिगत डेटा एकत्र नहीं करती।

3. दायित्व और सीमाएँ
• सभी जानकारी "जैसी है" के आधार पर दी जाती है, बिना किसी स्पष्ट या निहित वारंटी के।
• कीमतें, खुलने का समय, सेवा क्षेत्र और संपर्क विवरण बदल सकते हैं — निर्णय लेने से पहले सीधे व्यवसाय से पुष्टि करें।
• जानकारी के उपयोग से होने वाली त्रुटियों, चूक या किसी क्षति के लिए WellCome Dubai ज़िम्मेदार नहीं है।

4. तृतीय पक्ष
लिंक, नक़्शे और होटल/रेस्तरां/परिवहन कंपनियों की जानकारी केवल सुविधा के लिए है। किसी बाहरी पक्ष द्वारा प्रदान किए गए लेन-देन, अनुभव या सेवाओं के लिए WellCome Dubai ज़िम्मेदार नहीं है।

5. अनुमत उपयोग
ऐप का उपयोग केवल निजी उद्देश्यों के लिए अनुमत है। लिखित अनुमति के बिना सामग्री की नकल, वितरण या व्यावसायिक उपयोग निषिद्ध है।

6. बौद्धिक संपदा
सर्वाधिकार सुरक्षित। प्रदाता चित्र उनके मालिकों के हैं और केवल पहचान के लिए दिखाए जाते हैं।

7. शर्तों में परिवर्तन
WellCome Dubai किसी भी समय इन शर्तों को अद्यतन कर सकता है। अद्यतन के बाद निरंतर उपयोग परिवर्तनों की स्वीकृति है।

8. अधिकार क्षेत्र
ये शर्तें इज़राइली कानून के अधीन हैं। विशेष अधिकार क्षेत्र तेल अवीव की अदालतों में है।`,
    bodyRu: `Последнее обновление: май 2026

1. Общие положения
Использование приложения WellCome Dubai («Приложение») регулируется настоящими условиями. Загрузка и использование Приложения означает согласие со всеми пунктами ниже.

2. Характер услуги
Приложение предоставляет туристическую информацию о Дубае. Услуга бесплатна, не требует регистрации и не собирает персональные данные.

3. Ответственность и ограничения
• Вся информация предоставляется «как есть», без каких-либо явных или подразумеваемых гарантий.
• Цены, часы работы, зоны обслуживания и контактные данные могут меняться — перед принятием решений уточняйте напрямую у заведения.
• WellCome Dubai не несёт ответственности за ошибки, упущения или любой ущерб от использования информации.

4. Третьи стороны
Ссылки, карты и информация об отелях/ресторанах/транспортных компаниях предоставлены только для удобства. WellCome Dubai не отвечает за сделки, впечатления или услуги, предоставленные внешними сторонами.

5. Разрешённое использование
Использование Приложения разрешено только в личных целях. Копирование, распространение или коммерческое использование контента без письменного разрешения запрещено.

6. Интеллектуальная собственность
Все права защищены. Изображения поставщиков принадлежат их владельцам и показаны только для идентификации.

7. Изменения условий
WellCome Dubai может обновлять эти условия в любое время. Продолжение использования после обновления означает согласие с изменениями.

8. Применимое право
Настоящие условия регулируются израильским правом. Исключительная подсудность — суды Тель-Авива.`,
  },
  privacy: {
    title: 'מדיניות פרטיות', titleEn: 'Privacy Policy', color: '#5B9DC7',
    body: `עודכן לאחרונה: מאי 2026

איזה מידע אנחנו אוספים?
WellCome Dubai פועל ללא רישום משתמשים. לא נאספים שמות, אימיילים, מספרי טלפון או כל פרט מזהה.

נתוני מיקום (Geolocation)
כאשר תלחצו על "הראה לי מה קרוב אליי", המכשיר יבקש הרשאה לגישה למיקום. הנתון משמש אך ורק לחישוב מרחק לאטרקציות, ולא נשלח לשרת או נשמר בשום מקום.

אחסון מקומי
האפליקציה שומרת נתונים טכניים על המכשיר שלכם, ללא שליחה לשרת:
• שערי מטבע ומזג אוויר (זמני, להאצה)
• נתוני המאגר של ספקים (קטגוריות, מסלולים)
• דירוגים אישיים שהוספתם למסלולים

שירותי צד שלישי
• Google Maps — מציג מפות ונווטים. כפוף למדיניות הפרטיות של Google.
• Open-Meteo — שירות מזג אוויר חינמי, ללא איסוף נתונים.
• AeroDataBox / Booking — ספקי לוחות טיסות וזמינות מלונות.

זכויות המשתמש
• זכות עיון: כל הנתונים נשמרים מקומית במכשיר שלכם.
• זכות מחיקה: ניקוי נתוני האפליקציה ימחק הכל.
• זכות התנגדות: ניתן לסרב להרשאת מיקום ללא פגיעה ביכולת השימוש.`,
    bodyEn: `Last updated: May 2026

What Information Do We Collect?
WellCome Dubai operates without user registration. No names, emails, phone numbers or any identifying details are collected.

Location Data (Geolocation)
When you tap "Show me what's nearby", the device will request permission to access your location. This data is used solely to calculate distance to attractions, and is not sent to a server or stored anywhere.

Local Storage
The App stores technical data on your device, without sending it to a server:
• Currency rates and weather (temporary, for speed)
• Provider database (categories, routes)
• Personal ratings you added to itineraries

Third-Party Services
• Google Maps — displays maps and navigation. Subject to Google's privacy policy.
• Open-Meteo — a free weather service, no data collection.
• AeroDataBox / Booking — flight-board and hotel-availability providers.

Your Rights
• Right of access: all data is stored locally on your device.
• Right to erasure: clearing the App's data deletes everything.
• Right to object: you may decline the location permission without affecting usability.`,
    bodyAr: `آخر تحديث: مايو 2026

ما المعلومات التي نجمعها؟
يعمل WellCome Dubai دون تسجيل المستخدمين. لا تُجمع أسماء أو رسائل بريد إلكتروني أو أرقام هواتف أو أي بيانات تعريفية.

بيانات الموقع (Geolocation)
عند الضغط على "أظهر لي ما بالقرب مني"، سيطلب الجهاز إذن الوصول إلى موقعك. تُستخدم هذه البيانات فقط لحساب المسافة إلى المعالم، ولا تُرسل إلى خادم ولا تُخزَّن في أي مكان.

التخزين المحلي
يخزّن التطبيق بيانات تقنية على جهازك دون إرسالها إلى خادم:
• أسعار العملات والطقس (مؤقتة، لتسريع الأداء)
• قاعدة بيانات المزوّدين (الفئات، المسارات)
• التقييمات الشخصية التي أضفتها إلى المسارات

خدمات الطرف الثالث
• Google Maps — يعرض الخرائط والملاحة. يخضع لسياسة خصوصية Google.
• Open-Meteo — خدمة طقس مجانية، دون جمع بيانات.
• AeroDataBox / Booking — مزوّدو لوحات الرحلات وتوفّر الفنادق.

حقوق المستخدم
• حق الاطلاع: تُخزَّن جميع البيانات محليًا على جهازك.
• حق المحو: مسح بيانات التطبيق يحذف كل شيء.
• حق الاعتراض: يمكنك رفض إذن الموقع دون التأثير على إمكانية الاستخدام.`,
    bodyHi: `अंतिम अद्यतन: मई 2026

हम कौन-सी जानकारी एकत्र करते हैं?
WellCome Dubai उपयोगकर्ता पंजीकरण के बिना काम करता है। कोई नाम, ईमेल, फ़ोन नंबर या कोई पहचान संबंधी विवरण एकत्र नहीं किया जाता।

स्थान डेटा (Geolocation)
जब आप "मेरे पास क्या है दिखाएँ" पर टैप करते हैं, तो डिवाइस आपके स्थान तक पहुँच की अनुमति माँगेगा। इस डेटा का उपयोग केवल आकर्षणों की दूरी की गणना के लिए होता है, इसे किसी सर्वर पर नहीं भेजा जाता और कहीं संग्रहीत नहीं किया जाता।

स्थानीय संग्रहण
ऐप आपके डिवाइस पर तकनीकी डेटा संग्रहीत करता है, सर्वर पर भेजे बिना:
• मुद्रा दरें और मौसम (अस्थायी, गति के लिए)
• प्रदाता डेटाबेस (श्रेणियाँ, मार्ग)
• मार्गों में आपके द्वारा जोड़ी गई व्यक्तिगत रेटिंग

तृतीय-पक्ष सेवाएँ
• Google Maps — नक़्शे और नेविगेशन दिखाता है। Google की गोपनीयता नीति के अधीन।
• Open-Meteo — निःशुल्क मौसम सेवा, कोई डेटा संग्रह नहीं।
• AeroDataBox / Booking — फ़्लाइट बोर्ड और होटल उपलब्धता प्रदाता।

आपके अधिकार
• पहुँच का अधिकार: सभी डेटा आपके डिवाइस पर स्थानीय रूप से संग्रहीत है।
• मिटाने का अधिकार: ऐप का डेटा साफ़ करने से सब कुछ हट जाता है।
• आपत्ति का अधिकार: आप उपयोगिता को प्रभावित किए बिना स्थान अनुमति अस्वीकार कर सकते हैं।`,
    bodyRu: `Последнее обновление: май 2026

Какую информацию мы собираем?
WellCome Dubai работает без регистрации пользователей. Не собираются имена, адреса эл. почты, номера телефонов или любые идентифицирующие данные.

Данные о местоположении (Geolocation)
Когда вы нажимаете «Показать, что рядом», устройство запросит разрешение на доступ к местоположению. Эти данные используются только для расчёта расстояния до достопримечательностей и не отправляются на сервер и нигде не хранятся.

Локальное хранение
Приложение хранит технические данные на вашем устройстве, не отправляя их на сервер:
• Курсы валют и погода (временно, для скорости)
• База поставщиков (категории, маршруты)
• Личные оценки, добавленные вами к маршрутам

Сторонние сервисы
• Google Maps — отображает карты и навигацию. Регулируется политикой конфиденциальности Google.
• Open-Meteo — бесплатный сервис погоды, без сбора данных.
• AeroDataBox / Booking — поставщики табло рейсов и наличия отелей.

Ваши права
• Право доступа: все данные хранятся локально на вашем устройстве.
• Право на удаление: очистка данных приложения удаляет всё.
• Право на возражение: вы можете отклонить разрешение на местоположение без потери функциональности.`,
  },
};

const CONTACT_TOPICS = [
  { id: 'general',    label: 'כללי',           labelEn: 'General' },
  { id: 'error',      label: 'דיווח על שגיאה',  labelEn: 'Report an error' },
  { id: 'suggestion', label: 'הצעה',            labelEn: 'Suggestion' },
  { id: 'business',   label: 'שיתוף פעולה',     labelEn: 'Partnership' },
  { id: 'expert',     label: 'המלצה על מומחה',  labelEn: 'Recommend an expert' },
];

function ContactPage() {
  const { t, lang, isRTL } = useI18n();
  const s = makeStyles(isRTL);
  const topicLabel = (id: string) => t('topic.' + id);
  const { topic: topicParam } = useLocalSearchParams<{ topic?: string }>();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [topic, setTopic] = useState(topicParam || 'general');
  const [menuOpen, setMenuOpen] = useState(false);
  const [msg, setMsg] = useState('');
  const [file, setFile] = useState<{ name: string; size?: number } | null>(null);
  const current = CONTACT_TOPICS.find(t => t.id === topic) || CONTACT_TOPICS[0];
  const showDiploma = topic === 'expert';

  const pickFile = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({ type: ['image/*', 'application/pdf'], copyToCacheDirectory: true });
      if (res.canceled) return;
      const a = res.assets?.[0];
      if (a) setFile({ name: a.name, size: a.size });
    } catch {
      Alert.alert(t('loc.errTitle'), t('contact.fileErr'));
    }
  };

  const submit = () => {
    if (!name.trim() || !email.trim() || !msg.trim()) {
      Alert.alert(t('contact.missingTitle'), t('contact.missingMsg'));
      return;
    }
    const topicText = lang === 'he' ? current.label : (current.labelEn || current.label);
    let body = lang === 'he' ? `שם: ${name}\nאימייל: ${email}` : `Name: ${name}\nEmail: ${email}`;
    if (phone) body += lang === 'he' ? `\nטלפון: ${phone}` : `\nPhone: ${phone}`;
    body += lang === 'he' ? `\nנושא: ${topicText}\n\n${msg}` : `\nSubject: ${topicText}\n\n${msg}`;
    if (file) body += lang === 'he'
      ? `\n\nמצורף קובץ: ${file.name}${file.size ? ` (${Math.round(file.size / 1024)}KB)` : ''}\n(יש לצרף ידנית להודעה)`
      : `\n\nAttached file: ${file.name}${file.size ? ` (${Math.round(file.size / 1024)}KB)` : ''}\n(please attach manually to the message)`;
    const subject = lang === 'he' ? 'פנייה מהאפליקציה — ' + topicText : 'App inquiry — ' + topicText;
    Linking.openURL(`mailto:contact@wellcomedubai.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  return (
    <View style={s.container}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#B8923A' }} />
      <View style={[s.header, { backgroundColor: '#B8923A' }]}>
        <Text style={[s.title, { flex: 1 }]}>{t('info.contact')}</Text>
        <TouchableOpacity onPress={() => { if (router.canGoBack()) router.back(); else router.replace('/(tabs)/'); }} style={s.headerClose}>
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>✕</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 100, gap: 12 }} keyboardShouldPersistTaps="handled">
        <Text style={s.fieldLabel}>{t('contact.fullName')}</Text>
        <TextInput style={s.input} value={name} onChangeText={setName} placeholder={t('contact.phName')} placeholderTextColor="#AAB7BD" />

        <Text style={s.fieldLabel}>{t('contact.email')}</Text>
        <TextInput style={s.input} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholder="name@example.com" placeholderTextColor="#AAB7BD" />

        <Text style={s.fieldLabel}>{t('contact.phone')}</Text>
        <TextInput style={s.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="050-1234567" placeholderTextColor="#AAB7BD" />

        <Text style={s.fieldLabel}>{t('contact.topic')}</Text>
        <TouchableOpacity style={s.dropdown} onPress={() => setMenuOpen(true)}>
          <Text style={s.dropdownTxt}>{topicLabel(current.id)}</Text>
          <Text style={s.dropdownArrow}>▼</Text>
        </TouchableOpacity>

        <Text style={s.fieldLabel}>{t('contact.message')}</Text>
        <TextInput style={[s.input, { height: 140, textAlignVertical: 'top' }]} value={msg} onChangeText={setMsg} multiline placeholder={t('contact.phMsg')} placeholderTextColor="#AAB7BD" />

        {showDiploma ? (
          <>
            <Text style={s.fieldLabel}>{t('contact.diploma')}</Text>
            <TouchableOpacity style={s.uploadBtn} onPress={pickFile}>
              <Text style={s.uploadTxt}>📎 {file ? t('contact.replaceFile') : t('contact.addFile')}</Text>
            </TouchableOpacity>
            {file ? (
              <View style={s.fileChip}>
                <TouchableOpacity onPress={() => setFile(null)}><Text style={s.fileRemove}>✕</Text></TouchableOpacity>
                <Text style={s.fileTxt} numberOfLines={1}>📄 {file.name}</Text>
              </View>
            ) : null}
          </>
        ) : null}

        <TouchableOpacity onPress={submit} style={s.submitBtn}>
          <Text style={s.submitTxt}>{t('contact.send')}</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={menuOpen} transparent animationType="fade" onRequestClose={() => setMenuOpen(false)}>
        <View style={s.menuBackdrop}>
          <Pressable onPress={() => setMenuOpen(false)} style={StyleSheet.absoluteFill} />
          <View style={s.menu}>
            <Text style={s.menuTitle}>{t('contact.pickTopic')}</Text>
            {CONTACT_TOPICS.map(top => (
              <TouchableOpacity key={top.id} onPress={() => { setTopic(top.id); setMenuOpen(false); }} style={[s.menuItem, topic === top.id && s.menuItemActive]}>
                <Text style={[s.menuTxt, topic === top.id && s.menuTxtActive]}>{topicLabel(top.id)}</Text>
                {topic === top.id && <Text style={s.menuCheck}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
}

export default function InfoSubPage() {
  const { t, lang, isRTL } = useI18n();
  const s = makeStyles(isRTL);
  const { id } = useLocalSearchParams<{ id: string }>();
  if (id === 'contact') return <ContactPage />;
  const sec = SECTIONS[id || ''];
  if (!sec) {
    return (
      <View style={s.container}>
        <SafeAreaView edges={['top']} style={{ backgroundColor: '#000' }} />
        <Text style={{ padding: 20, color: Colors.TEXT }}>{t('common.notFound')}</Text>
      </View>
    );
  }
  return (
    <View style={s.container}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: sec.color }} />
      <View style={[s.header, { backgroundColor: sec.color }]}>
        <Text style={[s.title, { flex: 1 }]}>{t('info.' + (id || ''))}</Text>
        <TouchableOpacity onPress={() => { if (router.canGoBack()) router.back(); else router.replace('/(tabs)/'); }} style={s.headerClose}>
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>✕</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        <View style={s.bodyCard}>
          <Text style={[s.body, { writingDirection: (lang === 'he' || lang === 'ar') ? 'rtl' : 'ltr', textAlign: (lang === 'he' || lang === 'ar') ? 'right' : 'left' }]}>{({ he: sec.body, en: sec.bodyEn, ar: sec.bodyAr, hi: sec.bodyHi, ru: sec.bodyRu } as any)[lang] || sec.bodyEn}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const makeStyles = (isRTL: boolean) => StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.BG },
  header: { paddingHorizontal: 16, paddingVertical: 16, flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', gap: 10 },
  closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center' },
  brandBar: { flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  brandTxt: { flex: 1, fontSize: 22, fontWeight: '900', letterSpacing: -0.3, textAlign: 'center' },
  brandClose: { width: 32, alignItems: 'center' },
  title: { color: '#fff', fontSize: 24, fontWeight: '400', letterSpacing: 0.3, writingDirection: isRTL ? 'rtl' : 'ltr', textAlign: isRTL ? 'right' : 'left' },
  bodyCard: { backgroundColor: '#fff', borderRadius: 0, paddingVertical: 18, paddingHorizontal: 16 },
  body: { color: Colors.TEXT, fontSize: 15, lineHeight: 26, writingDirection: isRTL ? 'rtl' : 'ltr', textAlign: isRTL ? 'right' : 'left' },
  fieldLabel: { color: Colors.TEXT, fontSize: 14, fontWeight: '600', writingDirection: isRTL ? 'rtl' : 'ltr', textAlign: isRTL ? 'right' : 'left' },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#EAE0CE', borderRadius: 0, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: Colors.TEXT, writingDirection: isRTL ? 'rtl' : 'ltr', textAlign: isRTL ? 'right' : 'left' },
  topicChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 0, backgroundColor: '#fff', borderWidth: 1, borderColor: '#EAE0CE' },
  topicChipOn: { backgroundColor: '#B8923A', borderColor: '#B8923A' },
  topicChipTxt: { color: Colors.TEXT, fontSize: 13, fontWeight: '500' },
  topicChipTxtOn: { color: '#fff' },
  submitBtn: { backgroundColor: Colors.PRIMARY, paddingVertical: 16, borderRadius: 0, alignItems: 'center', marginTop: 10 },
  submitTxt: { color: '#fff', fontSize: 16, fontWeight: '600', letterSpacing: 0.2 },
  headerClose: { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center' },
  dropdown: { flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 13, borderRadius: 0, backgroundColor: '#fff', borderWidth: 1, borderColor: '#EAE0CE' },
  dropdownTxt: { flex: 1, color: '#2C5F6E', fontSize: 15, fontWeight: '500', writingDirection: isRTL ? 'rtl' : 'ltr', textAlign: isRTL ? 'right' : 'left' },
  dropdownArrow: { color: '#B8923A', fontSize: 14, fontWeight: '700', marginLeft: 4 },
  uploadBtn: { backgroundColor: '#E8F2F7', borderWidth: 1, borderColor: '#B6D2DE', borderStyle: 'dashed', borderRadius: 0, paddingVertical: 14, alignItems: 'center' },
  uploadTxt: { color: Colors.PRIMARY, fontWeight: '600', fontSize: 14 },
  fileChip: { flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', gap: 8, padding: 12, backgroundColor: '#FAF6EE', borderRadius: 0, borderWidth: 1, borderColor: '#EAE0CE' },
  fileTxt: { flex: 1, color: '#2C5F6E', fontSize: 13, fontWeight: '500', writingDirection: isRTL ? 'rtl' : 'ltr', textAlign: isRTL ? 'right' : 'left' },
  fileRemove: { color: '#E76F51', fontSize: 14, fontWeight: '700', paddingHorizontal: 6 },
  menuBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', padding: 22 },
  menu: { width: '100%', maxWidth: 360, backgroundColor: '#fff', borderRadius: 0, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 14, shadowOffset: { width: 0, height: 8 } },
  menuTitle: { color: '#fff', backgroundColor: '#B8923A', fontSize: 16, fontWeight: '600', letterSpacing: 0.2, padding: 16, textAlign: 'center' },
  menuItem: { flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#EAE0CE' },
  menuItemActive: { backgroundColor: '#FAF3DE' },
  menuTxt: { flex: 1, color: '#2C5F6E', fontSize: 18, fontWeight: '500', letterSpacing: 0.2, writingDirection: isRTL ? 'rtl' : 'ltr', textAlign: isRTL ? 'right' : 'left' },
  menuTxtActive: { color: '#B8923A', fontWeight: '600' },
  menuCheck: { color: '#B8923A', fontSize: 16, fontWeight: '600' },
});
