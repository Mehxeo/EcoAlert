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

    function getLocation(callback) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(success, error);
      } else {
        alert("Geolocation not supported")
      }
    }
    function success(position, callback) {
      lat = position.coords.latitude
      long =  position.coords.longitude;
      const locationName = `Location at ${lat.toFixed(4)}, ${long.toFixed(4)}`
      
      selectLocation(lat, long, locationName);
      if (callback) callback
    }
    
    function error(callback) {
      alert("Sorry, no position available.");
      if (callback) callback
    }
  
    initMap(() => {
      const saved = localStorage.getItem('lastLocation')
      if (saved) {
        const { lat, lng, name } = JSON.parse(saved)
        selectLocation(lat, lng, name)
      }
    })

    setupEventListeners()

    function addLegend(layerName) {
      const legendUrl = {
        Clouds: "images/NT2.png",
        Precipitation: "images/PR.png",
        Pressure: "images/PN.png",
        Wind: "images/UV.png",
        Temperature: "images/TT.png",
        Clear: ""
      }[layerName]
    
      if (!legendUrl) return
    
      if (window.legendControl) {
        map.removeControl(window.legendControl)
      }
    
      window.legendControl = L.control({ position: "bottomleft" })
      window.legendControl.onAdd = function () {
        const div = L.DomUtil.create("div", "legend")
        div.innerHTML = `<img src="${legendUrl}" alt="${layerName} legend" style="width:80px; mix-blend-mode: multiply; height:180px; opacity:0.5; border:1px solid #ccc; background:white; padding:5px;">`
        return div
      }
      window.legendControl.addTo(map)
    }
  
    // make map with Leaflet
    function initMap(finalCallback) {
      const mapContainer = document.getElementById("map")
      if (!mapContainer) return
    
      if (mapContainer.clientHeight === 0) {
        mapContainer.style.height = "400px"
      }
    
      setTimeout(() => {
        map = L.map("map", {
          zoomControl: true,
          attributionControl: true,
          fadeAnimation: false,
          zoomAnimation: false,
        }).setView([20, 0], 2)
    
        updateMapStyle()

        const recenterControl = L.control({ position: 'bottomright' });

        recenterControl.onAdd = function (map) {
          const btn = L.DomUtil.create('button', 'recenter-button');
          btn.innerHTML = 'Recenter';
          btn.title = 'Go to your location';

          L.DomEvent.on(btn, 'click', function (e) {
            L.DomEvent.stopPropagation(e);
            L.DomEvent.preventDefault(e);
    
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(
                (pos) => {
                  const lat = pos.coords.latitude;
                  const lng = pos.coords.longitude;
                  const locationName = `Location at ${lat.toFixed(4)}, ${long.toFixed(4)}`;

                  selectLocation(lat, lng, locationName);
                },
                () => {
                  alert("Unable to retrieve your location.");
                }
              );
            } else {
              alert("Geolocation not supported.");
            }
          });
    
          return btn;
        };
  
        recenterControl.addTo(map);
    
        map.on("click", (e) => {
          const { lat, lng } = e.latlng
          const locationName = `Location at ${lat.toFixed(4)}, ${lng.toFixed(4)}`
          selectLocation(lat, lng, locationName)
        })
    
        setTimeout(() => {
          const apiKey = "7f20fc2f93e77c7761113eb0ccf55653"
          const weatherBaseLayers  = {
            Clouds: L.tileLayer(`https://tile.openweathermap.org/map/clouds/{z}/{x}/{y}.png?appid=${apiKey}`, {
              attribution: '&copy; <a href="https://openweathermap.org">OpenWeatherMap</a>'
            }),
            Precipitation: L.tileLayer(`https://tile.openweathermap.org/map/precipitation/{z}/{x}/{y}.png?appid=${apiKey}`, {
              attribution: '&copy; <a href="https://openweathermap.org">OpenWeatherMap</a>'
            }),
            Pressure: L.tileLayer(`https://tile.openweathermap.org/map/pressure_new/{z}/{x}/{y}.png?appid=${apiKey}`, {
              attribution: '&copy; <a href="https://openweathermap.org">OpenWeatherMap</a>'
            }),
            Wind: L.tileLayer(`https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid=${apiKey}`, {
              attribution: '&copy; <a href="https://openweathermap.org">OpenWeatherMap</a>'
            }),
            Temperature: L.tileLayer(`https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${apiKey}`, {
              attribution: '&copy; <a href="https://openweathermap.org">OpenWeatherMap</a>'
            }),
            Clear: L.tileLayer()
          }

          weatherBaseLayers.Temperature.addTo(map)
          addLegend("Temperature")

          Object.entries(weatherBaseLayers).forEach(([name, layer]) => {
            layer.on("add", () => addLegend(name))
          })
          const customWeatherControl = L.control({ position: 'topright' });

          customWeatherControl.onAdd = function () {
            const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
            container.style.background = 'white';
            container.style.color = "black"
            container.style.padding = '8px';
            container.style.border = "4px solid hsl(123, 46%, 34%)"
            
            container.innerHTML = `
              <strong style="font-size: 14px;">Weather Layers</strong><br>
              <select id="weather-layer-select" style="margin-top:5px;">
                <option value="">None</option>
                <option value="Clouds">Clouds</option>
                <option value="Precipitation">Precipitation</option>
                <option value="Pressure">Pressure</option>
                <option value="Wind">Wind</option>
                <option value="Temperature">Temperature</option>
              </select>
            `;
          
            L.DomEvent.disableClickPropagation(container);
            return container;
          };
          
          customWeatherControl.addTo(map);

          const weatherLayers = {
            Clouds: weatherBaseLayers.Clouds,
            Precipitation: weatherBaseLayers.Precipitation,
            Pressure: weatherBaseLayers.Pressure,
            Wind: weatherBaseLayers.Wind,
            Temperature: weatherBaseLayers.Temperature,
          };
          
          let currentWeatherLayer = weatherBaseLayers.Temperature; // if Temperature is default
          document.getElementById("weather-layer-select").value = "Temperature";
          
          document.getElementById("weather-layer-select").addEventListener("change", (e) => {
            const selected = e.target.value;
          
            if (currentWeatherLayer) {
              map.removeLayer(currentWeatherLayer);
              currentWeatherLayer = null;
            }
          
            if (selected && weatherLayers[selected]) {
              currentWeatherLayer = weatherLayers[selected];
              currentWeatherLayer.addTo(map);
              addLegend(selected);
            } else if (window.legendControl) {
              map.removeControl(window.legendControl);
            }
          });

          map.invalidateSize()
    
          // When map is ready, get user location
          getLocation(() => {
            if (finalCallback) finalCallback()
          })
        }, 100)
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
            const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=11&language=en&format=json`)
            
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
          selectLocation(Lat, Lng, locationName);
          document.getElementById("tabs-display").style.setProperty("display", "block");
  
          // hide loading indicator
          showLoading(false)
        }, 500)
      })
    
      document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', () => {
          const targetTabId = button.getAttribute('data-tab');
      
          console.log("Tab clicked:", targetTabId);

          console.log(document.getElementById(targetTabId).classList)
          document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
          document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
      
          button.classList.add('active');
          document.getElementById(targetTabId).classList.add('active');
          document.getElementById(targetTabId).classList.remove('hidden')
        });
      });

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
          
          // Disable the input and submit button while processing
          chatInput.disabled = true
          const submitButton = chatForm.querySelector('button[type="submit"]')
          if (submitButton) submitButton.disabled = true
          
          // Add user message
          addChatMessage(question, "user")
          chatInput.value = ""
          
          // Ask AI without showing "Thinking..." message
          askAI(question)
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

      localStorage.setItem('lastLocation', JSON.stringify(selectedLocation))
      updateMarker()
      fetchWeatherAndEnvironmentalData()
    }
  
    function updateMarker() {
      if (!map){
        console.warn("Map not ready when trying to add marker.")
      }
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
          environmentalInsights = data
  
          updateWeatherUI(weatherData)
          updateEnvironmentalInsightsUI(environmentalInsights)

          fetchFloodData(selectedLocation.lat, selectedLocation.lng);
  
          document.getElementById("weather-data").classList.remove("hidden")
  
          showLoading(false)
  
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

      generateAirQualityInsights(selectedLocation.lat, selectedLocation.lng);
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
  
    function updateWeatherUI(data) {
      document.getElementById("location-name").textContent = data.location
      document.getElementById("location-coordinates").textContent =
        `Lat: ${data.coordinates.lat.toFixed(4)}, Lng: ${data.coordinates.lng.toFixed(4)}`
  
      document.getElementById("current-temp").textContent = getTemperatureInCurrentUnit(data.current.temperature)
      document.getElementById("feels-like").textContent = getTemperatureInCurrentUnit(data.current.feelsLike)
      document.getElementById("weather-description").textContent = data.current.weatherDescription
      document.getElementById("humidity").textContent = `${data.current.humidity}%`
      document.getElementById("wind-speed").textContent = `${data.current.windSpeed} km/h`
      document.getElementById("pressure").textContent = `${data.current.pressure} hPa`
      document.getElementById("uv-index").textContent = data.current.uvIndex
      document.getElementById("visibility").textContent = `${data.current.visibility} km`
  
      const iconUrl = `https://openweathermap.org/img/wn/${data.current.icon}@2x.png`
      document.getElementById("weather-icon").src = iconUrl
      document.getElementById("weather-icon").alt = data.current.weatherDescription
  
      const airQualityElement = document.getElementById("air-quality-badge")
      airQualityElement.textContent = data.airQuality.category
      airQualityElement.className = "badge"
  
      if (data.airQuality.category === "Good") {
        airQualityElement.classList.add("badge-good")
      } else if (data.airQuality.category === "Moderate") {
        airQualityElement.classList.add("badge-moderate")
      } else if (data.airQuality.category === "Unhealthy for Sensitive Groups") {
        airQualityElement.classList.add("badge-unhealthy-sensitive")
      } else {
        airQualityElement.classList.add("badge-unhealthy")
      }
  
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
  
      document.getElementById("aqi-value").textContent = data.airQuality.aqi
      document.getElementById("aqi-category").textContent = data.airQuality.category
      document.getElementById("aqi-category").className = "badge"
  
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
        if (index === 0) categoryElement.classList.add("active")
  
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
  
      const localEnvironmentContainer = document.getElementById("local-environment")
      localEnvironmentContainer.innerHTML = ""
  
      const ecosystemElement = document.createElement("div")
      ecosystemElement.className = "environment-section"
      ecosystemElement.innerHTML = `
        <div class="environment-title" style="font-size: 1.2rem; font-weight: bold; color: white; margin-bottom: 1px;">Ecosystem Type</div>
        <p>${data.localEnvironment.ecosystemType}</p>
      `
      localEnvironmentContainer.appendChild(ecosystemElement)
  
      const biodiversityElement = document.createElement("div")
      biodiversityElement.className = "environment-section"
      biodiversityElement.innerHTML = `
        <div class="environment-title" style="font-size: 1.2rem; font-weight: bold; color: white; margin-bottom: 1px;">Biodiversity</div>
        <p>${data.localEnvironment.biodiversity}</p>
      `
      localEnvironmentContainer.appendChild(biodiversityElement)
  
      const conservationElement = document.createElement("div")
      conservationElement.className = "environment-section"
      conservationElement.innerHTML = `
        <div class="environment-title" style="font-size: 1.2rem; font-weight: bold; color: white; margin-bottom: 1px;">Conservation Efforts</div>
        <p>${data.localEnvironment.conservation}</p>
      `
      localEnvironmentContainer.appendChild(conservationElement)
  
      const challengesElement = document.createElement("div")
      challengesElement.className = "environment-section"
  
      const challengesList = data.localEnvironment.challenges.map((challenge) => `<li>${challenge}</li>`).join("")
  
      challengesElement.innerHTML = `
        <div class="environment-title" style="font-size: 1.2rem; font-weight: bold; color: white; margin-bottom: 1px;">Environmental Challenges</div>
        <ul class="challenge-list">
          ${challengesList}
        </ul>
      `
      localEnvironmentContainer.appendChild(challengesElement)
    }
  
    function showLoading(show) {
      const loadingIndicator = document.getElementById("loading-indicator")
      if (show) {
        loadingIndicator.classList.remove("hidden")
      } else {
        loadingIndicator.classList.add("hidden")
      }
    }
  
    function addChatMessage(message, type, messageId = null) {
      const chatMessages = document.getElementById("chat-messages")
      const messageElement = document.createElement("div")
      
      const id = messageId || "msg-" + Date.now()
      messageElement.id = id
      
      messageElement.className = `message ${type}-message`
      
      let formattedMessage = message
      
      formattedMessage = formattedMessage.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      
      formattedMessage = formattedMessage.replace(/\n\s*\*\s/g, '\n• ')
      
      messageElement.innerHTML = `<p>${formattedMessage}</p>`
      
      chatMessages.appendChild(messageElement)
      chatMessages.scrollTop = chatMessages.scrollHeight
      
      return id
    }
  
    function askAI(question) {
      if (!selectedLocation.lat || !selectedLocation.lng) {
        showToast("Error", "Please select a location on the map first", "error")
        return
      }

      if (!weatherData) {
        showToast("Error", "Please wait for weather data to load", "error")
        return
      }

      fetch("/api/ask-ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: question,
          location: selectedLocation,
          weatherData: weatherData,
          environmentalInsights: environmentalInsights,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.error) {
            throw new Error(data.error)
          }
          
          let formattedResponse = data.response
          
          formattedResponse = formattedResponse.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          formattedResponse = formattedResponse.replace(/\n\s*\*\s/g, '\n• ')
          
          addChatMessage(formattedResponse, "ai")
        })
        .catch((error) => {
          console.error("Error:", error)
          addChatMessage(`Error: ${error.message}`, "error")
        })
        .finally(() => {
          const chatInput = document.getElementById("chat-input")
          const submitButton = document.querySelector('#chat-form button[type="submit"]')
          if (chatInput) chatInput.disabled = false
          if (submitButton) submitButton.disabled = false
        })
    }
  
    function showToast(title, message, type = "info") {
      const toastContainer = document.getElementById("toast-container")
  
      const toast = document.createElement("div")
      toast.className = `toast toast-${type}`
  
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

      toastContainer.appendChild(toast)
  
      setTimeout(() => {
        toast.remove()
      }, 3000)
    }

    async function generateAirQualityInsights(lat, lng) {
      const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lng}&hourly=us_aqi,us_aqi_pm2_5,us_aqi_pm10,us_aqi_nitrogen_dioxide,us_aqi_ozone,us_aqi_carbon_monoxide,us_aqi_sulphur_dioxide&current=us_aqi`;
    
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
        const data = await response.json();
    
        const timeSeries = data.hourly.time.slice(0, 24);
        const editedTimeSeries = timeSeries.map((isoString) => {
          const date = new Date(isoString);
          return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          });
        });
        const pm10Series = data.hourly.us_aqi_pm10.slice(0, 24);
        const pm25Series = data.hourly.us_aqi_pm2_5.slice(0, 24);
    
        renderAirQualityChart(editedTimeSeries, pm25Series, pm10Series);
      } catch (error) {
        console.error("Error fetching air quality data:", error);
      }
    }
    
    let airQualityChart;
    
    function renderAirQualityChart(timeLabels, pm25, pm10) {
      const ctx = document.getElementById("aq-chart").getContext("2d");
    
      if (airQualityChart) {
        airQualityChart.destroy();
      }
    
      airQualityChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: splitLongLabels(timeLabels),
          datasets: [
            {
              label: 'PM2.5',
              data: pm25,
              borderColor: '#ff6384',
              fill: false,
              tension: 0.2
            },
            {
              label: 'PM10',
              data: pm10,
              borderColor: '#36a2eb',
              fill: false,
              tension: 0.2
            }
          ]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: 'Hourly Air Quality: PM2.5 & PM10',
              font: {
                size: 18
              }
            }
          },
          scales: {
            y: {
              title: {
                display: true,
                text: 'US AQI Value'
              }
            },
            x: {
              ticks: {
                maxTicksLimit: 12,
                minRotation: 0,
                maxRotation: 0
              }
            }
          }
        }
      });
    }
    
    function splitLongLabels(labels){
      var i = 0, len = labels.length;
      var splitlabels = labels;
      while (i < len) {
          var words = labels[i].trim().split(',');
          if(words.length>1){
            for(var j=0; j<words.length; j++){}
            splitlabels[i] = words;
          }   
        i++
      }
      return splitlabels;
  }

  async function fetchFloodData(lat, lng) {
    const url = `https://flood-api.open-meteo.com/v1/flood?latitude=${lat}&longitude=${lng}&daily=river_discharge`;
  
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Failed to fetch flood data: ${response.status} ${response.statusText}`);
      const data = await response.json();
  
      updateFloodRiskUI(data.daily);
    } catch (error) {
      console.error("Error fetching flood data:", error);
      showToast("Error", "Failed to load flood data. Please try again later.", "error");
    }
  }

  function updateFloodRiskUI(dailyData) {
    const floodRisksGrid = document.getElementById("flood-risks-grid");
  
    if (dailyData && dailyData.river_discharge) {
      // Limit to the first 6 days
      const riverDischarge = dailyData.river_discharge.slice(0, 6);
      const time = dailyData.time.slice(0, 6);
  
      floodRisksGrid.innerHTML = riverDischarge
        .map((discharge, index) => {
          const date = time[index];
          const riskLevel = discharge > 5000 ? "High" : discharge > 2000 ? "Moderate" : "Low";
          const badgeClass = {
            High: "badge-high",
            Moderate: "badge-moderate",
            Low: "badge-low",
          }[riskLevel];
  
          return `
            <div class="flood-risk-item">
              <h4>Flood Risk on ${new Date(date).toLocaleDateString()}</h4>
              <p><strong>Risk Level:</strong> <span class="badge ${badgeClass}">${riskLevel} Risk</span></p>
              <p>River discharge: ${discharge} m³/s</p>
            </div>
          `;
        })
        .join("");
    } else {
      floodRisksGrid.innerHTML = "<p>No flood data available for this location.</p>";
    }
  }
})
  
  