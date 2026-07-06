# Commit-Konvention (Schlaumeise)

Ziel: sinnvolle, durchsuchbare Historie. Wir nutzen **Conventional Commits**.

## Format

```
<type>(<scope>): <beschreibung>

[optionaler body: was & warum]

[optionaler footer: BREAKING CHANGE / Refs]
```

Regeln für die Betreffzeile:

- Imperativ, Gegenwart: „füge …", „behebe …" — nicht „hinzugefügt".
- klein, kein Punkt am Ende, Ziel ≤ 50 Zeichen.
- Test: „Wenn angewendet, wird dieser Commit **<betreff>**".

## Types

| type       | wofür                                                        |
|------------|--------------------------------------------------------------|
| `feat`     | neues Feature (sichtbar für Nutzer)                          |
| `fix`      | Bugfix                                                        |
| `content`  | Inhalte: Vogeltexte, Doku-Seiten, Bilder, Audio             |
| `i18n`     | Übersetzungen / Locale-Strings                              |
| `a11y`     | Barrierefreiheit                                            |
| `style`    | Formatierung/CSS ohne Logikänderung                         |
| `refactor` | Umbau ohne Verhaltensänderung                               |
| `perf`     | Performance                                                  |
| `test`     | Tests                                                        |
| `docs`     | Projekt-Doku (README, AGENTS.md, dieses File)               |
| `build`    | Astro-Build, package.json, Abhängigkeiten                   |
| `ci`       | GitHub Actions, Hooks, Lint-Workflows                       |
| `chore`    | Kleinkram ohne Produktbezug                                 |
| `revert`   | macht einen früheren Commit rückgängig                      |

## Scopes (aus deiner Struktur)

`components` · `pages` · `content` · `i18n` · `quizzes` · `audio`
`lib` · `styles` · `config` · `scripts` · `ci` · `deps` · `docs`

Scope ist optional, aber hilfreich. Ein Commit = eine logische Änderung.

## Blueprints

Feature:
```
feat(quizzes): füge Vogelstimmen-Quiz mit Audio-Playback hinzu
```

Bugfix mit Kontext:
```
fix(i18n): korrigiere fehlenden EN-Fallback für Quiz-Titel

Fehlende Keys fielen auf den rohen Schlüssel zurück statt auf DE.
Nun greift der Locale-Fallback DE → EN sauber.

Closes: #42
```

Inhalt / neuer Vogel:
```
content(birds): ergänze Amsel-Steckbrief samt Spektrogramm
```

Refactor ohne Verhaltensänderung:
```
refactor(lib): extrahiere Audio-Decoder in eigenes Modul
```

Build / Abhängigkeit:
```
build(deps): aktualisiere astro auf 5.16.12
```

CI / Hooks:
```
ci: erzwinge Farb-Lint im pre-commit-Hook
```

Breaking Change:
```
feat(config): stelle Locale-Routing auf [locale]-Segment um

BREAKING CHANGE: alte /en/* URLs brauchen Redirects.
```

## Vorlage aktivieren

Einmalig, damit `git commit` die Vorlage vorlädt:

```
git config commit.template .gitmessage
```

## Anti-Patterns

- „update", „fixes", „stuff", „wip" als ganze Nachricht → nichtssagend.
- Zehn unabhängige Änderungen in einem Commit → lieber aufteilen.
- Vergangenheitsform / Punkt am Ende / SCHREIEN.
