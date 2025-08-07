// Wait for page to load
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('surveyForm');
    const resultSection = document.getElementById('result');
    const resultContent = document.getElementById('resultContent');
    
    // Question name mapping
    const questionMapping = {
        // Environment discomfort
        'windy1': 'windy',
        'dry': 'dry', 
        'windy2': 'windy',
        
        // Eye discomfort
        'photophobia': 'photophobia',
        'sandFeeling': 'feeling of sand in the eyes',
        'painSwelling': 'pain/swelling',
        'blurredVision': 'blurred vision',
        'decreasedVision': 'decreased vision',
        
        // Daily habits
        'reading': 'reading',
        'nightDriving': 'driving at night',
        'computerUse': 'using computer',
        'watchingTV': 'watching TV'
    };
    
    // Score mapping
    const scoreMapping = {
        4: 'always',
        3: 'usually',
        2: 'half time',
        1: 'sometimes',
        0: 'never'
    };
    
    // Categories
    const categories = {
        environment: {
            name: 'The degree of discomfort of the glasses in a particular environment',
            questions: ['windy1', 'dry', 'windy2']
        },
        eyeDiscomfort: {
            name: 'The degree of eye discomfort',
            questions: ['photophobia', 'sandFeeling', 'painSwelling', 'blurredVision', 'decreasedVision']
        },
        dailyHabits: {
            name: 'Daily eye habits',
            questions: ['reading', 'nightDriving', 'computerUse', 'watchingTV']
        }
    };
    
    // Form submit handling
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validate form
        if (!validateForm()) {
            return;
        }
        
        // Show loading state
        const submitBtn = document.querySelector('.submit-btn');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Submitting...';
        submitBtn.disabled = true;
        
        // Collect data for API
        const apiData = collectApiData();
        
        // Submit to server
        submitToServer(apiData)
            .then(response => {
                if (response.success) {
                    // Show simple success message
                    showSuccessMessage();
                    
                    // Also save to local storage as backup
                    saveToLocalStorage(apiData);
                } else {
                    throw new Error(response.message || 'Server returned error');
                }
            })
            .catch(error => {
                console.error('Submission error:', error);
                console.log('Saving data locally for static deployment...');
                
                // For static deployments (like Netlify), save locally and show success
                saveToLocalStorage(apiData);
                showSuccessMessage();
            })
            .finally(() => {
                // Reset button state
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            });
    });
    
    // Show simple success message with OSDI score
    function showSuccessMessage(osdiScore = null) {
        // Hide the form
        form.style.display = 'none';
        
        // Calculate OSDI score if not provided
        if (osdiScore === null) {
            const formData = collectFormData();
            let totalScore = 0;
            let totalQuestions = 0;
            
            Object.keys(categories).forEach(categoryKey => {
                const category = categories[categoryKey];
                category.questions.forEach(questionKey => {
                    if (formData[questionKey]) {
                        totalScore += formData[questionKey].value;
                        totalQuestions += 1;
                    }
                });
            });
            
            osdiScore = totalQuestions > 0 ? ((totalScore * 25) / totalQuestions).toFixed(1) : 0;
        }
        
        // Get rating text
        function getScoreRating(score) {
            const numScore = parseFloat(score);
            if (numScore >= 33) return { text: 'Severe Dry Eye', color: '#D01F3E' };
            if (numScore >= 23) return { text: 'Moderate Dry Eye', color: '#ff9800' };
            if (numScore >= 13) return { text: 'Mild Dry Eye', color: '#ffc107' };
            return { text: 'Normal', color: '#4caf50' };
        }
        
        const rating = getScoreRating(osdiScore);
        
        // Create and show OSDI score only
        resultContent.innerHTML = `
            <div class="success-message" style="text-align: center; padding: 40px 20px;">
                <div style="background: rgba(255, 255, 255, 0.9); border-radius: 15px; padding: 30px; margin: 20px auto; max-width: 400px; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);">
                    <h4 style="color: #333; margin-bottom: 15px; font-size: 1.2em;">Your OSDI Score</h4>
                    <div style="font-size: 3em; font-weight: bold; color: ${rating.color}; margin: 15px 0;">${osdiScore}</div>
                    <div style="font-size: 1.3em; font-weight: bold; color: ${rating.color}; margin-bottom: 20px;">${rating.text}</div>
                    
                    <div style="background: #f8f9fa; border-radius: 10px; padding: 20px; text-align: left; font-size: 0.9em; color: #666;">
                        <h5 style="color: #333; margin-bottom: 10px; text-align: center;">Score Range:</h5>
                        <div style="margin: 5px 0;">0~12: Normal</div>
                        <div style="margin: 5px 0;">13~22: Mild Dry Eye</div>
                        <div style="margin: 5px 0;">23~32: Moderate Dry Eye</div>
                        <div style="margin: 5px 0;">≥33: Severe Dry Eye</div>
                    </div>
                </div>
            </div>
        `;
        
        resultSection.style.display = 'block';
        
        // Scroll to success message
        resultSection.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
        
        // Add animation effects
        resultSection.style.opacity = '0';
        resultSection.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            resultSection.style.transition = 'all 0.5s ease';
            resultSection.style.opacity = '1';
            resultSection.style.transform = 'translateY(0)';
        }, 100);
    }
    
    // Form reset handling
    const resetBtn = document.querySelector('.reset-btn');
    resetBtn.addEventListener('click', function() {
        if (confirm('Are you sure you want to reset all selections?')) {
            form.reset();
            resultSection.style.display = 'none';
            form.style.display = 'block'; // Ensure form is visible
            clearLocalStorage();
            
            // Scroll to top
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    });
    
    // Validate form completion
    function validateForm() {
        // Check name field first
        const nameInput = document.getElementById('participantName');
        if (!nameInput || !nameInput.value.trim()) {
            // Jump to name field
            nameInput.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
            nameInput.focus();
            highlightIncompleteQuestion(nameInput.closest('.question'));
            return false;
        }
        
        // Check survey questions
        let firstMissingField = null;
        
        // Check each category for missing fields
        Object.keys(categories).forEach(categoryKey => {
            const category = categories[categoryKey];
            category.questions.forEach(fieldName => {
                const radioGroup = document.querySelector(`input[name="${fieldName}"]:checked`);
                if (!radioGroup && !firstMissingField) {
                    firstMissingField = fieldName;
                }
            });
        });
        
        if (firstMissingField) {
            // Jump directly to first missing question
            const element = document.querySelector(`input[name="${firstMissingField}"]`);
            if (element) {
                element.closest('.question').scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
                // Highlight incomplete question
                highlightIncompleteQuestion(element.closest('.question'));
            }
            return false;
        }
        
        return true;
    }
    
    // Highlight incomplete question
    function highlightIncompleteQuestion(questionElement) {
        questionElement.style.border = '3px solid #f44336';
        questionElement.style.background = '#ffebee';
        questionElement.style.transition = 'all 0.3s ease';
        
        // Add visual indicator
        const indicator = document.createElement('div');
        indicator.innerHTML = '⚠️ Please answer this question';
        indicator.style.cssText = `
            position: absolute;
            top: -10px;
            right: -10px;
            background: #f44336;
            color: white;
            padding: 5px 10px;
            border-radius: 5px;
            font-size: 0.8em;
            font-weight: bold;
            z-index: 1000;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            animation: pulse 1s infinite;
        `;
        
        questionElement.style.position = 'relative';
        questionElement.appendChild(indicator);
        
        setTimeout(() => {
            questionElement.style.border = '';
            questionElement.style.background = '';
            if (indicator.parentNode) {
                indicator.parentNode.removeChild(indicator);
            }
        }, 5000);
    }
    
    // Collect form data
    function collectFormData() {
        const data = {};
        
        Object.keys(questionMapping).forEach(fieldName => {
            const selectedOption = document.querySelector(`input[name="${fieldName}"]:checked`);
            if (selectedOption) {
                data[fieldName] = {
                    value: parseInt(selectedOption.value),
                    text: scoreMapping[selectedOption.value],
                    question: questionMapping[fieldName]
                };
            }
        });
        
        return data;
    }
    
    // Collect API data (simple key-value pairs)
    function collectApiData() {
        const data = {};
        
        // Collect name (required)
        const nameInput = document.getElementById('participantName');
        data.participantName = nameInput.value.trim();
        
        // Collect survey responses
        Object.keys(questionMapping).forEach(fieldName => {
            const selectedOption = document.querySelector(`input[name="${fieldName}"]:checked`);
            if (selectedOption) {
                data[fieldName] = parseInt(selectedOption.value);
            }
        });
        
        return data;
    }
    
    // Submit data to server
    async function submitToServer(data) {
        try {
            const response = await fetch('/api/survey/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Network error:', error);
            throw error;
        }
    }
    
    // Display results
    function displayResults(data, serverScores = null) {
        let html = '<h3>Detailed Results Analysis</h3>';
        
        // Add server confirmation if available
        if (serverScores) {
            html += '<div class="server-confirmation" style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #4caf50;">';
            html += '<p style="color: #2e7d32; margin: 0;"><strong>✓ Data successfully saved to database</strong></p>';
            html += `<p style="color: #666; margin: 5px 0 0 0; font-size: 0.9em;">Survey ID: ${serverScores.surveyId || 'Generated'}</p>`;
            html += '</div>';
        }
        
        // Display results by category
        Object.keys(categories).forEach(categoryKey => {
            const category = categories[categoryKey];
            html += `<div class="category-result">`;
            html += `<h4>${category.name}</h4>`;
            
            let categoryTotal = 0;
            let categoryMax = category.questions.length * 4;
            
            html += `<ul class="result-list">`;
            category.questions.forEach(questionKey => {
                if (data[questionKey]) {
                    const item = data[questionKey];
                    categoryTotal += item.value;
                    html += `<li><strong>${item.question}:</strong> ${item.text}</li>`;
                }
            });
            html += `</ul>`;
            
            // Calculate OSDI score for category
            const osdiScore = ((categoryTotal * 25) / category.questions.length).toFixed(1);
            const rating = getOSDIRating(osdiScore);
            
            html += `<div class="category-summary">`;
            html += `<p><strong>Total Score:</strong> ${categoryTotal}/${categoryMax}</p>`;
            html += `<p><strong>OSDI Score:</strong> ${osdiScore}/100</p>`;
            html += `<p><strong>Rating:</strong> <span class="rating-${rating.level}">${rating.text}</span></p>`;
            html += `</div>`;
            html += `</div>`;
        });
        
        // Overall assessment
        const totalScore = Object.values(data).reduce((sum, item) => sum + item.value, 0);
        const maxScore = Object.keys(questionMapping).length * 4;
        const totalQuestions = Object.keys(questionMapping).length;
        const overallOSDI = ((totalScore * 25) / totalQuestions).toFixed(1);
        const overallRating = getOSDIRating(overallOSDI);
        
        html += `<div class="overall-result">`;
        html += `<h4>Overall Assessment</h4>`;
        html += `<p><strong>Total Score:</strong> ${totalScore}/${maxScore}</p>`;
        html += `<p><strong>Overall OSDI Score:</strong> ${overallOSDI}/100</p>`;
        html += `<p><strong>Overall Rating:</strong> <span class="rating-${overallRating.level}">${overallRating.text}</span></p>`;
        html += `<div class="recommendations">`;
        html += `<h5>Recommendations:</h5>`;
        html += getRecommendations(overallOSDI);
        html += `</div>`;
        html += `</div>`;
        
        // Export functionality
        html += `<div class="export-section">`;
        html += `<button onclick="exportResults()" class="export-btn">Export Results</button>`;
        html += `<button onclick="printResults()" class="print-btn">Print Results</button>`;
        html += `</div>`;
        
        resultContent.innerHTML = html;
        resultSection.style.display = 'block';
        
        // Add animation effects
        resultSection.style.opacity = '0';
        resultSection.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            resultSection.style.transition = 'all 0.5s ease';
            resultSection.style.opacity = '1';
            resultSection.style.transform = 'translateY(0)';
        }, 100);
    }
    
    // Get OSDI rating
    function getOSDIRating(osdiScore) {
        const score = parseFloat(osdiScore);
        if (score >= 33) {
            return { level: 'high', text: 'Severe Discomfort' };
        } else if (score >= 23) {
            return { level: 'medium-high', text: 'Moderate Discomfort' };
        } else if (score >= 13) {
            return { level: 'medium', text: 'Mild Discomfort' };
        } else {
            return { level: 'minimal', text: 'Normal/No Significant Discomfort' };
        }
    }
    
    // Get recommendations based on OSDI score
    function getRecommendations(osdiScore) {
        let recommendations = '<ul>';
        const score = parseFloat(osdiScore);
        
        if (score >= 33) {
            // Severe Discomfort (OSDI ≥ 33)
            recommendations += '<li>Recommend immediate medical consultation for professional eye examination</li>';
            recommendations += '<li>Consider switching to more suitable glasses or contact lenses</li>';
            recommendations += '<li>Reduce eye strain and increase rest time significantly</li>';
            recommendations += '<li>Improve eye environment, avoid bright lights and dry conditions</li>';
            recommendations += '<li>Consider prescription eye drops or treatments</li>';
        } else if (score >= 23) {
            // Moderate Discomfort (OSDI 23-32)
            recommendations += '<li>Recommend consulting an ophthalmologist for vision check</li>';
            recommendations += '<li>Adjust eye habits, follow the 20-20-20 rule strictly</li>';
            recommendations += '<li>Use eye protection devices such as blue light glasses</li>';
            recommendations += '<li>Maintain appropriate indoor humidity (40-60%)</li>';
            recommendations += '<li>Consider using artificial tears regularly</li>';
        } else if (score >= 13) {
            // Mild Discomfort (OSDI 13-22)
            recommendations += '<li>Pay attention to eye hygiene and take regular breaks</li>';
            recommendations += '<li>Adjust screen brightness and distance appropriately</li>';
            recommendations += '<li>Use artificial tears when needed to relieve dry eye symptoms</li>';
            recommendations += '<li>Perform eye exercises regularly</li>';
            recommendations += '<li>Monitor symptoms and consider professional consultation if worsening</li>';
        } else {
            // Normal (OSDI < 13)
            recommendations += '<li>Continue to maintain good eye health habits</li>';
            recommendations += '<li>Regular preventive eye examinations (annually)</li>';
            recommendations += '<li>Maintain healthy lifestyle and proper lighting</li>';
            recommendations += '<li>Stay hydrated and maintain good nutrition</li>';
        }
        
        recommendations += '</ul>';
        return recommendations;
    }
    
    // Calculate OSDI score from raw data
    function calculateOSDI(data) {
        let totalScore = 0;
        let totalQuestions = 0;
        
        // Count all questions except participantName
        Object.keys(data).forEach(key => {
            if (key !== 'participantName' && typeof data[key] === 'number') {
                totalScore += data[key];
                totalQuestions++;
            }
        });
        
        const overallOSDI = totalQuestions > 0 ? ((totalScore * 25) / totalQuestions) : 0;
        return {
            overallOSDI: Math.round(overallOSDI * 10) / 10,
            totalScore: totalScore,
            totalQuestions: totalQuestions
        };
    }

    // Save to local storage
    function saveToLocalStorage(data) {
        const timestamp = new Date().toISOString();
        const osdiResult = calculateOSDI(data);
        
        const surveyResult = {
            data: data,
            timestamp: timestamp,
            date: new Date().toLocaleDateString('en-US'),
            // Add fields for admin panel compatibility
            participantName: data.participantName || 'Anonymous',
            overallOSDI: osdiResult.overallOSDI
        };
        
        // Save with both keys for compatibility
        localStorage.setItem('eyeComfortSurvey', JSON.stringify(surveyResult));
        
        // Save with survey_ prefix for admin panel
        const surveyKey = `survey_${timestamp.replace(/[:.]/g, '_')}`;
        localStorage.setItem(surveyKey, JSON.stringify(surveyResult));
        
        console.log('Survey saved to localStorage:', surveyKey, surveyResult);
    }
    
    // Clear local storage
    function clearLocalStorage() {
        localStorage.removeItem('eyeComfortSurvey');
    }
    
    // Load data from local storage
    function loadFromLocalStorage() {
        const saved = localStorage.getItem('eyeComfortSurvey');
        if (saved) {
            try {
                const surveyResult = JSON.parse(saved);
                if (confirm(`Found previously saved survey data (${surveyResult.date}). Do you want to restore your previous answers?`)) {
                    restoreFormData(surveyResult.data);
                    // Don't show results, just restore the form data
                    // User can make changes and submit again if needed
                }
            } catch (e) {
                console.error('Error loading saved data:', e);
            }
        }
    }
    
    // Restore form data
    function restoreFormData(data) {
        Object.keys(data).forEach(fieldName => {
            const radio = document.querySelector(`input[name="${fieldName}"][value="${data[fieldName].value}"]`);
            if (radio) {
                radio.checked = true;
            }
        });
    }
    
    // Check for saved data on page load
    loadFromLocalStorage();
    
    // Add visual feedback when options are selected
    document.querySelectorAll('input[type="radio"]').forEach(radio => {
        radio.addEventListener('change', function() {
            const question = this.closest('.question');
            question.style.borderColor = '#D01F3E';
            question.style.background = '#f8f9ff';
            
            setTimeout(() => {
                question.style.borderColor = '';
                question.style.background = '';
            }, 1000);
        });
    });
});

// Export results function
function exportResults() {
    const resultContent = document.getElementById('resultContent').innerText;
    const timestamp = new Date().toLocaleString('en-US');
    
    const content = `Glasses Discomfort Survey Results\n\nExport Time: ${timestamp}\n\n${resultContent}`;
    
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `Glasses_Discomfort_Survey_Results_${new Date().toISOString().slice(0,10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    URL.revokeObjectURL(url);
}

// Print results function
function printResults() {
    const resultSection = document.getElementById('result');
    const originalDisplay = resultSection.style.display;
    
    // Temporarily show results section
    resultSection.style.display = 'block';
    
    // Create print styles
    const printCSS = `
        <style>
            @media print {
                body * { visibility: hidden; }
                #result, #result * { visibility: visible; }
                #result { position: absolute; left: 0; top: 0; width: 100%; }
                .export-section { display: none !important; }
            }
        </style>
    `;
    
    document.head.insertAdjacentHTML('beforeend', printCSS);
    
    window.print();
    
    // Restore original state
    resultSection.style.display = originalDisplay;
}

// Smooth scroll to element
function scrollToElement(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Logo click handler - open admin panel with password
function openAdminPanel() {
    // Request password
    const password = prompt('Enter admin password:');
    
    if (password === '123456') {
        // Correct password, redirect to unified admin panel
        window.location.href = 'admin.html';
    } else if (password !== null) {
        // Wrong password (null means user cancelled)
        alert('Incorrect password!');
    }
}