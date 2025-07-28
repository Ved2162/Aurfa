// Global variables
let map = null;
let marker = null;
let currentUser = null;

// Function to scroll to How It Works section
function scrollToHowItWorks() {
    const howItWorksSection = document.getElementById('how-it-works');
    if (howItWorksSection) {
        howItWorksSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// Fetch weather data
async function fetchWeather(lat, lng) {
    try {
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${CONFIG.OPENWEATHER_API_KEY}&units=metric`;
        const response = await fetch(url);
        const data = await response.json();

        const weatherElement = document.getElementById('weather-data');
        const temp = Math.round(data.main.temp);
        const conditions = data.weather[0].main;
        
        // Weather conditions to Font Awesome icon mapping
        const icons = {
            'Clear': 'fa-sun',
            'Clouds': 'fa-cloud',
            'Rain': 'fa-cloud-rain',
            'Snow': 'fa-snowflake',
            'Thunderstorm': 'fa-bolt',
            'Drizzle': 'fa-cloud-rain',
            'Mist': 'fa-smog',
            'Fog': 'fa-smog',
            'Haze': 'fa-smog',
            'Dust': 'fa-smog',
            'Smoke': 'fa-smog'
        };

        if (weatherElement) {
            const icon = icons[conditions] || 'fa-cloud';
            weatherElement.innerHTML = `
                <div class="weather-icon me-3 text-secondary fs-2" style="color: var(--secondary-color) !important;">
                    <i class="fas ${icon}"></i>
                </div>
                <div class="weather-details text-start">
                    <div class="temp fs-3 fw-bold lh-1">${temp}°C</div>
                    <div class="conditions text-muted">${conditions}</div>
                </div>
            `;
        }

        return data;
    } catch (error) {
        console.error('Error fetching weather:', error);
        return null;
    }
}

// Get location name from coordinates
async function getLocationName(lat, lng) {
    try {
        const url = `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=${CONFIG.OPENCAGE_API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();
        return data.results[0]?.formatted || null;
    } catch (error) {
        console.error('Error getting location name:', error);
        return null;
    }
}

// Get crop recommendations
function getCropRecommendations(area, sunlightHours, weatherData) {
    const crops = [
        {
            name: 'Tomatoes',
            minSunlight: 6,
            maxSunlight: 8,
            minTemp: 15,
            maxTemp: 35,
            yieldPerSqFt: 2.5
        },
        {
            name: 'Lettuce',
            minSunlight: 4,
            maxSunlight: 6,
            minTemp: 10,
            maxTemp: 25,
            yieldPerSqFt: 1.5
        },
        {
            name: 'Herbs',
            minSunlight: 4,
            maxSunlight: 8,
            minTemp: 15,
            maxTemp: 30,
            yieldPerSqFt: 1.0
        },
        {
            name: 'Bell Peppers',
            minSunlight: 6,
            maxSunlight: 8,
            minTemp: 20,
            maxTemp: 30,
            yieldPerSqFt: 2.0
        }
    ];

    const temp = weatherData.main.temp;
    return crops
        .filter(crop => 
            sunlightHours >= crop.minSunlight &&
            sunlightHours <= crop.maxSunlight &&
            temp >= crop.minTemp &&
            temp <= crop.maxTemp
        )
        .map(crop => ({
            ...crop,
            estimatedYield: Math.round(crop.yieldPerSqFt * area * 10) / 10,
            areaRecommendation: Math.round(area / 4)
        }));
}

// Display analysis results
function displayResults(data) {
    const resultsDiv = document.getElementById('analysis-results');
    if (!resultsDiv) return;

    const recommendations = data.recommendations
        .map(crop => `
            <div class="crop-recommendation mb-4">
                <h4 class="h5 mb-3">${crop.name}</h4>
                <div class="row g-3">
                    <div class="col-sm-6">
                        <div class="data-card bg-light p-3 rounded">
                            <div class="small text-muted mb-1">Recommended Area</div>
                            <div class="fw-bold">${crop.areaRecommendation} sq ft</div>
                        </div>
                    </div>
                    <div class="col-sm-6">
                        <div class="data-card bg-light p-3 rounded">
                            <div class="small text-muted mb-1">Estimated Yield</div>
                            <div class="fw-bold">${crop.estimatedYield} kg/year</div>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

    resultsDiv.innerHTML = `
        <div class="results-container bg-white rounded shadow-sm p-4">
            <h3 class="mb-4">Rooftop Analysis Results</h3>
            <div class="row mb-4">
                <div class="col-md-4">
                    <div class="data-card bg-light p-3 rounded">
                        <div class="small text-muted mb-1">Location</div>
                        <div class="fw-bold">${data.location}</div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="data-card bg-light p-3 rounded">
                        <div class="small text-muted mb-1">Rooftop Area</div>
                        <div class="fw-bold">${data.rooftopArea} sq ft</div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="data-card bg-light p-3 rounded">
                        <div class="small text-muted mb-1">Daily Sunlight</div>
                        <div class="fw-bold">${data.sunlightHours} hours</div>
                    </div>
                </div>
            </div>
            <h4 class="h5 mb-3">Recommended Crops</h4>
            ${recommendations}
            <div class="text-muted small mt-3">
                Analysis Date: ${data.analysisDate}
            </div>
        </div>
    `;
}

// Initialize map
function initMap(defaultLat = 23.0225, defaultLng = 72.5714) {
    map = L.map('map').setView([defaultLat, defaultLng], 13);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    
    marker = L.marker([defaultLat, defaultLng], {
        draggable: true
    }).addTo(map);

    marker.on('dragend', async function() {
        const pos = marker.getLatLng();
        const locationName = await getLocationName(pos.lat, pos.lng);
        if (locationName) {
            document.getElementById('location').value = locationName;
        }
        await fetchWeather(pos.lat, pos.lng);
    });

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                map.setView([latitude, longitude], 15);
                marker.setLatLng([latitude, longitude]);
                
                const locationName = await getLocationName(latitude, longitude);
                if (locationName) {
                    document.getElementById('location').value = locationName;
                }
                
                await fetchWeather(latitude, longitude);
            },
            (error) => console.error('Error getting location:', error)
        );
    }
}

// Initialize typewriter effect
function initTypewriter() {
    new Typed('.typewriter', {
        strings: [
            "Maximize Your Urban Harvest",
            "AI-Powered Rooftop Farming",
            "Grow Fresh, Grow Local"
        ],
        typeSpeed: 50,
        backSpeed: 30,
        loop: true,
        showCursor: true,
        cursorChar: '|'
    });
}

// Debounce function to limit API calls
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Handle location suggestions
async function fetchLocationSuggestions(query) {
    if (!query || query.length < 2) {
        document.getElementById('search-suggestions').classList.remove('active');
        return;
    }

    try {
        const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(query)}&key=${CONFIG.OPENCAGE_API_KEY}&limit=5`;
        const response = await fetch(url);
        const data = await response.json();
        
        const suggestionsDiv = document.getElementById('search-suggestions');
        
        if (data.results && data.results.length > 0) {
            const suggestions = data.results.map(result => `
                <div class="suggestion-item" data-lat="${result.geometry.lat}" data-lng="${result.geometry.lng}">
                    <div class="suggestion-main">${result.formatted.split(',')[0]}</div>
                    <div class="suggestion-secondary">${result.formatted.split(',').slice(1).join(',').trim()}</div>
                </div>
            `).join('');
            
            suggestionsDiv.innerHTML = suggestions;
            suggestionsDiv.classList.add('active');

            // Add click handlers to suggestions
            const suggestionItems = suggestionsDiv.getElementsByClassName('suggestion-item');
            Array.from(suggestionItems).forEach(item => {
                item.addEventListener('click', () => {
                    const lat = parseFloat(item.dataset.lat);
                    const lng = parseFloat(item.dataset.lng);
                    document.getElementById('map-search-input').value = item.querySelector('.suggestion-main').textContent;
                    suggestionsDiv.classList.remove('active');
                    updateMapLocation(lat, lng, item.querySelector('.suggestion-main').textContent);
                });
            });
        } else {
            suggestionsDiv.classList.remove('active');
        }
    } catch (error) {
        console.error('Error fetching suggestions:', error);
    }
}

// Update map location
function updateMapLocation(lat, lng, locationName) {
    map.setView([lat, lng], 15);
    marker.setLatLng([lat, lng]);
    document.getElementById('location').value = locationName;
    fetchWeather(lat, lng);
}

// Search for a location
async function searchLocation(query) {
    try {
        const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(query)}&key=${CONFIG.OPENCAGE_API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.results && data.results.length > 0) {
            const result = data.results[0];
            const { lat, lng } = result.geometry;
            
            // Update map and marker
            map.setView([lat, lng], 15);
            marker.setLatLng([lat, lng]);
            
            // Update location input
            document.getElementById('location').value = result.formatted;
            
            // Get weather for the location
            await fetchWeather(lat, lng);
            
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error searching location:', error);
        return false;
    }
}

// Setup event listeners
function setupEventListeners() {
    const navbar = document.querySelector('.navbar');
    const analyzeBtn = document.getElementById('analyze-btn');
    const searchInput = document.getElementById('map-search-input');
    const searchBtn = document.getElementById('map-search-btn');

    // Navbar scroll effect
    function handleScroll() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    // Search functionality
    if (searchBtn && searchInput) {
        const handleSearch = async () => {
            const query = searchInput.value.trim();
            if (!query) return;

            searchBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span>';
            searchBtn.disabled = true;

            try {
                const success = await searchLocation(query);
                if (!success) {
                    alert('Location not found. Please try a different search term.');
                }
                document.getElementById('search-suggestions').classList.remove('active');
            } catch (error) {
                console.error('Search error:', error);
                alert('An error occurred while searching. Please try again.');
            } finally {
                searchBtn.innerHTML = '<i class="fas fa-search"></i> Search';
                searchBtn.disabled = false;
            }
        };

        // Add debounced input handler for suggestions
        const debouncedFetchSuggestions = debounce((value) => {
            fetchLocationSuggestions(value);
        }, 300);

        searchInput.addEventListener('input', (e) => {
            debouncedFetchSuggestions(e.target.value.trim());
        });

        // Close suggestions when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.map-search')) {
                document.getElementById('search-suggestions').classList.remove('active');
            }
        });

        searchBtn.addEventListener('click', handleSearch);
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleSearch();
            }
        });
    }

    if (analyzeBtn) {
        analyzeBtn.addEventListener('click', async function() {
            this.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Analyzing...';
            this.disabled = true;

            try {
                const rooftopArea = parseInt(document.getElementById('rooftop-area').value);
                const sunlightHours = parseInt(document.getElementById('sunlight-hours').value);
                const location = marker.getLatLng();
                
                const weatherData = await fetchWeather(location.lat, location.lng);
                if (!weatherData) {
                    throw new Error('Could not fetch weather data');
                }

                const results = getCropRecommendations(rooftopArea, sunlightHours, weatherData);
                
                displayResults({
                    location: document.getElementById('location').value,
                    rooftopArea: rooftopArea,
                    sunlightHours: sunlightHours,
                    recommendations: results,
                    totalYield: results.reduce((sum, crop) => sum + crop.estimatedYield, 0),
                    weather: weatherData,
                    analysisDate: new Date().toLocaleDateString()
                });

                document.getElementById('analysis-results').scrollIntoView({ behavior: 'smooth' });
            } catch (error) {
                console.error('Analysis error:', error);
                alert('An error occurred during analysis. Please check your inputs and try again.');
            } finally {
                this.textContent = 'Re-analyze My Rooftop';
                this.disabled = false;
            }
        });
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initMap();
    initTypewriter();
    setupEventListeners();
});
