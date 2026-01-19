<script>
  import { onMount } from 'svelte';
  import * as d3 from 'd3';
  
  export let master = [];
  export let calendar = [];
  
  let svgElement;
  let containerWidth = 0;
  let impactData = [];
  let visible = false;
  let hasAnimated = false;
  let prefersReducedMotion = false;
  let baselineMinutes = 0;
  
  // Helper functions for accessibility
  function formatMinutes(minutes) {
    return `${Math.round(minutes)}min`;
  }
  
  function formatPercentage(value) {
    return `${value >= 0 ? '+' : ''}${Math.round(value)}%`;
  }
  
  const categoryConfig = {
    health: {
      label: 'Health Appointments',
      iconPath: '/icons/hospital.png',
      color: '#9d4edd',
      shortLabel: 'Health'
    },
    study: {
      label: 'Study Events',
      iconPath: '/icons/homework.png',
      color: '#35d1c5',
      shortLabel: 'Study'
    },
    holiday: {
      label: 'Holidays',
      iconPath: '/icons/holiday.png',
      color: '#ff7a5c',
      shortLabel: 'Holidays'
    },
    travel: {
      label: 'Travel',
      iconPath: '/icons/travel.png',
      color: '#ffd60a',
      shortLabel: 'Travel'
    },
    training: {
      label: 'Training Events',
      iconPath: '/icons/muscles.png',
      color: '#06ffa5',
      shortLabel: 'Training'
    },
    normal: {
      label: 'Normal Days',
      iconPath: '/icons/shoe.png',
      color: 'rgba(255, 255, 255, 0.3)',
      shortLabel: 'Normal'
    }
  };
  
  onMount(() => {
    if (master.length === 0) return;
    
    // Check for reduced motion preference
    prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    containerWidth = svgElement?.parentElement?.clientWidth || 800;
    analyzeEventImpact();
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !hasAnimated) {
          visible = true;
          hasAnimated = true;
          
          setTimeout(() => {
            drawLollipopChart();
          }, prefersReducedMotion ? 0 : 400);
          
          observer.disconnect();
        }
      });
    }, {
      threshold: 0.25,
      rootMargin: '0px 0px -50px 0px'
    });
    
    const container = svgElement?.closest('.impact-container');
    if (container) {
      observer.observe(container);
    }
    
    return () => observer.disconnect();
  });
  
  function analyzeEventImpact() {
    const dateMap = new Map();
    master.forEach(d => {
      const dateKey = d3.timeFormat('%Y-%m-%d')(d.date);
      dateMap.set(dateKey, d);
    });
    
    const eventsByCategory = d3.group(calendar, d => d.eventCategory || 'other');
    const categoryStats = {};
    
    eventsByCategory.forEach((events, category) => {
      const trainingMinutes = [];
      
      events.forEach(event => {
        const dateKey = d3.timeFormat('%Y-%m-%d')(event.start);
        const dayData = dateMap.get(dateKey);
        if (dayData && dayData.trainingMinutes > 0) {
          trainingMinutes.push(dayData.trainingMinutes);
        }
      });
      
      if (trainingMinutes.length > 0) {
        categoryStats[category] = {
          avgMinutes: d3.mean(trainingMinutes),
          count: trainingMinutes.length,
          totalDays: events.length
        };
      }
    });
    
    const eventDates = new Set(
      calendar.map(e => d3.timeFormat('%Y-%m-%d')(e.start))
    );
    
    const normalDaysTraining = master
      .filter(d => !eventDates.has(d3.timeFormat('%Y-%m-%d')(d.date)))
      .filter(d => d.trainingMinutes > 0)
      .map(d => d.trainingMinutes);
    
    const normalAvg = d3.mean(normalDaysTraining);
    baselineMinutes = normalAvg;
    
    categoryStats['normal'] = {
      avgMinutes: normalAvg,
      count: normalDaysTraining.length,
      totalDays: master.filter(d => !eventDates.has(d3.timeFormat('%Y-%m-%d')(d.date))).length
    };
    
    impactData = Object.entries(categoryStats)
      .filter(([cat]) => categoryConfig[cat])
      .map(([category, stats]) => {
        const change = ((stats.avgMinutes - normalAvg) / normalAvg) * 100;
        return {
          category,
          ...categoryConfig[category],
          avgMinutes: stats.avgMinutes,
          count: stats.count,
          totalDays: stats.totalDays,
          change: category === 'normal' ? 0 : change
        };
      })
      .filter(d => {
        return d.category === 'normal' || d.count >= 5;
      })
      .sort((a, b) => b.avgMinutes - a.avgMinutes);
    
    const normalIndex = impactData.findIndex(d => d.category === 'normal');
    if (normalIndex !== -1) {
      const normalData = impactData.splice(normalIndex, 1)[0];
      const middleIndex = Math.floor(impactData.length / 2);
      impactData.splice(middleIndex, 0, normalData);
    }
    
    console.log('🍭 Lollipop Chart Data:', impactData);
  }
  
  function drawLollipopChart() {
    if (!svgElement || impactData.length === 0) return;
    
    const margin = { top: 30, right: 100, bottom: 100, left: 160 };
    const width = Math.min(containerWidth * 0.7, 800) - margin.left - margin.right;
    const height = 450 - margin.top - margin.bottom;
    
    const svg = d3.select(svgElement)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .attr('role', 'img')
      .attr('aria-label', `Lollipop chart showing event impact on training. Baseline is ${formatMinutes(baselineMinutes)}.`);
    
    svg.selectAll('*').remove();
    
    // Add detailed description
    svg.append('desc')
      .text(`Lollipop chart visualization showing average training minutes for different event types. 
      Baseline (normal days): ${formatMinutes(baselineMinutes)}. 
      Each category shows average minutes, number of active days, and percentage change from baseline.
      Total of ${impactData.length} categories displayed.`);
    
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Scales
    const yScale = d3.scaleBand()
      .domain(impactData.map(d => d.category))
      .range([0, height])
      .padding(0.4);
    
    const xScale = d3.scaleLinear()
      .domain([0, d3.max(impactData, d => d.avgMinutes) * 1.15])
      .range([0, width])
      .nice();
    
    // Grid lines
    g.append('g')
      .attr('class', 'grid')
      .selectAll('line')
      .data(xScale.ticks(6))
      .enter()
      .append('line')
      .attr('x1', d => xScale(d))
      .attr('x2', d => xScale(d))
      .attr('y1', 0)
      .attr('y2', height)
      .attr('stroke', 'rgba(255, 255, 255, 0.05)')
      .attr('stroke-width', 1);
    
    // Baseline
    const normalData = impactData.find(d => d.category === 'normal');
    const baselineX = xScale(normalData.avgMinutes);
    
    g.append('line')
      .attr('class', 'baseline')
      .attr('x1', baselineX)
      .attr('x2', baselineX)
      .attr('y1', -10)
      .attr('y2', height + 10)
      .attr('stroke', 'rgba(255, 255, 255, 0.2)')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '5,5')
      .style('opacity', 0)
      .transition()
      .delay(prefersReducedMotion ? 0 : 200)
      .duration(prefersReducedMotion ? 0 : 600)
      .style('opacity', 1);
    
    g.append('text')
      .attr('x', baselineX + 10)
      .attr('y', -15)
      .style('font-family', 'monospace')
      .style('font-size', '11px')
      .style('fill', 'rgba(255, 255, 255, 0.5)')
      .text('BASELINE')
      .style('opacity', 0)
      .transition()
      .delay(prefersReducedMotion ? 0 : 400)
      .duration(prefersReducedMotion ? 0 : 400)
      .style('opacity', 1);
    
    // Create interactive groups for each lollipop
    impactData.forEach((d, i) => {
      const y = yScale(d.category) + yScale.bandwidth() / 2;
      
      const lollipopGroup = g.append('g')
        .attr('class', 'lollipop-group')
        .attr('tabindex', 0)
        .attr('role', 'button')
        .attr('aria-label', `${d.label}: ${formatMinutes(d.avgMinutes)}, ${d.count} active days, ${d.category === 'normal' ? 'baseline' : formatPercentage(d.change) + ' vs baseline'}`)
        .style('cursor', 'pointer')
        .style('outline', 'none');
      
      // Add title for tooltip
      lollipopGroup.append('title')
        .text(`${d.label}
${formatMinutes(d.avgMinutes)} average
${d.count} active days
${d.category === 'normal' ? 'Baseline' : formatPercentage(d.change) + ' vs baseline'}`);
      
      // Stem
      const stem = lollipopGroup.append('line')
        .attr('class', 'stem')
        .attr('x1', 0)
        .attr('x2', 0)
        .attr('y1', y)
        .attr('y2', y)
        .attr('stroke', d.color)
        .attr('stroke-width', 3)
        .attr('stroke-linecap', 'round');
      
      if (!prefersReducedMotion) {
        stem.transition()
          .delay(i * 120)
          .duration(800)
          .ease(d3.easeCubicOut)
          .attr('x2', xScale(d.avgMinutes));
      } else {
        stem.attr('x2', xScale(d.avgMinutes));
      }
      
      // Head
      const head = lollipopGroup.append('circle')
        .attr('class', 'head')
        .attr('cx', 0)
        .attr('cy', y)
        .attr('r', 0)
        .attr('fill', d.color)
        .attr('stroke', '#0a0a0a')
        .attr('stroke-width', 2)
        .style('opacity', 0);
      
      if (!prefersReducedMotion) {
        head.transition()
          .delay(i * 120 + 400)
          .duration(600)
          .ease(d3.easeBackOut)
          .attr('cx', xScale(d.avgMinutes))
          .attr('r', 8)
          .style('opacity', 1);
      } else {
        head
          .attr('cx', xScale(d.avgMinutes))
          .attr('r', 8)
          .style('opacity', 1);
      }
      
      // Focus state
      lollipopGroup
        .on('focus', function() {
          d3.select(this).select('circle')
            .transition()
            .duration(200)
            .attr('r', 12)
            .style('filter', 'drop-shadow(0 0 8px ' + d.color + ')');
        })
        .on('blur', function() {
          d3.select(this).select('circle')
            .transition()
            .duration(200)
            .attr('r', 8)
            .style('filter', 'none');
        })
        .on('keydown', function(event) {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            console.log('Category selected:', d);
          }
        });
    });
    
    // Value labels
    g.selectAll('.value-label')
      .data(impactData)
      .enter()
      .append('text')
      .attr('class', 'value-label')
      .attr('x', 0)
      .attr('y', d => yScale(d.category) + yScale.bandwidth() / 2 - 15)
      .attr('text-anchor', 'start')
      .style('font-family', 'monospace')
      .style('font-size', '13px')
      .style('font-weight', 'bold')
      .style('fill', d => d.color)
      .style('opacity', 0)
      .style('pointer-events', 'none')
      .text(d => formatMinutes(d.avgMinutes))
      .transition()
      .delay((d, i) => prefersReducedMotion ? 0 : i * 120 + 600)
      .duration(prefersReducedMotion ? 0 : 400)
      .attr('x', d => xScale(d.avgMinutes) + 15)
      .style('opacity', 1);
    
    // Count labels
    g.selectAll('.count-label')
      .data(impactData)
      .enter()
      .append('text')
      .attr('class', 'count-label')
      .attr('x', 0)
      .attr('y', d => yScale(d.category) + yScale.bandwidth() / 2 + 18)
      .attr('text-anchor', 'start')
      .style('font-family', 'monospace')
      .style('font-size', '10px')
      .style('fill', 'rgba(255, 255, 255, 0.4)')
      .style('opacity', 0)
      .style('pointer-events', 'none')
      .text(d => `${d.count} active`)
      .transition()
      .delay((d, i) => prefersReducedMotion ? 0 : i * 120 + 700)
      .duration(prefersReducedMotion ? 0 : 400)
      .attr('x', d => xScale(d.avgMinutes) + 15)
      .style('opacity', 1);
    
    // Change badges
    impactData.forEach((d, i) => {
      if (d.category === 'normal') return;
      
      const x = xScale(d.avgMinutes);
      const y = yScale(d.category) + yScale.bandwidth() / 2;
      
      const changeGroup = g.append('g')
        .attr('transform', `translate(${x}, ${y})`)
        .style('pointer-events', 'none');
      
      const isNegative = d.change < 0;
      const changeText = formatPercentage(d.change);
      const arrow = isNegative ? '↓' : '↑';
      
      changeGroup.append('rect')
        .attr('x', 70)
        .attr('y', -10)
        .attr('width', 65)
        .attr('height', 20)
        .attr('rx', 10)
        .attr('fill', isNegative ? 'rgba(255, 122, 92, 0.15)' : 'rgba(53, 209, 197, 0.15)')
        .attr('stroke', isNegative ? '#ff7a5c' : '#35d1c5')
        .attr('stroke-width', 1)
        .style('opacity', 0)
        .transition()
        .delay(prefersReducedMotion ? 0 : i * 120 + 1000)
        .duration(prefersReducedMotion ? 0 : 400)
        .style('opacity', 1);
      
      changeGroup.append('text')
        .attr('x', 102.5)
        .attr('y', 4)
        .attr('text-anchor', 'middle')
        .style('font-family', 'monospace')
        .style('font-size', '11px')
        .style('font-weight', 'bold')
        .style('fill', isNegative ? '#ff7a5c' : '#35d1c5')
        .style('opacity', 0)
        .text(`${changeText} ${arrow}`)
        .transition()
        .delay(prefersReducedMotion ? 0 : i * 120 + 1000)
        .duration(prefersReducedMotion ? 0 : 400)
        .style('opacity', 1);
    });
    
    // Y-axis labels with better text handling
    impactData.forEach((d, i) => {
      const y = yScale(d.category) + yScale.bandwidth() / 2;
      
      const labelGroup = g.append('g')
        .attr('transform', `translate(0, ${y})`);
      
      // Icon
      labelGroup.append('image')
        .attr('xlink:href', d.iconPath)
        .attr('x', -50)
        .attr('y', -12)
        .attr('width', 24)
        .attr('height', 24)
        .attr('alt', `${d.label} icon`)
        .style('opacity', 0)
        .transition()
        .delay(prefersReducedMotion ? 0 : i * 120)
        .duration(prefersReducedMotion ? 0 : 400)
        .style('opacity', 1);
      
      // Label text - split long labels into two lines if needed
      const labelText = d.label;
      const words = labelText.split(' ');
      
      if (words.length > 1 && labelText.length > 12) {
        // Multi-line label
        labelGroup.append('text')
          .attr('x', -60)
          .attr('y', -5)
          .attr('text-anchor', 'end')
          .style('font-family', 'monospace')
          .style('font-size', '10px')
          .style('fill', 'rgba(255, 255, 255, 0.7)')
          .style('opacity', 0)
          .text(words[0])
          .transition()
          .delay(prefersReducedMotion ? 0 : i * 120 + 200)
          .duration(prefersReducedMotion ? 0 : 400)
          .style('opacity', 1);
        
        labelGroup.append('text')
          .attr('x', -60)
          .attr('y', 10)
          .attr('text-anchor', 'end')
          .style('font-family', 'monospace')
          .style('font-size', '10px')
          .style('fill', 'rgba(255, 255, 255, 0.7)')
          .style('opacity', 0)
          .text(words.slice(1).join(' '))
          .transition()
          .delay(prefersReducedMotion ? 0 : i * 120 + 200)
          .duration(prefersReducedMotion ? 0 : 400)
          .style('opacity', 1);
      } else {
        // Single line label
        labelGroup.append('text')
          .attr('x', -60)
          .attr('y', 5)
          .attr('text-anchor', 'end')
          .style('font-family', 'monospace')
          .style('font-size', '11px')
          .style('fill', 'rgba(255, 255, 255, 0.7)')
          .style('opacity', 0)
          .text(labelText)
          .transition()
          .delay(prefersReducedMotion ? 0 : i * 120 + 200)
          .duration(prefersReducedMotion ? 0 : 400)
          .style('opacity', 1);
      }
    });
    
    // X-axis
    const xAxis = d3.axisBottom(xScale)
      .ticks(6)
      .tickFormat(d => `${d}min`);
    
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
    
    g.append('text')
      .attr('x', width / 2)
      .attr('y', height + 50)
      .attr('text-anchor', 'middle')
      .style('font-family', 'monospace')
      .style('font-size', '12px')
      .style('fill', 'rgba(255, 255, 255, 0.5)')
      .style('letter-spacing', '1px')
      .text('AVERAGE TRAINING MINUTES');
    
    // Title
    svg.append('text')
      .attr('x', margin.left)
      .attr('y', 35)
      .style('font-family', 'monospace')
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .style('fill', 'rgba(255, 255, 255, 0.7)')
      .style('letter-spacing', '1px')
    
    svg.append('text')
      .attr('x', margin.left)
      .attr('y', 52)
      .style('font-family', 'monospace')
      .style('font-size', '10px')
      .style('fill', 'rgba(255, 255, 255, 0.4)')
  }
</script>

<!-- Skip link -->
<a href="#after-lollipop" class="skip-link">Skip lollipop chart</a>

<!-- Live region for screen readers -->
<div aria-live="polite" aria-atomic="true" class="sr-only">
  {#if visible && impactData.length > 0}
    Lollipop chart is now visible. 
    Baseline training: {formatMinutes(baselineMinutes)}. 
    Showing {impactData.length} event categories with their training impact.
  {/if}
</div>

<div class="impact-container" class:visible>
  <svg bind:this={svgElement}></svg>
</div>

<!-- Hidden data table for screen readers -->
{#if impactData.length > 0}
<div class="sr-only">
  <h3>Training Impact by Event Type</h3>
  <table>
    <caption>Average training minutes for different event types compared to baseline of {formatMinutes(baselineMinutes)}</caption>
    <thead>
      <tr>
        <th scope="col">Event Type</th>
        <th scope="col">Average Minutes</th>
        <th scope="col">Active Days</th>
        <th scope="col">Change from Baseline</th>
      </tr>
    </thead>
    <tbody>
      {#each impactData as item}
      <tr>
        <td>{item.label}</td>
        <td>{formatMinutes(item.avgMinutes)}</td>
        <td>{item.count} days</td>
        <td>{item.category === 'normal' ? 'Baseline' : formatPercentage(item.change)}</td>
      </tr>
      {/each}
    </tbody>
  </table>
</div>
{/if}

<div id="after-lollipop"></div>

<style>
  .impact-container {
    position: relative;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transform: translateY(40px);
    transition: all 1s cubic-bezier(0.16, 1, 0.3, 1);
  }
  
  .impact-container.visible {
    opacity: 1;
    transform: translateY(0);
  }
  
  .impact-container svg {
    display: block;
  }
  
  /* Screen reader only content */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }
  
  /* Skip link */
  .skip-link {
    position: absolute;
    left: -10000px;
    top: auto;
    width: 1px;
    height: 1px;
    overflow: hidden;
    background: #35d1c5;
    color: #0a0a0a;
    padding: 8px 16px;
    text-decoration: none;
    font-weight: bold;
    border-radius: 4px;
    font-family: monospace;
  }
  
  .skip-link:focus {
    position: static;
    width: auto;
    height: auto;
    overflow: visible;
    z-index: 1000;
  }
  
  /* Keyboard focus styles */
  :global(.lollipop-group:focus circle) {
    filter: drop-shadow(0 0 8px currentColor) !important;
  }
  
  @media (prefers-reduced-motion: reduce) {
    .impact-container {
      transition: opacity 0.3s ease;
      transform: none;
    }
    
    .impact-container.visible {
      transform: none;
    }
  }
  
  @media (max-width: 768px) {
    .impact-container {
      padding: 20px 10px;
    }
  }
</style>