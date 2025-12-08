import { useForm, Controller } from 'react-hook-form';
import { Button } from '@ui/Button';
import { Input } from '@ui/Input';
import { ILoginFormDataRequest } from '@models/user/request';
import authService from '@services/auth';
import { toast } from 'react-toastify';
import { useState } from 'react';
import { CookiesService } from '@utils/cookies';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@constants/route';
import { decodeJWT } from '@utils/token';
import { COOKIES, ROLE_ID, ROLE } from '@constants/common';
import { useDispatch } from 'react-redux';
import { setAuthState } from '@redux/features/auth/slice';

const LoginPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    /**
     * Handle form
     */
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<ILoginFormDataRequest>({
        defaultValues: {
            email: '',
            password: '',
        },
    });

    const mapRoleIdToRole = (roleId?: number | null) => {
        switch (roleId) {
            case ROLE_ID.ADMIN:
                return ROLE.ADMIN;
            case ROLE_ID.MANAGER:
                return ROLE.MANAGER;
            default:
                return null;
        }
    };

    const onSubmit = async (data: ILoginFormDataRequest) => {
        try {
            setIsLoading(true);
            const res = await authService.login(data);
            CookiesService.set(COOKIES.ACCESS_TOKEN, res.data.data.accessToken);
            const decodeToken = decodeJWT();
            console.log('decodeToken', decodeToken);
            const mappedRole = mapRoleIdToRole((decodeToken as any)?.roleId);
            const decodedUserId = (decodeToken as any)?.userId ?? ((decodeToken as any)?.sub ? Number((decodeToken as any)?.sub) : null);

            dispatch(
                setAuthState({
                    username: (decodeToken as any)?.username ?? null,
                    userId: decodedUserId ?? null,
                    userRole: mappedRole,
                }),
            );

            if (!mappedRole) {
                toast.error('Đăng nhập thất bại');
                return;
            }

            toast.success('Đăng nhập thành công');
            navigate(mappedRole === ROLE.ADMIN ? ROUTES.ADMIN.ROOT : ROUTES.MANAGER.ROOT);
        } catch (error) {
            console.log(error);
            toast.error('Đăng nhập thất bại');
        } finally {
            setIsLoading(false);
        }
    };
    //-------------------------------End-------------------------------//

    return (
        <>
            <div className="text-center">
                <h1 className="text-3xl font-bold text-secondary">Đăng nhập</h1>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                <Controller
                    name="email"
                    control={control}
                    rules={{
                        required: 'Email là bắt buộc',
                        pattern: {
                            value: /^\S+@\S+$/i,
                            message: 'Email không hợp lệ',
                        },
                    }}
                    render={({ field }) => (
                        <Input
                            {...field}
                            label="Email"
                            id="email"
                            placeholder="Nhập email của bạn"
                            error={errors.email?.message}
                            variant="original"
                        />
                    )}
                />

                <Controller
                    name="password"
                    control={control}
                    rules={{
                        required: 'Mật khẩu là bắt buộc',
                        minLength: {
                            value: 6,
                            message: 'Mật khẩu phải có ít nhất 6 ký tự',
                        },
                    }}
                    render={({ field }) => (
                        <Input
                            {...field}
                            label="Mật khẩu"
                            id="password"
                            placeholder="Nhập mật khẩu của bạn"
                            isPassword
                            error={errors.password?.message}
                            variant="original"
                        />
                    )}
                />

                <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full px-4 py-3 font-bold text-white bg-secondary rounded-lg hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary"
                >
                    Đăng nhập
                </Button>
            </form>

            {/* <div className="flex items-center justify-between text-sm">
                <Link
                    to={ROUTES.AUTH.FORGOT_PASSWORD}
                    className="font-medium text-tertiary hover:underline"
                >
                    Quên mật khẩu?
                </Link>
                <div className="flex items-center">
                    <span className="text-gray-500">Chưa có tài khoản?</span>
                    <Link
                        to={ROUTES.AUTH.REGISTER}
                        className="ml-1 font-medium text-tertiary hover:underline"
                    >
                        Đăng ký
                    </Link>
                </div>
            </div> */}
        </>
    );
};

export default LoginPage;
