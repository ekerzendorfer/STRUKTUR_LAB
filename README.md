# STRUKTUR-LAB

**Version:** v0.1.4 – Butanol-Fälle und MS-Fragment-Lernhilfe  
**Projekt:** CHEMIE mit KI – Digitales Analytiklabor

Browserbasierte Lernumgebung zur schrittweisen Strukturaufklärung mit molarer Masse, EI-Massenspektrum, IR und ¹H-NMR.

## Leitprinzip

STRUKTUR-LAB ist **kein universeller Spektrensimulator**. Die App verwendet sorgfältig kuratierte Unterrichtsfälle und zeichnet daraus reproduzierbare Spektren.

## v0.1.0

- Basismodus: Summenformel wird angegeben
- Expertenmodus: nur molare Masse zu Beginn
- gestufter Analyseweg: M → MS → IR → ¹H-NMR → Stoffklasse → Strukturhypothese
- Methoden-Werkzeugkasten zu Elementaranalyse, MS, IR und NMR
- optionale IR-Funktionsgruppenbereiche und Fingerprintbereich
- optionale NMR-Orientierungsbereiche
- zentrales Analysejournal
- Stoffklassenwahl mit evidenzbasierter Rückmeldung
- Strukturkarten statt primärer Freitexteingabe
- Namenszuordnung nach richtiger Strukturhypothese
- Referenzvergleich erst nach bestätigter Hypothese
- drei vollständige Testfälle: Ethanol, Dimethylether, Ethylacetat
- Datenmodell für acht Startstoffe vorbereitet

## Geplante acht Stoffe

1. Ethanol
2. Dimethylether
3. Aceton
4. Ethylacetat
5. 1-Butanol
6. 2-Butanol
7. Toluol
8. Salicylsäure

## Noch nicht in v0.1.0

- Analytik-Hub/GC-Peak-Adapter
- vollständige Spektrensätze für die restlichen fünf Stoffe
- NMR-Signal ↔ Protonengruppe-Zuordnungsübung
- GC-Referenzstandard-Rückweg
- Moleküllabor-Link

## Lokaler Test

```powershell
py -m http.server 8000
```

Dann `http://localhost:8000/` öffnen.


## v0.1.1

- Bugfix für die Darstellung austauschbarer OH-Protonen im ¹H-NMR
- breites Singulett erhält eine Mindesthöhe und breitere Visualisierung
- linke Zeichenfläche des NMR-Canvas leicht vergrößert
- Ethanol-OH didaktisch als klar getrenntes breites Signal bei ca. 2,10 ppm dargestellt


## v0.1.2

- NMR-Signalchips zeigen jetzt direkt δ-Wert, Integral und Multiplizität
- zusätzliche kompakte Anzeige des relativen Integralmusters
- Strukturkarten grafisch überarbeitet: klarere 2D-Darstellung, größere Abstände, weniger Überlagerung von Bindungen und Gruppenbezeichnungen


## v0.1.3

- echter Referenzvergleich nach bestätigter Strukturhypothese und Namenszuordnung
- Umschaltung zwischen MS, IR und ¹H-NMR
- unbekanntes Spektrum durchgezogen, bestätigte Referenz gestrichelt überlagert
- Trial-and-Error-Schutz bleibt erhalten: Referenzvergleich ist vorher nicht zugänglich
- IR-Funktionsgruppenbeschriftungen oberhalb der Spektrenbaseline positioniert
- Bindungsstriche der Strukturkarten feiner und zurückhaltender dargestellt

Der Referenzvergleich stützt die spektroskopische Strukturhypothese. Im späteren Analytik-Hub bleibt die endgültige Identitätsbestätigung dem gezielten GC-Referenzstandard bzw. der Aufstockung vorbehalten.


### v0.1.3 – Kandidatenvergleich & Protonengruppen

- der bisherige reine Referenzvergleich wurde zum retrospektiven **Kandidatenvergleich** erweitert
- nach festgelegter Lösung können alternative Strukturkandidaten mit dem unbekannten MS-, IR- und ¹H-NMR-Spektrum verglichen werden
- nicht vollständig kuratierte Kandidaten bleiben sichtbar, sind aber im Spektrenvergleich deaktiviert
- Protonengruppen-Zuordnung für Ethanol, Dimethylether und Ethylacetat
- NMR-Signal auswählen → passende H-Gruppe in der 2D-Struktur anklicken
- nach korrekter Zuordnung kurze fachliche Erklärung zu δ, Integral und Multiplizität


## v0.1.4

- 1-Butanol und 2-Butanol vollständig kuratiert: M, EI-MS, IR, ¹H-NMR, Stoffklassenfeedback und Protonengruppen
- neue Fälle Unbekannt D und E zum Vergleich primärer und sekundärer Alkohole
- MS-Werkzeugkasten erklärt nun ausdrücklich: detektiert werden geladene Ionen, neutrale Fragmente nicht
- neue MS-Fragment-Lernhilfe nach gelöster Struktur
- bewusst nur wenige diagnostische Peaks werden erklärt
- 1-Butanol: Molekülion m/z 74, α-Spaltung m/z 31, Dehydratisierung m/z 56
- 2-Butanol: Molekülion m/z 74 sowie die beiden α-Spaltungsfragmente m/z 45 und 59
- Klick auf Peak oder Peak-Chip hebt den Peak hervor und zeigt Ionenformel, Fragmentierungsweg und kurze Erklärung

Die Fragmentzuordnung ist eine kuratierte Lernhilfe und kein universeller Fragmentierungsalgorithmus.
