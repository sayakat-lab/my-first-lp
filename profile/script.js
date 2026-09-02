/* =========================================================
   自己紹介ページ（演習用）スクリプト
   - フッターの年を自動表示
   - ライト / ダークのテーマ切替（選択を localStorage に保存）
   ========================================================= */
(function () {
  "use strict";

  var STORAGE_KEY = "profile-theme";

  /* ---------------------------------------------------------
     フッターの著作権表示の年を今年にする
     --------------------------------------------------------- */
  var yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  /* ---------------------------------------------------------
     テーマ切替
     --------------------------------------------------------- */
  var toggle = document.getElementById("themeToggle");
  var root = document.documentElement;

  // localStorage は環境によって読み書きで例外が出るため try/catch で包む
  function readSavedTheme() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      return null;
    }
  }

  function saveTheme(theme) {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (e) {
      // 保存できなくても動作は継続する
    }
  }

  // 現在の見た目がダークかどうかを返す
  function isDark() {
    var current = root.getAttribute("data-theme");
    if (current === "dark") return true;
    if (current === "light") return false;
    // 未指定ならOSの設定に従う
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  // ボタンのラベルと状態を今の見た目に合わせて更新する
  function syncToggle() {
    if (!toggle) return;
    var dark = isDark();
    toggle.setAttribute("aria-pressed", String(dark));
    toggle.textContent = dark ? "ライトモードにする" : "ダークモードにする";
  }

  // 保存済みの選択があれば復元する
  var saved = readSavedTheme();
  if (saved === "dark" || saved === "light") {
    root.setAttribute("data-theme", saved);
  }
  syncToggle();

  if (toggle) {
    toggle.addEventListener("click", function () {
      var next = isDark() ? "light" : "dark";
      root.setAttribute("data-theme", next);
      saveTheme(next);
      syncToggle();
    });
  }
})();
