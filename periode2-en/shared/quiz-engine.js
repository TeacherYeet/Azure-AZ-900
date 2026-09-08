/* =========================================================
   quiz-engine.js
   Self-contained, instant-feedback multiple choice quiz.
   No server, no gradebook reporting (by design).

   Usage in a page:
   <div class="quiz-block" id="quiz-1"></div>
   <script>
     ROCQuiz.render("quiz-1", {
       title: "Check je begrip",
       passLabel: "Mooi gedaan!",       // NL or EN copy, per page
       retryLabel: "Bekijk de uitleg en probeer het nog eens.",
       checkLabel: "Controleer antwoorden",
       resetLabel: "Opnieuw proberen",
       questions: [
         {
           text: "Wat betekent IaaS?",
           options: ["Infrastructure as a Service", "Internet as a Service", "..."],
           correct: 0,
           explanation: "IaaS staat voor Infrastructure as a Service ..."
         },
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

    var questions = config.questions || [];
    var checkLabel = config.checkLabel || "Check answers";
    var resetLabel = config.resetLabel || "Try again";
    var passLabel = config.passLabel || "Nice work!";
    var retryLabel = config.retryLabel || "Review the explanations and try again.";
    var title = config.title || "Check your understanding";

    var html = '<div class="quiz-block-header"><h3>' + escapeHtml(title) + '</h3></div>';
    html += '<div class="quiz-progress">' + questions.length + (questions.length === 1 ? " question" : " questions") + ' &middot; instant feedback, not graded</div>';

    questions.forEach(function (q, qi) {
      html += '<div class="quiz-question" data-qindex="' + qi + '">';
      html += '<div class="qtext">' + (qi + 1) + ". " + escapeHtml(q.text) + '</div>';
      html += '<div class="qoptions">';
      q.options.forEach(function (opt, oi) {
        html += '<label class="quiz-option" data-oi="' + oi + '">' +
          '<input type="radio" name="q' + qi + '_' + containerId + '" value="' + oi + '"> ' +
          '<span>' + escapeHtml(opt) + '</span></label>';
      });
      html += '</div>';
      if (q.explanation) {
        html += '<div class="quiz-explanation" data-explanation>' + escapeHtml(q.explanation) + '</div>';
      }
      html += '</div>';
    });

    html += '<div class="quiz-result" data-result></div>';
    html += '<div class="worksheet-actions">' +
      '<button type="button" class="btn btn-primary" data-check>' + escapeHtml(checkLabel) + '</button>' +
      '<button type="button" class="btn btn-secondary" data-reset hidden>' + escapeHtml(resetLabel) + '</button>' +
      '</div>';

    el.innerHTML = html;

    var checkBtn = el.querySelector("[data-check]");
    var resetBtn = el.querySelector("[data-reset]");
    var resultBox = el.querySelector("[data-result]");

    checkBtn.addEventListener("click", function () {
      var allAnswered = true;
      var correctCount = 0;

      questions.forEach(function (q, qi) {
        var qEl = el.querySelector('[data-qindex="' + qi + '"]');
        var checked = qEl.querySelector('input[type="radio"]:checked');
        var optionLabels = qEl.querySelectorAll(".quiz-option");
        var explEl = qEl.querySelector("[data-explanation]");

        if (!checked) { allAnswered = false; return; }

        var chosen = parseInt(checked.value, 10);
        optionLabels.forEach(function (label, oi) {
          label.classList.add("disabled");
          label.querySelector("input").disabled = true;
          if (oi === q.correct) label.classList.add("correct");
          else if (oi === chosen) label.classList.add("incorrect");
        });

        if (chosen === q.correct) correctCount++;
        if (explEl) explEl.classList.add("show");
      });

      if (!allAnswered) {
        resultBox.textContent = (config.incompleteLabel || "Please answer every question first.");
        resultBox.className = "quiz-result show retry";
        return;
      }

      var pct = Math.round((correctCount / questions.length) * 100);
      var passed = pct >= (config.passThreshold || 70);

      resultBox.textContent = correctCount + " / " + questions.length + " (" + pct + "%) — " + (passed ? passLabel : retryLabel);
      resultBox.className = "quiz-result show " + (passed ? "pass" : "retry");

      checkBtn.hidden = true;
      resetBtn.hidden = false;

      if (global.ROCScorm) global.ROCScorm.markComplete();
    });

    resetBtn.addEventListener("click", function () {
      render(containerId, config);
    });
  }

  function escapeHtml(str) {
    var div = document.createElement("div");
    div.textContent = str == null ? "" : String(str);
    return div.innerHTML;
  }

  global.ROCQuiz = { render: render };
})(window);
