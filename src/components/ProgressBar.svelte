<script>
  import { createEventDispatcher } from 'svelte';
  
  export let total = 10;
  export let current = 0;
  
  const dispatch = createEventDispatcher();
  
  function navigateToSection(index) {
    dispatch('navigate', { section: index });
  }
  
  // Section labels for accessibility
  const sectionLabels = [
    'Landing',
    'Pulse & Pause',
    'Steps Traveled',
    'The Ups and Downs',
    'Energy Expenditure',
    'Activity Breakdown',
    'The Rhythm of Progress',
    'Life Events & Training',
    'Conclusion Hero',
    'Conclusion Insights'
  ];
</script>

<nav 
  class="progress-container"
  role="navigation"
  aria-label="Section navigation"
>
  {#each Array(total) as _, i}
    <button
      class="progress-bar"
      class:active={i === current}
      class:completed={i < current}
      on:click={() => navigateToSection(i)}
      aria-label="Section {i + 1} of {total}: {sectionLabels[i]}"
      aria-current={i === current ? 'location' : undefined}
      title="{sectionLabels[i] || `Section ${i + 1}`}"
    >
      <div 
        class="progress-fill" 
        class:active={i === current}
        class:completed={i < current}
        aria-hidden="true"
      ></div>
    </button>
  {/each}
</nav>

<style>
  .progress-container {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 8px;
    z-index: 1000;
    width: 90%;
    max-width: 600px;
  }
  
  .progress-bar {
    flex: 1;
    height: 3px;
    background: rgba(255, 255, 255, 0.15);
    border-radius: 2px;
    overflow: hidden;
    backdrop-filter: blur(10px);
    border: none;
    padding: 0;
    cursor: pointer;
    position: relative;
    transition: all 0.3s ease;
  }
  
  /* Increase clickable area */
  .progress-bar::before {
    content: '';
    position: absolute;
    top: -8px;
    left: 0;
    right: 0;
    bottom: -8px;
    background: transparent;
  }
  
  .progress-bar:hover {
    height: 4px;
    background: rgba(255, 255, 255, 0.25);
  }
  
  .progress-bar:focus {
    outline: 2px solid #35d1c5;
    outline-offset: 4px;
    height: 4px;
  }
  
  .progress-bar:focus:not(:focus-visible) {
    outline: none;
  }
  
  .progress-bar:active {
    transform: scale(0.98);
  }
  
  /* Current section highlight */
  .progress-bar.active {
    background: rgba(53, 209, 197, 0.2);
  }
  
  .progress-bar.active:hover {
    background: rgba(53, 209, 197, 0.3);
  }
  
  .progress-fill {
    height: 100%;
    width: 0;
    background: #35d1c5;
    border-radius: 2px;
    transition: width 0.3s ease;
    box-shadow: 0 0 8px rgba(53, 209, 197, 0.5);
    pointer-events: none;
  }
  
  .progress-fill.completed {
    width: 100%;
  }
  
  .progress-fill.active {
    width: 100%;
    animation: progress 5s linear forwards;
    box-shadow: 0 0 12px rgba(53, 209, 197, 0.8);
  }
  
  @keyframes progress {
    from {
      width: 0;
    }
    to {
      width: 100%;
    }
  }
  
  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .progress-bar {
      transition: none;
    }
    
    .progress-fill {
      transition: none;
    }
    
    .progress-fill.active {
      animation: none;
      width: 100%;
    }
    
    .progress-bar:hover,
    .progress-bar:active {
      transform: none;
    }
  }
  
  /* High contrast mode */
  @media (prefers-contrast: high) {
    .progress-bar {
      background: rgba(255, 255, 255, 0.3);
      border: 1px solid rgba(255, 255, 255, 0.5);
    }
    
    .progress-bar:hover {
      background: rgba(255, 255, 255, 0.4);
    }
    
    .progress-fill {
      background: #35d1c5;
    }
    
    .progress-bar:focus {
      outline: 3px solid #35d1c5;
    }
  }
  
  @media (max-width: 768px) {
    .progress-container {
      top: 16px;
      gap: 6px;
    }
    
    .progress-bar {
      height: 2px;
    }
    
    .progress-bar:hover {
      height: 3px;
    }
    
    .progress-bar:focus {
      height: 3px;
      outline-offset: 3px;
    }
  }
</style>