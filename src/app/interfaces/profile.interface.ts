export interface Profile {
  id: number
  email: string
  firstName: string
  lastName: string
  birthDate?: string | null
  height?: number | null
  goal?: GoalKey | null
  theme: Theme
  avatarUrl?: string | null
  createdAt: string
}

export type Theme = 'dark' | 'light'

export interface ProfileForm {
  firstName: string
  lastName: string
  email: string
  birthDate: string
  height: string
  goal: GoalKey | null
}

export interface UpdateProfileDto {
  firstName?: string
  lastName?: string
  birthDate?: string | null
  height?: number | null
  goal?: GoalKey | null
}

export const GOALS = {
  loss: 'Похудение',
  maintain: 'Поддержание',
  gain: 'Набор массы',
} as const

export type GoalKey = keyof typeof GOALS
