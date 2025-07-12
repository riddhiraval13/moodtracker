// Mood tracking app functionality
class MoodTracker {
    constructor() {
        this.moodData = this.loadMoodData();
        this.selectedMood = null;
        this.selectedActivities = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateStatistics();
        this.renderHistory();
        this.renderChart();
        this.checkTodayMood();
    }

    // Setup event listeners
    setupEventListeners() {
        // Activity selection
        document.querySelectorAll('.activity-item').forEach(item => {
            item.addEventListener('click', (e) => {
                this.toggleActivity(e.currentTarget.dataset.activity);
            });
        });
    }

    // Select mood
    selectMood(mood) {
        this.selectedMood = mood;
        
        // Update visual selection
        document.querySelectorAll('.mood-card').forEach(card => {
            card.classList.remove('selected');
        });
        document.querySelector(`[data-mood="${mood}"]`).classList.add('selected');
        
        // Show details section
        document.getElementById('detailsSection').style.display = 'block';
        
        // Scroll to details
        document.getElementById('detailsSection').scrollIntoView({ 
            behavior: 'smooth' 
        });
    }

    // Toggle activity selection
    toggleActivity(activity) {
        const activityElement = document.querySelector(`[data-activity="${activity}"]`);
        
        if (this.selectedActivities.includes(activity)) {
            this.selectedActivities = this.selectedActivities.filter(a => a !== activity);
            activityElement.classList.remove('selected');
        } else {
            this.selectedActivities.push(activity);
            activityElement.classList.add('selected');
        }
    }

    // Save mood entry
    saveMood() {
        if (!this.selectedMood) {
            alert('Please select a mood first!');
            return;
        }

        const notes = document.getElementById('notes').value.trim();
        const today = new Date().toISOString().split('T')[0];
        
        // Check if mood already exists for today
        const existingIndex = this.moodData.findIndex(entry => entry.date === today);
        
        const moodEntry = {
            date: today,
            mood: this.selectedMood,
            activities: this.selectedActivities,
            notes: notes,
            timestamp: new Date().toISOString()
        };

        if (existingIndex !== -1) {
            // Update existing entry
            this.moodData[existingIndex] = moodEntry;
        } else {
            // Add new entry
            this.moodData.unshift(moodEntry);
        }

        // Save to localStorage
        this.saveMoodData();
        
        // Update UI
        this.updateStatistics();
        this.renderHistory();
        this.renderChart();
        
        // Show success modal
        this.showSuccessModal();
        
        // Reset form
        this.resetForm();
    }

    // Reset form
    resetForm() {
        this.selectedMood = null;
        this.selectedActivities = [];
        
        document.querySelectorAll('.mood-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        document.querySelectorAll('.activity-item').forEach(item => {
            item.classList.remove('selected');
        });
        
        document.getElementById('notes').value = '';
        document.getElementById('detailsSection').style.display = 'none';
    }

    // Show success modal
    showSuccessModal() {
        const modal = document.getElementById('successModal');
        modal.style.display = 'block';
        
        setTimeout(() => {
            modal.style.display = 'none';
        }, 2000);
    }

    // Close success modal
    closeSuccessModal() {
        document.getElementById('successModal').style.display = 'none';
    }

    // Update statistics
    updateStatistics() {
        const totalDays = this.moodData.length;
        const avgMood = this.calculateAverageMood();
        const streak = this.calculateStreak();
        const bestMood = this.getBestMood();

        document.getElementById('totalDays').textContent = totalDays;
        document.getElementById('avgMood').textContent = avgMood;
        document.getElementById('streak').textContent = streak;
        document.getElementById('bestMood').textContent = bestMood;
    }

    // Calculate average mood
    calculateAverageMood() {
        if (this.moodData.length === 0) return '-';
        
        const moodValues = {
            'excellent': 5,
            'good': 4,
            'okay': 3,
            'bad': 2,
            'terrible': 1
        };

        const total = this.moodData.reduce((sum, entry) => {
            return sum + moodValues[entry.mood];
        }, 0);

        const average = total / this.moodData.length;
        
        // Convert to mood label
        if (average >= 4.5) return 'Excellent';
        if (average >= 3.5) return 'Good';
        if (average >= 2.5) return 'Okay';
        if (average >= 1.5) return 'Bad';
        return 'Terrible';
    }

    // Calculate streak
    calculateStreak() {
        if (this.moodData.length === 0) return 0;
        
        const today = new Date();
        let streak = 0;
        let currentDate = new Date(today);
        
        while (true) {
            const dateString = currentDate.toISOString().split('T')[0];
            const hasEntry = this.moodData.some(entry => entry.date === dateString);
            
            if (hasEntry) {
                streak++;
                currentDate.setDate(currentDate.getDate() - 1);
            } else {
                break;
            }
        }
        
        return streak;
    }

    // Get best mood
    getBestMood() {
        if (this.moodData.length === 0) return '-';
        
        const moodValues = {
            'excellent': 5,
            'good': 4,
            'okay': 3,
            'bad': 2,
            'terrible': 1
        };

        const bestEntry = this.moodData.reduce((best, current) => {
            return moodValues[current.mood] > moodValues[best.mood] ? current : best;
        });

        return bestEntry.mood.charAt(0).toUpperCase() + bestEntry.mood.slice(1);
    }

    // Render mood history
    renderHistory() {
        const container = document.getElementById('historyContainer');
        
        if (this.moodData.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-calendar-plus"></i>
                    <h3>No mood entries yet</h3>
                    <p>Start tracking your mood to see your history here!</p>
                </div>
            `;
            return;
        }

        const moodEmojis = {
            'excellent': '😊',
            'good': '🙂',
            'okay': '😐',
            'bad': '😔',
            'terrible': '😢'
        };

        container.innerHTML = this.moodData.slice(0, 10).map(entry => `
            <div class="history-item">
                <div class="history-emoji">${moodEmojis[entry.mood]}</div>
                <div class="history-content">
                    <div class="history-date">${this.formatDate(entry.date)}</div>
                    <div class="history-mood">${entry.mood.charAt(0).toUpperCase() + entry.mood.slice(1)}</div>
                    ${entry.notes ? `<div class="history-notes">${entry.notes}</div>` : ''}
                </div>
            </div>
        `).join('');
    }

    // Render mood chart
    renderChart() {
        const canvas = document.getElementById('moodChart');
        const ctx = canvas.getContext('2d');
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (this.moodData.length === 0) {
            ctx.fillStyle = '#666';
            ctx.font = '16px Poppins';
            ctx.textAlign = 'center';
            ctx.fillText('No data to display', canvas.width / 2, canvas.height / 2);
            return;
        }

        // Get last 7 days of data
        const last7Days = this.moodData.slice(0, 7).reverse();
        const moodValues = {
            'excellent': 5,
            'good': 4,
            'okay': 3,
            'bad': 2,
            'terrible': 1
        };

        // Chart dimensions
        const padding = 40;
        const chartWidth = canvas.width - 2 * padding;
        const chartHeight = canvas.height - 2 * padding;
        const barWidth = chartWidth / last7Days.length;

        // Draw bars
        last7Days.forEach((entry, index) => {
            const value = moodValues[entry.mood];
            const barHeight = (value / 5) * chartHeight;
            const x = padding + index * barWidth;
            const y = canvas.height - padding - barHeight;

            // Bar color based on mood
            const colors = {
                'excellent': '#4CAF50',
                'good': '#8BC34A',
                'okay': '#FFC107',
                'bad': '#FF9800',
                'terrible': '#F44336'
            };

            ctx.fillStyle = colors[entry.mood];
            ctx.fillRect(x + 5, y, barWidth - 10, barHeight);

            // Draw date label
            ctx.fillStyle = '#333';
            ctx.font = '12px Poppins';
            ctx.textAlign = 'center';
            ctx.fillText(this.formatShortDate(entry.date), x + barWidth / 2, canvas.height - 10);
        });

        // Draw axis
        ctx.strokeStyle = '#ccc';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, canvas.height - padding);
        ctx.lineTo(canvas.width - padding, canvas.height - padding);
        ctx.stroke();
    }

    // Format date
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    }

    // Format short date
    formatShortDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
        });
    }

    // Check if mood already exists for today
    checkTodayMood() {
        const today = new Date().toISOString().split('T')[0];
        const todayEntry = this.moodData.find(entry => entry.date === today);
        
        if (todayEntry) {
            // Show today's mood as selected
            this.selectMood(todayEntry.mood);
            
            // Show activities
            todayEntry.activities.forEach(activity => {
                const activityElement = document.querySelector(`[data-activity="${activity}"]`);
                if (activityElement) {
                    activityElement.classList.add('selected');
                }
            });
            
            // Show notes
            if (todayEntry.notes) {
                document.getElementById('notes').value = todayEntry.notes;
            }
        }
    }

    // Export data
    exportData() {
        const dataStr = JSON.stringify(this.moodData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `mood-tracker-data-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
    }

    // Import data
    importData() {
        document.getElementById('importFile').click();
    }

    // Handle import file
    handleImportFile(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                if (Array.isArray(importedData)) {
                    this.moodData = importedData;
                    this.saveMoodData();
                    this.updateStatistics();
                    this.renderHistory();
                    this.renderChart();
                    alert('Data imported successfully!');
                } else {
                    alert('Invalid data format!');
                }
            } catch (error) {
                alert('Error importing data: ' + error.message);
            }
        };
        reader.readAsText(file);
        
        // Reset file input
        event.target.value = '';
    }

    // Load mood data from localStorage
    loadMoodData() {
        const saved = localStorage.getItem('moodTrackerData');
        return saved ? JSON.parse(saved) : [];
    }

    // Save mood data to localStorage
    saveMoodData() {
        localStorage.setItem('moodTrackerData', JSON.stringify(this.moodData));
    }
}

// Global functions for HTML onclick handlers
let moodTracker;

function selectMood(mood) {
    moodTracker.selectMood(mood);
}

function saveMood() {
    moodTracker.saveMood();
}

function closeSuccessModal() {
    moodTracker.closeSuccessModal();
}

function exportData() {
    moodTracker.exportData();
}

function importData() {
    moodTracker.importData();
}

function handleImportFile(event) {
    moodTracker.handleImportFile(event);
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    moodTracker = new MoodTracker();
}); 