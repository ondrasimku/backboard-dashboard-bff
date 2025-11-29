"use client";

import { useState, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload, X, Camera, Check, Info } from "lucide-react";
import type { User } from "@/lib/types/user";
import { toast } from "sonner";

interface AvatarUploadPopoverProps {
  user: User;
  onUpdate?: () => void;
}

export const AvatarUploadPopover = ({
  user,
  onUpdate,
}: AvatarUploadPopoverProps) => {
  const avatarT = useTranslations("settings.account.avatar");
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [open, setOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
  const ALLOWED_FORMATS = 'JPEG, PNG, WebP';

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const validateAndSetFile = (file: File) => {
    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      const errorMessage = avatarT("error.invalidType") || "Invalid file type. Please upload a JPEG, PNG, or WebP image.";
      toast.error(errorMessage);
      return false;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      const errorMessage = avatarT("error.tooLarge") || "File too large. Maximum size is 10MB.";
      toast.error(errorMessage);
      return false;
    }

    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    validateAndSetFile(file);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      validateAndSetFile(file);
    }
  }, []);

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
      setOpen(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

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

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      handleCancel();
    }
  };

  const displayUrl = preview || user.avatarUrl;

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="relative cursor-pointer group"
          aria-label="Change profile picture"
        >
          <Avatar className="h-24 w-24 transition-opacity group-hover:opacity-80">
            <AvatarImage src={user.avatarUrl || undefined} alt="Profile" />
            <AvatarFallback className="text-2xl">
              {getInitials(user.firstName, user.lastName)}
            </AvatarFallback>
          </Avatar>
          <div className="absolute -right-2 -bottom-2">
            <div className="h-8 w-8 rounded-full bg-background border-2 border-background flex items-center justify-center shadow-sm">
              <Camera className="h-4 w-4 text-foreground" />
            </div>
          </div>
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-80"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="space-y-4">
          {/* Avatar Preview */}
          <div className="flex justify-center">
            <div className="relative">
              <Avatar className={`h-20 w-20 transition-all ${isDragging ? 'ring-4 ring-primary ring-offset-2 scale-105' : ''}`}>
                <AvatarImage src={displayUrl || undefined} alt="Profile" />
                <AvatarFallback className="text-xl">
                  {getInitials(user.firstName, user.lastName)}
                </AvatarFallback>
              </Avatar>
              {isDragging && (
                <div className="absolute inset-0 rounded-full bg-primary/20 border-2 border-dashed border-primary flex items-center justify-center">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
              )}
            </div>
          </div>

          {/* Info Section */}
          <div className="space-y-3">
            <div className="flex items-start gap-2 p-3 rounded-md bg-muted/50">
              <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="space-y-1 text-sm">
                <p className="font-medium">Allowed formats</p>
                <p className="text-muted-foreground">{ALLOWED_FORMATS}</p>
                <p className="font-medium mt-2">Maximum file size</p>
                <p className="text-muted-foreground">10 MB</p>
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
              <div className="p-2 rounded-md bg-muted/30">
                <p className="text-xs text-muted-foreground text-center">
                  {avatarT("selected") || "Selected"}: <span className="font-medium">{selectedFile.name}</span>
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {selectedFile && (
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={uploading}
                className="flex-1"
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
              className="flex-1"
            >
              {uploading ? (
                <>
                  {avatarT("uploading") || "Uploading..."}
                </>
              ) : selectedFile ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  {avatarT("upload") || "Upload"}
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  {avatarT("select") || "Select Image"}
                </>
              )}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

