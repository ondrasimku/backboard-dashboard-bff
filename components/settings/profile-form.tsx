"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { User } from "@/lib/types/user";
import { toast } from "sonner";

interface ProfileFormProps {
  user: User;
  onUpdate?: () => void;
}

export const ProfileForm = ({ user, onUpdate }: ProfileFormProps) => {
  const t = useTranslations("settings.account.profile");
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/users/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || t("error"));
      }

      toast.success(t("success"));
      onUpdate?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("error"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="firstName">{t("firstName")}</Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) =>
              setFormData({ ...formData, firstName: e.target.value })
            }
            disabled={isLoading}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">{t("lastName")}</Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) =>
              setFormData({ ...formData, lastName: e.target.value })
            }
            disabled={isLoading}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">{t("email")}</Label>
          <Input id="email" value={user.email} disabled className="bg-muted" />
          <p className="text-xs text-muted-foreground">
            Email address cannot be changed
          </p>
        </div>
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? t("saving") : t("save")}
      </Button>
    </form>
  );
};

