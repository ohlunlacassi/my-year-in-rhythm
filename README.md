# My Year in Rhythm - Scrollytelling Edition 📜

A single-page scrollytelling experience visualizing a full year of fitness data with smooth scroll animations.

## 🎨 Design Features

✅ **Black/Dark Gray Background** with off-white/white text  
✅ **Landing Page** with project introduction  
✅ **Smooth Scroll Animations** with intersection observer  
✅ **Multiple Scroll Sections** for different data stories  
✅ **Placeholder Visualizations** ready for real data  
✅ **Fully Responsive** design  

## 🚀 Quick Start

```bash
cd my-year-rhythm-svelte-scrollytelling
npm install
npm run dev
```

Open: **http://localhost:5173**

## 📐 Page Structure

```
┌─────────────────────────────────┐
│ Landing Page                    │
│ - Title: "My Year in Rhythm"    │
│ - Project description           │
│ - Scroll indicator              │
└─────────────────────────────────┘
           ↓ scroll
┌─────────────────────────────────┐
│ Pulse & Pause                   │
│ - 3 metric cards (placeholders) │
└─────────────────────────────────┘
           ↓ scroll
┌─────────────────────────────────┐
│ The Ups and Downs               │
│ - Waveform visualization        │
└─────────────────────────────────┘
           ↓ scroll
┌─────────────────────────────────┐
│ Time Investments                │
│ - Sport breakdown chart         │
│ - Key insights panel            │
└─────────────────────────────────┘
           ↓ scroll
┌─────────────────────────────────┐
│ The Rhythm of Progress          │
│ - Progress timeline             │
└─────────────────────────────────┘
           ↓ scroll
┌─────────────────────────────────┐
│ Life Events & Training          │
│ - Calendar overlay              │
└─────────────────────────────────┘
           ↓ scroll
┌─────────────────────────────────┐
│ Footer                          │
└─────────────────────────────────┘
```

## 📁 New Components

```
src/components/
├── Landing.svelte          ← Hero section with fade-in
├── ScrollSection.svelte    ← Reusable scroll container
└── PlaceholderViz.svelte   ← Visualization placeholders
```

## 🔄 Replacing Placeholders with Real Data

### Step 1: Uncomment Data Loading in `App.svelte`

```svelte
<script>
  // Uncomment these lines:
  import { onMount } from 'svelte';
  import { loadData } from './utils/dataLoader.js';
  import MetricsCard from './components/MetricsCard.svelte';
  import Waveform from './components/Waveform.svelte';
  import DonutChart from './components/DonutChart.svelte';
  
  let master = [];
  let metrics = {};
  
  onMount(async () => {
    const data = await loadData();
    // ... data processing
  });
</script>
```

### Step 2: Replace PlaceholderViz Components

**Metrics Section - Replace:**
```svelte
<PlaceholderViz height="300px" label="Total Training Duration" />
```

**With:**
```svelte
<MetricsCard
  title="Total Training Duration"
  value={Math.round(metrics.totalTrainingHours || 0)}
  unit="hours"
/>
```

**Waveform Section - Replace:**
```svelte
<PlaceholderViz height="500px" label="Waveform Visualization" />
```

**With:**
```svelte
<Waveform {master} sportFilter={currentFilter} />
```

**Donut Section - Replace:**
```svelte
<PlaceholderViz height="400px" label="Sport Breakdown" />
```

**With:**
```svelte
<DonutChart {master} on:sportSelect={handleSportFilter} />
```

## 🎨 Customization

### Adjust Scroll Threshold

In `ScrollSection.svelte`, change when sections become visible:

```javascript
const observer = new IntersectionObserver(
  (entries) => { /* ... */ },
  { threshold: 0.2 } // ← 0.0 = immediately, 1.0 = fully in view
);
```

### Change Background Colors

```svelte
<ScrollSection dark={true}>  <!-- Black background -->
<ScrollSection dark={false}> <!-- Dark gray background -->
```

### Add New Section

```svelte
<ScrollSection 
  title="Your Title"
  description="Your description"
  dark={true}
>
  <!-- Your content here -->
</ScrollSection>
```

## 📱 Responsive Breakpoints

- **Mobile:** < 768px (single column)
- **Tablet:** 768px - 968px (adapted layout)
- **Desktop:** > 968px (full layout)

## 🚀 Deployment

```bash
# Build
npm run build

# Test production build
npm run preview

# Deploy (choose one):

# 1. Netlify Drop
#    → Drag 'dist' folder to https://app.netlify.com/drop

# 2. Vercel
npm i -g vercel
vercel

# 3. GitHub Pages
#    → Upload 'dist' contents to gh-pages branch
```

## ✨ Features Included

- ✅ Smooth scroll behavior
- ✅ Fade-in animations on scroll
- ✅ Intersection observer for performance
- ✅ Custom scrollbar styling
- ✅ Responsive typography
- ✅ Dark theme optimized
- ✅ Accessible contrast ratios

## 🎯 Current Status

**READY FOR DATA** - All placeholders are in place and ready to be replaced with real visualizations.

## 📝 TODO

- [ ] Add your CSV files to `public/data/`
- [ ] Uncomment data loading in `App.svelte`
- [ ] Replace PlaceholderViz with real components
- [ ] Test with real data
- [ ] Fine-tune animations
- [ ] Deploy!

---

**Happy scrollytelling!** 🎉
