document.addEventListener('DOMContentLoaded', function() {
    
    // --- 1. Word Cloud Chart ---
    const wcCanvas = document.getElementById('wordCloudChart');
    if (wcCanvas && typeof Chart !== 'undefined') {
        const words = [
            { key: 'নদী (River)', value: 85 },
            { key: 'মাটি (Earth)', value: 72 },
            { key: 'মানুষ (People)', value: 95 },
            { key: 'বৃষ্টি (Rain)', value: 45 },
            { key: 'প্রেম (Love)', value: 110 },
            { key: 'বিরহ (Separation)', value: 80 },
            { key: 'প্রকৃতি (Nature)', value: 65 },
            { key: 'গ্রাম (Village)', value: 90 },
            { key: 'কৃষক (Farmer)', value: 55 },
            { key: 'আকাশ (Sky)', value: 40 },
            { key: 'ধর্ম (Religion)', value: 60 },
            { key: 'সমাজ (Society)', value: 75 }
        ];

        new Chart(wcCanvas, {
            type: 'wordCloud',
            data: {
                labels: words.map(w => w.key),
                datasets: [{
                    label: 'Frequency',
                    data: words.map(w => w.value),
                    color: function(context) {
                        // Use brand colors
                        const colors = ['#3b82f6', '#8b5cf6', '#0ea5e9', '#6366f1'];
                        return colors[context.dataIndex % colors.length];
                    }
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        titleFont: { family: "'Inter', sans-serif", size: 14 },
                        bodyFont: { family: "'Inter', sans-serif", size: 13 },
                        padding: 10,
                        cornerRadius: 8,
                        displayColors: false
                    }
                },
                font: {
                    family: "'Inter', sans-serif"
                }
            }
        });
    }

    // --- 2. Timeline Bar Chart ---
    const tlCanvas = document.getElementById('timelineChart');
    if (tlCanvas && typeof Chart !== 'undefined') {
        
        // Setup gradient for the bars
        const ctx = tlCanvas.getContext('2d');
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, 'rgba(59, 130, 246, 0.8)'); // Primary blue
        gradient.addColorStop(1, 'rgba(139, 92, 246, 0.8)'); // Secondary purple

        new Chart(tlCanvas, {
            type: 'bar',
            data: {
                labels: ['1800-1850', '1851-1900', '1901-1950', '1951-2000', '2001-2020'],
                datasets: [{
                    label: 'Digitized Texts',
                    data: [15, 45, 120, 350, 670],
                    backgroundColor: gradient,
                    borderRadius: 6,
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        titleFont: { family: "'Inter', sans-serif", size: 14 },
                        bodyFont: { family: "'Inter', sans-serif", size: 13 },
                        padding: 10,
                        cornerRadius: 8,
                        displayColors: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(148, 163, 184, 0.1)',
                            drawBorder: false,
                        },
                        ticks: {
                            color: '#94a3b8',
                            font: { family: "'Inter', sans-serif" }
                        }
                    },
                    x: {
                        grid: {
                            display: false,
                            drawBorder: false,
                        },
                        ticks: {
                            color: '#94a3b8',
                            font: { family: "'Inter', sans-serif" }
                        }
                    }
                }
            }
        });
    }
});
