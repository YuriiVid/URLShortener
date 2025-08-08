import { useState } from "react";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { Modal } from "@shared";

interface CreateAdminModalProps {
  isOpen: boolean;
  onConfirm: (username: string, password: string) => void;
  onCancel: () => void;
}

export const CreateAdminModal = ({ isOpen, onConfirm, onCancel }: CreateAdminModalProps) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleConfirm = () => {
    if (!username.trim() || !password.trim()) return;
    onConfirm(username, password);
    setUsername("");
    setPassword("");
  };

  const handleCancel = () => {
    setUsername("");
    setPassword("");
    onCancel();
  };

  return (
    <Modal
      isOpen={isOpen}
      title="Create Admin"
      onConfirm={handleConfirm}
      onCancel={handleCancel}
      confirmLabel="Create"
      cancelLabel="Cancel"
    >
      <div className="grid gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
          <input
            type="text"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 pr-16 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-sm text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
          <p className="mt-1 text-xs text-yellow-600">
            ⚠️ Please remember or write down this password — it won’t be shown again.
          </p>
        </div>
      </div>
    </Modal>
  );
};
