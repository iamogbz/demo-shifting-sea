function main() {
  const canvas = document.getElementById(MAIN_CANVAS_ID);
  resizeCanvas(canvas);
  const ctx = canvas.getContext('2d');
  const grid = createGrid();
  const loop = () => {
    updateGrid(grid);
    renderGrid(grid, ctx);
    window.requestAnimationFrame(loop);
  };
  loop();
}

function resizeCanvas(canvas) {
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  // ...then set the internal size to match
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
}

function createGrid() {
  return Array.from(new Array(GRID_ROW_COUNT)).map((_, r) =>
    Array.from(new Array(GRID_COL_COUNT)).map((_, c) => {
      const scale =
        1 -
        (Math.abs(GRID_COL_COUNT / 2 - c) / GRID_COL_COUNT +
          Math.abs(GRID_ROW_COUNT / 2 - r) / GRID_ROW_COUNT);
      return {
        magnitude: scale * MAX_MAGNITUDE,
        angle: scale * Math.PI * 2,
        temp: scale * MAX_TEMPERATURE,
      };
    })
  );
}

function updateGrid(gridValues) {
  gridValues.forEach((row, rowIdx) => {
    row.forEach((cell, colIdx) => {
      // get the average values from surrounding cells
      const neighbourCells = getAverageNeighbourCell(
        gridValues,
        rowIdx,
        colIdx
      );
    });
  });
}

function getAverageNeighbourCell(gridValues, rowIdx, colIdx) {}

function renderGrid(gridValues, canvasCtx) {
  gridValues.forEach((row, rowIdx) => {
    row.forEach((cell, colIdx) => {
      const cellBoundSize = Math.max(CELL_WIDTH_PX, CELL_HEIGHT_PX);
      const startX = cellBoundSize * (colIdx + 0.5);
      const startY = cellBoundSize * (rowIdx + 0.5);

      // show a grid to help with placement
      canvasCtx.fillStyle = '#CFC4';
      canvasCtx.fillRect(startX, startY, cellBoundSize, cellBoundSize);
      canvasCtx.fillStyle = '#CCF4';
      canvasCtx.fillRect(
        startX + CELL_MARGIN_PX,
        startY + CELL_MARGIN_PX,
        cellBoundSize - CELL_MARGIN_PX * 2,
        cellBoundSize - CELL_MARGIN_PX * 2
      );
      // put a dot in the center of the cell space
      const centerX = startX + cellBoundSize / 2;
      const centerY = startY + cellBoundSize / 2;
      canvasCtx.translate(centerX, centerY);
      canvasCtx.rotate(cell.angle);
      // canvasCtx.fillStyle = '#000';
      // canvasCtx.fillRect(0, 0, 2, 2);
      canvasCtx.fillStyle = `#${getTempColor(cell.temp)}`;
      const cellSize = (cell.magnitude / MAX_MAGNITUDE) * CELL_WIDTH_PX;
      canvasCtx.fillRect(
        -cellSize / 2,
        -CELL_HEIGHT_PX / 2,
        cellSize,
        CELL_HEIGHT_PX
      );
      canvasCtx.rotate(-cell.angle);
      canvasCtx.translate(-centerX, -centerY);
    });
  });
}

/**
 * Convert value between 0..1 to 3 char hexadecimal e.g. 1 => FFF
 */
function getTempColor(temp) {
  return Math.round((temp / MAX_TEMPERATURE) * 4095).toString(16);
}

const MAIN_CANVAS_ID = 'main-screen';
const GRID_COL_COUNT = 20;
const GRID_ROW_COUNT = 20;
const CELL_MARGIN_PX = 1;
const CELL_HEIGHT_PX = 2;
const CELL_WIDTH_PX = 20;
const MAX_MAGNITUDE = 2;
const MAX_TEMPERATURE = 1;

main();
