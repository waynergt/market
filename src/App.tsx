import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Inventory } from './components/Inventory';
import { ReceiveGoods } from './components/ReceiveGoods';
import { POS } from './components/POS'; // Importamos el nuevo componente
import './index.css';

function App() {
  // Cambiamos el estado inicial a 'pos' para entrar directo a la caja
  const [activeTab, setActiveTab] = useState('pos');

  // Función para renderizar el contenido principal dinámicamente
  const renderContent = () => {
    switch (activeTab) {
      case 'pos':
        return <POS />;
      case 'inventory':
        return <Inventory />;
      case 'receive':
        return <ReceiveGoods />;
      case 'dashboard':
        return (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 p-20">
            <h2 className="text-2xl font-bold">Panel de Control</h2>
            <p>Próximamente: Gráficas de ventas y estadísticas.</p>
          </div>
        );
      case 'settings':
        return (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 p-20">
            <h2 className="text-2xl font-bold">Configuración</h2>
            <p>Ajustes del sistema y perfiles.</p>
          </div>
        );
      default:
        return <POS />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navegación Lateral */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Contenido Principal */}
      <div className="lg:ml-64 transition-all duration-300">
        <main className="p-4 md:p-0">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default App;