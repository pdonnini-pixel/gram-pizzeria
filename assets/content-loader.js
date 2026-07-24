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
    .catch(function () { /* silenzio: resta il contenuto statico */ });

  function testo(el, obj) {
    if (!el || !obj) return;
    if (obj.it) el.setAttribute("data-it", obj.it);
    if (obj.en) el.setAttribute("data-en", obj.en);
    if (obj.de) el.setAttribute("data-de", obj.de);
    var t = obj[lang] || obj.it;
    if (!t || t === el.textContent) return;
    // Il testo cambia rispetto allo statico: dissolvenza breve, così
    // l'aggiornamento da Supabase sembra voluto e non un lampeggio/errore.
    el.style.transition = "opacity .22s ease";
    el.style.opacity = "0";
    setTimeout(function () { el.textContent = t; el.style.opacity = "1"; }, 130);
  }
  function each(sel, fn) { Array.prototype.forEach.call(document.querySelectorAll(sel), fn); }

  function applica(c) {
    // testi semplici marcati con data-content
    if (c.home) {
      each('[data-content="frase"]', function (el) { testo(el, c.home.frase); });
      each('[data-content="intro"]', function (el) { testo(el, c.home.intro); });
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

    if (c.orari) applicaOrari(c.orari, c.chiusure);
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
