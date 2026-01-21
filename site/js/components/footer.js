!(function () {
    function e() {
        // gsap.registerPlugin(ScrollTrigger);
        const e = new Date().getFullYear();
        document.getElementById("ahy-copyright").textContent = `©${e} AHY CONSULTING`;
        const t = document.querySelector(".ahy-big-text-container");
        t.querySelectorAll("#ahy-bigTextBase, #ahy-bigTextOverlay").forEach((e) => {
            const t = e.textContent;
            e.innerHTML = "";
            for (let o of t) {
                const t = document.createElement("p");
                (t.className = "ahy-letter"), (t.textContent = o), e.appendChild(t);
            }
        });
        const o = document.querySelector(".ahy-footer");
        gsap.to(o, { scrollTrigger: { trigger: ".ahy-footer", start: "top 40%", end: "top 20%", markers: !1, scrub: 1, onEnter: () => o.classList.add("ahy-absorbing"), onLeaveBack: () => o.classList.remove("ahy-absorbing") } }),
            gsap.to(".ahy-letter", { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: "power3.out", scrollTrigger: { trigger: ".ahy-footer", start: "top 80%", end: "top 30%", toggleActions: "play none none reverse" } }),
            gsap.fromTo(".ahy-social-link", { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: "power2.out", scrollTrigger: { trigger: ".ahy-social-links", start: "top 85%", toggleActions: "play none none reverse" } });
    }
    "loading" === document.readyState ? document.addEventListener("DOMContentLoaded", e) : e();
})();
