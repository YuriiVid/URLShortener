import { useCallback, useState } from "react";
import { Plus, ExternalLink, Eye, Trash, Copy } from "lucide-react";
import {
  useGetShortenedUrlsQuery,
  useCreateShortenedUrlMutation,
  useGetShortenedUrlQuery,
  useDeleteShortenedUrlMutation,
} from "../api/shortenedUrlApi";
import { Button, Layout, LoadingScreen, Modal, UtcDateTimeDisplay } from "@shared";
import { toast } from "react-hot-toast";
import { isAdmin, isValidUrl } from "@utils";
import { useAppSelector } from "@app/hooks";

const ShortenedUrlPage = () => {
  const user = useAppSelector((state) => state.auth.user);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUrlId, setSelectedUrlId] = useState<number | null>(null);
  const [newUrl, setNewUrl] = useState("");

  const { data: urls = [], isLoading } = useGetShortenedUrlsQuery();
  const { data: selectedUrl } = useGetShortenedUrlQuery(selectedUrlId!, { skip: !selectedUrlId });
  const [createUrl] = useCreateShortenedUrlMutation();
  const [deleteUrl] = useDeleteShortenedUrlMutation();

  const handleCreate = useCallback(async () => {
    if (!newUrl) {
      toast.error("Please enter a URL");
      return;
    }

    if (!isValidUrl(newUrl)) {
      toast.error("Invalid URL format. URL must start with http:// or https://");
      return;
    }

    try {
      await createUrl({ longUrl: newUrl }).unwrap();
      setNewUrl("");
      setIsCreateModalOpen(false);
      toast.success("URL shortened successfully!");
    } catch (error) {
      console.error("Failed to create shortened URL");
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

  const handleCopyShortUrl = async (shortUrl: string) => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      toast.success("Short URL copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy URL");
    }
  };

  const confirmDelete = useCallback(async () => {
    if (selectedUrlId === null) return;
    setSelectedUrlId(null);
    setIsDeleteModalOpen(false);
    try {
      await deleteUrl(selectedUrlId).unwrap();
      toast.success("Shortened URL deleted successfully");
    } catch (error) {
      console.error("Failed to delete shortened URL:", error);
    }
  }, [selectedUrlId, deleteUrl]);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-screen">
          <LoadingScreen />
        </div>
      </Layout>
    );
  }

  const CreateModalContent = (
    <div className="grid gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">URL to shorten</label>
        <input
          type="url"
          placeholder="https://example.com/very/long/url"
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
          ${
            newUrl && !isValidUrl(newUrl) ? "border-red-300 focus:ring-red-500 focus:border-red-500" : "border-gray-300"
          }`}
        />
        {newUrl && !isValidUrl(newUrl) && (
          <p className="mt-1 text-sm text-red-600">Please enter a valid URL starting with http:// or https://</p>
        )}
      </div>
    </div>
  );

  const ViewModalContent = selectedUrl && (
    <div className="grid gap-6">
      <div className="space-y-4">
        <div>
          <p className="text-sm font-medium text-gray-700 mb-1">Long URL</p>
          <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md break-all">{selectedUrl.longUrl}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700 mb-1">Short URL</p>
          <div className="flex items-center gap-2">
            <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md flex-1">{selectedUrl.shortUrl}</p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleCopyShortUrl(selectedUrl.shortUrl)}
              className="flex-shrink-0"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">Created By</p>
            <p className="text-sm text-gray-600">{selectedUrl.createdBy}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">Created At</p>
            <p className="text-sm text-gray-600">
              <UtcDateTimeDisplay utcIso={selectedUrl.createdAt} />
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Layout>
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

        <div className="mt-8">
          <div className="bg-white shadow-sm ring-1 ring-gray-200 rounded-lg overflow-hidden">
            {urls.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Plus className="mx-auto h-12 w-12" />
                </div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">No shortened URLs</h3>
                <p className="text-sm text-gray-500 mb-4">Get started by creating your first shortened URL.</p>
                <Button onClick={() => setIsCreateModalOpen(true)} size="sm">
                  Create URL
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Long URL
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Short URL
                      </th>
                      {user && (
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {urls.map((url, index) => (
                      <tr
                        key={url.id}
                        className={`hover:bg-gray-50 transition-colors duration-150 ${
                          index % 2 === 0 ? "bg-white" : "bg-gray-25"
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate max-w-md" title={url.longUrl}>
                                {url.longUrl}
                              </p>
                            </div>
                            <a
                              href={url.longUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors duration-150"
                              title="Open original URL"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="flex-1">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {url.shortUrl}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={() => handleCopyShortUrl(url.shortUrl)}
                                className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors duration-150 p-1 rounded"
                                title="Copy short URL"
                              >
                                <Copy className="h-4 w-4" />
                              </button>
                              <a
                                href={url.shortUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors duration-150 p-1 rounded"
                                title="Open short URL"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            {user && (
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handleView(url.id)}
                                className="inline-flex items-center px-2.5 py-1.5"
                                title="View details"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            )}
                            {(isAdmin(user) || url.userId === user?.id) && (
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handleDelete(url.id)}
                                className="inline-flex items-center px-2.5 py-1.5 text-red-600 hover:text-red-700 hover:bg-red-50"
                                title="Delete URL"
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal
        isOpen={isCreateModalOpen}
        title="Create Shortened URL"
        onConfirm={handleCreate}
        onCancel={() => setIsCreateModalOpen(false)}
        confirmLabel="Create"
        cancelLabel="Cancel"
      >
        {CreateModalContent}
      </Modal>

      <Modal
        isOpen={isViewModalOpen}
        title="URL Details"
        onConfirm={() => setIsViewModalOpen(false)}
        onCancel={() => {
          setIsViewModalOpen(false);
          setSelectedUrlId(null);
        }}
        confirmLabel="Close"
        hideFooter
      >
        {ViewModalContent}
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        title="Delete Shortened URL"
        message="Are you sure you want to delete this shortened URL? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
        confirmLabel="Delete"
        cancelLabel="Cancel"
      />
    </Layout>
  );
};

export default ShortenedUrlPage;
