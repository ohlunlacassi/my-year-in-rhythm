<script>
  import { onMount } from 'svelte';
  
  let visible = false;
  let prefersReducedMotion = false;
  
  onMount(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    prefersReducedMotion = mediaQuery.matches;
    
    setTimeout(() => visible = true, prefersReducedMotion ? 0 : 200);
  });
</script>

<!-- Live region for screen readers -->
<div aria-live="polite" aria-atomic="true" class="sr-only">
  {#if visible}
    15 months of fitness progress summary. October 2024 to December 2025.
  {/if}
</div>

<header 
  class="hero" 
  class:visible
  class:reduced-motion={prefersReducedMotion}
  role="banner"
  aria-label="Journey conclusion hero section"
>
  <div 
    class="period-badge" 
    role="status"
    aria-label="Time period: October 2024 to December 2025"
  >
    OCT 2024 - DEC 2025
  </div>
  
  <h1 class="main-title">
    <span class="gradient-text">15 Months</span>
    <span class="gradient-text">of Progress</span>
  </h1>
  
  <p class="tagline">
    A journey spanning over a year of movement, growth, and dedication.
  </p>
</header>

<style>
  /* Hero Section */
  .hero {
    text-align: center;
    margin-bottom: 120px;
    opacity: 0;
    transform: translateY(30px);
    transition: all 1s cubic-bezier(0.16, 1, 0.3, 1);
  }
  
  .hero.visible {
    opacity: 1;
    transform: translateY(0);
  }
  
  /* Reduced motion support */
  .hero.reduced-motion {
    transition: opacity 0.3s ease;
    transform: none;
  }
  
  .hero.reduced-motion.visible {
    transform: none;
  }
  
  .period-badge {
    display: inline-block;
    padding: 8px 20px;
    background: rgba(53, 209, 197, 0.1);
    border: 1px solid rgba(53, 209, 197, 0.3);
    border-radius: 20px;
    color: #35d1c5;
    font-family: monospace;
    font-size: 0.9rem;
    font-weight: bold;
    margin-bottom: 24px;
    animation: fadeInUp 0.8s ease-out 0.2s backwards;
  }
  
  .main-title {
    font-size: clamp(3rem, 8vw, 6rem);
    font-weight: 200;
    line-height: 1.1;
    margin-bottom: 24px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  .gradient-text {
    background: linear-gradient(135deg, #35d1c5 0%, #ff7a5c 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: fadeInUp 0.8s ease-out backwards;
  }
  
  .gradient-text:nth-child(1) {
    animation-delay: 0.3s;
  }
  
  .gradient-text:nth-child(2) {
    animation-delay: 0.4s;
  }
  
  .tagline {
    font-size: clamp(1rem, 2vw, 1.3rem);
    color: rgba(255, 255, 255, 0.5);
    font-weight: 300;
    animation: fadeInUp 0.8s ease-out 0.5s backwards;
  }
  
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
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
    .hero {
      transition: opacity 0.3s ease;
      transform: none;
    }
    
    .hero.visible {
      transform: none;
    }
    
    .period-badge,
    .gradient-text,
    .tagline {
      animation: none;
    }
  }
  
  /* High contrast mode */
  @media (prefers-contrast: high) {
    .period-badge {
      background: rgba(53, 209, 197, 0.2);
      border-color: #35d1c5;
    }
    
    .gradient-text {
      background: #35d1c5;
      -webkit-background-clip: text;
      background-clip: text;
    }
    
    .tagline {
      color: rgba(255, 255, 255, 0.8);
    }
  }
  
  @media (max-width: 768px) {
    .hero {
      margin-bottom: 80px;
    }
    
    .period-badge {
      font-size: 0.8rem;
      padding: 6px 16px;
    }
  }
</style>