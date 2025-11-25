declare namespace COMPONENTS {
  export interface ILucideIconProps {
    name: string;
    iconSize?: number;
    iconColor?: string;
    className?: string;
    spin?: boolean;
    fill?: string;
  }

  export interface IFiltersBarProps {
    searchInput: string;
    setSearchInput: (v: string) => void;
    filters: { levelN?: number; questionType?: string } & Record<
      string,
      unknown
    >;
    handleFilterChange: (key: string, value: unknown) => void;
    language: string;
    QUESTION_TYPE_LABELS: Record<string, Record<string, string>>;
    JLPT_LEVEL_LABELS: Record<string, Record<string, string>>;
    openCreateDialog: () => void;
    t: (k: string) => string;
  }

  export interface IQuestionsTableProps {
    isLoading: boolean;
    questions: QuestionEntityType[];
    filters: { sortBy?: string; sortOrder?: string } & Record<string, unknown>;
    handleSort: (key: string) => void;
    getQuestionTypeLabel: (type: string) => string;
    openEditDialog: (q: QuestionEntityType) => void;
    setDeleteQuestionId: (id: number | null) => void;
    t: (k: string) => string;
  }

  export interface IStatsCardsProps {
    questions: QuestionEntityType[];
    totalItems: number;
    levelCounts?: {
      N5: number;
      N4: number;
      N3: number;
      N2: number;
      N1: number;
    };
  }

  export type IQuestionMeaningLike = {
    language?: string;
    value?: string;
    translations?: { vi?: string; en?: string };
  };

  export interface ICreateEditDialogProps {
    isCreateDialogOpen: boolean;
    isEditDialogOpen: boolean;
    closeDialogs: () => void;
    t: (k: string) => string;
    formData: IQuestionEntityType;
    setFormData: React.Dispatch<React.SetStateAction<IQuestionEntityType>>;
    fieldErrors: Record<string, string[]>;
    setFieldErrors: React.Dispatch<
      React.SetStateAction<Record<string, string[]>>
    >;
    isCreating: boolean;
    isUpdating: boolean;
    isUpdatingAnswer: boolean;
    isLoadingAnswers: boolean;
    handleCreateQuestion: () => Promise<void>;
    handleUpdateQuestion: () => void;
    handleUpdateAnswer: () => void;
    QUESTION_TYPE_LABELS: Record<string, Record<string, string>>;
    JLPT_LEVEL_LABELS: Record<string, Record<string, string>>;
    language: string;
  }
  export interface IDeleteDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isDeleting: boolean;
    t: (k: string) => string;
  }
}
