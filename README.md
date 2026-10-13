# STRUKTUR-LAB

**Version:** v0.3.1 – optionale Expertenpfade ohne Voranalyse bzw. Elementaranalyse  
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


## v0.1.5 – Spektrenwerkstatt

Die nach der gelösten Struktur bisher getrennten Blöcke für MS-Fragmentdiagnose, NMR-Protonengruppen und Kandidatenvergleich wurden zu einer gemeinsamen **Spektrenwerkstatt** zusammengeführt.

Bedienung:
- Methodenreiter: **MS | IR | ¹H-NMR**
- Arbeitsmodus: **Lernen / Diagnose | Kandidatenvergleich**
- ein gemeinsames Spektrenfenster für alle Methoden

Lernen / Diagnose:
- MS: diagnostische Fragmentpeaks anklicken und Fragmention/Fragmentierungsweg erklären
- IR: Funktionsgruppen- und Fingerprintbereiche im selben Fenster ein-/ausblenden
- ¹H-NMR: Signalchips und Protonengruppen bidirektional hervorheben; das aktive Signal wird zusätzlich im Spektrum hervorgehoben

Kandidatenvergleich:
- alternative Struktur aus dem aktuellen Fall auswählen
- gewähltes Referenzspektrum gestrichelt über das unbekannte Spektrum legen
- Umschaltung zwischen MS, IR und ¹H-NMR ohne Wechsel des Arbeitsbereichs

Die ursprüngliche Analysefolge M → MS → IR → ¹H-NMR → Hypothese bleibt unverändert. Die Spektrenwerkstatt ist die gemeinsame Vertiefungs- und Vergleichsebene nach bestätigter Struktur.


## v0.2.0 – GC-Peak aus dem Analytik-Hub

Der Single-Mode bleibt unverändert. Ein Aufruf mit `?bridge=1&run=...` aktiviert den Hub-Modus.

Im Hub-Modus:
- stammt der Auftrag aus einem konkreten GC-RESULT und einer konkreten Peak-ID
- werden GC-Result-ID und Peak-ID technisch über die Bridge referenziert
- bleibt die wahre Peak-Identität im SchülerInnen-UI verborgen
- wird der passende kuratierte Strukturfall intern gewählt
- verwendet der VCÖ-01-Workflow zunächst den Basismodus mit Summenformelhilfe
- wird `Hypothese an Hub übergeben` erst nach korrekter Struktur- und Namenszuordnung aktiv
- das zurückgegebene RESULT erhält `identity_status: supported`, nicht `confirmed`
- die endgültige Bestätigung ist ausdrücklich dem späteren gezielten GC-Referenzstandard vorbehalten


## v0.2.1 – Feintuning

- Ethylacetat erhält eine kuratierte MS-Fragment-Lernhilfe
- diagnostische Lehrpeaks: Molekülion m/z 88, Acylfragment CH₃CO⁺ bei m/z 43, Ethoxyfragment C₂H₅O⁺ bei m/z 45
- bewusst keine vollständige Zuordnung aller Nebenpeaks
- Carbonyl-Doppelbindungen bei Ethylacetat und Aceton geometrisch überarbeitet: beide Linien beginnen optisch am Carbonyl-C und verschmelzen nicht mehr mit benachbarten Einfachbindungen


## v0.2.2 – Salicylsäure

- Salicylsäure vollständig als fortgeschrittener Strukturfall kuratiert
- M = 138 ± 1; EI-MS mit Hauptpeaks m/z 138, 120 und 92
- m/z 120 als didaktisch besonders wertvoller Wasserverlust der ortho-Hydroxycarbonsäure
- IR mit Carbonsäure-OH, phenolischer OH, C=O und aromatischen Ringmerkmalen
- ¹H-NMR mit vier unterschiedlichen aromatischen Protonen sowie zwei bewusst als variabel gekennzeichneten austauschbaren OH-Signalen
- Strukturvergleich zwischen 2-, 3- und 4-Hydroxybenzoesäure
- neuer Hub-Modus `solid_screening`: Vorbefunde aus der klassischen Feststoffanalyse werden sichtbar als Startwissen übernommen
- die Vorbefunde verraten keinen Stoffnamen; die Stellung der Gruppen muss instrumentell begründet werden
- nach gestützter Salicylsäure-Hypothese ist als nächster Bestätigungsschritt ein Schmelz-/Mischschmelzpunkt vorgesehen, nicht GC


## v0.2.3 – vollständiger Hydroxybenzoesäure-Vergleich

- 3- und 4-Hydroxybenzoesäure besitzen nun vollständige kuratierte MS-, IR- und ¹H-NMR-Datensätze
- dadurch sind beide Isomere in der Spektrenwerkstatt wirklich auswählbar
- 3-Hydroxybenzoesäure: vier verschiedene aromatische 1H-Signale; EI-MS mit M⁺ bei m/z 138 als Basispeak
- 4-Hydroxybenzoesäure: para-Symmetrie mit zwei aromatischen 2H-Dubletts; EI-MS mit m/z 121 als Basispeak
- alle drei Hydroxybenzoesäure-Strukturkarten verwenden einen Aromaten-Kreis statt gezeichneter alternierender Doppelbindungen
- ¹H-NMR-Achse erweitert sich bei stark tieffeldverschobenen Carboxylprotonen automatisch bis 14 ppm


## v0.2.4 – Originalspektrum im Kandidatenvergleich ausblendbar

- im Kandidatenvergleich kann das unbekannte Originalspektrum optional ausgeblendet werden
- der gewählte Kandidat bleibt als gestricheltes Referenzspektrum sichtbar
- Einstellung gilt für MS, IR und ¹H-NMR und wird im lokalen Zustand gespeichert
- besonders bei dicht liegenden aromatischen ¹H-NMR-Signalen verbessert das die Lesbarkeit


## v0.2.5 – Hypothesen-Gating

- Strukturkandidaten werden erst sichtbar, wenn die korrekte Stoffklasse gewählt wurde.
- Bei falscher bzw. nachträglich geänderter Stoffklasse werden eine bereits gewählte Struktur, Namensbestätigung und Spektrenwerkstatt-Freigabe zurückgesetzt.
- Dadurch verraten insbesondere Fälle mit sehr ähnlichen Kandidaten (z. B. Hydroxybenzoesäure-Isomere) die Stoffklasse nicht mehr vorzeitig.
- Das bisherige Einzelauswahlsystem für Stoffklassen bleibt bewusst unverändert; Mehrfachauswahl für multifunktionelle Stoffe ist als späterer Ausbau vorgesehen.


## v0.2.6 – Elementaranalyse im Expertenmodus

Im Expertenmodus wird die Summenformel nicht mehr nur ausgeblendet, sondern muss in Phase 1 aus einer kleinen Elementaranalyse erschlossen werden.

Ablauf:
- experimentell bestimmte molare Masse liegt vor,
- Elementaranalyse liefert C- und H-Massenanteile; O wird im didaktischen Modell aus der Differenz bestimmt,
- Lernende ermitteln aus 100 g Probe die Verhältnisformel,
- nach korrekter Verhältnisformel wird deren molare Masse angezeigt,
- anschließend wird der ganzzahlige Faktor `n = M / M(Verhältnisformel)` bestimmt,
- erst danach wird die Summenformel freigeschaltet,
- MS wird im Expertenmodus erst nach diesem Schritt zugänglich.

Im Basismodus bleibt die Summenformel wie bisher von Beginn an sichtbar.

Beispiel Ethylacetat:
- Elementaranalyse führt zu `C2H4O`,
- `M(C2H4O) ≈ 44,05 g·mol⁻¹`,
- experimentell `M ≈ 88 g·mol⁻¹`,
- daraus `n = 2`,
- Summenformel `C4H8O2`.

Bei Hub-Aufrufen wird die Elementaranalyse im Expertenmodus als eigene Methode `ELEMENTAL_ANALYSIS` im RESULT dokumentiert. Die Summenformel erhält die Herkunft `elemental_analysis_plus_molar_mass`.


## v0.3.0 – Spektrenauswertung ohne vorab bekannte Summenformel

Im Expertenmodus ist die Elementaranalyse jetzt optional.

Nach der experimentell bestimmten molaren Masse können Lernende zwischen zwei Wegen entscheiden:
- **Elementaranalyse durchführen** → Verhältnisformel und Faktor n bestimmen → Summenformel erschließen
- **Ohne Elementaranalyse weiter** → MS wird direkt freigegeben, die Summenformel bleibt während der Spektrenauswertung unbekannt

Für den Skip-Pfad gilt:
- vor der Freigabe von MS muss ein kurzer Befund zur molaren Masse dokumentiert werden
- die Summenformel wird nicht intern als Hilfsinformation eingeblendet
- MS, IR und ¹H-NMR werden ohne vorgegebene Summenformel interpretiert
- nach korrekt gelöster Struktur darf die Summenformel selbstverständlich aus der bestätigten Strukturhypothese abgeleitet werden
- das Analysenjournal dokumentiert den bewussten Verzicht

RESULT-Provenienz:
- mit vollständiger Elementaranalyse: `formula_source: "elemental_analysis_plus_molar_mass"`
- ohne Elementaranalyse: `formula_source: "structure_hypothesis_without_prior_formula"`
- `elemental_analysis_skipped: true` wird zusätzlich in der studentischen Interpretation dokumentiert

Bei Hub-Aufträgen kann außerdem `screening_skipped: true` übergeben werden. In diesem Fall werden keine Vorbefunde aus der klassischen organischen Feststoffanalyse angezeigt.


## v0.3.1 – reale Referenzspektren nach gelöster Identität

Nach korrekt bestätigter Struktur und Namenszuordnung wird ein zusätzlicher Bereich **Reale Referenzspektren** freigeschaltet.

Für die vollständig implementierten Struktur-Fälle sind zwei externe Quellen hinterlegt:
- **AIST SDBS** – reale EI-MS-, FT-IR- und NMR-Spektren, sofern für den Stoff vorhanden
- **NIST Chemistry WebBook** – reale Referenzdaten, insbesondere EI-MS und IR

Die Links bleiben bis zur korrekten Identifikation vollständig verborgen und können die eigentliche Strukturaufklärung daher nicht vorwegnehmen.

Der Bereich ist als Realitätscheck gedacht: Lernende vergleichen die didaktisch reduzierten Unterrichtsspektren mit experimentellen Spektren und berücksichtigen dabei Messbedingungen, Aggregatzustand, Lösungsmittel, Auflösung und Peakform.

Hinterlegte Stoffe:
- Ethanol
- Dimethylether
- Ethylacetat
- 1-Butanol
- 2-Butanol
- Salicylsäure
- 3-Hydroxybenzoesäure
- 4-Hydroxybenzoesäure
