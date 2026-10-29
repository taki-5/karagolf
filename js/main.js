/* ==========================================================================
   KARA PREMIUM GOLF & BAR — main.js
   GSAP + ScrollTrigger によるアニメーション制御
   ========================================================================== */
(function () {
  "use strict";

  /* ==========================================================================
     サイト設定(先行配信 暫定値)
     ----------------------------------------------------------------------
     電話番号・公式LINE/InstagramのURL・グランドオープン日時をここでまとめて
     管理する。値を設定/変更するだけで、他のコードを一切触らずに
     本来の表示・動作に戻せる。

     - PHONE_NUMBER: 店舗の電話番号(Googleビジネスプロフィール掲載情報で確認済み)。
       class="js-phone-link" が付いた要素(ヘッダー/ヒーロー/PLAY MENU/
       VIPブース/貸切案内/アクセス/フッターなど、旧「WEB予約」ボタン)すべてに
       tel:リンクとして反映される。Web予約サイト(reserva.be)での受付は
       一旦停止し、電話での直接のお問い合わせに切り替えている。

     - INSTAGRAM_URL: 公式InstagramアカウントのURL(確認済み)。
       class="js-instagram-link" が付いた要素(ヒーロー/フローティングボタンなど)
       すべてにこのURLが反映され、target="_blank" rel="noopener noreferrer" で
       新しいタブで開く。null に戻すと、従来どおりクリックしても遷移しない
       「確認中」表示に自動的に戻る。

     - LINE_URL: 公式LINEのURL。class="js-line-link" が付いた要素
       (ヘッダー・フローティングボタン・OPEN特典セクションなど)すべてに
       このURLが反映される。今回の変更では一切変更していない。
     ========================================================================== */
  var SITE_CONFIG = {
    PHONE_NUMBER: "080-1357-9508",
    INSTAGRAM_URL: "https://www.instagram.com/karasawa811?cplk=MXkxa2plcng3aHU0cQ==",
    LINE_URL: "https://lin.ee/XNDaluJ"
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
   * 固定ヘッダー：スクロールで背景付与 / ハンバーガーメニュー(全画面幅共通)
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

    function isOpen() {
      return nav.classList.contains("is-open");
    }

    function openNav() {
      nav.classList.add("is-open");
      toggle.setAttribute("aria-expanded", "true");
      document.body.style.overflow = "hidden";
      // 開いた瞬間に最初のリンクへフォーカスし、キーボード操作で
      // 「今どこが操作対象か」が分かるようにする。
      var firstLink = nav.querySelector("a");
      if (firstLink) firstLink.focus();
    }

    function closeNav(options) {
      if (!isOpen()) return;
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
      if (options && options.returnFocus) toggle.focus();
    }

    toggle.addEventListener("click", function () {
      if (isOpen()) {
        closeNav({ returnFocus: true });
      } else {
        openNav();
      }
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        closeNav();
      });
    });

    // メニュー外(背景)をクリック/タップしたときも閉じる。
    document.addEventListener("click", function (e) {
      if (!isOpen()) return;
      if (nav.contains(e.target) || toggle.contains(e.target)) return;
      closeNav();
    });

    // Escapeキーで閉じ、ハンバーガーボタンへフォーカスを戻す。
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && isOpen()) {
        closeNav({ returnFocus: true });
      }
    });
  }

  /* ------------------------------------------------------------------
   * フローティングCTA(LINE/予約)：ヒーロー内では本来のCTAボタンを主役にしたいので、
   * ヒーローが画面に大きく映っている間は隠す。また、フッターに近づくと
   * 住所・著作権表記などの文字に固定ボタンが重なってしまうため、
   * フッターが画面に入っている間も同様に隠す(スクロールで離れたら再表示)。
   * IntersectionObserver非対応環境では常時表示のまま(CSS側の初期値がopacity:1のため)。
   * ---------------------------------------------------------------- */
  function initFloatingCta() {
    var cta = document.getElementById("floating-cta");
    var hero = document.getElementById("hero");
    var footer = document.querySelector(".site-footer");
    if (!cta || typeof IntersectionObserver === "undefined") return;

    var heroVisible = false;
    var footerVisible = false;

    function updateVisibility() {
      cta.classList.toggle("is-hidden", heroVisible || footerVisible);
    }

    if (hero) {
      new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            heroVisible = entry.intersectionRatio > 0.4;
            updateVisibility();
          });
        },
        { threshold: [0, 0.4, 1] }
      ).observe(hero);
    }

    if (footer) {
      new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            footerVisible = entry.isIntersecting;
            updateVisibility();
          });
        },
        { threshold: 0 }
      ).observe(footer);
    }
  }

  /* ------------------------------------------------------------------
   * リンク未確定時の案内トースト(titleのネイティブツールチップはタッチ操作では
   * 表示されないため)。Instagram URL確認中など、複数箇所で使い回す共通部品。
   * ---------------------------------------------------------------- */
  var pendingToastTimer = null;
  function showPendingToast(message) {
    var toast = document.getElementById("link-pending-toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("is-visible");
    clearTimeout(pendingToastTimer);
    pendingToastTimer = window.setTimeout(function () {
      toast.classList.remove("is-visible");
    }, 3200);
  }

  /* ------------------------------------------------------------------
   * お問い合わせ(電話)ボタン：class="js-phone-link" が付いた要素すべてに、
   * SITE_CONFIG.PHONE_NUMBER から作ったtel:リンクを一括反映する
   * (ヘッダー/ヒーロー/PLAY MENU/VIPブース/貸切案内/アクセス/フッター等、
   * 旧「WEB予約」ボタン。Web予約サイトでの受付は一旦停止している)。
   * ---------------------------------------------------------------- */
  function initPhoneLinks() {
    var links = document.querySelectorAll(".js-phone-link");
    if (!links.length) return;
    var telHref = "tel:" + SITE_CONFIG.PHONE_NUMBER.replace(/[^0-9+]/g, "");
    links.forEach(function (link) {
      link.setAttribute("href", telHref);
      link.removeAttribute("target");
      link.removeAttribute("rel");
      link.removeAttribute("aria-disabled");
      link.removeAttribute("title");
    });
  }

  /* ------------------------------------------------------------------
   * Instagramボタン：class="js-instagram-link" が付いた要素すべてに、
   * SITE_CONFIG.INSTAGRAM_URL を一括反映する(フローティングボタン等)。
   * 外部サイトへ新しいタブで遷移するため、target="_blank" と
   * rel="noopener noreferrer" を必ずセットで付与する。
   *
   * SITE_CONFIG.INSTAGRAM_URL が null(公式アカウントURL未確認)の間は、
   * クリックしても遷移しない「確認中」表示にする。URLが判明したら
   * この1箇所を設定するだけで自動的に有効化される。
   * ---------------------------------------------------------------- */
  function initInstagramLinks() {
    var links = document.querySelectorAll(".js-instagram-link");
    if (!links.length) return;
    var newTabHint = "(新しいタブで開きます)";

    function addNewTabHint(link) {
      var existingLabel = link.getAttribute("aria-label");
      if (existingLabel) {
        if (existingLabel.indexOf(newTabHint) === -1) {
          link.setAttribute("aria-label", existingLabel + newTabHint);
        }
        return;
      }
      if (!link.querySelector(".js-newtab-note")) {
        var note = document.createElement("span");
        note.className = "sr-only js-newtab-note";
        note.textContent = newTabHint;
        link.appendChild(note);
      }
    }

    links.forEach(function (link) {
      if (SITE_CONFIG.INSTAGRAM_URL) {
        link.setAttribute("href", SITE_CONFIG.INSTAGRAM_URL);
        link.setAttribute("target", "_blank");
        link.setAttribute("rel", "noopener noreferrer");
        link.removeAttribute("aria-disabled");
        link.removeAttribute("title");
        addNewTabHint(link);
        return;
      }
      link.setAttribute("href", "#");
      link.removeAttribute("target");
      link.removeAttribute("rel");
      link.setAttribute("aria-disabled", "true");
      link.setAttribute("title", "Instagramのリンク先は確認中です");
      link.addEventListener("click", function (e) {
        e.preventDefault();
        showPendingToast("Instagramのリンク先は確認でき次第、公開いたします。お急ぎの場合はお電話または公式LINEよりお問い合わせください。");
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
   * 写真ライトボックス：class="js-lightbox" が付いた画像をクリック(または
   * フォーカスしてEnter/Space)すると、背景を暗くして拡大表示する。
   * 閉じる操作：×ボタン／オーバーレイクリック／Escキー。
   * 外部ライブラリは使わず、バニラJSのみで実装する。
   * ---------------------------------------------------------------- */
  function initLightbox() {
    var triggers = document.querySelectorAll(".js-lightbox");
    var lightbox = document.getElementById("lightbox");
    var lightboxImg = document.getElementById("lightbox-img");
    var closeBtn = document.getElementById("lightbox-close");
    if (!triggers.length || !lightbox || !lightboxImg || !closeBtn) return;

    var lastFocused = null;
    var hideImgTimer = null;

    function openLightbox(trigger) {
      clearTimeout(hideImgTimer);
      lastFocused = trigger;
      lightboxImg.src = trigger.currentSrc || trigger.src;
      lightboxImg.alt = trigger.alt || "";
      lightbox.classList.add("is-open");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      closeBtn.focus();
    }

    function closeLightbox() {
      if (!lightbox.classList.contains("is-open")) return;
      lightbox.classList.remove("is-open");
      lightbox.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      if (lastFocused) lastFocused.focus();
      // フェードアウトのトランジションが終わってから画像を解放する
      hideImgTimer = window.setTimeout(function () {
        lightboxImg.src = "";
      }, 320);
    }

    triggers.forEach(function (trigger) {
      trigger.addEventListener("click", function () {
        openLightbox(trigger);
      });
      trigger.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
          e.preventDefault();
          openLightbox(trigger);
        }
      });
    });

    closeBtn.addEventListener("click", closeLightbox);

    // オーバーレイ(背景の暗い部分)をクリックしたときだけ閉じる。
    // 画像自体や×ボタンのクリックはバブリングしても target が一致しないため閉じない。
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && lightbox.classList.contains("is-open")) {
        closeLightbox();
      }
    });
  }

  /* ------------------------------------------------------------------
   * GSAP ScrollTrigger 演出
   * ---------------------------------------------------------------- */
  function initScrollAnimations() {
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;
    gsap.registerPlugin(ScrollTrigger);

    if (prefersReducedMotion) return; // CSSで即表示済みのため何もしない

    /* ヒーロー：実写バッジが「どーん」と登場 → ロゴ→コピー→CTA→OPENバッジ */
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
      .fromTo('[data-anim="hero-cta"]', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }, textStart + 0.15)
      .fromTo('[data-anim="hero-open-badge"]', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" }, textStart + 0.3);

    /* ヒーロー：背後の光条がスクロールでゆっくり回転 */
    gsap.to(".hero-burst", {
      rotate: 60,
      ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 1 }
    });

    /* カードスタック(シミュレーター/VIPブース/MOMENTS共通)：横スライドで登場 */
    gsap.utils.toArray(".card-stack__item").forEach(function (card, i) {
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

    /* 貸切・コンペ／アクセス／VIPブース／ゴルフをしないスペース：左右フェードイン */
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
    initPhoneLinks();
    initInstagramLinks();
    initLineLinks();
    initLightbox();
    initScrollAnimations();
  });
})();
