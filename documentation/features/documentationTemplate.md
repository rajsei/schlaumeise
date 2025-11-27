# Template: Funktions- und Teilprojekt-Dokumentation

Diese Vorlage strukturiert Funktions- oder Teilprojekt-Dokumentationen außerhalb von `src/content/docs/`. Sie ist als Markdown-Datei gedacht und lässt sich bei Bedarf nach Starlight migrieren. Der Inhalt daf nicht gelöscht werden!

## 1. Kontext & Überblick

- **Zweck:** Kurzbeschreibung des Features mit Nutzenversprechen und aktuellem Status.
- **Typischer Inhalt:** Elevator Pitch, Bezug zu Produkt-Roadmap, Status-Chip (z. B. Geplant, In Arbeit, Live).

> _Mini-Beispiel (Quiz):_ „Quiz-Feature zur Wissensüberprüfung direkt nach Fachartikeln. MVP in Sprint 12 geplant.“

## 2. Projektdetails

| Feld        | Beschreibung      | Beispiel     |
| ----------- | ----------------- | ------------ |
| Teilprojekt | Name oder Kennung | Quiz-Feature |
| Start       | Startdatum        | 01.03.2024   |

## 3. Stakeholder & Ziele

- **Stakeholderliste:** Rollen, Sichten
- **Ziele:** SMART formulieren, KPIs oder qualitative Erfolgsindikatoren.

## 4. User Stories & Akzeptanzkriterien

- **Format:** „Als … möchte ich …, damit …“
- **Akzeptanzkriterien:** Bullet-Liste oder Tabelle, klar prüfbar.

## 5. Anforderungen

| ID  | Typ              | Beschreibung                             | Priorität | Status | Owner  |
| --- | ---------------- | ---------------------------------------- | --------- | ------ | ------ |
| QF1 | Funktional       | Quiz zieht Fragen aus Content-Collection | Hoch      | Offen  | Dev    |
| QN1 | Nicht-funktional | Antwortzeit ≤1 s pro Frage               | Mittel    | Offen  | DevOps |

## 6. Technische Randbedingungen

- Stack, notwendige Integrationen, Datenquellen.
- Design- und Barrierefreiheitsvorgaben (z. B. Kontrast ≥4,5:1, Tastatursteuerung).

## 7. Abhängigkeiten & Risiken

| Thema             | Typ          | Beschreibung                   | Auswirkung | Maßnahme                    |
| ----------------- | ------------ | ------------------------------ | ---------- | --------------------------- |
| Fragen-API        | Abhängigkeit | Benötigt neue Endpunkte        | Hoch       | Backend-Sprint priorisieren |
| Content-Lieferung | Risiko       | Quiz braucht geprüften Content | Mittel     | Redaktionsplan abstimmen    |

## 8. Statusverlauf & Timeline

| Datum    | Ereignis                | Statuswechsel       | Kommentar               |
| -------- | ----------------------- | ------------------- | ----------------------- |
| 05.03.24 | Kick-off Workshop       | Geplant → In Arbeit | Anforderungen bestätigt |
| 19.03.24 | UX-Prototyp freigegeben | In Arbeit           | Ready für Dev           |

## 9. Offene Punkte & Entscheidungen

- **Offen:** Beschreibung, verantwortliche Person.
- **Decision Log:** Datum, Entscheidung, Begründung, Auswirkungen.

## 10. Anhänge & Referenzen

- Links zu Tickets, Design-Files, Datenquellen, Tests.
- Assets relativ referenzieren (z. B. `../assets/quiz-flow.png`).

---

### Nutzungshinweise

- Kopiere diese Datei nach `documentation/features/<feature>/index.md` oder teile sie in mehrere Dateien auf.
- Ergänze Frontmatter nur, wenn ein Generator dies benötigt; ansonsten frei lassen.
- Aktualisiere Abschnitt 8 bei jeder Änderung und verlinke neue Entscheidungen in Abschnitt 9.
