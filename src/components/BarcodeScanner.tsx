import { useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

interface Props {
  onScan: (code: string) => void;
}

export const BarcodeScanner = ({ onScan }: Props) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    const scannerId = "reader";
    const html5QrCode = new Html5Qrcode(scannerId);
    scannerRef.current = html5QrCode;

    const startScanner = async () => {
      try {
        // PASO 1: Asegurarnos de que el hardware esté libre
        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length > 0) {
          await html5QrCode.start(
            { facingMode: "environment" }, // Cambiado a "environment" para usar la cámara trasera en móviles
            { 
              fps: 15, 
              qrbox: { width: 250, height: 150 },
              aspectRatio: 1.777778 // Proporción 16:9 para que se vea mejor
            },
            (data) => {
              onScan(data);
            },
            () => {} 
          );
        }
      } catch (err) {
        console.error("Error al iniciar scanner:", err);
      }
    };

    startScanner();

    // PASO 2: LIMPIEZA AL DESMONTAR
    return () => {
      const cleanup = async () => {
        if (scannerRef.current) {
          try {
            if (scannerRef.current.isScanning) {
              await scannerRef.current.stop();
            }
          } catch (e) {
            console.warn("Error deteniendo scanner:", e);
          } finally {
            const container = document.getElementById(scannerId);
            if (container) container.innerHTML = "";
            console.log("Cámara liberada y DOM limpio");
          }
        }
      };
      cleanup();
    };
  }, [onScan]);

  return (
    /* Contenedor principal con el verde de Del Sol Market */
    <div className="relative overflow-hidden rounded-3xl bg-black aspect-video border-4 border-green-700 shadow-2xl shadow-green-900/20">
      <div id="reader" className="w-full h-full"></div>
      
      {/* Capa de diseño: La "mira" del escáner en Naranja */}
      <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
        {/* Cuadro de escaneo con bordes naranjas brillantes */}
        <div className="w-[260px] h-[160px] border-2 border-orange-500 rounded-2xl shadow-[0_0_0_9999px_rgba(0,0,0,0.7)] flex flex-col items-center justify-center">
          
          {/* Línea de escaneo animada (puedes añadir animación después si gustas) */}
          <div className="w-full h-[2px] bg-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.8)]"></div>
          
        </div>
        
        {/* Texto de ayuda inferior */}
        <p className="mt-4 text-white text-[10px] font-black uppercase tracking-[0.3em] bg-green-700/80 px-4 py-1 rounded-full backdrop-blur-sm">
          Alinea el código de barras
        </p>
      </div>
      
      {/* Decoración de las esquinas en Verde Oscuro para un look industrial */}
      <div className="absolute top-4 left-4 w-6 h-6 border-t-4 border-l-4 border-green-900 rounded-tl-lg"></div>
      <div className="absolute top-4 right-4 w-6 h-6 border-t-4 border-r-4 border-green-900 rounded-tr-lg"></div>
      <div className="absolute bottom-4 left-4 w-6 h-6 border-b-4 border-l-4 border-green-900 rounded-bl-lg"></div>
      <div className="absolute bottom-4 right-4 w-6 h-6 border-b-4 border-r-4 border-green-900 rounded-br-lg"></div>
    </div>
  );
};