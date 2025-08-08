import { useNavigate } from "react-router-dom";
import { type ChangeEvent, type SyntheticEvent, useCallback, useState } from "react";
import { useRegisterMutation } from "../api/authApi";
import InputField from "../components/InputField/InputField";
import { Lock, User } from "lucide-react";
import AuthLayout from "../components/AuthLayout/AuthLayout";
import AuthFooter from "../components/AuthFooter/AuthFooter";
import LoadingSpinner from "@shared/components/LoadingSpinner";
import toast from "react-hot-toast";

interface Credentials {
  userName: string;
  password: string;
  confirmPassword: string;
}

const RegisterPage = () => {
  const [credentials, setCredentials] = useState<Credentials>({
    userName: "",
    password: "",
    confirmPassword: "",
  });

  const navigate = useNavigate();
  const [register, { isLoading }] = useRegisterMutation();

  const onInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name in credentials) {
      setCredentials((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  }, []);

  const handleSubmit = useCallback(
    async (e: SyntheticEvent) => {
      e.preventDefault();
      const { password, confirmPassword, userName } = credentials;

      if (password !== confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }

      try {
        const res = await register({ userName, password }).unwrap();
        toast.success(res.message);
        navigate("/login");
      } catch (err) {
        console.error("Registration failed:", err);
      }
    },
    [credentials, register]
  );

  const inputFields = [
    {
      id: "userName",
      name: "userName",
      label: "Username",
      icon: User,
      type: "text",
      placeholder: "johndoe",
    },
    {
      id: "password",
      name: "password",
      label: "Password",
      icon: Lock,
      type: "password",
      placeholder: "••••••••",
      pattern:
        "^(?=.*[0-9])(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z])[A-Za-z0-9!@#$%^&*]{6,}$",
      title:
        "Password must be at least 6 characters, and include at least one upper-case, one lower-case letter, one number and one symbol",
    },
    {
      id: "confirmPassword",
      name: "confirmPassword",
      label: "Confirm Password",
      icon: Lock,
      type: "password",
      placeholder: "••••••••",
    },
  ];

  const renderContent = () => {
    return (
      <>
        <form data-testid="form" className="space-y-6" onSubmit={handleSubmit}>
          {inputFields.map(({ id, name, label, ...rest }) => (
            <InputField
              key={id}
              id={id}
              label={label}
              name={name}
              value={credentials[name as keyof Credentials]}
              onChange={onInputChange}
              required
              {...rest}
            />
          ))}

          <button className="btn-primary w-full" type="submit" disabled={isLoading}>
            {isLoading ? <LoadingSpinner className="h-5 w-5" /> : "Sign Up"}
          </button>
        </form>

        <AuthFooter text="Already have an account?" linkText="Sign in" linkTo="/login" />
      </>
    );
  };

  return <AuthLayout title="Create an account">{renderContent()}</AuthLayout>;
};

export default RegisterPage;
