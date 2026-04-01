const API_KEY = "4aec40746b109bd0c479262b6182b52a";

const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const weatherInfo = document.getElementById('weather-info');
const loading = document.getElementById('loading');
const errorDiv = document.getElementById('error');

const cityName = document.getElementById('city-name');
const dateEl = document.getElementById('date');
const tempEl = document.getElementById('temp');
const descriptionEl = document.getElementById('description');
const feelsLikeEl = document.getElementById('feels-like');
const humidityEl = document.getElementById('humidity');
const windEl = document.getElementById('wind');
const iconEl = document.getElementById('weather-icon');
const unitToggle = document.getElementById('unit-toggle');
const themeToggle = document.getElementById('theme-toggle');

let currentUnit = 'C';   // 'C' or 'F'
let currentData = null;

// Theme handling (reused from todo app)
function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
}

const savedTheme = localStorage.getItem('theme') ||
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
setTheme(savedTheme);

themeToggle.addEventListener('click', () => {
    const newTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
});

// Fetch weather
async function getWeather(city) {
    if (!API_KEY || API_KEY === "YOUR_API_KEY_HERE") {
        showError("Please replace YOUR_API_KEY_HERE with your actual OpenWeatherMap key.");
        return;
    }

    loading.classList.remove('hidden');
    weatherInfo.classList.add('hidden');
    errorDiv.classList.add('hidden');

    try {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;
        
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(response.status === 404 ? "City not found" : "Failed to fetch weather");
        }

        const data = await response.json();
        currentData = data;
        displayWeather(data);
    } catch (err) {
        showError(err.message);
    } finally {
        loading.classList.add('hidden');
    }
}

function displayWeather(data) {
    cityName.textContent = `${data.name}, ${data.sys.country}`;

    const now = new Date();
    dateEl.textContent = now.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric' 
    });

    let temp = Math.round(data.main.temp);
    tempEl.textContent = temp + (currentUnit === 'C' ? '°C' : '°F');

    descriptionEl.textContent = data.weather[0].description;
    
    iconEl.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`;

    feelsLikeEl.textContent = Math.round(data.main.feels_like) + (currentUnit === 'C' ? '°C' : '°F');
    
    humidityEl.textContent = data.main.humidity + '%';
    windEl.textContent = data.wind.speed + ' m/s';

    weatherInfo.classList.remove('hidden');
}

// Unit toggle
unitToggle.addEventListener('click', () => {
    if (!currentData) return;

    currentUnit = currentUnit === 'C' ? 'F' : 'C';
    unitToggle.textContent = '°' + currentUnit;

    // Convert temperature
    let tempC = currentData.main.temp;
    let feelsC = currentData.main.feels_like;

    let displayedTemp = currentUnit === 'C' ? Math.round(tempC) : Math.round(tempC * 9/5 + 32);
    let displayedFeels = currentUnit === 'C' ? Math.round(feelsC) : Math.round(feelsC * 9/5 + 32);

    tempEl.textContent = displayedTemp + '°' + currentUnit;
    feelsLikeEl.textContent = displayedFeels + '°' + currentUnit;
});

// Search handlers
searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) getWeather(city);
});

cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const city = cityInput.value.trim();
        if (city) getWeather(city);
    }
});

function showError(message) {
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
}

// Load default city (Colorado Springs is a good nearby choice)
window.addEventListener('load', () => {
    getWeather("Colorado Springs");
});
