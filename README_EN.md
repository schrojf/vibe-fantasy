# 🎮 Vibe Fantasy: HTML5 Canvas Experiment

Personal experimental project - a simple HTML5 Canvas game inspired by classic JRPG games, built with pure JavaScript without frameworks.

**🌍 Languages:** **English** | [Slovenčina](README.md)

## 🎯 Try it out

- **Game:** https://schrojf.github.io/vibe-fantasy/
- **Map Editor:** https://schrojf.github.io/vibe-fantasy/map_editor.html
- **Debug Mode:** https://schrojf.github.io/vibe-fantasy/?debug

## ✨ Features

### 🎯 Game Engine
- **Fullscreen Canvas** with automatic resizing
- **Player movement** using keyboard (WASD/arrows) and touch controls
- **Collisions** with impassable regions
- **Background** with intelligent scrolling (camera follow)
- **Error handling** with detailed debug information
- **Multi-map support** with portals between maps

### 💬 Text Dialogs
- **VF style** text windows with atmospheric design
- **Animated text typing** character by character
- **Multiple triggerable** triggers with debounce protection
- **Responsive** controls (click, Enter, spacebar, Z, X)

### 🗺️ Map Editor
- **Visual editor** for defining regions and triggers
- **Mode switching** between drawing regions, triggers, and portals
- **Multi-map support** with switching between maps
- **Selective deletion** of objects
- **Import/Export** JSON files
- **Real-time status** with object counts
- **Responsive design** with modern UI

### 🌟 Portals and Maps
- **Portal triggers** for transitions between maps
- **Player starting positions** for each map
- **Atmospheric texts** before teleportation
- **Debug mode** for displaying all areas

### 🎨 Aesthetics
- **VF style** text windows with dark gradient
- **Golden blinking cursor** instead of distracting text
- **Tailwind CSS** for modern styling
- **Mobile controls** with virtual joystick

## 🚀 Installation

```bash
# Clone repository
git clone <repository-url>
cd vibe-fantasy

# Install dependencies
npm install

# Start development server
npm start
```

## 🎮 Usage

### Game
1. Open `http://localhost:8080` in browser
2. Move using keyboard (WASD/arrows) or touch
3. Enter triggers to display dialogs
4. Find portals for transitions between maps
5. Add `?debug` to URL for debug information

### Editor
1. Open `http://localhost:8080/map_editor.html`
2. Switch between drawing modes:
   - **Impassable regions** (red)
   - **Text triggers** (purple)
   - **Portals** (green)
   - **Select and delete** (orange)
3. Click on canvas to add points
4. Double-click or "Complete region" to finish
5. For portals, enter target map and player position
6. Export JSON for use in game

## 📁 Project Structure

```
vibe-fantasy/
├── index.html          # Main game
├── game.js             # Game engine
├── map_editor.html     # Map editor
├── map_editor.js       # Editor logic
├── maps.json           # Map configuration
├── village.json        # Village - regions and triggers
├── dungeon.json        # Dungeon - regions and triggers
├── village.png         # Village background
├── dungeon.png         # Dungeon background
├── package.json        # NPM configuration
└── README.md          # This file
```

## 🛠️ Technologies

- **HTML5 Canvas** - Game engine
- **Vanilla JavaScript** - No frameworks
- **Tailwind CSS** - Styling (CDN)
- **Live Server** - Development server
- **GitHub Pages** - Deployment

## 📦 Scripts

```bash
# Development server
npm start

# Create production version
npm run predeploy-gh-pages

# Deploy to GitHub Pages
npm run deploy-gh-pages
```

## 🎯 Usage Examples

### Creating a Trigger
1. In editor, switch to "Text triggers"
2. Draw polygon around area
3. Enter text: `"Welcome to our village!\nYour journey begins here."`
4. Export JSON

### Creating a Portal
1. Switch to "Portals"
2. Draw polygon around portal area
3. Enter text: `"I feel strong energy...\nA portal opens before you."`
4. Enter target map and player position
5. Export JSON

### Impassable Region
1. Switch to "Impassable regions"
2. Draw polygon around building/mountain
3. Export JSON

## 🔧 Configuration

### maps.json structure:
```json
{
  "defaultMap": "village",
  "maps": {
    "village": {
      "name": "Village",
      "background": "village.png",
      "regions": "village.json",
      "description": "Main village of the game",
      "playerStartX": 555,
      "playerStartY": 715
    }
  }
}
```

### village.json structure:
```json
{
  "regions": [
    [{"x": 100, "y": 100}, {"x": 200, "y": 100}, {"x": 200, "y": 200}]
  ],
  "triggers": [
    {
      "polygon": [{"x": 300, "y": 300}, {"x": 400, "y": 300}],
      "text": "Welcome to our village!"
    },
    {
      "polygon": [{"x": 500, "y": 500}, {"x": 600, "y": 500}],
      "text": "Portal to dungeon...",
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

## 🎨 Custom Background

Replace `village.png` or `dungeon.png` with your own images. Images automatically adapt to screen size.

## 🐛 Debug

To display debug information, add `?debug` to the game URL. This will show:
- Colored regions (red - collisions, purple - triggers, green - portals)
- Player position and map name
- Counts of regions and triggers

If the game fails, a detailed error with stack trace is displayed. All errors are logged to browser console.

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributions

Contributions are welcome! Open an issue or pull request.

---

**Vibe Fantasy** - Personal experiment with HTML5 Canvas! 🎮✨ 