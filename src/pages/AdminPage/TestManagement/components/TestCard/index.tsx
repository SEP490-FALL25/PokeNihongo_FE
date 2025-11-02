import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@ui/Card";
import { Badge } from "@ui/Badge";
import { DollarSign } from "lucide-react";

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
  return (
    <Card
      className="hover:border-primary/40 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">
              {extractText(
                (test as unknown as Record<string, unknown>).name,
                "vi"
              )}
            </CardTitle>
            <p className="text-sm text-gray-600 line-clamp-2">
              {extractText(
                (test as unknown as Record<string, unknown>).description,
                "vi"
              )}
            </p>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline">N{test.levelN ?? 0}</Badge>
            <Badge
              className={
                test.status === "ACTIVE"
                  ? "bg-green-100 text-green-800"
                  : test.status === "DRAFT"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-gray-100 text-gray-800"
              }
            >
              {test.status}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-gray-700 mb-3 line-clamp-3">
          {extractText(
            (test as unknown as Record<string, unknown>).description,
            "vi"
          )}
        </div>
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <DollarSign className="h-4 w-4" />
            {test.price
              ? `${test.price.toLocaleString()} ₫`
              : "Miễn phí"}
          </div>
          <div>{test.testType.toUpperCase()}</div>
          <div>#{test.id}</div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TestCard;

