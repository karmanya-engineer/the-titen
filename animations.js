// Optimized Animation Utilities using requestAnimationFrame and CSS Transforms
class AnimationManager {
    constructor() {
        this.animationFrame = null;
        this.activeAnimations = new Map();
    }

    // Smooth fade in animation using requestAnimationFrame
    fadeIn(element, duration = 300, callback) {
        if (!element) return;
        
        element.style.opacity = '0';
        element.style.display = 'block';
        
        const startTime = performance.now();
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function for smooth animation
            const eased = this.easeOutCubic(progress);
            element.style.opacity = eased;
            
            if (progress < 1) {
                this.animationFrame = requestAnimationFrame(animate);
            } else {
                element.style.opacity = '1';
                if (callback) callback();
            }
        };
        
        requestAnimationFrame(animate);
    }

    // Smooth fade out animation
    fadeOut(element, duration = 300, callback) {
        if (!element) return;
        
        const startOpacity = parseFloat(getComputedStyle(element).opacity) || 1;
        const startTime = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const eased = this.easeOutCubic(progress);
            element.style.opacity = startOpacity * (1 - eased);
            
            if (progress < 1) {
                this.animationFrame = requestAnimationFrame(animate);
            } else {
                element.style.opacity = '0';
                element.style.display = 'none';
                if (callback) callback();
            }
        };
        
        requestAnimationFrame(animate);
    }

    // Slide in from direction
    slideIn(element, direction = 'up', duration = 300, callback) {
        if (!element) return;
        
        const transforms = {
            up: { from: 'translateY(30px)', to: 'translateY(0)' },
            down: { from: 'translateY(-30px)', to: 'translateY(0)' },
            left: { from: 'translateX(30px)', to: 'translateX(0)' },
            right: { from: 'translateX(-30px)', to: 'translateX(0)' }
        };
        
        const transform = transforms[direction] || transforms.up;
        element.style.transform = transform.from;
        element.style.opacity = '0';
        element.style.display = 'block';
        
        const startTime = performance.now();
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const eased = this.easeOutCubic(progress);
            const translateY = direction === 'up' || direction === 'down' 
                ? `translateY(${direction === 'up' ? 30 * (1 - eased) : -30 * (1 - eased)}px)`
                : `translateX(${direction === 'left' ? 30 * (1 - eased) : -30 * (1 - eased)}px)`;
            
            element.style.transform = translateY;
            element.style.opacity = eased;
            
            if (progress < 1) {
                this.animationFrame = requestAnimationFrame(animate);
            } else {
                element.style.transform = transform.to;
                element.style.opacity = '1';
                if (callback) callback();
            }
        };
        
        requestAnimationFrame(animate);
    }

    // Scale animation
    scale(element, from = 0.8, to = 1, duration = 300, callback) {
        if (!element) return;
        
        element.style.transform = `scale(${from})`;
        element.style.opacity = '0';
        element.style.display = 'block';
        
        const startTime = performance.now();
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const eased = this.easeOutBack(progress);
            const scale = from + (to - from) * eased;
            
            element.style.transform = `scale(${scale})`;
            element.style.opacity = eased;
            
            if (progress < 1) {
                this.animationFrame = requestAnimationFrame(animate);
            } else {
                element.style.transform = `scale(${to})`;
                element.style.opacity = '1';
                if (callback) callback();
            }
        };
        
        requestAnimationFrame(animate);
    }

    // Pulse animation
    pulse(element, scale = 1.05, duration = 1000) {
        if (!element) return;
        
        const originalTransform = element.style.transform || 'scale(1)';
        const startTime = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = (elapsed % duration) / duration;
            const pulseScale = 1 + (scale - 1) * Math.sin(progress * Math.PI * 2);
            
            element.style.transform = `scale(${pulseScale})`;
            
            this.animationFrame = requestAnimationFrame(animate);
        };
        
        requestAnimationFrame(animate);
        return () => {
            cancelAnimationFrame(this.animationFrame);
            element.style.transform = originalTransform;
        };
    }

    // Easing functions
    easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    easeOutBack(t) {
        const c1 = 1.70158;
        const c3 = c1 + 1;
        return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
    }

    easeInOutQuad(t) {
        return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    }

    // Cancel all animations
    cancel() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
    }
}

// Global animation manager instance
const animationManager = new AnimationManager();

// Enhanced event listener utilities with delegation
class EventManager {
    constructor() {
        this.listeners = new Map();
    }

    // Add event listener with automatic cleanup
    on(element, event, handler, options = {}) {
        if (!element) return;
        
        const key = `${element.id || element.className || 'element'}_${event}`;
        
        // Store handler for potential removal
        if (!this.listeners.has(key)) {
            this.listeners.set(key, []);
        }
        
        const wrappedHandler = (e) => {
            if (options.delegation && !e.target.closest(options.delegation)) {
                return;
            }
            handler(e);
        };
        
        element.addEventListener(event, wrappedHandler, options);
        this.listeners.get(key).push({ handler: wrappedHandler, options });
        
        return () => this.off(element, event, wrappedHandler);
    }

    // Remove event listener
    off(element, event, handler) {
        if (!element) return;
        const key = `${element.id || element.className || 'element'}_${event}`;
        const handlers = this.listeners.get(key);
        if (handlers) {
            handlers.forEach(({ handler: storedHandler }) => {
                element.removeEventListener(event, storedHandler);
            });
            this.listeners.delete(key);
        }
    }

    // Delegate event to parent (for dynamically added elements)
    delegate(parent, selector, event, handler, options = {}) {
        return this.on(parent, event, (e) => {
            const target = e.target.closest(selector);
            if (target) {
                handler.call(target, e, target);
            }
        }, options);
    }

    // One-time event listener
    once(element, event, handler) {
        const wrapper = (e) => {
            handler(e);
            this.off(element, event, wrapper);
        };
        this.on(element, event, wrapper);
    }

    // Cleanup all listeners
    cleanup() {
        this.listeners.forEach((handlers, key) => {
            const [elementId, event] = key.split('_');
            handlers.forEach(({ handler }) => {
                const element = document.getElementById(elementId) || document.querySelector(`.${elementId}`);
                if (element) {
                    element.removeEventListener(event, handler);
                }
            });
        });
        this.listeners.clear();
    }
}

// Global event manager instance
const eventManager = new EventManager();

// Optimized scroll animations using Intersection Observer
class ScrollAnimations {
    constructor() {
        this.observer = null;
        this.init();
    }

    init() {
        const options = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    this.observer.unobserve(entry.target);
                }
            });
        }, options);
    }

    observe(element) {
        if (element && this.observer) {
            this.observer.observe(element);
        }
    }

    observeAll(selector) {
        document.querySelectorAll(selector).forEach(el => this.observe(el));
    }
}

// Global scroll animations instance
const scrollAnimations = new ScrollAnimations();

