/* =========================================================
   NEXORA MARKET — MESIN BAHASA (i18n) : INDONESIA & ENGLISH
   ---------------------------------------------------------
   File ini WAJIB dimuat SEBELUM script.js pada setiap halaman:
       <script src="js/bahasa.js"></script>
       <script src="js/script.js"></script>

   Cara kerja singkat:
   1. Pilihan bahasa disimpan di localStorage ('nexora_lang').
      Nilainya 'id' (Indonesia) atau 'en' (English). Default: 'id'.
   2. Teks statis di HTML ditandai atribut:
        data-i18n            -> mengganti teks di dalam elemen
        data-i18n-ph         -> mengganti placeholder input/textarea
        data-i18n-title      -> mengganti atribut title
        data-i18n-alt        -> mengganti atribut alt pada <img>
        data-i18n-aria       -> mengganti aria-label
        data-i18n-label      -> mengisi data-label (dipakai CSS content: attr())
   3. Teks yang dibuat lewat JavaScript memakai fungsi global t('kunci').
   ========================================================= */

(function (global) {
  'use strict';

  const KUNCI_PENYIMPANAN = 'nexora_lang';
  const BAHASA_DEFAULT = 'id';

  /* ---------- KAMUS TERJEMAHAN ---------- */
  const KAMUS = {
    id: {
      /* --- Judul halaman (tag <title>) --- */
      'judul.index': 'Nexora Market — Marketplace Fashion Terpercaya',
      'judul.katalog': 'Nexora Market — Katalog Produk',
      'judul.about': 'Tentang Kami — Nexora Market',
      'judul.keranjang': 'Keranjang Belanja — Nexora Market',
      'judul.layanan': 'Layanan Pelanggan — Nexora Market',
      'judul.auth': 'Masuk / Daftar Akun — Nexora Market',
      'judul.bayar': 'Pembayaran — Nexora Market',
      'judul.profil': 'Profil Saya — Nexora Market',
      'judul.konfirmasi': 'Konfirmasi Pembayaran — Nexora Market',

      /* --- Navigasi & header --- */
      'nav.bantuanPanduan': 'Bantuan & Panduan',
      'nav.bantuan': 'Bantuan',
      'nav.tentangNexora': 'Tentang Nexora',
      'nav.tentangKami': 'Tentang Kami',
      'nav.tentang': 'Tentang',
      'nav.beranda': 'Beranda',
      'nav.belanja': 'Belanja',
      'nav.profil': 'Profil',
      'nav.profile': 'Profile',
      'nav.keranjang': 'Keranjang',
      'nav.masukDaftar': 'Masuk / Daftar',
      'nav.keluar': 'Keluar',
      'nav.butuhBantuan': 'Butuh Bantuan?',
      'nav.bukaMenu': 'Buka menu',
      'nav.keranjangBelanja': 'Keranjang Belanja',
      'nav.kembali': ' Kembali',
      'nav.brandKeranjang': 'Nexora Market | Keranjang',
      'nav.brandCheckout': 'Nexora Market | Checkout',
      'nav.brandAkun': 'Nexora Market | Akun Saya',

      /* --- Tombol tema & bahasa --- */
      'tema.keTerang': 'Ganti ke Mode Terang',
      'tema.keGelap': 'Ganti ke Mode Gelap',
      'tema.label': 'Mode Gelap/Terang',
      'tema.notifGelap': 'Beralih ke mode Gelap (Dark)',
      'tema.notifTerang': 'Beralih ke mode Terang (Light)',
      'bahasa.judul': 'Ganti Bahasa (Indonesia / English)',
      'bahasa.label': 'Bahasa: Indonesia',
      'bahasa.notif': 'Bahasa diubah ke Indonesia',

      /* --- Kotak pencarian --- */
      'cari.tombol': 'Cari',
      'cari.ph.index': 'Cari pakaian, jaket, sneakers, atau aksesoris...',
      'cari.ph.katalog': 'Cari kemeja, jaket varsity, sneakers impianmu...',
      'cari.ph.keranjang': 'Cari di dalam keranjang...',

      /* --- Beranda (index.html) --- */
      'index.heroTag': ' Official Store Festival',
      'index.heroJudul1': 'Belanja Fashion Trendi di',
      'index.heroBrand': 'Nexora Market',
      'index.heroDeskripsi':
        'Koleksi pakaian, sepatu, dan jaket berkualitas tinggi dengan jaminan 100% original dan gratis ongkir.',
      'index.heroTombol': 'Mulai Belanja Sekarang →',
      'index.sideDiskonJudul': 'Diskon Kilat 40%',
      'index.sideDiskonDesk': 'Klaim voucher pengguna baru',
      'index.sideOngkirJudul': 'Bebas Ongkir',
      'index.sideOngkirDesk': 'Min. belanja Rp 150.000',
      'index.kategoriJudul': 'Kategori Pilihan',
      'index.fiturKilatJudul': 'Pengiriman Kilat',
      'index.fiturKilatDesk': 'Langsung diproses di hari yang sama',
      'index.fiturOriJudul': 'Garansi 100% Ori',
      'index.fiturOriDesk': 'Barang cacat diganti baru',
      'index.fiturBayarJudul': 'Pembayaran Fleksibel',
      'index.fiturBayarDesk': 'QRIS, DANA, GoPay, & COD',

      /* --- Halaman katalog (bagianDalam.html) --- */
      'katalog.heroJudul1': 'Promo Terbesar',
      'katalog.heroBrand': 'Nexora Festival',
      'katalog.heroDeskripsi':
        'Gratis Ongkir ke seluruh Indonesia min. belanja Rp 150rb & Cashback mingguan.',
      'katalog.sideBaruJudul': 'Koleksi Baru',
      'katalog.sideBaruDesk': 'Tren fashion terpopuler',
      'katalog.sideVoucherJudul': 'Flash Voucher',
      'katalog.sideVoucherDesk': 'Klaim diskon pilihan',
      'katalog.kategoriJudul': 'Kategori Unggulan',

      /* --- Kategori produk --- */
      'kategori.semua': 'Semua',
      'kategori.pakaian': 'Pakaian',
      'kategori.sepatu': 'Sepatu',
      'kategori.celana': 'Celana',
      'kategori.jaket': 'Jaket',
      'kategori.topi': 'Topi',
      'kategori.tas': 'Tas',
      'kategori.alattulis': 'Alat Tulis',
      'kategori.komputer': 'Komputer',

      /* --- Voucher & tab urutan --- */
      'voucher.judul': ' Voucher Spesial Buat Kamu',
      'voucher.salin': 'Salin Kode',
      'urut.label': 'Urutkan:',
      'urut.terkait': 'Terkait',
      'urut.terbaru': 'Terbaru',
      'urut.terlaris': 'Terlaris',

      /* --- Footer --- */
      'footer.layananPelanggan': 'Layanan Pelanggan',
      'footer.pusatBantuan': 'Pusat Bantuan',
      'footer.caraPembelian': 'Cara Pembelian',
      'footer.pengembalian': 'Pengembalian Barang',
      'footer.bantuanFaq': 'Bantuan & FAQ',
      'footer.garansi': 'Kebijakan Garansi',
      'footer.lacakPesanan': 'Lacak Pesanan',
      'footer.jelajahi': 'Jelajahi Nexora',
      'footer.kebijakanPrivasi': 'Kebijakan Privasi',
      'footer.metodePembayaran': 'Metode Pembayaran',
      'footer.metodeDesk': 'QRIS, DANA, GoPay, dan Bayar di Tempat (COD).',
      'footer.metodeDeskSingkat': 'QRIS, DANA, GoPay, COD (Bayar di Tempat)',
      'footer.kontakKami': 'Kontak Kami',
      'footer.hubungiKami': 'Hubungi Kami',
      'footer.email': 'Email: support@nexoramarket.id',
      'footer.wa': 'WhatsApp: +62 895-3686-27820',
      'footer.hakCipta': '© 2026 Nexora Market. Hak Cipta Dilindungi Undang-Undang.',

      /* --- Halaman Tentang Kami --- */
      'about.breadcrumb': 'Tentang Kami',
      'about.judul': 'Tentang Nexora Market',
      'about.brand': 'Nexora Market',
      'about.paragraf1':
        ' didirikan dengan misi memberikan akses termudah bagi siapa saja untuk tampil percaya diri melalui busana, sepatu, dan aksesoris berkualitas tinggi tanpa harus menguras kantong.',
      'about.paragraf2':
        'Kami menyatukan kenyamanan belanja digital ala marketplace modern dengan kurasi produk ketat untuk memastikan kepuasan konsumen mulai dari pemilihan katalog hingga barang tiba di depan pintu rumah.',
      'about.nilai1Judul': ' Kurasi Kualitas Ketat',
      'about.nilai1Desk':
        'Setiap produk melewati proses pemeriksaan mutu agar hanya barang terbaik yang sampai ke tanganmu.',
      'about.nilai2Judul': ' Pengiriman Handal',
      'about.nilai2Desk':
        'Didukung jaringan ekspedisi terpercaya ke seluruh penjuru nusantara dengan pelacakan real-time.',
      'about.nilai3Judul': ' Layanan Pelanggan 24/7',
      'about.nilai3Desk':
        'Tim kami siap membantu segala pertanyaan pesanan, garansi retur, dan konsultasi produk setiap saat.',

      /* --- Halaman Layanan Pelanggan --- */
      'layanan.breadcrumb': 'Layanan Pelanggan',
      'layanan.judul': 'Layanan Pelanggan',
      'layanan.intro':
        'Semua yang perlu kamu tahu soal belanja di Nexora Market — mulai dari cara pesan, kebijakan pengembalian, garansi, sampai bagaimana kami menjaga data pribadimu — ada di satu halaman ini.',
      'layanan.pilFaq': ' Bantuan & FAQ',
      'layanan.pilCara': ' Cara Pembelian',
      'layanan.pilRetur': ' Pengembalian Barang',
      'layanan.pilGaransi': ' Kebijakan Garansi',
      'layanan.pilLacak': ' Lacak Pesanan',
      'layanan.pilBayar': ' Metode Pembayaran',
      'layanan.pilPrivasi': ' Kebijakan Privasi',
      'layanan.faqJudul': ' Bantuan & FAQ',
      'layanan.faq1T': 'Bagaimana cara memesan produk di Nexora Market?',
      'layanan.faq1J':
        'Pilih produk yang kamu suka, masukkan ke keranjang, lalu lanjut ke checkout. Kamu perlu masuk atau daftar akun terlebih dahulu sebelum bisa menyelesaikan pesanan.',
      'layanan.faq2T': 'Apakah saya wajib punya akun untuk belanja?',
      'layanan.faq2J':
        'Ya. Membuat akun membantu kami menyimpan alamat pengirimanmu dan menampilkan riwayat pesanan, supaya proses checkout berikutnya jadi lebih cepat.',
      'layanan.faq3T': 'Berapa lama pesanan saya diproses?',
      'layanan.faq3J':
        'Pesanan umumnya diproses di hari yang sama setelah pembayaran dikonfirmasi, lalu diteruskan ke jasa ekspedisi untuk pengiriman.',
      'layanan.faq4T': 'Bagaimana jika ada masalah dengan pesanan saya?',
      'layanan.faq4J':
        'Hubungi tim kami lewat email atau WhatsApp yang tertera di bagian bawah halaman ini, sertakan nomor pesananmu supaya lebih cepat ditangani.',
      'layanan.caraJudul': ' Cara Pembelian',
      'layanan.cara1':
        'Jelajahi katalog di halaman Beranda, gunakan pencarian atau filter kategori untuk menemukan produk yang kamu mau.',
      'layanan.cara2':
        'Klik produk untuk melihat detail, pilih varian/ukuran bila tersedia, lalu tambahkan ke keranjang.',
      'layanan.cara3':
        'Buka halaman Keranjang, centang barang yang ingin dibeli, lalu tekan tombol Checkout.',
      'layanan.cara4':
        'Lengkapi alamat pengiriman (atau pakai alamat yang sudah tersimpan di profil), pilih metode pembayaran, dan terapkan kode kupon jika ada.',
      'layanan.cara5':
        'Selesaikan pembayaran sesuai metode yang dipilih. Setelah berhasil, pesanan akan muncul di riwayat pesanan pada halaman Profil.',
      'layanan.returJudul': ' Pengembalian Barang',
      'layanan.returIntro':
        'Kami ingin kamu puas dengan setiap pembelian. Barang dapat diajukan pengembalian/penukaran dengan ketentuan berikut:',
      'layanan.retur1a': 'Pengajuan dilakukan maksimal ',
      'layanan.retur1b': '7 hari',
      'layanan.retur1c': ' setelah barang diterima.',
      'layanan.retur2': 'Barang belum pernah dipakai, dicuci, atau dirusak, dan label/tag masih terpasang.',
      'layanan.retur3':
        'Sertakan foto/video unboxing sebagai bukti pendukung jika barang diterima dalam kondisi cacat atau tidak sesuai pesanan.',
      'layanan.retur4':
        'Ongkos kirim pengembalian ditanggung pembeli, kecuali kesalahan pengiriman berasal dari pihak Nexora Market (barang salah kirim, cacat produksi, dsb).',
      'layanan.returPenutup':
        'Untuk mengajukan pengembalian, hubungi tim layanan pelanggan kami dengan menyertakan nomor pesanan.',
      'layanan.garansiJudul': ' Kebijakan Garansi',
      'layanan.garansiIntro':
        'Produk elektronik dan aksesoris tertentu (misalnya kategori Komputer) mendapat garansi resmi sesuai ketentuan dari merek terkait. Untuk produk fashion (pakaian, sepatu, tas, dsb), garansi berlaku terhadap cacat produksi, bukan kerusakan akibat pemakaian normal.',
      'layanan.garansi1': 'Garansi cacat produksi berlaku 7 hari sejak barang diterima.',
      'layanan.garansi2':
        'Barang pengganti akan dikirim setelah barang lama kami terima dan verifikasi selesai.',
      'layanan.garansi3':
        'Kerusakan akibat kelalaian penggunaan (salah cuci, terkena bahan kimia, dll) di luar tanggungan garansi.',
      'layanan.lacakJudul': ' Lacak Pesanan',
      'layanan.lacak1a': 'Status dan riwayat semua pesananmu bisa dilihat langsung di halaman ',
      'layanan.lacak1b': 'Profil → Riwayat Pesanan',
      'layanan.lacak1c':
        '. Di sana tercatat nomor pesanan, tanggal, produk yang dibeli, metode pembayaran, dan total pembayaran untuk tiap transaksi.',
      'layanan.lacak2':
        'Kalau kamu butuh info pelacakan lebih detail dari pihak ekspedisi, hubungi tim kami dengan menyertakan nomor pesanan yang tertera di riwayat tersebut.',
      'layanan.bayarJudul': ' Metode Pembayaran',
      'layanan.bayarIntro':
        'Nexora Market mendukung beberapa metode pembayaran berikut saat checkout:',
      'layanan.bayarQrisNama': 'QRIS',
      'layanan.bayarQrisDesk':
        ' — satu kode QR yang bisa dipindai dari aplikasi DANA, GoPay, OVO, ShopeePay, atau m-banking yang mendukung QRIS. Kode QR dibuat unik untuk setiap transaksi dan berlaku selama 10 menit.',
      'layanan.bayarDanaNama': 'DANA',
      'layanan.bayarDanaDesk': ' — pembayaran langsung memakai nomor akun DANA kamu.',
      'layanan.bayarGopayNama': 'GoPay',
      'layanan.bayarGopayDesk': ' — pembayaran langsung memakai nomor akun GoPay kamu.',
      'layanan.bayarCodNama': 'Bayar di Tempat (COD)',
      'layanan.bayarCodDesk': ' — bayar tunai ke kurir saat barang tiba di alamatmu.',
      'layanan.bayarPenutup':
        'Punya kode kupon? Kupon bisa diterapkan di halaman pembayaran sebelum menyelesaikan transaksi, dan potongan harganya akan otomatis mengurangi total tagihan.',
      'layanan.privasiJudul': ' Kebijakan Privasi',
      'layanan.privasiIntro':
        'Privasimu penting buat kami. Berikut ringkasan bagaimana Nexora Market mengelola data pribadi pengguna:',
      'layanan.privasi1Nama': 'Data yang kami kumpulkan:',
      'layanan.privasi1Desk':
        ' nama, email, nomor HP, tanggal lahir, jenis kelamin, dan alamat pengiriman yang kamu masukkan saat mendaftar akun atau melakukan checkout.',
      'layanan.privasi2Nama': 'Penggunaan data:',
      'layanan.privasi2Desk':
        ' data tersebut dipakai untuk memproses pesanan, mengirim barang ke alamat yang benar, serta menghubungimu terkait status pesanan.',
      'layanan.privasi3Nama': 'Penyimpanan:',
      'layanan.privasi3Desk':
        ' data akun dan riwayat pesanan disimpan pada perangkat/browser yang kamu gunakan untuk mengakses situs ini.',
      'layanan.privasi4Nama': 'Pembagian data ke pihak ketiga:',
      'layanan.privasi4Desk':
        ' kami tidak menjual data pribadimu. Data hanya dibagikan ke penyedia layanan pengiriman/pembayaran sebatas yang diperlukan untuk menyelesaikan transaksi.',
      'layanan.privasi5Nama': 'Hak pengguna:',
      'layanan.privasi5Desk':
        ' kamu bisa memperbarui atau menghapus data pribadimu kapan saja lewat halaman Profil.',
      'layanan.privasi6Nama': 'Keamanan:',
      'layanan.privasi6Desk':
        ' kami menerapkan langkah wajar untuk melindungi data pengguna, namun tidak ada sistem yang 100% bebas risiko — segera hubungi kami bila menemukan aktivitas mencurigakan pada akunmu.',
      'layanan.privasiPenutup':
        'Ada pertanyaan soal privasi datamu? Hubungi kami lewat kontak di bawah halaman ini.',

      /* --- Halaman Masuk / Daftar --- */
      'auth.bannerJudul1': 'Jual Beli Fashion Mudah di',
      'auth.bannerBrand': 'Nexora',
      'auth.bannerDesk':
        'Bergabunglah dengan ribuan pengguna lainnya. Nikmati voucher belanja eksklusif, cashback mingguan, dan pengiriman kilat ke seluruh Indonesia.',
      'auth.statOri': 'Produk Original',
      'auth.statLayanan': 'Layanan Pelanggan',
      'auth.masukJudul': 'Masuk ke Akun',
      'auth.daftarJudul': 'Daftar Akun Baru',
      'auth.phEmail': 'Email Anda',
      'auth.phSandi': 'Kata Sandi',
      'auth.phNama': 'Nama Lengkap',
      'auth.phSandiBaru': 'Kata Sandi (min. 8 karakter)',
      'auth.phGender': 'Jenis Kelamin',
      'auth.genderL': 'Laki-laki',
      'auth.genderP': 'Perempuan',
      'auth.btnMasuk': 'Masuk',
      'auth.btnDaftar': 'Daftar',
      'auth.belumPunya': 'Belum punya akun? ',
      'auth.daftarSekarang': 'Daftar sekarang',
      'auth.sudahPunya': 'Sudah punya akun? ',
      'auth.masukDiSini': 'Masuk di sini',
      'auth.lihatSandi': 'Lihat Password',

      /* --- Halaman Keranjang --- */
      'keranjang.kosong': 'Keranjang belanja kamu masih kosong',
      'keranjang.belanjaSekarang': 'Belanja Sekarang',
      'keranjang.kolProduk': 'Produk',
      'keranjang.kolHarga': 'Harga Satuan',
      'keranjang.kolQty': 'Kuantitas',
      'keranjang.kolTotal': 'Total Harga',
      'keranjang.kolAksi': 'Aksi',
      'keranjang.hapusSemua': 'Hapus Semua',
      'keranjang.totalLabel1': 'Total (',
      'keranjang.totalLabel2': ' produk):',
      'keranjang.checkout': 'Checkout',
      'keranjang.labelHargaSatuan': 'Harga satuan: ',

      /* --- Halaman Pembayaran --- */
      'bayar.alamatJudul': ' Alamat Pengiriman',
      'bayar.btnEdit': ' Edit',
      'bayar.lblPenerima': 'Nama Penerima',
      'bayar.phPenerima': 'Nama Lengkap',
      'bayar.lblHp': 'Nomor HP',
      'bayar.lblProvinsi': 'Provinsi',
      'bayar.phProvinsi': 'Pilih Provinsi',
      'bayar.lblKota': 'Kota / Kabupaten',
      'bayar.phKota': 'Contoh: Kota Bandung',
      'bayar.lblKecamatan': 'Kecamatan',
      'bayar.phKecamatan': 'Contoh: Coblong',
      'bayar.lblKodePos': 'Kode Pos',
      'bayar.lblDetailAlamat': 'Detail Alamat',
      'bayar.phDetailAlamat': 'Nama jalan, gedung, No. rumah, RT/RW, patokan',
      'bayar.metodeJudul': ' Metode Pembayaran',
      'bayar.opsiQris': ' QRIS (Bisa pakai DANA, GoPay, OVO, ShopeePay, M-Banking)',
      'bayar.opsiDana': ' DANA',
      'bayar.opsiGopay': ' GoPay',
      'bayar.opsiCod': ' Bayar di Tempat (COD)',
      'bayar.btnBayar': 'Bayar Sekarang',
      'bayar.ringkasanJudul': 'Ringkasan Pembelian',
      'bayar.phKupon': 'Masukkan kode kupon',
      'bayar.btnTerapkanKupon': 'Terapkan',
      'bayar.hapusKupon': 'Hapus kupon',
      'bayar.subtotal': 'Subtotal Produk',
      'bayar.ongkir': 'Ongkos Kirim',
      'bayar.diskon': 'Diskon Kupon',
      'bayar.total': 'Total Pembayaran',
      'bayar.modalJudul': 'Pembayaran',
      'bayar.qrisAlt': 'Kode QRIS Pembayaran',
      'bayar.qrisNominal': 'Total Bayar: ',
      'bayar.qrisRef': 'Kode Referensi: ',
      'bayar.qrisTimer1': 'Selesaikan dalam ',
      'bayar.qrisDiterima1': 'Diterima ke akun ',
      'bayar.qrisDiterima2': ' merchant · NMID ',
      'bayar.qrisCatatan':
        'Setiap transaksi memiliki kode QR yang berbeda dan hanya berlaku satu kali. Pindai memakai kamera HP atau aplikasi pemindai QR untuk membuka halaman pembayaran.',
      'bayar.qrisPetunjuk':
        'Pindai QR ini dengan kamera HP kamu. Halaman pembayaran berisi rincian belanjaan akan terbuka di HP.',
      'bayar.qrisTautan': 'Buka halaman pembayaran di perangkat ini',
      'bayar.qrisPeringatanLokal':
        'Situs sedang dijalankan di localhost, jadi tautan di dalam QR ini tidak bisa dibuka dari HP. Akses situs lewat IP jaringan (mis. http://192.168.1.5:5500) atau isi NEXORA_BASIS_URL_PUBLIK di js/script.js.',
      'bayar.qrisPeringatanHttps':
        'Tautan di dalam QR memakai https:// untuk alamat IP jaringan lokal, padahal Live Server melayani http://. Ubah NEXORA_BASIS_URL_PUBLIK di js/script.js menjadi http:// (tanpa huruf s).',
      'bayar.ewalletHint':
        'Masukkan nomor HP yang terdaftar untuk melanjutkan pembayaran. Kamu akan menerima permintaan pembayaran (push notification) di aplikasi.',
      'bayar.phEwallet': 'Masukkan Nomor HP',
      'bayar.btnBatal': 'Batal',
      'bayar.btnSudahBayar': 'Saya Sudah Bayar',
      'bayar.suksesJudul': 'Pesanan Berhasil Dibuat!',
      'bayar.kembaliBeranda': 'Kembali ke Beranda',
      'bayar.kosong': 'Belum ada produk terpilih untuk dibayar.',
      'bayar.kembaliBelanja': 'Kembali Belanja',

      /* --- Halaman Profil --- */
      'profil.member': 'Member Nexora',
      'profil.pengguna': 'Pengguna',
      'profil.tabAkun': ' Pengaturan Akun',
      'profil.tabPesanan': ' Riwayat Pesanan',
      'profil.keluarAkun': ' Keluar dari Akun',
      'profil.judulAkun': 'Pengaturan Akun',
      'profil.lblNama': 'Nama Lengkap',
      'profil.lblEmail': 'Email Akun (Terkunci)',
      'profil.lblUmur': 'Umur',
      'profil.lblTanggalLahir': 'Tanggal Lahir',
      'profil.lblGender': 'Jenis Kelamin',
      'profil.lblNoHp': 'Nomor Handphone',
      'profil.lblProvinsi': 'Provinsi',
      'profil.lblKota': 'Kota / Kabupaten',
      'profil.lblKecamatan': 'Kecamatan',
      'profil.lblKodePos': 'Kode Pos',
      'profil.lblAlamat': 'Alamat Utama (Detail)',
      'profil.btnEdit': ' Edit Profil',
      'profil.btnSimpan': ' Simpan Perubahan',
      'profil.judulPesanan': 'Pesanan Saya',

      /* --- Halaman Konfirmasi Pembayaran (hasil scan QR) --- */
      'konfirmasi.judulHalaman': 'Konfirmasi Pembayaran',
      'konfirmasi.subJudul':
        'Periksa rincian belanjaanmu di bawah ini, lalu tekan tombol pembayaran selesai.',
      'konfirmasi.lblRef': 'Kode Referensi',
      'konfirmasi.lblMetode': 'Metode Pembayaran',
      'konfirmasi.lblKupon': 'Kupon Dipakai',
      'konfirmasi.rincian': 'Rincian Belanjaan',
      'konfirmasi.itemLain': 'dan {n} produk lainnya',
      'konfirmasi.sisaWaktu': 'Sisa waktu ',
      'konfirmasi.btnSelesai': 'Pembayaran Selesai',
      'konfirmasi.catatan':
        'Tekan tombol di atas setelah kamu menyelesaikan transfer. Halaman checkout di perangkat lain akan otomatis lanjut bila masih terbuka pada browser yang sama.',
      'konfirmasi.kedaluwarsaJudul': 'Kode QR Sudah Kedaluwarsa',
      'konfirmasi.kedaluwarsaDesk':
        'Masa berlaku kode QR ini sudah habis. Silakan ulangi proses checkout dari perangkat kamu untuk mendapat kode QR baru.',
      'konfirmasi.rusakJudul': 'Data Pembayaran Tidak Terbaca',
      'konfirmasi.rusakDesk':
        'Pastikan kamu memindai kode QR langsung dari halaman checkout Nexora Market, lalu coba lagi.',
      'konfirmasi.suksesJudul': 'Pembayaran Selesai!',
      'konfirmasi.suksesDesk': 'Pesanan dengan kode referensi {ref} sudah kami tandai lunas.',
      'konfirmasi.suksesCatatan':
        'Kamu bisa menutup halaman ini. Pesanan akan tercatat pada riwayat pesanan di akunmu.',
      'konfirmasi.notifSukses': 'Pembayaran berhasil dikonfirmasi!',
      'konfirmasi.gagalSinkron':
        'Pembayaran tercatat di perangkat ini, tapi komputer belum bisa diberi tahu otomatis. Selesaikan pesanan di komputer dengan menekan tombol "Saya Sudah Bayar".',
      'konfirmasi.kembaliBeranda': 'Kembali ke Beranda',

      /* --- Teks dinamis dari script.js --- */
      'js.produkTidakDitemukan': 'Produk tidak ditemukan. Coba kata kunci atau kategori lain.',
      'js.terjual': 'Terjual',
      'js.produk': 'Produk',
      'js.produkTanpaNama': 'Produk Tanpa Nama',
      'js.deskripsiDefault': 'Produk original berkualitas dari kurasi Nexora Market.',
      'js.kategoriLabel': 'Kategori: ',
      'js.kategoriUmum': 'Umum',
      'js.tersisa': 'Tersisa {n} buah',
      'js.spekJudul': 'Spesifikasi Produk:',
      'js.spekBahan': 'Bahan Material',
      'js.spekUkuran': 'Dimensi / Ukuran',
      'js.spekBerat': 'Berat Produk',
      'js.spekKota': 'Kota Pengiriman',
      'js.spekWarna': 'Varian Warna',
      'js.spekIsi': 'Isi Paket',
      'js.spekGaransi': 'Masa Garansi',
      'js.spekKondisi': 'Kondisi',
      'js.spekKondisiNilai': '100% Baru & Original',
      'js.masukkanKeranjang': ' Masukkan Keranjang',
      'js.beliSekarang': 'Beli Sekarang',
      'js.harusLogin': 'Silakan masuk (login) terlebih dahulu!',
      'js.harusLoginKeranjang': 'Silakan masuk akun terlebih dahulu untuk melihat keranjang!',
      'js.maksBeliStok': 'Maksimal pembelian {n} pcs sesuai sisa stok',
      'js.batasStok': 'Batas pembelian adalah sisa stok ({n} pcs)',
      'js.maksBeli': 'Maksimal pembelian {n} pcs',
      'js.masukKeranjang': '{nama} ({n} pcs) masuk ke keranjang!',
      'js.stokHabis': 'Maaf, stok produk ini sudah habis!',
      'js.stokKurang': 'Stok tidak mencukupi! Sisa stok: {n}',
      'js.hapus': 'Hapus',
      'js.barangDihapus': 'Barang dihapus dari keranjang',
      'js.konfirmasiKosongkan': 'Kosongkan semua barang di keranjang?',
      'js.keranjangDikosongkan': 'Keranjang telah dikosongkan',
      'js.pilihMinimalSatu': 'Pilih minimal satu produk!',
      'js.riwayatKosong': 'Belum ada riwayat pesanan. Mulai belanja produk favoritmu sekarang!',
      'js.noPesanan': 'No. Pesanan: ',
      'js.statusSelesai': 'Selesai Dibayar',
      'js.metodeLabel': 'Metode: ',
      'js.kuponLabel': ' • Kupon: ',
      'js.totalBelanja': 'Total Belanja: ',
      'js.profilDiperbarui': 'Profil berhasil diperbarui!',
      'js.konfirmasiKeluar': 'Apakah kamu yakin ingin keluar dari akun?',
      'js.sapaan': 'Hai, {nama}',
      'js.namaMin3': 'Nama lengkap minimal 3 karakter!',
      'js.namaTanpaSpasi': 'Nama tidak boleh mengandung spasi!',
      'js.emailTanpaSpasi': 'Email tidak boleh mengandung spasi!',
      'js.emailTidakValid': 'Format email tidak valid!',
      'js.sandiMin8': 'Kata sandi minimal 8 karakter!',
      'js.tanggalWajib': 'Tanggal lahir wajib diisi!',
      'js.tanggalMasaDepan': 'Tanggal lahir tidak boleh di masa depan!',
      'js.usiaTidakCocok': 'Usia ({n} thn) tidak cocok dengan tanggal lahir!',
      'js.emailTerdaftar': 'Email ini sudah terdaftar! Gunakan email lain.',
      'js.daftarBerhasil': 'Pendaftaran berhasil! Silakan masuk ke akunmu.',
      'js.emailBelumTerdaftar': 'Email belum terdaftar! Silakan daftar akun.',
      'js.sandiSalah': 'Kata sandi salah!',
      'js.loginBerhasil': 'Login berhasil! Mengalihkan...',
      'js.kodeDisalin': 'Kode {kode} disalin!',
      'js.gagalSalin': 'Gagal menyalin kode, silakan salin manual.',
      'js.kuponDipakai': ' (dipakai {n}/3x)',
      'js.kuponDiterapkanInfo': ' {kode} diterapkan',
      'js.kuponIsiKode': 'Masukkan kode kupon terlebih dahulu.',
      'js.kuponTidakDitemukan': 'Kode kupon tidak ditemukan atau sudah tidak berlaku.',
      'js.kuponBatasPakai':
        'Kamu sudah memakai kupon {kode} sebanyak {n}x, sudah mencapai batas maksimal.',
      'js.kuponMinBelanja': 'Kupon ini butuh minimal belanja {nominal}.',
      'js.kuponBerhasil': 'Kupon {kode} berhasil diterapkan!',
      'js.kuponDihapus': 'Kupon dihapus.',
      'js.namaMin3Bayar': 'Nama lengkap minimal 3 karakter.',
      'js.alamatMin10': 'Alamat lengkap minimal 10 karakter.',
      'js.provinsiWajib': 'Provinsi wajib dipilih.',
      'js.kotaKecamatanWajib': 'Kota/Kabupaten dan Kecamatan wajib diisi.',
      'js.kodePos5': 'Kode pos harus terdiri dari 5 angka.',
      'js.bayarViaQris': 'Pembayaran via QRIS',
      'js.bayarVia': 'Pembayaran via {metode}',
      'js.phEwalletNomor': 'Masukkan Nomor HP {metode} Kamu',
      'js.ewalletWajib': 'Nomor HP {metode} wajib diisi!',
      'js.nomorPesanan': 'Nomor Pesanan: ',
      'js.membuatQr': 'Membuat kode QR...',
      'js.bayarBerhasil': 'Pembayaran Berhasil! Pesanan tercatat di riwayat.',
      'js.qrTerbayar': 'Pembayaran QRIS dikonfirmasi dari halaman hasil scan!'
    },

    en: {
      /* --- Page titles --- */
      'judul.index': 'Nexora Market — Trusted Fashion Marketplace',
      'judul.katalog': 'Nexora Market — Product Catalog',
      'judul.about': 'About Us — Nexora Market',
      'judul.keranjang': 'Shopping Cart — Nexora Market',
      'judul.layanan': 'Customer Service — Nexora Market',
      'judul.auth': 'Sign In / Sign Up — Nexora Market',
      'judul.bayar': 'Checkout — Nexora Market',
      'judul.profil': 'My Profile — Nexora Market',
      'judul.konfirmasi': 'Payment Confirmation — Nexora Market',

      /* --- Navigation & header --- */
      'nav.bantuanPanduan': 'Help & Guide',
      'nav.bantuan': 'Help',
      'nav.tentangNexora': 'About Nexora',
      'nav.tentangKami': 'About Us',
      'nav.tentang': 'About',
      'nav.beranda': 'Home',
      'nav.belanja': 'Shop',
      'nav.profil': 'Profile',
      'nav.profile': 'Profile',
      'nav.keranjang': 'Cart',
      'nav.masukDaftar': 'Sign In / Sign Up',
      'nav.keluar': 'Sign Out',
      'nav.butuhBantuan': 'Need Help?',
      'nav.bukaMenu': 'Open menu',
      'nav.keranjangBelanja': 'Shopping Cart',
      'nav.kembali': ' Back',
      'nav.brandKeranjang': 'Nexora Market | Cart',
      'nav.brandCheckout': 'Nexora Market | Checkout',
      'nav.brandAkun': 'Nexora Market | My Account',

      /* --- Theme & language buttons --- */
      'tema.keTerang': 'Switch to Light Mode',
      'tema.keGelap': 'Switch to Dark Mode',
      'tema.label': 'Dark/Light Mode',
      'tema.notifGelap': 'Switched to Dark mode',
      'tema.notifTerang': 'Switched to Light mode',
      'bahasa.judul': 'Change Language (Indonesian / English)',
      'bahasa.label': 'Language: English',
      'bahasa.notif': 'Language changed to English',

      /* --- Search box --- */
      'cari.tombol': 'Search',
      'cari.ph.index': 'Search for clothes, jackets, sneakers, or accessories...',
      'cari.ph.katalog': 'Search shirts, varsity jackets, your dream sneakers...',
      'cari.ph.keranjang': 'Search inside your cart...',

      /* --- Home page --- */
      'index.heroTag': ' Official Store Festival',
      'index.heroJudul1': 'Shop Trendy Fashion at',
      'index.heroBrand': 'Nexora Market',
      'index.heroDeskripsi':
        'High-quality clothing, shoes, and jackets with a 100% authentic guarantee and free shipping.',
      'index.heroTombol': 'Start Shopping Now →',
      'index.sideDiskonJudul': 'Flash Sale 40% Off',
      'index.sideDiskonDesk': 'Claim your new-user voucher',
      'index.sideOngkirJudul': 'Free Shipping',
      'index.sideOngkirDesk': 'Min. spend Rp 150,000',
      'index.kategoriJudul': 'Featured Categories',
      'index.fiturKilatJudul': 'Express Delivery',
      'index.fiturKilatDesk': 'Processed on the same day',
      'index.fiturOriJudul': '100% Authentic Guarantee',
      'index.fiturOriDesk': 'Defective items replaced with new ones',
      'index.fiturBayarJudul': 'Flexible Payment',
      'index.fiturBayarDesk': 'QRIS, DANA, GoPay, & COD',

      /* --- Catalog page --- */
      'katalog.heroJudul1': 'Biggest Promo',
      'katalog.heroBrand': 'Nexora Festival',
      'katalog.heroDeskripsi':
        'Free shipping across Indonesia with min. spend Rp 150k & weekly cashback.',
      'katalog.sideBaruJudul': 'New Arrivals',
      'katalog.sideBaruDesk': 'The most popular fashion trends',
      'katalog.sideVoucherJudul': 'Flash Voucher',
      'katalog.sideVoucherDesk': 'Claim a discount of your choice',
      'katalog.kategoriJudul': 'Top Categories',

      /* --- Product categories --- */
      'kategori.semua': 'All',
      'kategori.pakaian': 'Clothing',
      'kategori.sepatu': 'Shoes',
      'kategori.celana': 'Pants',
      'kategori.jaket': 'Jackets',
      'kategori.topi': 'Hats',
      'kategori.tas': 'Bags',
      'kategori.alattulis': 'Stationery',
      'kategori.komputer': 'Computers',

      /* --- Vouchers & sorting --- */
      'voucher.judul': ' Special Vouchers For You',
      'voucher.salin': 'Copy Code',
      'urut.label': 'Sort by:',
      'urut.terkait': 'Relevance',
      'urut.terbaru': 'Newest',
      'urut.terlaris': 'Best Selling',

      /* --- Footer --- */
      'footer.layananPelanggan': 'Customer Service',
      'footer.pusatBantuan': 'Help Center',
      'footer.caraPembelian': 'How to Order',
      'footer.pengembalian': 'Returns',
      'footer.bantuanFaq': 'Help & FAQ',
      'footer.garansi': 'Warranty Policy',
      'footer.lacakPesanan': 'Track Order',
      'footer.jelajahi': 'Explore Nexora',
      'footer.kebijakanPrivasi': 'Privacy Policy',
      'footer.metodePembayaran': 'Payment Methods',
      'footer.metodeDesk': 'QRIS, DANA, GoPay, and Cash on Delivery (COD).',
      'footer.metodeDeskSingkat': 'QRIS, DANA, GoPay, COD (Cash on Delivery)',
      'footer.kontakKami': 'Contact Us',
      'footer.hubungiKami': 'Contact Us',
      'footer.email': 'Email: support@nexoramarket.id',
      'footer.wa': 'WhatsApp: +62 895-3686-27820',
      'footer.hakCipta': '© 2026 Nexora Market. All Rights Reserved.',

      /* --- About page --- */
      'about.breadcrumb': 'About Us',
      'about.judul': 'About Nexora Market',
      'about.brand': 'Nexora Market',
      'about.paragraf1':
        ' was founded with a mission to give everyone the easiest access to feeling confident through high-quality clothing, shoes, and accessories — without breaking the bank.',
      'about.paragraf2':
        'We combine the convenience of modern marketplace shopping with strict product curation, so customers are satisfied from browsing the catalog all the way to the package arriving at their door.',
      'about.nilai1Judul': ' Strict Quality Curation',
      'about.nilai1Desk':
        'Every product goes through a quality inspection so only the best items reach your hands.',
      'about.nilai2Judul': ' Reliable Delivery',
      'about.nilai2Desk':
        'Backed by trusted courier networks across the archipelago with real-time tracking.',
      'about.nilai3Judul': ' 24/7 Customer Service',
      'about.nilai3Desk':
        'Our team is ready to help with order questions, return warranties, and product advice at any time.',

      /* --- Customer service page --- */
      'layanan.breadcrumb': 'Customer Service',
      'layanan.judul': 'Customer Service',
      'layanan.intro':
        'Everything you need to know about shopping at Nexora Market — from how to order, the return policy and warranty, to how we protect your personal data — all on this one page.',
      'layanan.pilFaq': ' Help & FAQ',
      'layanan.pilCara': ' How to Order',
      'layanan.pilRetur': ' Returns',
      'layanan.pilGaransi': ' Warranty Policy',
      'layanan.pilLacak': ' Track Order',
      'layanan.pilBayar': ' Payment Methods',
      'layanan.pilPrivasi': ' Privacy Policy',
      'layanan.faqJudul': ' Help & FAQ',
      'layanan.faq1T': 'How do I order a product on Nexora Market?',
      'layanan.faq1J':
        'Pick the product you like, add it to your cart, then continue to checkout. You need to sign in or create an account before you can complete an order.',
      'layanan.faq2T': 'Do I need an account to shop?',
      'layanan.faq2J':
        'Yes. Creating an account lets us save your shipping address and show your order history, so your next checkout is faster.',
      'layanan.faq3T': 'How long does it take to process my order?',
      'layanan.faq3J':
        'Orders are usually processed the same day once payment is confirmed, then handed over to the courier for delivery.',
      'layanan.faq4T': 'What if there is a problem with my order?',
      'layanan.faq4J':
        'Contact our team via the email or WhatsApp listed at the bottom of this page, and include your order number so we can help faster.',
      'layanan.caraJudul': ' How to Order',
      'layanan.cara1':
        'Browse the catalog on the Home page, and use search or the category filter to find the product you want.',
      'layanan.cara2':
        'Click a product to see its details, choose a variant/size if available, then add it to your cart.',
      'layanan.cara3': 'Open the Cart page, tick the items you want to buy, then press Checkout.',
      'layanan.cara4':
        'Complete the shipping address (or use the one saved in your profile), choose a payment method, and apply a coupon code if you have one.',
      'layanan.cara5':
        'Complete the payment with your chosen method. Once successful, the order appears in the order history on your Profile page.',
      'layanan.returJudul': ' Returns',
      'layanan.returIntro':
        'We want you to be happy with every purchase. Items can be returned or exchanged under these terms:',
      'layanan.retur1a': 'Requests must be made within ',
      'layanan.retur1b': '7 days',
      'layanan.retur1c': ' of receiving the item.',
      'layanan.retur2':
        'The item has not been used, washed, or damaged, and the labels/tags are still attached.',
      'layanan.retur3':
        'Include unboxing photos/video as supporting evidence if the item arrives defective or does not match the order.',
      'layanan.retur4':
        'Return shipping costs are borne by the buyer, unless the shipping error came from Nexora Market (wrong item sent, manufacturing defect, etc).',
      'layanan.returPenutup':
        'To request a return, contact our customer service team and include your order number.',
      'layanan.garansiJudul': ' Warranty Policy',
      'layanan.garansiIntro':
        'Certain electronics and accessories (for example the Computers category) come with an official warranty according to the brand’s terms. For fashion products (clothing, shoes, bags, etc), the warranty covers manufacturing defects, not damage from normal use.',
      'layanan.garansi1': 'The manufacturing-defect warranty is valid for 7 days after delivery.',
      'layanan.garansi2':
        'A replacement item is shipped once we receive the old item and finish verification.',
      'layanan.garansi3':
        'Damage caused by misuse (wrong washing, chemical exposure, etc) is not covered by the warranty.',
      'layanan.lacakJudul': ' Track Order',
      'layanan.lacak1a': 'The status and history of all your orders can be seen on the ',
      'layanan.lacak1b': 'Profile → Order History',
      'layanan.lacak1c':
        ' page. It records the order number, date, purchased products, payment method, and total payment for each transaction.',
      'layanan.lacak2':
        'If you need more detailed tracking info from the courier, contact our team and include the order number shown in that history.',
      'layanan.bayarJudul': ' Payment Methods',
      'layanan.bayarIntro': 'Nexora Market supports the following payment methods at checkout:',
      'layanan.bayarQrisNama': 'QRIS',
      'layanan.bayarQrisDesk':
        ' — a single QR code you can scan from DANA, GoPay, OVO, ShopeePay, or any m-banking app that supports QRIS. The QR code is unique per transaction and valid for 10 minutes.',
      'layanan.bayarDanaNama': 'DANA',
      'layanan.bayarDanaDesk': ' — pay directly using your DANA account number.',
      'layanan.bayarGopayNama': 'GoPay',
      'layanan.bayarGopayDesk': ' — pay directly using your GoPay account number.',
      'layanan.bayarCodNama': 'Cash on Delivery (COD)',
      'layanan.bayarCodDesk': ' — pay the courier in cash when the item arrives at your address.',
      'layanan.bayarPenutup':
        'Got a coupon code? Coupons can be applied on the checkout page before completing the transaction, and the discount is automatically deducted from your total.',
      'layanan.privasiJudul': ' Privacy Policy',
      'layanan.privasiIntro':
        'Your privacy matters to us. Here is a summary of how Nexora Market handles user personal data:',
      'layanan.privasi1Nama': 'Data we collect:',
      'layanan.privasi1Desk':
        ' name, email, phone number, date of birth, gender, and the shipping address you enter when registering an account or checking out.',
      'layanan.privasi2Nama': 'How data is used:',
      'layanan.privasi2Desk':
        ' that data is used to process orders, ship items to the correct address, and contact you about your order status.',
      'layanan.privasi3Nama': 'Storage:',
      'layanan.privasi3Desk':
        ' account data and order history are stored on the device/browser you use to access this site.',
      'layanan.privasi4Nama': 'Sharing with third parties:',
      'layanan.privasi4Desk':
        ' we do not sell your personal data. It is only shared with shipping/payment providers to the extent needed to complete a transaction.',
      'layanan.privasi5Nama': 'Your rights:',
      'layanan.privasi5Desk':
        ' you can update or delete your personal data at any time from the Profile page.',
      'layanan.privasi6Nama': 'Security:',
      'layanan.privasi6Desk':
        ' we take reasonable steps to protect user data, but no system is 100% risk-free — contact us immediately if you notice suspicious activity on your account.',
      'layanan.privasiPenutup':
        'Questions about your data privacy? Reach us through the contacts at the bottom of this page.',

      /* --- Sign in / Sign up page --- */
      'auth.bannerJudul1': 'Easy Fashion Shopping at',
      'auth.bannerBrand': 'Nexora',
      'auth.bannerDesk':
        'Join thousands of other users. Enjoy exclusive shopping vouchers, weekly cashback, and express delivery across Indonesia.',
      'auth.statOri': 'Authentic Products',
      'auth.statLayanan': 'Customer Service',
      'auth.masukJudul': 'Sign In to Your Account',
      'auth.daftarJudul': 'Create a New Account',
      'auth.phEmail': 'Your Email',
      'auth.phSandi': 'Password',
      'auth.phNama': 'Full Name',
      'auth.phSandiBaru': 'Password (min. 8 characters)',
      'auth.phGender': 'Gender',
      'auth.genderL': 'Male',
      'auth.genderP': 'Female',
      'auth.btnMasuk': 'Sign In',
      'auth.btnDaftar': 'Sign Up',
      'auth.belumPunya': "Don't have an account? ",
      'auth.daftarSekarang': 'Sign up now',
      'auth.sudahPunya': 'Already have an account? ',
      'auth.masukDiSini': 'Sign in here',
      'auth.lihatSandi': 'Show Password',

      /* --- Cart page --- */
      'keranjang.kosong': 'Your shopping cart is still empty',
      'keranjang.belanjaSekarang': 'Shop Now',
      'keranjang.kolProduk': 'Product',
      'keranjang.kolHarga': 'Unit Price',
      'keranjang.kolQty': 'Quantity',
      'keranjang.kolTotal': 'Total Price',
      'keranjang.kolAksi': 'Action',
      'keranjang.hapusSemua': 'Remove All',
      'keranjang.totalLabel1': 'Total (',
      'keranjang.totalLabel2': ' items):',
      'keranjang.checkout': 'Checkout',
      'keranjang.labelHargaSatuan': 'Unit price: ',

      /* --- Checkout page --- */
      'bayar.alamatJudul': ' Shipping Address',
      'bayar.btnEdit': ' Edit',
      'bayar.lblPenerima': 'Recipient Name',
      'bayar.phPenerima': 'Full Name',
      'bayar.lblHp': 'Phone Number',
      'bayar.lblProvinsi': 'Province',
      'bayar.phProvinsi': 'Select Province',
      'bayar.lblKota': 'City / Regency',
      'bayar.phKota': 'Example: Bandung City',
      'bayar.lblKecamatan': 'District',
      'bayar.phKecamatan': 'Example: Coblong',
      'bayar.lblKodePos': 'Postal Code',
      'bayar.lblDetailAlamat': 'Address Details',
      'bayar.phDetailAlamat': 'Street name, building, house no., RT/RW, landmark',
      'bayar.metodeJudul': ' Payment Method',
      'bayar.opsiQris': ' QRIS (Works with DANA, GoPay, OVO, ShopeePay, M-Banking)',
      'bayar.opsiDana': ' DANA',
      'bayar.opsiGopay': ' GoPay',
      'bayar.opsiCod': ' Cash on Delivery (COD)',
      'bayar.btnBayar': 'Pay Now',
      'bayar.ringkasanJudul': 'Order Summary',
      'bayar.phKupon': 'Enter coupon code',
      'bayar.btnTerapkanKupon': 'Apply',
      'bayar.hapusKupon': 'Remove coupon',
      'bayar.subtotal': 'Product Subtotal',
      'bayar.ongkir': 'Shipping Cost',
      'bayar.diskon': 'Coupon Discount',
      'bayar.total': 'Total Payment',
      'bayar.modalJudul': 'Payment',
      'bayar.qrisAlt': 'QRIS Payment Code',
      'bayar.qrisNominal': 'Amount Due: ',
      'bayar.qrisRef': 'Reference Code: ',
      'bayar.qrisTimer1': 'Complete within ',
      'bayar.qrisDiterima1': 'Received in merchant ',
      'bayar.qrisDiterima2': ' account · NMID ',
      'bayar.qrisCatatan':
        'Every transaction has a different QR code and it can only be used once. Scan it with your phone camera or any QR scanner app to open the payment page.',
      'bayar.qrisPetunjuk':
        'Scan this QR with your phone camera. A payment page with your order details will open on your phone.',
      'bayar.qrisTautan': 'Open the payment page on this device',
      'bayar.qrisPeringatanLokal':
        'This site is running on localhost, so the link inside this QR cannot be opened from a phone. Serve the site over your network IP (e.g. http://192.168.1.5:5500) or set NEXORA_BASIS_URL_PUBLIK in js/script.js.',
      'bayar.qrisPeringatanHttps':
        'The link inside this QR uses https:// for a local network IP, but Live Server only serves http://. Change NEXORA_BASIS_URL_PUBLIK in js/script.js to http:// (without the s).',
      'bayar.ewalletHint':
        'Enter your registered phone number to continue the payment. You will receive a payment request (push notification) in the app.',
      'bayar.phEwallet': 'Enter Phone Number',
      'bayar.btnBatal': 'Cancel',
      'bayar.btnSudahBayar': "I've Paid",
      'bayar.suksesJudul': 'Order Created Successfully!',
      'bayar.kembaliBeranda': 'Back to Home',
      'bayar.kosong': 'No products have been selected for payment yet.',
      'bayar.kembaliBelanja': 'Back to Shopping',

      /* --- Profile page --- */
      'profil.member': 'Nexora Member',
      'profil.pengguna': 'User',
      'profil.tabAkun': ' Account Settings',
      'profil.tabPesanan': ' Order History',
      'profil.keluarAkun': ' Sign Out',
      'profil.judulAkun': 'Account Settings',
      'profil.lblNama': 'Full Name',
      'profil.lblEmail': 'Account Email (Locked)',
      'profil.lblUmur': 'Age',
      'profil.lblTanggalLahir': 'Date of Birth',
      'profil.lblGender': 'Gender',
      'profil.lblNoHp': 'Phone Number',
      'profil.lblProvinsi': 'Province',
      'profil.lblKota': 'City / Regency',
      'profil.lblKecamatan': 'District',
      'profil.lblKodePos': 'Postal Code',
      'profil.lblAlamat': 'Primary Address (Details)',
      'profil.btnEdit': ' Edit Profile',
      'profil.btnSimpan': ' Save Changes',
      'profil.judulPesanan': 'My Orders',

      /* --- Payment Confirmation page (opened by scanning the QR) --- */
      'konfirmasi.judulHalaman': 'Payment Confirmation',
      'konfirmasi.subJudul':
        'Check your order details below, then tap the payment complete button.',
      'konfirmasi.lblRef': 'Reference Code',
      'konfirmasi.lblMetode': 'Payment Method',
      'konfirmasi.lblKupon': 'Coupon Used',
      'konfirmasi.rincian': 'Order Details',
      'konfirmasi.itemLain': 'and {n} more products',
      'konfirmasi.sisaWaktu': 'Time left ',
      'konfirmasi.btnSelesai': 'Payment Complete',
      'konfirmasi.catatan':
        'Tap the button above once you have completed the transfer. The checkout page on your other device will continue automatically if it is still open in the same browser.',
      'konfirmasi.kedaluwarsaJudul': 'This QR Code Has Expired',
      'konfirmasi.kedaluwarsaDesk':
        'This QR code is no longer valid. Please redo the checkout on your device to get a new QR code.',
      'konfirmasi.rusakJudul': 'Payment Data Could Not Be Read',
      'konfirmasi.rusakDesk':
        'Make sure you scanned the QR code directly from the Nexora Market checkout page, then try again.',
      'konfirmasi.suksesJudul': 'Payment Complete!',
      'konfirmasi.suksesDesk': 'The order with reference code {ref} has been marked as paid.',
      'konfirmasi.suksesCatatan':
        'You can close this page. The order will be recorded in your account order history.',
      'konfirmasi.notifSukses': 'Payment confirmed successfully!',
      'konfirmasi.gagalSinkron':
        'Payment was recorded on this device, but the computer could not be notified automatically. Finish the order there by pressing the "I\'ve Paid" button.',
      'konfirmasi.kembaliBeranda': 'Back to Home',

      /* --- Dynamic text from script.js --- */
      'js.produkTidakDitemukan': 'No products found. Try another keyword or category.',
      'js.terjual': 'Sold',
      'js.produk': 'Product',
      'js.produkTanpaNama': 'Unnamed Product',
      'js.deskripsiDefault': 'Authentic, high-quality product curated by Nexora Market.',
      'js.kategoriLabel': 'Category: ',
      'js.kategoriUmum': 'General',
      'js.tersisa': '{n} left in stock',
      'js.spekJudul': 'Product Specifications:',
      'js.spekBahan': 'Material',
      'js.spekUkuran': 'Dimensions / Size',
      'js.spekBerat': 'Product Weight',
      'js.spekKota': 'Ships From',
      'js.spekWarna': 'Color Variant',
      'js.spekIsi': 'Package Contents',
      'js.spekGaransi': 'Warranty Period',
      'js.spekKondisi': 'Condition',
      'js.spekKondisiNilai': '100% New & Authentic',
      'js.masukkanKeranjang': ' Add to Cart',
      'js.beliSekarang': 'Buy Now',
      'js.harusLogin': 'Please sign in first!',
      'js.harusLoginKeranjang': 'Please sign in first to view your cart!',
      'js.maksBeliStok': 'You can buy at most {n} pcs based on remaining stock',
      'js.batasStok': 'Purchase is limited to the remaining stock ({n} pcs)',
      'js.maksBeli': 'You can buy at most {n} pcs',
      'js.masukKeranjang': '{nama} ({n} pcs) added to your cart!',
      'js.stokHabis': 'Sorry, this product is out of stock!',
      'js.stokKurang': 'Not enough stock! Remaining: {n}',
      'js.hapus': 'Remove',
      'js.barangDihapus': 'Item removed from cart',
      'js.konfirmasiKosongkan': 'Remove all items from the cart?',
      'js.keranjangDikosongkan': 'The cart has been emptied',
      'js.pilihMinimalSatu': 'Select at least one product!',
      'js.riwayatKosong': 'No order history yet. Start shopping for your favorites now!',
      'js.noPesanan': 'Order No.: ',
      'js.statusSelesai': 'Payment Complete',
      'js.metodeLabel': 'Method: ',
      'js.kuponLabel': ' • Coupon: ',
      'js.totalBelanja': 'Order Total: ',
      'js.profilDiperbarui': 'Profile updated successfully!',
      'js.konfirmasiKeluar': 'Are you sure you want to sign out?',
      'js.sapaan': 'Hi, {nama}',
      'js.namaMin3': 'Full name must be at least 3 characters!',
      'js.namaTanpaSpasi': 'Name cannot contain spaces!',
      'js.emailTanpaSpasi': 'Email cannot contain spaces!',
      'js.emailTidakValid': 'Invalid email format!',
      'js.sandiMin8': 'Password must be at least 8 characters!',
      'js.tanggalWajib': 'Date of birth is required!',
      'js.tanggalMasaDepan': 'Date of birth cannot be in the future!',
      'js.usiaTidakCocok': 'Age ({n} yrs) does not match the date of birth!',
      'js.emailTerdaftar': 'This email is already registered! Please use another one.',
      'js.daftarBerhasil': 'Registration successful! Please sign in to your account.',
      'js.emailBelumTerdaftar': 'Email is not registered! Please create an account.',
      'js.sandiSalah': 'Wrong password!',
      'js.loginBerhasil': 'Sign in successful! Redirecting...',
      'js.kodeDisalin': 'Code {kode} copied!',
      'js.gagalSalin': 'Failed to copy the code, please copy it manually.',
      'js.kuponDipakai': ' (used {n}/3x)',
      'js.kuponDiterapkanInfo': ' {kode} applied',
      'js.kuponIsiKode': 'Enter a coupon code first.',
      'js.kuponTidakDitemukan': 'Coupon code not found or no longer valid.',
      'js.kuponBatasPakai':
        'You have already used coupon {kode} {n} times, which is the maximum limit.',
      'js.kuponMinBelanja': 'This coupon requires a minimum spend of {nominal}.',
      'js.kuponBerhasil': 'Coupon {kode} applied successfully!',
      'js.kuponDihapus': 'Coupon removed.',
      'js.namaMin3Bayar': 'Full name must be at least 3 characters.',
      'js.alamatMin10': 'Full address must be at least 10 characters.',
      'js.provinsiWajib': 'Province is required.',
      'js.kotaKecamatanWajib': 'City/Regency and District are required.',
      'js.kodePos5': 'Postal code must be 5 digits.',
      'js.bayarViaQris': 'Payment via QRIS',
      'js.bayarVia': 'Payment via {metode}',
      'js.phEwalletNomor': 'Enter Your {metode} Phone Number',
      'js.ewalletWajib': '{metode} phone number is required!',
      'js.nomorPesanan': 'Order Number: ',
      'js.membuatQr': 'Generating QR code...',
      'js.bayarBerhasil': 'Payment successful! The order is saved in your history.',
      'js.qrTerbayar': 'QRIS payment confirmed from the scanned page!'
    }
  };

  /* ---------- STATE BAHASA ---------- */
  let bahasaAktif = BAHASA_DEFAULT;
  try {
    const tersimpan = localStorage.getItem(KUNCI_PENYIMPANAN);
    if (tersimpan === 'id' || tersimpan === 'en') bahasaAktif = tersimpan;
  } catch (e) {
    /* localStorage bisa diblokir browser; pakai default saja */
  }

  // Set atribut lang sedini mungkin supaya pembaca layar & browser tahu bahasanya
  document.documentElement.setAttribute('lang', bahasaAktif);

  /* ---------- FUNGSI TERJEMAHAN ----------
     t('js.tersisa', { n: 5 })  ->  "Tersisa 5 buah"
     Placeholder ditulis {nama} di dalam kamus. */
  function t(kunci, ganti) {
    const tabel = KAMUS[bahasaAktif] || KAMUS[BAHASA_DEFAULT];
    let teks = tabel[kunci];
    if (teks === undefined) teks = KAMUS[BAHASA_DEFAULT][kunci];
    if (teks === undefined) return kunci;
    if (ganti) {
      Object.keys(ganti).forEach(function (k) {
        teks = teks.split('{' + k + '}').join(String(ganti[k]));
      });
    }
    return teks;
  }

  /* Locale untuk tanggal & angka mengikuti bahasa aktif */
  function localeAktif() {
    return bahasaAktif === 'en' ? 'en-GB' : 'id-ID';
  }

  /* ---------- MENULIS TEKS TANPA MENGHAPUS IKON ----------
     Banyak elemen berisi <span class="material-symbols-outlined"> diikuti
     teks. Kalau dipakai textContent biasa, ikonnya ikut terhapus. Fungsi ini
     hanya mengganti bagian TEKS-nya dan membiarkan elemen anak (ikon) utuh. */
  function tulisTeks(el, teks) {
    let adaElemenAnak = false;
    Array.prototype.slice.call(el.childNodes).forEach(function (node) {
      if (node.nodeType === 1) adaElemenAnak = true;
      if (node.nodeType === 3) el.removeChild(node);
    });
    if (!adaElemenAnak) {
      el.textContent = teks;
    } else {
      el.appendChild(document.createTextNode(teks));
    }
  }

  /* ---------- TERAPKAN KE SELURUH ELEMEN BERTANDA ---------- */
  function terapkanBahasaKeDOM() {
    document.documentElement.setAttribute('lang', bahasaAktif);

    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      tulisTeks(el, t(el.dataset.i18n));
    });
    document.querySelectorAll('[data-i18n-ph]').forEach(function (el) {
      el.setAttribute('placeholder', t(el.dataset.i18nPh));
    });
    document.querySelectorAll('[data-i18n-title]').forEach(function (el) {
      el.setAttribute('title', t(el.dataset.i18nTitle));
    });
    document.querySelectorAll('[data-i18n-alt]').forEach(function (el) {
      el.setAttribute('alt', t(el.dataset.i18nAlt));
    });
    document.querySelectorAll('[data-i18n-aria]').forEach(function (el) {
      el.setAttribute('aria-label', t(el.dataset.i18nAria));
    });
    // Dipakai CSS: .menu-mobile-dropdown .btn-toggle-theme::after { content: attr(data-label) }
    document.querySelectorAll('[data-i18n-label]').forEach(function (el) {
      el.setAttribute('data-label', t(el.dataset.i18nLabel));
    });

    perbaruiTombolBahasa();
  }

  /* ---------- TOMBOL PENGGANTI BAHASA ---------- */
  function perbaruiTombolBahasa() {
    document.querySelectorAll('.btn-toggle-lang').forEach(function (btn) {
      // Tombol menampilkan kode bahasa yang SEDANG aktif (ID / EN)
      btn.textContent = bahasaAktif.toUpperCase();
      btn.setAttribute('title', t('bahasa.judul'));
      btn.setAttribute('aria-label', t('bahasa.judul'));
      btn.setAttribute('data-label', t('bahasa.label'));
    });
  }

  function setBahasa(kode, diamDiam) {
    if (kode !== 'id' && kode !== 'en') return;
    bahasaAktif = kode;
    try {
      localStorage.setItem(KUNCI_PENYIMPANAN, kode);
    } catch (e) {
      /* abaikan bila penyimpanan diblokir */
    }
    terapkanBahasaKeDOM();
    // Beri tahu script.js supaya konten dinamis (katalog, keranjang,
    // riwayat, ringkasan, navigasi) dirender ulang dalam bahasa baru.
    document.dispatchEvent(new CustomEvent('bahasaBerubah', { detail: { bahasa: kode } }));
    if (!diamDiam && typeof global.tampilkanNotifikasi === 'function') {
      global.tampilkanNotifikasi(t('bahasa.notif'), 'info');
    }
  }

  function gantiBahasa() {
    setBahasa(bahasaAktif === 'id' ? 'en' : 'id');
  }

  function pasangTombolBahasa() {
    document.querySelectorAll('.btn-toggle-lang').forEach(function (btn) {
      btn.onclick = gantiBahasa;
    });
    perbaruiTombolBahasa();
  }

  /* ---------- API GLOBAL ---------- */
  global.NEXORA_BAHASA = {
    KAMUS: KAMUS,
    t: t,
    get bahasa() {
      return bahasaAktif;
    },
    setBahasa: setBahasa,
    gantiBahasa: gantiBahasa,
    terapkan: terapkanBahasaKeDOM,
    pasangTombol: pasangTombolBahasa,
    locale: localeAktif
  };
  global.t = t;

  // Terapkan sedini mungkin (sebelum DOMContentLoaded pun sebagian sudah ada),
  // lalu sekali lagi saat DOM siap agar semua elemen tercakup.
  document.addEventListener('DOMContentLoaded', function () {
    terapkanBahasaKeDOM();
    pasangTombolBahasa();
  });
})(window);
