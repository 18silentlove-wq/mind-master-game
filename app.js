(() => {
  "use strict";
  const N = 8;
  const COLORS = ["#b9f34a", "#58c7ff", "#ff78b7", "#ffb45e", "#a78bfa"];
  const SHAPES = [
    [[1]], [[1,1]], [[1,1,1]], [[1,1,1,1]], [[1],[1]], [[1],[1],[1]],
    [[1,1],[1,1]], [[1,1,1],[1,1,1]], [[1,0],[1,1]], [[0,1],[1,1]],
    [[1,1,1],[0,1,0]], [[0,1,0],[1,1,1]], [[1,1,0],[0,1,1]],
    [[0,1,1],[1,1,0]], [[1,0,0],[1,1,1]], [[0,0,1],[1,1,1]],
    [[1,1],[1,0],[1,0]], [[1,1],[0,1],[0,1]], [[1,1,1,1]]
  ];
  const $ = id => document.getElementById(id);
  const boardNode = $("board"), trayNode = $("tray"), statusNode = $("status");
  const scoreNode = $("score"), bestNode = $("best"), comboNode = $("combo");
  const modal = $("game-over");
  let board = [], pieces = [], selected = -1, score = 0, best = 0, ended = false;

  function message(text, kind) {
    statusNode.textContent = text;
    statusNode.className = "status" + (kind ? " " + kind : "");
  }
  function randomPiece() {
    const source = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    return { shape: source.map(row => row.slice()), color: COLORS[Math.floor(Math.random() * COLORS.length)], used: false };
  }
  function canFit(piece, top, left) {
    for (let y=0; y<piece.shape.length; y++) for (let x=0; x<piece.shape[y].length; x++) {
      if (!piece.shape[y][x]) continue;
      const yy=top+y, xx=left+x;
      if (yy<0 || xx<0 || yy>=N || xx>=N || board[yy][xx]) return false;
    }
    return true;
  }
  function drawBoard() {
    boardNode.replaceChildren();
    for (let y=0; y<N; y++) for (let x=0; x<N; x++) {
      const cell=document.createElement("button");
      cell.type="button";
      cell.className="cell" + (board[y][x] ? " filled" : "");
      cell.setAttribute("aria-label", "पंक्ति "+(y+1)+", कॉलम "+(x+1));
      if (board[y][x]) cell.style.setProperty("--cell-color", board[y][x]);
      cell.addEventListener("click", () => putPiece(y,x));
      boardNode.appendChild(cell);
    }
  }
  function drawTray() {
    trayNode.replaceChildren();
    pieces.forEach((piece,index) => {
      const button=document.createElement("button");
      button.type="button";
      button.className="piece" + (selected===index ? " selected" : "");
      button.disabled=piece.used || ended;
      button.setAttribute("aria-label","ब्लॉक "+(index+1)+" चुनें");
      const shape=document.createElement("span");
      shape.className="mini-shape";
      shape.style.gridTemplateColumns="repeat("+piece.shape[0].length+",15px)";
      shape.style.setProperty("--piece-color",piece.color);
      piece.shape.forEach(row => row.forEach(value => {
        const square=document.createElement("i");
        square.className="mini-cell";
        square.style.visibility=value ? "visible" : "hidden";
        shape.appendChild(square);
      }));
      button.appendChild(shape);
      button.addEventListener("click", () => {
        if (piece.used || ended) return;
        selected = selected===index ? -1 : index;
        drawTray();
        message(selected===-1 ? "ब्लॉक हटाया गया। नीचे से दूसरा ब्लॉक चुनें।" : "ब्लॉक चुना गया! अब बोर्ड की खाली जगह टैप करें।");
      });
      trayNode.appendChild(button);
    });
  }
  function newTray() {
    pieces=[randomPiece(),randomPiece(),randomPiece()];
    selected=-1;
    drawTray();
  }
  function finish() {
    ended=true;
    selected=-1;
    drawTray();
    $("final-score").textContent=score;
    modal.hidden=false;
  }
  function checkMoves() {
    return pieces.some(piece => !piece.used && board.some((row,y) =>
      row.some((cell,x) => canFit(piece,y,x))
    ));
  }
  function putPiece(y,x) {
    if (ended) return;
    if (selected<0) { message("पहले नीचे से कोई ब्लॉक चुनें।","bad"); return; }
    const piece=pieces[selected];
    if (!canFit(piece,y,x)) { message("यह जगह सही नहीं है। दूसरी खाली जगह चुनें।","bad"); return; }
    let count=0;
    piece.shape.forEach((row,dy)=>row.forEach((value,dx)=>{
      if(value){board[y+dy][x+dx]=piece.color;count++;}
    }));
    score+=count;
    piece.used=true;
    const fullRows=[];
    const fullCols=[];
    for(let r=0;r<N;r++) if(board[r].every(Boolean)) fullRows.push(r);
    for(let c=0;c<N;c++) if(board.every(row=>Boolean(row[c]))) fullCols.push(c);
    const clear=new Set();
    fullRows.forEach(r=>{for(let c=0;c<N;c++)clear.add(r+","+c);});
    fullCols.forEach(c=>{for(let r=0;r<N;r++)clear.add(r+","+c);});
    clear.forEach(key=>{const [r,c]=key.split(",").map(Number);board[r][c]=null;});
    const lines=fullRows.length+fullCols.length;
    if(lines){score+=lines*10+(lines>1?(lines-1)*5:0);comboNode.textContent=lines+" LINE"+(lines>1?"S!":"!");message("बहुत बढ़िया! "+lines+" लाइन साफ हुईं। बोनस अंक मिले!","good");}
    else {comboNode.textContent="KEEP GOING";message("अच्छी चाल! +"+count+" अंक। अगला ब्लॉक लगाओ।","good");}
    scoreNode.textContent=score;
    if(score>best){best=score;bestNode.textContent=best;try{localStorage.setItem("mindMasterBlockBest",String(best));}catch(e){}}
    selected=-1;
    if(pieces.every(p=>p.used)) newTray(); else drawTray();
    drawBoard();
    if(!checkMoves()) finish();
  }
  function reset() {
    board=Array.from({length:N},()=>Array(N).fill(null));
    score=0;selected=-1;ended=false;
    scoreNode.textContent="0";comboNode.textContent="READY";
    modal.hidden=true;
    newTray();drawBoard();
    message("नीचे से ब्लॉक चुनें, फिर बोर्ड पर खाली जगह टैप करें।");
  }
  try {
    best=Number(localStorage.getItem("mindMasterBlockBest"))||0;
  } catch(e) { best=0; }
  bestNode.textContent=best;
  $("new-game").addEventListener("click",reset);
  $("play-again").addEventListener("click",reset);
  reset();
  window.addEventListener("error", event => {
    message("गेम में एक तकनीकी समस्या आई। पेज Refresh करें।","bad");
  });
})();