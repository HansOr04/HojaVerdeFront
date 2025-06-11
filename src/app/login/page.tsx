// src/app/login/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Eye, 
  EyeOff, 
  LogIn, 
  AlertCircle, 
  Mail, 
  Lock,
  Leaf,
  Shield,
  Users,
  Zap,
  ArrowLeft,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDemo, setSelectedDemo] = useState<string | null>(null);
  
  const { login } = useAuth();
  const router = useRouter();

  // Animación de fondo
  const [backgroundPosition, setBackgroundPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setBackgroundPosition({
        x: (e.clientX / window.innerWidth) * 20,
        y: (e.clientY / window.innerHeight) * 20
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login({ email, password });
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  const demoCredentials = [
    { 
      id: 'admin',
      role: 'Administrador', 
      email: 'admin@hojaverde.com', 
      password: 'admin123',
      color: 'from-red-500 to-red-600',
      icon: Shield,
      description: 'Acceso completo al sistema',
      permissions: ['Gestión completa', 'Usuarios', 'Configuración']
    },
    { 
      id: 'editor',
      role: 'Editor', 
      email: 'editor@hojaverde.com', 
      password: 'editor123',
      color: 'from-blue-500 to-blue-600',
      icon: Users,
      description: 'Gestión de empleados y asistencia',
      permissions: ['Registro masivo', 'Empleados', 'Reportes']
    },
    { 
      id: 'viewer',
      role: 'Visualizador', 
      email: 'viewer@hojaverde.com', 
      password: 'viewer123',
      color: 'from-green-500 to-green-600',
      icon: Eye,
      description: 'Solo lectura de información',
      permissions: ['Ver reportes', 'Consultar datos', 'Estadísticas']
    },
  ];

  const fillDemo = (credentials: typeof demoCredentials[0]) => {
    setSelectedDemo(credentials.id);
    setEmail(credentials.email);
    setPassword(credentials.password);
    setError('');
    
    // Feedback visual
    setTimeout(() => setSelectedDemo(null), 2000);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Fondo animado */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `radial-gradient(circle at ${50 + backgroundPosition.x}% ${50 + backgroundPosition.y}%, rgba(56, 151, 56, 0.3) 0%, transparent 50%)`,
          transition: 'background-image 0.3s ease'
        }}
      />
      
      {/* Elementos decorativos */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-green-500 rounded-full opacity-10 animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-48 h-48 bg-orange-500 rounded-full opacity-5 animate-bounce" style={{ animationDuration: '3s' }}></div>
      <div className="absolute top-1/2 left-10 w-16 h-16 bg-green-400 rounded-full opacity-20 animate-ping" style={{ animationDuration: '2s' }}></div>

      <div className="relative z-10 min-h-screen flex">
        {/* Panel izquierdo - Información */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-12 text-white">
          <div className="max-w-md">
            {/* Logo y branding */}
            <div className="flex items-center space-x-4 mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center shadow-2xl">
                <Leaf className="text-white" size={32} />
              </div>
              <div>
                <h1 className="text-3xl font-serif font-bold">Hoja Verde</h1>
                <p className="text-gray-300 italic">a remarkable focus that lasts</p>
              </div>
            </div>

            <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Sistema de Control de Asistencia
            </h2>
            
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Plataforma avanzada para la gestión eficiente de asistencia agrícola. 
              Diseñada para manejar hasta <span className="text-green-400 font-semibold">615 empleados</span> con 
              registro masivo optimizado.
            </p>

            {/* Características destacadas */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                  <Zap className="text-green-400" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold">Registro Masivo</h3>
                  <p className="text-gray-400 text-sm">615 empleados en ~10 segundos</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <Users className="text-blue-400" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold">Gestión Inteligente</h3>
                  <p className="text-gray-400 text-sm">Múltiples áreas, valores automáticos</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                  <Shield className="text-purple-400" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold">Seguridad Avanzada</h3>
                  <p className="text-gray-400 text-sm">Roles, permisos y validaciones</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Panel derecho - Formulario */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            {/* Header móvil */}
            <div className="lg:hidden text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-2xl">
                <Leaf className="text-white" size={32} />
              </div>
              <h1 className="text-2xl font-serif font-bold text-white mb-2">Hoja Verde</h1>
              <p className="text-gray-400">Sistema de Control de Asistencia</p>
            </div>

            {/* Tarjeta de login */}
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Bienvenido de Vuelta</h2>
                <p className="text-gray-300">Inicia sesión para acceder al sistema</p>
              </div>

              {/* Mensaje de error */}
              {error && (
                <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-2xl flex items-center space-x-3">
                  <AlertCircle className="text-red-400 flex-shrink-0" size={20} />
                  <span className="text-red-100 text-sm">{error}</span>
                </div>
              )}

              {/* Formulario */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Correo Electrónico
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all backdrop-blur-sm"
                      placeholder="tu@email.com"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Contraseña
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-12 pr-12 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all backdrop-blur-sm"
                      placeholder="••••••••"
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center space-x-2 shadow-xl hover:shadow-2xl transform hover:scale-[1.02] disabled:transform-none"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Iniciando sesión...</span>
                    </>
                  ) : (
                    <>
                      <LogIn size={20} />
                      <span>Iniciar Sesión</span>
                    </>
                  )}
                </button>
              </form>

              {/* Link de regreso */}
              <div className="mt-6 text-center">
                <Link 
                  href="/"
                  className="inline-flex items-center space-x-2 text-gray-300 hover:text-white transition-colors group"
                >
                  <ArrowLeft className="group-hover:-translate-x-1 transition-transform" size={16} />
                  <span>Volver al inicio</span>
                </Link>
              </div>
            </div>

            {/* Credenciales demo */}
            <div className="mt-8">
              <div className="text-center mb-4">
                <h3 className="text-white font-medium mb-2">Credenciales de Prueba</h3>
                <p className="text-gray-400 text-sm">Haz clic en cualquier tarjeta para usar las credenciales</p>
              </div>
              
              <div className="space-y-3">
                {demoCredentials.map((cred) => {
                  const Icon = cred.icon;
                  const isSelected = selectedDemo === cred.id;
                  
                  return (
                    <button
                      key={cred.id}
                      onClick={() => fillDemo(cred)}
                      disabled={isLoading}
                      className={`w-full p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-2xl transition-all text-left group ${
                        isSelected ? 'ring-2 ring-green-500 bg-green-500/10' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 bg-gradient-to-r ${cred.color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                          <Icon className="text-white" size={20} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="text-white font-medium">{cred.role}</h4>
                            {isSelected && <CheckCircle className="text-green-400" size={16} />}
                          </div>
                          <p className="text-gray-400 text-sm mb-2">{cred.description}</p>
                          <div className="flex flex-wrap gap-1">
                            {cred.permissions.map((permission, idx) => (
                              <span key={idx} className="text-xs bg-white/10 text-gray-300 px-2 py-1 rounded-full">
                                {permission}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 text-center text-gray-400 text-sm">
              <p>© 2025 HojaVerde. Sistema diseñado para máxima eficiencia.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
