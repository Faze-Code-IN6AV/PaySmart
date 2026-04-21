export const LoginForm = ({ onForgot }) => {
  return (
    <div className="space-y-5">
      <div>
        <label htmlFor="emailOrUsername" className="block text-sm font-medium text-white mb-1.5">
          Email o Username
        </label>
        <input
          type="text"
          id="emailOrUsername"
          placeholder="email@example.com o username"
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-white placeholder:text-white"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-white mb-1.5">
          Contraseña
        </label>
        <input
          type="password"
          id="password"
          placeholder="••••••"
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-white placeholder:text-white"
        />
      </div>

      <button
        type="button"
        className="w-full bg-main-blue hover:opacity-90 text-white font-medium py-2.5 px-4 rounded-lg transition-colors duration-200 text-sm"
      >
        Iniciar sesión
      </button>

      <p className="text-center text-sm">
        <button
          type="button"
          onClick={onForgot}
          className="text-white hover:underline hover:cursor-pointer"
        >
          ¿Olvidaste tu contraseña?
        </button>
      </p>
    </div>
  );
};