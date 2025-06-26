# 🎮 Vibe Fantasy: HTML5 Canvas Game

Moderná HTML5 Canvas hra inšpirovaná klasickými JRPG hrami ako Final Fantasy VII, postavená na čistom JavaScripte bez frameworkov.

## ✨ Funkcie

### 🎯 Herný Engine
- **Fullscreen Canvas** s automatickým resizovaním
- **Pohyb hráča** pomocou klávesnice (WASD/šípky) a touch ovládania
- **Kolízie** s nepriechodnými regiónmi
- **Pozadie** s inteligentným posúvaním (camera follow)
- **Error handling** s detailnými debug informáciami

### 💬 Textové Dialógy
- **JRPG štýl** textové okná inšpirované Final Fantasy VII
- **Animované vypisovanie** textu po písmenách
- **Viackrát spustiteľné** triggery s debounce ochranou
- **Responzívne** ovládanie (kliknutie, Enter, medzerník, Z, X)

### 🗺️ Editor Máp
- **Vizuálny editor** pre definovanie regiónov a triggerov
- **Prepínanie režimov** medzi kreslením regiónov a triggerov
- **Selektívne mazanie** objektov
- **Import/Export** JSON súborov
- **Real-time status** s počtami objektov
- **Responzívny dizajn** s moderným UI

### 🎨 Estetika
- **Final Fantasy VII štýl** textové okná
- **Tmavý gradient** pozadie s orámovaním
- **Zlatý blikajúci kurzor** namiesto rušivého textu
- **Tailwind CSS** pre moderné štýlovanie

## 🚀 Inštalácia

```bash
# Klonuj repozitár
git clone <repository-url>
cd vf-canvas-hra

# Nainštaluj závislosti
npm install

# Spusti development server
npm start
```

## 🎮 Použitie

### Hra
1. Otvor `http://localhost:8080` v prehliadači
2. Pohybuj sa pomocou klávesnice (WASD/šípky) alebo touch
3. Vstup do triggerov pre zobrazenie dialógov

### Editor
1. Otvor `http://localhost:8080/map_editor.html`
2. Prepni medzi režimami kreslenia:
   - **Nepriechodné regióny** (červené)
   - **Textové triggery** (fialové)
   - **Výber a mazanie** (oranžové)
3. Klikaj na canvas pre pridanie bodov
4. Dvojklik alebo "Dokončiť región" pre uzavretie
5. Exportuj JSON pre použitie v hre

## 📁 Štruktúra Projektu

```
vf-canvas-hra/
├── index.html          # Hlavná hra
├── game.js             # Herný engine
├── map_editor.html     # Editor máp
├── map_editor.js       # Editor logika
├── regions.json        # Konfigurácia regiónov a triggerov
├── background.png      # Pozadie mapy
├── package.json        # NPM konfigurácia
└── README.md          # Tento súbor
```

## 🛠️ Technológie

- **HTML5 Canvas** - Herný engine
- **Vanilla JavaScript** - Bez frameworkov
- **Tailwind CSS** - Štýlovanie (CDN)
- **Live Server** - Development server
- **GitHub Pages** - Deployment

## 📦 Skripty

```bash
# Development server
npm start

# Vytvoriť produkčnú verziu
npm run predeploy-gh-pages

# Deploy na GitHub Pages
npm run deploy-gh-pages
```

## 🎯 Príklady Použitia

### Vytvorenie Triggeru
1. V editore prepni na "Textové triggery"
2. Nakresli polygón okolo oblasti
3. Zadaj text: `"Vitaj v našej dedine!\nTu začína tvoja cesta."`
4. Exportuj JSON

### Nepriechodný Región
1. Prepni na "Nepriechodné regióny"
2. Nakresli polygón okolo budovy/hory
3. Exportuj JSON

## 🔧 Konfigurácia

### regions.json štruktúra:
```json
{
  "regions": [
    [{"x": 100, "y": 100}, {"x": 200, "y": 100}, {"x": 200, "y": 200}]
  ],
  "triggers": [
    {
      "polygon": [{"x": 300, "y": 300}, {"x": 400, "y": 300}],
      "text": "Vitaj v našej dedine!"
    }
  ]
}
```

## 🎨 Vlastné Pozadie

Nahraď `background.png` vlastným obrázkom. Obrázok sa automaticky prispôsobí veľkosti obrazovky.

## 🐛 Debug

Ak hra zlyhá, zobrazí sa detailná chyba s stack trace. Všetky chyby sa logujú do konzoly prehliadača.

## 📄 Licencia

MIT License - pozri LICENSE súbor pre detaily.

## 🤝 Príspevky

Príspevky sú vítané! Otvor issue alebo pull request.

---

**Vibe Fantasy** - Moderná JRPG hra pre web! 🎮✨
