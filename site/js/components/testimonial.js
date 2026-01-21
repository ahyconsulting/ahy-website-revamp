(() => {
  gsap.registerPlugin(SplitText, ScrollTrigger);

  const testimonialSection = document.querySelector(".testimonials-section");
  const images = document.querySelectorAll(".testimonial-image-container");
  const highlight = document.querySelector(".active-testimonial-image-highlight");
  const stickyContainer = document.querySelector(".sticky-images-container");
  const contents = document.querySelectorAll(".testimonial-content-container");

  let initialized = false;

  const initObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !initialized) {
        initialized = true;
        initTestimonials();
        initObserver.disconnect();
      }
    });
  }, { rootMargin: "20% 0px" });

  initObserver.observe(testimonialSection);

  function initTestimonials() {

    ScrollTrigger.create({
      trigger: ".testimonials-section-container",
      start: "top+=150 top",
      end: "bottom bottom",
      pin: ".sticky-images-container",
      pinSpacing: false
    });

    ScrollTrigger.create({
      trigger: ".testimonials-section-container",
      start: "top top",
      end: "bottom bottom-=230px",
      pin: ".testimonials-accent-graphic-container",
      pinSpacing: false
    });

    function updateHighlight(index) {
      const imgRect = images[index].getBoundingClientRect();
      const containerRect = stickyContainer.getBoundingClientRect();
      const paddingTop = parseFloat(getComputedStyle(stickyContainer).paddingTop) || 0;

      highlight.style.width = `${imgRect.width}px`;
      highlight.style.height = `${imgRect.height}px`;
      highlight.style.transform =
        `translateX(-50%) translateY(${imgRect.top - containerRect.top - paddingTop}px)`;

      highlight.classList.add("visible");

      images.forEach((img, i) => img.classList.toggle("active", i === index));
    }

    window.addEventListener("load", () => updateHighlight(0));

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        const index = Array.from(contents).indexOf(entry.target);
        updateHighlight(index);

        contents.forEach((content, i) => {
          const text = content.querySelector(".testimonial-text");
          if (text) text.style.opacity = i === index ? "1" : "0.8";
        });
      });
    }, { rootMargin: "-45% 0px -45% 0px" });

    contents.forEach(content => observer.observe(content));

    // ===============================
    // TEXT SPLIT ANIMATION (updated)
    // ===============================
    const textSelector = ".testimonial-text";
    const split = new SplitText(textSelector, {
      type: "words",
      wordsClass: "word"
    });

    gsap.set(textSelector, { color: "#333", textShadow: "0 0 4px rgba(178,176,175,0.5)" });
    gsap.set(split.words, {
      opacity: 0.2,
      y: 10,
      scale: 0.95,
      color: "#999",
      textShadow: "0 0 6px rgba(178,176,175,0.5)"
    });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: ".testimonials-section",
        start: "top 40%",
        end: "bottom 95%",
        scrub: true
      },
      onStart: () => gsap.set(textSelector, { visibility: "visible" })
    });

    split.words.forEach(word => {
      tl.fromTo(
        word,
        { opacity: 0.3, y: 15, scale: 0.9, color: "#666", textShadow: "0 0 5px rgba(178,176,175,0.5)" },
        { 
          opacity: 1, y: 0, scale: 1, color: "#fff",
          textShadow: "0 0 8px #b59b03ff, 0 0 12px #d23483ff, 0 0 16px #06c9c9ff",
          ease: "back.out(1)",
          duration: 0.35,
          stagger: { each: 0.03, from: "center" }
        }
      )
      .to(word, {
        textShadow: "0 0 0 rgba(0,0,0,0)",
        duration: 0.2
      }, "<+0.2"); // relative to previous animation, keeps scrub smooth
    });

    ScrollTrigger.refresh();
  }
})();
