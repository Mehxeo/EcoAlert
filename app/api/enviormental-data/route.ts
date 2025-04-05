import { NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(request: Request) {
  try {
    const { lat, lng, locationName, weatherData } = await request.json()

    if (!lat || !lng || !locationName) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    // Generate environmental insights using AI
    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt: `
        Generate environmental insights for the location: ${locationName} (Latitude: ${lat}, Longitude: ${lng}).
        
        Weather data: ${JSON.stringify(weatherData)}
        
        Please provide the following information in JSON format:
        1. Environmental risks in the area (flooding, drought, wildfires, etc.)
        2. Sustainability recommendations specific to this location
        3. Information about the local ecosystem and biodiversity
        
        Format the response as valid JSON with the following structure:
        {
          "risks": [
            {
              "type": "string",
              "level": "low|moderate|high|severe",
              "description": "string"
            }
          ],
          "sustainability": [
            {
              "category": "string",
              "recommendations": ["string"]
            }
          ],
          "localEnvironment": {
            "ecosystemType": "string",
            "biodiversity": "string",
            "conservation": "string",
            "challenges": ["string"]
          }
        }
      `,
      system:
        "You are an environmental science expert. Provide accurate, detailed environmental insights based on location and weather data. Always respond with valid JSON.",
    })

    // Parse the AI-generated text as JSON
    const environmentalInsights = JSON.parse(text)

    return NextResponse.json(environmentalInsights)
  } catch (error) {
    console.error("Error generating environmental insights:", error)
    return NextResponse.json({ error: "Failed to generate environmental insights" }, { status: 500 })
  }
}

