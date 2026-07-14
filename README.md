# A1Typing - Professional Typing Practice Platform

A modern, high-performance typing test web application built with **Next.js 15 (v15.2.8)**, **TypeScript**, and **Tailwind CSS**. It is designed for maximum functionality, providing a distraction-free typing flow state.

---

## 🚀 Key Features

### 🎹 Practice Row Categories
Practice typing specific segments of the keyboard to build muscle memory:
* **Home Row Mode:** Focuses exclusively on keys: `a s d f g h j k l ;`
* **Upper Row Mode:** Focuses exclusively on keys: `q w e r t y u i o p`
* **Lower Row Mode:** Focuses exclusively on keys: `z x c v b n m`
* **Full Keyboard Mode:** Full, lowercase meaningful sentences and quotes.
* **Custom Text Mode:** Allows copy-pasting custom text samples. The platform automatically converts all words to lowercase, resolves smart quotes, removes complex special characters wisely, and repeats the sample if it is shorter than the test duration. Direct typing inside the input box is blocked to guarantee correct copy-paste operations.

### 🔊 Mechanical Keyboard Synthesizer
Provides low-latency, Web Audio API-synthesized sound effects modeled after real mechanical switches:
* **Blue Clicky Switch:** High pitch, tactile click.
* **Brown Tactile Switch:** Warm, rounded, subtle click.
* **Red Linear Switch:** Quiet, clean bottom-out sound.
* *Includes real-time volume adjustment and instant mute options.*

### ⚡ Dynamic Flow Glow Visualizer
Innovative aura glowing effect surrounding the card that responds dynamically to your active speed:
* **< 25 WPM (Rhythm):** Soft, breathing blue aura.
* **25–55 WPM (Cruising):** Vibrant, active cyan glow.
* **55–85 WPM (Flow State):** Deep, pulsing fuchsia/purple glow.
* **>= 85 WPM (Hyper Flow!):** Fast-pulsing blazing orange/gold aura.

### ⏱️ Shortcut & Continuous Typing
* **Tab-key Restart:** Press the `Tab` key at any point to instantly restart the test.
* **Continuous Paragraph Engine:** Sentence pool dynamically scales to prevent text running out, supporting short (15s), medium (30s), and long (60s) duration settings.
* **Legible Starting Words:** The text area is fully visible before typing starts, with a blinking start reminder at the bottom of the card.

---

## 🛠️ Tech Stack

* **Framework:** Next.js 15 (v15.2.8 - patched security release)
* **Language:** TypeScript
* **Styling:** Tailwind CSS & Vanilla CSS Transitions
* **Icons:** Lucide React
* **State Management:** React Hooks (`useCallback`, `useRef`, `useState`, `useEffect`)

---

## 📦 Getting Started

### Installation

1. Clone the repository:
   ```bash
   git clone git@github.com:AmanVerma1067/A1Typing.git
   cd A1Typing
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the local development server:
   ```bash
   npm run dev
   ```

4. Open your browser and visit `http://localhost:3000`.

---

## 📝 License

This project is licensed under the MIT License.
