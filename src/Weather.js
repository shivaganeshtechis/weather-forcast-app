import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line, Bar } from 'react-chartjs-2';

const Weather = () => {
  const [location, setLocation] = useState('');
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecast, setForecast] = useState(null);

  useEffect(() => {
    // Fetch user's device position
    navigator.geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        fetchWeatherData(latitude, longitude);
      },
      error => {
        console.log(error);
        // If unable to get the user's position, set Delhi as the default location
        fetchWeatherData(null, null, 'Delhi');
      }
    );
  }, []);

  const fetchWeatherData = async (lat, lon, city) => {
    try {
      // Fetch weather data from OpenWeatherMap API
      const baseUrl = 'https://api.openweathermap.org/data/2.5/';
      const apiKey = '7dbe245d167f80e0b71f8717d37692bd';
      let url = '';
      if (lat && lon) {
        url = `${baseUrl}weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
      } else {
        url = `${baseUrl}weather?q=${city}&units=metric&appid=${apiKey}`;
      }
      const res = await axios.get(url);
      const { weather, main, wind, dt } = res.data;
      setCurrentWeather({
        condition: weather[0].description,
        temperature: Math.round(main.temp),
        humidity: main.humidity,
        windSpeed: wind.speed,
        date: new Date(dt * 1000).toLocaleString()
      });

      // Fetch 7-day forecast data
      if (lat && lon) {
        url = `${baseUrl}onecall?lat=${lat}&lon=${lon}&exclude=current,minutely,hourly,alerts&units=metric&appid=${apiKey}`;
      } else {
        url = `${baseUrl}forecast?q=${city}&units=metric&appid=${apiKey}`;
      }
      const res2 = await axios.get(url);
      const dailyData = res2.data.daily.slice(0, 7);
      setForecast({
        temperature: {
          labels: dailyData.map(d => new Date(d.dt * 1000).toLocaleDateString()),
          data: dailyData.map(d => Math.round(d.temp.day))
        },
        humidity: {
          labels: dailyData.map(d => new Date(d.dt * 1000).toLocaleDateString()),
          data: dailyData.map(d => d.humidity)
        },
        condition: {
          labels: dailyData.map(d => new Date(d.dt * 1000).toLocaleDateString()),
          data: dailyData.map(d => d.weather[0].description)
        }
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (location) {
      fetchWeatherData(null, null, location);
      setLocation('');
    }
  };

  return (
    <div className="container">
      <h1>Weather App</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="location">Location: </label>
        <input
          type="text"
          id="location"
          value={location}
          onChange={e => setLocation(e.target.value)}
        />
        <button type="submit">Get Weather</button>
      </form>
      {currentWeather && (
        <div className="current-weather">
    <h2>Current Weather in {location} </h2>
      <p>{currentWeather.date}</p>
      <p>{currentWeather.condition}</p>
      <p>{currentWeather.temperature}&deg;C</p>
      <p>Humidity: {currentWeather.humidity}%</p>
      <p>Wind Speed: {currentWeather.windSpeed} m/s</p>
    </div>
  )}
  {forecast && (
    <div className="forecast">
      <h2>7-Day Forecast</h2>
      <Line
        data={{
          labels: forecast.temperature.labels,
          datasets: [
            {
              label: 'Temperature',
              data: forecast.temperature.data,
              backgroundColor: 'rgba(255, 99, 132, 0.2)',
              borderColor: 'rgba(255, 99, 132, 1)',
              borderWidth: 1
            }
          ]
        }}
      />
      <Bar
        data={{
          labels: forecast.humidity.labels,
          datasets: [
            {
              label: 'Humidity',
              data: forecast.humidity.data,
              backgroundColor: 'rgba(54, 162, 235, 0.2)',
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 1
            }
          ]
        }}
      />
      <Line
        data={{
          labels: forecast.condition.labels,
          datasets: [
            {
              label: 'Weather Condition',
              data: forecast.condition.data,
              backgroundColor: 'rgba(255, 206, 86, 0.2)',
              borderColor: 'rgba(255, 206, 86, 1)',
              borderWidth: 1
            }
          ]
        }}
      />
    </div>
  )}
</div>
  );
    };
    export default Weather;