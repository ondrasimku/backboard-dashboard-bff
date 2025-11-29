"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Key } from "lucide-react";

export const ChangePasswordForm = () => {
  const t = useTranslations("settings.account.password");
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (formData.newPassword.length < 8) {
      newErrors.newPassword = t("passwordMinLength");
    }

    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = t("passwordMismatch");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || t("error"));
      }

      toast.success(t("success"));
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("error"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Label className="text-base">Password</Label>
          <p className="text-muted-foreground text-sm">Update your account password</p>
        </div>
      </div>
      <Separator />
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="currentPassword">{t("currentPassword")}</Label>
          <Input
            id="currentPassword"
            type="password"
            value={formData.currentPassword}
            onChange={(e) =>
              setFormData({ ...formData, currentPassword: e.target.value })
            }
            disabled={isLoading}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="newPassword">{t("newPassword")}</Label>
          <Input
            id="newPassword"
            type="password"
            value={formData.newPassword}
            onChange={(e) => {
              setFormData({ ...formData, newPassword: e.target.value });
              setErrors({ ...errors, newPassword: "" });
            }}
            disabled={isLoading}
            required
          />
          {errors.newPassword && (
            <p className="text-xs text-destructive">{errors.newPassword}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">{t("confirmPassword")}</Label>
          <Input
            id="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => {
              setFormData({ ...formData, confirmPassword: e.target.value });
              setErrors({ ...errors, confirmPassword: "" });
            }}
            disabled={isLoading}
            required
          />
          {errors.confirmPassword && (
            <p className="text-xs text-destructive">{errors.confirmPassword}</p>
          )}
        </div>

        <Button type="submit" disabled={isLoading}>
          <Key className="mr-2 h-4 w-4" />
          {isLoading ? t("changing") : t("changePassword")}
        </Button>
      </form>
    </div>
  );
};

