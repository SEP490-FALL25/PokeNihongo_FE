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
import { ROLE_ID } from '@constants/common';

const LoginPage = () => {
    const navigate = useNavigate();

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

    const onSubmit = async (data: ILoginFormDataRequest) => {
        try {
            setIsLoading(true);
            const res = await authService.login(data);
            CookiesService.set('accessToken', res.data.data.accessToken);
            const decodeToken = decodeJWT();
            console.log('decodeToken', decodeToken);
            switch (decodeToken?.roleId) {
                case ROLE_ID.ADMIN:
                    toast.success('Đăng nhập thành công');
                    navigate(ROUTES.ADMIN.ROOT);
                    break;
                case ROLE_ID.MANAGER:
                    toast.success('Đăng nhập thành công');
                    navigate(ROUTES.MANAGER.ROOT);
                    break;
                default:
                    toast.error('Đăng nhập thất bại');
                    break;
            }
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
