import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";

export const useFormDraft = (formIdentifier) => {
  const userId = useSelector((state) => state.auth?.auth?.data?.id || "guest");
  const draftKey = `draft_${userId}_${formIdentifier}`;

  const hasDraft = () => {
    return !!localStorage.getItem(draftKey);
  };

  const getDraft = () => {
    try {
      const draft = localStorage.getItem(draftKey);
      return draft ? JSON.parse(draft) : null;
    } catch (e) {
      console.error("Error reading draft", e);
      return null;
    }
  };

  const saveDraft = (values) => {
    try {
      localStorage.setItem(draftKey, JSON.stringify(values));
    } catch (e) {
      console.error("Error saving draft", e);
    }
  };

  const clearDraft = () => {
    localStorage.removeItem(draftKey);
  };

  const promptRestoreDraft = (onRestore) => {
    if (hasDraft()) {
      Swal.fire({
        title: "Unsaved Draft Found",
        text: "You have an unsaved draft for this form. Would you like to restore it?",
        icon: "info",
        showCancelButton: true,
        confirmButtonText: "Yes, Restore",
        cancelButtonText: "Discard Draft",
        confirmButtonColor: "#185FA5",
      }).then((result) => {
        if (result.isConfirmed) {
          const draftData = getDraft();
          if (draftData) {
            onRestore(draftData);
          }
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          clearDraft();
        }
      });
    }
  };

  const promptSaveDraftOnBack = (values, onConfirmLeave) => {
    Swal.fire({
      title: "Unsaved Changes",
      text: "You have unsaved changes. Would you like to save them as a draft before leaving?",
      icon: "warning",
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: "Save as Draft",
      denyButtonText: `Discard`,
      confirmButtonColor: "#185FA5",
    }).then((result) => {
      if (result.isConfirmed) {
        saveDraft(values);
        onConfirmLeave();
      } else if (result.isDenied) {
        clearDraft();
        onConfirmLeave();
      }
    });
  };

  const promptSaveDraftOnError = (values, errorMessage = "An error occurred while saving") => {
    Swal.fire({
      title: "Save Failed",
      text: `${errorMessage}. Would you like to save your progress as a draft?`,
      icon: "error",
      showCancelButton: true,
      confirmButtonText: "Save as Draft",
      cancelButtonText: "Don't Save",
      confirmButtonColor: "#185FA5",
    }).then((result) => {
      if (result.isConfirmed) {
        saveDraft(values);
        Swal.fire("Draft Saved", "You can resume this later.", "success");
      }
    });
  };

  const useDraftAutoSave = (values, isDirty) => {
    useEffect(() => {
      const handleBeforeUnload = (e) => {
        if (isDirty) {
          saveDraft(values); // Automatically save to draft seamlessly
        }
      };
      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [values, isDirty]);
  };

  return {
    saveDraft,
    getDraft,
    clearDraft,
    hasDraft,
    promptRestoreDraft,
    promptSaveDraftOnBack,
    promptSaveDraftOnError,
    useDraftAutoSave,
  };
};
