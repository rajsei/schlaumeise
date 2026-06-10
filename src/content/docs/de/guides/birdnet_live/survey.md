---
title: Survey
description: Eine Survey ist ein routenbasierter Aufnahme-Modus für längere Erfassungen in Bewegung, z. B. entlang einer Route.
sidebar:
  order: 2
---


<div class="hero bg-base-200 min-h-screen">
  <div class="hero-content flex-col lg:flex-row">
    <img
      src="/schlaumeise/images/birdnet-live/bn_live_04.jpg"
      class="max-w-sm rounded-lg shadow-2xl not-zoomable"
    />
    <div>
      <h1 class="text-5xl font-bold">Box Office News!</h1>
      <p class="py-6">
        Provident cupiditate voluptatem et in. Quaerat fugiat ut assumenda excepturi exercitationem
        quasi. In deleniti eaque aut repudiandae et a id nisi.
      </p>
      <button class="btn btn-primary">Get Started</button>
    </div>
  </div>
</div>


BirdNET Live ist dein Begleiter für unterwegs, nimm während deiner Spaziergänge die Vögel entlang deiner Route auf.

<div role="alert" class="alert">
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-info h-6 w-6 shrink-0">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
  </svg>
  <span>Survey ist englisch und entspricht einer übersetzung wie Erfassung, Erhebung oder Untersuchung.</span>
</div>

## 1. Survey Mode öffnen

1. Öffne die **BirdNET Live App**.
2. Gehe zur **Startseite**.
3. Tippe auf die Schaltfläche **Survey**.

---

## 2. Setup-Assistent ausfüllen

Die Survey wird über einen **Assistenten mit fünf Schritten** eingerichtet.

### Schritt 1: Details eintragen

Trage die Grunddaten der Survey ein:

- **Name der Survey**
- **Transekt-ID**
- **Name der beobachtenden Person**
- **Startort**

Beim Startort kannst du wählen zwischen:

- GPS-Position
- manuell eingegebenen Koordinaten
- keinem Startort

Falls nötig, zeigt die App hier auch eine Kartenauswahl und Hinweise zu GPS-Berechtigungen im Hintergrund an.

---

### Schritt 2: Parameter festlegen

Stelle die technischen Aufnahme- und Erkennungsparameter ein:

- **Mikrofon auswählen**
- **Inferenzrate festlegen**
- **Konfidenzschwelle einstellen**
- **GPS-Intervall bestimmen**
- **maximale Dauer festlegen**
- **Aufnahmemodus auswählen**
- **Clip-Kontext für Detection-only-Aufnahmen festlegen**
- **Detection-Sampling-Modus auswählen**
- optional: **Top-N-Grenze pro Art** festlegen

### Detection Sampling wählen

Detection Sampling steuert, welche **Audioclips** gespeichert werden. Die eigentlichen Detektionsdaten bleiben immer erhalten. Nur bei gelöschten Audiodaten gibt es später keinen abspielbaren Clip im Session Review.

| Modus | Bedeutung | Geeignet für |
| --- | --- | --- |
| **All** | Jeder Clip wird gespeichert. | kurze Surveys oder vollständige Nachanalyse |
| **Top N** | Nur die N besten Clips pro Art werden behalten. | längere Surveys mit begrenztem Speicher |
| **Smart** | Wie Top N, zusätzlich räumlich verteilt. Ähnliche Detektionen am selben Ort werden reduziert. | längere Transekte, weniger Dopplungen |

Bei **Top N** ist der Standardwert **10 Clips pro Art**, einstellbar von **1 bis 50**. Die Grenze gilt pro Art, nicht global.

---

### Schritt 3: Artenwarnungen einstellen

Lege fest, ob die App während der Survey Benachrichtigungen ausgeben soll. Mögliche Modi:

- **Aus**: keine Warnungen, Standard
- **Zuerst in der Sitzung**: Warnung beim ersten Auftreten jeder Art in dieser Survey
- **Erstmals / First ever**: Warnung, wenn die Art erstmals in allen bisherigen Sitzungen erkannt wird
- **Selten für diesen Standort**: Warnung bei Arten mit geringer Standort-Wahrscheinlichkeit
- **Beobachtungsliste / Watchlist**: Warnung nur für Arten auf einer eigenen Liste

Zusätzlich gibt es eine **Mindestkonfidenz** für Warnungen. Diese kann nicht empfindlicher sein als die Detektionsschwelle der Survey. Beim ersten Aktivieren eines Warnmodus fragt Android nach der Benachrichtigungsberechtigung.

---

### Schritt 4: Feldtipps prüfen

Lies die kurze **Checkliste vor dem Start**. Diese dient als letzte Kontrolle vor der Aufnahme.

Sinnvoll prüfen:

- Mikrofon korrekt angeschlossen
- GPS aktiv
- ausreichend Akku
- genügend Speicherplatz
- Umgebung möglichst ruhig
- Startpunkt des Transekts erreicht

---

### Schritt 5: Konfiguration prüfen und Survey starten

Auf dem **Fertig-/Ready-Bildschirm** zeigt die App eine Zusammenfassung der aktiven Survey-Konfiguration. Prüfe die Einstellungen und starte danach die Survey.

---

## 3. Live Survey überwachen

Während der Survey zeigt das Dashboard:

- eine **Routenkarte mit Detektionen**
- ein **Spektrogramm**
- eine **Statistikansicht mit Artenaufschlüsselung**
- eine Liste der **letzten Detektionen**

Oben findest du außerdem:

- Survey beenden
- verstrichene Zeit
- Hilfe öffnen
- Survey-Einstellungen öffnen

Durch Tippen auf eine Detektion öffnest du Details zur Art.

---

## 4. Survey im Hintergrund laufen lassen

Während der Aufnahme bleibt eine dauerhafte Android-Benachrichtigung sichtbar, damit Android die Audiopipeline nicht stoppt. Diese zeigt u. a.:

- verstrichene Zeit
- Anzahl der Detektionen
- Anzahl der Arten
- zurückgelegte Strecke
- die drei jüngsten einzigartigen Arten mit Konfidenz und Zeitangabe

---

## 5. Survey beenden und auswerten

1. Tippe im Live-Dashboard auf **Survey beenden**.
2. Die App speichert die fertige Survey.
3. Danach öffnet BirdNET Live automatisch den **Session Review**.

Dort kannst du die Detektionen später prüfen, anhören und auswerten.