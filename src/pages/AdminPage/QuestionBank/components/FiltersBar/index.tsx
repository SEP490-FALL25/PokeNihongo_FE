import React from "react";
import { Input } from "@ui/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@ui/Select";
import { Button } from "@ui/Button";
import { Search, Plus, Sparkles } from "lucide-react";

const FiltersBar: React.FC<COMPONENTS.IFiltersBarProps> = ({
  searchInput,
  setSearchInput,
  filters,
  handleFilterChange,
  language,
  QUESTION_TYPE_LABELS,
  JLPT_LEVEL_LABELS,
  openCreateDialog,
  t,
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mt-4 pb-4">
      <div className="flex-1 w-full sm:max-w-md relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
        <Input
          placeholder={t("questionBank.searchPlaceholder")}
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="pl-10 bg-background border-border text-foreground h-11 shadow-sm focus:shadow-md transition-shadow"
        />
      </div>

      <div className="flex gap-2 w-full sm:w-auto">
        <Select
          value={filters.levelN?.toString() || "all"}
          onValueChange={(value) =>
            handleFilterChange("levelN", value === "all" ? undefined : parseInt(value))
          }
        >
          <SelectTrigger className="w-full sm:w-[140px] bg-background border-border text-foreground h-11 shadow-sm">
            <SelectValue placeholder={String(t("questionBank.allLevels"))} />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="all">{t("questionBank.allLevels")}</SelectItem>
            {Object.entries(JLPT_LEVEL_LABELS[language as keyof typeof JLPT_LEVEL_LABELS] || {}).map(
              ([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              )
            )}
          </SelectContent>
        </Select>
        <Select
          value={filters.questionType || "all"}
          onValueChange={(value) =>
            handleFilterChange("questionType", value === "all" ? undefined : value)
          }
        >
          <SelectTrigger className="w-full sm:w-[160px] bg-background border-border text-foreground h-11 shadow-sm">
            <SelectValue placeholder={String(t("questionBank.allQuestionTypes"))} />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="all">{t("questionBank.allQuestionTypes")}</SelectItem>
            {Object.entries(
              QUESTION_TYPE_LABELS[language as keyof typeof QUESTION_TYPE_LABELS] || {}
            ).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          onClick={openCreateDialog}
          className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70 shadow-lg"
        >
          <Plus className="w-4 h-4 mr-2" />
          {t("questionBank.addQuestion")}
        </Button>
      </div>
    </div>
  );
};

export default FiltersBar;


