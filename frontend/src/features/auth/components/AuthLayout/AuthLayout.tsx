import { Link } from "react-router-dom";

interface AuthLayoutProps {
  title: string;
  children: React.ReactNode;
}

const AuthLayout = ({ title, children }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen relative flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
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
