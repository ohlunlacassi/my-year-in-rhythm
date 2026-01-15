<script>
  import { onMount } from 'svelte';
  
  export let metrics = {};
  export let master = [];
  
  let visible = false;
  let prefersReducedMotion = false;
  
  const totalDays = master.length;
  const activePercentage = ((metrics.activeDays / totalDays) * 100).toFixed(0);
  const totalMonths = 15;
  
  // Longest streak
  function calculateLongestStreak(data) {
    let maxStreak = 0;
    let currentStreak = 0;
    
    data.forEach(d => {
      if (d.trainingMinutes > 0) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    });
    
    return maxStreak;
  }
  
  const longestStreak = calculateLongestStreak(master);
  
  // Average per month
  const avgHoursPerMonth = (metrics.totalTrainingHours / totalMonths).toFixed(1);
  
  const insights = [
    {
      icon: '/icons/bar-chart.png',
      iconAlt: 'Bar chart showing activity rate',
      text: `Maintained ${activePercentage}% activity rate across ${totalDays} days over 15 months`,
      metric: `${activePercentage}%`,
      label: 'Activity Rate'
    },
    {
      icon: '/icons/muscles.png',
      iconAlt: 'Muscle icon representing training consistency',
      text: `Averaged ${avgHoursPerMonth} training hours per month—consistency over time!`,
      metric: `${avgHoursPerMonth}h`,
      label: 'Monthly Average'
    },
    {
      icon: '/icons/target.png',
      iconAlt: 'Target icon representing peak performance',
      text: `Peak streak: ${longestStreak} consecutive days of unbroken momentum`,
      metric: `${longestStreak} days`,
      label: 'Peak Streak'
    }
  ];
  
  onMount(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    prefersReducedMotion = mediaQuery.matches;
    
    setTimeout(() => visible = true, prefersReducedMotion ? 0 : 400);
  });
</script>

<!-- Live region for metrics announcement -->
<div aria-live="polite" aria-atomic="true" class="sr-only">
  {#if visible}
    Journey highlights: {activePercentage}% activity rate, {avgHoursPerMonth} hours average per month, {longestStreak} days peak streak.
  {/if}
</div>

<div class="conclusion-insights-wrapper">
  <!-- Key Insights -->
  <section 
    class="insights-section"
    aria-labelledby="insights-title"
  >
    <h2 id="insights-title" class="section-title">
      Journey Highlights
    </h2>
    
    <div 
      class="insights-grid" 
      role="list"
      aria-label="Key performance insights"
    >
      {#each insights as insight, i}
        <article 
          class="insight-card"
          role="listitem"
          tabindex="0"
          aria-label="{insight.label}: {insight.metric}. {insight.text}"
        >
          <img 
            src={insight.icon} 
            alt={insight.iconAlt}
            class="insight-icon-img"
            aria-hidden="true"
          />
          <div class="insight-content">
            <p class="insight-text">{insight.text}</p>
            <!-- Hidden metric for screen readers -->
            <span class="sr-only">Metric: {insight.metric}</span>
          </div>
        </article>
      {/each}
    </div>
  </section>

  <!-- Closing Message -->
  <footer 
    class="closing"
    role="contentinfo"
    aria-label="Closing message and call to action"
  >
    <div class="quote">
      <p class="quote-text">
        "From October 2024 to December 2025—every step, every rep, every choice mattered. This is what sustained effort looks like."
      </p>
    </div>
    
    <div class="signature">
      <p class="signature-text">The rhythm continues into 2026.</p>
      <div 
        class="cta"
        role="status"
        aria-label="Call to action: Onward"
      >
        Onward →
      </div>
    </div>
  </footer>
</div>

<style>
  /* Wrapper to contain both sections */
  .conclusion-insights-wrapper {
    height: 100%;
    max-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 40px 24px;
    overflow: hidden;
  }
  
  /* Insights Section */
  .insights-section {
    margin-bottom: 60px;
    flex-shrink: 0;
  }
  
  .section-title {
    text-align: center;
    font-size: 2rem;
    font-weight: 300;
    color: #ffffff;
    margin-bottom: 32px;
  }
  
  .insights-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
  }
  
  .insight-card {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    padding: 24px;
    display: flex;
    gap: 16px;
    align-items: flex-start;
    transition: all 0.3s ease;
    cursor: default;
    outline: none;
  }
  
  .insight-card:hover {
    background: rgba(255, 255, 255, 0.04);
    border-color: rgba(53, 209, 197, 0.2);
    transform: translateY(-2px);
  }
  
  .insight-card:focus {
    outline: 2px solid #35d1c5;
    outline-offset: 2px;
    background: rgba(255, 255, 255, 0.04);
  }
  
  .insight-card:focus:not(:focus-visible) {
    outline: none;
  }
  
  .insight-icon-img {
    width: 24px;
    height: 24px;
    flex-shrink: 0;
    object-fit: contain;
  }
  
  .insight-content {
    flex: 1;
  }
  
  .insight-text {
    color: rgba(255, 255, 255, 0.7);
    line-height: 1.6;
    font-size: 0.95rem;
    margin: 0;
  }
  
  /* Closing */
  .closing {
    text-align: center;
    max-width: 700px;
    margin: 0 auto;
    flex-shrink: 0;
  }
  
  .quote {
    margin-bottom: 24px;
  }
  
  .quote-text {
    font-size: clamp(1.1rem, 2vw, 1.4rem);
    line-height: 1.8;
    color: rgba(255, 255, 255, 0.6);
    font-style: italic;
    font-weight: 300;
    margin: 0;
  }
  
  .signature-text {
    font-size: 1.2rem;
    color: rgba(255, 255, 255, 0.8);
    margin-bottom: 16px;
  }
  
  .cta {
    display: inline-block;
    font-size: 1.5rem;
    font-weight: 300;
    background: linear-gradient(135deg, #35d1c5, #ff7a5c);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: pulse 2s ease-in-out infinite;
  }
  
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.6;
    }
  }
  
  /* Screen reader only */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }
  
  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .insight-card:hover {
      transform: none;
    }
    
    .cta {
      animation: none;
    }
  }
  
  /* High contrast mode */
  @media (prefers-contrast: high) {
    .section-title {
      color: #ffffff;
    }
    
    .insight-card {
      border-color: rgba(255, 255, 255, 0.2);
    }
    
    .insight-card:hover,
    .insight-card:focus {
      border-color: #35d1c5;
    }
    
    .insight-text {
      color: rgba(255, 255, 255, 0.9);
    }
    
    .quote-text {
      color: rgba(255, 255, 255, 0.8);
    }
  }
  
  @media (max-width: 768px) {
    .insights-section {
      margin-bottom: 60px;
    }
    
    .insights-grid {
      grid-template-columns: 1fr;
      gap: 20px;
    }
  }
</style>