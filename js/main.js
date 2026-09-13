/* ==========================================================================
   KARA PREMIUM GOLF & BAR — main.js
   GSAP + ScrollTrigger によるアニメーション制御
   ========================================================================== */
(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------------------------
   * ローディング画面
   * ---------------------------------------------------------------- */
  function initLoader() {
    var loader = document.getElementById("loader");
    var logo = loader.querySelector(".loader-logo");

    function hideLoader() {
      loader.classList.add("is-hidden");
      document.body.style.overflow = "";
      setTimeout(function () { loader.remove(); }, 700);
    }

    if (prefersReducedMotion || typeof gsap === "undefined") {
      hideLoader();
      return;
    }

    document.body.style.overflow = "hidden";
    gsap.to(logo, {
      opacity: 1,
      y: -6,
      duration: 0.9,
      ease: "power2.out",
      delay: 0.2,
      onComplete: function () {
        gsap.to(loader, {
          opacity: 0,
          duration: 0.6,
          delay: 0.35,
          onComplete: hideLoader
        });
      }
    });
  }

  /* ------------------------------------------------------------------
   * 固定ヘッダー：スクロールで背景付与 / モバイルメニュー
   * ---------------------------------------------------------------- */
  function initHeader() {
    var header = document.getElementById("site-header");
    var toggle = document.getElementById("nav-toggle");
    var nav = document.getElementById("header-nav");

    function onScroll() {
      header.classList.toggle("is-scrolled", window.scrollY > 40);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    toggle.addEventListener("click", function () {
      var isOpen = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ------------------------------------------------------------------
   * カウントダウン（スロットマシン風の数字リール演出）
   * ---------------------------------------------------------------- */
  function initCountdown() {
    // 2026年10月中旬 グランドオープン（暫定: 10/15 0:00 JST）。
    // 正式日程が決まり次第、下の日付を差し替えてください。
    var TARGET_DATE = new Date("2026-10-15T00:00:00+09:00").getTime();

    var reelsRoot = document.getElementById("countdown-reels");
    if (!reelsRoot) return;

    var units = [
      { key: "days", digits: 2 },
      { key: "hours", digits: 2 },
      { key: "minutes", digits: 2 },
      { key: "seconds", digits: 2 }
    ];

    var digitEls = {}; // key -> array of { el, strip, value }

    units.forEach(function (unit) {
      var container = reelsRoot.querySelector('[data-unit="' + unit.key + '"]');
      if (!container) return;
      digitEls[unit.key] = [];
      for (var i = 0; i < unit.digits; i++) {
        var digit = document.createElement("div");
        digit.className = "digit";
        digit.dataset.value = "0";

        var strip = document.createElement("div");
        strip.className = "digit-strip";
        // 0-9 を2周分並べてスピン演出時のループに使う
        for (var cycle = 0; cycle < 2; cycle++) {
          for (var n = 0; n <= 9; n++) {
            var span = document.createElement("span");
            span.textContent = String(n);
            strip.appendChild(span);
          }
        }
        digit.appendChild(strip);
        container.appendChild(digit);
        digitEls[unit.key].push({ el: digit, strip: strip, value: -1 });
      }
    });

    function digitHeight(el) {
      return el.clientHeight || 60;
    }

    function setDigitValue(entry, newVal, animate) {
      if (entry.value === newVal) return;
      var h = digitHeight(entry.el);
      var fromVal = entry.value < 0 ? newVal : entry.value;
      entry.value = newVal;

      if (!animate || prefersReducedMotion || typeof gsap === "undefined") {
        entry.strip.style.transform = "translateY(-" + newVal * h + "px)";
        return;
      }

      // 現在値のベース位置(1周目)から、2周目の目的値までスピンさせてから
      // 見た目が同じ1周目の位置へ瞬時に戻す(無限にY座標が増え続けるのを防止)
      gsap.set(entry.strip, { y: -(fromVal * h) });
      gsap.to(entry.strip, {
        y: -((10 + newVal) * h),
        duration: 0.55,
        ease: "power2.out",
        onComplete: function () {
          gsap.set(entry.strip, { y: -(newVal * h) });
        }
      });
    }

    function update(animate) {
      var now = Date.now();
      var diff = Math.max(0, TARGET_DATE - now);

      var totalSeconds = Math.floor(diff / 1000);
      var days = Math.floor(totalSeconds / 86400);
      var hours = Math.floor((totalSeconds % 86400) / 3600);
      var minutes = Math.floor((totalSeconds % 3600) / 60);
      var seconds = totalSeconds % 60;

      days = Math.min(days, 99); // 表示は2桁まで

      var values = { days: days, hours: hours, minutes: minutes, seconds: seconds };

      units.forEach(function (unit) {
        var str = String(values[unit.key]).padStart(unit.digits, "0");
        var entries = digitEls[unit.key];
        if (!entries) return;
        for (var i = 0; i < entries.length; i++) {
          setDigitValue(entries[i], parseInt(str[i], 10), animate);
        }
      });
    }

    // 初期描画はアニメーションなしで一発表示、以降1秒ごとにスロット演出
    update(false);
    setTimeout(function () {
      setInterval(function () { update(true); }, 1000);
    }, 300);

    // レイアウト確定後に高さを再計算して初期位置を合わせ直す
    window.addEventListener("resize", function () { update(false); });
  }

  /* ------------------------------------------------------------------
   * GSAP ScrollTrigger 演出
   * ---------------------------------------------------------------- */
  function initScrollAnimations() {
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;
    gsap.registerPlugin(ScrollTrigger);

    if (prefersReducedMotion) return; // CSSで即表示済みのため何もしない

    /* ヒーロー：実写バッジが「どーん」と登場 → ロゴ→コピー→カウントダウン→CTA */
    var heroTl = gsap.timeline({ delay: 0.3 });
    var heroPhoto = document.getElementById("hero-photo");

    if (heroPhoto) {
      heroTl.fromTo(
        heroPhoto,
        { opacity: 0, scale: 0.55 },
        { opacity: 1, scale: 1.14, duration: 0.65, ease: "back.out(1.6)" },
        0
      );
    }

    var textStart = heroPhoto ? 0.45 : 0;
    heroTl
      .fromTo('[data-anim="hero-logo"]', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" }, textStart)
      .fromTo('[data-anim="hero-copy"]', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" }, textStart + 0.15)
      .fromTo('[data-anim="hero-countdown"]', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" }, textStart + 0.3)
      .fromTo('[data-anim="hero-cta"]', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }, textStart + 0.45);

    /* ヒーロー：背後の光条がスクロールでゆっくり回転 */
    gsap.to(".hero-burst", {
      rotate: 60,
      ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 1 }
    });

    /* シミュレーターカード：横スライドで登場 */
    gsap.utils.toArray(".sim-card").forEach(function (card, i) {
      gsap.fromTo(
        card,
        { opacity: 0, x: i % 2 === 0 ? -60 : 60 },
        {
          opacity: 1,
          x: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: { trigger: card, start: "top 85%" }
        }
      );
    });

    /* おすすめアイコン：スタッガー */
    gsap.fromTo(
      ".recommend-item",
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: "power3.out",
        stagger: 0.15,
        scrollTrigger: { trigger: ".recommend-grid", start: "top 85%" }
      }
    );

    /* 口コミ：スタッガー */
    gsap.fromTo(
      ".testimonial",
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power3.out",
        stagger: 0.12,
        scrollTrigger: { trigger: ".testimonials", start: "top 85%" }
      }
    );

    /* ギャラリー：スタッガーでフェードイン */
    gsap.fromTo(
      ".gallery-grid img",
      { opacity: 0, y: 30, scale: 0.96 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.6,
        ease: "power3.out",
        stagger: 0.1,
        scrollTrigger: { trigger: ".gallery-grid", start: "top 85%" }
      }
    );

    /* 貸切・コンペ／アクセス：左右フェードイン */
    gsap.utils.toArray('[data-anim="fade-in-left"]').forEach(function (el) {
      gsap.fromTo(el, { opacity: 0, x: -50 }, {
        opacity: 1, x: 0, duration: 0.8, ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 85%" }
      });
    });
    gsap.utils.toArray('[data-anim="fade-in-right"]').forEach(function (el) {
      gsap.fromTo(el, { opacity: 0, x: 50 }, {
        opacity: 1, x: 0, duration: 0.8, ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 85%" }
      });
    });

    /* OPEN特典：背景パララックス */
    gsap.to(".campaign-bg", {
      yPercent: 14,
      ease: "none",
      scrollTrigger: {
        trigger: ".campaign-section",
        start: "top bottom",
        end: "bottom top",
        scrub: true
      }
    });

  }

  /* ------------------------------------------------------------------
   * 初期化
   * ---------------------------------------------------------------- */
  document.addEventListener("DOMContentLoaded", function () {
    initLoader();
    initHeader();
    initCountdown();
    initScrollAnimations();
  });
})();
