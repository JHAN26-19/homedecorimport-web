// WALL PANEL: navegación suave y pequeño efecto de aparición para una experiencia más pulida.
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

const cards = document.querySelectorAll('.product-card');
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.style.animation = 'rise .65s ease both';
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
cards.forEach((card) => observer.observe(card));

const style = document.createElement('style');
style.textContent = '@keyframes rise{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}';
document.head.appendChild(style);
