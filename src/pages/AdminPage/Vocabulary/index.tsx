import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@ui/Card";
import { Badge } from "@ui/Badge";
import { Skeleton } from "@ui/Skeleton";
import { Languages, BookText } from "lucide-react";
import HeaderAdmin from "@organisms/Header/Admin";
import { Switch } from "@ui/Switch";
import KanjiVocabulary from "./components/Kanji";
import ListVocabulary from "./components/ListVocabulary";
import { useVocabularyStatistics } from "@hooks/useVocabulary";
import { useTranslation } from "react-i18next";

const VocabularyManagement = () => {
    const { t } = useTranslation();
    const [isAddVocabularyDialogOpen, setIsAddVocabularyDialogOpen] = useState<boolean>(false);
    const [isAddKanjiDialogOpen, setIsAddKanjiDialogOpen] = useState<boolean>(false);
    const [showKanji, setShowKanji] = useState<boolean>(false);

    const { data: stats, isLoading, error } = useVocabularyStatistics();

    if (isLoading) {
        return (
            <>
                <HeaderAdmin title={t('vocabulary.title')} description={t('vocabulary.description')} />
                <div className="p-8 mt-24">
                    {/* Stats section: show real titles/icons, skeleton only for numbers */}
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
                        <Card className="relative overflow-hidden bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20 shadow-lg">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full -mr-16 -mt-16" />
                            <CardHeader className="pb-3 relative">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-sm font-semibold text-foreground/90">{t('vocabulary.totalVocabulary')}</CardTitle>
                                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                                        <Languages className="w-5 h-5" />
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="relative">
                                <Skeleton className="h-10 w-20 mb-2" />
                                <div className="h-1 w-16 bg-gradient-to-r from-transparent via-current to-transparent opacity-20 mt-2" />
                            </CardContent>
                        </Card>
                        <Card className="relative overflow-hidden bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20 shadow-lg">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full -mr-16 -mt-16" />
                            <CardHeader className="pb-3 relative">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-sm font-semibold text-foreground/90">{t('vocabulary.totalKanji')}</CardTitle>
                                    <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
                                        <BookText className="w-5 h-5" />
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="relative">
                                <Skeleton className="h-10 w-20 mb-2" />
                                <div className="h-1 w-16 bg-gradient-to-r from-transparent via-current to-transparent opacity-20 mt-2" />
                            </CardContent>
                        </Card>
                        <Card className="relative overflow-hidden bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20 shadow-lg">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full -mr-16 -mt-16" />
                            <CardHeader className="pb-3 relative">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-sm font-semibold text-foreground/90">{t('vocabulary.vocabularyN5')}</CardTitle>
                                    <Badge className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-600 border-green-500/30 shadow-sm font-medium">N5</Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="relative">
                                <Skeleton className="h-10 w-20 mb-2" />
                                <div className="h-1 w-16 bg-gradient-to-r from-transparent via-current to-transparent opacity-20 mt-2" />
                            </CardContent>
                        </Card>
                        <Card className="relative overflow-hidden bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border-blue-500/20 shadow-lg">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full -mr-16 -mt-16" />
                            <CardHeader className="pb-3 relative">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-sm font-semibold text-foreground/90">{t('vocabulary.vocabularyN4')}</CardTitle>
                                    <Badge className="bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-blue-600 border-blue-500/30 shadow-sm font-medium">N4</Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="relative">
                                <Skeleton className="h-10 w-20 mb-2" />
                                <div className="h-1 w-16 bg-gradient-to-r from-transparent via-current to-transparent opacity-20 mt-2" />
                            </CardContent>
                        </Card>
                        <Card className="relative overflow-hidden bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border-yellow-500/20 shadow-lg">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full -mr-16 -mt-16" />
                            <CardHeader className="pb-3 relative">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-sm font-semibold text-foreground/90">{t('vocabulary.vocabularyN3')}</CardTitle>
                                    <Badge className="bg-gradient-to-r from-yellow-500/20 to-amber-500/20 text-yellow-600 border-yellow-500/30 shadow-sm font-medium">N3</Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="relative">
                                <Skeleton className="h-10 w-20 mb-2" />
                                <div className="h-1 w-16 bg-gradient-to-r from-transparent via-current to-transparent opacity-20 mt-2" />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Toggle: show real icons and switch, no skeleton */}
                    <Card className="bg-gradient-to-br from-card via-card to-card/95 border-border shadow-md">
                        <CardContent className="pt-6 pb-6">
                            <div className="flex items-center justify-center space-x-4 p-3 bg-muted/20 rounded-full shadow-sm w-fit mx-auto">
                                <Languages className={`w-6 h-6 transition-colors ${!showKanji ? 'text-primary' : 'text-muted-foreground'}`} />
                                <Switch checked={showKanji} onCheckedChange={setShowKanji} />
                                <BookText className={`w-6 h-6 transition-colors ${showKanji ? 'text-primary' : 'text-muted-foreground'}`} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Content: render actual components; they handle their own loading/skeletons */}
                    {showKanji ? (
                        <KanjiVocabulary
                            isAddKanjiDialogOpen={isAddKanjiDialogOpen}
                            setIsAddKanjiDialogOpen={setIsAddKanjiDialogOpen}
                        />
                    ) : (
                        <ListVocabulary
                            isAddVocabularyDialogOpen={isAddVocabularyDialogOpen}
                            setIsAddVocabularyDialogOpen={setIsAddVocabularyDialogOpen}
                        />
                    )}
                </div>
            </>
        );
    }

    if (error) {
        return <div className="text-red-500">Error: {error.message}</div>;
    }

    return (
        <>
            <HeaderAdmin title={t('vocabulary.title')} description={t('vocabulary.description')} />
            <div className="p-8 mt-24 space-y-8">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
                    <Card className="relative overflow-hidden bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full -mr-16 -mt-16" />
                        <CardHeader className="pb-3 relative">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-semibold text-foreground/90">{t('vocabulary.totalVocabulary')}</CardTitle>
                                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                                    <Languages className="w-5 h-5" />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="relative">
                            <div className="text-4xl font-bold text-foreground mb-1">{stats.totalVocabulary}</div>
                            <div className="h-1 w-16 bg-gradient-to-r from-transparent via-current to-transparent opacity-20 mt-2" />
                        </CardContent>
                    </Card>
                    <Card className="relative overflow-hidden bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full -mr-16 -mt-16" />
                        <CardHeader className="pb-3 relative">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-semibold text-foreground/90">{t('vocabulary.totalKanji')}</CardTitle>
                                <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
                                    <BookText className="w-5 h-5" />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="relative">
                            <div className="text-4xl font-bold text-foreground mb-1">{stats.totalKanji}</div>
                            <div className="h-1 w-16 bg-gradient-to-r from-transparent via-current to-transparent opacity-20 mt-2" />
                        </CardContent>
                    </Card>
                    <Card className="relative overflow-hidden bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full -mr-16 -mt-16" />
                        <CardHeader className="pb-3 relative">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-semibold text-foreground/90">{t('vocabulary.vocabularyN5')}</CardTitle>
                                <Badge className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-600 border-green-500/30 shadow-sm font-medium">N5</Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="relative">
                            <div className="text-4xl font-bold text-foreground mb-1">{stats.vocabularyN5}</div>
                            <div className="h-1 w-16 bg-gradient-to-r from-transparent via-current to-transparent opacity-20 mt-2" />
                        </CardContent>
                    </Card>
                    <Card className="relative overflow-hidden bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border-blue-500/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full -mr-16 -mt-16" />
                        <CardHeader className="pb-3 relative">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-semibold text-foreground/90">{t('vocabulary.vocabularyN4')}</CardTitle>
                                <Badge className="bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-blue-600 border-blue-500/30 shadow-sm font-medium">N4</Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="relative">
                            <div className="text-4xl font-bold text-foreground mb-1">{stats.vocabularyN4}</div>
                            <div className="h-1 w-16 bg-gradient-to-r from-transparent via-current to-transparent opacity-20 mt-2" />
                        </CardContent>
                    </Card>
                    <Card className="relative overflow-hidden bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border-yellow-500/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full -mr-16 -mt-16" />
                        <CardHeader className="pb-3 relative">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-semibold text-foreground/90">{t('vocabulary.vocabularyN3')}</CardTitle>
                                <Badge className="bg-gradient-to-r from-yellow-500/20 to-amber-500/20 text-yellow-600 border-yellow-500/30 shadow-sm font-medium">N3</Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="relative">
                            <div className="text-4xl font-bold text-foreground mb-1">{stats.vocabularyN3}</div>
                            <div className="h-1 w-16 bg-gradient-to-r from-transparent via-current to-transparent opacity-20 mt-2" />
                        </CardContent>
                    </Card>
                </div>

                <Card className="bg-gradient-to-br from-card via-card to-card/95 border-border shadow-md">
                    <CardContent className="pt-6 pb-6">
                        <div className="flex items-center justify-center space-x-4 p-3 bg-muted/20 rounded-full shadow-sm w-fit mx-auto">
                            <Languages className={`w-6 h-6 transition-colors ${!showKanji ? 'text-primary' : 'text-muted-foreground'}`} />
                            <Switch checked={showKanji} onCheckedChange={setShowKanji} />
                            <BookText className={`w-6 h-6 transition-colors ${showKanji ? 'text-primary' : 'text-muted-foreground'}`} />
                        </div>
                    </CardContent>
                </Card>
                {showKanji ? (
                    <KanjiVocabulary
                        isAddKanjiDialogOpen={isAddKanjiDialogOpen}
                        setIsAddKanjiDialogOpen={setIsAddKanjiDialogOpen}
                    />
                ) : (
                    <ListVocabulary
                        isAddVocabularyDialogOpen={isAddVocabularyDialogOpen}
                        setIsAddVocabularyDialogOpen={setIsAddVocabularyDialogOpen}
                    />
                )}
            </div>
        </>
    );
};

export default VocabularyManagement;