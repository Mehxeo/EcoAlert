from flask import Flask, request, jsonify, render_template, send_from_directory
import os
import json
import random
from datetime import datetime, timedelta
import requests
from dotenv import load_dotenv
load_dotenv()

app = Flask(__name__, static_folder='.')

GEMINI_API_KEY = "AIzaSyAs8PoGPu-U4dx6MKXkUE-FWVoQnJ3QMXk"
OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY")

@app.route("/")
@app.route('/index.html')
def home():
    return send_from_directory('.', 'index.html')

@app.route('/map.html')
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
    lat = request.args.get('lat')
    lng = request.args.get('lng')
    
    if not lat or not lng:
        return jsonify({"error": "Missing latitude or longitude parameters"}), 400
    
    try:
        if OPENWEATHER_API_KEY:
            weather_data = get_real_weather_data(float(lat), float(lng))
        else:
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
        
        if GEMINI_API_KEY:
            insights = generate_ai_environmental_insights(lat, lng, location_name, weather_data)
        else:
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
        
        if GEMINI_API_KEY:
            response = generate_ai_response_with_openai(question, location, weather_data, environmental_insights)
        else:
            response = generate_rule_based_response(question, location, weather_data, environmental_insights)
        
        return jsonify({"response": response})
    except Exception as e:
        print(f"Error generating AI response: {str(e)}")
        return jsonify({"error": f"Failed to generate AI response: {str(e)}"}), 500

def get_real_weather_data(lat, lng):
    current_url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lng}&units=metric&appid={OPENWEATHER_API_KEY}"
    current_response = requests.get(current_url)
    current_data = current_response.json()

    forecast_url = f"https://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lng}&units=metric&appid={OPENWEATHER_API_KEY}"
    forecast_response = requests.get(forecast_url)
    forecast_data = forecast_response.json()
    
    air_url = f"https://api.openweathermap.org/data/2.5/air_pollution?lat={lat}&lon={lng}&appid={OPENWEATHER_API_KEY}"
    air_response = requests.get(air_url)
    air_data = air_response.json()

    location_name = current_data.get('name', f"Location at {lat}, {lng}")
    
    aqi_categories = ["Good", "Good", "Moderate", "Unhealthy for Sensitive Groups", "Unhealthy", "Very Unhealthy"]
    aqi_index = air_data.get('list', [{}])[0].get('main', {}).get('aqi', 0)
    aqi_category = aqi_categories[aqi_index] if 0 <= aqi_index < len(aqi_categories) else "Unknown"
    
    components = air_data.get('list', [{}])[0].get('components', {})
    
    daily_forecasts = []
    forecast_by_day = {}
    
    for item in forecast_data.get('list', []):
        date = datetime.fromtimestamp(item['dt']).strftime("%a, %b %d")
        if date not in forecast_by_day:
            forecast_by_day[date] = []
        forecast_by_day[date].append(item)
    
    for date, items in forecast_by_day.items():
        if len(daily_forecasts) >= 7: 
            break
            
        temps = [item['main']['temp'] for item in items]
        max_temp = max(temps)
        min_temp = min(temps)
        
        mid_day_item = items[len(items)//2] if items else items[0]
        weather = mid_day_item['weather'][0]
        
        daily_forecasts.append({
            "date": date,
            "maxTemp": round(max_temp),
            "minTemp": round(min_temp),
            "weatherCode": weather['id'],
            "weatherDescription": weather['description'].capitalize(),
            "icon": weather['icon'],
            "precipitation": round(sum(item.get('pop', 0) * 100 for item in items) / len(items)),
            "humidity": round(sum(item['main']['humidity'] for item in items) / len(items)),
            "windSpeed": round(sum(item['wind']['speed'] for item in items) / len(items)),
        })
    
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
            "uvIndex": 5,
            "visibility": round(current_data['visibility'] / 1000),
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
    try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={GEMINI_API_KEY}"
        
        # Analyze current conditions for risks
        current_conditions = f"""
Current Weather Analysis:
- Temperature: {weather_data['current']['temperature']}°C
- Feels Like: {weather_data['current']['feelsLike']}°C
- Weather: {weather_data['current']['weatherDescription']}
- Humidity: {weather_data['current']['humidity']}%
- Wind Speed: {weather_data['current']['windSpeed']} km/h
- Air Quality: {weather_data['airQuality']['category']}
- Visibility: {weather_data['current']['visibility']} km
- UV Index: {weather_data['current']['uvIndex']}
"""

        # Analyze forecast for potential risks
        forecast_analysis = "Forecast Analysis:\n"
        for day in weather_data['forecast']:
            forecast_analysis += f"- {day['date']}: {day['weatherDescription']}, High: {day['maxTemp']}°C, Low: {day['minTemp']}°C\n"
        
        prompt = f"""Analyze the environmental conditions and potential risks for {location_name} (Latitude: {lat}, Longitude: {lng}).

{current_conditions}

{forecast_analysis}

Please analyze this weather data and provide environmental insights focusing on:
1. Immediate risks based on current conditions
2. Potential risks based on forecast
3. Air quality impact on health
4. Weather-related safety concerns
5. Recommendations for staying safe

Format the response as a JSON object with the following structure:
{{
    "risks": [
        {{
            "type": "risk_type",
            "level": "low/moderate/high/severe",
            "description": "detailed description based on weather data",
            "source": "current_conditions/forecast/air_quality"
        }},
        ...
    ],
    "safetyRecommendations": [
        "specific recommendation based on weather data",
        ...
    ],
    "healthImpact": {{
        "airQualityEffects": "description based on AQI and weather",
        "recommendations": ["specific health recommendations", ...]
    }},
    "weatherAlerts": [
        "specific alert based on weather conditions",
        ...
    ]
}}
"""
        
        headers = {
            'Content-Type': 'application/json'
        }
        
        data = {
            "contents": [{
                "parts": [{"text": prompt}]
            }]
        }
        
        response = requests.post(url, headers=headers, json=data)
        response.raise_for_status()
        result = response.json()
        
        if 'candidates' in result and len(result['candidates']) > 0:
            text = result['candidates'][0]['content']['parts'][0]['text']
            insights = json.loads(text)
            return insights
        else:
            raise Exception("No valid response from Gemini API")
            
    except Exception as e:
        print(f"Error generating AI environmental insights: {str(e)}")
        return generate_mock_environmental_insights(lat, lng, location_name, weather_data)

def generate_ai_response_with_openai(question, location, weather_data, environmental_insights):
    try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={GEMINI_API_KEY}"
        
        # Format forecast data for the prompt
        forecast_info = "\nWeather Forecast for the next few days:\n"
        for day in weather_data['forecast']:
            forecast_info += f"- {day['date']}: {day['weatherDescription']}, High: {day['maxTemp']}°C, Low: {day['minTemp']}°C\n"
        
        prompt = f"""You are an environmental and weather expert assistant. Provide accurate, helpful responses based on the provided data.

Location: {location['name']} (Latitude: {location['lat']}, Longitude: {location['lng']})

Current Weather Conditions:
- Temperature: {weather_data['current']['temperature']}°C
- Feels Like: {weather_data['current']['feelsLike']}°C
- Weather: {weather_data['current']['weatherDescription']}
- Humidity: {weather_data['current']['humidity']}%
- Wind Speed: {weather_data['current']['windSpeed']} km/h
- Air Quality: {weather_data['airQuality']['category']}

{forecast_info}

Environmental Conditions:
- Main Risk: {environmental_insights['risks'][0]['type']} ({environmental_insights['risks'][0]['level']} level)
- Ecosystem: {environmental_insights['localEnvironment']['ecosystemType']}

User question: "{question}"

Please provide a helpful, informative response that:
1. Directly answers the user's question
2. Considers all relevant weather and environmental factors
3. Provides specific, actionable advice
4. Explains the reasoning behind your recommendations
5. Mentions any relevant environmental risks or concerns
6. If the question is about future weather, use the forecast data to provide specific predictions
7. For timing questions (like "when will it rain?"), analyze the forecast and provide the most likely time window

IMPORTANT:
- Do not use asterisks (*) or any special formatting characters
- Use clear, natural language with proper punctuation
- Format lists with numbers or bullet points using standard characters
- Keep the response concise and focused on the user's question
- Do not include any generic fallback responses
- Always provide specific, contextual information based on the user's question and the available data"""
        
        headers = {
            'Content-Type': 'application/json'
        }
        
        data = {
            "contents": [{
                "parts": [{"text": prompt}]
            }]
        }
        
        response = requests.post(url, headers=headers, json=data)
        response.raise_for_status()
        result = response.json()
        
        if 'candidates' in result and len(result['candidates']) > 0:
            text = result['candidates'][0]['content']['parts'][0]['text']
            if not text or text.strip() == "":
                raise Exception("Empty response from Gemini")
            return text
        else:
            raise Exception("No valid response from Gemini API")
            
    except Exception as e:
        print(f"Error generating AI response: {str(e)}")
        return f"I apologize, but I encountered an error while processing your question. Please try rephrasing your question or try again later. Error: {str(e)}"

def generate_rule_based_response(question, location, weather_data, environmental_insights):
    q = question.lower()
    
    if any(keyword in q for keyword in ['weather', 'forecast', 'temperature', 'rain', 'sunny']):
        current_temp = weather_data['current']['temperature']
        
        return f"The current temperature in {location['name']} is {current_temp}°C with {weather_data['current']['weatherDescription'].lower()}. " \
               f"The forecast for the next few days shows temperatures ranging from {weather_data['forecast'][0]['minTemp']}°C to {weather_data['forecast'][3]['maxTemp']}°C, " \
               f"with conditions varying from {weather_data['forecast'][0]['weatherDescription'].lower()} to {weather_data['forecast'][3]['weatherDescription'].lower()}."
    
    elif any(keyword in q for keyword in ['risk', 'danger', 'hazard', 'threat']):
        risks = sorted(environmental_insights['risks'], key=lambda x: ['low', 'moderate', 'high', 'severe'].index(x['level']), reverse=True)
        highest_risk = risks[0]
        
        return f"The most significant environmental risk in this area is {highest_risk['type'].lower()}, which is currently at a {highest_risk['level']} level. {highest_risk['description']} " \
               f"Other risks include {risks[1]['type'].lower()} ({risks[1]['level']}) and {risks[2]['type'].lower()} ({risks[2]['level']})."
    
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
    
    else:
        return f"Based on the environmental data for {location['name']}, I can tell you that the current temperature is {weather_data['current']['temperature']}°C with {weather_data['current']['weatherDescription'].lower()} conditions. " \
               f"The air quality is {weather_data['airQuality']['category'].lower()}, and the area has a {environmental_insights['localEnvironment']['ecosystemType'].lower()} ecosystem. " \
               f"The main environmental concern is a {environmental_insights['risks'][0]['level']} risk of {environmental_insights['risks'][0]['type'].lower()}. " \
               f"You can ask me specific questions about the weather forecast, air quality, environmental risks, or sustainability recommendations for this location."

def generate_air_quality_insights(lat, lng):
    url = f"https://air-quality-api.open-meteo.com/v1/air-quality?latitude={lat}&longitude={lng}&hourly=us_aqi,us_aqi_pm2_5,us_aqi_pm10,us_aqi_nitrogen_dioxide,us_aqi_ozone,us_aqi_carbon_monoxide,us_aqi_sulphur_dioxide&current=us_aqi"

    response = requests.get(url)

    if response.status_code == 200:
        data = response.json()
        time_series = data["hourly"]["time"][0:24]
        pm10_series = data["hourly"]["us_aqi_pm10"][0:24]
        pm2_5_series = data["hourly"]["us_aqi_pm2_5"][0:24]

        print((time_series))
        print(pm10_series)
    else:
        print("Failed to retrieve data:", response.status_code)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))