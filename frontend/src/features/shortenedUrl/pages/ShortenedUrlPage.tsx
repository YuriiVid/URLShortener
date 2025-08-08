import { useState, useCallback } from "react";
import { useAppSelector } from "@app/hooks";
import { LoadingScreen, Button, Modal } from "@shared";
import {
  useCreateShortenedUrlMutation,
  useDeleteShortenedUrlMutation,
  useGetShortenedUrlQuery,
  useGetShortenedUrlsQuery,
} from "../api/shortenedUrlApi";
import { Plus } from "lucide-react";
import { toast } from "react-hot-toast";

import { UrlTable, CreateUrlModal, ViewUrlModal } from "../components";
import { isValidUrl } from "@utils";

const ShortenedUrlPage = () => {
  const user = useAppSelector((state) => state.auth.user);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUrlId, setSelectedUrlId] = useState<number | null>(null);

  const { data: urls = [], isLoading } = useGetShortenedUrlsQuery();
  const [newUrl, setNewUrl] = useState("");

  const { data: selectedUrl } = useGetShortenedUrlQuery(selectedUrlId!, { skip: !selectedUrlId });
  const [createUrl] = useCreateShortenedUrlMutation();
  const [deleteUrl] = useDeleteShortenedUrlMutation();

  const handleCreate = useCallback(async () => {
    if (!newUrl) return toast.error("Please enter a URL");
    if (!isValidUrl(newUrl)) return toast.error("Invalid URL format");

    try {
      await createUrl({ longUrl: newUrl }).unwrap();
      setNewUrl("");
      setIsCreateModalOpen(false);
      toast.success("URL shortened successfully!");
    } catch {
      toast.error("Failed to create shortened URL");
    }
  }, [newUrl, createUrl]);

  const handleView = (id: number) => {
    setSelectedUrlId(id);
    setIsViewModalOpen(true);
  };

  const handleDelete = (id: number) => {
    setSelectedUrlId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = useCallback(async () => {
    if (selectedUrlId === null) return;
    setSelectedUrlId(null);
    setIsDeleteModalOpen(false);
    try {
      await deleteUrl(selectedUrlId).unwrap();
      toast.success("Shortened URL deleted");
    } catch {
      toast.error("Failed to delete URL");
    }
  }, [selectedUrlId, deleteUrl]);

  const handleCopyShortUrl = async (shortUrl: string) => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      toast.success("Short URL copied to clipboard!");
    } catch {
      toast.error("Failed to copy URL");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingScreen />
      </div>
    );
  }

  return (
    <>
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-gray-900">Shortened URLs</h1>
            <p className="mt-2 text-sm text-gray-700">Manage and track all shortened URLs in one place</p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            {user && (
              <Button onClick={() => setIsCreateModalOpen(true)} className="inline-flex items-center">
                <Plus className="mr-2 h-4 w-4" />
                New URL
              </Button>
            )}
          </div>
        </div>

        <UrlTable urls={urls} user={user} onCopy={handleCopyShortUrl} onView={handleView} onDelete={handleDelete} />
      </div>

      <CreateUrlModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        newUrl={newUrl}
        setNewUrl={setNewUrl}
        onCreate={handleCreate}
      />

      <ViewUrlModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedUrlId(null);
        }}
        url={selectedUrl}
        onCopy={handleCopyShortUrl}
      />

      <Modal
        isOpen={isDeleteModalOpen}
        title="Delete Shortened URL"
        message="Are you sure you want to delete this shortened URL? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setSelectedUrlId(null);
        }}
        confirmLabel="Delete"
        cancelLabel="Cancel"
      />
    </>
  );
};

export default ShortenedUrlPage;
