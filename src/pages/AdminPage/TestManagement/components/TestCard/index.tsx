import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@ui/Card";
import { Badge } from "@ui/Badge";
import { DollarSign, FileText, Tag } from "lucide-react";
import { useTranslation } from "react-i18next";

interface TestCardProps {
  test: {
    id: number;
    levelN: number | null;
    status: string;
    testType: string;
    price: number | null;
    name?: unknown;
    description?: unknown;
  };
  extractText: (field: unknown, lang?: string) => string;
  onClick: () => void;
}

const TestCard: React.FC<TestCardProps> = ({
  test,
  extractText,
  onClick,
}) => {
  const { t } = useTranslation();
  return (
    <Card
      className="group relative overflow-hidden bg-gradient-to-br from-card via-card to-card/95 border-border hover:border-primary/50 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer"
      onClick={onClick}
    >
      {/* Decorative gradient overlay */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/5 via-transparent to-transparent rounded-full -mr-32 -mt-32 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <CardHeader className="relative">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileText className="w-4 h-4 text-primary" />
              </div>
              <CardTitle className="text-lg font-bold text-foreground line-clamp-2">
                {extractText(
                  (test as unknown as Record<string, unknown>).name,
                  "vi"
                )}
              </CardTitle>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {extractText(
                (test as unknown as Record<string, unknown>).description,
                "vi"
              )}
            </p>
            <div className="flex gap-2 flex-wrap">
              <Badge className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-600 border-blue-500/30 shadow-sm font-medium">
                N{test.levelN ?? 0}
              </Badge>
              <Badge
                className={`shadow-sm font-medium ${test.status === "ACTIVE"
                  ? "bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-600 border-green-500/30"
                  : test.status === "DRAFT"
                    ? "bg-gradient-to-r from-yellow-500/20 to-amber-500/20 text-yellow-600 border-yellow-500/30"
                    : "bg-gradient-to-r from-gray-500/20 to-gray-600/20 text-gray-600 border-gray-500/30"
                  }`}
              >
                {test.status}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative">
        <div className="space-y-3 text-sm mb-4 p-4 bg-muted/20 rounded-lg border border-border/50">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              {t("testManagement.price")}:
            </span>
            <span className="text-foreground font-bold">
              {test.price
                ? t("testManagement.hasPriceLabel")
                : t("testManagement.free")}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground font-medium flex items-center gap-2">
              <Tag className="h-4 w-4" />
              {t("testManagement.type")}:
            </span>
            <span className="text-foreground font-bold">
              {test.testType.toUpperCase()}
            </span>
          </div>
          <div className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border/50">
            ID: {test.id}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TestCard;

