const AUTH = {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email',
    UNAUTHORIZED: '/auth/unauthorized',
    LOGOUT: '/auth/logout',
};

const PUBLIC = {
    HOME: '/',
}

const ADMIN = {
    ROOT: '/admin/overview',
    USERS: '/admin/users',
    LESSONS: '/admin/lessons/management',
    VOCABULARY: '/admin/vocabulary',
    ANALYTICS: '/admin/analytics',
    SETTINGS: '/admin/settings',
    PACKAGE_MANAGEMENT: '/admin/package-management',
    POKEMON_MANAGEMENT: '/admin/pokemon-management',
    TOURNAMENT_MANAGEMENT: '/admin/tournament-management',
    AI_PROMPTS_MANAGEMENT: '/admin/ai-prompts-management',
    DAILY_QUEST_MANAGEMENT: '/admin/daily-quest-management',
    REWARD_MANAGEMENT: '/admin/reward-management',
    QUESTION_BANK: '/admin/question-bank',
    TESTSET_MANAGEMENT: '/admin/testset-management',
    PERMISSION_MANAGEMENT: '/admin/permission-management',
    TEST_MANAGEMENT: '/admin/test-management',
    CONFIG_SHOP: '/admin/config-shop',
    CONFIG_SHOP_BANNER_DETAIL: '/admin/config-shop/:bannerId',
    CONFIG_GACHA: '/admin/config-gacha',
    CONFIG_GACHA_BANNER_DETAIL: '/admin/config-gacha/:bannerId',
};

const LESSONS = {
    ROOT: '/admin/lessons',
    MANAGEMENT: '/admin/lessons/management',
};

const ROLE = {
    ADMIN: "admin",
    INSTRUCTOR: "instructor",
    STUDENT: "student",
};

export const ROUTES = {
    AUTH,
    PUBLIC,
    ADMIN,
    LESSONS,
    ROLE,
};

