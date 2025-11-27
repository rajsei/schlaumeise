## 1. Kontext & �berblick

- Eigenst�ndige Quiz-Route unter `/quiz` mit Hero, Beta-Badge und Kartenliste aller verf�gbaren Quizze.
- Inhalte kommen aus der Content-Kollektion `src/content/quiz/*.json`, werden alphabetisch sortiert und zeigen Titel, Beschreibung, optional Level und gesch�tzte Dauer sowie die Frageanzahl.
- CTA "Quiz starten" f�hrt zu `/quiz/{slug}/` und l�dt den Quiz-Runner; Fragen wechseln clientseitig ohne Seitenreload.
- Status: Beta, funktionsf�hig mit Feedback- und Auswertungsphase.

## 2. Aktueller Ablauf (UI & Interaktion)

1. **�bersicht:** Kartenliste mit Titel, Beschreibung, Meta-Tags und Button pro Quiz plus Aktionen "Quiz ausw�hlen" (Scrollanker) und "Zur Dokumentation" (Basisroute).
2. **Einstieg:** Quiz-Seite rendert Frage 1 serverseitig inkl. Progress-Navigation (`<nav>` + `<ol>`) und Status-Text `Frage {x} von {n} | {prozent}% abgeschlossen`.
3. **Fragenbeantwortung:** Radiobuttons bei `type: "single"`, Checkboxen bei `type: "multiple"`; Submit-Button bleibt deaktiviert, bis mindestens eine Antwort gew�hlt ist.
4. **Tipp & Feedback:** Tipp-Button klappt ein Panel auf/zu (disabled, wenn kein Tipp existiert). Nach "Antwort pr�fen" erscheinen Status (richtig/falsch), korrekte L�sung(en) und Erkl�rung; das Fieldset wird gesperrt.
5. **Weiter/N�chste Frage:** Weiter-Button springt ohne Seitenwechsel zur n�chsten Frage; Beschriftung wechselt auf der letzten Frage zu "Zur Auswertung". Fortschrittsleiste aktualisiert `aria-current` und Klassen f�r erledigte Schritte.
6. **Auswertung:** Nach der letzten Frage werden Fragebereich und Fortschrittsanzeige eingefroren, eine Zusammenfassung zeigt Score (`Du hast X von N Fragen richtig beantwortet.`) und eine Liste aus `<details>`-Bl�cken mit deiner Antwort, korrekter L�sung, Erkl�rung, optional Tipp sowie Ressourcenlinks (neuer Tab). Link "Zur �bersicht" f�hrt zur�ck nach `/quiz/`.
7. **Fallback:** Ohne JavaScript erscheint ein Hinweis, dass die Auswertung nicht funktioniert; kein serverseitiges Backup vorhanden.

## 3. Datenmodell (Content-Kollektion `quiz`)

- **Dateien:** `src/content/quiz/*.json`; Slug stammt aus Dateiname/Frontmatter (`slug ?? id`).
- **Quiz:** `title` (string), `description` (string), `level?` (string), `estimatedTime?` (string), `questions` (Array, min. 1).
- **Frage:** `id` (string), `prompt` (string), `description?` (string), `type` (`"single"` | `"multiple"`, Default single), `tip?` (string), `explanation` (string), `resources?` (Array `{ label, href }`), `answers` (Array, min. 2).
- **Antwort:** `id` (string), `text` (string), `correct` (boolean).
- Auswertung pr�ft exakte �bereinstimmung: Bei Multiple-Choice m�ssen alle korrekten Optionen gew�hlt sein, keine zus�tzlichen.

## 4. Barrierefreiheit & UI-Zust�nde

- Fortschritt als `<nav aria-label="Fortschrittsanzeige">` mit SR-Hinweis und `aria-current="step"` auf dem aktiven Schritt; Status-Text ist `aria-live="polite"`.
- Fragenbereich und Auswertung nutzen ebenfalls `aria-live="polite"` f�r Statusmeldungen.
- Buttons nutzen `disabled`-Zust�nde; Eingaben bleiben nach Auswertung gesperrt.
- Tipp-Panel wird per Button sichtbar/unsichtbar; Summary nutzt `<details>/<summary>` mit Status-Badges f�r richtig/falsch.
- Fortschrittsleiste ist nicht sticky; bei vielen Fragen erm�glicht horizontales Scrollen die Tastatur-/Screenreader-Nutzung.

## 5. TODO / Geplante L�cken

- Globalen Header-Link "Quiz" nach UI-Spezifikation verankern (derzeit nur Route vorhanden).
- Weitere Fragetypen (z. B. Freitext, Reihenfolge) und partielle Punktebewertung f�r Multiple-Choice.
- Shuffle/Randomisierung von Fragen/Antworten pro Durchlauf sowie Option zum Neustart.
- Persistenz & Wiederaufnahme (Local Storage) sowie Analytics-Events (Start, Tipp, Antwort, Abbruch, Abschluss).
- Barrierefreier No-JS-Fallback oder serverseitige Auswertung bereitstellen.
