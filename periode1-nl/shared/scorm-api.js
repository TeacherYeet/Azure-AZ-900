/* =========================================================
   scorm-api.js
   Minimal SCORM 1.2 wrapper for a MULTI-PAGE reference course
   packaged as a single SCO.

   IMPORTANT DESIGN NOTE: this SCO covers dozens of pages (a
   whole periode). We deliberately never report
   cmi.core.lesson_status = "completed" from here — finishing
   one quiz or flashcard deck does not mean the whole periode
   is done, and SCORM players (including Canvas's built-in
   SCORM tool) show a blocking "already completed / restart?"
   splash screen instead of the content once a SCO is marked
   complete. That splash was breaking normal repeat visits to
   this course, so completion reporting was removed entirely.
   The SCO only reports "incomplete" (i.e. "started") once, for
   basic access tracking, and otherwise just initializes/closes
   the SCORM session cleanly.

   ROCScorm.markComplete() is kept as a no-op-for-SCORM function
   (called by quiz-engine.js, flashcards.js, and the worksheet
   pages) purely to reveal the small local "✓ saved" UI note —
   it does NOT write anything back to the LMS.
   ========================================================= */

(function (global) {
  "use strict";

  var API = null;

  function findAPI(win) {
    var attempts = 0;
    while (win.API == null && win.parent != null && win.parent !== win && attempts < 10) {
      attempts++;
      win = win.parent;
    }
    return win.API || null;
  }

  function getAPI() {
    if (API) return API;
    try {
      if (window.API) { API = window.API; return API; }
      if (window.parent && window.parent !== window) {
        API = findAPI(window.parent);
        if (API) return API;
      }
      if (window.top && window.top.opener) {
        API = findAPI(window.top.opener);
      }
    } catch (e) {
      /* cross-origin or no LMS present — fine, we degrade gracefully */
    }
    return API;
  }

  var state = {
    initialized: false
  };

  function init() {
    var api = getAPI();
    if (!api) {
      // No SCORM runtime found (e.g. previewing the file directly, or
      // hosted as a plain Canvas page instead of a SCORM item).
      // Fail silently — the page still works fine on its own.
      return false;
    }
    try {
      var result = api.LMSInitialize("");
      state.initialized = (result === "true" || result === true);
      if (state.initialized) {
        var status = api.LMSGetValue("cmi.core.lesson_status");
        // Only ever move "not attempted" -> "incomplete" (started).
        // Never set "completed" here — see design note above.
        if (status === "not attempted" || status === "") {
          api.LMSSetValue("cmi.core.lesson_status", "incomplete");
          api.LMSCommit("");
        }
      }
    } catch (e) { /* ignore */ }
    return state.initialized;
  }

  function markComplete() {
    // Local UI confirmation only — intentionally does not touch SCORM
    // completion status. See design note at the top of this file.
    var note = document.querySelector("[data-completion-note]");
    if (note) note.hidden = false;
  }

  function finish() {
    var api = getAPI();
    if (!api) return;
    try {
      api.LMSCommit("");
      api.LMSFinish("");
    } catch (e) { /* ignore */ }
  }

  window.addEventListener("load", init);
  window.addEventListener("beforeunload", finish);

  global.ROCScorm = {
    init: init,
    markComplete: markComplete,
    finish: finish
  };
})(window);
