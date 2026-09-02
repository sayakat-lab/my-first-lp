/* =========================================================
   CAFÉ MORI — Landing Page Scripts
   ========================================================= */
(function () {
  "use strict";

  const header    = document.getElementById("siteHeader");
  const nav       = document.getElementById("nav");
  const navToggle = document.getElementById("navToggle");
  const toTop     = document.getElementById("toTop");
  const navLinks  = Array.from(document.querySelectorAll(".nav-link"));
  const sections  = navLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------------------
     モバイルメニューの開閉
     --------------------------------------------------------- */
  function closeMenu() {
    nav.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "メニューを開く");
  }

  navToggle.addEventListener("click", function () {
    const isOpen = nav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggle.setAttribute("aria-label", isOpen ? "メニューを閉じる" : "メニューを開く");
  });

  /* ---------------------------------------------------------
     スムーススクロール（固定ヘッダー分のオフセット付き）
     CSS の scroll-behavior が効かない環境向けのフォールバック
     も兼ねて JS 側でも制御する
     --------------------------------------------------------- */
  document.querySelectorAll('a[data-scroll]').forEach(function (anchor) {
    anchor.addEventListener("click", function (e) {
      const targetId = anchor.getAttribute("href");
      if (!targetId || targetId.charAt(0) !== "#") return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      closeMenu();

      const headerH = header.offsetHeight;
      const top = target.getBoundingClientRect().top + window.pageYOffset - headerH - 8;

      window.scrollTo({
        top: top,
        behavior: prefersReducedMotion ? "auto" : "smooth",
      });

      // アドレスバーにハッシュを反映（履歴は汚さない）
      history.replaceState(null, "", targetId);
    });
  });

  /* ---------------------------------------------------------
     スクロールに応じたヘッダーの見た目 & トップへ戻るボタン
     --------------------------------------------------------- */
  function onScroll() {
    const y = window.pageYOffset;
    header.classList.toggle("is-scrolled", y > 40);
    toTop.classList.toggle("is-visible", y > 600);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  toTop.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
  });

  /* ---------------------------------------------------------
     現在地に応じてナビリンクをハイライト
     --------------------------------------------------------- */
  if ("IntersectionObserver" in window && sections.length) {
    const spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          const id = "#" + entry.target.id;
          navLinks.forEach(function (link) {
            link.classList.toggle("is-active", link.getAttribute("href") === id);
          });
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    sections.forEach(function (section) { spy.observe(section); });
  }

  /* ---------------------------------------------------------
     スクロールで要素をふわっと表示
     --------------------------------------------------------- */
  const revealEls = document.querySelectorAll(".reveal");

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  } else {
    const revealObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  }

  /* ---------------------------------------------------------
     ヒーロー背景の軽いパララックス
     --------------------------------------------------------- */
  const heroBg = document.querySelector(".hero-bg");
  if (heroBg && !prefersReducedMotion) {
    window.addEventListener(
      "scroll",
      function () {
        const y = window.pageYOffset;
        if (y < window.innerHeight) {
          heroBg.style.transform = "scale(1.05) translateY(" + y * 0.15 + "px)";
        }
      },
      { passive: true }
    );
  }

  /* ---------------------------------------------------------
     ウィンドウ拡大時にモバイルメニューを閉じる
     --------------------------------------------------------- */
  window.addEventListener("resize", function () {
    if (window.innerWidth > 640) closeMenu();
  });
})();
