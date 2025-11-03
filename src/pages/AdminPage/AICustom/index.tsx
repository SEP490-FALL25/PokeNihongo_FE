import HeaderAdmin from "@organisms/Header/Admin";
import { Card, CardContent, CardHeader, CardTitle } from "@ui/Card";
import { Button } from "@ui/Button";
import { Input } from "@ui/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@ui/Select";
import { Plus, Search, Sparkles } from "lucide-react";
import CreateConfigModel from "@pages/AdminPage/AICustom/components/CreateConfigModel";
import { useState } from "react";

export default function CustomAIManagement() {
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [showCreateDialog, setShowCreateDialog] = useState<boolean>(false);

    return (
        <>
            <HeaderAdmin title="Config AI - Custom AI" description="Quản lý các cấu hình AI tuỳ chỉnh" />

            <div className="mt-24 p-8 space-y-6">
                {/* Filters Bar */}
                <Card className="bg-card border-border">
                    <CardContent className="py-4">
                        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                            <div className="flex-1 w-full sm:max-w-md relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Tìm kiếm cấu hình..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 bg-background border-border text-foreground"
                                />
                            </div>
                            <div className="flex gap-2 w-full sm:w-auto">
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-[140px] bg-background border-border text-foreground">
                                        <SelectValue placeholder="Trạng thái" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-card border-border">
                                        <SelectItem value="all">Tất cả</SelectItem>
                                        <SelectItem value="active">Hoạt động</SelectItem>
                                        <SelectItem value="inactive">Tắt</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setShowCreateDialog(true)}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Tạo cấu hình
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Empty State */}
                <Card className="bg-card border-border">
                    <CardHeader>
                        <CardTitle className="text-foreground">Danh sách Custom AI</CardTitle>
                    </CardHeader>
                    <CardContent className="py-16 text-center">
                        <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-40" />
                        <p className="text-muted-foreground">Chưa có cấu hình nào</p>
                        <p className="text-sm text-muted-foreground mt-1">Nhấn "Tạo cấu hình" để thêm mới</p>
                    </CardContent>
                </Card>
            </div>

            {/* Create Config Model Dialog */}
            <CreateConfigModel showCreateDialog={showCreateDialog} setShowCreateDialog={setShowCreateDialog} onSuccess={() => setShowCreateDialog(false)} />

        </>
    );
}


