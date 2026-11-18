# رفع Skill2Work على GitHub Pages

هذه النسخة تحتوي على إعداد نشر تلقائي جاهز. رفع الملفات وحده لا يعني أن الموقع نُشر؛ يجب تفعيل Pages وانتظار نجاح GitHub Actions.

## طريقة الرفع

١. أنشئ Repository باسم `skill2work` على GitHub، أو استخدم مستودعًا موجودًا. لحساب GitHub Free اختر Public لاستخدام Pages. الكود والبيانات هنا تجريبية فقط.
٢. ارفع **محتويات** مجلد `skill2work-angular` إلى جذر المستودع، بحيث يظهر `package.json` بجوار `.github` و`src`، وليس داخل مجلد إضافي. لا ترفع ملف ZIP نفسه أو `node_modules`.
٣. من المستودع افتح **Settings → Pages → Build and deployment → Source → GitHub Actions**.
٤. افتح **Actions → Deploy Skill2Work to GitHub Pages → Run workflow**، أو ادفع Commit إلى `main`/`master`.
٥. بعد نجاح build وdeploy، افتح الرابط الظاهر في عملية النشر أو في Settings → Pages.

اسم المستودع المعتمد لهذه النسخة هو `skill2work`. ملف النشر يأخذ مسار المستودع تلقائيًا من GitHub، ولا تحتاج تعديل الكود إذا غيّرت اسم المستودع. يدعم أيضًا مسار الموقع الجذري الذي تعيده إعدادات Pages.

## باستخدام Git على جهازك

افتح Terminal داخل مجلد المشروع، ثم بعد إنشاء المستودع على GitHub:

```powershell
git init
git add .
git commit -m "Add Skill2Work Angular frontend and Pages deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/skill2work.git
git push -u origin main
```

استبدل `YOUR_USERNAME` باسم حسابك، ثم نفّذ إعداد Pages في الخطوة الثالثة. إذا كان المشروع داخل مستودع موجود بالفعل، استخدم المستودع القائم ولا تنفّذ `git init` أو إضافة remote جديد عشوائيًا.

## ما الذي تم تعديله؟

- Workflow في `.github/workflows/deploy-pages.yml` يثبت الاعتماديات، يختبر المنطق، يبني Angular، يختبر نسخة Pages عبر DOM، ثم ينشر الناتج.
- الأمر `npm run build:pages` يضبط `base href` ويفعّل Hash Routing في **نسخة Pages فقط**. الرابط سيكون مثل `https://YOUR_USERNAME.github.io/skill2work/#/candidate/assessments`؛ تحديث الصفحة لا يطلب مسار Angular من خادم Pages.
- مسارات اللوجو والأيقونات أصبحت نسبية وتعمل تحت اسم المستودع.
- التشغيل المحلي المعتاد `npm start` ما زال يستخدم الروابط النظيفة مثل `/candidate/assessments`.

اختبار بناء يدوي لمسار مختلف:

```powershell
npm install
npm run build:pages -- /YOUR_REPOSITORY/
npm run test:pages
```

لا توجد أسرار أو مفاتيح تحتاج إضافتها. يستخدم Workflow صلاحيات GitHub الافتراضية المخصصة للنشر. عند وجود حماية لفروع/بيئة النشر، قد تحتاج الموافقة من إعدادات حسابك.

بيانات الديمو تُحفظ لكل متصفح على أصل الموقع. مستخدمو GitHub Pages لا يشتركون في قاعدة بيانات حقيقية. الحسابات وكلمة المرور نفسها موجودة في `DEMO_ACCOUNTS.md`، والتقييم محاكاة معلنة.

تم تجهيز البناء واختبارات DOM محليًا. النشر الحقيقي على حسابك لا يمكن تأكيده إلا بعد ربط GitHub وتشغيل Workflow بنجاح. قيود اختبار المتصفح السابق موضحة في `TEST_REPORT.md`.

المراجع الرسمية: https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages و https://angular.dev/tools/cli/deployment
