(() => {
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, SplitText);

  const $ = (s) => document.querySelector(s);
  const $$ = (s) => document.querySelectorAll(s);

  const stage = $(".philosophy-stage");
  const slides = $$(".philosophy-slide");
  const scrollLinks = $$(".philosophy-slide__scroll-link");
  const titles = $$(".philosophy-col__content-title");

  // Split text
  new SplitText(".philosophy-intro__title", {
    type: "lines",
    linesClass: "intro-line",
    tag: "span",
    preserveWhitespace: true,
  });

  new SplitText(titles, {
    type: "lines, chars",
    linesClass: "line",
    charsClass: "char",
    position: "relative",
  });

  let slideIndex = 0;

  // Keyboard navigation
  document.addEventListener("keydown", (e) => {
    if (e.keyCode === 40 && slideIndex <= slides.length) {
      slideIndex++;
      gsap.to(window, {
        duration: 2,
        scrollTo: { y: `#philosophy-slide-${slideIndex}` },
        ease: "power2.inOut",
      });
    } else if (e.keyCode === 38) {
      slideIndex = 0;
      gsap.to(window, {
        duration: 2,
        scrollTo: { y: "#philosophy-slide-0" },
        ease: "power2.inOut",
      });
    }
  });

  // Initial animations
  gsap.set(stage, { autoAlpha: 1 });

  gsap
    .timeline({ delay: 1.2 })
    .from(".philosophy-intro-line", { y: 400, ease: "power4", duration: 3 })
    .from(".philosophy-intro__txt", { x: -100, opacity: 0, ease: "power4", duration: 3 }, 0.7)
    .from(".philosophy-intro__img--1", { y: 50, opacity: 0, ease: "power2", duration: 10 }, 1)
    .from(".philosophy-intro__img--2", { y: -50, opacity: 0, ease: "power2", duration: 10 }, 1);

  // Intro scroll animation
  gsap
    .timeline({
      scrollTrigger: {
        trigger: ".philosophy-intro",
        scrub: 1,
        start: "top bottom",
        end: "bottom top",
      },
    })
    .to(".philosophy-intro__title", { x: 400, ease: "power4.in", duration: 3 })
    .to(".philosophy-intro__txt", { y: 100, ease: "power4.in", duration: 3 }, 0);

  // Scroll link interactions
  scrollLinks.forEach((link, i) => {
    const line = link.querySelector(".philosophy-slide__scroll-line");

    link.addEventListener("click", (e) => {
      e.preventDefault();
      gsap.to(window, {
        duration: 2,
        scrollTo: { y: `#philosophy-slide-${i + 2}` },
        ease: "power2.inOut",
      });
      slideIndex++;
    });

    link.addEventListener("mouseenter", () => {
      gsap.to(line, { y: 40, transformOrigin: "bottom center", duration: 0.6, ease: "power4" });
    });

    link.addEventListener("mouseleave", () => {
      gsap.to(line, { y: 0, transformOrigin: "bottom center", duration: 0.6, ease: "power4" });
    });
  });

  // Slide link interactions
  $$(".philosophy-slide-link").forEach((link) => {
    const line = link.querySelector(".philosophy-slide-link__line");

    link.addEventListener("mouseenter", () => {
      gsap.to(line, { x: 20, scaleX: 0.3, transformOrigin: "right center", duration: 0.8, ease: "power4" });
    });

    link.addEventListener("mouseleave", () => {
      gsap.to(line, { x: 0, scaleX: 1, transformOrigin: "right center", duration: 0.8, ease: "power4" });
    });
  });

  // Slide animations
  slides.forEach((slide) => {
    gsap
      .timeline({ scrollTrigger: { trigger: slide, start: "40% 50%" } })
      .from(slide.querySelectorAll(".philosophy-col__content-title"), { ease: "power4", y: "+=5vh", duration: 2.5 })
      .from(slide.querySelectorAll(".philosophy-slide__scroll-link"), { y: 200, duration: 3, ease: "power4" }, 0.4)
      .to(
        slide.querySelectorAll(".philosophy-slide__scroll-line"),
        { scaleY: 0.6, transformOrigin: "bottom left", duration: 2.5, ease: "elastic(1,0.5)" },
        1.4
      );

    // Parallax images
    const imgWraps = slide.querySelectorAll(".philosophy-col__image-wrap");
    gsap.fromTo(
      imgWraps,
      { y: "-20vh" },
      {
        y: "20vh",
        scrollTrigger: { trigger: slide, scrub: true, start: "top bottom" },
        ease: "none",
      }
    );
  });
})();