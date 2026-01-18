# My Year in Rhythm 🎵

**My Year in Rhythm** is a personal fitness data visualization project that transforms raw Mi Fitness and calendar data into a story-driven, interactive dashboard.

The project covers training data from **October 2024 to December 2025** and focuses on revealing long-term patterns, rhythm, and interruptions in everyday training — not just performance, but how life events shape consistency.

The visualization is designed as a scrollytelling experience and is **optimized for tablets and desktop computers**.

---

## ✨ Features

### Pulse & Pause 💓

Three animated metric cards summarize the year at a glance: total training time, active days, and rest days.

### Steps Traveled 🏃

An animated running track visualizes total steps and distance, enhanced with a playful real-world comparison.

### The Ups and Downs 🌊

A heartbeat-style waveform shows daily training intensity across the year. Users can filter by sport, while key life events are marked directly on the timeline.

### Energy Expenditure 💗

A central beating heart visualizes total calories burned. Surrounding color-coded pulses represent different sports, showing how each activity contributes to overall energy expenditure.

### The Rhythm of Progress 🎯

An interactive timeline tracks training progress over time, highlighting milestones, pace changes, and cumulative statistics.

### Life Events Impact on Training 📊

A simple comparison chart shows how health appointments and study-related events affected average training time compared to normal days.

---

## 📱 Device Optimization

- **Desktop**: Full experience with all visualizations
- **Tablet**: Optimized for landscape orientation
- **Smartphones**: Blocked with a device requirement overlay

This project is intentionally designed for **screens ≥ 668px**. Smaller devices display a message prompting users to switch to a larger screen.

---

## 🎨 Design System

### Color Palette

- **Primary**: Turquoise (`#35d1c5`) – highlights and key metrics
- **Secondary**: Coral (`#ff7a5c`) – slower pace and warnings
- **Success**: Green (`#06ffa5`) – fast pace indicators
- **Background**: Dark (`#0a0a0a`)
- **Text**: White with subtle opacity variations

### Typography

- **Font**: Monospace throughout, reinforcing a data-driven aesthetic
- **Hierarchy**: Bold section headers, weighted statistics, understated labels

---

## 🛠 Tech Stack

### Core

- **Svelte** – Reactive UI framework
- **D3.js** – Data-driven SVG visualizations
- **Vite** – Development server and build tool

### Interaction & Animation

- Scroll-snap navigation (horizontal scrollytelling)
- Intersection Observer for scroll-triggered animations
- Custom easing functions for smooth motion
- GPU-accelerated CSS and SVG animations

---

## 📂 Data & Preprocessing

### Data Sources

The project uses anonymized personal data:

- **Fitness data** exported from Mi Fitness (CSV)
- **Calendar data** including personal events and public holidays

All data required to run the visualization is already included in the repository.

---

### Calendar Data Preprocessing (`calendar_viz/`)

The `calendar_viz` folder contains a **separate preprocessing workflow** used to transform raw calendar files into clean, visualization-ready datasets.

**What it does**

- Converts `.ics` calendar files to `.csv`
- Merges multiple calendars (personal, reminders, public holidays)
- Filters relevant event types (e.g. health, study, holidays)
- Normalizes dates and event labels

**Structure**

- `raw/` – Original `.ics` calendar files
- `processed/` – Cleaned and filtered CSV outputs
- `convert.py` – Python script handling conversion and filtering

**Important note**  
This preprocessing step is **not required** to run the website.  
The final processed files are already copied to:

public/data/

The Svelte application only reads data from this folder.  
`calendar_viz` is included for **transparency and documentation**, showing how raw personal data was transformed.

---

### Data Used by the Web Application

The visualization loads static CSV files from:

public/data/

- `fitness_daily.csv` – Daily training duration and intensity
- `sport_record.csv` – Calories burned per activity
- `calendar.csv` – Filtered life events used for annotations and comparisons

No backend services or external APIs are required.

---

## 🚀 Getting Started

### Prerequisites

- Node.js 16+
- npm

### Installation & Development

```bash
npm install
npm run dev
```

Open http://localhost:5173 to view the project locally.

```bash
Production Build
npm run build
npm run preview
```

The production build generates static assets in the dist/ folder and can be deployed to any static hosting service (e.g. Netlify or Vercel).

## 🧪 Reproducibility Notes

The project runs out of the box using the included data.

Re-running calendar_viz/convert.py is optional and only needed when new .ics files are added.

All personal data has been anonymized and reduced to non-identifiable aggregates.

## 📄 License

This project was created for academic purposes.
