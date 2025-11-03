import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@ui/Card";
import { Badge } from "@ui/Badge";

interface TestSetCardProps {
  testSet: {
    id: number;
    levelN: number;
    status: string;
    testType: string;
    content: string;
    name?: unknown;
    description?: unknown;
  };
  extractText: (field: unknown, lang?: string) => string;
  onClick: () => void;
}

const TestSetCard: React.FC<TestSetCardProps> = ({
  testSet,
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
                (testSet as unknown as Record<string, unknown>).name,
                "vi"
              )}
            </CardTitle>
            <p className="text-sm text-gray-600 line-clamp-2">
              {extractText(
                (testSet as unknown as Record<string, unknown>).description,
                "vi"
              )}
            </p>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline">N{testSet.levelN}</Badge>
            <Badge
              className={
                testSet.status === "ACTIVE"
                  ? "bg-green-100 text-green-800"
                  : testSet.status === "DRAFT"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-gray-100 text-gray-800"
              }
            >
              {testSet.status}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-gray-700 mb-3 line-clamp-3">
          {testSet.content}
        </div>
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div>{testSet.testType}</div>
          <div>#{testSet.id}</div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TestSetCard;

