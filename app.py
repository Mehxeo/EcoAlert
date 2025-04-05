from flask import Flask, request, jsonify, render_template, send_from_directory
import os
import json
import random
from datetime import datetime, timedelta
import requests
import openai

app = Flask(__name__, static_folder='.')

# Set API keys using environment variables (more secure)
# In production, set these using your hosting platform's environment variables
# For local development, you can use a .env file (not included in version control)
OPENWEATHER_API_KEY = os.environ.get("OPENWEATHER_API_KEY", "6e7d8474db20a0cf8e9094f00fab8a6c")
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", "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")

# Configure OpenAI client
openai.api_key = OPENAI_API_KEY

@app.route('/')
def home():
    return send_from_directory('.', 'index.html')

@app.route('/map')
def map_page():
    return send_from_directory('.', 'map.html')

@app.route('/css/<path:path>')
def send_css(path):
    return send_from_directory('css', path)

@app.route('/js/<path:path>')
def send_js(path):
    return send_from_directory('js', path)

@app.route('/images/<path:path>')
def send_images(path):
    return send_from_directory('images', path)

@app.route('/api/weather', methods=['GET'])
def get_weather():
    # Get latitude and longitude from query parameters
    lat = request.args.get('lat')
    lng = request.args.get('lng')
    
    if not lat or not lng:
        return jsonify({"error": "Missing latitude or longitude parameters"}), 400
    
    try:
        # Check if we have an API key for OpenWeather
        if OPENWEATHER_API_KEY:
            # Call the OpenWeather API
            weather_data = get_real_weather_data(float(lat), float(lng))
        else:
            # Fall back to mock data if no API key
            weather_data = generate_mock_weather_data(float(lat), float(lng))
            
        return jsonify(weather_data)
    except Exception as e:
        print(f"Error fetching weather data: {str(e)}")
        return jsonify({"error": f"Failed to fetch weather data: {str(e)}"}), 500

@app.route('/api/environmental-insights', methods=['POST'])
def get_environmental_insights():
    try:
        data = request.json
        lat = data.get('lat')
        lng = data.get('lng')
        location_name = data.get('locationName')
        weather_data = data.get('weatherData')
        
        if not lat or not lng or not location_name:
            return jsonify({"error": "Missing required parameters"}), 400
        
        # Check if we have an API key for OpenAI
        if OPENAI_API_KEY:
            # Generate insights using OpenAI
            insights = generate_ai_environmental_insights(lat, lng, location_name, weather_data)
        else:
            # Fall back to mock data if no API key
            insights = generate_mock_environmental_insights(lat, lng, location_name, weather_data)
        
        return jsonify(insights)
    except Exception as e:
        print(f"Error generating environmental insights: {str(e)}")
        return jsonify({"error": f"Failed to generate environmental insights: {str(e)}"}), 500

@app.route('/api/ask-ai', methods=['POST'])
def ask_ai():
    try:
        data = request.json
        question = data.get('question')
        location = data.get('location')
        weather_data = data.get('weatherData')
        environmental_insights = data.get('environmentalInsights')
        
        if not question or not location or not weather_data or not environmental_insights:
            return jsonify({"error": "Missing required parameters"}), 400
        
        # Check if we have an API key for OpenAI
        if OPENAI_API_KEY:
            # Generate response using OpenAI
            response = generate_ai_response_with_openai(question, location, weather_data, environmental_insights)
        else:
            # Fall back to rule-based response if no API key
            response = generate_rule_based_response(question, location, weather_data, environmental_insights)
        
        return jsonify({"response": response})
    except Exception as e:
        print(f"Error generating AI response: {str(e)}")
        return jsonify({"error": f"Failed to generate AI response: {str(e)}"}), 500

def get_real_weather_data(lat, lng):
    """Get real weather data from OpenWeather API"""
    # Current weather
    current_url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lng}&units=metric&appid={OPENWEATHER_API_KEY}"
    current_response = requests.get(current_url)
    current_data = current_response.json()
    
    # Forecast
    forecast_url = f"https://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lng}&units=metric&appid={OPENWEATHER_API_KEY}"
    forecast_response = requests.get(forecast_url)
    forecast_data = forecast_response.json()
    
    # Air quality
    air_url = f"https://api.openweathermap.org/data/2.5/air_pollution?lat={lat}&lon={lng}&appid={OPENWEATHER_API_KEY}"
    air_response = requests.get(air_url)
    air_data = air_response.json()
    
    # Process and format the data
    location_name = current_data.get('name', f"Location at {lat}, {lng}")
    
    # Map AQI to category
    aqi_categories = ["Good", "Good", "Moderate", "Unhealthy for Sensitive Groups", "Unhealthy", "Very Unhealthy"]
    aqi_index = air_data.get('list', [{}])[0].get('main', {}).get('aqi', 0)
    aqi_category = aqi_categories[aqi_index] if 0 <= aqi_index < len(aqi_categories) else "Unknown"
    
    # Process air quality components
    components = air_data.get('list', [{}])[0].get('components', {})
    
    # Process forecast data - get one entry per day
    daily_forecasts = []
    forecast_by_day = {}
    
    for item in forecast_data.get('list', []):
        date = datetime.fromtimestamp(item['dt']).strftime("%a, %b %d")
        if date not in forecast_by_day:
            forecast_by_day[date] = []
        forecast_by_day[date].append(item)
    
    # Get min/max for each day
    for date, items in forecast_by_day.items():
        if len(daily_forecasts) >= 7:  # Limit to 7 days
            break
            
        temps = [item['main']['temp'] for item in items]
        max_temp = max(temps)
        min_temp = min(temps)
        
        # Use the middle of the day for weather description if available
        mid_day_item = items[len(items)//2] if items else items[0]
        weather = mid_day_item['weather'][0]
        
        daily_forecasts.append({
            "date": date,
            "maxTemp": round(max_temp),
            "minTemp": round(min_temp),
            "weatherCode": weather['id'],
            "weatherDescription": weather['description'].capitalize(),
            "icon": weather['icon'],
            "precipitation": round(sum(item.get('pop', 0) * 100 for item in items) / len(items)),  # Probability of precipitation
            "humidity": round(sum(item['main']['humidity'] for item in items) / len(items)),
            "windSpeed": round(sum(item['wind']['speed'] for item in items) / len(items)),
        })
    
    # Fill in with mock data if we don't have enough days
    while len(daily_forecasts) < 7:
        last_day = datetime.strptime(daily_forecasts[-1]['date'], "%a, %b %d")
        next_day = last_day + timedelta(days=1)
        next_day_str = next_day.strftime("%a, %b %d")
        
        daily_forecasts.append({
            "date": next_day_str,
            "maxTemp": daily_forecasts[-1]['maxTemp'] + random.randint(-2, 2),
            "minTemp": daily_forecasts[-1]['minTemp'] + random.randint(-2, 2),
            "weatherCode": daily_forecasts[-1]['weatherCode'],
            "weatherDescription": daily_forecasts[-1]['weatherDescription'],
            "icon": daily_forecasts[-1]['icon'],
            "precipitation": daily_forecasts[-1]['precipitation'] + random.randint(-10, 10),
            "humidity": daily_forecasts[-1]['humidity'] + random.randint(-5, 5),
            "windSpeed": daily_forecasts[-1]['windSpeed'] + random.randint(-2, 2),
        })
    
    return {
        "location": location_name,
        "coordinates": {"lat": lat, "lng": lng},
        "current": {
            "temperature": round(current_data['main']['temp']),
            "feelsLike": round(current_data['main']['feels_like']),
            "humidity": current_data['main']['humidity'],
            "windSpeed": round(current_data['wind']['speed']),
            "windDirection": current_data['wind'].get('deg', 0),
            "pressure": current_data['main']['pressure'],
            "uvIndex": 5,  # OpenWeather doesn't provide UV index in the basic API
            "visibility": round(current_data['visibility'] / 1000),  # Convert to km
            "weatherCode": current_data['weather'][0]['id'],
            "weatherDescription": current_data['weather'][0]['description'].capitalize(),
            "icon": current_data['weather'][0]['icon'],
        },
        "airQuality": {
            "aqi": aqi_index,
            "pm25": round(components.get('pm2_5', 0)),
            "pm10": round(components.get('pm10', 0)),
            "o3": round(components.get('o3', 0)),
            "no2": round(components.get('no2', 0)),
            "so2": round(components.get('so2', 0)),
            "co": round(components.get('co', 0)),
            "category": aqi_category,
        },
        "forecast": daily_forecasts,
    }

def generate_mock_weather_data(lat, lng):
    """Generate mock weather data for demo purposes"""
    weather_code_index = random.randint(0, 3)
    weather_descriptions = ["Clear sky", "Partly cloudy", "Cloudy", "Light rain"]
    weather_icons = ["01d", "02d", "03d", "10d"]
    
    temperature = round(15 + random.random() * 20)
    
    aqi_categories = ["Good", "Moderate", "Unhealthy for Sensitive Groups", "Unhealthy"]
    aqi_category_index = random.randint(0, 3)
    
    return {
        "location": f"Location at {lat}, {lng}",
        "coordinates": {"lat": lat, "lng": lng},
        "current": {
            "temperature": temperature,
            "feelsLike": round(temperature - 2 + random.random() * 4),
            "humidity": round(40 + random.random() * 50),
            "windSpeed": round(5 + random.random() * 20),
            "windDirection": round(random.random() * 360),
            "pressure": round(1000 + random.random() * 30),
            "uvIndex": round(1 + random.random() * 10),
            "visibility": round(5 + random.random() * 15),
            "weatherCode": weather_code_index,
            "weatherDescription": weather_descriptions[weather_code_index],
            "icon": weather_icons[weather_code_index],
        },
        "airQuality": {
            "aqi": round(20 + random.random() * 150),
            "pm25": round(5 + random.random() * 30),
            "pm10": round(10 + random.random() * 50),
            "o3": round(20 + random.random() * 60),
            "no2": round(5 + random.random() * 40),
            "so2": round(2 + random.random() * 20),
            "co": round(200 + random.random() * 800),
            "category": aqi_categories[aqi_category_index],
        },
        "forecast": [
            {
                "date": (datetime.now() + timedelta(days=i)).strftime("%a, %b %d"),
                "maxTemp": round(20 + random.random() * 15),
                "minTemp": round(10 + random.random() * 15),
                "weatherCode": random.randint(0, 3),
                "weatherDescription": weather_descriptions[random.randint(0, 3)],
                "icon": weather_icons[random.randint(0, 3)],
                "precipitation": round(random.random() * 100),
                "humidity": round(40 + random.random() * 50),
                "windSpeed": round(5 + random.random() * 20),
            }
            for i in range(7)
        ],
    }

def generate_mock_environmental_insights(lat, lng, location_name, weather_data):
    """Generate mock environmental insights for demo purposes"""
    risk_levels = ["low", "moderate", "high", "severe"]
    ecosystem_types = ["Temperate forest", "Grassland", "Coastal", "Urban"]
    
    return {
        "risks": [
            {
                "type": "Flooding",
                "level": random.choice(risk_levels),
                "description": "Based on topography and proximity to water bodies, this area has potential flood risk during heavy rainfall events."
            },
            {
                "type": "Drought",
                "level": random.choice(risk_levels),
                "description": "Historical climate data indicates periodic drought conditions that may affect water availability."
            },
            {
                "type": "Air Pollution",
                "level": random.choice(risk_levels),
                "description": "Urban density and industrial activity contribute to occasional poor air quality conditions."
            }
        ],
        "sustainability": [
            {
                "category": "Water Conservation",
                "recommendations": [
                    "Install rainwater harvesting systems to collect and reuse rainwater",
                    "Use drought-resistant native plants in landscaping",
                    "Implement water-efficient fixtures and appliances"
                ]
            },
            {
                "category": "Energy Efficiency",
                "recommendations": [
                    "Consider solar panel installation due to high annual sunshine hours",
                    "Improve building insulation to reduce heating/cooling needs",
                    "Use smart thermostats and energy-efficient appliances"
                ]
            },
            {
                "category": "Biodiversity",
                "recommendations": [
                    "Plant native species to support local wildlife",
                    "Create wildlife corridors to connect fragmented habitats",
                    "Reduce use of pesticides and herbicides"
                ]
            }
        ],
        "localEnvironment": {
            "ecosystemType": random.choice(ecosystem_types),
            "biodiversity": "This region supports a variety of plant and animal species, including several that are endemic to the area.",
            "conservation": "Local conservation efforts focus on habitat preservation and restoration of natural waterways.",
            "challenges": [
                "Habitat fragmentation due to urban development",
                "Invasive species affecting native biodiversity",
                "Water quality concerns in local watersheds"
            ]
        }
    }

def generate_ai_environmental_insights(lat, lng, location_name, weather_data):
    """Generate environmental insights using OpenAI API"""
    try:
        # Prepare the prompt for OpenAI
        prompt = f"""
        Generate environmental insights for the location: {location_name} (Latitude: {lat}, Longitude: {lng}).
        
        Weather data: {json.dumps(weather_data)}
        
        Please provide the following information in JSON format:
        1. Environmental risks in the area (flooding, drought, wildfires, etc.)
        2. Sustainability recommendations specific to this location
        3. Information about the local ecosystem and biodiversity
        
        Format the response as valid JSON with the following structure:
        {{
          "risks": [
            {{
              "type": "string",
              "level": "low|moderate|high|severe",
              "description": "string"
            }}
          ],
          "sustainability": [
            {{
              "category": "string",
              "recommendations": ["string"]
            }}
          ],
          "localEnvironment": {{
            "ecosystemType": "string",
            "biodiversity": "string",
            "conservation": "string",
            "challenges": ["string"]
          }}
        }}
        """
        
        # Call OpenAI API
        response = openai.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are an environmental science expert. Provide accurate, detailed environmental insights based on location and weather data. Always respond with valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7
        )
        
        # Parse the response
        ai_response = response.choices[0].message.content
        return json.loads(ai_response)
    except Exception as e:
        print(f"Error generating AI insights: {str(e)}")
        # Fall back to mock data if AI generation fails
        return generate_mock_environmental_insights(lat, lng, location_name, weather_data)

def generate_ai_response_with_openai(question, location, weather_data, environmental_insights):
    """Generate a response to a user question using OpenAI"""
    try:
        # Prepare the prompt for OpenAI
        prompt = f"""
        The user is asking about the following location: {location['name']} (Latitude: {location['lat']}, Longitude: {location['lng']}).
        
        Weather data: {json.dumps(weather_data)}
        Environmental insights: {json.dumps(environmental_insights)}
        
        User question: {question}
        
        Please provide a helpful, informative response based on the available data. Focus on answering the specific question while providing relevant context from the weather and environmental data.
        """
        
        # Call OpenAI API
        response = openai.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are an environmental and weather expert assistant. Provide accurate, helpful responses based on the provided data."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=500
        )
        
        # Return the response
        return response.choices[0].message.content
    except Exception as e:
        print(f"Error generating AI response: {str(e)}")
        # Fall back to rule-based response if AI generation fails
        return generate_rule_based_response(question, location, weather_data, environmental_insights)

def generate_rule_based_response(question, location, weather_data, environmental_insights):
    """Generate a rule-based response to a user question"""
    # Convert question to lowercase for easier matching
    q = question.lower()
    
    # Weather forecast related questions
    if any(keyword in q for keyword in ['weather', 'forecast', 'temperature', 'rain', 'sunny']):
        current_temp = weather_data['current']['temperature']
        
        return f"The current temperature in {location['name']} is {current_temp}°C with {weather_data['current']['weatherDescription'].lower()}. " \
               f"The forecast for the next few days shows temperatures ranging from {weather_data['forecast'][0]['minTemp']}°C to {weather_data['forecast'][3]['maxTemp']}°C, " \
               f"with conditions varying from {weather_data['forecast'][0]['weatherDescription'].lower()} to {weather_data['forecast'][3]['weatherDescription'].lower()}."
    
    # Environmental risks related questions
    elif any(keyword in q for keyword in ['risk', 'danger', 'hazard', 'threat']):
        # Sort risks by severity
        risks = sorted(environmental_insights['risks'], key=lambda x: ['low', 'moderate', 'high', 'severe'].index(x['level']), reverse=True)
        highest_risk = risks[0]
        
        return f"The most significant environmental risk in this area is {highest_risk['type'].lower()}, which is currently at a {highest_risk['level']} level. {highest_risk['description']} " \
               f"Other risks include {risks[1]['type'].lower()} ({risks[1]['level']}) and {risks[2]['type'].lower()} ({risks[2]['level']})."
    
    # Sustainability related questions
    elif any(keyword in q for keyword in ['sustainability', 'sustainable', 'eco', 'green', 'recommendation', 'tip']):
        recommendations = []
        for category in environmental_insights['sustainability']:
            recommendations.extend(category['recommendations'])
        
        return f"Based on the environmental conditions in {location['name']}, here are some sustainability recommendations:\n" \
               f"1. {recommendations[0]}\n" \
               f"2. {recommendations[1]}\n" \
               f"3. {recommendations[2]}\n\n" \
               f"These practices are particularly important in this area due to the {environmental_insights['localEnvironment']['ecosystemType'].lower()} ecosystem and the " \
               f"{environmental_insights['risks'][0]['level']} risk of {environmental_insights['risks'][0]['type'].lower()}."
    
    # General or unrecognized questions
    else:
        return f"Based on the environmental data for {location['name']}, I can tell you that the current temperature is {weather_data['current']['temperature']}°C with {weather_data['current']['weatherDescription'].lower()} conditions. " \
               f"The air quality is {weather_data['airQuality']['category'].lower()}, and the area has a {environmental_insights['localEnvironment']['ecosystemType'].lower()} ecosystem. " \
               f"The main environmental concern is a {environmental_insights['risks'][0]['level']} risk of {environmental_insights['risks'][0]['type'].lower()}. " \
               f"You can ask me specific questions about the weather forecast, air quality, environmental risks, or sustainability recommendations for this location."

if __name__ == '__main__':
    # For local development, you can set environment variables here
    # DO NOT use this in production - use proper environment variable configuration
    if not os.environ.get("OPENWEATHER_API_KEY"):
        os.environ["OPENWEATHER_API_KEY"] = ""  # Add your key here for testing only
    
    if not os.environ.get("OPENAI_API_KEY"):
        os.environ["OPENAI_API_KEY"] = ""  # Add your key here for testing only
    
    app.run(debug=True, host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))

