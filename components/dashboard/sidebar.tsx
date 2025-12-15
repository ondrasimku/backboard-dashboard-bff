"use client";

import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { useTranslations } from 'next-intl';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import {
  LayoutDashboard,
  Database,
  FolderKanban,
  Settings,
  BarChart3,
  Users,
  FileText,
  ChevronRight,
  UserCog,
  LogOut,
  ChevronUp,
  Shield,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { bffAuthClient } from "@/lib/clients/bff-auth-client";
import { useState, useEffect } from "react";
import type { User } from "@/lib/types/user";
import { KeyRound, ShieldCheck } from "lucide-react";

export const AppSidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const t = useTranslations('nav');
  const tCommon = useTranslations('common');
  const tUser = useTranslations('user');

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await bffAuthClient.logout();
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Logout failed:', error);
      setIsLoggingOut(false);
    }
  };

  const menuItems = [
    {
      title: t('dashboard'),
      href: "/",
      icon: LayoutDashboard,
    },
    {
      title: t('pages'),
      href: "/pages",
      icon: FileText,
    },
    {
      title: t('projects'),
      href: "/projects",
      icon: FolderKanban,
    },
    {
      title: t('datasets'),
      href: "/datasets",
      icon: Database,
    },
    {
      title: t('documents'),
      href: "/documents",
      icon: FileText,
    },
    {
      title: t('team'),
      href: "/team",
      icon: Users,
    },
  ];

  const settingsItems = [
    {
      title: t('account'),
      href: "/settings/account",
      icon: UserCog,
    },
  ];

  const [userCount, setUserCount] = useState<number | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [hasRolesPermission, setHasRolesPermission] = useState(false);
  const [hasPermissionsPermission, setHasPermissionsPermission] = useState(false);

  useEffect(() => {
    const fetchUserCount = async () => {
      try {
        const response = await fetch('/api/users/metrics');
        if (response.ok) {
          const data = await response.json();
          setUserCount(data.userCount);
        }
      } catch (error) {
        console.error('Failed to fetch user count:', error);
      }
    };

    fetchUserCount();
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setUserLoading(true);
        const response = await fetch('/api/users/me');
        if (response.ok) {
          const data = await response.json();
          setUser(data);
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
      } finally {
        setUserLoading(false);
      }
    };

    const checkPermissions = async () => {
      try {
        const response = await fetch('/api/auth/permissions');
        if (response.ok) {
          const data = await response.json();
          setHasRolesPermission(data.permissions?.includes('roles:manage') || false);
          setHasPermissionsPermission(data.permissions?.includes('permissions:manage') || false);
        }
      } catch (error) {
        console.error('Failed to check permissions:', error);
      }
    };

    fetchUser();
    checkPermissions();
  }, []);

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const administrationItems = [
    {
      title: t('analytics'),
      href: "/administration/analytics",
      icon: BarChart3,
      badge: userCount !== null ? userCount.toString() : undefined,
    },
    {
      title: t('users'),
      href: "/administration/users",
      icon: Users,
    },
    ...(hasRolesPermission ? [{
      title: t('roles'),
      href: "/administration/roles",
      icon: ShieldCheck,
    }] : []),
    ...(hasPermissionsPermission ? [{
      title: t('permissions'),
      href: "/administration/permissions",
      icon: KeyRound,
    }] : []),
  ];

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <span className="text-sm font-bold">B</span>
                </div>
                <span className="text-lg font-bold group-data-[collapsible=icon]:hidden">
                  {tCommon('backboard')}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <LanguageSwitcher />
                <ThemeToggle />
                <SidebarTrigger className="-mr-1" />
              </div>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                    >
                      <Link href={item.href}>
                        <Icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
              
              {/* Administration Collapsible */}
              <Collapsible
                defaultOpen={pathname.startsWith("/administration")}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={t('administration')}>
                      <Shield className="h-4 w-4" />
                      <span>{t('administration')}</span>
                      <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {administrationItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;

                        return (
                          <SidebarMenuSubItem key={item.href}>
                            <SidebarMenuSubButton
                              asChild
                              isActive={isActive}
                            >
                              <Link href={item.href}>
                                <Icon className="h-4 w-4" />
                                <span>{item.title}</span>
                                {item.badge && (
                                  <span className="ml-auto rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
                                    {item.badge}
                                  </span>
                                )}
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        );
                      })}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>

              {/* Settings Collapsible */}
              <Collapsible
                defaultOpen={pathname.startsWith("/settings")}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={t('settings')}>
                      <Settings className="h-4 w-4" />
                      <span>{t('settings')}</span>
                      <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {settingsItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;

                        return (
                          <SidebarMenuSubItem key={item.href}>
                            <SidebarMenuSubButton
                              asChild
                              isActive={isActive}
                            >
                              <Link href={item.href}>
                                <Icon className="h-4 w-4" />
                                <span>{item.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        );
                      })}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton tooltip={tCommon('profile')} className="data-[state=open]:bg-accent">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.avatarUrl || undefined} alt={user ? `${user.firstName} ${user.lastName}` : "User"} />
                    <AvatarFallback>
                      {user ? getInitials(user.firstName, user.lastName) : "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                    <p className="text-sm font-medium leading-none">
                      {user ? `${user.firstName} ${user.lastName}` : (userLoading ? "Loading..." : tUser('name'))}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {user ? user.email : (userLoading ? "" : tUser('email'))}
                    </p>
                  </div>
                  <ChevronUp className="ml-auto h-4 w-4 group-data-[collapsible=icon]:hidden" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link href="/settings/account" className="cursor-pointer">
                    <UserCog className="mr-2 h-4 w-4" />
                    <span>{t('account')}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{isLoggingOut ? tCommon('loggingOut') : tCommon('logout')}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

