# INNOTEK INVEST — korporativ sayt

Loyihalash, qurilish-montaj va muhandislik xizmatlari ko'rsatuvchi kompaniya uchun to'liq ishlaydigan veb-sayt: bosh sahifa, xizmatlar katalogi, loyihalar (portfolio) galereyasi, narx kalkulyatori, blog, savol-javob, vakansiyalar va aloqa formasi — barchasi **o'zbek, rus va ingliz** tillarida. Saytda **admin panel** bor: kirib, barcha matn va rasmlarni (matnlarni) o'zingiz o'zgartira olasiz, hech qanday dasturchisiz.

## Muhim: bu oddiy Node.js ilovasi — `npm install` shart emas

Sayt hech qanday tashqi kutubxonasiz (`npm install`siz) ishlaydi — faqat Node.js ning o'zida mavjud vositalardan foydalanilgan. Bu shuni anglatadiki, uni istalgan serverga ko'chirib, bitta buyruq bilan ishga tushirish mumkin.

## Kompyuteringizda ishga tushirish

1. [Node.js](https://nodejs.org) ning 18-versiyasi yoki undan yangisi o'rnatilgan bo'lishi kerak.
2. Terminalda ushbu papkaga o'ting va quyidagi buyruqni bering:

   ```
   node server.js
   ```

3. Brauzerda oching: **http://localhost:3000**
4. Admin panel: **http://localhost:3000/admin/login**

## Admin panelga kirish

- Manzil: `/admin/login`
- Boshlang'ich parol: **`Innotek2026!`**

**Birinchi ishdan so'ng darhol parolni almashtiring**: Admin panel → *Sozlamalar* → "Admin parolini o'zgartirish".

Admin panelda quyidagilarni boshqarasiz:
- **Xizmatlar** — kartochkalar, narxlar, tavsiflar (3 tilda)
- **Loyihalar** — bajarilgan ishlar galereyasi
- **Blog** — maqolalar
- **Savol-javob (FAQ)**
- **Vakansiyalar** — bo'sh ish o'rinlari va tushgan arizalar
- **Murojaatlar** — aloqa formasidan, kalkulyatordan va vakansiya arizalaridan kelgan barcha xabarlar
- **Sozlamalar** — telefon, email, manzil, Telegram/Instagram havolalari, bosh sahifadagi statistika va admin paroli

Har bir matn maydonida **UZ / RU / EN** yorliqlari orqali uch tilni alohida kiritasiz.

## Ma'lumotlar qayerda saqlanadi

Barcha kontent va murojaatlar `data/db.json` faylida saqlanadi (oddiy JSON — maxsus dastur kerak emas). Serverga joylashtirganda **shu faylni muntazam zaxira nusxalab turing** (backup). Agar kelajakda trafik ancha oshsa, buni haqiqiy ma'lumotlar bazasiga (PostgreSQL, MySQL) ko'chirish mumkin — tuzilma buning uchun tayyor.

## Hozircha placeholder bo'lgan narsalar

- **Rasmlar**: hozircha loyihalar, xizmatlar va blog kartochkalarida haqiqiy fotosurat o'rniga ikonka/gradient qo'yilgan (menda kompaniyangizning haqiqiy suratlari yo'q edi). Haqiqiy fotosuratlaringizni `public/images/` papkasiga qo'shib, tegishli sahifalardagi `.card-media` bloklariga ulash mumkin — buni keyingi bosqichda birga qilishimiz mumkin.
- **Mijozlar/hamkorlar ro'yxati** (bosh sahifadagi "Bizga ishonishadi" bo'limi) — namunaviy nomlar bilan to'ldirilgan, haqiqiy hamkorlaringiz nomiga almashtirish kerak (hozircha admin panelda tahrirlash imkoniyati yo'q — `data/db.json` dagi `clients` massivini qo'lda tahrirlash orqali o'zgartirish mumkin).
- **Kalkulyator narxlari** (`public/script.js` faylidagi `BASE_RATE`/`EXTRA_RATE`) — taxminiy raqamlar, haqiqiy narxlaringizga moslab sozlash tavsiya etiladi.
- **Statistika** (180+ loyiha, 9 yil tajriba va h.k.) — Admin panel → Sozlamalar orqali osongina o'zgartiriladi.

## Internetga joylashtirish (domen + hosting)

Domen va hosting hali yo'qligini aytgan edingiz — quyidagilar tavsiya:

1. **Oddiy VPS** (masalan, Timeweb, Beget, DigitalOcean, Hetzner): Node.js o'rnatilgan serverga shu papkani yuklaysiz, `node server.js` bilan ishga tushirasiz. Doimiy ishlab turishi uchun `pm2` yoki `systemd` xizmatidan foydalanish tavsiya etiladi. Domenni ulash uchun oldida `nginx` reverse-proxy sifatida ishlaydi (va bepul SSL uchun Let's Encrypt/Certbot).
2. **Node.js qo'llab-quvvatlaydigan platformalar** (Render, Railway va shunga o'xshash xizmatlar): repo yuklab, `node server.js` ni start buyrug'i sifatida ko'rsatasiz. `PORT` muhit o'zgaruvchisi avtomatik o'qiladi.

Domen va hostingni tanlaganingizdan so'ng, ulash bo'yicha qadam-baqadam yordam berishga tayyorman.

## Loyihaning tuzilishi

```
server.js            — asosiy server va marshrutlash (routing)
lib/                  — umumiy funksiyalar (baza, tillar, autentifikatsiya, HTML shablonlar)
routes/               — har bir sahifa uchun HTML generatorlar
routes/admin/         — admin panel sahifalari va CRUD amallari
public/               — CSS, JS va rasmlar (statik fayllar)
data/db.json          — barcha kontent va murojaatlar (ma'lumotlar bazasi o'rnida)
```
