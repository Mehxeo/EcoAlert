document.addEventListener("DOMContentLoaded", () => {
    if (localStorage.getItem('user')) {
        const userString = localStorage.getItem('user');
        const user = JSON.parse(userString);
        document.getElementById('sign-in').textContent = user.name;
    }
});