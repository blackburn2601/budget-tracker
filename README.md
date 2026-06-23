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

Die App funktioniert **vollständig ohne Backend** — alle Daten liegen im
`localStorage`. Beim ersten Start werden die Szenarien (AKTUELL, Ab März 2026,
… , Haus) mit den Seed-Daten befüllt.

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

## Supabase-Cloud-Sync (optional)

1. SQL aus `supabase/schema.sql` im Supabase-SQL-Editor ausführen.
2. `.env.example` nach `.env.local` kopieren und Werte eintragen.
3. Dev-Server neu starten → unter *Einstellungen* erscheinen die Cloud-Buttons.

Welche Daten genau benötigt werden, steht weiter unten / in der Antwort des Assistenten.
