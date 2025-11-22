import { DialogContent, DialogHeader, DialogTitle } from '@ui/Dialog';
import { Input } from '@ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ui/Select';
import { Button } from '@ui/Button';
import { Switch } from '@ui/Switch';
import { Card, CardContent, CardHeader, CardTitle } from '@ui/Card';
import { Badge } from '@ui/Badge';
import { Separator } from '@ui/Separator';
import { Checkbox } from '@ui/Checkbox';
import { useCreateLesson } from '@hooks/useLesson';
import { ICreateLessonRequest } from '@models/lesson/request';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { validateCreateLesson, useFormValidation, commonValidationRules } from '@utils/validation';
import testService from '@services/test';
import { useGetRewardListAdmin } from '@hooks/useReward';
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
}

const CreateLesson = ({ setIsAddDialogOpen }: CreateLessonProps) => {
    const { t } = useTranslation();
    const createLessonMutation = useCreateLesson();

    const [formData, setFormData] = useState<ICreateLessonRequest>({
        titleJp: '',
        levelJlpt: 5,
        estimatedTimeMinutes: 45,
        isPublished: false,
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

    // Fetch reward list
    const { data: rewardListData, isLoading: isLoadingRewards } = useGetRewardListAdmin({
        page: 1,
        limit: 100,
        sortBy: 'id',
        sort: 'desc'
    });

    const rewards = rewardListData?.results || [];

    // Map levelJlpt to lessonCategoryId: 5→1, 4→2, 3→3, 2→4, 1→5
    const getLessonCategoryIdFromLevel = (levelJlpt: number): number => {
        return 6 - levelJlpt;
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

    const handleInputChange = (field: string, value: any) => {
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

    const handleRewardToggle = (rewardId: number) => {
        setFormData(prev => {
            const currentRewardIds = prev.rewardIds || [];
            const isSelected = currentRewardIds.includes(rewardId);
            
            return {
                ...prev,
                rewardIds: isSelected
                    ? currentRewardIds.filter(id => id !== rewardId)
                    : [...currentRewardIds, rewardId]
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

    // Real-time validation on blur
    const handleBlur = (field: string) => {
        const error = validateField(field, (formData as any)[field]);
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
            const testId = testResponse.data.id;

            // Auto-calculate lessonCategoryId from levelJlpt
            const submitData = {
                ...formData,
                lessonCategoryId: getLessonCategoryIdFromLevel(formData.levelJlpt),
                isPublished: isPublish,
                testId: testId,
                rewardIds: formData.rewardIds && formData.rewardIds.length > 0 ? formData.rewardIds : undefined
            };

            await createLessonMutation.mutateAsync(submitData);
            toast.success(isPublish ? t('createLesson.publishedSuccess') : t('createLesson.draftSuccess'));
            setIsAddDialogOpen(false);
        } catch (error) {
            console.error('Error creating lesson:', error);
            toast.error(t('createLesson.createError'));
        }
    };

    return (
        <>
            <DialogContent className="bg-gradient-to-br from-white to-gray-50 border-border max-w-4xl max-h-[95vh] overflow-hidden">
                <DialogHeader className="pb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <BookOpen className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <DialogTitle className="text-2xl font-bold text-foreground">
                                {t('createLesson.title')}
                            </DialogTitle>
                            <p className="text-sm text-muted-foreground mt-1">
                                {t('createLesson.description')}
                            </p>
                        </div>
                    </div>
                </DialogHeader>

                <div className="overflow-y-auto max-h-[calc(95vh-200px)] pr-2">
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
                                            <div key={index} className="flex gap-3">
                                                <div className="flex-1">
                                                    <Input
                                                        placeholder="vi, en, ja..."
                                                        value={translation.language_code}
                                                        onChange={(e) => handleTranslationChange(index, 'language_code', e.target.value)}
                                                        onBlur={() => { }}
                                                        className="bg-background border-border text-foreground h-10"
                                                    />
                                                </div>
                                                <div className="flex-[3]">
                                                    <Input
                                                        placeholder={index === 0 ? "Cách chào hỏi cơ bản" : "Basic Greetings"}
                                                        value={translation.value}
                                                        onChange={(e) => handleTranslationChange(index, 'value', e.target.value)}
                                                        onBlur={() => { }}
                                                        className="bg-background border-border text-foreground h-10"
                                                    />
                                                </div>
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
                                        <Badge variant="outline" className="text-xs">JLPT</Badge>
                                        {t('createLesson.level')} *
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
                                                    <span>Bắt đầu</span>
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="4">
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="secondary" className="text-xs">N4</Badge>
                                                    <span>Cơ bản</span>
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="3">
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="secondary" className="text-xs">N3</Badge>
                                                    <span>Trung cấp</span>
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="2">
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="secondary" className="text-xs">N2</Badge>
                                                    <span>Trung thượng</span>
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="1">
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="secondary" className="text-xs">N1</Badge>
                                                    <span>Cao cấp</span>
                                                </div>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.levelJlpt && <p className="text-sm text-red-500 flex items-center gap-1">
                                        <X className="h-3 w-3" />
                                        {errors.levelJlpt}
                                    </p>}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {/* Thời lượng */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-primary" />
                                            Thời lượng (phút) *
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
                                </div>

                                {/* Phần thưởng */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                                        <Gift className="h-4 w-4 text-primary" />
                                        Phần thưởng *
                                    </label>
                                    <div className="border-2 border-gray-200 rounded-lg bg-gray-50/50 max-h-60 overflow-y-auto shadow-sm">
                                        {isLoadingRewards ? (
                                            <div className="text-sm text-gray-600 text-center py-8">
                                                Đang tải danh sách phần thưởng...
                                            </div>
                                        ) : rewards.length === 0 ? (
                                            <div className="text-sm text-gray-600 text-center py-8">
                                                Không có phần thưởng nào
                                            </div>
                                        ) : (
                                            <div className="p-2 space-y-2">
                                                {rewards.map((reward: any) => {
                                                    const isSelected = (formData.rewardIds || []).includes(reward.id);
                                                    const nameTranslation = reward.nameTranslations?.find((t: any) => t.key === 'vi')?.value 
                                                        || reward.nameTranslations?.find((t: any) => t.key === 'en')?.value 
                                                        || reward.nameKey;
                                                    
                                                    return (
                                                        <div
                                                            key={reward.id}
                                                            className={`flex items-start space-x-3 p-3 rounded-lg border-2 transition-all cursor-pointer ${
                                                                isSelected 
                                                                    ? 'bg-blue-50 border-blue-300 shadow-sm' 
                                                                    : 'bg-white border-gray-200 hover:border-blue-200 hover:bg-blue-50/50'
                                                            }`}
                                                            onClick={() => handleRewardToggle(reward.id)}
                                                        >
                                                            <div className="mt-0.5">
                                                                <Checkbox
                                                                    checked={isSelected}
                                                                    onCheckedChange={() => handleRewardToggle(reward.id)}
                                                                />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex flex-col gap-2">
                                                                    <span className={`text-sm font-semibold ${
                                                                        isSelected ? 'text-blue-900' : 'text-gray-900'
                                                                    }`}>
                                                                        {nameTranslation}
                                                                    </span>
                                                                    <div className="flex items-center gap-2 flex-wrap">
                                                                        <Badge 
                                                                            variant="outline" 
                                                                            className="text-xs bg-gray-700 text-gray-700 font-medium border border-gray-200"
                                                                        >
                                                                            {reward.rewardType}
                                                                        </Badge>
                                                                        <Badge 
                                                                            variant="secondary" 
                                                                            className="text-xs bg-gray-100 text-gray-700 font-medium border border-gray-200"
                                                                        >
                                                                            {reward.rewardTarget}
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
                                    {errors.rewardIds && (
                                        <p className="text-sm text-red-500 flex items-center gap-1">
                                            <X className="h-3 w-3" />
                                            {errors.rewardIds}
                                        </p>
                                    )}
                                    {(formData.rewardIds && formData.rewardIds.length > 0) && (
                                        <p className="text-xs text-muted-foreground">
                                            Đã chọn {formData.rewardIds.length} phần thưởng
                                        </p>
                                    )}
                                </div>

                                {/* Phiên bản */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-primary" />
                                        Phiên bản *
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
                                                Xuất bản ngay
                                            </label>
                                            <p className="text-xs text-muted-foreground">
                                                Bài học sẽ được hiển thị cho người dùng ngay lập tức
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
                            disabled={createLessonMutation.isPending}
                        >
                            <Save className="h-4 w-4 mr-2" />
                            {createLessonMutation.isPending ? t('common.loading') : t('createLesson.saveDraft')}
                        </Button>
                        <Button
                            className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70 h-10 px-6 shadow-lg"
                            onClick={() => handleSubmit(true)}
                            disabled={createLessonMutation.isPending}
                        >
                            <Send className="h-4 w-4 mr-2" />
                            {createLessonMutation.isPending ? t('createLesson.publishing') : t('createLesson.publish')}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </>
    )
}

export default CreateLesson