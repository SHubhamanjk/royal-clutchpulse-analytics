/**
 * Royal ClutchPulse - Analytical Visualisation Suite
 * Chart.js 4.x Rendering Controllers & Canvas Gauges
 */

window.ClutchCharts = (function() {
  let top10ChartInstance = null;
  let radarChartInstance = null;
  let liftChartInstance = null;
  let phaseChartInstance = null;

  // Custom Chart.js Plugin for Horizontal Error Bars (95% Bootstrap CI Whiskers)
  const errorBarsPlugin = {
    id: 'errorBarsPlugin',
    afterDatasetsDraw(chart) {
      const { ctx, scales: { x, y } } = chart;
      const meta = chart.getDatasetMeta(0);
      if (!meta || !chart.data.ciData) return;

      ctx.save();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#FDE047'; // Vivid Gold for CI Whisker

      meta.data.forEach((bar, index) => {
        const ci = chart.data.ciData[index];
        if (!ci || ci.length < 2) return;

        const yPos = bar.y;
        const xMin = x.getPixelForValue(ci[0]);
        const xMax = x.getPixelForValue(ci[1]);
        const tickHeight = 6;

        // Whisker line
        ctx.beginPath();
        ctx.moveTo(xMin, yPos);
        ctx.lineTo(xMax, yPos);
        ctx.stroke();

        // Left cap
        ctx.beginPath();
        ctx.moveTo(xMin, yPos - tickHeight);
        ctx.lineTo(xMin, yPos + tickHeight);
        ctx.stroke();

        // Right cap
        ctx.beginPath();
        ctx.moveTo(xMax, yPos - tickHeight);
        ctx.lineTo(xMax, yPos + tickHeight);
        ctx.stroke();
      });

      ctx.restore();
    }
  };

  /**
   * Top 10 Horizontal Bar Chart with 95% Confidence Intervals
   */
  function renderTop10BarChart(canvasId, dataset, onSelectPlayer) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    if (top10ChartInstance) {
      top10ChartInstance.destroy();
    }

    const top10 = dataset.slice(0, 10);
    const labels = top10.map(p => `#${p.rank} ${p.name}`);
    const dataVals = top10.map(p => p.shrunk);
    const ciData = top10.map(p => p.ci);

    top10ChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        ciData: ciData,
        datasets: [{
          label: 'Clutch Score',
          data: dataVals,
          backgroundColor: function(context) {
            const chart = context.chart;
            const { ctx, chartArea } = chart;
            if (!chartArea) return '#EA1B86';
            const gradient = ctx.createLinearGradient(chartArea.left, 0, chartArea.right, 0);
            gradient.addColorStop(0, '#A20F5A');
            gradient.addColorStop(0.5, '#EA1B86');
            gradient.addColorStop(1, '#FF4DA6');
            return gradient;
          },
          borderColor: '#FF70BA',
          borderWidth: 1.5,
          borderRadius: 6,
          barPercentage: 0.72
        }]
      },
      plugins: [],
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        onClick: (evt, activeElements) => {
          if (activeElements.length > 0 && onSelectPlayer) {
            const index = activeElements[0].index;
            onSelectPlayer(top10[index]);
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(255, 255, 255, 0.07)' },
            ticks: {
              color: '#9E97B8',
              font: { family: "'Inter', sans-serif", size: 11, weight: '500' },
              callback: (v) => v.toFixed(2)
            },
            title: {
              display: true,
              text: 'Clutch Score (Higher = More Match-Winning in Tight Moments)',
              color: '#CBD5E1',
              font: { size: 12, weight: '600' }
            }
          },
          y: {
            grid: { display: false },
            ticks: {
              color: '#FFFFFF',
              font: { family: "'Inter', sans-serif", size: 12, weight: '600' }
            }
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(16, 9, 34, 0.95)',
            titleColor: '#FF4DA6',
            titleFont: { size: 13, weight: 'bold' },
            bodyColor: '#F8FAFC',
            borderColor: '#EA1B86',
            borderWidth: 1,
            padding: 12,
            boxPadding: 6,
            callbacks: {
              afterLabel: function(context) {
                const p = top10[context.dataIndex];
                return [
                  `Clutch Score: ${p.shrunk > 0 ? '+' : ''}${p.shrunk.toFixed(4)}`,
                  `Raw Impact: ${p.raw > 0 ? '+' : ''}${p.raw.toFixed(4)}`,
                  `Consistency Range: [${p.ci[0].toFixed(3)}, ${p.ci[1].toFixed(3)}]`,
                  `Experience: ${p.opps} balls tracked`,
                  `Team: ${p.team}`,
                  `👉 Click to inspect player skills`
                ];
              }
            }
          }
        }
      }
    });
  }

  /**
   * 6-Axis Clutch Radar Chart (Solo or Head-to-Head Comparison)
   */
  function renderRadarChart(canvasId, player1, player2 = null) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    if (radarChartInstance) {
      radarChartInstance.destroy();
    }

    // Normalization helper: map metric to 0-100 scale
    function calcNormalizedAxes(p) {
      // 1. Shrunk SVA (-0.25 to +0.25 -> 0 to 100)
      const clutchIndex = Math.min(100, Math.max(0, Math.round(((p.shrunk + 0.25) / 0.50) * 100)));
      // 2. Lift (-0.4 to +0.4 -> 0 to 100)
      const liftScore = Math.min(100, Math.max(0, Math.round(((p.lift + 0.40) / 0.80) * 100)));
      // 3. Death SVA (-0.5 to +0.5 -> 0 to 100)
      const deathScore = Math.min(100, Math.max(0, Math.round(((p.dth + 0.50) / 1.00) * 100)));
      // 4. Powerplay SVA (-0.5 to +0.5 -> 0 to 100)
      const ppScore = Math.min(100, Math.max(0, Math.round(((p.pp + 0.50) / 1.00) * 100)));
      // 5. Middle SVA (-0.5 to +0.5 -> 0 to 100)
      const midScore = Math.min(100, Math.max(0, Math.round(((p.mid + 0.50) / 1.00) * 100)));
      // 6. Kish ESS Reliability (0 to 1500 ESS -> 0 to 100)
      const essReliability = Math.min(100, Math.max(0, Math.round((p.ess / 1500) * 100)));

      return [clutchIndex, liftScore, deathScore, ppScore, midScore, essReliability];
    }

    const labels = [
      'Clutch Rating',
      'Boost Under Pressure',
      'Death Overs',
      'Powerplay',
      'Middle Overs',
      'Consistency'
    ];

    const datasets = [{
      label: player1.name,
      data: calcNormalizedAxes(player1),
      backgroundColor: 'rgba(234, 27, 134, 0.25)',
      borderColor: '#EA1B86',
      borderWidth: 2,
      pointBackgroundColor: '#FF4DA6',
      pointBorderColor: '#FFFFFF',
      pointHoverBackgroundColor: '#FFFFFF',
      pointHoverBorderColor: '#EA1B86',
      pointRadius: 4
    }];

    if (player2) {
      datasets.push({
        label: player2.name,
        data: calcNormalizedAxes(player2),
        backgroundColor: 'rgba(59, 130, 246, 0.25)',
        borderColor: '#3B82F6',
        borderWidth: 2,
        pointBackgroundColor: '#60A5FA',
        pointBorderColor: '#FFFFFF',
        pointHoverBackgroundColor: '#FFFFFF',
        pointHoverBorderColor: '#3B82F6',
        pointRadius: 4
      });
    }

    radarChartInstance = new Chart(ctx, {
      type: 'radar',
      data: { labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            min: 0,
            max: 100,
            ticks: {
              display: false,
              stepSize: 20
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            },
            angleLines: {
              color: 'rgba(255, 255, 255, 0.15)'
            },
            pointLabels: {
              color: '#CBD5E1',
              font: { family: "'Inter', sans-serif", size: 10, weight: '600' }
            }
          }
        },
        plugins: {
          legend: {
            display: player2 !== null,
            position: 'top',
            labels: {
              color: '#FFFFFF',
              font: { size: 11, weight: '600' },
              boxWidth: 12
            }
          },
          tooltip: {
            backgroundColor: 'rgba(16, 9, 34, 0.95)',
            borderColor: '#EA1B86',
            borderWidth: 1,
            titleColor: '#FF4DA6',
            bodyColor: '#FFFFFF',
            padding: 10
          }
        }
      }
    });
  }

  /**
   * Pressure Lift Grouped Bar Chart: P >= 50 vs P < 50
   */
  function renderLiftChart(canvasId, dataset) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    if (liftChartInstance) {
      liftChartInstance.destroy();
    }

    const top10 = dataset.slice(0, 10);
    const labels = top10.map(p => p.name.split(' ').pop()); // surname for compact x-axis

    liftChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'High-Pressure Moments',
            data: top10.map(p => p.ge50),
            backgroundColor: '#EA1B86',
            borderRadius: 4
          },
          {
            label: 'Normal / Easy Games',
            data: top10.map(p => p.lt50),
            backgroundColor: '#6366F1',
            borderRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#CBD5E1', font: { weight: '600' } }
          },
          y: {
            grid: { color: 'rgba(255, 255, 255, 0.08)' },
            ticks: {
              color: '#9E97B8',
              callback: (v) => (v > 0 ? '+' : '') + v.toFixed(2)
            },
            title: {
              display: true,
              text: 'Impact per Ball (Runs Saved or Scored Above Average)',
              color: '#9E97B8',
              font: { size: 11 }
            }
          }
        },
        plugins: {
          legend: {
            position: 'top',
            labels: { color: '#F8FAFC', font: { size: 11, weight: '600' } }
          },
          tooltip: {
            backgroundColor: 'rgba(16, 9, 34, 0.95)',
            borderColor: '#EA1B86',
            borderWidth: 1,
            callbacks: {
              afterBody: function(contexts) {
                const p = top10[contexts[0].dataIndex];
                return `Pressure Boost: ${p.lift > 0 ? '+' : ''}${p.lift.toFixed(4)}`;
              }
            }
          }
        }
      }
    });
  }

  /**
   * Phase Breakdown Chart: Powerplay vs Middle vs Death
   */
  function renderPhaseChart(canvasId, player) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    if (phaseChartInstance) {
      phaseChartInstance.destroy();
    }

    phaseChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Powerplay (Overs 1-6)', 'Middle (7-15)', 'Death (16-20)'],
        datasets: [{
          label: 'Impact per Over',
          data: [player.pp, player.mid, player.dth],
          backgroundColor: [
            player.pp >= 0 ? 'rgba(16, 185, 129, 0.8)' : 'rgba(239, 68, 68, 0.8)',
            player.mid >= 0 ? 'rgba(59, 130, 246, 0.8)' : 'rgba(239, 68, 68, 0.8)',
            player.dth >= 0 ? 'rgba(234, 27, 134, 0.8)' : 'rgba(239, 68, 68, 0.8)'
          ],
          borderColor: [
            player.pp >= 0 ? '#10B981' : '#EF4444',
            player.mid >= 0 ? '#3B82F6' : '#EF4444',
            player.dth >= 0 ? '#EA1B86' : '#EF4444'
          ],
          borderWidth: 1.5,
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#CBD5E1', font: { size: 10, weight: '500' } }
          },
          y: {
            grid: { color: 'rgba(255, 255, 255, 0.08)' },
            ticks: {
              color: '#9E97B8',
              font: { size: 10 },
              callback: (v) => (v > 0 ? '+' : '') + v.toFixed(2)
            }
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(16, 9, 34, 0.95)',
            borderColor: '#EA1B86',
            borderWidth: 1,
            callbacks: {
              label: (ctx) => ` Impact: ${ctx.parsed.y > 0 ? '+' : ''}${ctx.parsed.y.toFixed(3)}`
            }
          }
        }
      }
    });
  }

  /**
   * High-Performance Canvas Radial Gauge for Live Match Simulator
   */
  function drawRadialGauge(canvasId, value, minVal = 0, maxVal = 100, label = 'Pressure Index') {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height * 0.65;
    const radius = Math.min(width, height) * 0.42;

    ctx.clearRect(0, 0, width, height);

    const startAngle = Math.PI * 0.85;
    const endAngle = Math.PI * 2.15;
    const totalAngle = endAngle - startAngle;

    // Clamped percentage
    const pct = Math.min(1, Math.max(0, (value - minVal) / (maxVal - minVal)));
    const currentAngle = startAngle + (totalAngle * pct);

    // Background track arc
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.lineWidth = 14;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineCap = 'round';
    ctx.stroke();

    // Value Arc with Dynamic Glow Gradient
    const gradient = ctx.createLinearGradient(0, height, width, 0);
    if (value < 35) {
      gradient.addColorStop(0, '#10B981');
      gradient.addColorStop(1, '#34D399');
    } else if (value < 65) {
      gradient.addColorStop(0, '#F59E0B');
      gradient.addColorStop(1, '#FBBF24');
    } else if (value < 85) {
      gradient.addColorStop(0, '#8B5CF6');
      gradient.addColorStop(1, '#C084FC');
    } else {
      gradient.addColorStop(0, '#EA1B86');
      gradient.addColorStop(1, '#FF2E93');
    }

    ctx.save();
    ctx.shadowBlur = 12;
    ctx.shadowColor = value >= 85 ? 'rgba(234, 27, 134, 0.6)' : 'rgba(245, 158, 11, 0.4)';
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, currentAngle);
    ctx.lineWidth = 14;
    ctx.strokeStyle = gradient;
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.restore();

    // Value text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 28px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(value.toFixed(1), centerX, centerY - 8);

    // Label text
    ctx.fillStyle = '#9E97B8';
    ctx.font = '500 11px "Inter", sans-serif';
    ctx.fillText(label.toUpperCase(), centerX, centerY + 20);
  }

  return {
    renderTop10BarChart,
    renderRadarChart,
    renderLiftChart,
    renderPhaseChart,
    drawRadialGauge
  };
})();
