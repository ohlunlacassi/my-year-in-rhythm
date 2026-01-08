<script>
  export let height = '400px';
  export let label = 'Visualization';
</script>

<div class="placeholder-viz" style="height: {height}">
  <div class="gradient-orb"></div>
  <div class="grid-pattern"></div>
  
  <div class="placeholder-content">
    <div class="icon-wrapper">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18M9 21V9" />
      </svg>
    </div>
    <p class="placeholder-label">{label}</p>
    <div class="loading-bar">
      <div class="loading-fill"></div>
    </div>
    <p class="loading-text">Loading data...</p>
  </div>
</div>

<style>
  .placeholder-viz {
    width: 100%;
    border-radius: 20px;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.02) 0%, rgba(255, 255, 255, 0.005) 100%);
    border: 1px solid rgba(255, 255, 255, 0.06);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    position: relative;
    overflow: hidden;
  }
  
  /* Gradient Orb Background */
  .gradient-orb {
    position: absolute;
    top: -100px;
    right: -100px;
    width: 300px;
    height: 300px;
    background: radial-gradient(circle, rgba(53, 209, 197, 0.04) 0%, transparent 70%);
    border-radius: 50%;
    pointer-events: none;
    animation: float 6s ease-in-out infinite;
  }
  
  /* Grid Pattern */
  .grid-pattern {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: 
      linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
    background-size: 40px 40px;
    opacity: 0.3;
    pointer-events: none;
  }
  
  /* Shimmer Effect */
  .placeholder-viz::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.04), transparent);
    animation: shimmer 3s ease-in-out infinite;
  }
  
  @keyframes shimmer {
    0% {
      left: -100%;
    }
    100% {
      left: 100%;
    }
  }
  
  @keyframes float {
    0%, 100% {
      transform: translate(0, 0) scale(1);
    }
    50% {
      transform: translate(20px, 20px) scale(1.1);
    }
  }
  
  .placeholder-viz:hover {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.01) 100%);
    border-color: rgba(53, 209, 197, 0.2);
    transform: translateY(-2px);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  }
  
  .placeholder-content {
    text-align: center;
    color: rgba(255, 255, 255, 0.3);
    position: relative;
    z-index: 1;
  }
  
  .icon-wrapper {
    margin-bottom: 24px;
    opacity: 0.3;
    animation: iconFloat 3s ease-in-out infinite;
  }
  
  @keyframes iconFloat {
    0%, 100% {
      transform: translateY(0) rotate(0deg);
    }
    50% {
      transform: translateY(-8px) rotate(2deg);
    }
  }
  
  .placeholder-label {
    font-size: 1rem;
    font-weight: 400;
    margin-bottom: 24px;
    color: rgba(255, 255, 255, 0.5);
    letter-spacing: 0.02em;
  }
  
  /* Loading Bar */
  .loading-bar {
    width: 200px;
    height: 3px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 2px;
    overflow: hidden;
    margin: 0 auto 12px;
  }
  
  .loading-fill {
    height: 100%;
    width: 40%;
    background: linear-gradient(90deg, 
      rgba(53, 209, 197, 0.5), 
      rgba(53, 209, 197, 0.8), 
      rgba(53, 209, 197, 0.5)
    );
    border-radius: 2px;
    animation: loadingSlide 1.5s ease-in-out infinite;
  }
  
  @keyframes loadingSlide {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(400%);
    }
  }
  
  .loading-text {
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.3);
    letter-spacing: 0.05em;
    text-transform: uppercase;
    animation: pulse 2s ease-in-out infinite;
  }
  
  @keyframes pulse {
    0%, 100% {
      opacity: 0.3;
    }
    50% {
      opacity: 0.6;
    }
  }
  
  @media (max-width: 768px) {
    .loading-bar {
      width: 150px;
    }
  }
</style>