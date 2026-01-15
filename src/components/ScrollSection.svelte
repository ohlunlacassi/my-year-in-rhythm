<script>
  import { onMount } from 'svelte';
  import InfoTooltip from './InfoTooltip.svelte';
  
  export let title = '';
  export let description = '';
  export let dark = false;
  export let infoTooltip = '';
  
  let sectionElement;
  let visible = false;
  let prefersReducedMotion = false;
  
  // Generate unique ID for ARIA
  const sectionId = `section-${Math.random().toString(36).substr(2, 9)}`;
  const titleId = `${sectionId}-title`;
  const descId = `${sectionId}-desc`;
  
  onMount(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    prefersReducedMotion = mediaQuery.matches;
    
    mediaQuery.addEventListener('change', (e) => {
      prefersReducedMotion = e.matches;
    });
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            visible = true;
            
            // Announce to screen readers when section becomes visible
            if (sectionElement) {
              const liveRegion = sectionElement.querySelector('[aria-live]');
              if (liveRegion) {
                liveRegion.textContent = `${title} section is now visible`;
                // Clear after announcement
                setTimeout(() => {
                  liveRegion.textContent = '';
                }, 1000);
              }
            }
          }
        });
      },
      { threshold: 0.2 }
    );
    
    if (sectionElement) {
      observer.observe(sectionElement);
    }
    
    return () => {
      if (sectionElement) {
        observer.unobserve(sectionElement);
      }
      mediaQuery.removeEventListener('change', () => {});
    };
  });
</script>

<!-- Live region for screen reader announcements -->
<div 
  aria-live="polite" 
  aria-atomic="true" 
  class="sr-only"
></div>

<!-- Skip link for this section -->
<a href="#{sectionId}-content" class="skip-link">
  Skip to {title || 'section'} content
</a>

<section 
  bind:this={sectionElement}
  id={sectionId}
  class="scroll-section" 
  class:visible 
  class:dark
  class:reduced-motion={prefersReducedMotion}
  aria-labelledby={title ? titleId : null}
  aria-describedby={description ? descId : null}
  role="region"
  tabindex="-1"
>
  <div class="gradient-orb" aria-hidden="true"></div>
  
  <div class="container">
    {#if title}
      <header class="section-header">
        <div class="title-accent" aria-hidden="true"></div>
        <h2 
          id={titleId}
          class="section-title"
        >
          {title}
        </h2>
        {#if description}
          <div class="description-with-info">
            <p 
              id={descId}
              class="section-description"
            >
              {description}
            </p>
            {#if infoTooltip}
              <InfoTooltip text={infoTooltip} />
            {/if}
          </div>
        {/if}
      </header>
    {/if}
    
    <div 
      id="{sectionId}-content"
      class="section-content"
      role="group"
      aria-label="{title ? `${title} visualization` : 'Section content'}"
    >
      <slot />
    </div>
  </div>
</section>

<style>
  .scroll-section {
    min-height: 100vh;
    scroll-snap-align: start;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 80px 24px 20px;
    background: #1a1a1a;
    opacity: 0;
    transform: translateY(40px);
    transition: all 1s cubic-bezier(0.16, 1, 0.3, 1);
    position: relative;
    overflow-x: hidden;
    overflow-y: hidden;
  }
  
  .scroll-section.dark {
    background: #0f0f0f;
  }
  
  .scroll-section.visible {
    opacity: 1;
    transform: translateY(0);
  }
  
  /* Reduced motion support */
  .scroll-section.reduced-motion {
    transition: opacity 0.3s ease;
    transform: none;
  }
  
  .scroll-section.reduced-motion.visible {
    transform: none;
  }
  
  .scroll-section.reduced-motion .gradient-orb {
    animation: none;
  }
  
  .scroll-section.reduced-motion .title-accent {
    animation: none;
    width: 60px;
  }
  
  /* Focus state for keyboard navigation */
  .scroll-section:focus {
    outline: 2px solid #35d1c5;
    outline-offset: -4px;
  }
  
  .scroll-section:focus:not(:focus-visible) {
    outline: none;
  }
  
  .gradient-orb {
    position: absolute;
    top: -200px;
    right: -200px;
    width: 500px;
    height: 500px;
    background: radial-gradient(circle, rgba(53, 209, 197, 0.08) 0%, transparent 70%);
    border-radius: 50%;
    pointer-events: none;
    animation: float 8s ease-in-out infinite;
  }
  
  .dark .gradient-orb {
    background: radial-gradient(circle, rgba(255, 122, 92, 0.06) 0%, transparent 70%);
    top: auto;
    bottom: -200px;
    right: auto;
    left: -200px;
  }
  
  @keyframes float {
    0%, 100% {
      transform: translate(0, 0);
    }
    50% {
      transform: translate(30px, 30px);
    }
  }
  
  .container {
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    position: relative;
    z-index: 1;
  }
  
  .section-header {
    margin-bottom: 40px;
    max-width: 800px;
    position: relative;
  }
  
  .title-accent {
    width: 60px;
    height: 2px;
    background: linear-gradient(to right, #35d1c5, transparent);
    margin-bottom: 24px;
    animation: expandWidth 1s ease-out;
  }
  
  @keyframes expandWidth {
    from {
      width: 0;
    }
    to {
      width: 60px;
    }
  }
  
  .section-title {
    font-size: clamp(2.5rem, 5vw, 4rem);
    font-weight: 200;
    line-height: 1.1;
    color: #ffffff;
    margin-bottom: 24px;
    letter-spacing: -0.02em;
  }
  
  .section-description {
    font-size: clamp(0.95rem, 1.4vw, 1.05rem);
    line-height: 1.7;
    color: rgba(255, 255, 255, 0.5);
    font-weight: 300;
    margin: 0;
  }
  
  .description-with-info {
    display: flex;
    align-items: center;
    gap: 4px;
  }
  
  .section-content {
    width: 100%;
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  
  /* Screen reader only content */
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
  
  /* High contrast mode support */
  @media (prefers-contrast: high) {
    .section-title {
      color: #ffffff;
    }
    
    .section-description {
      color: #e0e0e0;
    }
    
    .title-accent {
      background: #35d1c5;
    }
  }
  
  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .scroll-section {
      transition: opacity 0.3s ease;
      transform: none;
    }
    
    .scroll-section.visible {
      transform: none;
    }
    
    .gradient-orb {
      animation: none;
    }
    
    .title-accent {
      animation: none;
      width: 60px;
    }
    
    * {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
  
  @media (max-width: 768px) {
    .scroll-section {
      padding: 50px 20px 20px;
    }
    
    .section-header {
      margin-bottom: 30px;
    }
    
    .skip-link:focus {
      top: 60px;
      font-size: 14px;
      padding: 6px 12px;
    }
  }
</style>