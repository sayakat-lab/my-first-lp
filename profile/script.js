/* =========================================================
   CAFÉ MORI — オーナー紹介ページ スクリプト
   - フッターの年を自動表示
   - スクロールに合わせて .reveal 要素をふわっと表示
   ========================================================= */
(function () {
  "use strict";

  /* ---------------------------------------------------------
     フッターの著作権表示の年を今年にする
     --------------------------------------------------------- */
  var yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  /* ---------------------------------------------------------
     スクロールで .reveal をふわっと表示
     - 動きを抑えたい設定、または IntersectionObserver 非対応の
       ブラウザでは、最初からすべて表示する
     --------------------------------------------------------- */
  var revealEls = document.querySelectorAll(".reveal");
  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) {
      el.classList.add("is-visible");
    });
    return;
  }

  var observer = new IntersectionObserver(
    function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        obs.unobserve(entry.target);
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
  );

  revealEls.forEach(function (el) {
    observer.observe(el);
  });
})();
