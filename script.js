let selectedMood = '';
let moodData = JSON.parse(localStorage.getItem('moodLogs')) || [];

// MFA Mock Logic
function sendOTP() {
    const email = document.getElementById('email').value;
    if(email) {
        alert("Verification code sent to " + email + " (Simulated: 123456)");
        document.getElementById('login-step').classList.add('hidden');
        document.getElementById('mfa-step').classList.remove('hidden');
    }
}

function verifyOTP() {
    const otp = document.getElementById('otp-input').value;
    if(otp === '123456') {
        document.getElementById('auth-overlay').classList.add('hidden');
        document.getElementById('app-content').classList.remove('blurred');
        initChart();
    } else {
        alert("Invalid Code!");
    }
}

// Mood Tracking Logic
function setMood(emoji, label) {
    selectedMood = emoji;
    document.getElementById('ai-message').innerText = `I see you're feeling ${label}. Want to talk about it?`;
}

function saveEntry() {
    const note = document.getElementById('note-input').value;
    const entry = {
        date: new Date().toLocaleDateString(),
        mood: selectedMood,
        note: note
    };
    
    moodData.push(entry);
    localStorage.setItem('moodLogs', JSON.stringify(moodData));
    updateAIResponse(selectedMood);
    initChart();
    alert("Entry secured and saved!");
}

function updateAIResponse(mood) {
    const messages = {
        '😊': "That's wonderful! Keep that positive energy flowing!",
        '😔': "I'm sorry you're feeling down. Remember, it's okay not to be okay.",
        '😠': "Take a deep breath. You're stronger than your frustration.",
        '😌': "Peace looks good on you. Stay mindful."
    };
    document.getElementById('ai-message').innerText = messages[mood] || "Thank you for sharing with me.";
}

// Charting
function initChart() {
    const ctx = document.getElementById('moodChart').getContext('2d');
    const labels = moodData.slice(-7).map(d => d.date);
    const data = moodData.slice(-7).map(d => d.mood === '😊' ? 5 : d.mood === '😔' ? 2 : 3);

    if(window.myChart) window.myChart.destroy();

    window.myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Mood Level',
                data: data,
                borderColor: '#6c5ce7',
                tension: 0.4,
                fill: true,
                backgroundColor: 'rgba(108, 92, 231, 0.1)'
            }]
        },
        options: { scales: { y: { min: 1, max: 5 } } }
    });
}

// SOS Logic
function triggerSOS() { document.getElementById('sos-modal').classList.remove('hidden'); }
function closeSOS() { document.getElementById('sos-modal').classList.add('hidden'); }
