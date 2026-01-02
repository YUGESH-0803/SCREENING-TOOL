# NeuroScreen

An interactive, performance-based screening tool for the early detection of neurological markers. This tool uses quantitative data from motor-reaction tests and cognitive tasks to generate a standardized health report.

## 🚀 How to Run

### Option 1: Live Demo (Easiest)
This app is designed to be hosted on **Vercel** or **Netlify**. 
1. Push this code to a GitHub repository.
2. Connect the repository to [Vercel](https://vercel.com).
3. The app will be built and hosted automatically at a public URL.

### Option 2: Local Development
1. Clone the repository.
2. Run a local web server (e.g., `npx serve .` or use the VS Code Live Server extension).
3. Open `index.html` in your browser.

## 🧠 Screening Modules

The assessment consists of 5 specialized rounds:
1. **Self-Report Questionnaire**: Capture subjective neurological symptoms.
2. **Motor Reaction Speed**: Measures processing speed and motor consistency.
3. **Visual Memory Span**: Tests short-term spatial recall (Pattern Memory).
4. **Cognitive Control (Stroop)**: Evaluates executive inhibitory control.
5. **Visuospatial Planning**: Measures executive sequencing and planning.

## 📊 Analysis Engine

NeuroScreen uses a **deterministic algorithmic model** to process results. It calculates a "Health Index" by comparing your performance against established baseline thresholds for:
- Motor Latency (optimal < 350ms)
- Memory Retention (optimal > 4 levels)
- Inhibitory Accuracy (optimal > 90%)

## 📄 Privacy & Security
This application is **Client-Side Only**. All performance data is processed locally in your browser and is never uploaded to a server. PDF reports are generated locally and are not stored in any database.

---
**Disclaimer:** *NeuroScreen is a screening tool, not a clinical diagnostic device. Results should be interpreted by a board-certified neurologist.*
