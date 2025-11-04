import { Button } from "@ui/Button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@ui/Dialog"
import { Input } from "@ui/Input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@ui/Select"

interface AddUserModalProps {
    isAddDialogOpen: boolean;
    setIsAddDialogOpen: (value: boolean) => void;
}

const AddUserModal = ({ isAddDialogOpen, setIsAddDialogOpen }: AddUserModalProps) => {
    return (
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogContent className="bg-white border-border">
                <DialogHeader>
                    <DialogTitle className="text-foreground">Thêm người dùng mới</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Họ và tên</label>
                        <Input placeholder="Nhập họ và tên" className="bg-background border-border text-foreground" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Email</label>
                        <Input
                            type="email"
                            placeholder="Nhập email"
                            className="bg-background border-border text-foreground"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Vai trò</label>
                        <Select>
                            <SelectTrigger className="bg-background border-border text-foreground">
                                <SelectValue placeholder="Chọn vai trò" />
                            </SelectTrigger>
                            <SelectContent className="bg-card border-border">
                                <SelectItem value="student">Học viên</SelectItem>
                                <SelectItem value="instructor">Giảng viên</SelectItem>
                                <SelectItem value="admin">Quản trị viên</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Mật khẩu</label>
                        <Input
                            type="password"
                            placeholder="Nhập mật khẩu"
                            className="bg-background border-border text-foreground"
                        />
                    </div>
                </div>
                <div className="flex justify-end gap-3">
                    <Button
                        variant="outline"
                        onClick={() => setIsAddDialogOpen(false)}
                        className="border-border text-foreground"
                    >
                        Hủy
                    </Button>
                    <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Thêm</Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default AddUserModal