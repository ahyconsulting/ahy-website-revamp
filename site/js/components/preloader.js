!(function () {
  "use strict";
  const t = ["pink", "green", "yellow", "blue"],
    e = {
      pink: { x: 175, y: 295 },
      green: { x: 320, y: 280 },
      yellow: { x: 325, y: 125 },
      blue: { x: 180, y: 140 },
    },
    s = {
      pink: 0.75 * Math.PI,
      green: 0.25 * Math.PI,
      yellow: -0.25 * Math.PI,
      blue: -0.75 * Math.PI,
    };
  
  // Detect if this is a cached/repeat visit
  function isCachedVisit() {
    // Check if Service Worker is controlling the page
    const swControlled = navigator.serviceWorker && navigator.serviceWorker.controller;
    // Check if user has visited before (set after first load completes)
    const hasVisitedBefore = sessionStorage.getItem('ahy_visited') === 'true';
    // Check performance entries for cache hits
    const perfEntries = performance.getEntriesByType && performance.getEntriesByType('navigation');
    const isCacheHit = perfEntries && perfEntries[0] && (
      perfEntries[0].transferSize === 0 || 
      perfEntries[0].type === 'back_forward' ||
      perfEntries[0].type === 'reload'
    );
    
    const result = (swControlled && hasVisitedBefore) || isCacheHit;
    
    // Debug logging - remove in production
    console.log('%c[Preloader Debug]', 'color: #ec1865; font-weight: bold;', {
      swControlled: !!swControlled,
      hasVisitedBefore,
      navigationType: perfEntries?.[0]?.type,
      transferSize: perfEntries?.[0]?.transferSize,
      isCacheHit,
      FAST_MODE: result
    });
    
    return result;
  }
  
  class i {
    constructor() {
      (this.totalAssets = 0),
        (this.loadedAssets = 0),
        (this.spinActive = !1),
        (this.assetsLoaded = !1),
        (this.animationFrame = null),
        (this.currentProgress = 0),
        (this.angles = { ...s }),
        (this.circles = null),
        (this.digit1 = null),
        (this.digit10 = null),
        (this.digit100 = null),
        (this.preloaderEl = null),
        (this.loadingText = null),
        (this.progressBar = null),
        (this.animationStarted = !1),
        (this.animationComplete = !1),
        (this.lastOnes = -1),
        (this.lastTens = -1),
        (this.lastHundreds = -1),
        (this.onesWrapCount = 0),
        (this.tensWrapCount = 0),
        (this._isMobile = null),
        (this._lastTextKey = null),
        (this._lastFrameTime = 0),
        (this._frameInterval = 1e3 / 30),
        (this.readinessChecks = {
          dom: !1,
          images: !1,
          styles: !1,
          scripts: !1,
          fonts: !1,
          customComponents: !1,
          finalRender: !1,
        }),
        (this.readinessWeights = {
          dom: 10,
          images: 25,
          styles: 15,
          scripts: 15,
          fonts: 10,
          customComponents: 15,
          finalRender: 10,
        }),
        (this.completing = !1),
        (this.completeStartTime = 0),
        (this.completeStartProgress = 0),
        (this.completeDuration = 1500),
        (this.assetCategories = {
          images: { loaded: 0, total: 0 },
          videos: { loaded: 0, total: 0 },
          styles: { loaded: 0, total: 0 },
          scripts: { loaded: 0, total: 0 },
          fonts: { loaded: 0, total: 0 },
        }),
        (this.mutationObserver = null),
        (this.lastMutationTime = 0),
        (this.mutationSettleDelay = 500),
        // Fast mode for cached visits
        (this.isFastMode = isCachedVisit()),
        (this.fastModeDuration = 800), // Complete in 800ms for cached visits
        (this.fastModeMinTime = 0.3); // Min time before completing in fast mode
    }
    init() {
      "undefined" != typeof gsap
        ? this.startPreloader()
        : setTimeout(() => {
            "undefined" != typeof gsap
              ? this.startPreloader()
              : (console.warn("GSAP not loaded, using fallback"),
                this.finishLoadingImmediate());
          }, 100);
    }
    startPreloader() {
      (this.preloaderEl = document.getElementById("preloader")),
        (this.digit1 = document.querySelector("#digit-1 .slot-numbers")),
        (this.digit10 = document.querySelector("#digit-10 .slot-numbers")),
        (this.digit100 = document.querySelector("#digit-100 .slot-numbers")),
        (this.loadingText = document.getElementById("loading-text")),
        (this.progressBar = document.getElementById("progress-bar")),
        (this.circles = {}),
        t.forEach((t) => {
          this.circles[t] = document.getElementById(`circle-${t}`);
        }),
        this.digit1 && (this.digit1.style.transform = "translateY(0em)"),
        this.digit10 && (this.digit10.style.transform = "translateY(0em)"),
        this.digit100 && (this.digit100.style.transform = "translateY(0em)");
      const e = document.getElementById("loading-progress");
      this.loadingText && (this.loadingText.style.opacity = "1"),
        e && (e.style.opacity = "1"),
        (document.body.style.cssText +=
          "background-color: #e3e3db !important; opacity: 1; overflow: hidden;"),
        (this._preventScroll = (t) => t.preventDefault()),
        window.addEventListener("wheel", this._preventScroll, { passive: !1 }),
        window.addEventListener("touchmove", this._preventScroll, {
          passive: !1,
        }),
        this.setupDynamicTracking(),
        this.countAssets(),
        this.trackAssetLoading(),
        this.monitorCustomComponents(),
        this.checkStylesLoaded(),
        this.checkFontsLoaded(),
        this.animateIntro(),
        this.startCountAnimation();
    }
    setupDynamicTracking() {
      (this.mutationObserver = new MutationObserver(() => {
        (this.lastMutationTime = Date.now()), this.countAssets();
      })),
        this.mutationObserver.observe(document.body, {
          childList: !0,
          subtree: !0,
          attributes: !1,
        }),
        "complete" === document.readyState ||
        "interactive" === document.readyState
          ? (this.readinessChecks.dom = !0)
          : document.addEventListener(
              "DOMContentLoaded",
              () => {
                this.readinessChecks.dom = !0;
              },
              { once: !0 }
            );
    }
    countAssets() {
      const t = document.querySelectorAll("img");
      (this.assetCategories.images.total = t.length),
        (this.assetCategories.images.loaded = Array.from(t).filter(
          (t) => t.complete
        ).length);
      const e = document.querySelectorAll("video");
      (this.assetCategories.videos.total = e.length),
        (this.assetCategories.videos.loaded = Array.from(e).filter(
          (t) => t.readyState >= 3
        ).length);
      const s = document.querySelectorAll('link[rel="stylesheet"]');
      (this.assetCategories.styles.total = s.length),
        (this.assetCategories.styles.loaded = Array.from(s).filter(
          (t) => t.sheet
        ).length);
      const i = document.querySelectorAll("script[src]");
      (this.assetCategories.scripts.total = i.length),
        (this.totalAssets =
          this.assetCategories.images.total +
          this.assetCategories.videos.total +
          this.assetCategories.styles.total +
          this.assetCategories.scripts.total),
        (this.totalAssets = Math.max(this.totalAssets, 1)),
        (this.loadedAssets =
          this.assetCategories.images.loaded +
          this.assetCategories.videos.loaded +
          this.assetCategories.styles.loaded);
    }
    trackAssetLoading() {
      const t = (t) => {
        this.assetCategories[t].loaded++, this.updateProgress();
      };
      document.querySelectorAll("img").forEach((e) => {
        e.complete ||
          (e.addEventListener("load", () => t("images"), { once: !0 }),
          e.addEventListener("error", () => t("images"), { once: !0 }));
      }),
        document.querySelectorAll("video").forEach((e) => {
          e.readyState < 3 &&
            (e.addEventListener("loadeddata", () => t("videos"), { once: !0 }),
            e.addEventListener("error", () => t("videos"), { once: !0 }));
        }),
        document.querySelectorAll('link[rel="stylesheet"]').forEach((e) => {
          e.sheet ||
            (e.addEventListener("load", () => t("styles"), { once: !0 }),
            e.addEventListener("error", () => t("styles"), { once: !0 }));
        }),
        document.querySelectorAll("script[src]").forEach((e) => {
          e.addEventListener("load", () => t("scripts"), { once: !0 }),
            e.addEventListener("error", () => t("scripts"), { once: !0 });
        }),
        window.addEventListener(
          "load",
          () => {
            setTimeout(() => {
              (this.readinessChecks.images = !0),
                (this.readinessChecks.scripts = !0),
                this.checkAllReady();
            }, 200);
          },
          { once: !0 }
        );
    }
    checkStylesLoaded() {
      const t = () => {
        Array.from(document.querySelectorAll('link[rel="stylesheet"]')).every(
          (t) => null !== t.sheet
        )
          ? requestAnimationFrame(() => {
              const t = document.body,
                e = window.getComputedStyle(t);
              (e.backgroundColor || e.fontFamily) &&
                ((this.readinessChecks.styles = !0), this.checkAllReady());
            })
          : setTimeout(t, 100);
      };
      setTimeout(t, 50);
    }
    checkFontsLoaded() {
      document.fonts && document.fonts.ready
        ? document.fonts.ready.then(() => {
            (this.readinessChecks.fonts = !0),
              (this.assetCategories.fonts.loaded = 1),
              (this.assetCategories.fonts.total = 1),
              this.checkAllReady();
          })
        : setTimeout(() => {
            (this.readinessChecks.fonts = !0), this.checkAllReady();
          }, 1e3);
    }
    monitorCustomComponents() {
      document.addEventListener(
        "componentsLoaded",
        () => {
          (this.readinessChecks.customComponents = !0), this.checkAllReady();
        },
        { once: !0 }
      );
      const t = () => {
        if (Date.now() - this.lastMutationTime > this.mutationSettleDelay) {
          const t = document.querySelectorAll(
            'main, [role="main"], .main-content, #main'
          );
          if (t.length > 0 && Array.from(t).some((t) => t.children.length > 0))
            return (
              (this.readinessChecks.customComponents = !0),
              void this.checkAllReady()
            );
        }
        setTimeout(t, 200);
      };
      setTimeout(t, 500);
    }
    checkAllReady() {
      this.assetCategories.images.loaded >= this.assetCategories.images.total &&
        this.assetCategories.videos.loaded >=
          this.assetCategories.videos.total &&
        this.assetCategories.styles.loaded >=
          this.assetCategories.styles.total &&
        (this.readinessChecks.images = !0),
        !this.readinessChecks.finalRender &&
          this.readinessChecks.dom &&
          this.readinessChecks.styles &&
          this.readinessChecks.customComponents &&
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              (this.readinessChecks.finalRender = !0), this.checkComplete();
            });
          });
    }
    checkComplete() {
      let t = 0,
        e = 0;
      for (const [s, i] of Object.entries(this.readinessChecks)) {
        const o = this.readinessWeights[s];
        (t += o), i && (e += o);
      }
      (e / t) * 100 >= 95 &&
        !this.assetsLoaded &&
        ((this.assetsLoaded = !0),
        this.mutationObserver &&
          (this.mutationObserver.disconnect(), (this.mutationObserver = null)));
    }
    calculateProgress() {
      let t = 0;
      for (const [e, s] of Object.entries(this.readinessChecks))
        s && (t += this.readinessWeights[e]);
      const e =
        this.totalAssets > 0 ? (this.loadedAssets / this.totalAssets) * 50 : 0;
      return Math.min(t + e, 100);
    }
    isMobile() {
      return (
        null === this._isMobile &&
          (this._isMobile = window.matchMedia
            ? window.matchMedia("(max-width: 768px)").matches
            : window.innerWidth <= 768),
        this._isMobile
      );
    }
    updateSlotDigits(t) {
      const e = Math.floor(t),
        s = e % 10,
        i = Math.floor(e / 10) % 10,
        o = Math.floor(e / 100);
      if (this.lastOnes !== s && this.digit1) {
        0 === s && 9 === this.lastOnes && this.onesWrapCount++,
          (this.lastOnes = s);
        const t = 1.5 * -(10 * this.onesWrapCount + s);
        this.digit1.style.transform = `translateY(${t}em)`;
      }
      if (this.lastTens !== i && this.digit10) {
        0 === i && 9 === this.lastTens && this.tensWrapCount++,
          (this.lastTens = i);
        const t = 1.5 * -(10 * this.tensWrapCount + i);
        this.digit10.style.transform = `translateY(${t}em)`;
      }
      this.lastHundreds !== o &&
        this.digit100 &&
        ((this.lastHundreds = o),
        (this.digit100.style.transform = `translateY(${1.5 * -o}em)`));
    }
    startCountAnimation() {
      if (this.animationStarted) return;
      this.animationStarted = !0;
      const t = performance.now();
      (this.targetProgress = 0), (this.displayedProgress = 0);
      
      // Fast mode animation for cached visits
      if (this.isFastMode) {
        const fastAnimate = (s) => {
          if (this.animationComplete) return;
          const elapsed = (s - t) / 1000;
          const progress = Math.min(100, (elapsed / (this.fastModeDuration / 1000)) * 100);
          
          // Use easeOutQuart for smooth fast animation
          const eased = 1 - Math.pow(1 - (progress / 100), 4);
          this.displayedProgress = eased * 100;
          
          const a = Math.floor(this.displayedProgress);
          this.updateSlotDigits(a);
          this.progressBar && this.progressBar.style.setProperty("--progress", `${a}%`);
          this.updateLoadingText(this.displayedProgress);
          
          if (this.displayedProgress >= 99.9) {
            this.displayedProgress = 100;
            this.animationComplete = !0;
            this.progressBar && this.progressBar.style.setProperty("--progress", "100%");
            this.updateSlotDigits(100);
            this.updateLoadingText(100);
            // Mark as visited for future loads
            try { sessionStorage.setItem('ahy_visited', 'true'); } catch(e) {}
            setTimeout(() => this.finishLoading(), 300);
          } else {
            requestAnimationFrame(fastAnimate);
          }
        };
        requestAnimationFrame(fastAnimate);
        return;
      }
      
      // Normal mode animation
      const e = (s) => {
        if (this.animationComplete) return;
        if (s - this._lastFrameTime < this._frameInterval)
          return void requestAnimationFrame(e);
        this._lastFrameTime = s;
        const i = (s - t) / 1e3,
          o = this.calculateProgress();
        this.checkAllReady();
        if (
          (this.assetsLoaded &&
            i >= 2.5 &&
            !this.completing &&
            ((this.completing = !0),
            (this.completeStartTime = s),
            (this.completeStartProgress = this.displayedProgress)),
          this.completing)
        ) {
          const t = Math.min(
              1,
              (s - this.completeStartTime) / this.completeDuration
            ),
            e = 1 - Math.pow(1 - t, 3);
          this.displayedProgress =
            this.completeStartProgress + e * (100 - this.completeStartProgress);
        } else {
          this.targetProgress = Math.min(o, 95);
          const t = this.targetProgress - this.displayedProgress;
          let e,
            s = 1;
          this.displayedProgress < 20
            ? (s = 0.4 + (this.displayedProgress / 20) * 0.6)
            : this.displayedProgress > 80 &&
              (s = 1 - ((this.displayedProgress - 80) / 20) * 0.6),
            (e =
              t > 15
                ? 0.06 * t * s
                : t > 5
                ? 0.1 * t * s
                : Math.min(t, 0.6 * s)),
            t > 0.1 && (this.displayedProgress += Math.max(e, 0.08));
        }
        (this.displayedProgress = Math.min(
          Math.max(this.displayedProgress, 0),
          100
        )),
          (this.currentProgress = this.displayedProgress);
        const a = Math.floor(this.displayedProgress);
        this.updateSlotDigits(a),
          this.progressBar &&
            this.progressBar.style.setProperty("--progress", `${a}%`),
          this.updateLoadingText(this.displayedProgress),
          this.displayedProgress >= 99.9
            ? ((this.displayedProgress = 100),
              (this.animationComplete = !0),
              this.progressBar &&
                this.progressBar.style.setProperty("--progress", "100%"),
              this.updateSlotDigits(100),
              this.updateLoadingText(100),
              // Mark as visited for future loads
              (function() { try { sessionStorage.setItem('ahy_visited', 'true'); } catch(e) {} })(),
              setTimeout(() => this.finishLoading(), 800))
            : (i < 8 ||
                this.completing ||
                ((this.completing = !0),
                (this.completeStartTime = s),
                (this.completeStartProgress = this.displayedProgress)),
              requestAnimationFrame(e));
      };
      requestAnimationFrame(e);
    }
    updateLoadingText(t) {
      if (!this.loadingText) return;
      let e;
      if (
        ((e = t < 20 ? 0 : t < 40 ? 1 : t < 80 ? 2 : t < 100 ? 3 : 4),
        this._lastTextKey === e)
      )
        return;
      this._lastTextKey = e;
      const s = this.isMobile()
        ? [
            "GETTING<br>STARTED",
            "ASSEMBLING THE<br>ESSENTIALS",
            "ALMOST<br>THERE",
            "FINAL<br>TOUCHES",
            "EXPERIENCE<br>LOADED!",
          ]
        : [
            "GETTING STARTED",
            "ASSEMBLING THE ESSENTIALS",
            "ALMOST THERE",
            "FINAL TOUCHES",
            "EXPERIENCE LOADED!",
          ];
      this.loadingText.innerHTML = s[e];
    }
    updateProgress() {
      this.loadedAssets++,
        this.animationStarted || this.startCountAnimation(),
        this.checkAllReady();
    }
    animateIntro() {
      const e = gsap.timeline();
      t.forEach((t, s) => {
        e.to(
          this.circles[t],
          { opacity: 1, attr: { r: 25 }, duration: 0.5, ease: "back.out(1.7)" },
          "intro+=" + 0.1 * s
        );
      }),
        t.forEach((t) => {
          const s = this.getPositionOnCircle(this.angles[t]);
          e.to(
            this.circles[t],
            { attr: { cx: s.x, cy: s.y }, duration: 0.5, ease: "power2.out" },
            "spread"
          );
        }),
        e.to({}, { duration: 0.3 }).call(() => {
          (this.spinActive = !0), this.animateSpin();
        });
    }
    getPositionOnCircle(t) {
      return { x: 250 + 60 * Math.cos(t), y: 210 + 60 * Math.sin(t) };
    }
    animateSpin() {
      if (!this.spinActive) return;
      const e = this.circles;
      t.forEach((t) => {
        this.angles[t] += 0.03;
        const s = this.angles[t],
          i = e[t];
        i &&
          (i.setAttribute("cx", 250 + 60 * Math.cos(s)),
          i.setAttribute("cy", 210 + 60 * Math.sin(s)));
      }),
        (this.animationFrame = requestAnimationFrame(() => this.animateSpin()));
    }
    finishLoading() {
      (this.spinActive = !1),
        this.animationFrame &&
          (cancelAnimationFrame(this.animationFrame),
          (this.animationFrame = null));
      const s = gsap.timeline();
      s.to(
        "#loading-text, #loading-progress",
        { opacity: 0, duration: 0.3 },
        "morph"
      ),
        t.forEach((t, i) => {
          const o = e[t];
          s.to(
            this.circles[t],
            {
              attr: { cx: o.x, cy: o.y, r: 40 },
              duration: 0.6,
              ease: "power2.inOut",
            },
            "morph+=" + 0.05 * i
          );
        }),
        s.to(".logo-part", { scale: 0.3 }, "crossfade"),
        t.forEach((t, e) => {
          s.to(
            this.circles[t],
            { attr: { r: 60 }, opacity: 0, duration: 0.5, ease: "power2.out" },
            "crossfade+=" + 0.05 * e
          ),
            s.to(
              `#logo-${t}`,
              { opacity: 1, scale: 1, duration: 0.7, ease: "back.out(1.5)" },
              "crossfade+=" + 0.05 * e
            );
        }),
        s
          .to({}, { duration: 0.8 })
          .to(this.preloaderEl, {
            yPercent: -100,
            duration: 0.8,
            ease: "power3.inOut",
            onComplete: () => this.cleanup(),
          });
    }
    finishLoadingImmediate() {
      this.preloaderEl &&
        ((this.preloaderEl.style.display = "none"), this.cleanup());
    }
    cleanup() {
      this.preloaderEl?.classList.add("loaded"),
        (document.body.style.overflow = "auto"),
        this._preventScroll &&
          (window.removeEventListener("wheel", this._preventScroll),
          window.removeEventListener("touchmove", this._preventScroll),
          (this._preventScroll = null)),
        this.mutationObserver &&
          (this.mutationObserver.disconnect(), (this.mutationObserver = null)),
        (this.circles = null),
        (this.digit1 = null),
        (this.digit10 = null),
        (this.digit100 = null),
        (this.loadingText = null),
        (this.progressBar = null),
        document.dispatchEvent(new CustomEvent("preloaderComplete"));
    }
  }
  const o = () => {
    new i().init();
  };
  "loading" === document.readyState
    ? document.addEventListener("DOMContentLoaded", o, { once: !0 })
    : o();
})();