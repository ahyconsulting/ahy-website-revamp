!(function () {
  function e() {
    const e = document.querySelector(".menu-toggle"),
      t = document.querySelector(".overlay"),
      o = document.querySelector(".overlay-menu"),
      s = document.querySelector(".hamburger");
    if (!(e && t && o && s)) return;
    let n = !1;

    // Helper to lock body scroll without causing a layout shift (prevents mobile flash)
    function lockBody() {
      const scrollY = window.scrollY || window.pageYOffset || 0;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.width = '100%';
      document.body.dataset.scrollY = String(scrollY);
    }

    function unlockBody() {
      const stored = document.body.dataset.scrollY;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.width = '';
      if (stored) {
        window.scrollTo(0, parseInt(stored, 10));
        delete document.body.dataset.scrollY;
      }
    }

    window.matchMedia &&
      window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
      (e.addEventListener("mouseenter", () => e.classList.add("is-hover")),
      e.addEventListener("mouseleave", () => e.classList.remove("is-hover")));
    const i = gsap.timeline({ paused: !0, defaults: { ease: "power3.out" } });
    (i
      .to(".block", {
        duration: 1,
        y: "0%",
        stagger: 0.075,
        ease: "power3.inOut",
      })
      .to(".modern-menu", { opacity: 1, duration: 0.3 }, "-=0.6")
      .to(
        ".modern-menu-item",
        { opacity: 1, y: 0, stagger: 0.07, duration: 0.6 },
        "-=0.3",
      ),
      e.addEventListener("click", () => {
        i.isActive() ||
          (n
            ? (e.classList.remove("opened"),
              s.classList.remove("active"),
              i.reverse(),
              i.eventCallback("onReverseComplete", () => {
                (e.classList.remove("is-hover"),
                  t.classList.remove("active"),
                  o.classList.remove("active"),
                  unlockBody(),
                  gsap.set(".modern-menu", { opacity: 0 }));
              }))
            : (e.classList.remove("is-hover"),
              t.classList.add("active"),
              o.classList.add("active"),
              e.classList.add("opened"),
              s.classList.add("active"),
              lockBody(),
              gsap.set(".modern-menu-item", { opacity: 0, y: 40 }),
              i.play()),
          (n = !n));
      }));
    const a = document.querySelectorAll(".has-submenu"),
      r = [];
    function d(e) {
      r.forEach((t) => {
        t.item !== e &&
          t.isOpen &&
          (t.animation.reverse(),
          t.item.classList.remove("open"),
          (t.isOpen = !1));
      });
    }
    (a.forEach((e) => {
      const t = e.querySelector(".submenu");
      if (!t) return;
      const o = gsap.timeline({ paused: !0 });
      (o.fromTo(
        t,
        { height: 0, opacity: 0, y: -10, pointerEvents: "none" },
        {
          height: "auto",
          opacity: 1,
          y: 0,
          duration: 0.55,
          pointerEvents: "auto",
          ease: "power2.out",
        },
      ),
        r.push({ item: e, animation: o, isOpen: !1 }));
    }),
      r.forEach((e) => {
        const { item: t, animation: o } = e;
        (t.addEventListener("mouseenter", () => {
          window.innerWidth > 768 &&
            (d(t), o.play(), t.classList.add("open"), (e.isOpen = !0));
        }),
          t.addEventListener("mouseleave", () => {
            window.innerWidth > 768 &&
              (o.reverse(), t.classList.remove("open"), (e.isOpen = !1));
          }),
          t.addEventListener("click", (s) => {
            window.innerWidth <= 768 &&
              (s.stopPropagation(),
              d(t),
              e.isOpen
                ? (o.reverse(), t.classList.remove("open"), (e.isOpen = !1))
                : (o.play(), t.classList.add("open"), (e.isOpen = !0)));
          }));
      }));
    document.querySelectorAll(".submenu").forEach((e) => {
      e.addEventListener("mouseenter", (e) => {
        e.stopPropagation();
      });
    });
  }
  "loading" === document.readyState
    ? document.addEventListener("DOMContentLoaded", e)
    : e();
})();
