// Función para abrir videos
function openVideo(videoType) {
    const modal = document.getElementById('videoModal');
    const videoPlayer = document.getElementById('videoPlayer');
    const videoSource = document.getElementById('videoSource');
    
    // Configurar la fuente del video según el tipo
    let videoSrc = '';
    switch(videoType) {
        case 'video1':
            videoSrc = 'videos/video1.mp4';
            break;
        case 'video2':
            videoSrc = 'videos/video2.mp4';
            break;
        default:
            videoSrc = 'videos/video1.mp4';
    }
    
    videoSource.src = videoSrc;
    videoPlayer.load();
    modal.style.display = 'block';
    
    // Reproducir automáticamente
    videoPlayer.play();
}

// Función para cerrar video
function closeVideo() {
    const modal = document.getElementById('videoModal');
    const videoPlayer = document.getElementById('videoPlayer');
    
    videoPlayer.pause();
    videoPlayer.currentTime = 0;
    modal.style.display = 'none';
}

// Función para abrir PDF
function openPDF() {
    const modal = document.getElementById('pdfModal');
    const pdfViewer = document.getElementById('pdfViewer');
    
    // Configurar la fuente del PDF
    pdfViewer.src = 'documents/brochure.pdf';
    modal.style.display = 'block';
}

// Función para cerrar PDF
function closePDF() {
    const modal = document.getElementById('pdfModal');
    const pdfViewer = document.getElementById('pdfViewer');
    
    pdfViewer.src = '';
    modal.style.display = 'none';
}

// Cerrar modales al hacer clic fuera de ellos
window.onclick = function(event) {
    const videoModal = document.getElementById('videoModal');
    const pdfModal = document.getElementById('pdfModal');
    
    if (event.target === videoModal) {
        closeVideo();
    }
    if (event.target === pdfModal) {
        closePDF();
    }
}

// Cerrar modales con tecla Escape
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeVideo();
        closePDF();
    }
});

// Función para scroll suave a secciones
function scrollToSection(sectionId) {
    const target = document.getElementById(sectionId);
    if (target) {
        target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Smooth scroll para enlaces internos
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Animación de entrada para las tarjetas
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Aplicar animación a las tarjetas cuando se cargue la página
document.addEventListener('DOMContentLoaded', function() {
	// Debug PostHog y evento de prueba inicial (temporal)
	try { localStorage.setItem('ph_debug', 'true'); } catch (_) {}
	if (window.posthog && typeof window.posthog.set_config === 'function') {
		window.posthog.set_config({ debug: true });
		if (typeof window.posthog.capture === 'function') {
			window.posthog.capture('page_loaded', { url: location.href, path: location.pathname });
		}
	}

	// Retry: esperar a que posthog cargue antes de capturar (hasta 5s)
	(function ensurePosthogAndCaptureOnce() {
		if (window.__phPageLoadedSent) return;
		var attempts = 0;
		var maxAttempts = 20; // 20 * 250ms = 5s
		var timer = setInterval(function() {
			attempts++;
			var ph = window.posthog;
			if (ph && typeof ph.capture === 'function') {
				try {
					ph.capture('page_loaded', { url: location.href, path: location.pathname, attempt: attempts });
					window.__phPageLoadedSent = true;
					clearInterval(timer);
					console.log('[PostHog] page_loaded enviado');
				} catch (err) {
					console.warn('[PostHog] error capturando page_loaded', err);
				}
			}
			if (attempts >= maxAttempts) {
				clearInterval(timer);
				console.warn('[PostHog] No se pudo enviar page_loaded: SDK no disponible tras 5s');
			}
		}, 250);
	})();

    const cards = document.querySelectorAll('.option-card, .service-card, .stat-item');
    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });

    // Bloqueo por email: mostrar overlay si no hay email guardado
    const overlay = document.getElementById('accessOverlay');
    const form = document.getElementById('accessForm');
    const emailInput = document.getElementById('accessEmail');
    const errorBox = document.getElementById('accessError');
    const submitBtn = document.getElementById('accessSubmit');

    const storedEmail = localStorage.getItem('gp_access_email');
    if (overlay) {
        if (!storedEmail) {
            overlay.style.display = 'block';
            document.documentElement.style.overflow = 'hidden';
        } else {
            // Identificar en PostHog si ya lo tenemos
            if (window.posthog && typeof window.posthog.identify === 'function') {
                window.posthog.identify(storedEmail);
                window.posthog.capture('site_unlocked', { method: 'stored', page: location.pathname });
            }
        }
    }

    function isValidEmail(value) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    }

    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const value = (emailInput?.value || '').trim();
            if (!isValidEmail(value)) {
                errorBox.textContent = 'Ingresá un email válido.';
                return;
            }
            submitBtn.disabled = true;
            errorBox.textContent = '';

            try {
                localStorage.setItem('gp_access_email', value);
            } catch (_) {}

            if (window.posthog && typeof window.posthog.identify === 'function') {
                window.posthog.identify(value);
                window.posthog.capture('site_unlocked', { method: 'form', page: location.pathname });
            }

            // Notificar por email al primer envío
            try {
                var notified = localStorage.getItem('gp_notify_sent');
                if (!notified) {
                    fetch('/api/notify', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email: value, page: location.href, userAgent: navigator.userAgent })
                    }).then(function(res){
                        if (res.ok) try { localStorage.setItem('gp_notify_sent', '1'); } catch (_) {}
                    }).catch(function(err){ console.warn('notify error', err); });
                }
            } catch (err) { console.warn('notify storage error', err); }

            // Desbloquear
            overlay.style.display = 'none';
            document.documentElement.style.overflow = '';
        });

        emailInput.addEventListener('input', function() {
            if (errorBox.textContent) errorBox.textContent = '';
            submitBtn.disabled = !isValidEmail(emailInput.value.trim());
        });
    }

    // Animación para el hero content
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        heroContent.style.opacity = '0';
        heroContent.style.transform = 'translateY(50px)';
        heroContent.style.transition = 'opacity 1s ease, transform 1s ease';
        setTimeout(() => {
            heroContent.style.opacity = '1';
            heroContent.style.transform = 'translateY(0)';
        }, 300);
    }
});

