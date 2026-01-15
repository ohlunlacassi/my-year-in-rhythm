<script>
  import { onMount } from 'svelte';
  import * as d3 from 'd3';
  
  export let sportRecords = [];
  export let fitnessDaily = [];
  
  let svgElement;
  let containerWidth = 0;
  let milestones = [];
  let startDate = null;
  let visible = false;
  let hasAnimated = false;
  let prefersReducedMotion = false;
  
  // Helper function for date formatting
  function formatDate(date) {
    return d3.timeFormat("%b'%y")(date);
  }
  
  onMount(() => {
    if (sportRecords.length === 0) return;
    
    // Check for reduced motion preference
    prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    containerWidth = svgElement?.parentElement?.clientWidth || 800;
    calculateMilestones();
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !hasAnimated) {
          visible = true;
          hasAnimated = true;
          
          setTimeout(() => {
            drawRunningTrack();
          }, prefersReducedMotion ? 0 : 400);
          
          observer.disconnect();
        }
      });
    }, {
      threshold: 0.2,
      rootMargin: '0px 0px -50px 0px'
    });
    
    const container = svgElement?.closest('.track-container');
    if (container) {
      observer.observe(container);
    }
    
    return () => observer.disconnect();
  });
  
  function calculateMilestones() {
    const sortedRecords = [...sportRecords].sort((a, b) => {
      const aTime = a.time instanceof Date ? a.time : new Date(a.time);
      const bTime = b.time instanceof Date ? b.time : new Date(b.time);
      return aTime - bTime;
    });
    
    if (sortedRecords.length === 0) return;
    
    // Build cumulative hours by date
    const cumulativeByDate = [];
    let cumulative = 0;
    
    sortedRecords.forEach(record => {
      const hours = (record.duration || 0) / 3600;
      cumulative += hours;
      
      const recordDate = record.time instanceof Date ? record.time : new Date(record.time);
      
      cumulativeByDate.push({
        date: recordDate,
        hours: cumulative
      });
    });
    
    // Find milestones
    milestones = [];
    let currentMilestone = 50;
    let previousMilestoneDate = null;
    // Use fixed start date: Oct 17, 2024 (when data collection started)
    startDate = new Date(2024, 9, 17);  // Month is 0-indexed, so 9 = October, day 17
    
    cumulativeByDate.forEach(point => {
      while (point.hours >= currentMilestone && currentMilestone <= 500) {
        const milestoneDate = point.date;
        
        // Calculate days since last milestone
        let daysSince;
        if (previousMilestoneDate === null) {
          // First milestone - days from start
          daysSince = Math.round((milestoneDate - startDate) / (1000 * 60 * 60 * 24));
        } else {
          // Subsequent milestones - days from previous milestone
          daysSince = Math.round((milestoneDate - previousMilestoneDate) / (1000 * 60 * 60 * 24));
        }
        
        // Determine pace
        const pace = daysSince < 48 ? 'fast' : 
                    daysSince <= 52 ? 'normal' : 'slow';
        
        milestones.push({
          hours: currentMilestone,
          date: milestoneDate,
          daysSinceLastMilestone: daysSince,
          pace: pace,
          lapNumber: milestones.length + 1
        });
        
        previousMilestoneDate = milestoneDate;
        currentMilestone += 50;
      }
    });
    
    // Add final milestone if total hours exceed last milestone
    const finalHours = Math.round(cumulative);
    if (milestones.length > 0 && finalHours > milestones[milestones.length - 1].hours) {
      const lastRecord = sortedRecords[sortedRecords.length - 1];
      const lastDate = lastRecord.time instanceof Date ? lastRecord.time : new Date(lastRecord.time);
      const lastMilestone = milestones[milestones.length - 1];
      const daysSinceLast = Math.round((lastDate - lastMilestone.date) / (1000 * 60 * 60 * 24));
      const pace = daysSinceLast < 48 ? 'fast' : daysSinceLast <= 52 ? 'normal' : 'slow';
      
      milestones.push({
        hours: finalHours,
        date: lastDate,
        daysSinceLastMilestone: daysSinceLast,
        pace: pace,
        lapNumber: milestones.length + 1,
        isFinal: true
      });
    }
    
    console.log('🏃 Running Track Milestones:', milestones);
  }
  
  function drawRunningTrack() {
    if (!svgElement || milestones.length === 0) return;
    
    const margin = { top: 40, right: 60, bottom: 80, left: 100 };
    const width = Math.min(containerWidth * 0.9, 1000) - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;
    
    const svg = d3.select(svgElement)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .attr('role', 'img')
      .attr('aria-label', `Training progression chart showing ${milestones.length} milestones from ${formatDate(startDate)} to ${formatDate(milestones[milestones.length-1].date)}`);
    
    svg.selectAll('*').remove();
    
    // Add detailed description for screen readers
    svg.append('desc')
      .text(`Training progression visualization showing cumulative training hours over time. 
      Started ${formatDate(startDate)} at 0 hours. 
      Reached ${milestones[milestones.length-1].hours} hours by ${formatDate(milestones[milestones.length-1].date)}. 
      Pace varies from fast (under 48 days per 50 hours) to slower (over 52 days per 50 hours). 
      Total of ${milestones.length} milestones achieved.`);
    
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Color mapping
    const paceColors = {
      fast: '#06ffa5',
      normal: '#35d1c5',
      slow: '#ff7a5c'
    };
    
    const paceLabels = {
      fast: 'Fast pace',
      normal: 'Normal pace',
      slow: 'Slower pace'
    };
    
    // Scale for x position
    const xScale = d3.scaleLinear()
      .domain([0, milestones.length - 1])
      .range([0, width]);
    
    // Draw track base (gray line) - decorative
    g.append('line')
      .attr('x1', 0)
      .attr('x2', width)
      .attr('y1', height / 2)
      .attr('y2', height / 2)
      .attr('stroke', 'rgba(255, 255, 255, 0.1)')
      .attr('stroke-width', 40)
      .attr('stroke-linecap', 'round')
      .attr('role', 'presentation')
      .attr('aria-hidden', 'true');
    
    // Start flag icon
    g.append('image')
      .attr('xlink:href', '/icons/start-flag.png')
      .attr('x', -50)
      .attr('y', height / 2 - 12)
      .attr('width', 24)
      .attr('height', 24)
      .attr('alt', 'Start flag')
      .attr('role', 'img')
      .style('opacity', 0)
      .transition()
      .delay(prefersReducedMotion ? 0 : 200)
      .duration(prefersReducedMotion ? 0 : 400)
      .style('opacity', 1);
    
    g.append('text')
      .attr('x', -45)
      .attr('y', height / 2 - 30)
      .attr('text-anchor', 'middle')
      .style('font-family', 'monospace')
      .style('font-size', '11px')
      .style('font-weight', 'bold')
      .style('fill', '#35d1c5')
      .text('START')
      .style('opacity', 0)
      .transition()
      .delay(prefersReducedMotion ? 0 : 400)
      .duration(prefersReducedMotion ? 0 : 400)
      .style('opacity', 1);
    
    // Add start date below START label
    if (startDate) {
      g.append('text')
        .attr('x', -50)
        .attr('y', height / 2 + 75)
        .attr('text-anchor', 'middle')
        .style('font-family', 'monospace')
        .style('font-size', '9px')
        .style('fill', 'rgba(255, 255, 255, 0.4)')
        .text(formatDate(startDate))
        .style('opacity', 0)
        .transition()
        .delay(prefersReducedMotion ? 0 : 500)
        .duration(prefersReducedMotion ? 0 : 400)
        .style('opacity', 1);
    }
    
    // Finish trophy icon
    g.append('image')
      .attr('xlink:href', '/icons/trophy.png')
      .attr('x', width + 25)
      .attr('y', height / 2 - 12)
      .attr('width', 24)
      .attr('height', 24)
      .attr('alt', 'Trophy icon')
      .attr('role', 'img')
      .style('opacity', 0)
      .transition()
      .delay(prefersReducedMotion ? 0 : milestones.length * 150 + 800)
      .duration(prefersReducedMotion ? 0 : 400)
      .style('opacity', 1);
    
    g.append('text')
      .attr('x', width + 35)
      .attr('y', height / 2 - 30)
      .attr('text-anchor', 'middle')
      .style('font-family', 'monospace')
      .style('font-size', '11px')
      .style('font-weight', 'bold')
      .style('fill', '#ff7a5c')
      .text('FINISH')
      .style('opacity', 0)
      .transition()
      .delay(prefersReducedMotion ? 0 : milestones.length * 150 + 1000)
      .duration(prefersReducedMotion ? 0 : 400)
      .style('opacity', 1);
    
    // Draw segments between milestones
    for (let i = 0; i < milestones.length - 1; i++) {
      const x1 = xScale(i);
      const x2 = xScale(i + 1);
      const y = height / 2;
      
      const segment = g.append('line')
        .attr('x1', x1)
        .attr('x2', prefersReducedMotion ? x2 : x1)
        .attr('y1', y)
        .attr('y2', y)
        .attr('stroke', paceColors[milestones[i + 1].pace])
        .attr('stroke-width', 8)
        .attr('stroke-linecap', 'round')
        .attr('role', 'presentation')
        .attr('aria-hidden', 'true');
      
      if (!prefersReducedMotion) {
        segment.transition()
          .delay(i * 150 + 600)
          .duration(800)
          .ease(d3.easeCubicInOut)
          .attr('x2', x2);
      }
    }
    
    // Draw milestones with keyboard navigation support
    milestones.forEach((milestone, i) => {
      const x = xScale(i);
      const y = height / 2;
      
      // Create focusable group for each milestone
      const milestoneGroup = g.append('g')
        .attr('class', 'milestone-group')
        .attr('tabindex', 0)
        .attr('role', 'button')
        .attr('aria-label', `${milestone.isFinal ? 'Final milestone' : `Lap ${milestone.lapNumber}`}: ${milestone.hours} hours reached on ${formatDate(milestone.date)}. ${paceLabels[milestone.pace]}: ${milestone.daysSinceLastMilestone} days since ${i === 0 ? 'start' : 'last milestone'}.`)
        .style('cursor', 'pointer')
        .style('outline', 'none');
      
      // Add title for tooltip
      milestoneGroup.append('title')
        .text(`${milestone.isFinal ? 'Final' : `Lap ${milestone.lapNumber}`}: ${milestone.hours}h on ${formatDate(milestone.date)}. ${paceLabels[milestone.pace]}: ${milestone.daysSinceLastMilestone} days.`);
      
      // Checkpoint circle
      const checkpoint = milestoneGroup.append('circle')
        .attr('cx', x)
        .attr('cy', y)
        .attr('r', prefersReducedMotion ? 12 : 0)
        .attr('fill', paceColors[milestone.pace])
        .attr('stroke', '#0a0a0a')
        .attr('stroke-width', 3);
      
      if (!prefersReducedMotion) {
        checkpoint.transition()
          .delay(i * 150 + 800)
          .duration(400)
          .ease(d3.easeBackOut)
          .attr('r', 12);
      }
      
      // Focus state styling
      milestoneGroup
        .on('focus', function() {
          d3.select(this).select('circle')
            .attr('stroke', '#ffffff')
            .attr('stroke-width', 5);
        })
        .on('blur', function() {
          d3.select(this).select('circle')
            .attr('stroke', '#0a0a0a')
            .attr('stroke-width', 3);
        })
        .on('keydown', function(event) {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            // Could add click behavior here
            console.log('Milestone selected:', milestone);
          }
        });
      
      // Hours label (above)
      milestoneGroup.append('text')
        .attr('x', x)
        .attr('y', y - 45)
        .attr('text-anchor', 'middle')
        .style('font-family', 'monospace')
        .style('font-size', milestone.isFinal ? '16px' : '14px')
        .style('font-weight', 'bold')
        .style('fill', milestone.isFinal ? '#ff7a5c' : paceColors[milestone.pace])
        .text(`${milestone.hours}h`)
        .style('opacity', prefersReducedMotion ? 1 : 0)
        .transition()
        .delay(prefersReducedMotion ? 0 : i * 150 + 1000)
        .duration(prefersReducedMotion ? 0 : 400)
        .style('opacity', 1);
      
      // Lap number (above hours)
      if (!milestone.isFinal) {
        milestoneGroup.append('text')
          .attr('x', x)
          .attr('y', y - 60)
          .attr('text-anchor', 'middle')
          .style('font-family', 'monospace')
          .style('font-size', '10px')
          .style('fill', 'rgba(255, 255, 255, 0.5)')
          .text(`LAP ${milestone.lapNumber}`)
          .style('opacity', prefersReducedMotion ? 1 : 0)
          .transition()
          .delay(prefersReducedMotion ? 0 : i * 150 + 1100)
          .duration(prefersReducedMotion ? 0 : 400)
          .style('opacity', 1);
      } else {
        milestoneGroup.append('text')
          .attr('x', x)
          .attr('y', y - 65)
          .attr('text-anchor', 'middle')
          .style('font-family', 'monospace')
          .style('font-size', '11px')
          .style('font-weight', 'bold')
          .style('fill', '#ff7a5c')
          .text('FINAL')
          .style('opacity', prefersReducedMotion ? 1 : 0)
          .transition()
          .delay(prefersReducedMotion ? 0 : i * 150 + 1100)
          .duration(prefersReducedMotion ? 0 : 400)
          .style('opacity', 1);
      }
      
      // Days label (below) - pace indicator
      if (i > 0) {
        // Add pace icon
        const paceIcons = {
          fast: null,
          normal: null,
          slow: '/icons/snail.png'
        };
        
        const paceTexts = {
          fast: '⚡ FAST',
          normal: '✓ NORMAL',
          slow: 'SLOWER'
        };
        
        // For slow pace, add icon separately
        if (milestone.pace === 'slow' && paceIcons[milestone.pace]) {
          milestoneGroup.append('image')
            .attr('xlink:href', paceIcons[milestone.pace])
            .attr('x', x - 30)
            .attr('y', y + 30)
            .attr('width', 16)
            .attr('height', 16)
            .attr('alt', 'Snail icon')
            .style('opacity', prefersReducedMotion ? 1 : 0)
            .transition()
            .delay(prefersReducedMotion ? 0 : i * 150 + 1200)
            .duration(prefersReducedMotion ? 0 : 400)
            .style('opacity', 1);
        }
        
        milestoneGroup.append('text')
          .attr('x', milestone.pace === 'slow' ? x - 8 : x)
          .attr('y', y + 40)
          .attr('text-anchor', milestone.pace === 'slow' ? 'start' : 'middle')
          .style('font-family', 'monospace')
          .style('font-size', '11px')
          .style('font-weight', 'bold')
          .style('fill', paceColors[milestone.pace])
          .text(paceTexts[milestone.pace])
          .style('opacity', prefersReducedMotion ? 1 : 0)
          .transition()
          .delay(prefersReducedMotion ? 0 : i * 150 + 1200)
          .duration(prefersReducedMotion ? 0 : 400)
          .style('opacity', 1);
        
        // Days count
        milestoneGroup.append('text')
          .attr('x', x)
          .attr('y', y + 55)
          .attr('text-anchor', 'middle')
          .style('font-family', 'monospace')
          .style('font-size', '10px')
          .style('fill', 'rgba(255, 255, 255, 0.5)')
          .text(`${milestone.daysSinceLastMilestone}d`)
          .style('opacity', prefersReducedMotion ? 1 : 0)
          .transition()
          .delay(prefersReducedMotion ? 0 : i * 150 + 1300)
          .duration(prefersReducedMotion ? 0 : 400)
          .style('opacity', 1);
      }
      
      // Date label (very bottom)
      milestoneGroup.append('text')
        .attr('x', x)
        .attr('y', y + 75)
        .attr('text-anchor', 'middle')
        .style('font-family', 'monospace')
        .style('font-size', '9px')
        .style('fill', 'rgba(255, 255, 255, 0.4)')
        .text(formatDate(milestone.date))
        .style('opacity', prefersReducedMotion ? 1 : 0)
        .transition()
        .delay(prefersReducedMotion ? 0 : i * 150 + 1400)
        .duration(prefersReducedMotion ? 0 : 400)
        .style('opacity', 1);
    });
    
    // Animated runner emoji (hide if reduced motion)
    if (!prefersReducedMotion) {
      const runner = g.append('text')
        .attr('x', 0)
        .attr('y', height / 2 - 20)
        .attr('transform', 'scale(-1, 1)')
        .attr('aria-hidden', 'true')
        .style('font-size', '28px')
        .text('🏃‍♂️')
        .style('opacity', 0);
      
      runner.transition()
        .delay(600)
        .duration(200)
        .style('opacity', 1)
        .transition()
        .duration(milestones.length * 150 + 500)
        .ease(d3.easeLinear)
        .tween('move', function() {
          return function(t) {
            const x = t * width;
            d3.select(this).attr('transform', `translate(${x}, 0) scale(-1, 1)`);
          };
        })
        .on('end', function() {
          d3.select(this)
            .transition()
            .duration(300)
            .style('opacity', 0);
        });
    }
    
    // Title
    svg.append('text')
      .attr('x', margin.left)
      .attr('y', 30)
      .style('font-family', 'monospace')
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .style('fill', 'rgba(255, 255, 255, 0.7)')
      .style('letter-spacing', '1px')
      .text('TRAINING PROGRESSION');
    
    // Legend with proper ARIA
    const legend = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${height + margin.top + 20})`)
      .attr('role', 'list')
      .attr('aria-label', 'Pace indicators legend');
    
    const legendData = [
      { label: '⚡ Fast pace', color: paceColors.fast, desc: '< 48 days', icon: null },
      { label: '✓ Normal pace', color: paceColors.normal, desc: '48-52 days', icon: null },
      { label: 'Slower pace', color: paceColors.slow, desc: '> 52 days', icon: '/icons/snail.png' }
    ];
    
    legendData.forEach((item, i) => {
      const xOffset = i * 240;
      
      const legendItem = legend.append('g')
        .attr('role', 'listitem')
        .attr('aria-label', `${item.label}: ${item.desc}`);
      
      legendItem.append('line')
        .attr('x1', xOffset)
        .attr('x2', xOffset + 30)
        .attr('y1', 0)
        .attr('y2', 0)
        .attr('stroke', item.color)
        .attr('stroke-width', 4)
        .attr('stroke-linecap', 'round')
        .attr('role', 'presentation');
      
      // Add icon if present (for snail)
      if (item.icon) {
        legendItem.append('image')
          .attr('xlink:href', item.icon)
          .attr('x', xOffset + 40)
          .attr('y', -8)
          .attr('width', 14)
          .attr('height', 14)
          .attr('alt', 'Snail icon');
      }
      
      legendItem.append('text')
        .attr('x', item.icon ? xOffset + 60 : xOffset + 40)
        .attr('y', 4)
        .style('font-family', 'monospace')
        .style('font-size', '11px')
        .style('fill', 'rgba(255, 255, 255, 0.7)')
        .text(`${item.label} ${item.desc}`);
    });
  }
</script>

<!-- Skip link for accessibility -->
<a href="#after-chart" class="skip-link">Skip training progression chart</a>

<!-- Live region for screen readers -->
<div aria-live="polite" aria-atomic="true" class="sr-only">
  {#if visible && milestones.length > 0}
    Training progression chart is now visible. 
    Showing {milestones.length} milestones from {formatDate(startDate)} to {formatDate(milestones[milestones.length-1].date)}. 
    Final total: {milestones[milestones.length-1].hours} hours.
  {/if}
</div>

<div class="track-container" class:visible>
  <svg bind:this={svgElement}></svg>
</div>

<!-- Hidden data table for screen readers -->
{#if milestones.length > 0}
<div class="sr-only">
  <h3>Training Milestones Data</h3>
  <table>
    <caption>Cumulative training hours with pace indicators from {formatDate(startDate)} onwards</caption>
    <thead>
      <tr>
        <th scope="col">Milestone</th>
        <th scope="col">Total Hours</th>
        <th scope="col">Date Reached</th>
        <th scope="col">Days Since Previous</th>
        <th scope="col">Pace</th>
      </tr>
    </thead>
    <tbody>
      {#each milestones as milestone, i}
      <tr>
        <td>{milestone.isFinal ? 'Final' : `Lap ${milestone.lapNumber}`}</td>
        <td>{milestone.hours} hours</td>
        <td>{formatDate(milestone.date)}</td>
        <td>{i === 0 ? 'Start' : `${milestone.daysSinceLastMilestone} days`}</td>
        <td>{milestone.pace === 'fast' ? 'Fast (under 48 days)' : milestone.pace === 'normal' ? 'Normal (48-52 days)' : 'Slower (over 52 days)'}</td>
      </tr>
      {/each}
    </tbody>
  </table>
</div>
{/if}

<div id="after-chart"></div>

<style>
  .track-container {
    position: relative;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20px 20px;
    opacity: 0;
    transform: translateY(40px);
    transition: all 1s cubic-bezier(0.16, 1, 0.3, 1);
  }
  
  .track-container.visible {
    opacity: 1;
    transform: translateY(0);
  }
  
  .track-container svg {
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
  }
  
  .skip-link:focus {
    position: static;
    width: auto;
    height: auto;
    overflow: visible;
    z-index: 1000;
  }
  
  /* Keyboard focus styles for milestone groups */
  :global(.milestone-group:focus circle) {
    filter: drop-shadow(0 0 8px currentColor);
  }
  
  @media (prefers-reduced-motion: reduce) {
    .track-container {
      transition: opacity 0.3s ease;
      transform: none;
    }
    
    .track-container.visible {
      transform: none;
    }
  }
  
  @media (max-width: 768px) {
    .track-container {
      padding: 20px 10px;
    }
  }
  
  /* High contrast mode support */
  @media (prefers-contrast: high) {
    .track-container svg text {
      stroke: none;
      fill: white;
    }
  }
</style>