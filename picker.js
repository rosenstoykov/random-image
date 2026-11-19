"use strict";

// Switch to false after uploading the 25 JPG files.
const demoMode = true;
const imageCount = 25;
const storageKey = "qr-picture-deck-v1:" + Number(demoMode);
const picture = document.querySelector("#picture");
const sample = document.querySelector("#sample");
const status = document.querySelector("#status");
let state = { remaining: [], last: null };

function draw() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    if (saved && Array.isArray(saved.remaining)) state = saved;
  } catch {
    // Some private browsers disallow local storage.
  }

  if (state.remaining.length === 0) {
    state.remaining = Array.from({ length: imageCount }, (_, i) => i + 1);
    for (let i = imageCount - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [state.remaining[i], state.remaining[j]] = [state.remaining[j], state.remaining[i]];
    }
    const lastIndex = imageCount - 1;
    if (state.remaining[lastIndex] === state.last) {
      [state.remaining[0], state.remaining[lastIndex]] =
        [state.remaining[lastIndex], state.remaining[0]];
    }
  }

  const number = state.remaining.pop();
  state.last = number;
  try {
    localStorage.setItem(storageKey, JSON.stringify(state));
  } catch {
    // The button can still draw from the in-memory deck.
  }

  if (demoMode) {
    sample.style.setProperty("--hue", number * 137.5 % 360);
    sample.textContent = String(number).padStart(2, "0");
    sample.hidden = false;
    status.textContent = "Примерна картинка " + number + " от " + imageCount;
    return;
  }

  status.textContent = "Зареждане…";
  picture.hidden = true;
  picture.alt = "Картинка " + number;
  picture.src = "images/" + String(number).padStart(2, "0") + ".jpg";
}

picture.addEventListener("load", () => {
  picture.hidden = false;
  status.textContent = picture.alt;
});
picture.addEventListener("error", () => {
  status.textContent = "Картинката не може да се зареди. Опитайте с друга.";
});
document.querySelector("#next").addEventListener("click", draw);
window.addEventListener("pageshow", (event) => {
  if (event.persisted) draw();
});
draw();
