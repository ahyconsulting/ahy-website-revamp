(function () {
    function initHeader() {
        class DraggableMarquee {
            constructor(marquee) {
                this.marquee = marquee;
                this.content = marquee.querySelector(
                    ".outecgy-marquee-content"
                );
                this.direction = marquee.dataset.direction || "left";
                this.isDragging = false;
                this.startX = 0;
                this.currentX = 0;
                this.translateX = 0;
                this.velocity = 0;
                this.lastX = 0;
                this.lastTime = 0;
                this.animationId = null;
                this.autoScrollId = null;
                this.autoScrollSpeed = this.direction === "left" ? -1 : 1;

                this.init();
            }

            init() {
                const originalChildren = Array.from(this.content.children);
                this.originalItemCount = originalChildren.length;

                for (let i = 0; i < 5; i++) {
                    originalChildren.forEach((child) => {
                        this.content.appendChild(child.cloneNode(true));
                    });
                }

                setTimeout(() => {
                    this.itemWidth = this.content.children[0].offsetWidth;
                    this.singleSetWidth =
                        this.itemWidth * this.originalItemCount;
                    this.totalWidth =
                        this.itemWidth * this.content.children.length;

                    this.translateX = -this.singleSetWidth * 2;
                    this.updateTransform();
                }, 0);

                this.bindEvents();
                this.startAutoScroll();
            }

            bindEvents() {
                this.marquee.addEventListener(
                    "mousedown",
                    this.onDragStart.bind(this)
                );
                document.addEventListener(
                    "mousemove",
                    this.onDragMove.bind(this)
                );
                document.addEventListener("mouseup", this.onDragEnd.bind(this));

                this.marquee.addEventListener(
                    "touchstart",
                    this.onDragStart.bind(this),
                    { passive: true }
                );
                document.addEventListener(
                    "touchmove",
                    this.onDragMove.bind(this),
                    { passive: false }
                );
                document.addEventListener(
                    "touchend",
                    this.onDragEnd.bind(this)
                );
            }

            onDragStart(e) {
                this.isDragging = true;
                this.content.classList.add("dragging");
                this.startX = e.type.includes("mouse")
                    ? e.pageX
                    : e.touches[0].pageX;
                this.currentX = this.startX;
                this.lastX = this.startX;
                this.lastTime = Date.now();
                this.velocity = 0;

                this.stopAutoScroll();
                cancelAnimationFrame(this.animationId);
            }

            onDragMove(e) {
                if (!this.isDragging) return;

                e.preventDefault();

                const x = e.type.includes("mouse")
                    ? e.pageX
                    : e.touches[0].pageX;
                const currentTime = Date.now();
                const timeDiff = Math.max(currentTime - this.lastTime, 1);

                if (timeDiff > 0) {
                    this.velocity = ((x - this.lastX) / timeDiff) * 20;
                }

                this.lastX = x;
                this.lastTime = currentTime;

                const deltaX = x - this.currentX;
                this.currentX = x;
                this.translateX += deltaX;

                this.checkBoundaries();
                this.updateTransform();
            }

            onDragEnd() {
                if (!this.isDragging) return;

                this.isDragging = false;
                this.content.classList.remove("dragging");

                if (Math.abs(this.velocity) > 0.3) {
                    this.applyMomentum();
                } else {
                    this.startAutoScroll();
                }
            }

            applyMomentum() {
                if (Math.abs(this.velocity) < 0.05) {
                    this.startAutoScroll();
                    return;
                }

                this.translateX += this.velocity;
                this.velocity *= 0.97;

                this.checkBoundaries();
                this.updateTransform();

                this.animationId = requestAnimationFrame(() =>
                    this.applyMomentum()
                );
            }

            startAutoScroll() {
                this.stopAutoScroll();

                const scroll = () => {
                    if (this.isDragging) return;

                    this.translateX += this.autoScrollSpeed;
                    this.checkBoundaries();
                    this.updateTransform();

                    this.autoScrollId = requestAnimationFrame(scroll);
                };

                this.autoScrollId = requestAnimationFrame(scroll);
            }

            stopAutoScroll() {
                if (this.autoScrollId) {
                    cancelAnimationFrame(this.autoScrollId);
                    this.autoScrollId = null;
                }
            }

            checkBoundaries() {
                if (!this.singleSetWidth) return;

                const minBound = -this.singleSetWidth * 4;
                const maxBound = -this.singleSetWidth;

                if (this.translateX > maxBound) {
                    const offset =
                        (this.translateX - maxBound) % this.singleSetWidth;
                    this.translateX = minBound + offset;
                } else if (this.translateX < minBound) {
                    const offset =
                        (minBound - this.translateX) % this.singleSetWidth;
                    this.translateX = maxBound - offset;
                }
            }

            updateTransform() {
                this.content.style.transform = `translateX(${this.translateX}px)`;
            }
        }

        // Initialize all marquees
        document.querySelectorAll(".outecgy-marquee").forEach((marquee) => {
            new DraggableMarquee(marquee);
        });
    }

    // DOM Ready
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initHeader);
    } else {
        initHeader();
    }
})();
