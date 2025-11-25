import React from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow, TableHead } from "@ui/Table";
import SortableTableHeader from "@ui/SortableTableHeader";
import { Button } from "@ui/Button";
import { Badge } from "@ui/Badge";
import { Edit, Trash2, Loader2, FileQuestion } from "lucide-react";
import { QuestionEntityType } from "@models/questionBank/entity";

const QuestionsTable: React.FC<COMPONENTS.IQuestionsTableProps> = ({
  isLoading,
  questions,
  filters,
  handleSort,
  getQuestionTypeLabel,
  openEditDialog,
  setDeleteQuestionId,
  t,
}) => {
  return (
    <div className="overflow-x-auto">
      <Table className="min-w-full">
        <TableHeader>
          <TableRow className="border-border hover:bg-muted/30">
            <SortableTableHeader
              title={t("questionBank.questionId")}
              sortKey="id"
              currentSortBy={filters.sortBy}
              currentSort={filters.sortOrder as "asc" | "desc"}
              onSort={handleSort}
              className="text-muted-foreground font-semibold w-12"
            />
            <SortableTableHeader
              title={t("questionBank.question")}
              sortKey="questionJp"
              currentSortBy={filters.sortBy}
              currentSort={filters.sortOrder as "asc" | "desc"}
              onSort={handleSort}
              className="text-muted-foreground font-semibold w-64"
            />
            <SortableTableHeader
              title={t("questionBank.questionType")}
              sortKey="questionType"
              currentSortBy={filters.sortBy}
              currentSort={filters.sortOrder as "asc" | "desc"}
              onSort={handleSort}
              className="text-muted-foreground font-semibold w-20"
            />
            <SortableTableHeader
              title={t("questionBank.level")}
              sortKey="levelN"
              currentSortBy={filters.sortBy}
              currentSort={filters.sortOrder as "asc" | "desc"}
              onSort={handleSort}
              className="text-muted-foreground font-semibold w-16"
            />
            <SortableTableHeader
              title={t("questionBank.meaning")}
              sortKey="meaning"
              currentSortBy={filters.sortBy}
              currentSort={filters.sortOrder as "asc" | "desc"}
              onSort={handleSort}
              className="text-muted-foreground font-semibold w-32"
            />
            <TableHead className="text-muted-foreground text-right w-20">{t("questionBank.actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-12">
                <div className="flex flex-col items-center justify-center gap-4">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <p className="text-muted-foreground">{t("common.loading")}</p>
                </div>
              </TableCell>
            </TableRow>
          ) : questions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-12">
                <div className="flex flex-col items-center justify-center gap-4">
                  <div className="p-3 bg-muted rounded-full">
                    <FileQuestion className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground font-medium">{t("questionBank.noQuestions")}</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            questions.map((question: QuestionEntityType) => (
              <TableRow key={question.id} className="border-border hover:bg-muted/30 transition-colors group">
                <TableCell className="font-medium w-12 whitespace-nowrap text-sm py-3 text-muted-foreground">
                  {question.id}
                </TableCell>
                <TableCell className="truncate py-3 w-64">
                  <div className="max-w-60">
                    <div className="font-semibold text-sm truncate leading-tight text-foreground">
                      {question.questionJp}
                    </div>
                    <div className="text-xs text-muted-foreground truncate leading-tight mt-1">
                      {question.pronunciation || "No pronunciation"}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="w-20 whitespace-nowrap py-3">
                  <Badge variant="secondary" className="text-xs shadow-sm font-medium">
                    {getQuestionTypeLabel(question.questionType)}
                  </Badge>
                </TableCell>
                <TableCell className="w-16 whitespace-nowrap py-3">
                  <Badge variant="default" className="text-xs shadow-sm font-medium">N{question.levelN}</Badge>
                </TableCell>
                <TableCell className="w-32 py-3">
                  {question.meanings && question.meanings.length > 0 ? (
                    <div className="text-muted-foreground text-xs space-y-1">
                      {question.meanings.map((meaning: COMPONENTS.IQuestionMeaningLike, index: number) => (
                        <div key={index} className="truncate bg-muted/30 px-2 py-1 rounded-md">
                          {"language" in meaning && "value" in meaning ? (
                            <>
                              <span className="font-medium">{meaning.language}:</span> {meaning.value}
                            </>
                          ) : (
                            <>
                              {"translations" in meaning && meaning.translations?.vi && (
                                <div>vi: {meaning.translations.vi}</div>
                              )}
                              {"translations" in meaning && meaning.translations?.en && (
                                <div>en: {meaning.translations.en}</div>
                              )}
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : question.meaning ? (
                    <div className="text-muted-foreground text-xs bg-muted/30 px-2 py-1 rounded-md">{question.meaning}</div>
                  ) : (
                    <span className="text-muted-foreground text-xs">No translation</span>
                  )}
                </TableCell>
                <TableCell className="text-right w-20 py-3">
                  <div className="flex gap-1 justify-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-all"
                      onClick={() => openEditDialog(question)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive transition-all"
                      onClick={() => setDeleteQuestionId(question.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default QuestionsTable;


