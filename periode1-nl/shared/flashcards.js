/* =========================================================
   flashcards.js
   Simple flip-card deck viewer.

   Usage:
   <div id="deck-1"></div>
   <script>
     ROCFlashcards.render("deck-1", {
       hint: "Klik op de kaart om de betekenis te zien.",
       cards: [
         { term: "IaaS", def: "Infrastructure as a Service — ..." },
         ...
       ]
     });
   </script>
   ========================================================= */

(function (global) {
  "use strict";

  function render(containerId, config) {
    var el = document.getElementById(containerId);
    if (!el) return;

    var cards = (config.cards || []).slice();
    var order = cards.map(function (_, i) { return i; });
    var idx = 0;
    var flipped = false;
    var seenAny = false;

    var hint = config.hint || "Click the card to reveal the answer.";
    var prevLabel = config.prevLabel || "Previous";
    var nextLabel = config.nextLabel || "Next";
    var shuffleLabel = config.shuffleLabel || "Shuffle";

    el.innerHTML =
      '<div class="flashcard-wrap">' +
      '<div class="flashcard-hint">' + escapeHtml(hint) + '</div>' +
      '<div class="flashcard" tabindex="0" role="button" aria-label="' + escapeHtml(hint) + '">' +
      '  <div class="flashcard-inner">' +
      '    <div class="flashcard-face flashcard-front" data-front></div>' +
      '    <div class="flashcard-face flashcard-back" data-back></div>' +
      '  </div>' +
      '</div>' +
      '<div class="flashcard-controls">' +
      '  <button type="button" class="btn btn-secondary" data-prev>&larr; ' + escapeHtml(prevLabel) + '</button>' +
      '  <span class="flashcard-counter" data-counter></span>' +
      '  <button type="button" class="btn btn-secondary" data-next>' + escapeHtml(nextLabel) + ' &rarr;</button>' +
      '  <button type="button" class="btn btn-ghost" data-shuffle>&#8635; ' + escapeHtml(shuffleLabel) + '</button>' +
      '</div>' +
      '</div>';

    var cardEl = el.querySelector(".flashcard");
    var frontEl = el.querySelector("[data-front]");
    var backEl = el.querySelector("[data-back]");
    var counterEl = el.querySelector("[data-counter]");

    function paint() {
      var c = cards[order[idx]];
      frontEl.textContent = c.term;
      backEl.textContent = c.def;
      counterEl.textContent = (idx + 1) + " / " + cards.length;
      cardEl.classList.remove("flipped");
      flipped = false;
    }

    function flip() {
      flipped = !flipped;
      cardEl.classList.toggle("flipped", flipped);
      if (flipped && !seenAny) {
        seenAny = true;
        if (global.ROCScorm) global.ROCScorm.markComplete();
      }
    }

    cardEl.addEventListener("click", flip);
    cardEl.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); flip(); }
    });

    el.querySelector("[data-prev]").addEventListener("click", function () {
      idx = (idx - 1 + cards.length) % cards.length;
      paint();
    });
    el.querySelector("[data-next]").addEventListener("click", function () {
      idx = (idx + 1) % cards.length;
      paint();
    });
    el.querySelector("[data-shuffle]").addEventListener("click", function () {
      for (var i = order.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = order[i]; order[i] = order[j]; order[j] = tmp;
      }
      idx = 0;
      paint();
    });

    paint();
  }

  function escapeHtml(str) {
    var div = document.createElement("div");
    div.textContent = str == null ? "" : String(str);
    return div.innerHTML;
  }

  global.ROCFlashcards = { render: render };
})(window);
