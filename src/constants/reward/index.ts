export const REWARD_TYPE = {
    LESSON: 'LESSON',
    DAILY_REQUEST: 'DAILY_REQUEST',
    EVENT: 'EVENT',
    ACHIEVEMENT: 'ACHIEVEMENT',
    LEVEL: 'LEVEL',
} as const;

export const REWARD_TARGET = {
    EXP: 'EXP',
    POKEMON: 'POKEMON',
    POKE_COINS: 'POKE_COINS',
    SPARKLES: 'SPARKLES',
} as const;

export const REWARD = {
    REWARD_TYPE,
    REWARD_TARGET,
}

export type IREWARD = typeof REWARD;