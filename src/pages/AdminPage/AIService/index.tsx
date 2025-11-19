import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@ui/Card";
import { Button } from "@ui/Button";
import { Badge } from "@ui/Badge";
import { Skeleton } from "@ui/Skeleton";
import { Plus, Settings } from "lucide-react";
import HeaderAdmin from "@organisms/Header/Admin";
import { useTranslation } from "react-i18next";
import { useGetServiceConfigs } from "@hooks/useAI";
import CreateAIService from "./components/CreateAIService";
import { formatDate } from "@utils/date";
import { getStatusBadgeColor } from "@atoms/BadgeStatusColor";
import { getStatusLabel } from "@atoms/StatusLabel";

const AIServiceManagement: React.FC = () => {
    const { t } = useTranslation();
    const [showCreateDialog, setShowCreateDialog] = useState(false);

    const { data: serviceConfigs, isLoading, error } = useGetServiceConfigs();

    const handleCreateSuccess = () => {
        setShowCreateDialog(false);
    };

    return (
        <>
            <HeaderAdmin
                title={t("aiService.title")}
                description={t("aiService.description")}
            />

            <div className="p-8 mt-24 space-y-8">
                <Card className="bg-gradient-to-br from-card via-card to-card/95 border-border shadow-md">
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <Settings className="w-5 h-5 text-primary" />
                                </div>
                                <CardTitle className="text-xl font-bold text-foreground">
                                    {t("aiService.title")}
                                </CardTitle>
                            </div>
                            <Button
                                onClick={() => setShowCreateDialog(true)}
                                className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70 shadow-lg"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                {t("aiService.addNew")}
                            </Button>
                        </div>
                    </CardHeader>

                    <CardContent>
                        {isLoading ? (
                            <div className="space-y-4">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <div key={i} className="p-4 border rounded-lg space-y-3">
                                        <div className="flex items-center justify-between">
                                            <Skeleton className="h-6 w-32" />
                                            <Skeleton className="h-6 w-24" />
                                        </div>
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-2/3" />
                                    </div>
                                ))}
                            </div>
                        ) : error ? (
                            <div className="flex flex-col items-center justify-center py-16">
                                <div className="p-3 bg-destructive/10 rounded-full mb-4">
                                    <Settings className="w-8 h-8 text-destructive" />
                                </div>
                                <p className="text-destructive font-medium text-lg">
                                    {t("common.error")}
                                </p>
                            </div>
                        ) : !serviceConfigs || serviceConfigs.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16">
                                <div className="p-3 bg-muted rounded-full mb-4">
                                    <Settings className="w-8 h-8 text-muted-foreground" />
                                </div>
                                <p className="text-muted-foreground font-medium text-lg">
                                    {t("aiService.noServiceConfigs")}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {serviceConfigs.map((config: any) => (
                                    <Card
                                        key={config.id}
                                        className="bg-gradient-to-br from-card via-card to-card/95 border-border hover:border-primary/50 transition-all"
                                    >
                                        <CardContent className="p-6">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1 space-y-3">
                                                    <div className="flex items-center gap-3">
                                                        <Badge
                                                            variant="outline"
                                                            className="bg-primary/10 text-primary border-primary/30"
                                                        >
                                                            {t("aiService.columns.id")}: {config.id}
                                                        </Badge>
                                                        <Badge
                                                            className={getStatusBadgeColor(config.isActive)}
                                                        >
                                                            {getStatusLabel(config.isActive)}
                                                        </Badge>
                                                        {config.isDefault && (
                                                            <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/30">
                                                                {t("aiService.isDefault")}
                                                            </Badge>
                                                        )}
                                                    </div>

                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-medium text-muted-foreground">
                                                                {t("aiService.columns.serviceType")}:
                                                            </span>
                                                            <span className="text-sm font-semibold text-foreground">
                                                                {t(`aiService.serviceTypes.${config.serviceType}`)}
                                                            </span>
                                                        </div>

                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-medium text-muted-foreground">
                                                                {t("aiService.columns.geminiConfig")}:
                                                            </span>
                                                            <span className="text-sm font-semibold text-foreground">
                                                                #{config.geminiConfigId}
                                                                {config.geminiConfig?.geminiConfigModel?.name && (
                                                                    <> - {config.geminiConfig.geminiConfigModel.name}</>
                                                                )}
                                                            </span>
                                                        </div>

                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-medium text-muted-foreground">
                                                                {t("aiService.columns.createdAt")}:
                                                            </span>
                                                            <span className="text-sm text-foreground">
                                                                {formatDate(config.createdAt)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <CreateAIService
                    open={showCreateDialog}
                    onOpenChange={setShowCreateDialog}
                    onSuccess={handleCreateSuccess}
                />
            </div>
        </>
    );
};

export default AIServiceManagement;

