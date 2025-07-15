// =======================================
// 1. Board Setup: 24 playable positions
// =======================================

const board = Array(24).fill(null); // "P1", "P2", or null
let currentPlayer = "P1";

const millCombos = [
  [0, 1, 2],   [3, 4, 5],   [6, 7, 8],
  [9, 10, 11], [12, 13, 14], [15, 16, 17],
  [18, 19, 20], [21, 22, 23],
  [0, 9, 21],  [3, 10, 18], [6, 11, 15],
  [1, 4, 7],   [16, 19, 22], [8, 12, 17],
  [5, 13, 20], [2, 14, 23]
];

// =======================================
// 2. UI Rendering
// We'll use grid positions (static for now)
// =======================================

const boardEl = document.getElementById("board");

// Playable positions only — mapped visually in an 8x8 grid
const playableIndices = [
  0, 1, 2,      -1,     3, 4, 5,
  -1, -1, -1,   -1,     6, 7, 8,
  -1, -1, -1,   9,     10,11,-1,
  -1, -1, -1,  12,     13,14,-1,
  -1, -1, -1,  15,     16,17,-1,
  -1, -1, -1,  18,     19,20,-1,
  21,22,23,     -1,    -1,-1,-1
];

// Render grid: total of 49 slots in an 8x8 layout
for (let i = 0; i < 49; i++) {
  const div = document.createElement("div");

  if (playableIndices[i] !== -1 && playableIndices[i] !== undefined) {
    div.classList.add("tile");
    div.dataset.index = playableIndices[i];
    div.addEventListener("click", handlePlace);
  } else {
    div.style.visibility = "hidden"; // blank space in the layout
  }

  boardEl.appendChild(div);
}

// =======================================
// 3. Mill Checking Function
// =======================================

function checkMill(position, player) {
  const relevantCombos = millCombos.filter(combo => combo.includes(Number(position)));
  return relevantCombos.some(combo => combo.every(i => board[i] === player));
}

// =======================================
// 4. Place Piece Handler
// =======================================

function handlePlace(event) {
  const index = parseInt(event.target.dataset.index);

  if (board[index]) {
    console.log("❌ That spot is taken.");
    return;
  }

  // Place the piece
  board[index] = currentPlayer;
  event.target.classList.add(currentPlayer);

  console.log(`🎯 ${currentPlayer} placed at ${index}`);

  // Check for mill
  if (checkMill(index, currentPlayer)) {
    console.log(`🎉 ${currentPlayer} formed a MILL!`);
    // In full game, trigger "remove opponent piece" mode here
  }

  // Switch player
  currentPlayer = currentPlayer === "P1" ? "P2" : "P1";
}