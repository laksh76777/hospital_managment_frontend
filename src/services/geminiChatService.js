// Gemini AI Chat Service for Patient Portal
// Supports multi-turn clinical symptom interrogation, medicine inquiry with side effects & usage,
// and registered hospital faculty doctor recommendations.

const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// Comprehensive Clinical Medicine Database for high-precision medicine inquiries & safety guidance
const MEDICINE_DATABASE = [
  {
    names: ['paracetamol', 'crocin', 'dolo', 'dolo 650', 'calpol', 'pcm', 'acetaminophen'],
    genericName: 'Paracetamol (Acetaminophen)',
    category: 'Analgesic & Antipyretic (Pain & Fever Reliever)',
    primaryUses: 'Relief of mild-to-moderate fever, headache, body ache, sore throat, and muscle aches caused by cold, viral infections, or flu.',
    whenToUse: 'Usually taken every 6 to 8 hours after food as directed by a physician. Maximum adult dose should not exceed 3,000mg to 4,000mg in 24 hours.',
    commonSideEffects: [
      'Nausea or mild stomach discomfort',
      'Sweating as fever breaks',
      'Rare allergic skin rash',
    ],
    seriousRisks: 'Overdosing or prolonged unmonitored use can cause severe liver damage (hepatotoxicity), especially if taken with alcohol.',
    precautions: 'Do not combine with multiple cold/cough formulations that also contain paracetamol. Patients with liver or kidney disorders must use extreme caution.',
  },
  {
    names: ['cetirizine', 'cetzine', 'okacet', 'zyrtec', 'levocetirizine', 'allegra', 'fexofenadine'],
    genericName: 'Cetirizine / Levocetirizine (Antihistamine)',
    category: 'Second-Generation Antihistamine',
    primaryUses: 'Relief of allergic symptoms such as runny nose, sneezing, itchy/watery eyes, allergic skin rash (urticaria), and insect bites.',
    whenToUse: 'Typically prescribed once daily (usually at night) because it can cause mild sedation. Can be taken with or without food.',
    commonSideEffects: [
      'Drowsiness or sleepiness',
      'Dry mouth, throat, or nose',
      'Mild headache or fatigue',
      'Dizziness',
    ],
    seriousRisks: 'Severe drowsiness when combined with sedatives, sleeping aids, or alcohol.',
    precautions: 'Avoid driving, operating machinery, or performing tasks requiring keen mental focus after taking. Inform doctor if you have kidney impairment.',
  },
  {
    names: ['azithromycin', 'azithral', 'zithromax', 'aziwok'],
    genericName: 'Azithromycin (Macrolide Antibiotic)',
    category: 'Prescription Antibiotic',
    primaryUses: 'Treatment of bacterial infections of the respiratory tract (sinusitis, bacterial bronchitis, pneumonia), tonsillitis, and ear/skin infections.',
    whenToUse: 'MUST be taken strictly under medical prescription, usually once daily 1 hour before or 2 hours after meals for 3 to 5 days.',
    commonSideEffects: [
      'Nausea, diarrhea, and abdominal cramps',
      'Loss of appetite',
      'Mild headache or temporary change in taste',
    ],
    seriousRisks: 'Can cause antibiotic-associated colitis (severe diarrhea) and rare heart rhythm alterations (QT prolongation).',
    precautions: 'NEVER take for viral colds, flu, or simple viral sore throats. Incomplete courses lead to dangerous antimicrobial resistance.',
  },
  {
    names: ['ibuprofen', 'brufen', 'combiflam', 'advil', 'motrin'],
    genericName: 'Ibuprofen / Ibuprofen + Paracetamol (NSAID)',
    category: 'Non-Steroidal Anti-Inflammatory Drug (NSAID)',
    primaryUses: 'Reduces inflammation, swelling, moderate pain (joint pain, toothache, sports injury, back pain), and fever.',
    whenToUse: 'Always take with or immediately after food or milk to safeguard the gastric lining.',
    commonSideEffects: [
      'Gastric acidity, heartburn, indigestion',
      'Stomach upset or mild nausea',
      'Dizziness',
    ],
    seriousRisks: 'Long-term or high-dose use increases the risk of stomach ulcers, gastrointestinal bleeding, kidney stress, and cardiovascular issues.',
    precautions: 'Strictly avoid if you have a history of stomach ulcers, asthma sensitivity to aspirin, or advanced kidney/cardiac disease.',
  },
  {
    names: ['pantoprazole', 'pan', 'pan 40', 'pan d', 'omeprazole', 'rabeprazole', 'omez'],
    genericName: 'Pantoprazole / Proton Pump Inhibitor (PPI)',
    category: 'Antacid / Gastric Acid Suppressant',
    primaryUses: 'Treatment of gastroesophageal reflux disease (GERD), acid reflux, heartburn, peptic ulcers, and stomach irritation caused by painkillers.',
    whenToUse: 'Usually taken once daily in the morning on an EMPTY stomach, 30 to 60 minutes before breakfast.',
    commonSideEffects: [
      'Mild headache',
      'Diarrhea or mild constipation',
      'Abdominal fullness or gas',
    ],
    seriousRisks: 'Long-term chronic use without physician review may reduce vitamin B12 and calcium absorption and affect bone density.',
    precautions: 'Do not chew or crush tablets. Use for the designated course prescribed by the physician rather than indefinite self-administration.',
  },
  {
    names: ['amoxicillin', 'augmentin', 'amoxil', 'mox'],
    genericName: 'Amoxicillin / Amoxicillin + Clavulanic Acid',
    category: 'Penicillin-Class Antibiotic',
    primaryUses: 'Bacterial ear, nose, throat, chest, dental, and urinary tract infections.',
    whenToUse: 'Strict prescription medicine taken at evenly spaced intervals (every 8 or 12 hours) with food to prevent stomach upset.',
    commonSideEffects: [
      'Mild nausea or vomiting',
      'Diarrhea or loose stools',
      'Oral thrush or fungal overgrowth after prolonged course',
    ],
    seriousRisks: 'Severe, life-threatening allergic reactions (anaphylaxis) in individuals allergic to penicillin.',
    precautions: 'Inform your doctor immediately if you have any history of penicillin or cephalosporin allergies.',
  },
  {
    names: ['cough syrup', 'benadryl', 'ascoril', 'grilinctus', 'cheston cold', 'ambroxol', 'dextromethorphan'],
    genericName: 'Expectorant / Cough Suppressant Formulation',
    category: 'Respiratory Cough Formulations',
    primaryUses: 'Relief of dry irritating cough (suppressants) or loose productive chesty cough with phlegm (mucolytics/expectorants).',
    whenToUse: 'Take measured doses using the provided measuring cup as directed by a doctor or label, typically 2-3 times daily.',
    commonSideEffects: [
      'Drowsiness or dizziness',
      'Stomach upset',
      'Dry mouth',
    ],
    seriousRisks: 'Misuse of high doses containing codeine or dextromethorphan can lead to dangerous respiratory depression.',
    precautions: 'Dry cough and wet productive cough require completely different medicinal agents. Consult a doctor before giving to children under 6 years.',
  },
];

// Helper: Match symptoms to medical specialties
const SPECIALTY_CRITERIA = [
  {
    specialty: 'General Medicine',
    keywords: ['cold', 'cough', 'fever', 'flu', 'sore throat', 'runny nose', 'sneezing', 'head cold', 'viral', 'fatigue', 'weakness', 'chills'],
    condition: 'common cold, viral infection, or respiratory symptoms',
  },
  {
    specialty: 'Pediatrics',
    keywords: ['child', 'baby', 'infant', 'toddler', 'kid', 'pediatric', 'vaccination'],
    condition: 'pediatric & infant child health',
  },
  {
    specialty: 'Cardiology',
    keywords: ['heart', 'chest pain', 'palpitation', 'bp', 'blood pressure', 'hypertension', 'cholesterol', 'breathless', 'cardiac', 'angina'],
    condition: 'cardiovascular & heart health',
  },
  {
    specialty: 'Neurology',
    keywords: ['headache', 'migraine', 'dizziness', 'vertigo', 'seizure', 'numbness', 'brain', 'nerve', 'paralysis'],
    condition: 'neurology & headache / nervous system care',
  },
  {
    specialty: 'Orthopedics',
    keywords: ['knee', 'joint', 'bone', 'fracture', 'back pain', 'spine', 'shoulder', 'arthritis', 'ortho', 'ligament', 'slip disc'],
    condition: 'orthopedics & joint care',
  },
  {
    specialty: 'Dermatology',
    keywords: ['skin', 'rash', 'acne', 'pimple', 'itching', 'allergy', 'eczema', 'hair fall', 'scalp', 'psoriasis'],
    condition: 'dermatology & skin care',
  },
  {
    specialty: 'Gastroenterology',
    keywords: ['stomach', 'acidity', 'gas', 'constipation', 'diarrhea', 'vomit', 'indigestion', 'gastric', 'liver', 'abdomen', 'cramps'],
    condition: 'digestive & gastrointestinal health',
  },
];

/**
 * Check if the user is asking about a medicine
 */
function findMedicineInfo(query) {
  if (!query) return null;
  const q = query.toLowerCase();
  
  for (const med of MEDICINE_DATABASE) {
    for (const alias of med.names) {
      const regex = new RegExp(`\\b${alias}\\b`, 'i');
      if (regex.test(q)) {
        return med;
      }
    }
  }
  return null;
}

/**
 * Match specialization from user query
 */
function findTargetSpecialty(query) {
  if (!query) return null;
  const q = query.toLowerCase();
  
  for (const spec of SPECIALTY_CRITERIA) {
    for (const kw of spec.keywords) {
      if (q.includes(kw)) {
        return spec;
      }
    }
  }
  return null;
}

/**
 * Find matched doctor from live system doctor list
 */
function findDoctorForSpecialty(specialtyName, liveDoctors) {
  if (!Array.isArray(liveDoctors) || liveDoctors.length === 0) return null;

  const matched = liveDoctors.filter((doc) => {
    const s = (doc.specialization || '').toLowerCase();
    const d = (doc.department || '').toLowerCase();
    const target = (specialtyName || '').toLowerCase();
    return s.includes(target) || d.includes(target) || target.includes(s);
  });

  return matched.length > 0 ? matched[0] : liveDoctors[0];
}

/**
 * Build dynamic prompt for Gemini API with live hospital doctor context
 */
function buildGeminiSystemPrompt(liveDoctors) {
  const doctorRoster = (liveDoctors || [])
    .map(
      (d) =>
        `- ${d.name} (${d.specialization} - Dept: ${d.department}): ${d.experience || 'Experienced'}, Fee: ₹${d.fees || 600}, Schedule: ${(d.availableDays || []).join(', ')}`
    )
    .join('\n');

  return `You are "Sanjeevani AI Health Assistant", an empathetic, highly knowledgeable clinical triage assistant for Sanjeevani Super-Speciality Hospital.

HOSPITAL DOCTOR ROSTER CURRENTLY ON DUTY:
${doctorRoster || '- Dr. Ananya Mukherjee (General Medicine): 13+ Years, Fee: ₹600, Schedule: Mon-Sat'}

YOUR CLINICAL PROTOCOLS:
1. MULTI-TURN SYMPTOM TRIAGE:
   - When a patient mentions a symptom for the first time (e.g. cold, cough, headache, joint pain, chest tightness):
     * Acknowledge the symptoms empathetically.
     * Ask 1 or 2 clinical follow-up questions to understand duration, severity, fever, or red-flag warning signs before jumping to conclusions.
     * Suggest the appropriate department or specialist doctor from the hospital roster above.
     * Always format the doctor recommendation clearly mentioning: Doctor Name, Specialization, Experience, Consultation Fee, and Schedule.

2. MEDICINE INQUIRIES & SIDE EFFECTS:
   - If the patient asks about any medicine (e.g. Paracetamol, Cetirizine, Azithromycin, Combiflam, Pantoprazole, etc.):
     * Explain what the medication is typically used for.
     * Explain when and how it is taken in general medical practice.
     * List common and noteworthy side effects.
     * EMPHASIZE clearly: "Always consult a doctor before taking or altering any medicine. Self-medication can mask underlying illness or cause adverse reactions."

3. EMERGENCY SIGNS:
   - If symptoms indicate severe distress (chest pain radiating to arm/jaw, severe shortness of breath, sudden speech difficulty or weakness), advise dialing 1066 or going immediately to the Emergency Room.

Keep your tone professional, warm, clear, and reassuring. Do not write excessively long essays; use neat bullet points.`;
}

/**
 * Call the Google Gemini API with fallback support
 */
export async function sendGeminiChatMessage({
  userMessage,
  history = [],
  liveDoctors = [],
}) {
  const apiKey =
    import.meta.env.VITE_GEMINI_API_KEY ||
    import.meta.env.VITE_FIREBASE_API_KEY ||
    '';

  const medicineInfo = findMedicineInfo(userMessage);
  const matchedSpec = findTargetSpecialty(userMessage);
  const matchedDoctor = matchedSpec
    ? findDoctorForSpecialty(matchedSpec.specialty, liveDoctors)
    : null;

  // Try calling Gemini API first if key exists
  if (apiKey) {
    try {
      const systemInstruction = buildGeminiSystemPrompt(liveDoctors);

      const contents = [];

      contents.push({
        role: 'user',
        parts: [{ text: `System Instruction:\n${systemInstruction}\n\nPlease acknowledge your role.` }],
      });
      contents.push({
        role: 'model',
        parts: [{ text: 'Understood. I am the Sanjeevani AI Health Assistant, ready to assist patients with clinical triage, medicine information, and doctor recommendations.' }],
      });

      const recentHistory = history.slice(-6);
      for (const item of recentHistory) {
        if (item.sender === 'user') {
          contents.push({ role: 'user', parts: [{ text: item.text }] });
        } else if (item.sender === 'bot') {
          contents.push({ role: 'model', parts: [{ text: item.text }] });
        }
      }

      contents.push({
        role: 'user',
        parts: [{ text: userMessage }],
      });

      const response = await fetch(`${GEMINI_API_ENDPOINT}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: 0.6,
            topP: 0.9,
            maxOutputTokens: 800,
          },
        }),
      });

      const data = await response.json();

      if (response.ok && data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        const geminiText = data.candidates[0].content.parts[0].text;

        return {
          success: true,
          source: 'gemini-ai',
          text: geminiText,
          medicineInfo: medicineInfo || null,
          matchedDoctor: matchedDoctor || null,
          suggestedQueries: generateFollowUpChips(userMessage, matchedSpec, medicineInfo),
        };
      } else {
        console.warn('Gemini API returned non-OK response or blocked key:', data?.error?.message || data);
      }
    } catch (err) {
      console.warn('Network error reaching Gemini API, engaging smart clinical engine:', err);
    }
  }

  // Graceful Smart Clinical & Medicine Fallback Engine
  return generateClinicalFallbackResponse({
    userMessage,
    history,
    liveDoctors,
    medicineInfo,
    matchedSpec,
    matchedDoctor,
  });
}

/**
 * Generate contextual follow-up chips
 */
function generateFollowUpChips(userMessage, matchedSpec, medicineInfo) {
  const q = (userMessage || '').toLowerCase();

  if (medicineInfo) {
    return [
      'Which doctor should I consult for this?',
      'Can I take this on an empty stomach?',
      'Book a doctor consultation',
    ];
  }

  if (q.includes('cold') || q.includes('cough') || q.includes('fever')) {
    return [
      'Since 3 days with mild fever',
      'Can I take Paracetamol for fever?',
      'Just started today, no fever',
      'Show doctor appointment schedule',
    ];
  }

  if (q.includes('knee') || q.includes('joint') || q.includes('bone') || q.includes('back')) {
    return [
      'Pain increases while walking or stairs',
      'Is Ibuprofen or Combiflam safe to take?',
      'Book consultation with Orthopedic doctor',
    ];
  }

  if (q.includes('heart') || q.includes('chest') || q.includes('bp')) {
    return [
      'Mild palpitations during exertion',
      'Book Cardiologist consultation',
      'Emergency ambulance helpline',
    ];
  }

  if (matchedSpec) {
    return [
      `Book consultation with ${matchedSpec.specialty}`,
      'Check doctor fees and timings',
      'Are medicines required?',
    ];
  }

  return [
    'I have a cold and cough',
    'Side effects of Paracetamol',
    'Doctor for knee joint pain',
    'Book an appointment',
  ];
}

/**
 * Smart Multi-Turn Clinical Triage & Medicine Engine (Fallback)
 */
function generateClinicalFallbackResponse({
  userMessage,
  history,
  liveDoctors,
  medicineInfo,
  matchedSpec,
  matchedDoctor,
}) {
  const q = (userMessage || '').toLowerCase();

  // 1. Medicine Inquiry
  if (medicineInfo) {
    const text = `Here is the clinical information for **${medicineInfo.genericName}** (${medicineInfo.category}):

• **Primary Use:** ${medicineInfo.primaryUses}
• **When to Take:** ${medicineInfo.whenToUse}
• **Common Side Effects:** ${medicineInfo.commonSideEffects.join(', ')}.
• **Precautions:** ${medicineInfo.precautions}

⚠️ **Important Medical Disclaimer:**
Please do not self-medicate or modify dosages without consulting a licensed physician. Would you like to book a consultation with our hospital doctor to evaluate your condition and prescribe the safest treatment?`;

    let doctor = matchedDoctor;
    if (!doctor) {
      doctor = findDoctorForSpecialty('General Medicine', liveDoctors);
    }

    return {
      success: true,
      source: 'sanjeevani-clinical-engine',
      text,
      medicineInfo,
      matchedDoctor: doctor,
      suggestedQueries: [
        'Check doctor consultation timings',
        'Can I take Paracetamol with cold?',
        'Book consultation now',
      ],
    };
  }

  // 2. Clarifying Multi-turn follow-up if user is reporting initial symptoms
  const isInitialSymptomReport =
    matchedSpec &&
    !history.some((h) => h.sender === 'bot' && h.isClarifyingQuestion);

  const containsDetailedDuration =
    q.includes('day') ||
    q.includes('week') ||
    q.includes('month') ||
    q.includes('since') ||
    q.includes('mild') ||
    q.includes('severe') ||
    q.includes('high fever') ||
    q.includes('started');

  if (isInitialSymptomReport && !containsDetailedDuration) {
    let clarifyingQuestions = '';

    if (matchedSpec.specialty === 'General Medicine' || matchedSpec.specialty === 'Pediatrics') {
      clarifyingQuestions = `I understand you are experiencing symptoms of **${matchedSpec.condition}**. To recommend the most accurate care:

1. **Duration:** How many days have you had this cold / cough?
2. **Fever / Chills:** Do you currently have a fever, body chills, or sore throat?
3. **Breathing:** Are you experiencing any chest tightness, shortness of breath, or deep chesty cough?`;
    } else if (matchedSpec.specialty === 'Orthopedics') {
      clarifyingQuestions = `I note your symptoms relating to **${matchedSpec.condition}**. To help you best:

1. **Location & Nature:** Is the pain in one knee/joint or both? Does it feel stiff in the morning?
2. **Mobility:** Does the pain worsen when climbing stairs, walking, or standing?
3. **Recent Injury:** Was there any sudden twist, fall, or injury?`;
    } else if (matchedSpec.specialty === 'Cardiology') {
      clarifyingQuestions = `I note your inquiry regarding **${matchedSpec.condition}**. 

⚠️ **Emergency Check:** If you are experiencing intense crushing chest pain, sweating, or pain radiating to the left arm/jaw, please go to the Emergency Room or dial **1066** immediately!

If this is a non-emergency routine check:
1. Is the discomfort intermittent or persistent?
2. Do you have a prior history of high blood pressure, diabetes, or elevated cholesterol?`;
    } else {
      clarifyingQuestions = `I notice your concern regarding **${matchedSpec.condition}**. 

1. How long have you noticed these symptoms?
2. Have you taken any over-the-counter medicine or prior treatment for this?`;
    }

    return {
      success: true,
      source: 'sanjeevani-clinical-engine',
      text: clarifyingQuestions,
      isClarifyingQuestion: true,
      matchedDoctor: matchedDoctor || null,
      suggestedQueries: generateFollowUpChips(userMessage, matchedSpec, null),
    };
  }

  // 3. User provided symptom details or asked for doctor recommendation
  if (matchedSpec) {
    const doctor = matchedDoctor || findDoctorForSpecialty(matchedSpec.specialty, liveDoctors);
    
    let text = `Based on your symptoms (${matchedSpec.condition}), you should consult our **Department of ${matchedSpec.specialty}**.`;

    if (doctor) {
      text += `\n\nWe have **${doctor.name}** (${doctor.specialization || matchedSpec.specialty}) available on our active hospital faculty with ${doctor.experience || 'extensive'} clinical experience. You can review the consultation fee and weekly OPD schedule below to book your appointment slot.`;
    }

    return {
      success: true,
      source: 'sanjeevani-clinical-engine',
      text,
      medicineInfo: null,
      matchedDoctor: doctor,
      suggestedQueries: [
        `Book appointment with ${doctor ? doctor.name : matchedSpec.specialty}`,
        'Can I take any medicine for relief?',
        'Check other available doctors',
      ],
    };
  }

  // 4. General greeting or unknown query
  const defaultDoctor = findDoctorForSpecialty('General Medicine', liveDoctors);
  return {
    success: true,
    source: 'sanjeevani-clinical-engine',
    text: `Hello! I am here to assist you with:
• **Clinical Triage:** Tell me what symptoms you or your family member are experiencing (e.g., cold, fever, knee pain, headache, acidity).
• **Doctor Recommendations:** I will match you with our senior specialists, their fees, and OPD timings.
• **Medicine Guidance:** Ask about medicines (e.g. Paracetamol, Cetirizine, Azithromycin) to review their uses, precautions, and side effects.

How can I help you today?`,
    medicineInfo: null,
    matchedDoctor: defaultDoctor,
    suggestedQueries: [
      'I am having a cold and cough',
      'Side effects of Paracetamol',
      'Need a doctor for knee joint pain',
      'Heart checkup & BP consultation',
    ],
  };
}
