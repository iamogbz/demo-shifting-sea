let step = 0;
let grid = null;
let canvas = null;
const main = () => {
  new p5();
  noiseSeed(0);
  canvas = document.getElementById(MAIN_CANVAS_ID);
  resizeCanvas(canvas);
  grid = createGrid();
  const loop = () => {
    updateGrid(grid, step);
    renderGrid(grid, canvas);
    step = lerp(step, step + MAX_UPDATE_STEP, 2/3);
    window.requestAnimationFrame(loop);
  };
  loop();
};

const resizeCanvas = (canvas) => {
  canvas.style.width = `${CANVAS_WIDTH_PX}px`;
  canvas.style.height = `${CANVAS_HEIGHT_PX}px`;
  // ...then set the internal size to match
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
};

const createGrid = () =>
  createList(GRID_ROW_COUNT, () => createList(GRID_COL_COUNT, newCell));

const createList = (size, filler = (x) => x) =>
  Array.from(new Array(size)).map(filler);

const newCell = () => ({ v: 0.0, d: (random() - 0.5) * CELL_HEIGHT_PX });

const updateGrid = (gridValues, step) => {
  onEachCell(gridValues, ({ cell, posX, posY }) => {
    cell.v = noise(posX - step, posY - step, step);
  });
};

/**
 * Render grid as given
 */
const renderGrid = (gridValues, canvas) => {
  const canvasCtx = canvas.getContext('2d');
  canvasCtx.fillStyle = 'black';
  canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
  onEachCell(gridValues, ({ cell, colIdx, rowIdx }) => {
    const cellBoundSize = Math.max(CELL_WIDTH_PX, CELL_HEIGHT_PX) / 4;
    const startX = cellBoundSize * (colIdx - 1) + cell.d;
    const startY = cellBoundSize * (rowIdx - 1) + cell.d;
    const cellSize = getCellSize(cell.v);
    const cellHeight = map(cellSize, 0, CELL_WIDTH_PX, 0, CELL_HEIGHT_PX, true);
    const angle = rangeToAngle(cell.v);
    const color = getCellColor(cell.v, cellSize);

    // put a dot in the center of the cell space
    const centerX = startX + cellBoundSize / 2;
    const centerY = startY + cellBoundSize / 2;
    canvasCtx.translate(centerX, centerY);
    canvasCtx.rotate(angle);
    const grd = canvasCtx.createLinearGradient(0, 0, cellSize, 0);
    grd.addColorStop(0, 'transparent');
    grd.addColorStop(2 / 3, color);
    canvasCtx.fillStyle = grd;
    // point at center
    // canvasCtx.fillRect(
    //   -cellHeight / 2,
    //   -cellHeight / 2,
    //   cellHeight,
    //   cellHeight
    // );
    // line from center to end
    canvasCtx.fillRect(0, -cellHeight / 2, cellSize, cellHeight);
    // point at end of line
    canvasCtx.beginPath();
    canvasCtx.arc(cellSize, 0, cellHeight / 2, 0, Math.PI * 2);
    canvasCtx.fill();
    canvasCtx.rotate(-angle);
    canvasCtx.translate(-centerX, -centerY);
  });
};

/**
 * Iterate on each grid cell value
 */
const onEachCell = (grid, cb) => {
  // const total = GRID_ROW_COUNT * GRID_COL_COUNT;
  grid.forEach((row, rowIdx) => {
    row.forEach((cell, colIdx) => {
      const posX = norm(rowIdx, 0, GRID_ROW_COUNT);
      const posY = norm(colIdx, 0, GRID_COL_COUNT);
      cb({ cell, colIdx, rowIdx, posX, posY });
    });
  });
};

const getCellScale = (v) => map(v, 1 / 3, 2 / 3, 0, 1);
const getCellSize = (v) => getCellScale(v) * CELL_WIDTH_PX;
const getCellColor = (v, cellSize) => {
  const col = color(getHexColor(v));
  col.setAlpha(map(cellSize, 0, CELL_WIDTH_PX, 0, 255, true));
  return col;
};

/**
 * Convert value between 0..1 to 3 char hexadecimal e.g. 1 => FFF
 */
const getHexColor = (tmp) =>
  `${COLOR_HEX_TOKEN}${colorToHex(rangeToColor(tmp))}`;
const rangeToColor = (tmp) => {
  const colorStopRGB = tmp * COLOR_RANGE.length;
  const colorL = color(
    COLOR_RANGE[Math.floor(colorStopRGB) % COLOR_RANGE.length]
  );
  const colorR = color(
    COLOR_RANGE[Math.ceil(colorStopRGB) % COLOR_RANGE.length]
  );
  const col = lerpColor(
    colorL,
    colorR,
    colorStopRGB - Math.floor(colorStopRGB)
  );
  return col;
};
const colorToHex = (col) =>
  col.toString(`${COLOR_HEX_TOKEN}${COLOR_FORMAT}`).substring(1);
const colorToRange = (col) =>
  norm(parseInt(colorToHex(col), 16), 0, MAX_COLOR_DECIMAL);
const rangeToAngle = (rng) => constrain(rng, 0, 1) * MAX_ANGLE;

const MAIN_CANVAS_ID = 'main-screen';
const GRID_COL_COUNT = 96;
const GRID_ROW_COUNT = 60;
const CELL_MARGIN_PX = 2;
const CELL_HEIGHT_PX = 8;
const CELL_WIDTH_PX = 80;
const CANVAS_WIDTH_PX = 1728;
const CANVAS_HEIGHT_PX = (CANVAS_WIDTH_PX * GRID_ROW_COUNT) / GRID_COL_COUNT;
const COLOR_HEX_TOKEN = '#';
const COLOR_RANGE = ['F84', '4F8', '84F', 'FF4', 'F4F', '4FF', 'F48', '48F', '8F4', 'FFF']
  .flatMap((hex) => new Array(1).fill(`${COLOR_HEX_TOKEN}${hex}`))
  .sort(() => Math.random() - Math.random())
  .slice(0, 4);
const COLOR_FORMAT = 'rgba'.replace(/\w/g, (c) => c + c);
const COLOR_FORMAT_MAX = COLOR_FORMAT.replace(/\w/g, 'F');
const MAX_COLOR_DECIMAL = parseInt(COLOR_FORMAT_MAX, 16);
const MAX_UPDATE_STEP = 0.01;
const MAX_ANGLE = Math.PI * 4;

main();
