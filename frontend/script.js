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
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch(`${API_BASE}/predict`, {
            method: 'POST',
            body: formData
        });
        const data = await response.json();
        displayResult(data);
    } catch (err) {
        console.error('Prediction error:', err);
        alert('Error connecting to the analysis server.');
    } finally {
        loader.style.display = 'none';
    }
}

function displayResult(data) {
    resultPlaceholder.classList.add('hidden');
    resultArea.classList.remove('hidden');

    document.getElementById('resTitle').innerText = data.prediction;
    document.getElementById('resConfidence').innerText = `Confidence: ${data.confidence}%`;

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
        console.log('Model info received:', info);

        const tableBody = document.getElementById('layerInfo');
        tableBody.innerHTML = '';

        if (info.layers && info.layers.length > 0) {
            info.layers.forEach(layer => {
                const row = `
                    <tr class="border-b border-slate-800 hover:bg-white/5 transition">
                        <td class="py-4 px-4 font-mono text-xs text-indigo-400 font-bold">${layer.type}</td>
                        <td class="py-4 px-4 text-slate-300 text-sm font-mono">${layer.output_shape}</td>
                        <td class="py-4 px-4 text-slate-500 text-xs">${layer.trainable ? 'Trainable' : 'Frozen'}</td>
                    </tr>
                `;
                tableBody.innerHTML += row;
            });
            document.getElementById('modelName').innerText = info.name + ` (${info.total_params.toLocaleString()} params)`;
        } else {
            tableBody.innerHTML = '<tr><td colspan="3" class="p-10 text-center text-slate-500">Model layers could not be loaded. Please check backend logs.</td></tr>';
        }
    } catch (err) {
        console.error('Error loading model info:', err);
    }
}
