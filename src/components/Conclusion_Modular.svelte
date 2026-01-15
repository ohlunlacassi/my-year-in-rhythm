<script>
  import { onMount } from 'svelte';
  import ConclusionHero from './ConclusionHero.svelte';
  import ConclusionInsights from './ConclusionInsights.svelte';
  
  export let metrics = {};
  export let master = [];
  
  let visible = false;
  let prefersReducedMotion = false;
  
  onMount(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    prefersReducedMotion = mediaQuery.matches;
    
    setTimeout(() => visible = true, prefersReducedMotion ? 0 : 200);
  });
</script>

<!-- Skip link -->
<a href="#conclusion-insights" class="skip-link">
  Skip to journey insights
</a>

<section 
  class="conclusion" 
  class:visible
  class:reduced-motion={prefersReducedMotion}
  role="region"
  aria-label="Journey conclusion and summary"
>
  <div class="container">
    
    <!-- Hero Section -->
    <ConclusionHero />
    
    <!-- Insights & Closing -->
    <div id="conclusion-insights">
      <ConclusionInsights {metrics} {master} />
    </div>
    
  </div>
</section>

<style>
  .conclusion {
    min-height: 100vh;
    background: linear-gradient(180deg, #0a0a0a 0%, #0f0f0f 50%, #0a0a0a 100%);
    padding: 80px 24px;
    opacity: 0;
    transform: translateY(30px);
    transition: all 1s cubic-bezier(0.16, 1, 0.3, 1);
    position: relative;
  }
  
  .conclusion.visible {
    opacity: 1;
    transform: translateY(0);
  }
  
  /* Reduced motion support */
  .conclusion.reduced-motion {
    transition: opacity 0.3s ease;
    transform: none;
  }
  
  .conclusion.reduced-motion.visible {
    transform: none;
  }
  
  /* Focus state */
  .conclusion:focus {
    outline: 2px solid #35d1c5;
    outline-offset: -4px;
  }
  
  .conclusion:focus:not(:focus-visible) {
    outline: none;
  }
  
  .container {
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
  }
  
  /* Skip link */
  .skip-link {
    position: absolute;
    left: -10000px;
    top: auto;
    width: 1px;
    height: 1px;
    overflow: hidden;
    background: #35d1c5;
    color: #0a0a0a;
    padding: 8px 16px;
    text-decoration: none;
    font-weight: bold;
    border-radius: 4px;
    font-family: monospace;
    z-index: 10000;
  }
  
  .skip-link:focus {
    position: fixed;
    left: 50%;
    top: 80px;
    transform: translateX(-50%);
    width: auto;
    height: auto;
    overflow: visible;
  }
  
  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .conclusion {
      transition: opacity 0.3s ease;
      transform: none;
    }
    
    .conclusion.visible {
      transform: none;
    }
  }
  
  @media (max-width: 768px) {
    .conclusion {
      padding: 60px 20px;
    }
    
    .skip-link:focus {
      top: 60px;
      font-size: 14px;
      padding: 6px 12px;
    }
  }
</style>