<script>
  import { onMount } from 'svelte';
  import * as d3 from 'd3';
  
  export let sportRecords = [];
  
  let svgElement;
  let containerWidth = 0;
  let animationFrame;
  
  const sportPatterns = {
    'outdoor_running': { color: '#35d1c5', label: 'Running' },
    'outdoor_walking': { color: '#00d4ff', label: 'Walking' },
    'aerobics': { color: '#ff0080', label: 'Aerobics' },
    'mixed_aerobics': { color: '#ff3399', label: 'Mixed Aerobics' },
    'yoga': { color: '#9d4edd', label: 'Yoga' },
    'free_training': { color: '#06ffa5', label: 'Free Training' },
    'upper_limb_training': { color: '#ffbe0b', label: 'Upper Body' },
    'lower_limb_training': { color: '#fb5607', label: 'Lower Body' },
    'core_training': { color: '#ff006e', label: 'Core' },
    'physical_training': { color: '#8338ec', label: 'Physical' },
    'pilates': { color: '#c77dff', label: 'Pilates' },
    'flexibility_training': { color: '#e0aaff', label: 'Flexibility' },
    'indoor_walking': { color: '#48cae4', label: 'Indoor Walking' },
    'indoor_riding': { color: '#0096c7', label: 'Indoor Cycling' },
    'weight_lifting': { color: '#ff9500', label: 'Weight Lifting' },
    'waist_training': { color: '#ff6b6b', label: 'Waist' },
    'back_training': { color: '#ffd166', label: 'Back' },
    'high_interval_training': { color: '#ef233c', label: 'HIIT' },
    'rope_skipping': { color: '#d90429', label: 'Jump Rope' },
  };
  
  let sportData = [];
  let totalCalories = 0;
  let pulses = [];
  let particles = [];
  let heartbeat = 0;
  
  onMount(() => {
    if (sportRecords.length === 0) return;
    
    containerWidth = svgElement.parentElement.clientWidth;
    
    // Calculate calories by sport
    const sportTotals = d3.rollups(
      sportRecords,
      v => d3.sum(v, d => d.calories || 0),
      d => d.key
    );
    
    sportData = sportTotals
      .map(([sport, calories]) => ({
        sport,
        calories: Math.round(calories),
        caloriesK: (calories / 1000).toFixed(1),
        color: sportPatterns[sport]?.color || '#35d1c5',
        label: sportPatterns[sport]?.label || sport.replace(/_/g, ' '),
        angle: 0 // will be set later
      }))
      .sort((a, b) => b.calories - a.calories)
      .filter(d => d.calories > 0 && d.sport !== 'rope_skipping'); // ลบ rope_skipping
    
    // Assign angles evenly around the heart
    sportData.forEach((d, i) => {
      d.angle = (i / sportData.length) * Math.PI * 2;
    });
    
    totalCalories = d3.sum(sportData, d => d.calories);
    
    setupVisualization();
    startAnimation();
    
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  });
  
  function setupVisualization() {
    const width = Math.min(containerWidth, 1000);
    const height = 550;
    
    const svg = d3.select(svgElement)
      .attr('width', width)
      .attr('height', height);
    
    svg.selectAll('*').remove();
    
    // Create glow filters
    const defs = svg.append('defs');
    
    // Heart glow
    const heartGlow = defs.append('filter')
      .attr('id', 'heart-glow')
      .attr('x', '-100%')
      .attr('y', '-100%')
      .attr('width', '300%')
      .attr('height', '300%');
    
    heartGlow.append('feGaussianBlur')
      .attr('stdDeviation', '8')
      .attr('result', 'coloredBlur');
    
    const heartMerge = heartGlow.append('feMerge');
    heartMerge.append('feMergeNode').attr('in', 'coloredBlur');
    heartMerge.append('feMergeNode').attr('in', 'SourceGraphic');
    
    // Pulse glow
    const pulseGlow = defs.append('filter')
      .attr('id', 'pulse-glow')
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%');
    
    pulseGlow.append('feGaussianBlur')
      .attr('stdDeviation', '5')
      .attr('result', 'coloredBlur');
    
    const pulseMerge = pulseGlow.append('feMerge');
    pulseMerge.append('feMergeNode').attr('in', 'coloredBlur');
    pulseMerge.append('feMergeNode').attr('in', 'SourceGraphic');
    
    // Main group
    const g = svg.append('g')
      .attr('transform', `translate(${width/2},${height/2})`);
    
    // Background circles for depth
    for (let i = 3; i > 0; i--) {
      g.append('circle')
        .attr('r', i * 80)
        .attr('fill', 'none')
        .attr('stroke', `rgba(255, 100, 100, ${0.05 * i})`)
        .attr('stroke-width', 1);
    }
    
    // Pulse container
    g.append('g').attr('class', 'pulses');
    
    // Particles container
    g.append('g').attr('class', 'particles');
    
    // Heart
    const heartPath = "M0,-40 C-25,-65 -65,-65 -65,-35 C-65,-15 -45,0 0,35 C45,0 65,-15 65,-35 C65,-65 25,-65 0,-40 Z";
    
    g.append('path')
      .attr('class', 'heart')
      .attr('d', heartPath)
      .attr('fill', 'url(#heart-gradient)')
      .attr('filter', 'url(#heart-glow)')
      .style('transform-origin', 'center');
    
    // Heart gradient
    const heartGradient = defs.append('linearGradient')
      .attr('id', 'heart-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');
    
    heartGradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#ff4757')
      .attr('stop-opacity', 1);
    
    heartGradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#ff6b81')
      .attr('stop-opacity', 0.8);
    
    // Center label
    g.append('text')
      .attr('y', -60)
      .attr('text-anchor', 'middle')
      .style('font-family', 'monospace')
      .style('font-size', '12px')
      .style('fill', 'rgba(255, 255, 255, 0.5)')
      .style('letter-spacing', '2px')
      .text('TOTAL ENERGY');
    
    g.append('text')
      .attr('y', 70)
      .attr('text-anchor', 'middle')
      .style('font-family', 'monospace')
      .style('font-size', '36px')
      .style('font-weight', '200')
      .style('fill', '#ff7a5c')
      .text((totalCalories / 1000).toFixed(1) + 'K');
    
    g.append('text')
      .attr('y', 92)
      .attr('text-anchor', 'middle')
      .style('font-family', 'monospace')
      .style('font-size', '14px')
      .style('fill', 'rgba(255, 255, 255, 0.5)')
      .text('cal');
  }
  
  function startAnimation() {
    const svg = d3.select(svgElement);
    const g = svg.select('g');
    const heart = g.select('.heart');
    const pulsesGroup = g.select('.pulses');
    const particlesGroup = g.select('.particles');
    
    let time = 0;
    let lastBeat = 0;
    const beatInterval = 1000; // 1 second between beats
    
    function animate() {
      time += 16; // ~60fps
      
      // Heartbeat animation
      const beatPhase = (time % beatInterval) / beatInterval;
      let scale = 1;
      
      if (beatPhase < 0.15) {
        scale = 1 + (beatPhase / 0.15) * 0.08; // Beat up - ขยายแค่ 8%
      } else if (beatPhase < 0.25) {
        scale = 1.08 - ((beatPhase - 0.15) / 0.1) * 0.08; // Beat down - หดกลับมา
      }
      
      heart.style('transform', `scale(${scale})`);
      
      // Trigger new pulse at each beat
      if (Math.floor(time / beatInterval) > lastBeat) {
        lastBeat = Math.floor(time / beatInterval);
        createPulse();
      }
      
      // Update pulses
      updatePulses();
      
      // Update particles
      updateParticles();
      
      animationFrame = requestAnimationFrame(animate);
    }
    
    function createPulse() {
      sportData.forEach((sport, i) => {
        const intensity = sport.calories / totalCalories;
        const maxRadius = 100 + (intensity * 200);
        
        pulses.push({
          sport: sport.sport,
          color: sport.color,
          angle: sport.angle,
          radius: 50,
          maxRadius: maxRadius,
          opacity: 1,
          speed: 2 + (intensity * 2),
          thickness: 2 + (intensity * 8)
        });
        
        // Create particles
        for (let j = 0; j < Math.ceil(intensity * 10); j++) {
          particles.push({
            x: Math.cos(sport.angle) * 50,
            y: Math.sin(sport.angle) * 50,
            vx: Math.cos(sport.angle) * (1 + Math.random() * 2),
            vy: Math.sin(sport.angle) * (1 + Math.random() * 2),
            color: sport.color,
            opacity: 1,
            size: 2 + Math.random() * 3,
            life: 0
          });
        }
      });
    }
    
    function updatePulses() {
      pulses = pulses.filter(p => p.opacity > 0);
      
      pulses.forEach(p => {
        p.radius += p.speed;
        p.opacity = Math.max(0, 1 - (p.radius / p.maxRadius));
      });
      
      // Render pulses
      const pulseSelection = pulsesGroup
        .selectAll('circle')
        .data(pulses, (d, i) => i);
      
      pulseSelection.exit().remove();
      
      pulseSelection
        .enter()
        .append('circle')
        .merge(pulseSelection)
        .attr('r', d => d.radius)
        .attr('fill', 'none')
        .attr('stroke', d => d.color)
        .attr('stroke-width', d => d.thickness)
        .attr('opacity', d => d.opacity)
        .attr('filter', 'url(#pulse-glow)');
    }
    
    function updateParticles() {
      particles = particles.filter(p => p.life < 100);
      
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life += 1;
        p.opacity = Math.max(0, 1 - (p.life / 100));
        p.size *= 0.98;
      });
      
      // Render particles
      const particleSelection = particlesGroup
        .selectAll('circle')
        .data(particles, (d, i) => i);
      
      particleSelection.exit().remove();
      
      particleSelection
        .enter()
        .append('circle')
        .merge(particleSelection)
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)
        .attr('r', d => d.size)
        .attr('fill', d => d.color)
        .attr('opacity', d => d.opacity);
    }
    
    animate();
  }
</script>

<div class="visualization-wrapper">
  <div class="heart-container">
    <svg bind:this={svgElement}></svg>
  </div>
</div>

<style>
  .visualization-wrapper {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    margin-top: -120px;
  }
  
  .heart-container {
    width: 100%;
    max-width: 1000px;
    display: flex;
    justify-content: center;
    margin-bottom: 0;
    position: relative;
    z-index: 1;
  }
  
  @media (max-width: 768px) {
    .heart-container {
      max-width: 100%;
    }
  }
</style>