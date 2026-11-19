/* =====================================================================
   USTAWIENIA GRY — EDYTUJ TYLKO TĘ CZĘŚĆ.
   Każde zadanie ma: id (nie zmieniaj w trakcie gry), nazwa, tresc, odpowiedzi.
   W "odpowiedzi" możesz podać jedną lub kilka poprawnych odpowiedzi.
   Nie ma znaczenia wielkość liter ani spacje na początku i na końcu.
   ===================================================================== */

const USTAWIENIA = {
  // Zmień identyfikator gry, jeśli robisz nową edycję i chcesz wyczyścić
  // zapamiętane postępy graczy z poprzedniej edycji.
  idGry: "tajemnica-korony-v1",

  miejsceUkryciaKorony: "STARA WIEŻA", // <-- ZMIEŃ TEKST FINAŁOWY

  zadania: [
    {
      id: "zadanie-a",
      nazwa: "Królewski dekret",
      tresc: "W archiwum odnaleziono tajemniczy dekret. Odszyfruj wiadomość i wpisz hasło, które skrywa.",
      odpowiedzi: ["KRÓL"]
    },
    {
      id: "zadanie-b",
      nazwa: "Pieczęć strażnika",
      tresc: "Strażnik pozostawił wskazówkę w swojej pieczęci. Rozwiąż zagadkę i wpisz odpowiedź.",
      odpowiedzi: ["ZAMEK"]
    },
    {
      id: "zadanie-c",
      nazwa: "Zaginiony manuskrypt",
      tresc: "Odnajdź brakujący fragment manuskryptu. Jaki wyraz otwiera kolejną drogę?",
      odpowiedzi: ["MAPA"]
    },
    {
      id: "zadanie-d",
      nazwa: "Próba rycerza",
      tresc: "Podejmij wyzwanie rycerza i odkryj ukryte hasło.",
      odpowiedzi: ["MIECZ"]
    },
    {
      id: "zadanie-e",
      nazwa: "Sekret alchemika",
      tresc: "Alchemik pozostawił zaszyfrowany przepis. Odczytaj sekretne słowo.",
      odpowiedzi: ["ELIKSIR"]
    },
    {
      id: "zadanie-f",
      nazwa: "Ostatnia przepowiednia",
      tresc: "Przepowiednia wskaże ostatni trop. Rozwiąż ją, aby odkryć miejsce ukrycia korony.",
      odpowiedzi: ["KORONA"]
    }
  ]
};

/* =====================================================================
   LOGIKA STRONY — PONIŻEJ NIC NIE TRZEBA ZMIENIAĆ.
   Postęp zapisuje się na TYM SAMYM urządzeniu i w TEJ SAMEJ przeglądarce.
   ===================================================================== */

const storageKey = `questworld-postep-${USTAWIENIA.idGry}`;
const tasksElement = document.getElementById("tasks");
const completedCount = document.getElementById("completed-count");
const progressTrack = document.getElementById("progress-track");
const progressFill = document.getElementById("progress-fill");
const progressNote = document.getElementById("progress-note");
const finalMessage = document.getElementById("final-message");
const finalLocationText = document.getElementById("final-location-text");

function loadProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || "[]");
    return new Set(Array.isArray(saved) ? saved.filter(id => USTAWIENIA.zadania.some(z => z.id === id)) : []);
  } catch (error) {
    return new Set();
  }
}

const completed = loadProgress();

function saveProgress() {
  try {
    localStorage.setItem(storageKey, JSON.stringify([...completed]));
  } catch (error) {
    // Gdy przeglądarka blokuje localStorage, gra działa dalej bez zapisu.
    console.warn("Nie można zapisać postępu w tej przeglądarce.", error);
  }
}

function normalize(value) {
  return String(value).normalize("NFC").trim().replace(/\s+/g, " ").toLocaleLowerCase("pl-PL");
}

function updateProgress() {
  const total = USTAWIENIA.zadania.length;
  const done = completed.size;
  completedCount.textContent = done;
  const countDenominator = document.querySelector(".progress-count span");
  countDenominator.textContent = ` / ${total}`;
  progressTrack.setAttribute("aria-valuemax", String(total));
  progressTrack.setAttribute("aria-valuenow", String(done));
  progressFill.style.width = `${total ? done / total * 100 : 0}%`;
  progressNote.textContent = done === total
    ? "Wszystkie zagadki rozwiązane. Korona czeka na odkrycie!"
    : `Pozostało do rozwiązania: ${total - done} ${total - done === 1 ? "zagadka" : (total - done >= 2 && total - done <= 4 ? "zagadki" : "zagadek")}.`;
  finalMessage.hidden = done !== total;
  finalLocationText.textContent = USTAWIENIA.miejsceUkryciaKorony;
}

function renderTasks() {
  tasksElement.replaceChildren();

  USTAWIENIA.zadania.forEach(task => {
    const isDone = completed.has(task.id);
    const card = document.createElement("article");
    card.className = `task${isDone ? " is-complete" : ""}`;

    // Unikalny identyfikator niezależny od znaków w nazwie zadania.
    const safeId = `opis-${USTAWIENIA.zadania.indexOf(task)}`;
    const top = document.createElement("button");
    top.type = "button";
    top.className = "task-top";
    top.setAttribute("aria-expanded", "false");
    top.setAttribute("aria-controls", safeId);

    const symbol = document.createElement("span");
    symbol.className = "task-symbol";
    symbol.setAttribute("aria-hidden", "true");
    symbol.textContent = isDone ? "✓" : "✧";

    const title = document.createElement("span");
    title.className = "task-title";
    title.textContent = task.nazwa;

    const status = document.createElement("span");
    status.className = "task-status";
    status.textContent = isDone ? "UKOŃCZONE" : "ROZWIŃ";

    const chevron = document.createElement("span");
    chevron.className = "task-chevron";
    chevron.setAttribute("aria-hidden", "true");
    chevron.textContent = "⌄";

    top.append(symbol, title, status, chevron);

    const details = document.createElement("div");
    details.className = "task-details";
    details.id = safeId;
    const inner = document.createElement("div");
    inner.className = "task-details-inner";
    const description = document.createElement("p");
    description.className = "task-description";
    description.textContent = task.tresc;
    inner.append(description);
    details.append(inner);

    top.addEventListener("click", () => {
      const isOpen = card.classList.toggle("is-open");
      top.setAttribute("aria-expanded", String(isOpen));
      if (!completed.has(task.id)) status.textContent = isOpen ? "ZWIŃ" : "ROZWIŃ";
    });

    const form = document.createElement("form");
    form.className = "task-answer";
    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = isDone ? "Zadanie rozwiązane" : "Wpisz odpowiedź...";
    input.setAttribute("aria-label", `Odpowiedź: ${task.nazwa}`);
    input.autocomplete = "off";
    input.spellcheck = false;
    input.disabled = isDone;
    const button = document.createElement("button");
    button.type = "submit";
    button.textContent = isDone ? "✓ GOTOWE" : "SPRAWDŹ";
    button.disabled = isDone;
    form.append(input, button);

    const feedback = document.createElement("p");
    feedback.className = `task-feedback${isDone ? " success" : ""}`;
    feedback.setAttribute("role", "status");
    feedback.textContent = isDone ? "Poprawna odpowiedź!" : "";

    form.addEventListener("submit", event => {
      event.preventDefault();
      if (completed.has(task.id)) return;
      const validAnswers = Array.isArray(task.odpowiedzi) ? task.odpowiedzi : [task.odpowiedzi];
      if (validAnswers.some(answer => normalize(answer) === normalize(input.value))) {
        completed.add(task.id);
        saveProgress();
        card.classList.add("is-complete");
        symbol.textContent = "✓";
        status.textContent = "UKOŃCZONE";
        input.value = "";
        input.placeholder = "Zadanie rozwiązane";
        input.disabled = true;
        button.disabled = true;
        button.textContent = "✓ GOTOWE";
        feedback.classList.add("success");
        feedback.textContent = "Poprawna odpowiedź!";
        updateProgress();
        if (completed.size === USTAWIENIA.zadania.length) {
          finalMessage.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      } else {
        feedback.classList.remove("success");
        feedback.textContent = input.value.trim() ? "To nie jest poprawna odpowiedź. Spróbuj ponownie." : "Najpierw wpisz odpowiedź.";
      }
    });

    card.append(top, details, form, feedback);
    tasksElement.append(card);
  });
}

renderTasks();
updateProgress();

// TESTOWANIE: aby wyczyścić swój postęp, otwórz konsolę przeglądarki (F12)
// i wpisz: localStorage.removeItem('questworld-postep-tajemnica-korony-v1'); location.reload();
// Zmień końcówkę klucza, jeśli zmienisz idGry w ustawieniach.
