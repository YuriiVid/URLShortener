import React from "react";
import { Button } from "@shared";
import { Save, X } from "lucide-react";

interface Props {
  canEdit: boolean;
  isEditing: boolean;
  isSaving: boolean;
  hasChanges: boolean;
  onSave: () => void;
  onCancel: () => void;
}

const AboutFooter: React.FC<Props> = ({ canEdit, isEditing, isSaving, hasChanges, onSave, onCancel }) => (
  <>
    <div className="mt-4 flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <div className={`w-2 h-2 rounded-full ${isEditing ? "bg-blue-500 animate-pulse" : "bg-green-500"}`} />
        <span className="text-sm text-gray-600">{isEditing ? "Editing mode active" : "Read-only mode"}</span>
      </div>
      {isEditing && <div className="text-xs text-gray-500">Press Ctrl/Cmd + Enter to save quickly</div>}
    </div>

    {isEditing && (
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <Button variant="primary" size="lg" onClick={onSave} isLoading={isSaving} disabled={!hasChanges}>
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
          <Button variant="outline" size="lg" onClick={onCancel} disabled={isSaving}>
            <X className="w-4 h-4 mr-2" /> Discard Changes
          </Button>
        </div>
        {hasChanges && (
          <div className="mt-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-amber-500 rounded-full mr-3 animate-pulse" />
              <p className="text-sm text-amber-800 font-medium">
                You have unsaved changes. Don't forget to save your work!
              </p>
            </div>
          </div>
        )}
      </div>
    )}

    {canEdit && !isEditing && (
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">You have editing permissions for this page.</p>
      </div>
    )}
  </>
);

export default AboutFooter;
