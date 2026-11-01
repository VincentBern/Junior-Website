/* The H1 test (Junior repo, roadmap §95): which entry offer a visitor sees.
 *
 * Half the visitors get « Faire mon diagnostic » (variant "diagnostic"),
 * half « Être avisé de l'ouverture » (variant "attente", the waitlist page).
 * The variant is drawn once per browser and kept in localStorage
 * (junior_exp_h1_v1), so a visitor who comes back sees the same offer. No
 * personal data: the variant only rides along on the Umami events.
 *
 * Off until the diagnostic opens: with H1_ACTIVE false nothing is drawn and
 * window.JUNIOR_EXP.h1 is null. Turning the test on is this one line, in its
 * own commit.
 *
 * Before the opening (Luc, 2026-11-01, Junior repo §100): with the test off,
 * every call to action on the homepage leads to the waitlist, and goes back
 * to the diagnostic by itself once the server says the diagnostic is public
 * (GET /diagnostics/access). A failed or slow check keeps the waitlist. The
 * last answer is kept in localStorage (junior_diag_public_v1), so a returning
 * visitor sees the right button before the check answers.
 *
 * On opening day, set DIAGNOSTIC_OPEN to true in its own commit: no more
 * check, no more waitlist, even once the H1 test is over. The memo script
 * (scripts/build-memos.py) reads this switch too.
 */
(function(){
  var H1_ACTIVE = false;
  var DIAGNOSTIC_OPEN = false;
  var H1_KEY = "junior_exp_h1_v1";
  var OPEN_KEY = "junior_diag_public_v1";
  var VARIANTS = ["diagnostic", "attente"];
  var API_BASE = (location.hostname === "localhost" || location.hostname === "127.0.0.1")
    ? "http://localhost:8787"
    : "https://api.junior.coach";

  function load(k){ try { return localStorage.getItem(k); } catch (e) { return null; } }
  function save(k, v){ try { localStorage.setItem(k, v); } catch (e) {} }
  function track(name, data){
    try { if (window.umami && window.umami.track) window.umami.track(name, data); } catch (e) {}
  }

  var variant = null;
  if (H1_ACTIVE) {
    variant = load(H1_KEY);
    if (VARIANTS.indexOf(variant) < 0) {
      variant = Math.random() < 0.5 ? "diagnostic" : "attente";
      save(H1_KEY, variant);
    }
  }
  window.JUNIOR_EXP = { h1: variant };

  // The homepage's calls to action carry both offers: data-h1-attente holds
  // the waitlist label, the href and text in the page are the diagnostic's.
  // The test is off: the waitlist until the server says the diagnostic is open.
  function beforeOpening(ctas){
    var originals = [];
    for (var i = 0; i < ctas.length; i++) {
      var a = ctas[i];
      originals.push({ a: a, text: a.textContent, href: a.getAttribute("href") });
      a.addEventListener("click", (function(link, where){
        return function(){
          track("accueil_clic", { cta: where, vers: link.getAttribute("href") === "waitlist.html" ? "attente" : "diagnostic" });
        };
      })(a, a.getAttribute("data-h1-cta")));
    }
    function waitlist(){
      originals.forEach(function(o){ o.a.textContent = o.a.getAttribute("data-h1-attente"); o.a.setAttribute("href", "waitlist.html"); });
    }
    function diagnostic(){
      originals.forEach(function(o){ o.a.textContent = o.text; o.a.setAttribute("href", o.href); });
    }
    if (load(OPEN_KEY) !== "1") waitlist();
    try {
      fetch(API_BASE + "/diagnostics/access")
        .then(function(res){ return res.ok ? res.json() : null; })
        .then(function(data){
          if (!data || typeof data.public !== "boolean") return;
          save(OPEN_KEY, data.public ? "1" : "0");
          if (data.public) diagnostic(); else waitlist();
        })
        .catch(function(){});
    } catch (e) {}
  }

  function applyHome(){
    var ctas = document.querySelectorAll("a[data-h1-cta]");
    if (!ctas.length) return;
    if (!variant) { if (!DIAGNOSTIC_OPEN) beforeOpening(ctas); return; }
    for (var i = 0; i < ctas.length; i++) {
      var a = ctas[i];
      if (variant === "attente") {
        a.textContent = a.getAttribute("data-h1-attente");
        a.setAttribute("href", "waitlist.html");
      }
      a.addEventListener("click", (function(where){
        return function(){ track("exp_h1_clic", { h1: variant, cta: where }); };
      })(a.getAttribute("data-h1-cta")));
    }
    track("exp_h1_vue", { h1: variant });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", applyHome);
  else applyHome();
})();
