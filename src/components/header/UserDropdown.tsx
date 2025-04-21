import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { ChevronDownIcon } from "../../icons";

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  const handleLogout = () => {
    logout();
    closeDropdown();
  };

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="flex items-center text-gray-700 dropdown-toggle dark:text-gray-400"
      >
        <span className="mr-3 overflow-hidden rounded-full h-11 w-11">
          <img src="/images/user/owner.jpg" alt="User" />
        </span>

        <span className="block mr-1 font-medium text-theme-sm">{user?.name || 'Usuario'}</span>
        <ChevronDownIcon className={`stroke-gray-500 dark:stroke-gray-400 transition-transform duration-200 ${
          isOpen ? "rotate-180" : ""
        }`} />
      </button>

      <div
        className={`absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 ${
          isOpen ? "block" : "hidden"
        }`}
      >
        <div className="px-4 py-2 border-b border-gray-200">
          <p className="text-sm font-medium text-gray-700">{user?.name || 'Usuario'}</p>
          <p className="text-xs text-gray-500">{user?.email || 'usuario@example.com'}</p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
