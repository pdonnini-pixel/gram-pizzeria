## Revisione prima del merge

Prima di chiedere di unire una PR verso `main`, Claude fa rileggere le modifiche ai revisori
in `.claude/agents/` e riporta l'esito nella PR:
- `revisore-codice`: sempre;
- `revisore-sicurezza`: quando la PR tocca login e password, permessi, dati personali o dei
  clienti, file caricati, pagamenti, webhook, API pubbliche, chiavi o variabili d'ambiente,
  o un file pubblico del sito.

Un verdetto BLOCCA si sistema prima del merge. ATTENZIONE si sistema oppure si registra come
debito. I revisori sono in sola lettura: non modificano file e non toccano database. Non
partono da soli su GitHub: li lancia Claude.
