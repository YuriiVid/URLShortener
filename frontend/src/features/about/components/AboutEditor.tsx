import { forwardRef } from "react";
import { UtcDateTimeDisplay } from "@shared";

interface Props {
  isEditing: boolean;
  content: string;
  setContent: (val: string) => void;
  data: any;
}

const AboutEditor = forwardRef<HTMLTextAreaElement, Props>(({ isEditing, content, setContent, data }, ref) => (
  <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden p-6 sm:p-8">
    <div className="mb-4">
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
    </div>
    <div className="relative">
      <textarea
        id="content"
        ref={ref}
        readOnly={!isEditing}
        className={`w-full min-h-[500px] p-6 rounded-xl border-2 resize-none font-mono text-sm leading-relaxed transition-all duration-300 ease-in-out
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
));

export default AboutEditor;
