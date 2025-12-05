import { useMemo, useState } from "react";
import { Card, CardContent } from "@ui/Card";
import { Button } from "@ui/Button";
import { Badge } from "@ui/Badge";
import {
  Plus,
  ArrowRight,
  Loader2,
  BookOpen,
  FileText,
  BookMarked,
  CheckCircle2,
} from "lucide-react";
import SelectTestSetDialog from "../../Dialogs/SelectTestSetDialog";
import { useLessonExercises } from "@hooks/useLessonExercises";
import { useCreateExercise, useUpdateExercise } from "@hooks/useExercise";
import { useTranslation } from "react-i18next";
import { ExerciseResponseType } from "@models/exercise/response";
import { TestSetEntity } from "@models/testSet/entity";
import { QUESTION_TYPE } from "@constants/questionBank";
import { useLinkFinalTestSets } from "@hooks/useTest";
import { toast } from "react-toastify";

interface LessonItem {
  id: number;
  titleKey: string;
  levelJlpt: number;
  isPublished: boolean;
}

interface LessonExercisesStepProps {
  lesson: LessonItem;
  onNext: () => void;
  onBack: () => void;
}

const LessonExercisesStep = ({
  lesson,
  onNext,
  onBack,
}: LessonExercisesStepProps) => {
  const { t } = useTranslation();
  const [isSelectTestSetOpen, setIsSelectTestSetOpen] =
    useState<boolean>(false);
  const [pendingSectionType, setPendingSectionType] = useState<
    (typeof QUESTION_TYPE)[keyof typeof QUESTION_TYPE]
  >(QUESTION_TYPE.VOCABULARY);

  const { exercises, isLoading, error } = useLessonExercises(lesson.id);

  const { createExercise, isLoading: isCreatingExercise } = useCreateExercise();
  const { updateExercise, isUpdating } = useUpdateExercise(lesson.id);
  const [updateTarget, setUpdateTarget] = useState<ExerciseResponseType | null>(
    null
  );

  // Hook for linking testSets to test
  const linkFinalTestSetsMutation = useLinkFinalTestSets();

  const handleSelectTestSet = (testSet: TestSetEntity) => {
    if (updateTarget) {
      // Update existing exercise
      updateExercise({
        id: updateTarget.id,
        data: {
          testSetId: testSet.id,
        },
      });
      setUpdateTarget(null);
    } else {
      // Create new exercise
      createExercise({
        exerciseType: pendingSectionType as unknown as
          | "VOCABULARY"
          | "GRAMMAR"
          | "KANJI",
        isBlocked: false,
        lessonId: lesson.id,
        testSetId: testSet.id,
      });
    }
    setIsSelectTestSetOpen(false);
  };

  const handleAddExercise = (
    sectionType: (typeof QUESTION_TYPE)[keyof typeof QUESTION_TYPE]
  ) => {
    setPendingSectionType(sectionType);
    setUpdateTarget(null);
    setIsSelectTestSetOpen(true);
  };

  const handleUpdateExercise = (exercise: ExerciseResponseType) => {
    setUpdateTarget(exercise);
    setPendingSectionType(exercise.exerciseType as unknown as (typeof QUESTION_TYPE)[keyof typeof QUESTION_TYPE]);
    setIsSelectTestSetOpen(true);
  };

  const exerciseByType = useMemo(() => {
    const map: Record<string, ExerciseResponseType | null> = {
      [QUESTION_TYPE.VOCABULARY]: null,
      [QUESTION_TYPE.GRAMMAR]: null,
      [QUESTION_TYPE.KANJI]: null,
    };
    (exercises as ExerciseResponseType[]).forEach((ex) => {
      if (
        Object.prototype.hasOwnProperty.call(map, ex.exerciseType) &&
        !map[ex.exerciseType]
      ) {
        map[ex.exerciseType] = ex;
      }
    });
    return map;
  }, [exercises]);

  // Check if all 3 exercise types exist
  const hasAllExercises = useMemo(() => {
    return (
      exerciseByType[QUESTION_TYPE.VOCABULARY] !== null &&
      exerciseByType[QUESTION_TYPE.GRAMMAR] !== null &&
      exerciseByType[QUESTION_TYPE.KANJI] !== null
    );
  }, [exerciseByType]);

  // Handle creating final test by linking all testSets
  const handleCreateFinalTest = () => {
    if (!lesson.id) {
      toast.error(t("workflow.exercises.missingLessonId"));
      return;
    }

    const testSetIds = [
      exerciseByType[QUESTION_TYPE.VOCABULARY]?.testSetId,
      exerciseByType[QUESTION_TYPE.GRAMMAR]?.testSetId,
      exerciseByType[QUESTION_TYPE.KANJI]?.testSetId,
    ].filter((id): id is number => id !== undefined && id !== null);

    if (testSetIds.length !== 3) {
      toast.error(t("workflow.exercises.missingTestSetIds"));
      return;
    }

    linkFinalTestSetsMutation.mutate({
      lessonId: lesson.id,
      data: { testSetIds },
    });
  };

  return (
    <div className="space-y-6 min-h-screen p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-foreground">
            {t("workflow.exercises.title")}
          </h3>
          <p className="text-muted-foreground">
            {t("workflow.exercises.manageForLesson")} {lesson.titleKey}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={onBack}
            className="border-border text-foreground hover:bg-muted"
          >
            {t("workflow.exercises.backContent")}
          </Button>
          <Button onClick={onNext} className="bg-primary text-white">
            {t("workflow.exercises.completeSetup")} {" "}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>

      {/* Button to create final test when all 3 exercises exist - Prominent position */}
      {hasAllExercises && (
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-400 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-600 rounded-full shadow-md">
                  <CheckCircle2 className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-foreground">
                    {t("workflow.exercises.finalTestReadyTitle")}
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t("workflow.exercises.finalTestReadyDesc")}
                  </p>
                </div>
              </div>
              <Button
                onClick={handleCreateFinalTest}
                disabled={linkFinalTestSetsMutation.isPending || !lesson.id}
                size="lg"
                className="bg-green-600 text-white hover:bg-green-700 shadow-lg px-6 py-3 text-base font-semibold"
              >
                {linkFinalTestSetsMutation.isPending ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    {t("workflow.exercises.creatingFinalTest")}
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-5 w-5 mr-2" />
                    {t("workflow.exercises.createFinalTest")}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="space-y-6">
            {[
              {
                type: QUESTION_TYPE.VOCABULARY,
                title: t("workflow.exercises.partVocabulary"),
                Icon: BookOpen,
                color: "bg-blue-600",
              },
              {
                type: QUESTION_TYPE.GRAMMAR,
                title: t("workflow.exercises.partGrammar"),
                Icon: FileText,
                color: "bg-green-600",
              },
              {
                type: QUESTION_TYPE.KANJI,
                title: t("workflow.exercises.partKanji"),
                Icon: BookMarked,
                color: "bg-purple-600",
              },
            ].map((section) => {
              const existing = (
                exerciseByType as Record<string, ExerciseResponseType | null>
              )[section.type];
              const SectionIcon = section.Icon as React.ComponentType<{
                className?: string;
              }>;
              return (
                <div
                  key={section.type}
                  className="bg-white border border-primary/30 rounded-md p-5 shadow-md hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-xl ${section.color} shadow`}>
                        <SectionIcon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-foreground">
                          {section.title}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {t("workflow.exercises.exerciseCount", {
                            count: existing ? 1 : 0,
                          })}
                        </p>
                      </div>
                    </div>
                    {existing ? (
                      <Button
                        size="sm"
                        className="bg-blue-600 text-white hover:bg-blue-700 shadow"
                        onClick={() => handleUpdateExercise(existing)}
                        disabled={isUpdating || isCreatingExercise}
                      >
                        {isUpdating
                          ? t("workflow.exercises.updatingExercise")
                          : t("workflow.exercises.updateTestSet")}
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        className="bg-primary text-white hover:bg-primary/90 shadow"
                        onClick={() => handleAddExercise(section.type)}
                        disabled={isCreatingExercise}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        {isCreatingExercise
                          ? t("workflow.exercises.creatingExercise")
                          : t("workflow.exercises.addExercise")}
                      </Button>
                    )}
                  </div>

                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : existing ? (
                    <div className="flex items-center justify-between bg-gradient-to-br from-blue-100 via-white to-indigo-200 border border-primary/30 rounded-lg p-4 shadow-sm">
                      <div className="flex items-center gap-3">
                        <Badge className="bg-primary text-white shadow-sm">
                          {existing.exerciseType}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          ID: {existing.id}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          TestSet: {existing.testSetId}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(existing.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <div className="text-muted-foreground mb-2">
                        {t("workflow.exercises.noExercise")}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAddExercise(section.type)}
                        disabled={isCreatingExercise}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        {t("workflow.exercises.addFirstExercise")}
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {error && (
            <div className="text-center py-8">
              <div className="text-red-500 mb-4">{error}</div>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
              >
                {t("common.retry")}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <SelectTestSetDialog
        isOpen={isSelectTestSetOpen}
        onClose={() => {
          setIsSelectTestSetOpen(false);
          setUpdateTarget(null);
        }}
        onSelectTestSet={handleSelectTestSet}
        lessonId={lesson.id}
        lessonLevel={lesson.levelJlpt}
        testType={
          pendingSectionType as unknown as "VOCABULARY" | "GRAMMAR" | "KANJI"
        }
      />
    </div>
  );
};

export default LessonExercisesStep;
