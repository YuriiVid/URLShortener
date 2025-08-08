import React, { useState, useEffect, useRef, useCallback } from "react";
import { useGetAboutQuery, useUpdateAboutMutation } from "../api/aboutApi";
import { ErrorScreen, LoadingScreen, Modal } from "@shared";
import { getErrorMessage } from "@utils/getErrorMessage";
import { useAppSelector } from "@app/hooks";
import toast from "react-hot-toast";
import { AboutEditor, AboutFooter, AboutHeader } from "../components";

const AboutPage: React.FC = () => {
  const { data, isLoading, error } = useGetAboutQuery();
  const [updateAbout, { isLoading: isSaving }] = useUpdateAboutMutation();
  const user = useAppSelector((state) => state.auth.user);
  const canEdit = user?.role === "Admin" || user?.role === "SuperAdmin";

  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState("");
  const [hasChanges, setHasChanges] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  useEffect(() => {
    if (data?.content) setContent(data.content);
  }, [data]);

  useEffect(() => {
    setHasChanges(content !== (data?.content || ""));
  }, [content, data?.content]);

  const handleSave = useCallback(async () => {
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
  }, [hasChanges, content, updateAbout]);

  const handleCancel = useCallback(() => {
    if (hasChanges) {
      setIsCancelModalOpen(true);
      return;
    }
    setIsEditing(false);
    setContent(data?.content || "");
  }, [hasChanges, data?.content]);

  const confirmDiscard = useCallback(() => {
    setIsCancelModalOpen(false);
    setIsEditing(false);
    setContent(data?.content || "");
  }, [data?.content]);

  const handleEdit = useCallback(() => {
    setIsEditing(true);
    setTimeout(() => {
      textareaRef.current?.focus();
      textareaRef.current?.setSelectionRange(content.length, content.length);
    }, 0);
  }, [content]);

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

  if (isLoading) return <LoadingScreen />;
  if (error) return <ErrorScreen title="About Page Loading Failed" message={getErrorMessage(error)} type="warning" />;
  if (!data) return <ErrorScreen title="No Content" message="The about content is not available." type="notfound" />;

  return (
    <div className="max-w-5xl mx-auto px-2 sm:px-3 lg:px-4 py-2 sm:py-4">
      <AboutHeader />
      <AboutEditor
        ref={textareaRef}
        canEdit={canEdit}
        isSaving={isSaving}
        isEditing={isEditing}
        onEdit={handleEdit}
        onCancel={handleCancel}
        content={content}
        setContent={setContent}
        data={data}
      />
      <AboutFooter
        canEdit={canEdit}
        isEditing={isEditing}
        isSaving={isSaving}
        hasChanges={hasChanges}
        onSave={handleSave}
        onCancel={handleCancel}
      />

      <Modal
        isOpen={isCancelModalOpen}
        title="Discard changes?"
        message="You have unsaved changes. Are you sure you want to discard them?"
        onConfirm={confirmDiscard}
        onCancel={() => setIsCancelModalOpen(false)}
        confirmLabel="Discard"
        cancelLabel="Keep editing"
      />
    </div>
  );
};

export default AboutPage;
