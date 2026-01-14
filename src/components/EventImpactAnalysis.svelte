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
      iconPath: '/icons/hospital.png',
      color: '#9d4edd'
    },
    study: {
      label: 'Study Events',
      iconPath: '/icons/homework.png',
      color: '#35d1c5'
    },
    holiday: {
      label: 'Holidays',
      iconPath: '/icons/holiday.png',
      color: '#ff7a5c'
    },
    travel: {
      label: 'Travel',
      iconPath: '/icons/travel.png',
      color: '#ffd60a'
    },
    training: {
      label: 'Training Events',
      iconPath: '/icons/muscles.png',
      color: '#06ffa5'
    },
    normal: {
      label: 'Normal Days',
      iconPath: '/icons/home.png',
      color: 'rgba(255, 255, 255, 0.3)'
    }
  };
  
  onMount(() => {
    if (master.length === 0) return;
    
    containerWidth = svgElement?.parentElement?.clientWidth || 800;
    analyzeEventImpact();
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !hasAnimated) {
          visible = true;
          hasAnimated = true;
          
          setTimeout(() => {
            drawLollipopChart();
          }, 400);
          
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
    
    const margin = { top: 60, right: 80, bottom: 100, left: 120 };
    const width = Math.min(containerWidth * 0.6, 700) - margin.left - margin.right;
    const height = 450 - margin.top - margin.bottom;
    
    const svg = d3.select(svgElement)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .attr('role', 'img')
      .attr('aria-label', 'Lollipop chart showing event impact on training');
    
    svg.selectAll('*').remove();
    
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
      .delay(200)
      .duration(600)
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
      .delay(400)
      .duration(400)
      .style('opacity', 1);
    
    // Lollipop stems
    const stems = g.selectAll('.stem')
      .data(impactData)
      .enter()
      .append('line')
      .attr('class', 'stem')
      .attr('x1', 0)
      .attr('x2', 0)
      .attr('y1', d => yScale(d.category) + yScale.bandwidth() / 2)
      .attr('y2', d => yScale(d.category) + yScale.bandwidth() / 2)
      .attr('stroke', d => d.color)
      .attr('stroke-width', 3)
      .attr('stroke-linecap', 'round');
    
    stems.transition()
      .delay((d, i) => i * 120)
      .duration(800)
      .ease(d3.easeCubicOut)
      .attr('x2', d => xScale(d.avgMinutes));
    
    // Lollipop heads
    const heads = g.selectAll('.head')
      .data(impactData)
      .enter()
      .append('circle')
      .attr('class', 'head')
      .attr('cx', 0)
      .attr('cy', d => yScale(d.category) + yScale.bandwidth() / 2)
      .attr('r', 0)
      .attr('fill', d => d.color)
      .attr('stroke', '#0a0a0a')
      .attr('stroke-width', 2)
      .style('opacity', 0);
    
    heads.transition()
      .delay((d, i) => i * 120 + 400)
      .duration(600)
      .ease(d3.easeBackOut)
      .attr('cx', d => xScale(d.avgMinutes))
      .attr('r', 8)
      .style('opacity', 1);
    
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
      .text(d => `${Math.round(d.avgMinutes)}min`)
      .transition()
      .delay((d, i) => i * 120 + 600)
      .duration(400)
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
      .text(d => `${d.count} active`)
      .transition()
      .delay((d, i) => i * 120 + 700)
      .duration(400)
      .attr('x', d => xScale(d.avgMinutes) + 15)
      .style('opacity', 1);
    
    // Change badges
    impactData.forEach((d, i) => {
      if (d.category === 'normal') return;
      
      const x = xScale(d.avgMinutes);
      const y = yScale(d.category) + yScale.bandwidth() / 2;
      
      const changeGroup = g.append('g')
        .attr('transform', `translate(${x}, ${y})`);
      
      const isNegative = d.change < 0;
      const changeText = `${isNegative ? '' : '+'}${Math.round(d.change)}%`;
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
        .delay(i * 120 + 1000)
        .duration(400)
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
        .delay(i * 120 + 1000)
        .duration(400)
        .style('opacity', 1);
    });
    
    // Y-axis labels
    impactData.forEach((d, i) => {
      const y = yScale(d.category) + yScale.bandwidth() / 2;
      
      // Icon
      g.append('image')
        .attr('xlink:href', d.iconPath)
        .attr('x', -45)
        .attr('y', y - 12)
        .attr('width', 24)
        .attr('height', 24)
        .style('opacity', 0)
        .transition()
        .delay(i * 120)
        .duration(400)
        .style('opacity', 1);
      
      // Label
      g.append('text')
        .attr('x', -55)
        .attr('y', y + 5)
        .attr('text-anchor', 'end')
        .style('font-family', 'monospace')
        .style('font-size', '11px')
        .style('fill', 'rgba(255, 255, 255, 0.7)')
        .style('opacity', 0)
        .text(d.label)
        .transition()
        .delay(i * 120 + 200)
        .duration(400)
        .style('opacity', 1);
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
    
    svg.append('text')
      .attr('x', margin.left)
      .attr('y', 30)
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