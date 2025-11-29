"use client";

import { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { User } from "@/lib/types/user";
import { toast } from "sonner";
import { Upload, X } from "lucide-react";

interface AvatarUploadProps {
  user: User;
  onUpdate?: () => void;
}

export const AvatarUpload = ({ user, onUpdate }: AvatarUploadProps) => {
  const t = useTranslations("settings.account.avatar");
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error(t("error.invalidType") || "Invalid file type. Please upload a JPEG, PNG, or WebP image.");
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast.error(t("error.tooLarge") || "File too large. Maximum size is 10MB.");
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
        throw new Error(errorData.error || errorData.details || t("error.uploadFailed") || 'Upload failed');
      }

      const userData = await response.json();
      toast.success(t("success") || "Avatar uploaded successfully");
      
      // Clear preview and selected file
      setPreview(null);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      onUpdate?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("error.uploadFailed") || 'Upload failed');
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

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const displayUrl = preview || user.avatarUrl;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Avatar className="h-24 w-24">
          <AvatarImage src={displayUrl || undefined} alt={`${user.firstName} ${user.lastName}`} />
          <AvatarFallback className="text-lg">
            {getInitials(user.firstName, user.lastName)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-2">
          <div>
            <p className="text-sm font-medium">{t("title") || "Profile Picture"}</p>
            <p className="text-xs text-muted-foreground">
              {t("description") || "Upload a JPEG, PNG, or WebP image (max 10MB)"}
            </p>
          </div>
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="hidden"
              disabled={uploading}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClick}
              disabled={uploading}
            >
              <Upload className="mr-2 h-4 w-4" />
              {t("select") || "Select Image"}
            </Button>
            {selectedFile && (
              <>
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={handleUpload}
                  disabled={uploading}
                >
                  {uploading ? (t("uploading") || "Uploading...") : (t("upload") || "Upload")}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleCancel}
                  disabled={uploading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
          {selectedFile && (
            <p className="text-xs text-muted-foreground">
              {t("selected") || "Selected"}: {selectedFile.name}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

