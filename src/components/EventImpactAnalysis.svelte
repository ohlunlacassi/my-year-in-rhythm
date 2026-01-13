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
  
  const categoryConfig = {
    health: {
      label: 'Health Appointments',
      icon: '🏥',
      color: '#9d4edd'
    },
    study: {
      label: 'Study Events',
      icon: '📚',
      color: '#35d1c5'
    },
    holiday: {
      label: 'Holidays',
      icon: '🏖️',
      color: '#ff7a5c'
    },
    travel: {
      label: 'Travel',
      icon: '✈️',
      color: '#ffd60a'
    },
    training: {
      label: 'Training Events',
      icon: '💪',
      color: '#06ffa5'
    },
    reminder: {
      label: 'Reminders',
      icon: '⏰',
      color: '#f72585'
    },
    personal: {
      label: 'Personal',
      icon: '👤',
      color: '#4cc9f0'
    },
    normal: {
      label: 'Normal Days',
      icon: '🏠',
      color: 'rgba(255, 255, 255, 0.3)'
    }
  };
  
  onMount(() => {
    if (master.length === 0) return;
    
    containerWidth = svgElement?.parentElement?.clientWidth || 800;
    analyzeEventImpact();
    
    // Setup Intersection Observer
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !hasAnimated) {
          visible = true; // Fade in container
          hasAnimated = true;
          
          // Start chart animation after container fades in
          setTimeout(() => {
            drawImpactChart();
          }, 400); // Wait for container fade-in
          
          observer.disconnect(); // Stop observing
        }
      });
    }, {
      threshold: 0.25, // Trigger when 25% visible
      rootMargin: '0px 0px -50px 0px' // Start slightly before fully visible
    });
    
    // Observe the container
    const container = svgElement?.closest('.impact-container');
    if (container) {
      observer.observe(container);
    }
    
    // Cleanup
    return () => observer.disconnect();
  });
  
  function analyzeEventImpact() {
    // Create date map for quick lookup
    const dateMap = new Map();
    master.forEach(d => {
      const dateKey = d3.timeFormat('%Y-%m-%d')(d.date);
      dateMap.set(dateKey, d);
    });
    
    // Group calendar events by category
    const eventsByCategory = d3.group(calendar, d => d.eventCategory || 'other');
    
    // Calculate average training for each category (ACTIVE DAYS ONLY)
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
    
    // Calculate normal days (days without events, ACTIVE ONLY)
    const eventDates = new Set(
      calendar.map(e => d3.timeFormat('%Y-%m-%d')(e.start))
    );
    
    const normalDaysTraining = master
      .filter(d => !eventDates.has(d3.timeFormat('%Y-%m-%d')(d.date)))
      .filter(d => d.trainingMinutes > 0)
      .map(d => d.trainingMinutes);
    
    const normalAvg = d3.mean(normalDaysTraining);
    
    categoryStats['normal'] = {
      avgMinutes: normalAvg,
      count: normalDaysTraining.length,
      totalDays: master.filter(d => !eventDates.has(d3.timeFormat('%Y-%m-%d')(d.date))).length
    };
    
    // Create impact data with % change
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
      .sort((a, b) => {
        return b.avgMinutes - a.avgMinutes;
      });
    
    // Move Normal Days to the middle position
    const normalIndex = impactData.findIndex(d => d.category === 'normal');
    if (normalIndex !== -1) {
      const normalData = impactData.splice(normalIndex, 1)[0];
      const middleIndex = Math.floor(impactData.length / 2);
      impactData.splice(middleIndex, 0, normalData);
    }
    
    console.log('📊 Event Impact Analysis (active days only):', impactData);
  }
  
  function drawImpactChart() {
    if (!svgElement || impactData.length === 0) return;
    
    const margin = { top: 40, right: 40, bottom: 100, left: 100 };
    const width = Math.min(containerWidth * 0.55, 600) - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;
    
    const svg = d3.select(svgElement)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .attr('role', 'img')
      .attr('aria-label', 'Bar chart showing the impact of different life events on training intensity compared to normal days');
    
    svg.selectAll('*').remove();
    
    svg.append('title')
      .text('Event Impact on Training - Bar chart comparing average training minutes across different event categories');
    
    svg.append('desc')
      .text(`This chart shows how different life events affect training intensity. ${impactData.map(d => 
        `${d.label}: ${Math.round(d.avgMinutes)} minutes average across ${d.count} active days${d.change !== 0 ? `, ${d.change > 0 ? '+' : ''}${Math.round(d.change)}% compared to normal days` : ''}`
      ).join('. ')}`);
    
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    
    const xScale = d3.scaleBand()
      .domain(impactData.map(d => d.category))
      .range([0, width])
      .padding(0.3);
    
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(impactData, d => d.avgMinutes) * 1.2])
      .range([height, 0])
      .nice();
    
    g.append('g')
      .attr('class', 'grid')
      .attr('aria-hidden', 'true')
      .selectAll('line')
      .data(yScale.ticks(6))
      .enter()
      .append('line')
      .attr('x1', 0)
      .attr('x2', width)
      .attr('y1', d => yScale(d))
      .attr('y2', d => yScale(d))
      .attr('stroke', 'rgba(255, 255, 255, 0.05)')
      .attr('stroke-width', 1);
    
    const bars = g.selectAll('.bar')
      .data(impactData)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('role', 'graphics-symbol')
      .attr('aria-label', d => `${d.label}: ${Math.round(d.avgMinutes)} minutes average, ${d.count} active days${d.change !== 0 ? `, ${d.change > 0 ? 'plus' : 'minus'} ${Math.abs(Math.round(d.change))} percent change` : ''}`)
      .attr('x', d => xScale(d.category))
      .attr('width', xScale.bandwidth())
      .attr('y', height)
      .attr('height', 0)
      .attr('fill', d => d.color)
      .attr('rx', 4);
    
    bars.transition()
      .delay((d, i) => i * 150)
      .duration(800)
      .ease(d3.easeCubicOut)
      .attr('y', d => yScale(d.avgMinutes))
      .attr('height', d => height - yScale(d.avgMinutes));
    
    g.selectAll('.value-label')
      .data(impactData)
      .enter()
      .append('text')
      .attr('class', 'value-label')
      .attr('x', d => xScale(d.category) + xScale.bandwidth() / 2)
      .attr('y', height)
      .attr('text-anchor', 'middle')
      .style('font-family', 'monospace')
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .style('fill', '#fff')
      .style('opacity', 0)
      .text(d => `${Math.round(d.avgMinutes)}min`)
      .transition()
      .delay((d, i) => i * 150 + 400)
      .duration(400)
      .attr('y', d => yScale(d.avgMinutes) - 10)
      .style('opacity', 1);
    
    g.selectAll('.count-label')
      .data(impactData)
      .enter()
      .append('text')
      .attr('class', 'count-label')
      .attr('x', d => xScale(d.category) + xScale.bandwidth() / 2)
      .attr('y', height)
      .attr('text-anchor', 'middle')
      .style('font-family', 'monospace')
      .style('font-size', '10px')
      .style('fill', 'rgba(255, 255, 255, 0.5)')
      .style('opacity', 0)
      .text(d => `${d.count} active`)
      .transition()
      .delay((d, i) => i * 150 + 500)
      .duration(400)
      .attr('y', d => yScale(d.avgMinutes) - 28)
      .style('opacity', 1);
    
    impactData.forEach((d, i) => {
      if (d.category === 'normal') return;
      
      const x = xScale(d.category) + xScale.bandwidth() / 2;
      const y = yScale(d.avgMinutes) - 55;
      
      const changeGroup = g.append('g')
        .attr('transform', `translate(${x}, ${y})`);
      
      const isNegative = d.change < 0;
      const changeText = `${isNegative ? '' : '+'}${Math.round(d.change)}%`;
      const arrow = isNegative ? '↓' : '↑';
      
      changeGroup.append('rect')
        .attr('x', -40)
        .attr('y', -12)
        .attr('width', 80)
        .attr('height', 24)
        .attr('rx', 12)
        .attr('fill', isNegative ? 'rgba(255, 122, 92, 0.2)' : 'rgba(53, 209, 197, 0.2)')
        .attr('stroke', isNegative ? '#ff7a5c' : '#35d1c5')
        .attr('stroke-width', 1)
        .style('opacity', 0)
        .transition()
        .delay(i * 150 + 800)
        .duration(400)
        .style('opacity', 1);
      
      changeGroup.append('text')
        .attr('x', 0)
        .attr('y', 4)
        .attr('text-anchor', 'middle')
        .style('font-family', 'monospace')
        .style('font-size', '12px')
        .style('font-weight', 'bold')
        .style('fill', isNegative ? '#ff7a5c' : '#35d1c5')
        .style('opacity', 0)
        .text(`${changeText} ${arrow}`)
        .transition()
        .delay(i * 150 + 800)
        .duration(400)
        .style('opacity', 1);
    });
    
    const xAxis = g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${height})`);
    
    impactData.forEach(d => {
      const x = xScale(d.category) + xScale.bandwidth() / 2;
      
      xAxis.append('text')
        .attr('x', x)
        .attr('y', 25)
        .attr('text-anchor', 'middle')
        .style('font-size', '28px')
        .style('opacity', 0)
        .text(d.icon)
        .transition()
        .delay(impactData.indexOf(d) * 150)
        .duration(400)
        .style('opacity', 1);
      
      xAxis.append('text')
        .attr('x', x)
        .attr('y', 55)
        .attr('text-anchor', 'middle')
        .style('font-family', 'monospace')
        .style('font-size', '11px')
        .style('fill', 'rgba(255, 255, 255, 0.6)')
        .style('opacity', 0)
        .text(d.label)
        .transition()
        .delay(impactData.indexOf(d) * 150 + 200)
        .duration(400)
        .style('opacity', 1);
    });
    
    const yAxis = d3.axisLeft(yScale)
      .ticks(6)
      .tickFormat(d => `${d}min`);
    
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
    
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height / 2)
      .attr('y', -60)
      .attr('text-anchor', 'middle')
      .style('font-family', 'monospace')
      .style('font-size', '12px')
      .style('fill', 'rgba(255, 255, 255, 0.5)')
      .style('letter-spacing', '1px')
      .text('AVG TRAINING');
    
    svg.append('text')
      .attr('x', margin.left)
      .attr('y', 25)
      .style('font-family', 'monospace')
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .style('fill', 'rgba(255, 255, 255, 0.7)')
      .style('letter-spacing', '1px')
      .text('EVENT IMPACT ON TRAINING');
  }
</script>

<div class="impact-container" class:visible>
  <svg bind:this={svgElement}></svg>
</div>

<style>
  .impact-container {
    position: relative;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20px;
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
  
  /* Reduced motion support */
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