"use client";

import { Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFileSelected: (file: File) => void;
}

export default function UploadModal({
  isOpen,
  onClose,
  onFileSelected,
}: UploadModalProps) {
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Additional Documents</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div
            className="border-2 border-dashed border-input rounded-md p-6 text-center cursor-pointer hover:border-primary transition-colors"
            onClick={() =>
              document.getElementById("file-upload-modal")?.click()
            }
          >
            <div className="flex flex-col items-center gap-3">
              <Upload className="h-6 w-6 text-muted-foreground" />
              <p className="text-muted-foreground">
                Click to upload or drag and drop
              </p>
              <p className="text-sm text-muted-foreground">
                PDF, DOC, DOCX, TXT files supported
              </p>
              <p className="text-xs text-muted-foreground/60">
                Only legal documents will be processed
              </p>
            </div>
            <input
              id="file-upload-modal"
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onFileSelected(file);
              }}
            />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
