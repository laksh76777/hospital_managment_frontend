import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  X,
  Send,
  Bot,
  User,
  Stethoscope,
  Calendar,
  Clock,
  ArrowRight,
  Sparkles,
  Phone,
  Building2,
  ChevronDown,
  Minimize2,
} from 'lucide-react';
import { getDoctors } from '../../api/doctorApi';

// Symptom to Specialization mapping table
const SYMPTOM_MAP = [
  {
    keywords: ['cold', 'cough', 'fever', 'flu', 'sore throat', 'runny nose', 'sneezing', 'head cold', 'viral', 'weakness', 'fatigue'],
    specialization: 'General Medicine',
    pediatricFallback: 'Pediatrics',
    conditionName: 'common cold, viral fever, or respiratory symptoms',
  },
  {
    keywords: ['child', 'baby', 'infant', 'toddler', 'kid', 'pediatric', 'vaccination', 'milestone'],
    specialization: 'Pediatrics',
    conditionName: 'pediatric & infant child health',
  },
  {
    keywords: ['heart', 'chest pain', 'palpitation', 'bp', 'blood pressure', 'hypertension', 'cholesterol', 'breathless', 'cardiac'],
    specialization: 'Cardiology',
    conditionName: 'cardiovascular & heart health',
  },
  {
    keywords: ['headache', 'migraine', 'dizziness', 'vertigo', 'seizure', 'numbness', 'brain', 'nerve', 'paralysis'],
    specialization: 'Neurology',
    conditionName: 'neurology & brain/nerve health',
  },
  {
    keywords: ['knee', 'joint', 'bone', 'fracture', 'back pain', 'spine', 'shoulder', 'arthritis', 'ortho', 'ligament'],
    specialization: 'Orthopedics',
    conditionName: 'orthopedics & joint care',
  },
  {
    keywords: ['skin', 'rash', 'acne', 'pimple', 'itching', 'allergy', 'eczema', 'hair fall', 'dermatology'],
    specialization: 'Dermatology',
    conditionName: 'dermatology & skin care',
  },
  {
    keywords: ['stomach', 'acidity', 'gas', 'constipation', 'diarrhea', 'vomit', 'indigestion', 'gastric', 'liver', 'abdomen'],
    specialization: 'Gastroenterology',
    conditionName: 'digestive & gastrointestinal health',
  },
];

export default function PatientChatbot() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);

  // Chat conversation state
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'bot',
      text: 'Namaste! I am your Sanjeevani Health Assistant. You can describe any symptoms (e.g. "I am having a cold", "knee pain", or "chest uneasiness") and I will instantly recommend the right specialist doctor from our hospital faculty with their fees and OPD schedule.',
      suggestedQueries: [
        'I am having a cold and cough',
        'Need a doctor for knee joint pain',
        'Heart checkup & chest palpitation',
        'Skin rash and allergy doctor',
      ],
    },
  ]);

  const chatEndRef = useRef(null);

  // Load hospital doctors
  useEffect(() => {
    getDoctors()
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          setDoctors(res.data);
        }
      })
      .catch((err) => {
        console.warn('Could not load doctors in chatbot:', err);
      })
      .finally(() => {
        setLoadingDoctors(false);
      });
  }, []);

  // Scroll to bottom on new message
  useEffect(() => {
    if (isOpen && !isMinimized) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized]);

  // Handle user query & triage analysis
  const handleSendMessage = (textToSend = null) => {
    const query = (textToSend || inputMessage).trim();
    if (!query) return;

    // Append user message
    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');

    // Simulate smart clinical triage response
    setTimeout(() => {
      const lowerQuery = query.toLowerCase();

      // Check if user is asking for appointment booking confirmation
      if (lowerQuery.includes('yes') || lowerQuery.includes('book it') || lowerQuery.includes('want to book') || lowerQuery.includes('schedule')) {
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: 'Wonderful! You can click the "Select Date & Slot" button directly on the doctor card above, or let me open the appointment booking desk for you.',
            action: {
              label: 'Open Appointment Booking Form',
              link: '/appointments/book',
            },
          },
        ]);
        return;
      }

      // Match query against symptom map
      let matchedRule = null;
      for (const rule of SYMPTOM_MAP) {
        if (rule.keywords.some((kw) => lowerQuery.includes(kw))) {
          matchedRule = rule;
          break;
        }
      }

      if (matchedRule) {
        // Find matching doctors in hospital system
        const matchedDoctors = doctors.filter((doc) => {
          const spec = (doc.specialization || '').toLowerCase();
          const dept = (doc.department || '').toLowerCase();
          const target = matchedRule.specialization.toLowerCase();
          return spec.includes(target) || dept.includes(target);
        });

        // If child mentioned, also include pediatrician
        if (lowerQuery.includes('child') || lowerQuery.includes('baby') || lowerQuery.includes('kid')) {
          const peds = doctors.filter((d) => (d.specialization || '').toLowerCase().includes('pediatric'));
          peds.forEach((p) => {
            if (!matchedDoctors.some((m) => (m._id || m.id) === (p._id || p.id))) {
              matchedDoctors.unshift(p);
            }
          });
        }

        if (matchedDoctors.length > 0) {
          const primaryDoc = matchedDoctors[0];
          const scheduleDays = (primaryDoc.availableDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']).join(', ');

          setMessages((prev) => [
            ...prev,
            {
              id: `bot-${Date.now()}`,
              sender: 'bot',
              text: `For ${matchedRule.conditionName}, we recommend consulting our **${primaryDoc.specialization}** department. Here is the verified faculty doctor available in our hospital:`,
              doctorCard: primaryDoc,
              followUpText: `Dr. ${primaryDoc.name} has ${primaryDoc.experience || 10} years of clinical experience. Consultation fee is ₹${primaryDoc.fees || 800} / visit, available on ${scheduleDays}. Would you like to select a slot to book an appointment?`,
            },
          ]);
        } else {
          setMessages((prev) => [
            ...prev,
            {
              id: `bot-${Date.now()}`,
              sender: 'bot',
              text: `For ${matchedRule.conditionName}, you should consult our **${matchedRule.specialization}** department. You can browse all available OPD physicians in our full directory.`,
              action: {
                label: 'Browse Hospital Doctor Directory',
                link: '/patient/doctors',
              },
            },
          ]);
        }
      } else {
        // Generic fallback or triage guidance
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: `I understand. To suggest the best doctor in our system, could you tell me your main symptom? For example:
• Cold, fever, or cough
• Heart uneasiness or high blood pressure
• Knee, shoulder, or joint pain
• Headache or migraine
• Skin allergy or rash
• Stomach pain or digestion issue`,
            suggestedQueries: [
              'I am having a cold',
              'Knee joint pain',
              'Chest palpitation',
              'Stomach acidity',
            ],
          },
        ]);
      }
    }, 450);
  };

  return (
    <div id="patient-chatbot-container" className="fixed bottom-5 right-5 z-40 font-sans">
      {/* 1. FLOATING TOGGLE BUTTON */}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
            setIsMinimized(false);
          }}
          id="btn-open-health-assistant"
          className="flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-emerald-800 to-teal-800 hover:from-emerald-700 hover:to-teal-700 text-white rounded-full shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 active:scale-95 cursor-pointer border border-emerald-600/50 group"
          title="Ask Sanjeevani Doctor Recommendation Assistant"
        >
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center relative">
            <Bot className="w-5 h-5 text-emerald-200" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 absolute -top-0.5 -right-0.5 border-2 border-emerald-900 animate-pulse" />
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-xs font-bold leading-tight">Need a Doctor?</p>
            <p className="text-[10px] text-emerald-200 leading-tight">Ask Assistant</p>
          </div>
        </button>
      )}

      {/* 2. CHAT WINDOW MODAL */}
      {isOpen && (
        <div
          className={`bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col transition-all duration-200 ${
            isMinimized ? 'w-80 h-16' : 'w-[90vw] sm:w-96 h-[560px] max-h-[85vh]'
          }`}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 px-4 py-3 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-700/80 border border-emerald-500/30 flex items-center justify-center text-white shadow-xs">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold leading-tight">Sanjeevani Health Assistant</h3>
                <p className="text-[10px] text-emerald-300 flex items-center gap-1 leading-tight mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Doctor Triage Active
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 text-emerald-300 hover:text-white hover:bg-white/10 rounded-lg transition"
                title={isMinimized ? 'Expand' : 'Minimize'}
              >
                <Minimize2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-emerald-300 hover:text-white hover:bg-white/10 rounded-lg transition"
                title="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Message History Area */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/70 text-xs">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.sender === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl p-3 space-y-2 leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-emerald-700 text-white rounded-br-none shadow-xs'
                          : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-xs'
                      }`}
                    >
                      <p className="whitespace-pre-line">{msg.text}</p>

                      {/* Doctor Recommendation Card */}
                      {msg.doctorCard && (
                        <div className="mt-2 bg-gradient-to-br from-emerald-50/60 to-teal-50/40 p-3 rounded-xl border border-emerald-200 text-slate-800 space-y-2">
                          <div className="flex items-start gap-2.5">
                            <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white font-bold flex items-center justify-center text-xs shrink-0">
                              {msg.doctorCard.name?.replace('Dr.', '').trim().charAt(0)}
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="font-bold text-slate-900 text-xs truncate">
                                {msg.doctorCard.name}
                              </h4>
                              <p className="text-[11px] text-emerald-800 font-semibold">
                                {msg.doctorCard.specialization}
                              </p>
                              <p className="text-[10px] text-slate-500 truncate">
                                {msg.doctorCard.department || 'Clinical Medicine'}
                              </p>
                            </div>
                          </div>

                          {/* Details table */}
                          <div className="pt-2 border-t border-emerald-200/70 space-y-1 text-[11px]">
                            <div className="flex justify-between">
                              <span className="text-slate-500">Experience:</span>
                              <span className="font-semibold text-slate-800">
                                {msg.doctorCard.experience || 10}+ Years Senior Consultant
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Consultation Fee:</span>
                              <span className="font-bold text-emerald-800">
                                ₹{msg.doctorCard.fees || 800} / visit
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Weekly Schedule:</span>
                              <span className="font-semibold text-slate-800 text-[10px]">
                                {(msg.doctorCard.availableDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']).join(', ')}
                              </span>
                            </div>
                          </div>

                          {/* Direct Action Link */}
                          <div className="pt-2">
                            <Link
                              to={`/patient/doctors/${msg.doctorCard._id || msg.doctorCard.id}`}
                              onClick={() => setIsOpen(false)}
                              className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-xs transition"
                            >
                              <span>Select Date & Slot with {msg.doctorCard.name}</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </div>
                      )}

                      {/* Follow-up question */}
                      {msg.followUpText && (
                        <p className="text-slate-600 italic text-[11px] pt-1">
                          {msg.followUpText}
                        </p>
                      )}

                      {/* Action Link */}
                      {msg.action && (
                        <div className="pt-1">
                          <Link
                            to={msg.action.link}
                            onClick={() => setIsOpen(false)}
                            className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:underline"
                          >
                            <span>{msg.action.label}</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      )}
                    </div>

                    {/* Suggested Prompt Chips */}
                    {msg.suggestedQueries && (
                      <div className="flex flex-wrap gap-1.5 mt-2 max-w-[90%]">
                        {msg.suggestedQueries.map((chip, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSendMessage(chip)}
                            className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 rounded-full text-[11px] font-medium border border-slate-200 transition shadow-2xs cursor-pointer text-left"
                          >
                            {chip}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input Bar */}
              <div className="p-3 bg-white border-t border-slate-200">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Describe symptoms e.g. I have cold..."
                    className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                  />
                  <button
                    type="submit"
                    disabled={!inputMessage.trim()}
                    className="p-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl transition shadow-xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    title="Send message"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1.5 px-1">
                  <span>Sanjeevani Medical Triage</span>
                  <span className="text-rose-600 font-bold">Emergency: Dial 1066</span>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
