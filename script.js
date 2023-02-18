const main = () => {
  new p5();
  const canvas = document.getElementById(MAIN_CANVAS_ID);
  resizeCanvas(canvas);
  const grid = createGrid();
  const loop = () => {
    updateGrid(grid);
    renderGrid(grid, canvas);
    window.requestAnimationFrame(loop);
  };
  loop();
};

const resizeCanvas = (canvas) => {
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  // ...then set the internal size to match
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
};

const createGrid = () => {
  const total = GRID_ROW_COUNT * GRID_COL_COUNT;
  return Array.from(new Array(GRID_ROW_COUNT)).map((_, r) =>
    Array.from(new Array(GRID_COL_COUNT)).map((_, c) => {
      const ang = noise((r + 1) / GRID_ROW_COUNT, (c + 1) / GRID_COL_COUNT);
      const colorMinDecimal = 0.001;
      const colorMin = color(getHexColor(colorMinDecimal));
      const colorMax = color(getHexColor(1 - colorMinDecimal));
      const amt = (r * GRID_COL_COUNT + c) / total;
      return {
        age: 0,
        ang,
        mag: ang,
        tmp: colorToRange(lerpColor(colorMin, colorMax, amt)),
      };
    })
  );
};

const updateGrid = (gridValues) => {
  const updateStep = random() * MAX_UPDATE_STEP;
  gridValues.forEach((row, rowIdx) => {
    row.forEach((cell, colIdx) => {
      cell.age += updateStep;
      const mod = cell.age;
      cell.mag = noise(
        (rowIdx + 1) / GRID_ROW_COUNT + mod,
        (colIdx + 1) / GRID_COL_COUNT + mod
      );
      cell.ang = cell.mag;
      cell.tmp = getNxtColor(cell.tmp, updateStep);
    });
  });
};

/**
 * Render grid as given
 */
const renderGrid = (gridValues, canvas) => {
  const canvasCtx = canvas.getContext('2d');
  canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
  gridValues.forEach((row, rowIdx) => {
    row.forEach((cell, colIdx) => {
      const cellBoundSize = Math.max(CELL_WIDTH_PX, CELL_HEIGHT_PX) / 4;
      const startX = cellBoundSize * (colIdx + 0.5);
      const startY = cellBoundSize * (rowIdx + 0.5);
      const angle = cell.ang * Math.PI * 4;
      const color = getHexColor(cell.tmp);

      // put a dot in the center of the cell space
      const centerX = startX + cellBoundSize / 2;
      const centerY = startY + cellBoundSize / 2;
      canvasCtx.translate(centerX, centerY);
      canvasCtx.rotate(angle);
      canvasCtx.fillStyle = color;
      const cellSize = cell.mag * CELL_WIDTH_PX;
      // line
      canvasCtx.fillRect(0, -CELL_HEIGHT_PX / 2, cellSize, CELL_HEIGHT_PX);
      // point
      canvasCtx.fillRect(
        cellSize,
        -CELL_HEIGHT_PX,
        CELL_HEIGHT_PX * 2,
        CELL_HEIGHT_PX * 2
      );
      canvasCtx.rotate(-angle);
      canvasCtx.translate(-centerX, -centerY);
    });
  });
};

/**
 * Convert value between 0..1 to 3 char hexadecimal e.g. 1 => FFF
 */
const getTmpColor = (tmp) => Math.round(tmp * MAX_COLOR_DECIMAL).toString(16);
const getHexColor = (tmp) => `#${getTmpColor(tmp)}`;
const getNxtColor = (point, step) =>
  colorToRange(
    lerpColor(
      color(getHexColor(point)),
      color(getHexColor(point + step)),
      MAX_UPDATE_STEP
    )
  );
const colorToRange = (col) =>
  parseInt(
    col
      .toString(`#${COLOR_FORMAT.toLowerCase().replace(/\w/g, (c) => c + c)}`)
      .substring(1),
    16
  ) / MAX_COLOR_DECIMAL;

const MAIN_CANVAS_ID = 'main-screen';
const GRID_COL_COUNT = 40;
const GRID_ROW_COUNT = GRID_COL_COUNT;
const CELL_MARGIN_PX = 2;
const CELL_HEIGHT_PX = 2;
const CELL_WIDTH_PX = GRID_COL_COUNT / 2;
const COLOR_FORMAT = 'rgba';
const MAX_COLOR_DECIMAL = parseInt(COLOR_FORMAT.replace(/\w/g, 'FF'), 16);
const MAX_UPDATE_STEP = 0.005;

main();
