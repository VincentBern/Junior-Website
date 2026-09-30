/* Diagnostic flow — shared by fr/diagnostic.html and en/diagnostic.html.
 *
 * choose → info → questions (one dimension per page) → review → generating → report
 *
 * Questions come from diagnostic-questions/{fr,en}.js (generated from the
 * Junior repo, see scripts/sync-diagnostic-content.py). Submission goes to
 * server-remote's public POST /diagnostics/report, which scores the answers
 * deterministically and writes the narrative report. Single respondent only —
 * that's all the endpoint supports. No payment gate yet (roadmap §16).
 *
 * Page strings live in window.JUNIOR_DIAGNOSTIC_I18N, defined by each page.
 */
(function(){
  "use strict";

  var T = window.JUNIOR_DIAGNOSTIC_I18N;
  var CONTENT = window.JUNIOR_DIAGNOSTIC_CONTENT;
  var LANG = document.documentElement.lang || "fr";

  var API_BASE = (location.hostname === "localhost" || location.hostname === "127.0.0.1")
    ? "http://localhost:8787"
    : "https://api.junior.coach";
  var REQUEST_TIMEOUT_MS = 5 * 60 * 1000;

  var OFFERS = {
    strategique: { key: "diagnostic-strategique-v2", parts: ["strategique"] },
    commercialisation: { key: "diagnostic-commercialisation-v3", parts: ["commercialisation"] },
    double: { key: "diagnostic-double-v1", parts: ["strategique", "commercialisation"] }
  };
  // diagnostic-double-v1 answer ids are prefixed per volet ("S-Q1", "C-Q1").
  var DOUBLE_PREFIX = { strategique: "S-", commercialisation: "C-" };

  // Closed testing: server-remote rejects any request without the tester
  // access code (DIAGNOSTIC_ACCESS_CODE). Testers type it once; it's kept on
  // this device and sent as a header — never written into the page source.
  var ACCESS_HEADER = "x-diagnostic-access-code";
  var ACCESS_KEY = "junior_diagnostic_access_v1";

  var DRAFT_KEY = "junior_diagnostic_draft_v2";
  var REPORT_KEY = "junior_diagnostic_report_v2";
  var LEGACY_KEYS = ["diagnostic_draft_offer", "diagnostic_draft_buyer", "diagnostic_draft_respondents"];

  // ---------- storage ----------
  function load(key){
    try { var raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : null; }
    catch (e) { return null; }
  }
  function store(key, value){
    try {
      if (value === null) localStorage.removeItem(key);
      else localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {}
  }
  LEGACY_KEYS.forEach(function(k){ store(k, null); });

  function emptyDraft(){
    return { offer: null, participant: { name: "", title: "", company: "" }, answers: {}, notes: {}, view: "choose", page: 0 };
  }
  var draft = Object.assign(emptyDraft(), load(DRAFT_KEY) || {});
  if (draft.offer && !OFFERS[draft.offer]) draft = emptyDraft();
  var report = load(REPORT_KEY);
  var accessCode = load(ACCESS_KEY);
  function saveDraft(){ store(DRAFT_KEY, draft); }

  function track(name, data){
    try { if (window.umami && window.umami.track) window.umami.track(name, data); } catch (e) {}
  }

  // ---------- helpers ----------
  function $(sel, root){ return (root || document).querySelector(sel); }
  function $all(sel, root){ return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function el(tag, attrs, children){
    var node = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function(k){
      if (k === "text") node.textContent = attrs[k];
      else if (k === "class") node.className = attrs[k];
      else if (k.slice(0, 2) === "on") node.addEventListener(k.slice(2), attrs[k]);
      else node.setAttribute(k, attrs[k]);
    });
    (children || []).forEach(function(c){ if (c) node.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
    return node;
  }
  function answerKey(part, qid){ return part + ":" + qid; }

  // One page per dimension, across every part of the chosen offer.
  function pagesFor(offer){
    var pages = [];
    OFFERS[offer].parts.forEach(function(part){
      CONTENT[part].dimensions.forEach(function(dim){ pages.push({ part: part, dim: dim }); });
    });
    return pages;
  }
  function questionCount(offer){
    return pagesFor(offer).reduce(function(n, p){ return n + p.dim.questions.length; }, 0);
  }
  function answeredIn(page){
    return page.dim.questions.filter(function(q){ return draft.answers[answerKey(page.part, q.id)]; }).length;
  }
  function answeredTotal(){
    return pagesFor(draft.offer).reduce(function(n, p){ return n + answeredIn(p); }, 0);
  }

  // ---------- view switching (with browser back/forward) ----------
  var currentView = null;
  var busy = false;

  function show(view, opts){
    opts = opts || {};
    currentView = view;
    $all("[data-view]").forEach(function(sec){ sec.hidden = sec.getAttribute("data-view") !== view; });
    if (["choose", "info", "questions", "review"].indexOf(view) !== -1) {
      draft.view = view;
      saveDraft();
    }
    updateRail();
    if (!opts.fromHistory) {
      var state = { view: view, page: draft.page };
      if (opts.replace) history.replaceState(state, "");
      else history.pushState(state, "");
    }
    if (!opts.keepScroll) window.scrollTo(0, 0);
  }

  window.addEventListener("popstate", function(e){
    if (busy) { history.pushState({ view: "generating" }, ""); return; }
    var s = e.state;
    if (!s || !s.view) return;
    if (!accessCode && s.view !== "report") { showAccess(); return; }
    if (s.view === "report" && !report) return;
    if (s.view === "questions") { draft.page = s.page || 0; renderQuestions(); }
    if (s.view === "review") renderReview();
    if (s.view === "info") renderInfo();
    if (s.view === "report") renderReport();
    show(s.view, { fromHistory: true });
  });

  function updateRail(){
    var rail = $("#progress-rail span");
    if (!rail) return;
    var pct = 0;
    if (draft.offer && (currentView === "questions" || currentView === "review")) {
      pct = Math.round(answeredTotal() / questionCount(draft.offer) * 100);
    }
    if (currentView === "generating" || currentView === "report") pct = 100;
    rail.style.width = pct + "%";
  }

  // ---------- choose ----------
  function renderChoose(){
    $all(".offer-card").forEach(function(card){
      card.classList.toggle("selected", card.getAttribute("data-offer") === draft.offer);
    });
  }
  $all(".offer-card").forEach(function(card){
    card.addEventListener("click", function(){
      chooseOffer(card.getAttribute("data-offer"));
    });
  });
  function chooseOffer(offer){
    if (draft.offer !== offer) { draft.page = 0; }
    draft.offer = offer;
    saveDraft();
    track("diagnostic_offer", { offer: offer });
    renderInfo();
    show("info");
  }

  // ---------- info ----------
  var FIELDS = ["name", "title", "company"];
  FIELDS.forEach(function(f){
    var input = $("#p-" + f);
    input.addEventListener("input", function(){
      draft.participant[f] = input.value;
      input.closest(".field").classList.remove("invalid");
      saveDraft();
    });
  });
  function renderInfo(){
    $("#chosen-offer").textContent = T.offerTitle[draft.offer];
    $("#chosen-meta").textContent = T.offerMeta[draft.offer];
    FIELDS.forEach(function(f){ $("#p-" + f).value = draft.participant[f] || ""; });
  }
  $("#change-offer").addEventListener("click", function(){ renderChoose(); show("choose"); });
  $("#info-back").addEventListener("click", function(){ renderChoose(); show("choose"); });
  $("#info-form").addEventListener("submit", function(e){
    e.preventDefault();
    var firstInvalid = null;
    FIELDS.forEach(function(f){
      var input = $("#p-" + f);
      var ok = (draft.participant[f] || "").trim().length > 0;
      input.closest(".field").classList.toggle("invalid", !ok);
      if (!ok && !firstInvalid) firstInvalid = input;
    });
    if (firstInvalid) { firstInvalid.focus(); return; }
    track("diagnostic_start", { offer: draft.offer });
    renderQuestions();
    show("questions");
  });

  // ---------- questions ----------
  function scaleBucket(v){ return T.scale[Math.min(4, Math.ceil(v / 2) - 1)]; }

  function renderQuestions(){
    var pages = pagesFor(draft.offer);
    if (draft.page >= pages.length || draft.page < 0) draft.page = 0;
    var page = pages[draft.page];
    var multiPart = OFFERS[draft.offer].parts.length > 1;

    // header
    var eyebrow = $("#q-eyebrow");
    eyebrow.innerHTML = "";
    if (multiPart) eyebrow.appendChild(el("span", { class: "part", text: T.partLabel[page.part] + " ·" }));
    eyebrow.appendChild(document.createTextNode(" " + T.dimensionOf(draft.page + 1, pages.length)));
    $("#q-title").textContent = page.dim.title;
    $("#q-subtitle").textContent = page.dim.subtitle;
    $("#q-desc").textContent = page.dim.description;

    // dimension stepper
    var steps = $("#dim-steps");
    steps.innerHTML = "";
    pages.forEach(function(p, i){
      var done = answeredIn(p) === p.dim.questions.length;
      var label = (multiPart ? DOUBLE_PREFIX[p.part] : "") + p.dim.id;
      var btn = el("button", {
        type: "button",
        class: (done ? "done " : "") + (i === draft.page ? "current " : "") + (i > 0 && pages[i - 1].part !== p.part ? "part-break" : ""),
        "aria-label": T.goToDimension(p.dim.title, answeredIn(p), p.dim.questions.length),
        title: p.dim.title,
        text: label,
        onclick: function(){ goToPage(i); }
      });
      if (i === draft.page) btn.setAttribute("aria-current", "step");
      steps.appendChild(btn);
    });

    // questions
    var list = $("#q-list");
    list.innerHTML = "";
    page.dim.questions.forEach(function(q){ list.appendChild(renderQuestion(page.part, q, multiPart)); });

    $("#q-error").classList.remove("show");
    $("#q-prev").textContent = draft.page === 0 ? T.backToInfo : T.prev;
    $("#q-next").textContent = draft.page === pages.length - 1 ? T.toReview : T.next;
  }

  function renderQuestion(part, q, multiPart){
    var key = answerKey(part, q.id);
    var value = draft.answers[key] || null;
    var inputName = "q-" + part + "-" + q.id;
    var labelId = inputName + "-label";

    var picked = el("span", { class: "picked", "aria-live": "polite" });
    function setPicked(v){
      picked.textContent = v ? T.picked(v, scaleBucket(v).label) : "";
    }
    setPicked(value);

    var scale = el("div", { class: "scale", role: "radiogroup", "aria-labelledby": labelId });
    for (var i = 1; i <= 10; i++) {
      (function(v){
        var input = el("input", { type: "radio", name: inputName, value: String(v), "aria-label": v + " — " + scaleBucket(v).label });
        if (value === v) input.checked = true;
        input.addEventListener("change", function(){
          draft.answers[key] = v;
          saveDraft();
          setPicked(v);
          wrap.classList.remove("missing");
          refreshMissingError();
          refreshStepper();
          updateRail();
        });
        scale.appendChild(el("label", null, [input, el("span", { text: String(v), "aria-hidden": "true" })]));
      })(i);
    }

    var note = draft.notes[key] || "";
    var textarea = el("textarea", { id: inputName + "-note", rows: "3", placeholder: T.notePlaceholder });
    textarea.value = note;
    textarea.addEventListener("input", function(){
      if (textarea.value.trim()) draft.notes[key] = textarea.value;
      else delete draft.notes[key];
      saveDraft();
    });
    var noteBox = el("div", { class: "note-box" }, [
      el("label", { class: "mono", for: textarea.id, style: "font-size:.64rem;color:var(--graphite);display:block;margin-bottom:.35rem", text: T.noteLabel }),
      textarea,
      el("small", { text: T.noteHint })
    ]);
    noteBox.hidden = !note;
    var noteToggle = el("button", {
      type: "button", class: "btn-link note-toggle", "aria-expanded": String(!!note), "aria-controls": textarea.id,
      text: note ? T.hideNote : T.addNote,
      onclick: function(){
        noteBox.hidden = !noteBox.hidden;
        noteToggle.setAttribute("aria-expanded", String(!noteBox.hidden));
        noteToggle.textContent = noteBox.hidden ? T.addNote : T.hideNote;
        if (!noteBox.hidden) textarea.focus();
      }
    });

    var why = q.rationale ? el("details", { class: "why" }, [
      el("summary", { text: T.why }),
      el("p", { text: q.rationale })
    ]) : null;

    var wrap = el("article", { class: "question", id: inputName }, [
      el("div", { class: "q-id", text: (multiPart ? DOUBLE_PREFIX[part] : "") + q.id }),
      el("h3", { id: labelId, text: q.title }),
      el("p", { class: "q-text", text: q.text }),
      why,
      scale,
      el("div", { class: "scale-meta" }, [el("span", { text: T.scaleEnds }), picked]),
      noteToggle,
      noteBox
    ]);
    return wrap;
  }

  function refreshMissingError(){
    var err = $("#q-error");
    if (!err.classList.contains("show")) return;
    var n = $all("#q-list .question.missing").length;
    if (n) err.textContent = T.missing(n);
    else err.classList.remove("show");
  }

  function refreshStepper(){
    var pages = pagesFor(draft.offer);
    $all("#dim-steps button").forEach(function(btn, i){
      btn.classList.toggle("done", answeredIn(pages[i]) === pages[i].dim.questions.length);
    });
  }

  function goToPage(i){
    draft.page = i;
    saveDraft();
    renderQuestions();
    show("questions");
  }

  $("#q-prev").addEventListener("click", function(){
    if (draft.page === 0) { renderInfo(); show("info"); }
    else goToPage(draft.page - 1);
  });
  $("#q-next").addEventListener("click", function(){
    var pages = pagesFor(draft.offer);
    var page = pages[draft.page];
    var missing = page.dim.questions.filter(function(q){ return !draft.answers[answerKey(page.part, q.id)]; });
    if (missing.length) {
      missing.forEach(function(q){ $("#q-" + page.part + "-" + q.id).classList.add("missing"); });
      var err = $("#q-error");
      err.textContent = T.missing(missing.length);
      err.classList.add("show");
      var first = $("#q-" + page.part + "-" + missing[0].id);
      first.scrollIntoView({ behavior: "smooth", block: "start" });
      var firstRadio = first.querySelector("input");
      if (firstRadio) firstRadio.focus({ preventScroll: true });
      return;
    }
    if (draft.page < pages.length - 1) goToPage(draft.page + 1);
    else { renderReview(); show("review"); }
  });

  // ---------- review ----------
  function renderReview(){
    var dl = $("#review-summary");
    dl.innerHTML = "";
    [
      [T.review.offer, T.offerTitle[draft.offer]],
      [T.review.participant, draft.participant.name + " — " + draft.participant.title],
      [T.review.company, draft.participant.company],
      [T.review.notes, T.review.notesCount(Object.keys(draft.notes).filter(function(k){
        return OFFERS[draft.offer].parts.indexOf(k.split(":")[0]) !== -1;
      }).length)]
    ].forEach(function(row){
      dl.appendChild(el("dt", { text: row[0] }));
      dl.appendChild(el("dd", { text: row[1] }));
    });

    var list = $("#review-list");
    list.innerHTML = "";
    var pages = pagesFor(draft.offer);
    var multiPart = OFFERS[draft.offer].parts.length > 1;
    var incomplete = 0;
    pages.forEach(function(p, i){
      if (multiPart && (i === 0 || pages[i - 1].part !== p.part)) {
        list.appendChild(el("div", { class: "review-part", text: T.partLabel[p.part] }));
      }
      var n = answeredIn(p), total = p.dim.questions.length;
      if (n < total) incomplete += total - n;
      list.appendChild(el("div", { class: "review-row" }, [
        el("span", { class: "t", text: ((multiPart ? DOUBLE_PREFIX[p.part] : "") + p.dim.id) + " · " + p.dim.title }),
        el("span", { class: "n" + (n < total ? " incomplete" : ""), text: n + " / " + total }),
        el("button", { type: "button", class: "btn-link", text: T.review.edit, onclick: function(){ goToPage(i); } })
      ]));
    });

    var err = $("#submit-error");
    if (incomplete) {
      err.textContent = T.review.incomplete(incomplete);
      err.classList.add("show");
    } else if (!err.dataset.keep) {
      err.classList.remove("show");
    }
    delete err.dataset.keep;
    $("#submit-btn").disabled = incomplete > 0;
  }
  $("#review-back").addEventListener("click", function(){ goToPage(pagesFor(draft.offer).length - 1); });
  $("#review-edit-info").addEventListener("click", function(){ renderInfo(); show("info"); });

  // ---------- submit / generating ----------
  function buildRequest(){
    var offer = OFFERS[draft.offer];
    var multiPart = offer.parts.length > 1;
    var answers = {}, notes = {};
    offer.parts.forEach(function(part){
      var prefix = multiPart ? DOUBLE_PREFIX[part] : "";
      CONTENT[part].dimensions.forEach(function(dim){
        dim.questions.forEach(function(q){
          var k = answerKey(part, q.id);
          answers[prefix + q.id] = draft.answers[k];
          var note = (draft.notes[k] || "").trim();
          if (note) notes[prefix + q.id] = note;
        });
      });
    });
    return {
      diagnosticKey: offer.key,
      participant: {
        name: draft.participant.name.trim(),
        title: draft.participant.title.trim(),
        company: draft.participant.company.trim()
      },
      answers: answers,
      notes: notes
    };
  }

  var genTimer = null;
  function startGeneratingAnimation(){
    var started = Date.now();
    var items = $all("#gen-steps li");
    var thresholds = [0, 2, 7, 20, 60];
    function tick(){
      var s = Math.floor((Date.now() - started) / 1000);
      var active = 0;
      thresholds.forEach(function(t, i){ if (s >= t) active = i; });
      items.forEach(function(li, i){
        li.classList.toggle("done", i < active);
        li.classList.toggle("active", i === active);
      });
      $("#gen-elapsed").textContent = T.gen.elapsed(s);
    }
    tick();
    genTimer = setInterval(tick, 1000);
  }
  function stopGeneratingAnimation(){ clearInterval(genTimer); genTimer = null; }

  function warnBeforeLeave(e){ e.preventDefault(); e.returnValue = ""; return ""; }

  $("#submit-btn").addEventListener("click", function(){
    var body = buildRequest();
    var err = $("#submit-error");
    err.classList.remove("show");
    busy = true;
    window.addEventListener("beforeunload", warnBeforeLeave);
    show("generating");
    startGeneratingAnimation();
    track("diagnostic_submit", { offer: draft.offer });

    var controller = "AbortController" in window ? new AbortController() : null;
    var timeout = setTimeout(function(){ if (controller) controller.abort(); }, REQUEST_TIMEOUT_MS);

    fetch(API_BASE + "/diagnostics/report", {
      method: "POST",
      headers: apiHeaders(accessCode),
      body: JSON.stringify(body),
      signal: controller ? controller.signal : undefined
    })
      .then(function(res){
        return res.json().catch(function(){ return {}; }).then(function(data){
          if (!res.ok) {
            var e = new Error("http_" + res.status);
            e.code = res.status === 401 ? "access_denied" : res.status === 429 ? "rate_limited" : res.status === 400 ? "invalid_request" : "server";
            throw e;
          }
          if (!data || !Array.isArray(data.parts) || typeof data.presentation !== "string") {
            var bad = new Error("bad_response");
            bad.code = "server";
            throw bad;
          }
          return data;
        });
      })
      .then(function(data){
        report = {
          offer: draft.offer,
          participant: body.participant,
          createdAt: new Date().toISOString(),
          response: data
        };
        store(REPORT_KEY, report);
        store(DRAFT_KEY, null);
        draft = emptyDraft();
        track("diagnostic_report", { offer: report.offer });
        renderReport();
        show("report", { replace: true });
      })
      .catch(function(e){
        var code = e && e.code ? e.code : (e && e.name === "AbortError" ? "timeout" : "network");
        track("diagnostic_error", { offer: draft.offer, code: code });
        if (code === "access_denied") {
          // Code rotated or revoked: ask again, answers stay in the draft.
          accessCode = null;
          store(ACCESS_KEY, null);
          showAccess(T.access.expired, { replace: true });
          return;
        }
        renderReview();
        err.textContent = T.errors[code] || T.errors.server;
        err.classList.add("show");
        show("review", { replace: true });
        err.scrollIntoView({ block: "center" });
      })
      .then(function(){
        clearTimeout(timeout);
        stopGeneratingAnimation();
        busy = false;
        window.removeEventListener("beforeunload", warnBeforeLeave);
      });
  });

  // ---------- report ----------
  function levelFor(part, score){
    var levels = CONTENT[part].maturityLevels;
    for (var i = 0; i < levels.length; i++) {
      if (score >= levels[i].min && score <= levels[i].max) return { index: i, level: levels[i] };
    }
    return null;
  }

  function renderReport(){
    var offer = OFFERS[report.offer];
    var res = report.response;

    $("#report-title").textContent = T.offerTitle[report.offer];
    var meta = $("#report-meta");
    meta.innerHTML = "";
    [
      [T.report.participant, report.participant.name + " — " + report.participant.title],
      [T.report.company, report.participant.company],
      [T.report.date, new Date(report.createdAt).toLocaleDateString(LANG === "en" ? "en-CA" : "fr-CA", { year: "numeric", month: "long", day: "numeric" })]
    ].forEach(function(row){
      meta.appendChild(el("dt", { text: row[0] }));
      meta.appendChild(el("dd", { text: row[1] }));
    });

    var scores = $("#report-scores");
    scores.innerHTML = "";
    res.parts.forEach(function(partRes, i){
      var part = offer.parts[i] || offer.parts[0];
      var local = CONTENT[part];
      var lvl = levelFor(part, partRes.scoreNormalized);
      var track = el("div", { class: "maturity-track", "aria-hidden": "true" });
      local.maturityLevels.forEach(function(_, j){ track.appendChild(el("i", { class: lvl && lvl.index === j ? "on" : "" })); });

      var total = el("div", { class: "score-total" }, [
        el("span", { class: "lbl", text: T.report.globalScore }),
        el("div", { class: "big" }, [String(partRes.scoreNormalized), el("small", { text: "/100" })]),
        el("span", { class: "raw", text: T.report.points(partRes.scoreRaw, partRes.scoreMax) }),
        el("div", { class: "level", text: lvl ? lvl.level.label : partRes.maturityLevel }),
        track,
        lvl && lvl.level.description ? el("p", { class: "level-desc", text: lvl.level.description }) : null
      ]);

      var bars = el("div", { class: "dim-bars" });
      partRes.dimensions.forEach(function(d){
        var dimId = String(d.id).replace(/^[SC]-/, "");
        var localDim = local.dimensions.filter(function(x){ return x.id === dimId; })[0];
        var pct = Math.max(0, Math.min(100, Number(d.pct) || 0));
        bars.appendChild(el("div", { class: "dim-bar c-" + d.color }, [
          el("div", { class: "top" }, [
            el("span", { text: localDim ? localDim.title : d.title }),
            el("span", { class: "v", text: d.scoreRaw + "/" + d.scoreMax + " · " + pct + " %" })
          ]),
          el("div", { class: "track", role: "img", "aria-label": (localDim ? localDim.title : d.title) + " : " + pct + " %" }, [
            el("span", { class: "fill", style: "width:" + pct + "%" }),
            el("span", { class: "ticks" })
          ])
        ]));
      });

      scores.appendChild(el("section", { class: "score-part" }, [
        el("p", { class: "eyebrow", text: local.title }),
        el("div", { class: "score-card" }, [total, bars])
      ]));
    });

    var legend = el("div", { class: "legend", "aria-hidden": "true" });
    T.report.legend.forEach(function(item){ legend.appendChild(el("span", { class: "c-" + item[0], text: item[1] })); });
    scores.appendChild(legend);

    var pres = $("#report-presentation");
    if (window.marked && window.DOMPurify) {
      pres.innerHTML = window.DOMPurify.sanitize(window.marked.parse(res.presentation));
    } else {
      pres.innerHTML = "";
      pres.appendChild(el("div", { style: "white-space:pre-wrap", text: res.presentation }));
    }
    $("#report-truncated").hidden = !res.truncated;
  }

  $("#print-btn").addEventListener("click", function(){ window.print(); });
  $("#restart-btn").addEventListener("click", function(){
    if (!window.confirm(T.confirmRestart)) return;
    report = null;
    store(REPORT_KEY, null);
    draft = emptyDraft();
    saveDraft();
    if (!accessCode) { showAccess(); return; }
    renderChoose();
    show("choose");
  });

  // ---------- access code ----------
  function apiHeaders(code){
    var h = { "content-type": "application/json" };
    h[ACCESS_HEADER] = code;
    return h;
  }

  function showAccess(message, opts){
    var err = $("#access-error");
    err.textContent = message || "";
    err.classList.toggle("show", !!message);
    $("#access-code").value = "";
    show("access", opts);
    $("#access-code").focus();
  }

  // Checks a code without spending an LLM call: an empty body with a valid
  // code gets past the access check and fails validation (400); a bad code
  // gets 401. Anything other than 401 (400, or 429 if rate-limited) means the
  // code itself was accepted.
  $("#access-form").addEventListener("submit", function(e){
    e.preventDefault();
    var code = $("#access-code").value.trim();
    var err = $("#access-error");
    var btn = $("#access-submit");
    if (!code) { err.textContent = T.access.empty; err.classList.add("show"); return; }
    err.classList.remove("show");
    btn.disabled = true;
    fetch(API_BASE + "/diagnostics/report", { method: "POST", headers: apiHeaders(code), body: "{}" })
      .then(function(res){
        if (res.status === 401) {
          err.textContent = T.access.invalid;
          err.classList.add("show");
          track("diagnostic_access_denied");
          return;
        }
        accessCode = code;
        store(ACCESS_KEY, code);
        track("diagnostic_access_granted");
        route();
      })
      .catch(function(){
        err.textContent = T.access.network;
        err.classList.add("show");
      })
      .then(function(){ btn.disabled = false; });
  });

  // ---------- boot ----------
  var params = new URLSearchParams(location.search);
  var preselect = params.get("offre") || params.get("offer");

  function route(){
    if (report && report.response) {
      renderReport();
      show("report", { replace: true });
    } else if (!accessCode) {
      showAccess(null, { replace: true });
    } else {
      resume();
    }
  }

  function resume(){
    if (preselect && OFFERS[preselect] && !draft.offer) {
      renderChoose();
      history.replaceState({ view: "choose" }, "");
      chooseOffer(preselect);
    } else if (draft.offer && draft.view !== "choose") {
      renderInfo();
      if (draft.view === "questions") renderQuestions();
      if (draft.view === "review") renderReview();
      show(draft.view, { replace: true });
    } else {
      renderChoose();
      show("choose", { replace: true });
    }
  }

  route();
})();
