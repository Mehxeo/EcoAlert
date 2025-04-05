document.addEventListener("DOMContentLoaded", () => {
    // Global variables
    let map
    let marker
    let selectedLocation = {
      lat: null,
      lng: null,
      name: "",
    }
    let weatherData = null
    let environmentalInsights = null
    let useMetric = true // Default to Celsius
    let lat = null
    let long = null

    function getLocation() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(success, error);
      } else {
        alert("Geolocation not supported")
      }
    }
    function success(position) {
      lat = position.coords.latitude
      long =  position.coords.longitude;
      console.log(lat, long)
      const locationName = `Location at ${lat.toFixed(4)}, ${long.toFixed(4)}`
      
      selectLocation(lat, long, locationName);
      updateMarker()  
    }
    
    function error() {
      alert("Sorry, no position available.");
    }
  
    initMap()
  
    setupEventListeners()
  
    // make map with Leaflet
    function initMap() {
      console.log('map initted');
      getLocation()
      const mapContainer = document.getElementById("map")
      if (!mapContainer) {
        console.error("Map container not found")
        return
      }
  
      if (mapContainer.clientHeight === 0) {
        mapContainer.style.height = "400px"
      }
  
      setTimeout(() => {
        try {
          map = L.map("map", {
            zoomControl: true,
            attributionControl: true,
            fadeAnimation: false,
            zoomAnimation: false,
          }).setView([20, 0], 2)

          updateMapStyle()
          window.map = map
          window.updateMapStyle = updateMapStyle
  
          // Add click event to map
          map.on("click", (e) => {
            const { lat, lng } = e.latlng

            const locationName = `Location at ${lat.toFixed(4)}, ${lng.toFixed(4)}`
  
            selectLocation(lat, lng, locationName)
          })

          setTimeout(() => {
            if (map) map.invalidateSize()
          }, 100)
        } catch (error) {
          console.error("Error initializing map:", error)
        }
      }, 100)
    }
  
    function updateMapStyle() {
      if (!map) return
  
      map.eachLayer((layer) => {
        if (layer instanceof L.TileLayer) {
          map.removeLayer(layer)
        }
      })
  
      const isDarkTheme = document.body.classList.contains("dark-theme")
  
      try {
        if (isDarkTheme) {
          L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: "abcd",
            maxZoom: 19,
          }).addTo(map)
        } else {
          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19,
          }).addTo(map)
        }
  
        setTimeout(() => {
          if (map) map.invalidateSize()
        }, 100)
      } catch (error) {
        console.error("Error updating map style:", error)
      }
    }
  
    function setupEventListeners() {
        const searchInput = document.getElementById("location-input");
        const searchForm = document.getElementById("search-form");
        const searchButton = document.getElementById("search-button");
        const suggestions = document.createElement("ul");
        suggestions.style.display = "block-inline";
        
        let chosenLocation;

        suggestions.classList.add("suggestions");
        searchInput.parentNode.appendChild(suggestions);
        
        
        // GeoCoding for City Search
        searchInput.addEventListener("input", async (event) => {
          if (!searchInput) return
          const query = event.target.value.trim();
          if (query.length <= 2) {
            suggestions.innerHTML = "";
            return;
          }

          try {
            const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=10&language=en&format=json`)
            
            const data = await response.json();

            if (data.results) {
              suggestions.innerHTML = "";
              data.results.forEach((Location, index) => {
                if (Location.name && Location.admin1 && Location.country) {
                  const suggestionItem = document.createElement("button");
                  suggestionItem.textContent = `${Location.name}, ${Location.admin1}, ${Location.country}`;
                  suggestionItem.classList.add("search-suggestion-item");
                  suggestionItem.style.setProperty('--index', index);
  

                  suggestionItem.addEventListener("click", () => {
                      chosenLocation = Location;
                      searchInput.value = `${Location.name}, ${Location.admin1}, ${Location.country}`;
                      suggestions.innerHTML = ""; // clear suggestions list
                      searchButton.style.display = "inline";
                  });
                  suggestions.appendChild(suggestionItem);
                }
              }
              )
            }
            else {
              suggestions.innerHTML = "<h3>No Results Found</h3>"
            }
          }
          catch (e) {
            console.error("Error" + e);
          }
        }
      );
      document.getElementById("search-form").addEventListener("submit", (e) => {
        e.preventDefault()
        
        showLoading(true)
  
        // add geocoding service
        setTimeout(() => {
          const Lat = chosenLocation.latitude;
          const Lng = chosenLocation.longitude;
          const locationName = `${chosenLocation.name}, ${chosenLocation.admin1}, ${chosenLocation.country}`;
  
          // select the "found" location
          selectLocation(Lat, Lng, locationName)
  
          // hide loading indicator
          showLoading(false)
        }, 500)
      })
  
      const tabButtons = document.querySelectorAll(".tab-button")
      tabButtons.forEach((button) => {
        button.addEventListener("click", function () {
          tabButtons.forEach((btn) => btn.classList.remove("active"))
          document.querySelectorAll(".tab-content").forEach((content) => content.classList.remove("active"))
  
          this.classList.add("active")
          const tabId = this.getAttribute("data-tab")
          document.getElementById(tabId).classList.add("active")
        })
      })
  
      document.addEventListener("click", (e) => {
        if (e.target.closest(".accordion-header")) {
          const accordionItem = e.target.closest(".accordion-item")
          accordionItem.classList.toggle("active")
        }
      })

      const unitToggle = document.getElementById("unit-toggle")
      if (unitToggle) {
        unitToggle.addEventListener("change", function () {
          useMetric = !this.checked
          document.getElementById("unit-label").textContent = useMetric ? "°C" : "°F"
          document.getElementById("temp-unit").textContent = useMetric ? "°C" : "°F"
          document.getElementById("feels-like-unit").textContent = useMetric ? "°C" : "°F"
  
          if (weatherData) {
            updateTemperatureDisplays()
          }
        })
      }
  
      const chatForm = document.getElementById("chat-form")
      if (chatForm) {
        chatForm.addEventListener("submit", (e) => {
          e.preventDefault()
          const chatInput = document.getElementById("chat-input")
          const question = chatInput.value.trim()
  
          if (!question) return
          addChatMessage(question, "user")
          chatInput.value = ""
  
          const loadingId = addChatMessage("Thinking...", "ai")
  
          askAI(question, loadingId)
        })
      }

      const suggestionButtons = document.querySelectorAll(".suggestion-button")
      if (suggestionButtons) {
        suggestionButtons.forEach((button) => {
          button.addEventListener("click", function () {
            const question = this.getAttribute("data-question")
            document.getElementById("chat-input").value = question
            document.getElementById("chat-form").dispatchEvent(new Event("submit"))
          })
        })
      }
    }

    function selectLocation(lat, lng, name) {
      selectedLocation = {
        lat: lat,
        lng: lng,
        name: name,
      }

      updateMarker()

      fetchWeatherAndEnvironmentalData()
    }
  
    function updateMarker() {
      if (!map) return
      if (marker) {
        map.removeLayer(marker)
      }
  
      marker = L.marker([selectedLocation.lat, selectedLocation.lng])
        .addTo(map)
        .bindPopup(selectedLocation.name)
        .openPopup()
  
      map.setView([selectedLocation.lat, selectedLocation.lng], 10)
    }
  
    function fetchWeatherAndEnvironmentalData() {
      showLoading(true)
  
      // call the backend API to get real weather data
      fetch(`/api/weather?lat=${selectedLocation.lat}&lng=${selectedLocation.lng}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to fetch weather data")
          }
          return response.json()
        })
        .then((data) => {
          // Store the weather data
          weatherData = data
  
          // Now fetch environmental insights
          return fetch("/api/environmental-insights", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              lat: selectedLocation.lat,
              lng: selectedLocation.lng,
              locationName: selectedLocation.name,
              weatherData: weatherData,
            }),
          })
        })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to fetch environmental insights")
          }
          return response.json()
        })
        .then((data) => {
          // Store the environmental insights
          environmentalInsights = data
  
          // Update UI with the data
          updateWeatherUI(weatherData)
          updateEnvironmentalInsightsUI(environmentalInsights)
  
          // Show the weather data section
          document.getElementById("weather-data").classList.remove("hidden")
  
          // Hide loading indicator
          showLoading(false)
  
          // Show success toast
          showToast(
            "Location data loaded",
            `Weather and environmental data for ${selectedLocation.name} has been loaded.`,
            "success",
          )
        })
        .catch((error) => {
          console.error("Error:", error)
  
          // Fall back to mock data if API calls fail
          weatherData = generateMockWeatherData()
          environmentalInsights = generateMockEnvironmentalInsights()
  
          // Update UI with the mock data
          updateWeatherUI(weatherData)
          updateEnvironmentalInsightsUI(environmentalInsights)
  
          // Show the weather data section
          document.getElementById("weather-data").classList.remove("hidden")
  
          // Hide loading indicator
          showLoading(false)
  
          // Show error toast
          showToast("Error loading data", "Using simulated data due to API error. Please try again later.", "error")
        })
    }
  
    // Generate mock weather data
    function generateMockWeatherData() {
      // Random weather code (0-3)
      const weatherCodeIndex = Math.floor(Math.random() * 4)
      const weatherDescriptions = ["Clear sky", "Partly cloudy", "Cloudy", "Light rain"]
      const weatherIcons = ["01d", "02d", "03d", "10d"]
  
      // Generate random temperature between 15-35°C
      const temperature = Math.round(15 + Math.random() * 20)
  
      // Generate mock air quality category
      const aqiCategories = ["Good", "Moderate", "Unhealthy for Sensitive Groups", "Unhealthy"]
      const aqiCategoryIndex = Math.floor(Math.random() * 4)
  
      return {
        location: selectedLocation.name,
        coordinates: { lat: selectedLocation.lat, lng: selectedLocation.lng },
        current: {
          temperature: temperature,
          feelsLike: Math.round(temperature - 2 + Math.random() * 4), // Feels like temp is close to actual temp
          humidity: Math.round(40 + Math.random() * 50),
          windSpeed: Math.round(5 + Math.random() * 20),
          windDirection: Math.round(Math.random() * 360),
          pressure: Math.round(1000 + Math.random() * 30),
          uvIndex: Math.round(1 + Math.random() * 10),
          visibility: Math.round(5 + Math.random() * 15),
          weatherCode: weatherCodeIndex,
          weatherDescription: weatherDescriptions[weatherCodeIndex],
          icon: weatherIcons[weatherCodeIndex],
        },
        airQuality: {
          aqi: Math.round(20 + Math.random() * 150),
          pm25: Math.round(5 + Math.random() * 30),
          pm10: Math.round(10 + Math.random() * 50),
          o3: Math.round(20 + Math.random() * 60),
          no2: Math.round(5 + Math.random() * 40),
          so2: Math.round(2 + Math.random() * 20),
          co: Math.round(200 + Math.random() * 800),
          category: aqiCategories[aqiCategoryIndex],
        },
        forecast: Array.from({ length: 7 }, (_, i) => {
          const forecastWeatherCodeIndex = Math.floor(Math.random() * 4)
          return {
            date: new Date(Date.now() + i * 86400000).toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            }),
            maxTemp: Math.round(20 + Math.random() * 15),
            minTemp: Math.round(10 + Math.random() * 15),
            weatherCode: forecastWeatherCodeIndex,
            weatherDescription: weatherDescriptions[forecastWeatherCodeIndex],
            icon: weatherIcons[forecastWeatherCodeIndex],
            precipitation: Math.round(Math.random() * 100),
            humidity: Math.round(40 + Math.random() * 50),
            windSpeed: Math.round(5 + Math.random() * 20),
          }
        }),
      }
    }
  
    // Generate mock environmental insights
    function generateMockEnvironmentalInsights() {
      const riskLevels = ["low", "moderate", "high", "severe"]
  
      return {
        risks: [
          {
            type: "Flooding",
            level: riskLevels[Math.floor(Math.random() * 4)],
            description:
              "Based on topography and proximity to water bodies, this area has potential flood risk during heavy rainfall events.",
          },
          {
            type: "Drought",
            level: riskLevels[Math.floor(Math.random() * 4)],
            description:
              "Historical climate data indicates periodic drought conditions that may affect water availability.",
          },
          {
            type: "Air Pollution",
            level: riskLevels[Math.floor(Math.random() * 4)],
            description: "Urban density and industrial activity contribute to occasional poor air quality conditions.",
          },
        ],
        sustainability: [
          {
            category: "Water Conservation",
            recommendations: [
              "Install rainwater harvesting systems to collect and reuse rainwater",
              "Use drought-resistant native plants in landscaping",
              "Implement water-efficient fixtures and appliances",
            ],
          },
          {
            category: "Energy Efficiency",
            recommendations: [
              "Consider solar panel installation due to high annual sunshine hours",
              "Improve building insulation to reduce heating/cooling needs",
              "Use smart thermostats and energy-efficient appliances",
            ],
          },
          {
            category: "Biodiversity",
            recommendations: [
              "Plant native species to support local wildlife",
              "Create wildlife corridors to connect fragmented habitats",
              "Reduce use of pesticides and herbicides",
            ],
          },
        ],
        localEnvironment: {
          ecosystemType: ["Temperate forest", "Grassland", "Coastal", "Urban"][Math.floor(Math.random() * 4)],
          biodiversity:
            "This region supports a variety of plant and animal species, including several that are endemic to the area.",
          conservation: "Local conservation efforts focus on habitat preservation and restoration of natural waterways.",
          challenges: [
            "Habitat fragmentation due to urban development",
            "Invasive species affecting native biodiversity",
            "Water quality concerns in local watersheds",
          ],
        },
      }
    }
  
    // Convert temperature between Celsius and Fahrenheit
    function convertTemperature(temp, toFahrenheit = false) {
      if (toFahrenheit) {
        return Math.round((temp * 9) / 5 + 32)
      } else {
        return Math.round(((temp - 32) * 5) / 9)
      }
    }
  
    // Get temperature in the current unit
    function getTemperatureInCurrentUnit(tempC) {
      return useMetric ? tempC : convertTemperature(tempC, true)
    }
  
    // Update temperature displays based on current unit
    function updateTemperatureDisplays() {
      // Update current temperature
      document.getElementById("current-temp").textContent = getTemperatureInCurrentUnit(weatherData.current.temperature)
      document.getElementById("feels-like").textContent = getTemperatureInCurrentUnit(weatherData.current.feelsLike)
  
      // Update forecast temperatures
      const forecastContainer = document.getElementById("forecast-days")
      const forecastDays = forecastContainer.querySelectorAll(".forecast-day")
  
      forecastDays.forEach((day, index) => {
        const maxTempElement = day.querySelector(".forecast-max")
        const minTempElement = day.querySelector(".forecast-min")
  
        maxTempElement.textContent = `${getTemperatureInCurrentUnit(weatherData.forecast[index].maxTemp)}°`
        minTempElement.textContent = `${getTemperatureInCurrentUnit(weatherData.forecast[index].minTemp)}°`
      })
    }
  
    // Update weather UI with data
    function updateWeatherUI(data) {
      // Update location info
      document.getElementById("location-name").textContent = data.location
      document.getElementById("location-coordinates").textContent =
        `Lat: ${data.coordinates.lat.toFixed(4)}, Lng: ${data.coordinates.lng.toFixed(4)}`
  
      // Update current weather
      document.getElementById("current-temp").textContent = getTemperatureInCurrentUnit(data.current.temperature)
      document.getElementById("feels-like").textContent = getTemperatureInCurrentUnit(data.current.feelsLike)
      document.getElementById("weather-description").textContent = data.current.weatherDescription
      document.getElementById("humidity").textContent = `${data.current.humidity}%`
      document.getElementById("wind-speed").textContent = `${data.current.windSpeed} km/h`
      document.getElementById("pressure").textContent = `${data.current.pressure} hPa`
      document.getElementById("uv-index").textContent = data.current.uvIndex
      document.getElementById("visibility").textContent = `${data.current.visibility} km`
  
      // Update weather icon
      const iconUrl = `https://openweathermap.org/img/wn/${data.current.icon}@2x.png`
      document.getElementById("weather-icon").src = iconUrl
      document.getElementById("weather-icon").alt = data.current.weatherDescription
  
      // Update air quality badge
      const airQualityElement = document.getElementById("air-quality")
      airQualityElement.textContent = data.airQuality.category
      airQualityElement.className = "badge"
  
      // Add appropriate class based on air quality category
      if (data.airQuality.category === "Good") {
        airQualityElement.classList.add("badge-good")
      } else if (data.airQuality.category === "Moderate") {
        airQualityElement.classList.add("badge-moderate")
      } else if (data.airQuality.category === "Unhealthy for Sensitive Groups") {
        airQualityElement.classList.add("badge-unhealthy-sensitive")
      } else {
        airQualityElement.classList.add("badge-unhealthy")
      }
  
      // Update forecast days
      const forecastContainer = document.getElementById("forecast-days")
      forecastContainer.innerHTML = ""
  
      data.forecast.forEach((day) => {
        const dayElement = document.createElement("div")
        dayElement.className = "forecast-day"
        dayElement.innerHTML = `
          <div class="forecast-date">${day.date.split(",")[0]}</div>
          <img class="forecast-icon" src="https://openweathermap.org/img/wn/${day.icon}@2x.png" alt="${day.weatherDescription}">
          <div class="forecast-temps">
            <span class="forecast-max">${getTemperatureInCurrentUnit(day.maxTemp)}°</span>
            <span class="forecast-min">${getTemperatureInCurrentUnit(day.minTemp)}°</span>
          </div>
          <div class="forecast-desc">${day.weatherDescription}</div>
          <div class="forecast-precip">${day.precipitation}% precip</div>
        `
        forecastContainer.appendChild(dayElement)
      })
  
      // Update air quality tab
      document.getElementById("aqi-value").textContent = data.airQuality.aqi
      document.getElementById("aqi-category").textContent = data.airQuality.category
      document.getElementById("aqi-category").className = "badge"
  
      // Add appropriate class based on air quality category
      if (data.airQuality.category === "Good") {
        document.getElementById("aqi-category").classList.add("badge-good")
        document.getElementById("aqi-value").style.color = "var(--badge-success)"
        document.getElementById("aqi-text").textContent =
          "Air quality is considered satisfactory, and air pollution poses little or no risk."
      } else if (data.airQuality.category === "Moderate") {
        document.getElementById("aqi-category").classList.add("badge-moderate")
        document.getElementById("aqi-value").style.color = "var(--badge-warning)"
        document.getElementById("aqi-text").textContent =
          "Air quality is acceptable; however, there may be a moderate health concern for a very small number of people."
      } else if (data.airQuality.category === "Unhealthy for Sensitive Groups") {
        document.getElementById("aqi-category").classList.add("badge-unhealthy-sensitive")
        document.getElementById("aqi-value").style.color = "var(--badge-danger)"
        document.getElementById("aqi-text").textContent =
          "Members of sensitive groups may experience health effects. The general public is not likely to be affected."
      } else {
        document.getElementById("aqi-category").classList.add("badge-unhealthy")
        document.getElementById("aqi-value").style.color = "var(--badge-danger)"
        document.getElementById("aqi-text").textContent =
          "Everyone may begin to experience health effects; members of sensitive groups may experience more serious health effects."
      }
  
      // Update pollutant values
      document.getElementById("pm25").textContent = `${data.airQuality.pm25} μg/m³`
      document.getElementById("pm10").textContent = `${data.airQuality.pm10} μg/m³`
      document.getElementById("o3").textContent = `${data.airQuality.o3} μg/m³`
      document.getElementById("no2").textContent = `${data.airQuality.no2} μg/m³`
      document.getElementById("so2").textContent = `${data.airQuality.so2} μg/m³`
      document.getElementById("co").textContent = `${data.airQuality.co} μg/m³`
    }
  
    // Update environmental insights UI
    function updateEnvironmentalInsightsUI(data) {
      // Update environmental risks
      const risksContainer = document.getElementById("environmental-risks")
      risksContainer.innerHTML = ""
  
      data.risks.forEach((risk) => {
        const riskElement = document.createElement("div")
        riskElement.className = "risk"
  
        // Determine badge class based on risk level
        let badgeClass = ""
        switch (risk.level) {
          case "low":
            badgeClass = "badge-low"
            break
          case "moderate":
            badgeClass = "badge-moderate"
            break
          case "high":
            badgeClass = "badge-high"
            break
          case "severe":
            badgeClass = "badge-severe"
            break
        }
  
        riskElement.innerHTML = `
          <div class="risk-header">
            <div class="risk-type">${risk.type}</div>
            <div class="badge ${badgeClass}">${risk.level.charAt(0).toUpperCase() + risk.level.slice(1)} Risk</div>
          </div>
          <p>${risk.description}</p>
        `
  
        risksContainer.appendChild(riskElement)
      })
  
      // Update sustainability recommendations
      const recommendationsContainer = document.getElementById("sustainability-recommendations")
      recommendationsContainer.innerHTML = ""
  
      data.sustainability.forEach((category, index) => {
        const categoryElement = document.createElement("div")
        categoryElement.className = "accordion-item"
        if (index === 0) categoryElement.classList.add("active") // Open first item by default
  
        const recommendationsList = category.recommendations.map((rec) => `<li>${rec}</li>`).join("")
  
        categoryElement.innerHTML = `
          <div class="accordion-header">
            <div class="accordion-title">${category.category}</div>
            <div class="accordion-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </div>
          </div>
          <div class="accordion-content">
            <ul class="recommendation-list">
              ${recommendationsList}
            </ul>
          </div>
        `
  
        recommendationsContainer.appendChild(categoryElement)
      })
  
      // Update local environment info
      const localEnvironmentContainer = document.getElementById("local-environment")
      localEnvironmentContainer.innerHTML = ""
  
      // Ecosystem type
      const ecosystemElement = document.createElement("div")
      ecosystemElement.className = "environment-section"
      ecosystemElement.innerHTML = `
        <div class="environment-title">Ecosystem Type</div>
        <p>${data.localEnvironment.ecosystemType}</p>
      `
      localEnvironmentContainer.appendChild(ecosystemElement)
  
      // Biodiversity
      const biodiversityElement = document.createElement("div")
      biodiversityElement.className = "environment-section"
      biodiversityElement.innerHTML = `
        <div class="environment-title">Biodiversity</div>
        <p>${data.localEnvironment.biodiversity}</p>
      `
      localEnvironmentContainer.appendChild(biodiversityElement)
  
      // Conservation
      const conservationElement = document.createElement("div")
      conservationElement.className = "environment-section"
      conservationElement.innerHTML = `
        <div class="environment-title">Conservation Efforts</div>
        <p>${data.localEnvironment.conservation}</p>
      `
      localEnvironmentContainer.appendChild(conservationElement)
  
      // Environmental challenges
      const challengesElement = document.createElement("div")
      challengesElement.className = "environment-section"
  
      const challengesList = data.localEnvironment.challenges.map((challenge) => `<li>${challenge}</li>`).join("")
  
      challengesElement.innerHTML = `
        <div class="environment-title">Environmental Challenges</div>
        <ul class="challenge-list">
          ${challengesList}
        </ul>
      `
      localEnvironmentContainer.appendChild(challengesElement)
    }
  
    // Show/hide loading indicator
    function showLoading(show) {
      const loadingIndicator = document.getElementById("loading-indicator")
      if (show) {
        loadingIndicator.classList.remove("hidden")
      } else {
        loadingIndicator.classList.add("hidden")
      }
    }
  
    // Add a message to the chat
    function addChatMessage(message, type, messageId = null) {
      const chatMessages = document.getElementById("chat-messages")
      const messageElement = document.createElement("div")
  
      // Generate a unique ID if not provided
      const id = messageId || "msg-" + Date.now()
      messageElement.id = id
  
      messageElement.className = `message ${type}-message`
      messageElement.innerHTML = `<p>${message}</p>`
  
      chatMessages.appendChild(messageElement)
  
      // Scroll to bottom
      chatMessages.scrollTop = chatMessages.scrollHeight
  
      return id
    }
  
    // Ask AI a question
    function askAI(question, loadingMessageId) {
      // Prepare data to send to backend
      const data = {
        question: question,
        location: selectedLocation,
        weatherData: weatherData,
        environmentalInsights: environmentalInsights,
      }
  
      // Send to backend API
      fetch("/api/ask-ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to get AI response")
          }
          return response.json()
        })
        .then((data) => {
          // Replace loading message with AI response
          const loadingMessage = document.getElementById(loadingMessageId)
          loadingMessage.innerHTML = `<p>${data.response}</p>`
          loadingMessage.className = "message ai-message"
        })
        .catch((error) => {
          console.error("Error:", error)
  
          // Fall back to rule-based response if API call fails
          const response = generateAIResponse(question, weatherData, environmentalInsights)
  
          // Replace loading message with AI response
          const loadingMessage = document.getElementById(loadingMessageId)
          loadingMessage.innerHTML = `<p>${response}</p>`
          loadingMessage.className = "message ai-message"
        })
    }
  
    // Generate an AI response based on the question and data (fallback if API fails)
    function generateAIResponse(question, weatherData, environmentalInsights) {
      // Convert question to lowercase for easier matching
      const q = question.toLowerCase()
  
      // Weather forecast related questions
      if (
        q.includes("weather") ||
        q.includes("forecast") ||
        q.includes("temperature") ||
        q.includes("rain") ||
        q.includes("sunny")
      ) {
        const currentTemp = getTemperatureInCurrentUnit(weatherData.current.temperature)
        const unit = useMetric ? "C" : "F"
  
        return `The current temperature in ${weatherData.location} is ${currentTemp}°${unit} with ${weatherData.current.weatherDescription.toLowerCase()}. 
        The forecast for the next few days shows temperatures ranging from ${getTemperatureInCurrentUnit(weatherData.forecast[0].minTemp)}°${unit} to ${getTemperatureInCurrentUnit(weatherData.forecast[3].maxTemp)}°${unit}, 
        with conditions varying from ${weatherData.forecast[0].weatherDescription.toLowerCase()} to ${weatherData.forecast[3].weatherDescription.toLowerCase()}.`
      }
  
      // Environmental risks related questions
      else if (q.includes("risk") || q.includes("danger") || q.includes("hazard") || q.includes("threat")) {
        const highestRisk = environmentalInsights.risks.sort((a, b) => {
          const levels = { low: 0, moderate: 1, high: 2, severe: 3 }
          return levels[b.level] - levels[a.level]
        })[0]
  
        return `The most significant environmental risk in this area is ${highestRisk.type.toLowerCase()}, which is currently at a ${highestRisk.level} level. ${highestRisk.description} 
        Other risks include ${environmentalInsights.risks[1].type.toLowerCase()} (${environmentalInsights.risks[1].level}) and ${environmentalInsights.risks[2].type.toLowerCase()} (${environmentalInsights.risks[2].level}).`
      }
  
      // Sustainability related questions
      else if (
        q.includes("sustainability") ||
        q.includes("sustainable") ||
        q.includes("eco") ||
        q.includes("green") ||
        q.includes("recommendation") ||
        q.includes("tip")
      ) {
        const recommendations = environmentalInsights.sustainability.flatMap((cat) => cat.recommendations).slice(0, 3)
  
        return `Based on the environmental conditions in ${weatherData.location}, here are some sustainability recommendations:
        1. ${recommendations[0]}
        2. ${recommendations[1]}
        3. ${recommendations[2]}
        
        These practices are particularly important in this area due to the ${environmentalInsights.localEnvironment.ecosystemType.toLowerCase()} ecosystem and the ${environmentalInsights.risks[0].level} risk of ${environmentalInsights.risks[0].type.toLowerCase()}.`
      }
  
      // Air quality related questions
      else if (q.includes("air") || q.includes("pollution") || q.includes("quality") || q.includes("breathe")) {
        return `The current air quality in ${weatherData.location} is categorized as "${weatherData.airQuality.category}". 
        The Air Quality Index (AQI) is ${weatherData.airQuality.aqi}, with PM2.5 levels at ${weatherData.airQuality.pm25} μg/m³ and PM10 at ${weatherData.airQuality.pm10} μg/m³. 
        ${
          weatherData.airQuality.category === "Good"
            ? "This is considered healthy for all individuals."
            : weatherData.airQuality.category === "Moderate"
              ? "This may cause minor breathing discomfort for sensitive individuals."
              : weatherData.airQuality.category === "Unhealthy for Sensitive Groups"
                ? "People with respiratory conditions should limit outdoor activities."
                : "Everyone should reduce outdoor exertion and consider wearing masks when outside."
        }`
      }
  
      // Biodiversity and ecosystem related questions
      else if (
        q.includes("ecosystem") ||
        q.includes("biodiversity") ||
        q.includes("wildlife") ||
        q.includes("species") ||
        q.includes("animal") ||
        q.includes("plant")
      ) {
        return `${weatherData.location} is primarily a ${environmentalInsights.localEnvironment.ecosystemType.toLowerCase()} ecosystem. ${environmentalInsights.localEnvironment.biodiversity} 
        Local conservation efforts focus on ${environmentalInsights.localEnvironment.conservation.toLowerCase()}
        However, this ecosystem faces challenges including ${environmentalInsights.localEnvironment.challenges[0].toLowerCase()} and ${environmentalInsights.localEnvironment.challenges[1].toLowerCase()}.`
      }
  
      // General or unrecognized questions
      else {
        return `Based on the environmental data for ${weatherData.location}, I can tell you that the current temperature is ${getTemperatureInCurrentUnit(weatherData.current.temperature)}°${useMetric ? "C" : "F"} with ${weatherData.current.weatherDescription.toLowerCase()} conditions. 
        The air quality is ${weatherData.airQuality.category.toLowerCase()}, and the area has a ${environmentalInsights.localEnvironment.ecosystemType.toLowerCase()} ecosystem.
        The main environmental concern is a ${environmentalInsights.risks[0].level} risk of ${environmentalInsights.risks[0].type.toLowerCase()}.
        
        You can ask me specific questions about the weather forecast, air quality, environmental risks, or sustainability recommendations for this location.`
      }
    }
  
    // Show toast notification
    function showToast(title, message, type = "info") {
      const toastContainer = document.getElementById("toast-container")
  
      // Create toast element
      const toast = document.createElement("div")
      toast.className = `toast toast-${type}`
  
      // Set icon based on type
      let iconSvg = ""
      switch (type) {
        case "success":
          iconSvg =
            '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="toast-icon"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>'
          break
        case "error":
          iconSvg =
            '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="toast-icon"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>'
          break
        default:
          iconSvg =
            '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="toast-icon"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>'
      }
  
      toast.innerHTML = `
        ${iconSvg}
        <div class="toast-message">
          <div class="toast-title">${title}</div>
          <div>${message}</div>
        </div>
      `
  
      // Add toast to container
      toastContainer.appendChild(toast)
  
      // Remove toast after 3 seconds
      setTimeout(() => {
        toast.remove()
      }, 3000)
    }
  
    // Declare L here to avoid undefined variable error
    const L = window.L
  })
  
  