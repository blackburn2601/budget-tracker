# Budget Tracker

Eine responsive, deutschsprachige Web-App für die monatliche Finanz- und
Vermögensübersicht mit mehreren Szenarien. Die App startet mit fiktiven
Beispieldaten (Max Mustermann) – im Bearbeiten-Modus überschreibbar.

## Tech-Stack

- **React 18 + TypeScript**
- **Vite** (Build/Dev-Server)
- **Tailwind CSS v4** (Styling, inkl. Dark Mode)
- **Recharts** (Donut-, Bar- und Linien-Charts)
- **Zustand** + `persist` (State + localStorage)
- **Supabase** (optionaler Cloud-Sync)

## Starten

```bash
npm install
npm run dev      # Dev-Server  → http://localhost:5173
npm run build    # Production-Build nach dist/
npm run preview  # Build lokal testen
```

> **Anmeldung erforderlich:** Die App ist hinter einem Login (Supabase Auth,
> E-Mail + Passwort) geschützt. Ohne konfiguriertes Supabase und gültige
> Anmeldung erscheint nur ein Hinweis- bzw. Login-Screen. Einrichtung siehe
> [Supabase-Cloud-Sync](#supabase-cloud-sync-erforderlich).

Nach der Anmeldung lädt die App den aktuellen Stand aus der Cloud (Source of
Truth) und speichert Änderungen automatisch zurück. `localStorage` dient nur
noch als lokaler Cache.

## Funktionen

| Bereich | Inhalt |
|---|---|
| **Dashboard** | Einkünfte, Kontobelastung, Rest, Vermögen; Donut nach Kategorie; Bar Einkünfte/Belastung/Rest; Zwischensummen; Asset-Allokation |
| **Kostenträger** | CRUD je Kategorie, einklappbare Zwischensummen, Notizfeld, Einkünfte-Editor, Leasing-Panel |
| **Vermögen** | Asset-CRUD (Tagesgeld/Depot/Krypto/Gold/Rente), Monatszuwachs → Voraussicht, Allokation, Vermögensentwicklung über Szenarien |
| **Vergleich** | Side-by-side-Tabelle aller Szenarien (Fixkosten, Investitionen, Rest, Gesamtvermögen …) |
| **Haus Wuppertal** | Eigene Ansicht für die gemeinsame Immobilie |
| **Einstellungen** | JSON/CSV Export, JSON Import, Supabase-Sync, Zurücksetzen |
| Global | Bearbeiten-Modus, Dark Mode, mobile Sidebar, deutsche Währungsformatierung |

## Supabase-Cloud-Sync (erforderlich)

1. SQL aus `supabase/schema.sql` im Supabase-SQL-Editor ausführen (legt Tabelle
   an und setzt die RLS-Policy auf `authenticated`).
2. In Supabase **öffentliche Registrierung deaktivieren** (Authentication →
   Providers → Email) und unter Authentication → Users den einen erlaubten
   Account (E-Mail + Passwort) anlegen.
3. `.env.example` nach `.env.local` kopieren und `VITE_SUPABASE_URL` /
   `VITE_SUPABASE_ANON_KEY` eintragen.
4. Dev-Server starten → es erscheint der Login. Nach Anmeldung lädt der
   Cloud-Stand und Änderungen werden automatisch gespeichert.

> ⚠️ Die Zeile in `budget_snapshots` enthält Live-Daten. Vor Schemaänderungen
> ein Backup ziehen (`select data from public.budget_snapshots;` oder
> *Einstellungen → JSON exportieren*).
