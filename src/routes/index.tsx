import { createBrowserRouter, RouterProvider } from "react-router-dom"
import { ROUTES } from "@constants/route"
// import PrivateRoute from "../layouts/PrivateProute"
// import { ROLE } from "@constants/common"
// import PersistToken from "../layouts/PersistToken"
import LoginPage from "@pages/AuthPage/LoginPage"
import AuthLayout from "@layouts/Auth"
import AdminLayout from "@layouts/Admin"
import ManagerLayout from "@layouts/Manager"
import { lazy } from "react"
import ConfigShop from "@pages/AdminPage/ConfigShop"
import ShopBannerDetail from "@pages/AdminPage/ConfigShop/components/ShopBannerDetail"
import ConfigGacha from "@pages/AdminPage/ConfigGacha"
import GachaBannerDetail from "@pages/AdminPage/ConfigGacha/components/GachaBannerDetail"
import PersistToken from "@layouts/PersistToken"
import NotFoundPage from "@pages/NotFoundPage"
import PaymentFailed from "@pages/PaymentPage/PaymentFailed"
import PaymentSuccess from "@pages/PaymentPage/PaymentSuccess"
import LeaderboardDetail from "@pages/AdminPage/Tournaments/components/LeaderboardDetail"

const AdminDashboard = lazy(() => import("@pages/AdminPage/Dashboard"))
const PermissionManagement = lazy(() => import("@pages/AdminPage/Permission"))
const UsersManagement = lazy(() => import("@pages/AdminPage/Users"))
const LessonsManagement = lazy(() => import("@pages/AdminPage/Lesson/Management"))
const VocabularyManagement = lazy(() => import("@pages/AdminPage/Vocabulary"))
const AnalyticsDashboard = lazy(() => import("@pages/AdminPage/Analytics"))
const PackageManagement = lazy(() => import("@pages/AdminPage/PackageManagement"))
const PokemonManagement = lazy(() => import("@pages/AdminPage/Pokemon"))
const TournamentManagement = lazy(() => import("@pages/AdminPage/Tournaments"))
const AIPromptManagement = lazy(() => import("@pages/AdminPage/AIPrompts"))
const CustomAIManagement = lazy(() => import("@pages/AdminPage/AICustom"))
const CustomAIDetail = lazy(() => import("@pages/AdminPage/AICustom/components/CustomAIDetail"))
const DailyQuestManagement = lazy(() => import("@pages/AdminPage/DailyQuest"))
const RewardManagement = lazy(() => import("@pages/AdminPage/Reward"))
const QuestionBankManagement = lazy(() => import("@pages/AdminPage/QuestionBank"))
const TestSetManagement = lazy(() => import("@pages/AdminPage/TestSetManagement"))
const SpeakingTestSetManagement = lazy(() => import("@pages/AdminPage/SpeakingTestSetPage"))
const TestManagement = lazy(() => import("@pages/AdminPage/TestManagement"))
const RouterComponent = () => {
    const router = createBrowserRouter([
        //#region Auth routes
        {
            element: <AuthLayout />,
            children: [{ index: true, path: ROUTES.AUTH.LOGIN, element: <LoginPage /> }],
        },
        //#endregion

        //#region Private routes
        {
            element: <PersistToken />,
            children: [
                //Admin routes
                {
                    // element: <PrivateRoute allowedRoles={[ROLE.ADMIN]} />,
                    children: [
                        {
                            element: <AdminLayout />,
                            children: [
                                { path: ROUTES.ADMIN.ROOT, element: <AdminDashboard /> },
                                { path: ROUTES.ADMIN.USERS, element: <UsersManagement /> },
                                { path: ROUTES.ADMIN.ANALYTICS, element: <AnalyticsDashboard /> },
                                { path: ROUTES.ADMIN.PACKAGE_MANAGEMENT, element: <PackageManagement /> },
                                { path: ROUTES.ADMIN.POKEMON_MANAGEMENT, element: <PokemonManagement /> },
                                { path: ROUTES.ADMIN.TOURNAMENT_MANAGEMENT, element: <TournamentManagement /> },
                                { path: `${ROUTES.ADMIN.TOURNAMENT_MANAGEMENT}/:tournamentId`, element: <LeaderboardDetail /> },
                                { path: ROUTES.ADMIN.AI_PROMPTS_MANAGEMENT, element: <AIPromptManagement /> },
                                { path: ROUTES.ADMIN.CUSTOM_AI_MANAGEMENT, element: <CustomAIManagement /> },
                                { path: `${ROUTES.ADMIN.CUSTOM_AI_MANAGEMENT}/:configId`, element: <CustomAIDetail /> },
                                { path: ROUTES.ADMIN.CUSTOM_AI_MANAGEMENT_DETAIL, element: <CustomAIDetail /> },
                                { path: ROUTES.ADMIN.DAILY_QUEST_MANAGEMENT, element: <DailyQuestManagement /> },
                                { path: ROUTES.ADMIN.REWARD_MANAGEMENT, element: <RewardManagement /> },
                                { path: ROUTES.ADMIN.CONFIG_SHOP, element: <ConfigShop /> },
                                { path: ROUTES.ADMIN.CONFIG_SHOP_BANNER_DETAIL, element: <ShopBannerDetail /> },
                                { path: ROUTES.ADMIN.CONFIG_GACHA, element: <ConfigGacha /> },
                                { path: ROUTES.ADMIN.CONFIG_GACHA_BANNER_DETAIL, element: <GachaBannerDetail /> },
                                { path: ROUTES.ADMIN.PERMISSION_MANAGEMENT, element: <PermissionManagement /> },
                            ],
                        },
                        {
                            element: <ManagerLayout />,
                            children: [
                                { path: ROUTES.MANAGER.ROOT, element: <LessonsManagement /> },
                                { path: ROUTES.MANAGER.VOCABULARY, element: <VocabularyManagement /> },
                                { path: ROUTES.MANAGER.QUESTION_BANK, element: <QuestionBankManagement /> },
                                { path: ROUTES.MANAGER.TESTSET_MANAGEMENT, element: <TestSetManagement /> },
                                { path: ROUTES.MANAGER.TESTSET_SPEAKING_MANAGEMENT, element: <SpeakingTestSetManagement /> },
                                { path: ROUTES.MANAGER.TESTSET_SPEAKING_MANAGEMENT_EDIT, element: <SpeakingTestSetManagement /> },
                                { path: ROUTES.MANAGER.TEST_MANAGEMENT, element: <TestManagement /> },
                            ],
                        },
                    ],
                },
            ],
        },
        //#endregion

        //#region Payment routes
        {
            path: ROUTES.PAYMENT.FAILED,
            element: <PaymentFailed />,
        },
        {
            path: ROUTES.PAYMENT.SUCCESS,
            element: <PaymentSuccess />,
        },
        //#endregion

        //#region 404 route
        {
            path: '*',
            element: <NotFoundPage />,
        },
        //#endregion
    ])

    return <RouterProvider router={router} />
}

export default RouterComponent
