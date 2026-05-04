import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase'; // CORREGIDO: de ../ a ./
import { Sidebar } from './components/Sidebar';
import { Inventory } from './components/Inventory';
import { ReceiveGoods } from './components/ReceiveGoods';
import { POS } from './components/POS';
import { Dashboard } from './components/Dashboard';
import { SalesHistory } from './components/SalesHistory';
import { CashClosing } from './components/CashClosing';
import { Auth } from './components/Auth';
import { InventoryReport } from './components/InventoryReport';
import './index.css';

function App() {
  const [session, setSession] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('pos');
  const [role, setRole] = useState('vendedor');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        setRole(session.user.user_metadata.role || 'vendedor');
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        setRole(session.user.user_metadata.role || 'vendedor');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!session) {
    return <Auth />;
  }

  const renderContent = () => {
    return (
      <div key={activeTab} className="animate-in fade-in slide-in-from-bottom-2 duration-500">
        {(() => {
          switch (activeTab) {
            case 'inv_report': return <InventoryReport />;
            case 'pos': return <POS />;
            case 'inventory': return <Inventory />;
            case 'receive': return <ReceiveGoods />;
            case 'dashboard': return <Dashboard />;
            case 'history': return <SalesHistory />;
            case 'closing': return <CashClosing />;
            case 'settings':
              return (
                <div className="p-20 text-center flex flex-col items-center justify-center min-h-[60vh]">
                  <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-gray-100">
                    <h2 className="text-3xl font-black text-gray-800 italic uppercase tracking-tighter">Configuración</h2>
                    <p className="text-gray-500 mt-2 font-medium">Gestiona tu cuenta de Del Sol Market</p>
                    <button 
                      onClick={() => supabase.auth.signOut()}
                      className="mt-8 bg-red-50 text-red-600 px-10 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-lg shadow-red-100"
                    >
                      Cerrar Sesión Activa
                    </button>
                  </div>
                </div>
              );
            default: return <POS />;
          }
        })()}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Fijo */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} userRole={role} />
      
      {/* Contenedor Principal Ajustado al ancho del Sidebar (72) */}
      <div className="flex-1 lg:ml-72 transition-all duration-300 min-h-screen">
        <main className="p-4 md:p-0">
          {/* Lógica de protección de rutas */}
          {(activeTab === 'dashboard' || activeTab === 'inventory' || activeTab === 'receive' || activeTab === 'closing') && role !== 'admin' 
            ? <div className="animate-in fade-in duration-500"><POS /></div> 
            : renderContent()}
        </main>
      </div>
    </div>
  );
}

export default App;