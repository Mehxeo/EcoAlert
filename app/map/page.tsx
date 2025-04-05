"use client"

import type React from "react"

import { useState, useRef } from "react"
import Link from "next/link"
import { Leaf, Search, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ModeToggle } from "@/components/mode-toggle"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useTheme } from "next-themes"
import dynamic from "next/dynamic"

// Leaflet stuff
const MapComponent = dynamic(() => import("@/components/map-component"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
      <Loader2 className="h-8 w-8 text-green-600 dark:text-green-400 animate-spin" />
    </div>
  ),
})

interface WeatherData {
  location: string
  coordinates: { lat: number; lng: number }
  current: {
    temperature: number
    feelsLike: number
    humidity: number
    windSpeed: number
    windDirection: number
    pressure: number
    uvIndex: number
    visibility: number
    weatherCode: number
    weatherDescription: string
    icon: string
  }
  airQuality: {
    aqi: number
    pm25: number
    pm10: number
    o3: number
    no2: number
    so2: number
    co: number
    category: string
  }
  forecast: Array<{
    date: string
    maxTemp: number
    minTemp: number
    weatherCode: number
    weatherDescription: string
    icon: string
    precipitation: number
    humidity: number
    windSpeed: number
  }>
}

interface EnvironmentalInsights {
  risks: Array<{
    type: string
    level: "low" | "moderate" | "high" | "severe"
    description: string
  }>
  sustainability: Array<{
    category: string
    recommendations: string[]
  }>
  localEnvironment: {
    ecosystemType: string
    biodiversity: string
    conservation: string
    challenges: string[]
  }
}

export default function MapPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number; name: string } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [environmentalInsights, setEnvironmentalInsights] = useState<EnvironmentalInsights | null>(null)
  const { toast } = useToast()
  const { theme } = useTheme()
  const mapRef = useRef(null)

  // map click for location selection
  const handleMapClick = (lat: number, lng: number, name: string) => {
    setSelectedLocation({ lat, lng, name })
    fetchWeatherAndEnvironmentalData(lat, lng, name)
  }

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    setIsLoading(true)
    // Geocoding would normally go here so add later
    setTimeout(() => {
      const randomLat = Math.random() * 180 - 90
      const randomLng = Math.random() * 360 - 180
      setSelectedLocation({
        lat: randomLat,
        lng: randomLng,
        name: searchQuery,
      })
      fetchWeatherAndEnvironmentalData(randomLat, randomLng, searchQuery)
      setIsLoading(false)
    }, 1000)
  }

  // Fetch weather and environmental data
  const fetchWeatherAndEnvironmentalData = async (lat: number, lng: number, locationName: string) => {
    setIsLoading(true)

    try {
      // ADD API CALLS 
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Mock weather data
      const mockWeatherData: WeatherData = {
        location: locationName,
        coordinates: { lat, lng },
        current: {
          temperature: Math.round(15 + Math.random() * 20),
          feelsLike: Math.round(15 + Math.random() * 20),
          humidity: Math.round(40 + Math.random() * 50),
          windSpeed: Math.round(5 + Math.random() * 20),
          windDirection: Math.round(Math.random() * 360),
          pressure: Math.round(1000 + Math.random() * 30),
          uvIndex: Math.round(1 + Math.random() * 10),
          visibility: Math.round(5 + Math.random() * 15),
          weatherCode: Math.floor(Math.random() * 4),
          weatherDescription: ["Clear sky", "Partly cloudy", "Cloudy", "Light rain"][Math.floor(Math.random() * 4)],
          icon: ["01d", "02d", "03d", "10d"][Math.floor(Math.random() * 4)],
        },
        airQuality: {
          aqi: Math.round(20 + Math.random() * 150),
          pm25: Math.round(5 + Math.random() * 30),
          pm10: Math.round(10 + Math.random() * 50),
          o3: Math.round(20 + Math.random() * 60),
          no2: Math.round(5 + Math.random() * 40),
          so2: Math.round(2 + Math.random() * 20),
          co: Math.round(200 + Math.random() * 800),
          category: ["Good", "Moderate", "Unhealthy for Sensitive Groups", "Unhealthy"][Math.floor(Math.random() * 4)],
        },
        forecast: Array.from({ length: 7 }, (_, i) => {
          const weatherCodeIndex = Math.floor(Math.random() * 4)
          return {
            date: new Date(Date.now() + i * 86400000).toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            }),
            maxTemp: Math.round(20 + Math.random() * 15),
            minTemp: Math.round(10 + Math.random() * 15),
            weatherCode: weatherCodeIndex,
            weatherDescription: ["Clear sky", "Partly cloudy", "Cloudy", "Light rain"][weatherCodeIndex],
            icon: ["01d", "02d", "03d", "10d"][weatherCodeIndex],
            precipitation: Math.round(Math.random() * 100),
            humidity: Math.round(40 + Math.random() * 50),
            windSpeed: Math.round(5 + Math.random() * 20),
          }
        }),
      }

      const mockEnvironmentalInsights: EnvironmentalInsights = {
        risks: [
          {
            type: "Flooding",
            level: ["low", "moderate", "high", "severe"][Math.floor(Math.random() * 4)] as
              | "low"
              | "moderate"
              | "high"
              | "severe",
            description:
              "Based on topography and proximity to water bodies, this area has potential flood risk during heavy rainfall events.",
          },
          {
            type: "Drought",
            level: ["low", "moderate", "high", "severe"][Math.floor(Math.random() * 4)] as
              | "low"
              | "moderate"
              | "high"
              | "severe",
            description:
              "Historical climate data indicates periodic drought conditions that may affect water availability.",
          },
          {
            type: "Air Pollution",
            level: ["low", "moderate", "high", "severe"][Math.floor(Math.random() * 4)] as
              | "low"
              | "moderate"
              | "high"
              | "severe",
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
          conservation:
            "Local conservation efforts focus on habitat preservation and restoration of natural waterways.",
          challenges: [
            "Habitat fragmentation due to urban development",
            "Invasive species affecting native biodiversity",
            "Water quality concerns in local watersheds",
          ],
        },
      }

      setWeatherData(mockWeatherData)
      setEnvironmentalInsights(mockEnvironmentalInsights)

      toast({
        title: "Location data loaded",
        description: `Weather and environmental data for ${locationName} has been loaded.`,
      })
    } catch (error) {
      console.error("Error fetching data:", error)
      toast({
        title: "Error loading data",
        description: "There was a problem fetching data for this location. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Get air quality color based on AQI
  const getAirQualityColor = (category: string) => {
    switch (category) {
      case "Good":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "Moderate":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "Unhealthy for Sensitive Groups":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
      case "Unhealthy":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300"
    }
  }

  // Get risk level color
  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "moderate":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "high":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
      case "severe":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300"
    }
  }

  // Get weather icon URL
  const getWeatherIconUrl = (icon: string) => {
    return `https://openweathermap.org/img/wn/${icon}@2x.png`
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 dark:from-green-950 dark:to-slate-950">
      <div className="container mx-auto px-4 py-6">
        <header className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Leaf className="h-8 w-8 text-green-600 dark:text-green-400" />
            <h1 className="text-2xl font-bold text-green-700 dark:text-green-400">EcoAlert</h1>
          </div>
          <nav className="flex items-center gap-6">
            <Link
              href="/"
              className="font-medium text-slate-600 hover:text-green-700 dark:text-slate-300 dark:hover:text-green-400"
            >
              Home
            </Link>
            <Link
              href="/map"
              className="font-medium text-green-700 dark:text-green-400 border-b-2 border-green-600 dark:border-green-400"
            >
              Explore Map
            </Link>
            <ModeToggle />
          </nav>
        </header>

        <main className="space-y-8">
          <div className="bg-white/80 dark:bg-slate-800/80 rounded-xl p-6 shadow-md">
            <h2 className="text-2xl font-bold text-green-700 dark:text-green-400 mb-4">
              Select Location for Environmental Analysis
            </h2>

            <form onSubmit={handleSearch} className="flex gap-2 mb-6">
              <Input
                type="text"
                placeholder="Search for a location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </>
                )}
              </Button>
            </form>

            <div className="rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 h-[400px]">
              <MapComponent
                onLocationSelect={handleMapClick}
                selectedLocation={selectedLocation}
                theme={theme || "light"}
                ref={mapRef}
              />
            </div>

            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              Click on the map to select a location or use the search bar above
            </p>
          </div>

          {isLoading && (
            <div className="space-y-6">
              <Skeleton className="h-[200px] w-full rounded-xl" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Skeleton className="h-[300px] w-full rounded-xl" />
                <Skeleton className="h-[300px] w-full rounded-xl" />
                <Skeleton className="h-[300px] w-full rounded-xl" />
              </div>
            </div>
          )}

          {weatherData && !isLoading && (
            <div className="space-y-8">
              <Card className="bg-white/80 dark:bg-slate-800/80 border-green-100 dark:border-green-900">
                <CardHeader>
                  <CardTitle className="text-2xl text-green-700 dark:text-green-400">{weatherData.location}</CardTitle>
                  <CardDescription>
                    Lat: {weatherData.coordinates.lat.toFixed(4)}, Lng: {weatherData.coordinates.lng.toFixed(4)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col items-center">
                      <div className="flex items-center">
                        <img
                          src={getWeatherIconUrl(weatherData.current.icon) || "/placeholder.svg"}
                          alt={weatherData.current.weatherDescription}
                          className="w-24 h-24"
                        />
                        <div className="text-6xl font-bold text-green-700 dark:text-green-400">
                          {weatherData.current.temperature}°
                        </div>
                      </div>
                      <p className="text-xl capitalize">{weatherData.current.weatherDescription}</p>
                      <p className="text-slate-600 dark:text-slate-400">Feels like {weatherData.current.feelsLike}°</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col">
                        <span className="text-sm text-slate-500 dark:text-slate-400">Humidity</span>
                        <span className="text-lg font-medium">{weatherData.current.humidity}%</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm text-slate-500 dark:text-slate-400">Wind</span>
                        <span className="text-lg font-medium">{weatherData.current.windSpeed} km/h</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm text-slate-500 dark:text-slate-400">Pressure</span>
                        <span className="text-lg font-medium">{weatherData.current.pressure} hPa</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm text-slate-500 dark:text-slate-400">UV Index</span>
                        <span className="text-lg font-medium">{weatherData.current.uvIndex}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm text-slate-500 dark:text-slate-400">Visibility</span>
                        <span className="text-lg font-medium">{weatherData.current.visibility} km</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm text-slate-500 dark:text-slate-400">Air Quality</span>
                        <Badge className={`${getAirQualityColor(weatherData.airQuality.category)} mt-1`}>
                          {weatherData.airQuality.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Tabs defaultValue="forecast" className="w-full">
                <TabsList className="grid grid-cols-3 mb-4">
                  <TabsTrigger value="forecast">7-Day Forecast</TabsTrigger>
                  <TabsTrigger value="airquality">Air Quality</TabsTrigger>
                  <TabsTrigger value="insights">Environmental Insights</TabsTrigger>
                </TabsList>

                <TabsContent value="forecast" className="space-y-4">
                  <Card className="bg-white/80 dark:bg-slate-800/80 border-green-100 dark:border-green-900">
                    <CardHeader>
                      <CardTitle className="text-xl text-green-700 dark:text-green-400">
                        7-Day Weather Forecast
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
                        {weatherData.forecast.map((day, index) => (
                          <div
                            key={index}
                            className="flex flex-col items-center p-3 rounded-lg bg-white dark:bg-slate-800 shadow-sm"
                          >
                            <div className="font-medium">{day.date.split(",")[0]}</div>
                            <img
                              src={getWeatherIconUrl(day.icon) || "/placeholder.svg"}
                              alt={day.weatherDescription}
                              className="w-12 h-12"
                            />
                            <div className="flex gap-2 text-sm">
                              <span className="font-medium">{day.maxTemp}°</span>
                              <span className="text-slate-500 dark:text-slate-400">{day.minTemp}°</span>
                            </div>
                            <div className="text-xs text-center text-slate-500 dark:text-slate-400 mt-1">
                              {day.weatherDescription}
                            </div>
                            <div className="text-xs text-center text-slate-500 dark:text-slate-400 mt-1">
                              {day.precipitation}% precip
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="airquality" className="space-y-4">
                  <Card className="bg-white/80 dark:bg-slate-800/80 border-green-100 dark:border-green-900">
                    <CardHeader>
                      <CardTitle className="text-xl text-green-700 dark:text-green-400">
                        Air Quality Information
                      </CardTitle>
                      <CardDescription>Current air quality index and pollutant levels</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col md:flex-row items-center gap-6 mb-6">
                        <div className="flex flex-col items-center">
                          <div
                            className={`text-6xl font-bold ${
                              weatherData.airQuality.category === "Good"
                                ? "text-green-600 dark:text-green-400"
                                : weatherData.airQuality.category === "Moderate"
                                  ? "text-yellow-600 dark:text-yellow-400"
                                  : weatherData.airQuality.category === "Unhealthy for Sensitive Groups"
                                    ? "text-orange-600 dark:text-orange-400"
                                    : "text-red-600 dark:text-red-400"
                            }`}
                          >
                            {weatherData.airQuality.aqi}
                          </div>
                          <Badge className={`${getAirQualityColor(weatherData.airQuality.category)} mt-2 text-sm`}>
                            {weatherData.airQuality.category}
                          </Badge>
                        </div>

                        <div className="flex-1">
                          <p className="mb-4">
                            {weatherData.airQuality.category === "Good"
                              ? "Air quality is considered satisfactory, and air pollution poses little or no risk."
                              : weatherData.airQuality.category === "Moderate"
                                ? "Air quality is acceptable; however, there may be a moderate health concern for a very small number of people."
                                : weatherData.airQuality.category === "Unhealthy for Sensitive Groups"
                                  ? "Members of sensitive groups may experience health effects. The general public is not likely to be affected."
                                  : "Everyone may begin to experience health effects; members of sensitive groups may experience more serious health effects."}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-3 rounded-lg bg-white dark:bg-slate-800 shadow-sm">
                          <div className="text-sm text-slate-500 dark:text-slate-400">PM2.5</div>
                          <div className="text-lg font-medium">{weatherData.airQuality.pm25} μg/m³</div>
                        </div>
                        <div className="p-3 rounded-lg bg-white dark:bg-slate-800 shadow-sm">
                          <div className="text-sm text-slate-500 dark:text-slate-400">PM10</div>
                          <div className="text-lg font-medium">{weatherData.airQuality.pm10} μg/m³</div>
                        </div>
                        <div className="p-3 rounded-lg bg-white dark:bg-slate-800 shadow-sm">
                          <div className="text-sm text-slate-500 dark:text-slate-400">Ozone (O₃)</div>
                          <div className="text-lg font-medium">{weatherData.airQuality.o3} μg/m³</div>
                        </div>
                        <div className="p-3 rounded-lg bg-white dark:bg-slate-800 shadow-sm">
                          <div className="text-sm text-slate-500 dark:text-slate-400">Nitrogen Dioxide (NO₂)</div>
                          <div className="text-lg font-medium">{weatherData.airQuality.no2} μg/m³</div>
                        </div>
                        <div className="p-3 rounded-lg bg-white dark:bg-slate-800 shadow-sm">
                          <div className="text-sm text-slate-500 dark:text-slate-400">Sulfur Dioxide (SO₂)</div>
                          <div className="text-lg font-medium">{weatherData.airQuality.so2} μg/m³</div>
                        </div>
                        <div className="p-3 rounded-lg bg-white dark:bg-slate-800 shadow-sm">
                          <div className="text-sm text-slate-500 dark:text-slate-400">Carbon Monoxide (CO)</div>
                          <div className="text-lg font-medium">{weatherData.airQuality.co} μg/m³</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="insights" className="space-y-4">
                  {environmentalInsights && (
                    <>
                      <Card className="bg-white/80 dark:bg-slate-800/80 border-green-100 dark:border-green-900">
                        <CardHeader>
                          <CardTitle className="text-xl text-green-700 dark:text-green-400">
                            Environmental Risks
                          </CardTitle>
                          <CardDescription>Potential environmental hazards in this location</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {environmentalInsights.risks.map((risk, index) => (
                              <div key={index} className="p-4 rounded-lg bg-white dark:bg-slate-800 shadow-sm">
                                <div className="flex justify-between items-center mb-2">
                                  <h3 className="text-lg font-medium">{risk.type}</h3>
                                  <Badge className={getRiskLevelColor(risk.level)}>
                                    {risk.level.charAt(0).toUpperCase() + risk.level.slice(1)} Risk
                                  </Badge>
                                </div>
                                <p className="text-slate-600 dark:text-slate-400">{risk.description}</p>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-white/80 dark:bg-slate-800/80 border-green-100 dark:border-green-900">
                        <CardHeader>
                          <CardTitle className="text-xl text-green-700 dark:text-green-400">
                            Sustainability Recommendations
                          </CardTitle>
                          <CardDescription>
                            AI-generated suggestions for improving environmental sustainability
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <Accordion type="single" collapsible className="w-full">
                            {environmentalInsights.sustainability.map((category, index) => (
                              <AccordionItem key={index} value={`item-${index}`}>
                                <AccordionTrigger className="text-lg font-medium text-green-700 dark:text-green-400">
                                  {category.category}
                                </AccordionTrigger>
                                <AccordionContent>
                                  <ul className="space-y-2 list-disc pl-6">
                                    {category.recommendations.map((rec, recIndex) => (
                                      <li key={recIndex} className="text-slate-600 dark:text-slate-400">
                                        {rec}
                                      </li>
                                    ))}
                                  </ul>
                                </AccordionContent>
                              </AccordionItem>
                            ))}
                          </Accordion>
                        </CardContent>
                      </Card>

                      <Card className="bg-white/80 dark:bg-slate-800/80 border-green-100 dark:border-green-900">
                        <CardHeader>
                          <CardTitle className="text-xl text-green-700 dark:text-green-400">
                            Local Environment
                          </CardTitle>
                          <CardDescription>Information about the local ecosystem and biodiversity</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="p-4 rounded-lg bg-white dark:bg-slate-800 shadow-sm">
                              <h3 className="text-lg font-medium mb-2">Ecosystem Type</h3>
                              <p className="text-slate-600 dark:text-slate-400">
                                {environmentalInsights.localEnvironment.ecosystemType}
                              </p>
                            </div>

                            <div className="p-4 rounded-lg bg-white dark:bg-slate-800 shadow-sm">
                              <h3 className="text-lg font-medium mb-2">Biodiversity</h3>
                              <p className="text-slate-600 dark:text-slate-400">
                                {environmentalInsights.localEnvironment.biodiversity}
                              </p>
                            </div>

                            <div className="p-4 rounded-lg bg-white dark:bg-slate-800 shadow-sm">
                              <h3 className="text-lg font-medium mb-2">Conservation Efforts</h3>
                              <p className="text-slate-600 dark:text-slate-400">
                                {environmentalInsights.localEnvironment.conservation}
                              </p>
                            </div>

                            <div className="p-4 rounded-lg bg-white dark:bg-slate-800 shadow-sm">
                              <h3 className="text-lg font-medium mb-2">Environmental Challenges</h3>
                              <ul className="space-y-2 list-disc pl-6">
                                {environmentalInsights.localEnvironment.challenges.map((challenge, index) => (
                                  <li key={index} className="text-slate-600 dark:text-slate-400">
                                    {challenge}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          )}
        </main>

        <footer className="py-6 mt-12 border-t border-green-200 dark:border-green-900">
          <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <Leaf className="h-6 w-6 text-green-600 dark:text-green-400" />
              <p className="text-sm text-slate-600 dark:text-slate-400">© 2025 EcoAlert. All rights reserved.</p>
            </div>
            <nav className="flex gap-4 text-sm text-slate-600 dark:text-slate-400">
              <Link href="#" className="hover:underline">
                Terms
              </Link>
              <Link href="#" className="hover:underline">
                Privacy
              </Link>
              <Link href="#" className="hover:underline">
                Contact
              </Link>
            </nav>
          </div>
        </footer>
      </div>
    </div>
  )
}

