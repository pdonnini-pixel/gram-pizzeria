/* Gram Pizzeria — script condiviso fra le pagine.
   Nessuna dipendenza esterna, nessun cookie, nessun tracciamento. */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var STR = {
    it: {
      open: "Aperto adesso", shut: "Chiuso adesso", soon: "Apre alle 20:00",
      mon: "Oggi chiuso, ci vediamo domani", today: "aggiornato oggi",
      nav: "Menu", navClose: "Chiudi",
      msg: function (d, t, p, w, n, x) {
        return "Ciao Gram, vorrei prenotare un tavolo.\n\nData: " + d + "\nOra: " + t +
               "\nPersone: " + p + "\nDove: " + w + "\nNome: " + n + (x ? "\nNote: " + x : "");
      }
    },
    en: {
      open: "Open now", shut: "Closed now", soon: "Opens at 20:00",
      mon: "Closed today, see you tomorrow", today: "updated today",
      nav: "Menu", navClose: "Close",
      msg: function (d, t, p, w, n, x) {
        return "Hello Gram, I would like to book a table.\n\nDate: " + d + "\nTime: " + t +
               "\nGuests: " + p + "\nSeating: " + w + "\nName: " + n + (x ? "\nNotes: " + x : "");
      }
    },
    de: {
      open: "Jetzt geöffnet", shut: "Jetzt geschlossen", soon: "Öffnet um 20:00 Uhr",
      mon: "Heute geschlossen, bis morgen", today: "heute aktualisiert",
      nav: "Menü", navClose: "Schließen",
      msg: function (d, t, p, w, n, x) {
        return "Hallo Gram, ich möchte einen Tisch reservieren.\n\nDatum: " + d + "\nUhrzeit: " + t +
               "\nPersonen: " + p + "\nPlatz: " + w + "\nName: " + n + (x ? "\nAnmerkungen: " + x : "");
      }
    }
  };

  var page = document.body.dataset.page || "home";
  var lang = "it";

  /* ---------- lingua ----------
     La scelta viaggia nell'URL (?l=de) invece che in un cookie:
     resta valida cambiando pagina, il link è condivisibile e non
     serve alcun banner perché non viene salvato nulla. */
  function propagate() {
    document.querySelectorAll('a[href$=".html"], a[href*=".html?"]').forEach(function (a) {
      var base = a.getAttribute("href").split("?")[0];
      a.setAttribute("href", lang === "it" ? base : base + "?l=" + lang);
    });
  }
  function setLang(next) {
    if (!STR[next]) next = "it";
    lang = next;
    document.documentElement.lang = next;
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var t = el.dataset[next]; if (t) el.textContent = t;
    });
    document.querySelectorAll("[data-ph-it]").forEach(function (el) {
      el.placeholder = el.getAttribute("data-ph-" + next) || el.getAttribute("data-ph-it");
    });
    document.querySelectorAll(".langs button").forEach(function (b) {
      b.setAttribute("aria-pressed", b.dataset.lang === next ? "true" : "false");
    });
    propagate(); paintBurger(); paintStatus(); paintDate();
  }
  document.querySelectorAll(".langs button").forEach(function (b) {
    b.addEventListener("click", function () { setLang(b.dataset.lang); });
  });

  /* ---------- navigazione ---------- */
  var burger = document.getElementById("burger");
  var nav = document.getElementById("nav");
  var scrim = document.getElementById("scrim");

  document.querySelectorAll("[data-nav]").forEach(function (a) {
    if (a.dataset.nav === page) a.setAttribute("aria-current", "page");
  });

  function paintBurger() {
    if (!burger || !nav) return;
    burger.textContent = nav.classList.contains("open") ? STR[lang].navClose : STR[lang].nav;
  }
  function setNav(open) {
    nav.classList.toggle("open", open);
    if (scrim) scrim.classList.toggle("open", open);
    document.body.classList.toggle("navopen", open);
    burger.setAttribute("aria-expanded", open ? "true" : "false");
    paintBurger();
  }
  function closeNav() { setNav(false); }
  if (burger && nav) {
    burger.addEventListener("click", function () { setNav(!nav.classList.contains("open")); });
    nav.addEventListener("click", function (e) { if (e.target.closest("a")) closeNav(); });
    if (scrim) scrim.addEventListener("click", closeNav);
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeNav(); });
    window.addEventListener("resize", function () { if (window.innerWidth >= 900) closeNav(); });
  }

  /* ---------- barra fissa: dopo l'hero, mai sulla pagina di prenotazione ---------- */
  var dock = document.getElementById("dock");
  function updateDock() {
    if (!dock) return;
    dock.classList.toggle("show", window.scrollY > 460 && page !== "prenota");
  }
  window.addEventListener("scroll", updateDock, { passive: true });

  /* ---------- stato apertura, calcolato sull'ora di Roma ---------- */
  function romeParts() {
    var p = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Rome", weekday: "short", day: "2-digit", month: "2-digit",
      hour: "2-digit", hour12: false
    }).formatToParts(new Date());
    var o = {}; p.forEach(function (x) { o[x.type] = x.value; });
    var map = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    return { day: map[o.weekday], h: parseInt(o.hour, 10), d: o.day, mo: o.month };
  }
  function paintStatus() {
    var dot = document.getElementById("statusDot");
    var txt = document.getElementById("statusText");
    var t = romeParts(), s = STR[lang];
    if (dot && txt) {
      var isOpen = t.day !== 1 && t.h >= 20;
      dot.className = "dot " + (isOpen ? "open" : "shut");
      txt.textContent = isOpen ? s.open : (t.day === 1 ? s.mon : (t.h < 20 ? s.soon : s.shut));
    }
    document.querySelectorAll("#hoursList li").forEach(function (li) {
      li.classList.toggle("now", parseInt(li.dataset.day, 10) === t.day);
    });
  }
  function paintDate() {
    var el = document.getElementById("specDate"); if (!el) return;
    var t = romeParts();
    el.textContent = t.d + "." + t.mo + " · " + STR[lang].today;
  }
  setInterval(function () { paintStatus(); paintDate(); }, 60000);

  /* ---------- prenotazione ---------- */
  var dateEl = document.getElementById("bDate");
  if (dateEl) {
    var d = new Date();
    dateEl.min = d.toISOString().slice(0, 10);
    if (d.getHours() >= 22) d.setDate(d.getDate() + 1);
    dateEl.value = d.toISOString().slice(0, 10);
  }
  var send = document.getElementById("bSend");
  if (send) {
    send.addEventListener("click", function () {
      var raw = (dateEl && dateEl.value) || "";
      var pretty = raw ? raw.split("-").reverse().join("/") : "—";
      var body = STR[lang].msg(pretty,
        document.getElementById("bTime").value,
        document.getElementById("bPax").value,
        document.getElementById("bWhere").value,
        document.getElementById("bName").value.trim() || "—",
        document.getElementById("bNote").value.trim());
      window.open("https://wa.me/393500896171?text=" + encodeURIComponent(body), "_blank", "noopener");
    });
  }

  /* ---------- numeri della scheda impasto ---------- */
  function countUp(el) {
    var target = parseInt(el.dataset.count, 10), suffix = el.dataset.suffix || "";
    if (reduce) { el.textContent = target + suffix; return; }
    var start = null, dur = 850;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1), eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var spec = document.querySelector(".spec");
  if (spec && "IntersectionObserver" in window) {
    var so = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { e.target.querySelectorAll("[data-count]").forEach(countUp); so.unobserve(e.target); }
      });
    }, { threshold: .3 });
    so.observe(spec);
  }

  /* ---------- rivelazione allo scroll ---------- */
  var items = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: .12, rootMargin: "0px 0px -40px 0px" });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- avvio ---------- */
  var q = null;
  try { q = new URLSearchParams(location.search).get("l"); } catch (_) {}
  if (q && STR[q]) setLang(q);
  else {
    var nv = (navigator.language || "it").slice(0, 2).toLowerCase();
    setLang(nv === "de" ? "de" : (nv === "it" ? "it" : "en"));
  }
  updateDock();
})();
