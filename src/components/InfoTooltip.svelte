<script>
  export let text = '';
  
  let showTooltip = false;
  
  function handleMouseEnter() {
    showTooltip = true;
  }
  
  function handleMouseLeave() {
    showTooltip = false;
  }
  
  function handleClick() {
    showTooltip = !showTooltip;
  }
</script>

<div class="info-tooltip-wrapper">
  <button 
    class="info-icon"
    on:mouseenter={handleMouseEnter}
    on:mouseleave={handleMouseLeave}
    on:click={handleClick}
    aria-label="More information"
  >
    ?
  </button>
  
  {#if showTooltip && text}
    <div class="tooltip-box">
      {text}
    </div>
  {/if}
</div>

<style>
  .info-tooltip-wrapper {
    position: relative;
    display: inline-block;
    margin-left: 8px;
    vertical-align: middle;
  }
  
  .info-icon {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.3);
    color: rgba(255, 255, 255, 0.6);
    font-family: monospace;
    font-size: 12px;
    font-weight: bold;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    padding: 0;
    line-height: 1;
  }
  
  .info-icon:hover {
    background: rgba(53, 209, 197, 0.2);
    border-color: rgba(53, 209, 197, 0.6);
    color: rgba(53, 209, 197, 1);
    transform: scale(1.1);
  }
  
  .tooltip-box {
    position: absolute;
    top: calc(100% + 8px);
    left: 50%;
    transform: translateX(-50%);
    min-width: 250px;
    max-width: 400px;
    padding: 12px 16px;
    background: rgba(0, 0, 0, 0.95);
    border: 1px solid rgba(53, 209, 197, 0.4);
    border-radius: 8px;
    color: rgba(255, 255, 255, 0.8);
    font-family: monospace;
    font-size: 11px;
    line-height: 1.6;
    z-index: 1000;
    pointer-events: none;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5),
                0 0 15px rgba(53, 209, 197, 0.2);
    animation: fadeIn 0.2s ease;
  }
  
  .tooltip-box::before {
    content: '';
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 6px solid transparent;
    border-bottom-color: rgba(53, 209, 197, 0.4);
  }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateX(-50%) translateY(-5px);
    }
    to {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
  }
  
  @media (max-width: 768px) {
    .tooltip-box {
      min-width: 200px;
      max-width: 300px;
      font-size: 10px;
    }
  }
</style>