import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Mic, 
  MapPin, 
  Camera, 
  Paperclip, 
  CheckCheck, 
  Sparkles, 
  ShieldCheck, 
  Phone, 
  MoreVertical,
  Play,
  RotateCcw,
  ExternalLink,
  ChevronRight,
  Info
} from 'lucide-react';
import { Grievance } from '../../types';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  isVoice?: boolean;
  voiceDuration?: string;
  timestamp: string;
  ticketId?: string;
  hasPhoto?: boolean;
  photoUrl?: string;
}

interface WhatsAppBotSimulatorProps {
  onTicketGenerated?: (grievance: Partial<Grievance>) => void;
  onViewOnMap?: (ticketId: string) => void;
}

export const WhatsAppBotSimulator: React.FC<WhatsAppBotSimulatorProps> = ({
  onTicketGenerated,
  onViewOnMap
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      sender: 'bot',
      text: '🙏 *Namaste / Vanakkam!* Welcome to *CivicPulse AI (Govt of India DPI Gateway)*.\n\nYou can report civic issues like blocked drains, broken roads, drinking water leaks, or power outages in *any Indian language* by sending a voice note, photo, or text message.',
      timestamp: '10:00 AM'
    },
    {
      id: 'm2',
      sender: 'user',
      text: 'எங்கள் தெருவில் மழைநீர் வடிகால் அடைபட்டுள்ளதால், கழிவுநீர் வீடுகளுக்குள் நுழைகிறது. உடனடியாக தூர்வார வேண்டும். (Goripalayam, Madurai)',
      isVoice: true,
      voiceDuration: '0:14',
      timestamp: '10:02 AM'
    },
    {
      id: 'm3',
      sender: 'bot',
      text: '✅ *வணக்கம்! Voice Grievance Logged.*\n\n• *Issue:* Stormwater drain choking & sewage overflow\n• *Sector:* Ministry of Housing & Urban Affairs (AMRUT 2.0)\n• *Ticket ID:* `#CP-1042`\n• *Priority:* 9/10 (High Severity)\n• *Weather Alert:* ⚠️ IMD 78mm downpour forecasted within 48h. Municipal pre-emptive desilting order triggered.\n\nType *"Status"* anytime to track your ticket.',
      ticketId: 'CP-1042',
      timestamp: '10:02 AM'
    }
  ]);

  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend?: string, isAudio = false) => {
    const text = textToSend || inputVal;
    if (!text.trim()) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text,
      isVoice: isAudio,
      voiceDuration: isAudio ? '0:18' : undefined,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal('');
    setIsTyping(true);

    // Call server Gemini API or generate intelligent local reply
    try {
      const res = await fetch('/api/ai/whatsapp-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userMessage: text,
          userLanguage: 'auto'
        })
      });

      const data = await res.json();
      const generatedTicketId = `CP-${Math.floor(1055 + Math.random() * 850)}`;

      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: data.reply || `🙏 Thank you. Your request regarding "${text.slice(0, 40)}..." has been received.\n\n• *Ticket ID:* #${generatedTicketId}\n• *Status:* Dispatched to Ward Municipal Officer\n• *Public Map:* Automatically pinned on CivicPulse Public Heatmap.`,
        ticketId: generatedTicketId,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, botMsg]);

      // Add to global state so it displays on map
      if (onTicketGenerated) {
        onTicketGenerated({
          title: `WhatsApp Grievance: ${text.slice(0, 45)}...`,
          description: text,
          category: 'flood_drainage',
          district: 'Madurai',
          talukOrWard: 'Ward 14 (Goripalayam)',
          coordinates: { lat: 9.9328, lng: 78.1294 },
          urgencyScore: 8,
          originalLanguage: 'WhatsApp Vernacular'
        });
      }
    } catch {
      const fallbackTicket = `CP-${Math.floor(1060 + Math.random() * 800)}`;
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: `🙏 *Namaste!* Your civic report has been received and verified by CivicPulse AI.\n\n• *Ticket ID:* #${fallbackTicket}\n• *Assigned Unit:* Madurai Municipal Corporation (Unit 4)\n• *Status:* Scheduled for site inspection`,
          ticketId: fallbackTicket,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[600px]">
      {/* WhatsApp Header */}
      <div className="bg-[#075e54] text-white px-4 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-emerald-800 border-2 border-emerald-400 flex items-center justify-center font-bold text-xs">
              🇮🇳 CP
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#075e54]" />
          </div>

          <div>
            <div className="flex items-center gap-1.5 font-bold text-sm">
              <span>CivicPulse DPI Bot</span>
              <ShieldCheck className="w-4 h-4 text-emerald-300 fill-emerald-300" />
            </div>
            <div className="text-[11px] text-emerald-200">
              Official Govt of India Gateway • Online (AI)
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 text-emerald-100">
          <Phone className="w-4 h-4" />
          <MoreVertical className="w-4 h-4" />
        </div>
      </div>

      {/* WhatsApp Chat Conversation Canvas */}
      <div 
        className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0b141a] bg-radial from-slate-900/60 to-slate-950"
        style={{
          backgroundImage: 'radial-gradient(#1e293b 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }}
      >
        <div className="text-center">
          <span className="bg-[#182229] text-slate-400 text-[10px] font-semibold px-2.5 py-1 rounded-lg border border-slate-800">
            Messages are end-to-end encrypted with Digital Public Infrastructure
          </span>
        </div>

        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-3 shadow-md text-xs leading-relaxed space-y-1.5 ${
                m.sender === 'user'
                  ? 'bg-[#005c4b] text-white rounded-tr-xs'
                  : 'bg-[#202c33] text-slate-100 rounded-tl-xs border border-slate-700/50'
              }`}
            >
              {/* Voice note waveform representation */}
              {m.isVoice && (
                <div className="flex items-center gap-2 bg-black/20 p-2 rounded-xl mb-1 text-[11px]">
                  <div className="w-7 h-7 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shrink-0">
                    <Play className="w-3.5 h-3.5 fill-slate-950 ml-0.5" />
                  </div>
                  <div className="flex-1 flex items-center gap-0.5 h-4">
                    {[40, 70, 30, 90, 60, 80, 50, 95, 45, 65, 85, 30, 70].map((h, i) => (
                      <span
                        key={i}
                        className="w-1 bg-emerald-300 rounded-full"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] text-emerald-200">{m.voiceDuration}</span>
                </div>
              )}

              {/* Message body */}
              <div className="whitespace-pre-line">{m.text}</div>

              {/* Action pill if ticket exists */}
              {m.ticketId && onViewOnMap && (
                <div className="pt-1.5 border-t border-slate-700/60 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-emerald-300">Ticket #{m.ticketId}</span>
                  <button
                    onClick={() => onViewOnMap(m.ticketId!)}
                    className="flex items-center gap-1 text-[10px] font-bold text-amber-300 hover:text-amber-200 bg-amber-500/10 px-2 py-0.5 rounded cursor-pointer"
                  >
                    <span>View on Live Map</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              )}

              <div className="flex items-center justify-end gap-1 text-[10px] text-slate-400">
                <span>{m.timestamp}</span>
                {m.sender === 'user' && <CheckCheck className="w-3.5 h-3.5 text-cyan-400" />}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-1.5 bg-[#202c33] text-slate-400 text-xs px-3 py-2 rounded-xl w-fit">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
            <span>CivicPulse AI is typing...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Action Prompts for Testing */}
      <div className="bg-[#111b21] border-t border-slate-800 p-2 flex items-center gap-1.5 overflow-x-auto whitespace-nowrap text-[11px]">
        <span className="text-slate-400 shrink-0 px-1 text-[10px] font-bold uppercase">Quick Sim:</span>
        <button
          onClick={() => handleSendMessage('🎤 [Voice Note in Tamil] சாக்கடை அடைப்பு, Sellur Ward 22', true)}
          className="bg-[#202c33] hover:bg-slate-700 text-emerald-300 px-2.5 py-1 rounded-full border border-emerald-500/30 shrink-0 cursor-pointer"
        >
          Send Tamil Voice Note
        </button>
        <button
          onClick={() => handleSendMessage('अस्सी घाट के पास गंदे पानी की समस्या का क्या स्टेटस है? (Ticket #CP-1031)')}
          className="bg-[#202c33] hover:bg-slate-700 text-amber-300 px-2.5 py-1 rounded-full border border-amber-500/30 shrink-0 cursor-pointer"
        >
          Hindi Status Check
        </button>
        <button
          onClick={() => handleSendMessage('📍 Live GPS Location: Lat 9.9328, Lng 78.1294 (Madurai High School Crossing)')}
          className="bg-[#202c33] hover:bg-slate-700 text-cyan-300 px-2.5 py-1 rounded-full border border-cyan-500/30 shrink-0 cursor-pointer"
        >
          Share Live GPS Pin
        </button>
      </div>

      {/* Input Field and Send Button */}
      <div className="bg-[#202c33] p-2.5 flex items-center gap-2 border-t border-slate-700/50">
        <button
          onClick={() => handleSendMessage('🎤 Voice recording: Drainage culvert overflowing near market', true)}
          className="text-slate-400 hover:text-emerald-400 p-1.5 rounded-lg transition"
          title="Send voice note"
        >
          <Mic className="w-5 h-5 text-emerald-400" />
        </button>

        <button
          onClick={() => handleSendMessage('📍 Current Location: Madurai Ward 14')}
          className="text-slate-400 hover:text-cyan-400 p-1.5 rounded-lg transition"
          title="Share GPS Location"
        >
          <MapPin className="w-5 h-5" />
        </button>

        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Message in Hindi, Tamil, Telugu, English..."
          className="flex-1 bg-[#2a3942] text-white placeholder:text-slate-400 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
        />

        <button
          onClick={() => handleSendMessage()}
          disabled={!inputVal.trim()}
          className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white p-2 rounded-xl transition cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
