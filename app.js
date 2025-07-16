document.addEventListener("DOMContentLoaded", () => {
  // =======================================
  // 1. Board Setup: 24 playable positions
  // =======================================
  const board = Array(24).fill(null); // "P1", "P2", or null
  let currentPlayer = "P1";

  const millCombos = [ // all possible mills
    [0, 1, 2],   [3, 4, 5],   [6, 7, 8],
    [9, 10, 11], [12, 13, 14], [15, 16, 17],
    [18, 19, 20], [21, 22, 23],
    [0, 9, 21],  [3, 10, 18], [6, 11, 15],
    [1, 4, 7],   [16, 19, 22], [8, 12, 17],
    [5, 13, 20], [2, 14, 23]
  ];

  // =======================================
  // 2. UI Elements & Setup
  // =======================================

  const statusEl = document.getElementById("status"); // 
  const spots = document.querySelectorAll(".spot"); // Uses existing spot divs

  // Add data-index attributes & event listeners to spots
  spots.forEach((spot, index) => {
    spot.dataset.index = index;
    spot.addEventListener("click", handlePlace);
  });

  let piecesPlaced = { P1: 0, P2: 0 };
  let phase = "placing";

  statusEl.textContent = `${currentPlayer}'s turn.`;

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
      statusEl.textContent = "❌ That spot is already taken.";
      return;
    }

    if (phase === "placing") {
      if (piecesPlaced[currentPlayer] >= 9) {
        statusEl.textContent = `${currentPlayer} has already placed all 9 pieces.`;
        return;
      }

      // Place piece
      board[index] = currentPlayer;
       event.target.classList.add(currentPlayer === "P1" ? "player1" : "player2"); //
      piecesPlaced[currentPlayer]++;

      let message = `${currentPlayer} placed at spot ${index}.`;

      if (checkMill(index, currentPlayer)) {
        message = `🎉 ${currentPlayer} formed a MILL! Remove an opponent's piece.`;
        // Optional: enter remove mode here
      }

      if (piecesPlaced.P1 === 9 && piecesPlaced.P2 === 9) {
        phase = "moving";
        message += " 🟢 All pieces placed. Moving phase begins!";
      }

      const placingPlayer = currentPlayer;
      currentPlayer = currentPlayer === "P1" ? "P2" : "P1";

      if (phase === "placing" && !checkMill(index, placingPlayer)) {
        message += ` ${currentPlayer}'s turn.`;
      }

      statusEl.textContent = message;
    }
  }
});
