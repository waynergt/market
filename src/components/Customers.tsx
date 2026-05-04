import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { UserPlus, Search, Users, MapPin, CreditCard } from 'lucide-react';

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
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-gray-800 flex items-center gap-3 italic">
            <Users className="text-market-green" /> Clientes
          </h1>
          <p className="text-gray-500 font-medium italic">Base de datos de facturación</p>
        </div>
        <button className="bg-market-green hover:bg-market-dark text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-market-green/10 transition-all">
          <UserPlus size={20} /> Nuevo Cliente
        </button>
      </div>

      <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
        <Search className="text-gray-400" />
        <input 
          type="text" 
          placeholder="Buscar por NIT o Nombre..." 
          className="flex-1 outline-none bg-transparent font-medium focus:text-market-green"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(c => (
          <div key={c.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:border-market-green/30 transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-market-green/10 p-3 rounded-2xl text-market-green group-hover:bg-market-green group-hover:text-white transition-colors">
                <Users size={24} />
              </div>
              <span className="text-[10px] font-black bg-gray-50 px-3 py-1 rounded-full text-market-green uppercase tracking-widest border border-market-green/10">NIT: {c.nit}</span>
            </div>
            <h3 className="font-bold text-gray-800 text-lg mb-1">{c.name}</h3>
            <div className="space-y-2">
               <p className="text-xs text-gray-400 flex items-center gap-2"><MapPin size={12}/> {c.address}</p>
               <p className="text-xs text-gray-400 flex items-center gap-2"><CreditCard size={12}/> {c.email || 'Sin correo'}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};