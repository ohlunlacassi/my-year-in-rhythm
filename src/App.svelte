<script>
  import { onMount } from 'svelte';
  import Landing from './components/Landing.svelte';
  import ScrollSection from './components/ScrollSection.svelte';
  import PlaceholderViz from './components/PlaceholderViz.svelte';
  import MetricsCard from './components/MetricsCard.svelte';
  import ProgressBar from './components/ProgressBar.svelte';
  import Waveform from './components/Waveform.svelte';
  import TrackBreakdown from './components/TrackBreakdown.svelte';
  import HeartVisualization from './components/HeartVisualization.svelte';
  
  import { loadData } from './utils/dataLoader.js';
  import { wrangleData } from './utils/dataWrangler.js';
  import { calculateMetrics } from './utils/calculations.js';
  
  let currentSection = 0;
  let scrollContainer;
  
  const totalSections = 7;
  
  let metrics = {
    totalTrainingHours: 0,
    activeDays: 0,
    pauseDays: 0
  };
  
  let master = [];
  let rawSportRecords = [];
  let rawCalendar = [];
  let dataLoaded = false;
  let selectedSport = null;
  let sportData = [];
  
  const sportPatterns = {
    'outdoor_running': { color: '#35d1c5', label: 'Running' },
    'outdoor_walking': { color: '#00d4ff', label: 'Walking' },
    'aerobics': { color: '#ff0080', label: 'Aerobics' },
    'mixed_aerobics': { color: '#ff3399', label: 'Mixed Aerobics' },
    'yoga': { color: '#9d4edd', label: 'Yoga' },
    'free_training': { color: '#06ffa5', label: 'Free Training' },
    'upper_limb_training': { color: '#ffbe0b', label: 'Upper Body' },
    'lower_limb_training': { color: '#fb5607', label: 'Lower Body' },
    'core_training': { color: '#ff006e', label: 'Core' },
    'physical_training': { color: '#8338ec', label: 'Physical' },
    'pilates': { color: '#c77dff', label: 'Pilates' },
    'flexibility_training': { color: '#e0aaff', label: 'Flexibility' },
    'indoor_walking': { color: '#48cae4', label: 'Indoor Walking' },
    'indoor_riding': { color: '#0096c7', label: 'Indoor Cycling' },
    'weight_lifting': { color: '#ff9500', label: 'Weight Lifting' },
    'waist_training': { color: '#ff6b6b', label: 'Waist' },
    'back_training': { color: '#ffd166', label: 'Back' },
    'high_interval_training': { color: '#ef233c', label: 'HIIT' },
  };
  
  onMount(async () => {
    try {
      console.log('Starting to load data...');
      
      const rawData = await loadData();
      console.log('Data loaded:', rawData);
      
      rawSportRecords = rawData.sportRecords;
      rawCalendar = rawData.calendar;
      console.log('📅 Calendar data:', rawCalendar);
      console.log('📅 Sending to Waveform:', {
        sportRecords: rawSportRecords.length,
        calendar: rawCalendar.length
      });
      
      master = wrangleData(
        rawData.fitnessDaily,
        rawData.sportRecords,
        rawData.calendar
      );
      
      const calculatedMetrics = calculateMetrics(master);
      console.log('Calculated metrics:', calculatedMetrics);
      
      metrics = {
        totalTrainingHours: Math.round(calculatedMetrics.totalTrainingHours),
        activeDays: calculatedMetrics.activeDays,
        pauseDays: calculatedMetrics.pauseDays
      };
      
      dataLoaded = true;
      console.log('✅ Final metrics:', metrics);
      
      // Process sport data for legend
      if (rawSportRecords.length > 0) {
        const sportTotals = {};
        rawSportRecords.forEach(record => {
          const sport = record.key;
          const calories = record.calories || 0;
          if (!sportTotals[sport]) {
            sportTotals[sport] = 0;
          }
          sportTotals[sport] += calories;
        });
        
        sportData = Object.entries(sportTotals)
          .map(([sport, calories]) => ({
            sport,
            calories: Math.round(calories),
            caloriesK: (calories / 1000).toFixed(1),
            color: sportPatterns[sport]?.color || '#35d1c5',
            label: sportPatterns[sport]?.label || sport.replace(/_/g, ' ')
          }))
          .filter(d => d.calories > 0 && d.sport !== 'rope_skipping')
          .sort((a, b) => b.calories - a.calories);
      }
      
    } catch (error) {
      console.error('❌ Error loading data:', error);
    }
    
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
    }
    
    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', handleScroll);
      }
    };
  });
  
  function handleScroll() {
    if (!scrollContainer) return;
    const scrollTop = scrollContainer.scrollTop;
    const sectionHeight = scrollContainer.offsetHeight;
    const newSection = Math.round(scrollTop / sectionHeight);
    currentSection = Math.min(Math.max(0, newSection), totalSections - 1);
  }
  
  function handleTrackFilter(event) {
    selectedSport = event.detail.sport;
    console.log('Selected sport:', selectedSport);
  }
</script>

<ProgressBar total={totalSections} current={currentSection} />

<div class="scroll-wrapper" bind:this={scrollContainer}>
  <!-- Landing Page -->
  <div class="section-slide">
    <Landing />
  </div>

  <!-- Pulse & Pause Section -->
  <div class="section-slide">
    <ScrollSection 
      title="Pulse & Pause"
      description="The year's performance summarized in key metrics"
    >
      {#if dataLoaded}
        <div class="metrics-grid">
          <MetricsCard 
            title="Total Training Duration" 
            value={metrics.totalTrainingHours} 
            unit="hours" 
          />
          <MetricsCard 
            title="Active Days" 
            value={metrics.activeDays} 
            unit="days" 
          />
          <MetricsCard 
            title="Pause Days" 
            value={metrics.pauseDays} 
            unit="days" 
          />
        </div>
      {:else}
        <div class="loading-state">
          <p>Loading metrics...</p>
        </div>
      {/if}
    </ScrollSection>
  </div>

  <!-- The Ups and Downs Section -->
  <div class="section-slide">
  <ScrollSection 
    title="The Ups and Downs"
    description="Daily training intensity visualized as a rhythmic waveform"
    dark={true}
  >
    {#if dataLoaded}
      <Waveform 
        sportRecords={rawSportRecords} 
        calendar={rawCalendar}
        filterSport={selectedSport} 
      />
    {:else}
      <PlaceholderViz height="400px" label="Waveform Visualization" />
    {/if}
  </ScrollSection>
</div>

  <!-- Energy Expenditure Section -->
  <div class="section-slide">
    <ScrollSection 
      title="Energy Expenditure"
      description="Living heartbeat of your fitness journey"
      dark={true}
    >
      {#if dataLoaded}
        <HeartVisualization sportRecords={rawSportRecords} />
      {:else}
        <div class="loading-state">Loading visualization...</div>
      {/if}
    </ScrollSection>
  </div>

  <!-- Activity Breakdown Section (Legend) -->
  <div class="section-slide legend-section">
    {#if dataLoaded && sportData.length > 0}
      <div class="legend-wrapper">
        <div class="legend-grid">
          {#each sportData as sport}
            <div class="legend-item">
              <span class="legend-pulse" style="background: {sport.color}"></span>
              <span class="legend-label">{sport.label}</span>
              <span class="legend-calories">{sport.caloriesK} kcal</span>
            </div>
          {/each}
        </div>
      </div>
    {/if}
  </div>

  <!-- The Rhythm of Progress Section -->
  <div class="section-slide">
    <ScrollSection 
      title="The Rhythm of Progress"
      description="How training evolved throughout the year"
      dark={true}
    >
      <PlaceholderViz height="450px" label="Progress Timeline" />
    </ScrollSection>
  </div>

  <!-- Life Events & Training Section -->
  <div class="section-slide">
    <ScrollSection 
      title="Life Events & Training"
      description="The intersection of everyday life and fitness routine"
    >
      <PlaceholderViz height="500px" label="Calendar Overlay Visualization" />
    </ScrollSection>
  </div>
</div>

<!-- Footer -->
<footer class="footer">
  <div class="footer-content">
    <p class="footer-text">Data source: Mi Fitness (Oct 2024 - Dec 2024)</p>
    <p class="footer-credit">Designed & Built by Phatjira Rungsakullikit</p>
  </div>
</footer>

<style>
  :global(body) {
    background: #0a0a0a;
    margin: 0;
    padding: 0;
  }
  
  .scroll-wrapper {
    height: 100vh;
    overflow-y: scroll;
    overflow-x: hidden;
    scroll-snap-type: y mandatory;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
  }
  
  .scroll-wrapper::-webkit-scrollbar {
    display: none;
  }
  
  .section-slide {
    width: 100vw;
    min-height: 100vh;
    scroll-snap-align: start;
    scroll-snap-stop: always;
  }
  
  /* Metrics Grid */
  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 32px;
    max-width: 1100px;
    margin: 0 auto;
  }
  
  .loading-state {
    text-align: center;
    color: rgba(255, 255, 255, 0.5);
    padding: 60px;
  }
  
  .metrics-placeholder {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 32px;
  }
  
  .split-layout {
    display: grid;
    grid-template-columns: 1.5fr 1fr;
    gap: 60px;
    align-items: center;
  }
  
  .insights {
    padding: 40px;
    background: rgba(255, 255, 255, 0.02);
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.06);
  }
  
  .insights h3 {
    font-size: 1.5rem;
    font-weight: 400;
    color: #ffffff;
    margin-bottom: 16px;
  }
  
  .insights p {
    font-size: 1rem;
    line-height: 1.7;
    color: rgba(255, 255, 255, 0.6);
  }
  
  .footer {
    padding: 80px 24px;
    background: #000000;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
  }
  
  .footer-content {
    max-width: 1200px;
    margin: 0 auto;
    text-align: center;
  }
  
  .footer-text {
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.4);
    margin-bottom: 8px;
  }
  
  .footer-credit {
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.3);
  }
  
  .legend-section {
    background: #0f0f0f;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 60px 24px;
  }
  
  .legend-wrapper {
    max-width: 1200px;
    width: 100%;
  }
  
  .legend-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    width: 100%;
  }
  
  .legend-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    font-family: monospace;
    transition: all 0.3s ease;
  }
  
  .legend-item:hover {
    background: rgba(255, 255, 255, 0.05);
    transform: translateY(-2px);
  }
  
  .legend-pulse {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    flex-shrink: 0;
    animation: pulse-dot 2s ease-in-out infinite;
    box-shadow: 0 0 10px currentColor;
  }
  
  @keyframes pulse-dot {
    0%, 100% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(1.3);
      opacity: 0.7;
    }
  }
  
  .legend-label {
    flex: 1;
    font-size: 0.9rem;
    color: rgba(255, 255, 255, 0.7);
  }
  
  .legend-calories {
    font-size: 0.9rem;
    color: rgba(255, 122, 92, 0.9);
    font-weight: bold;
  }
  
  @media (max-width: 968px) {
    .metrics-grid {
      grid-template-columns: 1fr;
      gap: 24px;
      padding: 0 20px;
    }
    
    .split-layout {
      grid-template-columns: 1fr;
      gap: 40px;
    }
    
    .insights {
      padding: 32px;
    }
  }
  
  @media (max-width: 768px) {
    .metrics-placeholder {
      grid-template-columns: 1fr;
      gap: 24px;
    }
    
    .legend-grid {
      grid-template-columns: 1fr;
    }
    
    .legend-section {
      padding: 40px 20px;
    }
  }
</style>