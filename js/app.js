/* ==========================================================================
   app.js — pengendali halaman utama (index.html)
   ========================================================================== */

(function () {
  "use strict";

  var U = PW.util;
  var C = PW.config;
  var UI = PW.ui;

  /* elemen */
  var el = {};
  function $(id) { return document.getElementById(id); }
  function qsa(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  /* state filter katalog */
  var filter = {
    q: "",
    kategori: "semua",
    urut: "terbaru",
    hargaMin: null,
    hargaMax: null,
    limit: C.PAGE_SIZE
  };

  /* ======================================================================
     INISIALISASI
     ====================================================================== */
  document.addEventListener("DOMContentLoaded", function () {
    cacheElemen();
    tahunOtomatis();
    pasangLinkForm();
    pasangNavbar();
    pasangKontrol();
    UI.pasangEvent();
    PW.fav.onUbah(perbaruiBadgeFavorit);
    perbaruiBadgeFavorit(PW.fav.jumlah());

    tampilkanSkeleton();
    muatData();
  });

  function cacheElemen() {
    el.categoryGrid = $("category-grid");
    el.featuredGrid = $("featured-grid");
    el.productGrid = $("product-grid");
    el.filterChips = $("filter-chips");
    el.sellerGrid = $("seller-grid");
    el.featuredSeller = $("featured-seller");
    el.promoGrid = $("promo-grid");
    el.storyGrid = $("story-grid");
    el.favoriteGrid = $("favorite-grid");
    el.favoriteEmpty = $("favorite-empty");
    el.recentRail = $("recent-rail");
    el.recentSection = $("terakhir");
    el.emptyState = $("empty-state");
    el.errorState = $("error-state");
    el.resultCount = $("result-count");
    el.loadmoreWrap = $("loadmore-wrap");
    el.searchInput = $("search-input");
    el.searchClear = $("search-clear");
  }

  /* ======================================================================
     HAL-HAL KECIL
     ====================================================================== */
  function tahunOtomatis() {
    var t = $("tahun");
    if (t) t.textContent = new Date().getFullYear();
  }

  function pasangLinkForm() {
    qsa("[data-daftar-link]").forEach(function (a) {
      a.setAttribute("href", C.GOOGLE_FORM_URL);
      a.setAttribute("target", "_blank");
      a.setAttribute("rel", "noopener");
    });
  }

  function perbaruiBadgeFavorit(n) {
    qsa("#fav-count-badge").forEach(function (b) {
      b.textContent = n;
      b.hidden = n === 0;
    });
    renderFavorit();
  }

  /* ======================================================================
     NAVBAR
     ====================================================================== */
  function pasangNavbar() {
    var nav = $("navbar");
    var toggle = $("nav-toggle");
    var menu = $("nav-menu");
    var backdrop = $("nav-backdrop");

    var onScroll = function () {
      if (!nav) return;
      nav.classList.toggle("nav--scrolled", window.scrollY > 12);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    function tutupMenu() {
      if (!menu) return;
      menu.classList.remove("is-open");
      if (toggle) { toggle.setAttribute("aria-expanded", "false"); toggle.setAttribute("aria-label", "Buka menu"); }
      if (backdrop) backdrop.hidden = true;
    }

    if (toggle && menu) {
      toggle.addEventListener("click", function () {
        var buka = !menu.classList.contains("is-open");
        menu.classList.toggle("is-open", buka);
        toggle.setAttribute("aria-expanded", buka ? "true" : "false");
        toggle.setAttribute("aria-label", buka ? "Tutup menu" : "Buka menu");
        if (backdrop) backdrop.hidden = !buka;
      });
      menu.addEventListener("click", function (e) {
        if (e.target.closest("a")) tutupMenu();
      });
    }
    if (backdrop) backdrop.addEventListener("click", tutupMenu);
    window.addEventListener("resize", function () { if (window.innerWidth > 900) tutupMenu(); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menu && menu.classList.contains("is-open")) {
        tutupMenu();
        if (toggle) toggle.focus();
      }
    });

    /* tautan aktif mengikuti posisi scroll */
    var bagian = qsa("main section[id]");
    if ("IntersectionObserver" in window && bagian.length) {
      var pengamat = new IntersectionObserver(function (entri) {
        entri.forEach(function (e) {
          if (!e.isIntersecting) return;
          var id = e.target.id;
          qsa(".nav__link").forEach(function (a) {
            a.classList.toggle("is-active", a.getAttribute("href") === "#" + id);
          });
        });
      }, { rootMargin: "-45% 0px -50% 0px" });
      bagian.forEach(function (s) { pengamat.observe(s); });
    }
  }

  /* ======================================================================
     KONTROL FILTER, SORT, SEARCH
     ====================================================================== */
  function pasangKontrol() {
    var form = $("search-form");
    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        terapkanPencarian(el.searchInput ? el.searchInput.value : "");
        gulirKe("#produk");
      });
    }

    if (el.searchInput) {
      var jeda = null;
      el.searchInput.addEventListener("input", function () {
        if (el.searchClear) el.searchClear.hidden = !el.searchInput.value;
        clearTimeout(jeda);
        jeda = setTimeout(function () {
          terapkanPencarian(el.searchInput.value);
        }, 220);
      });
    }

    if (el.searchClear) {
      el.searchClear.addEventListener("click", function () {
        el.searchInput.value = "";
        el.searchClear.hidden = true;
        terapkanPencarian("");
        el.searchInput.focus();
      });
    }

    qsa("[data-quick]").forEach(function (b) {
      b.addEventListener("click", function () {
        var q = b.getAttribute("data-quick");
        if (el.searchInput) { el.searchInput.value = q; if (el.searchClear) el.searchClear.hidden = false; }
        terapkanPencarian(q);
        gulirKe("#produk");
      });
    });

    var sortSel = $("sort-select");
    if (sortSel) sortSel.addEventListener("change", function () {
      filter.urut = sortSel.value; filter.limit = C.PAGE_SIZE; renderKatalog();
    });

    var priceSel = $("price-select");
    if (priceSel) priceSel.addEventListener("change", function () {
      var v = priceSel.value;
      if (v === "all") { filter.hargaMin = null; filter.hargaMax = null; }
      else {
        var b = v.split("-");
        filter.hargaMin = parseInt(b[0], 10);
        filter.hargaMax = parseInt(b[1], 10);
      }
      filter.limit = C.PAGE_SIZE;
      renderKatalog();
    });

    var reset = $("btn-reset");
    if (reset) reset.addEventListener("click", resetFilter);

    var emptyReset = $("btn-empty-reset");
    if (emptyReset) emptyReset.addEventListener("click", resetFilter);

    var more = $("btn-loadmore");
    if (more) more.addEventListener("click", function () {
      filter.limit += C.PAGE_SIZE;
      renderKatalog(true);
    });

    var acak = $("btn-acak");
    if (acak) acak.addEventListener("click", function () { renderPilihan(); });

    var clearFav = $("btn-clear-fav");
    if (clearFav) clearFav.addEventListener("click", function () {
      PW.fav.hapusSemua();
      UI.toast("Daftar favorit dikosongkan.");
    });

    [$("btn-retry"), $("btn-retry-kosong")].forEach(function (b) {
      if (!b) return;
      b.addEventListener("click", function () {
        if (el.errorState) el.errorState.hidden = true;
        tampilkanSkeleton();
        muatData();
      });
    });
  }

  function terapkanPencarian(q) {
    filter.q = String(q || "").trim();
    filter.limit = C.PAGE_SIZE;
    renderKatalog();
  }

  function resetFilter() {
    filter.q = "";
    filter.kategori = "semua";
    filter.urut = "terbaru";
    filter.hargaMin = null;
    filter.hargaMax = null;
    filter.limit = C.PAGE_SIZE;
    if (el.searchInput) el.searchInput.value = "";
    if (el.searchClear) el.searchClear.hidden = true;
    var s = $("sort-select"); if (s) s.value = "terbaru";
    var p = $("price-select"); if (p) p.value = "all";
    renderChips();
    renderKategori();
    renderKatalog();
  }

  function gulirKe(sel) {
    var t = document.querySelector(sel);
    if (t) t.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  /* ======================================================================
     MEMUAT DATA
     ====================================================================== */
  function tampilkanSkeleton() {
    if (el.featuredGrid) el.featuredGrid.innerHTML = UI.skeleton(C.FEATURED_COUNT);
    if (el.productGrid) el.productGrid.innerHTML = UI.skeleton(C.PAGE_SIZE);
    if (el.resultCount) el.resultCount.textContent = "Memuat…";
  }

  function muatData() {
    PW.api.muat().then(function (state) {
      PW.state = state;

      if (state.error && state.sumber === "demo-fallback" && el.errorState) {
        el.errorState.hidden = false;
        var span = el.errorState.querySelector("span");
        if (span) span.textContent =
          "Silakan coba kembali beberapa saat lagi. Sementara ini ditampilkan data contoh.";
      }

      terapkanSumberData(state);
      bacaParameterUrl();
      renderSemua();
      animasiStatistik();

      var idProduk = U.getParam("produk");
      if (idProduk) setTimeout(function () { UI.bukaProduk(idProduk); }, 120);
    }).catch(function () {
      if (el.productGrid) el.productGrid.innerHTML = "";
      if (el.featuredGrid) el.featuredGrid.innerHTML = "";
      if (el.errorState) el.errorState.hidden = false;
      if (el.resultCount) el.resultCount.textContent = "0 produk";
    });
  }

  /* ======================================================================
     MENYESUAIKAN HALAMAN DENGAN SUMBER DATA
     sumber: "api" | "demo" | "demo-fallback" | "kosong" | "gagal"
     ====================================================================== */
  var BAGIAN_BUTUH_DATA = [
    "search-form", "search-hint", "statistik",
    "kategori", "pilihan", "produk", "wirausaha", "promo", "cerita", "favorit", "terakhir"
  ];

  function terapkanSumberData(state) {
    var demo = state.sumber === "demo" || state.sumber === "demo-fallback";
    var gagal = state.sumber === "gagal";
    var kosong = state.produk.length === 0;

    /* -- banner data contoh -- */
    var banner = $("demo-banner");
    var teksBanner = $("demo-banner-text");
    if (banner) {
      banner.hidden = !demo;
      if (demo && teksBanner) {
        teksBanner.textContent = state.sumber === "demo-fallback"
          ? "Data dari Google Sheet sedang tidak dapat dimuat. Sementara ini ditampilkan data contoh — bukan data asli."
          : "Produk dan nama mahasiswa di halaman ini hanya contoh untuk pratinjau tampilan — bukan data asli. " +
            "Matikan dengan mengubah MODE_DEMO menjadi false di js/config.js.";
      }
    }

    /* -- sembunyikan bagian yang tidak punya isi -- */
    BAGIAN_BUTUH_DATA.forEach(function (id) {
      var s = $(id);
      if (s) s.hidden = kosong;
    });
    /* -- tombol utama hero mengikuti keadaan halaman -- */
    var jelajahi = $("btn-jelajahi");
    var jelajahiTeks = $("btn-jelajahi-teks");
    if (jelajahi && jelajahiTeks) {
      jelajahi.setAttribute("href", kosong ? "#belum-ada" : "#produk");
      jelajahiTeks.textContent = kosong ? "Cara Bergabung" : "Jelajahi Produk";
    }

    /* -- panel pengganti -- */
    var panel = $("belum-ada");
    if (panel) panel.hidden = !kosong;
    if (!kosong) return;

    var judul = $("kosong-panel-title");
    var sub = $("kosong-panel-sub");
    var langkah = $("kosong-panel-langkah");
    var retry = $("btn-retry-kosong");
    var daftar = $("kosong-panel-actions")
      ? qsa("[data-daftar-link], [href='#tentang']", $("kosong-panel-actions")) : [];

    if (gagal) {
      if (judul) judul.textContent = "Produk sedang tidak dapat dimuat.";
      if (sub) sub.textContent = "Silakan coba kembali beberapa saat lagi.";
      if (langkah) langkah.hidden = true;
      daftar.forEach(function (a) { a.hidden = true; });
      if (retry) retry.hidden = false;
    } else {
      if (langkah) langkah.hidden = false;
      daftar.forEach(function (a) { a.hidden = false; });
      if (retry) retry.hidden = true;
    }
  }

  /* Tautan navigasi mengikuti bagian yang benar-benar tampil.
     Dipanggil setelah semua render selesai, jadi bagian opsional yang kosong
     (misalnya CERITA yang sheet-nya belum diisi) tidak meninggalkan tautan mati. */
  function sinkronkanTautanNav() {
    qsa(".nav__link, .footer__col a").forEach(function (a) {
      var href = a.getAttribute("href") || "";
      if (href.charAt(0) !== "#" || href.length < 2) return;
      var bagian = document.getElementById(href.slice(1));
      if (bagian && bagian.tagName === "SECTION") a.hidden = !!bagian.hidden;
    });
  }

  function bacaParameterUrl() {
    var kat = U.getParam("kategori");
    if (kat) {
      var cocok = C.categories.filter(function (c) {
        return U.slug(c.nama) === U.slug(kat) || c.nama.toLowerCase() === kat.toLowerCase();
      })[0];
      if (cocok) filter.kategori = cocok.nama;
    }
    var q = U.getParam("q");
    if (q) {
      filter.q = q;
      if (el.searchInput) { el.searchInput.value = q; if (el.searchClear) el.searchClear.hidden = false; }
    }
  }

  function renderSemua() {
    renderKategori();
    renderChips();
    renderPilihan();
    renderKatalog();
    renderPenjual();
    renderPromo();
    renderCerita();
    renderFavorit();
    renderTerakhir();
    sinkronkanTautanNav();
    aktifkanReveal();
  }

  /* ======================================================================
     STATISTIK
     ====================================================================== */
  function animasiStatistik() {
    var s = PW.state;
    var target = {
      "stat-usaha": s.penjual.length,
      "stat-produk": s.produk.length,
      "stat-kategori": s.kategori.length,
      "stat-promo": s.promo.length
    };

    var jalankan = function () {
      Object.keys(target).forEach(function (id) {
        hitungNaik($(id), target[id]);
      });
    };

    var wadah = $("statistik");
    if (!wadah || !("IntersectionObserver" in window)) { jalankan(); return; }

    var sudah = false;
    var obs = new IntersectionObserver(function (entri) {
      entri.forEach(function (e) {
        if (e.isIntersecting && !sudah) { sudah = true; jalankan(); obs.disconnect(); }
      });
    }, { threshold: 0.35 });
    obs.observe(wadah);
  }

  function hitungNaik(node, target) {
    if (!node) return;
    target = Number(target) || 0;
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      node.textContent = target; return;
    }
    var durasi = 1100, mulai = null;
    function langkah(ts) {
      if (mulai === null) mulai = ts;
      var p = Math.min((ts - mulai) / durasi, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      node.textContent = Math.round(target * eased);
      if (p < 1) requestAnimationFrame(langkah);
      else node.textContent = target;
    }
    requestAnimationFrame(langkah);
  }

  /* ======================================================================
     KATEGORI
     ====================================================================== */
  function renderKategori() {
    if (!el.categoryGrid || !PW.state) return;
    var html = PW.state.kategori.map(function (c) {
      var aktif = filter.kategori.toLowerCase() === c.nama.toLowerCase();
      return '<button class="cat-card" type="button" data-kategori="' + U.esc(c.nama) + '" ' +
        'aria-pressed="' + (aktif ? "true" : "false") + '" ' +
        'style="--c1:' + c.c1 + ';--c2:' + c.c2 + '">' +
        '<span class="cat-card__emoji" aria-hidden="true">' + c.emoji + "</span>" +
        '<span class="cat-card__name">' + U.esc(c.nama) + "</span>" +
        '<span class="cat-card__count">' + c.jumlah + " produk</span>" +
        "</button>";
    }).join("");
    el.categoryGrid.innerHTML = html;

    qsa("[data-kategori]", el.categoryGrid).forEach(function (b) {
      b.addEventListener("click", function () {
        var nama = b.getAttribute("data-kategori");
        filter.kategori = (filter.kategori.toLowerCase() === nama.toLowerCase()) ? "semua" : nama;
        filter.limit = C.PAGE_SIZE;
        renderKategori();
        renderChips();
        renderKatalog();
        gulirKe("#produk");
      });
    });
  }

  /* ======================================================================
     CHIP FILTER
     ====================================================================== */
  function renderChips() {
    if (!el.filterChips || !PW.state) return;
    var daftar = [{ nama: "Semua", nilai: "semua", jumlah: PW.state.produk.length }].concat(
      PW.state.kategori.map(function (c) { return { nama: c.nama, nilai: c.nama, jumlah: c.jumlah }; })
    );
    el.filterChips.innerHTML = daftar.map(function (c) {
      var aktif = filter.kategori.toLowerCase() === c.nilai.toLowerCase();
      return '<button class="chip" type="button" data-chip="' + U.esc(c.nilai) + '" ' +
        'aria-pressed="' + (aktif ? "true" : "false") + '">' + U.esc(c.nama) +
        '<span class="chip__count">' + c.jumlah + "</span></button>";
    }).join("");

    qsa("[data-chip]", el.filterChips).forEach(function (b) {
      b.addEventListener("click", function () {
        filter.kategori = b.getAttribute("data-chip");
        filter.limit = C.PAGE_SIZE;
        renderChips();
        renderKategori();
        renderKatalog();
      });
    });
  }

  /* ======================================================================
     PRODUK PILIHAN (acak, prioritas featured)
     ====================================================================== */
  function renderPilihan() {
    if (!el.featuredGrid || !PW.state) return;
    var semua = PW.state.produk;
    var unggulan = U.acak(semua.filter(function (p) { return p.featured; }));
    var sisa = U.acak(semua.filter(function (p) { return !p.featured; }));
    var pilih = unggulan.concat(sisa).slice(0, C.FEATURED_COUNT);
    el.featuredGrid.innerHTML = pilih.length ? UI.daftarProduk(pilih) : "";
    aktifkanReveal(el.featuredGrid);
  }

  /* ======================================================================
     KATALOG
     ====================================================================== */
  function renderKatalog(tambahan) {
    if (!el.productGrid || !PW.state) return;

    var hasil = PW.cari.terapkan(PW.state.produk, filter);
    var tampil = hasil.slice(0, filter.limit);

    el.productGrid.innerHTML = UI.daftarProduk(tampil);
    aktifkanReveal(el.productGrid);

    if (el.resultCount) {
      el.resultCount.innerHTML = "<b>" + hasil.length + "</b> produk" +
        (filter.kategori !== "semua" ? " • " + U.esc(filter.kategori) : "") +
        (filter.q ? ' • "' + U.esc(filter.q) + '"' : "");
    }
    if (el.emptyState) el.emptyState.hidden = hasil.length > 0;
    if (el.loadmoreWrap) el.loadmoreWrap.hidden = hasil.length <= tampil.length;

    if (tambahan) {
      // fokuskan ke kartu pertama yang baru muncul agar keyboard tidak tersesat
      var kartu = el.productGrid.querySelectorAll(".card");
      var target = kartu[Math.max(0, tampil.length - C.PAGE_SIZE)];
      if (target) target.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  /* ======================================================================
     PENJUAL
     ====================================================================== */
  function renderPenjual() {
    if (!PW.state) return;
    var penjual = PW.state.penjual;
    if (!penjual.length) return;

    // sorotan berganti setiap pekan (deterministik, bukan acak tiap reload)
    var pekan = Math.floor(Date.now() / (7 * 86400000));
    var sorot = penjual[pekan % penjual.length];

    if (el.featuredSeller) {
      var cerita = (PW.state.cerita || []).filter(function (c) { return c.idPenjual === sorot.id; })[0];
      // sheet PENJUAL bersifat opsional; kalau deskripsi usaha belum diisi, pakai kalimat pengganti
      var kutipan = (cerita && cerita.excerpt) || sorot.deskripsi ||
        ("Salah satu usaha mahasiswa PGSD UPI Kampus Serang yang sedang tumbuh, dengan " +
         sorot.jumlahProduk + " produk tayang di Pojok Wirausaha.");
      el.featuredSeller.innerHTML = UI.sorotanPenjual(sorot, kutipan);
    }

    if (el.sellerGrid) {
      var lain = penjual.filter(function (s) { return s.id !== sorot.id; }).slice(0, 8);
      el.sellerGrid.innerHTML = lain.map(UI.kartuPenjual).join("");
    }
    aktifkanReveal(el.featuredSeller);
    aktifkanReveal(el.sellerGrid);
  }

  /* ======================================================================
     PROMO
     ====================================================================== */
  function renderPromo() {
    if (!el.promoGrid || !PW.state) return;
    var promo = PW.state.promo;
    if (!promo.length) {
      el.promoGrid.innerHTML =
        '<div class="empty empty--sm" style="grid-column:1/-1">' +
        '<svg class="empty__art" aria-hidden="true"><use href="#i-tag"></use></svg>' +
        "<h3>Belum ada promo aktif minggu ini.</h3>" +
        "<p>Pantau terus — mahasiswa sering memberi penawaran khusus di akhir bulan.</p></div>";
      return;
    }
    el.promoGrid.innerHTML = promo.map(function (pr) {
      var produk = pr.idProduk ? PW.cari.produkById(pr.idProduk) : null;
      var penjual = pr.idPenjual ? PW.cari.penjualById(pr.idPenjual) : null;
      return UI.kartuPromo(pr, produk, penjual);
    }).join("");
    aktifkanReveal(el.promoGrid);
  }

  /* ======================================================================
     CERITA
     ====================================================================== */
  function renderCerita() {
    if (!el.storyGrid || !PW.state) return;
    var cerita = PW.state.cerita || [];
    // sheet CERITA opsional: sembunyikan seluruh bagian kalau belum ada artikel
    var bagian = $("cerita");
    if (bagian) bagian.hidden = cerita.length === 0;
    el.storyGrid.innerHTML = cerita.map(UI.kartuCerita).join("");
    aktifkanReveal(el.storyGrid);
  }

  /* ======================================================================
     FAVORIT
     ====================================================================== */
  function renderFavorit() {
    if (!el.favoriteGrid || !PW.state) return;
    var ids = PW.fav.daftar();
    var produk = ids.map(function (id) { return PW.cari.produkById(id); })
      .filter(function (p) { return !!p; });

    el.favoriteGrid.innerHTML = produk.length ? UI.daftarProduk(produk) : "";
    if (el.favoriteEmpty) el.favoriteEmpty.hidden = produk.length > 0;
    var clearFav = $("btn-clear-fav");
    if (clearFav) clearFav.hidden = produk.length === 0;
    aktifkanReveal(el.favoriteGrid);
  }

  /* ======================================================================
     TERAKHIR DILIHAT
     ====================================================================== */
  function renderTerakhir() {
    if (!el.recentRail || !PW.state) return;
    var produk = PW.recent.daftar()
      .map(function (id) { return PW.cari.produkById(id); })
      .filter(function (p) { return !!p; })
      .slice(0, C.RECENT_MAX);

    if (!produk.length) {
      if (el.recentSection) el.recentSection.hidden = true;
      return;
    }
    if (el.recentSection) el.recentSection.hidden = false;
    el.recentRail.innerHTML = produk.map(UI.kartuRail).join("");
  }
  PW.recent.onUbah(function () { renderTerakhir(); });

  /* ======================================================================
     ANIMASI REVEAL
     ====================================================================== */
  var pengamatReveal = null;
  function aktifkanReveal(root) {
    var target = qsa(".reveal:not(.is-in)", root || document);
    if (!("IntersectionObserver" in window)) {
      target.forEach(function (n) { n.classList.add("is-in"); });
      return;
    }
    if (!pengamatReveal) {
      pengamatReveal = new IntersectionObserver(function (entri) {
        entri.forEach(function (e, i) {
          if (!e.isIntersecting) return;
          var node = e.target;
          setTimeout(function () { node.classList.add("is-in"); }, Math.min(i * 45, 260));
          pengamatReveal.unobserve(node);
        });
      }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    }
    target.forEach(function (n) { pengamatReveal.observe(n); });
  }

})();
