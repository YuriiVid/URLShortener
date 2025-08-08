import React, { useState, useEffect, useRef } from "react";
import { useGetAboutQuery, useUpdateAboutMutation } from "../api/aboutApi";
import { ErrorScreen, LoadingScreen, Layout, Button, UtcDateTimeDisplay } from "@shared";
import { getErrorMessage } from "@utils/getErrorMessage";
import { useAppSelector } from "@app/hooks";
import toast from "react-hot-toast";
import { Edit3, Save, X, FileText } from "lucide-react";

const AboutPage: React.FC = () => {
  const { data, isLoading, error } = useGetAboutQuery();
  const [updateAbout, { isLoading: isSaving }] = useUpdateAboutMutation();

  const [isEditing, setIsEditing] = useState(false);
  const user = useAppSelector((state) => state.auth.user);
  const canEdit = user?.role === "Admin" || user?.role === "SuperAdmin";

  const [content, setContent] = useState<string>("");
  const [hasChanges, setHasChanges] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (data?.content) {
      setContent(data.content);
    }
  }, [data]);

  useEffect(() => {
    setHasChanges(content !== (data?.content || ""));
  }, [content, data?.content]);

  const handleSave = async () => {
    if (!hasChanges) {
      setIsEditing(false);
      return;
    }

    try {
      await updateAbout({ content }).unwrap();
      setIsEditing(false);
      toast.success("About page updated successfully!");
    } catch (e) {
      console.error("Failed to update about page:", e);
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      const confirmCancel = window.confirm("You have unsaved changes. Are you sure you want to cancel?");
      if (!confirmCancel) return;
    }

    setIsEditing(false);
    setContent(data?.content || "");
  };

  const handleEdit = () => {
    setIsEditing(true);
    setTimeout(() => {
      textareaRef.current?.focus();
      const textarea = textareaRef.current;
      if (textarea) {
        textarea.setSelectionRange(textarea.value.length, textarea.value.length);
      }
    }, 0);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter" && isEditing) {
        e.preventDefault();
        handleSave();
      }
    };

    if (isEditing) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isEditing, handleSave]);

  if (isLoading) {
    return (
      <Layout>
        <LoadingScreen />
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <ErrorScreen title="About Page Loading Failed" message={getErrorMessage(error)} type="warning" />
      </Layout>
    );
  }

  if (!data) {
    return (
      <Layout>
        <ErrorScreen title="No Content" message="The about content is not available." type="notfound" />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="text-center mb-4 sm:mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">About</h1>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="p-6 sm:p-8 relative">
              {canEdit && (
                <div className="absolute top-4 right-4 z-10">
                  <Button
                    variant={isEditing ? "outline" : "primary"}
                    size="sm"
                    onClick={isEditing ? handleCancel : handleEdit}
                    disabled={isSaving}
                    onFocus={(e) => e.target.blur()}
                  >
                    {isEditing ? (
                      <>
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </>
                    ) : (
                      <>
                        <Edit3 className="w-4 h-4 mr-2" />
                        Edit
                      </>
                    )}
                  </Button>
                </div>
              )}

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
                  ref={textareaRef}
                  readOnly={!isEditing}
                  className={`
                    w-full min-h-[500px] p-6 rounded-xl border-2 resize-none font-mono text-sm leading-relaxed
                    transition-all duration-300 ease-in-out
                    ${
                      isEditing
                        ? "border-blue-300 bg-blue-50/30 shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800"
                        : "border-gray-200 bg-gray-50/50 text-gray-700 cursor-default shadow-sm"
                    }
                    ${isEditing ? "backdrop-blur-sm" : ""}
                  `}
                  placeholder={isEditing ? "Enter your about page content here..." : ""}
                  value={content}
                  onChange={isEditing ? (e) => setContent(e.target.value) : undefined}
                />

                {!isEditing && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none rounded-xl" />
                )}

                <div className="absolute bottom-3 right-3 text-xs text-gray-400 bg-white/80 px-2 py-1 rounded-full">
                  {content.length} characters
                </div>
              </div>

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
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={handleSave}
                      isLoading={isSaving}
                      disabled={!hasChanges}
                      className="flex-1 sm:flex-none shadow-lg hover:shadow-xl transition-shadow"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {isSaving ? "Saving..." : "Save Changes"}
                    </Button>

                    <Button
                      variant="outline"
                      size="lg"
                      onClick={handleCancel}
                      disabled={isSaving}
                      className="flex-1 sm:flex-none"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Discard Changes
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
            </div>
          </div>

          {canEdit && !isEditing && (
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">You have editing permissions for this page.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AboutPage;
