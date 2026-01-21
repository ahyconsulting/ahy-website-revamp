class ComponentLoader {
    constructor() {
        this.componentsPath = './components/';
        this.cssPath = './css/components/';
        this.jsPath = './js/components/';
        this.loadedComponents = new Set();
        this.loadingQueue = [];
        this.isProcessingQueue = false;
        
        this.observer = new IntersectionObserver(this.handleIntersection.bind(this), {
            rootMargin: '100px' // Increased for earlier loading
        });
    }

    async yieldToMain() {
        return new Promise(resolve => {
            if ('scheduler' in window && 'yield' in scheduler) {
                scheduler.yield().then(resolve);
            } else {
                setTimeout(resolve, 0);
            }
        });
    }

    shouldYield() {
        return navigator.scheduling?.isInputPending?.() || false;
    }

    async loadComponent(name) {
        if (this.loadedComponents.has(name)) return;

        try {
            // Load HTML
            const htmlResponse = await fetch(`${this.componentsPath}${name}.html`);
            const html = await htmlResponse.text();

            // Load CSS in parallel
            const cssPromise = this.loadCSS(name);

            await this.yieldToMain();

            // Insert HTML
            const placeholders = document.querySelectorAll(`[data-component="${name}"]`);
            placeholders.forEach(placeholder => {
                placeholder.innerHTML = html;
                placeholder.removeAttribute('data-component');
            });

            // Wait for CSS
            await cssPromise;
            
            await this.yieldToMain();

            // Load JS last
            await this.loadJS(name);

            this.loadedComponents.add(name);
        } catch (error) {
            console.error(`Error loading component ${name}:`, error);
        }
    }

    loadCSS(name) {
        return new Promise((resolve) => {
            const existing = document.querySelector(`link[href*="${name}.css"]`);
            if (existing) {
                resolve();
                return;
            }

            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = `${this.cssPath}${name}.css`;
            link.onload = resolve;
            link.onerror = () => resolve();
            document.head.appendChild(link);
        });
    }

    loadJS(name) {
        return new Promise((resolve) => {
            const existing = document.querySelector(`script[src*="${name}.js"]`);
            if (existing) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = `${this.jsPath}${name}.js`;
            script.async = true;
            script.onload = resolve;
            script.onerror = () => resolve();
            document.body.appendChild(script);
        });
    }

    handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const name = entry.target.getAttribute('data-component');
                if (name) {
                    this.loadComponent(name);
                    this.observer.unobserve(entry.target);
                }
            }
        });
    }

    async processQueue() {
        if (this.isProcessingQueue || this.loadingQueue.length === 0) return;
        
        this.isProcessingQueue = true;

        while (this.loadingQueue.length > 0) {
            const name = this.loadingQueue.shift();
            await this.loadComponent(name);
            await this.yieldToMain();
        }

        this.isProcessingQueue = false;
    }

    async queueRemainingComponents() {
        // Wait briefly for critical content
        await new Promise(resolve => setTimeout(resolve, 100));

        const remaining = document.querySelectorAll('[data-component]');
        const componentNames = new Set();
        
        remaining.forEach(el => {
            const name = el.getAttribute('data-component');
            if (name && !this.loadedComponents.has(name)) {
                componentNames.add(name);
            }
        });

        this.loadingQueue.push(...componentNames);

        if ('requestIdleCallback' in window) {
            requestIdleCallback(() => this.processQueue(), { timeout: 2000 });
        } else {
            setTimeout(() => this.processQueue(), 500);
        }
    }

    async loadAll() {
        // CRITICAL: Load ONLY heroSection first - nothing else!
        // Header and badge can load after
        await this.loadComponent('heroSection');
        
        // Dispatch event IMMEDIATELY after hero loads
        document.dispatchEvent(new CustomEvent('componentsLoaded'));

        // Load header and badge in background
        const secondaryComponents = ['header', 'rotatingBadge'];
        
        requestAnimationFrame(async () => {
            for (const name of secondaryComponents) {
                await this.loadComponent(name);
                await this.yieldToMain();
            }
            
            // Observe remaining components for lazy loading
            const allComponents = document.querySelectorAll('[data-component]');
            allComponents.forEach(el => {
                this.observer.observe(el);
            });
            
            // Queue and load remaining in background
            this.queueRemainingComponents();
        });
    }

    destroy() {
        this.observer.disconnect();
        this.loadingQueue = [];
    }
}

// Initialize immediately - don't wait for DOMContentLoaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        const loader = new ComponentLoader();
        loader.loadAll();
        window.componentLoader = loader;
    });
} else {
    const loader = new ComponentLoader();
    loader.loadAll();
    window.componentLoader = loader;
}