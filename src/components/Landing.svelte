<script>
  import { onMount } from 'svelte';
  
  let visible = false;
  
  onMount(() => {
    setTimeout(() => {
      visible = true;
    }, 100);
  });
</script>

<section class="landing" class:visible>
  <div class="container">
    <div class="grain-overlay"></div>
    
    <!-- เพิ่ม Dumbbell Animation -->
    <!-- เพิ่ม Dumbbell Animation -->
<div class="dumbbell-animation">
  <svg viewBox="0 0 200 100" class="dumbbell">
    <!-- Left weight plate -->
    <rect x="10" y="25" width="30" height="50" rx="5" fill="url(#gradient1)" class="weight left-weight"/>
    
    <!-- Left handle connector -->
    <rect x="40" y="42" width="15" height="16" rx="2" fill="#35d1c5"/>
    
    <!-- Center bar -->
    <rect x="55" y="45" width="90" height="10" rx="3" fill="#ffffff"/>
    
    <!-- Right handle connector -->
    <rect x="145" y="42" width="15" height="16" rx="2" fill="#35d1c5"/>
    
    <!-- Right weight plate -->
    <rect x="160" y="25" width="30" height="50" rx="5" fill="url(#gradient1)" class="weight right-weight"/>
    
    <defs>
      <linearGradient id="gradient1" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style="stop-color:#35d1c5;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#ff7a5c;stop-opacity:1" />
      </linearGradient>
    </defs>
  </svg>
</div>
    
    <p class="eyebrow">
      <span class="dot"></span>
      DATA STORY / 2024 - 25
    </p>
    
    <h1 class="title">
      <span class="title-line">My Year</span>
      <span class="title-line">in Rhythm</span>
    </h1>
    
    <div class="description">
      <p class="lead">
        This visualization explores a full year of personal fitness data from Mi Fitness—steps, 
        training duration, activity types, calories, and breaks—enriched with calendar events for context.
      </p>
      
      <p class="secondary">
        The goal is to reveal the rhythm of the year by showing how activity, pauses, and everyday 
        life intersect over time, highlighting overall progress, fluctuations in intensity, and shifts 
        in training focus.
      </p>
    </div>
  </div>
</section>

<style>
  .landing {
    height: 100vh;
    scroll-snap-align: start;
    display: flex;
    align-items: center;
    justify-content: center;
    background: 
      radial-gradient(circle at 20% 50%, rgba(53, 209, 197, 0.03) 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(255, 122, 92, 0.02) 0%, transparent 50%),
      linear-gradient(180deg, #0f0f0f 0%, #1a1a1a 100%);
    padding: 60px 24px;
    opacity: 0;
    transform: translateY(20px);
    transition: all 1.2s cubic-bezier(0.16, 1, 0.3, 1);
    position: relative;
    overflow: hidden;
  }
  
  .landing.visible {
    opacity: 1;
    transform: translateY(0);
  }
  
  .grain-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.03'/%3E%3C/svg%3E");
    pointer-events: none;
    opacity: 0.5;
  }
  
  /* Dumbbell Animation */
.dumbbell-animation {
  position: absolute;
  top: 60px;
  right: 80px;
  width: 180px;
  height: 90px;
  opacity: 0.5; 
  animation: dumbbellFadeIn 1s ease-out 0.8s forwards;
}

.dumbbell {
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 0 40px rgba(53, 209, 197, 0.9)) 
          drop-shadow(0 0 25px rgba(255, 122, 92, 0.7))
          drop-shadow(0 0 10px rgba(255, 255, 255, 0.2));
  animation: lift 3s ease-in-out infinite;
}

  
  .weight {
    animation: squeeze 3s ease-in-out infinite;
  }
  
  .left-weight {
    transform-origin: 25px 50px;
  }
  
  .right-weight {
    transform-origin: 175px 50px;
  }
  
  @keyframes dumbbellFadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 0.8;  /* เปลี่ยนจาก 0.5 เป็น 0.8 */
    transform: translateY(0);
  }
}
  
  @keyframes lift {
    0%, 100% {
      transform: translateY(0) rotate(0deg);
    }
    25% {
      transform: translateY(-15px) rotate(-2deg);
    }
    50% {
      transform: translateY(-25px) rotate(0deg);
    }
    75% {
      transform: translateY(-15px) rotate(2deg);
    }
  }
  
  @keyframes squeeze {
    0%, 100% {
      transform: scaleY(1);
    }
    25% {
      transform: scaleY(0.95);
    }
    50% {
      transform: scaleY(1.05);
    }
    75% {
      transform: scaleY(0.95);
    }
  }
  
  .container {
    max-width: 900px;
    margin: 0 auto;
    position: relative;
    z-index: 1;
  }
  
  .eyebrow {
    font-size: 0.7rem;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.35);
    margin-bottom: 40px;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .dot {
    width: 6px;
    height: 6px;
    background: #35d1c5;
    border-radius: 50%;
    animation: pulse 2s ease-in-out infinite;
    box-shadow: 0 0 12px rgba(53, 209, 197, 0.5);
  }
  
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.5;
      transform: scale(1.2);
    }
  }
  
  .title {
    font-size: clamp(2.5rem, 10vw, 5.5rem);
    font-weight: 200;
    line-height: 1;
    color: #ffffff;
    margin-bottom: 50px;
    letter-spacing: -0.03em;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  .title-line {
    display: block;
    background: linear-gradient(135deg, #ffffff 0%, rgba(255, 255, 255, 0.6) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: fadeInUp 1s ease-out forwards;
    opacity: 0;
  }
  
  .title-line:nth-child(1) {
    animation-delay: 0.2s;
  }
  
  .title-line:nth-child(2) {
    animation-delay: 0.4s;
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
  
  .description {
    max-width: 700px;
  }
  
  .lead {
    font-size: clamp(1rem, 1.8vw, 1.2rem);
    line-height: 1.7;
    color: rgba(255, 255, 255, 0.85);
    margin-bottom: 24px;
    font-weight: 300;
  }
  
  .secondary {
    font-size: clamp(0.95rem, 1.6vw, 1.05rem);
    line-height: 1.8;
    color: rgba(255, 255, 255, 0.5);
    font-weight: 300;
  }
  
  @media (max-width: 768px) {
    .landing {
      padding: 60px 20px;
    }
    
    .dumbbell-animation {
      top: 40px;
      right: 30px;
      width: 120px;
      height: 60px;
    }
    
    .eyebrow {
      margin-bottom: 32px;
    }
    
    .title {
      margin-bottom: 40px;
    }
  }
</style>