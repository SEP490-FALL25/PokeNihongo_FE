import React, { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@ui/Dialog";
import { Button } from "@ui/Button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@ui/Select";
import { Switch } from "@ui/Switch";
import { useTranslation } from "react-i18next";
import { useCreateServiceConfig } from "@hooks/useAI";
import { useConfigPromptsCustom } from "@hooks/useAI";
import { SERVICE_TYPE } from "@constants/ai";
import { ICreateServiceConfigRequest } from "@models/ai/request";
import { Loader2 } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { createServiceConfigSchema } from "@models/ai/request";

interface CreateAIServiceProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const CreateAIService: React.FC<CreateAIServiceProps> = ({
  open,
  onOpenChange,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const createServiceConfigMutation = useCreateServiceConfig();

  // Get list of prompts for selection
  const { data: promptsData, isLoading: loadingPrompts } = useConfigPromptsCustom({
    page: 1,
    limit: 1000,
    isActive: true,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(createServiceConfigSchema(t)),
    defaultValues: {
      serviceType: SERVICE_TYPE.PERSONALIZED_RECOMMENDATIONS,
      geminiConfigId: 0,
      isDefault: false,
      isActive: true,
    },
  });

  const serviceType = watch("serviceType");
  const geminiConfigId = watch("geminiConfigId");
  const isDefault = watch("isDefault");
  const isActive = watch("isActive");

  useEffect(() => {
    if (!open) {
      reset({
        serviceType: SERVICE_TYPE.PERSONALIZED_RECOMMENDATIONS,
        geminiConfigId: 0,
        isDefault: false,
        isActive: true,
      });
    }
  }, [open, reset]);

  const onSubmit = async (data: ICreateServiceConfigRequest) => {
    try {
      await createServiceConfigMutation.mutateAsync(data);
      onSuccess();
    } catch (error) {
      // Error is handled in the mutation
    }
  };

  const isSubmitting = createServiceConfigMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-white">
        <DialogHeader>
          <DialogTitle>{t("aiService.createServiceConfig")}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              {t("aiService.serviceType")}
            </label>
            <Select
              value={serviceType}
              onValueChange={(value) =>
                setValue("serviceType", value as ICreateServiceConfigRequest["serviceType"])
              }
            >
              <SelectTrigger className="bg-background border-border text-foreground h-11">
                <SelectValue placeholder={t("aiService.selectServiceType")} />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {Object.values(SERVICE_TYPE).map((type) => (
                  <SelectItem key={type} value={type}>
                    {t(`aiService.serviceTypes.${type}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.serviceType && (
              <p className="text-sm text-destructive">{errors.serviceType.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              {t("aiService.geminiConfigId")}
            </label>
            {loadingPrompts ? (
              <div className="flex items-center gap-2 p-3 border rounded-md">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">{t("aiService.loading")}</span>
              </div>
            ) : (
              <Select
                value={geminiConfigId ? String(geminiConfigId) : ""}
                onValueChange={(value) =>
                  setValue("geminiConfigId", parseInt(value) || 0)
                }
              >
                <SelectTrigger className="bg-background border-border text-foreground h-11">
                  <SelectValue placeholder={t("aiService.selectGeminiConfig")} />
                </SelectTrigger>
                <SelectContent className="bg-card border-border max-h-[300px]">
                  {promptsData?.results && promptsData.results.length > 0 ? (
                    promptsData.results.map((prompt: any) => (
                      <SelectItem key={prompt.id} value={String(prompt.id)}>
                        ID {prompt.id} - {prompt.prompt?.substring(0, 50)}...
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="" disabled>
                      {t("aiCommon.noModels")}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            )}
            {errors.geminiConfigId && (
              <p className="text-sm text-destructive">{errors.geminiConfigId.message}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Switch
              checked={isDefault}
              onCheckedChange={(checked) => setValue("isDefault", checked)}
              {...register("isDefault")}
            />
            <label className="text-sm font-medium text-foreground">
              {t("aiService.isDefault")}
            </label>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              checked={isActive}
              onCheckedChange={(checked) => setValue("isActive", checked)}
              {...register("isActive")}
            />
            <label className="text-sm font-medium text-foreground">
              {t("aiService.isActive")}
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t("common.saving")}
                </>
              ) : (
                t("common.save")
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateAIService;

