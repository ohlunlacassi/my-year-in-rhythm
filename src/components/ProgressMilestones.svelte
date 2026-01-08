<script>
  import { onMount } from 'svelte';
  import * as d3 from 'd3';
  
  export let sportRecords = [];
  export let fitnessDaily = [];
  
  let svgElement;
  let containerWidth = 0;
  let tooltipElement;
  
  let cumulativeData = [];
  let milestones = [];
  
  onMount(() => {
    if (sportRecords.length === 0 && fitnessDaily.length === 0) return;
    
    containerWidth = svgElement.parentElement.clientWidth;
    
    // Process data: aggregate by day and calculate cumulative
    const dayMap = new Map();
    
    sportRecords.forEach(record => {
      const date = new Date(record.time);
      const dayKey = d3.timeDay.floor(date).getTime();
      if (!dayMap.has(dayKey)) {
        dayMap.set(dayKey, { date: new Date(dayKey), minutes: 0, calories: 0 });
      }
      const day = dayMap.get(dayKey);
      day.minutes += (record.duration || 0) / 60;
      day.calories += record.calories || 0;
    });
    
    fitnessDaily.forEach(record => {
      const date = new Date(record.time);
      const dayKey = d3.timeDay.floor(date).getTime();
      if (!dayMap.has(dayKey)) {
        dayMap.set(dayKey, { date: new Date(dayKey), minutes: 0, calories: 0 });
      }
      const day = dayMap.get(dayKey);
      if (record.trainingMinutes && !isNaN(record.trainingMinutes)) {
        day.minutes = Math.max(day.minutes, record.trainingMinutes);
      }
    });
    
    // Filter and sort
    const startDate = new Date('2024-10-01');
    const endDate = new Date('2025-12-31');
    
    const sortedData = Array.from(dayMap.values())
      .filter(d => d.date >= startDate && d.date <= endDate)
      .sort((a, b) => a.date - b.date);
    
    // Calculate cumulative
    let cumulativeHours = 0;
    let cumulativeCalories = 0;
    
    cumulativeData = sortedData.map(d => {
      cumulativeHours += d.minutes / 60;
      cumulativeCalories += d.calories;
      return {
        date: d.date,
        hours: cumulativeHours,
        calories: cumulativeCalories,
        dailyMinutes: d.minutes
      };
    });
    
    // Calculate milestones (every 50 hours)
    const maxHours = cumulativeHours;
    const milestoneInterval = 50;
    milestones = [];
    
    for (let h = milestoneInterval; h <= maxHours; h += milestoneInterval) {
      const dataPoint = cumulativeData.find(d => d.hours >= h);
      if (dataPoint) {
        milestones.push({
          hours: h,
          date: dataPoint.date,
          cumulativeHours: dataPoint.hours,
          calories: dataPoint.calories
        });
      }
    }
    
    console.log('📊 Cumulative data:', cumulativeData.length, 'days');
    console.log('🎯 Milestones:', milestones.length);
    
    drawProgressChart();
  });
  
  function drawProgressChart() {
    if (!svgElement || cumulativeData.length === 0) return;
    
    const margin = { top: 40, right: 60, bottom: 60, left: 80 };
    const width = Math.min(containerWidth, 1200) - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;
    
    const svg = d3.select(svgElement)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom);
    
    svg.selectAll('*').remove();
    
    // Create gradients
    const defs = svg.append('defs');
    
    // Area gradient
    const areaGradient = defs.append('linearGradient')
      .attr('id', 'area-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');
    
    areaGradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#35d1c5')
      .attr('stop-opacity', 0.4);
    
    areaGradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#35d1c5')
      .attr('stop-opacity', 0);
    
    // Line gradient
    const lineGradient = defs.append('linearGradient')
      .attr('id', 'line-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '0%');
    
    lineGradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#35d1c5');
    
    lineGradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#ff7a5c');
    
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Scales
    const xScale = d3.scaleTime()
      .domain(d3.extent(cumulativeData, d => d.date))
      .range([0, width]);
    
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(cumulativeData, d => d.hours) * 1.1])
      .range([height, 0])
      .nice();
    
    // Grid lines
    g.append('g')
      .attr('class', 'grid')
      .selectAll('line')
      .data(yScale.ticks(8))
      .enter()
      .append('line')
      .attr('x1', 0)
      .attr('x2', width)
      .attr('y1', d => yScale(d))
      .attr('y2', d => yScale(d))
      .attr('stroke', 'rgba(255, 255, 255, 0.05)')
      .attr('stroke-width', 1);
    
    // Area
    const area = d3.area()
      .x(d => xScale(d.date))
      .y0(height)
      .y1(d => yScale(d.hours))
      .curve(d3.curveMonotoneX);
    
    const areaPath = g.append('path')
      .datum(cumulativeData)
      .attr('class', 'area')
      .attr('d', area)
      .attr('fill', 'url(#area-gradient)')
      .attr('opacity', 0);
    
    // Line
    const line = d3.line()
      .x(d => xScale(d.date))
      .y(d => yScale(d.hours))
      .curve(d3.curveMonotoneX);
    
    const linePath = g.append('path')
      .datum(cumulativeData)
      .attr('class', 'line')
      .attr('d', line)
      .attr('fill', 'none')
      .attr('stroke', 'url(#line-gradient)')
      .attr('stroke-width', 3);
    
    // Animate line - IMPROVED
    const totalLength = linePath.node().getTotalLength();
    
    linePath
      .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
      .attr('stroke-dashoffset', totalLength)
      .transition()
      .duration(2500)  // Increased from 2000
      .ease(d3.easeCubicInOut)
      .attr('stroke-dashoffset', 0)
      .on('end', () => {
        // Fade in area after line - IMPROVED
        areaPath.transition()
          .duration(1000)  // Increased from 800
          .ease(d3.easeCubicOut)
          .attr('opacity', 1);
      });
    
    // X Axis
    const xAxis = d3.axisBottom(xScale)
      .ticks(d3.timeMonth.every(1))
      .tickFormat(d3.timeFormat('%b'));
    
    g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${height})`)
      .call(xAxis)
      .selectAll('text')
      .style('font-family', 'monospace')
      .style('font-size', '11px')
      .style('fill', 'rgba(255, 255, 255, 0.6)');
    
    g.select('.x-axis')
      .selectAll('line, path')
      .attr('stroke', 'rgba(255, 255, 255, 0.2)');
    
    // Y Axis
    const yAxis = d3.axisLeft(yScale)
      .ticks(8)
      .tickFormat(d => `${d}h`);
    
    g.append('g')
      .attr('class', 'y-axis')
      .call(yAxis)
      .selectAll('text')
      .style('font-family', 'monospace')
      .style('font-size', '11px')
      .style('fill', 'rgba(255, 255, 255, 0.6)');
    
    g.select('.y-axis')
      .selectAll('line, path')
      .attr('stroke', 'rgba(255, 255, 255, 0.2)');
    
    // Y Axis label
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height / 2)
      .attr('y', -55)
      .attr('text-anchor', 'middle')
      .style('font-family', 'monospace')
      .style('font-size', '12px')
      .style('fill', 'rgba(255, 255, 255, 0.5)')
      .style('letter-spacing', '1px')
      .text('CUMULATIVE HOURS');
    
    // Milestones - GREATLY IMPROVED ANIMATIONS
    const milestoneGroup = g.append('g').attr('class', 'milestones');
    
    milestones.forEach((milestone, i) => {
      const x = xScale(milestone.date);
      const y = yScale(milestone.hours);
      
      // Vertical line with wave effect
      const vLine = milestoneGroup.append('line')
        .attr('x1', x)
        .attr('x2', x)
        .attr('y1', height)
        .attr('y2', height)
        .attr('stroke', '#ff7a5c')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '4,4')
        .attr('opacity', 0);
      
      vLine.transition()
        .delay(2500 + i * 150)  // Start after line animation
        .duration(600)
        .ease(d3.easeCubicOut)
        .attr('y2', y)
        .attr('opacity', 0.5);
      
      // Milestone circle with elastic bounce
      const circle = milestoneGroup.append('circle')
        .attr('cx', x)
        .attr('cy', y)
        .attr('r', 0)
        .attr('fill', '#ff7a5c')
        .attr('stroke', '#fff')
        .attr('stroke-width', 3)
        .style('cursor', 'pointer')
        .on('mouseover', function(event) {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('r', 10);
          showMilestoneTooltip(event, milestone);
        })
        .on('mouseout', function() {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('r', 7);
          hideTooltip();
        });
      
      // Elastic bounce animation
      circle.transition()
        .delay(2500 + i * 150)
        .duration(600)
        .ease(d3.easeElasticOut.amplitude(1).period(0.3))
        .attr('r', 7);
      
      // Milestone label with slide-in
      const label = milestoneGroup.append('text')
        .attr('x', x)
        .attr('y', y - 30)
        .attr('text-anchor', 'middle')
        .style('font-family', 'monospace')
        .style('font-size', '13px')
        .style('font-weight', 'bold')
        .style('fill', '#ff7a5c')
        .style('opacity', 0)
        .text(`${milestone.hours}h`);
      
      label.transition()
        .delay(2500 + i * 150 + 300)
        .duration(500)
        .ease(d3.easeCubicOut)
        .attr('y', y - 20)
        .style('opacity', 1);
    });
    
    // Interactive overlay for tooltips
    g.append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', 'none')
      .attr('pointer-events', 'all')
      .on('mousemove', function(event) {
        const [mouseX] = d3.pointer(event);
        const date = xScale.invert(mouseX);
        const bisect = d3.bisector(d => d.date).left;
        const index = bisect(cumulativeData, date, 1);
        const d0 = cumulativeData[index - 1];
        const d1 = cumulativeData[index];
        if (!d0 || !d1) return;
        const d = date - d0.date > d1.date - date ? d1 : d0;
        showDataTooltip(event, d);
      })
      .on('mouseout', hideTooltip);
    
    // Final stats with counter animation
    const finalData = cumulativeData[cumulativeData.length - 1];
    const finalHours = Math.round(finalData.hours);
    
    const finalText = g.append('text')
      .attr('x', width + 10)
      .attr('y', yScale(finalData.hours))
      .style('font-family', 'monospace')
      .style('font-size', '18px')
      .style('font-weight', 'bold')
      .style('fill', '#35d1c5')
      .style('opacity', 0)
      .text('0h');
    
    // Counter animation
    finalText.transition()
      .delay(3000)
      .duration(0)
      .style('opacity', 1)
      .transition()
      .duration(1500)
      .ease(d3.easeCubicOut)
      .tween('text', function() {
        const i = d3.interpolateNumber(0, finalHours);
        return function(t) {
          this.textContent = `${Math.round(i(t))}h`;
        };
      });
  }
  
  function showMilestoneTooltip(event, milestone) {
    if (!tooltipElement) return;
    
    const html = `
      <div class="tooltip-header">🎯 MILESTONE ACHIEVED</div>
      <div class="tooltip-milestone">${milestone.hours} Hours</div>
      <div class="tooltip-date">${d3.timeFormat('%B %d, %Y')(milestone.date)}</div>
      <div class="tooltip-calories">🔥 ${Math.round(milestone.calories).toLocaleString()} cal total</div>
    `;
    
    tooltipElement.innerHTML = html;
    tooltipElement.style.opacity = '1';
    tooltipElement.style.left = `${event.pageX + 10}px`;
    tooltipElement.style.top = `${event.pageY - 10}px`;
  }
  
  function showDataTooltip(event, data) {
    if (!tooltipElement) return;
    
    const hours = Math.floor(data.hours);
    const minutes = Math.round((data.hours - hours) * 60);
    
    const html = `
      <div class="tooltip-date">${d3.timeFormat('%B %d, %Y')(data.date)}</div>
      <div class="tooltip-value">⏱️ ${hours}h ${minutes}m total</div>
      <div class="tooltip-calories">🔥 ${Math.round(data.calories).toLocaleString()} cal</div>
    `;
    
    tooltipElement.innerHTML = html;
    tooltipElement.style.opacity = '1';
    tooltipElement.style.left = `${event.pageX + 10}px`;
    tooltipElement.style.top = `${event.pageY - 10}px`;
  }
  
  function hideTooltip() {
    if (!tooltipElement) return;
    tooltipElement.style.opacity = '0';
  }
</script>

<div class="progress-container">
  <svg bind:this={svgElement}></svg>
  <div bind:this={tooltipElement} class="tooltip"></div>
</div>

<style>
  .progress-container {
    position: relative;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
  }
  
  .progress-container svg {
    display: block;
  }
  
  .tooltip {
    position: fixed;
    pointer-events: none;
    background: rgba(0, 0, 0, 0.95);
    border: 1px solid #35d1c5;
    border-radius: 6px;
    padding: 12px 16px;
    opacity: 0;
    transition: opacity 0.2s ease;
    z-index: 1000;
    font-family: monospace;
    box-shadow: 0 4px 12px rgba(53, 209, 197, 0.3);
  }
  
  :global(.tooltip-header) {
    font-size: 0.7rem;
    color: #ff7a5c;
    margin-bottom: 8px;
    text-transform: uppercase;
    letter-spacing: 1px;
    font-weight: bold;
  }
  
  :global(.tooltip-milestone) {
    font-size: 1.4rem;
    font-weight: bold;
    color: #ff7a5c;
    margin-bottom: 6px;
  }
  
  :global(.tooltip-date) {
    font-size: 0.75rem;
    color: rgba(53, 209, 197, 0.7);
    margin-bottom: 6px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  :global(.tooltip-value) {
    font-size: 1rem;
    font-weight: bold;
    color: #35d1c5;
    margin-bottom: 4px;
  }
  
  :global(.tooltip-calories) {
    font-size: 0.9rem;
    color: rgba(255, 122, 92, 0.9);
  }
</style>