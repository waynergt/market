import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { X, UserPlus, Save } from 'lucide-react';
import { alertError, toast } from '../lib/alerts';

export const AddCustomerModal = ({ isOpen, onClose, onSuccess, initialNit }: any) => {
  const [formData, setFormData] = useState({ nit: '', name: '', address: 'Ciudad' });

  useEffect(() => {
    if (initialNit) setFormData(prev => ({ ...prev, nit: initialNit }));
  }, [initialNit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const { data, error } = await supabase
      .from('customers')
      .insert([formData])
      .select()
      .single();

    if (error) {
      alertError("Error al guardar cliente", error.message);
      return;
    }
    
    toast("Cliente registrado con éxito", "success");
    onSuccess(data);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl animate-in zoom-in duration-200 border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-black text-gray-800 flex items-center gap-2 italic uppercase">
            <UserPlus className="text-green-700" /> Nuevo Cliente
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors"><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] font-black text-orange-500 uppercase tracking-widest ml-1">NIT</label>
            <input required type="text" className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-green-700 focus:bg-white outline-none transition-all font-medium" value={formData.nit} onChange={e => setFormData({...formData, nit: e.target.value})} />
          </div>
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nombre Completo</label>
            <input required type="text" className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-green-700 focus:bg-white outline-none transition-all font-medium" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Dirección (Opcional)</label>
            <input type="text" className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-green-700 focus:bg-white outline-none transition-all font-medium" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
          </div>

          <button type="submit" className="w-full bg-green-700 hover:bg-green-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-green-100 transition-all active:scale-95 mt-4 uppercase tracking-widest text-xs">
            <Save size={20} /> Guardar Cliente
          </button>
        </form>
      </div>
    </div>
  );
};