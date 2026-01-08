<script>
  import { onMount } from 'svelte';
  
  export let title = '';
  export let description = '';
  export let dark = false;
  
  let sectionElement;
  let visible = false;
  
  onMount(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            visible = true;
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
    };
  });
</script>

<section 
  bind:this={sectionElement}
  class="scroll-section" 
  class:visible 
  class:dark
>
  <div class="gradient-orb"></div>
  
  <div class="container">
    {#if title}
      <div class="section-header">
        <div class="title-accent"></div>
        <h2 class="section-title">{title}</h2>
        {#if description}
          <p class="section-description">{description}</p>
        {/if}
      </div>
    {/if}
    
    <div class="section-content">
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
    padding: 100px 24px 20px; 
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
    font-size: clamp(0.95rem, 1.4vw, 1.05rem);  /* ← ลดขนาด */
    line-height: 1.7;
    color: rgba(255, 255, 255, 0.5);
    font-weight: 300;
  }
  
  .section-content {
    width: 100%;
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  
  @media (max-width: 768px) {
    .scroll-section {
      padding: 80px 20px 20px;
    }
    
    .section-header {
      margin-bottom: 30px;
    }
  }
</style>