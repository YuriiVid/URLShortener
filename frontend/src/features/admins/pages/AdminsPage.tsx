import { useCallback, useState } from "react";
import { Plus } from "lucide-react";
import { ErrorScreen, LoadingScreen, Modal, Button } from "@shared";
import { useGetAdminsQuery, useDeleteAdminMutation, useCreateAdminMutation } from "../api/adminsApi";
import { toast } from "react-hot-toast";
import type { Admin } from "../types";
import { AdminTable, AdminEmptyState, CreateAdminModal } from "../components";

export function AdminsPage() {
  const { data: admins = [], isLoading, isError } = useGetAdminsQuery();
  const [deleteAdmin] = useDeleteAdminMutation();
  const [createAdmin] = useCreateAdminMutation();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [adminToDeleteId, setAdminToDeleteId] = useState<number | null>(null);

  const handleDeleteClick = (admin: Admin) => {
    setAdminToDeleteId(admin.id);
    setIsDeleteModalOpen(true);
  };

  const handleCreateAdmin = useCallback(
    async (username: string, password: string) => {
      if (!username.trim()) {
        toast.error("Please enter a username");
        return;
      }

      if (!password.trim()) {
        toast.error("Please enter a password");
        return;
      }

      try {
        await createAdmin({
          userName: username.trim(),
          password: password.trim(),
        }).unwrap();
        setIsCreateModalOpen(false);
        toast.success("Admin created successfully!");
      } catch (error) {
        console.error("Failed to create admin:", error);
      }
    },
    [createAdmin]
  );

  const handleConfirmDelete = useCallback(async () => {
    if (!adminToDeleteId) return;

    try {
      await deleteAdmin(adminToDeleteId).unwrap();
      toast.success("Admin deleted successfully");
    } catch (error) {
      console.error("Failed to delete admin:", error);
    } finally {
      setAdminToDeleteId(null);
      setIsDeleteModalOpen(false);
    }
  }, [adminToDeleteId, admins, deleteAdmin]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingScreen />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex justify-center items-center h-screen">
        <ErrorScreen title="Error loading AdminsList" message="Please try again later" />
      </div>
    );
  }

  const adminToDeleteUsername = admins.find((admin) => admin.id === adminToDeleteId)?.userName;

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Admins</h1>
          <p className="mt-2 text-sm text-gray-700">Manage system administrators and their permissions</p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Button onClick={() => setIsCreateModalOpen(true)} className="inline-flex items-center">
            <Plus className="mr-2 h-4 w-4" />
            Add Admin
          </Button>
        </div>
      </div>

      <div className="mt-8">
        <div className="bg-white shadow-sm ring-1 ring-gray-200 rounded-lg overflow-hidden">
          {admins.length === 0 ? (
            <AdminEmptyState onCreateAdmin={() => setIsCreateModalOpen(true)} />
          ) : (
            <AdminTable admins={admins} onDelete={handleDeleteClick} />
          )}
        </div>
      </div>

      <CreateAdminModal
        isOpen={isCreateModalOpen}
        onConfirm={handleCreateAdmin}
        onCancel={() => setIsCreateModalOpen(false)}
      />

      <Modal
        isOpen={isDeleteModalOpen}
        title="Delete Admin"
        message={`Are you sure you want to delete admin "${adminToDeleteUsername}"? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setAdminToDeleteId(null);
        }}
        confirmLabel="Delete"
        cancelLabel="Cancel"
      />
    </div>
  );
}
