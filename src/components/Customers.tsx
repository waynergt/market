import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { UserPlus, Search, Users, MapPin, CreditCard, Star } from 'lucide-react';

export const Customers = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { fetchCustomers(); }, []);

  const fetchCustomers = async () => {
    const { data } = await supabase.from('customers').select('*').order('name');
    setCustomers(data || []);
  };

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.nit.includes(searchTerm)
  );

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
      
      {/* Encabezado Principal */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-4xl font-black text-gray-800 flex items-center gap-3 italic uppercase tracking-tighter">
            <Users className="text-green-700" size={36} /> Clientes
          </h1>
          <p className="text-gray-500 font-medium italic mt-1">Base de datos oficial de facturación</p>
        </div>
        <button className="bg-green-700 hover:bg-green-900 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 shadow-xl shadow-green-700/20 transition-all active:scale-95">
          <UserPlus size={22} /> Nuevo Cliente
        </button>
      </div>

      {/* Buscador Moderno */}
      <div className="bg-white p-2 rounded-[2rem] shadow-lg shadow-gray-200/50 border border-gray-100 flex items-center gap-4 transition-all focus-within:border-green-700 focus-within:ring-4 focus-within:ring-green-700/5">
        <div className="bg-green-50 p-4 rounded-[1.8rem]">
          <Search className="text-green-700" size={24} />
        </div>
        <input 
          type="text" 
          placeholder="Buscar por NIT o Nombre del cliente..." 
          className="flex-1 outline-none bg-transparent font-bold text-gray-700 placeholder:text-gray-400 placeholder:font-medium"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Grid de Clientes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map(c => (
          <div key={c.id} className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-gray-200/40 border border-gray-50 hover:border-green-700/30 transition-all group relative overflow-hidden">
            
            {/* Adorno de fondo sutil */}
            <div className="absolute right-[-10px] top-[-10px] text-green-50 group-hover:text-green-100 transition-colors">
              <Star size={100} fill="currentColor" />
            </div>

            <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                <div className="bg-green-700 p-4 rounded-2xl text-white shadow-lg shadow-green-700/30 group-hover:scale-110 transition-transform">
                  <Users size={28} />
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Identificación</p>
                  <span className="text-sm font-black bg-orange-50 px-4 py-1.5 rounded-full text-orange-600 border border-orange-100">
                    NIT: {c.nit}
                  </span>
                </div>
              </div>

              <h3 className="font-black text-gray-800 text-xl mb-4 leading-tight group-hover:text-green-700 transition-colors uppercase italic">
                {c.name}
              </h3>

              <div className="space-y-3 border-t border-gray-50 pt-4">
                <div className="flex items-center gap-3 text-gray-500">
                  <div className="bg-gray-100 p-2 rounded-lg">
                    <MapPin size={14} className="text-green-700" />
                  </div>
                  <p className="text-xs font-bold italic">{c.address || 'Dirección no registrada'}</p>
                </div>
                <div className="flex items-center gap-3 text-gray-500">
                  <div className="bg-gray-100 p-2 rounded-lg">
                    <CreditCard size={14} className="text-green-700" />
                  </div>
                  <p className="text-xs font-bold">{c.email || 'Consumidor Final / Sin correo'}</p>
                </div>
              </div>

              <button className="w-full mt-6 py-3 bg-gray-50 text-gray-400 font-black text-[10px] uppercase tracking-[0.2em] rounded-xl group-hover:bg-green-700 group-hover:text-white transition-all">
                Ver historial de compras
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Estado Vacío */}
      {filtered.length === 0 && (
        <div className="py-20 text-center flex flex-col items-center gap-4 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
          <div className="bg-white p-6 rounded-full shadow-inner">
            <Users size={48} className="text-gray-200" />
          </div>
          <p className="text-gray-400 font-bold italic">No se encontraron clientes con ese nombre o NIT</p>
        </div>
      )}
    </div>
  );
};