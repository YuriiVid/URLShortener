import { Button } from "@shared";
import { ExternalLink, Copy, Eye, Trash } from "lucide-react";
import { isAdmin } from "@utils";
import type { ShortenedUrl } from "../types";
import type { User } from "@shared/types";
import type React from "react";

interface UrlTableProps {
  urls: ShortenedUrl[];
  user: User | null;
  onCopy: (shortUrl: string) => void;
  onView: (id: number) => void;
  onDelete: (id: number) => void;
}

const UrlTable: React.FC<UrlTableProps> = ({ urls, user, onCopy, onView, onDelete }: UrlTableProps) => {
  if (urls.length === 0) {
    return (
      <div className="mt-8">
        <div className="bg-white shadow-sm ring-1 ring-gray-200 rounded-lg overflow-hidden text-center py-12">
          <p className="text-sm text-gray-500">No shortened URLs yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="bg-white shadow-sm ring-1 ring-gray-200 rounded-lg overflow-hidden">
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
                          onClick={() => onCopy(url.shortUrl)}
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
                          onClick={() => onView(url.id)}
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
                          onClick={() => onDelete(url.id)}
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
      </div>
    </div>
  );
};

export default UrlTable;
