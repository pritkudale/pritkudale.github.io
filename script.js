// ===== DOM Elements =====
const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');
const navLinks = document.querySelectorAll('.nav-link');
const backToTop = document.getElementById('backToTop');
const typedText = document.getElementById('typed-text');
const contactForm = document.getElementById('contact-form');
const yearSpan = document.getElementById('year');

// ===== Set Current Year =====
yearSpan.textContent = new Date().getFullYear();

// ===== Typing Animation =====
const titles = ['Developer', 'Designer', 'Problem Solver', 'Tech Enthusiast'];
let titleIndex = 0;
let charIndex = 0;
let isDeleting = false;
let typingSpeed = 100;

function typeEffect() {
    const currentTitle = titles[titleIndex];
    
    if (isDeleting) {
        typedText.textContent = currentTitle.substring(0, charIndex - 1);
        charIndex--;
        typingSpeed = 50;
    } else {
        typedText.textContent = currentTitle.substring(0, charIndex + 1);
        charIndex++;
        typingSpeed = 100;
    }
    
    if (!isDeleting && charIndex === currentTitle.length) {
        isDeleting = true;
        typingSpeed = 2000; // Pause before deleting
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        titleIndex = (titleIndex + 1) % titles.length;
        typingSpeed = 500; // Pause before typing next
    }
    
    setTimeout(typeEffect, typingSpeed);
}

// Start typing animation
setTimeout(typeEffect, 1000);

// ===== Navbar Scroll Effect =====
function handleScroll() {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
    
    // Back to top button visibility
    if (window.scrollY > 500) {
        backToTop.classList.add('visible');
    } else {
        backToTop.classList.remove('visible');
    }
    
    // Update active nav link
    updateActiveNavLink();
}

window.addEventListener('scroll', handleScroll);

// ===== Mobile Menu Toggle =====
hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
    document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
});

// Close menu when clicking a link
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.style.overflow = '';
    });
});

// ===== Active Navigation Link =====
function updateActiveNavLink() {
    const sections = document.querySelectorAll('section');
    const scrollPosition = window.scrollY + 100;
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}

// ===== Smooth Scroll =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// ===== Stats Counter Animation =====
function animateStats() {
    const stats = document.querySelectorAll('.stat-number');
    
    stats.forEach(stat => {
        const target = parseInt(stat.getAttribute('data-count'));
        const duration = 2000;
        const increment = target / (duration / 16);
        let current = 0;
        
        const updateCount = () => {
            current += increment;
            if (current < target) {
                stat.textContent = Math.ceil(current);
                requestAnimationFrame(updateCount);
            } else {
                stat.textContent = target;
            }
        };
        
        updateCount();
    });
}

// ===== Skills Progress Animation =====
function animateSkills() {
    const skillBars = document.querySelectorAll('.skill-progress');
    
    skillBars.forEach(bar => {
        const progress = bar.getAttribute('data-progress');
        bar.style.width = `${progress}%`;
    });
}

// ===== Intersection Observer for Animations =====
const observerOptions = {
    threshold: 0.2,
    rootMargin: '0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            if (entry.target.classList.contains('about')) {
                animateStats();
            }
            if (entry.target.classList.contains('skills')) {
                animateSkills();
            }
            entry.target.classList.add('animated');
        }
    });
}, observerOptions);

// Observe sections
document.querySelectorAll('.section').forEach(section => {
    observer.observe(section);
});

// ===== Contact Form Handling =====
contactForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(this);
    const data = Object.fromEntries(formData);
    
    // Here you would typically send the data to a server
    // For now, we'll just show an alert
    console.log('Form submitted:', data);
    
    // Show success message
    alert('Thank you for your message! I will get back to you soon.');
    
    // Reset form
    this.reset();
});

// ===== Parallax Effect for Hero Section =====
document.addEventListener('mousemove', (e) => {
    const heroBlob = document.querySelector('.hero-blob');
    const heroAvatar = document.querySelector('.hero-avatar');
    
    if (heroBlob && heroAvatar) {
        const x = (e.clientX / window.innerWidth - 0.5) * 20;
        const y = (e.clientY / window.innerHeight - 0.5) * 20;
        
        heroBlob.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
        heroAvatar.style.transform = `translate(calc(-50% + ${-x * 0.5}px), calc(-50% + ${-y * 0.5}px))`;
    }
});

// ===== Page Load Animation =====
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});

// ===== Scroll Reveal Animation =====
function reveal() {
    const reveals = document.querySelectorAll('.skill-card, .project-card, .contact-item');
    
    reveals.forEach(element => {
        const windowHeight = window.innerHeight;
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;
        
        if (elementTop < windowHeight - elementVisible) {
            element.classList.add('active');
        }
    });
}

window.addEventListener('scroll', reveal);
reveal(); // Initial check

// ===== Add CSS for reveal animation =====
const style = document.createElement('style');
style.textContent = `
    .skill-card,
    .project-card,
    .contact-item {
        opacity: 0;
        transform: translateY(30px);
        transition: all 0.6s ease;
    }
    
    .skill-card.active,
    .project-card.active,
    .contact-item.active {
        opacity: 1;
        transform: translateY(0);
    }
    
    .skill-card:nth-child(1) { transition-delay: 0.1s; }
    .skill-card:nth-child(2) { transition-delay: 0.2s; }
    .skill-card:nth-child(3) { transition-delay: 0.3s; }
    .skill-card:nth-child(4) { transition-delay: 0.4s; }
    .skill-card:nth-child(5) { transition-delay: 0.5s; }
    .skill-card:nth-child(6) { transition-delay: 0.6s; }
    .skill-card:nth-child(7) { transition-delay: 0.7s; }
    .skill-card:nth-child(8) { transition-delay: 0.8s; }
    
    .project-card:nth-child(1) { transition-delay: 0.1s; }
    .project-card:nth-child(2) { transition-delay: 0.2s; }
    .project-card:nth-child(3) { transition-delay: 0.3s; }
    
    .contact-item:nth-child(1) { transition-delay: 0.1s; }
    .contact-item:nth-child(2) { transition-delay: 0.2s; }
    .contact-item:nth-child(3) { transition-delay: 0.3s; }
`;
document.head.appendChild(style);
