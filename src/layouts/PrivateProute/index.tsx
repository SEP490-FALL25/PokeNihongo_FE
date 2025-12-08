import { Navigate, Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ROUTES } from '@constants/route';
import { ROLE } from '@constants/common';
import LoadingPage from '@pages/LoadingPage';
import { RootState } from '@redux/store/store';
import { useEffect, useState } from 'react';
import { decodeJWT } from '@utils/token';
import { setAuthState } from '@redux/features/auth/slice';

interface PrivateRouteProps {
    allowedRoles: string[];
}

const PrivateRoute = ({ allowedRoles }: PrivateRouteProps) => {
    const dispatch = useDispatch();
    const { userId, userRole } = useSelector((state: RootState) => state.auth);
    const [hydrated, setHydrated] = useState(false);

    const mapRoleIdToRole = (roleId?: number | null) => {
        switch (roleId) {
            case 1:
                return ROLE.ADMIN;
            case 2:
                return ROLE.MANAGER;
            default:
                return null;
        }
    };

    useEffect(() => {
        if (userId && userRole) {
            setHydrated(true);
            return;
        }

        const decodedToken = decodeJWT() as any;
        if (decodedToken) {
            const mappedRole = mapRoleIdToRole(decodedToken?.roleId);
            const decodedUserId = decodedToken?.userId ?? (decodedToken?.sub ? Number(decodedToken.sub) : null);

            dispatch(
                setAuthState({
                    username: decodedToken?.username ?? null,
                    userId: decodedUserId ?? null,
                    userRole: mappedRole,
                }),
            );
        }

        setHydrated(true);
    }, [dispatch, userId, userRole]);

    const hasAccess = allowedRoles.includes(userRole ?? '');

    if (!hydrated) {
        return <LoadingPage />;
    }

    if (!hasAccess) {
        const fallbackRoute =
            userRole === ROLE.ADMIN
                ? ROUTES.ADMIN.ROOT
                : userRole === ROLE.MANAGER
                    ? ROUTES.MANAGER.ROOT
                    : ROUTES.AUTH.UNAUTHORIZED;
        return <Navigate to={fallbackRoute} replace />;
    }

    return <Outlet />;
};

export default PrivateRoute;