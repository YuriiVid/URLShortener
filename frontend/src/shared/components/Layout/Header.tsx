import React, { useState } from "react";
import { User, LogOut, Menu, X } from "lucide-react";
import { useLogoutMutation } from "@features/auth/api/authApi";
import { Link, useNavigate } from "react-router";
import toast from "react-hot-toast";

interface HeaderProps {
  userRole?: string;
  userName?: string;
}

const Header: React.FC<HeaderProps> = ({ userRole, userName }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [logout] = useLogoutMutation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      toast.success("Logged out successfully");
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="ml-6 sm:ml-16 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-900">URLShortener</h1>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link className="text-gray-600 hover:text-gray-900 px-3 py-2" to={"/home"}>
              Home
            </Link>
            <Link className="text-gray-600 hover:text-gray-900 px-3 py-2" to={"/about"}>
              About
            </Link>
            {userRole === "SuperAdmin" && (
              <Link className="text-gray-600 hover:text-gray-900 px-3 py-2" to={"/admins"}>
                Manage Admins
              </Link>
            )}
            {userName === undefined && (
              <Link className="text-gray-600 hover:text-gray-900 px-3 py-2" to={"/login"}>
                Sign In
              </Link>
            )}
          </nav>

          {/* User Menu (Desktop) */}
          <div className="hidden md:flex items-center space-x-4">
            {userName && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <User size={16} />
                <span>{userName}</span>
                {userRole && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">{userRole}</span>
                )}
              </div>
            )}
            {userName && (
              <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <LogOut size={20} />
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className={`md:hidden ${isOpen ? "block" : "hidden"}`}>
          <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-200">
            <Link
              className="block px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md"
              to={"/home"}
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <Link
              className="block px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md"
              to={"/about"}
              onClick={() => setIsOpen(false)}
            >
              About
            </Link>
            {userRole === "SuperAdmin" && (
              <Link
                className="block px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                to={"/admins"}
                onClick={() => setIsOpen(false)}
              >
                Manage Admins
              </Link>
            )}
            {userName === undefined && (
              <Link
                className="block px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                to={"/login"}
                onClick={() => setIsOpen(false)}
              >
                Sign In
              </Link>
            )}
            {userName && (
              <div className="px-3 py-2 border-t border-gray-200">
                <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                  <User size={16} />
                  <span>{userName}</span>
                  {userRole && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">{userRole}</span>
                  )}
                </div>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
                >
                  <LogOut size={20} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
