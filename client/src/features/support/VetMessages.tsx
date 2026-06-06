import React, { useState } from 'react';
import { Search, Send, Paperclip, AlertTriangle, Info, ShieldAlert, Phone, MapPin, Wheat, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

// Mock Data
const mockFarmers = [
  { id: 'F001', name: 'Arjun Sunrise Farm', phone: '+91 98765 43210', location: 'Pune District', cows: 45, unread: 2 },
  { id: 'F002', name: 'Bhoomi Dairy', phone: '+91 87654 32109', location: 'Nashik District', cows: 12, unread: 0 },
  { id: 'F003', name: 'Suresh Patel', phone: '+91 76543 21098', location: 'Ahmednagar', cows: 8, unread: 0 },
  { id: 'F004', name: 'Green Meadows Inc', phone: '+91 65432 10987', location: 'Satara', cows: 120, unread: 1 },
];

const initialMessages = [
  { id: 1, sender: 'farmer', text: 'Doctor, the new feed mix seems to be causing diarrhea in calf TAG-009.', time: '10:30 AM', type: 'general' },
  { id: 2, sender: 'vet', text: 'Stop the new concentrate immediately. Give only dry fodder and oral rehydration salts for 24 hours. I will visit tomorrow.', time: '10:45 AM', type: 'urgent' },
  { id: 3, sender: 'farmer', text: 'Noted. Have isolated the calf as well.', time: '11:00 AM', type: 'general' },
];

export default function VetMessages() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFarmerId, setSelectedFarmerId] = useState(mockFarmers[0].id);
  const [messages, setMessages] = useState(initialMessages);
  const [newMessage, setNewMessage] = useState('');
  const [instructionType, setInstructionType] = useState('general'); // general, diet, urgent

  const selectedFarmer = mockFarmers.find(f => f.id === selectedFarmerId);
  const filteredFarmers = mockFarmers.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const newMsg = {
      id: messages.length + 1,
      sender: 'vet',
      text: newMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: instructionType,
    };

    setMessages([...messages, newMsg]);
    setNewMessage('');
    toast.success('Instruction sent to farmer');
  };

  const getMessageStyle = (type: string, isSender: boolean) => {
    if (!isSender) return 'bg-white border border-slate-200 text-slate-800'; // Farmer message

    // Vet Instruction styles based on type
    switch (type) {
      case 'urgent':
        return 'bg-rose-50 border border-rose-200 text-rose-900';
      case 'diet':
        return 'bg-amber-50 border border-amber-200 text-amber-900';
      case 'general':
      default:
        return 'bg-teal-600 text-white shadow-md shadow-teal-500/20';
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-8rem)]">
      
      {/* Sidebar: Farmer Directory */}
      <div className="w-full md:w-80 flex flex-col bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden shrink-0 h-full">
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <h2 className="font-bold text-slate-900 mb-4">Farmer Directory</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search farmers..." 
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredFarmers.map(farmer => (
            <button
              key={farmer.id}
              onClick={() => setSelectedFarmerId(farmer.id)}
              className={`w-full text-left p-3 rounded-xl transition-all flex items-center justify-between ${
                selectedFarmerId === farmer.id 
                  ? 'bg-teal-50 border border-teal-100 ring-1 ring-teal-500' 
                  : 'hover:bg-slate-50 border border-transparent'
              }`}
            >
              <div>
                <h3 className={`font-bold text-sm ${selectedFarmerId === farmer.id ? 'text-teal-900' : 'text-slate-900'}`}>
                  {farmer.name}
                </h3>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                  <MapPin className="h-3 w-3" /> {farmer.location}
                </p>
              </div>
              {farmer.unread > 0 && (
                <span className="bg-rose-500 text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center">
                  {farmer.unread}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat/Instruction Interface */}
      {selectedFarmer ? (
        <div className="flex-1 flex flex-col bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden h-full">
          
          {/* Chat Header */}
          <div className="p-4 border-b border-slate-200 bg-white flex items-center justify-between shrink-0">
            <div>
              <h2 className="font-bold text-lg text-slate-900">{selectedFarmer.name}</h2>
              <div className="flex items-center gap-4 mt-1 text-xs font-medium text-slate-500">
                <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> {selectedFarmer.phone}</span>
                <span className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md text-slate-700">
                  Total Herd: {selectedFarmer.cows} Cows
                </span>
              </div>
            </div>
            <button className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-2">
              <FileText className="h-4 w-4" /> View Farm Medical History
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 bg-slate-50 space-y-6">
            <div className="text-center">
              <span className="bg-slate-200 text-slate-500 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                Today, {new Date().toLocaleDateString()}
              </span>
            </div>

            {messages.map((msg) => (
              <div key={msg.id} className={`flex flex-col ${msg.sender === 'vet' ? 'items-end' : 'items-start'}`}>
                
                {/* Instruction Type Badge (for Vet messages only) */}
                {msg.sender === 'vet' && msg.type !== 'general' && (
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-t-lg border-t border-x flex items-center gap-1 ${
                    msg.type === 'urgent' ? 'bg-rose-100 text-rose-700 border-rose-200' : 'bg-amber-100 text-amber-700 border-amber-200'
                  }`}>
                    {msg.type === 'urgent' ? <AlertTriangle className="h-3 w-3" /> : <Wheat className="h-3 w-3" />}
                    {msg.type === 'urgent' ? 'Urgent Medical Directive' : 'Dietary Instruction'}
                  </span>
                )}

                {/* Message Bubble */}
                <div className={`max-w-[80%] md:max-w-[60%] p-4 rounded-2xl ${msg.sender === 'vet' && msg.type !== 'general' ? 'rounded-tr-none' : ''} ${getMessageStyle(msg.type, msg.sender === 'vet')}`}>
                  <p className="text-sm font-medium leading-relaxed">{msg.text}</p>
                </div>
                
                <span className="text-[10px] text-slate-400 font-medium mt-1.5 px-1">{msg.time}</span>
              </div>
            ))}
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-slate-200 bg-white shrink-0">
            <form onSubmit={handleSendMessage} className="flex flex-col gap-3">
              
              {/* Instruction Tagging */}
              <div className="flex gap-2">
                <button 
                  type="button"
                  onClick={() => setInstructionType('general')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg border flex items-center gap-1.5 transition-all ${instructionType === 'general' ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                >
                  <Info className="h-3.5 w-3.5" /> General Advice
                </button>
                <button 
                  type="button"
                  onClick={() => setInstructionType('diet')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg border flex items-center gap-1.5 transition-all ${instructionType === 'diet' ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                >
                  <Wheat className="h-3.5 w-3.5" /> Diet / Feed
                </button>
                <button 
                  type="button"
                  onClick={() => setInstructionType('urgent')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg border flex items-center gap-1.5 transition-all ${instructionType === 'urgent' ? 'bg-rose-100 text-rose-800 border-rose-200' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                >
                  <ShieldAlert className="h-3.5 w-3.5" /> Urgent Medical Alert
                </button>
              </div>

              <div className="flex items-end gap-3">
                <button type="button" className="p-3 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-colors shrink-0">
                  <Paperclip className="h-5 w-5" />
                </button>
                
                <div className="flex-1 relative">
                  <textarea 
                    rows={2}
                    placeholder="Type official medical instructions or advice..."
                    className="w-full p-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none text-sm resize-none"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }}
                  />
                </div>
                
                <button 
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="p-3 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl shadow-md transition-all shrink-0"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center bg-white border border-slate-200 rounded-2xl shadow-sm text-slate-400 h-full">
          <Info className="h-12 w-12 mb-4 opacity-20" />
          <p className="font-medium text-sm">Select a farmer from the directory to send instructions.</p>
        </div>
      )}
    </div>
  );
}
