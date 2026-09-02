// api/status-bayar.js
// Ditaruh di project Vercel "nexora-api-one", diakses di:
//   https://nexora-api-one.vercel.app/api/status-bayar
//
// ---------------------------------------------------------------------------
// UNTUK APA ENDPOINT INI
// ---------------------------------------------------------------------------
// Halaman checkout ada di laptop, halaman konfirmasi dibuka di HP. Keduanya
// browser yang berbeda, jadi tidak bisa saling melihat localStorage. Endpoint
// ini menjadi "papan pengumuman" kecil di tengah keduanya:
//
//   HP    : POST /api/status-bayar  { ref }      -> menandai pesanan lunas
//   Laptop: GET  /api/status-bayar?ref=...       -> menanyakan status tiap 3 detik
//
// Begitu laptop melihat lunas:true, modal QR ditutup dan pesanan diselesaikan.
//
// ---------------------------------------------------------------------------
// PENYIMPANAN
// ---------------------------------------------------------------------------
// Serverless function TIDAK punya memori bersama yang bisa diandalkan: tiap
// permintaan bisa dilayani instance berbeda. Karena itu status disimpan di
// Redis lewat REST API (Vercel KV / Upstash), yang gratis untuk pemakaian kecil.
//
// Cara mengaktifkan (sekali saja):
//   1. Buka dashboard Vercel -> project nexora-api-one -> tab "Storage"
//   2. Pilih "Upstash Redis" (atau KV) -> Create -> Connect ke project ini
//   3. Vercel otomatis menambahkan environment variable:
//        KV_REST_API_URL & KV_REST_API_TOKEN
//      (kalau memakai Upstash langsung, namanya UPSTASH_REDIS_REST_URL &
//       UPSTASH_REDIS_REST_TOKEN — dua-duanya dikenali kode di bawah)
//   4. Deploy ulang
//
// Kalau environment variable itu BELUM ada, endpoint tetap jalan memakai memori
// instance sebagai cadangan. Untuk demo singkat biasanya cukup, TAPI tidak
// dijamin: kalau permintaan GET dilayani instance yang berbeda dari POST tadi,
// statusnya tidak ketemu. Respons menyertakan field "penyimpanan" supaya kamu
// bisa tahu mode mana yang sedang dipakai.

const TTL_DETIK = 900; // status disimpan 15 menit, lebih dari cukup untuk 1 transaksi
const AWALAN_KUNCI = 'nexora:bayar:';

// Cadangan saat Redis belum disetel — hanya bertahan selama instance hidup
const memoriSementara = new Map();

function konfigRedis() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return { url: url.replace(/\/+$/, ''), token };
}

// Menjalankan satu perintah Redis lewat REST API Upstash/Vercel KV.
// Format permintaan: POST <url> dengan body berupa array perintah, mis.
//   ["SET", "kunci", "nilai", "EX", "900"]   ->  { "result": "OK" }
//   ["GET", "kunci"]                          ->  { "result": "nilai" }
async function perintahRedis(cfg, perintah) {
  const res = await fetch(cfg.url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${cfg.token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(perintah)
  });
  if (!res.ok) throw new Error(`Redis merespons status ${res.status}`);
  const data = await res.json();
  return data ? data.result : null;
}

async function simpanStatus(ref, nilai) {
  const cfg = konfigRedis();
  if (!cfg) {
    memoriSementara.set(ref, { nilai, kedaluwarsa: Date.now() + TTL_DETIK * 1000 });
    return 'memori-sementara';
  }
  await perintahRedis(cfg, ['SET', AWALAN_KUNCI + ref, JSON.stringify(nilai), 'EX', String(TTL_DETIK)]);
  return 'redis';
}

async function ambilStatus(ref) {
  const cfg = konfigRedis();
  if (!cfg) {
    const isi = memoriSementara.get(ref);
    if (!isi) return { nilai: null, penyimpanan: 'memori-sementara' };
    if (isi.kedaluwarsa < Date.now()) {
      memoriSementara.delete(ref);
      return { nilai: null, penyimpanan: 'memori-sementara' };
    }
    return { nilai: isi.nilai, penyimpanan: 'memori-sementara' };
  }
  const mentah = await perintahRedis(cfg, ['GET', AWALAN_KUNCI + ref]);
  if (!mentah) return { nilai: null, penyimpanan: 'redis' };
  try {
    return { nilai: JSON.parse(mentah), penyimpanan: 'redis' };
  } catch (e) {
    return { nilai: null, penyimpanan: 'redis' };
  }
}

// Kode referensi dibuat frontend dengan pola "NX-<waktu><acak>". Dibatasi
// bentuknya supaya tidak dipakai menitipkan teks sembarangan sebagai kunci.
function refValid(ref) {
  return typeof ref === 'string' && /^[A-Za-z0-9-]{4,40}$/.test(ref);
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    // ---------- HP menandai pesanan sudah dibayar ----------
    if (req.method === 'POST') {
      const { ref, total } = req.body || {};
      if (!refValid(ref)) {
        return res.status(400).json({ error: 'Field "ref" tidak valid' });
      }
      const nilai = {
        lunas: true,
        total: Number(total) || 0,
        waktu: Date.now()
      };
      const penyimpanan = await simpanStatus(ref, nilai);
      return res.status(200).json({ ok: true, ref, penyimpanan });
    }

    // ---------- Laptop menanyakan status ----------
    if (req.method === 'GET') {
      const ref = req.query ? req.query.ref : null;
      if (!refValid(ref)) {
        return res.status(400).json({ error: 'Parameter "ref" tidak valid' });
      }
      const { nilai, penyimpanan } = await ambilStatus(ref);
      return res.status(200).json({
        ref,
        lunas: !!(nilai && nilai.lunas),
        waktu: nilai ? nilai.waktu : null,
        penyimpanan
      });
    }

    return res.status(405).json({ error: 'Method tidak diizinkan, gunakan GET atau POST' });
  } catch (err) {
    console.error('Gagal memproses status bayar:', err);
    return res.status(500).json({ error: 'Gagal memproses status pembayaran' });
  }
};
