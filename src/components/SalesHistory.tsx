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
  FileText
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
    <div className="p-4 md:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-black text-gray-800 flex items-center gap-3">
          <History className="text-market-green" /> Historial de Ventas
        </h1>
        <p className="text-gray-500 font-medium">Revisa y audita las transacciones pasadas</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input 
          type="text"
          placeholder="Buscar por ID o método de pago..."
          className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-market-green outline-none transition-all font-medium"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50/50 text-gray-400 text-[10px] uppercase font-black tracking-widest border-b border-gray-100">
            <tr>
              <th className="p-5">Fecha y Hora</th>
              <th className="p-5">ID Venta</th>
              <th className="p-5">Método</th>
              <th className="p-5 text-right">Total</th>
              <th className="p-5"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredSales.map((sale) => (
              <tr key={sale.id} className="hover:bg-market-green/5 transition-colors">
                <td className="p-5 text-sm text-gray-600 flex items-center gap-2">
                  <Calendar size={14} className="text-gray-400" />
                  {new Date(sale.created_at).toLocaleString()}
                </td>
                <td className="p-5 font-mono text-[10px] text-gray-400">
                  {sale.id.split('-')[0]}...
                </td>
                <td className="p-5">
                  <span className={`flex items-center gap-1 text-xs font-bold ${sale.payment_method === 'Efectivo' ? 'text-green-600' : 'text-market-orange'}`}>
                    {sale.payment_method === 'Efectivo' ? <Banknote size={14} /> : <CreditCard size={14} />}
                    {sale.payment_method}
                  </span>
                </td>
                <td className="p-5 text-right font-black text-gray-800">
                  Q{sale.total.toFixed(2)}
                </td>
                <td className="p-5 text-right">
                  <button 
                    onClick={() => fetchSaleDetails(sale)}
                    className="p-2 hover:bg-white rounded-xl text-market-green transition-all shadow-sm border border-transparent hover:border-market-green/20"
                  >
                    <Eye size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b flex justify-between items-center bg-market-dark text-white">
              <div className="flex items-center gap-2">
                <FileText size={20} />
                <h2 className="text-xl font-bold">Detalle de Venta</h2>
              </div>
              <button onClick={() => setSelectedSale(null)} className="hover:bg-market-green p-2 rounded-full transition-colors"><X /></button>
            </div>

            <div className="p-6 space-y-4">
              {loading ? (
                <div className="text-center p-10 text-gray-400 animate-pulse font-bold italic">Cargando productos...</div>
              ) : (
                <>
                  <div className="space-y-3">
                    {details.map((item) => (
                      <div key={item.id} className="flex justify-between items-center border-b border-gray-50 pb-2">
                        <div>
                          <p className="font-bold text-gray-800">{item.products?.name}</p>
                          <p className="text-xs text-gray-400">{item.quantity} unidad(es) x Q{item.price_at_sale.toFixed(2)}</p>
                        </div>
                        <p className="font-black text-gray-700">Q{(item.quantity * item.price_at_sale).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                  <div className="pt-4 flex justify-between items-center border-t border-dashed">
                    <span className="text-gray-400 font-bold uppercase text-xs tracking-widest">Total Transacción</span>
                    <span className="text-3xl font-black text-market-green">Q{selectedSale.total.toFixed(2)}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};