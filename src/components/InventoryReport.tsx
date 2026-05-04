import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { 
  Package, 
  Printer 
} from 'lucide-react';

interface InventoryStats {
  totalCost: number;
  totalValue: number;
  potentialProfit: number;
  totalItems: number;
  products: any[];
}

export const InventoryReport = () => {
  const [stats, setStats] = useState<InventoryStats>({
    totalCost: 0,
    totalValue: 0,
    potentialProfit: 0,
    totalItems: 0,
    products: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInventoryData();
  }, []);

  const fetchInventoryData = async () => {
    setLoading(true);
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .order('stock', { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    let cost = 0;
    let value = 0;
    let items = 0;

    products?.forEach(p => {
      cost += (p.cost_price * p.stock);
      value += (p.selling_price * p.stock);
      items += p.stock;
    });

    setStats({
      totalCost: cost,
      totalValue: value,
      potentialProfit: value - cost,
      totalItems: items,
      products: products || []
    });
    setLoading(false);
  };

  if (loading) return <div className="p-20 text-center animate-pulse text-gray-400 font-bold italic">Generando reporte de activos...</div>;

  return (
    <div className="p-4 md:p-8 space-y-8 print:block print:p-0">
      
      <div className="flex justify-between items-end print:hidden">
        <div>
          <h1 className="text-3xl font-black text-gray-800">Reporte de Inventario</h1>
          <p className="text-gray-500 font-medium italic">Valorización de activos y existencias</p>
        </div>
        <button 
          onClick={() => window.print()}
          className="bg-market-green text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-market-dark transition-all shadow-lg shadow-market-green/10"
        >
          <Printer size={20} /> Imprimir Reporte
        </button>
      </div>

      <div className="hidden print:block text-center border-b-2 border-gray-200 pb-8 mb-12">
        <h1 className="text-4xl font-black uppercase tracking-tight text-black italic">Del Sol Market - Inventario</h1>
        <p className="text-gray-600 mt-2 font-bold text-lg">Fecha de emisión: {new Date().toLocaleString()}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 print:gap-4">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 print:shadow-none print:border-gray-300">
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Inversión Total</p>
          <h3 className="text-3xl font-black text-gray-800">Q{stats.totalCost.toFixed(2)}</h3>
          <p className="text-xs text-gray-400 mt-1 print:hidden">Capital invertido en bodega</p>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 print:shadow-none print:border-gray-300">
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Valor de Venta</p>
          <h3 className="text-3xl font-black text-market-green">Q{stats.totalValue.toFixed(2)}</h3>
          <p className="text-xs text-gray-400 mt-1 print:hidden">Ingreso esperado</p>
        </div>

        <div className="bg-gradient-to-br from-market-green to-market-dark p-6 rounded-3xl shadow-xl text-white print:bg-none print:text-black print:border-2 print:border-market-green print:shadow-none">
          <p className="text-xs font-black text-white/70 print:text-gray-400 uppercase tracking-widest mb-2">Ganancia Proyectada</p>
          <h3 className="text-3xl font-black">Q{stats.potentialProfit.toFixed(2)}</h3>
          <p className="text-xs text-white/70 mt-1 print:hidden italic">Margen de utilidad</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden print:shadow-none print:border-gray-300">
        <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50 print:bg-white">
          <h4 className="font-bold text-gray-800 flex items-center gap-2">
            <Package size={18} className="text-market-green print:hidden" /> Detalle de Existencias
          </h4>
          <span className="text-xs font-bold bg-white px-3 py-1 rounded-full text-gray-500 border print:border-none">
            {stats.products.length} productos
          </span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="text-[10px] uppercase font-black text-gray-400 tracking-widest border-b border-gray-100">
              <tr>
                <th className="p-5">Producto</th>
                <th className="p-5 text-center">Stock</th>
                <th className="p-5 text-right">Costo Unit.</th>
                <th className="p-5 text-right">Venta Unit.</th>
                <th className="p-5 text-right">Inversión</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {stats.products.map((p) => (
                <tr key={p.id} className="text-sm">
                  <td className="p-5">
                    <p className="font-bold text-gray-800">{p.name}</p>
                    <p className="text-[10px] font-mono text-gray-400 uppercase">{p.barcode}</p>
                  </td>
                  <td className="p-5 text-center font-bold">
                    <span className={p.stock < 5 ? 'text-market-orange' : 'text-gray-700'}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="p-5 text-right text-gray-500 font-medium">Q{p.cost_price.toFixed(2)}</td>
                  <td className="p-5 text-right text-market-green font-bold">Q{p.selling_price.toFixed(2)}</td>
                  <td className="p-5 text-right font-black text-gray-800">Q{(p.cost_price * p.stock).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};