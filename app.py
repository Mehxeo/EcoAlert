from flask import Flask, request, jsonify, render_template, send_from_directory
import os
import json
import random
from datetime import datetime, timedelta
import requests
import openai
<<<<<<< HEAD
from dotenv import load_dotenv

load_dotenv()  # Load environment variables from .env file

app = Flask(__name__, static_folder='.')

# Configure API clients
openai.api_key = os.getenv('OPENAI_API_KEY')
OPENWEATHER_API_KEY = os.getenv('OPENWEATHER_API_KEY')
=======

app = Flask(__name__, static_folder='.')

# Set API keys using environment variables (more secure)
# In production, set these using your hosting platform's environment variables
# For local development, you can use a .env file (not included in version control)
OPENWEATHER_API_KEY = os.environ.get("OPENWEATHER_API_KEY", "6e7d8474db20a0cf8e9094f00fab8a6c")
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", "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")

# Configure OpenAI client
openai.api_key = OPENAI_API_KEY
>>>>>>> 0d0822879de393d1e3928131770aa7efce43ecaf

# ... (keep your existing routes until get_weather)

@app.route('/api/weather', methods=['GET'])
def get_weather():
    lat = request.args.get('lat')
    lng = request.args.get('lng')
    
    if not lat or not lng:
        return jsonify({"error": "Missing latitude or longitude parameters"}), 400
    
    try:
        weather_data = get_real_weather_data(float(lat), float(lng))
        return jsonify(weather_data)
    except Exception as e:
        print(f"Error fetching weather data: {str(e)}")
        return jsonify({"error": "Failed to fetch weather data"}), 500

def generate_ai_environmental_insights(lat, lng, location_name, weather_data):
    """Generate environmental insights using OpenAI API"""
    try:
        # ... existing prompt setup ...
        
        response = openai.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are an environmental science expert. Provide accurate, detailed environmental insights based on location and weather data. Always respond with valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7
        )
        
        ai_response = response.choices[0].message.content
        return json.loads(ai_response)
    except Exception as e:
        print(f"Error generating AI insights: {str(e)}")
        return jsonify({"error": "Failed to generate environmental insights"}), 500

def get_real_weather_data(lat, lng):
    """Get real weather data from OpenWeather API"""
    if not OPENWEATHER_API_KEY:
        raise ValueError("OpenWeather API key not configured")
    
    base_url = "https://api.openweathermap.org/data/2.5"
    
    # Current weather
    current_url = f"{base_url}/weather?lat={lat}&lon={lng}&units=metric&appid={OPENWEATHER_API_KEY}"
    current_response = requests.get(current_url)
    current_response.raise_for_status()  # Raises exception for 4XX/5XX status
    current_data = current_response.json()
    
    # Forecast
    forecast_url = f"{base_url}/forecast?lat={lat}&lon={lng}&units=metric&appid={OPENWEATHER_API_KEY}"
    forecast_response = requests.get(forecast_url)
    forecast_response.raise_for_status()
    forecast_data = forecast_response.json()
    
    # Air quality
    air_url = f"{base_url}/air_pollution?lat={lat}&lon={lng}&appid={OPENWEATHER_API_KEY}"
    air_response = requests.get(air_url)
    air_data = air_response.json() if air_response.status_code == 200 else None
    
    # Process data
    location_name = current_data.get('name', f"Location at {lat:.4f}, {lng:.4f}")
    
    # Process air quality data if available
    air_quality = None
    if air_data and 'list' in air_data and air_data['list']:
        aqi = air_data['list'][0]['main']['aqi']
        components = air_data['list'][0]['components']
        
        aqi_categories = [
            "Good", 
            "Fair", 
            "Moderate", 
            "Poor", 
            "Very Poor"
        ]
        aqi_category = aqi_categories[aqi-1] if 1 <= aqi <= 5 else "Unknown"
        
        air_quality = {
            "aqi": aqi,
            "pm25": round(components.get('pm2_5', 0)),
            "pm10": round(components.get('pm10', 0)),
            "o3": round(components.get('o3', 0)),
            "no2": round(components.get('no2', 0)),
            "so2": round(components.get('so2', 0)),
            "co": round(components.get('co', 0)),
            "category": aqi_category,
        }
    
    # Process forecast data
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
        
        # Use the middle of the day for weather description
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
            "uvIndex": 5,  # Not available in free tier
            "visibility": round(current_data['visibility'] / 1000) if 'visibility' in current_data else 10,
            "weatherCode": current_data['weather'][0]['id'],
            "weatherDescription": current_data['weather'][0]['description'].capitalize(),
            "icon": current_data['weather'][0]['icon'],
        },
        "airQuality": air_quality,
        "forecast": daily_forecasts,
    }



def get_real_weather_data(lat, lng):
    """Get real weather data from OpenWeather API"""
    if not OPENWEATHER_API_KEY:
        raise ValueError("OpenWeather API key not configured")
    
    base_url = "https://api.openweathermap.org/data/2.5"
    
    # Get all data in a single call using onecall API
    url = f"{base_url}/onecall?lat={lat}&lon={lng}&exclude=minutely,hourly,alerts&units=metric&appid={OPENWEATHER_API_KEY}"
    response = requests.get(url)
    response.raise_for_status()
    data = response.json()
    
    # Get location name from reverse geocoding
    reverse_geo_url = f"http://api.openweathermap.org/geo/1.0/reverse?lat={lat}&lon={lng}&limit=1&appid={OPENWEATHER_API_KEY}"
    geo_response = requests.get(reverse_geo_url)
    location_name = f"{lat:.4f}, {lng:.4f}"
    if geo_response.ok:
        geo_data = geo_response.json()
        if geo_data:
            location_name = geo_data[0].get('name', location_name)
    
    # Process current weather
    current = data.get('current', {})
    daily_forecast = data.get('daily', [])[:7]
    
    # Get air quality data
    air_url = f"{base_url}/air_pollution?lat={lat}&lon={lng}&appid={OPENWEATHER_API_KEY}"
    air_response = requests.get(air_url)
    air_data = air_response.json() if air_response.status_code == 200 else None
    
    return {
        "location": location_name,
        "coordinates": {"lat": lat, "lng": lng},
        "current": process_current_data(current),
        "airQuality": process_air_quality(air_data),
        "forecast": [process_forecast(day) for day in daily_forecast]
    }

def process_current_data(current):
    return {
        "temperature": round(current.get('temp', 0)),
        "feelsLike": round(current.get('feels_like', 0)),
        "humidity": current.get('humidity', 0),
        "windSpeed": round(current.get('wind_speed', 0)),
        "windDirection": current.get('wind_deg', 0),
        "pressure": current.get('pressure', 0),
        "uvi": round(current.get('uvi', 0), 1),
        "visibility": round(current.get('visibility', 10000) / 1000),
        "weatherCode": current['weather'][0]['id'],
        "weatherDescription": current['weather'][0]['description'].capitalize(),
        "icon": current['weather'][0]['icon'],
    }

def process_forecast(day):
    return {
        "date": datetime.fromtimestamp(day['dt']).strftime("%a, %b %d"),
        "maxTemp": round(day['temp']['max']),
        "minTemp": round(day['temp']['min']),
        "weatherCode": day['weather'][0]['id'],
        "weatherDescription": day['weather'][0]['description'].capitalize(),
        "icon": day['weather'][0]['icon'],
        "precipitation": round(day.get('pop', 0) * 100),
        "humidity": day.get('humidity', 0),
        "windSpeed": round(day.get('wind_speed', 0)),
    }

def process_air_quality(air_data):
    if not air_data or not air_data.get('list'):
        return None
    
    aqi = air_data['list'][0]['main']['aqi']
    components = air_data['list'][0]['components']
    
    return {
        "aqi": aqi,
        "pm25": round(components.get('pm2_5', 0)),
        "pm10": round(components.get('pm10', 0)),
        "o3": round(components.get('o3', 0)),
        "no2": round(components.get('no2', 0)),
        "so2": round(components.get('so2', 0)),
        "co": round(components.get('co', 0)),
        "category": get_aqi_category(aqi),
    }

def get_aqi_category(aqi):
    categories = ["Good", "Fair", "Moderate", "Poor", "Very Poor"]
    return categories[aqi-1] if 1 <= aqi <= 5 else "Unknown"

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
            model="gpt-4o",  #change model?
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
    # Convert question to lowercase
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
    
    app.run(debug=True, port=5001)

