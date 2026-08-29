/* ==========================================================================
   data-demo.js — Data contoh (dipakai otomatis saat API_URL masih kosong
   atau saat API gagal diakses). Struktur field-nya PERSIS sama dengan JSON
   yang dikirim Google Apps Script, jadi tidak ada kode yang perlu diubah
   ketika kamu beralih ke data asli dari Google Sheet.
   ========================================================================== */

window.PW = window.PW || {};

PW.DEMO = {

  /* ---------------------------------------------------------------- PENJUAL */
  penjual: [
    {
      idPenjual: "PGSD001", namaMahasiswa: "Naya Putri", angkatan: "2025",
      namaUsaha: "Dapur Naya", deskripsiUsaha: "Brownies & homemade cake yang dipanggang setiap pagi di kos. Bisa custom topping dan ucapan untuk hadiah.",
      logo: "assets/images/pgsd001.svg", whatsapp: "6281234567801", instagram: "@dapurnaya",
      lokasi: "COD UPI Kampus Serang", status: "AKTIF"
    },
    {
      idPenjual: "PGSD002", namaMahasiswa: "Rifqi Maulana", angkatan: "2024",
      namaUsaha: "Kopi Kelas", deskripsiUsaha: "Kopi susu gula aren dan minuman kekinian harga mahasiswa. Melayani pesanan botolan untuk acara kelas.",
      logo: "assets/images/pgsd002.svg", whatsapp: "081234567802", instagram: "kopikelas.id",
      lokasi: "COD Kantin Kampus / Ciracas", status: "AKTIF"
    },
    {
      idPenjual: "PGSD003", namaMahasiswa: "Salsabila Aini", angkatan: "2023",
      namaUsaha: "Tote Ceria", deskripsiUsaha: "Totebag lukis tangan dan kaos custom bertema anak & pendidikan. Cocok untuk seragam kelompok KKN atau PPL.",
      logo: "assets/images/pgsd003.svg", whatsapp: "6285212345603", instagram: "@toteceria",
      lokasi: "COD UPI Kampus Serang", status: "AKTIF"
    },
    {
      idPenjual: "PGSD004", namaMahasiswa: "Dimas Prasetyo", angkatan: "2024",
      namaUsaha: "Studio Belajar", deskripsiUsaha: "Media pembelajaran SD siap pakai: flashcard, papan pintar, dan worksheet tematik hasil pengembangan tugas kuliah.",
      logo: "assets/images/pgsd004.svg", whatsapp: "6281398765404", instagram: "studiobelajar.sd",
      lokasi: "COD UPI Kampus Serang / kirim seluruh Indonesia", status: "AKTIF"
    },
    {
      idPenjual: "PGSD005", namaMahasiswa: "Anisa Rahmawati", angkatan: "2025",
      namaUsaha: "Bloom by Anisa", deskripsiUsaha: "Buket bunga satin, buket snack, dan hampers wisuda. Bisa request warna sesuai almamater.",
      logo: "assets/images/pgsd005.svg", whatsapp: "085612345605", instagram: "@bloom.byanisa",
      lokasi: "COD UPI Kampus Serang", status: "AKTIF"
    },
    {
      idPenjual: "PGSD006", namaMahasiswa: "Fajar Nugraha", angkatan: "2023",
      namaUsaha: "Fajar Kreatif", deskripsiUsaha: "Jasa desain poster, feed Instagram, dan editing video reels untuk UMKM maupun kegiatan kampus.",
      logo: "assets/images/pgsd006.svg", whatsapp: "6289612345606", instagram: "fajarkreatif.studio",
      lokasi: "Online / COD UPI Kampus Serang", status: "AKTIF"
    },
    {
      idPenjual: "PGSD007", namaMahasiswa: "Putri Handayani", angkatan: "2024",
      namaUsaha: "Sweet Corner", deskripsiUsaha: "Dessert box dan rice bowl porsi mahasiswa. Ready setiap Senin–Jumat, pre-order H-1.",
      logo: "assets/images/pgsd007.svg", whatsapp: "6281745678907", instagram: "@sweetcorner.srg",
      lokasi: "COD Gerbang UPI Kampus Serang", status: "AKTIF"
    },
    {
      idPenjual: "PGSD008", namaMahasiswa: "Ilham Ramadhan", angkatan: "2025",
      namaUsaha: "Kunci Karya", deskripsiUsaha: "Gantungan kunci akrilik, stiker, dan merchandise custom bertema PGSD. Minimal order 10 pcs.",
      logo: "assets/images/pgsd008.svg", whatsapp: "081877654308", instagram: "@kuncikarya",
      lokasi: "COD UPI Kampus Serang", status: "AKTIF"
    },
    {
      idPenjual: "PGSD009", namaMahasiswa: "Mutiara Zahra", angkatan: "2023",
      namaUsaha: "Bimbel Ceria", deskripsiUsaha: "Les privat calistung dan pendampingan belajar SD kelas 1–3, dilakukan mahasiswa PGSD tingkat akhir.",
      logo: "assets/images/pgsd009.svg", whatsapp: "6282112345609", instagram: "bimbelceria.serang",
      lokasi: "Ke rumah area Kota Serang / online", status: "AKTIF"
    },
    {
      idPenjual: "PGSD010", namaMahasiswa: "Gilang Saputra", angkatan: "2024",
      namaUsaha: "Ilustra Kelas", deskripsiUsaha: "Jasa ilustrasi karakter anak, sampul modul, dan aset visual untuk media pembelajaran.",
      logo: "assets/images/pgsd010.svg", whatsapp: "6285798765410", instagram: "@ilustrakelas",
      lokasi: "Online (file digital)", status: "AKTIF"
    }
  ],

  /* ----------------------------------------------------------------- PRODUK */
  produk: [
    {
      idProduk: "PRD001", idPenjual: "PGSD001", namaProduk: "Brownies Lumer",
      namaUsaha: "Dapur Naya", namaMahasiswa: "Naya Putri", angkatan: "2025",
      kategori: "Kuliner", harga: 25000,
      deskripsi: "Brownies homemade dengan lelehan cokelat di tengah dan topping premium. Tekstur fudgy, tidak terlalu manis, dikemas rapi dalam box ukuran 20x10 cm. Cocok untuk camilan diskusi kelompok maupun hadiah kecil.",
      foto: "assets/images/prd001.svg", whatsapp: "6281234567801", instagram: "@dapurnaya",
      lokasi: "COD UPI Kampus Serang", promo: "Diskon 20%", status: "TAYANG",
      featured: "TRUE", rating: 4.9, varian: "Original, Keju, Matcha, Tiramisu",
      tanggalUpdate: "2026-08-24"
    },
    {
      idProduk: "PRD002", idPenjual: "PGSD001", namaProduk: "Brownies Keju Premium",
      namaUsaha: "Dapur Naya", namaMahasiswa: "Naya Putri", angkatan: "2025",
      kategori: "Kuliner", harga: 32000,
      deskripsi: "Brownies panggang dengan taburan keju cheddar melimpah dan lapisan cokelat ganda. Tahan 3 hari di suhu ruang.",
      foto: "assets/images/prd002.svg", whatsapp: "6281234567801", instagram: "@dapurnaya",
      lokasi: "COD UPI Kampus Serang", promo: "", status: "TAYANG",
      featured: "", rating: 4.8, varian: "Keju, Keju Almond",
      tanggalUpdate: "2026-08-20"
    },
    {
      idProduk: "PRD003", idPenjual: "PGSD001", namaProduk: "Paket Hampers Manis",
      namaUsaha: "Dapur Naya", namaMahasiswa: "Naya Putri", angkatan: "2025",
      kategori: "Gift & Merchandise", harga: 85000,
      deskripsi: "Hampers berisi brownies mini, cookies, dan kartu ucapan tulis tangan. Bisa custom warna pita dan pesan untuk wisuda atau ulang tahun.",
      foto: "assets/images/prd003.svg", whatsapp: "6281234567801", instagram: "@dapurnaya",
      lokasi: "COD UPI Kampus Serang", promo: "", status: "TAYANG",
      featured: "", rating: 5, varian: "Small, Medium, Large",
      tanggalUpdate: "2026-07-30"
    },
    {
      idProduk: "PRD004", idPenjual: "PGSD002", namaProduk: "Kopi Susu Gula Aren",
      namaUsaha: "Kopi Kelas", namaMahasiswa: "Rifqi Maulana", angkatan: "2024",
      kategori: "Minuman", harga: 15000,
      deskripsi: "Espresso lokal Banten dipadu susu segar dan gula aren cair buatan sendiri. Disajikan dalam botol 250 ml, bisa dipesan lusinan untuk acara kelas.",
      foto: "assets/images/prd004.svg", whatsapp: "081234567802", instagram: "kopikelas.id",
      lokasi: "COD Kantin Kampus / Ciracas", promo: "Paket Hemat", status: "TAYANG",
      featured: "TRUE", rating: 4.7, varian: "Less sugar, Normal, Extra shot",
      tanggalUpdate: "2026-08-26"
    },
    {
      idProduk: "PRD005", idPenjual: "PGSD002", namaProduk: "Matcha Latte Dingin",
      namaUsaha: "Kopi Kelas", namaMahasiswa: "Rifqi Maulana", angkatan: "2024",
      kategori: "Minuman", harga: 18000,
      deskripsi: "Matcha grade premium dengan susu full cream, tidak pahit dan tidak terlalu manis. Botol 250 ml.",
      foto: "assets/images/prd005.svg", whatsapp: "081234567802", instagram: "kopikelas.id",
      lokasi: "COD Kantin Kampus / Ciracas", promo: "", status: "TAYANG",
      featured: "", rating: 4.6, varian: "Normal, Less sugar",
      tanggalUpdate: "2026-08-18"
    },
    {
      idProduk: "PRD006", idPenjual: "PGSD003", namaProduk: "Totebag Lukis Custom",
      namaUsaha: "Tote Ceria", namaMahasiswa: "Salsabila Aini", angkatan: "2023",
      kategori: "Fashion", harga: 65000,
      deskripsi: "Totebag kanvas tebal 12 oz dilukis tangan sesuai permintaan: nama, ilustrasi anak, atau logo kelompok. Pengerjaan 3–5 hari.",
      foto: "assets/images/prd006.svg", whatsapp: "6285212345603", instagram: "@toteceria",
      lokasi: "COD UPI Kampus Serang", promo: "", status: "TAYANG",
      featured: "TRUE", rating: 4.9, varian: "Natural, Hitam, Navy",
      tanggalUpdate: "2026-08-25"
    },
    {
      idProduk: "PRD007", idPenjual: "PGSD003", namaProduk: "Kaos Kelas Custom",
      namaUsaha: "Tote Ceria", namaMahasiswa: "Salsabila Aini", angkatan: "2023",
      kategori: "Fashion", harga: 95000,
      deskripsi: "Kaos cotton combed 30s dengan sablon DTF. Harga sudah termasuk desain sederhana. Minimal order 10 pcs untuk kelompok PPL atau KKN.",
      foto: "assets/images/prd007.svg", whatsapp: "6285212345603", instagram: "@toteceria",
      lokasi: "COD UPI Kampus Serang", promo: "", status: "TAYANG",
      featured: "", rating: 4.8, varian: "S, M, L, XL, XXL",
      tanggalUpdate: "2026-07-18"
    },
    {
      idProduk: "PRD008", idPenjual: "PGSD004", namaProduk: "Flashcard Calistung Anak",
      namaUsaha: "Studio Belajar", namaMahasiswa: "Dimas Prasetyo", angkatan: "2024",
      kategori: "Pendidikan", harga: 45000,
      deskripsi: "Satu set 60 kartu bergambar untuk membaca, menulis, dan berhitung kelas awal. Dicetak art carton 260 gsm dan sudah dilaminasi doff sehingga tahan dipakai berulang.",
      foto: "assets/images/prd008.svg", whatsapp: "6281398765404", instagram: "studiobelajar.sd",
      lokasi: "COD UPI Kampus Serang / kirim seluruh Indonesia", promo: "", status: "TAYANG",
      featured: "TRUE", rating: 5, varian: "Set Huruf, Set Angka, Bundling",
      tanggalUpdate: "2026-08-27"
    },
    {
      idProduk: "PRD009", idPenjual: "PGSD004", namaProduk: "Worksheet Tematik SD (Digital)",
      namaUsaha: "Studio Belajar", namaMahasiswa: "Dimas Prasetyo", angkatan: "2024",
      kategori: "Produk Digital", harga: 20000,
      deskripsi: "Paket 40 halaman lembar kerja tematik siap cetak dalam format PDF. Sudah disesuaikan dengan capaian pembelajaran fase A dan B.",
      foto: "assets/images/prd009.svg", whatsapp: "6281398765404", instagram: "studiobelajar.sd",
      lokasi: "Online (file digital)", promo: "", status: "TAYANG",
      featured: "", rating: 4.7, varian: "Fase A, Fase B",
      tanggalUpdate: "2026-08-16"
    },
    {
      idProduk: "PRD010", idPenjual: "PGSD004", namaProduk: "Media Pembelajaran Papan Pintar",
      namaUsaha: "Studio Belajar", namaMahasiswa: "Dimas Prasetyo", angkatan: "2024",
      kategori: "Pendidikan", harga: 120000,
      deskripsi: "Papan manipulatif kayu ringan untuk operasi hitung dan pengenalan bangun datar. Dilengkapi buku panduan penggunaan di kelas.",
      foto: "assets/images/prd010.svg", whatsapp: "6281398765404", instagram: "studiobelajar.sd",
      lokasi: "COD UPI Kampus Serang", promo: "", status: "TAYANG",
      featured: "", rating: 4.9, varian: "Matematika, Bangun Datar",
      tanggalUpdate: "2026-06-28"
    },
    {
      idProduk: "PRD011", idPenjual: "PGSD005", namaProduk: "Buket Bunga Wisuda",
      namaUsaha: "Bloom by Anisa", namaMahasiswa: "Anisa Rahmawati", angkatan: "2025",
      kategori: "Gift & Merchandise", harga: 110000,
      deskripsi: "Buket bunga satin tahan lama dengan pita dan kartu ucapan. Warna bisa disesuaikan dengan almamater. Pre-order minimal 2 hari sebelum acara.",
      foto: "assets/images/prd011.svg", whatsapp: "085612345605", instagram: "@bloom.byanisa",
      lokasi: "COD UPI Kampus Serang", promo: "Promo Wisuda", status: "TAYANG",
      featured: "TRUE", rating: 4.9, varian: "Small, Medium, Jumbo",
      tanggalUpdate: "2026-08-22"
    },
    {
      idProduk: "PRD012", idPenjual: "PGSD005", namaProduk: "Buket Snack Ulang Tahun",
      namaUsaha: "Bloom by Anisa", namaMahasiswa: "Anisa Rahmawati", angkatan: "2025",
      kategori: "Gift & Merchandise", harga: 75000,
      deskripsi: "Buket berisi aneka snack favorit, dibungkus rapi dengan kertas buket dan pita. Bisa request isi sesuai selera penerima.",
      foto: "assets/images/prd012.svg", whatsapp: "085612345605", instagram: "@bloom.byanisa",
      lokasi: "COD UPI Kampus Serang", promo: "", status: "TAYANG",
      featured: "", rating: 4.8, varian: "Reguler, Jumbo",
      tanggalUpdate: "2026-08-05"
    },
    {
      idProduk: "PRD013", idPenjual: "PGSD006", namaProduk: "Jasa Desain Poster Canva",
      namaUsaha: "Fajar Kreatif", namaMahasiswa: "Fajar Nugraha", angkatan: "2023",
      kategori: "Jasa Kreatif", harga: 35000,
      deskripsi: "Desain poster kegiatan, seminar, atau promosi produk. Sudah termasuk dua kali revisi dan file siap cetak maupun siap unggah ke media sosial.",
      foto: "assets/images/prd013.svg", whatsapp: "6289612345606", instagram: "fajarkreatif.studio",
      lokasi: "Online / COD UPI Kampus Serang", promo: "Promo Akhir Bulan", status: "TAYANG",
      featured: "TRUE", rating: 4.8, varian: "Poster, Feed IG, Story IG",
      tanggalUpdate: "2026-08-28"
    },
    {
      idProduk: "PRD014", idPenjual: "PGSD006", namaProduk: "Jasa Editing Video Reels",
      namaUsaha: "Fajar Kreatif", namaMahasiswa: "Fajar Nugraha", angkatan: "2023",
      kategori: "Jasa Kreatif", harga: 60000,
      deskripsi: "Editing video pendek maksimal 90 detik: cutting, subtitle otomatis, transisi, musik, dan color grading ringan. Pengerjaan 2 hari kerja.",
      foto: "assets/images/prd014.svg", whatsapp: "6289612345606", instagram: "fajarkreatif.studio",
      lokasi: "Online (file digital)", promo: "", status: "TAYANG",
      featured: "", rating: 4.7, varian: "Reels 30s, Reels 60s, Reels 90s",
      tanggalUpdate: "2026-08-12"
    },
    {
      idProduk: "PRD015", idPenjual: "PGSD007", namaProduk: "Dessert Box Choco Silky",
      namaUsaha: "Sweet Corner", namaMahasiswa: "Putri Handayani", angkatan: "2024",
      kategori: "Kuliner", harga: 28000,
      deskripsi: "Dessert box lapis regal, silky pudding cokelat, dan taburan biskuit. Disajikan dingin dalam wadah 350 ml.",
      foto: "assets/images/prd015.svg", whatsapp: "6281745678907", instagram: "@sweetcorner.srg",
      lokasi: "COD Gerbang UPI Kampus Serang", promo: "", status: "TAYANG",
      featured: "", rating: 4.8, varian: "Choco, Regal, Matcha",
      tanggalUpdate: "2026-08-19"
    },
    {
      idProduk: "PRD016", idPenjual: "PGSD007", namaProduk: "Rice Bowl Ayam Sambal Matah",
      namaUsaha: "Sweet Corner", namaMahasiswa: "Putri Handayani", angkatan: "2024",
      kategori: "Kuliner", harga: 22000,
      deskripsi: "Nasi hangat dengan ayam suwir dan sambal matah segar. Porsi mahasiswa, ready Senin sampai Jumat pukul 10.00.",
      foto: "assets/images/prd016.svg", whatsapp: "6281745678907", instagram: "@sweetcorner.srg",
      lokasi: "COD Gerbang UPI Kampus Serang", promo: "Gratis Ongkir Area Kampus", status: "TAYANG",
      featured: "TRUE", rating: 4.9, varian: "Original, Extra sambal, Extra nasi",
      tanggalUpdate: "2026-08-27"
    },
    {
      idProduk: "PRD017", idPenjual: "PGSD008", namaProduk: "Gantungan Kunci Akrilik Custom",
      namaUsaha: "Kunci Karya", namaMahasiswa: "Ilham Ramadhan", angkatan: "2025",
      kategori: "Handmade", harga: 12000,
      deskripsi: "Gantungan kunci akrilik 2 sisi dengan desain sesuai permintaan. Minimal order 10 pcs, cocok untuk suvenir kegiatan atau kenang-kenangan kelas.",
      foto: "assets/images/prd017.svg", whatsapp: "081877654308", instagram: "@kuncikarya",
      lokasi: "COD UPI Kampus Serang", promo: "", status: "TAYANG",
      featured: "", rating: 4.6, varian: "5 cm, 7 cm",
      tanggalUpdate: "2026-08-21"
    },
    {
      idProduk: "PRD018", idPenjual: "PGSD008", namaProduk: "Stiker & Merchandise PGSD",
      namaUsaha: "Kunci Karya", namaMahasiswa: "Ilham Ramadhan", angkatan: "2025",
      kategori: "Gift & Merchandise", harga: 10000,
      deskripsi: "Paket stiker vinyl tahan air bertema mahasiswa PGSD, isi 8 desain per paket. Bisa custom desain kelas.",
      foto: "assets/images/prd018.svg", whatsapp: "081877654308", instagram: "@kuncikarya",
      lokasi: "COD UPI Kampus Serang", promo: "", status: "TAYANG",
      featured: "", rating: 4.5, varian: "Paket A, Paket B",
      tanggalUpdate: "2026-07-11"
    },
    {
      idProduk: "PRD019", idPenjual: "PGSD009", namaProduk: "Les Privat Calistung (per sesi)",
      namaUsaha: "Bimbel Ceria", namaMahasiswa: "Mutiara Zahra", angkatan: "2023",
      kategori: "Pendidikan", harga: 50000,
      deskripsi: "Pendampingan belajar membaca, menulis, dan berhitung untuk anak kelas 1–3 SD. Satu sesi 60 menit, maksimal 3 anak per kelompok, dengan laporan perkembangan sederhana untuk orang tua.",
      foto: "assets/images/prd019.svg", whatsapp: "6282112345609", instagram: "bimbelceria.serang",
      lokasi: "Ke rumah area Kota Serang / online", promo: "", status: "TAYANG",
      featured: "", rating: 5, varian: "Privat, Kelompok, Online",
      tanggalUpdate: "2026-08-23"
    },
    {
      idProduk: "PRD020", idPenjual: "PGSD010", namaProduk: "Jasa Ilustrasi Karakter Anak",
      namaUsaha: "Ilustra Kelas", namaMahasiswa: "Gilang Saputra", angkatan: "2024",
      kategori: "Jasa Kreatif", harga: 40000,
      deskripsi: "Ilustrasi karakter anak untuk sampul modul, media pembelajaran, atau bahan ajar. Gaya flat dan ramah anak, file PNG transparan resolusi tinggi.",
      foto: "assets/images/prd020.svg", whatsapp: "6285798765410", instagram: "@ilustrakelas",
      lokasi: "Online (file digital)", promo: "", status: "TAYANG",
      featured: "TRUE", rating: 4.8, varian: "Half body, Full body, Set 3 karakter",
      tanggalUpdate: "2026-08-26"
    },
    {
      idProduk: "PRD021", idPenjual: "PGSD008", namaProduk: "Paket Alat Tulis Estetik",
      namaUsaha: "Kunci Karya", namaMahasiswa: "Ilham Ramadhan", angkatan: "2025",
      kategori: "Lainnya", harga: 30000,
      deskripsi: "Paket berisi pulpen gel, sticky notes, penanda halaman, dan pouch kecil. Praktis untuk kebutuhan kuliah maupun hadiah teman.",
      foto: "assets/images/prd021.svg", whatsapp: "081877654308", instagram: "@kuncikarya",
      lokasi: "COD UPI Kampus Serang", promo: "", status: "TAYANG",
      featured: "", rating: 4.4, varian: "Pastel, Monokrom",
      tanggalUpdate: "2026-08-08"
    },

    /* ---- contoh data yang TIDAK boleh tampil (untuk menguji filter status) ---- */
    {
      idProduk: "PRD900", idPenjual: "PGSD001", namaProduk: "Contoh Produk Menunggu Review",
      namaUsaha: "Dapur Naya", namaMahasiswa: "Naya Putri", angkatan: "2025",
      kategori: "Kuliner", harga: 15000, deskripsi: "Data uji — tidak boleh muncul di website.",
      foto: "", whatsapp: "6281234567801", instagram: "@dapurnaya",
      lokasi: "COD UPI Kampus Serang", promo: "", status: "MENUNGGU",
      featured: "", rating: "", varian: "", tanggalUpdate: "2026-08-27"
    },
    {
      idProduk: "PRD901", idPenjual: "PGSD002", namaProduk: "Contoh Produk Nonaktif",
      namaUsaha: "Kopi Kelas", namaMahasiswa: "Rifqi Maulana", angkatan: "2024",
      kategori: "Minuman", harga: 12000, deskripsi: "Data uji — tidak boleh muncul di website.",
      foto: "", whatsapp: "081234567802", instagram: "kopikelas.id",
      lokasi: "COD Kantin Kampus", promo: "", status: "NONAKTIF",
      featured: "", rating: "", varian: "", tanggalUpdate: "2026-05-02"
    }
  ],

  /* ------------------------------------------------------------------ PROMO */
  promo: [
    {
      idPromo: "PRM001", idPenjual: "PGSD001", idProduk: "PRD001",
      judulPromo: "Diskon 20% Brownies Lumer",
      deskripsi: "Potongan 20% untuk pembelian minimal 2 box, khusus COD di area kampus.",
      tanggalMulai: "2026-08-18", tanggalSelesai: "2026-09-30", status: "AKTIF"
    },
    {
      idPromo: "PRM002", idPenjual: "PGSD002", idProduk: "PRD004",
      judulPromo: "Paket Hemat 2 Botol Kopi",
      deskripsi: "Beli 2 botol kopi susu gula aren hanya Rp25.000. Berlaku untuk pesanan hari yang sama.",
      tanggalMulai: "2026-08-01", tanggalSelesai: "2026-09-15", status: "AKTIF"
    },
    {
      idPromo: "PRM003", idPenjual: "PGSD007", idProduk: "PRD016",
      judulPromo: "Gratis Ongkir Area Kampus",
      deskripsi: "Bebas ongkir untuk pengantaran di dalam lingkungan UPI Kampus Serang, minimal 2 porsi.",
      tanggalMulai: "2026-08-10", tanggalSelesai: "2026-10-31", status: "AKTIF"
    },
    {
      idPromo: "PRM004", idPenjual: "PGSD005", idProduk: "PRD011",
      judulPromo: "Promo Wisuda: Bonus Kartu Ucapan",
      deskripsi: "Setiap pembelian buket wisuda mendapat kartu ucapan tulis tangan dan pita almamater gratis.",
      tanggalMulai: "2026-08-15", tanggalSelesai: "2026-09-20", status: "AKTIF"
    },
    {
      idPromo: "PRM005", idPenjual: "PGSD006", idProduk: "PRD013",
      judulPromo: "Promo Akhir Bulan Desain Poster",
      deskripsi: "Desain poster Rp25.000 saja (dari Rp35.000) untuk pemesanan sampai akhir bulan.",
      tanggalMulai: "2026-08-20", tanggalSelesai: "2026-09-05", status: "AKTIF"
    },
    {
      idPromo: "PRM006", idPenjual: "PGSD003", idProduk: "PRD006",
      judulPromo: "Promo Kadaluarsa (data uji)",
      deskripsi: "Promo ini sudah lewat tanggalnya dan tidak boleh muncul di website.",
      tanggalMulai: "2026-06-01", tanggalSelesai: "2026-07-01", status: "AKTIF"
    }
  ],

  /* ----------------------------------------------------------------- CERITA */
  cerita: [
    {
      idCerita: "CRT001", idPenjual: "PGSD004",
      judul: "Dari Tugas Kuliah Menjadi Bisnis",
      excerpt: "Papan pintar yang awalnya hanya proyek mata kuliah media pembelajaran kini dipesan guru dari berbagai daerah.",
      penulis: "Dimas Prasetyo", angkatan: "2024",
      thumbnail: "assets/images/crt001.svg", tanggal: "2026-08-14",
      isi: "Semester tiga, Dimas mendapat tugas mengembangkan satu media pembelajaran untuk materi operasi hitung. Ia membuat papan kayu ringan dengan kartu angka yang bisa dipindah-pindah. Setelah dipresentasikan, dosen menyarankan agar media itu diujicobakan di sekolah mitra.\n\nDi sekolah, guru kelas dua meminta dibuatkan satu set tambahan. Permintaan kedua datang dari sekolah sebelah, lalu dari teman satu angkatan yang sedang PPL. Dari situ Dimas sadar tugas kuliahnya punya nilai di luar kampus.\n\nIa lalu merapikan desainnya, mencari tukang kayu di sekitar kos untuk produksi, dan membuat buku panduan singkat agar guru bisa langsung memakainya. Sekarang Studio Belajar melayani pesanan ke luar Banten, dan seluruh proses produksinya masih ia kerjakan di sela jadwal kuliah.\n\n\"Kuncinya bukan modal besar,\" katanya. \"Kuncinya mau menyelesaikan satu produk sampai benar-benar bisa dipakai orang lain.\""
    },
    {
      idCerita: "CRT002", idPenjual: "PGSD001",
      judul: "Bisnis Pertama Bermodal Rp200 Ribu",
      excerpt: "Dua loyang brownies, satu akun Instagram, dan keberanian menawarkan ke teman satu kelas.",
      penulis: "Naya Putri", angkatan: "2025",
      thumbnail: "assets/images/crt002.svg", tanggal: "2026-08-08",
      isi: "Modal pertama Naya Rp200 ribu: tepung, cokelat batangan, mentega, dan dua loyang pinjaman dari ibu kos. Ia memanggang dua loyang brownies, memotongnya menjadi dua belas kotak, lalu memotret dengan ponsel di dekat jendela kamar.\n\nHari pertama ia menawarkan ke grup kelas. Tujuh kotak terjual. Hari kedua ia menawarkan ke grup angkatan dan habis sebelum siang. Dari keuntungan itu ia membeli loyang sendiri.\n\nYang paling sulit bukan membuat kuenya, melainkan menawarkan. \"Awalnya malu, takut dikira maksa,\" ujarnya. Ia mengatasinya dengan cara sederhana: memberi sampel gratis ke lima orang dan meminta mereka jujur menilai.\n\nSetahun berjalan, Dapur Naya sudah punya empat varian dan menerima pesanan hampers. Loyang pinjaman itu masih ia simpan."
    },
    {
      idCerita: "CRT003", idPenjual: "PGSD006",
      judul: "Mahasiswa dan Kreativitas Digital",
      excerpt: "Berawal dari membantu poster kegiatan himpunan, kini menerima order desain dari UMKM di luar kota.",
      penulis: "Fajar Nugraha", angkatan: "2023",
      thumbnail: "assets/images/crt003.svg", tanggal: "2026-07-29",
      isi: "Fajar mulai mendesain karena tidak ada yang mau membuat poster untuk kegiatan himpunan. Ia belajar sendiri lewat video, memakai aplikasi gratis, dan mengerjakannya di laptop pinjaman.\n\nSetelah beberapa poster, ia mengumpulkan hasil kerjanya menjadi portofolio sederhana di Instagram. Order pertama berbayar datang dari penjual keripik di Cilegon yang melihat unggahannya.\n\nPelajaran terbesarnya adalah soal harga. Awalnya ia memasang tarif terlalu murah sehingga kewalahan mengerjakan revisi tanpa batas. Sekarang ia menetapkan aturan: dua kali revisi termasuk harga, sisanya dihitung terpisah.\n\n\"Jangan menunggu jago dulu baru mulai,\" katanya. \"Portofolio itu dibangun sambil jalan.\""
    },
    {
      idCerita: "CRT004", idPenjual: "PGSD009",
      judul: "Mengubah Media Pembelajaran Menjadi Produk",
      excerpt: "Pengalaman mengajar les privat mendorong Mutiara menyusun bahan ajar yang akhirnya dicari orang tua.",
      penulis: "Mutiara Zahra", angkatan: "2023",
      thumbnail: "assets/images/crt004.svg", tanggal: "2026-07-22",
      isi: "Mutiara mulai mengajar les untuk menambah uang saku. Ia mengajar satu anak tetangga yang kesulitan membaca, dua kali seminggu.\n\nAgar sesi lebih tertata, ia menyusun sendiri lembar latihan bertahap: pengenalan huruf, suku kata, lalu kalimat pendek. Orang tua murid meminta salinan lembar itu untuk dipakai di rumah.\n\nPermintaan salinan terus bertambah sampai ia memutuskan merapikannya menjadi satu paket yang bisa dicetak. Dari sana Bimbel Ceria berkembang: bukan hanya jasa les, tetapi juga bahan ajar.\n\nIa menekankan bahwa kualitas materi lebih penting daripada tampilan. \"Orang tua akan kembali kalau anaknya benar-benar berkembang, bukan karena desainnya bagus,\" katanya."
    }
  ]
};
