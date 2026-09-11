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
  Pill,
  AlertTriangle,
  Info,
  ShieldCheck,
} from 'lucide-react';
import { getDoctors } from '../../api/doctorApi';
import { sendGeminiChatMessage } from '../../services/geminiChatService';

export default function PatientChatbot() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [isTyping, setIsTyping] = useState(false);

  // Chat conversation state
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'bot',
      text: `Namaste! I am your Sanjeevani AI Health Assistant powered by Gemini.

You can discuss symptoms (e.g., "I have a cold and cough", "knee pain", or "chest tightness") and I will ask a few clarifying questions, evaluate your condition, and recommend the best doctor on our hospital faculty with their fees and OPD timings.

You can also ask about any medicines (e.g. Paracetamol, Cetirizine, Azithromycin) to review their uses, precautions, and side effects.`,
      suggestedQueries: [
        'I am having a cold and cough',
        'Can I take Paracetamol? What are side effects?',
        'Need a doctor for knee joint pain',
        'Heart checkup & chest palpitation',
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
  }, [messages, isTyping, isOpen, isMinimized]);

  // Handle user query & AI response
  const handleSendMessage = async (textToSend = null) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || isTyping) return;

    // Append user message
    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    // Direct booking shortcut check
    const lowerQuery = query.toLowerCase();
    if (
      lowerQuery === 'yes' ||
      lowerQuery.includes('want to book') ||
      lowerQuery.includes('book appointment now') ||
      lowerQuery.includes('book consultation')
    ) {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: 'You can select a doctor and appointment date & slot directly below, or open our appointment scheduling desk.',
            action: {
              label: 'Open Appointment Booking Form',
              link: '/appointments/book',
            },
          },
        ]);
        setIsTyping(false);
      }, 400);
      return;
    }

    try {
      // Call Gemini AI / Clinical Triage service
      const aiResponse = await sendGeminiChatMessage({
        userMessage: query,
        history: messages,
        liveDoctors: doctors,
      });

      const botMsg = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: aiResponse.text,
        source: aiResponse.source,
        medicineInfo: aiResponse.medicineInfo || null,
        doctorCard: aiResponse.matchedDoctor || null,
        suggestedQueries: aiResponse.suggestedQueries || [],
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error('Chatbot error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: 'I apologize, I encountered an issue processing your clinical query. Please try again or reach our OPD desk directly.',
          suggestedQueries: [
            'I have a cold and cough',
            'Side effects of Paracetamol',
            'Find general physician',
          ],
        },
      ]);
    } finally {
      setIsTyping(false);
    }
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
          className="flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 hover:from-emerald-700 hover:to-teal-700 text-white rounded-full shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 active:scale-95 cursor-pointer border border-emerald-500/40 group"
          title="Ask Sanjeevani AI Doctor Assistant"
        >
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center relative">
            <Sparkles className="w-4 h-4 text-emerald-200" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 absolute -top-0.5 -right-0.5 border-2 border-emerald-900 animate-pulse" />
          </div>
          <div className="text-left hidden sm:block">
            <div className="flex items-center gap-1">
              <p className="text-xs font-bold leading-tight">Sanjeevani AI</p>
              <span className="px-1 py-0.2 bg-emerald-500/30 text-[9px] rounded font-semibold text-emerald-200">
                Gemini
              </span>
            </div>
            <p className="text-[10px] text-emerald-200 leading-tight">Doctor & Symptom Guide</p>
          </div>
        </button>
      )}

      {/* 2. CHAT WINDOW MODAL */}
      {isOpen && (
        <div
          className={`bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col transition-all duration-200 ${
            isMinimized ? 'w-80 h-16' : 'w-[92vw] sm:w-[420px] h-[600px] max-h-[88vh]'
          }`}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 px-4 py-3 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-700/80 border border-emerald-500/30 flex items-center justify-center text-white shadow-xs">
                <Bot className="w-5 h-5 text-emerald-200" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-bold leading-tight">Sanjeevani AI Health Assistant</h3>
                  <span className="px-1.5 py-0.5 bg-emerald-500/20 text-[9px] rounded font-bold text-emerald-300 border border-emerald-500/30">
                    Gemini
                  </span>
                </div>
                <p className="text-[10px] text-emerald-300 flex items-center gap-1 leading-tight mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Symptom Triage & Medicine Guide
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
                      className={`max-w-[88%] rounded-2xl p-3 space-y-2 leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-emerald-700 text-white rounded-br-none shadow-xs'
                          : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-xs'
                      }`}
                    >
                      {/* Message Text */}
                      <p className="whitespace-pre-line text-xs font-normal leading-relaxed">
                        {msg.text}
                      </p>

                      {/* Medicine Information & Side Effects Card */}
                      {msg.medicineInfo && (
                        <div className="mt-2 bg-gradient-to-br from-amber-50/70 to-orange-50/50 p-3 rounded-xl border border-amber-200 text-slate-800 space-y-2">
                          <div className="flex items-start gap-2">
                            <div className="p-1.5 bg-amber-600 text-white rounded-lg shrink-0">
                              <Pill className="w-4 h-4" />
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-900 text-xs">
                                {msg.medicineInfo.genericName}
                              </h4>
                              <p className="text-[10px] text-amber-800 font-semibold">
                                {msg.medicineInfo.category}
                              </p>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-amber-200/60 space-y-1.5 text-[11px]">
                            <div>
                              <span className="font-bold text-slate-700">When to use: </span>
                              <span className="text-slate-600">{msg.medicineInfo.whenToUse}</span>
                            </div>
                            <div>
                              <span className="font-bold text-slate-700">Common Side Effects: </span>
                              <ul className="list-disc list-inside text-slate-600 space-y-0.5 mt-0.5">
                                {msg.medicineInfo.commonSideEffects.map((se, idx) => (
                                  <li key={idx}>{se}</li>
                                ))}
                              </ul>
                            </div>
                            {msg.medicineInfo.seriousRisks && (
                              <div className="text-rose-800 text-[10px] font-medium bg-rose-50 p-1.5 rounded border border-rose-200">
                                <strong>Risk Caution: </strong> {msg.medicineInfo.seriousRisks}
                              </div>
                            )}
                          </div>

                          {/* Prominent Medical Disclaimer Banner */}
                          <div className="p-2 bg-amber-100/70 rounded-lg border border-amber-300 text-amber-900 text-[10px] flex items-start gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                            <span>
                              <strong>Doctor Review Required:</strong> Always consult your doctor before taking or altering any medicine. Self-medication may be dangerous.
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Live System Doctor Faculty Card */}
                      {msg.doctorCard && (
                        <div className="mt-2 bg-gradient-to-br from-emerald-50/70 to-teal-50/50 p-3 rounded-xl border border-emerald-200 text-slate-800 space-y-2">
                          <div className="flex items-start gap-2.5">
                            <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-2xs">
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
                                Dept: {msg.doctorCard.department || 'Clinical Medicine'}
                              </p>
                            </div>
                          </div>

                          {/* Details table */}
                          <div className="pt-2 border-t border-emerald-200/70 space-y-1 text-[11px]">
                            <div className="flex justify-between">
                              <span className="text-slate-500">Experience:</span>
                              <span className="font-semibold text-slate-800">
                                {msg.doctorCard.experience || '10+'} Years Senior Consultant
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

                          {/* Direct 1-Click Action Button */}
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
                    {msg.suggestedQueries && msg.suggestedQueries.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2 max-w-[92%]">
                        {msg.suggestedQueries.map((chip, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSendMessage(chip)}
                            disabled={isTyping}
                            className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 rounded-full text-[11px] font-medium border border-slate-200 transition shadow-2xs cursor-pointer text-left disabled:opacity-50"
                          >
                            {chip}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {/* Typing indicator */}
                {isTyping && (
                  <div className="flex items-center gap-2 p-3 bg-white border border-slate-200 rounded-2xl rounded-bl-none max-w-[70%] shadow-xs text-xs text-slate-500">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
                    <span>Analyzing clinical query & hospital schedule...</span>
                  </div>
                )}

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
                    id="chatbot-input"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Describe symptoms or ask about any medicine..."
                    disabled={isTyping}
                    className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                  />
                  <button
                    type="submit"
                    id="btn-send-chat"
                    disabled={!inputMessage.trim() || isTyping}
                    className="p-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl transition shadow-xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    title="Send message"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1.5 px-1">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    Sanjeevani AI Triage
                  </span>
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
