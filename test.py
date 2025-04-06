import requests
import datetime

latitude = 38, -77
longitude = 13.41

url = f"https://air-quality-api.open-meteo.com/v1/air-quality?latitude={latitude}&longitude={longitude}&hourly=us_aqi,us_aqi_pm2_5,us_aqi_pm10,us_aqi_nitrogen_dioxide,us_aqi_ozone,us_aqi_carbon_monoxide,us_aqi_sulphur_dioxide&current=us_aqi"

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