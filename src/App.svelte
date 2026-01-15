<script>
  import { onMount } from 'svelte';
  import Landing from './components/Landing.svelte';
  import ScrollSection from './components/ScrollSection.svelte';
  import PlaceholderViz from './components/PlaceholderViz.svelte';
  import MetricsCard from './components/MetricsCard.svelte';
  import RunningTrack from './components/RunningTrack.svelte';
  import ProgressBar from './components/ProgressBar.svelte';
  import Waveform from './components/Waveform.svelte';
  import HeartVisualization from './components/HeartVisualization.svelte';
  import ActivityBreakdown from './components/ActivityBreakdown.svelte';
  import ProgressMilestones from './components/ProgressMilestones.svelte';
  import EventImpactAnalysis from './components/EventImpactAnalysis.svelte';
  import ConclusionHero from './components/ConclusionHero.svelte';
  import ConclusionInsights from './components/ConclusionInsights.svelte';
  
  import { loadData } from './utils/dataLoader.js';
  import { wrangleData } from './utils/dataWrangler.js';
  import { calculateMetrics } from './utils/calculations.js';
  
  let currentSection = 0;
  let scrollContainer;
  let prefersReducedMotion = false;
  
  const totalSections = 10;  // ← เปลี่ยนจาก 9 เป็น 10!
  
  let metrics = {
    totalTrainingHours: 0,
    activeDays: 0,
    pauseDays: 0
  };

  let totalSteps = 0; 
  
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
      // Check for reduced motion preference
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      prefersReducedMotion = mediaQuery.matches;
      
      // Listen for changes to reduced motion preference
      mediaQuery.addEventListener('change', (e) => {
        prefersReducedMotion = e.matches;
      });
      
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

      totalSteps = master.reduce((sum, d) => sum + (d.steps || 0), 0);
      
      dataLoaded = true;
      console.log('✅ Final metrics:', metrics);
      console.log('📊 Total steps:', totalSteps.toLocaleString());
      
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
    
    // Keyboard navigation
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        navigateToSection(currentSection + 1);
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        navigateToSection(currentSection - 1);
      } else if (e.key === 'Home') {
        e.preventDefault();
        navigateToSection(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        navigateToSection(totalSections - 1);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', handleScroll);
      }
      document.removeEventListener('keydown', handleKeyDown);
    };
  });
  
  function handleScroll() {
    if (!scrollContainer) return;
    const scrollTop = scrollContainer.scrollTop;
    const sectionHeight = scrollContainer.offsetHeight;
    const newSection = Math.round(scrollTop / sectionHeight);
    currentSection = Math.min(Math.max(0, newSection), totalSections - 1);
  }
  
  function navigateToSection(sectionIndex) {
    if (!scrollContainer) return;
    const targetSection = Math.min(Math.max(0, sectionIndex), totalSections - 1);
    const sectionHeight = scrollContainer.offsetHeight;
    scrollContainer.scrollTo({
      top: targetSection * sectionHeight,
      behavior: prefersReducedMotion ? 'auto' : 'smooth'
    });
  }
  
  function handleTrackFilter(event) {
    selectedSport = event.detail.sport;
    console.log('Selected sport:', selectedSport);
  }
  
  function handleProgressBarClick(event) {
    const sectionIndex = event.detail.section;
    navigateToSection(sectionIndex);
  }
</script>

<ProgressBar 
  total={totalSections} 
  current={currentSection}
  on:navigate={handleProgressBarClick}
/>

<!-- Skip to content link for keyboard users -->
<a href="#main-content" class="skip-link">Skip to main content</a>

<div 
  class="scroll-wrapper" 
  bind:this={scrollContainer}
  role="main"
  id="main-content"
  aria-label="Fitness data story sections"
>
  <!-- Landing Page -->
  <section class="section-slide" aria-label="Landing page">
    <Landing />
  </section>

  <!-- Pulse & Pause Section -->
  <section class="section-slide" aria-label="Pulse and Pause metrics">
    <ScrollSection 
      title="Pulse & Pause"
      description="The year's performance summarized in key metrics"
      dark={true}
      infoTooltip="My fitness journey distilled into three core metrics: total training hours accumulated, days I stayed active, and rest days taken. Together they paint the rhythm of my year."
    >
      {#if dataLoaded}
        <div class="metrics-grid" role="list" aria-label="Key fitness metrics">
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
        <div class="loading-state" role="status" aria-live="polite">
          <p>Loading metrics...</p>
        </div>
      {/if}
    </ScrollSection>
  </section>

  <!-- Steps Traveled Section -->
  <section class="section-slide" aria-label="Steps traveled visualization">
    <ScrollSection 
      title="Steps Traveled"
      description="The cumulative journey of every step taken"
      dark={true}
      infoTooltip="Cumulative step tracker with running track visualization. Shows total steps taken throughout the year and converts them to kilometers. The animated runner progresses around the track to represent your journey."
    >
      {#if dataLoaded}
        <RunningTrack master={master} />
      {:else}
        <PlaceholderViz height="600px" label="Running Track" />
      {/if}
    </ScrollSection>
  </section>

  <!-- The Ups and Downs Section -->
  <section class="section-slide" aria-label="Training intensity waveform">
    <ScrollSection 
      title="The Ups and Downs"
      description="Daily training intensity visualized as a rhythmic waveform"
      dark={true}
      infoTooltip="Weekly training intensity shown as ECG-style heartbeats. Higher spikes = more training that week. Flat periods (no spikes) indicate rest weeks—labels show which life events occurred during those breaks (health appointments, study periods, holidays, etc.), explaining why training was paused."
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
  </section>

  <!-- Energy Expenditure Section -->
  <section class="section-slide" aria-label="Energy expenditure visualization">
    <ScrollSection 
      title="Energy Expenditure"
      description="Living heartbeat of my fitness journey"
      dark={true}
      infoTooltip="Total calories burned across all activities. Each colored dot represents energy from different sports, radiating outward from the heart center like a burst of activity."
    >
      {#if dataLoaded}
        <HeartVisualization sportRecords={rawSportRecords} />
      {:else}
        <div class="loading-state" role="status" aria-live="polite">Loading visualization...</div>
      {/if}
    </ScrollSection>
  </section>

  <!-- Activity Breakdown Section -->
  <section class="section-slide" aria-label="Activity breakdown by sport type">
    {#if dataLoaded}
      <ActivityBreakdown sportData={sportData} />
    {:else}
      <PlaceholderViz height="600px" label="Activity Breakdown" />
    {/if}
  </section>

  <!-- The Rhythm of Progress Section -->
  <section class="section-slide" aria-label="Training progress over time">
    <ScrollSection 
      title="The Rhythm of Progress"
      description="How training evolved throughout the year"
      dark={true}
      infoTooltip="Cumulative training hours over the year starting from Oct'24. Milestones at every 50 hours show progress checkpoints. The time gap between consecutive milestones reveals my training pace during that period—shorter gaps mean higher weekly hours, longer gaps indicate lighter training phases."
    >
      {#if dataLoaded}
        <ProgressMilestones 
          sportRecords={rawSportRecords}
          fitnessDaily={master}
        />
      {:else}
        <PlaceholderViz height="450px" label="Progress Timeline" />
      {/if}
    </ScrollSection>
  </section>

  <!-- Life Events & Training Section -->
  <section class="section-slide" aria-label="Life events impact on training">
    <ScrollSection 
      title="Life events impact on training"
      description="Average training minutes on event days despite busy schedules vs. normal routine"
      dark={true}
      infoTooltip="Compares average training minutes on days with specific events versus normal days (baseline). Only active days (training > 0 min) are included. Categories need 5+ active days for statistical reliability. Percentage shows change from baseline: +6% means 6% more training on those event days."
    >
      {#if dataLoaded}
        <EventImpactAnalysis 
          master={master}
          calendar={rawCalendar}
        />
      {:else}
        <PlaceholderViz height="500px" label="Event Impact Analysis" />
      {/if}
    </ScrollSection>
  </section>

  <!-- Conclusion Hero Section (Section 9) -->
  <section class="section-slide conclusion-hero-section" aria-label="Journey conclusion hero">
    {#if dataLoaded}
      <div class="conclusion-container">
        <ConclusionHero />
      </div>
    {:else}
      <PlaceholderViz height="600px" label="Conclusion Hero" />
    {/if}
  </section>

  <!-- Conclusion Insights Section (Section 10) -->
  <section class="section-slide conclusion-insights-section" aria-label="Journey insights and summary">
    {#if dataLoaded}
      <div class="conclusion-container">
        <ConclusionInsights 
          metrics={{
            activeDays: metrics.activeDays,
            pauseDays: metrics.pauseDays,
            totalTrainingHours: metrics.totalTrainingHours
          }}
          master={master}
        />
      </div>
    {:else}
      <PlaceholderViz height="600px" label="Journey Insights" />
    {/if}
  </section>

</div>

<style>
  :global(html) {
    overflow-x: hidden;
    width: 100%;
    max-width: 100vw;
    scrollbar-width: none;
  }
  
  :global(html::-webkit-scrollbar) {
    display: none;
    width: 0;
  }
  
  :global(body) {
    background: #0a0a0a;
    margin: 0;
    padding: 0;
    overflow-x: hidden;
    width: 100%;
    max-width: 100vw;
    scrollbar-width: none;
  }
  
  :global(body::-webkit-scrollbar) {
    display: none;
    width: 0;
  }
  
  /* Hide all scrollbars globally */
  :global(*) {
    scrollbar-width: none;
  }
  
  :global(*::-webkit-scrollbar) {
    display: none;
    width: 0;
    height: 0;
  }
  
  /* Skip Link for accessibility */
  .skip-link {
    position: absolute;
    top: -40px;
    left: 0;
    background: #35d1c5;
    color: #0a0a0a;
    padding: 8px 16px;
    text-decoration: none;
    font-family: monospace;
    font-weight: bold;
    z-index: 10000;
    border-radius: 0 0 4px 0;
  }
  
  .skip-link:focus {
    top: 0;
  }
  
  .scroll-wrapper {
    height: 100vh;
    width: 100%;
    max-width: 100vw;
    overflow-y: scroll;
    overflow-x: hidden;
    scroll-snap-type: y mandatory;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  
  .scroll-wrapper::-webkit-scrollbar {
    display: none;
    width: 0;
    height: 0;
    background: transparent;
  }
  
  .scroll-wrapper::-webkit-scrollbar-thumb {
    display: none;
  }
  
  .scroll-wrapper::-webkit-scrollbar-track {
    display: none;
  }
  
  /* Respect reduced motion preference */
  @media (prefers-reduced-motion: reduce) {
    .scroll-wrapper {
      scroll-behavior: auto;
    }
    
    :global(*) {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
  
  .section-slide {
    width: 100%;
    max-width: 100vw;
    min-height: 100vh;
    scroll-snap-align: start;
    scroll-snap-stop: always;
    background: #0a0a0a; /* Consistent dark background for all sections */
    overflow-x: hidden;
    overflow-y: auto;
  }
  
  /* Conclusion sections styling */
  .conclusion-hero-section,
  .conclusion-insights-section {
    background: linear-gradient(180deg, #0a0a0a 0%, #0f0f0f 50%, #0a0a0a 100%);
  }
  
  .conclusion-container {
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 80px 24px;
    overflow-x: hidden;
  }
  
  /* Focus styles for keyboard navigation */
  .scroll-wrapper:focus {
    outline: 2px solid #35d1c5;
    outline-offset: -2px;
  }
  
  .scroll-wrapper:focus:not(:focus-visible) {
    outline: none;
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
    
    .conclusion-container {
      padding: 60px 20px;
    }
  }
  
  @media (max-width: 768px) {
    .metrics-placeholder {
      grid-template-columns: 1fr;
      gap: 24px;
    }
  }
</style>