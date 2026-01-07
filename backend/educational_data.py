"""
Educational content database for brain tumor information.
Provides structured data about different tumor types, symptoms, treatments, and FAQs.
"""

TUMOR_INFO = {
    "glioma": {
        "name": "Glioma Tumour",
        "short_description": "A tumor that starts in the glial cells of the brain or spine",
        "description": "Gliomas are tumors that originate from glial cells, which support and protect neurons in the brain and spinal cord. They are the most common type of primary brain tumor in adults and can vary significantly in their growth rate and severity.",
        "types": [
            "Astrocytoma (from astrocytes)",
            "Oligodendroglioma (from oligodendrocytes)",
            "Ependymoma (from ependymal cells)",
            "Mixed Glioma (combination of cell types)"
        ],
        "symptoms": [
            "Persistent headaches, especially in the morning",
            "Seizures or convulsions",
            "Nausea and vomiting",
            "Vision problems or blurred vision",
            "Difficulty with balance and coordination",
            "Personality or behavior changes",
            "Memory problems or confusion",
            "Speech difficulties"
        ],
        "risk_factors": [
            "Exposure to ionizing radiation",
            "Family history of gliomas (rare)",
            "Certain genetic disorders (e.g., neurofibromatosis)",
            "Age (more common in adults 45-65)"
        ],
        "treatment_options": [
            "Surgery to remove as much tumor as possible",
            "Radiation therapy to target remaining cancer cells",
            "Chemotherapy (e.g., temozolomide)",
            "Targeted drug therapy",
            "Tumor treating fields (TTF) therapy",
            "Clinical trials for advanced treatments"
        ],
        "prognosis": "Prognosis varies widely depending on the grade (I-IV), location, and patient age. Low-grade gliomas may be slow-growing, while high-grade gliomas (like glioblastoma) are more aggressive.",
        "prevalence": "~6 per 100,000 people annually",
        "typical_age": "45-65 years",
        "severity": "Varies (Grade I-IV)",
        "color": "#ef4444"
    },
    "meningioma": {
        "name": "Meningioma Tumour",
        "short_description": "A tumor that forms in the meninges, the protective membranes around the brain and spinal cord",
        "description": "Meningiomas are typically slow-growing tumors that develop from the meninges, the layers of tissue covering the brain and spinal cord. Most meningiomas are benign (non-cancerous), though some can be atypical or malignant.",
        "types": [
            "Benign Meningioma (Grade I) - 80-85% of cases",
            "Atypical Meningioma (Grade II) - 15-20% of cases",
            "Malignant/Anaplastic Meningioma (Grade III) - 1-3% of cases"
        ],
        "symptoms": [
            "Headaches that worsen over time",
            "Vision changes or double vision",
            "Hearing loss or ringing in ears",
            "Seizures",
            "Weakness in arms or legs",
            "Memory loss or confusion",
            "Loss of smell",
            "Often asymptomatic (discovered incidentally)"
        ],
        "risk_factors": [
            "Female gender (twice as common in women)",
            "Age (more common after age 60)",
            "Radiation exposure to the head",
            "Neurofibromatosis type 2 (genetic disorder)",
            "Hormone replacement therapy (possible link)"
        ],
        "treatment_options": [
            "Observation with regular monitoring (if small and asymptomatic)",
            "Surgical removal (most common treatment)",
            "Radiation therapy (stereotactic radiosurgery)",
            "Conventional radiation for larger tumors",
            "Chemotherapy (rarely used, mainly for malignant types)"
        ],
        "prognosis": "Generally excellent for benign meningiomas. Most patients have a normal life expectancy after treatment. Recurrence rates are low (5-15% for benign types).",
        "prevalence": "~8 per 100,000 people annually",
        "typical_age": "60+ years",
        "severity": "Usually benign (Grade I)",
        "color": "#f59e0b"
    },
    "pituitary": {
        "name": "Pituitary Tumour",
        "short_description": "A tumor in the pituitary gland, which controls hormone production",
        "description": "Pituitary tumors (adenomas) are abnormal growths in the pituitary gland, a pea-sized organ at the base of the brain. Most are benign and can affect hormone levels, leading to various symptoms. They're classified as functioning (hormone-producing) or non-functioning.",
        "types": [
            "Prolactinoma (produces prolactin)",
            "Growth hormone-secreting adenoma (causes acromegaly)",
            "ACTH-secreting adenoma (causes Cushing's disease)",
            "TSH-secreting adenoma (rare)",
            "Non-functioning adenoma (doesn't produce hormones)"
        ],
        "symptoms": [
            "Vision problems (especially peripheral vision loss)",
            "Headaches",
            "Hormonal imbalances (varies by type):",
            "  - Irregular menstrual periods or erectile dysfunction",
            "  - Unexplained weight gain or loss",
            "  - Excessive thirst and urination",
            "  - Fatigue and weakness",
            "  - Mood changes or depression",
            "Nausea and vomiting"
        ],
        "risk_factors": [
            "Family history of pituitary tumors (rare)",
            "Multiple endocrine neoplasia type 1 (MEN1) syndrome",
            "Carney complex (genetic disorder)",
            "Most cases have no known cause"
        ],
        "treatment_options": [
            "Medication to shrink tumor or control hormones",
            "Transsphenoidal surgery (through the nose)",
            "Radiation therapy (if surgery isn't possible)",
            "Hormone replacement therapy (if needed after treatment)",
            "Regular monitoring for small, non-functioning tumors"
        ],
        "prognosis": "Excellent for most pituitary tumors. Many can be successfully treated with medication or surgery. Recurrence is possible but often manageable.",
        "prevalence": "~4 per 100,000 people annually",
        "typical_age": "30-50 years",
        "severity": "Usually benign",
        "color": "#8b5cf6"
    },
    "normal": {
        "name": "No Tumour Detected",
        "short_description": "The scan shows no signs of brain tumors",
        "description": "A normal brain scan indicates no detectable tumors or abnormal growths. This is a positive result, but remember that AI analysis should always be confirmed by a qualified healthcare professional.",
        "types": [],
        "symptoms": [],
        "risk_factors": [],
        "treatment_options": [],
        "prognosis": "No tumor detected. Continue regular health check-ups as recommended by your healthcare provider.",
        "prevalence": "N/A",
        "typical_age": "N/A",
        "severity": "None",
        "color": "#10b981"
    }
}

FAQS = [
    {
        "question": "How accurate is AI-based brain tumor detection?",
        "answer": "AI models like ours can achieve 85-95% accuracy on test datasets. However, accuracy varies based on image quality, tumor type, and size. AI is a powerful screening tool but should NEVER replace professional medical diagnosis. Always consult a radiologist or neurologist for definitive diagnosis."
    },
    {
        "question": "What should I do if a tumor is detected?",
        "answer": "First, don't panic. This AI tool is for educational purposes only. If you have actual MRI scans showing concerning results, you should: 1) Consult a neurologist or neurosurgeon immediately, 2) Get a professional radiologist's interpretation, 3) Discuss treatment options with your healthcare team, 4) Seek a second opinion if needed. Early detection often leads to better outcomes."
    },
    {
        "question": "Can this AI replace a doctor's diagnosis?",
        "answer": "Absolutely not. This tool is designed for educational purposes and to demonstrate AI capabilities in medical imaging. Only qualified healthcare professionals (radiologists, neurologists, neurosurgeons) can provide accurate diagnoses and treatment plans. AI should be used as a supplementary tool to assist doctors, not replace them."
    },
    {
        "question": "What's the difference between the tumor types?",
        "answer": "The main differences are: **Glioma** - Originates from glial cells within the brain tissue itself, can be aggressive. **Meningioma** - Grows from the protective membranes (meninges) around the brain, usually benign and slow-growing. **Pituitary** - Develops in the pituitary gland, often affects hormones, usually benign. Each has different symptoms, treatments, and prognoses."
    },
    {
        "question": "How was this AI model trained?",
        "answer": "Our model is a Convolutional Neural Network (CNN) trained on thousands of labeled MRI brain scans. The training dataset includes images of Glioma, Meningioma, Pituitary tumors, and normal brains. The model learns to identify patterns and features that distinguish each tumor type through supervised learning over multiple epochs."
    },
    {
        "question": "What does the confidence score mean?",
        "answer": "The confidence score (e.g., 87%) represents how certain the AI model is about its prediction. Higher confidence generally indicates clearer features matching a specific tumor type. However, even high confidence doesn't guarantee correctness - image quality, tumor stage, and other factors can affect accuracy. Low confidence (<70%) suggests the model is uncertain and professional review is especially important."
    },
    {
        "question": "Are brain tumors always cancerous?",
        "answer": "No! Many brain tumors are benign (non-cancerous). For example, most meningiomas and pituitary adenomas are benign. Even some gliomas can be low-grade and slow-growing. 'Benign' means the tumor doesn't spread to other parts of the body, but it can still cause problems due to pressure on the brain. Treatment depends on location, size, and symptoms."
    },
    {
        "question": "What are the early warning signs of brain tumors?",
        "answer": "Common early signs include: persistent headaches (especially morning headaches), seizures in someone with no history, vision or hearing changes, balance problems, personality changes, memory issues, and nausea/vomiting. However, many of these symptoms can be caused by other conditions. If you experience persistent concerning symptoms, consult a doctor."
    }
]

def get_tumor_info(tumor_type: str):
    """Get detailed information about a specific tumor type."""
    tumor_key = tumor_type.lower().replace(" tumour", "").replace(" tumor", "")
    if tumor_key == "no":
        tumor_key = "normal"
    return TUMOR_INFO.get(tumor_key, None)

def get_all_tumor_info():
    """Get information about all tumor types."""
    return TUMOR_INFO

def get_faqs():
    """Get all frequently asked questions."""
    return FAQS
