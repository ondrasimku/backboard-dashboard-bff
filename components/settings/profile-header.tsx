"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Mail } from "lucide-react";
import type { User } from "@/lib/types/user";
import { AvatarUploadPopover } from "./avatar-upload-popover";

interface ProfileHeaderProps {
  user: User;
  onUpdate?: () => void;
}

export const ProfileHeader = ({ user, onUpdate }: ProfileHeaderProps) => {
  const t = useTranslations("settings.account");

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col items-start gap-6 md:flex-row md:items-center">
          <div className="flex-shrink-0">
            <AvatarUploadPopover user={user} onUpdate={onUpdate} />
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
      </CardContent>
    </Card>
  );
};

