!(function () {
  function t() {
    // Split marquee text into characters
    document.querySelectorAll(".marquee-text").forEach((node) => {
      if (node.dataset.split) return;
      const text = node.textContent;
      node.innerHTML = text.split("")
        .map(letter => `<span class="fw-char">${letter === " " ? "&nbsp;" : letter}</span>`)
        .join("");
      node.dataset.split = "true";
    });

    // Marquee scroll
    const marqueeRows = document.querySelectorAll(".marquee-inner");
    gsap.to(marqueeRows, { x: "-25%", duration: 8, repeat: -1, ease: "none" });

    gsap.matchMedia().add(
      { isDesktop: "(min-width: 769px)", isMobile: "(max-width: 768px)" },
      (ctx) => {
        let layout;
        const { isDesktop, isMobile } = ctx.conditions;

        layout = isDesktop
          ? {
              MAIN: { left: "0%", top: "0%", width: "65%", height: "100%" },
              SIDE_TOP: { left: "70%", top: "0%", width: "30%", height: "48%" },
              SIDE_BOT: { left: "70%", top: "52%", width: "30%", height: "48%" },
            }
          : {
              MAIN: { left: "0%", top: "0%", width: "100%", height: "60%" },
              SIDE_TOP: { left: "0%", top: "62%", width: "49%", height: "38%" },
              SIDE_BOT: { left: "51%", top: "62%", width: "49%", height: "38%" },
            };

        // DOM references
        const video = document.getElementById("videoItem");
        const videoOverlay = document.getElementById("videoOverlay");
        const videoSmall = document.getElementById("videoSmallContent");

        const card1 = document.getElementById("card1");
        const c1Small = document.getElementById("card1SmallContent");
        const c1Overlay = document.getElementById("card1Overlay");

        const card2 = document.getElementById("card2");
        const c2Small = document.getElementById("card2SmallContent");
        const c2Overlay = document.getElementById("card2Overlay");

        const videoChars = document.querySelectorAll(".video-text .fw-char");
        const card1Chars = document.querySelectorAll(".card1-text .fw-char");
        const card2Chars = document.querySelectorAll(".card2-text .fw-char");

        // Scroll-driven animation (unchanged logic)
        gsap.timeline({
          scrollTrigger: {
            trigger: ".featuredWork-section",
            start: "top top-=75",
            end: "bottom bottom",
            scrub: 1,
            pin: ".featuredWork-container",
            invalidateOnRefresh: true,
          },
        })
          .to(video, { width: "100%", height: "100%", left: "0%", top: "0%", duration: 0.5, ease: "power2.inOut" })
          .to(videoSmall, { opacity: 0, duration: 0.2 }, "<")
          .to(videoOverlay, { opacity: 1, duration: 0.2 }, "<0.3")
          .to(videoChars, { y: "0%", opacity: 1, duration: 0.5, stagger: 0.02, ease: "power3.out" }, "<0.1")
          .to(video, { ...layout.MAIN, borderRadius: "24px", duration: 0.8, ease: "power2.inOut" }, "+=0.2")
          .set(card1, { ...layout.SIDE_TOP })
          .set(card2, { ...layout.SIDE_BOT })
          .to([card1, card2], { opacity: 1, duration: 0.5, stagger: 0.1 }, "<0.3")

          // --- Swap 1 (card1 becomes MAIN)
          .addLabel("swap1")
          .to(card1, { ...layout.MAIN, zIndex: 20, duration: 1, ease: "power2.inOut" }, "+=0.2")
          .to(video, { ...layout.SIDE_TOP, zIndex: 5, duration: 1, ease: "power2.inOut" }, "<")
          .to(card2, { ...layout.SIDE_BOT, zIndex: 6, duration: 1, ease: "power2.inOut" }, "<")
          .to(videoOverlay, { opacity: 0, duration: 0.3 }, "swap1+=0.5")
          .to(videoSmall, { opacity: 1, duration: 0.3 }, "swap1+=0.5")
          .to(c1Small, { opacity: 0, duration: 0.2 }, "swap1")
          .to(c1Overlay, { opacity: 1, duration: 0.3 }, "swap1+=0.5")
          .to(card1Chars, { y: "0%", opacity: 1, duration: 0.5, stagger: 0.02, ease: "power3.out" }, "swap1+=0.6")

          // --- Swap 2 (card2 becomes MAIN)
          .addLabel("swap2")
          .to(card2, { ...layout.MAIN, zIndex: 30, duration: 1, ease: "power2.inOut" }, "+=0.2")
          .to(video, { ...layout.SIDE_BOT, zIndex: 5, duration: 1, ease: "power2.inOut" }, "<")
          .to(card1, { ...layout.SIDE_TOP, zIndex: 6, duration: 1, ease: "power2.inOut" }, "<")
          .to(c1Overlay, { opacity: 0, duration: 0.3 }, "swap2")
          .to(c1Small, { opacity: 1, duration: 0.3 }, "swap2+=0.5")
          .to(c2Small, { opacity: 0, duration: 0.2 }, "swap2")
          .to(c2Overlay, { opacity: 1, duration: 0.3 }, "swap2+=0.5")
          .to(card2Chars, {
            y: "0%",
            opacity: 1,
            duration: 0.5,
            stagger: 0.02,
            ease: "power3.out",
          }, "swap2+=0.6");
      }
    );
  }

  // REGISTER ONLY ScrollTrigger
  gsap.registerPlugin(ScrollTrigger);

  // Run on ready
  document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", t)
    : t();
})();
