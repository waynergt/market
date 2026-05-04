import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { 
  History, 
  Search, 
  Eye, 
  Calendar, 
  CreditCard, 
  Banknote,
  X,
  FileText,
  Clock,
  Hash
} from 'lucide-react';

interface Sale {
  id: string;
  total: number;
  payment_method: string;
  created_at: string;
}

interface SaleDetail {
  id: string;
  quantity: number;
  price_at_sale: number;
  products: {
    name: string;
  };
}

export const SalesHistory = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [details, setDetails] = useState<SaleDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    const { data, error } = await supabase
      .from('sales')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) console.error(error);
    else setSales(data || []);
  };

  const fetchSaleDetails = async (sale: Sale) => {
    setLoading(true);
    setSelectedSale(sale);
    
    const { data, error } = await supabase
      .from('sale_items')
      .select(`
        id,
        quantity,
        price_at_sale,
        products ( name )
      `)
      .eq('sale_id', sale.id);

    if (error) console.error(error);
    else setDetails(data as any || []);
    setLoading(false);
  };

  const filteredSales = sales.filter(sale => 
    sale.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.payment_method.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-700">
      
      {/* Encabezado Principal */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-4xl font-black text-gray-800 flex items-center gap-3 italic uppercase tracking-tighter">
            <History className="text-green-700" size={36} /> Historial de <span className="text-green-700">Ventas</span>
          </h1>
          <p className="text-gray-500 font-medium italic mt-1">Auditoría y revisión de transacciones procesadas</p>
        </div>
      </div>

      {/* Buscador Estilizado */}
      <div className="bg-white p-2 rounded-[2rem] shadow-lg shadow-gray-200/50 border border-gray-100 flex items-center gap-4 max-w-xl transition-all focus-within:border-green-700">
        <div className="bg-green-50 p-4 rounded-[1.8rem]">
          <Search className="text-green-700" size={24} />
        </div>
        <input 
          type="text"
          placeholder="Buscar por ID de venta o método de pago..."
          className="flex-1 outline-none bg-transparent font-bold text-gray-700 placeholder:text-gray-400 placeholder:font-medium"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Tabla de Resultados */}
      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/40 border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 text-gray-400 text-[10px] uppercase font-black tracking-[0.2em] border-b border-gray-100">
              <tr>
                <th className="p-6">Fecha y Registro</th>
                <th className="p-6 text-center">ID Referencia</th>
                <th className="p-6 text-center">Método de Pago</th>
                <th className="p-6 text-right">Total Transacción</th>
                <th className="p-6"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredSales.map((sale) => (
                <tr key={sale.id} className="group hover:bg-green-50/50 transition-colors">
                  <td className="p-6">
                    <div className="flex items-center gap-3 text-gray-700">
                      <div className="bg-gray-100 p-2 rounded-xl group-hover:bg-white transition-colors">
                        <Calendar size={16} className="text-green-700" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-sm">{new Date(sale.created_at).toLocaleDateString()}</span>
                        <span className="text-[10px] text-gray-400 flex items-center gap-1 font-bold">
                          <Clock size={10} /> {new Date(sale.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="p-6 text-center font-mono text-[10px] text-gray-400 group-hover:text-green-700 font-bold transition-colors">
                    <div className="flex items-center justify-center gap-1">
                      <Hash size={10} />
                      {sale.id.split('-')[0].toUpperCase()}
                    </div>
                  </td>
                  <td className="p-6 text-center">
                    <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${
                      sale.payment_method === 'Efectivo' 
                      ? 'bg-green-50 text-green-700 border-green-100' 
                      : 'bg-orange-50 text-orange-600 border-orange-100'
                    }`}>
                      {sale.payment_method === 'Efectivo' ? <Banknote size={12} /> : <CreditCard size={12} />}
                      {sale.payment_method}
                    </span>
                  </td>
                  <td className="p-6 text-right">
                    <span className="font-black text-gray-800 text-lg tracking-tighter italic group-hover:text-green-700 transition-colors">
                      Q{sale.total.toFixed(2)}
                    </span>
                  </td>
                  <td className="p-6 text-right">
                    <button 
                      onClick={() => fetchSaleDetails(sale)}
                      className="p-3 bg-gray-50 text-gray-400 rounded-2xl group-hover:bg-green-700 group-hover:text-white group-hover:shadow-lg group-hover:shadow-green-900/20 transition-all active:scale-90"
                    >
                      <Eye size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Detalle (Glassmorphism) */}
      {selectedSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 border border-gray-100">
            
            {/* Encabezado Modal */}
            <div className="p-8 border-b flex justify-between items-center bg-gradient-to-r from-green-700 to-green-900 text-white">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
                  <FileText size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black italic uppercase tracking-tight leading-none">Detalle de Venta</h2>
                  <p className="text-[10px] text-orange-400 font-mono font-bold mt-1 tracking-widest">
                    #{selectedSale.id.split('-')[0].toUpperCase()}
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedSale(null)} className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all active:scale-90">
                <X size={20} />
              </button>
            </div>

            <div className="p-8">
              {loading ? (
                <div className="flex flex-col items-center justify-center p-10 gap-4">
                  <div className="w-10 h-10 border-4 border-green-700 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-gray-400 font-bold italic animate-pulse">Obteniendo productos...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                    {details.map((item) => (
                      <div key={item.id} className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl border border-gray-100 group">
                        <div className="flex flex-col">
                          <p className="font-black text-gray-800 uppercase italic text-sm group-hover:text-green-700 transition-colors">
                            {item.products?.name}
                          </p>
                          <p className="text-[10px] font-bold text-gray-400 tracking-wider">
                            {item.quantity} UDS × Q{item.price_at_sale.toFixed(2)}
                          </p>
                        </div>
                        <p className="font-black text-gray-700 tracking-tighter">
                          Q{(item.quantity * item.price_at_sale).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="pt-6 border-t border-dashed border-gray-200 flex justify-between items-end">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Total Transacción</span>
                      <div className="flex items-center gap-2">
                        <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest">Pagado</span>
                      </div>
                    </div>
                    <span className="text-4xl font-black text-green-700 italic tracking-tighter">
                      Q{selectedSale.total.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};