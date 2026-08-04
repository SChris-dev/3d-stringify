# 3D Stringify AR

An advanced, gesture-driven 3D WebGL and MediaPipe Hand Landmarker augmented reality experience. Built with **React**, **TypeScript**, and **Three.js**, with styling powered entirely by custom, high-fidelity **Vanilla CSS**.

**Created by SChris** • [GitHub Repository](https://github.com/SChris-dev/3D-stringify)

---

## Key Features

- **Real-Time Hand Tracking**: Uses MediaPipe Hand Landmarker with automatic GPU acceleration support to track up to two hands at 60 FPS.
- **Full Viewport AR Feed**: Integrated front camera mirroring with transparency, zoom, and aspect fit containment controls.
- **Dynamic 3D Geometry Spawning**: Spawn premium 3D wireframe mesh shapes (Cube, Pyramid, Sphere, Torus, Octahedron) floating relative to your hands.
- **Real-Time Physics Particles**: Exploding particles with gravity, drag, and fade simulation trigger on shape crumbling.
- **Flexible Energy Webs**: Connect fingertip lines under different configurations (Skeleton joint-bones, Fingertip loops, or Complete graphs).
- **Hand Bridging**: Form a custom bridge linking left and right fingertips.
- **Modular Codebase**: Split cleanly into React components, custom hooks, constants, and TypeScript types.
- **Zero UI Framework Dependencies**: Styled completely with custom Vanilla CSS featuring glassmorphism overlays, glowing neon hazard buttons, animations, and transitions.

---

## Keyboard Shortcuts

- **`[M] / [m]`**: Switch application mode (Spawner Mode vs. Vision Web Mode).
- **`[S] / [s]`**: Cycle through available spawner shapes.
- **`[1] - [5]`**: Directly select specific shape meshes:
  - `1`: Cube
  - `2`: Pyramid
  - `3`: Sphere
  - `4`: Torus
  - `5`: Octahedron
- **`[H] / [h]`**: Toggle full UI overlay visibility.

---

## Interactive Hand Gestures

- **Spawn Shape**: Present both hands in front of the camera (Spawner Mode). A hover shape will track the midpoint of your palms.
- **Scale Hover Shape**: Double pinch index-thumbs on both hands and expand or contract your hand distance.
- **Pin to World**: Perform a **Prayer Gesture** (press palm centers within 14cm). The shape will pin in place in 3D coordinate space.
- **Grab & Move**: Single pinch near any pinned shape to pick it up, drag to reposition, and release to drop it.
- **Rotate Shape**: Make a **Peace Sign** ✌️ near any pinned shape to spin it in place.
- **Crumble/Explode**: Make a **Fist** ✊ near a pinned shape. The shape will instantly explode into particle bursts and be removed. *(Crumbling is optimized to be highly responsive when making a fist near a shape matching your currently selected shape type).*

---

## Project Structure

```
3D-stringify/
├── index.html                  # HTML entry point (SEO Optimized)
├── package.json                # Project configurations & dependencies
├── src/
│   ├── main.tsx                # React index mount
│   ├── App.tsx                 # Core App controller & gesture handler
│   ├── App.css                 # Custom Vanilla CSS visual rules
│   ├── index.css               # Global canvas & base resets
│   ├── types.ts                # TypeScript Interfaces
│   ├── constants.ts            # Hand indices & standard mappings
│   ├── hooks/
│   │   ├── useMediaPipe.ts     # Webcam & MediaPipe loading hook
│   │   └── useThreeScene.ts    # WebGL canvas & render loop hook
│   └── components/
│       ├── TopBar.tsx          # Top nav display details & badges
│       ├── SettingsPanel.tsx   # Video adjustment & overlay controls drawer
│       └── BottomControls.tsx  # Shape spawner & color themes panel
```

---

## Installation & Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start Dev Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in a secure (HTTPS or localhost) browser.

3. **Build Production Bundle**:
   ```bash
   npm run build
   ```
