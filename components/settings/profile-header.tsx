"use client";

import { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Calendar, Mail } from "lucide-react";
import type { User } from "@/lib/types/user";
import { toast } from "sonner";

interface ProfileHeaderProps {
  user: User;
  onUpdate?: () => void;
}

export const ProfileHeader = ({ user, onUpdate }: ProfileHeaderProps) => {
  const t = useTranslations("settings.account");
  const avatarT = useTranslations("settings.account.avatar");
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error(avatarT("error.invalidType") || "Invalid file type. Please upload a JPEG, PNG, or WebP image.");
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast.error(avatarT("error.tooLarge") || "File too large. Maximum size is 10MB.");
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

      onUpdate?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : avatarT("error.uploadFailed") || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleCameraClick = () => {
    if (selectedFile) {
      // If file is selected, upload it
      handleUpload();
    } else {
      // Otherwise, open file picker
      fileInputRef.current?.click();
    }
  };

  const displayUrl = preview || user.avatarUrl;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col items-start gap-6 md:flex-row md:items-center">
          <div className="relative">
            <Avatar className="h-24 w-24">
              <AvatarImage src={displayUrl || undefined} alt="Profile" />
              <AvatarFallback className="text-2xl">
                {getInitials(user.firstName, user.lastName)}
              </AvatarFallback>
            </Avatar>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="hidden"
              disabled={uploading}
            />
            <Button
              size="icon"
              variant="outline"
              className="absolute -right-2 -bottom-2 h-8 w-8 rounded-full"
              onClick={handleCameraClick}
              disabled={uploading}
              title={selectedFile ? "Upload selected image" : "Change profile picture"}
            >
              <Camera className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex flex-col gap-2 md:flex-row md:items-center">
              <h1 className="text-2xl font-bold">
                {user.firstName} {user.lastName}
              </h1>
              {user.roles && user.roles.length > 0 && (
                <Badge variant="secondary">
                  {user.roles[0].name}
                </Badge>
              )}
              {user.emailVerified && (
                <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">
                  Verified
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground">
              {user.email}
            </p>
            <div className="text-muted-foreground flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Mail className="size-4" />
                {user.email}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="size-4" />
                Joined {formatDate(user.createdAt)}
              </div>
            </div>
          </div>
        </div>
        {selectedFile && (
          <div className="w-full md:w-auto">
            <p className="text-xs text-muted-foreground mb-2">
              {avatarT("selected") || "Selected"}: {selectedFile.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {avatarT("description") || "Click the camera icon to upload"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

