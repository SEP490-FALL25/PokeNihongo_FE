import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@ui/Dialog';
import { Input } from '@ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ui/Select';
import { Button } from '@ui/Button';
import { Switch } from '@ui/Switch';
import { Card, CardContent, CardHeader, CardTitle } from '@ui/Card';
import { Badge } from '@ui/Badge';
import { Separator } from '@ui/Separator';
import { Checkbox } from '@ui/Checkbox';
import { useCreateLesson, useUpdateLesson, useGetLessonById } from '@hooks/useLesson';
import { ICreateLessonRequest } from '@models/lesson/request';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { validateCreateLesson, useFormValidation, commonValidationRules } from '@utils/validation';
import testService from '@services/test';
import { useGetRewardListAdmin } from '@hooks/useReward';
import { useDebounce } from '@hooks/useDebounce';
import { REWARD_TYPE, REWARD_TARGET } from '@constants/reward';
import { IRewardEntityType } from '@models/reward/entity';
import { Search, Loader2 } from 'lucide-react';
import {
    BookOpen,
    Clock,
    Globe,
    Gift,
    Layers,
    FileText,
    Save,
    Send,
    X,
    Languages
} from 'lucide-react';

interface CreateLessonProps {
    setIsAddDialogOpen: (value: boolean) => void;
    lessonId?: number | null; // If provided, component is in edit mode
}

// Map levelJlpt to lessonCategoryId: 5→1, 4→2, 3→3, 2→4, 1→5
const getLessonCategoryIdFromLevel = (levelJlpt: number): number => {
    return 6 - levelJlpt;
};

const CreateLesson = ({ setIsAddDialogOpen, lessonId = null }: CreateLessonProps) => {
    const { t } = useTranslation();
    const isEditMode = !!lessonId;
    const createLessonMutation = useCreateLesson();
    const updateLessonMutation = useUpdateLesson();
    
    // Fetch lesson data if in edit mode
    const { data: lessonData, isLoading: isLoadingLesson } = useGetLessonById(lessonId);

    const [formData, setFormData] = useState<ICreateLessonRequest>({
        titleJp: '',
        levelJlpt: 5,
        estimatedTimeMinutes: 45,
        isPublished: true,
        version: '1.0.0',
        lessonCategoryId: 1, // Will be auto-calculated from levelJlpt
        rewardIds: [],
        translations: {
            meaning: [
                { language_code: 'vi', value: '' },
                { language_code: 'en', value: '' }
            ]
        }
    });

    // Load lesson data when in edit mode
    useEffect(() => {
        if (isEditMode && lessonData) {
            console.log('Loading lesson data for edit:', lessonData);

            // Map title array to translations.meaning format
            let mappedTranslations = {
                meaning: [
                    { language_code: 'vi', value: '' },
                    { language_code: 'en', value: '' }
                ]
            };

            if (lessonData.title && Array.isArray(lessonData.title)) {
                // Map title array: [{language: "lang_1", value: "..."}, {language: "lang_2", value: "..."}]
                // to translations.meaning: [{language_code: "vi", value: "..."}, {language_code: "en", value: "..."}]
                const titleTranslations = lessonData.title.map((item: { language?: string; value?: string }) => {
                    // Map language codes: lang_1 -> vi, lang_2 -> en (or use the language value directly if it's already a code)
                    let languageCode = 'vi'; // default
                    if (item.language === 'lang_1' || item.language === 'vi') {
                        languageCode = 'vi';
                    } else if (item.language === 'lang_2' || item.language === 'en') {
                        languageCode = 'en';
                    } else if (item.language === 'ja' || item.language === 'lang_3') {
                        languageCode = 'ja';
                    } else if (item.language) {
                        // Try to extract language code from the language field
                        languageCode = item.language.replace('lang_', '') || 'vi';
                    }

                    return {
                        language_code: languageCode,
                        value: item.value || ''
                    };
                });

                // Ensure we have at least vi and en
                const viTranslation = titleTranslations.find((t: { language_code: string }) => t.language_code === 'vi') || { language_code: 'vi', value: '' };
                const enTranslation = titleTranslations.find((t: { language_code: string }) => t.language_code === 'en') || { language_code: 'en', value: '' };

                mappedTranslations = {
                    meaning: [viTranslation, enTranslation]
                };
            } else if (lessonData.translations) {
                // If translations object already exists, use it
                mappedTranslations = lessonData.translations;
            }

            // Find titleJp - could be in title array with language='ja' or a separate field
            let titleJp = '';
            if (lessonData.titleJp) {
                titleJp = lessonData.titleJp;
            } else if (lessonData.title && Array.isArray(lessonData.title)) {
                const jaTitle = lessonData.title.find((item: { language?: string }) => 
                    item.language === 'ja' || item.language === 'lang_3' || item.language?.includes('ja')
                );
                if (jaTitle && jaTitle.value) {
                    titleJp = jaTitle.value;
                }
            }

            // Handle rewardIds - could be array, number, or empty array
            let rewardIds: number[] = [];
            if (Array.isArray(lessonData.rewardId) && lessonData.rewardId.length > 0) {
                rewardIds = lessonData.rewardId;
            } else if (typeof lessonData.rewardId === 'number') {
                rewardIds = [lessonData.rewardId];
            } else if (Array.isArray(lessonData.rewardIds) && lessonData.rewardIds.length > 0) {
                rewardIds = lessonData.rewardIds;
            }

            // Map lesson response to form data
            setFormData({
                titleJp: titleJp,
                levelJlpt: lessonData.levelJlpt || 5,
                estimatedTimeMinutes: lessonData.estimatedTimeMinutes || 45,
                isPublished: lessonData.isPublished ?? true,
                version: lessonData.version || '1.0.0',
                lessonCategoryId: lessonData.lessonCategoryId || getLessonCategoryIdFromLevel(lessonData.levelJlpt || 5),
                rewardIds: rewardIds,
                testId: lessonData.testId || undefined,
                translations: mappedTranslations
            });

            console.log('Mapped form data:', {
                titleJp,
                rewardIds,
                translations: mappedTranslations
            });

            // Load selected rewards into map if available
            if (rewardIds.length > 0) {
                // We'll fetch these rewards when the modal opens
            }
        }
    }, [isEditMode, lessonData]);

    // Modal state for selecting rewards
    const [isRewardModalOpen, setIsRewardModalOpen] = useState(false);
    const [rewardSearchQuery, setRewardSearchQuery] = useState('');
    const [rewardTypeFilter, setRewardTypeFilter] = useState('all');
    const [rewardTargetFilter, setRewardTargetFilter] = useState('all');
    const [rewardCurrentPage, setRewardCurrentPage] = useState(1);
    const [modalSelectedRewardIds, setModalSelectedRewardIds] = useState<number[]>([]);
    const debouncedRewardSearchQuery = useDebounce(rewardSearchQuery, 500);

    // Fetch reward list for modal (with filters)
    const { data: rewardListData, isLoading: isLoadingRewards } = useGetRewardListAdmin({
        page: rewardCurrentPage,
        limit: 20,
        sortBy: 'id',
        sort: 'desc',
        name: debouncedRewardSearchQuery || undefined,
        rewardType: rewardTypeFilter !== 'all' ? rewardTypeFilter : undefined,
        rewardTarget: rewardTargetFilter !== 'all' ? rewardTargetFilter : undefined,
    });

    const rewards = rewardListData?.results || [];
    
    // Store selected rewards for display
    const [selectedRewardsMap, setSelectedRewardsMap] = useState<Record<number, IRewardEntityType>>({});
    
    // Sync selected rewards map when modal opens or rewards data changes
    useEffect(() => {
        const currentRewards = rewardListData?.results || [];
        if (isRewardModalOpen && currentRewards.length > 0 && formData.rewardIds && formData.rewardIds.length > 0) {
            setSelectedRewardsMap(prev => {
                const newMap = { ...prev };
                let hasChanges = false;
                currentRewards.forEach((reward: IRewardEntityType) => {
                    if (formData.rewardIds?.includes(reward.id) && !newMap[reward.id]) {
                        newMap[reward.id] = reward;
                        hasChanges = true;
                    }
                });
                return hasChanges ? newMap : prev;
            });
        }
    }, [isRewardModalOpen, rewardListData?.results, formData.rewardIds]);
    
    // Get selected rewards for chips display
    const getSelectedRewards = (): IRewardEntityType[] => {
        if (!formData.rewardIds || formData.rewardIds.length === 0) return [];
        return formData.rewardIds
            .map(id => selectedRewardsMap[id])
            .filter(Boolean) as IRewardEntityType[];
    };

    const [errors, setErrors] = useState<Record<string, string>>({});

    // Initialize validation rules (lessonCategoryId will be auto-calculated, so no validation needed)
    const validationRules = {
        titleJp: commonValidationRules.titleJp,
        levelJlpt: commonValidationRules.levelJlpt,
        estimatedTimeMinutes: commonValidationRules.estimatedTimeMinutes,
        version: commonValidationRules.version,
    };

    const { validateField } = useFormValidation(validationRules);

    const handleInputChange = (field: string, value: unknown) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        // Mark field as touched for validation

        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    const handleTranslationChange = (index: number, field: 'language_code' | 'value', value: string) => {
        setFormData(prev => ({
            ...prev,
            translations: {
                ...prev.translations,
                meaning: prev.translations.meaning.map((item, i) =>
                    i === index ? { ...item, [field]: value } : item
                )
            }
        }));

        // Mark translation field as touched for validation

        // Clear error when user starts typing
        if (errors[`translation_${index}`]) {
            setErrors(prev => ({
                ...prev,
                [`translation_${index}`]: ''
            }));
        }
    };

    const handleRewardToggle = (rewardId: number, reward?: IRewardEntityType) => {
        setFormData(prev => {
            const currentRewardIds = prev.rewardIds || [];
            const isSelected = currentRewardIds.includes(rewardId);
            
            const newRewardIds = isSelected
                ? currentRewardIds.filter(id => id !== rewardId)
                : [...currentRewardIds, rewardId];
            
            // Update selected rewards map
            if (reward && !isSelected) {
                setSelectedRewardsMap(prev => ({
                    ...prev,
                    [rewardId]: reward
                }));
            } else if (isSelected) {
                setSelectedRewardsMap(prev => {
                    const newMap = { ...prev };
                    delete newMap[rewardId];
                    return newMap;
                });
            }
            
            return {
                ...prev,
                rewardIds: newRewardIds
            };
        });

        // Clear error when user selects/deselects
        if (errors.rewardIds) {
            setErrors(prev => ({
                ...prev,
                rewardIds: ''
            }));
        }
    };

    const handleRemoveReward = (rewardId: number) => {
        handleRewardToggle(rewardId);
    };

    // Modal-specific selection (confirmed later)
    const toggleModalReward = (rewardId: number) => {
        setModalSelectedRewardIds((prev) =>
            prev.includes(rewardId) ? prev.filter((id) => id !== rewardId) : [...prev, rewardId]
        );
    };

    const handleOpenRewardModal = (open: boolean) => {
        setIsRewardModalOpen(open);
        if (open) {
            setModalSelectedRewardIds(formData.rewardIds || []);
        }
    };

    const handleConfirmRewards = () => {
        // Update main form with modal selections
        setFormData((prev) => ({
            ...prev,
            rewardIds: modalSelectedRewardIds
        }));

        // Update selected rewards map based on current list
        setSelectedRewardsMap((prev) => {
            const newMap = { ...prev };
            const availableRewards = rewardListData?.results || [];
            modalSelectedRewardIds.forEach((id) => {
                const found = availableRewards.find((r: IRewardEntityType) => r.id === id);
                if (found) {
                    newMap[id] = found;
                }
            });
            // Remove deselected
            Object.keys(newMap).forEach((key) => {
                const id = Number(key);
                if (!modalSelectedRewardIds.includes(id)) {
                    delete newMap[id];
                }
            });
            return newMap;
        });

        if (errors.rewardIds) {
            setErrors((prev) => ({ ...prev, rewardIds: '' }));
        }

        setIsRewardModalOpen(false);
    };

    const getRewardTypeLabel = (type: string) => {
        switch (type) {
            case REWARD_TYPE.LESSON: return 'LESSON';
            case REWARD_TYPE.DAILY_REQUEST: return 'DAILY_REQUEST';
            case REWARD_TYPE.EVENT: return 'EVENT';
            case REWARD_TYPE.ACHIEVEMENT: return 'ACHIEVEMENT';
            case REWARD_TYPE.LEVEL: return 'LEVEL';
            default: return type;
        }
    };

    const getRewardTargetLabel = (target: string) => {
        switch (target) {
            case REWARD_TARGET.EXP: return 'EXP';
            case REWARD_TARGET.POKEMON: return 'POKEMON';
            case REWARD_TARGET.POKE_COINS: return 'POKE_COINS';
            case REWARD_TARGET.SPARKLES: return 'SPARKLES';
            default: return target;
        }
    };

    const getRewardName = (reward: IRewardEntityType) => {
        // For admin API, rewards may have nameTranslations array or nameTranslation string
        const rewardWithTranslations = reward as IRewardEntityType & { 
            nameTranslations?: Array<{ key: string; value: string }> 
        };
        
        if (rewardWithTranslations.nameTranslations) {
            return rewardWithTranslations.nameTranslations.find((t) => t.key === 'vi')?.value 
                || rewardWithTranslations.nameTranslations.find((t) => t.key === 'en')?.value 
                || rewardWithTranslations.nameKey;
        }
        
        return reward.nameTranslation || reward.nameKey || `Reward #${reward.id}`;
    };

    // Real-time validation on blur
    const handleBlur = (field: string) => {
        const error = validateField(field, (formData as Record<string, unknown>)[field]);
        if (error) {
            setErrors(prev => ({ ...prev, [field]: error }));
        } else {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const validateForm = () => {
        // Auto-calculate lessonCategoryId before validation
        const dataToValidate = {
            ...formData,
            lessonCategoryId: getLessonCategoryIdFromLevel(formData.levelJlpt)
        };
        const newErrors = validateCreateLesson(dataToValidate);
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (isPublish: boolean = false) => {
        if (!validateForm()) {
            toast.error(t('createLesson.checkInfo'));
            return;
        }

        try {
            let testId = formData.testId;

            // Only create test if in create mode
            if (!isEditMode) {
                // Tạo test trước với meanings
                const testNameVi = `Kiểm tra cuối bài học N${formData.levelJlpt}`;
                const testNameEn = `N${formData.levelJlpt} Final Lesson Test`;
                const testNameJa = `N${formData.levelJlpt}レッスンフィナルテスト`;

                const testType = "LESSON_REVIEW" as const;
                const testStatus = isPublish ? ("ACTIVE" as const) : ("DRAFT" as const);

                const testBody = {
                    meanings: [
                        {
                            field: "name",
                            translations: {
                                vi: testNameVi,
                                en: testNameEn,
                                ja: testNameJa
                            }
                        }
                    ],
                    price: 0,
                    levelN: formData.levelJlpt,
                    limit: 0,
                    testType,
                    status: testStatus
                };

                const testResponse = await testService.createTestWithMeanings(testBody);
                testId = testResponse.data.id;
            }
            // In edit mode, use existing testId from formData

            // Auto-calculate lessonCategoryId from levelJlpt
            const submitData = {
                ...formData,
                lessonCategoryId: getLessonCategoryIdFromLevel(formData.levelJlpt),
                isPublished: isPublish,
                testId: testId,
                rewardIds: formData.rewardIds && formData.rewardIds.length > 0 ? formData.rewardIds : undefined
            };

            if (isEditMode && lessonId) {
                await updateLessonMutation.mutateAsync({ id: lessonId, data: submitData });
                toast.success(isPublish ? t('createLesson.updatePublishedSuccess') : t('createLesson.updateDraftSuccess'));
            } else {
                await createLessonMutation.mutateAsync(submitData);
                toast.success(isPublish ? t('createLesson.publishedSuccess') : t('createLesson.draftSuccess'));
            }
            setIsAddDialogOpen(false);
        } catch (error) {
            console.error(`Error ${isEditMode ? 'updating' : 'creating'} lesson:`, error);
            toast.error(isEditMode ? t('createLesson.updateError') : t('createLesson.createError'));
        }
    };

    return (
        <>
            <DialogContent className="bg-gradient-to-br from-white to-gray-50 border-border max-w-4xl max-h-[90vh] overflow-hidden">
                <DialogHeader className="pb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <BookOpen className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <DialogTitle className="text-2xl font-bold text-foreground">
                                {isEditMode ? t('createLesson.editTitle') : t('createLesson.title')}
                            </DialogTitle>
                            <p className="text-sm text-muted-foreground mt-1">
                                {isEditMode ? t('createLesson.editDescription') : t('createLesson.description')}
                            </p>
                        </div>
                    </div>
                </DialogHeader>

                <div className="overflow-y-auto max-h-[calc(95vh-300px)] pr-2">
                    {isLoadingLesson && isEditMode ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
                            <p className="text-sm text-muted-foreground">{t('createLesson.loadingLesson')}</p>
                        </div>
                    ) : (
                    <div className="space-y-6">
                        {/* Thông tin cơ bản */}
                        <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
                            <CardHeader className="pb-4">
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <FileText className="h-5 w-5 text-primary" />
                                    {t('createLesson.basicInfo')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Tiêu đề tiếng Nhật */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                                        <Globe className="h-4 w-4 text-primary" />
                                        {t('createLesson.titleJp')} *
                                    </label>
                                    <Input
                                        placeholder="挨拶の基本"
                                        className="bg-background border-border text-foreground h-11 text-base"
                                        value={formData.titleJp}
                                        onChange={(e) => handleInputChange('titleJp', e.target.value)}
                                        onBlur={() => handleBlur('titleJp')}
                                    />
                                    {errors.titleJp && <p className="text-sm text-red-500 flex items-center gap-1">
                                        <X className="h-3 w-3" />
                                        {errors.titleJp}
                                    </p>}
                                </div>

                                {/* Dịch thuật */}
                                <div className="space-y-3">
                                    <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                                        <Languages className="h-4 w-4 text-primary" />
                                        {t('createLesson.translations')} *
                                    </label>
                                    <div className="space-y-3">
                                        {formData.translations.meaning.map((translation, index) => (
                                            <div key={index} className="space-y-2">
                                                <label className="text-xs font-medium text-muted-foreground uppercase">
                                                    {translation.language_code}
                                                </label>
                                                <Input
                                                    placeholder={
                                                        index === 0
                                                            ? t('createLesson.translationPlaceholderVi')
                                                            : t('createLesson.translationPlaceholderEn')
                                                    }
                                                    value={translation.value}
                                                    onChange={(e) => handleTranslationChange(index, 'value', e.target.value)}
                                                    onBlur={() => { }}
                                                    className="bg-background border-border text-foreground h-10"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    {errors.translation_0 && <p className="text-sm text-red-500 flex items-center gap-1">
                                        <X className="h-3 w-3" />
                                        {errors.translation_0}
                                    </p>}
                                    {errors.translation_1 && <p className="text-sm text-red-500 flex items-center gap-1">
                                        <X className="h-3 w-3" />
                                        {errors.translation_1}
                                    </p>}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Cấu hình bài học */}
                        <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
                            <CardHeader className="pb-4">
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Layers className="h-5 w-5 text-primary" />
                                    {t('createLesson.lessonConfig')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Cấp độ JLPT */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                                        {t('createLesson.level')} *
                                        <Badge variant="outline" className="text-xs bg-gray-700 text-gray-700 font-medium border border-gray-200">JLPT</Badge>
                                    </label>
                                    <Select value={formData.levelJlpt.toString()} onValueChange={(value) => handleInputChange('levelJlpt', parseInt(value))}>
                                        <SelectTrigger
                                            className="bg-background border-border text-foreground h-11"
                                            onBlur={() => handleBlur('levelJlpt')}
                                        >
                                            <SelectValue placeholder={t('createLesson.selectLevel')} />
                                        </SelectTrigger>
                                        <SelectContent className="bg-card border-border">
                                            <SelectItem value="5">
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="secondary" className="text-xs">N5</Badge>
                                                    <span>{t('createLesson.startLevel')}</span>
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="4">
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="secondary" className="text-xs">N4</Badge>
                                                    <span>{t('createLesson.basicLevel')}</span>
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="3">
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="secondary" className="text-xs">N3</Badge>
                                                    <span>{t('createLesson.intermediateLevel')}</span>
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="2">
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="secondary" className="text-xs">N2</Badge>
                                                    <span>{t('createLesson.upperIntermediateLevel')}</span>
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="1">
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="secondary" className="text-xs">N1</Badge>
                                                    <span>{t('createLesson.advancedLevel')}</span>
                                                </div>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.levelJlpt && <p className="text-sm text-red-500 flex items-center gap-1">
                                        <X className="h-3 w-3" />
                                        {errors.levelJlpt}
                                    </p>}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Thời lượng */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-primary" />
                                            {t('createLesson.timeMinutes')} *
                                        </label>
                                        <Input
                                            type="number"
                                            placeholder="45"
                                            className="bg-background border-border text-foreground h-11"
                                            value={formData.estimatedTimeMinutes}
                                            onChange={(e) => handleInputChange('estimatedTimeMinutes', parseInt(e.target.value) || 0)}
                                            onBlur={() => handleBlur('estimatedTimeMinutes')}
                                        />
                                        {errors.estimatedTimeMinutes && <p className="text-sm text-red-500 flex items-center gap-1">
                                            <X className="h-3 w-3" />
                                            {errors.estimatedTimeMinutes}
                                        </p>}
                                    </div>

                                    {/* Phiên bản */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-primary" />
                                            {t('createLesson.version')} *
                                        </label>
                                        <Input
                                            placeholder="1.0.0"
                                            className="bg-background border-border text-foreground h-11"
                                            value={formData.version}
                                            onChange={(e) => handleInputChange('version', e.target.value)}
                                            onBlur={() => handleBlur('version')}
                                        />
                                        {errors.version && <p className="text-sm text-red-500 flex items-center gap-1">
                                            <X className="h-3 w-3" />
                                            {errors.version}
                                        </p>}
                                    </div>
                                </div>

                                {/* Phần thưởng */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                                        <Gift className="h-4 w-4 text-primary" />
                                        {t('createLesson.rewardId')} *
                                    </label>
                                    <div 
                                        className="min-h-[60px] w-full rounded-lg border-2 border-gray-200 bg-background p-3 cursor-pointer hover:border-primary/50 transition-colors"
                                        onClick={() => setIsRewardModalOpen(true)}
                                    >
                                        {formData.rewardIds && formData.rewardIds.length > 0 ? (
                                            <div className="flex flex-wrap gap-2">
                                                {getSelectedRewards().map((reward) => (
                                                    <Badge
                                                        key={reward.id}
                                                        variant="secondary"
                                                        className="flex items-center gap-1 bg-blue-100 text-blue-900 border-blue-300 px-2 py-1 pr-1"
                                                    >
                                                        <span className="text-sm font-medium">{getRewardName(reward)}</span>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleRemoveReward(reward.id);
                                                            }}
                                                            className="ml-1 hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    </Badge>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="text-sm text-muted-foreground">
                                                {t('createLesson.rewardSelectHint')}
                                            </span>
                                        )}
                                    </div>
                                    {errors.rewardIds && (
                                        <p className="text-sm text-red-500 flex items-center gap-1">
                                            <X className="h-3 w-3" />
                                            {errors.rewardIds}
                                        </p>
                                    )}
                                    {(formData.rewardIds && formData.rewardIds.length > 0) && (
                                        <p className="text-xs text-muted-foreground">
                                            {t('createLesson.rewardSelectedCount', { count: formData.rewardIds.length })}
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Trạng thái xuất bản */}
                        <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-100 rounded-lg">
                                            <Send className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <label htmlFor="isPublished" className="text-sm font-semibold text-foreground cursor-pointer">
                                                {t('createLesson.publishNow')}
                                            </label>
                                            <p className="text-xs text-muted-foreground">
                                                {t('createLesson.publishDescription')}
                                            </p>
                                        </div>
                                    </div>
                                    <Switch
                                        id="isPublished"
                                        checked={formData.isPublished}
                                        onCheckedChange={(checked) => handleInputChange('isPublished', checked)}
                                        className="data-[state=checked]:bg-blue-600"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    )}
                </div>

                <Separator className="my-4" />

                <div className="flex justify-between items-center pt-4">
                    <div className="text-xs text-muted-foreground">
                        * {t('createLesson.requiredFields')}
                    </div>
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={() => setIsAddDialogOpen(false)}
                            className="border-border text-foreground hover:bg-gray-50 h-10 px-6"
                        >
                            <X className="h-4 w-4 mr-2" />
                            {t('common.cancel')}
                        </Button>
                        <Button
                            variant="outline"
                            className="border-border text-foreground bg-transparent hover:bg-gray-50 h-10 px-6"
                            onClick={() => handleSubmit(false)}
                            disabled={createLessonMutation.isPending || updateLessonMutation.isPending || isLoadingLesson}
                        >
                            <Save className="h-4 w-4 mr-2" />
                            {(createLessonMutation.isPending || updateLessonMutation.isPending) ? t('common.loading') : t('createLesson.saveDraft')}
                        </Button>
                        <Button
                            className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70 h-10 px-6 shadow-lg"
                            onClick={() => handleSubmit(true)}
                            disabled={createLessonMutation.isPending || updateLessonMutation.isPending || isLoadingLesson}
                        >
                            <Send className="h-4 w-4 mr-2" />
                            {(createLessonMutation.isPending || updateLessonMutation.isPending) ? t('createLesson.publishing') : t('createLesson.publish')}
                        </Button>
                    </div>
                </div>
            </DialogContent>

            {/* Reward Selection Modal */}
            <Dialog open={isRewardModalOpen} onOpenChange={handleOpenRewardModal}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden bg-white">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl">
                            <Gift className="h-5 w-5 text-primary" />
                            {t('createLesson.rewardModal.title')}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        {/* Search and Filters */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                                <Input
                                    placeholder={t('createLesson.rewardModal.searchPlaceholder')}
                                    value={rewardSearchQuery}
                                    onChange={(e) => {
                                        setRewardSearchQuery(e.target.value);
                                        setRewardCurrentPage(1);
                                    }}
                                    className="pl-10 bg-background border-border text-foreground h-11 shadow-sm focus:shadow-md transition-shadow"
                                />
                            </div>
                            <Select
                                value={rewardTypeFilter}
                                onValueChange={(value) => {
                                    setRewardTypeFilter(value);
                                    setRewardCurrentPage(1);
                                }}
                            >
                                <SelectTrigger className="w-full sm:w-[180px] bg-background border-border text-foreground h-11 shadow-sm">
                                    <SelectValue placeholder={t('createLesson.rewardModal.typePlaceholder')} />
                                </SelectTrigger>
                                <SelectContent className="bg-card border-border">
                                    <SelectItem value="all">{t('createLesson.rewardModal.allTypes')}</SelectItem>
                                    <SelectItem value={REWARD_TYPE.LESSON}>LESSON</SelectItem>
                                    <SelectItem value={REWARD_TYPE.DAILY_REQUEST}>DAILY_REQUEST</SelectItem>
                                    <SelectItem value={REWARD_TYPE.EVENT}>EVENT</SelectItem>
                                    <SelectItem value={REWARD_TYPE.ACHIEVEMENT}>ACHIEVEMENT</SelectItem>
                                    <SelectItem value={REWARD_TYPE.LEVEL}>LEVEL</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select
                                value={rewardTargetFilter}
                                onValueChange={(value) => {
                                    setRewardTargetFilter(value);
                                    setRewardCurrentPage(1);
                                }}
                            >
                                <SelectTrigger className="w-full sm:w-[180px] bg-background border-border text-foreground h-11 shadow-sm">
                                    <SelectValue placeholder={t('createLesson.rewardModal.targetPlaceholder')} />
                                </SelectTrigger>
                                <SelectContent className="bg-card border-border">
                                    <SelectItem value="all">{t('createLesson.rewardModal.allTargets')}</SelectItem>
                                    <SelectItem value={REWARD_TARGET.EXP}>EXP</SelectItem>
                                    <SelectItem value={REWARD_TARGET.POKEMON}>POKEMON</SelectItem>
                                    <SelectItem value={REWARD_TARGET.POKE_COINS}>POKE_COINS</SelectItem>
                                    <SelectItem value={REWARD_TARGET.SPARKLES}>SPARKLES</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Rewards List */}
                        <div className="border-2 border-gray-200 rounded-lg bg-gray-50/50 max-h-[50vh] overflow-y-auto shadow-sm">
                            {isLoadingRewards ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
                                    <p className="text-sm text-gray-600">{t('createLesson.rewardModal.loading')}</p>
                                </div>
                            ) : rewards.length === 0 ? (
                                <div className="text-sm text-gray-600 text-center py-12">
                                    {t('createLesson.rewardModal.noRewards')}
                                </div>
                            ) : (
                                <div className="p-2 space-y-2">
                                    {rewards.map((reward: IRewardEntityType) => {
                                        const isSelected = modalSelectedRewardIds.includes(reward.id);
                                        
                                        return (
                                            <div
                                                key={reward.id}
                                                className={`flex items-start space-x-3 p-3 rounded-lg border-2 transition-all cursor-pointer ${
                                                    isSelected 
                                                        ? 'bg-blue-50 border-blue-300 shadow-sm' 
                                                        : 'bg-white border-gray-200 hover:border-blue-200 hover:bg-blue-50/50'
                                                }`}
                                    onClick={() => toggleModalReward(reward.id)}
                                            >
                                                <div className="mt-0.5">
                                                    <Checkbox
                                                        checked={isSelected}
                                                        onCheckedChange={() => toggleModalReward(reward.id)}
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex flex-col gap-2">
                                                        <span className={`text-sm font-semibold ${
                                                            isSelected ? 'text-blue-900' : 'text-gray-900'
                                                        }`}>
                                                            {getRewardName(reward)}
                                                        </span>
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <Badge 
                                                                variant="outline" 
                                                                className="text-xs bg-gray-700 text-gray-700 font-medium border border-gray-200"
                                                            >
                                                                {getRewardTypeLabel(reward.rewardType)}
                                                            </Badge>
                                                            <Badge 
                                                                variant="secondary" 
                                                                className="text-xs bg-gray-100 text-gray-700 font-medium border border-gray-200"
                                                            >
                                                                {getRewardTargetLabel(reward.rewardTarget)}
                                                            </Badge>
                                                            {reward.rewardItem && (
                                                                <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                                                                    {reward.rewardItem}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Pagination */}
                        {rewardListData?.pagination && rewardListData.pagination.totalPage > 1 && (
                            <div className="flex items-center justify-between pt-2 border-t border-border">
                                <p className="text-sm text-muted-foreground">
                                    {t('createLesson.rewardModal.pageStat', {
                                        current: rewardListData.pagination.currentPage || rewardCurrentPage || 1,
                                        total: rewardListData.pagination.totalPage || 1
                                    })}
                                </p>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setRewardCurrentPage(prev => Math.max(1, prev - 1))}
                                        disabled={rewardCurrentPage === 1 || isLoadingRewards}
                                    >
                                        {t('common.previous')}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setRewardCurrentPage(prev => Math.min(rewardListData.pagination.totalPage, prev + 1))}
                                        disabled={rewardCurrentPage === rewardListData.pagination.totalPage || isLoadingRewards}
                                    >
                                        {t('common.next')}
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Selected Count (modal state) */}
                        {(modalSelectedRewardIds && modalSelectedRewardIds.length > 0) && (
                            <div className="text-sm text-muted-foreground pt-2 border-t border-border">
                                {t('createLesson.rewardSelectedCount', { count: modalSelectedRewardIds.length })}
                            </div>
                        )}

                        <div className="flex justify-end gap-2 pt-3">
                            <Button
                                variant="outline"
                                onClick={() => setIsRewardModalOpen(false)}
                                className="border-border"
                            >
                                {t('common.cancel')}
                            </Button>
                            <Button onClick={handleConfirmRewards} className="bg-primary text-primary-foreground">
                                {t('common.confirm')}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default CreateLesson