# Datenschutzerklärung

**Letzte Aktualisierung: 21. Oktober 2025**

---

## Einführung

Vielen Dank, dass Sie "Cache Cleaner Assistant" (im Folgenden "diese Erweiterung") verwenden. Wir nehmen Ihre Privatsphäre und Datensicherheit sehr ernst. Diese Datenschutzerklärung soll Ihnen helfen zu verstehen, wie diese Erweiterung Informationen sammelt, verwendet, speichert und schützt.

**Wichtiges Versprechen: Diese Erweiterung sammelt, speichert oder überträgt keine personenbezogenen Daten an externe Server. Alle Datenverarbeitung erfolgt lokal auf Ihrem Gerät.**

---

## 1. Informationserfassung

### 1.1 Informationen, die wir NICHT erfassen

Diese Erweiterung erfasst **KEINE** der folgenden Informationen:

- ❌ Personenbezogene Daten (Name, E-Mail, Telefon usw.)
- ❌ Browserverlauf
- ❌ Website-Besuchsdaten
- ❌ Cookie-Inhalte
- ❌ Formulardaten
- ❌ Passwörter oder Anmeldedaten
- ❌ Standortinformationen
- ❌ Geräte-IDs
- ❌ IP-Adressen

### 1.2 Lokal gespeicherte Daten

Diese Erweiterung speichert nur die folgenden Einstellungsinformationen lokal in Ihrem Browser, um eine personalisierte Erfahrung zu bieten:

| Datentyp                       | Zweck                                  | Speicherort              |
| ------------------------------ | -------------------------------------- | ------------------------ |
| Spracheinstellung              | Gewählte Oberflächensprache merken     | Lokaler Browser-Speicher |
| Theme-Einstellungen            | Dark/Light-Theme-Auswahl speichern     | Lokaler Browser-Speicher |
| Benachrichtigungseinstellungen | Benachrichtigungsstatus merken         | Lokaler Browser-Speicher |
| Bereinigungsoptionen           | Bereinigungspräferenzen speichern      | Lokaler Browser-Speicher |
| Geplante Bereinigung           | Automatische Bereinigungskonfiguration | Lokaler Browser-Speicher |

**Diese Daten werden nur auf Ihrem Gerät gespeichert und niemals auf einen Server hochgeladen.**

---

## 2. Berechtigungserklärung

Diese Erweiterung benötigt die folgenden Browser-Berechtigungen, um Kernfunktionen bereitzustellen. Wir versprechen, diese Berechtigungen nur für die angegebenen Zwecke zu verwenden:

### 2.1 Erforderliche Berechtigungen

| Berechtigung       | Zweck                                              | Datenverarbeitungsmethode                                        |
| ------------------ | -------------------------------------------------- | ---------------------------------------------------------------- |
| `storage`          | Benutzereinstellungen speichern                    | Nur lokale Speicherung, kein Upload                              |
| `browsingData`     | Cache, Cookies und andere Browserdaten löschen     | Führt nur Löschung aus, liest keine Inhalte                      |
| `tabs`             | Aktuelle Tab-Informationen für Bereinigung abrufen | Liest nur URL-Domain, zeichnet keine vollständige URL auf        |
| `activeTab`        | Neuladevorgang im aktuellen Tab ausführen          | Löst nur Aktualisierung aus, greift nicht auf Seiteninhalte zu   |
| `downloads`        | Download-Verlauf löschen                           | Führt nur Löschung aus, greift nicht auf Dateiinhalte zu         |
| `history`          | Browserverlauf löschen                             | Führt nur Löschung aus, liest keine Verlaufsinhalte              |
| `cookies`          | Website-Cookies löschen                            | Führt nur Löschung aus, liest keine Cookie-Werte                 |
| `unlimitedStorage` | Benutzereinstellungen speichern (unbegrenzt)       | Speichert nur Einstellungen, sammelt keine Benutzerinfos         |
| `contextMenus`     | Schnellaktionen zum Kontextmenü hinzufügen         | Bietet nur Menüoptionen, sammelt keine Daten                     |
| `notifications`    | Abschlussbenachrichtigungen anzeigen               | Zeigt nur lokal an, sendet nicht nach außen                      |
| `scripting`        | Bereinigungsskripte auf Seiten ausführen           | Löscht nur LocalStorage/SessionStorage                           |
| `<all_urls>`       | Bereinigungsvorgänge auf allen Websites erlauben   | Nur für Bereinigung verwendet, greift nicht auf Seiteninhalte zu |

### 2.2 Prinzipien der Berechtigungsnutzung

- ✅ **Prinzip der minimalen Berechtigung**: Fordert nur für die Funktionsimplementierung notwendige Berechtigungen an
- ✅ **Transparente Nutzung**: Alle Berechtigungszwecke sind in diesem Dokument klar erklärt
- ✅ **Lokale Verarbeitung**: Alle Datenverarbeitung erfolgt lokal
- ✅ **Kein Missbrauch von Berechtigungen**: Verwendet Berechtigungen nicht für andere als die angegebenen Zwecke

---

## 3. Datennutzung

### 3.1 Datenverarbeitungsmethoden

Alle Funktionen dieser Erweiterung laufen auf Ihrem lokalen Gerät:

1. **Cache-Bereinigung**: Ruft direkt Browser-API auf, um Cache zu löschen, liest keine Cache-Inhalte
2. **Cookie-Bereinigung**: Löscht Cookies direkt, liest oder zeichnet keine Cookie-Werte auf
3. **Speicherbereinigung**: Löscht LocalStorage und SessionStorage, greift nicht auf Speicherinhalte zu
4. **Verlaufsbereinigung**: Löscht Browserverlauf, liest oder zeichnet keine Verlaufsdaten auf
5. **Seitenneuladung**: Löst Seitenaktualisierung aus, greift nicht auf Seiteninhalte zu

### 3.2 Vorgänge, die wir NICHT durchführen

Diese Erweiterung wird **NIEMALS**:

- ❌ Ihre Daten an externe Server senden
- ❌ Ihre Informationen mit Dritten teilen
- ❌ Ihr Browsing-Verhalten verfolgen
- ❌ Ihre Nutzungsgewohnheiten analysieren
- ❌ Werbung anzeigen oder Marketing betreiben
- ❌ Ihre Daten verkaufen oder vermieten

---

## 4. Datensicherheit

### 4.1 Sicherheitsmaßnahmen

Wir ergreifen die folgenden Maßnahmen zum Schutz Ihrer Datensicherheit:

- 🔒 **Lokale Speicherung**: Alle Daten werden nur auf Ihrem Gerät gespeichert
- 🔒 **Keine Netzwerkübertragung**: Erweiterung enthält keinen Netzwerkanforderungscode
- 🔒 **Keine externen Abhängigkeiten**: Verlässt sich nicht auf Drittanbieterdienste oder CDN
- 🔒 **Open-Source-Transparenz**: Quellcode ist öffentlich und kann überprüft werden
- 🔒 **Berechtigungsisolierung**: Folgt Browser-Sicherheits-Sandbox-Mechanismen

### 4.2 Datenlöschung

Sie können alle von dieser Erweiterung gespeicherten Daten jederzeit durch die folgenden Methoden löschen:

1. **Erweiterung deinstallieren**: Alle lokalen Einstellungen werden nach der Deinstallation automatisch gelöscht
2. **Einstellungen zurücksetzen**: Klicken Sie in den Erweiterungseinstellungen auf "Standardeinstellungen wiederherstellen"
3. **Browser-Daten löschen**: Löschen Sie Erweiterungsdaten über die Browser-Einstellungen

---

## 5. Drittanbieterdienste

### 5.1 Keine Drittanbieterdienste

Diese Erweiterung **verwendet KEINE Drittanbieterdienste**, einschließlich aber nicht beschränkt auf:

- ❌ Analysedienste (wie Google Analytics)
- ❌ Werbenetzwerke
- ❌ Cloud-Speicherdienste
- ❌ Social-Media-Plugins
- ❌ Fehler-Tracking-Dienste

### 5.2 Keine externen Verbindungen

Diese Erweiterung **stellt KEINE externen Netzwerkverbindungen her**:

- ❌ Verbindet sich nicht mit unseren Servern
- ❌ Verbindet sich nicht mit Drittanbieter-APIs
- ❌ Lädt keine externen Ressourcen
- ❌ Sendet keine Telemetriedaten

---

## 6. Datenschutz für Kinder

Diese Erweiterung sammelt absichtlich keine Informationen von Kindern unter 13 Jahren. Tatsächlich sammelt diese Erweiterung keine persönlichen Informationen von irgendwelchen Benutzern, was sie für Benutzer jeden Alters geeignet macht.

---

## 7. Internationale Benutzer

Diese Erweiterung wird weltweit bereitgestellt und unterstützt mehrere Sprachen. Unabhängig davon, wo Sie sich befinden, ist unser Datenschutzversprechen konsistent:

- 🌍 **Global anwendbar**: Datenschutzerklärung gilt für Benutzer in allen Regionen
- 🌍 **Einhaltung von Vorschriften**: Entspricht Datenschutzvorschriften wie DSGVO und CCPA
- 🌍 **Lokale Verarbeitung**: Alle Datenverarbeitung erfolgt auf Ihrem lokalen Gerät
- 🌍 **Keine grenzüberschreitende Übertragung**: Beinhaltet keine grenzüberschreitende Datenübertragung

---

## 8. Aktualisierungen der Datenschutzerklärung

### 8.1 Aktualisierungsbenachrichtigungen

Wir können diese Datenschutzerklärung von Zeit zu Zeit aktualisieren. Bei wesentlichen Änderungen werden wir Sie durch die folgenden Methoden benachrichtigen:

1. Hinweis in der Erweiterungs-Update-Beschreibung
2. Anzeige einer Benachrichtigung in der Erweiterungsoberfläche
3. Veröffentlichung einer Ankündigung auf der GitHub-Projektseite

### 8.2 Wirksamkeitsdatum

Aktualisierungen dieser Datenschutzerklärung treten unmittelbar nach der Veröffentlichung in Kraft. Die fortgesetzte Nutzung dieser Erweiterung zeigt Ihre Zustimmung zur aktualisierten Datenschutzerklärung an.

---

## 9. Benutzerrechte

### 9.1 Ihre Rechte

Als Benutzer haben Sie die folgenden Rechte:

- ✅ **Zugriffsrecht**: Alle von dieser Erweiterung gespeicherten Einstellungsdaten anzeigen
- ✅ **Änderungsrecht**: Ihre Einstellungen und Präferenzen jederzeit ändern
- ✅ **Löschrecht**: Alle lokal gespeicherten Daten jederzeit löschen
- ✅ **Widerspruchsrecht**: Wählen Sie, bestimmte Funktionen nicht zu verwenden
- ✅ **Informationsrecht**: Verstehen Sie, wie Daten verwendet werden

### 9.2 Ausübung der Rechte

Sie können die oben genannten Rechte durch die folgenden Methoden ausüben:

1. **In den Erweiterungseinstellungen**: Einstellungen direkt ändern oder zurücksetzen
2. **Erweiterung deinstallieren**: Alle Daten vollständig löschen
3. **Kontaktieren Sie uns**: Bei Fragen kontaktieren Sie uns bitte über die unten stehenden Kontaktinformationen

---

## 10. Open-Source-Versprechen

### 10.1 Code-Transparenz

Diese Erweiterung ist vollständig Open Source:

- 📖 **Öffentlicher Quellcode**: [https://github.com/soyof/clearCache](https://github.com/soyof/clearCache)
- 📖 **Überprüfbar**: Jeder kann den Code überprüfen, um Datenschutzversprechen zu verifizieren
- 📖 **Community-Überwachung**: Community-Mitglieder sind eingeladen, Datenschutzprobleme zu melden

### 10.2 Audit und Verifizierung

Wir begrüßen Sicherheitsforscher und Datenschutzbefürworter, diese Erweiterung zu auditieren:

- 🔍 Quellcode überprüfen, um keine Datenerfassung zu verifizieren
- 🔍 Netzwerkverkehr überprüfen, um keine externen Verbindungen zu bestätigen
- 🔍 Berechtigungsnutzung analysieren, um angemessene Compliance sicherzustellen

---

## 11. Kontaktieren Sie uns

Wenn Sie Fragen, Kommentare oder Vorschläge zu dieser Datenschutzerklärung haben, kontaktieren Sie uns bitte über die folgenden Methoden:

### 📧 Kontaktinformationen

- **E-Mail**: somuns.os@qq.com
- **GitHub Issues**: [https://github.com/soyof/clearCache/issues](https://github.com/soyof/clearCache/issues)
- **Projekt-Homepage**: [https://github.com/soyof/clearCache](https://github.com/soyof/clearCache)

### ⏱️ Antwortzeit

Wir werden innerhalb von 7 Werktagen nach Erhalt Ihrer Anfrage antworten.

---

## 12. Urheberrechtserklärung

### 12.1 Open-Source-Lizenz

Diese Erweiterung ist unter der **MIT-Lizenz** Open Source. Sie können diese Erweiterung frei verwenden, ändern und verteilen.

### 12.2 Zuordnungsanforderungen

Wenn Sie den Code oder die Dokumentation dieser Erweiterung in Ihrem Projekt verwenden, ändern oder referenzieren, beachten Sie bitte die folgenden Anforderungen:

- ✅ **Urheberrechtshinweis beibehalten**: Behalten Sie die ursprüngliche MIT-Lizenz und Urheberrechtsinformationen bei
- ✅ **Quelle angeben**: Geben Sie die Quelle in Ihrer Projektdokumentation an
- ✅ **Zitierformat**: Wir empfehlen die Verwendung des folgenden Formats

```
Dieses Projekt basiert auf "Cache Cleaner Assistant"
Original-Autor: soyof
Projekt-URL: https://github.com/soyof/clearCache
Lizenz: MIT License
```

### 12.3 Haftungsausschluss

Diese Erweiterung wird "wie besehen" ohne ausdrückliche oder stillschweigende Garantien bereitgestellt. Wenn Sie diese Erweiterung zum Bereinigen von Daten verwenden, stellen Sie bitte sicher, dass Sie die Folgen der Operation verstehen. Wir sind nicht verantwortlich für Datenverluste oder andere Verluste, die aus der Verwendung dieser Erweiterung resultieren.

---

## 13. Zusammenfassung des Datenschutzes

### ✅ Unsere Versprechen

| Versprechen                       | Beschreibung                                              |
| --------------------------------- | --------------------------------------------------------- |
| 🔒 **Null Datenerfassung**        | Erfasst keine personenbezogenen Daten                     |
| 🔒 **Lokale Verarbeitung**        | Alle Operationen auf Ihrem Gerät abgeschlossen            |
| 🔒 **Keine Netzwerkübertragung**  | Sendet keine Daten an Server                              |
| 🔒 **Keine Drittanbieter**        | Verwendet keine Drittanbieterdienste                      |
| 🔒 **Open-Source-Transparenz**    | Quellcode ist vollständig öffentlich und überprüfbar      |
| 🔒 **Angemessene Berechtigungen** | Fordert nur notwendige Berechtigungen an, kein Missbrauch |

### 🎯 Kernprinzipien

1. **Datenschutz zuerst**: Benutzerdatenschutz ist unsere oberste Priorität
2. **Transparent und offen**: Alle Datenverarbeitungsmethoden sind transparent und offen
3. **Minimierungsprinzip**: Nur notwendige Daten sammeln und verarbeiten
4. **Benutzerkontrolle**: Benutzer haben vollständige Kontrolle über ihre Daten
5. **Sicherheitsgarantie**: Angemessene Maßnahmen zum Schutz der Datensicherheit ergreifen

---

## 14. Häufig gestellte Fragen (FAQ)

### F1: Erfasst diese Erweiterung meinen Browserverlauf?

**A:** Nein. Diese Erweiterung löscht nur den Browserverlauf, wenn Sie es ausdrücklich anfordern, und liest oder erfasst keine Verlaufsinhalte.

### F2: Liest diese Erweiterung meine Cookies?

**A:** Nein. Diese Erweiterung löscht nur Cookies, wenn Sie eine Bereinigung anfordern, und liest oder zeichnet keine Cookie-Inhalte auf.

### F3: Werden meine Einstellungsdaten auf Server hochgeladen?

**A:** Nein. Alle Einstellungsdaten werden nur in Ihrem lokalen Browser gespeichert und niemals hochgeladen.

### F4: Benötigt diese Erweiterung eine Internetverbindung?

**A:** Nein. Diese Erweiterung funktioniert vollständig offline und benötigt keine Netzwerkverbindung.

### F5: Wie kann ich die Datenschutzversprechen dieser Erweiterung überprüfen?

**A:** Sie können:

1. Open-Source-Code anzeigen: [https://github.com/soyof/clearCache](https://github.com/soyof/clearCache)
2. Browser-Entwicklertools verwenden, um Netzwerkanforderungen zu überwachen (Sie werden feststellen, dass es keine externen Anforderungen gibt)
3. Browser-Berechtigungsnutzungsaufzeichnungen überprüfen

### F6: Bleiben Daten nach der Deinstallation der Erweiterung erhalten?

**A:** Nein. Nach der Deinstallation der Erweiterung werden alle lokal gespeicherten Einstellungsdaten automatisch gelöscht.

### F7: Ist diese Erweiterung DSGVO-konform?

**A:** Ja. Da diese Erweiterung keine persönlichen Daten erfasst, entspricht sie vollständig der DSGVO und anderen Datenschutzvorschriften.

---

## 15. Versionshistorie

| Version | Datum      | Änderungen           |
| ------- | ---------- | -------------------- |
| 1.0     | 2025-10-21 | Erstveröffentlichung |

---

<div align="center">
  <p><strong>Vielen Dank für Ihr Vertrauen in "Cache Cleaner Assistant"</strong></p>
  <p><i>Ihre Privatsphäre, Unsere Verantwortung</i></p>
  <p>© 2025 Cache Cleaner Assistant | MIT License</p>
</div>

---

**Diese Datenschutzerklärung wurde zuletzt aktualisiert am: 21. Oktober 2025**
