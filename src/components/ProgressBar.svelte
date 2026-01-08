<script>
  export let total = 6;
  export let current = 0;
</script>

<div class="progress-container">
  {#each Array(total) as _, i}
    <div class="progress-bar">
      <div 
        class="progress-fill" 
        class:active={i === current}
        class:completed={i < current}
      ></div>
    </div>
  {/each}
</div>

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
  }
  
  .progress-fill {
    height: 100%;
    width: 0;
    background: #35d1c5;  /* ← Turquoise */
    border-radius: 2px;
    transition: width 0.3s ease;
    box-shadow: 0 0 8px rgba(53, 209, 197, 0.5);
  }
  
  .progress-fill.completed {
    width: 100%;
  }
  
  .progress-fill.active {
    width: 100%;
    animation: progress 5s linear forwards;
  }
  
  @keyframes progress {
    from {
      width: 0;
    }
    to {
      width: 100%;
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
  }
</style>