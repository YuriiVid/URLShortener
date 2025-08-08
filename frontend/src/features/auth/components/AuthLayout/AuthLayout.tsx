import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

interface AuthLayoutProps {
  title: string;
  children: React.ReactNode;
}

const AuthLayout = ({ title, children }: AuthLayoutProps) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <button
        onClick={() => navigate(-1)}
        className="absolute top-4 left-4 p-2 rounded-full hover:bg-white/50 transition-colors duration-200"
        aria-label="Go back"
      >
        <ArrowLeft className="h-6 w-6 text-gray-600 hover:text-gray-900" />
      </button>

      {/* ...existing code... */}
      <div className="w-full max-w-md px-6 py-12 lg:px-8">
        <div className="text-center space-y-4">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 text-indigo-600 hover:text-indigo-500 transition-colors"
          >
            <span className="text-2xl font-bold tracking-tight">UrlShortener</span>
          </Link>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">{title}</h2>
        </div>

        <div className="mt-10">
          <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-xl ring-1 ring-gray-900/5 p-6 sm:p-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
