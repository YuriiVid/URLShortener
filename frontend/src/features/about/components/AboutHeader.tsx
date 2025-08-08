import React from "react";
import { Button } from "@shared";
import { Edit3, X, FileText } from "lucide-react";

interface Props {
  canEdit: boolean;
  isEditing: boolean;
  isSaving: boolean;
  onEdit: () => void;
  onCancel: () => void;
}

const AboutHeader: React.FC<Props> = ({ canEdit, isEditing, isSaving, onEdit, onCancel }) => (
  <div className="text-center mb-4 sm:mb-6 relative">
    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
      <FileText className="w-8 h-8 text-blue-600" />
    </div>
    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">About</h1>
    {canEdit && (
      <div className="absolute top-4 right-4 z-10">
        <Button
          variant={isEditing ? "outline" : "primary"}
          size="sm"
          onClick={isEditing ? onCancel : onEdit}
          disabled={isSaving}
        >
          {isEditing ? (
            <>
              <X className="w-4 h-4 mr-2" /> Cancel
            </>
          ) : (
            <>
              <Edit3 className="w-4 h-4 mr-2" /> Edit
            </>
          )}
        </Button>
      </div>
    )}
  </div>
);

export default AboutHeader;
