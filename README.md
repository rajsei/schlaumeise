# Schlaumeise

Schlaumeise ist eine interaktive Lernplattform, die Kindern und Jugendlichen mithilfe von KI und Projekten rund um heimische Vögel Natur, Umwelt, Informatik und Akustik näherbringt.

## Tech-Stack

- Astro 5 + Starlight
- Tailwind CSS (via Vite)
- Starlight-Plugins: Image Zoom, KBD, Full View Mode, GitHub Alerts
- Mehrsprachigkeit: Deutsch (default) und Englisch

## Projektstruktur

- `src/content/docs/` enthält die Starlight-Dokumentation (Live-Inhalte).
- `src/pages/` enthält eigenständige Astro-Routen (z. B. Quiz).
- `src/components/` enthält wiederverwendbare Astro-Komponenten.
- `src/styles/` enthält globale und projektbezogene Styles.
- `astro.config.mjs` bündelt Starlight- und Build-Konfiguration.

## Entwicklung

Alle Befehle im Projekt-Root ausführen:

```bash
npm install
npm run dev
```

Lokaler Dev-Server: `http://localhost:4321`

## Build & Preview

```bash
npm run build
npm run preview
```

## Deployment

Die Site ist für GitHub Pages mit Basis-Pfad `/schlaumeise/` konfiguriert.
URL: `https://rajsei.github.io/schlaumeise/`

## TODO
Formular:
- Kontaktformular (für Ideen, Wünsche, Fragen)

Quiz: 
- Englische Version
- zufällige Antwortreihenfolge

Soundscape-Generator:
- zur Veranschaulichung von Lärmbelästigung, in welchem Bereich liegen Verkehrsgeräusche, menschliche Stimmen und Vögel (Eulen, Singvögel)?
- mit Spektrogramm

Technische Funktionen:
- Spektrogramm für Dateien und Live-Audio
- PDF-Dateien herunterladen

Allgemeine Anforderungen:
- Die Inhalte sollen altersspezifisch gefiltert werden.
