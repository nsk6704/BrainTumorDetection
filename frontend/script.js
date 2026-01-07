const API_BASE = 'https://braintumordetection-4006.onrender.com';

// ========== GLOBAL STATE ==========
let currentScanContext = null; // Stores current scan result for chatbot context
let chatSessionId = null; // Session ID for conversation continuity
let predictionRadarChart = null; // Chart instance

// ========== NAVIGATION ==========
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
        if (target === 'education') loadEducationalContent();
    });
});

// ========== FILE UPLOAD & PREDICTION ==========
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

        // Store context for chatbot
        currentScanContext = data;
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

// ========== TRAINING STATS ==========
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

// ========== MODEL INFO ==========
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

// ========== CHATBOT FUNCTIONALITY ==========
const chatToggle = document.getElementById('chatToggle');
const chatWindow = document.getElementById('chatWindow');
const chatInput = document.getElementById('chatInput');
const chatSend = document.getElementById('chatSend');
const chatMessages = document.getElementById('chatMessages');
const suggestedQuestions = document.getElementById('suggestedQuestions');
const askAboutResultBtn = document.getElementById('askAboutResult');

// Toggle chat window
chatToggle.addEventListener('click', () => {
    chatWindow.classList.toggle('hidden');
    const chatIcon = chatToggle.querySelector('.chat-icon');
    const closeIcon = chatToggle.querySelector('.close-icon');
    chatIcon.classList.toggle('hidden');
    closeIcon.classList.toggle('hidden');

    if (!chatWindow.classList.contains('hidden')) {
        chatInput.focus();
    }
});

// Send message on button click
chatSend.addEventListener('click', () => sendMessage());

// Send message on Enter key
chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

// Ask about result button
askAboutResultBtn.addEventListener('click', () => {
    if (currentScanContext) {
        chatWindow.classList.remove('hidden');
        chatToggle.querySelector('.chat-icon').classList.add('hidden');
        chatToggle.querySelector('.close-icon').classList.remove('hidden');
        sendMessage('Explain my scan results in simple terms', true);
    }
});

async function sendMessage(customMessage = null, includeContext = false) {
    const message = customMessage || chatInput.value.trim();
    if (!message) return;

    // Clear input
    if (!customMessage) chatInput.value = '';

    // Add user message to chat
    addMessageToChat(message, 'user');

    // Show typing indicator
    const typingIndicator = addTypingIndicator();

    try {
        const requestBody = {
            message: message,
            session_id: chatSessionId
        };

        // Include context if available and requested
        if (includeContext && currentScanContext) {
            requestBody.context = currentScanContext;
        }

        const response = await fetch(`${API_BASE}/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error('Failed to get response from chatbot');
        }

        const data = await response.json();

        // Store session ID
        chatSessionId = data.session_id;

        // Remove typing indicator
        typingIndicator.remove();

        // Add bot response
        addMessageToChat(data.response, 'bot');

        // Update suggested questions
        updateSuggestedQuestions(data.suggested_questions);

    } catch (err) {
        console.error('Chat error:', err);
        typingIndicator.remove();
        addMessageToChat('Sorry, I encountered an error. Please try again.', 'bot');
    }
}

function addMessageToChat(content, role) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}-message`;

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.innerText = content;

    messageDiv.appendChild(contentDiv);
    chatMessages.appendChild(messageDiv);

    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function addTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot-message';
    typingDiv.innerHTML = `
        <div class="typing-indicator">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        </div>
    `;
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return typingDiv;
}

function updateSuggestedQuestions(questions) {
    suggestedQuestions.innerHTML = '';
    questions.forEach(q => {
        const chip = document.createElement('div');
        chip.className = 'suggestion-chip';
        chip.innerText = q;
        chip.addEventListener('click', () => {
            sendMessage(q, q.toLowerCase().includes('result'));
        });
        suggestedQuestions.appendChild(chip);
    });
}

// ========== EDUCATIONAL RESOURCES ==========
let educationalData = null;

async function loadEducationalContent() {
    if (educationalData) {
        renderEducationalContent();
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/educational-content`);
        educationalData = await response.json();
        renderEducationalContent();
    } catch (err) {
        console.error('Error loading educational content:', err);
    }
}

function renderEducationalContent() {
    const tumorCards = document.getElementById('tumorCards');
    const faqAccordion = document.getElementById('faqAccordion');

    // Render tumor cards
    tumorCards.innerHTML = '';
    const tumorTypes = educationalData.tumor_types;

    Object.keys(tumorTypes).forEach(key => {
        const tumor = tumorTypes[key];
        const cardHtml = `
            <div class="tumor-card" style="--tumor-color: ${tumor.color}" data-tumor="${key}">
                <div class="tumor-icon" style="background: ${tumor.color}20; color: ${tumor.color}">
                    ${getTumorIcon(key)}
                </div>
                <h3 class="text-xl font-bold mb-2">${tumor.name}</h3>
                <p class="text-slate-400 text-sm mb-4">${tumor.short_description}</p>
                <div class="tumor-stats">
                    <div class="tumor-stat">
                        <div class="tumor-stat-label">Prevalence</div>
                        <div class="tumor-stat-value">${tumor.prevalence}</div>
                    </div>
                    <div class="tumor-stat">
                        <div class="tumor-stat-label">Typical Age</div>
                        <div class="tumor-stat-value">${tumor.typical_age}</div>
                    </div>
                    <div class="tumor-stat">
                        <div class="tumor-stat-label">Severity</div>
                        <div class="tumor-stat-value">${tumor.severity}</div>
                    </div>
                </div>
                <button class="btn mt-4 w-full text-sm">Learn More</button>
            </div>
        `;
        tumorCards.innerHTML += cardHtml;
    });

    // Add click listeners to tumor cards
    document.querySelectorAll('.tumor-card').forEach(card => {
        card.addEventListener('click', () => {
            const tumorType = card.getAttribute('data-tumor');
            openTumorModal(tumorType);
        });
    });

    // Render FAQs
    faqAccordion.innerHTML = '';
    educationalData.faqs.forEach((faq, index) => {
        const faqHtml = `
            <div class="faq-item" data-faq="${index}">
                <div class="faq-question">
                    <span>${faq.question}</span>
                    <svg class="faq-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                </div>
                <div class="faq-answer">
                    <p>${faq.answer}</p>
                </div>
            </div>
        `;
        faqAccordion.innerHTML += faqHtml;
    });

    // Add click listeners to FAQs
    document.querySelectorAll('.faq-question').forEach(question => {
        question.addEventListener('click', () => {
            const faqItem = question.parentElement;
            faqItem.classList.toggle('active');
        });
    });
}

function getTumorIcon(type) {
    const icons = {
        'glioma': '🧠',
        'meningioma': '🔬',
        'pituitary': '⚡',
        'normal': '✅'
    };
    return icons[type] || '🏥';
}

// ========== TUMOR DETAIL MODAL ==========
const tumorModal = document.getElementById('tumorModal');
const modalClose = document.getElementById('modalClose');
const modalBody = document.getElementById('modalBody');

modalClose.addEventListener('click', () => {
    tumorModal.classList.add('hidden');
});

tumorModal.addEventListener('click', (e) => {
    if (e.target === tumorModal) {
        tumorModal.classList.add('hidden');
    }
});

function openTumorModal(tumorType) {
    const tumor = educationalData.tumor_types[tumorType];

    let modalContent = `
        <h2 class="text-3xl font-bold mb-4" style="color: ${tumor.color}">${tumor.name}</h2>
        <p class="text-slate-300 text-lg mb-6">${tumor.description}</p>
    `;

    if (tumor.types && tumor.types.length > 0) {
        modalContent += `
            <h3 class="text-xl font-bold mb-3 text-indigo-400">Types</h3>
            <ul class="list-disc list-inside mb-6 text-slate-300 space-y-1">
                ${tumor.types.map(t => `<li>${t}</li>`).join('')}
            </ul>
        `;
    }

    if (tumor.symptoms && tumor.symptoms.length > 0) {
        modalContent += `
            <h3 class="text-xl font-bold mb-3 text-indigo-400">Symptoms</h3>
            <ul class="list-disc list-inside mb-6 text-slate-300 space-y-1">
                ${tumor.symptoms.map(s => `<li>${s}</li>`).join('')}
            </ul>
        `;
    }

    if (tumor.risk_factors && tumor.risk_factors.length > 0) {
        modalContent += `
            <h3 class="text-xl font-bold mb-3 text-indigo-400">Risk Factors</h3>
            <ul class="list-disc list-inside mb-6 text-slate-300 space-y-1">
                ${tumor.risk_factors.map(r => `<li>${r}</li>`).join('')}
            </ul>
        `;
    }

    if (tumor.treatment_options && tumor.treatment_options.length > 0) {
        modalContent += `
            <h3 class="text-xl font-bold mb-3 text-indigo-400">Treatment Options</h3>
            <ul class="list-disc list-inside mb-6 text-slate-300 space-y-1">
                ${tumor.treatment_options.map(t => `<li>${t}</li>`).join('')}
            </ul>
        `;
    }

    if (tumor.prognosis) {
        modalContent += `
            <h3 class="text-xl font-bold mb-3 text-indigo-400">Prognosis</h3>
            <p class="text-slate-300 mb-6">${tumor.prognosis}</p>
        `;
    }

    modalContent += `
        <div class="mt-8 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <p class="text-sm text-yellow-200">
                ⚕️ <strong>Medical Disclaimer:</strong> This information is for educational purposes only. 
                Always consult qualified healthcare professionals for medical diagnosis and treatment.
            </p>
        </div>
    `;

    modalBody.innerHTML = modalContent;
    tumorModal.classList.remove('hidden');
}
