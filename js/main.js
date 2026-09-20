/* ==========================================================================
   KARA PREMIUM GOLF & BAR — main.js
   GSAP + ScrollTrigger によるアニメーション制御
   ========================================================================== */
(function () {
  "use strict";

  /* ==========================================================================
     サイト設定(先行配信 暫定値)
     ----------------------------------------------------------------------
     予約サイトのURL・公式LINEのURL・グランドオープン日時をここでまとめて
     管理する。値を設定/変更するだけで、他のコードを一切触らずに
     本来の表示・動作に戻せる。

     - RESERVATION_URL: 予約サイトのURL。null(未設定)の間、予約ボタン
       (class="js-reservation-link" が付いた要素)はクリックしても遷移しない。
       デザインはそのまま表示される。
       設定例: "https://reserva.be/karagolf1"

     - LINE_URL: 公式LINEのURL。class="js-line-link" が付いた要素
       (ヘッダー・フローティングボタン・OPEN特典セクションなど)すべてに
       このURLが反映される。
       ※現在の値は本プロジェクトに元々設定されていたものをそのまま
       引き継いでいるだけで、クライアント確認済みの正式URLかどうかは
       未確認。差し替えが必要な場合はこの1箇所を変更すればよい。

     - OPEN_DATE: グランドオープン日時(ISO 8601形式)。null(未設定)の間、
       カウントダウンは「OPEN日確定後、カウントダウンが始まります」という
       案内表示になる(誤解を招く数字は表示しない)。
       設定例: "2026-10-15T00:00:00+09:00"
     ========================================================================== */
  var SITE_CONFIG = {
    RESERVATION_URL: null,
    LINE_URL: "https://lin.ee/XNDaluJ",
    OPEN_DATE: null
  };

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
   * フローティングCTA(LINE/予約)：ヒーロー内では本来のCTAボタンを主役にしたいので、
   * ヒーローが画面に大きく映っている間は隠し、スクロールで離れたら表示する。
   * IntersectionObserver非対応環境では常時表示のまま(CSS側の初期値がopacity:1のため)。
   * ---------------------------------------------------------------- */
  function initFloatingCta() {
    var cta = document.getElementById("floating-cta");
    var hero = document.getElementById("hero");
    if (!cta || !hero || typeof IntersectionObserver === "undefined") return;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          cta.classList.toggle("is-hidden", entry.intersectionRatio > 0.4);
        });
      },
      { threshold: [0, 0.4, 1] }
    );
    observer.observe(hero);
  }

  /* ------------------------------------------------------------------
   * 予約ボタン：予約サイトのURLが未確定の間は、デザインはそのまま
   * クリックしても遷移しないようにする(class="js-reservation-link" が
   * 付いた要素が対象)。SITE_CONFIG.RESERVATION_URL を設定するだけで、
   * 通常どおり遷移するようになる。
   * ---------------------------------------------------------------- */
  function initReservationLinks() {
    var links = document.querySelectorAll(".js-reservation-link");
    links.forEach(function (link) {
      if (SITE_CONFIG.RESERVATION_URL) {
        link.setAttribute("href", SITE_CONFIG.RESERVATION_URL);
        link.removeAttribute("aria-disabled");
        link.removeAttribute("title");
        return;
      }
      link.setAttribute("href", "#");
      link.setAttribute("aria-disabled", "true");
      link.setAttribute("title", "予約受付開始まで今しばらくお待ちください");
      link.addEventListener("click", function (e) {
        e.preventDefault();
      });
    });
  }

  /* ------------------------------------------------------------------
   * 公式LINEボタン：ヘッダー/フローティング/OPEN特典セクションなど
   * 複数箇所にある class="js-line-link" のリンク先を、SITE_CONFIG.LINE_URL
   * の1箇所から一括で反映する。URLが変わった場合もここを直すだけでよい。
   * ---------------------------------------------------------------- */
  function initLineLinks() {
    var links = document.querySelectorAll(".js-line-link");
    links.forEach(function (link) {
      if (SITE_CONFIG.LINE_URL) {
        link.setAttribute("href", SITE_CONFIG.LINE_URL);
      }
    });
  }

  /* ------------------------------------------------------------------
   * カウントダウン（スロットマシン風の数字リール演出）
   * ----------------------------------------------------------------
   * OPEN日確定時(SITE_CONFIG.OPEN_DATEが設定されている場合):
   *   日・時・分・秒すべてを実際の残り時間で表示する(従来どおり)。
   *
   * OPEN日未確定時:
   *   ・Days は実際の残り日数を計算できないため「∞」の固定表示にする。
   *   ・Hours/Minutes/Seconds は、実際のOPEN日とは無関係な24時間の
   *     ループ演出として動かし続ける(「秒数だけ前のように動く」という
   *     演出面のご要望に対応)。あくまで飾りのループであり、特定の日時に
   *     向かっているわけではないことを、Daysの∞と案内文で明示する。
   *   ・案内文「OPEN日確定後、正式なカウントダウンが始まります」を添える。
   *
   * SITE_CONFIG.OPEN_DATE に日時を設定するだけで、上記の分岐が自動的に
   * 「OPEN日確定時」の通常表示に切り替わる。
   * ---------------------------------------------------------------- */
  function initCountdown() {
    var reelsRoot = document.getElementById("countdown-reels");
    if (!reelsRoot) return;

    var openDateSet = !!SITE_CONFIG.OPEN_DATE;
    var TARGET_DATE = openDateSet ? new Date(SITE_CONFIG.OPEN_DATE).getTime() : null;

    // OPEN日未確定時：Daysは∞の固定表示にし、案内文を添える。
    // (Days用の数字リールはこの後作らない)
    if (!openDateSet) {
      reelsRoot.classList.add("is-open-unconfirmed");

      var daysPair = reelsRoot.querySelector('[data-unit="days"]');
      if (daysPair) {
        daysPair.innerHTML = "";
        var box = document.createElement("div");
        box.className = "digit digit--infinity";
        var symbol = document.createElement("span");
        symbol.className = "digit-infinity-symbol";
        symbol.textContent = "\u221E"; // 無限大記号(文字化け防止のためUnicodeエスケープで指定)
        box.appendChild(symbol);
        daysPair.appendChild(box);
      }

      var countdownEl = reelsRoot.closest(".countdown");
      if (countdownEl && !countdownEl.querySelector(".countdown-pending-note")) {
        var note = document.createElement("p");
        note.className = "countdown-pending-note";
        note.textContent = "OPEN日確定後、正式なカウントダウンが始まります";
        countdownEl.appendChild(note);
      }
    }

    var units = [
      { key: "days", digits: 2 },
      { key: "hours", digits: 2 },
      { key: "minutes", digits: 2 },
      { key: "seconds", digits: 2 }
    ];

    var digitEls = {}; // key -> array of { el, strip, value }

    units.forEach(function (unit) {
      if (unit.key === "days" && !openDateSet) return; // Daysは∞固定のためリールを作らない
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

    // OPEN日未確定時のHours/Minutes/Secondsループに使う周期(24時間)。
    // 実際の日付とは無関係で、現在時刻から機械的に算出するだけの飾り。
    var LOOP_SECONDS = 86400;

    function update(animate) {
      var days, hours, minutes, seconds;

      if (openDateSet) {
        var now = Date.now();
        var diff = Math.max(0, TARGET_DATE - now);
        var totalSeconds = Math.floor(diff / 1000);
        days = Math.min(Math.floor(totalSeconds / 86400), 99); // 表示は2桁まで
        hours = Math.floor((totalSeconds % 86400) / 3600);
        minutes = Math.floor((totalSeconds % 3600) / 60);
        seconds = totalSeconds % 60;
      } else {
        // 実際のOPEN日とは無関係な24時間ループのダミー残り時間
        var elapsedInLoop = Math.floor(Date.now() / 1000) % LOOP_SECONDS;
        var remainingInLoop = LOOP_SECONDS - 1 - elapsedInLoop;
        hours = Math.floor(remainingInLoop / 3600);
        minutes = Math.floor((remainingInLoop % 3600) / 60);
        seconds = remainingInLoop % 60;
      }

      var values = { days: days, hours: hours, minutes: minutes, seconds: seconds };

      units.forEach(function (unit) {
        if (unit.key === "days" && !openDateSet) return;
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
    var heroPhoto = document.querySelector(".hero-photo-wrap");

    if (heroPhoto) {
      // ラッパーごとポップインさせることで、無加工の実写ロゴと
      // マイクロアニメーション用レイヤー(呼吸/クラブ/グラス/瞬き)が
      // 常に同じ位置・同じ大きさで重なった状態を保つ。
      heroTl.fromTo(
        heroPhoto,
        { opacity: 0, scale: 0.55 },
        { opacity: 1, scale: 1.14, duration: 0.65, ease: "back.out(1.6)" },
        0
      );
    }

    var textStart = heroPhoto ? 0.45 : 0;
    heroTl
      .fromTo('[data-anim="hero-copy"]', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" }, textStart)
      .fromTo('[data-anim="hero-countdown"]', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" }, textStart + 0.15)
      .fromTo('[data-anim="hero-cta"]', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }, textStart + 0.3);

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

    /* PLAY MENU：利用条件カードのスタッガー */
    gsap.fromTo(
      ".play-info-card",
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power3.out",
        stagger: 0.1,
        scrollTrigger: { trigger: ".play-info-grid", start: "top 85%" }
      }
    );

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

    /* MENUページ：カテゴリーカードがスクロールでふわっと登場 */
    gsap.utils.toArray(".menu-cat-card").forEach(function (card) {
      gsap.fromTo(
        card,
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power3.out",
          scrollTrigger: { trigger: card, start: "top 90%" }
        }
      );
    });

  }

  /* ------------------------------------------------------------------
   * 初期化
   * ---------------------------------------------------------------- */
  document.addEventListener("DOMContentLoaded", function () {
    initLoader();
    initHeader();
    initFloatingCta();
    initReservationLinks();
    initLineLinks();
    initCountdown();
    initScrollAnimations();
  });
})();
