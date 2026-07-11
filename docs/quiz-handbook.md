# Quiz-Handbuch

Architektur und Datenformat des Quizsystems. **Status: Datenmodell umgesetzt, UI-Komponenten geplant** (siehe features.md / roadmap.md).

## Architekturentscheidung: Datenhaltung

| Option | Bewertung |
| --- | --- |
| **JSON + Zod-Schema (gewählt)** | Strukturierte, validierbare Daten; von Menschen und KI-Agenten gleichermaßen gut zu erzeugen; build-seitige Validierung verhindert kaputte Quizze in Produktion; seit 2026-07-11 ohne Formatänderung als Content Collection (`glob()`-Loader) eingebunden. |
| Markdown/MDX pro Quiz | Gut für Fließtext, schlecht für strukturierte Antwort-/Auswertungslogik; Parsing fehleranfällig. Markdown bleibt das Format für *Lerninhalte*, nicht für Quizdaten. |
| Astro-/TS-Dateien | Maximale Typsicherheit, aber Redaktion bräuchte Programmierkenntnisse; Inhalte und Code vermischt. |
| Hybrid | Quiz-JSON kann per `relatedDoc` auf Lernseiten verweisen — Inhalte bleiben Markdown, Fragen bleiben Daten. So umgesetzt. |

## Dateien

```text
src/data/quizzes/<locale>/<quiz-id>.json   # Quizdaten (id = Dateiname)
src/lib/quiz-schema.ts                     # Zod-Schema + abgeleitete TS-Typen
src/lib/quizzes.ts                         # Zugriffs-Helfer auf die quizzes-Collection
src/content.config.ts                      # quizzes-Collection (glob()-Loader) + Build-Validierung
```

Beispiel mit allen Fragetypen: `src/data/quizzes/de/voegel-basiswissen.json`.

## Quiz-Format

```jsonc
{
  "id": "voegel-basiswissen",     // kebab-case, = Dateiname
  "version": 1,                    // Schemaversion (für Migrationen)
  "locale": "de",
  "title": "Vögel-Basiswissen",
  "description": "…",              // optional
  "topicId": "knowledge",          // optional, Themenbereich
  "relatedDoc": "knowledge/birds", // optional, Lernseite
  "shuffleQuestions": false,
  "questions": [ /* … */ ]
}
```

## Fragetypen

Gemeinsame Felder jeder Frage: `id`, `type`, `prompt`, optional `media`, `explanation` (wird nach dem Beantworten gezeigt), `relatedDoc`.

| `type` | Zusätzliche Felder | Abdeckung |
| --- | --- | --- |
| `single-choice` | `options[]`, `correctOptionId` | Single Choice; mit `media` auch Bild-/Audiofrage |
| `multiple-choice` | `options[]`, `correctOptionIds[]` | Multiple Choice |
| `true-false` | `correctAnswer` (boolean) | Wahr/Falsch |
| `ordering` | `items[]`, `correctOrder[]` | Reihenfolgen |
| `matching` | `pairs[]` (`{id, left, right}`) | Zuordnungsaufgaben |

**Medien** (`media` an Frage oder Option): `{ "type": "image"|"audio", "src": "birds/bluejay.jpg", "alt": "…" }`. `src` ist relativ zu `src/assets/`; `alt` ist Pflicht (Bildbeschreibung bzw. Audio-Hinweis für Screenreader). Bildfragen = Frage/Option mit `image`-Medium, Audiofragen = `audio`-Medium.

## Validierung

Die `quizzes`-Collection (`src/content.config.ts`) validiert beim Build jede Datei gegen das Zod-Schema **und** auf referentielle Konsistenz (`validateQuizIntegrity` via `superRefine`: existieren alle referenzierten Options-/Item-IDs?). Fehler brechen den Build mit Datei- und Feldangabe ab. Zugriff über `getAllQuizzes()`/`getQuizzesForLocale()`/`getQuizById()` in `src/lib/quizzes.ts` (async).

## Geplante Komponenten

| Komponente | Aufgabe |
| --- | --- |
| `QuizPlayer.astro` | Container/Insel: lädt Quiz, steuert Ablauf, Auswertung, Fortschritt |
| `QuizQuestion.astro` | Dispatcher: rendert je `type` die passende Fragekomponente |
| `SingleChoiceQuestion` / `MultipleChoiceQuestion` / `TrueFalseQuestion` / `OrderingQuestion` / `MatchingQuestion` | Je ein Fragetyp, gekapselt |
| `QuizMedia.astro` | Bild/Audio-Wiedergabe inkl. Asset-Auflösung (`import.meta.glob` über `src/assets/`) |
| `QuizProgress.astro` | Fortschrittsanzeige im Quiz |
| `QuizResult.astro` | Auswertung, Erklärungen, Link zur Lernseite (`relatedDoc`) |

Routen: `src/pages/quiz/[id].astro` (+ `[locale]`-Variante) über `getStaticPaths` aus `getQuizzesForLocale()`.

## Fortschritt

Phase 1 (lokal): `localStorage` unter Schlüssel `schlaumeise:quiz-progress:v1`, Form `{ [quizId]: { completedAt, score, answers } }` — versioniert, damit spätere Formatwechsel migrierbar sind. Phase 2 (optional): Export/Import als Datei für Workshops ohne Accounts. Phase 3 (Vision): Server-Sync mit Accounts. Die Versionierung in Schlüssel und Quiz (`version`) hält alle Wege offen.

## Erweiterung

**Neuer Fragetyp:** 1) Schema in `quiz-schema.ts` ergänzen (neues Objekt + in `quizQuestionSchema`-Union aufnehmen, ggf. Integritätsprüfung), 2) Fragekomponente bauen, 3) im `QuizQuestion`-Dispatcher registrieren, 4) hier dokumentieren, 5) Beispielfrage ins Beispiel-Quiz. Bestehende Quizdaten bleiben durch die diskriminierte Union unberührt.

**Neues Quiz:** JSON-Datei nach Schema anlegen — mehr nicht. Validierung läuft automatisch beim Build.
