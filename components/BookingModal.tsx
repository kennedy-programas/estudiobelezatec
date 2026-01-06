
import React, { useState, useEffect } from 'react';
import { X, Check, Copy, AlertCircle, QrCode, Mail, UserCheck, ShieldCheck, Bell, MessageCircle } from 'lucide-react';
import { Service, Booking } from '../types';
import { TIME_SLOTS } from '../constants.tsx';

interface BookingModalProps {
  service: Service;
  onClose: () => void;
  onConfirm: (booking: Booking) => void;
  userEmail?: string;
}

const BookingModal: React.FC<BookingModalProps> = ({ service, onClose, onConfirm, userEmail }) => {
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [observation, setObservation] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCopied, setShowCopied] = useState(false);
  const [showWaitlistSuccess, setShowWaitlistSuccess] = useState(false);

  const dates = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    return d.toISOString().split('T')[0];
  });

  const handleNext = () => {
    if (step === 2 && (!selectedDate || !selectedTime)) {
      return;
    }
    setStep(step + 1);
  };

  const handleFinish = () => {
    setLoading(true);
    setTimeout(() => {
      const newBooking: Booking = {
        id: 'RES-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
        serviceId: service.id,
        serviceName: service.name,
        date: selectedDate,
        time: selectedTime,
        observation,
        total: service.price,
        status: 'Confirmado',
        createdAt: new Date().toISOString(),
      };
      onConfirm(newBooking);
      setLoading(false);
    }, 2000);
  };

  const copyPix = () => {
    navigator.clipboard.writeText("00020126360014BR.GOV.BCB.PIX2568875200014");
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  const handleWaitlist = () => {
    if (!selectedDate || !selectedTime) {
      alert("Por favor, selecione uma data e horário para a lista de espera.");
      return;
    }

    const formattedDate = new Date(selectedDate + 'T12:00:00').toLocaleDateString('pt-BR');
    const message = `Olá! Gostaria de entrar na lista de espera para o serviço *${service.name}* no dia *${formattedDate}* às *${selectedTime}*. Por favor, me avisem se este horário vagar!`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/551140041234?text=${encodedMessage}`;

    // Simulação de sucesso visual antes de abrir o link
    setShowWaitlistSuccess(true);
    setTimeout(() => {
      window.open(whatsappUrl, '_blank');
      setShowWaitlistSuccess(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-xl overflow-y-auto">
      <div className="glass w-full max-w-4xl rounded-[4rem] shadow-2xl relative animate-fade-up overflow-hidden my-auto border border-white/20">
        <button onClick={onClose} className="absolute top-8 right-10 p-3 hover:bg-roseRefined/10 rounded-full transition-all z-[110]">
          <X size={28} />
        </button>

        <div className="flex flex-col md:flex-row max-h-[95vh]">
          <div className="hidden md:flex flex-col bg-roseRefined/5 w-72 p-14 space-y-14 flex-shrink-0 border-r border-roseRefined/10">
            <div className="mb-6">
              <h4 className="text-[10px] uppercase tracking-[0.4em] text-roseRefined font-bold mb-3">Sua Experiência</h4>
              <p className="font-serif italic text-2xl leading-tight text-gold">{service.name}</p>
            </div>
            {[1, 2, 3].map((s) => (
              <div key={s} className={`flex items-center space-x-5 transition-all duration-700 ${step >= s ? 'text-gold' : 'text-warmGrey/30'}`}>
                <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center font-bold transition-all ${step === s ? 'bg-gold text-white border-gold shadow-lg shadow-gold/30' : step > s ? 'border-gold bg-gold/10' : 'border-current'}`}>
                  {step > s ? <Check size={24} /> : s}
                </div>
                <span className={`text-[10px] uppercase tracking-[0.3em] font-bold ${step === s ? 'opacity-100' : 'opacity-40'}`}>
                  {s === 1 ? 'Personalizar' : s === 2 ? 'Agenda' : 'Finalizar'}
                </span>
              </div>
            ))}
          </div>

          <div className="md:hidden flex w-full h-2 bg-roseRefined/10">
            <div className="bg-gold h-full transition-all duration-1000 ease-in-out" style={{ width: `${(step / 3) * 100}%` }}></div>
          </div>

          <div className="flex-1 p-10 md:p-16 overflow-y-auto bg-white/30 dark:bg-zinc-900/30 relative">
            {showWaitlistSuccess && (
              <div className="absolute inset-0 z-[120] bg-white/95 dark:bg-zinc-900/95 flex flex-col items-center justify-center p-10 text-center animate-fade-up">
                <div className="p-6 bg-gold/10 rounded-full text-gold mb-8 animate-bounce">
                  <Bell size={64} />
                </div>
                <h3 className="text-4xl font-serif mb-4 italic">Lista de Espera Ativada</h3>
                <p className="text-warmGrey font-light mb-8 max-w-sm">Solicitação enviada via WhatsApp. O Concierge entrará em contato assim que este horário for liberado.</p>
                <div className="flex items-center space-x-2 text-gold font-bold text-[10px] uppercase tracking-widest">
                  <span className="w-2 h-2 bg-gold rounded-full animate-ping"></span>
                  <span>Redirecionando para o Concierge...</span>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-10 animate-fade-up">
                <div>
                  <h2 className="text-5xl font-serif mb-4 leading-tight">Configurações <br /><span className="text-gold italic">Sob Medida</span></h2>
                  <p className="text-warmGrey font-light text-lg">Especifique suas preferências para um atendimento impecável.</p>
                </div>
                
                <div className="space-y-4">
                  <label className="text-[11px] font-bold uppercase tracking-[0.3em] text-roseRefined">Preferências e Observações</label>
                  <textarea 
                    value={observation}
                    onChange={(e) => setObservation(e.target.value)}
                    className="w-full p-8 rounded-[2.5rem] border-2 border-roseRefined/5 focus:border-gold outline-none h-48 resize-none transition-all dark:bg-black/50 text-base font-light leading-relaxed shadow-inner"
                    placeholder="Ex: Alergias, preferência de cor, ou ambiente silencioso..."
                  />
                </div>

                <button 
                  onClick={handleNext}
                  className="w-full py-6 bg-gradient-to-r from-roseRefined to-gold text-white rounded-3xl font-bold shadow-2xl hover:scale-[1.03] active:scale-95 transition-all uppercase text-[10px] tracking-[0.3em]"
                >
                  Continuar Experiência
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-10 animate-fade-up">
                <div>
                  <h2 className="text-5xl font-serif mb-3 leading-tight">Sua <span className="text-gold italic">Agenda</span></h2>
                  <p className="text-sm text-warmGrey font-light tracking-wide">Selecione o momento ideal em nossa disponibilidade VIP.</p>
                </div>
                
                <div className="space-y-5">
                  <label className="text-[11px] font-bold uppercase tracking-[0.3em] text-roseRefined">Selecione o Dia</label>
                  <div className="flex space-x-4 overflow-x-auto pb-6 scrollbar-hide -mx-2 px-2">
                    {dates.map((d) => {
                      const dateObj = new Date(d + 'T12:00:00');
                      const dayName = dateObj.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
                      const dayNum = dateObj.getDate();
                      const isSelected = selectedDate === d;
                      return (
                        <button 
                          key={d}
                          onClick={() => setSelectedDate(d)}
                          className={`flex-shrink-0 w-20 h-28 rounded-[2rem] flex flex-col items-center justify-center transition-all duration-700 border-2 ${isSelected ? 'bg-gold border-gold text-white shadow-2xl scale-110' : 'bg-white/50 dark:bg-white/5 border-transparent hover:border-gold/30'}`}
                        >
                          <span className={`text-[10px] uppercase font-bold tracking-widest mb-2 ${isSelected ? 'opacity-80' : 'opacity-40'}`}>{dayName}</span>
                          <span className="text-2xl font-serif font-bold">{dayNum}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-5">
                  <label className="text-[11px] font-bold uppercase tracking-[0.3em] text-roseRefined">Horários Exclusivos</label>
                  <div className="grid grid-cols-3 gap-4 md:gap-5">
                    {TIME_SLOTS.map((t) => {
                      const isSelected = selectedTime === t;
                      return (
                        <button 
                          key={t}
                          onClick={() => setSelectedTime(t)}
                          className={`py-5 rounded-2xl border-2 text-sm font-bold tracking-widest transition-all duration-500 ${isSelected ? 'border-gold bg-gold/10 text-gold scale-[1.05] shadow-lg' : 'border-transparent bg-white/50 dark:bg-white/5 hover:border-gold/30'}`}
                        >
                          {t}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-4 border-t border-roseRefined/10">
                  <button 
                    onClick={handleWaitlist}
                    disabled={!selectedDate || !selectedTime}
                    className="w-full flex items-center justify-center space-x-3 py-4 bg-warmGrey/5 hover:bg-gold/10 text-warmGrey hover:text-gold rounded-2xl font-bold transition-all border border-transparent hover:border-gold/20 text-[9px] uppercase tracking-[0.3em] disabled:opacity-30 active:scale-95"
                  >
                    <Bell size={14} />
                    <span>Entrar na Lista de Espera VIP</span>
                  </button>
                  <p className="text-[9px] text-center mt-3 text-warmGrey/40 uppercase tracking-widest italic">Horário indisponível? Peça para ser avisado via WhatsApp.</p>
                </div>

                <div className="flex space-x-5 pt-2">
                  <button onClick={() => setStep(1)} className="flex-1 py-5 border-2 border-gold/30 rounded-2xl font-bold text-gold text-[10px] uppercase tracking-widest hover:bg-gold/5 transition-all">Voltar</button>
                  <button 
                    disabled={!selectedDate || !selectedTime}
                    onClick={handleNext}
                    className="flex-[2] py-5 bg-gold text-white rounded-2xl font-bold shadow-2xl disabled:opacity-20 transition-all text-[10px] uppercase tracking-[0.3em] active:scale-95"
                  >
                    Confirmar Reserva
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-10 text-center animate-fade-up">
                <div className="space-y-4">
                  <div className="inline-flex p-6 bg-gold/10 rounded-full text-gold mb-4 border border-gold/20 shadow-lg">
                    <ShieldCheck size={50} />
                  </div>
                  <h2 className="text-5xl font-serif leading-tight">Garantia de <br /><span className="text-gold italic">Exclusividade</span></h2>
                  
                  {userEmail && (
                    <div className="inline-flex items-center space-x-3 px-6 py-2.5 bg-gold/5 border border-gold/20 rounded-full text-[11px] text-gold font-bold uppercase tracking-[0.2em] shadow-sm">
                      <Mail size={16} />
                      <span>Comprovante: {userEmail}</span>
                    </div>
                  )}
                </div>

                <p className="text-base text-warmGrey px-6 font-light leading-relaxed max-w-lg mx-auto">
                  Para assegurar sua vaga, solicitamos uma taxa de reserva simbólica de <strong className="text-deepCharcoal dark:text-pearlWhite font-bold">R$ 8,00</strong>. Este valor será totalmente deduzido no fechamento do seu atendimento.
                </p>

                <div className="bg-gold/5 dark:bg-white/5 p-10 rounded-[3.5rem] space-y-8 border-2 border-dashed border-gold/30 relative">
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-5 py-1.5 bg-gold text-white text-[9px] font-bold uppercase tracking-[0.4em] rounded-full shadow-lg">Pagamento PIX</div>
                  <img 
                    src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=00020126360014BR.GOV.BCB.PIX2568875200014" 
                    alt="Boutique QR PIX" 
                    className="mx-auto rounded-3xl shadow-2xl w-48 h-48 md:w-56 md:h-56 p-3 bg-white"
                  />
                  <div className="relative group max-w-xs mx-auto">
                    <input 
                      readOnly 
                      value="00020126360014BR.GOV.BCB.PIX..."
                      className="w-full bg-white dark:bg-black/30 p-5 rounded-2xl text-center font-mono text-xs border border-gold/10 focus:border-gold outline-none transition-all pr-14"
                    />
                    <button 
                      onClick={copyPix}
                      className="absolute right-2 top-2 bottom-2 px-3 bg-gold text-white rounded-xl hover:bg-gold/90 active:scale-90 transition-all"
                    >
                      {showCopied ? <Check size={18} /> : <Copy size={18} />}
                    </button>
                  </div>
                </div>

                <div className="flex space-x-5 pt-8">
                  <button onClick={() => setStep(2)} className="flex-1 py-5 border-2 border-gold/30 rounded-2xl font-bold text-gold text-[10px] uppercase tracking-widest">Ajustar</button>
                  <button 
                    onClick={handleFinish}
                    disabled={loading}
                    className="flex-[2] py-5 bg-gradient-to-r from-roseRefined to-gold text-white rounded-2xl font-bold shadow-2xl flex items-center justify-center space-x-4 text-[11px] uppercase tracking-[0.3em] active:scale-95 transition-all"
                  >
                    {loading ? (
                      <span className="animate-spin text-2xl">⏳</span>
                    ) : (
                      <>
                        <UserCheck size={22} />
                        <span>Confirmar Pagamento</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
