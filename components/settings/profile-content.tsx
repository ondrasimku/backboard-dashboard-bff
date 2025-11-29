"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ProfileForm } from "./profile-form";
import { ChangePasswordForm } from "./change-password-form";
import type { User } from "@/lib/types/user";

interface ProfileContentProps {
  user: User;
  onUpdate?: () => void;
}

export const ProfileContent = ({ user, onUpdate }: ProfileContentProps) => {
  const t = useTranslations("settings.account");

  return (
    <Tabs defaultValue="personal" className="space-y-6">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="personal">Personal</TabsTrigger>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
      </TabsList>

      {/* Personal Information */}
      <TabsContent value="personal" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("profile.title")}</CardTitle>
            <CardDescription>{t("profile.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileForm user={user} onUpdate={onUpdate} />
          </CardContent>
        </Card>
      </TabsContent>

      {/* Account Settings */}
      <TabsContent value="account" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
            <CardDescription>Manage your account preferences and information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-base">Account Status</Label>
                <p className="text-muted-foreground text-sm">Your account is currently active</p>
              </div>
              <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">
                Active
              </Badge>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-base">{t("profile.emailVerified")}</Label>
                <p className="text-muted-foreground text-sm">
                  {user.emailVerified ? "Your email has been verified" : "Please verify your email address"}
                </p>
              </div>
              <Badge variant={user.emailVerified ? "outline" : "destructive"} className={user.emailVerified ? "border-green-200 bg-green-50 text-green-700" : ""}>
                {user.emailVerified ? "Verified" : "Not Verified"}
              </Badge>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-base">{t("profile.roles")}</Label>
                <p className="text-muted-foreground text-sm">Your assigned roles and permissions</p>
              </div>
              <div className="flex flex-wrap gap-1">
                {user.roles && user.roles.length > 0 ? (
                  user.roles.map((role) => (
                    <Badge key={role.id} variant="default">
                      {role.name}
                    </Badge>
                  ))
                ) : (
                  <Badge variant="secondary">No roles</Badge>
                )}
              </div>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-base">{t("accountInfo.createdAt")}</Label>
                <p className="text-muted-foreground text-sm">
                  {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-base">{t("accountInfo.updatedAt")}</Label>
                <p className="text-muted-foreground text-sm">
                  {new Date(user.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Security Settings */}
      <TabsContent value="security" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Security Settings</CardTitle>
            <CardDescription>Manage your account security and authentication.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <ChangePasswordForm />
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

