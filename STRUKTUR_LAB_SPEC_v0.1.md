# STRUKTUR-LAB v0.1 – Fachliche und technische Spezifikation

## 1. Rolle im Digitalen Analytiklabor

STRUKTUR-LAB ist eine eigenständige browserbasierte Lernumgebung zur Interpretation kuratierter analytischer Daten. Der Analytik-Hub bleibt Orchestrator; Spektren, Interpretation und Strukturhypothese liegen im STRUKTUR-LAB.

Zentraler Ablauf:

`M → MS → IR → ¹H-NMR → Stoffklasse → Strukturhypothese → Referenzvergleich → Hub → GC-Standard`

## 2. Zwei Anspruchsniveaus

### Basismodus
- Ziel: Regelunterricht / Einstieg
- molare Masse wird angegeben
- Summenformel wird angegeben
- Methoden-Werkzeugkasten prominent verfügbar
- Orientierungsbereiche in IR/NMR optional einblendbar
- kuratierte Kandidatenkarten

### Expertenmodus
- Ziel: WPF / Chemieolympiade / Studienvorbereitung
- molare Masse wird angegeben
- Summenformel zunächst nicht angegeben
- Hilfen zurückhaltender
- später optional: Verhältnisformel bzw. Elementaranalyse als Zusatzinformation

Technisch wird die Formelunterstützung nicht hart an den Modus gekoppelt, sondern pro Fall über `formula_support = molecular | empirical | none` steuerbar.

## 3. Elementaranalyse

Keine Gerätesimulation. Der Methoden-Werkzeugkasten enthält einen kompakten Exkurs:

1. Massenanteile der Elemente
2. Umrechnung in Stoffmengenanteile
3. Division durch den kleinsten Wert
4. ganzzahliges Verhältnis → Verhältnisformel
5. mit molarer Masse ggf. Summenformel

Für echte Summenformelbestimmung aus MS kann später HRMS/exakte Masse ergänzt werden. Niedrig aufgelöstes EI-MS allein wird nicht als allgemeine eindeutige Summenformelbestimmung dargestellt.

## 4. Methoden-Werkzeugkasten

Begleiter durch alle Analysen, keine Lösung des aktuellen Falls.

### MS
- m/z-Achse
- relative Intensität
- Basispeak
- Molekülion kann schwach/fehlend sein
- Fragmente als Strukturhinweise
- M+1/M+2 als spätere Erweiterung

### IR
- Funktionsgruppenbereich vs. Fingerprintbereich
- optionale Bereichseinblendung
- wichtige Orientierungsbereiche für O–H, C=O, C–O, C–H, aromatische Systeme
- Bereiche sind Hinweise, keine automatische Zuordnung

### ¹H-NMR
Vier Leitfragen:
1. Wo? – chemische Verschiebung
2. Wie viel? – Integration
3. Wie aufgespalten? – Multiplizität
4. Wie viele Umgebungen? – Zahl der Signale

Zusätzlich: vereinfachte n+1-Regel, Austauschbarkeit von OH-Protonen, optionale Orientierungsbereiche.

## 5. Analysejournal

Zentrale strukturierte Dokumentation:
- M-Befund
- MS-Befund
- IR-Befund
- NMR-Befund
- Stoffklassenhypothese
- Strukturhypothese
- Begründung

Das Journal soll später direkt als Basis für ein Protokoll dienen.

## 6. Stoffklassenhypothese

Auswahlliste bewusst größer als die aktuell implementierte Stoffbibliothek:

Alkohol, Ether, Aldehyd, Keton, Carbonsäure, Ester, Amin, Amid, Alken, Aromat.

Bei falscher Auswahl wird keine bloße Rot-Markierung gezeigt, sondern ein fachliches Gegenargument aus den vorliegenden Daten, z. B. "Eine starke Carbonylbande fehlt".

## 7. Strukturhypothese

Nach dokumentierter Stoffklasse werden kuratierte 2D-Strukturkarten angeboten.

- kein Moleküleditor in v0.1
- Kandidat wird bewusst festgelegt
- Referenzspektren bleiben bis zur Hypothese gesperrt
- nach richtiger Struktur folgt Namenszuordnung
- Synonyme werden tolerant akzeptiert

## 8. Trial-and-Error-Schutz

Referenzspektren dürfen erst nach einer fachlich passenden Strukturhypothese eingeblendet werden. Dadurch kann die Bibliothek nicht durch blindes Durchprobieren gelöst werden.

## 9. Referenzvergleich

Nach der Hypothese kann ein Referenzspektrum der gewählten Struktur überlagert bzw. daneben angezeigt werden. Ziel: Bibliotheksvergleich als reale analytische Praxis verstehen.

Rückmeldung: "Die Strukturhypothese ist mit den spektroskopischen Daten vereinbar."

Die endgültige Identitätsbestätigung erfolgt im gekoppelten Analytik-Fall erst später über einen gezielten GC-Referenzstandard bzw. Aufstockung.

## 10. NMR-Zuordnung nach richtiger Hypothese

Datenmodell von Beginn an vorbereitet:
- `signal_id`
- `proton_group`
- 2D-Struktur mit markierbaren Protonengruppen

Späterer Übungsmodus: Signal ↔ Protonengruppe zuordnen. Erst nach richtiger Hypothese, damit nichts vorweggenommen wird.

## 11. Moleküllabor

Bleibt separat. Nach abgeschlossener Strukturhypothese kann optional per CORE-ID/SMILES an ein vorhandenes Moleküllabor übergeben werden.

## 12. Startbibliothek

- ETHANOL – Basis
- DIMETHYL_ETHER – Basis; Isomerievergleich zu Ethanol
- ACETONE – Basis
- ETHYL_ACETATE – Basis/Mittel
- BUTAN_1_OL – Mittel
- BUTAN_2_OL – Mittel; Isomerievergleich
- TOLUENE – Mittel
- SALICYLIC_ACID – Experte; Aromat + Phenol + Carbonsäure

## 13. Datenmodell

`data/structure-substances.json` enthält Stoffdaten, Spektren, Strukturkarte, akzeptierte Namen, Stoffklasse und evidenzbasierte Rückmeldungen.

`data/structure-cases.json` enthält Fälle, Zielstoff, Schwierigkeitsgrad, Kandidaten und Formelunterstützung.

## 14. Repo-Struktur

```text
STRUKTUR_LAB/
├── index.html
├── app.js
├── styles.css
├── data/
│   ├── structure-substances.json
│   └── structure-cases.json
├── STRUKTUR_LAB_SPEC_v0.1.md
└── README.md
```

## 15. Versionsfolge

- v0.1.0: Single-Mode, 3 vollständige Testfälle, beide Niveaus, Werkzeugkasten, Journal, Strukturhypothese
- v0.1.1: alle 8 Startstoffe vollständig kuratiert
- v0.1.2: NMR-Signal ↔ Protonengruppe
- v0.2: Analytik-Hub/GC-Peak-Adapter + RESULT-Rückgabe
- v0.3: GC-Referenzstandard/Aufstockung
- v0.4: Moleküllabor-Link, Aufgabenmodus, weitere Fälle


### Nachtrag v0.1.1

- Austauschbare OH-Signale im ¹H-NMR werden in der Darstellung bewusst breiter und mit Mindesthöhe gezeichnet.
- Für Ethanol wird das OH-Signal didaktisch separiert bei ca. 2,10 ppm gezeigt, damit AnfängerInnen das austauschbare Proton besser erkennen können; die Variabilität der OH-Lage wird im Methodenwerkzeugkasten weiterhin erklärt.


### Nachtrag v0.1.2

- NMR-Signalchips enthalten zusätzlich δ-Werte, damit die Zuordnung zwischen Spektrum und Befund leichter fällt.
- Die relative Integrationsfolge wird kompakt angezeigt.
- Strukturkarten wurden visuell überarbeitet, damit Bindungsstriche die Gruppenbezeichnungen nicht überlagern.


### Nachtrag v0.1.3

- Referenzvergleich ist grafisch implementiert und bleibt bis nach richtiger Strukturhypothese und Namenszuordnung gesperrt.
- MS, IR und ¹H-NMR können einzeln verglichen werden.
- Das unbekannte Spektrum wird durchgezogen, die bestätigte Referenz gestrichelt überlagert; Spektren werden nicht künstlich gegeneinander verschoben.
- Die Überlagerung dient als spektroskopische Absicherung, nicht als endgültige Identitätsbestätigung.
- IR-Bereichsbeschriftungen werden oberhalb der hohen Transmissionsbaseline platziert.
- Strukturkarten verwenden feinere, weniger dominante Bindungsstriche.


### Nachtrag v0.1.4 – Butanole und MS-Fragment-Lernhilfe

1-Butanol und 2-Butanol sind als vollständige kuratierte Fälle ergänzt. Sie bilden ein Isomerenpaar mit gleicher Summenformel und molarer Masse, aber deutlich unterschiedlichen ¹H-NMR- und EI-MS-Mustern.

Für die MS-Vertiefung gilt:
- erst nach gelöster Struktur freigeben
- nur diagnostische, fachlich gut begründbare Peaks kuratieren
- angezeigtes Objekt ist das **geladene Fragmention**
- neutrale Begleitfragmente werden nicht als Peak detektiert
- nicht jeder kleine Peak muss oder soll eindeutig zugeordnet werden

Datenmodell im jeweiligen Stoffdatensatz:
`ms.diagnostic_fragments[] = { mz, label, ion_formula, pathway, note }`

Damit kann die Lernhilfe schrittweise auf weitere Stoffe erweitert werden, ohne einen universellen Fragmentierungsalgorithmus vorzutäuschen.


### Nachtrag v0.1.5 – gemeinsame Spektrenwerkstatt

Nach bestätigter Struktur und Namenszuordnung wird eine einheitliche Spektrenwerkstatt freigeschaltet.

UI-Prinzip:
- ein gemeinsames Canvas/Spektrenfenster
- Methodenreiter: MS, IR, ¹H-NMR
- Arbeitsmodus: Lernen/Diagnose oder Kandidatenvergleich
- Kandidatenauswahl erscheint nur im Vergleichsmodus

Methodenspezifische Lernfunktionen:
- MS: kuratierte diagnostische Fragmentpeaks
- IR: Funktionsgruppen- und Fingerprintbereiche
- ¹H-NMR: Signal ↔ Protonengruppe mit gemeinsamer Hervorhebung

Der spätere direkte Klick auf Multipletts im NMR-Spektrum bleibt als erweiterte Stufe separat vorgemerkt.


### Nachtrag v0.2.0 – Analytik-Hub / GC-Peak

STRUKTUR-LAB kann einen konkreten Peak eines vorgelagerten GC-RESULTs bearbeiten.

Bridge-Kontext:
- `source_result_id` = GC-RESULT
- `peak_id` = P1/P2/...
- `sample_id` = zugehörige Destillationsfraktion
- verborgene interne Zielsubstanz zur Auswahl des kuratierten Falls

Im SchülerInnen-UI erscheinen nur Peak-ID, öffentliche GC-Messdaten und der Strukturauftrag. Die wahre Identität bleibt verborgen.

Rückgabe:
- `analysis_type: STRUCTURE_ELUCIDATION`
- `identity_status: supported`
- Hypothese mit Stoffklasse, Struktur/CORE-ID und Name
- Analysejournal als `student_interpretation`
- `source_result_id + peak_id` zur Rückverknüpfung

`confirmed` wird bewusst nicht im STRUKTUR-LAB vergeben. Die endgültige Identitätsbestätigung erfolgt später über einen gezielten GC-Referenzstandard bzw. Aufstockung.


### Nachtrag v0.2.1

Die MS-Lernhilfe für Ethylacetat wird analog zu den Butanol-Fällen auf wenige diagnostische Fragmente begrenzt. Die Strukturkarten von Carbonylverbindungen verwenden eine geometrisch klarere C=O-Darstellung, bei der beide Doppelbindungslinien eindeutig vom Carbonyl-C ausgehen.
