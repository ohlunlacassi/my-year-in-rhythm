<script>
  export let sportData = [];
  
  // Calculate total calories with safety check
  $: totalCalories = sportData.length > 0 
    ? sportData.reduce((sum, s) => sum + (Number(s.caloriesK) || 0), 0)
    : 0;
  
  // Format for display
  $: totalCaloriesFormatted = Number(totalCalories).toFixed(1);
</script>

<section 
  class="legend-section"
  aria-labelledby="legend-title"
>
  {#if sportData.length > 0}
    <div class="legend-wrapper">
      <!-- Screen reader title -->
     <h2 id="legend-title" class="sr-only">
      Activity Energy Breakdown: {sportData.length} activities, {totalCaloriesFormatted}k total calories
    </h2>
      
      <div class="energy-description" aria-hidden="true">
        <p>Energy burned across {sportData.length} activities. Each pulse ring represents calorie contribution from different sports.</p>
      </div>
      
      <ul class="legend-grid" role="list">
        {#each sportData as sport}
          <li 
            class="legend-item"
            role="listitem"
            aria-label="{sport.label}: {sport.caloriesK}k calories burned"
          >
            <span 
              class="legend-pulse" 
              style="background: {sport.color}"
              aria-hidden="true"
            ></span>
            <span class="legend-label">{sport.label}</span>
            <span class="legend-calories" aria-hidden="true">{sport.caloriesK}k cal</span>
          </li>
        {/each}
      </ul>
    </div>
  {/if}
</section>

<style>
  .legend-section {
    min-height: 100vh;
    scroll-snap-align: start;
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
  
  .energy-description {
    max-width: 800px;
    width: 100%;
    text-align: center;
    margin: 0 auto 30px auto;
  }
  
  .energy-description p {
    font-family: monospace;
    font-size: 0.95rem;
    line-height: 1.6;
    color: rgba(255, 255, 255, 0.6);
    margin: 0;
  }
  
  .legend-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    width: 100%;
    list-style: none;
    padding: 0;
    margin: 0;
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
    .legend-item {
      transition: none;
    }
    
    .legend-item:hover {
      transform: none;
    }
    
    .legend-pulse {
      animation: none;
    }
  }
  
  /* High contrast */
  @media (prefers-contrast: high) {
    .legend-item {
      border-width: 2px;
    }
  }
  
  @media (max-width: 768px) {
    .legend-section {
      padding: 40px 20px;
    }
    
    .legend-grid {
      grid-template-columns: 1fr;
    }
  }
</style>