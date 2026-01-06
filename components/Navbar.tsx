
import React, { useState, useRef, useEffect } from 'react';
import { User, LogOut, Calendar, UserCircle, Sun, Moon, Menu, X, Settings, ChevronDown, Bell, Shield } from 'lucide-react';

interface NavbarProps {
  user: any;
  onLogout: () => void;
  onOpenLogin: () => void;
  onViewBookings: () => void;
  onToggleTheme: () => void;
  isDark: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout, onOpenLogin, onViewBookings, onToggleTheme, isDark }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass shadow-md px-6 py-4 flex justify-between items-center transition-all duration-500 border-b border-roseRefined/10">
      <div className="text-2xl md:text-3xl font-serif font-bold tracking-widest group cursor-pointer">
        STUDIO <span className="text-roseRefined italic group-hover:text-gold transition-colors">BELEZA</span>
      </div>

      <div className="hidden md:flex items-center space-x-10">
        <a href="#home" className="hover:text-roseRefined transition-colors font-semibold uppercase text-xs tracking-[0.2em]">Início</a>
        <a href="#services" className="hover:text-roseRefined transition-colors font-semibold uppercase text-xs tracking-[0.2em]">Serviços</a>
        
        <button onClick={onToggleTheme} className="p-2.5 rounded-full hover:bg-roseRefined/10 transition-all active:scale-90">
          {isDark ? <Sun size={20} className="text-gold" /> : <Moon size={20} className="text-deepCharcoal" />}
        </button>

        {user ? (
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center space-x-3 bg-white/40 dark:bg-white/5 p-1 pr-4 rounded-full font-semibold border border-roseRefined/20 hover:border-gold transition-all group shadow-sm"
            >
              {/* Profile image with Golden Glow effect */}
              <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-[#D4AF37] golden-glow transition-transform group-hover:scale-110 flex items-center justify-center bg-pearlWhite">
                {user.picture ? (
                  <img src={user.picture} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <UserCircle className="w-full h-full text-[#D4AF37] p-1.5" />
                )}
              </div>
              <div className="flex flex-col items-start leading-tight">
                <span className="text-sm font-bold tracking-tight">{user.name.split(' ')[0]}</span>
                <span className="text-[10px] text-gold font-bold uppercase tracking-wider flex items-center">
                  <Shield size={8} className="mr-1" /> VIP
                </span>
              </div>
              <ChevronDown size={14} className={`text-roseRefined transition-transform duration-300 ${showDropdown ? 'rotate-180' : ''}`} />
            </button>
            
            {showDropdown && (
              <div className="absolute right-0 mt-4 w-72 glass rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden py-4 animate-fade-up border border-roseRefined/10">
                <div className="px-8 py-6 border-b border-roseRefined/5 mb-2 bg-roseRefined/5">
                  <p className="font-bold text-base truncate mb-1 tracking-tight">{user.name}</p>
                  <p className="text-[10px] opacity-40 truncate uppercase tracking-[0.2em] font-medium">{user.email}</p>
                </div>
                
                <button 
                  onClick={() => { setShowDropdown(false); onViewBookings(); }}
                  className="w-full text-left px-8 py-4 flex items-center space-x-4 hover:bg-roseRefined/10 transition-colors group/item"
                >
                  <div className="p-2 bg-roseRefined/5 rounded-full group-hover/item:bg-roseRefined/20 transition-colors">
                    <Calendar size={18} className="text-roseRefined" /> 
                  </div>
                  <span className="text-sm font-semibold tracking-wide">Minhas Experiências</span>
                </button>

                <button 
                  className="w-full text-left px-8 py-4 flex items-center space-x-4 hover:bg-roseRefined/10 transition-colors group/item"
                >
                  <div className="p-2 bg-roseRefined/5 rounded-full group-hover/item:bg-roseRefined/20 transition-colors">
                    <Settings size={18} className="text-roseRefined" /> 
                  </div>
                  <span className="text-sm font-semibold tracking-wide">Configurações</span>
                </button>

                <div className="mt-2 pt-2 border-t border-roseRefined/5">
                  <button 
                    onClick={() => { setShowDropdown(false); onLogout(); }}
                    className="w-full text-left px-8 py-5 flex items-center space-x-4 hover:bg-red-500/10 text-red-500 transition-colors group/logout"
                  >
                    <div className="p-2 bg-red-500/5 rounded-full group-hover/logout:bg-red-500/20 transition-colors">
                      <LogOut size={18} /> 
                    </div>
                    <span className="text-sm font-bold tracking-widest uppercase text-[11px]">Encerrar Sessão</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button 
            onClick={onOpenLogin}
            className="bg-gradient-to-r from-roseRefined to-gold text-white px-12 py-3.5 rounded-full font-bold shadow-xl hover:shadow-gold/40 hover:scale-105 transition-all active:scale-95 uppercase text-[10px] tracking-[0.3em]"
          >
            Iniciar Sessão Premium
          </button>
        )}
      </div>

      <div className="md:hidden flex items-center space-x-4">
        <button onClick={onToggleTheme} className="p-2">
          {isDark ? <Sun size={20} className="text-gold" /> : <Moon size={20} />}
        </button>
        <button onClick={() => setIsOpen(!isOpen)} className="p-2 transition-transform active:scale-90">
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 glass shadow-2xl flex flex-col p-10 space-y-8 md:hidden animate-fade-up rounded-b-[3rem] border-t border-roseRefined/10">
          <a href="#home" onClick={() => setIsOpen(false)} className="text-2xl font-serif italic text-center">Início</a>
          <a href="#services" onClick={() => setIsOpen(false)} className="text-2xl font-serif italic text-center">Serviços</a>
          {user ? (
            <div className="space-y-6 pt-6 border-t border-roseRefined/20">
              <div className="flex items-center justify-center space-x-5">
                <div className="golden-glow p-0.5 rounded-full">
                  <img src={user.picture} className="w-16 h-16 rounded-full border-2 border-white" alt={user.name} />
                </div>
                <div className="text-left">
                  <p className="font-bold text-xl leading-tight">{user.name}</p>
                  <p className="text-xs opacity-50 uppercase tracking-widest">{user.email}</p>
                </div>
              </div>
              <button onClick={() => { setIsOpen(false); onViewBookings(); }} className="w-full py-5 glass rounded-3xl font-bold flex items-center justify-center space-x-3 text-sm">
                <Calendar size={20} className="text-roseRefined" /> <span>Minha Agenda VIP</span>
              </button>
              <button onClick={() => { setIsOpen(false); onLogout(); }} className="w-full py-5 bg-red-500/10 text-red-500 rounded-3xl font-bold flex items-center justify-center space-x-3 text-sm uppercase tracking-widest">
                <LogOut size={20} /> <span>Sair com Segurança</span>
              </button>
            </div>
          ) : (
            <button onClick={() => { setIsOpen(false); onOpenLogin(); }} className="bg-gradient-to-r from-roseRefined to-gold text-white py-6 rounded-3xl font-bold shadow-xl uppercase tracking-[0.3em] text-xs">
              Membro VIP: Entrar
            </button>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
