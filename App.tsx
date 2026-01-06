
import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Star, MapPin, Phone, Instagram, Facebook, Calendar, CheckCircle2, ChevronRight, Bell, AlertCircle, X, ShieldCheck, Circle, Lock, DollarSign, Quote, MessageSquareQuote, UserPlus, LogIn } from 'lucide-react';
import Navbar from './components/Navbar';
import BookingModal from './components/BookingModal';
import { SERVICES } from './constants.tsx';
import { Service, Booking, User, Review } from './types';

// Rastreabilidade de Origem para resolver origin_mismatch
console.log("%c[Studio Beleza] URL de Origem para o Google:", "color: #D4AF37; font-weight: bold;", window.location.origin);

const parseGoogleJwt = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("JWT Decode Error:", e);
    return null;
  }
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isDark, setIsDark] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('Todos');
  
  const absoluteMaxPrice = useMemo(() => Math.max(...SERVICES.map(s => s.price)), []);
  const [priceLimit, setPriceLimit] = useState<number>(absoluteMaxPrice);
  
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [showBookingsModal, setShowBookingsModal] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewForm, setReviewForm] = useState<{show: boolean, booking: Booking | null}>({ show: false, booking: null });
  const [tempRating, setTempRating] = useState(5);
  const [tempComment, setTempComment] = useState('');

  // Form States
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });
  const [authErrors, setAuthErrors] = useState({ name: '', email: '', password: '' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const GOOGLE_CLIENT_ID = '960714960514-64alkj98rp3fickruh6ou83jj5d48bi8.apps.googleusercontent.com';

  const passwordRequirements = useMemo(() => {
    return {
      length: authForm.password.length >= 6,
      hasNumber: /\d/.test(authForm.password),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(authForm.password)
    };
  }, [authForm.password]);

  useEffect(() => {
    const savedUser = localStorage.getItem('studio_user_session');
    const savedBookings = localStorage.getItem('studio_bookings_history');
    const savedTheme = localStorage.getItem('studio_luxury_theme');
    const savedReviews = localStorage.getItem('studio_luxury_reviews');

    if (savedUser) {
      try { setUser(JSON.parse(savedUser)); } catch (e) {}
    }
    
    if (savedBookings) {
      try { setBookings(JSON.parse(savedBookings)); } catch (e) {}
    }

    if (savedReviews) {
      try { setReviews(JSON.parse(savedReviews)); } catch (e) {}
    } else {
      const initialReviews: Review[] = [
        { id: '1', userName: 'Helena Souza', serviceName: 'Coloração + Mechas', rating: 5, comment: 'Atendimento impecável! O Studio superou todas as minhas expectativas de luxo e cuidado.', date: new Date().toISOString() },
        { id: '2', userName: 'Mariana Costa', serviceName: 'Pé e Mão', rating: 5, comment: 'O ambiente é relaxante e as profissionais são verdadeiras artistas.', date: new Date().toISOString() }
      ];
      setReviews(initialReviews);
      localStorage.setItem('studio_luxury_reviews', JSON.stringify(initialReviews));
    }

    if (savedTheme === 'dark') {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Inicialização Robusta do Google
  useEffect(() => {
    if (showLoginModal) {
      const initGoogle = () => {
        const g = (window as any).google;
        if (g?.accounts?.id) {
          console.log("[Studio Beleza] Inicializando Google SDK em:", window.location.origin);
          g.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleGoogleLogin,
            ux_mode: 'popup',
            cancel_on_tap_outside: false
          });
          const btn = document.getElementById("googleButton");
          if (btn) {
            g.accounts.id.renderButton(btn, { 
              theme: isDark ? "filled_black" : "outline", 
              size: "large", 
              width: "320", 
              shape: "pill" 
            });
          }
        } else {
          setTimeout(initGoogle, 500); // Tenta novamente em 500ms
        }
      };
      
      if (document.readyState === 'complete') {
        initGoogle();
      } else {
        window.addEventListener('load', initGoogle);
        return () => window.removeEventListener('load', initGoogle);
      }
    }
  }, [showLoginModal, isDark, authMode]);

  const handleGoogleLogin = (response: any) => {
    setIsProcessing(true);
    const data = parseGoogleJwt(response.credential);
    if (data && data.email_verified) {
      const newUser: User = { name: data.name, email: data.email, picture: data.picture, role: 'user' };
      setUser(newUser);
      localStorage.setItem('studio_user_session', JSON.stringify(newUser));
      showToast(`Bem-vinda, ${data.given_name}! Sua jornada VIP começou.`, 'success');
      setShowLoginModal(false);
    }
    setIsProcessing(false);
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleAuthAction = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setAuthErrors({ name: '', email: '', password: '' });

    const registeredUsers = JSON.parse(localStorage.getItem('studio_registered_users') || '[]');

    if (authMode === 'register') {
      if (!authForm.name || !authForm.email || !authForm.password) {
        showToast('Preencha todos os campos.', 'error');
        setIsProcessing(false);
        return;
      }
      if (registeredUsers.some((u: any) => u.email === authForm.email)) {
        setAuthErrors(prev => ({ ...prev, email: 'Este e-mail já possui cadastro.' }));
        setIsProcessing(false);
        return;
      }
      const newUserRecord = { ...authForm };
      registeredUsers.push(newUserRecord);
      localStorage.setItem('studio_registered_users', JSON.stringify(registeredUsers));
      showToast('Conta VIP criada! Por favor, acesse seu perfil.', 'success');
      setAuthMode('login');
      setIsProcessing(false);
    } else {
      const foundUser = registeredUsers.find((u: any) => u.email === authForm.email && u.password === authForm.password);
      if (!foundUser) {
        showToast('Credenciais não reconhecidas.', 'error');
        setAuthErrors({ name: '', email: 'Verifique suas credenciais', password: 'Senha pode estar incorreta' });
        setIsProcessing(false);
        return;
      }
      const sessionUser: User = { name: foundUser.name, email: foundUser.email, role: 'user' };
      setUser(sessionUser);
      localStorage.setItem('studio_user_session', JSON.stringify(sessionUser));
      showToast(`Bem-vinda de volta ao seu oásis de luxo, ${foundUser.name}!`, 'success');
      setShowLoginModal(false);
      setIsProcessing(false);
    }
  };

  const realizarLogout = () => {
    setUser(null);
    localStorage.removeItem('studio_user_session');
    
    // Limpeza completa do SDK do Google
    const g = (window as any).google;
    if (g?.accounts?.id) {
      g.accounts.id.disableAutoSelect();
    }
    
    showToast('Sessão encerrada com segurança. Até breve!', 'success');
  };

  const addBooking = (newBooking: Booking) => {
    const updatedBookings = [newBooking, ...bookings];
    setBookings(updatedBookings);
    localStorage.setItem('studio_bookings_history', JSON.stringify(updatedBookings));
    setSelectedService(null);
    showToast('Reserva confirmada! Seu horário está garantido. ✨', 'success');
  };

  const submitReview = () => {
    if (!reviewForm.booking || !user) return;
    const newReview: Review = {
      id: Math.random().toString(36).substr(2, 9),
      userName: user.name,
      userPicture: user.picture,
      serviceName: reviewForm.booking.serviceName,
      rating: tempRating,
      comment: tempComment,
      date: new Date().toISOString()
    };
    const updatedReviews = [newReview, ...reviews];
    setReviews(updatedReviews);
    localStorage.setItem('studio_luxury_reviews', JSON.stringify(updatedReviews));
    const updatedBookings = bookings.map(b => b.id === reviewForm.booking?.id ? { ...b, reviewed: true } : b);
    setBookings(updatedBookings);
    localStorage.setItem('studio_bookings_history', JSON.stringify(updatedBookings));
    showToast('Sua avaliação foi publicada. Agradecemos o feedback!', 'success');
    setReviewForm({ show: false, booking: null });
    setTempComment('');
    setTempRating(5);
  };

  const filteredServices = useMemo(() => {
    return SERVICES.filter(s => (activeCategory === 'Todos' || s.category === activeCategory) && s.price <= priceLimit);
  }, [activeCategory, priceLimit]);

  return (
    <div className="min-h-screen selection:bg-roseRefined selection:text-white transition-colors duration-500">
      <Navbar 
        user={user} 
        onLogout={realizarLogout} 
        onOpenLogin={() => { setShowLoginModal(true); setAuthMode('login'); }} 
        onViewBookings={() => setShowBookingsModal(true)} 
        onToggleTheme={() => setIsDark(!isDark)} 
        isDark={isDark} 
      />

      {toast && (
        <div className={`fixed top-28 right-6 z-[250] p-6 rounded-[2.5rem] shadow-2xl flex items-center space-x-5 border-l-4 animate-fade-up glass ${toast.type === 'success' ? 'border-green-500' : 'border-red-500'}`}>
          <div className={`p-3 rounded-full ${toast.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
            {toast.type === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
          </div>
          <div className="flex-1 text-sm font-medium">{toast.message}</div>
          <button onClick={() => setToast(null)}><X size={18} className="opacity-40" /></button>
        </div>
      )}

      {/* Hero */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        <img src="https://images.unsplash.com/photo-1562322140-8baeececf3df?q=80&w=1920&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover scale-105" alt="Hero" />
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"></div>
        <div className="relative z-10 text-center text-white animate-fade-up px-6">
          <h1 className="text-7xl md:text-9xl font-serif mb-6 leading-none tracking-tight">Studio <span className="text-roseRefined italic">Beleza</span></h1>
          <p className="text-xl md:text-2xl font-light mb-10 tracking-widest uppercase opacity-90">Sua Essência em Destaque Premium</p>
          <a href="#services" className="inline-block bg-white text-deepCharcoal px-14 py-6 rounded-full font-bold uppercase text-[10px] tracking-[0.3em] hover:bg-gold hover:text-white transition-all shadow-2xl">Explorar Menu de Serviços</a>
        </div>
      </section>

      {/* Serviços */}
      <section id="services" className="py-24 container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-serif mb-4 tracking-tight">Especialidades</h2>
          <div className="w-20 h-1 bg-gold mx-auto rounded-full"></div>
        </div>
        
        <div className="flex flex-wrap justify-center gap-4 mb-16">
          {['Todos', 'Unhas', 'Cabelo', 'Estética', 'Maquiagem'].map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-10 py-3.5 rounded-full text-[10px] font-bold uppercase tracking-widest border-2 transition-all ${activeCategory === cat ? 'bg-roseRefined border-roseRefined text-white shadow-xl scale-105' : 'border-roseRefined/20 text-warmGrey hover:border-roseRefined'}`}>{cat}</button>
          ))}
        </div>

        <div className="bento-grid">
          {filteredServices.map(service => (
            <div key={service.id} className="glass rounded-[3rem] overflow-hidden group cursor-pointer animate-fade-up border border-white/10 hover:shadow-2xl transition-all duration-500" onClick={() => user ? setSelectedService(service) : setShowLoginModal(true)}>
              <div className="h-72 overflow-hidden relative">
                <img src={service.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={service.name} />
                <div className="absolute top-6 right-6 bg-gold/90 text-white text-[9px] font-bold px-4 py-2 rounded-full uppercase tracking-widest backdrop-blur-md">R${service.price}</div>
              </div>
              <div className="p-10">
                <h3 className="text-3xl font-serif italic mb-4 group-hover:text-gold transition-colors">{service.name}</h3>
                <p className="text-sm text-warmGrey mb-8 line-clamp-2 font-light leading-relaxed">{service.description}</p>
                <div className="flex items-center text-[10px] font-bold uppercase tracking-widest text-roseRefined group-hover:translate-x-3 transition-transform group-hover:text-gold">Agendar Atendimento <ChevronRight size={14} className="ml-2" /></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Depoimentos */}
      <section className="py-24 bg-pearlWhite dark:bg-zinc-900/40">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-serif mb-4 italic tracking-tight">Vozes da <span className="text-gold">Excelência</span></h2>
            <p className="text-warmGrey font-light text-sm uppercase tracking-widest">A opinião de nossas clientes VIP</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {reviews.slice(0, 6).map(review => (
              <div key={review.id} className="glass p-10 rounded-[3rem] relative animate-fade-up border border-gold/5 hover:border-gold/30 transition-all group">
                <Quote size={40} className="absolute top-8 right-8 text-gold/10 group-hover:text-gold/20 transition-colors" />
                <div className="flex items-center space-x-1 mb-6">
                  {[...Array(5)].map((_, i) => <Star key={i} size={14} className={i < review.rating ? 'fill-gold text-gold' : 'text-warmGrey/20'} />)}
                </div>
                <p className="text-sm italic font-light mb-8 leading-relaxed opacity-80">"{review.comment}"</p>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center overflow-hidden border border-gold/20 golden-glow">
                    {review.userPicture ? <img src={review.userPicture} className="w-full h-full object-cover" /> : <ShieldCheck size={22} className="text-gold" />}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest">{review.userName}</h4>
                    <p className="text-[9px] text-roseRefined font-bold uppercase tracking-tighter">{review.serviceName}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modal de Acesso */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-black/80 backdrop-blur-2xl">
          <div className="glass w-full max-w-lg rounded-[4rem] p-12 md:p-16 animate-fade-up relative border border-white/20 shadow-2xl overflow-y-auto max-h-[90vh]">
            <button onClick={() => setShowLoginModal(false)} className="absolute top-10 right-10 p-3 hover:bg-roseRefined/10 rounded-full transition-all opacity-40 hover:opacity-100"><X size={28} /></button>
            
            <div className="text-center mb-10">
              <h2 className="text-4xl font-serif italic mb-2 tracking-tight">{authMode === 'login' ? 'Bem-vinda de Volta' : 'Assinatura VIP'}</h2>
              <p className="text-xs tracking-widest uppercase text-warmGrey font-medium">Acesso Exclusivo Studio Beleza</p>
            </div>

            {authMode === 'login' && <div id="googleButton" className="flex justify-center mb-10 transition-transform hover:scale-[1.02]"></div>}

            <div className="relative mb-10 text-center">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-roseRefined/10"></div></div>
              <span className="relative px-6 bg-white dark:bg-zinc-800 text-[9px] uppercase tracking-[0.4em] text-warmGrey font-bold">Ou Protocolo Manual</span>
            </div>

            <form onSubmit={handleAuthAction} className="space-y-6">
              {authMode === 'register' && (
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-warmGrey/60 ml-4">Nome Completo</label>
                  <input type="text" value={authForm.name} onChange={e => setAuthForm({...authForm, name: e.target.value})} placeholder="Seu nome" className="w-full p-6 rounded-3xl bg-white/40 dark:bg-black/20 border-2 border-roseRefined/5 focus:border-gold outline-none text-sm transition-all" />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold tracking-widest text-warmGrey/60 ml-4">E-mail de Cadastro</label>
                <input type="email" value={authForm.email} onChange={e => setAuthForm({...authForm, email: e.target.value})} placeholder="email@exemplo.com" className={`w-full p-6 rounded-3xl bg-white/40 dark:bg-black/20 border-2 outline-none text-sm transition-all ${authErrors.email ? 'border-red-500 animate-shake' : 'border-roseRefined/5 focus:border-gold'}`} />
                {authErrors.email && <p className="text-[9px] text-red-500 ml-4 font-bold uppercase tracking-tight">{authErrors.email}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold tracking-widest text-warmGrey/60 ml-4">Senha Secreta</label>
                <input type="password" value={authForm.password} onChange={e => setAuthForm({...authForm, password: e.target.value})} placeholder="••••••••" className="w-full p-6 rounded-3xl bg-white/40 dark:bg-black/20 border-2 border-roseRefined/5 focus:border-gold outline-none text-sm transition-all" />
              </div>

              <button type="submit" disabled={isProcessing} className="w-full py-6 bg-gradient-to-r from-roseRefined to-gold text-white rounded-3xl font-bold uppercase text-[10px] tracking-[0.3em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex justify-center items-center">
                {isProcessing ? <span className="animate-spin text-xl">⏳</span> : authMode === 'login' ? <><LogIn className="mr-3" size={18} /> Iniciar Sessão</> : <><UserPlus className="mr-3" size={18} /> Criar Registro VIP</>}
              </button>
            </form>

            <div className="mt-12 text-center border-t border-roseRefined/5 pt-8">
              <button onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')} className="text-[10px] uppercase font-bold tracking-widest text-gold hover:text-roseRefined transition-colors">
                {authMode === 'login' ? 'Ainda não é membro VIP? Associe-se' : 'Já possui registro? Entrar na conta'}
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedService && <BookingModal service={selectedService} onClose={() => setSelectedService(null)} onConfirm={addBooking} userEmail={user?.email} />}
      
      {showBookingsModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-2xl">
          <div className="glass w-full max-w-3xl rounded-[4rem] p-12 md:p-16 animate-fade-up relative max-h-[85vh] overflow-y-auto">
            <button onClick={() => setShowBookingsModal(false)} className="absolute top-10 right-10 p-3 hover:bg-roseRefined/10 rounded-full transition-all"><X size={28} /></button>
            <h2 className="text-5xl font-serif text-center mb-14 italic tracking-tight">Agenda <span className="text-gold">Signature</span></h2>
            <div className="space-y-8">
              {bookings.length === 0 ? <div className="text-center py-20 border-2 border-dashed border-roseRefined/10 rounded-[3rem]"><p className="opacity-40 font-serif text-3xl italic">Nenhuma reserva encontrada.</p></div> : bookings.map(b => (
                <div key={b.id} className="glass bg-white/20 p-10 rounded-[3rem] flex flex-col md:flex-row justify-between items-center group border border-gold/5 hover:border-gold/30 transition-all">
                  <div className="space-y-3 text-center md:text-left">
                    <h4 className="text-3xl font-serif text-gold italic group-hover:scale-105 transition-transform origin-left">{b.serviceName}</h4>
                    <p className="text-xs text-warmGrey tracking-[0.2em] uppercase font-bold">{b.date} às {b.time}</p>
                  </div>
                  <div className="flex items-center space-x-6 mt-6 md:mt-0">
                    {!b.reviewed && <button onClick={() => setReviewForm({show: true, booking: b})} className="px-10 py-3.5 bg-roseRefined text-white rounded-full text-[9px] font-bold uppercase tracking-[0.2em] hover:bg-gold transition-all shadow-lg">Avaliar</button>}
                    <span className="text-3xl font-serif font-bold tracking-tighter">R$ {b.total}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {reviewForm.show && reviewForm.booking && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-2xl">
          <div className="glass w-full max-w-lg rounded-[4rem] p-16 animate-fade-up relative border border-white/10">
            <button onClick={() => setReviewForm({show: false, booking: null})} className="absolute top-10 right-10 p-2 opacity-40 hover:opacity-100"><X size={28} /></button>
            <div className="text-center mb-10"><MessageSquareQuote size={56} className="mx-auto text-gold/30 mb-6" /><h2 className="text-4xl font-serif italic mb-2 tracking-tight">Experiência do Cliente</h2><p className="text-[10px] text-warmGrey uppercase tracking-widest">{reviewForm.booking.serviceName}</p></div>
            <div className="space-y-10">
              <div className="flex justify-center space-x-4">{[1, 2, 3, 4, 5].map(star => <button key={star} onClick={() => setTempRating(star)} className="transition-transform active:scale-90"><Star size={36} className={`${star <= tempRating ? 'fill-gold text-gold scale-110 drop-shadow-[0_0_8px_rgba(212,175,55,0.4)]' : 'text-warmGrey/20'} transition-all duration-300`} /></button>)}</div>
              <textarea value={tempComment} onChange={e => setTempComment(e.target.value)} placeholder="Como foi sua jornada premium hoje?" className="w-full p-8 rounded-[2.5rem] bg-white/40 dark:bg-black/30 border border-gold/10 outline-none h-40 resize-none font-light text-sm" />
              <button onClick={submitReview} className="w-full py-6 bg-gold text-white rounded-[2rem] font-bold uppercase text-[10px] tracking-[0.4em] shadow-2xl hover:scale-[1.02] active:scale-95 transition-all">Publicar Avaliação</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
