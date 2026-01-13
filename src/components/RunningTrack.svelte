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
    const totalDuration = 8000; // 8 seconds for full lap
    const lapsToShow = 3; // Show 3 full laps
    
    function runLap(lapNumber) {
      if (lapNumber >= lapsToShow) return;
      
      runner
        .transition()
        .duration(totalDuration)
        .ease(d3.easeLinear)
        .attrTween('transform', function() {
          return function(t) {
            // Ellipse path calculation
            const angle = -Math.PI/2 - t * 2 * Math.PI;
            const rx = 225; // horizontal radius
            const ry = 110; // vertical radius
            const cx = 300; // center x
            const cy = 200; // center y
            
            const x = cx + rx * Math.cos(angle);
            const y = cy + ry * Math.sin(angle);
            
            // Rotate runner to face direction of movement
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
  
  // Fun fact generator based on actual distance
  function getFunFact() {
  return "That's walking from Munich to Lisbon! 🇵🇹";
}
</script>

<div class="track-container" bind:this={trackElement}>
  <svg class="track-svg" viewBox="0 0 600 400">
  <defs>
    <!-- Track gradient - Modern style -->
    <linearGradient id="track-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#0d3333;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#051515;stop-opacity:1" />
    </linearGradient>
    
    
    <!-- Glow filter -->
    <filter id="glow">
      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  
  <!-- Outer track border -->
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

<!-- Lane 1 (inner) - Main running lane -->
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

<!-- Lane 2 -->
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

<!-- Inner field area -->
<ellipse 
  cx="300" 
  cy="200" 
  rx="190" 
  ry="85" 
  fill="rgba(15, 40, 40, 0.6)"
  stroke="rgba(53, 209, 197, 0.2)"
  stroke-width="1"
/>
  
 <!-- Start/Finish line (TOP ONLY) -->
<g class="finish-line">
  <!-- Checkered pattern - TOP -->
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
  
  <!-- Stats in center of track -->
<g class="center-stats">
  <!-- Total Steps -->
  <text 
    x="300" 
    y="180" 
    text-anchor="middle" 
    fill="#35d1c5" 
    font-size="24" 
    font-family="monospace"
    font-weight="300"
  >{displaySteps.toLocaleString()}</text>
  
  <text 
    x="300" 
    y="200" 
    text-anchor="middle" 
    fill="rgba(255, 255, 255, 0.4)" 
    font-size="10" 
    font-family="monospace"
    letter-spacing="2"
  >TOTAL STEPS</text>
  
  <!-- Distance -->
  <text 
    x="300" 
    y="230" 
    text-anchor="middle" 
    fill="#ff7a5c" 
    font-size="24" 
    font-family="monospace"
    font-weight="300"
  >{displayDistance.toLocaleString()} km</text>
  
  <text 
    x="300" 
    y="248" 
    text-anchor="middle" 
    fill="rgba(255, 255, 255, 0.4)" 
    font-size="10" 
    font-family="monospace"
    letter-spacing="2"
  >DISTANCE COVERED</text>
</g>

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
</svg>
  
  {#if totalDistance > 0 && showFunFact}
  <div class="fun-fact">
    <p>💡 {getFunFact()}</p>
  </div>
{/if}
</div>

<style>
  .track-container {
    width: 100%;
    max-width: 800px;
    margin: 0 auto;
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
  
  .stats-container {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    margin-top: 40px;
  }
  
  .stat-card {
    background: linear-gradient(135deg, rgba(53, 209, 197, 0.08) 0%, rgba(53, 209, 197, 0.02) 100%);
    border: 1px solid rgba(53, 209, 197, 0.25);
    border-radius: 12px;
    padding: 24px;
    text-align: center;
    transition: all 0.3s ease;
  }
  
  .stat-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(53, 209, 197, 0.2);
    border-color: rgba(53, 209, 197, 0.5);
  }
  
  .stat-icon {
    font-size: 2rem;
    margin-bottom: 12px;
  }
  
  .stat-value {
    font-size: 1.8rem;
    font-weight: 300;
    color: #35d1c5;
    margin-bottom: 8px;
    font-family: monospace;
  }
  
  .stat-label {
    font-size: 0.85rem;
    color: rgba(255, 255, 255, 0.5);
    text-transform: uppercase;
    letter-spacing: 0.05em;
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
  
  @media (max-width: 768px) {
    .stats-container {
      grid-template-columns: 1fr;
      gap: 16px;
    }
    
    .stat-card {
      padding: 20px;
    }
    
    .stat-value {
      font-size: 1.5rem;
    }
  }
</style>