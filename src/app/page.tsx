import ClientOnly from "@/components/ClientOnly";
import HomePage from "@/components/HomePage";

export default function Page() {
  return (
    <ClientOnly fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-orange-400 rounded-full mx-auto mb-4 flex items-center justify-center">
          <span className="text-white text-2xl">🌱</span>
        </div>
        <p className="text-gray-600">Cargando HojaVerde...</p>
      </div>
    </div>}>
      <HomePage />
    </ClientOnly>
  );
}