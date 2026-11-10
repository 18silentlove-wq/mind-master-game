(() => {
  const SIZE = 8;
  const COLORS = ["#b9f34a", "#58c7ff", "#ff78b7", "#ffb45e", "#a78bfa"];
  const SHAPES = [
    [[1]], [[1,1]], [[1,1,1]], [[1,1,1,1]], [[1,1,1,1,1]],
    [[1],[1]], [[1],[1],[1]], [[1],[1],[1],[1]],
    [[1,1],[1,1]], [[1,1,1],[1,1,1]],
    [[1,0],[1,0],[1,1]], [[0,1],[0,1],[1,1]],
    [[1,0,0],[1,1,1]], [[0,0,1],[1,1,1]],
    [[1,1,0],[0,1,1]], [[0,1,1],[1,1,0]],
    [[1,1,1],[0,1,0]], [[0,1,0],[1,1,1]],
    [[1,1,1,1],[0,0,1,0]], [[1,1,1],[1,0,0]],
    [[1,1],[1,0],[1,0]], [[1,1],[0,1],[0,1]]
  ];
  const boardEl = document.getElementById("board");
  const trayEl = document.getElementById("tray");
  const scoreEl = document.getElementById("score");
  const bestEl = document.getElementById("best");
  const statusEl = document.getElementById("status");
  const comboEl = document.getElementById("combo");
  const modal = document.getElementById("game-over");
  const finalScore = document.getElementById("final-score");
  let board, pieces, selected = -1, score = 0, best = 0, combo = 0, over = false;

  try { best = Number(localStorage.getItem("mindMasterBlockBest")) || 0; } catch (_) {}
  bestEl.textContent = best;

  function say(text, type) {
    statusEl.textContent = text;
    statusEl.className = "status" + (type ? " " + type : "");
  }
  function copyShape(shape) { return shape.map(row => row.slice()); }
  function randomPiece() {
    const shape = copyShape(SHAPES[Math.floor(Math.random() * SHAPES.length)]);
    return { shape, color: COLORS[Math.floor(Math.random() * COLORS.length)], used: false };
  }
  function newSet() {
    pieces = [randomPiece(), randomPiece(), randomPiece()];
    selected = -1;
    renderTray();
  }
  function renderBoard(previewAt) {
    boardEl.innerHTML = "";
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        const cell = document.createElement("button");
        cell.type = "button";
        cell.className = "cell" + (board[r][c] ? " filled" : "");
        cell.setAttribute("role", "gridcell");
        cell.setAttribute("aria-label", "पंक्ति " + (r+1) + ", कॉलम " + (c+1));
        if (board[r][c]) cell.style.setProperty("--cell-color", board[r][c]);
        if (previewAt && selected >= 0) {
          const p = pieces[selected];
          const pr = r - previewAt.r, pc = c - previewAt.c;
          if (pr >= 0 && pc >= 0 && pr < p.shape.length && pc < p.shape[0].length && p.shape[pr][pc]) {
            cell.classList.add(canPlace(p, previewAt.r, previewAt.c) ? "preview" : "invalid-preview");
          }
        }
        cell.addEventListener("click", () => placeAt(r,c));
        boardEl.appendChild(cell);
      }
    }
  }
  function renderTray() {
    trayEl.innerHTML = "";
    pieces.forEach((piece, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "piece" + (selected === index ? " selected" : "");
      button.disabled = piece.used || over;
      button.setAttribute("aria-label", "ब्लॉक " + (index+1) + (piece.used ? " इस्तेमाल हो चुका" : " चुनें"));
      const shape = document.createElement("span");
      shape.className = "mini-shape";
      shape.style.gridTemplateColumns = "repeat(" + piece.shape[0].length + ",15px)";
      shape.style.setProperty("--piece-color", piece.color);
      piece.shape.forEach(row => row.forEach(value => {
        const square = document.createElement("i");
        square.className = "mini-cell";
        square.style.visibility = value ? "visible" : "hidden";
        shape.appendChild(square);
      }));
      button.appendChild(shape);
      button.addEventListener("click", () => {
        if (piece.used || over) return;
        selected = selected === index ? -1 : index;
        renderTray();
        renderBoard();
        say(selected < 0 ? "ब्लॉक चुन लिया गया है। अब बोर्ड पर जगह टैप करें।" : "अब बोर्ड पर वह जगह टैप करें जहाँ ब्लॉक रखना है।");
      });
      trayEl.appendChild(button);
    });
  }
  function canPlace(piece, row, col) {
    for (let r = 0; r < piece.shape.length; r++) {
      for (let c = 0; c < piece.shape[r].length; c++) {
        if (!piece.shape[r][c]) continue;
        const rr = row + r, cc = col + c;
        if (rr < 0 || cc < 0 || rr >= SIZE || cc >= SIZE || board[rr][cc]) return false;
      }
    }
    return true;
  }
  function placeAt(row, col) {
    if (over) return;
    if (selected < 0) { say("पहले नीचे से कोई ब्लॉक चुनें।", "bad"); return; }
    const piece = pieces[selected];
    if (!canPlace(piece, row, col)) {
      say("यहाँ जगह नहीं है। कोई दूसरी खाली जगह चुनें।", "bad");
      return;
    }
    let added = 0;
    piece.shape.forEach((line, r) => line.forEach((value, c) => {
      if (value) { board[row+r][col+c] = piece.color; added++; }
    }));
    piece.used = true;
    score += added;
    const rows = [];
    const cols = [];
    for (let r = 0; r < SIZE; r++) if (board[r].every(Boolean)) rows.push(r);
    for (let c = 0; c < SIZE; c++) if (board.every(line => Boolean(line[c]))) cols.push(c);
    if (rows.length || cols.length) {
      const cleared = new Set();
      rows.forEach(r => { for (let c=0;c<SIZE;c++) cleared.add(r + "," + c); });
      cols.forEach(c => { for (let r=0;r<SIZE;r++) cleared.add(r + "," + c); });
      cleared.forEach(key => { const [r,c] = key.split(",").map(Number); board[r][c] = null; });
      const lines = rows.length + cols.length;
      combo++;
      score += lines * 10 + (lines > 1 ? (lines-1) * 5 : 0);
      comboEl.textContent = lines > 1 ? lines + " LINES!" : combo > 1 ? "COMBO ×" + combo : "NICE!";
      say("शानदार! " + rows.length + " row और " + cols.length + " column साफ हुए। +" + (lines*10 + (lines>1?(lines-1)*5:0)) + " बोनस अंक!", "good");
    } else {
      combo = 0;
      comboEl.textContent = "KEEP GOING";
      say("अच्छी चाल! +" + added + " अंक। अगला ब्लॉक सोच-समझकर रखो।", "good");
    }
    scoreEl.textContent = score;
    if (score > best) {
      best = score;
      bestEl.textContent = best;
      try { localStorage.setItem("mindMasterBlockBest", String(best)); } catch (_) {}
    }
    selected = -1;
    if (pieces.every(p => p.used)) newSet();
    else renderTray();
    renderBoard();
    if (!hasAnyMove()) endGame();
  }
  function hasAnyMove() {
    return pieces.some(piece => !piece.used && fitsSomewhere(piece));
  }
  function fitsSomewhere(piece) {
    for (let r=0;r<SIZE;r++) for (let c=0;c<SIZE;c++) if (canPlace(piece,r,c)) return true;
    return false;
  }
  function endGame() {
    over = true;
    selected = -1;
    renderTray();
    finalScore.textContent = score;
    modal.hidden = false;
  }
  function startGame() {
    board = Array.from({length:SIZE}, () => Array(SIZE).fill(null));
    score = 0; combo = 0; over = false; selected = -1;
    scoreEl.textContent = "0";
    comboEl.textContent = "READY";
    modal.hidden = true;
    newSet();
    renderBoard();
    say("नीचे से एक ब्लॉक चुनें, फिर बोर्ड पर खाली जगह टैप करें।");
  }
  document.getElementById("new-game").addEventListener("click", startGame);
  document.getElementById("play-again").addEventListener("click", startGame);
  startGame();
})();