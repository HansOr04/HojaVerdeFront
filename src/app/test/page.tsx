// src/app/test/page.tsx
export default function TestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-500 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-white text-2xl">✅</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            ¡Tailwind CSS Funciona!
          </h1>
          <p className="text-gray-600">
            Si ves este diseño bonito, todo está configurado correctamente.
          </p>
        </div>
        
        <div className="space-y-4">
          <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md transition-colors">
            Botón Azul
          </button>
          <button className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-md transition-colors">
            Botón Verde
          </button>
          <button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-md transition-colors">
            Botón Naranja HojaVerde
          </button>
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-md">
          <h3 className="font-medium text-gray-800 mb-2">Estado del proyecto:</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>✅ Next.js configurado</li>
            <li>✅ TypeScript funcionando</li>
            <li>✅ Tailwind CSS cargado</li>
            <li>✅ Estructura de carpetas correcta</li>
            <li>🔄 Listo para el registro masivo</li>
          </ul>
        </div>
      </div>
    </div>
  );
}