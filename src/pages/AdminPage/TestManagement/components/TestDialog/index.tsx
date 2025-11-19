import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@ui/Dialog";
import { Button } from "@ui/Button";
import { Input } from "@ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ui/Select";
import { Switch } from "@ui/Switch";
import { useTranslation } from "react-i18next";
import { TestCreateRequest } from "@models/test/request";
import LinkedTestSetsSection from "../LinkedTestSetsSection";
import { TestSetEntity } from "@models/testSet/entity";

interface TestForm {
  nameVi: string;
  nameEn: string;
  descriptionVi: string;
  descriptionEn: string;
  price: number;
  limit: number | undefined;
  levelN: number;
  testType: TestCreateRequest["testType"];
  status: TestCreateRequest["status"];
}

interface TestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedId: number | null;
  form: TestForm;
  onFormChange: (form: TestForm) => void;
  linkedTestSets: TestSetEntity[];
  loadingLinked: boolean;
  selectedLinkedIds: number[];
  extractText: (field: unknown, lang?: string) => string;
  onToggleSelectLinked: (id: number) => void;
  onRemoveLinked: (id: number) => void;
  onRemoveSelectedLinked: () => void;
  onCreateTestSet: () => void;
  onSave: () => void;
  onCancel: () => void;
  isSaving: boolean;
}

const TestDialog: React.FC<TestDialogProps> = ({
  open,
  onOpenChange,
  selectedId,
  form,
  onFormChange,
  linkedTestSets,
  loadingLinked,
  selectedLinkedIds,
  extractText,
  onToggleSelectLinked,
  onRemoveLinked,
  onRemoveSelectedLinked,
  onCreateTestSet,
  onSave,
  onCancel,
  isSaving,
}) => {
  const { t } = useTranslation();
  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) {
          onOpenChange(false);
        }
      }}
    >
      <DialogContent className="max-w-2xl bg-white">
        <DialogHeader>
          <DialogTitle>
            {selectedId ? t("testManagement.editTest") : t("testManagement.createTest")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">{t("testManagement.nameVi")}</label>
              <Input
                value={form.nameVi}
                onChange={(e) =>
                  onFormChange({ ...form, nameVi: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium">{t("testManagement.nameEn")}</label>
              <Input
                value={form.nameEn}
                onChange={(e) =>
                  onFormChange({ ...form, nameEn: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium">{t("testManagement.descriptionVi")}</label>
              <Input
                value={form.descriptionVi}
                onChange={(e) =>
                  onFormChange({ ...form, descriptionVi: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium">{t("testManagement.descriptionEn")}</label>
              <Input
                value={form.descriptionEn}
                onChange={(e) =>
                  onFormChange({ ...form, descriptionEn: e.target.value })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">{t("testManagement.hasPrice")}</label>
              <Switch
                checked={form.price === 1}
                onCheckedChange={(checked) =>
                  onFormChange({ ...form, price: checked ? 1 : 0 })
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium">{t("testManagement.levelN")}</label>
              <Select
                value={String(form.levelN)}
                onValueChange={(v) =>
                  onFormChange({ ...form, levelN: Number(v) })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("testManagement.selectLevel")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">{t("testManagement.levels.N0")}</SelectItem>
                  <SelectItem value="1">{t("testManagement.levels.N1")}</SelectItem>
                  <SelectItem value="2">{t("testManagement.levels.N2")}</SelectItem>
                  <SelectItem value="3">{t("testManagement.levels.N3")}</SelectItem>
                  <SelectItem value="4">{t("testManagement.levels.N4")}</SelectItem>
                  <SelectItem value="5">{t("testManagement.levels.N5")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">{t("testManagement.testType")}</label>
              <Select
                value={form.testType}
                onValueChange={(v) =>
                  onFormChange({
                    ...form,
                    testType: v as TestCreateRequest["testType"],
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("testManagement.selectTestType")} />
                </SelectTrigger>
                <SelectContent>
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
            </div>
            <div>
              <label className="text-sm font-medium">{t("testManagement.status")}</label>
              <Select
                value={form.status}
                onValueChange={(v) =>
                  onFormChange({
                    ...form,
                    status: v as TestCreateRequest["status"],
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("testManagement.selectStatus")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                  <SelectItem value="INACTIVE">INACTIVE</SelectItem>
                  <SelectItem value="DRAFT">DRAFT</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">
              {t("testManagement.limit")}
            </label>
            <Input
              type="number"
              placeholder={t("testManagement.limitPlaceholder")}
              value={form.limit ?? ""}
              onChange={(e) => {
                const value = e.target.value;
                onFormChange({
                  ...form,
                  limit: value === "" ? undefined : Number(value),
                });
              }}
              min="0"
            />
            <p className="text-xs text-gray-500 mt-1">
              {t("testManagement.limitDescription")}
            </p>
          </div>
          {selectedId && (
            <LinkedTestSetsSection
              linkedTestSets={linkedTestSets}
              loadingLinked={loadingLinked}
              selectedLinkedIds={selectedLinkedIds}
              extractText={extractText}
              onToggleSelect={onToggleSelectLinked}
              onRemove={onRemoveLinked}
              onRemoveSelected={onRemoveSelectedLinked}
            />
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={onCreateTestSet}
              disabled={!selectedId}
            >
              {t("testManagement.addTestSet")}
            </Button>
            <Button variant="ghost" onClick={onCancel}>
              {t("testManagement.close")}
            </Button>
            <Button onClick={onSave} disabled={isSaving}>
              {isSaving ? t("testManagement.saving") : t("testManagement.save")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TestDialog;
