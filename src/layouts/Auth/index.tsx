import { COOKIES, ROLE_ID } from '@constants/common';
import { ROUTES } from '@constants/route';
import { CookiesService } from '@utils/cookies';
import { decodeJWT } from '@utils/token';
import { Outlet, useNavigate } from 'react-router-dom'
import { useEffect } from 'react';

const AuthLayout = () => {
    /**
     * Handle access token
     */
    const navigate = useNavigate();
    const accessToken = CookiesService.get(COOKIES.ACCESS_TOKEN);

    useEffect(() => {
        if (!accessToken) return;
        const decodeToken = decodeJWT();
        switch (decodeToken?.roleId) {
            case ROLE_ID.ADMIN:
                navigate(ROUTES.ADMIN.ROOT, { replace: true });
                break;
            case ROLE_ID.MANAGER:
                navigate(ROUTES.MANAGER.ROOT, { replace: true });
                break;
            default:
                break;
        }
    }, [accessToken, navigate]);
    //-----------------------End--------------------//

    return (
        <div
            className="flex items-center justify-center min-h-screen"
            style={{
                background: 'linear-gradient(to bottom right, #79B4C4, #85C3C3, #9BC7B9)',
            }}
        >
            <div className="w-full max-w-md p-8 space-y-8 bg-white bg-opacity-90 rounded-2xl shadow-lg">
                <Outlet />
            </div>
        </div>
    )
}

export default AuthLayout