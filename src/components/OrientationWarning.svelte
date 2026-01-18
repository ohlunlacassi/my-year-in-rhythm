<script>
  import { onMount } from 'svelte';
  
  let showWarning = false;
  
  function checkOrientation() {
    // Show warning for tablets (width > 667px) in portrait mode
    const isTablet = window.innerWidth > 667;
    const isPortrait = window.innerHeight > window.innerWidth;
    showWarning = isTablet && isPortrait;
  }
  
  onMount(() => {
    checkOrientation();
    
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);
    
    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  });
</script>

{#if showWarning}
  <div class="orientation-overlay" role="alert" aria-live="polite">
    <div class="orientation-content">
      <!-- Rotate Icon -->
      <svg 
        class="rotate-icon" 
        viewBox="0 0 100 100" 
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <!-- Tablet -->
        <rect x="30" y="15" width="40" height="70" rx="5" 
              fill="none" stroke="currentColor" stroke-width="2"/>
        <circle cx="50" cy="78" r="3" fill="currentColor"/>
        
        <!-- Rotation arrows -->
        <path 
          d="M 20 40 Q 15 50 20 60" 
          fill="none" 
          stroke="currentColor" 
          stroke-width="2" 
          stroke-linecap="round"
        />
        <path 
          d="M 80 40 Q 85 50 80 60" 
          fill="none" 
          stroke="currentColor" 
          stroke-width="2" 
          stroke-linecap="round"
        />
        
        <!-- Arrow heads -->
        <polygon points="18,58 20,63 23,60" fill="currentColor"/>
        <polygon points="82,42 80,37 77,40" fill="currentColor"/>
      </svg>
      
      <h2 class="warning-title">Rotate Your Device</h2>
      <p class="warning-text">
        For the best experience, please rotate your device to landscape mode.
      </p>
    </div>
  </div>
{/if}

<style>
  .orientation-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: #0a0a0a;
    z-index: 99998;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }
  
  .orientation-content {
    text-align: center;
    max-width: 400px;
    animation: fadeIn 0.4s ease-out;
  }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .rotate-icon {
    width: 120px;
    height: 120px;
    color: #35d1c5;
    margin-bottom: 32px;
    animation: rotateAnimation 2s ease-in-out infinite;
  }
  
  @keyframes rotateAnimation {
    0%, 100% {
      transform: rotate(0deg);
    }
    25% {
      transform: rotate(-15deg);
    }
    75% {
      transform: rotate(15deg);
    }
  }
  
  .warning-title {
    font-size: 1.5rem;
    font-weight: 300;
    color: #ffffff;
    margin-bottom: 16px;
    letter-spacing: -0.01em;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  }
  
  .warning-text {
    font-size: 0.95rem;
    line-height: 1.6;
    color: rgba(255, 255, 255, 0.7);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  }
  
  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .rotate-icon {
      animation: none;
    }
    
    .orientation-content {
      animation: none;
    }
  }
  
  /* Hide overlay in landscape */
  @media (orientation: landscape) {
    .orientation-overlay {
      display: none;
    }
  }
</style>