"use client";

import { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload, X } from "lucide-react";
import type { User } from "@/lib/types/user";
import { toast } from "sonner";

interface AvatarUploadModalProps {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate?: () => void;
}

export const AvatarUploadModal = ({
  user,
  open,
  onOpenChange,
  onUpdate,
}: AvatarUploadModalProps) => {
  const avatarT = useTranslations("settings.account.avatar");
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
  const ALLOWED_FORMATS = 'JPEG, PNG, WebP';

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      const errorMessage = avatarT("error.invalidType") || "Invalid file type. Please upload a JPEG, PNG, or WebP image.";
      toast.error(errorMessage);
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      const errorMessage = avatarT("error.tooLarge") || "File too large. Maximum size is 10MB.";
      toast.error(errorMessage);
      return;
    }

    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('/api/profile/avatar', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.details || avatarT("error.uploadFailed") || 'Upload failed');
      }

      toast.success(avatarT("success") || "Avatar uploaded successfully");
      
      // Clear preview and selected file
      setPreview(null);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      onOpenChange(false);
      onUpdate?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : avatarT("error.uploadFailed") || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setPreview(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSelectClick = () => {
    fileInputRef.current?.click();
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      // Reset state when closing
      handleCancel();
    }
    onOpenChange(open);
  };

  const displayUrl = preview || user.avatarUrl;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{avatarT("title") || "Profile Picture"}</DialogTitle>
          <DialogDescription>
            {avatarT("description") || "Upload and manage your profile picture"}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center gap-6 py-4">
          <Avatar className="h-32 w-32">
            <AvatarImage src={displayUrl || undefined} alt={`${user.firstName} ${user.lastName}`} />
            <AvatarFallback className="text-3xl">
              {getInitials(user.firstName, user.lastName)}
            </AvatarFallback>
          </Avatar>

          <div className="w-full space-y-4 text-center">
            <div className="space-y-2">
              <p className="text-sm font-medium">Allowed formats</p>
              <p className="text-sm text-muted-foreground">{ALLOWED_FORMATS}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Maximum file size</p>
              <p className="text-sm text-muted-foreground">10 MB</p>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            className="hidden"
            disabled={uploading}
          />

          {selectedFile && (
            <div className="w-full space-y-2">
              <p className="text-sm text-muted-foreground text-center">
                {avatarT("selected") || "Selected"}: {selectedFile.name}
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {selectedFile && (
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={uploading}
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          )}
          <Button
            type="button"
            variant={selectedFile ? "default" : "outline"}
            onClick={selectedFile ? handleUpload : handleSelectClick}
            disabled={uploading}
            className="flex-1 sm:flex-initial"
          >
            {uploading ? (
              <>
                {avatarT("uploading") || "Uploading..."}
              </>
            ) : selectedFile ? (
              <>
                <Upload className="mr-2 h-4 w-4" />
                {avatarT("upload") || "Upload"}
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                {avatarT("select") || "Select Image"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

