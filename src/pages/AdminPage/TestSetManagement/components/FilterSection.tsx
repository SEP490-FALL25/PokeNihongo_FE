import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@ui/Card";
import { Input } from "@ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ui/Select";
import { Search } from "lucide-react";
import { TestSetCreateRequest } from "@models/testSet/request";

interface FilterSectionProps {
  filters: {
    search?: string;
    levelN?: number;
    testType?: TestSetCreateRequest["testType"];
    status?: TestSetCreateRequest["status"];
  };
  onSearchChange: (search: string) => void;
  onLevelChange: (level: number | undefined) => void;
  onTestTypeChange: (testType: TestSetCreateRequest["testType"]) => void;
  onStatusChange: (status: TestSetCreateRequest["status"]) => void;
}

const FilterSection: React.FC<FilterSectionProps> = ({
  filters,
  onSearchChange,
  onLevelChange,
  onTestTypeChange,
  onStatusChange,
}) => {
  return (
    <Card className="bg-white border mt-4">
      <CardHeader>
        <CardTitle className="text-base">Bộ lọc</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-3 items-center">
          <div className="relative w-full md:flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Tìm kiếm test set..."
              defaultValue={filters.search || ""}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select
            value={filters.levelN ? String(filters.levelN) : "ALL"}
            onValueChange={(v) => onLevelChange(v === "ALL" ? undefined : Number(v))}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Cấp độ" />
            </SelectTrigger>
            <SelectContent>
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
                v === "ALL" ? undefined : (v as TestSetCreateRequest["testType"])
              )
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Loại đề" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả loại</SelectItem>
              <SelectItem value="VOCABULARY">VOCABULARY</SelectItem>
              <SelectItem value="GRAMMAR">GRAMMAR</SelectItem>
              <SelectItem value="KANJI">KANJI</SelectItem>
              <SelectItem value="LISTENING">LISTENING</SelectItem>
              <SelectItem value="READING">READING</SelectItem>
              <SelectItem value="SPEAKING">SPEAKING</SelectItem>
              <SelectItem value="GENERAL">GENERAL</SelectItem>
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
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả</SelectItem>
              <SelectItem value="DRAFT">DRAFT</SelectItem>
              <SelectItem value="ACTIVE">ACTIVE</SelectItem>
              <SelectItem value="INACTIVE">INACTIVE</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};

export default FilterSection;

