/**************************************************************************************
 * POJOK WIRAUSAHA MAHASISWA — PGSD UPI KAMPUS SERANG
 * Code.gs — setup otomatis (Form + Spreadsheet + trigger) sekaligus JSON API website
 *
 * ------------------------------------------------------------------------------------
 * CARA PAKAI (3 langkah)
 * ------------------------------------------------------------------------------------
 *  1. Buka https://script.google.com  ->  New project
 *     Beri nama proyek, misalnya "API Pojok Wirausaha PGSD".
 *     Hapus isi Code.gs bawaan, tempel SELURUH file ini, lalu Simpan (Ctrl+S).
 *
 *  2. Pilih fungsi  setupPojokWirausaha  di dropdown atas -> Run.
 *     Berikan izin saat diminta (Review permissions -> Advanced -> Go to ... -> Allow).
 *     Lihat Execution log: di sana tercetak URL Form, URL Spreadsheet, dan langkah berikutnya.
 *     Fungsi ini IDEMPOTENT — dijalankan berulang kali tidak akan membuat Form/Sheet baru.
 *
 *  3. Deploy -> New deployment -> ⚙ -> Web app
 *        Execute as     : Me
 *        Who has access : Anyone
 *     Salin URL yang berakhiran /exec, lalu tempel ke  js/config.js  pada baris:
 *        var API_URL = "https://script.google.com/macros/s/..../exec";
 *     dan URL Form ke baris:
 *        var GOOGLE_FORM_URL = "https://docs.google.com/forms/d/e/..../viewform";
 *
 * ------------------------------------------------------------------------------------
 * ALUR MODERASI (wajib, tidak bisa dilewati)
 * ------------------------------------------------------------------------------------
 *   Google Form -> sheet PRODUK (STATUS = MENUNGGU) -> admin ubah ke TAYANG -> website
 *   API hanya pernah mengirim baris ber-STATUS "TAYANG".
 *   Kolom NIM dan CATATAN_ADMIN tidak pernah ikut terkirim ke API publik.
 *
 * ------------------------------------------------------------------------------------
 * KONTRAK DATA DENGAN WEBSITE
 * ------------------------------------------------------------------------------------
 * File ini mengirim nama field JSON persis seperti yang dibaca js/api.js:
 *   idProduk, idPenjual, namaProduk, namaUsaha, namaMahasiswa, angkatan, kategori,
 *   harga (number), deskripsi, foto, whatsapp, instagram, lokasi, promo, status,
 *   featured, rating, varian, tanggalUpdate
 * Jangan mengganti nama field ini tanpa ikut mengubah js/api.js.
 **************************************************************************************/


/* ====================================================================================
 * 1. KONFIGURASI
 * ==================================================================================== */
const CONFIG = {

  /* --- nama berkas yang dibuat oleh setup --- */
  NAMA_FORM:  'POJOK WIRAUSAHA MAHASISWA\nPGSD UPI Kampus Serang',
  NAMA_SHEET: 'DATABASE Pojok Wirausaha Mahasiswa PGSD UPI Kampus Serang',

  DESKRIPSI_FORM:
    'Formulir pendaftaran produk dan jasa mahasiswa PGSD UPI Kampus Serang.\n\n' +
    'Produk yang dikirim akan melalui proses verifikasi sebelum ditampilkan pada ' +
    'website Pojok Wirausaha Mahasiswa.',

  PESAN_KONFIRMASI:
    'Terima kasih. Pendaftaran produkmu sudah kami terima dan berstatus MENUNGGU VERIFIKASI. ' +
    'Setelah diverifikasi pengelola, produkmu akan tayang di website Pojok Wirausaha Mahasiswa ' +
    'PGSD UPI Kampus Serang.',

  /* --- nama sheet --- */
  SHEET_PRODUK:  'PRODUK',    // wajib, sumber utama website
  SHEET_PENJUAL: 'PENJUAL',   // opsional, untuk memperkaya halaman toko
  SHEET_PROMO:   'PROMO',     // opsional, untuk section "Promo Minggu Ini"
  SHEET_CERITA:  'CERITA',    // opsional, untuk section "Cerita di Balik Usaha"

  /* --- status --- */
  STATUS_PRODUK: ['MENUNGGU', 'TAYANG', 'DITOLAK', 'NONAKTIF'],
  STATUS_DEFAULT: 'MENUNGGU',
  STATUS_TAYANG: 'TAYANG',
  STATUS_PENJUAL: ['AKTIF', 'NONAKTIF'],
  STATUS_PROMO: ['AKTIF', 'NONAKTIF'],

  /* --- kategori: HARUS sama persis dengan PW.config.categories di js/config.js --- */
  KATEGORI: [
    'Kuliner',
    'Minuman',
    'Fashion',
    'Handmade',
    'Pendidikan',
    'Produk Digital',
    'Jasa Kreatif',
    'Gift & Merchandise',
    'Les Privat',
    'Lainnya'
  ],

  ANGKATAN: ['2022', '2023', '2024', '2025', '2026'],

  /* --- judul pertanyaan Form: dipakai saat membuat Form DAN saat membaca submission,
         jadi keduanya tidak mungkin melenceng --- */
  T: {
    NAMA_MAHASISWA: 'Nama Mahasiswa',
    NIM:            'NIM',
    ANGKATAN:       'Angkatan',
    NAMA_USAHA:     'Nama Usaha',
    NAMA_PRODUK:    'Nama Produk',
    KATEGORI:       'Kategori',
    HARGA:          'Harga',
    DESKRIPSI:      'Deskripsi Produk',
    WHATSAPP:       'Nomor WhatsApp',
    INSTAGRAM:      'Instagram',
    LOKASI:         'Lokasi COD / Area Pelayanan',
    FOTO:           'Foto Produk',
    PERSETUJUAN:    'Persetujuan Publikasi'
  },

  TEKS_PERSETUJUAN:
    'Saya menyatakan bahwa informasi dan produk yang saya daftarkan merupakan tanggung ' +
    'jawab saya sebagai penjual dan saya menyetujui publikasi informasi produk pada ' +
    'Pojok Wirausaha Mahasiswa PGSD UPI Kampus Serang.',

  /* --- format ID --- */
  PREFIKS_PRODUK:  'PRD',
  PREFIKS_PENJUAL: 'PGSD',
  PREFIKS_PROMO:   'PRM',
  PREFIKS_CERITA:  'CRT',
  DIGIT_ID: 4,                       // PRD0001

  /* --- foto --- */
  LEBAR_THUMBNAIL: 1200,             // https://drive.google.com/thumbnail?id=..&sz=w1200

  /* --- API --- */
  CACHE_DETIK: 60,                   // 0 = matikan cache

  /* Kolom yang TIDAK PERNAH dikirim ke API publik (nama header dinormalisasi:
     huruf kecil, tanpa spasi/underscore). */
  KOLOM_RAHASIA: [
    'nim', 'catatanadmin', 'email', 'emailaddress', 'alamatemail',
    'alamat', 'alamatrumah', 'nik', 'nomorinduk', 'nomorindukmahasiswa'
  ]
};

/* Kunci PropertiesService — supaya setup tidak membuat berkas duplikat. */
const PROP = {
  FORM_ID:  'PW_FORM_ID',
  SHEET_ID: 'PW_SPREADSHEET_ID',
  SETUP_AT: 'PW_SETUP_AT'
};

/* Header setiap sheet. URUTAN INI MENENTUKAN URUTAN KOLOM — jangan diacak setelah
   sheet berisi data, karena onFormSubmit menulis baris berdasarkan urutan ini. */
const HEADER = {
  PRODUK: [
    'ID_PRODUK', 'ID_PENJUAL', 'TIMESTAMP', 'NAMA_MAHASISWA', 'NIM', 'ANGKATAN',
    'NAMA_USAHA', 'NAMA_PRODUK', 'KATEGORI', 'HARGA', 'DESKRIPSI', 'FOTO',
    'WHATSAPP', 'INSTAGRAM', 'LOKASI', 'STATUS', 'FEATURED', 'PROMO',
    'TANGGAL_UPDATE', 'CATATAN_ADMIN'
  ],
  PENJUAL: [
    'ID_PENJUAL', 'NAMA_USAHA', 'NAMA_MAHASISWA', 'ANGKATAN', 'DESKRIPSI_USAHA',
    'LOGO', 'WHATSAPP', 'INSTAGRAM', 'LOKASI', 'STATUS'
  ],
  PROMO: [
    'ID_PROMO', 'ID_PENJUAL', 'ID_PRODUK', 'JUDUL_PROMO', 'DESKRIPSI',
    'TANGGAL_MULAI', 'TANGGAL_SELESAI', 'STATUS'
  ],
  CERITA: [
    'ID_CERITA', 'ID_PENJUAL', 'JUDUL', 'EXCERPT', 'PENULIS', 'ANGKATAN',
    'THUMBNAIL', 'TANGGAL', 'ISI'
  ]
};

/* Pemetaan header sheet -> nama field JSON yang dibaca website.
   Kunci sudah dinormalisasi: huruf kecil, tanpa karakter selain a-z0-9. */
const PETA_KOLOM = {
  idproduk: 'idProduk',
  idpenjual: 'idPenjual',
  idpromo: 'idPromo',
  idcerita: 'idCerita',
  timestamp: 'timestamp',
  namamahasiswa: 'namaMahasiswa',
  angkatan: 'angkatan',
  namausaha: 'namaUsaha',
  namaproduk: 'namaProduk',
  kategori: 'kategori',
  harga: 'harga',
  deskripsi: 'deskripsi',
  deskripsiproduk: 'deskripsi',
  deskripsiusaha: 'deskripsiUsaha',
  foto: 'foto',
  fotoproduk: 'foto',
  logo: 'logo',
  logousaha: 'logo',
  whatsapp: 'whatsapp',
  nomorwhatsapp: 'whatsapp',
  instagram: 'instagram',
  lokasi: 'lokasi',
  lokasicod: 'lokasi',
  status: 'status',
  featured: 'featured',
  unggulan: 'featured',
  promo: 'promo',
  rating: 'rating',
  varian: 'varian',
  tanggalupdate: 'tanggalUpdate',
  tanggal: 'tanggal',
  judulpromo: 'judulPromo',
  judul: 'judul',
  tanggalmulai: 'tanggalMulai',
  tanggalselesai: 'tanggalSelesai',
  excerpt: 'excerpt',
  ringkasan: 'excerpt',
  penulis: 'penulis',
  thumbnail: 'thumbnail',
  isi: 'isi'
};


/* ====================================================================================
 * 2. SETUP — jalankan fungsi ini sekali dari editor Apps Script
 * ==================================================================================== */
function setupPojokWirausaha() {
  const props = PropertiesService.getScriptProperties();
  const log = [];

  log.push('=== SETUP POJOK WIRAUSAHA MAHASISWA ===');

  /* --- 1. Spreadsheet --- */
  const ss = ambilAtauBuatSpreadsheet_(props, log);

  /* --- 2. Sheet + header + validasi --- */
  siapkanSheet_(ss, CONFIG.SHEET_PRODUK,  HEADER.PRODUK);
  siapkanSheet_(ss, CONFIG.SHEET_PENJUAL, HEADER.PENJUAL);
  siapkanSheet_(ss, CONFIG.SHEET_PROMO,   HEADER.PROMO);
  siapkanSheet_(ss, CONFIG.SHEET_CERITA,  HEADER.CERITA);
  aturValidasiProduk_(ss);
  aturValidasiLain_(ss);
  log.push('Sheet siap  : ' + [CONFIG.SHEET_PRODUK, CONFIG.SHEET_PENJUAL,
                               CONFIG.SHEET_PROMO, CONFIG.SHEET_CERITA].join(', '));

  /* --- 3. Google Form --- */
  const form = ambilAtauBuatForm_(props, log);
  bangunPertanyaanForm_(form, log);

  /* --- 4. Sambungkan Form ke Spreadsheet --- */
  hubungkanFormKeSheet_(form, ss, log);

  /* --- 5. Trigger --- */
  pasangTrigger_(ss.getId(), log);

  /* --- 6. Catat waktu setup --- */
  props.setProperty(PROP.SETUP_AT, new Date().toISOString());
  bersihkanCache();

  log.push('');
  log.push('--- HASIL ---');
  log.push('URL Google Form (untuk mahasiswa) : ' + form.getPublishedUrl());
  log.push('URL Form (mode edit)              : ' + form.getEditUrl());
  log.push('URL Google Sheet (untuk admin)    : ' + ss.getUrl());
  log.push('Form ID                           : ' + form.getId());
  log.push('Spreadsheet ID                    : ' + ss.getId());
  log.push('');
  log.push('--- LANGKAH BERIKUTNYA ---');
  log.push('1. Deploy > New deployment > Web app');
  log.push('     Execute as     : Me');
  log.push('     Who has access : Anyone');
  log.push('2. Salin URL yang berakhiran /exec.');
  log.push('3. Buka js/config.js di source code website, isi:');
  log.push('     var API_URL         = "<URL /exec tadi>";');
  log.push('     var GOOGLE_FORM_URL = "' + form.getPublishedUrl() + '";');
  log.push('     var MODE_DEMO       = false;');
  log.push('4. Commit & push ke GitHub. Selesai.');
  log.push('');
  log.push('Panggil showSetupInfo() kapan saja untuk melihat kembali URL di atas.');

  const teks = log.join('\n');
  Logger.log(teks);
  return teks;
}


/** Menampilkan kembali seluruh informasi setup. */
function showSetupInfo() {
  const props = PropertiesService.getScriptProperties();
  const formId = props.getProperty(PROP.FORM_ID);
  const ssId = props.getProperty(PROP.SHEET_ID);
  const out = ['=== INFO SETUP POJOK WIRAUSAHA ==='];

  if (!formId && !ssId) {
    out.push('Belum pernah disetup. Jalankan setupPojokWirausaha() terlebih dahulu.');
    Logger.log(out.join('\n'));
    return out.join('\n');
  }

  try {
    const form = FormApp.openById(formId);
    out.push('Form ID      : ' + formId);
    out.push('URL Form     : ' + form.getPublishedUrl());
    out.push('Edit Form    : ' + form.getEditUrl());
    out.push('Jml respons  : ' + form.getResponses().length);
  } catch (err) {
    out.push('Form         : TIDAK DAPAT DIBUKA (' + err + ')');
  }

  try {
    const ss = SpreadsheetApp.openById(ssId);
    const sh = ss.getSheetByName(CONFIG.SHEET_PRODUK);
    out.push('Spreadsheet  : ' + ssId);
    out.push('URL Sheet    : ' + ss.getUrl());
    if (sh) {
      const rows = bacaSheet_(ss, CONFIG.SHEET_PRODUK);
      const tayang = rows.filter(function (r) {
        return String(r.status || '').toUpperCase() === CONFIG.STATUS_TAYANG;
      });
      const menunggu = rows.filter(function (r) {
        return String(r.status || '').toUpperCase() === 'MENUNGGU';
      });
      out.push('Total baris  : ' + rows.length);
      out.push('TAYANG       : ' + tayang.length);
      out.push('MENUNGGU     : ' + menunggu.length + (menunggu.length ? '  <-- perlu direview' : ''));
    }
  } catch (err) {
    out.push('Spreadsheet  : TIDAK DAPAT DIBUKA (' + err + ')');
  }

  out.push('Disetup pada : ' + (props.getProperty(PROP.SETUP_AT) || '-'));
  out.push('');
  out.push('Trigger aktif:');
  ScriptApp.getProjectTriggers().forEach(function (t) {
    out.push('  - ' + t.getHandlerFunction() + ' (' + t.getEventType() + ')');
  });

  const teks = out.join('\n');
  Logger.log(teks);
  return teks;
}


/**
 * Melepaskan kaitan script dengan Form/Sheet yang sekarang.
 * TIDAK menghapus berkasnya — hanya membuat setupPojokWirausaha() membuat pasangan baru.
 */
function resetSetup() {
  PropertiesService.getScriptProperties()
    .deleteProperty(PROP.FORM_ID)
    .deleteProperty(PROP.SHEET_ID)
    .deleteProperty(PROP.SETUP_AT);
  Logger.log('Properti setup dihapus. Form dan Spreadsheet lama TIDAK dihapus.');
}


/* ------------------------------------------------------------------ Spreadsheet ---- */
function ambilAtauBuatSpreadsheet_(props, log) {
  const id = props.getProperty(PROP.SHEET_ID);

  if (id) {
    try {
      const ada = SpreadsheetApp.openById(id);
      log.push('Spreadsheet : dipakai ulang (' + id + ')');
      return ada;
    } catch (err) {
      log.push('Spreadsheet lama tidak dapat dibuka, dibuatkan yang baru.');
    }
  }

  const ss = SpreadsheetApp.create(CONFIG.NAMA_SHEET);

  // Sheet1 bawaan dihapus setelah sheet lain dibuat (spreadsheet harus punya >= 1 sheet)
  props.setProperty(PROP.SHEET_ID, ss.getId());
  log.push('Spreadsheet : DIBUAT BARU (' + ss.getId() + ')');
  return ss;
}


function siapkanSheet_(ss, nama, header) {
  let sheet = ss.getSheetByName(nama);

  if (!sheet) {
    // pakai "Sheet1" bawaan untuk sheet pertama supaya tidak menyisakan tab kosong
    const bawaan = ss.getSheetByName('Sheet1') || ss.getSheetByName('Sheet 1');
    if (bawaan && bawaan.getLastRow() === 0 && ss.getSheets().length === 1) {
      bawaan.setName(nama);
      sheet = bawaan;
    } else {
      sheet = ss.insertSheet(nama);
    }
  }

  const lebarLama = sheet.getLastColumn();
  const headerLama = lebarLama
    ? sheet.getRange(1, 1, 1, lebarLama).getValues()[0].map(normalisasiHeader_)
    : [];

  // tulis header hanya jika belum ada / berbeda, supaya data lama tidak rusak
  const perlu = header.map(normalisasiHeader_).some(function (h, i) { return headerLama[i] !== h; });
  if (perlu) {
    sheet.getRange(1, 1, 1, header.length).setValues([header]);
  }

  sheet.getRange(1, 1, 1, header.length)
    .setFontWeight('bold')
    .setFontColor('#FFFFFF')
    .setBackground('#8B1830')
    .setVerticalAlignment('middle')
    .setHorizontalAlignment('left');

  sheet.setFrozenRows(1);
  sheet.setRowHeight(1, 34);

  // hapus kolom sisa di kanan supaya tampilan rapi
  const maks = sheet.getMaxColumns();
  if (maks > header.length) sheet.deleteColumns(header.length + 1, maks - header.length);

  aturLebarKolom_(sheet, header);
  return sheet;
}


function aturLebarKolom_(sheet, header) {
  const lebar = {
    ID_PRODUK: 96, ID_PENJUAL: 100, ID_PROMO: 96, ID_CERITA: 96,
    TIMESTAMP: 140, NAMA_MAHASISWA: 170, NIM: 100, ANGKATAN: 84,
    NAMA_USAHA: 160, NAMA_PRODUK: 200, KATEGORI: 140, HARGA: 100,
    DESKRIPSI: 300, DESKRIPSI_USAHA: 300, FOTO: 260, LOGO: 260, THUMBNAIL: 260,
    WHATSAPP: 130, INSTAGRAM: 140, LOKASI: 200, STATUS: 110, FEATURED: 90,
    PROMO: 150, TANGGAL_UPDATE: 120, CATATAN_ADMIN: 220,
    JUDUL_PROMO: 220, TANGGAL_MULAI: 120, TANGGAL_SELESAI: 128,
    JUDUL: 240, EXCERPT: 300, PENULIS: 160, TANGGAL: 120, ISI: 400
  };
  header.forEach(function (h, i) {
    if (lebar[h]) sheet.setColumnWidth(i + 1, lebar[h]);
  });
}


/** Dropdown STATUS, checkbox FEATURED, format angka HARGA, format tanggal. */
function aturValidasiProduk_(ss) {
  const sheet = ss.getSheetByName(CONFIG.SHEET_PRODUK);
  if (!sheet) return;

  const kol = petaKolom_(sheet);
  const barisTerakhir = Math.max(sheet.getMaxRows(), 1000);
  if (sheet.getMaxRows() < barisTerakhir) sheet.insertRowsAfter(sheet.getMaxRows(), barisTerakhir - sheet.getMaxRows());
  const jml = barisTerakhir - 1;

  if (kol.STATUS) {
    const validasi = SpreadsheetApp.newDataValidation()
      .requireValueInList(CONFIG.STATUS_PRODUK, true)
      .setAllowInvalid(false)
      .setHelpText('Pilih salah satu: ' + CONFIG.STATUS_PRODUK.join(', '))
      .build();
    sheet.getRange(2, kol.STATUS, jml, 1).setDataValidation(validasi);

    // pewarnaan status supaya admin cepat memindai
    const rentang = sheet.getRange(2, kol.STATUS, jml, 1);
    const aturan = [
      warnaStatus_(rentang, 'TAYANG',   '#E3F6EC', '#0F7A50'),
      warnaStatus_(rentang, 'MENUNGGU', '#FFF4D6', '#8A6100'),
      warnaStatus_(rentang, 'DITOLAK',  '#FDE7EA', '#9E1B32'),
      warnaStatus_(rentang, 'NONAKTIF', '#EEEEEE', '#666666')
    ];
    sheet.setConditionalFormatRules(aturan);
  }

  /* Checkbox HANYA dipasang pada baris yang sudah berisi data.
     insertCheckboxes() menulis nilai FALSE ke setiap sel yang dikenainya, sehingga
     memasangnya ke ribuan baris kosong membuat getLastRow() melonjak — akibatnya
     appendRow() menaruh kiriman Form jauh di bawah dan baris kosong ikut terbaca API.
     Baris baru mendapat checkbox-nya sendiri di onFormSubmit(). */
  if (kol.FEATURED) {
    const barisBerisi = sheet.getLastRow() - 1;
    if (barisBerisi > 0) sheet.getRange(2, kol.FEATURED, barisBerisi, 1).insertCheckboxes();
  }

  if (kol.KATEGORI) {
    const vk = SpreadsheetApp.newDataValidation()
      .requireValueInList(CONFIG.KATEGORI, true)
      .setAllowInvalid(false)
      .setHelpText('Kategori harus sama persis dengan daftar di js/config.js')
      .build();
    sheet.getRange(2, kol.KATEGORI, jml, 1).setDataValidation(vk);
  }

  if (kol.HARGA) sheet.getRange(2, kol.HARGA, jml, 1).setNumberFormat('#,##0');
  if (kol.TANGGAL_UPDATE) sheet.getRange(2, kol.TANGGAL_UPDATE, jml, 1).setNumberFormat('yyyy-mm-dd');
  if (kol.TIMESTAMP) sheet.getRange(2, kol.TIMESTAMP, jml, 1).setNumberFormat('yyyy-mm-dd hh:mm');
}


function warnaStatus_(rentang, teks, latar, huruf) {
  return SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo(teks)
    .setBackground(latar)
    .setFontColor(huruf)
    .setRanges([rentang])
    .build();
}


function aturValidasiLain_(ss) {
  const pasangan = [
    [CONFIG.SHEET_PENJUAL, 'STATUS', CONFIG.STATUS_PENJUAL],
    [CONFIG.SHEET_PROMO,   'STATUS', CONFIG.STATUS_PROMO]
  ];
  pasangan.forEach(function (p) {
    const sheet = ss.getSheetByName(p[0]);
    if (!sheet) return;
    const kol = petaKolom_(sheet);
    if (!kol[p[1]]) return;
    const jml = Math.max(sheet.getMaxRows() - 1, 1);
    const v = SpreadsheetApp.newDataValidation()
      .requireValueInList(p[2], true).setAllowInvalid(false).build();
    sheet.getRange(2, kol[p[1]], jml, 1).setDataValidation(v);
  });

  const promo = ss.getSheetByName(CONFIG.SHEET_PROMO);
  if (promo) {
    const kol = petaKolom_(promo);
    const jml = Math.max(promo.getMaxRows() - 1, 1);
    ['TANGGAL_MULAI', 'TANGGAL_SELESAI'].forEach(function (n) {
      if (kol[n]) promo.getRange(2, kol[n], jml, 1).setNumberFormat('yyyy-mm-dd');
    });
  }
}


/* ------------------------------------------------------------------------ Form ----- */
function ambilAtauBuatForm_(props, log) {
  const id = props.getProperty(PROP.FORM_ID);

  if (id) {
    try {
      const ada = FormApp.openById(id);
      log.push('Form        : dipakai ulang (' + id + ')');
      return ada;
    } catch (err) {
      log.push('Form lama tidak dapat dibuka, dibuatkan yang baru.');
    }
  }

  const form = FormApp.create(CONFIG.NAMA_FORM);
  props.setProperty(PROP.FORM_ID, form.getId());
  log.push('Form        : DIBUAT BARU (' + form.getId() + ')');
  return form;
}


/**
 * Membangun seluruh pertanyaan. Idempotent: pertanyaan yang judulnya sudah ada
 * tidak dibuat ulang, jadi setup boleh dijalankan berkali-kali.
 */
function bangunPertanyaanForm_(form, log) {
  form.setTitle(CONFIG.NAMA_FORM.replace(/\n/g, ' — '));
  form.setDescription(CONFIG.DESKRIPSI_FORM);
  form.setConfirmationMessage(CONFIG.PESAN_KONFIRMASI);
  form.setAllowResponseEdits(false);
  form.setShowLinkToRespondAgain(true);
  form.setProgressBar(true);

  // pengaturan berikut hanya tersedia / relevan di sebagian akun -> jangan sampai menggagalkan setup
  coba_(function () { form.setCollectEmail(false); });
  coba_(function () { form.setLimitOneResponsePerUser(false); });

  const T = CONFIG.T;
  const sudahAda = {};
  form.getItems().forEach(function (it) { sudahAda[it.getTitle()] = true; });
  const baru = [];

  function belumAda(judul) {
    if (sudahAda[judul]) return false;
    baru.push(judul);
    return true;
  }

  /* 1. Nama Mahasiswa */
  if (belumAda(T.NAMA_MAHASISWA)) {
    form.addTextItem()
      .setTitle(T.NAMA_MAHASISWA)
      .setHelpText('Nama lengkap sesuai data akademik. Nama ini akan tampil di website.')
      .setRequired(true);
  }

  /* 2. NIM */
  if (belumAda(T.NIM)) {
    form.addTextItem()
      .setTitle(T.NIM)
      .setHelpText('Digunakan pengelola hanya untuk verifikasi. NIM TIDAK ditampilkan di website.')
      .setRequired(true);
  }

  /* 3. Angkatan */
  if (belumAda(T.ANGKATAN)) {
    form.addListItem()
      .setTitle(T.ANGKATAN)
      .setChoiceValues(CONFIG.ANGKATAN)
      .setRequired(true);
  }

  /* 4. Nama Usaha */
  if (belumAda(T.NAMA_USAHA)) {
    form.addTextItem()
      .setTitle(T.NAMA_USAHA)
      .setHelpText('Contoh: Dapur Naya. Gunakan nama yang sama untuk setiap produk dari usaha ' +
                   'yang sama — produk akan otomatis dikelompokkan ke satu halaman toko.')
      .setRequired(true);
  }

  /* 5. Nama Produk */
  if (belumAda(T.NAMA_PRODUK)) {
    form.addTextItem()
      .setTitle(T.NAMA_PRODUK)
      .setHelpText('Satu formulir untuk satu produk. Punya beberapa produk? Isi formulir lagi.')
      .setRequired(true);
  }

  /* 6. Kategori */
  if (belumAda(T.KATEGORI)) {
    form.addListItem()
      .setTitle(T.KATEGORI)
      .setChoiceValues(CONFIG.KATEGORI)
      .setRequired(true);
  }

  /* 7. Harga */
  if (belumAda(T.HARGA)) {
    const item = form.addTextItem()
      .setTitle(T.HARGA)
      .setHelpText('Tulis angka saja, tanpa "Rp" dan tanpa titik. Contoh: 25000')
      .setRequired(true);
    coba_(function () {
      item.setValidation(
        FormApp.createTextValidation()
          .setHelpText('Isi angka saja, contoh: 25000')
          .requireNumberGreaterThanOrEqualTo(0)
          .build()
      );
    });
  }

  /* 8. Deskripsi Produk */
  if (belumAda(T.DESKRIPSI)) {
    form.addParagraphTextItem()
      .setTitle(T.DESKRIPSI)
      .setHelpText('Jelaskan produkmu: bahan, ukuran, isi paket, lama pengerjaan, atau ' +
                   'ketentuan pemesanan. 2–4 kalimat sudah cukup.')
      .setRequired(true);
  }

  /* 9. Nomor WhatsApp */
  if (belumAda(T.WHATSAPP)) {
    form.addTextItem()
      .setTitle(T.WHATSAPP)
      .setHelpText('Nomor yang aktif untuk menerima pesanan. Boleh 08xxx maupun 62xxx — ' +
                   'sistem akan menyeragamkannya sendiri.')
      .setRequired(true);
  }

  /* 10. Instagram */
  if (belumAda(T.INSTAGRAM)) {
    form.addTextItem()
      .setTitle(T.INSTAGRAM)
      .setHelpText('Username akun usaha, boleh pakai @ atau tidak. Kosongkan bila belum punya.')
      .setRequired(false);
  }

  /* 11. Lokasi COD */
  if (belumAda(T.LOKASI)) {
    form.addTextItem()
      .setTitle(T.LOKASI)
      .setHelpText('Contoh: COD UPI Kampus Serang, atau "Online (file digital)".')
      .setRequired(true);
  }

  /* 12. Foto Produk
     Pertanyaan unggah berkas tidak tersedia di semua jenis akun Google. Kalau gagal
     dibuat, diganti otomatis dengan isian tautan foto supaya setup tetap selesai. */
  if (belumAda(T.FOTO)) {
    const adaUnggah = coba_(function () {
      const foto = form.addFileUploadItem()
        .setTitle(T.FOTO)
        .setHelpText('Satu foto produk, sebaiknya mendatar atau persegi, maksimal 10 MB. ' +
                     'Kamu perlu masuk dengan akun Google untuk mengunggah.')
        .setRequired(true);
      coba_(function () { foto.setAllowedFileTypes([FormApp.FileType.IMAGE]); });
      coba_(function () { foto.setMaxFiles(1); });
      coba_(function () { foto.setMaxFileSize(10 * 1024 * 1024); });
    });

    if (!adaUnggah) {
      form.addTextItem()
        .setTitle(T.FOTO)
        .setHelpText('Tempel tautan foto produkmu (Google Drive, Google Photos, atau URL gambar).')
        .setRequired(true);
      log.push('CATATAN     : akun ini tidak mendukung pertanyaan unggah berkas — ' +
               'diganti menjadi isian tautan foto.');
    }
  }

  /* 13. Persetujuan */
  if (belumAda(T.PERSETUJUAN)) {
    form.addCheckboxItem()
      .setTitle(T.PERSETUJUAN)
      .setChoiceValues([CONFIG.TEKS_PERSETUJUAN])
      .setRequired(true);
  }

  log.push('Pertanyaan  : ' + (baru.length ? 'ditambahkan -> ' + baru.join(', ')
                                           : 'sudah lengkap, tidak ada yang diubah'));
}


function hubungkanFormKeSheet_(form, ss, log) {
  let tujuan = null;
  coba_(function () { tujuan = form.getDestinationId(); });

  if (tujuan === ss.getId()) {
    log.push('Form->Sheet : sudah tersambung');
    return;
  }
  form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());
  log.push('Form->Sheet : DISAMBUNGKAN (jawaban mentah masuk ke tab "Form Responses 1")');
}


function pasangTrigger_(ssId, log) {
  const perlu = [
    { fn: 'onFormSubmit',      tipe: ScriptApp.EventType.ON_FORM_SUBMIT },
    { fn: 'onEditSheet',       tipe: ScriptApp.EventType.ON_EDIT },
    { fn: 'onOpenSpreadsheet', tipe: ScriptApp.EventType.ON_OPEN }
  ];

  const ada = ScriptApp.getProjectTriggers().map(function (t) {
    return t.getHandlerFunction() + '|' + t.getEventType();
  });

  const dibuat = [];
  perlu.forEach(function (p) {
    if (ada.indexOf(p.fn + '|' + p.tipe) > -1) return;
    const b = ScriptApp.newTrigger(p.fn).forSpreadsheet(ssId);
    if (p.tipe === ScriptApp.EventType.ON_FORM_SUBMIT) b.onFormSubmit().create();
    else if (p.tipe === ScriptApp.EventType.ON_EDIT) b.onEdit().create();
    else b.onOpen().create();
    dibuat.push(p.fn);
  });

  log.push('Trigger     : ' + (dibuat.length ? 'dipasang -> ' + dibuat.join(', ')
                                             : 'sudah terpasang semua'));
}


/* ====================================================================================
 * 3. TRIGGER
 * ==================================================================================== */

/**
 * Dipanggil setiap ada kiriman Google Form baru.
 * Menyalin jawaban ke sheet PRODUK dengan ID otomatis dan STATUS = MENUNGGU.
 */
function onFormSubmit(e) {
  if (!e || !e.namedValues) return;

  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(25000);   // cegah dua kiriman bersamaan memperoleh ID yang sama
  } catch (err) {
    Logger.log('Gagal mengambil lock: ' + err);
    return;
  }

  try {
    const ss = SpreadsheetApp.openById(
      PropertiesService.getScriptProperties().getProperty(PROP.SHEET_ID) || e.source.getId()
    );
    const sheet = ss.getSheetByName(CONFIG.SHEET_PRODUK);
    if (!sheet) throw new Error('Sheet ' + CONFIG.SHEET_PRODUK + ' tidak ditemukan');

    const T = CONFIG.T;
    const v = function (judul) {
      const k = e.namedValues[judul];
      return k && k.length ? String(k[0]).trim() : '';
    };

    const namaUsaha = v(T.NAMA_USAHA);
    const catatan = [];

    /* --- foto: amankan izin & ubah jadi URL yang bisa dipakai tag <img> --- */
    const hasilFoto = amankanFoto_(v(T.FOTO));
    if (hasilFoto.catatan) catatan.push(hasilFoto.catatan);

    /* --- ID --- */
    const idProduk = idBerikutnya_(sheet, 'ID_PRODUK', CONFIG.PREFIKS_PRODUK);
    const idPenjual = idPenjualUntukUsaha_(sheet, namaUsaha);

    /* --- susun baris mengikuti urutan HEADER.PRODUK --- */
    const kol = petaKolom_(sheet);
    const baris = new Array(HEADER.PRODUK.length).fill('');
    const isi = function (nama, nilai) {
      if (kol[nama]) baris[kol[nama] - 1] = nilai;
    };

    isi('ID_PRODUK', idProduk);
    isi('ID_PENJUAL', idPenjual);
    isi('TIMESTAMP', new Date());
    isi('NAMA_MAHASISWA', v(T.NAMA_MAHASISWA));
    isi('NIM', v(T.NIM));
    isi('ANGKATAN', v(T.ANGKATAN));
    isi('NAMA_USAHA', namaUsaha);
    isi('NAMA_PRODUK', v(T.NAMA_PRODUK));
    isi('KATEGORI', kategoriSah_(v(T.KATEGORI)));
    isi('HARGA', keAngka_(v(T.HARGA)));
    isi('DESKRIPSI', v(T.DESKRIPSI));
    isi('FOTO', hasilFoto.url);
    isi('WHATSAPP', normalisasiWa_(v(T.WHATSAPP)));
    isi('INSTAGRAM', normalisasiIg_(v(T.INSTAGRAM)));
    isi('LOKASI', v(T.LOKASI));
    isi('STATUS', CONFIG.STATUS_DEFAULT);
    isi('FEATURED', false);
    isi('PROMO', '');
    isi('TANGGAL_UPDATE', new Date());
    isi('CATATAN_ADMIN', catatan.join(' | '));

    sheet.appendRow(baris);

    /* --- pastikan baris baru ikut punya dropdown & checkbox --- */
    const r = sheet.getLastRow();
    if (kol.STATUS) {
      sheet.getRange(r, kol.STATUS).setDataValidation(
        SpreadsheetApp.newDataValidation()
          .requireValueInList(CONFIG.STATUS_PRODUK, true).setAllowInvalid(false).build()
      );
    }
    if (kol.FEATURED) sheet.getRange(r, kol.FEATURED).insertCheckboxes().setValue(false);
    if (kol.HARGA) sheet.getRange(r, kol.HARGA).setNumberFormat('#,##0');
    if (kol.TANGGAL_UPDATE) sheet.getRange(r, kol.TANGGAL_UPDATE).setNumberFormat('yyyy-mm-dd');

    bersihkanCache();
    Logger.log('Kiriman baru: %s (%s) dari %s -> MENUNGGU', idProduk, v(T.NAMA_PRODUK), namaUsaha);

  } catch (err) {
    Logger.log('onFormSubmit GAGAL: ' + err + '\n' + (err.stack || ''));
  } finally {
    lock.releaseLock();
  }
}


/**
 * Saat admin mengubah STATUS menjadi TAYANG, TANGGAL_UPDATE ikut diperbarui.
 * Dengan begitu badge "Baru" dan urutan "Terbaru" di website mengikuti tanggal TAYANG,
 * bukan tanggal pendaftaran.
 */
function onEditSheet(e) {
  try {
    if (!e || !e.range) return;
    const sheet = e.range.getSheet();
    if (sheet.getName() !== CONFIG.SHEET_PRODUK) return;
    if (e.range.getRow() < 2) return;

    const kol = petaKolom_(sheet);
    if (!kol.STATUS || e.range.getColumn() !== kol.STATUS) { bersihkanCache(); return; }

    const nilai = String(e.range.getValue() || '').toUpperCase();
    if (nilai === CONFIG.STATUS_TAYANG && kol.TANGGAL_UPDATE) {
      sheet.getRange(e.range.getRow(), kol.TANGGAL_UPDATE)
        .setValue(new Date())
        .setNumberFormat('yyyy-mm-dd');
    }
    bersihkanCache();
  } catch (err) {
    Logger.log('onEditSheet: ' + err);
  }
}


/** Menu admin di dalam Spreadsheet. */
function onOpenSpreadsheet(e) {
  try {
    const ss = (e && e.source) ? e.source :
      SpreadsheetApp.openById(PropertiesService.getScriptProperties().getProperty(PROP.SHEET_ID));
    ss.addMenu('Pojok Wirausaha', [
      { name: 'Tayangkan baris terpilih',    functionName: 'tayangkanTerpilih' },
      { name: 'Tolak baris terpilih',        functionName: 'tolakTerpilih' },
      { name: 'Nonaktifkan baris terpilih',  functionName: 'nonaktifkanTerpilih' },
      null,
      { name: 'Rapikan sheet (bersihkan baris hantu)', functionName: 'rapikanSheet' },
      { name: 'Isi ID yang masih kosong',    functionName: 'isiIdKosong' },
      { name: 'Perbaiki izin & URL foto',    functionName: 'perbaikiIzinFoto' },
      { name: 'Uji foto dapat diakses publik', functionName: 'ujiFotoPublik' },
      null,
      { name: 'Bersihkan cache API',         functionName: 'bersihkanCache' },
      { name: 'Lihat info setup',            functionName: 'showSetupInfo' }
    ]);
  } catch (err) {
    Logger.log('onOpenSpreadsheet: ' + err);
  }
}


/* ====================================================================================
 * 4. API — doGet
 * ==================================================================================== */
/**
 * Endpoint:
 *   /exec                     -> paket lengkap { produk, penjual, promo, cerita, stats }
 *                                INI yang dipakai website (js/config.js -> API_URL)
 *   /exec?action=products      -> { success, count, data:[...] }
 *   /exec?action=stats         -> { success, data:{ jumlahProduk, jumlahUsaha, ... } }
 *   /exec?action=sellers       -> { success, count, data:[...] }
 *   /exec?action=promos        -> { success, count, data:[...] }
 *   /exec?action=stories       -> { success, count, data:[...] }
 *   /exec?callback=namaFungsi  -> respons JSONP (cadangan bila CORS bermasalah)
 */
function doGet(e) {
  const p = (e && e.parameter) ? e.parameter : {};
  const action = String(p.action || p.sheet || 'all').toLowerCase();
  let hasil;

  try {
    const data = kumpulkanData_();

    switch (action) {
      case 'products':
      case 'produk':
        hasil = { success: true, count: data.produk.length, data: data.produk };
        break;

      case 'stats':
      case 'statistik':
        hasil = { success: true, data: data.stats };
        break;

      case 'sellers':
      case 'penjual':
        hasil = { success: true, count: data.penjual.length, data: data.penjual };
        break;

      case 'promos':
      case 'promo':
        hasil = { success: true, count: data.promo.length, data: data.promo };
        break;

      case 'stories':
      case 'cerita':
        hasil = { success: true, count: data.cerita.length, data: data.cerita };
        break;

      default:
        hasil = {
          success: true,
          count: data.produk.length,
          diperbaruiPada: new Date().toISOString(),
          produk: data.produk,
          penjual: data.penjual,
          promo: data.promo,
          cerita: data.cerita,
          stats: data.stats
        };
    }
  } catch (err) {
    hasil = {
      success: false,
      error: String(err && err.message ? err.message : err),
      count: 0, data: [],
      produk: [], penjual: [], promo: [], cerita: []
    };
  }

  return kirim_(hasil, p.callback);
}


function kirim_(objek, callback) {
  const json = JSON.stringify(objek);

  if (callback && /^[A-Za-z_$][A-Za-z0-9_$.]{0,64}$/.test(callback)) {
    return ContentService
      .createTextOutput(callback + '(' + json + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService
    .createTextOutput(json)
    .setMimeType(ContentService.MimeType.JSON);
}


/** Mengumpulkan seluruh data yang siap dikirim ke website. */
function kumpulkanData_() {
  let cache = null;
  if (CONFIG.CACHE_DETIK > 0) {
    try {
      cache = CacheService.getScriptCache();
      const simpan = cache.get('pw_data');
      if (simpan) return JSON.parse(simpan);
    } catch (err) { cache = null; }
  }

  const ssId = PropertiesService.getScriptProperties().getProperty(PROP.SHEET_ID);
  const ss = ssId ? SpreadsheetApp.openById(ssId) : SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error('Spreadsheet belum disetup. Jalankan setupPojokWirausaha().');

  /* ---------- PRODUK: hanya STATUS = TAYANG ---------- */
  let produk = bacaSheet_(ss, CONFIG.SHEET_PRODUK)
    .filter(function (r) {
      // baris tanpa nama produk bukan produk — pengaman agar sel nyasar tidak ikut terkirim
      if (String(r.namaProduk || '').trim() === '') return false;
      return String(r.status || '').toUpperCase() === CONFIG.STATUS_TAYANG;
    })
    .map(function (r) {
      r.harga = keAngka_(r.harga);                       // WAJIB number, bukan "Rp25.000"
      r.whatsapp = normalisasiWa_(r.whatsapp);           // 08xxx -> 62xxx, tanpa tanda +
      r.instagram = normalisasiIg_(r.instagram);         // @nama -> nama
      r.foto = urlFotoPublik_(r.foto);
      r.featured = keBoolean_(r.featured);
      r.kategori = kategoriSah_(r.kategori);
      if (r.rating !== '' && r.rating != null) r.rating = Number(r.rating) || '';
      if (!r.idPenjual) r.idPenjual = slug_(r.namaUsaha);  // pengaman relasi toko
      return r;
    });

  // terbaru lebih dulu (website juga menyortir sendiri; ini agar konsisten)
  produk.sort(function (a, b) {
    return waktu_(b.tanggalUpdate || b.timestamp) - waktu_(a.tanggalUpdate || a.timestamp);
  });

  /* ---------- PENJUAL: opsional, hanya untuk memperkaya halaman toko ---------- */
  const penjual = bacaSheet_(ss, CONFIG.SHEET_PENJUAL)
    .filter(function (r) {
      const s = String(r.status || 'AKTIF').toUpperCase();
      return r.idPenjual && String(r.namaUsaha || '').trim() !== '' && s !== 'NONAKTIF';
    })
    .map(function (r) {
      r.whatsapp = normalisasiWa_(r.whatsapp);
      r.instagram = normalisasiIg_(r.instagram);
      r.logo = urlFotoPublik_(r.logo);
      return r;
    });

  /* ---------- PROMO: aktif + masih dalam rentang tanggal ---------- */
  const kini = new Date(); kini.setHours(0, 0, 0, 0);
  const promo = bacaSheet_(ss, CONFIG.SHEET_PROMO).filter(function (r) {
    if (String(r.judulPromo || '').trim() === '') return false;   // baris tanpa judul bukan promo
    const s = String(r.status || 'AKTIF').toUpperCase();
    if (s !== 'AKTIF' && s !== 'TAYANG') return false;
    const mulai = keTanggal_(r.tanggalMulai);
    const selesai = keTanggal_(r.tanggalSelesai);
    if (mulai && kini < mulai) return false;
    if (selesai) { const akhir = new Date(selesai); akhir.setHours(23, 59, 59, 999); if (kini > akhir) return false; }
    return true;
  });

  /* ---------- CERITA: opsional ---------- */
  const cerita = bacaSheet_(ss, CONFIG.SHEET_CERITA)
    .filter(function (r) { return r.judul; })
    .map(function (r) { r.thumbnail = urlFotoPublik_(r.thumbnail); return r; });

  /* ---------- STATISTIK: dihitung, tidak pernah di-hardcode ---------- */
  const usaha = {};
  const kategori = {};
  produk.forEach(function (r) {
    const u = r.idPenjual || slug_(r.namaUsaha);
    if (u) usaha[u] = true;
    if (r.kategori) kategori[r.kategori] = true;
  });

  const hasil = {
    produk: produk,
    penjual: penjual,
    promo: promo,
    cerita: cerita,
    stats: {
      jumlahProduk: produk.length,
      jumlahUsaha: Object.keys(usaha).length,
      jumlahKategori: Object.keys(kategori).length,
      jumlahPromoAktif: promo.length,
      dihitungPada: new Date().toISOString()
    }
  };

  if (cache) {
    try { cache.put('pw_data', JSON.stringify(hasil), CONFIG.CACHE_DETIK); } catch (err) {}
  }
  return hasil;
}


/**
 * Membaca satu sheet menjadi array objek dengan nama field yang dipakai website.
 * Kolom rahasia (NIM, CATATAN_ADMIN, email, alamat) dibuang di sini — jadi tidak ada
 * jalur apa pun yang bisa membocorkannya lewat API.
 */
function bacaSheet_(ss, namaSheet) {
  const sheet = ss.getSheetByName(namaSheet);
  if (!sheet || sheet.getLastRow() < 2) return [];

  const nilai = sheet.getDataRange().getValues();
  const header = nilai[0].map(normalisasiHeader_);
  const keluar = [];

  for (let i = 1; i < nilai.length; i++) {
    const row = nilai[i];
    if (row.join('').trim() === '') continue;

    const obj = {};
    let adaIsi = false;

    for (let j = 0; j < header.length; j++) {
      const asli = header[j];
      if (!asli) continue;
      if (CONFIG.KOLOM_RAHASIA.indexOf(asli) > -1) continue;   // <-- saringan privasi

      const kunci = PETA_KOLOM[asli] || asli;
      let sel = row[j];

      if (adalahTanggal_(sel)) sel = formatTanggal_(sel);
      else if (typeof sel === 'string') sel = sel.trim();

      obj[kunci] = sel;
      if (sel !== '' && sel != null) adaIsi = true;
    }
    if (adaIsi) keluar.push(obj);
  }
  return keluar;
}


/* ====================================================================================
 * 5. FOTO PRODUK
 * ------------------------------------------------------------------------------------
 * Google Form menyimpan unggahan ke Drive dalam keadaan PRIVAT, dan URL yang diberikan
 * berbentuk https://drive.google.com/open?id=... yang tidak dapat dipakai oleh tag <img>.
 *
 * Yang dilakukan di sini:
 *   1. ambil ID berkas dari URL apa pun bentuknya;
 *   2. beri izin baca "siapa saja yang memiliki tautan" PADA BERKAS ITU SAJA
 *      (bukan pada seluruh folder Drive);
 *   3. simpan URL dalam bentuk https://drive.google.com/thumbnail?id=...&sz=w1200,
 *      yaitu bentuk yang paling stabil untuk ditampilkan pada halaman web publik.
 *
 * Kalau akun kamu berada di Google Workspace (mis. domain upi.edu) yang melarang berbagi
 * ke luar organisasi, langkah 2 akan gagal. Itu bukan bug script: pengaturannya ada di
 * Admin Console. Bila itu terjadi, script mencatat peringatan di kolom CATATAN_ADMIN dan
 * kamu punya dua jalan keluar yang aman:
 *   a. minta admin Google Workspace mengizinkan berbagi tautan untuk akun pengelola; atau
 *   b. isi kolom FOTO secara manual dengan URL gambar publik lain — misalnya file yang
 *      kamu commit ke repo GitHub (contoh: assets/images/brownies.jpg). Website menerima
 *      URL absolut maupun path relatif seperti itu.
 * ==================================================================================== */

function amankanFoto_(urlMentah) {
  const pertama = String(urlMentah || '').split(',')[0].trim();
  if (!pertama) return { url: '', catatan: '' };

  const id = ekstrakIdDrive_(pertama);
  if (!id) return { url: pertama, catatan: '' };      // sudah berupa URL gambar biasa

  let catatan = '';
  try {
    DriveApp.getFileById(id).setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  } catch (err) {
    catatan = 'FOTO: izin publik gagal dipasang (' + err + '). ' +
              'Ganti kolom FOTO dengan URL gambar publik lain agar tampil di website.';
    Logger.log(catatan);
  }
  return { url: urlThumbnail_(id), catatan: catatan };
}


function ekstrakIdDrive_(url) {
  const s = String(url || '');
  const pola = [
    /[?&]id=([a-zA-Z0-9_-]{20,})/,
    /\/file\/d\/([a-zA-Z0-9_-]{20,})/,
    /\/d\/([a-zA-Z0-9_-]{20,})/,
    /googleusercontent\.com\/d\/([a-zA-Z0-9_-]{20,})/
  ];
  for (let i = 0; i < pola.length; i++) {
    const m = s.match(pola[i]);
    if (m) return m[1];
  }
  return '';
}


function urlThumbnail_(id) {
  return 'https://drive.google.com/thumbnail?id=' + id + '&sz=w' + CONFIG.LEBAR_THUMBNAIL;
}


/** Kalau nilai kolom FOTO masih berupa URL Drive bentuk lain, ubah ke bentuk thumbnail. */
function urlFotoPublik_(url) {
  const s = String(url || '').trim();
  if (!s) return '';
  if (s.indexOf('drive.google.com/thumbnail') > -1) return s;
  const id = ekstrakIdDrive_(s);
  return id ? urlThumbnail_(id) : s;
}


/**
 * Menyisir seluruh baris PRODUK (dan LOGO di PENJUAL), memasang izin baca publik pada
 * setiap berkas Drive, lalu menyeragamkan URL-nya ke bentuk thumbnail.
 * Jalankan setelah mengimpor data lama atau bila ada foto yang tidak tampil.
 */
function perbaikiIzinFoto() {
  const ss = spreadsheetAktif_();
  const laporan = ['=== PERBAIKI IZIN & URL FOTO ==='];
  let berhasil = 0, gagal = 0, dilewati = 0;

  [[CONFIG.SHEET_PRODUK, 'FOTO'], [CONFIG.SHEET_PENJUAL, 'LOGO'], [CONFIG.SHEET_CERITA, 'THUMBNAIL']]
    .forEach(function (pasangan) {
      const sheet = ss.getSheetByName(pasangan[0]);
      if (!sheet || sheet.getLastRow() < 2) return;

      const kol = petaKolom_(sheet);
      const c = kol[pasangan[1]];
      if (!c) return;

      const n = sheet.getLastRow() - 1;
      const rentang = sheet.getRange(2, c, n, 1);
      const nilai = rentang.getValues();

      for (let i = 0; i < nilai.length; i++) {
        const url = String(nilai[i][0] || '').trim();
        if (!url) { continue; }
        const id = ekstrakIdDrive_(url);
        if (!id) { dilewati++; continue; }             // URL gambar biasa, biarkan

        try {
          DriveApp.getFileById(id)
            .setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
          berhasil++;
        } catch (err) {
          gagal++;
          laporan.push('  GAGAL baris ' + (i + 2) + ' di ' + pasangan[0] + ': ' + err);
        }
        nilai[i][0] = urlThumbnail_(id);
      }
      rentang.setValues(nilai);
    });

  laporan.push('Izin dipasang : ' + berhasil);
  laporan.push('Gagal         : ' + gagal);
  laporan.push('Bukan Drive   : ' + dilewati + ' (dibiarkan apa adanya)');
  if (gagal) {
    laporan.push('');
    laporan.push('Kegagalan biasanya karena kebijakan Google Workspace melarang berbagi tautan');
    laporan.push('ke luar organisasi. Minta bantuan admin domain, atau isi kolom FOTO dengan');
    laporan.push('URL gambar publik lain (misalnya file yang kamu commit ke repo GitHub).');
  }
  bersihkanCache();

  const teks = laporan.join('\n');
  Logger.log(teks);
  return teks;
}


/**
 * Menguji apakah URL foto benar-benar dapat dibuka oleh pengunjung anonim.
 * UrlFetchApp di sini memanggil tanpa kredensial, jadi hasilnya mewakili apa yang
 * dilihat pengunjung website.
 */
function ujiFotoPublik() {
  const ss = spreadsheetAktif_();
  const sheet = ss.getSheetByName(CONFIG.SHEET_PRODUK);
  const laporan = ['=== UJI AKSES FOTO (maksimal 40 baris pertama) ==='];
  if (!sheet || sheet.getLastRow() < 2) { Logger.log('Belum ada data.'); return; }

  const kol = petaKolom_(sheet);
  if (!kol.FOTO) { Logger.log('Kolom FOTO tidak ditemukan di sheet ' + CONFIG.SHEET_PRODUK); return; }

  const n = Math.min(sheet.getLastRow() - 1, 40);
  const data = sheet.getRange(2, 1, n, sheet.getLastColumn()).getValues();

  let ok = 0, masalah = 0, kosong = 0;

  data.forEach(function (row, i) {
    const url = String(row[kol.FOTO - 1] || '').trim();
    const id = String((kol.ID_PRODUK ? row[kol.ID_PRODUK - 1] : '') || ('baris ' + (i + 2)));
    if (!url) { kosong++; laporan.push('  ' + id + ' : FOTO kosong'); return; }
    if (url.indexOf('http') !== 0) { ok++; return; }   // path relatif di repo, tidak bisa diuji

    try {
      const res = UrlFetchApp.fetch(url, { muteHttpExceptions: true, followRedirects: true });
      const kode = res.getResponseCode();
      const tipe = String(res.getAllHeaders()['Content-Type'] || res.getAllHeaders()['content-type'] || '');
      if (kode === 200 && tipe.indexOf('image') === 0) { ok++; }
      else {
        masalah++;
        laporan.push('  ' + id + ' : HTTP ' + kode + ', tipe "' + tipe + '"');
      }
    } catch (err) {
      masalah++;
      laporan.push('  ' + id + ' : gagal diakses (' + err + ')');
    }
  });

  laporan.push('');
  laporan.push('Dapat diakses : ' + ok);
  laporan.push('Bermasalah    : ' + masalah);
  laporan.push('FOTO kosong   : ' + kosong);
  if (masalah) laporan.push('Jalankan perbaikiIzinFoto() lalu uji lagi.');

  const teks = laporan.join('\n');
  Logger.log(teks);
  return teks;
}


/* ====================================================================================
 * 6. FUNGSI ADMIN
 * ==================================================================================== */
function tayangkanTerpilih()   { ubahStatusTerpilih_('TAYANG'); }
function tolakTerpilih()       { ubahStatusTerpilih_('DITOLAK'); }
function nonaktifkanTerpilih() { ubahStatusTerpilih_('NONAKTIF'); }

function ubahStatusTerpilih_(status) {
  const sheet = SpreadsheetApp.getActiveSheet();
  const rentang = sheet.getActiveRange();
  const kol = petaKolom_(sheet);

  if (!kol.STATUS) {
    SpreadsheetApp.getActive().toast('Kolom STATUS tidak ditemukan di sheet ini.');
    return;
  }

  let n = 0;
  for (let r = rentang.getRow(); r < rentang.getRow() + rentang.getNumRows(); r++) {
    if (r === 1) continue;
    sheet.getRange(r, kol.STATUS).setValue(status);
    if (status === 'TAYANG' && kol.TANGGAL_UPDATE) {
      sheet.getRange(r, kol.TANGGAL_UPDATE).setValue(new Date()).setNumberFormat('yyyy-mm-dd');
    }
    n++;
  }
  bersihkanCache();
  SpreadsheetApp.getActive().toast(n + ' baris diubah menjadi ' + status);
}


/** Mengubah status satu produk berdasarkan ID (bisa dijalankan dari editor). */
function setStatusProduk(idProduk, status) {
  const ss = spreadsheetAktif_();
  const sheet = ss.getSheetByName(CONFIG.SHEET_PRODUK);
  const kol = petaKolom_(sheet);
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][kol.ID_PRODUK - 1]).trim() !== String(idProduk).trim()) continue;
    sheet.getRange(i + 1, kol.STATUS).setValue(String(status).toUpperCase());
    if (String(status).toUpperCase() === 'TAYANG' && kol.TANGGAL_UPDATE) {
      sheet.getRange(i + 1, kol.TANGGAL_UPDATE).setValue(new Date()).setNumberFormat('yyyy-mm-dd');
    }
    bersihkanCache();
    Logger.log('%s -> %s', idProduk, status);
    return true;
  }
  Logger.log('ID %s tidak ditemukan.', idProduk);
  return false;
}


/** Mengisi ID_PRODUK / ID_PENJUAL yang masih kosong (mis. baris yang diketik manual). */
function isiIdKosong() {
  const ss = spreadsheetAktif_();
  const sheet = ss.getSheetByName(CONFIG.SHEET_PRODUK);
  if (!sheet || sheet.getLastRow() < 2) return;

  const kol = petaKolom_(sheet);
  const n = sheet.getLastRow() - 1;
  const data = sheet.getRange(2, 1, n, sheet.getLastColumn()).getValues();
  let dibuat = 0;

  for (let i = 0; i < data.length; i++) {
    if (data[i].join('').trim() === '') continue;

    if (kol.ID_PRODUK && !String(data[i][kol.ID_PRODUK - 1]).trim()) {
      const id = idBerikutnya_(sheet, 'ID_PRODUK', CONFIG.PREFIKS_PRODUK);
      sheet.getRange(i + 2, kol.ID_PRODUK).setValue(id);
      data[i][kol.ID_PRODUK - 1] = id;
      dibuat++;
    }
    if (kol.ID_PENJUAL && !String(data[i][kol.ID_PENJUAL - 1]).trim() && kol.NAMA_USAHA) {
      const idp = idPenjualUntukUsaha_(sheet, String(data[i][kol.NAMA_USAHA - 1] || ''));
      sheet.getRange(i + 2, kol.ID_PENJUAL).setValue(idp);
      data[i][kol.ID_PENJUAL - 1] = idp;
    }
  }
  bersihkanCache();
  Logger.log('%s ID produk dibuat.', dibuat);
}


/**
 * Membersihkan "baris hantu" dan menaikkan kembali data asli ke atas.
 *
 * Kenapa perlu: versi awal script ini memasang checkbox ke seluruh kolom FEATURED
 * sampai baris 1000. insertCheckboxes() menuliskan nilai FALSE ke setiap sel yang
 * dikenainya, sehingga Sheet menganggap 999 baris kosong itu "berisi". Akibatnya
 * appendRow() menaruh kiriman Form di baris ~1001 — jauh di bawah layar — dan baris
 * kosong di atas ikut terbaca sebagai produk oleh API.
 *
 * Fungsi ini menyimpan hanya baris yang punya ID atau nama, menuliskannya ulang mulai
 * baris 2, lalu memasang kembali dropdown dan checkbox seperlunya. Aman dijalankan
 * berkali-kali dan tidak menghapus data yang berisi.
 */
function rapikanSheet() {
  const ss = spreadsheetAktif_();
  const out = ['=== RAPIKAN SHEET ==='];

  const target = [
    [CONFIG.SHEET_PRODUK,  ['ID_PRODUK', 'NAMA_PRODUK']],
    [CONFIG.SHEET_PENJUAL, ['ID_PENJUAL', 'NAMA_USAHA']],
    [CONFIG.SHEET_PROMO,   ['ID_PROMO', 'JUDUL_PROMO']],
    [CONFIG.SHEET_CERITA,  ['ID_CERITA', 'JUDUL']]
  ];

  target.forEach(function (t) {
    const sheet = ss.getSheetByName(t[0]);
    if (!sheet) return;

    const lebar = sheet.getLastColumn();
    const akhir = sheet.getLastRow();
    if (lebar < 1 || akhir < 2) { out.push(t[0] + '  : belum ada isi'); return; }

    const kol = petaKolom_(sheet);
    const kunci = t[1].map(function (n) { return kol[n]; }).filter(Boolean);
    if (!kunci.length) { out.push(t[0] + '  : kolom kunci tidak ditemukan, dilewati'); return; }

    const data = sheet.getRange(2, 1, akhir - 1, lebar).getValues();
    const nyata = data.filter(function (r) {
      return kunci.some(function (c) {
        return String(r[c - 1] == null ? '' : r[c - 1]).trim() !== '';
      });
    });

    // kosongkan seluruh area di bawah header, lalu tulis ulang baris yang benar-benar berisi
    sheet.getRange(2, 1, sheet.getMaxRows() - 1, lebar).clearContent().clearDataValidations();
    if (nyata.length) sheet.getRange(2, 1, nyata.length, lebar).setValues(nyata);

    out.push(t[0] + '  : ' + nyata.length + ' baris berisi dipertahankan, ' +
             (data.length - nyata.length) + ' baris hantu dibersihkan');

    if (t[0] === CONFIG.SHEET_PRODUK && nyata.length) {
      out.push('   isi sheet PRODUK sekarang:');
      nyata.slice(0, 20).forEach(function (r, i) {
        const id = kol.ID_PRODUK ? r[kol.ID_PRODUK - 1] : '';
        const nama = kol.NAMA_PRODUK ? r[kol.NAMA_PRODUK - 1] : '';
        const st = kol.STATUS ? r[kol.STATUS - 1] : '';
        out.push('     baris ' + (i + 2) + ' | ' + id + ' | ' + nama + ' | ' + st);
      });
    }
  });

  aturValidasiProduk_(ss);
  aturValidasiLain_(ss);
  bersihkanCache();

  out.push('');
  out.push('Selesai. Kalau ada baris berstatus MENUNGGU, ubah ke TAYANG lewat dropdown,');
  out.push('tunggu sekitar satu menit, lalu muat ulang website.');

  const teks = out.join('\n');
  Logger.log(teks);
  return teks;
}


function bersihkanCache() {
  try { CacheService.getScriptCache().remove('pw_data'); } catch (err) {}
}


/* ====================================================================================
 * 7. UTILITAS
 * ==================================================================================== */
function spreadsheetAktif_() {
  const id = PropertiesService.getScriptProperties().getProperty(PROP.SHEET_ID);
  const aktif = SpreadsheetApp.getActiveSpreadsheet();
  if (aktif) return aktif;
  if (id) return SpreadsheetApp.openById(id);
  throw new Error('Spreadsheet belum disetup. Jalankan setupPojokWirausaha().');
}


function normalisasiHeader_(h) {
  return String(h == null ? '' : h).toLowerCase().replace(/[^a-z0-9]/g, '');
}


/** { NAMA_KOLOM: nomorKolom } berdasarkan baris header, 1-based. */
function petaKolom_(sheet) {
  const lebar = sheet.getLastColumn();
  if (!lebar) return {};
  const header = sheet.getRange(1, 1, 1, lebar).getValues()[0];
  const peta = {};
  header.forEach(function (h, i) {
    const nama = String(h || '').trim().toUpperCase().replace(/\s+/g, '_');
    if (nama) peta[nama] = i + 1;
  });
  return peta;
}


/**
 * ID berikutnya = angka terbesar yang pernah dipakai + 1.
 * Bukan berdasarkan jumlah baris, sehingga ID tetap unik walau ada baris dihapus,
 * dan tidak berubah walaupun sheet diurutkan ulang (ID tersimpan di selnya sendiri).
 */
function idBerikutnya_(sheet, namaKolom, prefiks) {
  const kol = petaKolom_(sheet);
  const c = kol[namaKolom];
  if (!c || sheet.getLastRow() < 2) return prefiks + nolDepan_(1);

  const nilai = sheet.getRange(2, c, sheet.getLastRow() - 1, 1).getValues();
  let maks = 0;
  nilai.forEach(function (r) {
    const m = String(r[0] || '').match(/(\d+)\s*$/);
    if (m) maks = Math.max(maks, parseInt(m[1], 10));
  });
  return prefiks + nolDepan_(maks + 1);
}


function nolDepan_(n) {
  let s = String(n);
  while (s.length < CONFIG.DIGIT_ID) s = '0' + s;
  return s;
}


/**
 * Satu usaha = satu ID_PENJUAL. Kalau nama usaha sudah pernah terdaftar, ID lamanya
 * dipakai lagi supaya seluruh produknya berkumpul di satu halaman toko.
 */
function idPenjualUntukUsaha_(sheetProduk, namaUsaha) {
  const nama = String(namaUsaha || '').trim().toLowerCase();
  if (!nama) return '';

  const kol = petaKolom_(sheetProduk);
  if (!kol.NAMA_USAHA || !kol.ID_PENJUAL) return slug_(namaUsaha);

  if (sheetProduk.getLastRow() >= 2) {
    const data = sheetProduk.getRange(2, 1, sheetProduk.getLastRow() - 1, sheetProduk.getLastColumn()).getValues();
    for (let i = 0; i < data.length; i++) {
      const u = String(data[i][kol.NAMA_USAHA - 1] || '').trim().toLowerCase();
      const id = String(data[i][kol.ID_PENJUAL - 1] || '').trim();
      if (u && u === nama && id) return id;
    }
  }
  return idBerikutnya_(sheetProduk, 'ID_PENJUAL', CONFIG.PREFIKS_PENJUAL);
}


/** "Rp 25.000" / "25000" / 25000 -> 25000 (number). */
function keAngka_(v) {
  if (typeof v === 'number' && isFinite(v)) return Math.round(v);
  if (v === '' || v == null) return 0;
  const s = String(v).replace(/rp/gi, '').replace(/\s/g, '').replace(/\./g, '').replace(/,/g, '.');
  const n = parseFloat(s);
  return isNaN(n) ? 0 : Math.round(n);
}


function keBoolean_(v) {
  if (v === true) return true;
  const s = String(v == null ? '' : v).trim().toLowerCase();
  return s === 'true' || s === 'ya' || s === 'yes' || s === '1' || s === 'y';
}


/** 08123456789 / +62 812-3456-789 / 8123456789 -> 628123456789 (tanpa tanda +). */
function normalisasiWa_(nomor) {
  if (!nomor) return '';
  let s = String(nomor).replace(/[^\d+]/g, '').replace(/^\+/, '');
  if (!s) return '';
  if (s.indexOf('62') === 0) return s;
  if (s.indexOf('0') === 0) return '62' + s.slice(1);
  if (s.indexOf('8') === 0) return '62' + s;
  return s;
}


/** "@dapurnaya" / "instagram.com/dapurnaya/" / "https://www.instagram.com/dapurnaya" -> "dapurnaya". */
function normalisasiIg_(ig) {
  if (!ig) return '';
  return String(ig).trim()
    .replace(/^(https?:\/\/)?(www\.)?instagram\.com\//i, '')
    .replace(/[?#].*$/, '')
    .replace(/\/+$/, '')
    .replace(/^@+/, '')
    .replace(/\s+/g, '');
}


function kategoriSah_(nama) {
  const s = String(nama || '').trim();
  for (let i = 0; i < CONFIG.KATEGORI.length; i++) {
    if (CONFIG.KATEGORI[i].toLowerCase() === s.toLowerCase()) return CONFIG.KATEGORI[i];
  }
  return s || 'Lainnya';
}


function slug_(s) {
  return String(s || '').toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}


/** Pengenalan Date yang tidak bergantung pada instanceof (lebih tahan banting). */
function adalahTanggal_(v) {
  return Object.prototype.toString.call(v) === '[object Date]' && !isNaN(v.getTime());
}


function formatTanggal_(d) {
  return Utilities.formatDate(d, Session.getScriptTimeZone() || 'Asia/Jakarta', 'yyyy-MM-dd');
}


function keTanggal_(v) {
  if (!v) return null;
  if (adalahTanggal_(v)) return v;
  const s = String(v).trim();
  const m = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
  if (m) return new Date(+m[3], +m[2] - 1, +m[1]);
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}


function waktu_(v) {
  const d = keTanggal_(v);
  return d ? d.getTime() : 0;
}


/** Menjalankan fn dan mengabaikan error — untuk pengaturan opsional yang tidak kritis. */
function coba_(fn) {
  try { fn(); return true; } catch (err) { return false; }
}


/* ====================================================================================
 * 8. PENGUJIAN — jalankan dari editor, lihat Execution log
 * ==================================================================================== */

/** Memastikan API mengembalikan bentuk yang benar dan tidak membocorkan data sensitif. */
function ujiApi() {
  const out = ['=== UJI API ==='];
  const data = kumpulkanData_();

  out.push('Produk TAYANG : ' + data.produk.length);
  out.push('Penjual       : ' + data.penjual.length);
  out.push('Promo aktif   : ' + data.promo.length);
  out.push('Cerita        : ' + data.cerita.length);
  out.push('Stats         : ' + JSON.stringify(data.stats));

  if (!data.produk.length) {
    out.push('');
    out.push('Belum ada produk berstatus TAYANG. Ubah kolom STATUS di sheet PRODUK,');
    out.push('lalu jalankan ujiApi() lagi.');
    Logger.log(out.join('\n'));
    return out.join('\n');
  }

  const p = data.produk[0];
  out.push('');
  out.push('--- Contoh satu produk ---');
  out.push(JSON.stringify(p, null, 2));

  out.push('');
  out.push('--- Pemeriksaan kontrak dengan website ---');
  const wajib = ['idProduk', 'idPenjual', 'namaProduk', 'namaUsaha', 'namaMahasiswa',
                 'kategori', 'harga', 'deskripsi', 'foto', 'whatsapp', 'lokasi',
                 'status', 'tanggalUpdate'];
  const hilang = wajib.filter(function (k) { return !(k in p); });
  out.push(hilang.length ? 'FIELD HILANG : ' + hilang.join(', ') : 'Field wajib   : lengkap');
  out.push('harga number  : ' + (typeof p.harga === 'number' ? 'ya' : 'TIDAK (' + typeof p.harga + ')'));
  out.push('whatsapp 62   : ' + (/^62\d+$/.test(String(p.whatsapp)) ? 'ya' : 'periksa: ' + p.whatsapp));
  out.push('instagram     : ' + (String(p.instagram || '').indexOf('@') === -1 ? 'ya (tanpa @)' : 'MASIH ADA @'));
  out.push('status TAYANG : ' + (data.produk.every(function (x) {
    return String(x.status).toUpperCase() === 'TAYANG';
  }) ? 'ya' : 'ADA YANG BUKAN TAYANG'));

  const bocor = [];
  data.produk.forEach(function (x) {
    Object.keys(x).forEach(function (k) {
      if (CONFIG.KOLOM_RAHASIA.indexOf(normalisasiHeader_(k)) > -1 && bocor.indexOf(k) === -1) bocor.push(k);
    });
  });
  out.push('Data sensitif : ' + (bocor.length ? 'BOCOR -> ' + bocor.join(', ') : 'aman, tidak ada NIM/catatan admin'));

  const teks = out.join('\n');
  Logger.log(teks);
  return teks;
}


/** Mengisi 3 baris contoh berstatus TAYANG supaya bisa mencoba website sebelum ada pendaftar. */
function isiContohUntukUjiCoba() {
  const ss = spreadsheetAktif_();
  const sheet = ss.getSheetByName(CONFIG.SHEET_PRODUK);
  const kol = petaKolom_(sheet);

  const contoh = [
    ['Brownies Lumer', 'Dapur Naya', 'Naya Putri', '2025', 'Kuliner', 25000,
     'Brownies homemade dengan lelehan cokelat di tengah.', 'COD UPI Kampus Serang', '081234567890', '@dapurnaya'],
    ['Totebag Lukis Custom', 'Tote Ceria', 'Salsabila Aini', '2023', 'Fashion', 65000,
     'Totebag kanvas 12 oz dilukis tangan sesuai permintaan.', 'COD UPI Kampus Serang', '085212345603', 'toteceria'],
    ['Jasa Desain Poster', 'Fajar Kreatif', 'Fajar Nugraha', '2023', 'Jasa Kreatif', 35000,
     'Desain poster kegiatan, sudah termasuk dua kali revisi.', 'Online', '089612345606', '@fajarkreatif']
  ];

  contoh.forEach(function (c) {
    const baris = new Array(HEADER.PRODUK.length).fill('');
    const isi = function (n, v) { if (kol[n]) baris[kol[n] - 1] = v; };
    isi('ID_PRODUK', idBerikutnya_(sheet, 'ID_PRODUK', CONFIG.PREFIKS_PRODUK));
    isi('ID_PENJUAL', idPenjualUntukUsaha_(sheet, c[1]));
    isi('TIMESTAMP', new Date());
    isi('NAMA_MAHASISWA', c[2]);
    isi('NIM', '-');
    isi('ANGKATAN', c[3]);
    isi('NAMA_USAHA', c[1]);
    isi('NAMA_PRODUK', c[0]);
    isi('KATEGORI', c[4]);
    isi('HARGA', c[5]);
    isi('DESKRIPSI', c[6]);
    isi('FOTO', '');
    isi('WHATSAPP', normalisasiWa_(c[8]));
    isi('INSTAGRAM', normalisasiIg_(c[9]));
    isi('LOKASI', c[7]);
    isi('STATUS', 'TAYANG');
    isi('FEATURED', false);
    isi('TANGGAL_UPDATE', new Date());
    isi('CATATAN_ADMIN', 'Data uji coba — hapus sebelum dipublikasikan.');
    sheet.appendRow(baris);
  });

  bersihkanCache();
  Logger.log('3 baris contoh ditambahkan dengan status TAYANG. Hapus setelah selesai menguji.');
}
