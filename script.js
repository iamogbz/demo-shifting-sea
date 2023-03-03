let step = Math.random();
let play = true;
let grid = null;
let canvas = null;

const main = () => {
  init();
  loop();
};

/** Start and keep loop running */
const loop = () => {
  if (play) next();
  window.requestAnimationFrame(loop);
};

/** Process next loop frame */
const next = () => {
  updateGrid(grid, step);
  renderGrid(grid);
  step = lerp(step, step + UPDATE_STEP_MAX, 2 / 3);
};

/** Initialise sim env */
const init = () => {
  new p5();
  noiseSeed(step);
  initCanvas(CANVAS_ID);
  grid = createGrid();
};

const initCanvas = (canvasId) => {
  canvas = document.getElementById(canvasId);
  canvas.style.scale = 1.2;
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
const renderGrid = (gridValues) => {
  const canvasCtx = canvas.getContext('2d');
  canvasCtx.reset();
  canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

  canvasCtx.fillStyle = COLOR_BG;
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
    canvasCtx.globalCompositeOperation = COLOR_BLEND_FFF;
    canvasCtx.fillRect(0, -cellHeight / 2, cellSize, cellHeight);
    // point at end of line
    // canvasCtx.globalCompositeOperation = COLOR_BLEND_DEF;
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
  norm(parseInt(colorToHex(col), 16), 0, COLOR_MAX_DEC);
const rangeToAngle = (rng) => constrain(rng, 0, 1) * ANGLE_MAX_RAD;

const ANGLE_MAX_RAD = Math.PI * 4;
const CANVAS_WIDTH_PX = window.screen.availWidth;
const CANVAS_HEIGHT_PX = window.screen.availHeight;
const GRID_COL_COUNT = 96;
const GRID_ROW_COUNT = Math.round(GRID_COL_COUNT * CANVAS_HEIGHT_PX / CANVAS_WIDTH_PX);
const CANVAS_ID = 'main-screen';
const CELL_WIDTH_PX = 80;
const CELL_HEIGHT_PX = 8;
const CELL_MARGIN_PX = 2;
const COLOR_BG = 'black';
const COLOR_BLEND_DEF = 'source-over';
const COLOR_BLEND_FFF = 'lighter';
const COLOR_FORMAT = 'rgba'.replace(/\w/g, (c) => c + c);
const COLOR_MAX_HEX = COLOR_FORMAT.replace(/\w/g, 'F');
const COLOR_MAX_DEC = parseInt(COLOR_MAX_HEX, 16);
const COLOR_HEX_TOKEN = '#';
const COLOR_RANGE = ['D74', '4D7', '74D', 'D47', '47D', '7D4']
  .flatMap((hex) => new Array(1).fill(`${COLOR_HEX_TOKEN}${hex}`))
  .sort(() => Math.random() - Math.random());
const UPDATE_STEP_MAX = 0.01;

main();
