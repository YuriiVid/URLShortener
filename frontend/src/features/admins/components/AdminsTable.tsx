import { AdminRow } from "./AdminRow";
import type { Admin } from "../types";
import type React from "react";

interface AdminsTableProps {
  admins: Admin[];
  onDelete: (admin: Admin) => void;
}

export const AdminTable: React.FC<AdminsTableProps> = ({ admins, onDelete }: AdminsTableProps) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Username
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {admins.map((admin, index) => (
            <AdminRow key={admin.id} admin={admin} index={index} onDelete={onDelete} />
          ))}
        </tbody>
      </table>
    </div>
  );
};
