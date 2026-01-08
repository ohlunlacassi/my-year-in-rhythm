<script>
  import { onMount } from 'svelte';
  import * as d3 from 'd3';
  import { createEventDispatcher } from 'svelte';
  
  export let sportRecords = [];
  
  const dispatch = createEventDispatcher();
  
  let svgElement;
  let containerWidth = 0;
  let selectedSport = null;
  
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
  
  onMount(() => {
    if (sportRecords.length === 0) return;
    
    containerWidth = svgElement.parentElement.clientWidth;
    
    // Sum calories by sport type
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
        label: sportPatterns[sport]?.label || sport.replace(/_/g, ' ')
      }))
      .sort((a, b) => b.calories - a.calories)
      .filter(d => d.calories > 0);
    
    totalCalories = d3.sum(sportData, d => d.calories);
    
    drawTrack();
  });
  
  function drawTrack() {
    if (!svgElement || sportData.length === 0) return;
    
    const width = Math.min(containerWidth, 1000);
    const height = 600;
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Track dimensions (standard 400m track proportions)
    const straightLength = 240;
    const curveRadius = 100;
    const trackWidth = 80;
    
    const svg = d3.select(svgElement)
      .attr('width', width)
      .attr('height', height);
    
    svg.selectAll('*').remove();
    
    // Glow filter
    const defs = svg.append('defs');
    const filter = defs.append('filter')
      .attr('id', 'track-glow')
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%');
    
    filter.append('feGaussianBlur')
      .attr('stdDeviation', '4')
      .attr('result', 'coloredBlur');
    
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');
    
    const g = svg.append('g')
      .attr('transform', `translate(${centerX},${centerY})`);
    
    // Calculate track path
    const innerRadius = curveRadius;
    const outerRadius = curveRadius + trackWidth;
    const halfStraight = straightLength / 2;
    
    // Draw outer track boundary
    const outerPath = createTrackPath(halfStraight, outerRadius);
    g.append('path')
      .attr('d', outerPath)
      .attr('fill', 'none')
      .attr('stroke', 'rgba(255, 255, 255, 0.15)')
      .attr('stroke-width', 2);
    
    // Draw inner track boundary
    const innerPath = createTrackPath(halfStraight, innerRadius);
    g.append('path')
      .attr('d', innerPath)
      .attr('fill', 'none')
      .attr('stroke', 'rgba(255, 255, 255, 0.15)')
      .attr('stroke-width', 2);
    
    // Draw lane dividers
    for (let i = 1; i < 4; i++) {
      const laneRadius = innerRadius + (trackWidth / 4) * i;
      const lanePath = createTrackPath(halfStraight, laneRadius);
      g.append('path')
        .attr('d', lanePath)
        .attr('fill', 'none')
        .attr('stroke', 'rgba(255, 255, 255, 0.05)')
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '5,5');
    }
    
    // Calculate total track length
    const curveLength = Math.PI * curveRadius;
    const totalTrackLength = straightLength * 2 + curveLength * 2;
    
    // Draw sport segments
    let currentDistance = 0;
    
    sportData.forEach((sport, i) => {
      const proportion = sport.calories / totalCalories;
      const segmentLength = proportion * totalTrackLength;
      
      const startDist = currentDistance;
      const endDist = currentDistance + segmentLength;
      
      // Create segment path
      const segmentPath = createSegmentPath(
        startDist,
        endDist,
        halfStraight,
        innerRadius,
        outerRadius,
        straightLength,
        curveLength
      );
      
      const segmentGroup = g.append('g')
        .attr('class', 'track-segment')
        .style('cursor', 'pointer')
        .on('click', () => handleSegmentClick(sport))
        .on('mouseenter', function() {
          d3.select(this).select('path')
            .transition()
            .duration(200)
            .attr('filter', 'url(#track-glow)')
            .style('opacity', 1);
        })
        .on('mouseleave', function() {
          if (selectedSport !== sport.sport) {
            d3.select(this).select('path')
              .transition()
              .duration(200)
              .attr('filter', 'none')
              .style('opacity', 0.85);
          }
        });
      
      segmentGroup.append('path')
        .attr('d', segmentPath)
        .attr('fill', sport.color)
        .style('opacity', selectedSport === sport.sport ? 1 : 0.85)
        .attr('stroke', selectedSport === sport.sport ? '#ffffff' : 'none')
        .attr('stroke-width', 2)
        .attr('filter', selectedSport === sport.sport ? 'url(#track-glow)' : 'none');
      
      // Add label for larger segments
      if (proportion > 0.06) {
        const midDist = (startDist + endDist) / 2;
        const labelPos = getPositionOnTrack(midDist, halfStraight, innerRadius, straightLength, curveLength);
        
        segmentGroup.append('text')
          .attr('x', labelPos.x)
          .attr('y', labelPos.y)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .style('font-family', 'monospace')
          .style('font-size', '11px')
          .style('font-weight', 'bold')
          .style('fill', '#ffffff')
          .style('pointer-events', 'none')
          .style('text-shadow', '0 0 4px rgba(0,0,0,0.8)')
          .text(`${sport.caloriesK}kcal`);
      }
      
      currentDistance += segmentLength;
    });
    
    // Center info - แสดง Total Calories
    g.append('rect')
      .attr('x', -140)
      .attr('y', -60)
      .attr('width', 280)
      .attr('height', 120)
      .attr('rx', 12)
      .attr('fill', 'rgba(0, 0, 0, 0.7)')
      .attr('stroke', 'rgba(255, 122, 92, 0.4)')
      .attr('stroke-width', 2);
    
    g.append('text')
      .attr('x', 0)
      .attr('y', -30)
      .attr('text-anchor', 'middle')
      .style('font-family', 'monospace')
      .style('font-size', '13px')
      .style('fill', 'rgba(255, 255, 255, 0.5)')
      .text('TOTAL BURNED');
    
    const totalK = (totalCalories / 1000).toFixed(1);
    g.append('text')
      .attr('x', 0)
      .attr('y', 10)
      .attr('text-anchor', 'middle')
      .style('font-family', 'monospace')
      .style('font-size', '42px')
      .style('font-weight', '200')
      .style('fill', '#ff7a5c')
      .text(totalK);
    
    g.append('text')
      .attr('x', 0)
      .attr('y', 35)
      .attr('text-anchor', 'middle')
      .style('font-family', 'monospace')
      .style('font-size', '14px')
      .style('fill', 'rgba(255, 255, 255, 0.5)')
      .text('KCAL');
  }
  
  function createTrackPath(halfStraight, radius) {
    return `
      M ${-halfStraight} ${-radius}
      L ${halfStraight} ${-radius}
      A ${radius} ${radius} 0 0 1 ${halfStraight} ${radius}
      L ${-halfStraight} ${radius}
      A ${radius} ${radius} 0 0 1 ${-halfStraight} ${-radius}
      Z
    `;
  }
  
  function getPositionOnTrack(distance, halfStraight, radius, straightLength, curveLength) {
    if (distance < straightLength) {
      return {
        x: -halfStraight + distance,
        y: -radius
      };
    }
    
    distance -= straightLength;
    if (distance < curveLength) {
      const angle = -Math.PI / 2 + (distance / curveLength) * Math.PI;
      return {
        x: halfStraight + radius * Math.cos(angle),
        y: radius * Math.sin(angle)
      };
    }
    
    distance -= curveLength;
    if (distance < straightLength) {
      return {
        x: halfStraight - distance,
        y: radius
      };
    }
    
    distance -= straightLength;
    const angle = Math.PI / 2 + (distance / curveLength) * Math.PI;
    return {
      x: -halfStraight + radius * Math.cos(angle),
      y: radius * Math.sin(angle)
    };
  }
  
  function createSegmentPath(startDist, endDist, halfStraight, innerRadius, outerRadius, straightLength, curveLength) {
    const points = [];
    const numPoints = Math.max(20, Math.ceil((endDist - startDist) / 5));
    
    for (let i = 0; i <= numPoints; i++) {
      const dist = startDist + (endDist - startDist) * (i / numPoints);
      const pos = getPositionOnTrack(dist, halfStraight, outerRadius, straightLength, curveLength);
      points.push(pos);
    }
    
    for (let i = numPoints; i >= 0; i--) {
      const dist = startDist + (endDist - startDist) * (i / numPoints);
      const pos = getPositionOnTrack(dist, halfStraight, innerRadius, straightLength, curveLength);
      points.push(pos);
    }
    
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      path += ` L ${points[i].x} ${points[i].y}`;
    }
    path += ' Z';
    
    return path;
  }
  
  function handleSegmentClick(segment) {
    if (selectedSport === segment.sport) {
      selectedSport = null;
      dispatch('filter', { sport: null });
    } else {
      selectedSport = segment.sport;
      dispatch('filter', { sport: segment.sport });
    }
    drawTrack();
  }
</script>

<section class="track-section">
  <div class="section-header">
    <h2 class="section-title">Energy Expenditure</h2>
    <p class="section-subtitle">Calories burned across different activities</p>
  </div>
  
  <div class="track-container">
    <svg bind:this={svgElement}></svg>
  </div>
  
  <div class="legend">
    {#each sportData as sport}
      <button 
        class="legend-item"
        class:active={selectedSport === sport.sport}
        on:click={() => handleSegmentClick(sport)}
      >
        <span class="legend-color" style="background: {sport.color}"></span>
        <span class="legend-label">{sport.label}</span>
        <span class="legend-calories">{sport.caloriesK} kcal</span>
      </button>
    {/each}
  </div>
</section>

<style>
  .track-section {
    min-height: 100vh;
    scroll-snap-align: start;
    background: linear-gradient(180deg, #1a1a1a 0%, #0f0f0f 100%);
    padding: 80px 40px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .section-header {
    text-align: center;
    margin-bottom: 60px;
  }
  
  .section-title {
    font-size: clamp(2rem, 5vw, 3.5rem);
    font-weight: 200;
    color: #ffffff;
    margin-bottom: 12px;
    letter-spacing: -0.02em;
  }
  
  .section-subtitle {
    font-size: 1rem;
    color: rgba(255, 255, 255, 0.4);
    font-family: monospace;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }
  
  .track-container {
    width: 100%;
    max-width: 1000px;
    display: flex;
    justify-content: center;
    margin-bottom: 40px;
  }
  
  .legend {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 12px;
    max-width: 1000px;
    width: 100%;
  }
  
  .legend-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-family: monospace;
  }
  
  .legend-item:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 122, 92, 0.4);
  }
  
  .legend-item.active {
    background: rgba(255, 122, 92, 0.1);
    border-color: #ff7a5c;
    box-shadow: 0 0 20px rgba(255, 122, 92, 0.3);
  }
  
  .legend-color {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    flex-shrink: 0;
  }
  
  .legend-label {
    flex: 1;
    font-size: 0.85rem;
    color: rgba(255, 255, 255, 0.7);
  }
  
  .legend-calories {
    font-size: 0.85rem;
    color: rgba(255, 122, 92, 0.8);
    font-weight: bold;
  }
  
  @media (max-width: 768px) {
    .track-section {
      padding: 60px 20px;
    }
    
    .legend {
      grid-template-columns: 1fr;
    }
  }
</style>