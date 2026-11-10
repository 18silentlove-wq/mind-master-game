(() => {
  const SECRET = "013";
  const MAX_ATTEMPTS = 8;
  const form = document.getElementById("guess-form");
  const input = document.getElementById("guess");
  const submit = document.getElementById("submit-btn");
  const message = document.getElementById("message");
  const history = document.getElementById("history");
  const remaining = document.getElementById("remaining");
  const attemptCount = document.getElementById("attempt-count");
  const best = document.getElementById("best");
  const resultActions = document.getElementById("result-actions");
  const retry = document.getElementById("retry-btn");
  let attempts = 0;
  let finished = false;

  try {
    const saved = localStorage.getItem("mindMasterBest");
    if (saved) best.textContent = saved + " प्रयास";
  } catch (_) {}

  function setMessage(text, kind) {
    message.textContent = text;
    message.className = "message" + (kind ? " " + kind : "");
  }

  function score(guess) {
    let exact = 0;
    let present = 0;
    for (let i = 0; i < 3; i++) {
      if (guess[i] === SECRET[i]) exact++;
      else if (SECRET.includes(guess[i])) present++;
    }
    return { exact, present };
  }

  function addHistory(guess, result) {
    const empty = history.querySelector(".empty-history");
    if (empty) empty.remove();
    const item = document.createElement("li");
    const number = document.createElement("span");
    number.className = "guess-number";
    number.textContent = guess;
    const feedback = document.createElement("span");
    feedback.className = "feedback";
    feedback.textContent = result.exact + " सही जगह पर · " + result.present + " सही, गलत जगह पर";
    item.append(number, feedback);
    history.prepend(item);
  }

  function endGame(won) {
    finished = true;
    input.disabled = true;
    submit.disabled = true;
    resultActions.hidden = false;
    if (won) {
      setMessage("शानदार! आपने गुप्त कोड " + SECRET + " खोज लिया। आपकी तर्कशक्ति ने काम कर दिखाया!", "success");
      try {
        const old = Number(localStorage.getItem("mindMasterBest"));
        if (!old || attempts < old) {
          localStorage.setItem("mindMasterBest", String(attempts));
          best.textContent = attempts + " प्रयास";
        }
      } catch (_) {}
    } else {
      setMessage("इस बार कोड नहीं खुल पाया। सही कोड " + SECRET + " था। दोबारा कोशिश करें!", "error");
    }
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (finished) return;
    const guess = input.value.trim();
    if (!/^\d{3}$/.test(guess)) {
      setMessage("कृपया ठीक 3 अंक लिखें।", "error");
      input.focus();
      return;
    }
    if (new Set(guess).size !== 3) {
      setMessage("तीनों अंक अलग-अलग होने चाहिए।", "error");
      input.focus();
      return;
    }
    attempts++;
    const result = score(guess);
    addHistory(guess, result);
    remaining.textContent = String(MAX_ATTEMPTS - attempts);
    attemptCount.textContent = attempts + "/" + MAX_ATTEMPTS;
    input.value = "";
    if (result.exact === 3) {
      endGame(true);
    } else if (attempts >= MAX_ATTEMPTS) {
      endGame(false);
    } else {
      setMessage("इस अनुमान में " + result.exact + " अंक सही जगह पर और " + result.present + " अंक सही लेकिन गलत जगह पर हैं। संकेतों से मिलाकर अगला अनुमान लगाएँ।");
      input.focus();
    }
  });

  input.addEventListener("input", () => {
    input.value = input.value.replace(/[^0-9]/g, "").slice(0, 3);
  });

  retry.addEventListener("click", () => {
    attempts = 0;
    finished = false;
    input.disabled = false;
    submit.disabled = false;
    input.value = "";
    history.innerHTML = '<li class="empty-history">अभी कोई प्रयास नहीं किया गया।</li>';
    remaining.textContent = String(MAX_ATTEMPTS);
    attemptCount.textContent = "0/" + MAX_ATTEMPTS;
    setMessage("ध्यान से संकेत पढ़ें और अपना पहला अनुमान लगाएँ।");
    resultActions.hidden = true;
    input.focus();
  });
})();