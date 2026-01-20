<script>
  import { onMount } from 'svelte';
  import * as d3 from 'd3';
  import { calculateMetrics } from '../utils/calculations.js'; 
  
  export let master = [];
  
  let trackElement;
  let runnerElement;
  let totalSteps = 0;
  let totalDistance = 0;
  let totalLaps = 0;
  let hasAnimated = false;
  let displaySteps = 0;
  let displayDistance = 0;
  let displayLaps = 0;
  let showFunFact = false;
  
  const TRACK_LENGTH = 0.4;
  
  $: {
    if (master.length > 0) {
      const metrics = calculateMetrics(master);
      
      totalSteps = d3.sum(master, d => d.steps || 0);
      totalDistance = metrics.totalDistanceKm;
      totalLaps = totalDistance / TRACK_LENGTH;
      
      console.log('📊 Running Track Stats:', {
        totalSteps: totalSteps.toLocaleString(),
        totalDistance: totalDistance.toFixed(1) + ' km',
        totalLaps: Math.round(totalLaps).toLocaleString()
      });
    }
  }
  
  onMount(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            hasAnimated = true;
            animateRunner();
            animateCounters();
          }
        });
      },
      { threshold: 0.3 }
    );
    
    if (trackElement) {
      observer.observe(trackElement);
    }
    
    return () => {
      if (trackElement) {
        observer.unobserve(trackElement);
      }
    };
  });
  
  function animateRunner() {
    if (!runnerElement) return;
    
    const runner = d3.select(runnerElement);
    const totalDuration = 8000;
    const lapsToShow = 3;
    
    function runLap(lapNumber) {
      if (lapNumber >= lapsToShow) return;
      
      runner
        .transition()
        .duration(totalDuration)
        .ease(d3.easeLinear)
        .attrTween('transform', function() {
          return function(t) {
            const angle = -Math.PI/2 - t * 2 * Math.PI;
            const rx = 225;
            const ry = 110;
            const cx = 300;
            const cy = 200;
            
            const x = cx + rx * Math.cos(angle);
            const y = cy + ry * Math.sin(angle);
            
            const rotation = (angle * 180 / Math.PI) + 90;
            
            return `translate(${x}, ${y}) rotate(${rotation})`;
          };
        })
        .on('end', () => runLap(lapNumber + 1));
    }
    
    runLap(0);
  }
  
  function animateCounters() {
    const duration = 5000;
    const startTime = performance.now();
    
    function update(time) {
      const progress = Math.min((time - startTime) / duration, 1);
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      
      displaySteps = Math.round(eased * totalSteps);
      displayDistance = Math.round(eased * totalDistance * 10) / 10;
      displayLaps = Math.round(eased * totalLaps);
      
      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        setTimeout(() => {
          showFunFact = true;
        }, 300);
      }
    }
    
    requestAnimationFrame(update);
  }
  
  function getFunFact() {
    return "That's walking from Munich to Lisbon! 🇵🇹";
  }
</script>

<!-- Screen reader summary -->
<div class="sr-only" role="region" aria-live="polite">
  Running track visualization showing {totalSteps.toLocaleString()} total steps, 
  {totalDistance.toFixed(1)} kilometers distance covered, 
  equivalent to {Math.round(totalLaps).toLocaleString()} laps around a 400-meter track.
</div>

<div class="track-container" bind:this={trackElement}>
  <svg 
    class="track-svg" 
    viewBox="0 0 600 400"
    role="img"
    aria-label="Running track showing cumulative steps and distance"
  >
    <defs>
      <linearGradient id="track-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style="stop-color:#0d3333;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#051515;stop-opacity:1" />
      </linearGradient>
      
      <filter id="glow">
        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    
    <!-- Decorative track elements -->
    <g aria-hidden="true">
      <ellipse 
        cx="300" 
        cy="200" 
        rx="230" 
        ry="120" 
        fill="url(#track-gradient)"
        stroke="#35d1c5"
        stroke-width="3"
        opacity="0.6"
      />

      <ellipse 
        cx="300" 
        cy="200" 
        rx="220" 
        ry="110" 
        fill="none"
        stroke="#35d1c5"
        stroke-width="2"
        stroke-dasharray="8,8"
        opacity="0.4"
      />

      <ellipse 
        cx="300" 
        cy="200" 
        rx="210" 
        ry="100" 
        fill="none"
        stroke="#35d1c5"
        stroke-width="1"
        stroke-dasharray="5,5"
        opacity="0.2"
      />

      <ellipse 
        cx="300" 
        cy="200" 
        rx="190" 
        ry="85" 
        fill="rgba(15, 40, 40, 0.6)"
        stroke="rgba(53, 209, 197, 0.2)"
        stroke-width="1"
      />
      
      <!-- Start/Finish line -->
      <g class="finish-line">
        <rect x="292" y="78" width="4" height="8" fill="#fff"/>
        <rect x="296" y="78" width="4" height="8" fill="#35d1c5"/>
        <rect x="300" y="78" width="4" height="8" fill="#fff"/>
        <rect x="304" y="78" width="4" height="8" fill="#35d1c5"/>
        
        <text 
          x="300" 
          y="70" 
          text-anchor="middle" 
          fill="#35d1c5" 
          font-size="10" 
          font-family="monospace"
          letter-spacing="2"
        >START/FINISH</text>
      </g>
      
      <!-- Runner trail effect -->
      <ellipse 
        cx="300" 
        cy="200" 
        rx="280" 
        ry="140" 
        fill="none"
        stroke="url(#runner-gradient)"
        stroke-width="2"
        opacity="0.2"
        class="runner-trail"
      />
      
      <!-- Runner -->
      <g bind:this={runnerElement} class="runner">
        <text 
          x="0" 
          y="0" 
          text-anchor="middle" 
          dominant-baseline="middle" 
          font-size="32"
        >🏃</text>
      </g>
    </g>
    
    <!-- Stats in center (visible to screen readers) -->
    <g class="center-stats">
      <text 
        x="300" 
        y="180" 
        text-anchor="middle" 
        fill="#35d1c5" 
        font-size="24" 
        font-family="monospace"
        font-weight="300"
        aria-hidden="true"
      >{displaySteps.toLocaleString()}</text>
      
      <text 
        x="300" 
        y="200" 
        text-anchor="middle" 
        fill="rgba(255, 255, 255, 0.4)" 
        font-size="10" 
        font-family="monospace"
        letter-spacing="2"
        aria-hidden="true"
      >TOTAL STEPS</text>
      
      <text 
        x="300" 
        y="230" 
        text-anchor="middle" 
        fill="#ff7a5c" 
        font-size="24" 
        font-family="monospace"
        font-weight="300"
        aria-hidden="true"
      >{displayDistance.toLocaleString()} km</text>
      
      <text 
        x="300" 
        y="248" 
        text-anchor="middle" 
        fill="rgba(255, 255, 255, 0.4)" 
        font-size="10" 
        font-family="monospace"
        letter-spacing="2"
        aria-hidden="true"
      >DISTANCE COVERED</text>
    </g>
  </svg>
  
  {#if totalDistance > 0 && showFunFact}
    <div class="fun-fact" role="status" aria-live="polite">
      <p>💡 {getFunFact()}</p>
    </div>
  {/if}
</div>

<style>
  .track-container {
    width: 100%;
    max-width: 800px;
    margin: -90px auto 0 auto;
    padding: 0 20px 40px 20px;
  }
  
  .track-svg {
    width: 100%;
    height: auto;
    filter: drop-shadow(0 4px 20px rgba(53, 209, 197, 0.2));
  }
  
  .runner {
    filter: drop-shadow(0 0 8px #35d1c5);
  }
  
  .runner-trail {
    animation: pulse-trail 2s ease-in-out infinite;
  }
  
  @keyframes pulse-trail {
    0%, 100% {
      opacity: 0.2;
      stroke-width: 2;
    }
    50% {
      opacity: 0.4;
      stroke-width: 3;
    }
  }
  
  .fun-fact {
    text-align: center;
    margin-top: -80px;
    padding: 16px;
    background: rgba(255, 122, 92, 0.1);
    border-left: 3px solid #ff7a5c;
    border-radius: 4px;
    animation: slideUp 0.6s ease-out;
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .fun-fact p {
    margin: 0;
    font-size: 1rem;
    color: rgba(255, 255, 255, 0.7);
    font-style: italic;
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
  
  /* ===================================
     SMARTPHONE RESPONSIVE
     =================================== */
  
  /* Smartphone Landscape */
  @media only screen and (max-width: 932px) and (orientation: landscape) {
    .track-container {
      max-width: 600px;
      margin: -60px auto 0 auto;
      padding: 0 20px 30px 20px;
    }
    
    .track-svg {
      filter: drop-shadow(0 2px 12px rgba(53, 209, 197, 0.15));
    }
    
    .fun-fact {
      margin-top: -60px;
      padding: 12px;
    }
    
    .fun-fact p {
      font-size: 0.85rem;
    }
  }
  
  /* iPhone SE Landscape */
  @media only screen and (max-width: 667px) and (orientation: landscape) {
    .track-container {
      max-width: 500px;
      margin: -50px auto 0 auto;
      padding: 0 16px 20px 16px;
    }
    
    .fun-fact {
      margin-top: -50px;
      padding: 10px;
    }
    
    .fun-fact p {
      font-size: 0.8rem;
    }
  }
  
  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .runner-trail {
      animation: none;
    }
    
    .fun-fact {
      animation: none;
    }
  }
</style>