# Bubble Dojotoon

A sensory rich bubble game to free butterflies, designed for accessibility and delight.

## 🦋 Project Description
Bubble Dojotoon is an accessible, joyful game where players pop floating glass-like bubbles to free colorful butterflies. Designed for children and anyone who loves gentle, sensory play, the game features large interactive zones, calming visuals, and friendly sound design. After freeing butterflies, players celebrate with confetti and can take a selfie with their device's camera.

## 🛠 Tech Stack
- React (JavaScript)
- TailwindCSS
- Framer Motion (floating and popping animation)
- Lottie React (butterfly flight and celebration animations)
- GLSL Shader (via Three.js / react-three-fiber) for glass-like bubble effects
- Google Font: Pixelify Sans
- shadcn/ui for UI components
- Webcam API (getUserMedia) for selfie capture

## 🐣 Game Flow
- **Start Screen:** Simple "Start" button.
- **Main Game:**
  - 2 or 3 large water bubbles float on screen at a time.
  - Each bubble contains a solid-color butterfly (Lottie animation).
  - Bubbles float and move randomly (Framer Motion, spring physics).
  - Tap/click a bubble to pop it, then the butterfly flies away with celebration (Lottie + confetti + sound).
  - After one is popped, another appears, keeping a max of 3 at a time.
- **Victory:**
  - After freeing a few butterflies (e.g. 5), a celebration screen appears.
  - Player is prompted to take a selfie using the webcam.
  - Confetti and mascot animation play with sound: “Congratulations!” (accessible toggle for sound).

## 🌈 Visual and Interaction Design
- Large glass-like bubbles with GLSL shaders for reflection and fluid motion.
- Bold, solid-colored butterflies with minimal contrast backgrounds for clarity.
- All interactions are one-tap, no dragging or complex gestures.
- Framer Motion for soft floating and bounce effects.
- Lottie for magical, expressive butterfly flight.

## ♿ Accessibility Features
- One-finger tap to play
- Large hitboxes on bubbles
- No timers or penalties
- Friendly narration and optional sound toggle
- Calming visuals and motion, friendly voiceovers

## 🚀 Getting Started

1. **Install dependencies:**
   ```sh
   npm install
   ```
2. **Start the development server:**
   ```sh
   npm run dev
   ```
3. **Open your browser:**
   Visit `http://localhost:8080` (or as indicated in your terminal)

---

Enjoy freeing butterflies and celebrating every victory!
