// Premium horizontal scroll with smooth, refined motion
const scrollContainer = document.querySelector('.scroll-container');
const contentWrapper = document.querySelector('.content-wrapper');

// Parallax elements
const imageContainers = document.querySelectorAll('.image-container');
const mainTitle = document.querySelector('.main-title');

// Scroll state
let targetScroll = 0;
let currentScroll = 0;
let scrollVelocity = 0;
let animationId = null;

// Configuration for premium feel
const config = {
    sensitivity: 0.05,       // Base scroll sensitivity (lower = more controlled)
    smoothness: 0.12,        // Interpolation factor (lower = smoother, more lag)
    friction: 0.95,          // Velocity decay (higher = slower stop)
    minVelocity: 0.1,        // Minimum velocity threshold
    maxVelocity: 20,         // Maximum velocity cap for control
    touchSensitivity: 0.8,   // Touch scroll multiplier
    parallaxSpeed: 1.2       // Parallax multiplier for images (1.2x faster than normal)
};

// Get maximum scroll distance
const getMaxScroll = () => {
    return Math.max(0, contentWrapper.scrollWidth - window.innerWidth);
};

// Easing function for premium feel
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

// Store initial positions of parallax elements
const initialPositions = new Map();

// Initialize parallax elements
const initializeParallax = () => {
    imageContainers.forEach((container, index) => {
        const rect = container.getBoundingClientRect();
        const computedStyle = window.getComputedStyle(container);
        const left = parseFloat(computedStyle.left);
        
        initialPositions.set(container, {
            left: left,
            index: index
        });
    });
};

// Apply parallax transforms
const updateParallax = (scrollPosition) => {
    // Calculate parallax offset
    const parallaxOffset = scrollPosition * (config.parallaxSpeed - 1);
    
    // Apply to images (move faster than scroll)
    imageContainers.forEach((container) => {
        const initialData = initialPositions.get(container);
        if (initialData) {
            const newLeft = initialData.left - parallaxOffset;
            container.style.transform = `translateX(${-parallaxOffset}px)`;
        }
    });
    
    // Main title stays at normal speed (no additional transform needed)
    // The container itself handles the base scroll, parallax adds extra movement
};

// Smooth animation loop
const animate = () => {
    // Apply velocity to target
    targetScroll += scrollVelocity;
    
    // Clamp to bounds with soft resistance at edges
    const maxScroll = getMaxScroll();
    if (targetScroll < 0) {
        targetScroll = 0;
        scrollVelocity *= 0.5; // Dampen velocity at edges
    } else if (targetScroll > maxScroll) {
        targetScroll = maxScroll;
        scrollVelocity *= 0.5;
    }
    
    // Smooth interpolation with easing
    const delta = targetScroll - currentScroll;
    const interpolation = delta * config.smoothness;
    currentScroll += interpolation;
    
    // Apply to DOM
    scrollContainer.scrollLeft = currentScroll;
    
    // Update parallax effects
    updateParallax(currentScroll);
    
    // Apply friction
    scrollVelocity *= config.friction;
    
    // Continue animation if moving
    if (Math.abs(scrollVelocity) > config.minVelocity || Math.abs(delta) > 0.5) {
        animationId = requestAnimationFrame(animate);
    } else {
        animationId = null;
        scrollVelocity = 0;
    }
};

// Start animation if needed
const startAnimation = () => {
    if (!animationId) {
        animationId = requestAnimationFrame(animate);
    }
};

// Handle wheel events with premium feel
let accumulatedDelta = 0;
let lastWheelTime = 0;

window.addEventListener('wheel', (e) => {
    e.preventDefault();
    
    const now = performance.now();
    const timeDelta = now - lastWheelTime;
    lastWheelTime = now;
    
    // Normalize deltaY across browsers
    const normalizedDelta = Math.sign(e.deltaY) * Math.min(Math.abs(e.deltaY), 100);
    
    // Accumulate small movements for smoother response
    if (timeDelta < 50) {
        accumulatedDelta += normalizedDelta * config.sensitivity;
    } else {
        accumulatedDelta = normalizedDelta * config.sensitivity;
    }
    
    // Apply accumulated delta to velocity with capping
    const newVelocity = accumulatedDelta * 0.8;
    scrollVelocity = Math.sign(newVelocity) * Math.min(Math.abs(newVelocity), config.maxVelocity);
    
    // Reset accumulator
    if (timeDelta > 100) {
        accumulatedDelta = 0;
    }
    
    startAnimation();
}, { passive: false });

// Premium keyboard navigation with smooth transitions
window.addEventListener('keydown', (e) => {
    const pageScroll = window.innerWidth * 0.8;
    const smoothKeyScroll = 25; // Velocity for smooth key scrolling
    
    switch(e.key) {
        case 'ArrowRight':
            e.preventDefault();
            targetScroll = Math.min(currentScroll + pageScroll, getMaxScroll());
            scrollVelocity = smoothKeyScroll;
            startAnimation();
            break;
        case 'ArrowLeft':
            e.preventDefault();
            targetScroll = Math.max(currentScroll - pageScroll, 0);
            scrollVelocity = -smoothKeyScroll;
            startAnimation();
            break;
        case 'Home':
            e.preventDefault();
            targetScroll = 0;
            scrollVelocity = -smoothKeyScroll * 1.5;
            startAnimation();
            break;
        case 'End':
            e.preventDefault();
            targetScroll = getMaxScroll();
            scrollVelocity = smoothKeyScroll * 1.5;
            startAnimation();
            break;
    }
});

// Touch support with momentum
let touchStartY = 0;
let touchStartX = 0;
let touchStartTime = 0;
let touchStartScroll = 0;
let lastTouchY = 0;
let lastTouchTime = 0;
let touchVelocities = [];

scrollContainer.addEventListener('touchstart', (e) => {
    const touch = e.touches[0];
    touchStartY = touch.clientY;
    touchStartX = touch.clientX;
    touchStartTime = performance.now();
    touchStartScroll = currentScroll;
    lastTouchY = touchStartY;
    lastTouchTime = touchStartTime;
    touchVelocities = [];
    
    // Stop any ongoing animation
    scrollVelocity = 0;
    targetScroll = currentScroll;
});

scrollContainer.addEventListener('touchmove', (e) => {
    e.preventDefault();
    
    const touch = e.touches[0];
    const now = performance.now();
    
    // Calculate movement with natural scrolling for mobile
    // Invert both deltas for natural touch behavior
    const deltaY = (touch.clientY - touchStartY) * config.touchSensitivity;
    const deltaX = touch.clientX - touchStartX;
    
    // Update target position
    targetScroll = touchStartScroll - deltaY - deltaX;
    targetScroll = Math.max(0, Math.min(targetScroll, getMaxScroll()));
    
    // Track velocity for momentum
    const timeDelta = now - lastTouchTime;
    if (timeDelta > 0) {
        const velocity = (touch.clientY - lastTouchY) / timeDelta * 16;
        touchVelocities.push(velocity);
        if (touchVelocities.length > 3) {
            touchVelocities.shift();
        }
    }
    
    lastTouchY = touch.clientY;
    lastTouchTime = now;
    
    // Immediate but smooth update
    if (!animationId) {
        currentScroll = targetScroll;
        scrollContainer.scrollLeft = currentScroll;
        updateParallax(currentScroll);
    }
});

scrollContainer.addEventListener('touchend', () => {
    // Calculate average velocity for smooth momentum
    if (touchVelocities.length > 0) {
        const avgVelocity = touchVelocities.reduce((a, b) => a + b, 0) / touchVelocities.length;
        // Natural scrolling: positive velocity for momentum
        scrollVelocity = avgVelocity * config.touchSensitivity * 15;
        scrollVelocity = Math.sign(scrollVelocity) * Math.min(Math.abs(scrollVelocity), config.maxVelocity);
        startAnimation();
    }
});

// Handle window resize gracefully
window.addEventListener('resize', () => {
    const maxScroll = getMaxScroll();
    if (targetScroll > maxScroll) {
        targetScroll = maxScroll;
        currentScroll = maxScroll;
        scrollContainer.scrollLeft = maxScroll;
    }
    
    // Reinitialize parallax positions after resize
    initializeParallax();
    updateParallax(currentScroll);
});

// Initialize
currentScroll = scrollContainer.scrollLeft;
targetScroll = currentScroll;

// Initialize parallax system
initializeParallax();

// Set initial parallax state
updateParallax(currentScroll);