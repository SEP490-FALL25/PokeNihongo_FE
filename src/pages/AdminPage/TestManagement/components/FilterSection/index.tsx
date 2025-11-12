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
  return (
    <div className="border-t border-border pt-4 mt-4">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-semibold text-foreground">Bộ lọc</span>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
          <Input
            placeholder="Tìm kiếm test ..."
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
            <SelectValue placeholder="Cấp độ" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="ALL">Tất cả cấp</SelectItem>
            <SelectItem value="0">Tất cả cấp</SelectItem>
            <SelectItem value="1">N1</SelectItem>
            <SelectItem value="2">N2</SelectItem>
            <SelectItem value="3">N3</SelectItem>
            <SelectItem value="4">N4</SelectItem>
            <SelectItem value="5">N5</SelectItem>
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
            <SelectValue placeholder="Loại đề" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="ALL">Tất cả loại</SelectItem>
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
        <Select
          value={filters.status || "ALL"}
          onValueChange={(v) =>
            onStatusChange(
              v === "ALL" ? undefined : (v as TestCreateRequest["status"])
            )
          }
        >
          <SelectTrigger className="w-[160px] bg-background border-border text-foreground h-11 shadow-sm">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="ALL">Tất cả</SelectItem>
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
