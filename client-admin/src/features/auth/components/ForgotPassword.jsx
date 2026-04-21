export const ForgotPassword = ({ onSwitch }) => {
  return (
    <div className="space-y-5">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-white mb-1.5">
          Email
        </label>
        <input
          type="email"
          id="email"
          placeholder="email@example.com"
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-white placeholder:text-white"
        />
      </div>

      <button
        type="button"
        className="w-full bg-main-blue hover:opacity-90 text-white font-medium py-2.5 px-4 rounded-lg transition-colors duration-200 text-sm"
      >
        Recuperar contraseña
      </button>

      <p className="text-center text-sm text-white">
        ¿Recordaste tu contraseña?{" "}
        <button
          type="button"
          onClick={onSwitch}
          className="text-white hover:underline hover:cursor-pointer"
        >
          Iniciar sesión
        </button>
      </p>
    </div>
  );
};