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
import { useTranslation } from "react-i18next";
import { TestCreateRequest } from "@models/test/request";

interface FilterSectionProps {
  filters: {
    search?: string;
    levelN?: number;
    testType?: TestCreateRequest["testType"];
    status?: TestCreateRequest["status"];
  };
  onSearchChange: (search: string) => void;
  onLevelChange: (level: number | undefined) => void;
  onTestTypeChange: (
    testType: TestCreateRequest["testType"] | undefined
  ) => void;
  onStatusChange: (status: TestCreateRequest["status"] | undefined) => void;
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
        <span className="text-sm font-semibold text-foreground">{t("testManagement.filters")}</span>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
          <Input
            placeholder={t("testManagement.searchPlaceholder")}
            defaultValue={filters.search || ""}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 bg-background border-border text-foreground h-11 shadow-sm focus:shadow-md transition-shadow"
          />
        </div>
        <Select
          value={filters.levelN ? String(filters.levelN) : "ALL"}
          onValueChange={(v) =>
            onLevelChange(v === "ALL" ? undefined : Number(v))
          }
        >
          <SelectTrigger className="w-[140px] bg-background border-border text-foreground h-11 shadow-sm">
            <SelectValue placeholder={t("testManagement.selectLevel")} />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="ALL">{t("testManagement.allLevels")}</SelectItem>
            <SelectItem value="0">{t("testManagement.allLevels")}</SelectItem>
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
              v === "ALL" ? undefined : (v as TestCreateRequest["testType"])
            )
          }
        >
          <SelectTrigger className="w-[180px] bg-background border-border text-foreground h-11 shadow-sm">
            <SelectValue placeholder={t("testManagement.selectTestType")} />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="ALL">{t("testManagement.allTypes")}</SelectItem>
            <SelectItem value="READING_TEST">{t("testManagement.testTypes.READING_TEST")}</SelectItem>
            <SelectItem value="LISTENING_TEST">{t("testManagement.testTypes.LISTENING_TEST")}</SelectItem>
            <SelectItem value="SPEAKING_TEST">{t("testManagement.testTypes.SPEAKING_TEST")}</SelectItem>
            <SelectItem value="MATCH_TEST">{t("testManagement.testTypes.MATCH_TEST")}</SelectItem>
            <SelectItem value="QUIZ_TEST">{t("testManagement.testTypes.QUIZ_TEST")}</SelectItem>
            <SelectItem value="REVIEW_TEST">{t("testManagement.testTypes.REVIEW_TEST")}</SelectItem>
            <SelectItem value="PRACTICE_TEST">{t("testManagement.testTypes.PRACTICE_TEST")}</SelectItem>
            <SelectItem value="PLACEMENT_TEST_DONE">
              {t("testManagement.testTypes.PLACEMENT_TEST_DONE")}
            </SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={filters.status || "ALL"}
          onValueChange={(v) =>
            onStatusChange(
              v === "ALL" ? undefined : (v as TestCreateRequest["status"])
            )
          }
        >
          <SelectTrigger className="w-[160px] bg-background border-border text-foreground h-11 shadow-sm">
            <SelectValue placeholder={t("testManagement.selectStatus")} />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="ALL">{t("testManagement.allStatuses")}</SelectItem>
            <SelectItem value="DRAFT">DRAFT</SelectItem>
            <SelectItem value="ACTIVE">ACTIVE</SelectItem>
            <SelectItem value="INACTIVE">INACTIVE</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default FilterSection;
