<script>
  import { onMount } from 'svelte';
  
  let showWarning = false;
  
  function checkDevice() {
    // Block only smartphones (width <= 667px) - iPhone landscape size
    const isSmartphone = window.innerWidth <= 667;
    showWarning = isSmartphone;
  }
  
  onMount(() => {
    checkDevice();
    
    window.addEventListener('resize', checkDevice);
    window.addEventListener('orientationchange', checkDevice);
    
    return () => {
      window.removeEventListener('resize', checkDevice);
      window.removeEventListener('orientationchange', checkDevice);
    };
  });
</script>

{#if showWarning}
  <div class="device-overlay" role="alert" aria-live="polite">
    <div class="device-content">
      <!-- Tablet/Desktop Icon -->
      <svg 
        class="device-icon" 
        viewBox="0 0 100 100" 
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <!-- Tablet/Monitor -->
        <rect x="15" y="25" width="70" height="50" rx="4" 
              fill="none" stroke="currentColor" stroke-width="2"/>
        <line x1="20" y1="70" x2="80" y2="70" 
              stroke="currentColor" stroke-width="1.5"/>
        <circle cx="50" cy="72.5" r="1.5" fill="currentColor"/>
        
        <!-- Stand -->
        <line x1="45" y1="75" x2="40" y2="85" 
              stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <line x1="55" y1="75" x2="60" y2="85" 
              stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <line x1="35" y1="85" x2="65" y2="85" 
              stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
      
      <h2 class="warning-title">View on Tablet or Desktop</h2>
      <p class="warning-text">
        This data visualization is optimized for larger screens. Please view on a tablet or desktop computer for the best experience.
      </p>
    </div>
  </div>
{/if}

<style>
  .device-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: #0a0a0a;
    z-index: 99999;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }
  
  .device-content {
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
  
  .device-icon {
    width: 100px;
    height: 100px;
    color: #35d1c5;
    margin-bottom: 32px;
    opacity: 0.9;
  }
  
  .warning-title {
    font-size: 1.2rem;
    font-weight: 300;
    color: #ffffff;
    margin-bottom: 16px;
    letter-spacing: -0.01em;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  }
  
  .warning-text {
    font-size: 0.8rem;
    line-height: 1.6;
    color: rgba(255, 255, 255, 0.7);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  }
  
  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .device-content {
      animation: none;
    }
  }
  
  /* Hide overlay on tablets and desktops */
  @media (min-width: 668px) {
    .device-overlay {
      display: none;
    }
  }
</style>