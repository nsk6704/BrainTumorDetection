const API_BASE = 'https://braintumordetection-4006.onrender.com';

// Navigation
const navItems = document.querySelectorAll('.nav-item');
const sections = document.querySelectorAll('.section');

navItems.forEach(item => {
    item.addEventListener('click', () => {
        const target = item.getAttribute('data-target');

        navItems.forEach(i => i.classList.remove('active'));
        sections.forEach(s => s.classList.remove('active'));

        item.classList.add('active');
        document.getElementById(target).classList.add('active');

        if (target === 'history') loadStats();
        if (target === 'info') loadModelInfo();
    });
});

// File Upload & Prediction
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const previewArea = document.getElementById('previewArea');
const resultArea = document.getElementById('resultArea');
const resultPlaceholder = document.getElementById('resultPlaceholder');
const loader = document.getElementById('loader');

dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
});

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) handleFileUpload(file);
});

async function handleFileUpload(file) {
    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
        document.getElementById('imagePreview').src = e.target.result;
        previewArea.classList.remove('hidden');
    };
    reader.readAsDataURL(file);

    // Predict
    loader.style.display = 'flex';
    resultArea.classList.add('hidden');
    resultPlaceholder.classList.remove('hidden');

    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch(`${API_BASE}/predict`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.detail || 'Analysis failed on server');
        }

        const data = await response.json();
        displayResult(data);
    } catch (err) {
        console.error('Prediction error:', err);
        resultPlaceholder.innerHTML = `<div class="text-rose-500 font-bold">⚠️ ${err.message}</div>`;
    } finally {
        loader.style.display = 'none';
    }
}

function displayResult(data) {
    resultPlaceholder.classList.add('hidden');
    resultArea.classList.remove('hidden');

    const resTitle = document.getElementById('resTitle');
    const resConf = document.getElementById('resConfidence');
    const resultCard = resultArea.closest('.card');

    resTitle.innerText = data.prediction;
    resConf.innerText = `Confidence: ${data.confidence}%`;

    // Dynamic Styling
    if (data.prediction.toLowerCase().includes('no tumour')) {
        resultCard.style.borderColor = 'var(--success)';
        resTitle.style.color = 'var(--success)';
    } else {
        resultCard.style.borderColor = 'var(--danger)';
        resTitle.style.color = 'var(--danger)';
    }

    const labels = ['Glioma', 'Meningioma', 'Normal', 'Pituitary'];

    // Update Bars
    const barsContainer = document.getElementById('scoreBars');
    barsContainer.innerHTML = '';
    data.all_scores.forEach((score, i) => {
        const percentage = (score * 100).toFixed(1);
        const barHtml = `
            <div class="space-y-1">
                <div class="flex justify-between text-xs">
                    <span>${labels[i]}</span>
                    <span>${percentage}%</span>
                </div>
                <div class="w-full bg-slate-800 rounded-full h-1.5">
                    <div class="bg-indigo-500 h-1.5 rounded-full" style="width: ${percentage}%"></div>
                </div>
            </div>
        `;
        barsContainer.innerHTML += barHtml;
    });

    // Update Radar Chart
    if (predictionRadarChart) predictionRadarChart.destroy();
    const ctx = document.getElementById('radarChart').getContext('2d');
    predictionRadarChart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Probability',
                data: data.all_scores,
                fill: true,
                backgroundColor: 'rgba(79, 70, 229, 0.2)',
                borderColor: 'rgb(79, 70, 229)',
                pointBackgroundColor: 'rgb(79, 70, 229)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgb(79, 70, 229)'
            }]
        },
        options: {
            elements: { line: { borderWidth: 3 } },
            plugins: { legend: { display: false } },
            scales: {
                r: {
                    angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' },
                    pointLabels: { color: '#94a3b8' },
                    ticks: { display: false }
                }
            }
        }
    });
}

// Training Stats
let chartsCreated = false;
async function loadStats() {
    if (chartsCreated) return;

    try {
        const response = await fetch(`${API_BASE}/stats`);
        const data = await response.json();
        const history = data.history;
        const summary = data.summary;

        // Update Summary Bar
        document.getElementById('statMaxAcc').innerText = summary.max_accuracy + '%';
        document.getElementById('statValAcc').innerText = summary.max_val_accuracy + '%';
        document.getElementById('statLoss').innerText = summary.final_loss;
        document.getElementById('statEpochs').innerText = summary.epochs;

        const labels = Array.from({ length: history.accuracy.length }, (_, i) => i + 1);

        new Chart(document.getElementById('accuracyChart'), {
            type: 'line',
            data: {
                labels,
                datasets: [
                    { label: 'Training', data: history.accuracy, borderColor: '#4f46e5', tension: 0.3 },
                    { label: 'Validation', data: history.val_accuracy, borderColor: '#10b981', tension: 0.3 }
                ]
            },
            options: { responsive: true, plugins: { legend: { labels: { color: '#94a3b8' } } } }
        });

        new Chart(document.getElementById('lossChart'), {
            type: 'line',
            data: {
                labels,
                datasets: [
                    { label: 'Training', data: history.loss, borderColor: '#ef4444', tension: 0.3 },
                    { label: 'Validation', data: history.val_loss, borderColor: '#f59e0b', tension: 0.3 }
                ]
            },
            options: { responsive: true, plugins: { legend: { labels: { color: '#94a3b8' } } } }
        });

        chartsCreated = true;
    } catch (err) {
        console.error('Error loading stats:', err);
    }
}

// Model Info
async function loadModelInfo() {
    try {
        const response = await fetch(`${API_BASE}/model-info`);
        const info = await response.json();

        document.getElementById('modelName').innerText = info.name;
        document.getElementById('modelType').innerText = info.type;
        document.getElementById('modelDesc').innerText = info.description;
        document.getElementById('totalParams').innerText = info.params;

        const statsContainer = document.getElementById('modelStats');
        statsContainer.innerHTML = '';

        if (info.stats && info.stats.length > 0) {
            info.stats.forEach(stat => {
                const cardHtml = `
                    <div class="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
                        <p class="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">${stat.label}</p>
                        <h5 class="text-xl font-black text-indigo-400">${stat.value}</h5>
                    </div>
                `;
                statsContainer.innerHTML += cardHtml;
            });
        }
    } catch (err) {
        console.error('Error loading model info:', err);
        document.getElementById('modelDesc').innerText = "Failed to load model architecture summary.";
    }
}
