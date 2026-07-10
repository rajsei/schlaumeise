# Content-Handbuch

Anleitung für alle, die Inhalte pflegen — ohne Programmierkenntnisse nutzbar.

## Neue Seite anlegen

1. Datei unter `src/content/docs/de/<themenbereich>/mein-thema.md` anlegen (kebab-case, keine Umlaute/Sonderzeichen im Dateinamen — er wird Teil der URL).
2. Frontmatter ausfüllen (siehe unten); `title` ist Pflicht.
3. Liegt die Datei in einem Verzeichnis, das in `src/config/docs-navigation.ts` per `autogenerate` registriert ist, erscheint sie automatisch in der Sidebar. Neue Themenbereiche müssen dort einmalig als Topic/Gruppe eingetragen werden.
4. `npm run dev` starten und unter `http://localhost:4321/schlaumeise/<themenbereich>/mein-thema/` prüfen.

Eine `index.md(x)` im Verzeichnis wird zur Übersichtsseite der Gruppe („Übersicht“-Link).

## Frontmatter-Referenz

```yaml
---
title: Vögel                  # PFLICHT — Seitentitel & Sidebar-Label
description: Kurzbeschreibung # empfohlen — Untertitel & Meta-Description
sidebar:
  order: 3                    # Reihenfolge in der Sidebar (aufsteigend)
  label: Anderes Label        # optional — überschreibt title in der Sidebar
  hidden: true                # optional — Seite aus Sidebar/Pagination ausblenden
topicId: knowledge_collection # optional — aktives Topic erzwingen
category: "Audio"             # optional — Kategorisierung
tags: ["Basteln", "Outdoor"]  # optional — Schlagworte
menu: false                   # optional — Desktop-Sidebar eingeklappt starten
content: false                # optional — Inhalts-TOC ausblenden
definition: Kurzdefinition    # optional — nur glossary/: Tooltip-Text des Inline-Glossars (Term)
prev: false                   # optional — „Zurück“-Link unterdrücken
next:                         # optional — „Weiter“-Link überschreiben
  link: projects/project01
  label: Zum Projekt
---
```

Nur diese Felder sind erlaubt. Neue Felder müssen zuerst in `src/content.config.ts` (Zod-Schema) und `src/types/docs.ts` ergänzt werden — unbekannte Felder werden sonst stillschweigend verworfen.

### Projekt-Steckbrief (`project`, nur Projekt-`index`-Seiten)

Setzt eine Projekt-Übersichtsseite das Feld `project`, rendert das Layout automatisch eine Steckbrief-Karte zwischen Seitenkopf und Inhalt (Komponente `ProjectMeta`, kein Import nötig):

```yaml
project:
  difficulty: 2               # PFLICHT — Schwierigkeit 1–3 (1 leicht · 2 mittel · 3 anspruchsvoll)
  skillLevel: 2               # PFLICHT — Computerkenntnisse 1–3 (1 keine · 2 Grundkenntnisse · 3 Fortgeschritten)
  duration: "2–3 Nachmittage" # PFLICHT — Freitext, pro Sprache übersetzen
  cost: "ca. 60–120 €"        # PFLICHT — Freitext, pro Sprache übersetzen
  supervision: adults         # PFLICHT — alone | adults | supervised
  ageMin: 10                  # PFLICHT — empfohlenes Mindestalter
  indoorOutdoor: both         # PFLICHT — indoor | outdoor | both
  tools:                      # optional — Chips „Das brauchst du"
    - Raspberry Pi
  learningGoals:              # optional — Chips „Das lernst du"
    - KI verstehen
  safetyNotes: "…"            # optional — Sicherheitshinweis (gelber Kasten)
```

Die Skalen erscheinen als Ampel-Punkte (grün/gelb/rot), `supervision` als Badge. Alle festen Beschriftungen kommen aus dem i18n-Dictionary (`projectMeta` in `src/i18n/locales/`) — in beiden Sprachversionen dieselben Feldwerte verwenden, nur Freitexte (`duration`, `cost`, `tools`, `learningGoals`, `safetyNotes`) übersetzen.

## Bilder einbinden

Alle Inhaltsbilder liegen in `src/assets/images/<themenbereich>/<seite>/` und laufen durch die Astro-Bildoptimierung (`astro:assets`: WebP-Konvertierung, Größenanpassung, Hashing). Dateinamen kebab-case bzw. nummeriert (`01.png`, `02.png` …). `public/` ist nur noch für Dateien, die unverändert ausgeliefert werden müssen (z. B. `favicon.svg`).

**In Markdown (`.md` und `.mdx`)** — relativer Pfad, wird automatisch optimiert:

```md
![Screenshot des Raspberry Pi Imager](../../../../../assets/images/project01/pi-setup/01.png)
```

(Anzahl `../` = Verzeichnistiefe der Content-Datei bis `src/`.)

**In MDX an Komponenten** — Bild importieren und als Objekt übergeben (`ImageCarousel.images[].src`, `LinkCard.imgSrc`, `RevealImage.imageSrc` akzeptieren importierte Bilder und optimieren sie):

```mdx
import parts1 from "../../../../../assets/images/project01/overview/parts1.jpg";

<ImageCarousel images={[{ src: parts1, alt: "Bauteile" }]} />
```

**Freies HTML in MDX** — `<Image>` aus `astro:assets` verwenden:

```mdx
import { Image } from "astro:assets";
import foto from "../../../../../assets/images/birdnet-live/bn_live_04.jpg";

<Image src={foto} alt="Beschreibung" width={768} class="rounded-lg" />
```

Weitere Regeln:

- **Alt-Text ist Pflicht** (Accessibility). Rein dekorative Bilder: leerer Alt-Text.
- **Niemals** absolute Pfade wie `/schlaumeise/images/…` hartkodieren.
- Raw-HTML-`<img>` in `.md`-Dateien wird nicht optimiert und kann relative Pfade nicht auflösen — solche Seiten nach `.mdx` konvertieren (Slug/URL bleibt gleich).
- Bilder in Doku-Seiten erhalten automatisch Zoom-Funktion (`ZoomableDocsImages`); ausnehmen mit `data-no-zoom`/`not-zoomable`.

## MDX-Bausteine

In `.mdx`-Dateien stehen ohne Import zur Verfügung (registriert in den Catch-all-Routen): `Steps`, `LinkCard`, `Code`, `CodeBlock`, `Terminal`, `Term`. Andere Komponenten (z. B. `ImageCarousel`, `RevealImage`, `HighlightSection`) müssen relativ importiert werden:

```mdx
import ImageCarousel from "../../../../../components/docs/ImageCarousel.astro";
```

Beispiele:

```mdx
<Steps>
1. Erster Schritt
2. Zweiter Schritt
</Steps>

<Terminal title="Raspberry Pi">sudo apt update</Terminal>

<CodeBlock lang="python" title="beispiel.py" showLineNumbers highlight="2">
print("Hallo")
print("Welt")
</CodeBlock>
```

Tastenkombinationen: `<kbd class="kbd">Strg</kbd>+<kbd class="kbd">C</kbd>`.

### Inline-Glossar (`Term`)

Verlinkt einen Fachbegriff im Fließtext mit seinem Glossareintrag; die Kurzdefinition (Frontmatter `definition`, Fallback `description`) erscheint bei Hover/Fokus als Tooltip, Klick führt zur Glossarseite:

```mdx
Öffne die <Term id="console">Konsole</Term>.
Selbstschließend übernimmt der Begriff den Glossar-Titel: <Term id="os" />
```

`id` ist der Dateiname des Glossareintrags ohne Endung (`src/content/docs/<locale>/glossary/<id>.md`); eine unbekannte `id` bricht den Build ab. Fehlt der Eintrag in der aktiven Sprache, fällt die Komponente auf die DE-Version zurück. Konvention: pro Seite nur die erste Erwähnung eines Begriffs auszeichnen.

## Zweisprachigkeit

Deutsche Inhalte: `src/content/docs/de/…` (URL ohne Präfix). Englische Übersetzung: gleiche Pfadstruktur unter `src/content/docs/en/…` (URL mit `/en/`). Solange keine Übersetzung existiert, führt der Sprachumschalter auf dieser Seite ins Leere — Übersetzungen daher möglichst zeitnah nachziehen.

## Checkliste vor dem Commit

- [ ] `title` gesetzt, `description` sinnvoll, `sidebar.order` vergeben
- [ ] Dateiname kebab-case ohne Sonderzeichen
- [ ] Alle Bilder mit Alt-Text
- [ ] Seite im Dev-Server geprüft (Desktop + mobil)
- [ ] Bei neuem Verzeichnis: Navigation in `docs-navigation.ts` ergänzt
