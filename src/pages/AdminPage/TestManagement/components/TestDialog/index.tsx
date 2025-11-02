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
            {selectedId ? "Chỉnh sửa Test" : "Tạo Test"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Name (vi)</label>
              <Input
                value={form.nameVi}
                onChange={(e) =>
                  onFormChange({ ...form, nameVi: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium">Name (en)</label>
              <Input
                value={form.nameEn}
                onChange={(e) =>
                  onFormChange({ ...form, nameEn: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description (vi)</label>
              <Input
                value={form.descriptionVi}
                onChange={(e) =>
                  onFormChange({ ...form, descriptionVi: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description (en)</label>
              <Input
                value={form.descriptionEn}
                onChange={(e) =>
                  onFormChange({ ...form, descriptionEn: e.target.value })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="flex items-end gap-2">
              <label className="text-sm font-medium">Có phí</label>
              <Switch
                checked={form.price === 1}
                onCheckedChange={(checked) =>
                  onFormChange({ ...form, price: checked ? 1 : 0 })
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium">LevelN</label>
              <Select
                value={String(form.levelN)}
                onValueChange={(v) =>
                  onFormChange({ ...form, levelN: Number(v) })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn cấp độ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">N0 (Tất cả cấp)</SelectItem>
                  <SelectItem value="1">N1</SelectItem>
                  <SelectItem value="2">N2</SelectItem>
                  <SelectItem value="3">N3</SelectItem>
                  <SelectItem value="4">N4</SelectItem>
                  <SelectItem value="5">N5</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Test Type</label>
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
                  <SelectValue placeholder="Chọn loại" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="READING_TEST">Reading test</SelectItem>
                  <SelectItem value="LISTENING_TEST">Listening test</SelectItem>
                  <SelectItem value="SPEAKING_TEST">Speaking test</SelectItem>
                  <SelectItem value="MATCH_TEST">Match test</SelectItem>
                  <SelectItem value="QUIZ_TEST">Quiz test</SelectItem>
                  <SelectItem value="REVIEW_TEST">Review test</SelectItem>
                  <SelectItem value="PRACTICE_TEST">Practice test</SelectItem>
                  <SelectItem value="PLACEMENT_TEST_DONE">
                    Placement test
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Status</label>
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
                  <SelectValue placeholder="Chọn trạng thái" />
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
              Giới hạn số lần làm (Limit)
            </label>
            <Input
              type="number"
              placeholder="Để trống nếu không giới hạn"
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
              Số lần tối đa người dùng có thể làm test này. Để trống nếu không
              giới hạn.
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
              Thêm bộ đề
            </Button>
            <Button variant="ghost" onClick={onCancel}>
              Hủy
            </Button>
            <Button onClick={onSave} disabled={isSaving}>
              {isSaving ? "Đang lưu..." : "Lưu"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TestDialog;
