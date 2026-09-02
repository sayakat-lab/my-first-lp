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
    // ページ内アンカー（# 始まり）のリンクだけを対象にする。
    // 別ページへのリンク（例：自己紹介ページ）は querySelector に渡すと
    // 不正なセレクタで例外になるため除外する。
    .map((link) => {
      const href = link.getAttribute("href");
      return href && href.startsWith("#") ? document.querySelector(href) : null;
    })
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
     お問い合わせフォームのバリデーション
     - 空欄チェック
     - メール形式チェック
     - OK なら alert を表示（送信処理は行わない）
     --------------------------------------------------------- */
  const contactForm = document.getElementById("contactForm");

  if (contactForm) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const fields = [
      { el: contactForm.querySelector("#cf-name"),    label: "お名前" },
      { el: contactForm.querySelector("#cf-email"),   label: "メールアドレス" },
      { el: contactForm.querySelector("#cf-message"), label: "お問い合わせ内容" },
    ];

    function setError(field, message) {
      const row = field.el.closest(".form-row");
      const errorEl = contactForm.querySelector('[data-error-for="' + field.el.id + '"]');
      if (row) row.classList.toggle("has-error", Boolean(message));
      if (errorEl) errorEl.textContent = message || "";
      field.el.setAttribute("aria-invalid", message ? "true" : "false");
    }

    function validateField(field) {
      const value = field.el.value.trim();

      if (!value) {
        setError(field, field.label + "を入力してください。");
        return false;
      }
      if (field.el.id === "cf-email" && !emailPattern.test(value)) {
        setError(field, "メールアドレスの形式が正しくありません。");
        return false;
      }
      setError(field, "");
      return true;
    }

    fields.forEach(function (field) {
      field.el.addEventListener("input", function () {
        if (field.el.closest(".form-row").classList.contains("has-error")) {
          validateField(field);
        }
      });
      field.el.addEventListener("blur", function () { validateField(field); });
    });

    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();

      let firstInvalid = null;
      fields.forEach(function (field) {
        const ok = validateField(field);
        if (!ok && !firstInvalid) firstInvalid = field.el;
      });

      if (firstInvalid) {
        firstInvalid.focus();
        return;
      }

      alert("送信しました");
      contactForm.reset();
      fields.forEach(function (field) { setError(field, ""); });
    });
  }

  /* ---------------------------------------------------------
     ウィンドウ拡大時にモバイルメニューを閉じる
     --------------------------------------------------------- */
  window.addEventListener("resize", function () {
    if (window.innerWidth > 640) closeMenu();
  });
})();
