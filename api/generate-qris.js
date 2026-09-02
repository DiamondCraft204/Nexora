// api/generate-qris.js
// Endpoint ini ditaruh di project Vercel "nexora-api-one" milikmu,
// sehingga bisa diakses di: https://nexora-api-one.vercel.app/api/generate-qris
//
// Cara pasang di project Vercel-mu:
//   1. Taruh file ini di folder /api/generate-qris.js pada root project
//   2. Pastikan produk.json (yang sudah dibungkus jadi { produk, qris })
//      tetap bisa diakses di https://nexora-api-one.vercel.app/produk.json
//   3. Jalankan: npm install qrcode
//   4. Deploy ulang (git push / vercel --prod)
//
// ---------------------------------------------------------------------------
// PERUBAHAN DIBANDING VERSI SEBELUMNYA
// ---------------------------------------------------------------------------
// Dulu isi kode QR selalu disusun di server ("NEXORA-QRIS-DEMO|REF:...|AMOUNT:...")
// sehingga saat dipindai HP tidak terjadi apa-apa. Sekarang frontend mengirim
// field "isi" berupa TAUTAN halaman konfirmasi pembayaran
// (html/konfirmasi-bayar.html?d=...) dan endpoint ini menggambarnya jadi QR.
// Hasilnya: QR dipindai -> HP langsung membuka halaman rincian belanja
// + tombol "Pembayaran Selesai".
//
// Field "isi" bersifat OPSIONAL. Kalau tidak dikirim, endpoint kembali memakai
// format demo lama, jadi frontend versi lama tetap bisa memakai endpoint ini.
//
// Catatan penting:
// Endpoint ini masih SIMULASI — dia hanya menggambar QR dari teks yang dikirim
// frontend, dengan data merchant diambil dari produk.json. Uang belum benar-benar
// berpindah ke akun DANA-mu. Supaya dana beneran cair, "isi" QR nanti diganti
// dengan payload QRIS asli dari API resmi PJSP (DANA Bisnis/Xendit/Midtrans),
// yang sekaligus mengurus settlement dana.

const QRCode = require('qrcode');

// Palet warna QR — dipilih dari warna brand yang gelap/kontras cukup tinggi
// terhadap latar putih, supaya tetap bisa dipindai scanner meski warnanya beda-beda.
const PALET_WARNA_QR = ['#2b1b3d', '#cc3814', '#c9134a', '#0f7a44', '#402955', '#5b3b73'];

// Gaya bentuk modul QR — inilah yang membuat GAMBAR-nya sendiri beda-beda
// tiap transaksi (bukan cuma warnanya), mirip QR premium ala DANA/GoPay.
const GAYA_QR = ['dots', 'rounded', 'square'];

// Batas panjang teks yang boleh digambar. Tautan konfirmasi normalnya ~350-450
// karakter; batas ini mencegah permintaan iseng yang memaksa server menggambar
// QR raksasa. Level koreksi 'M' sanggup menampung jauh di atas angka ini.
const BATAS_PANJANG_ISI = 1200;

// Masa berlaku bawaan (detik) bila frontend tidak mengirim nilainya sendiri
const BERLAKU_DETIK_BAWAAN = 600;

// Hash string -> angka, dengan langkah finalisasi ala MurmurHash supaya
// distribusinya lebih merata (menghindari beberapa ref "nyangkut" di nilai yang sama)
function hashString(str, garam) {
  let hash = 0;
  const input = garam + str;
  for (let i = 0; i < input.length; i++) {
    hash = Math.imul(hash ^ input.charCodeAt(i), 2654435761);
  }
  hash ^= hash >>> 16;
  return hash >>> 0;
}

function pilihWarnaQr(kodeRef) {
  return PALET_WARNA_QR[hashString(kodeRef, 'warna-') % PALET_WARNA_QR.length];
}

function pilihGayaQr(kodeRef) {
  return GAYA_QR[hashString(kodeRef, 'gaya-') % GAYA_QR.length];
}

// Menggambar QR secara manual modul-per-modul (bukan pakai QRCode.toDataURL bawaan)
// supaya bentuk tiap kotaknya bisa divariasikan: dots (bulat), rounded (kotak
// membulat), atau square (kotak klasik) — mata QR di 3 pojok digambar khusus
// biar tetap rapi & mudah dipindai scanner apa pun gaya modul datanya.
//
// Dua penghematan ukuran (penting sejak isi QR berubah dari ~90 karakter menjadi
// tautan ~400 karakter, yang membuat jumlah modul melonjak beberapa kali lipat):
//   1. Semua modul data dibungkus <g fill="..."> sehingga atribut fill tidak
//      diulang di setiap bentuk.
//   2. Gaya 'square' menggabungkan modul gelap yang bersebelahan dalam satu baris
//      menjadi satu <rect> panjang.
//   3. Gaya 'dots' & 'rounded' mendefinisikan satu bentuk contoh di <defs>, lalu
//      tiap modul cukup ditulis sebagai <use> yang menggeser bentuk tersebut.
function renderQrSvg(kontenQr, warna, gaya, tingkatKoreksi) {
  const data = QRCode.create(kontenQr, { errorCorrectionLevel: tingkatKoreksi || 'H' });
  const size = data.modules.size;
  const moduleSize = 10;
  const quietZone = 4; // margin putih di tepi, sesuai standar QR
  const dim = (size + quietZone * 2) * moduleSize;

  const isDark = (r, c) => {
    if (r < 0 || c < 0 || r >= size || c >= size) return false;
    return data.modules.get(r, c) === 1;
  };
  const inEyeZone = (r, c) =>
    (r < 7 && c < 7) || (r < 7 && c >= size - 7) || (r >= size - 7 && c < 7);

  // Modul gelap yang boleh digambar sebagai data (di luar area mata QR)
  const modulData = (r, c) => isDark(r, c) && !inEyeZone(r, c);

  let modul = '';
  let defs = '';

  if (gaya === 'square') {
    // Gabungkan deretan modul gelap yang bersebelahan menjadi satu persegi panjang
    for (let r = 0; r < size; r++) {
      let c = 0;
      while (c < size) {
        if (!modulData(r, c)) {
          c++;
          continue;
        }
        const mulai = c;
        while (c < size && modulData(r, c)) c++;
        const x = (mulai + quietZone) * moduleSize;
        const y = (r + quietZone) * moduleSize;
        modul += `<rect x="${x}" y="${y}" width="${(c - mulai) * moduleSize}" height="${moduleSize}"/>`;
      }
    }
  } else {
    // Cukup SATU bentuk contoh yang didefinisikan di <defs>, lalu tiap modul
    // ditulis sebagai <use> yang menggesernya. Atribut fill sengaja dikosongkan
    // supaya bentuknya mewarisi warna dari <g fill="...">.
    defs =
      gaya === 'dots'
        ? `<circle id="m" cx="${moduleSize / 2}" cy="${moduleSize / 2}" r="${moduleSize * 0.42}"/>`
        : `<rect id="m" width="${moduleSize}" height="${moduleSize}" rx="${moduleSize * 0.32}" ry="${moduleSize * 0.32}"/>`;
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (!modulData(r, c)) continue;
        const x = (c + quietZone) * moduleSize;
        const y = (r + quietZone) * moduleSize;
        modul += `<use xlink:href="#m" x="${x}" y="${y}"/>`;
      }
    }
  }

  // Gambar 3 mata QR (finder pattern) di pojok kiri-atas, kanan-atas, kiri-bawah.
  // Selalu digambar rapi (bukan ikut style dots/rounded per-modul) agar tetap
  // terdeteksi scanner dengan andal, mengikuti pola standar QR: cincin luar
  // solid, celah putih, kotak solid di tengah. Bagian ini memakai atribut fill
  // sendiri karena mengandung warna putih, jadi ditaruh di luar grup <g>.
  const eyePositions = [{ r: 0, c: 0 }, { r: 0, c: size - 7 }, { r: size - 7, c: 0 }];
  let mata = '';
  eyePositions.forEach(({ r, c }) => {
    const baseX = (c + quietZone) * moduleSize;
    const baseY = (r + quietZone) * moduleSize;
    const outerR = gaya === 'square' ? 0 : moduleSize * 1.8;
    const midR = gaya === 'square' ? 0 : moduleSize * 1.2;

    mata += `<rect x="${baseX}" y="${baseY}" width="${7 * moduleSize}" height="${7 * moduleSize}" rx="${outerR}" ry="${outerR}" fill="${warna}"/>`;
    mata += `<rect x="${baseX + moduleSize}" y="${baseY + moduleSize}" width="${5 * moduleSize}" height="${5 * moduleSize}" rx="${midR}" ry="${midR}" fill="#ffffff"/>`;
    if (gaya === 'dots') {
      mata += `<circle cx="${baseX + 3.5 * moduleSize}" cy="${baseY + 3.5 * moduleSize}" r="${1.5 * moduleSize}" fill="${warna}"/>`;
    } else {
      const innerR = gaya === 'square' ? 0 : moduleSize * 0.8;
      mata += `<rect x="${baseX + 2 * moduleSize}" y="${baseY + 2 * moduleSize}" width="${3 * moduleSize}" height="${3 * moduleSize}" rx="${innerR}" ry="${innerR}" fill="${warna}"/>`;
    }
  });

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" ` +
    `viewBox="0 0 ${dim} ${dim}" width="${dim}" height="${dim}">` +
    (defs ? `<defs>${defs}</defs>` : '') +
    `<rect width="${dim}" height="${dim}" fill="#ffffff"/>` +
    `<g fill="${warna}">${modul}</g>${mata}</svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

// Dipakai HANYA kalau produk.json gagal diakses (jaga-jaga agar checkout tidak macet)
const MERCHANT_CADANGAN = {
  nama: 'NEXORA MARKET',
  nmid: 'ID10243879012',
  terhubungKe: 'DANA'
};

// Alamat deployment ini sendiri, dibaca dari header permintaan. Dengan begini
// tidak ada domain yang ditulis manual di kode: kalau nama project atau domain
// Vercel berubah, endpoint ini tetap menemukan produk.json miliknya sendiri.
function alamatSitusIni(req) {
  const host = String(req.headers['x-forwarded-host'] || req.headers.host || '')
    .split(',')[0]
    .trim();
  const protokol = String(req.headers['x-forwarded-proto'] || 'https').split(',')[0].trim();
  return host ? `${protokol}://${host}` : '';
}

// Ambil konfigurasi merchant QRIS dari produk.json, supaya kalau kamu ganti
// akun DANA / NMID, cukup edit produk.json — tidak perlu ubah/deploy kode ini lagi.
// Alamatnya bisa juga dipaksa lewat environment variable NEXORA_PRODUK_URL.
async function ambilKonfigurasiMerchant(req) {
  try {
    const alamatProduk = process.env.NEXORA_PRODUK_URL || alamatSitusIni(req) + '/produk.json';
    const res = await fetch(alamatProduk);
    if (!res.ok) throw new Error(`Gagal fetch produk.json, status ${res.status}`);
    const data = await res.json();
    if (data && data.qris && data.qris.nama && data.qris.nmid) {
      return data.qris;
    }
    throw new Error('Field "qris" tidak ditemukan/lengkap di produk.json');
  } catch (err) {
    console.warn('Pakai merchant cadangan karena:', err.message);
    return MERCHANT_CADANGAN;
  }
}

module.exports = async function handler(req, res) {
  // Izinkan dipanggil dari domain frontend kamu (ganti '*' dengan domain asli saat production)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method tidak diizinkan, gunakan POST' });
  }

  try {
    const { ref, total, isi, berlakuDetik } = req.body || {};

    if (!ref || !total || Number.isNaN(Number(total))) {
      return res.status(400).json({ error: 'Field "ref" dan "total" (angka) wajib diisi' });
    }

    // "isi" opsional, tapi kalau dikirim harus teks yang wajar panjangnya
    if (isi !== undefined) {
      if (typeof isi !== 'string' || isi.trim().length === 0) {
        return res.status(400).json({ error: 'Field "isi" harus berupa teks yang tidak kosong' });
      }
      if (isi.length > BATAS_PANJANG_ISI) {
        return res
          .status(400)
          .json({ error: `Field "isi" maksimal ${BATAS_PANJANG_ISI} karakter` });
      }
    }

    const MERCHANT = await ambilKonfigurasiMerchant(req);

    // Konten QR: pakai "isi" dari frontend (tautan halaman konfirmasi) bila ada.
    // Kalau tidak ada, kembali ke format demo lama supaya endpoint ini tetap
    // kompatibel dengan frontend versi sebelumnya.
    const kontenQr =
      isi ||
      [
        'NEXORA-QRIS-DEMO',
        `MERCHANT:${MERCHANT.nama}`,
        `NMID:${MERCHANT.nmid}`,
        `TERHUBUNG:${MERCHANT.terhubungKe}`,
        `REF:${ref}`,
        `AMOUNT:${total}`
      ].join('|');

    // Level koreksi kesalahan: teks pendek pakai 'H' (paling tahan rusak),
    // tautan panjang diturunkan ke 'M' supaya jumlah modulnya tidak meledak
    // sehingga QR tetap lega dan gampang difokus kamera HP.
    const tingkatKoreksi = kontenQr.length > 120 ? 'M' : 'H';

    // Gambar QR-nya sendiri yang divariasikan (bentuk modul + warna),
    // bukan cuma warnanya — dipilih deterministik dari kode referensi.
    const warnaQr = pilihWarnaQr(ref);
    const gayaQr = pilihGayaQr(ref);
    const qrImage = renderQrSvg(kontenQr, warnaQr, gayaQr, tingkatKoreksi);

    return res.status(200).json({
      ref,
      total: Number(total),
      merchant: MERCHANT,
      qrImage, // string data:image/svg+xml;base64,...
      warnaQr,
      gayaQr,
      tingkatKoreksi,
      panjangKonten: kontenQr.length,
      // Masa berlaku mengikuti frontend (yang juga menanamkannya di dalam tautan),
      // supaya hitung mundur di modal dan waktu kedaluwarsa di halaman konfirmasi sama.
      berlakuDetik: Number(berlakuDetik) > 0 ? Number(berlakuDetik) : BERLAKU_DETIK_BAWAAN
    });
  } catch (err) {
    console.error('Gagal generate QRIS:', err);
    return res.status(500).json({ error: 'Gagal membuat kode QR' });
  }
};
