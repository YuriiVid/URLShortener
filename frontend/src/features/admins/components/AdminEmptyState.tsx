import { User } from "lucide-react";
import { Button } from "@shared";

interface AdminEmptyStateProps {
  onCreateAdmin: () => void;
}

export const AdminEmptyState = ({ onCreateAdmin }: AdminEmptyStateProps) => {
  return (
    <div className="text-center py-12">
      <div className="text-gray-400 mb-4">
        <User className="mx-auto h-12 w-12" />
      </div>
      <h3 className="text-sm font-medium text-gray-900 mb-2">No admins found</h3>
      <p className="text-sm text-gray-500 mb-4">Get started by adding your first admin user.</p>
      <Button size="sm" onClick={onCreateAdmin}>
        Add Admin
      </Button>
    </div>
  );
};
