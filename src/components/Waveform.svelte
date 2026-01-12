<script>
  import { onMount } from 'svelte';
  import * as d3 from 'd3';
  
  export let sportRecords = [];
  export let calendar = [];
  
  let svgElement;
  let tooltipElement;
  let containerWidth = 0;
  let containerHeight = 0;
  let selectedSport = 'ALL';
  
  const margin = { top: 60, right: 40, bottom: 80, left: 40 }; // REDUCED from 200 to 80
  
  // Sport patterns
  const sportPatterns = {
    'outdoor_running': { freq: 0.8, amp: 1.2, pattern: 'sharp', color: '#35d1c5' },
    'outdoor_walking': { freq: 0.5, amp: 0.6, pattern: 'smooth', color: '#00d4ff' },
    'aerobics': { freq: 1.0, amp: 1.3, pattern: 'sharp', color: '#ff0080' },
    'mixed_aerobics': { freq: 0.9, amp: 1.1, pattern: 'sharp', color: '#ff3399' },
    'yoga': { freq: 0.3, amp: 0.4, pattern: 'smooth', color: '#9d4edd' },
    'free_training': { freq: 0.7, amp: 0.9, pattern: 'moderate', color: '#06ffa5' },
    'upper_limb_training': { freq: 0.6, amp: 0.8, pattern: 'moderate', color: '#ffbe0b' },
    'lower_limb_training': { freq: 0.6, amp: 0.8, pattern: 'moderate', color: '#fb5607' },
    'core_training': { freq: 0.6, amp: 0.7, pattern: 'moderate', color: '#ff006e' },
    'physical_training': { freq: 0.7, amp: 0.9, pattern: 'moderate', color: '#8338ec' },
    'pilates': { freq: 0.4, amp: 0.5, pattern: 'smooth', color: '#c77dff' },
    'flexibility_training': { freq: 0.3, amp: 0.4, pattern: 'smooth', color: '#e0aaff' },
    'indoor_walking': { freq: 0.5, amp: 0.6, pattern: 'smooth', color: '#48cae4' },
    'indoor_riding': { freq: 0.8, amp: 1.0, pattern: 'sharp', color: '#0096c7' },
    'weight_lifting': { freq: 0.5, amp: 1.0, pattern: 'moderate', color: '#ff9500' },
    'waist_training': { freq: 0.6, amp: 0.7, pattern: 'moderate', color: '#ff6b6b' },
    'back_training': { freq: 0.6, amp: 0.8, pattern: 'moderate', color: '#ffd166' },
    'high_interval_training': { freq: 1.2, amp: 1.4, pattern: 'sharp', color: '#ef233c' },
    'rope_skipping': { freq: 1.0, amp: 1.2, pattern: 'sharp', color: '#d90429' },
  };
  
  let sportsList = [];
  let processedData = [];
  
  $: {
    if (processedData.length > 0) {
      drawECG(selectedSport);
    }
  }
  
  onMount(() => {
    if (sportRecords.length === 0) return;
    
    containerWidth = svgElement.parentElement.clientWidth;
    containerHeight = svgElement.parentElement.clientHeight || 600;
    
    processedData = sportRecords
      .map(d => ({
        date: new Date(d.time),
        sportType: d.key,
        trainingMinutes: d.duration / 60
      }))
      .filter(d => 
        d.date >= new Date('2024-10-01') && 
        d.date <= new Date('2025-12-31')
      );
    
    const sportTotals = d3.rollups(
      processedData,
      v => d3.sum(v, d => d.trainingMinutes),
      d => d.sportType
    ).sort((a, b) => b[1] - a[1]);
    
    sportsList = sportTotals.map(([sport, minutes]) => ({
      sport,
      minutes,
      hours: Math.floor(minutes / 60)
    }))
    .filter(s => s.hours > 0);
    
    drawECG(selectedSport);
    
    // Handle window resize
    const handleResize = () => {
      containerWidth = svgElement.parentElement.clientWidth;
      containerHeight = svgElement.parentElement.clientHeight || 600;
      drawECG(selectedSport);
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  });
  
  function drawECG(sport) {
    if (!svgElement || processedData.length === 0) return;
    
    const width = containerWidth - margin.left - margin.right;
    const height = containerHeight || 500; // Reduced from 600 to 500
    
    const svg = d3.select(svgElement)
      .attr('width', containerWidth)
      .attr('height', height);
    
    svg.selectAll('*').remove();
    
    // Glow filter
    const defs = svg.append('defs');
    const filter = defs.append('filter')
      .attr('id', 'glow')
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%');
    
    filter.append('feGaussianBlur')
      .attr('stdDeviation', '3')
      .attr('result', 'coloredBlur');
    
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');
    
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    
    const filteredData = sport === 'ALL' 
      ? processedData 
      : processedData.filter(d => d.sportType === sport);
    
    if (filteredData.length === 0) {
      g.append('text')
        .attr('x', width / 2)
        .attr('y', (height - margin.top - margin.bottom) / 2)
        .attr('text-anchor', 'middle')
        .attr('fill', 'rgba(53, 209, 197, 0.5)')
        .style('font-family', 'monospace')
        .style('font-size', '16px')
        .text('NO DATA FOR THIS SPORT');
      return;
    }
    
    const startDate = new Date('2024-10-01');
    const endDate = new Date('2025-12-31');
    const allDates = [startDate, endDate];
    const weeks = d3.timeWeeks(startDate, endDate);
    
    const weeklyData = d3.rollups(
      filteredData,
      v => d3.sum(v, d => d.trainingMinutes),
      d => d3.timeWeek.floor(d.date)
    ).map(([date, minutes]) => ({ date, minutes }));
    
    const weeklyMap = new Map(weeklyData.map(d => [d.date.getTime(), d.minutes]));
    
    const weeklyHeartbeats = weeks.map(week => ({
      date: week,
      minutes: weeklyMap.get(week.getTime()) || 0
    }));
    
    const xScale = d3.scaleTime()
      .domain([startDate, endDate])
      .range([0, width]);
    
    // Move center down closer to x-axis
    const visualHeight = height - margin.top - margin.bottom;
    const centerY = visualHeight * 0.75; // 75% down - closer to x-axis
    const maxMinutes = d3.max(weeklyHeartbeats, d => d.minutes);
    
    // ECG Grid
    const gridSpacing = 25;
    for (let y = 0; y < height - margin.top - margin.bottom; y += gridSpacing) {
      g.append('line')
        .attr('x1', 0).attr('x2', width)
        .attr('y1', y).attr('y2', y)
        .attr('stroke', 'rgba(0, 255, 150, 0.05)')
        .attr('stroke-width', 0.5);
    }
    
    for (let x = 0; x < width; x += gridSpacing) {
      g.append('line')
        .attr('x1', x).attr('x2', x)
        .attr('y1', 0)
        .attr('y2', height - margin.top - margin.bottom)
        .attr('stroke', 'rgba(0, 255, 150, 0.05)')
        .attr('stroke-width', 0.5);
    }
    
    const pattern = sport !== 'ALL' && sportPatterns[sport]
      ? sportPatterns[sport]
      : { freq: 0.7, amp: 0.9, pattern: 'moderate', color: '#35d1c5' };
    
    const ecgColor = pattern.color;
    
    const ecgPoints = [];
    weeklyHeartbeats.forEach((week, i) => {
      const x = xScale(week.date);
      
      if (week.minutes === 0) {
        ecgPoints.push({ x, y: centerY });
      } else {
        const intensity = Math.min(week.minutes / maxMinutes, 1);
        const heightFactor = (height - margin.top - margin.bottom) / 400;
        const amp = intensity * pattern.amp * 100 * heightFactor;
        
        const segmentWidth = (weeklyHeartbeats[i + 1] ? xScale(weeklyHeartbeats[i + 1].date) - x : 20);
        const numBeats = Math.max(1, Math.floor(segmentWidth / 40 * pattern.freq));
        
        for (let b = 0; b < numBeats; b++) {
          const beatX = x + (b / numBeats) * segmentWidth;
          
          if (pattern.pattern === 'sharp') {
            ecgPoints.push({ x: beatX - 3, y: centerY });
            ecgPoints.push({ x: beatX - 2, y: centerY - amp * 0.2 });
            ecgPoints.push({ x: beatX - 1, y: centerY });
            ecgPoints.push({ x: beatX, y: centerY - amp * 0.1 });
            ecgPoints.push({ x: beatX + 1, y: centerY - amp });
            ecgPoints.push({ x: beatX + 2, y: centerY - amp * 0.1 });
            ecgPoints.push({ x: beatX + 3, y: centerY });
            ecgPoints.push({ x: beatX + 5, y: centerY - amp * 0.15 });
            ecgPoints.push({ x: beatX + 7, y: centerY });
          } else if (pattern.pattern === 'moderate') {
            ecgPoints.push({ x: beatX - 2, y: centerY });
            ecgPoints.push({ x: beatX, y: centerY - amp * 0.8 });
            ecgPoints.push({ x: beatX + 2, y: centerY });
          } else {
            ecgPoints.push({ x: beatX - 3, y: centerY });
            ecgPoints.push({ x: beatX, y: centerY - amp * 0.6 });
            ecgPoints.push({ x: beatX + 3, y: centerY });
          }
        }
      }
    });
    
    // Draw ECG line with animation
    const line = d3.line()
      .x(d => d.x)
      .y(d => d.y)
      .curve(d3.curveLinear);
    
    const path = g.append('path')
      .datum(ecgPoints)
      .attr('d', line)
      .attr('fill', 'none')
      .attr('stroke', ecgColor)
      .attr('stroke-width', 2.5)
      .attr('filter', 'url(#glow)')
      .style('opacity', 0.9);

    const totalLength = path.node().getTotalLength();

    function animateECG() {
       path
    .style('opacity', 0.9)
    .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
    .attr('stroke-dashoffset', totalLength)
    .transition()
    .duration(10000)
    .ease(d3.easeLinear)
    .attr('stroke-dashoffset', 0)
    .on('end', () => {
      path
        .style('opacity', 0.3)
        .attr('stroke-dashoffset', totalLength)
        .transition()
        .duration(10000)
        .ease(d3.easeLinear)
        .attr('stroke-dashoffset', 0)
        .on('end', () => {
          setTimeout(animateECG, 1000);
        });
    });
}

    animateECG();
    
    // Baseline
    g.append('line')
      .attr('x1', 0).attr('x2', width)
      .attr('y1', centerY).attr('y2', centerY)
      .attr('stroke', `${ecgColor}40`)
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '5,5');

    // Detect rest periods
    const restPeriods = [];
    let restStart = null;
    let restCount = 0;

    weeklyHeartbeats.forEach((week, i) => {
      if (week.minutes === 0) {
        if (restStart === null) {
          restStart = i;
          restCount = 1;
        } else {
          restCount++;
        }
      } else {
        if (restStart !== null && restCount >= 1) {
          restPeriods.push({
            startIndex: restStart,
            endIndex: i - 1,
            duration: restCount
          });
        }
        restStart = null;
        restCount = 0;
      }
    });

    if (restStart !== null && restCount >= 1) {
      restPeriods.push({
        startIndex: restStart,
        endIndex: weeklyHeartbeats.length - 1,
        duration: restCount
      });
    }

    // Draw rest period annotations with calendar events
    restPeriods.forEach((period) => {
      const startWeek = weeklyHeartbeats[period.startIndex];
      const endWeek = weeklyHeartbeats[period.endIndex];
      
      const startX = xScale(startWeek.date);
      const endX = xScale(endWeek.date);
      const midX = (startX + endX) / 2;
      
let eventLabels = [];
if (sport === 'ALL' && calendar && calendar.length > 0) {
  const matchingEvents = calendar.filter(event => {
    const eventDate = new Date(event.start);

    const weekBefore = new Date(startWeek.date);
    weekBefore.setDate(weekBefore.getDate() - 7);
    const weekAfter = new Date(endWeek.date);
    weekAfter.setDate(weekAfter.getDate() + 7);

    return eventDate >= weekBefore && eventDate <= weekAfter;
  });
  
  if (matchingEvents.length > 0) {
    const categoryGroups = d3.rollups(
      matchingEvents,
      v => v.length,
      d => d.eventCategory || 'other'
    );
    
    eventLabels = categoryGroups
      .map(([category, count]) => `${category}: ${count}`)
      .sort();
  }
}
      
      const hasEvents = eventLabels.length > 0;
      if (!hasEvents) return;
      
      // Highlight bar on baseline
      g.append('rect')
        .attr('x', startX)
        .attr('y', centerY - 2)
        .attr('width', endX - startX)
        .attr('height', 4)
        .attr('fill', hasEvents ? 'rgba(255, 150, 100, 0.4)' : 'rgba(255, 100, 100, 0.3)')
        .attr('stroke', hasEvents ? 'rgba(255, 150, 100, 0.7)' : 'rgba(255, 100, 100, 0.6)')
        .attr('stroke-width', 1);
      
      // Calculate label dimensions
      const lineHeight = 14;
      const numLines = hasEvents ? eventLabels.length : 1;
      const labelHeight = numLines * lineHeight + 8;
      
      // Find longest label for width
      const allLabels = hasEvents ? eventLabels : [`Rest (${period.duration}w)`];
      const maxLength = Math.max(...allLabels.map(l => l.length));
      const labelWidth = Math.max(maxLength * 6.5 + 16, 100);
      
      // Label line pointing up
      const labelTopY = centerY - 50 - labelHeight;
      g.append('line')
        .attr('x1', midX)
        .attr('x2', midX)
        .attr('y1', centerY)
        .attr('y2', labelTopY + labelHeight)
        .attr('stroke', hasEvents ? 'rgba(255, 150, 100, 0.6)' : 'rgba(255, 100, 100, 0.5)')
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '2,2');
      
      // Label background
      g.append('rect')
        .attr('x', midX - labelWidth / 2)
        .attr('y', labelTopY)
        .attr('width', labelWidth)
        .attr('height', labelHeight)
        .attr('fill', hasEvents ? 'rgba(255, 150, 100, 0.25)' : 'rgba(255, 100, 100, 0.2)')
        .attr('stroke', hasEvents ? 'rgba(255, 150, 100, 0.5)' : 'rgba(255, 100, 100, 0.4)')
        .attr('stroke-width', 1)
        .attr('rx', 4);
    
        if (hasEvents) {
  eventLabels.forEach((label, i) => {
    g.append('text')
      .attr('x', midX)
      .attr('y', labelTopY + 14 + (i * lineHeight))
      .attr('text-anchor', 'middle')
      .attr('fill', 'rgba(255, 150, 100, 0.9)')
      .style('font-family', 'monospace')
      .style('font-size', '11px')
      .text(label);
  });
} else {
  g.append('text')
    .attr('x', midX)
    .attr('y', labelTopY + labelHeight / 2 + 4)
    .attr('text-anchor', 'middle')
    .attr('fill', 'rgba(255, 100, 100, 0.8)')
    .style('font-family', 'monospace')
    .style('font-size', '11px')
    .text(`Rest (${period.duration}w)`);
}
    });
    
    // X-axis
    const xAxis = d3.axisBottom(xScale)
      .ticks(d3.timeMonth.every(1))
      .tickFormat(d3.timeFormat('%b'));
    
    g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${height - margin.top - margin.bottom})`)
      .call(xAxis)
      .call(g => g.select('.domain').attr('stroke', `${ecgColor}60`))
      .call(g => g.selectAll('.tick line').attr('stroke', `${ecgColor}40`))
      .call(g => g.selectAll('.tick text')
        .attr('fill', ecgColor)
        .style('font-family', 'monospace')
        .style('font-size', '11px'));
    
    // Title
    const sportName = sport === 'ALL' ? 'ALL ACTIVITIES' : sport.replace(/_/g, ' ').toUpperCase();
    svg.append('text')
      .attr('x', margin.left)
      .attr('y', 30)
      .attr('fill', ecgColor)
      .style('font-family', 'monospace')
      .style('font-size', '16px')
      .style('font-weight', 'bold')
      .text(`⚡ ${sportName}`);
    
    // Stats
    const totalHours = Math.floor(d3.sum(weeklyHeartbeats, d => d.minutes) / 60);
    const activeWeeks = weeklyHeartbeats.filter(d => d.minutes > 0).length;
    const avgPerWeek = activeWeeks > 0 ? Math.round(d3.mean(weeklyHeartbeats.filter(d => d.minutes > 0), d => d.minutes)) : 0;
    
    svg.append('text')
      .attr('x', width - 100)
      .attr('y', 30)
      .attr('fill', ecgColor)
      .style('font-family', 'monospace')
      .style('font-size', '14px')
      .text(`${totalHours}h | ${activeWeeks}w | ~${avgPerWeek}m/w`);
    
    // Interaction
    const overlay = g.append('rect')
      .attr('class', 'overlay')
      .attr('width', width)
      .attr('height', height - margin.top - margin.bottom)
      .attr('opacity', 0)
      .on('mousemove', handleMouseMove)
      .on('mouseleave', hideTooltip);
    
    function handleMouseMove(event) {
      const [mouseX] = d3.pointer(event);
      const date = xScale.invert(mouseX);
      
      const bisect = d3.bisector(d => d.date).left;
      const index = bisect(weeklyHeartbeats, date, 1);
      const d0 = weeklyHeartbeats[index - 1];
      const d1 = weeklyHeartbeats[index];
      if (!d0 || !d1) return;
      
      const week = date - d0.date > d1.date - date ? d1 : d0;
      
      if (week.minutes > 0) {
        showTooltip(week, mouseX, ecgColor);
      } else {
        hideTooltip();
      }
    }
  }
  
  function showTooltip(week, x, color) {
    if (!tooltipElement) return;
    
    tooltipElement.style.opacity = '1';
    tooltipElement.style.left = `${x + margin.left}px`;
    tooltipElement.style.top = `${margin.top + 100}px`;
    tooltipElement.style.borderColor = color;
    tooltipElement.style.boxShadow = `0 0 20px ${color}60`;
    
    const hours = Math.floor(week.minutes / 60);
    const minutes = Math.round(week.minutes % 60);
    
    let html = `<div class="tooltip-date">${d3.timeFormat('%b %d, %Y')(week.date)}</div>`;
    html += `<div class="tooltip-total" style="color: ${color}">⚡ ${hours}h ${minutes}m</div>`;
    
    tooltipElement.innerHTML = html;
  }
  
  function hideTooltip() {
    if (!tooltipElement) return;
    tooltipElement.style.opacity = '0';
  }
</script>

<div class="sport-dropdown-wrapper">
  <label for="sport-dropdown">ACTIVITY:</label>
  <select 
  id="sport-dropdown"
  bind:value={selectedSport}
  style="--dropdown-color: {sportPatterns[selectedSport]?.color || '#35d1c5'}"
>
  <option value="ALL">ALL ACTIVITIES</option>
  {#each sportsList as {sport, hours}}
    <option value={sport}>
      {sport.replace(/_/g, ' ').toUpperCase()}
    </option>
  {/each}
</select>
</div>

<div class="waveform-container">
  <svg bind:this={svgElement}></svg>
  <div bind:this={tooltipElement} class="tooltip"></div>
</div>

<style>
  .waveform-container {
    position: relative;
    width: 100%;
    height: 100%;
    min-height: 450px; /* Reduced from 500px */
    background: #000000;
  }
  
  .waveform-container svg {
    display: block;
    width: 100%;
    height: 100%;
  }
  
  .sport-dropdown-wrapper {
    position: absolute;
    top: 120px;
    right: 40px;
    display: flex;
    align-items: center;
    gap: 12px;
    z-index: 100;
  }

  .sport-dropdown-wrapper label {
    color: #35d1c5;
    font-family: monospace;
    font-size: 11px;
    font-weight: bold;
    letter-spacing: 1px;
  }

  #sport-dropdown {
    background: rgba(0, 0, 0, 0.9);
    border: 1px solid var(--dropdown-color, #35d1c5);
    border-radius: 4px;
    color: var(--dropdown-color, #35d1c5);
    font-family: monospace;
    font-size: 12px;
    padding: 6px 28px 6px 10px;
    cursor: pointer;
    outline: none;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2335d1c5' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 8px center;
    box-shadow: 0 0 10px var(--dropdown-color, #35d1c5)40;
    transition: all 0.3s ease;
    min-width: 220px;
  }

  #sport-dropdown:hover {
    border-color: var(--dropdown-color, #35d1c5);
    box-shadow: 0 0 20px var(--dropdown-color, #35d1c5)80;
    background-color: rgba(53, 209, 197, 0.05);
  }

  #sport-dropdown:focus {
    border-color: var(--dropdown-color, #35d1c5);
    box-shadow: 0 0 25px var(--dropdown-color, #35d1c5);
  }

  #sport-dropdown option {
    background: #000;
    color: #35d1c5;
    padding: 8px;
  }

  #sport-dropdown option:hover {
    background: rgba(53, 209, 197, 0.2);
  }
  
  .tooltip {
    position: absolute;
    pointer-events: none;
    background: rgba(0, 0, 0, 0.95);
    border: 1px solid #35d1c5;
    border-radius: 4px;
    padding: 12px 16px;
    opacity: 0;
    transition: opacity 0.2s ease;
    z-index: 10;
    font-family: monospace;
  }
  
  :global(.tooltip-date) {
    font-size: 0.7rem;
    color: rgba(53, 209, 197, 0.6);
    margin-bottom: 6px;
    text-transform: uppercase;
  }
  
  :global(.tooltip-total) {
    font-size: 1.2rem;
    font-weight: bold;
    margin-bottom: 6px;
  }
</style>