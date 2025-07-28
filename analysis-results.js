function updateAnalysisResults(data) {
    // Sunlight Analysis
    document.getElementById('sunlight-result').innerHTML = `
        <div class="result-value">${data.sunlightHours} hours/day</div>
        <div class="result-text">Your rooftop receives optimal sunlight for growing various crops.</div>
        <div class="result-meter">
            <div class="progress">
                <div class="progress-bar" role="progressbar" 
                     style="width: ${(data.sunlightHours/12)*100}%" 
                     aria-valuenow="${data.sunlightHours}" 
                     aria-valuemin="0" 
                     aria-valuemax="12">
                </div>
            </div>
        </div>
    `;

    // Water Requirements
    document.getElementById('water-result').innerHTML = `
        <div class="result-value">${data.waterNeeds} L/day</div>
        <div class="result-text">Recommended daily water requirements</div>
        <div class="water-stats">
            <div class="stat-row">
                <i class="fas fa-tint text-primary"></i>
                <span>Morning: ${Math.round(data.waterNeeds * 0.4)}L</span>
            </div>
            <div class="stat-row">
                <i class="fas fa-sun text-warning"></i>
                <span>Evening: ${Math.round(data.waterNeeds * 0.6)}L</span>
            </div>
        </div>
    `;

    // Growing Conditions
    document.getElementById('conditions-result').innerHTML = `
        <div class="condition-grid">
            <div class="condition-item">
                <i class="fas fa-thermometer-half"></i>
                <span>Temperature</span>
                <strong>${data.temperature}°C</strong>
            </div>
            <div class="condition-item">
                <i class="fas fa-tint"></i>
                <span>Humidity</span>
                <strong>${data.humidity}%</strong>
            </div>
            <div class="condition-item">
                <i class="fas fa-wind"></i>
                <span>Wind</span>
                <strong>${data.windSpeed} km/h</strong>
            </div>
            <div class="condition-item">
                <i class="fas fa-cloud-sun"></i>
                <span>Weather</span>
                <strong>${data.weather}</strong>
            </div>
        </div>
    `;

    // Yield Prediction
    document.getElementById('yield-result').innerHTML = `
        <div class="result-value">${data.expectedYield} kg/month</div>
        <div class="result-text">Estimated monthly harvest</div>
        <div class="yield-breakdown">
            <div class="yield-item">
                <i class="fas fa-leaf"></i>
                <span>Vegetables: ${Math.round(data.expectedYield * 0.6)} kg</span>
            </div>
            <div class="yield-item">
                <i class="fas fa-apple-alt"></i>
                <span>Fruits: ${Math.round(data.expectedYield * 0.4)} kg</span>
            </div>
        </div>
    `;

    // Recommended Crops
    const cropRecommendations = document.getElementById('crop-recommendations');
    const cropHTML = data.recommendedCrops.map(crop => `
        <div class="col-md-4 mb-4">
            <div class="crop-card">
                <div class="crop-icon">
                    <i class="fas ${getCropIcon(crop.type)}"></i>
                </div>
                <div class="crop-name">${crop.name}</div>
                <div class="crop-details">${crop.description}</div>
                <div class="crop-stats">
                    <div class="stat-item">
                        <div class="stat-label">Growth Time</div>
                        <div class="stat-value">${crop.growthTime} days</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">Water Need</div>
                        <div class="stat-value">${crop.waterNeed}</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">Yield</div>
                        <div class="stat-value">${crop.yield}</div>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
    
    cropRecommendations.innerHTML = cropHTML;
}

// Helper function to get crop icons
function getCropIcon(type) {
    const icons = {
        'leafy': 'fa-leaf',
        'fruit': 'fa-apple-alt',
        'root': 'fa-carrot',
        'herb': 'fa-seedling',
        'vegetable': 'fa-pepper-hot',
        'flower': 'fa-spa'
    };
    return icons[type] || 'fa-seedling';
}

// Sample data for testing
const sampleAnalysisData = {
    sunlightHours: 6,
    waterNeeds: 25,
    temperature: 28,
    humidity: 65,
    windSpeed: 12,
    weather: 'Sunny',
    expectedYield: 45,
    recommendedCrops: [
        {
            name: 'Cherry Tomatoes',
            type: 'fruit',
            description: 'Compact and high-yielding variety',
            growthTime: 65,
            waterNeed: 'Medium',
            yield: '3-4 kg'
        },
        {
            name: 'Spinach',
            type: 'leafy',
            description: 'Fast-growing leafy green',
            growthTime: 45,
            waterNeed: 'Low',
            yield: '2-3 kg'
        },
        {
            name: 'Basil',
            type: 'herb',
            description: 'Aromatic herb, perfect for small spaces',
            growthTime: 30,
            waterNeed: 'Low',
            yield: '1-1.5 kg'
        }
    ]
};
