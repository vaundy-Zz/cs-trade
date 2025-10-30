import { PNG } from 'pngjs';

const DEFAULT_WIDTH = 1200;
const DEFAULT_HEIGHT = 600;
const PADDING = 60;
const BACKGROUND_COLOR = { r: 255, g: 255, b: 255, a: 255 };
const AXIS_COLOR = { r: 44, g: 62, b: 80, a: 255 };
const GRID_COLOR = { r: 220, g: 230, b: 240, a: 255 };

const PALETTE = [
  { r: 52, g: 152, b: 219, a: 255 },
  { r: 46, g: 204, b: 113, a: 255 },
  { r: 231, g: 76, b: 60, a: 255 },
  { r: 155, g: 89, b: 182, a: 255 },
  { r: 243, g: 156, b: 18, a: 255 },
  { r: 52, g: 73, b: 94, a: 255 },
];

function setPixel(image, x, y, color) {
  if (x < 0 || x >= image.width || y < 0 || y >= image.height) {
    return;
  }
  const idx = (image.width * y + x) << 2;
  image.data[idx] = color.r;
  image.data[idx + 1] = color.g;
  image.data[idx + 2] = color.b;
  image.data[idx + 3] = color.a;
}

function drawLine(image, x0, y0, x1, y1, color) {
  let dx = Math.abs(x1 - x0);
  let dy = -Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;

  while (true) {
    setPixel(image, x0, y0, color);
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * err;
    if (e2 >= dy) {
      err += dy;
      x0 += sx;
    }
    if (e2 <= dx) {
      err += dx;
      y0 += sy;
    }
  }
}

function drawGrid(image, minY, maxY, width, height) {
  const plotWidth = width - PADDING * 2;
  const plotHeight = height - PADDING * 2;
  const steps = 5;

  for (let i = 0; i <= steps; i++) {
    const y = Math.round(PADDING + (plotHeight * i) / steps);
    for (let x = PADDING; x <= PADDING + plotWidth; x++) {
      setPixel(image, x, y, GRID_COLOR);
    }
  }

  for (let i = 0; i <= steps; i++) {
    const x = Math.round(PADDING + (plotWidth * i) / steps);
    for (let y = PADDING; y <= PADDING + plotHeight; y++) {
      setPixel(image, x, y, GRID_COLOR);
    }
  }
}

function normalizeValue(value, min, max) {
  if (max === min) {
    return 0.5;
  }
  return (value - min) / (max - min);
}

function extractNumericValue(point) {
  if (point == null) return null;
  if (typeof point === 'number') return point;
  if (typeof point === 'object') {
    if (typeof point.y === 'number') return point.y;
    if (typeof point.value === 'number') return point.value;
  }
  return null;
}

function extractLabel(point, index, labels) {
  if (Array.isArray(labels) && labels[index] != null) {
    return labels[index];
  }
  if (point && typeof point === 'object') {
    return point.x ?? point.timestamp ?? point.date ?? point.label ?? index;
  }
  return index;
}

function drawLegend(image, datasets, width) {
  const legendPadding = 20;
  let x = PADDING;
  const y = PADDING / 2;

  datasets.forEach((dataset, idx) => {
    const color = PALETTE[idx % PALETTE.length];
    for (let lx = 0; lx < 20; lx++) {
      for (let ly = 0; ly < 10; ly++) {
        setPixel(image, x + lx, y + ly, color);
      }
    }

    const label = dataset.label || `Series ${idx + 1}`;
    // Minimal text rendering (each character as simple block)
    let offset = 30;
    for (const char of String(label).slice(0, 15)) {
      const code = char.charCodeAt(0) % 10;
      for (let lx = 0; lx < 6; lx++) {
        for (let ly = 0; ly < 10; ly++) {
          if ((lx + ly + code) % 7 === 0) {
            setPixel(image, x + offset + lx, y + ly, AXIS_COLOR);
          }
        }
      }
      offset += 8;
    }

    x += 150;
    if (x > width - PADDING) {
      x = PADDING;
    }
  });
}

export function generateSimpleChartPNG(chartConfig = {}) {
  const width = chartConfig.width || DEFAULT_WIDTH;
  const height = chartConfig.height || DEFAULT_HEIGHT;
  const image = new PNG({ width, height });

  // Fill background
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      setPixel(image, x, y, BACKGROUND_COLOR);
    }
  }

  const datasets = Array.isArray(chartConfig.data?.datasets)
    ? chartConfig.data.datasets
    : [];
  const labels = chartConfig.data?.labels || null;

  if (datasets.length === 0) {
    return PNG.sync.write(image);
  }

  // Determine value range
  let minValue = Number.POSITIVE_INFINITY;
  let maxValue = Number.NEGATIVE_INFINITY;
  const processedDatasets = datasets.map((dataset) => {
    const points = Array.isArray(dataset.data) ? dataset.data : [];
    const values = points.map(extractNumericValue).filter((value) => typeof value === 'number');

    values.forEach((value) => {
      minValue = Math.min(minValue, value);
      maxValue = Math.max(maxValue, value);
    });

    return {
      original: dataset,
      points,
      values,
    };
  });

  if (!isFinite(minValue) || !isFinite(maxValue)) {
    minValue = 0;
    maxValue = 1;
  }

  if (maxValue === minValue) {
    maxValue = minValue + 1;
  }

  const plotWidth = width - PADDING * 2;
  const plotHeight = height - PADDING * 2;

  drawGrid(image, minValue, maxValue, width, height);

  // Draw axes
  drawLine(image, PADDING, PADDING, PADDING, height - PADDING, AXIS_COLOR);
  drawLine(image, PADDING, height - PADDING, width - PADDING, height - PADDING, AXIS_COLOR);

  // Draw datasets
  processedDatasets.forEach(({ original, points, values }, datasetIdx) => {
    if (values.length === 0) {
      return;
    }

    const color = PALETTE[datasetIdx % PALETTE.length];
    const totalPoints = values.length;

    for (let i = 0; i < totalPoints - 1; i++) {
      const valueA = values[i];
      const valueB = values[i + 1];
      if (valueA == null || valueB == null) continue;

      const xA = Math.round(PADDING + (plotWidth * i) / (totalPoints - 1));
      const xB = Math.round(PADDING + (plotWidth * (i + 1)) / (totalPoints - 1));

      const normA = 1 - normalizeValue(valueA, minValue, maxValue);
      const normB = 1 - normalizeValue(valueB, minValue, maxValue);

      const yA = Math.round(PADDING + normA * plotHeight);
      const yB = Math.round(PADDING + normB * plotHeight);

      drawLine(image, xA, yA, xB, yB, color);
    }
  });

  drawLegend(image, datasets, width);

  return PNG.sync.write(image);
}
