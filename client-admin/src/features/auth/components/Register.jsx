export const RegisterForm = ({ onSwitch }) => {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-white mb-1.5">
            Nombre
          </label>
          <input
            type="text"
            id="name"
            placeholder="name"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-white placeholder:text-white"
          />
        </div>

        <div>
          <label htmlFor="surname" className="block text-sm font-medium text-white mb-1.5">
            Apellido
          </label>
          <input
            type="text"
            id="surname"
            placeholder="last name"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-white placeholder:text-white"
          />
        </div>
      </div>

      <div>
        <label htmlFor="username" className="block text-sm font-medium text-white mb-1.5">
          Username
        </label>
        <input
          type="text"
          id="username"
          placeholder="user"
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-white placeholder:text-white"
        />
      </div>

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

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-white mb-1.5">
          Teléfono
        </label>
        <input
          type="tel"
          id="phone"
          placeholder="+502 0000 0000"
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-white placeholder:text-white"
        />
      </div>

      <button
        type="button"
        className="w-full bg-main-blue hover:opacity-90 text-white font-medium py-2.5 px-4 rounded-lg transition-colors duration-200 text-sm"
      >
        Registrarse
      </button>

      <p className="text-center text-sm text-white">
        ¿Ya tienes cuenta?{" "}
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