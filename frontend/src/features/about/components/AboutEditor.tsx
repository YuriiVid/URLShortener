import { forwardRef } from "react";
import { Button, UtcDateTimeDisplay } from "@shared";
import { Edit3, X } from "lucide-react";
import type { AboutPage } from "../types";

interface AboutEditorProps {
  canEdit: boolean;
  isSaving: boolean;
  isEditing: boolean;
  content: string;
  setContent: (val: string) => void;
  onEdit: () => void;
  onCancel: () => void;
  data: AboutPage;
}

const AboutEditor = forwardRef<HTMLTextAreaElement, AboutEditorProps>(
  ({ canEdit, isEditing, isSaving, content, setContent, data, onEdit, onCancel }, ref) => (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 sm:p-8 overflow-hidden">
      <div className="mb-2 relative">
        <label htmlFor="content" className="block text-lg font-semibold text-gray-900 mb-2">
          About Content
        </label>
        <p className="text-sm text-gray-600">
          {isEditing ? "Edit the content below." : "This content describes URL Shortening algorithm"}
        </p>
        {data?.lastUpdatedBy && data?.lastUpdatedAt && (
          <div className="text-sm text-gray-500">
            <p className="inline-flex items-center">
              Last updated by <span className="font-medium text-gray-900 mx-1">{data.lastUpdatedBy}</span>
              <span className="mx-1">•</span>
              <UtcDateTimeDisplay utcIso={data?.lastUpdatedAt} />
            </p>
          </div>
        )}
        {canEdit && (
          <div className="absolute top-0 right-0 z-10">
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

      <div className="relative">
        <textarea
          id="content"
          ref={ref}
          readOnly={!isEditing}
          className={`w-full min-h-[250px] p-3 rounded-xl border-2 resize-none font-mono text-sm leading-relaxed transition-all duration-300 ease-in-out
            ${
              isEditing
                ? "border-blue-300 bg-blue-50/30 shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                : "border-gray-200 bg-gray-50/50 text-gray-700 cursor-default shadow-sm"
            }`}
          placeholder={isEditing ? "Enter your about page content here..." : ""}
          value={content}
          onChange={isEditing ? (e) => setContent(e.target.value) : undefined}
        />

        <div className="absolute bottom-3 right-3 text-xs text-gray-400 bg-white/80 px-2 py-1 rounded-full">
          {content.length} characters
        </div>
      </div>
    </div>
  )
);

export default AboutEditor;
