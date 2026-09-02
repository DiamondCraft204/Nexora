/* =========================================================
   NEXORA MARKET — HALAMAN KONFIRMASI PEMBAYARAN (HASIL SCAN QR)
   ---------------------------------------------------------
   File ini hanya dipakai oleh html/konfirmasi-bayar.html dan WAJIB
   dimuat setelah bahasa.js & script.js, karena memakai fungsi bersama
   dari sana: t(), formatRupiah(), ubahDariBase64Url(), tampilkanNotifikasi(),
   buatIkon(), serta konstanta KUNCI_STATUS_BAYAR.

   Alur singkat:
   1. Kode QR di halaman checkout berisi alamat halaman INI + parameter ?d=
      yang memuat ringkasan belanja (Base64 URL-safe dari JSON).
   2. Halaman ini membaca parameter tersebut, menampilkan rincian pesanan,
      dan menghitung mundur masa berlaku kode QR.
   3. Saat tombol "Pembayaran Selesai" ditekan, halaman menuliskan penanda
      lunas ke localStorage. Halaman checkout yang masih terbuka di browser
      yang sama akan menangkapnya dan menyelesaikan pesanan otomatis.
   ========================================================= */

document.addEventListener('DOMContentLoaded', function () {
  const panelRusak = document.getElementById('panelDataRusak');
  const panelKedaluwarsa = document.getElementById('panelKedaluwarsa');
  const panelBayar = document.getElementById('panelBayar');
  const panelSukses = document.getElementById('panelSukses');

  // Halaman lain memakai file ini juga? Kalau elemen intinya tidak ada, berhenti.
  if (!panelBayar) return;

  function tampilkanPanel(panelAktif) {
    [panelRusak, panelKedaluwarsa, panelBayar, panelSukses].forEach(function (el) {
      if (el) el.hidden = el !== panelAktif;
    });
  }

  /* ---------- 1. BACA DATA TRANSAKSI DARI ALAMAT HALAMAN ---------- */
  let data = null;
  try {
    const kodeData = new URLSearchParams(window.location.search).get('d');
    if (kodeData) data = JSON.parse(ubahDariBase64Url(kodeData));
  } catch (e) {
    data = null;
  }
  if (!data || !data.r || !Array.isArray(data.i)) {
    tampilkanPanel(panelRusak);
    return;
  }

  /* ---------- 2. ISI RINCIAN PESANAN ---------- */
  const teks = function (id, isi) {
    const el = document.getElementById(id);
    if (el) el.textContent = isi;
  };

  teks('konfMerchantNama', data.n || 'NEXORA MARKET');
  teks('konfMerchantNmid', data.id || '-');
  teks('konfMerchantTerhubung', data.w || 'DANA');
  teks('konfKodeRef', data.r);
  teks('konfMetode', data.m || 'QRIS');

  if (data.k) {
    const barisKupon = document.getElementById('konfBarisKupon');
    if (barisKupon) barisKupon.hidden = false;
    teks('konfKupon', data.k);
  }

  // Daftar barang belanjaan: [nama, jumlah, harga satuan]
  const wadahDaftar = document.getElementById('daftarBelanjaKonfirmasi');
  let jumlahBarang = 0;
  if (wadahDaftar) {
    wadahDaftar.replaceChildren();
    data.i.forEach(function (item) {
      const nama = String(item[0] || '-');
      const qty = Number(item[1]) || 1;
      const harga = Number(item[2]) || 0;
      jumlahBarang += qty;

      const baris = document.createElement('div');
      baris.className = 'baris-pesanan konfirmasi-baris';

      const ikon = document.createElement('span');
      ikon.className = 'konfirmasi-ikon-produk';
      ikon.appendChild(buatIkon('shopping_bag'));

      const info = document.createElement('div');
      info.className = 'baris-pesanan-info';
      const pNama = document.createElement('p');
      pNama.className = 'nama-pesanan';
      pNama.textContent = nama;
      const pQty = document.createElement('p');
      pQty.className = 'qty-pesanan';
      pQty.textContent = qty + ' x ' + formatRupiah(harga);
      info.appendChild(pNama);
      info.appendChild(pQty);

      const spanSub = document.createElement('span');
      spanSub.className = 'subtotal-pesanan';
      spanSub.textContent = formatRupiah(qty * harga);

      baris.appendChild(ikon);
      baris.appendChild(info);
      baris.appendChild(spanSub);
      wadahDaftar.appendChild(baris);
    });
  }

  // Penanda kalau daftar barang dipangkas agar kode QR tidak terlalu panjang
  const elItemLain = document.getElementById('konfItemLain');
  if (elItemLain && Number(data.x) > 0) {
    elItemLain.hidden = false;
    elItemLain.textContent = t('konfirmasi.itemLain', { n: data.x });
  }

  teks('konfSubtotal', formatRupiah(data.s || 0));
  teks('konfOngkir', formatRupiah(data.o || 0));
  teks('konfTotal', formatRupiah(data.t || 0));
  teks('konfTotalSukses', formatRupiah(data.t || 0));
  if (Number(data.d) > 0) {
    const barisDiskon = document.getElementById('konfBarisDiskon');
    if (barisDiskon) barisDiskon.hidden = false;
    teks('konfDiskon', '-' + formatRupiah(data.d));
  }

  tampilkanPanel(panelBayar);

  /* ---------- 3. HITUNG MUNDUR MASA BERLAKU KODE QR ---------- */
  const elTimer = document.getElementById('konfTimer');
  const btnSelesai = document.getElementById('btnBayarSelesai');
  let timerInterval = null;

  function hentikanTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  function mulaiHitungMundur(batasWaktu) {
    hentikanTimer();
    const tampilkan = function () {
      const sisaDetik = Math.max(0, Math.floor((batasWaktu - Date.now()) / 1000));
      const menit = Math.floor(sisaDetik / 60).toString().padStart(2, '0');
      const detik = (sisaDetik % 60).toString().padStart(2, '0');
      if (elTimer) elTimer.textContent = menit + ':' + detik;
      if (sisaDetik <= 0) {
        hentikanTimer();
        tampilkanPanel(panelKedaluwarsa);
      }
    };
    tampilkan();
    timerInterval = setInterval(tampilkan, 1000);
  }

  const batasWaktu = Number(data.e) || 0;
  if (batasWaktu > 0) {
    if (batasWaktu <= Date.now()) {
      tampilkanPanel(panelKedaluwarsa);
      return;
    }
    mulaiHitungMundur(batasWaktu);
  } else if (elTimer) {
    elTimer.textContent = '--:--';
  }

  /* ---------- 4. TOMBOL "PEMBAYARAN SELESAI" ---------- */
  if (btnSelesai) {
    btnSelesai.onclick = function () {
      btnSelesai.disabled = true;
      hentikanTimer();

      // (a) Penanda di localStorage — dipakai kalau halaman ini dibuka di
      //     BROWSER YANG SAMA dengan halaman checkout (satu perangkat).
      try {
        localStorage.setItem(
          KUNCI_STATUS_BAYAR + data.r,
          JSON.stringify({ ref: data.r, total: data.t, waktu: Date.now() })
        );
      } catch (e) {
        // localStorage bisa diblokir browser; konfirmasi tetap ditampilkan
      }

      const tampilkanSukses = function (gagalSinkron) {
        const elSuksesDesk = document.getElementById('konfSuksesDesk');
        if (elSuksesDesk) elSuksesDesk.textContent = t('konfirmasi.suksesDesk', { ref: data.r });
        const elGagal = document.getElementById('konfCatatanGagalSinkron');
        if (elGagal) elGagal.hidden = !gagalSinkron;
        tampilkanPanel(panelSukses);
        if (typeof tampilkanNotifikasi === 'function') {
          tampilkanNotifikasi(t('konfirmasi.notifSukses'), 'sukses');
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
      };

      // (b) Laporkan ke server — inilah yang membuat laptop ikut tahu meski
      //     halaman ini dibuka di HP (browser & perangkat yang berbeda).
      if (typeof NEXORA_SINKRON_BAYAR !== 'undefined' && NEXORA_SINKRON_BAYAR) {
        fetch(NEXORA_ALAMAT_API + '/api/status-bayar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ref: data.r, total: data.t })
        })
          .then(function (res) {
            tampilkanSukses(!res.ok);
          })
          .catch(function () {
            tampilkanSukses(true);
          });
      } else {
        tampilkanSukses(false);
      }
    };
  }

  /* ---------- 5. IKUT BERGANTI SAAT BAHASA DIUBAH ---------- */
  document.addEventListener('bahasaBerubah', function () {
    if (elItemLain && !elItemLain.hidden) {
      elItemLain.textContent = t('konfirmasi.itemLain', { n: data.x });
    }
    const elSuksesDesk = document.getElementById('konfSuksesDesk');
    if (elSuksesDesk && panelSukses && !panelSukses.hidden) {
      elSuksesDesk.textContent = t('konfirmasi.suksesDesk', { ref: data.r });
    }
  });
});
