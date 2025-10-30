const priceChartCtx = document.getElementById('price-chart').getContext('2d');
const volumeChartCtx = document.getElementById('volume-chart').getContext('2d');

let priceChartInstance = null;
let volumeChartInstance = null;

function showError(message) {
  const container = document.getElementById('error-container');
  container.innerHTML = `<div class="error">${message}</div>`;
  setTimeout(() => {
    container.innerHTML = '';
  }, 5000);
}

function getQueryParams() {
  const skins = document.getElementById('skins').value.trim();
  const markets = document.getElementById('markets').value.trim();
  const range = document.getElementById('range').value;
  const granularity = document.getElementById('granularity').value;
  const ma = document.getElementById('ma-periods').value.trim();

  const params = new URLSearchParams();
  if (skins) params.set('skins', skins);
  if (markets) params.set('markets', markets);
  if (ma) params.set('ma', ma);
  params.set('range', range);
  params.set('granularity', granularity);

  return params;
}

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value);
}

function updateStats(seriesData) {
  const statsContainer = document.getElementById('stats-container');
  statsContainer.innerHTML = '';

  seriesData.forEach(series => {
    const latest = series.data[series.data.length - 1];
    const statCard = document.createElement('div');
    statCard.className = 'stat-card';
    statCard.innerHTML = `
      <div class="stat-label">${series.skin_name} (${series.market_name})</div>
      <div class="stat-value">${formatCurrency(latest.close || latest.avg_price)}</div>
      <div>Volume: ${latest.total_volume}</div>
    `;
    statsContainer.appendChild(statCard);
  });
}

function renderPriceChart(seriesData, chartType) {
  const datasets = seriesData.flatMap(series => {
    const baseData = {
      label: `${series.skin_name} - ${series.market_name}`,
      data: series.data.map(point => ({
        x: point.timestamp,
        y: point.close || point.avg_price
      })),
      fill: false,
      borderWidth: 2,
      tension: 0.1,
      pointRadius: 0,
    };

    const maDatasets = Object.entries(series.movingAverages || {}).map(([key, values]) => ({
      label: `${series.skin_name} (${key.toUpperCase()})`,
      data: values.map(point => ({ x: point.timestamp, y: point.value })),
      borderWidth: 1.5,
      borderDash: key.startsWith('ema') ? [5, 5] : [],
      tension: 0.2,
      pointRadius: 0,
    }));

    return [baseData, ...maDatasets];
  });

  if (priceChartInstance) {
    priceChartInstance.destroy();
  }

  priceChartInstance = new Chart(priceChartCtx, {
    type: chartType,
    data: {
      datasets
    },
    options: {
      responsive: true,
      interaction: {
        mode: 'index',
        intersect: false
      },
      scales: {
        x: {
          type: 'time',
          time: {
            unit: 'day'
          }
        },
        y: {
          title: {
            display: true,
            text: 'Price (USD)'
          }
        }
      }
    }
  });
}

function renderVolumeChart(seriesData) {
  const datasets = seriesData.map(series => ({
    label: `${series.skin_name} - ${series.market_name}`,
    data: series.data.map(point => ({ x: point.timestamp, y: point.total_volume })),
    borderWidth: 1,
    pointRadius: 0,
    fill: true,
    backgroundColor: 'rgba(52, 152, 219, 0.2)',
    borderColor: 'rgba(52, 152, 219, 1)'
  }));

  if (volumeChartInstance) {
    volumeChartInstance.destroy();
  }

  volumeChartInstance = new Chart(volumeChartCtx, {
    type: 'bar',
    data: {
      datasets
    },
    options: {
      responsive: true,
      scales: {
        x: {
          type: 'time'
        },
        y: {
          title: {
            display: true,
            text: 'Volume'
          }
        }
      }
    }
  });
}

function renderHeatmap(volatilityData) {
  const container = document.getElementById('heatmap-container');

  if (!volatilityData || volatilityData.length === 0) {
    container.innerHTML = '<div class="loading">No volatility data available</div>';
    return;
  }

  const allDates = new Set();
  volatilityData.forEach(series => {
    series.data.forEach(point => allDates.add(point.date || point.timestamp));
  });
  const sortedDates = Array.from(allDates).sort();

  container.innerHTML = '';
  const heatmap = document.createElement('div');
  heatmap.className = 'heatmap';

  const headerRow = document.createElement('div');
  headerRow.className = 'heatmap-row';
  headerRow.style.gridTemplateColumns = `200px repeat(${sortedDates.length}, minmax(80px, 1fr))`;

  const headerLabel = document.createElement('div');
  headerLabel.className = 'heatmap-cell heatmap-header';
  headerLabel.textContent = 'Series / Date';
  headerRow.appendChild(headerLabel);

  sortedDates.forEach(date => {
    const cell = document.createElement('div');
    cell.className = 'heatmap-cell heatmap-header';
    cell.textContent = new Date(date).toLocaleDateString();
    headerRow.appendChild(cell);
  });

  heatmap.appendChild(headerRow);

  volatilityData.forEach(series => {
    const row = document.createElement('div');
    row.className = 'heatmap-row';
    row.style.gridTemplateColumns = `200px repeat(${sortedDates.length}, minmax(80px, 1fr))`;

    const labelCell = document.createElement('div');
    labelCell.className = 'heatmap-cell heatmap-header';
    labelCell.textContent = `${series.skin_name} - ${series.market_name}`;
    row.appendChild(labelCell);

    sortedDates.forEach(date => {
      const dataPoint = series.data.find(point => (point.date || point.timestamp) === date);
      const value = dataPoint ? dataPoint.coefficient_of_variation : null;

      const cell = document.createElement('div');
      cell.className = 'heatmap-cell';
      if (value !== null) {
        cell.textContent = value.toFixed(2) + '%';
        const intensity = Math.min(Math.abs(value) / 30, 1);
        cell.style.backgroundColor = `rgba(231, 76, 60, ${intensity})`;
        cell.style.color = intensity > 0.5 ? 'white' : '#333';
      } else {
        cell.textContent = '-';
      }
      row.appendChild(cell);
    });

    heatmap.appendChild(row);
  });

  container.appendChild(heatmap);
}

async function loadData() {
  try {
    const params = getQueryParams();
    const chartType = document.getElementById('chart-type').value;

    const [priceResponse, volatilityResponse] = await Promise.all([
      fetch(`/api/analytics/price-data?${params.toString()}`),
      fetch(`/api/analytics/volatility?${params.toString()}`)
    ]);

    if (!priceResponse.ok) {
      throw new Error('Failed to load price data');
    }

    if (!volatilityResponse.ok) {
      throw new Error('Failed to load volatility data');
    }

    const priceData = await priceResponse.json();
    const volatilityData = await volatilityResponse.json();

    updateStats(priceData);
    renderPriceChart(priceData, chartType);
    renderVolumeChart(priceData);
    renderHeatmap(volatilityData);
  } catch (error) {
    console.error(error);
    showError(error.message || 'Failed to load analytics data');
  }
}

async function exportCSV() {
  try {
    const params = getQueryParams();
    const response = await fetch(`/api/analytics/export/csv?${params.toString()}`);

    if (!response.ok) {
      throw new Error('Failed to export CSV');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    showError(error.message || 'CSV export failed');
  }
}

async function exportPNG() {
  try {
    if (!priceChartInstance) {
      showError('Please load data before exporting PNG');
      return;
    }

    const chartConfig = priceChartInstance.config;
    const response = await fetch('/api/analytics/export/png', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chartConfig })
    });

    if (!response.ok) {
      throw new Error('Failed to export PNG');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chart-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    showError(error.message || 'PNG export failed');
  }
}

// Initial load
loadData();
