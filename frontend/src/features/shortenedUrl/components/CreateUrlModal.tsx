import { Modal } from "@shared";
import { isValidUrl } from "@utils";
import type React from "react";

interface CreateUrlModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: () => void;
  newUrl: string;
  setNewUrl: (value: string) => void;
}

const CreateUrlModal: React.FC<CreateUrlModalProps> = ({
  isOpen,
  onClose,
  onCreate,
  newUrl,
  setNewUrl,
}: CreateUrlModalProps) => {
  return (
    <Modal
      isOpen={isOpen}
      title="Create Shortened URL"
      onConfirm={onCreate}
      onCancel={onClose}
      confirmLabel="Create"
      cancelLabel="Cancel"
    >
      <div>
        <label className="block text-sm font-medium mb-2">URL to shorten</label>
        <input
          type="url"
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
          placeholder="https://example.com"
          className={`w-full px-3 py-2 border rounded-md ${
            newUrl && !isValidUrl(newUrl) ? "border-red-300" : "border-gray-300"
          }`}
        />
        {newUrl && !isValidUrl(newUrl) && (
          <p className="text-sm text-red-600 mt-1">Must start with http:// or https://</p>
        )}
      </div>
    </Modal>
  );
};

export default CreateUrlModal;
