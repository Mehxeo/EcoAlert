document.addEventListener("DOMContentLoaded", () => {
    console.log("EcoAlert application initialized")

    const cards = document.querySelectorAll('.feature-card');
    const sectText = document.querySelectorAll('.section-text');
    // Set animation order for each card
    cards.forEach((card, index) => {
        card.style.setProperty('--animation-order', index);
    });

    // Set animation order for each text
    sectText.forEach((text, index) => {
        text.style.setProperty('--animation-order', index);
    });
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });

    cards.forEach(card => observer.observe(card));
    sectText.forEach(text => observer.observe(text));
  });
  
  