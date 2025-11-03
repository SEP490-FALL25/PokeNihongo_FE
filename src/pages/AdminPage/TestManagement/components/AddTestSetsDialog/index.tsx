import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@ui/Dialog";
import { Button } from "@ui/Button";
import { Input } from "@ui/Input";
import { Checkbox } from "@ui/Checkbox";
import PaginationControls from "@ui/PaginationControls";
import { TestSetEntity } from "@models/testSet/entity";
import { Select, SelectValue, SelectContent, SelectItem, SelectTrigger } from "@ui/Select";
import { Switch } from "@ui/Switch";
import { TestSetListRequest } from "@models/testSet/request";

interface AddTestSetsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedId: number | null;
  tsItems: TestSetEntity[];
  tsLoading: boolean;
  tsPagination: {
    current?: number;
    totalPage?: number;
    totalItem?: number;
    pageSize?: number;
  } | null;
  tsPage: number;
  tsPageSize: number;
  tsSearch: string;
  tsLevelN: number | undefined;
  tsTestType: TestSetListRequest["testType"];
  tsNoPrice: boolean | undefined;
  selectedTestSetIds: number[];
  extractText: (field: unknown, lang?: string) => string;
  onSearchChange: (search: string) => void;
  onLevelChange: (level: number | undefined) => void;
  onTestTypeChange: (testType: TestSetListRequest["testType"]) => void;
  onNoPriceChange: (noPrice: boolean | undefined) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onToggleSelect: (id: number) => void;
  onLinkSelected: () => void;
  isLinking: boolean;
}

const AddTestSetsDialog: React.FC<AddTestSetsDialogProps> = ({
  open,
  onOpenChange,
  selectedId,
  tsItems,
  tsLoading,
  tsPagination,
  tsPageSize,
  tsSearch,
  tsLevelN,
  tsTestType,
  tsNoPrice,
  selectedTestSetIds,
  extractText,
  onSearchChange,
  onLevelChange,
  onTestTypeChange,
  onNoPriceChange,
  onPageChange,
  onPageSizeChange,
  onToggleSelect,
  onLinkSelected,
  isLinking,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl bg-white">
        <DialogHeader>
          <DialogTitle>Thêm bộ đề vào Test #{selectedId}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <Input
              placeholder="Tìm kiếm bộ đề..."
              value={tsSearch}
              onChange={(e) => {
                onSearchChange(e.target.value);
                onPageChange(1);
              }}
              className="flex-1"
            />
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Cấp độ:</label>
              <Select
                value={tsLevelN === undefined ? "0" : String(tsLevelN)}
                onValueChange={(v) => {
                  const level = v === "0" ? undefined : Number(v);
                  onLevelChange(level);
                  onPageChange(1);
                }}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Chọn cấp độ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Tất cả cấp</SelectItem>
                  <SelectItem value="1">N1</SelectItem>
                  <SelectItem value="2">N2</SelectItem>
                  <SelectItem value="3">N3</SelectItem>
                  <SelectItem value="4">N4</SelectItem>
                  <SelectItem value="5">N5</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Loại đề:</label>
              <Select
                value={tsTestType || "all"}
                onValueChange={(v) => {
                  const testType = v === "all" ? undefined : (v as TestSetListRequest["testType"]);
                  onTestTypeChange(testType);
                  onPageChange(1);
                }}
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Chọn loại" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả loại</SelectItem>
                  <SelectItem value="VOCABULARY">Từ vựng</SelectItem>
                  <SelectItem value="GRAMMAR">Ngữ pháp</SelectItem>
                  <SelectItem value="KANJI">Hán tự</SelectItem>
                  <SelectItem value="LISTENING">Nghe</SelectItem>
                  <SelectItem value="READING">Đọc</SelectItem>
                  <SelectItem value="SPEAKING">Nói</SelectItem>
                  <SelectItem value="GENERAL">Tổng hợp</SelectItem>
                  <SelectItem value="PLACEMENT_TEST_DONE">Bài test xếp lớp</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Không có giá:</label>
              <Switch
                checked={tsNoPrice === true}
                onCheckedChange={(checked) => {
                  onNoPriceChange(checked ? true : undefined);
                  onPageChange(1);
                }}
              />
              <span className="text-sm text-muted-foreground">
                {tsNoPrice === true ? "Có giá" : "Tất cả"}
              </span>
            </div>
          </div>

          <div className="border rounded">
            {tsLoading ? (
              <div className="p-4 text-sm text-gray-500">Đang tải...</div>
            ) : (tsItems || []).length === 0 ? (
              <div className="p-4 text-sm text-gray-500">
                Không có bộ đề phù hợp
              </div>
            ) : (
              <div className="max-h-[50vh] overflow-auto">
                {(tsItems as unknown as TestSetEntity[]).map((ts) => (
                  <div
                    key={ts.id}
                    className="flex items-start gap-3 p-3 border-b cursor-pointer hover:bg-gray-50"
                    role="button"
                    onClick={() => onToggleSelect(ts.id)}
                  >
                    <Checkbox
                      checked={selectedTestSetIds.includes(ts.id)}
                      onCheckedChange={() => onToggleSelect(ts.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex-1">
                      <div className="font-medium">
                        {extractText(
                          (ts as unknown as Record<string, unknown>).name,
                          "vi"
                        )}
                      </div>
                      <div className="text-xs text-gray-600">
                        #{ts.id} • N{ts.levelN} • {ts.testType}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {tsPagination && (
            <div className="flex justify-end">
              <PaginationControls
                currentPage={tsPagination.current || 1}
                totalPages={tsPagination.totalPage || 0}
                totalItems={tsPagination.totalItem || 0}
                itemsPerPage={tsPagination.pageSize || tsPageSize}
                onPageChange={onPageChange}
                onItemsPerPageChange={(s: number) => {
                  onPageSizeChange(s);
                  onPageChange(1);
                }}
                isLoading={tsLoading}
              />
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Đóng
            </Button>
            <Button
              onClick={onLinkSelected}
              disabled={selectedTestSetIds.length === 0 || isLinking}
            >
              {isLinking ? "Đang thêm..." : "Thêm vào Test"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddTestSetsDialog;

