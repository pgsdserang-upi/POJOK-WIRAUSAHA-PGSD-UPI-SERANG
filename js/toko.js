/* ==========================================================================
   toko.js — halaman toko mini mahasiswa (toko.html?id=PGSD001)
   Satu penjual dapat memiliki banyak produk (relasi ID PENJUAL -> PRODUK).
   ========================================================================== */

(function () {
  "use strict";

  var U = PW.util;
  var C = PW.config;
  var UI = PW.ui;

  function $(id) { return document.getElementById(id); }
  function qsa(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  document.addEventListener("DOMContentLoaded", function () {
    var t = $("tahun");
    if (t) t.textContent = new Date().getFullYear();

    qsa("[data-daftar-link]").forEach(function (a) {
      a.setAttribute("href", C.GOOGLE_FORM_URL);
      a.setAttribute("target", "_blank");
      a.setAttribute("rel", "noopener");
    });

    pasangNavbar();
    UI.pasangEvent();
    PW.fav.onUbah(perbaruiBadge);
    perbaruiBadge(PW.fav.jumlah());

    var root = $("toko-root");
    if (root) root.innerHTML = '<div class="container"><div class="grid grid--produk">' + UI.skeleton(4) + "</div></div>";

    PW.api.muat().then(function (state) {
      PW.state = state;
      tampilkanBannerDemo(state);
      render();
      var idProduk = U.getParam("produk");
      if (idProduk) setTimeout(function () { UI.bukaProduk(idProduk); }, 120);
    }).catch(function () {
      tampilkanPesan(
        "Produk sedang tidak dapat dimuat.",
        "Silakan coba kembali beberapa saat lagi."
      );
    });
  });

  function tampilkanBannerDemo(state) {
    var banner = $("demo-banner");
    if (!banner) return;
    var demo = state.sumber === "demo" || state.sumber === "demo-fallback";
    banner.hidden = !demo;
    var teks = $("demo-banner-text");
    if (demo && teks) {
      teks.textContent = state.sumber === "demo-fallback"
        ? "Data dari Google Sheet sedang tidak dapat dimuat. Sementara ini ditampilkan data contoh — bukan data asli."
        : "Produk dan nama mahasiswa di halaman ini hanya contoh untuk pratinjau tampilan — bukan data asli.";
    }
  }

  function perbaruiBadge(n) {
    var b = $("fav-count-badge");
    if (!b) return;
    b.textContent = n;
    b.hidden = n === 0;
  }

  function pasangNavbar() {
    var toggle = $("nav-toggle");
    var menu = $("nav-menu");
    var backdrop = $("nav-backdrop");
    if (!toggle || !menu) return;

    function tutup() {
      menu.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      if (backdrop) backdrop.hidden = true;
    }
    toggle.addEventListener("click", function () {
      var buka = !menu.classList.contains("is-open");
      menu.classList.toggle("is-open", buka);
      toggle.setAttribute("aria-expanded", buka ? "true" : "false");
      if (backdrop) backdrop.hidden = !buka;
    });
    menu.addEventListener("click", function (e) { if (e.target.closest("a")) tutup(); });
    if (backdrop) backdrop.addEventListener("click", tutup);
    window.addEventListener("resize", function () { if (window.innerWidth > 900) tutup(); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menu.classList.contains("is-open")) { tutup(); toggle.focus(); }
    });
  }

  function tampilkanPesan(judul, teks) {
    var root = $("toko-root");
    if (!root) return;
    root.innerHTML =
      '<div class="container"><div class="empty">' +
      '<svg class="empty__art" aria-hidden="true"><use href="#i-empty"></use></svg>' +
      "<h3>" + U.esc(judul) + "</h3><p>" + U.esc(teks) + "</p>" +
      '<a class="btn btn--primary btn--sm" href="index.html#produk">Kembali ke katalog</a>' +
      "</div></div>";
  }

  function render() {
    var root = $("toko-root");
    if (!root) return;

    var id = U.getParam("id") || U.getParam("toko") || "";
    var penjual = PW.cari.penjualById(id);

    if (!penjual) {
      tampilkanPesan(
        "Toko tidak ditemukan.",
        "Tautan mungkin sudah tidak berlaku atau usaha tersebut belum tayang."
      );
      return;
    }

    document.title = penjual.namaUsaha + " — Pojok Wirausaha Mahasiswa PGSD UPI Kampus Serang";

    var produk = PW.state.produk.filter(function (p) { return p.idPenjual === penjual.id; });
    produk = PW.cari.terapkan(produk, { urut: "terbaru" });

    var wa = U.waLink(penjual.whatsapp, U.isiTemplate(C.WA_TEMPLATE_TOKO, { usaha: penjual.namaUsaha }));
    var ig = U.igLink(penjual.instagram);

    root.innerHTML =
      '<div class="container">' +
        '<section class="toko-hero">' +
          UI.gambarPenjual(penjual, "toko-hero__logo", 192, 192, true) +
          "<div>" +
            '<h1 class="toko-hero__name">' + U.esc(penjual.namaUsaha) + "</h1>" +
            '<p class="toko-hero__tag">' + U.esc(ringkasKategori(produk)) + "</p>" +
            '<p class="toko-hero__owner">Oleh <strong>' + U.esc(penjual.namaMahasiswa) + "</strong>" +
              (penjual.angkatan ? " • PGSD Angkatan " + U.esc(penjual.angkatan) : "") + "</p>" +
            (penjual.deskripsi ? '<p class="toko-hero__desc">' + U.esc(penjual.deskripsi) + "</p>" : "") +
            (penjual.lokasi
              ? '<p class="card__loc" style="margin-top:10px">' + UI.ikon("map-pin") + U.esc(penjual.lokasi) + "</p>"
              : "") +
            '<div class="toko-hero__actions">' +
              (wa ? '<a class="btn btn--wa" href="' + wa + '" target="_blank" rel="noopener">' +
                UI.ikon("whatsapp") + "Hubungi via WhatsApp</a>" : "") +
              (ig ? '<a class="btn btn--outline" href="' + ig + '" target="_blank" rel="noopener">' +
                UI.ikon("instagram") + "@" + U.esc(U.normalizeIg(penjual.instagram)) + "</a>" : "") +
              '<a class="btn btn--soft" href="index.html#wirausaha">Lihat wirausaha lain</a>' +
            "</div>" +
          "</div>" +
        "</section>" +

        '<header class="section__head">' +
          "<div>" +
            '<p class="eyebrow eyebrow--muted">Katalog</p>' +
            '<h2 class="section__title">Produk ' + U.esc(penjual.namaUsaha) + "</h2>" +
            '<p class="section__sub">' + produk.length + " produk tayang saat ini.</p>" +
          "</div>" +
        "</header>" +

        (produk.length
          ? '<div class="grid grid--produk">' + UI.daftarProduk(produk) + "</div>"
          : '<div class="empty"><svg class="empty__art" aria-hidden="true"><use href="#i-empty"></use></svg>' +
            "<h3>Belum ada produk tayang.</h3><p>Usaha ini belum menampilkan produk apa pun.</p></div>") +

        '<div class="promo-toko">' + promoToko(penjual) + "</div>" +
      "</div>";

    aktifkanReveal();
  }

  function ringkasKategori(produk) {
    var unik = [];
    produk.forEach(function (p) { if (unik.indexOf(p.kategori) === -1) unik.push(p.kategori); });
    return unik.length ? unik.join(" • ") : "Usaha Mahasiswa PGSD";
  }

  function promoToko(penjual) {
    var promo = (PW.state.promo || []).filter(function (pr) { return pr.idPenjual === penjual.id; });
    if (!promo.length) return "";
    var kartu = promo.map(function (pr) {
      var produk = pr.idProduk ? PW.cari.produkById(pr.idProduk) : null;
      return UI.kartuPromo(pr, produk, penjual);
    }).join("");
    return '<h2 class="subheading">Promo dari ' + U.esc(penjual.namaUsaha) + "</h2>" +
      '<div class="grid grid--promo">' + kartu + "</div>";
  }

  function aktifkanReveal() {
    var target = qsa(".reveal:not(.is-in)");
    if (!("IntersectionObserver" in window)) {
      target.forEach(function (n) { n.classList.add("is-in"); });
      return;
    }
    var obs = new IntersectionObserver(function (entri) {
      entri.forEach(function (e, i) {
        if (!e.isIntersecting) return;
        var node = e.target;
        setTimeout(function () { node.classList.add("is-in"); }, Math.min(i * 45, 260));
        obs.unobserve(node);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    target.forEach(function (n) { obs.observe(n); });
  }

})();
