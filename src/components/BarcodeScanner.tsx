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
        // PASO 1: Antes de empezar, nos aseguramos de que el hardware esté libre
        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length > 0) {
          await html5QrCode.start(
            { facingMode: "user" }, 
            { fps: 10, qrbox: { width: 250, height: 150 } },
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
            // Detenemos la lógica de la librería
            if (scannerRef.current.isScanning) {
              await scannerRef.current.stop();
            }
          } catch (e) {
            console.warn("Error deteniendo scanner:", e);
          } finally {
            // IMPORTANTE: Matar manualmente cualquier stream que haya quedado
            
            // Limpiar el contenedor del DOM para que no queden elementos de video
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
    <div className="relative overflow-hidden rounded-xl bg-black aspect-video border-2 border-blue-500 shadow-lg">
      <div id="reader" className="w-full h-full"></div>
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="w-[250px] h-[150px] border-2 border-white/40 rounded-lg shadow-[0_0_0_9999px_rgba(0,0,0,0.6)]"></div>
      </div>
    </div>
  );
};