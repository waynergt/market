import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { Sidebar } from './components/Sidebar';
import { Inventory } from './components/Inventory';
import { ReceiveGoods } from './components/ReceiveGoods';
import { POS } from './components/POS';
import { Dashboard } from './components/Dashboard';
import { SalesHistory } from './components/SalesHistory';
import { CashClosing } from './components/CashClosing'; // Importado
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
    switch (activeTab) {
      case 'inv_report':
  return <InventoryReport />;
      case 'pos': return <POS />;
      case 'inventory': return <Inventory />;
      case 'receive': return <ReceiveGoods />;
      case 'dashboard': return <Dashboard />;
      case 'history': return <SalesHistory />;
      case 'closing': return <CashClosing />; // Agregado al switch
      case 'settings':
        return (
          <div className="p-20 text-center text-gray-400">
            <h2 className="text-2xl font-bold">Configuración</h2>
            <p className="mb-4">Gestiona tu cuenta y preferencias.</p>
            <button 
              onClick={() => supabase.auth.signOut()}
              className="mt-4 bg-red-50 text-red-600 px-6 py-2 rounded-xl font-bold hover:bg-red-100 transition-colors"
            >
              Cerrar Sesión
            </button>
          </div>
        );
      default: return <POS />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} userRole={role} />
      
      <div className="lg:ml-64 transition-all duration-300">
        <main className="p-4 md:p-0">
          {/* PROTECCIÓN: Añadida la pestaña 'closing' a la lista restringida para vendedores */}
          {(activeTab === 'dashboard' || activeTab === 'inventory' || activeTab === 'receive' || activeTab === 'closing') && role !== 'admin' 
            ? <POS /> 
            : renderContent()}
        </main>
      </div>
    </div>
  );
}

export default App;