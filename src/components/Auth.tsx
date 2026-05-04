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
      {/* Tarjeta de Login con sombra en Verde Estándar */}
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl shadow-green-700/10 overflow-hidden border border-gray-100">
        
        {/* Encabezado con Logo y Colores de Marca */}
        <div className="p-8 text-center bg-green-700 text-white">
          <div className="bg-white p-2 w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            {/* Usamos logo.jpeg que es el que tienes funcionando en el Sidebar */}
            <img src="/logo.jpeg" alt="Del Sol Market Logo" className="w-full h-full object-contain rounded-lg" />
          </div>
          <h1 className="text-2xl font-black tracking-tight italic uppercase">Del Sol Market</h1>
          <p className="text-orange-100 text-sm italic font-medium">Control de Inventario y Ventas</p>
        </div>

        <form onSubmit={handleLogin} className="p-8 space-y-6">
          <div className="space-y-4">
            {/* Campo de Correo */}
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-700 transition-colors" size={18} />
              <input 
                type="email" 
                placeholder="Correo electrónico" 
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-green-700 outline-none transition-all font-medium" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </div>

            {/* Campo de Contraseña */}
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-700 transition-colors" size={18} />
              <input 
                type="password" 
                placeholder="Contraseña" 
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-green-700 outline-none transition-all font-medium" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
            </div>
          </div>

          {/* Botón Principal: Green-700 con hover en Green-900 */}
          <button 
            disabled={loading} 
            className="w-full bg-green-700 hover:bg-green-900 text-white font-bold py-4 rounded-2xl shadow-lg shadow-green-700/20 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : <LogIn size={20} />} 
            Iniciar Sesión
          </button>
        </form>

        {/* Detalle inferior en Naranja */}
        <div className="p-4 bg-gray-50 text-center border-t border-gray-100">
          <p className="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em]">Acceso de Personal Autorizado</p>
        </div>
      </div>
    </div>
  );
};