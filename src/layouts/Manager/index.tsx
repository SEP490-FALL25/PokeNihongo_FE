import { Outlet, useLocation, NavLink } from "react-router-dom";
import { BookOpen, Languages, LogOut, Menu, FileText, Layers, Book, Settings } from "lucide-react";
import { useState } from "react";
import { Button } from "@ui/Button";
import { cn } from "@utils/CN";
import { ROUTES } from "@constants/route";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../../components/Atoms/LanguageSwitcher";

interface NavigationItem {
    name: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
}

const ManagerLayout = () => {
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const { t } = useTranslation();

    const navigation: NavigationItem[] = [
        {
            name: t("navigation.lessons"),
            href: ROUTES.MANAGER.LESSONS,
            icon: BookOpen,
        },
        {
            name: t("navigation.questionBank"),
            href: ROUTES.MANAGER.QUESTION_BANK,
            icon: FileText,
        },
        {
            name: t("navigation.testSets"),
            href: ROUTES.MANAGER.TESTSET_MANAGEMENT,
            icon: Layers,
        },
        {
            name: t("navigation.test"),
            href: ROUTES.MANAGER.TEST_MANAGEMENT,
            icon: Book,
        },
        {
            name: t("navigation.vocabulary"),
            href: ROUTES.MANAGER.VOCABULARY,
            icon: Languages,
        },
    ];

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
                        const isActive = location.pathname === item.href;

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
                                <item.icon className="h-5 w-5 flex-shrink-0" />
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
                        to={ROUTES.MANAGER.SETTINGS}
                        className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                            location.pathname === ROUTES.MANAGER.SETTINGS
                                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        )}
                    >
                        <Settings className="h-5 w-5 flex-shrink-0" />
                        {isSidebarOpen && <span>{t("navigation.settings")}</span>}
                    </NavLink>
                    <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors">
                        <LogOut className="h-5 w-5 flex-shrink-0" />
                        {isSidebarOpen && <span>{t("common.logout")}</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
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

export default ManagerLayout;

