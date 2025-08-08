import { Link } from "react-router-dom";
import "./style.css";

interface AuthFooterProps {
  text: string;
  linkText: string;
  linkTo: string;
}

const AuthFooter = ({ text, linkText, linkTo }: AuthFooterProps) => (
  <div className="auth-footer">
    <div className="auth-divider">
      <span className="auth-divider-text">{text}</span>
    </div>
    <Link to={linkTo} className="btn-outline w-full block text-center mt-6">
      {linkText}
    </Link>
  </div>
);

export default AuthFooter;
