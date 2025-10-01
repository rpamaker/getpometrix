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
    const cards = document.querySelectorAll('.option-card, .service-card, .stat-item');
    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
    
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

