/* ============================================================
   Gram Pizzeria — aggancio dei contenuti (congelato)
   Il sito resta statico e velocissimo. All'apertura chiede a
   Supabase i contenuti aggiornati e li applica sopra all'HTML.
   Se Supabase è irraggiungibile, il sito mostra comunque tutto:
   gli aggiornamenti sono un miglioramento, mai una dipendenza.

   Inserire in fondo alle pagine, dopo app.js:
     <script src="assets/content-loader.js" defer></script>
   e compilare qui sotto i due valori pubblici del progetto.
   ============================================================ */
(function () {
  "use strict";

  var SUPABASE_URL = "https://zkjpanwphmigxszuddwo.supabase.co";
  var SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpranBhbndwaG1pZ3hzenVkZHdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ4MzM1MDUsImV4cCI6MjEwMDQwOTUwNX0.kCN036H8CQn_OkVcc0459LuPj2DEI2XSlToNTLCw8Wo";
  if (SUPABASE_URL.indexOf("IL-TUO-PROGETTO") !== -1) return; // non configurato: resta l'HTML

  var lang = (document.documentElement.lang || "it");
  var GIORNO = { lun: 1, mar: 2, mer: 3, gio: 4, ven: 5, sab: 6, dom: 0 };
  var ORDINE_MENU = ["Fritti","Pizze classiche","Pizze speciali","Pizze fritte e ripassate","Padellini","Dolci",
    "Acqua","Analcolici","Birre alla spina","Birre in bottiglia","Cocktail",
    "Vini rossi","Vini bianchi","Vini rosati","Bollicine",
    "Amari","Gin","Grappe","Liquori","Rum","Tequila","Whisky"];

  fetch(SUPABASE_URL + "/rest/v1/content?key=eq.site&select=value", {
    headers: { apikey: SUPABASE_ANON, Authorization: "Bearer " + SUPABASE_ANON },
  })
    .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
    .then(function (rows) { if (rows && rows[0] && rows[0].value) applica(rows[0].value); })
    .catch(function () { /* silenzio: resta il contenuto statico */ })
    // Rivela i campi modificabili (nascosti finché non arriva il valore vero,
    // così non si vede mai il testo precedente prima dell'aggiornamento).
    .finally(function () { document.documentElement.classList.remove("gram-hydrating"); });

  function testo(el, obj) {
    if (!el || !obj) return;
    if (obj.it) el.setAttribute("data-it", obj.it);
    if (obj.en) el.setAttribute("data-en", obj.en);
    if (obj.de) el.setAttribute("data-de", obj.de);
    var t = obj[lang] || obj.it; if (t) el.textContent = t;
  }
  function each(sel, fn) { Array.prototype.forEach.call(document.querySelectorAll(sel), fn); }

  function applica(c) {
    // testi semplici marcati con data-content
    if (c.home) {
      each('[data-content="frase"]', function (el) { testo(el, c.home.frase); });
      each('[data-content="intro"]', function (el) { testo(el, c.home.intro); });
      each('[data-content="cucina"]', function (el) { testo(el, c.home.cucina); });
      each('[data-content="didascalia"]', function (el) { testo(el, c.home.didascalia); });
    }
    if (c.asporto) each('[data-content="asporto"]', function (el) { testo(el, c.asporto); });
    if (c.privacy) each('[data-content="privacy"]', function (el) { testo(el, c.privacy); });

    // intestazioni di pagina
    if (c.intestazioni) Object.keys(c.intestazioni).forEach(function (k) {
      var ist = c.intestazioni[k];
      each('[data-content="' + k + '.occhiello"]', function (el) { testo(el, ist.occhiello); });
      each('[data-content="' + k + '.titolo"]', function (el) { testo(el, ist.titolo); });
      if (ist.lede) each('[data-content="' + k + '.lede"]', function (el) { testo(el, ist.lede); });
    });

    // etichette di navigazione e pulsanti
    if (c.etichette) {
      if (c.etichette.nav) Object.keys(c.etichette.nav).forEach(function (k) {
        each('[data-nav-label="' + k + '"], [data-nav="' + k + '"]', function (el) { testo(el, c.etichette.nav[k]); });
      });
      if (c.etichette.bottoni) Object.keys(c.etichette.bottoni).forEach(function (k) {
        each('[data-btn-label="' + k + '"]', function (el) { testo(el, c.etichette.bottoni[k]); });
      });
    }

    // contatti + locale
    if (c.contatti) {
      each('[data-content="telefono"]', function (el) {
        el.textContent = c.contatti.telefono;
        if (el.tagName === "A") el.setAttribute("href", "tel:" + c.contatti.telefono.replace(/\s/g, ""));
      });
      each('[data-content="indirizzo"]', function (el) { el.textContent = c.contatti.indirizzo; });
      each('[data-content="instagram"]', function (el) { el.textContent = c.contatti.instagram; });
      // social: lista gestibile dal pannello (nome + url). Genera i link con
      // l'icona del brand quando riconosciuto, altrimenti il nome testuale.
      if (c.contatti.social && c.contatti.social.length) {
        var SVG = function (d) { return '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="' + d + '"/></svg>'; };
        var ICONE = {
          instagram: SVG("M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41 1.27-.06 1.65-.07 4.85-.07M12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63c-.79.31-1.46.72-2.12 1.38C1.36 2.67.95 3.34.63 4.14.33 4.9.13 5.78.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91.31.8.72 1.47 1.38 2.13.66.66 1.33 1.07 2.12 1.38.76.3 1.64.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56.8-.31 1.47-.72 2.13-1.38.66-.66 1.07-1.33 1.38-2.13.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91a5.9 5.9 0 0 0-1.38-2.12A5.9 5.9 0 0 0 19.86.63c-.76-.3-1.64-.5-2.91-.56C15.67.01 15.26 0 12 0m0 5.84A6.16 6.16 0 1 0 18.16 12 6.16 6.16 0 0 0 12 5.84M12 16a4 4 0 1 1 4-4 4 4 0 0 1-4 4m6.41-10.85a1.44 1.44 0 1 0 1.44 1.44 1.44 1.44 0 0 0-1.44-1.44"),
          facebook: SVG("M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.96H16.8c-1.49 0-1.96.93-1.96 1.89v2.26h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07"),
          tiktok: SVG("M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07"),
          youtube: SVG("M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.5A3.02 3.02 0 0 0 .5 6.19C0 8.07 0 12 0 12s0 3.93.5 5.81a3.02 3.02 0 0 0 2.12 2.14c1.88.5 9.38.5 9.38.5s7.5 0 9.38-.5a3.02 3.02 0 0 0 2.12-2.14C24 15.93 24 12 24 12s0-3.93-.5-5.81M9.55 15.57V8.43L15.82 12z"),
          x: SVG("M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.41l-5.8-7.58-6.64 7.58H.47l8.6-9.83L0 1.15h7.59l5.24 6.93zm-1.29 19.49h2.04L6.49 3.24H4.3z")
        };
        each('[data-content="social"]', function (el) {
          el.innerHTML = "";
          c.contatti.social.forEach(function (s) {
            if (!s.nome || !s.url) return;
            var a = document.createElement("a");
            a.href = s.url; a.target = "_blank"; a.rel = "noopener";
            a.setAttribute("aria-label", s.nome); a.title = s.nome;
            a.style.cssText = "display:inline-flex;align-items:center;margin-right:14px";
            var key = s.nome.toLowerCase().replace(/[^a-z]/g, "");
            if (key.indexOf("twitter") !== -1) key = "x";
            if (ICONE[key]) a.innerHTML = ICONE[key]; else a.textContent = s.nome;
            el.appendChild(a);
          });
        });
      }
      aggiornaMappa(c.contatti.lat, c.contatti.lng);
    }
    if (c.locale) {
      each('[data-content="piva"]', function (el) { el.textContent = c.locale.piva; });
      each('[data-content="ragioneSociale"]', function (el) { el.textContent = c.locale.ragioneSociale; });
      each('[data-content="coperto"]', function (el) { el.textContent = c.locale.coperto; });
    }

    // impasto: aggiorna in place le righe esistenti, preservando stile,
    // animazione dei numeri (data-count) e traduzioni (data-it/en/de).
    if (c.home && c.home.impasto && c.home.impasto.length) {
      var righe = [];
      Array.prototype.forEach.call(document.querySelectorAll('[data-content="impasto"] li'), function (li) {
        if (li.querySelector(".k") && li.querySelector(".v")) righe.push(li);
      });
      c.home.impasto.forEach(function (r, i) {
        var li = righe[i]; if (!li) return;
        testo(li.querySelector(".k"), r.label);
        var v = li.querySelector(".v");
        var suff = r.unita ? (" " + r.unita) : (v.getAttribute("data-suffix") || "");
        if (r.valore != null && r.valore !== "") {
          v.setAttribute("data-count", String(r.valore));
          v.setAttribute("data-suffix", suff);
          v.textContent = r.valore + suff;
        }
      });
    }

    if (c.orari) { applicaOrari(c.orari, c.chiusure); if (window.gramPaintStatus) window.gramPaintStatus(); }
    if (c.staff) applicaStaff(c.staff);
    if (c.cilento) applicaCilento(c.cilento);
    if (c.faq) applicaFaq(c.faq);
    if (c.menu && c.menu.length) applicaMenu(c.menu);
  }

  function aggiornaMappa(lat, lng) {
    var f = document.querySelector('iframe[title*="Gram"], .map iframe'); if (!f) return;
    var la = parseFloat(String(lat).replace(",", ".")), lo = parseFloat(String(lng).replace(",", "."));
    if (!isFinite(la) || !isFinite(lo)) return;
    f.src = "https://www.openstreetmap.org/export/embed.html?bbox=" + (lo - 0.008) + "%2C" + (la - 0.006) +
            "%2C" + (lo + 0.008) + "%2C" + (la + 0.006) + "&layer=mapnik&marker=" + la + "%2C" + lo;
  }

  function applicaOrari(orari, chiusure) {
    var oggiISO = new Date().toISOString().slice(0, 10);
    var chiusuraOggi = (chiusure || []).find(function (c) { return c.da && c.a && c.da <= oggiISO && oggiISO <= c.a; });
    orari.forEach(function (o) {
      var li = document.querySelector('#hoursList li[data-day="' + GIORNO[o.key] + '"]');
      if (!li) return;
      var v = li.querySelector(".v");
      li.classList.toggle("off", !!o.chiuso);
      if (!v) return;
      if (o.chiuso) {
        v.setAttribute("data-it", "chiuso"); v.setAttribute("data-en", "closed"); v.setAttribute("data-de", "geschl.");
        v.textContent = { it: "chiuso", en: "closed", de: "geschl." }[lang] || "chiuso";
      } else {
        v.removeAttribute("data-it"); v.removeAttribute("data-en"); v.removeAttribute("data-de");
        v.textContent = o.apre + "–" + o.chiude;
      }
    });
    // avviso di chiusura straordinaria
    var banner = document.getElementById("closureBanner");
    if (banner) {
      if (chiusuraOggi) {
        var m = chiusuraOggi.motivo && (chiusuraOggi.motivo[lang] || chiusuraOggi.motivo.it) || "";
        banner.textContent = (lang === "en" ? "Closed today" : lang === "de" ? "Heute geschlossen" : "Oggi chiuso") + (m ? " — " + m : "");
        banner.style.display = "";
      } else { banner.style.display = "none"; }
    }
  }

  function applicaStaff(staff) {
    // aggiorna in place le schede persona esistenti (.person): nome, ruolo, bio.
    var cards = document.querySelectorAll('[data-content="staff"] .person');
    staff.forEach(function (s, i) {
      var card = cards[i]; if (!card) return;
      var nm = card.querySelector(".nm"); if (nm && s.nome) nm.textContent = s.nome;
      testo(card.querySelector(".rl"), s.ruolo);
      testo(card.querySelector(".bio"), s.bio);
    });
  }

  function applicaCilento(c) {
    var i = document.querySelector('[data-content="cilento.intro"]'); if (i) testo(i, c.intro);
    var pq = document.querySelector('[data-content="cilento.perche"]'); if (pq) testo(pq, c.perche);
    if (c.luoghi && c.luoghi.length) {
      var lis = document.querySelectorAll('[data-content="cilento.luoghi"] li');
      c.luoghi.forEach(function (l, idx) {
        var li = lis[idx]; if (!li) return;
        testo(li.querySelector("span:not(.dots):not(.v)"), l.nome);
        var v = li.querySelector(".v"); if (v && l.tempo) v.textContent = l.tempo;
      });
    }
  }

  function applicaFaq(faq) {
    // aggiorna in place le voci FAQ esistenti (details/summary/.a), preservando i18n.
    var dets = document.querySelectorAll('[data-content="faq"] details');
    faq.forEach(function (f, idx) {
      var d = dets[idx]; if (!d) return;
      testo(d.querySelector("summary"), f.d);
      testo(d.querySelector(".a"), f.r);
    });
  }

  function applicaMenu(items) {
    // Solo nella pagina menu: in home la .menu-groups è un'anteprima statica curata.
    var root = document.querySelector('[data-page="menu"] .menu-groups'); if (!root) return;
    var gruppi = {};
    items.forEach(function (p) { (gruppi[p.gruppo] = gruppi[p.gruppo] || []).push(p); });
    var ordine = ORDINE_MENU.filter(function (g) { return gruppi[g]; });
    Object.keys(gruppi).forEach(function (g) { if (ordine.indexOf(g) === -1) ordine.push(g); });

    root.innerHTML = "";
    ordine.forEach(function (nomeGruppo) {
      var g = document.createElement("div"); g.className = "group";
      var h = document.createElement("h3"); h.textContent = nomeGruppo; g.appendChild(h);
      gruppi[nomeGruppo].forEach(function (p) {
        var item = document.createElement("div"); item.className = "item";
        var line = document.createElement("div"); line.className = "line";
        var nome = document.createElement("span"); nome.className = "name"; nome.textContent = p.nome || "";
        var dots = document.createElement("span"); dots.className = "dots";
        var prezzo = document.createElement("span"); prezzo.className = "price"; prezzo.textContent = p.prezzo || "";
        line.appendChild(nome); line.appendChild(dots); line.appendChild(prezzo);
        item.appendChild(line);
        var descTxt = p[lang] || p.it || "";
        if (descTxt) {
          var desc = document.createElement("p"); desc.className = "desc";
          desc.setAttribute("data-i18n", "");
          if (p.it) desc.setAttribute("data-it", p.it);
          if (p.en) desc.setAttribute("data-en", p.en);
          if (p.de) desc.setAttribute("data-de", p.de);
          desc.textContent = descTxt;
          item.appendChild(desc);
        }
        g.appendChild(item);
      });
      root.appendChild(g);
    });
  }
})();
