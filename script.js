// Function to scroll to How It Works section.
// Moved to the global scope to be accessible by the `onclick` attributes in the HTML.
function scrollToHowItWorks() {
    const howItWorksSection = document.getElementById('how-it-works');
    howItWorksSection.scrollIntoView({ behavior: 'smooth' });
}

document.addEventListener('DOMContentLoaded', function() {
    const navbar = document.querySelector('.navbar');
    
    // Navbar scroll effect
    function handleScroll() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }
    
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Run on page load

    // Typewriter effect
    const typewriter = new Typed('.typewriter', {
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

    // Initialize map
    function initMap() {
        const map = L.map('map').setView([12.9716, 77.5946], 15);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
        
        const rooftopCoords = [
            [12.9712, 77.5942],
            [12.9712, 77.5950],
            [12.9720, 77.5950],
            [12.9720, 77.5942]
        ];
        
        const rooftopArea = L.polygon(rooftopCoords, {
            color: '#4F6367',
            fillColor: '#B7D7B8',
            fillOpacity: 0.3
        }).addTo(map);
        
        L.marker([12.9716, 77.5946]).addTo(map)
            .bindPopup('Your rooftop location')
            .openPopup();
        
        map.fitBounds(rooftopArea.getBounds());
    }
    
    initMap();

    // Weather API simulation
    async function fetchWeather(location = 'Bangalore') {
        try {
            const weatherConditions = {
                'Bangalore': { temp: 24, conditions: 'Partly Cloudy', icon: 'fa-cloud-sun' },
                'Mumbai': { temp: 28, conditions: 'Humid', icon: 'fa-cloud-rain' },
                'Delhi': { temp: 30, conditions: 'Sunny', icon: 'fa-sun' },
                'Chennai': { temp: 32, conditions: 'Hot', icon: 'fa-sun' },
                'Kolkata': { temp: 27, conditions: 'Rainy', icon: 'fa-cloud-showers-heavy' }
            };
            
            const weatherData = weatherConditions[location] || weatherConditions['Bangalore'];
            
            const weatherElement = document.getElementById('weather-data');
            weatherElement.querySelector('.temp').textContent = `${weatherData.temp}°C`;
            weatherElement.querySelector('.conditions').textContent = weatherData.conditions;
            weatherElement.querySelector('.weather-icon i').className = `fas ${weatherData.icon}`;
            
            return weatherData;
        } catch (error) {
            console.error('Error fetching weather:', error);
            return null;
        }
    }
    
    fetchWeather();

    // Rooftop analysis functionality
    const analyzeBtn = document.getElementById('analyze-btn');
    analyzeBtn.addEventListener('click', async function() {
        this.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Analyzing...';
        this.disabled = true;
        
        const rooftopArea = parseInt(document.getElementById('rooftop-area').value);
        const sunlightHours = parseInt(document.getElementById('sunlight-hours').value);
        const location = document.getElementById('location').value.trim() || 'Bangalore';
        
        const weatherData = await fetchWeather(location);
        
        setTimeout(() => {
            const analysisResults = analyzeRooftop(rooftopArea, sunlightHours, weatherData);
            displayResults(analysisResults);
            
            this.textContent = 'Re-analyze My Rooftop';
            this.disabled = false;
        }, 1500);
    });
    
    function analyzeRooftop(area, sunlightHours, weatherData) {
        const allPlants = [
            { name: 'Tomatoes', sunReq: 6, waterReq: 'Medium', spaceReq: 2, yield: 10, season: 'All', icon: 'fa-pepper-hot' },
            { name: 'Peppers', sunReq: 6, waterReq: 'Medium', spaceReq: 1.5, yield: 8, season: 'Summer', icon: 'fa-pepper-hot' },
            { name: 'Spinach', sunReq: 4, waterReq: 'High', spaceReq: 1, yield: 5, season: 'Winter', icon: 'fa-leaf' },
            { name: 'Basil', sunReq: 5, waterReq: 'Medium', spaceReq: 0.5, yield: 3, season: 'All', icon: 'fa-seedling' },
            { name: 'Mint', sunReq: 4, waterReq: 'High', spaceReq: 1, yield: 4, season: 'All', icon: 'fa-seedling' },
            { name: 'Okra', sunReq: 8, waterReq: 'Medium', spaceReq: 2, yield: 7, season: 'Summer', icon: 'fa-seedling' },
            { name: 'Lettuce', sunReq: 4, waterReq: 'High', spaceReq: 1, yield: 6, season: 'Winter', icon: 'fa-leaf' },
            { name: 'Eggplant', sunReq: 6, waterReq: 'Medium', spaceReq: 2, yield: 9, season: 'Summer', icon: 'fa-pepper-hot' }
        ];
        
        const suitablePlants = allPlants.filter(plant => sunlightHours >= plant.sunReq);
        suitablePlants.sort((a, b) => b.yield - a.yield);
        
        const plantsWithQuantity = suitablePlants.map(plant => ({
            ...plant,
            quantity: Math.floor(area / plant.spaceReq),
            totalYield: Math.floor(area / plant.spaceReq) * plant.yield
        }));
        
        const recommendations = plantsWithQuantity.slice(0, 4);
        const totalYield = recommendations.reduce((sum, plant) => sum + plant.totalYield, 0);
        
        return {
            location: location,
            rooftopArea: area,
            sunlightHours: sunlightHours,
            weather: weatherData,
            recommendations: recommendations,
            totalYield: totalYield,
            analysisDate: new Date().toLocaleDateString()
        };
    }
    
    function displayResults(results) {
        const yieldPercentage = Math.min(100, Math.floor((results.totalYield / (results.rooftopArea * 5)) * 100)); // Normalized yield
        const resultsContainer = document.getElementById('analysis-results');
        
        resultsContainer.innerHTML = `
            <div class="text-center mb-4">
                <h3 style="color: var(--dark-color) !important;">Your Rooftop Analysis Results</h3>
                <p class="text-muted">Generated on ${results.analysisDate} for ${results.location}</p>
            </div>
            
            <div class="row g-4">
                ${results.recommendations.map(plant => `
                    <div class="col-md-6 col-lg-3">
                        <div class="p-3 bg-light rounded h-100 text-center">
                            <h4 class="h5" style="color: var(--dark-color);"><i class="fas ${plant.icon} me-2"></i>${plant.name}</h4>
                            <p class="small text-muted mb-2">Ideal for ${results.sunlightHours} hrs of sun.</p>
                            <div class="mt-3 pt-3 border-top">
                                <h5 class="h6 text-dark">Estimated Yield</h5>
                                <p class="fw-bold fs-4" style="color: var(--accent-color) !important;">~${plant.totalYield} kg</p>
                                <p class="small text-muted mb-0">from ${plant.quantity} plants</p>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <div class="mt-5 p-4 bg-light rounded text-center">
                <h4 style="color: var(--dark-color);"><i class="fas fa-chart-pie me-2"></i>Total Potential Yield</h4>
                <p class="lead">Your ${results.rooftopArea} sq ft rooftop could produce approximately:</p>
                <h2 class="my-3" style="color: var(--dark-color); font-weight: 700;">${results.totalYield} kg of fresh produce</h2>
                
                <div class="mt-4 mx-auto" style="max-width: 400px;">
                    <h5 class="text-dark h6">Yield Potential</h5>
                    <div class="yield-bar mb-2">
                        <div class="yield-progress" style="width: ${yieldPercentage}%"></div>
                    </div>
                    <p class="text-muted">${yieldPercentage}% of maximum potential for your space</p>
                </div>
            </div>
        `;
        
        resultsContainer.scrollIntoView({ behavior: 'smooth' });
    }
});