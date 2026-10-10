(() => {
  const toggle = document.querySelector('.menu-toggle');
  const panel = document.querySelector('.mobile-panel');
  const backTop = document.querySelector('.back-top');
  const header = document.querySelector('.site-header');

  if (toggle && panel) {
    toggle.addEventListener('click', () => {
      const open = panel.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });

    panel.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        panel.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  const updateScrollState = () => {
    const scrolled = window.scrollY > 45;
    if (header) header.classList.toggle('is-scrolled', scrolled);
    if (backTop) backTop.classList.toggle('visible', window.scrollY > 500);
  };

  window.addEventListener('scroll', updateScrollState, { passive: true });
  updateScrollState();

  if (backTop) {
    backTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
})();

/* Massage photography gallery: horizontal slider + accessible lightbox */
(() => {
 const tracks=document.querySelectorAll('.massage-gallery-track');
 tracks.forEach(track=>{
  const section=track.closest('.massage-gallery-section');
  section?.querySelector('.gallery-prev')?.addEventListener('click',()=>track.scrollBy({left:track.scrollWidth/Math.max(track.children.length,1)*-2,behavior:'smooth'}));
  section?.querySelector('.gallery-next')?.addEventListener('click',()=>track.scrollBy({left:track.scrollWidth/Math.max(track.children.length,1)*2,behavior:'smooth'}));
 });
 let lightbox=document.querySelector('.massage-lightbox');
 if(!lightbox){lightbox=document.createElement('div');lightbox.className='massage-lightbox';lightbox.setAttribute('role','dialog');lightbox.setAttribute('aria-modal','true');lightbox.setAttribute('aria-label','نمایش تصویر');lightbox.innerHTML='<button type="button" class="massage-lightbox-close" aria-label="بستن تصویر">×</button><button type="button" class="massage-lightbox-backdrop" aria-label="بستن تصویر"></button><figure><img alt=""><figcaption></figcaption></figure>';document.body.appendChild(lightbox);}
 const img=lightbox.querySelector('img'),caption=lightbox.querySelector('figcaption'),figure=lightbox.querySelector('figure');
 let panel=lightbox.querySelector('.knowledge-detail-panel');
 if(!panel){panel=document.createElement('div');panel.className='knowledge-detail-panel';panel.innerHTML='<span class="knowledge-detail-kicker">راهنمای سبک ماساژ</span><h2></h2><p class="knowledge-detail-description"></p><p class="knowledge-detail-extra"></p><div class="knowledge-detail-foot">پیش از شروع جلسه، هدف، شدت مطلوب، حساسیت‌ها و وضعیت سلامت خود را با ماسور در میان بگذارید.</div>';figure.appendChild(panel);}
 const close=()=>{lightbox.classList.remove('open','is-knowledge');document.body.classList.remove('lightbox-open');img.src='';};
 document.querySelectorAll('.massage-photo-card,.knowledge-image-button').forEach(card=>card.addEventListener('click',()=>{
   img.src=card.dataset.lightboxSrc||card.querySelector('img')?.src||'';img.alt=card.dataset.lightboxAlt||card.querySelector('img')?.alt||'';
   const isKnowledge=card.classList.contains('knowledge-image-button');
   lightbox.classList.toggle('is-knowledge',isKnowledge);
   if(isKnowledge){
     const article=card.closest('.knowledge-card'),title=article?.querySelector('h3')?.textContent?.trim()||img.alt,desc=article?.querySelector('p')?.textContent?.trim()||'';
     const section=article?.closest('.knowledge-category'),category=section?.querySelector('.knowledge-category-head h2')?.textContent?.trim()||'بانک دانش ماساژ';
     panel.querySelector('h2').textContent=title;panel.querySelector('.knowledge-detail-kicker').textContent=category;panel.querySelector('.knowledge-detail-description').textContent=desc;
     const context=section?.querySelector('.knowledge-category-head p')?.textContent?.trim()||'';
     const details={
       'ماساژ سوئدی':'این سبک معمولاً با حرکات بلند و روان، ورز دادن ملایم، اصطکاک و ضربه‌های ریتمیک شناخته می‌شود. برای جلسه نخست، فشار سبک تا متوسط و گفت‌وگوی پیوسته درباره راحتی فرد انتخاب مناسبی است.',
       'ماساژ بافت عمیق':'در این روش، ماسور با حرکت آهسته‌تر و فشار کنترل‌شده روی لایه‌های عمیق‌تر بافت نرم کار می‌کند. فشار بیشتر لزوماً نتیجه بهتر نمی‌دهد؛ درد تیز، گزگز یا کبودی نشانه‌ای برای توقف و ارزیابی دوباره است.',
       'ماساژ آروماتراپی':'روغن‌های حامل و رایحه‌های معطر می‌توانند بخشی از تجربه حسی جلسه باشند. روغن اسانسی نباید بدون رقیق‌سازی مناسب روی پوست استفاده شود و سابقه آلرژی، آسم یا حساسیت به بو باید از قبل مطرح شود.',
       'ماساژ ریلکسی':'تمرکز این جلسه بر ریتم آرام، لمس راحت، محیط کم‌تنش و فرصت استراحت است. نور، دما، موسیقی، پوشش و فشار باید مطابق ترجیح مراجعه‌کننده تنظیم شوند.',
       'ماساژ سر، گردن و شانه':'این جلسه بر نواحی‌ای تمرکز دارد که در کار روزمره و استفاده طولانی از نمایشگرها خسته می‌شوند. فشار مستقیم روی جلوی گردن یا نقاط دردناک و آسیب‌دیده مناسب نیست و درد تازه یا همراه با علائم عصبی نیاز به ارزیابی سلامت دارد.',
       'ماساژ صندلی':'ماساژ صندلی معمولاً کوتاه، با لباس و در وضعیت نشسته انجام می‌شود و می‌تواند برای محیط کار یا رویدادها مناسب باشد. پیش از شروع باید وضعیت صندلی، حریم شخصی و نواحی موردنظر مشخص شود.',
       'ماساژ تایلندی':'در این سنت، فشارهای ریتمیک با کشش‌های کمکی و تغییر وضعیت بدن ترکیب می‌شوند و بسیاری از شکل‌های آن روی تشک انجام می‌گیرد. دامنه کشش باید با توان حرکتی فرد هماهنگ باشد و از حرکت اجباری مفاصل پرهیز شود.',
       'شیاتسو':'شیاتسو رویکردی ژاپنی است که در آن از فشارهای ثابت یا ریتمیک انگشت، کف دست و گاهی آرنج استفاده می‌شود. شدت فشار و محل کار بر اساس مکتب آموزشی و بازخورد فرد تنظیم می‌شود؛ فشار نباید باعث بی‌حسی یا درد تیز شود.',
       'توینا (Tui Na)':'توینا بخشی از سنت ماساژ دستی چین است و می‌تواند شامل فشردن، غلتاندن، مالش و حرکت‌های مفصلی باشد. روش‌های اجرایی میان مراکز آموزشی تفاوت دارند و ادعاهای درمانی آن باید جداگانه و با توجه به شواهد بررسی شوند.',
       'آبهایانگا':'آبهایانگا در سنت آیورودا با استفاده از روغن و حرکات یکنواخت و منظم شناخته می‌شود. انتخاب روغن، دمای محیط و شدت مالش باید با نوع پوست، حساسیت‌ها و ترجیح فرد هماهنگ باشد.',
       'ماساژ بالیایی':'ماساژ بالیایی معمولاً ترکیبی از حرکات بلند، ورز دادن، فشار و استفاده از روغن است. جلسه خوب با پرسش درباره فشار مطلوب و حساسیت‌های پوستی شروع می‌شود و نباید صرفاً بر اساس یک الگوی ثابت اجرا شود.',
       'لومی‌لومی':'لومی‌لومی سنتی هاوایی است که با حرکات پیوسته و گسترده دست یا ساعد شناخته می‌شود. شناخت زمینه فرهنگی و احترام به مرزهای شخصی در معرفی این روش اهمیت دارد و سبک اجرا در مدرسه‌های مختلف یکسان نیست.',
       'حمام سنتی و دلاکی':'در تجربه تاریخی حمام ایرانی، شست‌وشو، کیسه‌کشی و مالش بدن در کنار نظافت و مراقبت بدنی قرار داشته است. شدت کیسه‌کشی باید متناسب با پوست باشد؛ روی زخم، التهاب، عفونت یا پوست بسیار حساس نباید انجام شود.',
       'روغن‌مالی و مالش سنتی':'روغن‌مالی در سنت‌های مراقبتی گوناگون برای نرم‌کردن پوست و ایجاد حس آرامش به کار رفته است. ترکیب و منشأ روغن باید مشخص باشد و پیش از استفاده گسترده، سازگاری پوست در ناحیه کوچکی بررسی شود.',
       'شیوه‌های محلی و منطقه‌ای':'این عنوان برای گردآوری روایت‌های محلی، ابزارها، واژگان و آیین‌های مراقبت بدن در مناطق ایران و پیرامون آن در نظر گرفته شده است. ثبت دقیق منطقه، دوره تاریخی و تفاوت روایت شفاهی با سند مکتوب، ارزش دانش‌نامه را افزایش می‌دهد.',
       'ماساژ ورزشی':'ماساژ ورزشی ممکن است در برنامه آماده‌سازی، فاصله مسابقه یا بازیابی پس از تمرین جای بگیرد و هدف هر مرحله متفاوت است. در آسیب حاد، تورم نامشخص یا درد ناگهانی، ماساژ جایگزین ارزیابی پزشکی یا فیزیوتراپی نیست.',
       'آزادسازی میوفاشیال':'این اصطلاح به مجموعه‌ای از تکنیک‌های دستی با تمرکز بر بافت‌های همبند اشاره دارد. فشار و مدت کار باید تدریجی باشد و درباره میزان اثربخشی، تفاوت روش‌ها و نوع مشکل موردنظر باید واقع‌بینانه صحبت کرد.',
       'ماساژ دوران بارداری':'این نوع ماساژ به آموزش ویژه، وضعیت‌گیری مناسب و توجه به مرحله بارداری نیاز دارد. در بارداری پرخطر، علائم هشدار، سابقه لخته یا نگرانی پزشکی، ابتدا باید نظر متخصص مراقبت بارداری گرفته شود.',
       'ماساژ سنگ داغ':'سنگ‌های گرم به‌عنوان عنصر گرما در جلسه استفاده می‌شوند و دمای آن‌ها باید دقیق و پیوسته کنترل شود. اختلال حس، مشکلات گردش خون، آسیب پوستی و ناتوانی در اعلام ناراحتی می‌توانند استفاده از گرما را نامناسب کنند.',
       'ماساژ بامبو و ابزار چوبی':'ابزارهای صاف و بهداشتی می‌توانند برای پخش فشار روی سطح بافت استفاده شوند. کنترل لبه‌ها، فشار، پاک‌سازی ابزار و پرهیز از استخوان‌های برجسته یا نواحی آسیب‌دیده ضروری است.',
       'آب‌درمانی و تجربه اسپا':'آب، بخار و گرما در تجربه‌های تندرستی به کار می‌روند، اما هرکدام محدودیت‌های خود را دارند. دمای بالا و تغییر ناگهانی دما برای بعضی افراد، به‌ویژه در برخی بیماری‌های قلبی یا دوران بارداری، نیازمند احتیاط است.',
       'اخلاق و ارتباط با مراجعه‌کننده':'جلسه حرفه‌ای بر رضایت آگاهانه، توضیح روند، حفظ حریم خصوصی و امکان توقف در هر لحظه استوار است. پوشش، محدوده لمس و هر تغییر در برنامه باید با رضایت روشن فرد انجام شود.',
       'آناتومی کاربردی':'شناخت عضلات، مفاصل، مسیرهای عصبی و نواحی پرخطر به انتخاب ایمن‌تر تکنیک کمک می‌کند. دانش آناتومی باید با تمرین تحت نظارت همراه باشد و ماسور نباید از آن برای تشخیص بیماری خارج از صلاحیت خود استفاده کند.',
       'شرح حال و برنامه‌ریزی جلسه':'پرسش درباره هدف جلسه، وضعیت سلامت، داروها، حساسیت‌ها، جراحی اخیر و فشار مطلوب باید پیش از شروع انجام شود. در پایان نیز گرفتن بازخورد کوتاه کمک می‌کند جلسه بعدی دقیق‌تر و مسئولانه‌تر طراحی شود.',
       'فشار مناسب و بازخورد':'فشار مناسب بر اساس رضایت و احساس فرد تعیین می‌شود، نه تحمل درد. ماسور باید مرتب درباره راحتی سؤال کند و در صورت بی‌حسی، سرگیجه، درد تیز یا ناراحتی فزاینده کار را متوقف کند.',
       'بهداشت محیط و تجهیزات':'ملحفه و حوله تمیز، ضدعفونی سطوح، شست‌وشوی دست‌ها و نگهداری صحیح روغن‌ها پایه‌های ایمنی هستند. ابزار چندبارمصرف باید طبق دستورالعمل سازنده پاک‌سازی شود و وسایل آلوده بین مراجعه‌کنندگان استفاده نشوند.',
       'شواهد و ادعاهای درمانی':'آرامش گزارش‌شده پس از ماساژ با اثبات درمان یک بیماری یکسان نیست. معرفی مسئولانه باید میان تجربه فردی، شواهد پژوهشی و تبلیغات تفاوت بگذارد و از وعده درمان قطعی پرهیز کند.',
       'انتخاب دوره آموزشی':'دوره مناسب باید سرفصل روشن، آموزش آناتومی و ایمنی، تمرین عملی تحت نظارت و شیوه ارزیابی مهارت داشته باشد. پیش از ثبت‌نام، درباره صلاحیت مدرس، حدود مدرک و فرصت تمرین پرس‌وجو کنید.',
       'ارگونومی ماسور':'ارتفاع مناسب تخت، استفاده از وزن بدن به جای فشار ممتد انگشتان، جابه‌جایی متعادل و استراحت بین جلسات به سلامت شغلی کمک می‌کند. درد مداوم دست، شانه یا کمر نباید نادیده گرفته شود.',
       'اصطلاحات و تکنیک‌ها':'واژه‌نامه باید اصطلاح فارسی، معادل انگلیسی، تعریف کوتاه و کاربرد رایج هر تکنیک را کنار هم قرار دهد. اصطلاح‌هایی مانند افلوراژ، پتریساژ، فریکشن و پرکاشن ممکن است در منابع آموزشی با تفاوت‌های جزئی توضیح داده شوند.'
     };
     panel.querySelector('.knowledge-detail-extra').textContent=(details[title]||context+' این معرفی برای شناخت عمومی است؛ اجرای عملی هر روش به آموزش مناسب، رعایت ایمنی و تنظیم فشار بر اساس بازخورد مراجعه‌کننده نیاز دارد.')+' '+context;
     panel.hidden=false;caption.textContent='';
   }else{panel.hidden=true;caption.textContent=img.alt;}
   lightbox.classList.add('open');document.body.classList.add('lightbox-open');lightbox.querySelector('.massage-lightbox-close').focus();
 }));
 document.querySelectorAll('.knowledge-card-copy').forEach(copy=>{copy.style.cursor='pointer';copy.addEventListener('click',()=>copy.closest('.knowledge-card')?.querySelector('.knowledge-image-button')?.click());});
 lightbox.querySelectorAll('.massage-lightbox-close,.massage-lightbox-backdrop').forEach(b=>b.addEventListener('click',close));
 document.addEventListener('keydown',e=>{if(e.key==='Escape')close();});
})();
