/* The H1 test (Junior repo, roadmap §95): which entry offer a visitor sees.
 *
 * Half the visitors get « Faire mon diagnostic » (variant "diagnostic"),
 * half « Être avisé de l'ouverture » (variant "attente", the waitlist page).
 * The variant is drawn once per browser and kept in localStorage
 * (junior_exp_h1_v1), so a visitor who comes back sees the same offer. No
 * personal data: the variant only rides along on the Umami events.
 *
 * Off until the diagnostic opens: with H1_ACTIVE false nothing is drawn,
 * nothing changes on the page, and window.JUNIOR_EXP.h1 is null. Turning
 * the test on is this one line, in its own commit.
 */
(function(){
  var H1_ACTIVE = false;
  var H1_KEY = "junior_exp_h1_v1";
  var VARIANTS = ["diagnostic", "attente"];

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
  function applyHome(){
    var ctas = document.querySelectorAll("a[data-h1-cta]");
    if (!ctas.length || !variant) return;
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
