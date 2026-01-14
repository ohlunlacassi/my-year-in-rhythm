<script>
  import { onMount } from 'svelte';
  
  export let metrics = {};
  export let master = [];
  
  let visible = false;
  
  onMount(() => {
    setTimeout(() => visible = true, 200);
  });
  
  const totalDays = master.length;
  const activePercentage = ((metrics.activeDays / totalDays) * 100).toFixed(0);
  const totalMonths = 15; // Oct 2024 - Dec 2025
  
  // Longest streak
  function calculateLongestStreak(data) {
    let maxStreak = 0;
    let currentStreak = 0;
    
    data.forEach(d => {
      if (d.trainingMinutes > 0) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    });
    
    return maxStreak;
  }
  
  const longestStreak = calculateLongestStreak(master);
  
  // Average per month
  const avgHoursPerMonth = (metrics.totalTrainingHours / totalMonths).toFixed(1);
</script>

<section class="conclusion" class:visible>
  <div class="container">
    
    <!-- Hero Section -->
    <div class="hero">
      <div class="period-badge">OCT 2024 - DEC 2025</div>
      <h1 class="main-title">
        <span class="gradient-text">15 Months</span>
        <span class="gradient-text">of Progress</span>
      </h1>
      <p class="tagline">A journey spanning over a year of movement, growth, and dedication.</p>
    </div>

    
    <!-- Key Insights -->
    <div class="insights-section">
      <h2 class="section-title">Journey Highlights</h2>
      
      <div class="insights-grid">
        <div class="insight-card">
          <img src="/icons/bar-chart.png" alt="Chart icon" class="insight-icon-img" />
          <p class="insight-text">Maintained {activePercentage}% activity rate across {totalDays} days over 15 months</p>
        </div>
        
        <div class="insight-card">
          <img src="/icons/muscles.png" alt="Muscle icon" class="insight-icon-img" />
          <p class="insight-text">Averaged {avgHoursPerMonth} training hours per month—consistency over time!</p>
        </div>
        
        <div class="insight-card">
          <img src="/icons/target.png" alt="Target icon" class="insight-icon-img" />
          <p class="insight-text">Peak streak: {longestStreak} consecutive days of unbroken momentum</p>
        </div>
      </div>
    </div>
    
    <!-- Closing Message -->
    <div class="closing">
      <div class="quote">
        <p class="quote-text">"From October 2024 to December 2025—every step, every rep, every choice mattered. This is what sustained effort looks like."</p>
      </div>
      
      <div class="signature">
        <p class="signature-text">The rhythm continues into 2026.</p>
        <div class="cta">Onward →</div>
      </div>
    </div>
    
  </div>
</section>

<style>
  .conclusion {
    min-height: 100vh;
    background: linear-gradient(180deg, #0a0a0a 0%, #0f0f0f 50%, #0a0a0a 100%);
    padding: 80px 24px;
    opacity: 0;
    transform: translateY(30px);
    transition: all 1s cubic-bezier(0.16, 1, 0.3, 1);
  }
  
  .conclusion.visible {
    opacity: 1;
    transform: translateY(0);
  }
  
  .container {
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
  }
  
  /* Hero Section */
  .hero {
    text-align: center;
    margin-bottom: 300px;
  }
  
  .period-badge {
    display: inline-block;
    padding: 8px 20px;
    background: rgba(53, 209, 197, 0.1);
    border: 1px solid rgba(53, 209, 197, 0.3);
    border-radius: 20px;
    color: #35d1c5;
    font-family: monospace;
    font-size: 0.9rem;
    font-weight: bold;
    margin-bottom: 24px;
    animation: fadeInUp 0.8s ease-out 0.2s backwards;
  }
  
  .main-title {
    font-size: clamp(3rem, 8vw, 6rem);
    font-weight: 200;
    line-height: 1.1;
    margin-bottom: 24px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  .gradient-text {
    background: linear-gradient(135deg, #35d1c5 0%, #ff7a5c 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: fadeInUp 0.8s ease-out backwards;
  }
  
  .gradient-text:nth-child(1) {
    animation-delay: 0.3s;
  }
  
  .gradient-text:nth-child(2) {
    animation-delay: 0.4s;
  }
  
  .tagline {
    font-size: clamp(1rem, 2vw, 1.3rem);
    color: rgba(255, 255, 255, 0.5);
    font-weight: 300;
    animation: fadeInUp 0.8s ease-out 0.5s backwards;
  }
  
  /* Insights Section */
  .insights-section {
    margin-bottom: 80px;
  }
  
  .section-title {
    text-align: center;
    font-size: 2rem;
    font-weight: 300;
    color: #ffffff;
    margin-bottom: 40px;
  }
  
  .insights-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 24px;
  }
  
  .insight-card {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    padding: 24px;
    display: flex;
    gap: 16px;
    align-items: flex-start;
  }
  
  .insight-icon-img {
    width: 24px;
    height: 24px;
    flex-shrink: 0;
    object-fit: contain;
  }
  
  .insight-text {
    color: rgba(255, 255, 255, 0.7);
    line-height: 1.6;
    font-size: 0.95rem;
  }
  
  /* Closing */
  .closing {
    text-align: center;
    max-width: 700px;
    margin: 0 auto;
  }
  
  .quote {
    margin-bottom: 40px;
  }
  
  .quote-text {
    font-size: clamp(1.1rem, 2vw, 1.4rem);
    line-height: 1.8;
    color: rgba(255, 255, 255, 0.6);
    font-style: italic;
    font-weight: 300;
  }
  
  .signature-text {
    font-size: 1.2rem;
    color: rgba(255, 255, 255, 0.8);
    margin-bottom: 16px;
  }
  
  .cta {
    display: inline-block;
    font-size: 1.5rem;
    font-weight: 300;
    background: linear-gradient(135deg, #35d1c5, #ff7a5c);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: pulse 2s ease-in-out infinite;
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
  
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.6;
    }
  }
  
  @media (max-width: 768px) {
    .conclusion {
      padding: 60px 20px;
    }
    
    .hero {
      margin-bottom: 60px;
    }
    
    .insights-section {
      margin-bottom: 60px;
    }
    
    .insights-grid {
      grid-template-columns: 1fr;
      gap: 20px;
    }
  }
</style>