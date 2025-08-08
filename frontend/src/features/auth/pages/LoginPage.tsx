import { useState, type ChangeEvent, type SyntheticEvent, useCallback } from "react";
import { useLoginMutation } from "../api/authApi";
import { useNavigate } from "react-router-dom";
import { getErrorMessage } from "@utils";
import { User, Lock } from "lucide-react";
import InputField from "../components/InputField/InputField";
import AuthLayout from "../components/AuthLayout/AuthLayout";
import AuthFooter from "../components/AuthFooter/AuthFooter";
import "./styles.css";
import LoadingSpinner from "@shared/components/LoadingSpinner";
import toast from "react-hot-toast";

const LoginPage = () => {
  const [credentials, setCredentials] = useState({
    userName: "",
    password: "",
  });
  const { userName, password } = credentials;

  const [login, { isLoading, isError, error }] = useLoginMutation();
  const navigate = useNavigate();

  const onInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback(
    async (e: SyntheticEvent) => {
      e.preventDefault();
      try {
        await login(credentials).unwrap();
        toast.success("Login successful");
        navigate("/");
      } catch (err) {
        console.error("Login failed:", err);
      }
    },
    [login, credentials, navigate]
  );

  const renderContent = () => {
    return (
      <>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <InputField
            id="userName"
            type="text"
            name="userName"
            icon={User}
            label="Username"
            value={userName}
            onChange={onInputChange}
            placeholder="johndoe"
            required
          />
          <InputField
            id="password"
            type="password"
            name="password"
            icon={Lock}
            label="Password"
            value={password}
            onChange={onInputChange}
            placeholder="••••••••"
            required
          />
          {isError && <div className="error-message">{getErrorMessage(error)}</div>}
          <button className="btn-primary w-full" type="submit" disabled={isLoading}>
            {isLoading ? <LoadingSpinner className="h-5 w-5" /> : "Sign In"}
          </button>
        </form>

        <AuthFooter text="Don't have an account?" linkText="Sign up" linkTo="/register" />
      </>
    );
  };

  return <AuthLayout title="Sign in to your account">{renderContent()}</AuthLayout>;
};

export default LoginPage;
