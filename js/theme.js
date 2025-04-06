// Theme toggle functionality
document.addEventListener("DOMContentLoaded", () => {
    // const themeToggle = document.getElementById("theme-toggle")
    // const sunIcon = document.querySelector(".sun-icon")
    // const moonIcon = document.querySelector(".moon-icon")
    // const body = document.body
    // const chart = document.getElementById("aq-chart")
  
    // // Check for saved theme preference or use device preference
    // const savedTheme = localStorage.getItem("theme")
    // const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    // // Set initial theme
    // if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
    //   chart.classList.add("dark-theme")
    //   body.classList.add("dark-theme")
    //   body.classList.remove("light-theme")
    //   sunIcon.style.display = "none"
    //   moonIcon.style.display = "block"
    // } else {
    //   chart.classList.add("light-theme")
    //   body.classList.add("light-theme")
    //   body.classList.remove("dark-theme")
    //   sunIcon.style.display = "block"
    //   moonIcon.style.display = "none"
    // }
    const themeToggle = document.getElementById("theme-toggle");
    const sunIcon = document.querySelector(".sun-icon");
    const moonIcon = document.querySelector(".moon-icon");
    const body = document.body;
    const chart = document.getElementById("aq-chart");

    // Check saved theme first
    const savedTheme = localStorage.getItem("theme");
    
    // Apply saved theme if it exists
    if (savedTheme) {
        body.classList.remove("light-theme", "dark-theme");
        body.classList.add(`${savedTheme}-theme`);
        
        // Update icons
        sunIcon.style.display = savedTheme === "dark" ? "none" : "block";
        moonIcon.style.display = savedTheme === "dark" ? "block" : "none";
        
        // Update chart if it exists
        if (chart) {
            chart.classList.remove("light-theme", "dark-theme");
            chart.classList.add(`${savedTheme}-theme`);
        }
    } else {
        // If no saved theme, get current theme from body class
        const currentTheme = body.classList.contains("dark-theme") ? "dark" : "light";
        localStorage.setItem("theme", currentTheme);
    }

    // Toggle theme when button is clicked
    themeToggle.addEventListener("click", () => {
        const newTheme = body.classList.contains("dark-theme") ? "light" : "dark";
        
        // Update body classes
        body.classList.remove("light-theme", "dark-theme");
        body.classList.add(`${newTheme}-theme`);
        
        // Update localStorage
        localStorage.setItem("theme", newTheme);
        
        // Update icons
        sunIcon.style.display = newTheme === "dark" ? "none" : "block";
        moonIcon.style.display = newTheme === "dark" ? "block" : "none";
        
        // Update chart if it exists
        if (chart) {
            chart.classList.remove("light-theme", "dark-theme");
            chart.classList.add(`${newTheme}-theme`);
        }

        // Update air quality if needed
        if (typeof airQualityChart !== 'undefined' && 
            typeof selectedLocation !== 'undefined' && 
            selectedLocation.lat && 
            selectedLocation.lng) {
            generateAirQualityInsights(selectedLocation.lat, selectedLocation.lng);
        }

        // Animation
        themeToggle.classList.add("clicked");
        setTimeout(() => {
            themeToggle.classList.remove("clicked");
        }, 500);
    });
  })
  
  