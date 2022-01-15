function chunkArray(array, size) {
  const result = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }

  return result;
}

function shuffleArray(array) {
  let randomIndex, temp, i;
  for (i = array.length - 1; i > 0; i--) {
    randomIndex = Math.round(Math.random() * (i + 1));
    temp = array[i];
    array[i] = array[randomIndex];
    array[randomIndex] = temp;
  }
  return array;
}

function hasWonGame() {
  for (let i = 0; i < images.length; i++) {
    for (let j = 1; j < images[i].length; j++) {
      if (images[i][j].order - images[i][j - 1].order !== 1) {
        return false;
      }
    }
  }

  return true;
}

function isCellEmpty(row, col) {
  return images[row][col].empty === true;
}

const BOARD_SIZE = 3;
const ROW_BEGIN = 0;
const COL_BEGIN = 0;
const ROW_END = BOARD_SIZE - 1;
const COL_END = BOARD_SIZE - 1;

function generateImages() {
  const IMAGES = Array.from(Array(BOARD_SIZE * BOARD_SIZE - 1).keys()).map(
    (num, index) => ({
      source: `./images/${num + 1}.jpg`,
      order: num + 1,
      transform: [0, 0],
    })
  );

  let images = chunkArray(shuffleArray(IMAGES), BOARD_SIZE);
  // Make last item empty
  images[BOARD_SIZE - 1][BOARD_SIZE - 1] = {
    empty: true,
    order: BOARD_SIZE * BOARD_SIZE,
  };

  // Assign row and column indexes to images
  images = images.map((row, rowIndex) =>
    row.map((col, colIndex) => col && { ...col, row: rowIndex, col: colIndex })
  );

  return images;
}

function renderImages(images, board) {
  board.innerHTML = "";
  images.forEach((row) => {
    row.forEach((image) => {
      if (image.empty) {
        return;
      }
      const img = document.createElement("img");
      img.src = image.source;
      img.classList.add("cell");
      img.setAttribute("data-row", image.row);
      img.setAttribute("data-col", image.col);

      board.appendChild(img);

      img.addEventListener("click", onCellClick);
    });
  });
}

let gameEnded = false;
let images = generateImages();

const board = document.getElementById("js-board");

renderImages(images, board);

const restartBtn = document.getElementById("js-restart");
restartBtn.addEventListener("click", () => {
  gameEnded = false;
  images = generateImages();
  renderImages(images, board);
});

function onCellClick(event) {
  if (gameEnded) {
    return;
  }
  const row = Number(event.target.dataset.row);
  const col = Number(event.target.dataset.col);

  if (row !== ROW_END && isCellEmpty(row + 1, col)) {
    swapCells(row, col, row + 1, col, event.target);
  }

  if (row !== ROW_BEGIN && isCellEmpty(row - 1, col)) {
    swapCells(row, col, row - 1, col, event.target);
  }

  if (col !== COL_END && isCellEmpty(row, col + 1)) {
    swapCells(row, col, row, col + 1, event.target);
  }

  if (col !== COL_BEGIN && isCellEmpty(row, col - 1)) {
    swapCells(row, col, row, col - 1, event.target);
  }

  if (hasWonGame()) {
    event.target.addEventListener(
      "transitionend",
      () => {
        const lastImg = document.createElement("img");
        lastImg.src = `/images/${BOARD_SIZE * BOARD_SIZE}.jpg`;
        board.appendChild(lastImg);
        board.classList.add("board--won-game");
        gameEnded = true;
      },
      { once: true }
    );
  }
}

// Move element from row1, col1 to row2, col2
function swapCells(row1, col1, row2, col2, element) {
  const image = images[row1][col1];

  const transformX = image.transform[0] + (col2 - col1) * element.offsetWidth;
  const transformY = image.transform[1] + (row2 - row1) * element.offsetWidth;
  element.style.transform = `translate(${transformX}px, ${transformY}px)`;
  element.dataset.row = row2;
  element.dataset.col = col2;
  image.transform = [transformX, transformY];

  images[row1][col1] = { empty: true, order: BOARD_SIZE * BOARD_SIZE };
  images[row2][col2] = image;
}
