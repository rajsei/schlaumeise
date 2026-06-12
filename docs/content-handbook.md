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
prev: false                   # optional — „Zurück“-Link unterdrücken
next:                         # optional — „Weiter“-Link überschreiben
  link: projects/project01
  label: Zum Projekt
---
```

Nur diese Felder sind erlaubt. Neue Felder müssen zuerst in `src/content.config.ts` (Zod-Schema) und `src/types/docs.ts` ergänzt werden — unbekannte Felder werden sonst stillschweigend verworfen.

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

In `.mdx`-Dateien stehen ohne Import zur Verfügung (registriert in den Catch-all-Routen): `Steps`, `LinkCard`, `Code`, `CodeBlock`, `Terminal`. Andere Komponenten (z. B. `ImageCarousel`, `RevealImage`, `HighlightSection`) müssen relativ importiert werden:

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

## Zweisprachigkeit

Deutsche Inhalte: `src/content/docs/de/…` (URL ohne Präfix). Englische Übersetzung: gleiche Pfadstruktur unter `src/content/docs/en/…` (URL mit `/en/`). Solange keine Übersetzung existiert, führt der Sprachumschalter auf dieser Seite ins Leere — Übersetzungen daher möglichst zeitnah nachziehen.

## Checkliste vor dem Commit

- [ ] `title` gesetzt, `description` sinnvoll, `sidebar.order` vergeben
- [ ] Dateiname kebab-case ohne Sonderzeichen
- [ ] Alle Bilder mit Alt-Text
- [ ] Seite im Dev-Server geprüft (Desktop + mobil)
- [ ] Bei neuem Verzeichnis: Navigation in `docs-navigation.ts` ergänzt
