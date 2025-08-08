import { Trash, User } from "lucide-react";
import { Button } from "@shared";
import type { Admin } from "../types";
import type React from "react";

interface AdminRowProps {
  admin: Admin;
  index: number;
  onDelete: (admin: Admin) => void;
}

export const AdminRow: React.FC<AdminRowProps> = ({ admin, index, onDelete }: AdminRowProps) => {
  return (
    <tr className={`hover:bg-gray-50 transition-colors duration-150 ${index % 2 === 0 ? "bg-white" : "bg-gray-25"}`}>
      <td className="px-6 py-4">
        <div className="text-sm font-medium text-gray-900">{admin.id}</div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-8 w-8">
            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
              <User className="h-4 w-4 text-gray-500" />
            </div>
          </div>
          <div className="ml-3">
            <div className="text-sm font-medium text-gray-900">{admin.userName}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center space-x-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onDelete(admin)}
            className="inline-flex items-center px-2.5 py-1.5 text-red-600 hover:text-red-700 hover:bg-red-50"
            title="Delete admin"
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
};
