/* =========================================================
   NEXORA MARKET — MASTER JAVASCRIPT ENGINE (FULL & CLEAN DOM API)
   ========================================================= */

// Inisialisasi Tema Otomatis Saat Skrip Dimuat
(function inisialisasiTemaAwal() {
  const tema = localStorage.getItem('nexora_theme') || 'light';
  document.documentElement.setAttribute('data-theme', tema);
})();

// Deteksi Lokasi Relatif Path Dinamis (Root vs /html/)
const diDalamFolderHtml = window.location.pathname.includes('/html/');
const prefixHtml = diDalamFolderHtml ? '' : 'html/';
const rootPrefix = diDalamFolderHtml ? '../' : '';

const NEXORA_PATHS = window.NEXORA_PATHS || {
  home: rootPrefix + 'index.html',
  login: prefixHtml + 'login_daftar.html',
  shop: prefixHtml + 'bagianDalam.html',
  cart: prefixHtml + 'keranjang.html',
  payment: prefixHtml + 'pembayaran.html',
  profile: prefixHtml + 'profile.html'
};

let PRODUK = [];
let produkAktif = null;
let halamanAktifProduk = 1;
let sortAktif = 'terkait';
const PRODUK_PER_HALAMAN = 20;

/* ---------- 1. NOTIFIKASI TOAST (DOM API) ---------- */
function tampilkanNotifikasi(pesan, tipe = 'info') {
  let toast = document.getElementById('notifikasiGlobal');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'notifikasiGlobal';
    document.body.appendChild(toast);
  }
  
  toast.className = `notifikasi-global notifikasi-${tipe}`;
  toast.textContent = pesan;

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      toast.classList.add('tampil');
    });
  });

  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.classList.remove('tampil');
  }, 3000);
}

/* ---------- 2. FORMATTER & HELPER DATA ---------- */
function formatRupiah(angka) {
  return 'Rp' + Number(angka).toLocaleString('id-ID');
}

function ambilStok(p) {
  if (!p) return 0;
  if (p.stok !== undefined && p.stok !== null) return Number(p.stok);
  if (p.spesifikasi && p.spesifikasi.stok !== undefined && p.spesifikasi.stok !== null) {
    return Number(p.spesifikasi.stok);
  }
  return 0;
}

function ambilTerjual(p) {
  if (!p) return 0;
  if (p.terjual !== undefined && p.terjual !== null) return Number(p.terjual);
  if (p.spesifikasi && p.spesifikasi.terjual !== undefined && p.spesifikasi.terjual !== null) {
    return Number(p.spesifikasi.terjual);
  }
  return 0;
}

function cariProdukById(id) {
  return PRODUK.find(p => String(p.id) === String(id)) || null;
}

function simpanDataProdukKeStorage(daftarProduk) {
  localStorage.setItem('nexora_data_produk', JSON.stringify(daftarProduk));
}

function ambilDataProdukDariStorage() {
  try {
    const data = JSON.parse(localStorage.getItem('nexora_data_produk'));
    return Array.isArray(data) && data.length > 0 ? data : null;
  } catch (e) {
    return null;
  }
}

function kurangiStokDanTambahTerjual(daftarItemCheckout) {
  if (!Array.isArray(daftarItemCheckout) || daftarItemCheckout.length === 0) return;

  daftarItemCheckout.forEach(item => {
    const p = cariProdukById(item.id);
    if (p) {
      const stokSekarang = ambilStok(p);
      const terjualSekarang = ambilTerjual(p);
      const qtyBeli = Number(item.qty) || 1;

      const sisaStok = Math.max(0, stokSekarang - qtyBeli);
      const totalTerjual = terjualSekarang + qtyBeli;

      p.stok = sisaStok;
      p.terjual = totalTerjual;

      if (!p.spesifikasi) p.spesifikasi = {};
      p.spesifikasi.stok = sisaStok;
      p.spesifikasi.terjual = totalTerjual;
    }
  });

  simpanDataProdukKeStorage(PRODUK);
}

/* ---------- 3. LOAD DATA PRODUK ---------- */
async function muatDataProduk() {
  try {
    const response = await fetch('https://nexora-api-one.vercel.app/produk.json');
    if (response.ok) {
      const dataAPI = await response.json();
      const dataLokal = ambilDataProdukDariStorage();

      if (dataLokal && Array.isArray(dataLokal) && dataLokal.length > 0) {
        PRODUK = dataAPI.map(pAPI => {
          const pLokal = dataLokal.find(l => String(l.id) === String(pAPI.id));
          if (pLokal) {
            return {
              ...pAPI,
              kota: pAPI.kota || pLokal.kota || 'Kota Bandung',
              stok: pLokal.stok !== undefined ? pLokal.stok : (pLokal.spesifikasi ? pLokal.spesifikasi.stok : pAPI.stok),
              terjual: pLokal.terjual !== undefined ? pLokal.terjual : (pLokal.spesifikasi ? pLokal.spesifikasi.terjual : pAPI.terjual),
              spesifikasi: {
                ...pAPI.spesifikasi,
                stok: pLokal.spesifikasi && pLokal.spesifikasi.stok !== undefined ? pLokal.spesifikasi.stok : pLokal.stok,
                terjual: pLokal.spesifikasi && pLokal.spesifikasi.terjual !== undefined ? pLokal.spesifikasi.terjual : pLokal.terjual
              }
            };
          }
          return {
            ...pAPI,
            kota: pAPI.kota || 'Kota Bandung'
          };
        });
      } else {
        PRODUK = dataAPI.map(p => ({
          ...p,
          kota: p.kota || 'Kota Bandung'
        }));
      }

      simpanDataProdukKeStorage(PRODUK);
    }
  } catch (error) {
    const dataLokal = ambilDataProdukDariStorage();
    if (dataLokal) PRODUK = dataLokal;
  } finally {
    renderKatalog();
    renderKeranjang();
    renderRingkasanPembayaran();
    renderRiwayatPesanan();
    document.dispatchEvent(new Event('produkReady'));
  }
}

/* ---------- 4. RENDER KATALOG (CLEAN CARDS / TANPA TAGLINE DISKON) ---------- */
function ambilKategoriAktif() {
  const radioAktif = document.querySelector('input[name="filter-kategori"]:checked');
  if (!radioAktif) {
    const radioDefault = document.getElementById('cat-all');
    if (radioDefault) radioDefault.checked = true;
    return 'all';
  }
  if (radioAktif.id === 'cat-all') return 'all';
  return radioAktif.id.replace('cat-', '').trim().toLowerCase();
}

function renderKatalog() {
  const wadahKatalog = document.getElementById('katalogProduk');
  if (!wadahKatalog) return;

  if (!PRODUK || PRODUK.length === 0) {
    const dataLokal = ambilDataProdukDariStorage();
    if (dataLokal && dataLokal.length > 0) PRODUK = dataLokal;
    else return;
  }

  const kategoriAktif = ambilKategoriAktif();
  const inputPencarian = document.getElementById('inputPencarian');
  const query = inputPencarian ? inputPencarian.value.trim().toLowerCase() : '';

  let produkTersaring = PRODUK.filter(p => {
    const katProduk = (p.kategori || '').trim().toLowerCase();
    let cocokKategori = false;
    
    if (kategoriAktif === 'all' || !kategoriAktif) {
      cocokKategori = true;
    } else if (katProduk === kategoriAktif) {
      cocokKategori = true;
    } else if (
      (kategoriAktif === 'jacket' && katProduk === 'jaket') || 
      (kategoriAktif === 'jaket' && katProduk === 'jacket')
    ) {
      cocokKategori = true;
    }

    const namaProduk = (p.nama || '').toLowerCase();
    const cocokPencarian = query === '' || namaProduk.includes(query);
    return cocokKategori && cocokPencarian;
  });

  if (sortAktif === 'terlaris') {
    produkTersaring.sort((a, b) => ambilTerjual(b) - ambilTerjual(a));
  } else if (sortAktif === 'terbaru') {
    produkTersaring.reverse();
  } else {
    produkTersaring.sort((a, b) => (String(a.id) > String(b.id) ? 1 : -1));
  }

  const totalHalaman = Math.max(1, Math.ceil(produkTersaring.length / PRODUK_PER_HALAMAN));
  if (halamanAktifProduk > totalHalaman) halamanAktifProduk = totalHalaman;
  if (halamanAktifProduk < 1) halamanAktifProduk = 1;

  const awal = (halamanAktifProduk - 1) * PRODUK_PER_HALAMAN;
  const produkHalamanIni = produkTersaring.slice(awal, awal + PRODUK_PER_HALAMAN);

  wadahKatalog.replaceChildren();

  if (produkTersaring.length === 0) {
    const pesanKosong = document.createElement('div');
    pesanKosong.className = 'pesan-katalog-kosong';
    pesanKosong.textContent = 'Produk tidak ditemukan. Coba kata kunci atau kategori lain.';
    wadahKatalog.appendChild(pesanKosong);
  } else {
    produkHalamanIni.forEach(p => wadahKatalog.appendChild(buatKartuProduk(p)));
  }

  initKlikProduk();
  renderPaginasi(totalHalaman, produkTersaring.length);
}

function buatKartuProduk(p) {
  const secDiv = document.createElement('div');
  secDiv.className = 'container-sec';
  secDiv.dataset.id = p.id;

  const figure = document.createElement('figure');
  figure.className = 'kartu-gambar';

  const gambarWrap = document.createElement('div');
  gambarWrap.className = 'gambar-produk';
  const img = document.createElement('img');
  img.src = p.gambar || 'https://dummyimage.com/600x600/e2e8f0/0f172a.png&text=Nexora';
  img.alt = p.nama || 'Produk';
  img.loading = 'lazy';
  gambarWrap.appendChild(img);

  const figcaption = document.createElement('figcaption');
  figcaption.className = 'info-produk';

  const namaSpan = document.createElement('span');
  namaSpan.className = 'nama-produk';
  namaSpan.textContent = p.nama;

  const infoBawah = document.createElement('div');
  infoBawah.className = 'info-bawah-produk';

  const strong = document.createElement('strong');
  strong.className = 'harga-produk';
  strong.textContent = formatRupiah(p.harga);

  const lokasiTerjual = document.createElement('div');
  lokasiTerjual.className = 'lokasi-terjual';
  
  const spanKota = document.createElement('span');
  spanKota.textContent = p.kota ? p.kota : (p.spesifikasi && p.spesifikasi.kota ? p.spesifikasi.kota : 'Kota Bandung');

  const spanTerjual = document.createElement('span');
  spanTerjual.textContent = `${ambilTerjual(p)} Terjual`;

  lokasiTerjual.appendChild(spanKota);
  lokasiTerjual.appendChild(spanTerjual);

  infoBawah.appendChild(strong);
  infoBawah.appendChild(lokasiTerjual);

  figcaption.appendChild(namaSpan);
  figcaption.appendChild(infoBawah);

  figure.appendChild(gambarWrap);
  figure.appendChild(figcaption);
  secDiv.appendChild(figure);

  return secDiv;
}

function renderPaginasi(totalHalaman, totalProduk) {
  const wadahPaginasi = document.getElementById('paginasiProduk');
  if (!wadahPaginasi) return;
  wadahPaginasi.replaceChildren();
  if (totalProduk === 0 || totalHalaman <= 1) return;

  const buatTombol = (label, tujuan, aktif = false, nonaktif = false) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `btn-halaman ${aktif ? 'aktif' : ''}`;
    btn.textContent = label;
    btn.disabled = nonaktif;
    btn.onclick = () => {
      halamanAktifProduk = tujuan;
      renderKatalog();
      window.scrollTo({ top: 380, behavior: 'smooth' });
    };
    return btn;
  };

  wadahPaginasi.appendChild(buatTombol('‹', halamanAktifProduk - 1, false, halamanAktifProduk === 1));
  for (let i = 1; i <= totalHalaman; i++) {
    wadahPaginasi.appendChild(buatTombol(String(i), i, i === halamanAktifProduk));
  }
  wadahPaginasi.appendChild(buatTombol('›', halamanAktifProduk + 1, false, halamanAktifProduk === totalHalaman));
}

/* ---------- 5. MODAL DETAIL PRODUK (DOM API) ---------- */
function pasangModalKeDOM() {
  let overlay = document.getElementById('modalProduk');
  if (overlay) return;

  overlay = document.createElement('div');
  overlay.id = 'modalProduk';
  overlay.className = 'overlay-produk';
  overlay.hidden = true;

  const card = document.createElement('div');
  card.className = 'kartu-modal-produk';

  const btnTutup = document.createElement('button');
  btnTutup.type = 'button';
  btnTutup.className = 'tutup-modal-produk';
  btnTutup.textContent = '×';
  btnTutup.onclick = tutupModal;

  const divImg = document.createElement('div');
  divImg.className = 'modal-produk-gambar';
  const img = document.createElement('img');
  img.id = 'modalProdukGambar';
  divImg.appendChild(img);

  const divInfo = document.createElement('div');
  divInfo.className = 'modal-produk-info';

  const h3 = document.createElement('h3');
  h3.id = 'modalProdukNama';

  const barisTerjual = document.createElement('div');
  barisTerjual.className = 'modal-baris-terjual';
  
  const spanTerjualModal = document.createElement('span');
  spanTerjualModal.id = 'modalProdukTerjual';
  spanTerjualModal.className = 'badge-terjual-modal';

  const spanKategori = document.createElement('span');
  spanKategori.id = 'modalProdukKategori';
  spanKategori.className = 'badge-kategori-modal';

  barisTerjual.appendChild(spanTerjualModal);
  barisTerjual.appendChild(spanKategori);

  const pHarga = document.createElement('div');
  pHarga.className = 'modal-produk-harga';
  pHarga.id = 'modalProdukHarga';

  const pDesk = document.createElement('p');
  pDesk.id = 'modalProdukDeskripsi';
  pDesk.className = 'modal-produk-deskripsi';

  const judulSpek = document.createElement('div');
  judulSpek.className = 'judul-spek-modal';
  judulSpek.textContent = 'Spesifikasi Produk:';

  const dlSpek = document.createElement('dl');
  dlSpek.id = 'modalProdukSpek';
  dlSpek.className = 'modal-produk-spek';

  const divJumlahStok = document.createElement('div');
  divJumlahStok.className = 'modal-jumlah-wrapper';

  const stepper = document.createElement('div');
  stepper.className = 'stepper-modal';

  const btnMin = document.createElement('button');
  btnMin.type = 'button';
  btnMin.textContent = '−';
  btnMin.onclick = () => ubahJumlahModal(-1);

  const inputQty = document.createElement('input');
  inputQty.type = 'text';
  inputQty.id = 'modalJumlahBeli';
  inputQty.className = 'input-jumlah-modal';
  inputQty.value = '1';
  inputQty.autocomplete = 'off';

  inputQty.addEventListener('input', () => {
    inputQty.value = inputQty.value.replace(/[^0-9]/g, '');
    let val = parseInt(inputQty.value, 10);
    const stokTersedia = ambilStok(produkAktif);
    
    if (!isNaN(val) && val > stokTersedia) {
      inputQty.value = stokTersedia;
      tampilkanNotifikasi(`Maksimal pembelian ${stokTersedia} pcs sesuai sisa stok`, 'error');
    }
  });

  inputQty.addEventListener('blur', () => {
    let val = parseInt(inputQty.value, 10);
    if (isNaN(val) || val < 1) inputQty.value = '1';
  });

  const btnPlus = document.createElement('button');
  btnPlus.type = 'button';
  btnPlus.textContent = '+';
  btnPlus.onclick = () => ubahJumlahModal(1);

  stepper.appendChild(btnMin);
  stepper.appendChild(inputQty);
  stepper.appendChild(btnPlus);

  const spanStok = document.createElement('span');
  spanStok.id = 'modalProdukStok';
  spanStok.className = 'teks-stok-modal';

  divJumlahStok.appendChild(stepper);
  divJumlahStok.appendChild(spanStok);

  const divAksi = document.createElement('div');
  divAksi.className = 'modal-produk-aksi';

  const btnCart = document.createElement('button');
  btnCart.type = 'button';
  btnCart.className = 'btn-tambah-keranjang';
  btnCart.textContent = '🛒 Masukkan Keranjang';
  btnCart.onclick = () => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) {
      tampilkanNotifikasi('Silakan masuk (login) terlebih dahulu!', 'error');
      setTimeout(() => { window.location.href = NEXORA_PATHS.login; }, 1000);
      return;
    }

    if (produkAktif) {
      const inputEl = document.getElementById('modalJumlahBeli');
      const qtyBeli = parseInt(inputEl.value, 10) || 1;
      const sukses = tambahKeKeranjang(produkAktif.id, qtyBeli);
      if (sukses) {
        tutupModal();
        tampilkanNotifikasi(`${produkAktif.nama} (${qtyBeli} pcs) masuk ke keranjang!`, 'keranjang');
      }
    }
  };

  const btnBuy = document.createElement('button');
  btnBuy.type = 'button';
  btnBuy.className = 'btn-beli-sekarang';
  btnBuy.textContent = 'Beli Sekarang';
  btnBuy.onclick = () => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) {
      tampilkanNotifikasi('Silakan masuk (login) terlebih dahulu!', 'error');
      setTimeout(() => { window.location.href = NEXORA_PATHS.login; }, 1000);
      return;
    }

    if (produkAktif) {
      const inputEl = document.getElementById('modalJumlahBeli');
      const qtyBeli = parseInt(inputEl.value, 10) || 1;
      const sukses = tambahKeKeranjang(produkAktif.id, qtyBeli);
      if (sukses) {
        sessionStorage.setItem('itemCheckout', JSON.stringify([produkAktif.id]));
        window.location.href = NEXORA_PATHS.payment;
      }
    }
  };

  divAksi.appendChild(btnCart);
  divAksi.appendChild(btnBuy);

  divInfo.appendChild(h3);
  divInfo.appendChild(barisTerjual);
  divInfo.appendChild(pHarga);
  divInfo.appendChild(pDesk);
  divInfo.appendChild(judulSpek);
  divInfo.appendChild(dlSpek);
  divInfo.appendChild(divJumlahStok);
  divInfo.appendChild(divAksi);

  card.appendChild(btnTutup);
  card.appendChild(divImg);
  card.appendChild(divInfo);
  overlay.appendChild(card);
  document.body.appendChild(overlay);

  overlay.onclick = (e) => {
    if (e.target === overlay) tutupModal();
  };
}

function bukaModal(p) {
  if (!p) return;
  pasangModalKeDOM();
  produkAktif = p;

  const imgEl = document.getElementById('modalProdukGambar');
  if (imgEl) {
    imgEl.src = p.gambar || 'https://dummyimage.com/600x600/e2e8f0/0f172a.png&text=Produk+Nexora';
    imgEl.alt = p.nama || 'Produk';
  }

  const namaEl = document.getElementById('modalProdukNama');
  if (namaEl) namaEl.textContent = p.nama || 'Produk Tanpa Nama';

  const hargaEl = document.getElementById('modalProdukHarga');
  if (hargaEl) hargaEl.textContent = formatRupiah(p.harga || 0);

  const deskEl = document.getElementById('modalProdukDeskripsi');
  if (deskEl) deskEl.textContent = p.deskripsi || 'Produk original berkualitas dari kurasi Nexora Market.';

  const badgeTerjual = document.getElementById('modalProdukTerjual');
  if (badgeTerjual) badgeTerjual.textContent = `🔥 ${ambilTerjual(p)} Terjual`;

  const badgeKategori = document.getElementById('modalProdukKategori');
  if (badgeKategori) badgeKategori.textContent = `Kategori: ${(p.kategori || 'Umum').toUpperCase()}`;

  const stokVal = ambilStok(p);
  const stokEl = document.getElementById('modalProdukStok');
  if (stokEl) stokEl.textContent = `Tersisa ${stokVal} buah`;

  const inputQty = document.getElementById('modalJumlahBeli');
  if (inputQty) inputQty.value = '1';

  const spekEl = document.getElementById('modalProdukSpek');
  if (spekEl) {
    spekEl.replaceChildren();
    const dataSpek = {};

    if (p.spesifikasi && typeof p.spesifikasi === 'object') Object.assign(dataSpek, p.spesifikasi);
    if (p.bahan && !dataSpek.bahan) dataSpek.bahan = p.bahan;
    if (p.ukuran && !dataSpek.ukuran) dataSpek.ukuran = p.ukuran;
    if (p.berat && !dataSpek.berat) dataSpek.berat = p.berat;
    if (p.kota && !dataSpek.kota) dataSpek.kota = p.kota;

    const blacklistedKeys = ['id', 'nama', 'harga', 'gambar', 'deskripsi', 'kategori', 'stok', 'terjual'];
    const labelMap = {
      bahan: 'Bahan Material',
      ukuran: 'Dimensi / Ukuran',
      berat: 'Berat Produk',
      kota: 'Kota Pengiriman',
      warna: 'Varian Warna',
      isi: 'Isi Paket',
      garansi: 'Masa Garansi'
    };

    let adaSpek = false;
    Object.keys(dataSpek).forEach(key => {
      if (blacklistedKeys.includes(key.toLowerCase())) return;
      const nilai = dataSpek[key];
      if (nilai !== undefined && nilai !== null && String(nilai).trim() !== '') {
        adaSpek = true;
        const dt = document.createElement('dt');
        dt.textContent = labelMap[key.toLowerCase()] || (key.charAt(0).toUpperCase() + key.slice(1));
        const dd = document.createElement('dd');
        dd.textContent = String(nilai);
        spekEl.appendChild(dt);
        spekEl.appendChild(dd);
      }
    });

    if (!adaSpek) {
      const dt = document.createElement('dt');
      dt.textContent = 'Kondisi';
      const dd = document.createElement('dd');
      dd.textContent = '100% Baru & Original';
      spekEl.appendChild(dt);
      spekEl.appendChild(dd);
    }
  }

  const overlay = document.getElementById('modalProduk');
  if (overlay) overlay.hidden = false;
}

function tutupModal() {
  const overlay = document.getElementById('modalProduk');
  if (overlay) overlay.hidden = true;
}

function ubahJumlahModal(delta) {
  const el = document.getElementById('modalJumlahBeli');
  if (!el) return;
  let val = (parseInt(el.value, 10) || 1) + delta;
  const stokTersedia = ambilStok(produkAktif);

  if (val < 1) val = 1;
  if (val > stokTersedia) {
    val = stokTersedia;
    tampilkanNotifikasi(`Batas pembelian adalah sisa stok (${stokTersedia} pcs)`, 'error');
  }
  el.value = val;
}

function initKlikProduk() {
  document.querySelectorAll('.container-sec[data-id]').forEach(kartu => {
    kartu.onclick = () => {
      const p = cariProdukById(kartu.dataset.id);
      if (p) bukaModal(p);
    };
  });
}

/* ---------- 6. KERANJANG STORAGE & RENDER (DOM API) ---------- */
function getKeranjangKey() {
  const email = localStorage.getItem('emailLogin');
  return email ? 'keranjang_' + email : 'nexoraKeranjang_guest';
}

function ambilKeranjang() {
  try {
    const data = JSON.parse(localStorage.getItem(getKeranjangKey()));
    return Array.isArray(data) ? data : [];
  } catch (e) {
    return [];
  }
}

function simpanKeranjang(daftar) {
  localStorage.setItem(getKeranjangKey(), JSON.stringify(daftar));
  perbaruiBadgeKeranjang();
}

function tambahKeKeranjang(idProduk, jumlah = 1) {
  const p = cariProdukById(idProduk);
  const stokTersedia = ambilStok(p);

  if (stokTersedia <= 0) {
    tampilkanNotifikasi('Maaf, stok produk ini sudah habis!', 'error');
    return false;
  }

  const daftar = ambilKeranjang();
  const item = daftar.find(i => String(i.id) === String(idProduk));

  if (item) {
    if (item.qty + jumlah > stokTersedia) {
      tampilkanNotifikasi(`Stok tidak mencukupi! Sisa stok: ${stokTersedia}`, 'error');
      return false;
    }
    item.qty += jumlah;
  } else {
    if (jumlah > stokTersedia) {
      tampilkanNotifikasi(`Stok tidak mencukupi! Sisa stok: ${stokTersedia}`, 'error');
      return false;
    }
    daftar.push({ id: idProduk, qty: jumlah });
  }
  simpanKeranjang(daftar);
  return true;
}

function ubahJumlahKeranjang(idProduk, jumlah) {
  const p = cariProdukById(idProduk);
  const stokTersedia = ambilStok(p);

  let daftar = ambilKeranjang();
  if (jumlah <= 0) {
    daftar = daftar.filter(i => String(i.id) !== String(idProduk));
  } else {
    if (jumlah > stokTersedia) {
      tampilkanNotifikasi(`Maksimal pembelian ${stokTersedia} pcs`, 'error');
      return;
    }
    const item = daftar.find(i => String(i.id) === String(idProduk));
    if (item) item.qty = jumlah;
  }
  simpanKeranjang(daftar);
}

function hapusDariKeranjang(idProduk) {
  simpanKeranjang(ambilKeranjang().filter(i => String(i.id) !== String(idProduk)));
}

function kosongkanKeranjang() {
  simpanKeranjang([]);
}

function ambilDetailKeranjang() {
  return ambilKeranjang().map(item => {
    const p = cariProdukById(item.id);
    return p ? { ...p, qty: item.qty, subtotal: p.harga * item.qty } : null;
  }).filter(Boolean);
}

function perbaruiBadgeKeranjang() {
  const total = ambilKeranjang().reduce((t, i) => t + i.qty, 0);
  document.querySelectorAll('.badge-keranjang').forEach(b => {
    b.textContent = total;
    b.hidden = total === 0;
  });
}

function renderKeranjang() {
  const daftarEl = document.getElementById('daftarKeranjang');
  const kosongEl = document.getElementById('keranjangKosong');
  const layoutEl = document.getElementById('keranjangLayout');
  if (!daftarEl) return;

  if (!PRODUK || PRODUK.length === 0) {
    const dataLokal = ambilDataProdukDariStorage();
    if (dataLokal && dataLokal.length > 0) PRODUK = dataLokal;
  }

  const detail = ambilDetailKeranjang();
  daftarEl.replaceChildren();

  if (detail.length === 0) {
    if (kosongEl) kosongEl.hidden = false;
    if (layoutEl) layoutEl.hidden = true;
    return;
  }

  if (kosongEl) kosongEl.hidden = true;
  if (layoutEl) layoutEl.hidden = false;

  detail.forEach(item => {
    const card = document.createElement('div');
    card.className = 'item-keranjang-card';

    const chk = document.createElement('input');
    chk.type = 'checkbox';
    chk.className = 'ceklis-item';
    chk.dataset.id = item.id;
    chk.checked = true;

    const detailDiv = document.createElement('div');
    detailDiv.className = 'item-cart-detail';
    const img = document.createElement('img');
    img.src = item.gambar || 'https://dummyimage.com/100x100/e2e8f0/0f172a.png&text=Item';
    const h4 = document.createElement('h4');
    h4.textContent = item.nama;
    detailDiv.appendChild(img);
    detailDiv.appendChild(h4);

    const pHarga = document.createElement('div');
    pHarga.textContent = formatRupiah(item.harga);

    const stepper = document.createElement('div');
    stepper.className = 'stepper-cart';

    const btnMin = document.createElement('button');
    btnMin.type = 'button';
    btnMin.textContent = '−';
    btnMin.onclick = () => { 
      ubahJumlahKeranjang(item.id, item.qty - 1); 
      renderKeranjang(); 
    };

    const inputQty = document.createElement('input');
    inputQty.type = 'text';
    inputQty.className = 'input-cart-qty';
    inputQty.value = item.qty;
    inputQty.autocomplete = 'off';

    inputQty.addEventListener('input', () => {
      inputQty.value = inputQty.value.replace(/[^0-9]/g, '');
      let val = parseInt(inputQty.value, 10);
      const p = cariProdukById(item.id);
      const stokTersedia = ambilStok(p);

      if (!isNaN(val)) {
        if (val > stokTersedia) {
          inputQty.value = stokTersedia;
          val = stokTersedia;
          tampilkanNotifikasi(`Maksimal pembelian ${stokTersedia} pcs`, 'error');
        }
        if (val >= 1) {
          ubahJumlahKeranjang(item.id, val);
          hitungTotalTerpilih();
          pSubtotal.textContent = formatRupiah(item.harga * val);
        }
      }
    });

    inputQty.addEventListener('blur', () => {
      let val = parseInt(inputQty.value, 10);
      if (isNaN(val) || val < 1) {
        ubahJumlahKeranjang(item.id, 1);
        renderKeranjang();
      }
    });

    const btnPlus = document.createElement('button');
    btnPlus.type = 'button';
    btnPlus.textContent = '+';
    btnPlus.onclick = () => { 
      ubahJumlahKeranjang(item.id, item.qty + 1); 
      renderKeranjang(); 
    };

    stepper.appendChild(btnMin);
    stepper.appendChild(inputQty);
    stepper.appendChild(btnPlus);

    const pSubtotal = document.createElement('div');
    pSubtotal.className = 'subtotal-cart';
    pSubtotal.textContent = formatRupiah(item.subtotal);

    const btnHapus = document.createElement('button');
    btnHapus.className = 'btn-item-hapus';
    btnHapus.type = 'button';
    btnHapus.textContent = 'Hapus';
    btnHapus.onclick = () => {
      hapusDariKeranjang(item.id);
      renderKeranjang();
      tampilkanNotifikasi('Barang dihapus dari keranjang', 'error');
    };

    card.appendChild(chk);
    card.appendChild(detailDiv);
    card.appendChild(pHarga);
    card.appendChild(stepper);
    card.appendChild(pSubtotal);
    card.appendChild(btnHapus);

    daftarEl.appendChild(card);
  });

  hitungTotalTerpilih();
  pasangEventKeranjang();
}

function pasangEventKeranjang() {
  document.querySelectorAll('.ceklis-item').forEach(chk => {
    chk.onchange = hitungTotalTerpilih;
  });

  const checkSemua = document.getElementById('checkSemua');
  if (checkSemua) {
    checkSemua.onchange = () => {
      document.querySelectorAll('.ceklis-item').forEach(c => c.checked = checkSemua.checked);
      hitungTotalTerpilih();
    };
  }

  const btnKosongkan = document.getElementById('btnKosongkan');
  if (btnKosongkan) {
    btnKosongkan.onclick = () => {
      if (confirm('Kosongkan semua barang di keranjang?')) {
        kosongkanKeranjang();
        renderKeranjang();
        tampilkanNotifikasi('Keranjang telah dikosongkan', 'sukses');
      }
    };
  }

  const btnCheckout = document.getElementById('btnCheckout');
  if (btnCheckout) {
    btnCheckout.onclick = () => {
      const terpilih = [];
      document.querySelectorAll('.ceklis-item:checked').forEach(c => terpilih.push(c.dataset.id));
      if (terpilih.length === 0) return tampilkanNotifikasi('Pilih minimal satu produk!', 'error');

      sessionStorage.setItem('itemCheckout', JSON.stringify(terpilih));
      window.location.href = NEXORA_PATHS.payment;
    };
  }
}

function hitungTotalTerpilih() {
  let totalHarga = 0;
  let totalItem = 0;
  const detail = ambilDetailKeranjang();
  const wadahMini = document.getElementById('daftarItemRingkasan');
  
  if (wadahMini) wadahMini.replaceChildren();

  const itemTerpilihList = [];

  document.querySelectorAll('.ceklis-item:checked').forEach(c => {
    const item = detail.find(i => String(i.id) === String(c.dataset.id));
    if (item) {
      totalHarga += item.subtotal;
      totalItem += item.qty;
      itemTerpilihList.push(item);
    }
  });

  // Render list produk yang diceklis ke ringkasan pesanan sisi kanan
  if (wadahMini) {
    if (itemTerpilihList.length === 0) {
      const pKosong = document.createElement('div');
      pKosong.className = 'pesan-mini-kosong';
      pKosong.textContent = 'Belum ada produk yang dipilih.';
      wadahMini.appendChild(pKosong);
    } else {
      itemTerpilihList.forEach(item => {
        const miniCard = document.createElement('div');
        miniCard.className = 'item-mini-ringkasan';

        const img = document.createElement('img');
        img.src = item.gambar || 'https://dummyimage.com/100x100/e2e8f0/0f172a.png&text=Item';
        img.alt = item.nama;

        const info = document.createElement('div');
        info.className = 'info-mini-ringkasan';

        const pNama = document.createElement('div');
        pNama.className = 'nama-mini-ringkasan';
        pNama.textContent = item.nama;

        const pSub = document.createElement('div');
        pSub.className = 'sub-mini-ringkasan';
        pSub.textContent = `${item.qty} pcs x ${formatRupiah(item.harga)}`;

        info.appendChild(pNama);
        info.appendChild(pSub);

        const pHarga = document.createElement('div');
        pHarga.className = 'harga-mini-ringkasan';
        pHarga.textContent = formatRupiah(item.subtotal);

        miniCard.appendChild(img);
        miniCard.appendChild(info);
        miniCard.appendChild(pHarga);
        wadahMini.appendChild(miniCard);
      });
    }
  }

  const elItem = document.getElementById('ringkasanTotalItem');
  const elHarga = document.getElementById('ringkasanTotalHarga');
  if (elItem) elItem.textContent = totalItem;
  if (elHarga) elHarga.textContent = formatRupiah(totalHarga);
}

/* ---------- 8. RIWAYAT PESANAN & PROFIL (DOM API) ---------- */
function getRiwayatKey() {
  const email = localStorage.getItem('emailLogin');
  return email ? `riwayat_pesanan_${email}` : 'riwayat_pesanan_guest';
}

function simpanRiwayatPesanan(pesananBaru) {
  const key = getRiwayatKey();
  let riwayat = JSON.parse(localStorage.getItem(key)) || [];
  riwayat.unshift(pesananBaru);
  localStorage.setItem(key, JSON.stringify(riwayat));
}

function ambilRiwayatPesanan() {
  try {
    return JSON.parse(localStorage.getItem(getRiwayatKey())) || [];
  } catch (e) {
    return [];
  }
}

function renderRiwayatPesanan() {
  const wadah = document.getElementById('wadahDaftarRiwayat');
  if (!wadah) return;

  const daftar = ambilRiwayatPesanan();
  wadah.replaceChildren();

  if (daftar.length === 0) {
    const p = document.createElement('div');
    p.className = 'riwayat-kosong';
    p.textContent = 'Belum ada riwayat pesanan. Mulai belanja produk favoritmu sekarang!';
    wadah.appendChild(p);
    return;
  }

  daftar.forEach(order => {
    const card = document.createElement('div');
    card.className = 'kartu-riwayat-item';

    // Bagian Atas Kartu
    const top = document.createElement('div');
    top.className = 'kartu-riwayat-top';
    
    const noPesananLabel = document.createElement('span');
    const strongNo = document.createElement('strong');
    strongNo.textContent = 'No. Pesanan: ';
    const textNo = document.createTextNode(`${order.noPesanan} • `);
    const spanTgl = document.createElement('span');
    spanTgl.className = 'text-muted';
    spanTgl.textContent = order.tanggal;

    noPesananLabel.appendChild(strongNo);
    noPesananLabel.appendChild(textNo);
    noPesananLabel.appendChild(spanTgl);

    const badge = document.createElement('span');
    badge.className = 'status-badge-selesai';
    badge.textContent = 'Selesai Dibayar';

    top.appendChild(noPesananLabel);
    top.appendChild(badge);
    card.appendChild(top);

    // List Produk Pesanan
    order.items.forEach(item => {
      const row = document.createElement('div');
      row.className = 'riwayat-produk-baris';
      
      const img = document.createElement('img');
      img.src = item.gambar || 'https://dummyimage.com/100x100/e2e8f0/0f172a.png&text=Nexora';
      
      const info = document.createElement('div');
      info.className = 'riwayat-produk-info';
      
      const h4 = document.createElement('h4');
      h4.textContent = item.nama;
      
      const span = document.createElement('span');
      span.textContent = `${item.qty} pcs x ${formatRupiah(item.harga)}`;
      
      info.appendChild(h4);
      info.appendChild(span);
      row.appendChild(img);
      row.appendChild(info);
      card.appendChild(row);
    });

    // Bagian Bawah Kartu
    const bottom = document.createElement('div');
    bottom.className = 'kartu-riwayat-bottom';
    
    const metode = document.createElement('span');
    metode.textContent = `Metode: ${order.metodeBayar}`;
    
    const totalWrap = document.createElement('div');
    const textTotal = document.createTextNode('Total Belanja: ');
    const strongTotal = document.createElement('strong');
    strongTotal.textContent = formatRupiah(order.totalBayar);
    totalWrap.appendChild(textTotal);
    totalWrap.appendChild(strongTotal);

    bottom.appendChild(metode);
    bottom.appendChild(totalWrap);
    card.appendChild(bottom);

    wadah.appendChild(card);
  });
}

function initProfile() {
  const formProfile = document.getElementById('formProfile');
  if (!formProfile) return;

  const emailLogin = localStorage.getItem('emailLogin');
  let users = JSON.parse(localStorage.getItem('nexoraUsers')) || [];
  const userIndex = users.findIndex(u => u.email === emailLogin);
  if (userIndex === -1) return;

  const user = users[userIndex];
  document.getElementById('profNama').value = user.nama || '';
  document.getElementById('profEmail').value = user.email || '';
  document.getElementById('profUmur').value = user.umur || '';
  document.getElementById('profTanggalLahir').value = user.tanggalLahir || '';
  document.getElementById('profGender').value = user.jenisKelamin || '';
  document.getElementById('profNoHp').value = user.noHp || '';
  document.getElementById('profAlamat').value = user.alamat || '';

  const sbNama = document.getElementById('sidebarNamaUser');
  if (sbNama) sbNama.textContent = user.nama || 'Pengguna';

  const btnEdit = document.getElementById('btnEditProfile');
  const btnSimpan = document.getElementById('btnSimpanProfile');
  const inputs = formProfile.querySelectorAll('input:not(#profEmail), select, textarea');

  if (btnEdit && btnSimpan) {
    btnEdit.onclick = () => {
      inputs.forEach(el => el.disabled = false);
      btnEdit.hidden = true;
      btnSimpan.hidden = false;
    };

    formProfile.onsubmit = (e) => {
      e.preventDefault();
      users[userIndex].nama = document.getElementById('profNama').value.trim();
      users[userIndex].umur = document.getElementById('profUmur').value;
      users[userIndex].tanggalLahir = document.getElementById('profTanggalLahir').value;
      users[userIndex].jenisKelamin = document.getElementById('profGender').value;
      users[userIndex].noHp = document.getElementById('profNoHp').value.trim();
      users[userIndex].alamat = document.getElementById('profAlamat').value.trim();

      localStorage.setItem('nexoraUsers', JSON.stringify(users));
      localStorage.setItem('namaLogin', users[userIndex].nama);

      tampilkanNotifikasi('Profil berhasil diperbarui!', 'sukses');
      inputs.forEach(el => el.disabled = true);
      btnEdit.hidden = false;
      btnSimpan.hidden = true;
      if (sbNama) sbNama.textContent = users[userIndex].nama;
      initAuthNav();
    };
  }

  const tabAkunBtn = document.getElementById('tabAkunBtn');
  const tabPesananBtn = document.getElementById('tabPesananBtn');
  const tabAkun = document.getElementById('tabPengaturanAkun');
  const tabPesanan = document.getElementById('tabRiwayatPesanan');

  if (tabAkunBtn && tabPesananBtn && tabAkun && tabPesanan) {
    tabAkunBtn.onclick = () => {
      tabAkunBtn.classList.add('active');
      tabPesananBtn.classList.remove('active');
      tabAkun.hidden = false;
      tabPesanan.hidden = true;
    };

    tabPesananBtn.onclick = () => {
      tabPesananBtn.classList.add('active');
      tabAkunBtn.classList.remove('active');
      tabAkun.hidden = true;
      tabPesanan.hidden = false;
      renderRiwayatPesanan();
    };
  }

  const btnKeluar = document.getElementById('btnKeluarAkun');
  if (btnKeluar) {
    btnKeluar.onclick = () => {
      if (confirm('Apakah kamu yakin ingin keluar dari akun?')) {
        ['isLoggedIn', 'namaLogin', 'authToken', 'emailLogin'].forEach(k => localStorage.removeItem(k));
        window.location.href = NEXORA_PATHS.home;
      }
    };
  }
}

/* ---------- 9. AUTHENTICATION & FORM SLIDER ---------- */
function hitungUsiaDariTanggal(tglLahirStr) {
  const tglLahir = new Date(tglLahirStr);
  const tglSekarang = new Date();
  let usia = tglSekarang.getFullYear() - tglLahir.getFullYear();
  const selisihBulan = tglSekarang.getMonth() - tglLahir.getMonth();
  if (selisihBulan < 0 || (selisihBulan === 0 && tglSekarang.getDate() < tglLahir.getDate())) usia--;
  return usia;
}

function initTogglePassword() {
  document.querySelectorAll('.btn-toggle-pwd').forEach(btn => {
    btn.onclick = function () {
      const targetId = this.dataset.target;
      const input = document.getElementById(targetId);
      if (!input) return;

      if (input.type === 'password') {
        input.type = 'text';
        this.textContent = '🙈';
      } else {
        input.type = 'password';
        this.textContent = '👁️';
      }
    };
  });
}

function initAuthForms() {
  initTogglePassword();

  const btnTabMasuk = document.getElementById('tabBtnMasuk');
  const btnTabDaftar = document.getElementById('tabBtnDaftar');
  const boxMasuk = document.getElementById('formContainerMasuk');
  const boxDaftar = document.getElementById('formContainerDaftar');

  if (btnTabMasuk && btnTabDaftar && boxMasuk && boxDaftar) {
    btnTabMasuk.onclick = () => {
      btnTabMasuk.classList.add('active');
      btnTabDaftar.classList.remove('active');
      boxMasuk.hidden = false;
      boxDaftar.hidden = true;
    };

    btnTabDaftar.onclick = () => {
      btnTabDaftar.classList.add('active');
      btnTabMasuk.classList.remove('active');
      boxMasuk.hidden = true;
      boxDaftar.hidden = false;
    };
  }

  const inputTgl = document.getElementById('regTanggalLahir');
  const inputUmur = document.getElementById('regUmur');
  if (inputTgl && inputUmur) {
    inputTgl.addEventListener('change', () => {
      if (inputTgl.value) {
        const usiaHitung = hitungUsiaDariTanggal(inputTgl.value);
        if (usiaHitung >= 0) inputUmur.value = usiaHitung;
      }
    });
  }

  const formDaftar = document.querySelector('.form-daftar form');
  if (formDaftar) {
    formDaftar.addEventListener('submit', (e) => {
      e.preventDefault();

      const nama = document.getElementById('regNama').value.trim();
      const email = document.getElementById('regEmail').value.trim().toLowerCase();
      const password = document.getElementById('regPassword').value;
      const umur = parseInt(document.getElementById('regUmur').value, 10);
      const tanggalLahir = document.getElementById('regTanggalLahir').value;
      const jenisKelamin = document.getElementById('regGender').value;

      if (nama.length < 3) return tampilkanNotifikasi('Nama lengkap minimal 3 karakter!', 'error');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return tampilkanNotifikasi('Format email tidak valid!', 'error');
      if (password.length < 8) return tampilkanNotifikasi('Kata sandi minimal 8 karakter!', 'error');
      if (!tanggalLahir) return tampilkanNotifikasi('Tanggal lahir wajib diisi!', 'error');

      const tglInput = new Date(tanggalLahir);
      const tglHariIni = new Date();
      tglHariIni.setHours(0, 0, 0, 0);

      if (tglInput > tglHariIni) return tampilkanNotifikasi('Tanggal lahir tidak boleh di masa depan!', 'error');

      const usiaSebenarnya = hitungUsiaDariTanggal(tanggalLahir);
      if (umur !== usiaSebenarnya) {
        return tampilkanNotifikasi(`Usia (${umur} thn) tidak cocok dengan tanggal lahir!`, 'error');
      }

      let users = JSON.parse(localStorage.getItem('nexoraUsers')) || [];
      const emailSudahAda = users.some(u => u.email.toLowerCase() === email);

      if (emailSudahAda) return tampilkanNotifikasi('Email ini sudah terdaftar! Gunakan email lain.', 'error');

      users.push({ nama, email, password, umur, tanggalLahir, jenisKelamin });
      localStorage.setItem('nexoraUsers', JSON.stringify(users));

      tampilkanNotifikasi('Pendaftaran berhasil! Silakan masuk ke akunmu.', 'sukses');
      formDaftar.reset();
      if (btnTabMasuk) btnTabMasuk.click();
    });
  }

  const formMasuk = document.querySelector('.form-masuk form');
  if (formMasuk) {
    formMasuk.addEventListener('submit', (e) => {
      e.preventDefault();

      const email = document.getElementById('loginEmail').value.trim().toLowerCase();
      const password = document.getElementById('loginPassword').value;

      let users = JSON.parse(localStorage.getItem('nexoraUsers')) || [];
      const user = users.find(u => u.email.toLowerCase() === email);

      if (!user) return tampilkanNotifikasi('Email belum terdaftar! Silakan daftar akun.', 'error');
      if (user.password !== password) return tampilkanNotifikasi('Kata sandi salah!', 'error');

      localStorage.setItem('authToken', 'token-dummy-123');
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('namaLogin', user.nama);
      localStorage.setItem('emailLogin', user.email);

      tampilkanNotifikasi('Login berhasil! Mengalihkan...', 'sukses');
      setTimeout(() => { window.location.href = NEXORA_PATHS.shop; }, 700);
    });
  }
}

/* ---------- 10. AUTH NAV & HEADER CONTROLLER ---------- */
function initAuthNav() {
  const greetArea = document.getElementById('greetingArea');
  const profileLink = document.getElementById('navProfile');
  const authLink = document.getElementById('navAuth');
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const nama = localStorage.getItem('namaLogin');

  const pathName = window.location.pathname;
  const isGuestIndex = (pathName.endsWith('index.html') || pathName.endsWith('/')) && !pathName.includes('/html/');

  if (isLoggedIn && isGuestIndex) {
    window.location.href = NEXORA_PATHS.shop;
    return;
  }

  document.querySelectorAll('.brand-logo-nexora, #linkBeranda, .link-beranda').forEach(link => {
    link.setAttribute('href', isLoggedIn ? NEXORA_PATHS.shop : NEXORA_PATHS.home);
  });

  if (isLoggedIn) {
    if (greetArea) {
      greetArea.textContent = `Hai, ${nama ? nama.split(' ')[0] : 'Pengguna'}`;
      greetArea.hidden = false;
    }
    if (profileLink) profileLink.hidden = false;
    if (authLink) authLink.hidden = true;
  } else {
    if (greetArea) greetArea.hidden = true;
    if (profileLink) profileLink.hidden = true;
    if (authLink) authLink.hidden = false;
  }
}

/* ---------- 11. DARK/LIGHT THEME CONTROLLER ---------- */
function inisialisasiTema() {
  const temaTersimpan = localStorage.getItem('nexora_theme') || 'light';
  document.documentElement.setAttribute('data-theme', temaTersimpan);
  perbaruiIkonTema(temaTersimpan);
}

function gantiTema() {
  const temaSekarang = document.documentElement.getAttribute('data-theme') || 'light';
  const temaBaru = temaSekarang === 'dark' ? 'light' : 'dark';
  
  document.documentElement.setAttribute('data-theme', temaBaru);
  localStorage.setItem('nexora_theme', temaBaru);
  perbaruiIkonTema(temaBaru);
  tampilkanNotifikasi(`Beralih ke mode ${temaBaru === 'dark' ? 'Gelap (Dark)' : 'Terang (Light)'}`, 'info');
}

function perbaruiIkonTema(tema) {
  document.querySelectorAll('.btn-toggle-theme').forEach(btn => {
    btn.textContent = tema === 'dark' ? '☀️' : '🌙';
    btn.title = tema === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap';
  });
}

function pasangTombolTema() {
  document.querySelectorAll('.btn-toggle-theme').forEach(btn => {
    btn.onclick = gantiTema;
  });
}

/* ---------- 12. INITIALIZATION EVENT LISTENER ---------- */
document.addEventListener('DOMContentLoaded', () => {
  if (document.body.dataset.butuhLogin === 'true' && localStorage.getItem('isLoggedIn') !== 'true') {
    window.location.href = NEXORA_PATHS.login;
    return;
  }

  inisialisasiTema();
  pasangTombolTema();
  initAuthNav();
  initAuthForms();
  initProfile();
  perbaruiBadgeKeranjang();
  muatDataProduk();

  // Handler Proteksi Tombol Keranjang (Dukungan Folder Dinamis)
  const linkIkonKeranjang = document.querySelector('.tombol-keranjang');
  if (linkIkonKeranjang) {
    linkIkonKeranjang.addEventListener('click', (e) => {
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
      if (!isLoggedIn) {
        e.preventDefault();
        tampilkanNotifikasi('Silakan masuk akun terlebih dahulu untuk melihat keranjang!', 'error');
        setTimeout(() => {
          window.location.href = NEXORA_PATHS.login;
        }, 1000);
      } else {
        e.preventDefault();
        window.location.href = NEXORA_PATHS.cart;
      }
    });
  }

  // Filter Kategori Listener
  document.querySelectorAll('input[name="filter-kategori"]').forEach(r => {
    r.addEventListener('change', () => {
      halamanAktifProduk = 1;
      renderKatalog();
    });
  });

  // Sorting Tabs Listener
  document.querySelectorAll('.filter-tab-bar .tab-btn').forEach(btn => {
    btn.onclick = function () {
      document.querySelectorAll('.filter-tab-bar .tab-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      sortAktif = this.dataset.sort || this.textContent.trim().toLowerCase();
      halamanAktifProduk = 1;
      renderKatalog();
    };
  });

  // Search Input Listener
  const inputCari = document.getElementById('inputPencarian');
  if (inputCari) {
    inputCari.oninput = () => {
      halamanAktifProduk = 1;
      renderKatalog();
    };
  }

  // Modal About Controller
  const btnAbout = document.getElementById('btnBukaAbout');
  const modalAbout = document.getElementById('modalAbout');
  const btnTutupAbout = document.getElementById('btnTutupAbout');

  if (btnAbout && modalAbout) {
    btnAbout.onclick = () => { modalAbout.hidden = false; };
  }
  if (btnTutupAbout && modalAbout) {
    btnTutupAbout.onclick = () => { modalAbout.hidden = true; };
  }
  if (modalAbout) {
    modalAbout.onclick = (e) => {
      if (e.target === modalAbout) modalAbout.hidden = true;
    };
  }

  // Form Checkout Pembayaran
  const formBayar = document.getElementById('formPembayaran');
  if (formBayar) {
    const emailLogin = localStorage.getItem('emailLogin');
    let users = JSON.parse(localStorage.getItem('nexoraUsers')) || [];
    const user = users.find(u => u.email === emailLogin);
    if (user) {
      if (document.getElementById('inputNamaPenerima')) document.getElementById('inputNamaPenerima').value = user.nama || '';
      if (document.getElementById('inputNoHp')) document.getElementById('inputNoHp').value = user.noHp || '';
      if (document.getElementById('inputAlamat')) document.getElementById('inputAlamat').value = user.alamat || '';
    }

    formBayar.onsubmit = (e) => {
      e.preventDefault();

      let idTerpilih = [];
      try {
        idTerpilih = JSON.parse(sessionStorage.getItem('itemCheckout')) || [];
      } catch (err) {}

      const barangDibeli = ambilDetailKeranjang().filter(item => idTerpilih.includes(String(item.id)));
      kurangiStokDanTambahTerjual(barangDibeli);

      const nomorOrder = `NX-${Math.floor(100000 + Math.random() * 900000)}`;
      const metodeTerpilih = formBayar.querySelector('input[name="metodeBayar"]:checked').value;
      const totalBayar = barangDibeli.reduce((sum, i) => sum + i.subtotal, 0) + 12000;

      const dataPesanan = {
        noPesanan: nomorOrder,
        tanggal: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
        items: barangDibeli,
        totalBayar: totalBayar,
        metodeBayar: metodeTerpilih
      };
      simpanRiwayatPesanan(dataPesanan);

      idTerpilih.forEach(id => hapusDariKeranjang(id));
      sessionStorage.removeItem('itemCheckout');

      const overlay = document.getElementById('overlaySukses');
      if (overlay) {
        document.getElementById('teksNomorPesanan').textContent = `Nomor Pesanan: ${nomorOrder}`;
        overlay.hidden = false;
        tampilkanNotifikasi('Pembayaran Berhasil!', 'sukses');
      }
    };
  }
});