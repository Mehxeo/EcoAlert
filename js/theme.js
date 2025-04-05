// Theme toggle functionality
document.addEventListener("DOMContentLoaded", () => {
    const themeToggle = document.getElementById("theme-toggle")
    const sunIcon = document.querySelector(".sun-icon")
    const moonIcon = document.querySelector(".moon-icon")
    const body = document.body
  
    // Check for saved theme preference or use device preference
    const savedTheme = localStorage.getItem("theme")
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
  
    // Set initial theme
    if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
      body.classList.add("dark-theme")
      body.classList.remove("light-theme")
      sunIcon.style.display = "none"
      moonIcon.style.display = "block"
    } else {
      body.classList.add("light-theme")
      body.classList.remove("dark-theme")
      sunIcon.style.display = "block"
      moonIcon.style.display = "none"
    }
  
    // Toggle theme when button is clicked
    themeToggle.addEventListener("click", () => {
      if (body.classList.contains("dark-theme")) {
        body.classList.remove("dark-theme")
        body.classList.add("light-theme")
        localStorage.setItem("theme", "light")
        sunIcon.style.display = "block"
        moonIcon.style.display = "none"
      } else {
        body.classList.remove("light-theme")
        body.classList.add("dark-theme")
        localStorage.setItem("theme", "dark")
        sunIcon.style.display = "none"
        moonIcon.style.display = "block"
      }
  
      // Update map styles if map exists
      if (window.map && typeof window.updateMapStyle === "function") {
        window.updateMapStyle()
      }
  
      // Add animation effect
      themeToggle.classList.add("clicked")
      setTimeout(() => {
        themeToggle.classList.remove("clicked")
      }, 500)
    })
  })
  
  