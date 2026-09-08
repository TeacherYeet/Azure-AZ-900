/* =========================================================
   exam-timer.js
   Simple countdown timer bar for the AZ-900 mock exam page.

   Usage:
   <div class="exam-timer-bar"><div class="container">
     <span>AZ-900 Practice Exam</span>
     <span class="timer" data-timer>60:00</span>
   </div></div>
   <script>
     ROCExamTimer.start(60, function() { alert("Time's up!"); });
   </script>
   ========================================================= */

(function (global) {
  "use strict";

  function start(minutes, onTimeUp) {
    var el = document.querySelector("[data-timer]");
    if (!el) return;
    var remaining = Math.round(minutes * 60);

    function paint() {
      var m = Math.floor(remaining / 60);
      var s = remaining % 60;
      el.textContent = (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s;
      if (remaining <= 300) el.classList.add("low");
    }

    paint();
    var handle = setInterval(function () {
      remaining--;
      if (remaining <= 0) {
        remaining = 0;
        paint();
        clearInterval(handle);
        if (typeof onTimeUp === "function") onTimeUp();
        return;
      }
      paint();
    }, 1000);

    return {
      stop: function () { clearInterval(handle); }
    };
  }

  global.ROCExamTimer = { start: start };
})(window);
