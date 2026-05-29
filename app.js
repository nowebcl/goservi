/* ==========================================================================
   SERVIROV APP ENGINE — INTERACTIVE SPA ROUTER, CANVAS & DYNAMIC ACTIONS
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // 1. STICKY HEADER & SCROLL TO TOP
    // ==========================================
    const header = document.getElementById('main-header');
    const scrollTopBtn = document.getElementById('btn-scroll-to-top');

    window.addEventListener('scroll', () => {
        const scrollPos = window.scrollY;

        // Header scrolled state
        if (scrollPos > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        // Scroll to top button visibility
        if (scrollPos > 400) {
            scrollTopBtn.classList.add('active');
        } else {
            scrollTopBtn.classList.remove('active');
        }
    });

    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });


    // ==========================================
    // 2. MOBILE MENU TOGGLE
    // ==========================================
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const navbar = document.getElementById('navbar');
    const navLinks = document.querySelectorAll('.nav-link');

    mobileMenuToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        mobileMenuToggle.classList.toggle('active');
        navbar.classList.toggle('active');
    });

    // Close menu when clicking links
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenuToggle.classList.remove('active');
            navbar.classList.remove('active');
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!navbar.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
            mobileMenuToggle.classList.remove('active');
            navbar.classList.remove('active');
        }
    });


    // ==========================================
    // 3. SPA ROUTER SYSTEM (HASH BASED)
    // ==========================================
    const sections = document.querySelectorAll('.spa-section');
    const headerLinks = document.querySelectorAll('#navbar .nav-link, #main-footer .footer-links a');
    
    function navigateToSection(targetId) {
        // Encontrar sección correspondiente
        const targetSection = document.getElementById(targetId);
        if (!targetSection) return;

        // Guardar la posición del scroll antes del cambio
        window.scrollTo(0, 0);

        // Desactivar todas las secciones
        sections.forEach(sec => {
            sec.classList.remove('active');
            sec.style.display = 'none';
        });

        // Activar la seleccionada con animación
        targetSection.style.display = 'block';
        
        // Timeout sutil para asegurar el reflow de display y activar la transición CSS
        setTimeout(() => {
            targetSection.classList.add('active');
        }, 30);

        // Actualizar estados del Header y Footer Links
        headerLinks.forEach(link => {
            const linkTab = link.getAttribute('data-tab');
            if (linkTab === targetId) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        // Detener reproducción de video si salimos de la página Inicio
        if (targetId !== 'inicio') {
            const video = document.getElementById('ops-video');
            if (video && !video.paused) {
                video.pause();
                document.getElementById('play-pause-btn').innerHTML = '<i class="fa-solid fa-play"></i>';
                document.querySelector('.video-wrapper-glass').classList.remove('playing');
            }
        }
    }

    // Interceptar clicks de navegación interna
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a[data-tab], a[href^="#"]');
        if (!link) return;

        const href = link.getAttribute('href');
        const tab = link.getAttribute('data-tab');

        if (tab) {
            e.preventDefault();
            window.location.hash = tab;
        } else if (href && href.startsWith('#') && href.length > 1) {
            e.preventDefault();
            window.location.hash = href.substring(1);
        }
    });

    // Lógica para el cargado inicial y cambios de hash
    function handleRouting() {
        const hash = window.location.hash.substring(1);
        const validHashes = ['inicio', 'servicios', 'nosotros', 'contacto'];
        
        if (validHashes.includes(hash)) {
            navigateToSection(hash);
        } else {
            // Default a Inicio
            window.location.hash = 'inicio';
            navigateToSection('inicio');
        }
    }

    window.addEventListener('hashchange', handleRouting);
    // Ejecutar al cargar la página
    handleRouting();


    // ==========================================
    // 4. INTERACTIVE WATER BACKDROP CANVAS
    // ==========================================
    const canvas = document.getElementById('water-backdrop');
    const ctx = canvas.getContext('2d');

    let particles = [];
    const maxParticles = 60;
    
    // Mouse coords to create interaction
    let mouse = { x: null, y: null, radius: 150 };
    
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    window.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    });

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    class WaterParticle {
        constructor() {
            this.reset();
            // Start at random Y
            this.y = Math.random() * canvas.height;
        }

        reset() {
            this.x = Math.random() * canvas.width;
            this.y = canvas.height + Math.random() * 80;
            this.size = Math.random() * 4 + 1; // Bubble / dust size
            this.speedY = -(Math.random() * 0.7 + 0.2); // upward drift
            this.speedX = Math.random() * 0.4 - 0.2; // swaying
            this.amplitude = Math.random() * 1.5 + 0.5;
            this.angle = Math.random() * 100;
            this.alpha = Math.random() * 0.35 + 0.05;
        }

        update() {
            this.y += this.speedY;
            this.angle += 0.01;
            // Wave movement
            this.x += Math.sin(this.angle) * 0.05 * this.amplitude;

            // Interactive response to mouse
            if (mouse.x !== null && mouse.y !== null) {
                const dx = this.x - mouse.x;
                const dy = this.y - mouse.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < mouse.radius) {
                    const force = (mouse.radius - distance) / mouse.radius;
                    const forceX = dx / distance * force * 1.2;
                    this.x += forceX;
                }
            }

            // Recycle if floats out of screen
            if (this.y < -10 || this.x < -10 || this.x > canvas.width + 10) {
                this.reset();
            }
        }

        draw() {
            ctx.save();
            ctx.globalAlpha = this.alpha;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            
            // Soft glow for glowing particles
            if (this.size > 3) {
                ctx.shadowBlur = 8;
                ctx.shadowColor = '#06b6d4';
                ctx.fillStyle = '#22d3ee';
            } else {
                ctx.fillStyle = '#0891b2';
            }
            
            ctx.fill();
            ctx.restore();
        }
    }

    // Populate particles
    for (let i = 0; i < maxParticles; i++) {
        particles.push(new WaterParticle());
    }

    // Background Gradient Wave Lines
    let waveOffset = 0;
    function drawSubmarineWaves() {
        waveOffset += 0.002;
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.02)';
        ctx.lineWidth = 1.5;
        
        ctx.beginPath();
        for (let i = 0; i < canvas.width; i += 10) {
            // Draw a subtle ocean current line
            const y = canvas.height * 0.4 + Math.sin(i * 0.004 + waveOffset) * 40 + Math.cos(i * 0.002 - waveOffset) * 20;
            if (i === 0) ctx.moveTo(i, y);
            else ctx.lineTo(i, y);
        }
        ctx.stroke();

        ctx.strokeStyle = 'rgba(0, 208, 132, 0.015)';
        ctx.beginPath();
        for (let i = 0; i < canvas.width; i += 10) {
            const y = canvas.height * 0.65 + Math.sin(i * 0.003 - waveOffset) * 30 + Math.cos(i * 0.005 + waveOffset) * 15;
            if (i === 0) ctx.moveTo(i, y);
            else ctx.lineTo(i, y);
        }
        ctx.stroke();
    }

    function animateBackdrop() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw deep marine radial gradient
        const bgGrad = ctx.createRadialGradient(canvas.width/2, canvas.height/2, 200, canvas.width/2, canvas.height/2, canvas.width);
        bgGrad.addColorStop(0, '#061326');
        bgGrad.addColorStop(1, '#020813');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw decorative waves
        drawSubmarineWaves();

        // Draw and update particles
        particles.forEach(p => {
            p.update();
            p.draw();
        });

        requestAnimationFrame(animateBackdrop);
    }
    animateBackdrop();


    // ==========================================
    // 5. HERO SLIDER LOGIC
    // ==========================================
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    let currentSlide = 0;
    let slideInterval;

    function resetSliderInterval() {
        clearInterval(slideInterval);
        slideInterval = setInterval(nextSlide, 5500);
    }

    function showSlide(index) {
        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));

        slides[index].classList.add('active');
        dots[index].classList.add('active');
        currentSlide = index;
    }

    function nextSlide() {
        let next = (currentSlide + 1) % slides.length;
        showSlide(next);
    }

    // Dots listeners
    dots.forEach((dot, idx) => {
        dot.addEventListener('click', () => {
            showSlide(idx);
            resetSliderInterval();
        });
    });

    // Start auto transition
    if (slides.length > 0) {
        resetSliderInterval();
    }


    // ==========================================
    // 6. ANIMATED COUNTERS (SCROLL OBSERVATION)
    // ==========================================
    const counterNumbers = document.querySelectorAll('.counter-number');

    function animateCounter(counterEl) {
        const target = parseInt(counterEl.getAttribute('data-target'), 10);
        const duration = 2000; // 2 seconds
        const stepTime = 16; // ~60fps
        const steps = Math.ceil(duration / stepTime);
        const increment = target / steps;
        
        let current = 0;
        let stepCount = 0;

        const timer = setInterval(() => {
            stepCount++;
            current += increment;
            
            if (stepCount >= steps) {
                clearInterval(timer);
                counterEl.textContent = target.toLocaleString('es-CL');
            } else {
                counterEl.textContent = Math.floor(current).toLocaleString('es-CL');
            }
        }, stepTime);
    }

    // Setup intersection observer
    const countersObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                animateCounter(counter);
                observer.unobserve(counter); // Unobserve after animation triggered
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    });

    counterNumbers.forEach(counter => {
        countersObserver.observe(counter);
    });


    // ==========================================
    // 7. SUBMARINE CUSTOM VIDEO CONTROLS
    // ==========================================
    const opsVideo = document.getElementById('ops-video');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const videoTimeDisplay = document.getElementById('video-time-display');
    const videoWrapper = document.querySelector('.video-wrapper-glass');

    if (opsVideo) {
        function togglePlay() {
            if (opsVideo.paused) {
                opsVideo.play();
                playPauseBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
                videoWrapper.classList.add('playing');
            } else {
                opsVideo.pause();
                playPauseBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
                videoWrapper.classList.remove('playing');
            }
        }

        playPauseBtn.addEventListener('click', togglePlay);
        opsVideo.addEventListener('click', togglePlay);

        opsVideo.addEventListener('timeupdate', () => {
            const minutes = Math.floor(opsVideo.currentTime / 60);
            const seconds = Math.floor(opsVideo.currentTime % 60);
            const formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
            videoTimeDisplay.textContent = formattedTime;
        });

        // Reset state when video ends
        opsVideo.addEventListener('ended', () => {
            playPauseBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
            videoWrapper.classList.remove('playing');
            opsVideo.currentTime = 0;
        });
    }


    // ==========================================
    // 8. DYNAMIC SERVICES DETAIL MODAL
    // ==========================================
    const serviceDetails = {
        robotica: {
            title: "Servicio de Robótica Submarina (ROVs)",
            icon: "fa-robot",
            tag: "Tecnología Avanzada",
            image: "https://servirov.cl/wp-content/uploads/2023/07/WhatsApp-Image-2023-06-28-at-12.53.51-PM.jpeg",
            description: "Nuestra división de robótica submarina cuenta con vehículos de operación remota (ROVs) de alta especificación técnica que permiten realizar faenas complejas bajo el agua, garantizando la seguridad del personal y logrando resultados de extrema precisión.",
            features: [
                "Filmaciones submarinas en alta definición (FHD/4K).",
                "Inspección detallada de sistemas de fondeo (líneas, grilletes, anclas).",
                "Inspección periódica de redes loberas y redes peceras.",
                "Soporte inmediato en faenas de extracción de mortalidad acumulada.",
                "Informes operacionales y mapeos batimétricos en formato digital."
            ]
        },
        buceo: {
            title: "Buceo Profesional y Comercial",
            icon: "fa-person-swimming",
            tag: "Capital Humano Certificado",
            image: "https://servirov.cl/wp-content/uploads/2023/07/WhatsApp-Image-2023-06-28-at-1.00.15-PM.jpeg",
            description: "Ofrecemos servicios de buceo comercial altamente capacitados y equipados con tecnología de punta. Nuestro personal cumple rigurosamente con toda la reglamentación marítima de la Armada de Chile (Directemar), priorizando en cada inmersión la seguridad y la eficiencia en el agua.",
            features: [
                "Intervención directa en jaulas acuícolas y sistemas de flotación.",
                "Instalación, costura y reparación de paños de red submarinos.",
                "Limpieza y remoción de biofouling en estructuras flotantes.",
                "Apoyo certificado en faenas de siembra, selección y cosechas.",
                "Rescates de estructuras y apoyo técnico en contingencias críticas."
            ]
        },
        inspeccion: {
            title: "Inspección Técnica y Alimentación",
            icon: "fa-clipboard-list",
            tag: "Control de Calidad",
            image: "https://servirov.cl/wp-content/uploads/2023/07/101939144_556124918303106_3776436333504564512_n.jpg",
            description: "Proveemos análisis exhaustivos del estado de los fondos marinos y optimizamos uno de los procesos de mayor relevancia económica en la producción de salmones: la alimentación manual. Logramos maximizar la asimilación del alimento reduciendo pérdidas.",
            features: [
                "Inspección ecológica de fondos marinos con reportes en video.",
                "Monitoreo biológico preventivo de la columna de agua.",
                "Personal altamente calificado en técnicas de alimentación manual.",
                "Monitoreo en tiempo real de la respuesta del pez al alimento.",
                "Auditorías operativas de jaulas y boyantes del centro."
            ]
        }
    };

    const serviceModalOverlay = document.getElementById('service-modal-overlay');
    const modalContent = document.getElementById('modal-content-details');
    const modalCloseBtn = document.getElementById('modal-close-btn');

    document.querySelectorAll('.btn-service-details').forEach(btn => {
        btn.addEventListener('click', () => {
            const key = btn.getAttribute('data-service');
            const data = serviceDetails[key];

            if (data) {
                // Generar contenido dinámico
                modalContent.innerHTML = `
                    <div class="modal-header-visual">
                        <span class="section-tag"><i class="fa-solid ${data.icon}"></i> ${data.tag}</span>
                        <h3>${data.title}</h3>
                    </div>
                    <div class="modal-body-visual" style="border-radius:16px; overflow:hidden; margin-bottom: 24px; border: 1px solid var(--glass-border); aspect-ratio:16/9; max-height:220px;">
                        <img src="${data.image}" alt="${data.title}" style="width:100%; height:100%; object-fit:cover;">
                    </div>
                    <p class="modal-desc-full">${data.description}</p>
                    <h4 style="font-family:var(--font-headings); font-size:16px; font-weight:600; margin-bottom:12px;"><i class="fa-solid fa-list-check text-accent"></i> Actividades Principales:</h4>
                    <ul class="modal-feature-list">
                        ${data.features.map(f => `<li><i class="fa-solid fa-circle-chevron-right"></i> <span>${f}</span></li>`).join('')}
                    </ul>
                `;

                // Mostrar Modal
                serviceModalOverlay.classList.add('active');
                document.body.style.overflow = 'hidden'; // Detener scroll de fondo
            }
        });
    });

    function closeModal() {
        serviceModalOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    modalCloseBtn.addEventListener('click', closeModal);
    serviceModalOverlay.addEventListener('click', (e) => {
        if (e.target === serviceModalOverlay) closeModal();
    });

    // Soporte Tecla Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && serviceModalOverlay.classList.contains('active')) {
            closeModal();
        }
    });


    // ==========================================
    // 9. FORM VALIDATOR & FEEDBACK SUCCESS MODAL
    // ==========================================
    const contactForm = document.getElementById('contact-form-element');
    const feedbackModalOverlay = document.getElementById('feedback-modal-overlay');
    const feedbackCloseBtn = document.getElementById('btn-feedback-close');

    if (contactForm) {
        
        // Helper to validate email format
        function isValidEmail(email) {
            const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-w\-0-9]+\.)+[a-zA-w]{2,}))$/;
            return re.test(String(email).toLowerCase());
        }

        // Validate form input group
        function validateField(inputEl, condition) {
            const group = inputEl.closest('.form-group-custom');
            if (condition) {
                group.classList.remove('error');
                return true;
            } else {
                group.classList.add('error');
                return false;
            }
        }

        // Real-time input cleaning on type
        contactForm.querySelectorAll('input, textarea').forEach(input => {
            input.addEventListener('input', () => {
                const group = input.closest('.form-group-custom');
                if (input.value.trim() !== "") {
                    group.classList.remove('error');
                }
            });
        });

        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = document.getElementById('form-name');
            const email = document.getElementById('form-email');
            const phone = document.getElementById('form-phone');
            const message = document.getElementById('form-message');

            const isNameValid = validateField(name, name.value.trim() !== "");
            const isEmailValid = validateField(email, email.value.trim() !== "" && isValidEmail(email.value.trim()));
            const isPhoneValid = validateField(phone, phone.value.trim() !== "");
            const isMsgValid = validateField(message, message.value.trim() !== "");

            // If everything is correct
            if (isNameValid && isEmailValid && isPhoneValid && isMsgValid) {
                const submitBtn = document.getElementById('btn-submit-contact');
                submitBtn.classList.add('loading');

                // Simulate high-performance API delay
                setTimeout(() => {
                    submitBtn.classList.remove('loading');
                    
                    // Show premium success feedback overlay
                    feedbackModalOverlay.classList.add('active');
                    
                    // Create dynamic celebratory bubbles in canvas directly!
                    triggerSpecialCanvasParticles();

                    // Reset form fields
                    contactForm.reset();
                    contactForm.querySelectorAll('.form-group-custom').forEach(g => g.classList.remove('error'));
                }, 1600);
            }
        });

        feedbackCloseBtn.addEventListener('click', () => {
            feedbackModalOverlay.classList.remove('active');
        });
        
        feedbackModalOverlay.addEventListener('click', (e) => {
            if (e.target === feedbackModalOverlay) {
                feedbackModalOverlay.classList.remove('active');
            }
        });
    }

    // Trigger explosive bubble particles upon success
    function triggerSpecialCanvasParticles() {
        for (let i = 0; i < 40; i++) {
            setTimeout(() => {
                let specP = new WaterParticle();
                specP.y = canvas.height + 10;
                specP.x = Math.random() * canvas.width;
                specP.speedY = -(Math.random() * 5 + 3); // Faster upward speed
                specP.size = Math.random() * 8 + 3;
                specP.alpha = 0.9;
                particles.push(specP);
            }, i * 20);
        }
        
        // Trim back to original count slowly
        setTimeout(() => {
            if (particles.length > maxParticles) {
                particles.splice(maxParticles);
            }
        }, 5000);
    }
});
