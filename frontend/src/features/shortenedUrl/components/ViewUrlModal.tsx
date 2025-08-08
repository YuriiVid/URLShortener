import { Modal, UtcDateTimeDisplay, Button } from "@shared";
import { Copy } from "lucide-react";

const ViewUrlModal = ({ isOpen, onClose, url, onCopy }: any) => {
  if (!url) return null;

  return (
    <Modal isOpen={isOpen} title="URL Details" onConfirm={onClose} onCancel={onClose} hideFooter>
      <div className="grid gap-6">
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">Long URL</p>
            <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md break-all">{url.longUrl}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">Short URL</p>
            <div className="flex items-center gap-2">
              <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md flex-1">{url.shortUrl}</p>
              <Button variant="secondary" size="sm" onClick={() => onCopy(url.shortUrl)} className="flex-shrink-0">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Created By</p>
              <p className="text-sm text-gray-600">{url.createdBy}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Created At</p>
              <p className="text-sm text-gray-600">
                <UtcDateTimeDisplay utcIso={url.createdAt} />
              </p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ViewUrlModal;
