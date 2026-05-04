import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { LogIn, Loader2, Lock, Mail } from 'lucide-react';

export const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert("Error: " + error.message);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      {/* Tarjeta Principal con sombra profunda y suave */}
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl shadow-green-900/10 overflow-hidden border border-gray-100 animate-in fade-in zoom-in duration-500">
        
        {/* Encabezado con degradado de la marca */}
        <div className="p-10 text-center bg-gradient-to-br from-green-700 to-green-900 text-white relative">
          <div className="bg-white p-3 w-28 h-28 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-300">
            {/* Usamos logo.jpeg */}
            <img src="/logo.jpeg" alt="Del Sol Market Logo" className="w-full h-full object-contain rounded-xl" />
          </div>
          
          <div className="space-y-1">
            <h1 className="text-3xl font-black tracking-tighter italic uppercase">
              Del Sol <span className="text-orange-400">Market</span>
            </h1>
            <p className="text-green-100/80 text-xs font-bold uppercase tracking-[0.3em]">
              Sistema de Gestión
            </p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="p-10 space-y-6">
          <div className="space-y-5">
            {/* Campo de Correo */}
            <div className="space-y-2 group">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                Credenciales de acceso
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-700 transition-colors" size={20} />
                <input 
                  type="email" 
                  placeholder="usuario@delsol.com" 
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-green-700 focus:bg-white outline-none transition-all font-semibold text-gray-700" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                />
              </div>
            </div>

            {/* Campo de Contraseña */}
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-700 transition-colors" size={20} />
              <input 
                type="password" 
                placeholder="••••••••" 
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-green-700 focus:bg-white outline-none transition-all font-semibold text-gray-700" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
            </div>
          </div>

          {/* Botón Principal con efecto de elevación */}
          <button 
            disabled={loading} 
            className="w-full bg-green-700 hover:bg-green-900 text-white font-black py-5 rounded-[1.5rem] shadow-xl shadow-green-700/20 flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-50 uppercase tracking-widest text-sm"
          >
            {loading ? <Loader2 className="animate-spin" /> : <LogIn size={20} />} 
            Ingresar al Sistema
          </button>
        </form>

        {/* Pie de página elegante */}
        <div className="p-6 bg-gray-50/50 text-center border-t border-gray-100">
          <p className="text-[9px] font-black text-orange-500 uppercase tracking-[0.4em] opacity-80">
            Seguridad · Del Sol Market · 2026
          </p>
        </div>
      </div>
    </div>
  );
};