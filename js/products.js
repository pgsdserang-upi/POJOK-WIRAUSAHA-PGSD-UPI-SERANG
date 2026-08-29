/* ==========================================================================
   products.js — komponen tampilan: kartu produk, skeleton, modal detail,
   kartu penjual, promo, cerita, tombol favorit & bagikan.
   Dipakai bersama oleh index.html dan toko.html.
   ========================================================================== */

window.PW = window.PW || {};

PW.ui = (function () {
  var U = PW.util;
  var C = PW.config;

  /* state modal */
  var modalTerbuka = null;      // 'produk' | 'cerita' | null
  var fokusSebelum = null;

  /* ======================================================================
     TOAST
     ====================================================================== */
  var toastTimer = null;
  function toast(pesan) {
    var el = document.getElementById("toast");
    var teks = document.getElementById("toast-text");
    if (!el || !teks) return;
    teks.textContent = pesan;
    el.hidden = false;
    // paksa reflow agar transisi jalan
    void el.offsetWidth;
    el.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      el.classList.remove("is-show");
      setTimeout(function () { el.hidden = true; }, 300);
    }, 2600);
  }

  /* ======================================================================
     POTONGAN HTML KECIL
     ====================================================================== */
  function ikon(nama, kelas) {
    return '<svg class="icon ' + (kelas || "") + '" aria-hidden="true"><use href="#i-' + nama + '"></use></svg>';
  }

  function imgAman(src, alt, kelas, w, h, eager) {
    return '<img class="' + (kelas || "") + '" src="' + U.esc(src || C.PLACEHOLDER) + '"' +
      ' alt="' + U.esc(alt || "") + '"' +
      (w ? ' width="' + w + '"' : "") + (h ? ' height="' + h + '"' : "") +
      ' loading="' + (eager ? "eager" : "lazy") + '" decoding="async"' +
      ' onerror="this.onerror=null;this.src=\'' + C.PLACEHOLDER + '\'">';
  }

  function angkatanTeks(p) {
    var a = String(p.angkatan || "").trim();
    if (!a) return p.namaMahasiswa ? "Oleh " + U.esc(p.namaMahasiswa) : "";
    var pendek = a.length === 4 ? "’" + a.slice(2) : a;
    return "Oleh " + U.esc(p.namaMahasiswa || "Mahasiswa") + " • PGSD " + U.esc(pendek);
  }

  function pesanWaProduk(p) {
    return U.isiTemplate(C.WA_TEMPLATE, { produk: p.nama, usaha: p.namaUsaha });
  }

  function linkWaProduk(p) {
    return U.waLink(p.whatsapp, pesanWaProduk(p));
  }

  /* ======================================================================
     KARTU PRODUK
     ====================================================================== */
  function kartuProduk(p) {
    var kat = p.kategoriMeta || PW.getCategory(p.kategori);
    var wa = linkWaProduk(p);
    var favAktif = PW.fav.ada(p.id);

    // kartu hanya menampilkan kategori + satu badge prioritas agar tetap rapi di ponsel
    var badges = '<span class="badge badge--kategori">' + U.esc(p.kategori) + "</span>";
    if (p.promo) badges += '<span class="badge badge--promo">Promo</span>';
    else if (p.featured) badges += '<span class="badge badge--best">Best Seller</span>';
    else if (p.baru) badges += '<span class="badge badge--new">Baru</span>';

    var rating = p.rating
      ? '<span class="card__rating">' + ikon("star") + U.esc(p.rating.toFixed(1)) + "</span>"
      : "";

    var tombolWa = wa
      ? '<a class="btn btn--wa" href="' + wa + '" target="_blank" rel="noopener" ' +
        'aria-label="Pesan ' + U.esc(p.nama) + ' via WhatsApp">' + ikon("whatsapp") + "Pesan</a>"
      : '<button class="btn btn--soft" type="button" disabled>Kontak kosong</button>';

    return '' +
      '<article class="card reveal" style="--c1:' + kat.c1 + ';--c2:' + kat.c2 + '" data-produk="' + U.esc(p.id) + '">' +
        '<div class="card__media" data-act="detail" data-id="' + U.esc(p.id) + '">' +
          imgAman(p.foto, p.nama, "card__img", 400, 300) +
          '<div class="card__badges">' + badges + "</div>" +
          '<button class="fav-btn" type="button" data-act="fav" data-id="' + U.esc(p.id) + '" ' +
            'aria-pressed="' + (favAktif ? "true" : "false") + '" ' +
            'aria-label="Simpan ' + U.esc(p.nama) + ' ke favorit">' + ikon("heart") + "</button>" +
        "</div>" +
        '<div class="card__body">' +
          '<h3 class="card__title"><button class="card__title-btn" type="button" data-act="detail" data-id="' +
            U.esc(p.id) + '">' + U.esc(p.nama) + "</button></h3>" +
          '<a class="card__store" href="' + U.esc(U.urlToko(p.idPenjual)) + '">' + ikon("store") + U.esc(p.namaUsaha) + "</a>" +
          '<span class="card__price">' + U.esc(p.hargaTeks) + "</span>" +
          '<p class="card__meta">' + angkatanTeks(p) + "</p>" +
          (p.lokasi ? '<span class="card__loc">' + ikon("map-pin") + U.esc(U.potong(p.lokasi, 42)) + "</span>" : "") +
          rating +
          '<div class="card__actions">' +
            '<button class="btn btn--outline" type="button" data-act="detail" data-id="' + U.esc(p.id) + '">Lihat</button>' +
            tombolWa +
          "</div>" +
        "</div>" +
      "</article>";
  }

  function daftarProduk(list) {
    return list.map(kartuProduk).join("");
  }

  /* ======================================================================
     SKELETON
     ====================================================================== */
  function skeleton(n) {
    var satu = '' +
      '<div class="skeleton">' +
        '<div class="sk skeleton__media"></div>' +
        '<div class="skeleton__body">' +
          '<div class="sk sk--sm"></div>' +
          '<div class="sk sk--md"></div>' +
          '<div class="sk sk--lg"></div>' +
          '<div class="sk sk--sm"></div>' +
          '<div class="sk sk--btn"></div>' +
        "</div>" +
      "</div>";
    var out = "";
    for (var i = 0; i < (n || 8); i++) out += satu;
    return out;
  }

  /* ======================================================================
     KARTU KECIL (TERAKHIR DILIHAT)
     ====================================================================== */
  function kartuRail(p) {
    return '' +
      '<button class="rail-card" type="button" data-act="detail" data-id="' + U.esc(p.id) + '">' +
        imgAman(p.foto, p.nama, "", 180, 180) +
        '<span class="rail-card__body">' +
          '<span class="rail-card__title">' + U.esc(p.nama) + "</span>" +
          '<span class="rail-card__price">' + U.esc(p.hargaTeks) + "</span>" +
        "</span>" +
      "</button>";
  }

  /* ======================================================================
     KARTU PENJUAL
     ====================================================================== */
  function kartuPenjual(s) {
    return '' +
      '<article class="seller-card reveal">' +
        '<div class="seller-card__top">' +
          imgAman(s.logo, "Logo " + s.namaUsaha, "seller-card__logo", 96, 96) +
          "<div>" +
            '<h3 class="seller-card__name">' + U.esc(s.namaUsaha) + "</h3>" +
            '<p class="seller-card__owner">' + U.esc(s.namaMahasiswa) +
              (s.angkatan ? " • PGSD " + U.esc(s.angkatan) : "") + "</p>" +
          "</div>" +
        "</div>" +
        (s.deskripsi ? '<p class="seller-card__desc">' + U.esc(s.deskripsi) + "</p>" : "") +
        '<div class="seller-card__foot">' +
          '<span class="seller-card__count">' + s.jumlahProduk + " produk</span>" +
          '<a class="linklike" href="' + U.esc(U.urlToko(s.id)) + '">Kunjungi' + ikon("arrow-right") + "</a>" +
        "</div>" +
      "</article>";
  }

  /* ======================================================================
     SOROTAN WIRAUSAHA (editorial)
     ====================================================================== */
  function sorotanPenjual(s, kutipan) {
    var wa = U.waLink(s.whatsapp, U.isiTemplate(C.WA_TEMPLATE_TOKO, { usaha: s.namaUsaha }));
    var ig = U.igLink(s.instagram);
    return '' +
      '<article class="feature reveal">' +
        '<div class="feature__media">' +
          imgAman(s.logo, "Foto usaha " + s.namaUsaha, "", 600, 600) +
          '<span class="feature__tag">Wirausaha Minggu Ini</span>' +
        "</div>" +
        '<div class="feature__body">' +
          '<h3 class="feature__name">' + U.esc(s.namaUsaha) + "</h3>" +
          '<blockquote class="feature__quote">“' + U.esc(kutipan || s.deskripsi) + '”</blockquote>' +
          '<div class="feature__person">' +
            imgAman(s.logo, "", "feature__avatar", 92, 92) +
            "<div>" +
              "<strong>" + U.esc(s.namaMahasiswa) + "</strong>" +
              "<span>PGSD Angkatan " + U.esc(s.angkatan || "-") + " • " + s.jumlahProduk + " produk</span>" +
            "</div>" +
          "</div>" +
          '<div class="feature__actions">' +
            '<a class="btn btn--primary" href="' + U.esc(U.urlToko(s.id)) + '">Kenali Usahanya' + ikon("arrow-right") + "</a>" +
            (wa ? '<a class="btn btn--outline" href="' + wa + '" target="_blank" rel="noopener">' + ikon("whatsapp") + "WhatsApp</a>" : "") +
            (ig ? '<a class="btn btn--soft" href="' + ig + '" target="_blank" rel="noopener">' + ikon("instagram") + "Instagram</a>" : "") +
          "</div>" +
        "</div>" +
      "</article>";
  }

  /* ======================================================================
     KARTU PROMO
     ====================================================================== */
  function kartuPromo(pr, produk, penjual) {
    var namaUsaha = penjual ? penjual.namaUsaha : (produk ? produk.namaUsaha : "Usaha Mahasiswa");
    var nomor = (produk && produk.whatsapp) || (penjual && penjual.whatsapp) || "";
    var wa = U.waLink(nomor, U.isiTemplate(C.WA_TEMPLATE_PROMO, { promo: pr.judul, usaha: namaUsaha }));
    var periode = [U.tanggalPendek(pr.mulai), U.tanggalPendek(pr.selesai)].filter(Boolean).join(" – ");

    return '' +
      '<article class="promo-card reveal">' +
        '<span class="promo-card__badge">' + ikon("tag") + "Promo Aktif</span>" +
        '<h3 class="promo-card__title">' + U.esc(pr.judul) + "</h3>" +
        (pr.deskripsi ? '<p class="promo-card__desc">' + U.esc(pr.deskripsi) + "</p>" : "") +
        '<div class="promo-card__meta">' +
          "<span><b>" + U.esc(namaUsaha) + "</b></span>" +
          (produk ? "<span>Produk: " + U.esc(produk.nama) + "</span>" : "") +
          (periode ? "<span>Berlaku " + U.esc(periode) + "</span>" : "") +
        "</div>" +
        '<div class="promo-card__actions">' +
          (produk ? '<button class="btn btn--outline btn--sm" type="button" data-act="detail" data-id="' +
            U.esc(produk.id) + '">Lihat Produk</button>' : "") +
          (wa ? '<a class="btn btn--wa btn--sm" href="' + wa + '" target="_blank" rel="noopener">' +
            ikon("whatsapp") + "Pesan</a>" : "") +
        "</div>" +
      "</article>";
  }

  /* ======================================================================
     KARTU CERITA
     ====================================================================== */
  function kartuCerita(c) {
    return '' +
      '<article class="story-card reveal">' +
        '<div class="story-card__media">' + imgAman(c.thumbnail, c.judul, "", 640, 360) + "</div>" +
        '<div class="story-card__body">' +
          '<h3 class="story-card__title">' + U.esc(c.judul) + "</h3>" +
          '<p class="story-card__excerpt">' + U.esc(c.excerpt) + "</p>" +
          '<p class="story-card__by">' + U.esc(c.penulis) + (c.angkatan ? " • PGSD " + U.esc(c.angkatan) : "") + "</p>" +
          '<button class="linklike" type="button" data-act="cerita" data-id="' + U.esc(c.id) + '">Baca Cerita' +
            ikon("arrow-right") + "</button>" +
        "</div>" +
      "</article>";
  }

  /* ======================================================================
     DETAIL PRODUK (isi modal)
     ====================================================================== */
  function detailProduk(p, penjual) {
    var kat = p.kategoriMeta || PW.getCategory(p.kategori);
    var wa = linkWaProduk(p);
    var ig = U.igLink(p.instagram || (penjual && penjual.instagram));
    var favAktif = PW.fav.ada(p.id);

    var badges = '<span class="badge badge--kategori">' + U.esc(p.kategori) + "</span>";
    if (p.baru) badges += '<span class="badge badge--new">Baru</span>';
    if (p.featured) badges += '<span class="badge badge--best">Best Seller</span>';
    if (p.promo) badges += '<span class="badge badge--promo">' + U.esc(p.promo) + "</span>";

    var varian = p.varian && p.varian.length
      ? '<div class="detail__varian-wrap"><span class="field__label">Varian tersedia</span>' +
        '<div class="detail__varian">' + p.varian.map(function (v) {
          return '<span class="varian">' + U.esc(v) + "</span>";
        }).join("") + "</div></div>"
      : "";

    var barisan = "";
    function baris(label, isi) {
      if (!isi) return;
      barisan += '<div class="detail__row"><dt>' + label + "</dt><dd>" + isi + "</dd></div>";
    }
    baris("Usaha", '<a class="linklike" href="' + U.esc(U.urlToko(p.idPenjual)) + '">' + U.esc(p.namaUsaha) + "</a>");
    baris("Mahasiswa", U.esc(p.namaMahasiswa) + (p.angkatan ? " • PGSD " + U.esc(p.angkatan) : ""));
    baris("Kategori", U.esc(p.kategori));
    baris("Lokasi", U.esc(p.lokasi));
    if (p.rating) baris("Rating", U.esc(p.rating.toFixed(1)) + " / 5");
    if (p.tanggal) baris("Diperbarui", U.esc(U.tanggalID(p.tanggal)));

    return '' +
      '<div class="detail" style="--c1:' + kat.c1 + ';--c2:' + kat.c2 + '">' +
        '<div class="detail__media">' +
          imgAman(p.foto, p.nama, "", 800, 600, true) +
          '<div class="detail__badges">' + badges + "</div>" +
        "</div>" +
        '<div class="detail__body">' +
          '<a class="detail__store" href="' + U.esc(U.urlToko(p.idPenjual)) + '">' + ikon("store") + U.esc(p.namaUsaha) + "</a>" +
          '<h2 class="detail__title" id="modal-title">' + U.esc(p.nama) + "</h2>" +
          '<p class="detail__price">' + U.esc(p.hargaTeks) + "</p>" +
          (p.deskripsi ? '<p class="detail__desc">' + U.esc(p.deskripsi) + "</p>" : "") +
          varian +
          '<dl class="detail__list">' + barisan + "</dl>" +
          '<div class="detail__actions">' +
            (wa
              ? '<a class="btn btn--wa btn--lg" href="' + wa + '" target="_blank" rel="noopener">' +
                ikon("whatsapp") + "Pesan Sekarang via WhatsApp</a>"
              : '<span class="btn btn--soft btn--lg" aria-disabled="true">Kontak belum tersedia</span>') +
            '<button class="btn btn--outline" type="button" data-act="fav" data-id="' + U.esc(p.id) + '" ' +
              'aria-pressed="' + (favAktif ? "true" : "false") + '">' + ikon("heart") +
              (favAktif ? "Favorit" : "Simpan") + "</button>" +
            '<button class="btn btn--outline" type="button" data-act="share" data-id="' + U.esc(p.id) + '">' +
              ikon("share") + "Bagikan</button>" +
          "</div>" +
          '<div class="detail__socials">' +
            (ig ? '<a class="social-link" href="' + ig + '" target="_blank" rel="noopener">' +
              ikon("instagram") + "@" + U.esc(U.normalizeIg(p.instagram || (penjual && penjual.instagram))) + "</a>" : "") +
            '<a class="social-link" href="' + U.esc(U.urlToko(p.idPenjual)) + '">' + ikon("store") + "Lihat semua produk toko</a>" +
          "</div>" +
          '<p class="detail__note">Transaksi dilakukan langsung antara pembeli dan penjual. ' +
            "Pengelola website tidak menjadi pihak dalam transaksi. Pastikan menyepakati harga, " +
            "waktu, dan tempat COD sebelum melakukan pembayaran.</p>" +
        "</div>" +
      "</div>";
  }

  /* ======================================================================
     DETAIL CERITA (isi modal)
     ====================================================================== */
  function detailCerita(c, penjual) {
    var paragraf = String(c.isi || c.excerpt || "").split(/\n{2,}/).map(function (t) {
      return "<p>" + U.esc(t.trim()) + "</p>";
    }).join("");

    return '' +
      '<article class="story-detail">' +
        imgAman(c.thumbnail, c.judul, "", 900, 500, true) +
        '<h2 id="story-title">' + U.esc(c.judul) + "</h2>" +
        '<p class="story-detail__meta">' + U.esc(c.penulis) +
          (c.angkatan ? " • PGSD Angkatan " + U.esc(c.angkatan) : "") +
          (c.tanggal ? " • " + U.esc(U.tanggalID(c.tanggal)) : "") + "</p>" +
        paragraf +
        (penjual
          ? '<a class="btn btn--primary" href="' + U.esc(U.urlToko(penjual.id)) + '">Lihat usaha ' +
            U.esc(penjual.namaUsaha) + ikon("arrow-right") + "</a>"
          : "") +
      "</article>";
  }

  /* ======================================================================
     MODAL
     ====================================================================== */
  function elemenModal(jenis) {
    return document.getElementById(jenis === "cerita" ? "story-modal" : "product-modal");
  }

  function bukaModal(jenis, html, idUntukUrl) {
    var modal = elemenModal(jenis);
    if (!modal) return;
    var body = modal.querySelector(".modal__body");
    body.innerHTML = html;

    fokusSebelum = document.activeElement;
    modal.hidden = false;
    document.body.classList.add("is-locked");
    modalTerbuka = jenis;

    var dialog = modal.querySelector(".modal__dialog");
    if (dialog) { dialog.scrollTop = 0; dialog.focus(); }

    if (jenis === "produk" && idUntukUrl) {
      try {
        var url = new URL(window.location.href);
        url.searchParams.set("produk", idUntukUrl);
        history.pushState({ pwModal: idUntukUrl }, "", url.toString());
      } catch (e) { /* browser lama: lewati */ }
    }
  }

  function tutupModal(dariPopstate) {
    if (!modalTerbuka) return;
    var modal = elemenModal(modalTerbuka);
    var jenis = modalTerbuka;
    modalTerbuka = null;

    if (modal) {
      modal.hidden = true;
      var body = modal.querySelector(".modal__body");
      if (body) body.innerHTML = "";
    }
    document.body.classList.remove("is-locked");
    if (fokusSebelum && typeof fokusSebelum.focus === "function") fokusSebelum.focus();

    if (jenis === "produk" && !dariPopstate) {
      try {
        if (history.state && history.state.pwModal) {
          history.back();
        } else {
          var url = new URL(window.location.href);
          url.searchParams.delete("produk");
          history.replaceState({}, "", url.toString());
        }
      } catch (e) { /* abaikan */ }
    }
  }

  function bukaProduk(id) {
    var p = PW.cari.produkById(id);
    if (!p) { toast("Produk tidak ditemukan."); return; }
    var s = PW.state && PW.state.petaPenjual ? PW.state.petaPenjual[p.idPenjual] : null;
    bukaModal("produk", detailProduk(p, s), p.id);
    PW.recent.tambah(p.id);
  }

  function bukaCerita(id) {
    var c = (PW.state.cerita || []).filter(function (x) { return x.id === id; })[0];
    if (!c) return;
    var s = PW.state.petaPenjual ? PW.state.petaPenjual[c.idPenjual] : null;
    bukaModal("cerita", detailCerita(c, s));
  }

  /* ======================================================================
     BAGIKAN
     ====================================================================== */
  function bagikan(id) {
    var p = PW.cari.produkById(id);
    if (!p) return;
    var url = U.urlProduk(p.id);
    var judul = p.nama + " — " + p.namaUsaha;
    var teks = judul + " • " + p.hargaTeks + " di Pojok Wirausaha Mahasiswa PGSD UPI Kampus Serang";

    if (navigator.share) {
      navigator.share({ title: judul, text: teks, url: url }).catch(function () { /* dibatalkan */ });
      return;
    }
    salinTeks(url).then(function (ok) {
      toast(ok ? "Tautan produk berhasil disalin." : "Tidak dapat menyalin tautan.");
    });
  }

  function salinTeks(teks) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(teks).then(function () { return true; })
        .catch(function () { return salinFallback(teks); });
    }
    return Promise.resolve(salinFallback(teks));
  }

  function salinFallback(teks) {
    try {
      var ta = document.createElement("textarea");
      ta.value = teks;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.top = "-1000px";
      document.body.appendChild(ta);
      ta.select();
      var ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch (e) { return false; }
  }

  /* ======================================================================
     FAVORIT (aksi)
     ====================================================================== */
  function ubahFavorit(id, tombol) {
    var aktif = PW.fav.ubah(id);
    var p = PW.cari.produkById(id);
    // sinkronkan semua tombol dengan id yang sama di halaman
    var semua = document.querySelectorAll('[data-act="fav"][data-id="' + CSS_escape(id) + '"]');
    Array.prototype.forEach.call(semua, function (b) {
      b.setAttribute("aria-pressed", aktif ? "true" : "false");
      if (b.classList.contains("btn")) {
        var svg = b.querySelector("svg");
        b.innerHTML = (svg ? svg.outerHTML : "") + (aktif ? "Favorit" : "Simpan");
      }
    });
    toast(aktif
      ? "Ditambahkan ke favorit" + (p ? ": " + p.nama : "")
      : "Dihapus dari favorit" + (p ? ": " + p.nama : ""));
    if (tombol) { /* fokus tetap */ }
  }

  function CSS_escape(s) {
    if (window.CSS && CSS.escape) return CSS.escape(s);
    return String(s).replace(/["\\]/g, "\\$&");
  }

  /* ======================================================================
     PENDENGAR GLOBAL (event delegation)
     ====================================================================== */
  function pasangEvent() {
    document.addEventListener("click", function (e) {
      var pemicu = e.target.closest ? e.target.closest("[data-act]") : null;
      if (pemicu) {
        var act = pemicu.getAttribute("data-act");
        var id = pemicu.getAttribute("data-id");
        if (act === "detail") { e.preventDefault(); bukaProduk(id); return; }
        if (act === "fav") { e.preventDefault(); e.stopPropagation(); ubahFavorit(id, pemicu); return; }
        if (act === "share") { e.preventDefault(); bagikan(id); return; }
        if (act === "cerita") { e.preventDefault(); bukaCerita(id); return; }
      }
      if (e.target.closest && e.target.closest("[data-close-modal]")) {
        e.preventDefault();
        tutupModal();
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && modalTerbuka) tutupModal();
      if (e.key === "Tab" && modalTerbuka) jebakFokus(e);
    });

    window.addEventListener("popstate", function () {
      if (modalTerbuka === "produk") {
        var id = U.getParam("produk");
        if (id) { bukaProduk(id); }
        else { tutupModal(true); }
      } else {
        var idBaru = U.getParam("produk");
        if (idBaru) bukaProduk(idBaru);
      }
    });
  }

  function jebakFokus(e) {
    var modal = elemenModal(modalTerbuka);
    if (!modal) return;
    var fokusable = modal.querySelectorAll(
      'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (!fokusable.length) return;
    var pertama = fokusable[0], terakhir = fokusable[fokusable.length - 1];
    if (e.shiftKey && document.activeElement === pertama) { e.preventDefault(); terakhir.focus(); }
    else if (!e.shiftKey && document.activeElement === terakhir) { e.preventDefault(); pertama.focus(); }
  }

  return {
    toast: toast, ikon: ikon, imgAman: imgAman,
    kartuProduk: kartuProduk, daftarProduk: daftarProduk, skeleton: skeleton,
    kartuRail: kartuRail, kartuPenjual: kartuPenjual, sorotanPenjual: sorotanPenjual,
    kartuPromo: kartuPromo, kartuCerita: kartuCerita,
    detailProduk: detailProduk, detailCerita: detailCerita,
    bukaProduk: bukaProduk, bukaCerita: bukaCerita, tutupModal: tutupModal,
    bagikan: bagikan, ubahFavorit: ubahFavorit, pasangEvent: pasangEvent,
    linkWaProduk: linkWaProduk, angkatanTeks: angkatanTeks
  };
})();


/* ==========================================================================
   PENCARIAN / PENYARINGAN
   ========================================================================== */
PW.cari = (function () {
  var U = PW.util;

  function produkById(id) {
    if (!PW.state || !PW.state.produk) return null;
    id = String(id);
    for (var i = 0; i < PW.state.produk.length; i++) {
      if (PW.state.produk[i].id === id) return PW.state.produk[i];
    }
    return null;
  }

  function penjualById(id) {
    if (!PW.state || !PW.state.penjual) return null;
    id = String(id);
    for (var i = 0; i < PW.state.penjual.length; i++) {
      if (PW.state.penjual[i].id === id) return PW.state.penjual[i];
    }
    return null;
  }

  /* saring + urutkan */
  function terapkan(produk, opsi) {
    opsi = opsi || {};
    var hasil = produk.slice();

    if (opsi.kategori && opsi.kategori !== "semua") {
      var k = String(opsi.kategori).toLowerCase();
      hasil = hasil.filter(function (p) { return String(p.kategori).toLowerCase() === k; });
    }

    if (opsi.q) {
      var kata = String(opsi.q).toLowerCase().trim().split(/\s+/).filter(Boolean);
      hasil = hasil.filter(function (p) {
        return kata.every(function (w) { return p.cari.indexOf(w) > -1; });
      });
    }

    if (opsi.hargaMin != null || opsi.hargaMax != null) {
      hasil = hasil.filter(function (p) {
        if (p.harga == null) return false;
        if (opsi.hargaMin != null && p.harga < opsi.hargaMin) return false;
        if (opsi.hargaMax != null && p.harga > opsi.hargaMax) return false;
        return true;
      });
    }

    if (opsi.ids) {
      var set = {};
      opsi.ids.forEach(function (i) { set[i] = true; });
      hasil = hasil.filter(function (p) { return set[p.id]; });
    }

    switch (opsi.urut) {
      case "harga-asc":
        hasil.sort(function (a, b) { return (a.harga == null ? Infinity : a.harga) - (b.harga == null ? Infinity : b.harga); });
        break;
      case "harga-desc":
        hasil.sort(function (a, b) { return (b.harga == null ? -Infinity : b.harga) - (a.harga == null ? -Infinity : a.harga); });
        break;
      case "nama-asc":
        hasil.sort(function (a, b) { return a.nama.localeCompare(b.nama, "id"); });
        break;
      case "terbaru":
      default:
        hasil.sort(function (a, b) {
          var da = U.parseDate(a.tanggal), db = U.parseDate(b.tanggal);
          return (db ? db.getTime() : 0) - (da ? da.getTime() : 0);
        });
    }
    return hasil;
  }

  return { produkById: produkById, penjualById: penjualById, terapkan: terapkan };
})();
