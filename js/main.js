document.addEventListener("DOMContentLoaded", () => {
    console.log("EcoAlert application initialized")

    if (localStorage.getItem('user')) {
        const userString = localStorage.getItem('user');
        const user = JSON.parse(userString);
        const signInElement = document.getElementById('sign-in');
        const avatarElement = document.getElementById('user-avatar');
        
        if (signInElement && user.name) {
            signInElement.textContent = user.name;
        }
        
        if (avatarElement && user.photoURL) {
            avatarElement.src = user.photoURL;
            avatarElement.classList.remove('hidden');
        }
    }


    const cards = document.querySelectorAll('.feature-card');
    const sectText = document.querySelectorAll('.section-text');
    cards.forEach((card, index) => {
        card.style.setProperty('--animation-order', index);
    });

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
