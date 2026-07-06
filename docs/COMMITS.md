# Commit-Konvention (Schlaumeise)

Ziel: sinnvolle, durchsuchbare Historie. Wir nutzen **Conventional Commits**.

## Format

```
<type>(<scope>): <beschreibung>

[optionaler body: was & warum]

[optionaler footer: BREAKING CHANGE / Refs]
```

Regeln für die Betreffzeile:

- **Sprache: Englisch.** Alle Commit-Messages (Betreff und Body) werden auf Englisch geschrieben.
- Imperativ, Gegenwart: „add …", „fix …" — nicht „added".
- klein, kein Punkt am Ende, Ziel ≤ 50 Zeichen.
- Test: „If applied, this commit will **<subject>**".

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
feat(quizzes): add bird call quiz with audio playback
```

Bugfix mit Kontext:
```
fix(i18n): fix missing EN fallback for quiz titles

Missing keys fell back to the raw key instead of DE.
The locale fallback DE → EN now works correctly.

Closes: #42
```

Inhalt / neuer Vogel:
```
content(birds): add blackbird profile with spectrogram
```

Refactor ohne Verhaltensänderung:
```
refactor(lib): extract audio decoder into separate module
```

Build / Abhängigkeit:
```
build(deps): update astro to 5.16.12
```

CI / Hooks:
```
ci: enforce color lint in pre-commit hook
```

Breaking Change:
```
feat(config): switch locale routing to [locale] segment

BREAKING CHANGE: old /en/* URLs need redirects.
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
