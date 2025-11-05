import { Button } from "@ui/Button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@ui/Dialog"
import { Input } from "@ui/Input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@ui/Select"
import { useState } from "react"
import { useCreateUser } from "@hooks/useUser"
import { ICreateUserRequest } from "@models/user/request"
import { useTranslation } from "react-i18next"

interface AddUserModalProps {
    isAddDialogOpen: boolean;
    setIsAddDialogOpen: (value: boolean) => void;
}

const AddUserModal = ({ isAddDialogOpen, setIsAddDialogOpen }: AddUserModalProps) => {
    const { t } = useTranslation()

    /**
     * Handle Create User
     */
    const createMutation = useCreateUser()

    const [name, setName] = useState<string>("")
    const [email, setEmail] = useState<string>("")
    const [password, setPassword] = useState<string>("")
    const [roleId, setRoleId] = useState<number>(0)

    const handleSubmit = async () => {
        if (!name.trim() || !email.trim() || !roleId) {
            return
        }

        const data: ICreateUserRequest = {
            name: name.trim(),
            email: email.trim(),
            password: password.trim() || undefined,
            roleId,
        }

        try {
            await createMutation.mutateAsync(data)
            setIsAddDialogOpen(false)
            // Reset form
            setName("")
            setEmail("")
            setPassword("")
            setRoleId(0)
        } catch (error) {
            console.error('Error creating user:', error)
        }
    }

    const handleClose = () => {
        setIsAddDialogOpen(false)
        // Reset form when closing
        setName("")
        setEmail("")
        setPassword("")
        setRoleId(0)
    }
    //------------------------End------------------------//

    return (
        <Dialog open={isAddDialogOpen} onOpenChange={handleClose}>
            <DialogContent className="bg-white border-border">
                <DialogHeader>
                    <DialogTitle className="text-foreground">{t('users.addUserModal.title')}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">{t('users.addUserModal.fullName')}</label>
                        <Input
                            placeholder={t('users.addUserModal.fullNamePlaceholder')}
                            className="bg-background border-border text-foreground"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">{t('users.addUserModal.email')}</label>
                        <Input
                            type="email"
                            placeholder={t('users.addUserModal.emailPlaceholder')}
                            className="bg-background border-border text-foreground"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">{t('users.addUserModal.role')}</label>
                        <Select
                            value={roleId ? String(roleId) : ""}
                            onValueChange={(value) => setRoleId(parseInt(value) || 0)}
                        >
                            <SelectTrigger className="bg-background border-border text-foreground">
                                <SelectValue placeholder={t('users.addUserModal.selectRole')} />
                            </SelectTrigger>
                            <SelectContent className="bg-card border-border">
                                <SelectItem value="1">{t('users.addUserModal.roles.admin')}</SelectItem>
                                <SelectItem value="2">{t('users.addUserModal.roles.instructor')}</SelectItem>
                                <SelectItem value="3">{t('users.addUserModal.roles.student')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">{t('users.addUserModal.password')}</label>
                        <Input
                            type="password"
                            placeholder={t('users.addUserModal.passwordPlaceholder')}
                            className="bg-background border-border text-foreground"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">{t('users.addUserModal.passwordHint')}</p>
                    </div>
                </div>
                <div className="flex justify-end gap-3">
                    <Button
                        variant="outline"
                        onClick={handleClose}
                        className="border-border text-foreground"
                        disabled={createMutation.isPending}
                    >
                        {t('common.cancel')}
                    </Button>
                    <Button
                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                        onClick={handleSubmit}
                        disabled={createMutation.isPending || !name.trim() || !email.trim() || !roleId}
                    >
                        {createMutation.isPending ? t('users.addUserModal.creating') : t('users.addUserModal.add')}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default AddUserModal