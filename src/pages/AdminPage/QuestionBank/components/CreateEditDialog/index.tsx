import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@ui/Dialog";
import { Button } from "@ui/Button";
import { Input } from "@ui/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@ui/Select";
import AudioDropzone from "@ui/AudioDropzone";
import mediaService from "@services/media";
import { toast } from "react-toastify";
import { QuestionType } from "@constants/questionBank";
import { X } from "lucide-react";
/* eslint-disable @typescript-eslint/no-explicit-any */

const CreateEditDialog: React.FC<COMPONENTS.ICreateEditDialogProps> = ({
  isCreateDialogOpen,
  isEditDialogOpen,
  closeDialogs,
  t,
  formData,
  setFormData,
  fieldErrors,
  setFieldErrors,
  isCreating,
  isUpdating,
  isUpdatingAnswer,
  isLoadingAnswers,
  handleCreateQuestion,
  handleUpdateQuestion,
  handleUpdateAnswer,
  QUESTION_TYPE_LABELS,
  JLPT_LEVEL_LABELS,
  language,
}) => {
  const [answerExtras, setAnswerExtras] = useState<Record<number, { vi: string; en: string }>>({});
  const [audioInputMode, setAudioInputMode] = useState<"url" | "file">("url");
  const [selectedAudioFile, setSelectedAudioFile] = useState<File | null>(null);

  return (
    <Dialog open={isCreateDialogOpen || isEditDialogOpen} onOpenChange={closeDialogs}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle>
            {isCreateDialogOpen ? t("questionBank.createDialog.title") : t("questionBank.createDialog.editTitle")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Input
              label={t("questionBank.createDialog.questionJpLabel")}
              value={formData.questionJp}
              onChange={(e) => {
                setFormData((prev: any) => ({
                  ...prev,
                  questionJp: e.target.value,
                }));
                if (fieldErrors.questionJp) {
                  setFieldErrors((prev) => {
                    const newErrors = { ...prev } as Record<string, string[]>;
                    delete newErrors.questionJp;
                    return newErrors;
                  });
                }
              }}
              placeholder={t("questionBank.createDialog.questionJpPlaceholder")}
            />
            {fieldErrors.questionJp && (
              <div className="mt-1 text-sm text-red-600">
                {fieldErrors.questionJp.map((error: string, index: number) => (
                  <div key={index}>{error}</div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("questionBank.createDialog.questionTypeLabel")}
              </label>
              <Select
                value={formData.questionType}
                onValueChange={(value) => {
                  const newQuestionType = value as QuestionType;
                  const isEditMode = isEditDialogOpen;
                  
                  setFormData((prev: any) => {
                    const newFormData: any = { ...prev, questionType: newQuestionType };
                    // Only reset pronunciation and audioUrl if not applicable to new type
                    if (newQuestionType !== "SPEAKING" && newQuestionType !== "VOCABULARY") {
                      newFormData.pronunciation = "";
                    }
                    if (newQuestionType !== "LISTENING" && newQuestionType !== "VOCABULARY") {
                      newFormData.audioUrl = "";
                    }
                    
                    // Only reset answers structure when creating new question, keep answers when editing
                    if (!isEditMode) {
                      if (newQuestionType === "MATCHING") {
                        newFormData.answers = [
                          {
                            answerJp: "",
                            isCorrect: true,
                            translations: {
                              meaning: [
                                { language_code: "vi", value: "" },
                                { language_code: "en", value: "" },
                              ],
                            },
                          },
                        ];
                      } else {
                        const blankAnswer = () => ({
                          answerJp: "",
                          isCorrect: false,
                          translations: {
                            meaning: [
                              { language_code: "vi", value: "" },
                              { language_code: "en", value: "" },
                            ],
                          },
                        });
                        newFormData.answers = [
                          { ...blankAnswer(), isCorrect: true },
                          blankAnswer(),
                          blankAnswer(),
                          blankAnswer(),
                        ];
                      }
                    }
                    // When editing, keep existing answers as is (don't reset)
                    return newFormData;
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("questionBank.createDialog.questionTypePlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(QUESTION_TYPE_LABELS[language as keyof typeof QUESTION_TYPE_LABELS] || {}).map(
                    ([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("questionBank.createDialog.levelLabel")}
              </label>
              <Select
                value={formData.levelN.toString()}
                onValueChange={(value) =>
                  setFormData((prev: any) => ({ ...prev, levelN: parseInt(value) }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("questionBank.createDialog.levelPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(JLPT_LEVEL_LABELS[language as keyof typeof JLPT_LEVEL_LABELS] || {}).map(
                    ([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {(formData.questionType === "VOCABULARY" || formData.questionType === "SPEAKING") && (
            <div>
              <Input
                label={`${t("questionBank.createDialog.pronunciationLabel")}${
                  formData.questionType === "SPEAKING" ? " *" : ""
                }`}
                value={formData.pronunciation || ""}
                onChange={(e) => {
                  setFormData((prev: any) => ({ ...prev, pronunciation: e.target.value }));
                  if (fieldErrors.pronunciation) {
                    setFieldErrors((prev) => {
                      const newErrors = { ...prev } as Record<string, string[]>;
                      delete newErrors.pronunciation;
                      return newErrors;
                    });
                  }
                }}
                placeholder={t("questionBank.createDialog.pronunciationPlaceholder")}
                required={formData.questionType === "SPEAKING"}
              />
              {fieldErrors.pronunciation && (
                <div className="mt-1 text-sm text-red-600">
                  {fieldErrors.pronunciation.map((error: string, index: number) => (
                    <div key={index}>{error}</div>
                  ))}
                </div>
              )}
            </div>
          )}

          {(formData.questionType === "VOCABULARY" || formData.questionType === "LISTENING") && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant={audioInputMode === "url" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAudioInputMode("url")}
                >
                  URL
                </Button>
                <Button
                  type="button"
                  variant={audioInputMode === "file" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAudioInputMode("file")}
                >
                  File
                </Button>
              </div>

              {audioInputMode === "url" ? (
                <>
                  <Input
                    label={t("questionBank.createDialog.audioUrlLabel")}
                    value={formData.audioUrl || ""}
                    onChange={(e) => setFormData((prev: any) => ({ ...prev, audioUrl: e.target.value }))}
                    placeholder={
                      formData.questionType === "LISTENING"
                        ? "Optional - will auto-generate TTS if not provided"
                        : "Optional"
                    }
                  />
                  {formData.audioUrl && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                    onClick={() => setFormData((prev: any) => ({ ...prev, audioUrl: "" }))}
                      className="w-full"
                    >
                      Remove Audio URL
                    </Button>
                  )}
                </>
              ) : (
                <AudioDropzone label="Audio" value={selectedAudioFile || undefined} onChange={(file) => setSelectedAudioFile(file || null)} />
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("questionBank.createDialog.meaningsLabel")}
            </label>
            {fieldErrors.meanings && (
              <div className="mt-1 text-sm text-red-600">
                {fieldErrors.meanings.map((error, index) => (
                  <div key={index}>{error}</div>
                ))}
              </div>
            )}
            <div className="border rounded-lg p-4 mb-4 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Vietnamese Translation</label>
                  <Input
                    value={formData.meanings?.[0]?.translations?.vi || ""}
                    onChange={(e) => {
                      setFormData((prev: any) => ({
                        ...prev,
                        meanings: [
                          {
                            ...prev.meanings?.[0],
                            translations: { ...prev.meanings?.[0]?.translations, vi: e.target.value },
                          },
                        ],
                      }));
                      if (fieldErrors.meanings) {
                        setFieldErrors((prev: Record<string, string[]>) => {
                          const newErrors = { ...prev } as Record<string, string[]>;
                          delete newErrors.meanings;
                          return newErrors;
                        });
                      }
                    }}
                    placeholder="Vietnamese translation"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">English Translation</label>
                  <Input
                    value={formData.meanings?.[0]?.translations?.en || ""}
                    onChange={(e) => {
                      setFormData((prev: any) => ({
                        ...prev,
                        meanings: [
                          {
                            ...prev.meanings?.[0],
                            translations: { ...prev.meanings?.[0]?.translations, en: e.target.value },
                          },
                        ],
                      }));
                      if (fieldErrors.meanings) {
                        setFieldErrors((prev: Record<string, string[]>) => {
                          const newErrors = { ...prev } as Record<string, string[]>;
                          delete newErrors.meanings;
                          return newErrors;
                        });
                      }
                    }}
                    placeholder="English translation"
                  />
                </div>
              </div>
            </div>
          </div>

          {formData.questionType !== "MATCHING" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("questionBank.createDialog.answersLabel")}
              </label>
              {fieldErrors.answers && (
                <div className="mt-1 text-sm text-red-600">
                  {fieldErrors.answers.map((error, index) => (
                    <div key={index}>{error}</div>
                  ))}
                </div>
              )}
              {isLoadingAnswers ? (
                <div className="text-center py-4 text-gray-500">{t("common.loading")}...</div>
              ) : (
                formData.answers?.map((answer: any, index: number) => (
                  <div
                    key={index}
                    className={`border rounded-lg p-4 mb-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                      answer.isCorrect ? "border-green-500 bg-green-50" : "border-red-300 bg-red-50 hover:border-red-400"
                    }`}
                    onClick={() =>
                      setFormData((prev: any) => ({
                        ...prev,
                        answers: prev.answers?.map((a: any, i: number) => ({ ...a, isCorrect: i === index })),
                      }))
                    }
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-700">
                            {answer.isCorrect ? "Correct Answer" : "Incorrect Answer"}
                          </span>
                          {answer.isCorrect ? (
                            <div className="flex items-center justify-center w-5 h-5 bg-green-500 text-white rounded-full">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center w-5 h-5 bg-red-500 text-white rounded-full">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Clear answerExtras for this index
                            setAnswerExtras((prev) => {
                              const newExtras = { ...prev };
                              delete newExtras[index];
                              return newExtras;
                            });
                            // Clear all answer fields
                            setFormData((prev: any) => ({
                              ...prev,
                              answers: prev.answers?.map((a: any, i: number) =>
                                i === index
                                  ? {
                                      ...a,
                                      answerJp: "",
                                      translations: {
                                        meaning: [
                                          { language_code: "vi", value: "" },
                                          { language_code: "en", value: "" },
                                        ],
                                      },
                                    }
                                  : a
                              ),
                            }));
                          }}
                          className="text-gray-600 hover:text-red-600"
                          title="Clear all fields for this option"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Clear
                        </Button>
                        {formData.answers && formData.answers.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setFormData((prev: any) => ({
                                ...prev,
                                answers: prev.answers?.filter((_: any, i: number) => i !== index),
                              }));
                            }}
                          >
                            Remove Answer
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
                      {(() => {
                        const parseCombined = (s: string) => {
                          const m = /^jp:(.*?)(?:\+vi:(.*?))?(?:\+en:(.*?))?$/.exec(s || "");
                          if (!m) return { jp: s || "", vi: "", en: "", isCombined: false } as const;
                          return { jp: m[1] ?? "", vi: m[2] ?? "", en: m[3] ?? "", isCombined: true } as const;
                        };
                        const ensureCompose = (jp: string, vi: string, en: string) => {
                          const hasJp = (jp ?? "") !== "";
                          const hasVi = (vi ?? "") !== "";
                          const hasEn = (en ?? "") !== "";
                          if (!hasJp && !hasVi && !hasEn) return "";
                          if (!hasVi && !hasEn) return `jp:${jp || ""}`;
                          return `jp:${jp || ""}+vi:${vi || ""}+en:${en || ""}`;
                        };

                        const parsed = parseCombined(answer.answerJp || "");
                        const jpValue = parsed.isCombined ? parsed.jp : answer.answerJp || "";
                        const viValue = answerExtras[index]?.vi ?? (parsed.isCombined ? parsed.vi : "");
                        const enValue = answerExtras[index]?.en ?? (parsed.isCombined ? parsed.en : "");
                        const compose = ensureCompose;

                        return (
                          <>
                            <Input
                              label="Japanese Answer"
                              value={jpValue}
                              onChange={(e) => {
                                const newJp = e.target.value;
                                setFormData((prev: any) => ({
                                  ...prev,
                                  answers: prev.answers?.map((a: any, i: number) =>
                                    i === index ? { ...a, answerJp: compose(newJp, viValue, enValue) } : a
                                  ),
                                }));
                                if (fieldErrors.answers) {
                                  setFieldErrors((prev: Record<string, string[]>) => {
                                    const newErrors = { ...prev } as Record<string, string[]>;
                                    delete (newErrors as Record<string, string[]>).answers;
                                    return newErrors;
                                  });
                                }
                              }}
                              placeholder="Enter Japanese answer"
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                              <Input
                                label="Vietnamese Answer"
                                value={viValue}
                                onChange={(e) => {
                                  const newVi = e.target.value;
                                  setAnswerExtras((prev: Record<number, { vi: string; en: string }>) => ({ ...prev, [index]: { vi: newVi, en: enValue } }));
                                  setFormData((prev: any) => ({
                                    ...prev,
                                    answers: prev.answers?.map((a: any, i: number) =>
                                      i === index ? { ...a, answerJp: compose(jpValue, newVi, enValue) } : a
                                    ),
                                  }));
                                }}
                                placeholder="Enter Vietnamese answer"
                              />
                              <Input
                                label="English Answer"
                                value={enValue}
                                onChange={(e) => {
                                  const newEn = e.target.value;
                                  setAnswerExtras((prev: Record<number, { vi: string; en: string }>) => ({ ...prev, [index]: { vi: viValue, en: newEn } }));
                                  setFormData((prev: any) => ({
                                    ...prev,
                                    answers: prev.answers?.map((a: any, i: number) =>
                                      i === index ? { ...a, answerJp: compose(jpValue, viValue, newEn) } : a
                                    ),
                                  }));
                                }}
                                placeholder="Enter English answer"
                              />
                            </div>
                            <div className="mt-2 text-xs text-gray-500 flex items-center gap-2 flex-wrap">
                              <span>
                                Tự động ghép: <code className="px-1 py-0.5 bg-gray-100 rounded">{compose(jpValue, viValue, enValue) || "(trống)"}</code>
                              </span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2"
                                onClick={() => {
                                  const filledVi = viValue || jpValue;
                                  const filledEn = enValue || jpValue;
                                  setAnswerExtras((prev: Record<number, { vi: string; en: string }>) => ({ ...prev, [index]: { vi: filledVi, en: filledEn } }));
                                  setFormData((prev: any) => ({
                                    ...prev,
                                    answers: prev.answers?.map((a: any, i: number) =>
                                      i === index ? { ...a, answerJp: compose(jpValue, filledVi, filledEn) } : a
                                    ),
                                  }));
                                  const toCopy = compose(jpValue, filledVi, filledEn);
                                  if (toCopy && typeof navigator !== "undefined" && navigator.clipboard) {
                                    navigator.clipboard.writeText(toCopy);
                                  }
                                }}
                              >
                                Copy
                              </Button>
                            </div>
                          </>
                        );
                      })()}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">Vietnamese Translation</label>
                          <Input
                            value={answer.translations?.meaning?.find((m: any) => m && m.language_code === "vi")?.value || ""}
                            onChange={(e) =>
                              setFormData((prev: any) => ({
                                ...prev,
                                answers: prev.answers?.map((a: any, i: number) =>
                                  i === index
                                    ? {
                                        ...a,
                                        translations: {
                                          meaning: (() => {
                                            const existingMeanings = a.translations?.meaning || [];
                                            const enMeaning = existingMeanings.find((m: any) => m && m.language_code === "en");
                                            return [
                                              { language_code: "vi", value: e.target.value },
                                              { language_code: "en", value: enMeaning?.value || "" },
                                            ];
                                          })(),
                                        },
                                      }
                                    : a
                                ),
                              }))
                            }
                            placeholder="Vietnamese translation"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">English Translation</label>
                          <Input
                            value={answer.translations?.meaning?.find((m: any) => m && m.language_code === "en")?.value || ""}
                            onChange={(e) =>
                              setFormData((prev: any) => ({
                                ...prev,
                                answers: prev.answers?.map((a: any, i: number) =>
                                  i === index
                                    ? {
                                        ...a,
                                        translations: {
                                          meaning: (() => {
                                            const existingMeanings = a.translations?.meaning || [];
                                            const viMeaning = existingMeanings.find((m: any) => m && m.language_code === "vi");
                                            return [
                                              { language_code: "vi", value: viMeaning?.value || "" },
                                              { language_code: "en", value: e.target.value },
                                            ];
                                          })(),
                                        },
                                      }
                                    : a
                                ),
                              }))
                            }
                            placeholder="English translation"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
              {formData.answers && formData.answers.length < 4 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setFormData((prev: any) => ({
                      ...prev,
                      answers: [
                        ...(prev.answers || []),
                        {
                          answerJp: "",
                          isCorrect: false,
                          translations: { meaning: [ { language_code: "vi", value: "" }, { language_code: "en", value: "" } ] },
                        },
                      ],
                    }))
                  }
                >
                  Add Answer
                </Button>
              )}
            </div>
          )}

          {formData.questionType === "MATCHING" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("questionBank.createDialog.answerLabel")} (Required for MATCHING)
              </label>
              {fieldErrors.answers && (
                <div className="mt-1 text-sm text-red-600">
                  {fieldErrors.answers.map((error, index) => (
                    <div key={index}>{error}</div>
                  ))}
                </div>
              )}
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-end mb-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Clear all fields for MATCHING answer
                      setAnswerExtras((prev) => {
                        const newExtras = { ...prev };
                        delete newExtras[0];
                        return newExtras;
                      });
                      setFormData((prev: any) => ({
                        ...prev,
                        answers: [
                          {
                            answerJp: "",
                            isCorrect: true,
                            translations: {
                              meaning: [
                                { language_code: "vi", value: "" },
                                { language_code: "en", value: "" },
                              ],
                            },
                          },
                        ],
                      }));
                    }}
                    className="text-gray-600 hover:text-red-600"
                    title="Clear all fields for this option"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Clear
                  </Button>
                </div>
                <div className="space-y-3">
                  <Input
                    label="Japanese Answer"
                    value={formData.answers?.[0]?.answerJp || ""}
                    onChange={(e) => {
                      setFormData((prev: any) => ({
                        ...prev,
                        answers: [
                          {
                            answerJp: e.target.value,
                            isCorrect: true,
                            translations: {
                              meaning: [
                                { language_code: "vi", value: prev.answers?.[0]?.translations?.meaning[0]?.value || "" },
                              ],
                            },
                          },
                        ],
                      }));
                      if (fieldErrors.answers) {
                        setFieldErrors((prev: Record<string, string[]>) => {
                          const newErrors = { ...prev } as Record<string, string[]>;
                          delete newErrors.answers;
                          return newErrors;
                        });
                      }
                    }}
                    placeholder="Enter Japanese answer"
                    required
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Vietnamese Translation</label>
                      <Input
                        value={
                          formData.answers?.[0]?.translations?.meaning?.find((m: any) => m && m.language_code === "vi")?.value || ""
                        }
                        onChange={(e) =>
                          setFormData((prev: any) => ({
                            ...prev,
                            answers: [
                              {
                                answerJp: prev.answers?.[0]?.answerJp || "",
                                isCorrect: true,
                                translations: {
                                  meaning: (() => {
                                    const existingMeanings = prev.answers?.[0]?.translations?.meaning || [];
                                    const enMeaning = existingMeanings.find((m: any) => m && m.language_code === "en");
                                    return [ { language_code: "vi", value: e.target.value }, { language_code: "en", value: enMeaning?.value || "" } ];
                                  })(),
                                },
                              },
                            ],
                          }))
                        }
                        placeholder="Vietnamese translation"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">English Translation</label>
                      <Input
                        value={
                          formData.answers?.[0]?.translations?.meaning?.find((m: any) => m && m.language_code === "en")?.value || ""
                        }
                        onChange={(e) =>
                          setFormData((prev: any) => ({
                            ...prev,
                            answers: [
                              {
                                answerJp: prev.answers?.[0]?.answerJp || "",
                                isCorrect: true,
                                translations: {
                                  meaning: (() => {
                                    const existingMeanings = prev.answers?.[0]?.translations?.meaning || [];
                                    const viMeaning = existingMeanings.find((m: any) => m && m.language_code === "vi");
                                    return [ { language_code: "vi", value: viMeaning?.value || "" }, { language_code: "en", value: e.target.value } ];
                                  })(),
                                },
                              },
                            ],
                          }))
                        }
                        placeholder="English translation"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-col gap-3">
          <div className="flex justify-between w-full">
            <Button variant="outline" onClick={closeDialogs}>{t("common.cancel")}</Button>
            <div className="flex gap-2">
              {isCreateDialogOpen ? (
                <Button
                  onClick={async () => {
                    try {
                      if ((formData.questionType === "VOCABULARY" || formData.questionType === "LISTENING") && audioInputMode === "file") {
                        if (!selectedAudioFile) {
                          toast.error("Hãy chọn file âm thanh");
                          return;
                        }
                        const uploadResponse = await mediaService.uploadFile({ folderName: "question-audio", file: selectedAudioFile, type: "audio" });
                        type UploadResp = { statusCode?: number; message?: string; data?: { url?: string } };
                        const respData = uploadResponse?.data as UploadResp;
                        const url = respData?.data?.url || (respData as unknown as { url?: string })?.url;
                        if (!url) {
                          toast.error("Tải âm thanh thất bại");
                          return;
                        }
                        setFormData((prev: any) => ({ ...prev, audioUrl: url }));
                        await new Promise((r) => setTimeout(r, 0));
                      }
                      await handleCreateQuestion();
                    } catch (err: unknown) {
                      const anyErr = err as { response?: { data?: { message?: string } } };
                      toast.error(anyErr?.response?.data?.message || "Không thể tạo câu hỏi");
                    }
                  }}
                  disabled={isCreating}
                >
                  {isCreating ? t("questionBank.createDialog.processing") : t("questionBank.createDialog.createButton")}
                </Button>
              ) : (
                <>
                  <Button variant="outline" onClick={handleUpdateQuestion} disabled={isUpdating} className="bg-blue-50 text-blue-700 hover:bg-blue-100">
                    {isUpdating ? "Đang cập nhật..." : "Cập nhật Câu hỏi"}
                  </Button>
                  <Button onClick={handleUpdateAnswer} disabled={isUpdatingAnswer} className="bg-green-50 text-green-700 hover:bg-green-100">
                    {isUpdatingAnswer ? "Đang cập nhật..." : "Cập nhật Đáp án"}
                  </Button>
                </>
              )}
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateEditDialog;


