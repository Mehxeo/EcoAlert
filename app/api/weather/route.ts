import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const lat = searchParams.get("lat")
    const lng = searchParams.get("lng")

    if (!lat || !lng) {
      return NextResponse.json({ error: "Missing latitude or longitude parameters" }, { status: 400 })
    }

    // Get API key from environment variables
    const apiKey = process.env.OPENWEATHER_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "Weather API key not configured" }, { status: 500 })
    }

    const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${apiKey}&units=metric`
    const currentResponse = await fetch(currentWeatherUrl)
    
    if (!currentResponse.ok) {
      throw new Error(`Weather API responded with status ${currentResponse.status}`)
    }
    
    const currentData = await currentResponse.json()

    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lng}&appid=${apiKey}&units=metric`
    const forecastResponse = await fetch(forecastUrl)
    
    if (!forecastResponse.ok) {
      throw new Error(`Forecast API responded with status ${forecastResponse.status}`)
    }
    
    const forecastData = await forecastResponse.json()

    // Fetch air quality data
    const airQualityUrl = `http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lng}&appid=${apiKey}`
    const airQualityResponse = await fetch(airQualityUrl)
    let airQualityData = null
    
    if (airQualityResponse.ok) {
      airQualityData = await airQualityResponse.json()
    }

    const weatherData = {
      location: currentData.name || `Location at ${lat}, ${lng}`,
      coordinates: { lat: Number.parseFloat(lat), lng: Number.parseFloat(lng) },
      current: {
        temperature: Math.round(currentData.main.temp),
        feelsLike: Math.round(currentData.main.feels_like),
        humidity: currentData.main.humidity,
        windSpeed: currentData.wind.speed,
        windDirection: currentData.wind.deg || 0,
        pressure: currentData.main.pressure,
        weatherCode: currentData.weather[0].id,
        weatherDescription: currentData.weather[0].description,
        icon: currentData.weather[0].icon,
      },
      airQuality: airQualityData ? {
        aqi: airQualityData.list[0].main.aqi,
        components: airQualityData.list[0].components
      } : null,
      forecast: forecastData.list
        .filter((item: any, index: number) => index % 8 === 0) 
        .slice(0, 7) // Limit to 7 days
        .map((item: any) => ({
          date: new Date(item.dt * 1000).toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
          }),
          maxTemp: Math.round(item.main.temp_max),
          minTemp: Math.round(item.main.temp_min),
          weatherCode: item.weather[0].id,
          weatherDescription: item.weather[0].description,
          icon: item.weather[0].icon,
          precipitation: item.pop ? Math.round(item.pop * 100) : 0,
          humidity: item.main.humidity,
          windSpeed: item.wind.speed,
        }))
    }

    return NextResponse.json(weatherData)
  } catch (error) {
    console.error("Error fetching weather data:", error)
    return NextResponse.json(
      { error: "Failed to fetch weather data", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}