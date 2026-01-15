<script>
  import { onMount } from 'svelte';
  
  export let title = '';
  export let value = 0;
  export let unit = '';
  
  let displayValue = 0;
  let cardElement;
  let hasAnimated = false;
  
  onMount(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            hasAnimated = true;
            animateValue(value);
          }
        });
      },
      { threshold: 0.5 }
    );
    
    if (cardElement) {
      observer.observe(cardElement);
    }
    
    return () => {
      if (cardElement) {
        observer.unobserve(cardElement);
      }
    };
  });
  
  function animateValue(target, duration = 8000) {
    const startTime = performance.now();
    
    function update(time) {
      const progress = Math.min((time - startTime) / duration, 1);
      
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -15 * progress);
      
      displayValue = Math.round(eased * target);
      
      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }
    
    requestAnimationFrame(update);
  }
</script>

<div 
  class="metric-card" 
  bind:this={cardElement}
  role="region"
  aria-label="{title}: {value} {unit}"
>
  <h3>{title}</h3>
  <div class="metric-value">
    <span aria-hidden="true">{displayValue}</span>
    <span class="unit" aria-hidden="true">{unit}</span>
  </div>
</div>

<style>
  .metric-card {
    background: linear-gradient(135deg, rgba(53, 209, 197, 0.08) 0%, rgba(53, 209, 197, 0.02) 100%);
    border: 1px solid rgba(53, 209, 197, 0.25);
    border-radius: 16px;
    padding: 100px 32px;
    text-align: center;
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    position: relative;
    overflow: hidden;
  }
  
  .metric-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(53, 209, 197, 0.15), transparent);
    transition: left 0.6s ease;
    pointer-events: none;
    border-radius: 16px;
  }
  
  .metric-card:hover {
    background: linear-gradient(135deg, rgba(53, 209, 197, 0.15) 0%, rgba(53, 209, 197, 0.05) 100%);
    border-color: rgba(53, 209, 197, 0.6);
    box-shadow: 0 8px 32px rgba(53, 209, 197, 0.25);
  }
  
  .metric-card:hover::before {
    left: 100%;
  }
  
  h3 {
    font-size: 0.85rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: rgba(255, 255, 255, 0.5);
    margin-bottom: 20px;
  }
  
  .metric-value {
    font-size: 3.5rem;
    font-weight: 300;
    color: #35d1c5;
    display: flex;
    align-items: baseline;
    justify-content: center;
    gap: 12px;
    line-height: 1;
  }
  
  .unit {
    font-size: 1.2rem;
    font-weight: 400;
    color: rgba(53, 209, 197, 0.6);
  }
  
  @media (max-width: 768px) {
    .metric-card {
      padding: 32px 24px;
    }
    
    .metric-value {
      font-size: 2.5rem;
    }
    
    .unit {
      font-size: 1rem;
    }
  }
  
  /* High contrast mode */
  @media (prefers-contrast: high) {
    .metric-card {
      border-width: 2px;
    }
  }
  
  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .metric-card,
    .metric-card::before {
      transition: none;
    }
  }
</style>