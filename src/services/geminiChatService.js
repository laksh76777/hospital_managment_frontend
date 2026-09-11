// Gemini AI Chat Service for Patient Portal
// Powered by Google Gemini AI with multi-turn symptom triage,
// dynamic medicine intelligence, side effects analysis, and hospital doctor matching.

const GEMINI_ENDPOINTS = [
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent',
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent',
];

/**
 * Fetch live drug/medicine summary from Wikipedia REST API as search grounding
 */
async function fetchLiveMedicineSearch(drugName) {
  if (!drugName || drugName.length < 3) return null;
  try {
    const cleanName = encodeURIComponent(drugName.trim());
    const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${cleanName}`, {
      headers: { 'Accept': 'application/json' },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data && data.extract && data.type !== 'disambiguation') {
      return {
        title: data.title,
        description: data.description || 'Pharmaceutical formulation',
        extract: data.extract,
      };
    }
  } catch (e) {
    // Non-blocking search
  }
  return null;
}

/**
 * Detect medicine names from query
 */
function extractPotentialMedicine(query) {
  const commonMeds = [
    'paracetamol', 'dolo', 'dolo 650', 'crocin', 'calpol', 'acetaminophen',
    'cetirizine', 'cetzine', 'okacet', 'zyrtec', 'levocetirizine', 'allegra',
    'azithromycin', 'azithral', 'zithromax',
    'ibuprofen', 'brufen', 'combiflam', 'advil', 'motrin',
    'pantoprazole', 'pan 40', 'pan d', 'omeprazole', 'rabeprazole', 'omez',
    'amoxicillin', 'augmentin', 'amoxil',
    'aspirin', 'disprin', 'ecosprin',
    'cough syrup', 'benadryl', 'ascoril', 'grilinctus',
    'metformin', 'glycomet', 'atorvastatin', 'lipitor', 'telmisartan', 'amlodipine'
  ];

  const q = (query || '').toLowerCase();
  for (const m of commonMeds) {
    const regex = new RegExp(`\\b${m}\\b`, 'i');
    if (regex.test(q)) {
      return m;
    }
  }

  // Check if user explicitly asked "about [drug] medicine/tablet"
  const match = q.match(/(?:about|side effects of|what is|use of|take)\s+([a-zA-Z0-9\-]+)(?:\s+(?:tablet|capsule|syrup|medicine|pill))?/i);
  if (match && match[1] && match[1].length > 3) {
    const candidate = match[1].toLowerCase();
    const stopWords = ['this', 'that', 'your', 'doctor', 'hospital', 'health', 'appointment', 'cold', 'fever', 'cough'];
    if (!stopWords.includes(candidate)) {
      return candidate;
    }
  }

  return null;
}

/**
 * Match specialization from user query or AI response
 */
function matchSpecialty(text, liveDoctors) {
  if (!text) return null;
  const t = text.toLowerCase();

  const rules = [
    { spec: 'General Medicine', kw: ['general medicine', 'physician', 'cold', 'cough', 'fever', 'flu', 'sore throat', 'viral', 'weakness'] },
    { spec: 'Pediatrics', kw: ['pediatric', 'child', 'baby', 'infant', 'toddler'] },
    { spec: 'Cardiology', kw: ['cardiolog', 'heart', 'chest pain', 'palpitation', 'bp', 'blood pressure', 'hypertension', 'cardiac'] },
    { spec: 'Orthopedics', kw: ['orthopedic', 'knee', 'joint', 'bone', 'fracture', 'spine', 'back pain', 'arthritis'] },
    { spec: 'Neurology', kw: ['neurolog', 'headache', 'migraine', 'dizziness', 'vertigo', 'nerve', 'brain'] },
    { spec: 'Dermatology', kw: ['dermatolog', 'skin', 'rash', 'acne', 'pimple', 'allergy', 'eczema', 'itching'] },
    { spec: 'Gastroenterology', kw: ['gastroenterolog', 'stomach', 'acidity', 'gas', 'constipation', 'diarrhea', 'vomit', 'indigestion'] },
  ];

  for (const r of rules) {
    if (r.kw.some((k) => t.includes(k))) {
      // Find doctor
      const doc = (liveDoctors || []).find((d) => {
        const s = (d.specialization || '').toLowerCase();
        const dept = (d.department || '').toLowerCase();
        return s.includes(r.spec.toLowerCase()) || dept.includes(r.spec.toLowerCase());
      });
      return doc || (liveDoctors && liveDoctors[0]) || null;
    }
  }

  return null;
}

/**
 * Build dynamic Gemini system instruction with live doctor roster
 */
function buildGeminiSystemInstruction(liveDoctors) {
  const doctorRoster = (liveDoctors || [])
    .map(
      (d) =>
        `- ${d.name} (${d.specialization} - Dept: ${d.department || 'Clinical'}): ${d.experience || 'Experienced'}, Fee: ₹${d.fees || 600}/visit, Weekly OPD Schedule: ${(d.availableDays || []).join(', ')}`
    )
    .join('\n');

  return `You are "Sanjeevani AI", an intelligent, empathetic, and clinically grounded AI Medical Assistant for Sanjeevani Super-Speciality Hospital.

CORE BEHAVIORAL DIRECTIVES:
1. NATURAL AI CONVERSATION (NEVER SOUND SCRIPTED OR ROBOTIC):
   - When the user says "hi", "hello", "good morning", etc., greet them warmly and naturally as an intelligent medical assistant.
   - Do not use pre-written or canned phrases. Speak dynamically, empathetically, and conversationally.

2. MULTI-TURN CLINICAL SYMPTOM TRIAGE:
   - When a patient describes symptoms (e.g. cold, cough, headache, joint pain, chest tightness):
     * Empathize with their discomfort.
     * Ask 1 or 2 relevant clinical follow-up questions (e.g., duration, fever, chills, breathing difficulty, or severity) to understand the clinical picture before concluding.
     * Recommend the appropriate medical department and faculty doctor from the hospital roster below. Include Doctor Name, Specialization, Experience, Fee, and Schedule.

3. MEDICINE INTELLIGENCE & SIDE EFFECTS:
   - When asked about any medicine (e.g. Paracetamol, Dolo 650, Cetirizine, Azithromycin, Combiflam, Pantoprazole, etc.):
     * Explain what the medicine is used for.
     * Explain when and how it is typically taken in medical practice.
     * Detail the common side effects and any significant risks.
     * ALWAYS explicitly advise: "Please consult our hospital doctor before taking or altering any medication. Self-medication can be dangerous."

4. UNKNOWN OR NON-MEDICAL QUESTIONS:
   - If the user asks something completely outside medicine/healthcare, or if you do not have verified medical knowledge to answer accurately, honestly say:
     "I don't have verified clinical information about that. For your health and safety, I recommend speaking directly with our hospital doctors or medical staff."

ACTIVE SANJEEVANI HOSPITAL DOCTOR ROSTER:
${doctorRoster || '- Dr. Ananya Mukherjee (General Medicine): 13+ Years, Fee: ₹600, Schedule: Mon-Sat'}

Emergency Ambulance Helpline: Dial 1066.`;
}

/**
 * Send user query to Google Gemini AI
 */
export async function sendGeminiChatMessage({
  userMessage,
  history = [],
  liveDoctors = [],
}) {
  const apiKey =
    import.meta.env.VITE_GEMINI_API_KEY ||
    localStorage.getItem('sanjeevani_gemini_api_key') ||
    '';

  // Check if a medicine is mentioned and fetch real-time search context
  const detectedMed = extractPotentialMedicine(userMessage);
  let liveSearchData = null;
  if (detectedMed) {
    liveSearchData = await fetchLiveMedicineSearch(detectedMed);
  }

  // Build Gemini contents array
  const systemPrompt = buildGeminiSystemInstruction(liveDoctors);

  const contents = [];

  // Inject system instruction in first turn
  let initialContext = `System Instruction:\n${systemPrompt}`;
  if (liveSearchData) {
    initialContext += `\n\n[LIVE SEARCH GROUNDING FOR ${liveSearchData.title.toUpperCase()}]:\nDescription: ${liveSearchData.description}\nClinical Summary: ${liveSearchData.extract}\nUse this verified real-time information to describe the medicine accurately.`;
  }

  contents.push({
    role: 'user',
    parts: [{ text: `${initialContext}\n\nPlease acknowledge your role.` }],
  });
  contents.push({
    role: 'model',
    parts: [{ text: 'Understood. I am Sanjeevani AI, ready to assist patients with natural conversation, clinical symptom triage, medicine side-effect analysis, and doctor recommendations.' }],
  });

  // Include recent conversation history (last 8 turns)
  const recentHistory = history.slice(-8);
  for (const item of recentHistory) {
    if (item.sender === 'user' && item.text) {
      contents.push({ role: 'user', parts: [{ text: item.text }] });
    } else if (item.sender === 'bot' && item.text) {
      contents.push({ role: 'model', parts: [{ text: item.text }] });
    }
  }

  // Current query
  contents.push({
    role: 'user',
    parts: [{ text: userMessage }],
  });

  // Try Gemini endpoints (gemini-flash-latest, then gemini-flash-lite-latest)
  for (const endpoint of GEMINI_ENDPOINTS) {
    try {
      const response = await fetch(`${endpoint}?key=${encodeURIComponent(apiKey)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: 0.7,
            topP: 0.95,
            maxOutputTokens: 1000,
          },
        }),
      });

      const data = await response.json();

      if (response.ok && data?.candidates?.[0]?.content?.parts) {
        const parts = data.candidates[0].content.parts;
        const textParts = parts.map((p) => p.text).filter(Boolean);
        const geminiResponseText = textParts.join('\n').trim();

        if (geminiResponseText) {
          // Identify matched doctor from response or user query
          const matchedDoctor = matchSpecialty(geminiResponseText + ' ' + userMessage, liveDoctors);

          // Generate dynamic follow-up chips
          const suggestedQueries = generateDynamicChips(userMessage, geminiResponseText, detectedMed);

          return {
            success: true,
            source: 'gemini-ai',
            text: geminiResponseText,
            medicineInfo: liveSearchData
              ? {
                  genericName: liveSearchData.title,
                  category: liveSearchData.description,
                  summary: liveSearchData.extract,
                }
              : null,
            matchedDoctor: matchedDoctor || null,
            suggestedQueries,
          };
        }
      } else {
        console.warn(`Gemini endpoint ${endpoint} returned:`, data?.error?.message || data);
      }
    } catch (err) {
      console.warn(`Failed to connect to ${endpoint}:`, err);
    }
  }

  // Fallback if network completely fails
  return generateClinicalFallback(userMessage, liveDoctors, liveSearchData);
}

/**
 * Generate intelligent dynamic follow-up chips based on conversation
 */
function generateDynamicChips(userMessage, aiResponse, detectedMed) {
  const q = (userMessage || '').toLowerCase();
  const resp = (aiResponse || '').toLowerCase();

  if (detectedMed) {
    return [
      `Can I take ${detectedMed} with food?`,
      `Which doctor prescribes ${detectedMed}?`,
      'Book a doctor consultation',
    ];
  }

  if (resp.includes('fever') || resp.includes('duration') || resp.includes('how many days')) {
    return [
      'Since 3 days with mild fever',
      'Just started today, no fever',
      'Can I take Paracetamol for relief?',
      'Show doctor appointment slots',
    ];
  }

  if (q.includes('hi') || q.includes('hello')) {
    return [
      'I am having a cold and cough',
      'What are the side effects of Dolo 650?',
      'Doctor for knee joint pain',
      'Check doctor fees and schedule',
    ];
  }

  if (resp.includes('dr.') || resp.includes('consult')) {
    return [
      'Select appointment date & slot',
      'Are medicines required?',
      'Check other available doctors',
    ];
  }

  return [
    'I have a cold and fever',
    'Side effects of Paracetamol',
    'Doctor for knee pain',
    'Book appointment',
  ];
}

/**
 * Fallback synthesizer if network fails
 */
function generateClinicalFallback(userMessage, liveDoctors, liveSearchData) {
  const q = (userMessage || '').toLowerCase();

  if (liveSearchData) {
    const doctor = matchSpecialty('General Medicine', liveDoctors);
    return {
      success: true,
      source: 'live-search-engine',
      text: `Here is the medical information for **${liveSearchData.title}** (${liveSearchData.description}):

${liveSearchData.extract}

⚠️ **Medical Safety Disclaimer:**
Always consult our hospital physician before taking or altering any medicine. Self-medication can cause serious adverse reactions.`,
      medicineInfo: {
        genericName: liveSearchData.title,
        category: liveSearchData.description,
        summary: liveSearchData.extract,
      },
      matchedDoctor: doctor,
      suggestedQueries: [
        'Book consultation with physician',
        'Common side effects of Paracetamol',
      ],
    };
  }

  // Greeting
  if (q.includes('hi') || q.includes('hello') || q.includes('hey')) {
    return {
      success: true,
      source: 'sanjeevani-ai',
      text: `Hello! Namaste! I am your Sanjeevani AI Health Assistant. 

How can I help you today? You can describe any symptoms you are feeling, ask about medicines and their side effects, or ask me to recommend the best specialist doctor from our hospital faculty.`,
      suggestedQueries: [
        'I am having a cold and cough',
        'Side effects of Dolo 650',
        'Doctor for knee joint pain',
      ],
    };
  }

  const doctor = matchSpecialty(userMessage, liveDoctors);
  return {
    success: true,
    source: 'sanjeevani-ai',
    text: `I understand your inquiry. To provide the best care, please share how long you have had these symptoms and if you have any fever or acute pain. Based on our clinical faculty, our specialist doctors are available for consultation.`,
    matchedDoctor: doctor,
    suggestedQueries: [
      'Since 3 days with mild fever',
      'Book doctor consultation',
    ],
  };
}
