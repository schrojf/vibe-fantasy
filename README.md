# 🎮 Vibe Fantasy: HTML5 Canvas Experiment

Osobný experimentálny projekt - jednoduchá HTML5 Canvas hra inšpirovaná klasickými JRPG hrami, postavená na čistom JavaScripte bez frameworkov.

## 🎯 Vyskúšaj si to

- **Hra:** https://schrojf.github.io/vibe-fantasy/
- **Editor máp:** https://schrojf.github.io/vibe-fantasy/map_editor.html
- **Debug mód:** https://schrojf.github.io/vibe-fantasy/?debug

## ✨ Funkcie

### 🎯 Herný Engine
- **Fullscreen Canvas** s automatickým resizovaním
- **Pohyb hráča** pomocou klávesnice (WASD/šípky) a touch ovládania
- **Kolízie** s nepriechodnými regiónmi
- **Pozadie** s inteligentným posúvaním (camera follow)
- **Error handling** s detailnými debug informáciami
- **Multi-map support** s portálmi medzi mapami

### 💬 Textové Dialógy
- **VF štýl** textové okná s atmosférickým dizajnom
- **Animované vypisovanie** textu po písmenách
- **Viackrát spustiteľné** triggery s debounce ochranou
- **Responzívne** ovládanie (kliknutie, Enter, medzerník, Z, X)

### 🗺️ Editor Máp
- **Vizuálny editor** pre definovanie regiónov a triggerov
- **Prepínanie režimov** medzi kreslením regiónov, triggerov a portálov
- **Multi-map support** s prepínaním medzi mapami
- **Selektívne mazanie** objektov
- **Import/Export** JSON súborov
- **Real-time status** s počtami objektov
- **Responzívny dizajn** s moderným UI

### 🌟 Portály a Mapy
- **Portal triggers** pre prechody medzi mapami
- **Počiatočné pozície hráča** pre každú mapu
- **Atmosférické texty** pred teleportáciou
- **Debug mód** pre zobrazenie všetkých oblastí

### 🎨 Estetika
- **VF štýl** textové okná s tmavým gradientom
- **Zlatý blikajúci kurzor** namiesto rušivého textu
- **Tailwind CSS** pre moderné štýlovanie
- **Mobilné ovládanie** s virtuálnym joystickom

## 🚀 Inštalácia

```bash
# Klonuj repozitár
git clone <repository-url>
cd vibe-fantasy

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
4. Nájdi portály pre prechody medzi mapami
5. Pre debug informácie pridaj `?debug` do URL

### Editor
1. Otvor `http://localhost:8080/map_editor.html`
2. Prepni medzi režimami kreslenia:
   - **Nepriechodné regióny** (červené)
   - **Textové triggery** (fialové)
   - **Portály** (zelené)
   - **Výber a mazanie** (oranžové)
3. Klikaj na canvas pre pridanie bodov
4. Dvojklik alebo "Dokončiť región" pre uzavretie
5. Pre portály zadaj cieľovú mapu a pozíciu
6. Exportuj JSON pre použitie v hre

## 📁 Štruktúra Projektu

```
vibe-fantasy/
├── index.html          # Hlavná hra
├── game.js             # Herný engine
├── map_editor.html     # Editor máp
├── map_editor.js       # Editor logika
├── maps.json           # Konfigurácia máp
├── village.json        # Dedina - regióny a triggery
├── dungeon.json        # Dungeon - regióny a triggery
├── village.png         # Pozadie dediny
├── dungeon.png         # Pozadie dungeonu
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

### Vytvorenie Portálu
1. Prepni na "Portály"
2. Nakresli polygón okolo portálovej oblasti
3. Zadaj text: `"Cítim silnú energiu...\nPred tebou sa otvára portál."`
4. Zadaj cieľovú mapu a pozíciu hráča
5. Exportuj JSON

### Nepriechodný Región
1. Prepni na "Nepriechodné regióny"
2. Nakresli polygón okolo budovy/hory
3. Exportuj JSON

## 🔧 Konfigurácia

### maps.json štruktúra:
```json
{
  "defaultMap": "village",
  "maps": {
    "village": {
      "name": "Dedina",
      "background": "village.png",
      "regions": "village.json",
      "description": "Hlavná dedina hry",
      "playerStartX": 555,
      "playerStartY": 715
    }
  }
}
```

### village.json štruktúra:
```json
{
  "regions": [
    [{"x": 100, "y": 100}, {"x": 200, "y": 100}, {"x": 200, "y": 200}]
  ],
  "triggers": [
    {
      "polygon": [{"x": 300, "y": 300}, {"x": 400, "y": 300}],
      "text": "Vitaj v našej dedine!"
    },
    {
      "polygon": [{"x": 500, "y": 500}, {"x": 600, "y": 500}],
      "text": "Portál do dungeonu...",
      "action": {
        "type": "portal",
        "mapId": "dungeon",
        "playerX": 200,
        "playerY": 300
      }
    }
  ]
}
```

## 🎨 Vlastné Pozadie

Nahraď `village.png` alebo `dungeon.png` vlastnými obrázkami. Obrázky sa automaticky prispôsobia veľkosti obrazovky.

## 🐛 Debug

Pre zobrazenie debug informácií pridaj `?debug` do URL hry. Zobrazia sa:
- Farebné regióny (červené - kolízie, fialové - triggery, zelené - portály)
- Pozícia hráča a názov mapy
- Počty regiónov a triggerov

Ak hra zlyhá, zobrazí sa detailná chyba s stack trace. Všetky chyby sa logujú do konzoly prehliadača.

## 📄 Licencia

MIT License - pozri LICENSE súbor pre detaily.

## 🤝 Príspevky

Príspevky sú vítané! Otvor issue alebo pull request.

---

**Vibe Fantasy** - Osobný experiment s HTML5 Canvas! 🎮✨
