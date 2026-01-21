function initScrollSmoother() {
    gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

    ScrollSmoother.create({
        wrapper: "#smooth-wrapper",
        content: "#smooth-content",
        smooth: 1.2,      // smooth scrolling strength
        effects: true     // allow data-speed / data-lag
    });

    console.log("GSAP ScrollSmoother running");
}

initScrollSmoother();