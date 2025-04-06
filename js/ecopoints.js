document.addEventListener("DOMContentLoaded", () => {

    function animateContainers(element, newValue) {
        element.classList.remove('fade-in');
        element.classList.add('fade-out');

        setTimeout(() => {
            element.innerHTML = newValue;
            element.classList.remove('fade-out');
            element.classList.add('fade-in');
        }
        , 500);
    }
});