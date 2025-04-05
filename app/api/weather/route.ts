import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const lat = searchParams.get("lat")
    const lng = searchParams.get("lng")

    if (!lat || !lng) {
      return NextResponse.json({ error: "Missing latitude or longitude parameters" }, { status: 400 })
    }

    // In a real app, you would fetch data from a weather API
    // For this example, we'll return mock data
    const mockWeatherData = {
      location: `Location at ${lat}, ${lng}`,
      coordinates: { lat: Number.parseFloat(lat), lng: Number.parseFloat(lng) },
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

    return NextResponse.json(mockWeatherData)
  } catch (error) {
    console.error("Error fetching weather data:", error)
    return NextResponse.json({ error: "Failed to fetch weather data" }, { status: 500 })
  }
}

