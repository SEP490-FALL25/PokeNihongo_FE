  import { Outlet, useLocation, NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, BarChart3, Settings, LogOut, Menu, Trophy, Package, Brain, Calendar, Gift, LucideIcon, Store, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Button } from "@ui/Button";
import { cn } from "@utils/CN";
import { ROUTES } from "@constants/route";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../../components/Atoms/LanguageSwitcher";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, } from "@ui/Accordion";
import { ChevronDown } from "lucide-react";
import React from 'react';
import SparklesFillIcon from "@atoms/SparklesFill";
import { CookiesService } from "@utils/cookies";
import { COOKIES } from "@constants/common";


interface NavigationItem {
  name: string;
  href: string;
  icon: LucideIcon | React.ComponentType<{ className?: string }>;
  children?: NavigationItem[];
}

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { t } = useTranslation();

  const navigation: NavigationItem[] = [
    {
      name: t("navigation.dashboard"),
      href: ROUTES.ADMIN.ROOT,
      icon: LayoutDashboard,
    },
    { name: t("navigation.users"), href: ROUTES.ADMIN.USERS, icon: Users },
    {
      name: t("navigation.pokemon"),
      href: ROUTES.ADMIN.POKEMON_MANAGEMENT,
      icon: Trophy,
    },
    {
      name: t("navigation.tournaments"),
      href: ROUTES.ADMIN.TOURNAMENT_MANAGEMENT,
      icon: Trophy,
    },
    {
      name: t("navigation.packageManagement"),
      href: ROUTES.ADMIN.PACKAGE_MANAGEMENT,
      icon: Package,
    },
    {
      name: t("navigation.aiPrompts"),
      href: ROUTES.ADMIN.AI_PROMPTS_MANAGEMENT,
      icon: Brain,
    },
    {
      name: t("navigation.analytics"),
      href: ROUTES.ADMIN.ANALYTICS,
      icon: BarChart3,
    },
    {
      name: t("navigation.dailyQuests"),
      href: ROUTES.ADMIN.DAILY_QUEST_MANAGEMENT,
      icon: Calendar,
    },
    {
      name: t("navigation.rewards"),
      href: ROUTES.ADMIN.REWARD_MANAGEMENT,
      icon: Gift,
    },
    {
      name: t("navigation.configShop"),
      href: ROUTES.ADMIN.CONFIG_SHOP,
      icon: Store,
    },
    {
      name: t("navigation.configGacha"),
      href: ROUTES.ADMIN.CONFIG_GACHA,
      icon: SparklesFillIcon,
    },
    {
      name: t("navigation.permissionManagement"),
      href: ROUTES.ADMIN.PERMISSION_MANAGEMENT,
      icon: ShieldCheck,
    }
  ];

  /**
   * Handle logout
   */
  const handleLogout = () => {
    CookiesService.remove(COOKIES.ACCESS_TOKEN);
    navigate(ROUTES.AUTH.LOGIN, { replace: true });
  }
  //-----------------------End--------------------//

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside
        className={cn(
          "flex flex-col border-r border-border bg-sidebar transition-all duration-300 fixed h-full z-10",
          isSidebarOpen ? "w-64" : "w-20"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-border flex-shrink-0">
          {isSidebarOpen && (
            <h1 className="text-xl font-bold text-sidebar-foreground">
              PokeNihongo
            </h1>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
          {navigation.map((item) => {
            const isActive =
              location.pathname === item.href ||
              (item.children &&
                item.children.some(
                  (child) => location.pathname === child.href
                ));
            const hasChildren = item.children && item.children.length > 0;

            if (hasChildren && isSidebarOpen) {
              return (
                <Accordion
                  key={item.name}
                  type="single"
                  collapsible
                  className="w-full"
                >
                  <AccordionItem value={item.name} className="border-none">
                    <AccordionTrigger
                      className={cn(
                        "cursor-pointer flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:no-underline [&>svg:last-child]:hidden",
                        isActive
                          ? "bg-sidebar-primary text-sidebar-primary-foreground"
                          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        {React.createElement(item.icon, { className: "h-5 w-5 flex-shrink-0" })}
                        <span>{item.name}</span>
                      </div>
                      <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
                    </AccordionTrigger>
                    <AccordionContent className="pt-1">
                      <div className="ml-6 space-y-1">
                        {item.children?.map((child) => {
                          const isChildActive =
                            location.pathname === child.href;
                          return (
                            <NavLink
                              key={child.name}
                              to={child.href}
                              className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-colors",
                                isChildActive
                                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                              )}
                            >
                              <span>{child.name}</span>
                            </NavLink>
                          );
                        })}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              );
            }

            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                {React.createElement(item.icon, { className: "h-5 w-5 flex-shrink-0" })}
                {isSidebarOpen && <span>{item.name}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="border-t border-border p-4 space-y-1 flex-shrink-0">
          {/* Language Switcher */}
          {isSidebarOpen && (
            <div className="mb-3">
              <LanguageSwitcher />
            </div>
          )}

          <NavLink
            to={ROUTES.ADMIN.SETTINGS}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              location.pathname === ROUTES.ADMIN.SETTINGS
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            )}
          >
            <Settings className="h-5 w-5 flex-shrink-0" />
            {isSidebarOpen && <span>{t("navigation.settings")}</span>}
          </NavLink>
          <button onClick={handleLogout} className="cursor-pointer flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors">
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {isSidebarOpen && <span>{t("common.logout")}</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      {/* SỬA LẠI: Thêm padding-left và transition */}
      <main
        className={cn(
          "flex-1 transition-all duration-300",
          isSidebarOpen ? "ml-64" : "ml-20"
        )}
      >
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
