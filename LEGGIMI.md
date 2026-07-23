# Gram Pizzeria — sito

Sito statico, sei pagine, nessuna build, nessun database, nessun cookie.
Peso totale 516 KB, di cui 300 KB sono le due foto.

```
index.html        Home
menu.html         Menù completo con allergeni
noi.html          La squadra e il locale
cilento.html      Il territorio e i format di bassa stagione
prenota.html      Prenotazione, asporto, orari, mappa, FAQ
404.html          Pagina non trovata, in stile
assets/
  styles.css      Tutto il CSS
  app.js          Tutto il JavaScript
  logo.png        Marchio come maschera: si colora via CSS
  fondatore.jpg   Foto hero
  fondatore-sq.jpg  Ritratto squadra
  og.jpg          Anteprima per WhatsApp e social (1200x630)
  favicon-32.png · apple-touch-icon.png · icon-192.png · icon-512.png
netlify.toml      Cache degli asset e intestazioni di sicurezza
site.webmanifest  Icona e nome se lo si salva sulla schermata home
robots.txt · sitemap.xml
```

## Pubblicare

**Il modo più veloce.** Vai su `app.netlify.com/drop` e trascina questa cartella
nel riquadro. In trenta secondi il sito è online su un indirizzo `*.netlify.app`.
Poi da *Site configuration → Domain management* colleghi il dominio vero.

**Da riga di comando**, dentro questa cartella:

```shell
npx netlify-cli deploy --prod --dir .
```

`netlify.toml` è già configurato: nessun comando di build, pubblica la cartella
così com'è.

## Da sostituire prima di andare online

1. **Menù e prezzi.** Le dieci pizze sono verosimili ma inventate. Vanno riscritte
   in `menu.html` **e** nel blocco `application/ld+json` in cima allo stesso file.
   Se i due non coincidono, Google mostra il prezzo sbagliato nei risultati.
2. **P.IVA** nel footer, presente in tutte le pagine.
3. **Nomi della squadra** in `noi.html`, a partire dal fondatore.
4. **Foto mancanti.** I riquadri tratteggiati non sono buchi: contengono il brief
   di scatto. Sostituire il `<div class="shot">` con un `<img>`.
5. **Coordinate GPS** nel campo `geo` dei dati strutturati: quelle attuali sono
   approssimate sul paese, non sul civico.
6. **Dominio.** Cerca e sostituisci `https://www.grampizzeria.it/` ovunque
   compaia, compresi `sitemap.xml` e `robots.txt`.

## Dopo la pubblicazione

- Registra il sito su **Google Search Console** e invia `sitemap.xml`.
- Collega il sito al profilo **Google Business**: per una pizzeria è da lì che
  arriva la maggior parte del traffico, non dalla ricerca generica.
- Verifica i dati strutturati con il Rich Results Test di Google.
- Manda il link a te stesso su WhatsApp per controllare come appare l'anteprima.

## Scelte tecniche, in breve

- **Prenotazione via WhatsApp.** Il modulo compone un messaggio precompilato e
  apre WhatsApp. Zero backend, zero canone, zero commissioni, e ogni prenotazione
  resta nella rubrica della pizzeria invece che dentro un portale. Il numero è in
  `app.js` e nei link `wa.me` delle pagine.
- **Lingua nell'URL** (`?l=en`, `?l=de`) invece che in un cookie: si mantiene
  cambiando pagina, è condivisibile, e non serve alcun banner perché non viene
  salvato nulla sul dispositivo. Per indicizzare davvero le tre lingue servono
  cartelle `/en/` e `/de/` con i rispettivi `hreflang`.
- **Orari sull'ora di Roma**, non su quella del telefono: un turista tedesco vede
  lo stato di apertura corretto.
- **Dati strutturati schema.org** su ogni pagina: Restaurant, Menu con i prezzi
  voce per voce, FAQPage, BreadcrumbList. È la parte che non si vede e che conta
  di più: rende il locale leggibile a Google, ad Apple Maps e agli assistenti AI
  che ormai intermediano la domanda "dove mangio stasera".
- **Nessun tracciamento.** Niente Analytics, niente pixel, niente font caricati
  dal proprio server verso terze parti se non Google Fonts. Se serve una statistica,
  Netlify Analytics è lato server e non richiede consenso.
