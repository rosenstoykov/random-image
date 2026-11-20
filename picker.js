"use strict";

// Switch to false after uploading the 25 JPG files.
const demoMode = false;
const imageCount = 25;
const storageKey = "qr-picture-deck-v1:" + Number(demoMode);
const wishes = [
  "Нека домът ти бъде пълен с топлина и смях.",
  "Очаква те пътуване, за което ще разказваш дълго.",
  "Една смела идея ще се превърне в нещо истинско.",
  "Ще намериш време за нещо, което отдавна ти липсва.",
  "Предстои ти среща, която ще ти стопли сърцето.",
  "Новата година ти носи здраве и спокойни дни.",
  "Малка изненада ще направи един обикновен ден специален.",
  "Ще чуеш добра новина точно когато имаш нужда от нея.",
  "Ще има повече поводи да събереш любимите си хора.",
  "Скоро ще се гордееш с нещо, за което си положил усилия.",
  "Предстои ти година с повече музика и танци.",
  "Стар приятел ще ти напомни за хубав спомен.",
  "Късметът ще те намери на неочаквано място.",
  "Една мечта ще се приближи с цяла крачка.",
  "Чака те ново начало с много добри възможности.",
  "Ще откриеш любимо място, на което ще искаш да се връщаш.",
  "Ще има повече вечери с вкусна храна и добра компания.",
  "Ще научиш нещо ново, което ще ти носи радост.",
  "Ще получиш подкрепа, когато най-много ти трябва.",
  "Очаква те повод да вдигнеш наздравица.",
  "Ще намериш смелост за решение, което отлагаш.",
  "Едно спонтанно приключение ще стане любим спомен.",
  "Ще имаш повече сутрини, в които да не бързаш.",
  "Ще направиш нечий ден по-хубав с малък жест.",
  "Предстои ти година, пълна с истории за разказване."
];
const envelope = document.querySelector("#envelope");
const card = document.querySelector("#card");
const picture = document.querySelector("#picture");
const sample = document.querySelector("#sample");
const status = document.querySelector("#status");
const next = document.querySelector("#next");
const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
let state = { remaining: [], last: null };

function drawNumber() {
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

  return number;
}

function createSnow() {
  const snow = document.querySelector(".snow");
  for (let i = 0; i < 38; i++) {
    const flake = document.createElement("span");
    const duration = 8 + Math.random() * 12;
    flake.className = "flake";
    flake.textContent = i % 3 ? "•" : "❄";
    flake.style.setProperty("--left", Math.random() * 100 + "%");
    flake.style.setProperty("--size", .45 + Math.random() * .85 + "rem");
    flake.style.setProperty("--opacity", .25 + Math.random() * .55);
    flake.style.setProperty("--duration", duration + "s");
    flake.style.setProperty("--delay", -Math.random() * duration + "s");
    flake.style.setProperty("--drift", (Math.random() - .5) * 18 + "vw");
    snow.append(flake);
  }
}

function loadPicture(number) {
  return new Promise(resolve => {
    const timeout = setTimeout(() => finish(false), 12000);
    function finish(loaded) {
      clearTimeout(timeout);
      picture.onload = null;
      picture.onerror = null;
      resolve(loaded);
    }
    picture.onload = () => finish(true);
    picture.onerror = () => finish(false);
    picture.alt = "Коледно късметче " + number;
    picture.src = "images/" + String(number).padStart(2, "0") + ".jpg";
  });
}

let opening = false;
async function openFortune() {
  if (opening) return;
  opening = true;
  const number = drawNumber();
  next.disabled = true;
  card.hidden = true;
  envelope.hidden = motion.matches;
  status.textContent = "Късметчето се отваря…";

  const minimumDelay = new Promise(resolve => setTimeout(resolve, motion.matches ? 0 : 1280));
  const [loaded] = await Promise.all([demoMode ? true : loadPicture(number), minimumDelay]);

  envelope.hidden = true;
  if (loaded) {
    sample.textContent = demoMode ? wishes[number - 1] : "";
    sample.hidden = !demoMode;
    picture.hidden = demoMode;
    card.hidden = false;
    status.textContent = demoMode ? "Демо късметче" : "";
  } else {
    status.textContent = "Късметчето не се зареди. Можеш да отвориш друго.";
  }
  next.disabled = false;
  opening = false;
}

createSnow();
next.addEventListener("click", openFortune);
window.addEventListener("pageshow", event => {
  if (event.persisted) openFortune();
});
openFortune();
