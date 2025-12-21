import React from "react";
import { Input } from "@ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ui/Select";
import { Search, Filter } from "lucide-react";
import { TestSetCreateRequest } from "@models/testSet/request";
import { useTranslation } from "react-i18next";

interface FilterSectionProps {
  filters: {
    search?: string;
    levelN?: number;
    testType?: TestSetCreateRequest["testType"];
    status?: TestSetCreateRequest["status"];
  };
  onSearchChange: (search: string) => void;
  onLevelChange: (level: number | undefined) => void;
  onTestTypeChange: (testType: TestSetCreateRequest["testType"] | undefined) => void;
  onStatusChange: (status: TestSetCreateRequest["status"] | undefined) => void;
}

const FilterSection: React.FC<FilterSectionProps> = ({
  filters,
  onSearchChange,
  onLevelChange,
  onTestTypeChange,
  onStatusChange,
}) => {
  const { t } = useTranslation();
  return (
    <div className="border-t border-border pt-4 mt-4">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-semibold text-foreground">
          {t("testSetManagement.filters")}
        </span>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
          <Input
            placeholder={t("testSetManagement.searchPlaceholder")}
            defaultValue={filters.search || ""}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 bg-background border-border text-foreground h-11 shadow-sm focus:shadow-md transition-shadow"
          />
        </div>
        <Select
          value={filters.levelN ? String(filters.levelN) : "ALL"}
          onValueChange={(v) => onLevelChange(v === "ALL" ? undefined : Number(v))}
        >
          <SelectTrigger className="w-[140px] bg-background border-border text-foreground h-11 shadow-sm">
            <SelectValue placeholder={t("testSetManagement.selectLevel")} />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="ALL">{t("testManagement.allLevels")}</SelectItem>
            <SelectItem value="1">{t("testManagement.levels.N1")}</SelectItem>
            <SelectItem value="2">{t("testManagement.levels.N2")}</SelectItem>
            <SelectItem value="3">{t("testManagement.levels.N3")}</SelectItem>
            <SelectItem value="4">{t("testManagement.levels.N4")}</SelectItem>
            <SelectItem value="5">{t("testManagement.levels.N5")}</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={filters.testType || "ALL"}
          onValueChange={(v) =>
            onTestTypeChange(
              v === "ALL" ? undefined : (v as TestSetCreateRequest["testType"])
            )
          }
        >
          <SelectTrigger className="w-[180px] bg-background border-border text-foreground h-11 shadow-sm">
            <SelectValue placeholder={t("testSetManagement.testType")} />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="ALL">{t("testManagement.allTypes")}</SelectItem>
            <SelectItem value="VOCABULARY">
              {t("testManagement.testSetTypes.VOCABULARY")}
            </SelectItem>
            <SelectItem value="GRAMMAR">
              {t("testManagement.testSetTypes.GRAMMAR")}
            </SelectItem>
            <SelectItem value="KANJI">
              {t("testManagement.testSetTypes.KANJI")}
            </SelectItem>
            <SelectItem value="LISTENING">
              {t("testManagement.testSetTypes.LISTENING")}
            </SelectItem>
            <SelectItem value="READING">
              {t("testManagement.testSetTypes.READING")}
            </SelectItem>
            <SelectItem value="SPEAKING">
              {t("testManagement.testSetTypes.SPEAKING")}
            </SelectItem>
            <SelectItem value="GENERAL">
              {t("testManagement.testSetTypes.GENERAL")}
            </SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={filters.status || "ALL"}
          onValueChange={(v) =>
            onStatusChange(
              v === "ALL" ? undefined : (v as TestSetCreateRequest["status"])
            )
          }
        >
          <SelectTrigger className="w-[160px] bg-background border-border text-foreground h-11 shadow-sm">
            <SelectValue placeholder={t("testSetManagement.status")} />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="ALL">{t("testManagement.allStatuses")}</SelectItem>
            <SelectItem value="DRAFT">
              {t("testSetManagement.statuses.DRAFT")}
            </SelectItem>
            <SelectItem value="ACTIVE">
              {t("testSetManagement.statuses.ACTIVE")}
            </SelectItem>
            <SelectItem value="INACTIVE">
              {t("testSetManagement.statuses.INACTIVE")}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default FilterSection;

