import React from "react";
import { Button } from "@ui/Button";
import { Checkbox } from "@ui/Checkbox";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { TestSetEntity } from "@models/testSet/entity";

interface LinkedTestSetsSectionProps {
  linkedTestSets: TestSetEntity[];
  loadingLinked: boolean;
  selectedLinkedIds: number[];
  extractText: (field: unknown, lang?: string) => string;
  onToggleSelect: (id: number) => void;
  onRemove: (id: number) => void;
  onRemoveSelected: () => void;
}

const LinkedTestSetsSection: React.FC<LinkedTestSetsSectionProps> = ({
  linkedTestSets,
  loadingLinked,
  selectedLinkedIds,
  extractText,
  onToggleSelect,
  onRemove,
  onRemoveSelected,
}) => {
  const { t } = useTranslation();
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">{t("testManagement.linkedTestSets")}</label>
        {selectedLinkedIds.length > 0 && (
          <Button
            type="button"
            variant="destructive"
            className=" text-white hover:bg-red-400 bg-red-400 border-2 border-red-400"
            size="sm"
            onClick={onRemoveSelected}
          >
            {t("testManagement.removeSelected")} ({selectedLinkedIds.length})
          </Button>
        )}
      </div>
      <div className="border rounded">
        {loadingLinked ? (
          <div className="p-4 text-sm text-gray-500">{t("testManagement.loading")}</div>
        ) : linkedTestSets.length === 0 ? (
          <div className="p-4 text-sm text-gray-500">{t("testManagement.noTestSets")}</div>
        ) : (
          <div className="max-h-[30vh] overflow-auto">
            {linkedTestSets.map((ts) => (
              <div
                key={ts.id}
                role="button"
                onClick={() => onToggleSelect(ts.id)}
                className="flex items-start gap-3 p-3 border-b hover:bg-gray-50"
              >
                <Checkbox
                  checked={selectedLinkedIds.includes(ts.id)}
                  onCheckedChange={() => onToggleSelect(ts.id)}
                />
                <div className="flex-1">
                  <div className="font-medium">
                    {extractText(
                      (ts as unknown as Record<string, unknown>).name,
                      "vi"
                    )}{" "}
                    - {ts.testType} - N{ts.levelN}
                  </div>
                </div>
                <button
                  type="button"
                  aria-label="Remove"
                  className="text-gray-500 hover:text-red-600 shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(ts.id);
                  }}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LinkedTestSetsSection;

