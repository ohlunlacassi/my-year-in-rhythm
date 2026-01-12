<script>
  import { onMount } from 'svelte';
  import * as d3 from 'd3';
  
  export let master = [];
  export let calendar = [];
  
  let svgElement;
  let containerWidth = 0;
  let impactData = [];
  
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
    drawImpactChart();
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
        if (dayData && dayData.trainingMinutes > 0) { // Only active days!
          trainingMinutes.push(dayData.trainingMinutes);
        }
      });
      
      if (trainingMinutes.length > 0) {
        categoryStats[category] = {
          avgMinutes: d3.mean(trainingMinutes),
          count: trainingMinutes.length, // Count of active days only
          totalDays: events.length // Total days with this event
        };
      }
    });
    
    // Calculate normal days (days without events, ACTIVE ONLY)
    const eventDates = new Set(
      calendar.map(e => d3.timeFormat('%Y-%m-%d')(e.start))
    );
    
    const normalDaysTraining = master
      .filter(d => !eventDates.has(d3.timeFormat('%Y-%m-%d')(d.date)))
      .filter(d => d.trainingMinutes > 0) // Only active days!
      .map(d => d.trainingMinutes);
    
    const normalAvg = d3.mean(normalDaysTraining);
    
    categoryStats['normal'] = {
      avgMinutes: normalAvg,
      count: normalDaysTraining.length,
      totalDays: master.filter(d => !eventDates.has(d3.timeFormat('%Y-%m-%d')(d.date))).length
    };
    
    // Create impact data with % change
    impactData = Object.entries(categoryStats)
      .filter(([cat]) => categoryConfig[cat]) // Only known categories
      .map(([category, stats]) => {
        const change = ((stats.avgMinutes - normalAvg) / normalAvg) * 100;
        return {
          category,
          ...categoryConfig[category],
          avgMinutes: stats.avgMinutes,
          count: stats.count, // Active days count
          totalDays: stats.totalDays, // Total days with event
          change: category === 'normal' ? 0 : change
        };
      })
      .filter(d => {
        // Show only categories with sufficient active days OR normal days
        // Lower threshold (5 active days) since some events might reduce training
        return d.category === 'normal' || d.count >= 5;
      })
      .sort((a, b) => {
        // Normal Days always last (baseline)
        if (a.category === 'normal') return 1;
        if (b.category === 'normal') return -1;
        // Others sorted by avgMinutes descending
        return b.avgMinutes - a.avgMinutes;
      });
    
    console.log('📊 Event Impact Analysis (active days only):', impactData);
  }
  
  function drawImpactChart() {
    if (!svgElement || impactData.length === 0) return;
    
    const margin = { top: 40, right: 160, bottom: 100, left: 100 }; // Increased bottom for note
    const width = Math.min(containerWidth, 1000) - margin.left - margin.right; // Back to 1000 since fewer bars
    const height = 450 - margin.top - margin.bottom;
    
    const svg = d3.select(svgElement)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom);
    
    svg.selectAll('*').remove();
    
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Scales
    const xScale = d3.scaleBand()
      .domain(impactData.map(d => d.category))
      .range([0, width])
      .padding(0.3);
    
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(impactData, d => d.avgMinutes) * 1.2])
      .range([height, 0])
      .nice();
    
    // Grid lines
    g.append('g')
      .attr('class', 'grid')
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
    
    // Bars
    const bars = g.selectAll('.bar')
      .data(impactData)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => xScale(d.category))
      .attr('width', xScale.bandwidth())
      .attr('y', height)
      .attr('height', 0)
      .attr('fill', d => d.color)
      .attr('rx', 4);
    
    // Animate bars
    bars.transition()
      .delay((d, i) => i * 150)
      .duration(800)
      .ease(d3.easeCubicOut)
      .attr('y', d => yScale(d.avgMinutes))
      .attr('height', d => height - yScale(d.avgMinutes));
    
    // Value labels on bars
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
    
    // Day count labels on bars
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
    
    // X Axis with icons
    const xAxis = g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${height})`);
    
    impactData.forEach(d => {
      const x = xScale(d.category) + xScale.bandwidth() / 2;
      
      // Icon
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
      
      // Label
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
    
    // Y Axis
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
    
    // Y Axis label
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
    
    // Change indicators (right side)
    impactData.forEach((d, i) => {
      if (d.category === 'normal') return; // Skip baseline
      
      const x = width + 20;
      const y = yScale(d.avgMinutes);
      
      const changeGroup = g.append('g')
        .attr('transform', `translate(${x}, ${y})`);
      
      // Change badge
      const isNegative = d.change < 0;
      const changeText = `${isNegative ? '' : '+'}${Math.round(d.change)}%`;
      const arrow = isNegative ? '↓' : '↑';
      
      changeGroup.append('rect')
        .attr('x', 0)
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
        .attr('x', 40)
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
    
    // Title
    svg.append('text')
      .attr('x', margin.left)
      .attr('y', 25)
      .style('font-family', 'monospace')
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .style('fill', 'rgba(255, 255, 255, 0.7)')
      .style('letter-spacing', '1px')
      .text('EVENT IMPACT ON TRAINING');
    
    // Subtitle note
    svg.append('text')
      .attr('x', margin.left)
      .attr('y', height + margin.top + margin.bottom - 10)
      .style('font-family', 'monospace')
      .style('font-size', '10px')
      .style('fill', 'rgba(255, 255, 255, 0.4)')
      .style('font-style', 'italic')
  }
</script>

<div class="impact-container">
  <svg bind:this={svgElement}></svg>
  
  <div class="stats-summary">
    {#each impactData as item}
      <div class="stat-card" style="border-color: {item.color}">
        <div class="stat-icon">{item.icon}</div>
        <div class="stat-content">
          <div class="stat-label">{item.label}</div>
          <div class="stat-value">{Math.round(item.avgMinutes)} min/day</div>
          <div class="stat-count">{item.count} active days</div>
          {#if item.category !== 'normal' && item.totalDays !== item.count}
            <div class="stat-active-rate">{Math.round(item.count / item.totalDays * 100)}% active</div>
          {/if}
          {#if item.category !== 'normal'}
            <div class="stat-change" class:negative={item.change < 0}>
              {item.change > 0 ? '+' : ''}{Math.round(item.change)}% {item.change < 0 ? '↓' : '↑'}
            </div>
          {:else}
            <div class="stat-baseline">baseline</div>
          {/if}
        </div>
      </div>
    {/each}
  </div>
</div>

<style>
  .impact-container {
    position: relative;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px;
    gap: 40px;
  }
  
  .impact-container svg {
    display: block;
  }
  
  .stats-summary {
    display: flex;
    gap: 24px;
    flex-wrap: wrap;
    justify-content: center;
    max-width: 1000px;
  }
  
  .stat-card {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px 24px;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid;
    border-radius: 12px;
    min-width: 200px;
    transition: all 0.3s ease;
  }
  
  .stat-card:hover {
    background: rgba(255, 255, 255, 0.05);
    transform: translateY(-2px);
  }
  
  .stat-icon {
    font-size: 36px;
    line-height: 1;
  }
  
  .stat-content {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  
  .stat-label {
    font-family: monospace;
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.5);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  .stat-value {
    font-family: monospace;
    font-size: 1.5rem;
    font-weight: bold;
    color: #35d1c5;
  }
  
  .stat-count {
    font-family: monospace;
    font-size: 0.7rem;
    color: rgba(255, 255, 255, 0.4);
  }
  
  .stat-active-rate {
    font-family: monospace;
    font-size: 0.65rem;
    color: rgba(53, 209, 197, 0.5);
    font-style: italic;
  }
  
  .stat-change {
    font-family: monospace;
    font-size: 0.85rem;
    font-weight: bold;
    color: #35d1c5;
    margin-top: 4px;
  }
  
  .stat-change.negative {
    color: #ff7a5c;
  }
  
  .stat-baseline {
    font-family: monospace;
    font-size: 0.85rem;
    color: rgba(255, 255, 255, 0.4);
    font-style: italic;
    margin-top: 4px;
  }
</style>
