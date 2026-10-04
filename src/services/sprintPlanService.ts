import { supabase } from "../lib/supabaseClient"
import type { SprintDayPlan, SprintDayTask } from "../types/sprintPlan"
import { calculateSprintDayStatus } from "../utils/calculations"

export class SprintPlanError extends Error {
  constructor(message: string, public cause?: unknown) {
    super(message)
    this.name = "SprintPlanError"
  }
}

/**
 * Fetches all 50 sprint day plans with their ordered tasks from Supabase.
 * Strictly respects Supabase as the single source of truth (no mock fallback).
 */
export async function fetchAllSprintDayPlans(): Promise<SprintDayPlan[]> {
  const { data, error } = await (supabase as any)
    .from("sprint_day_plans")
    .select("*, tasks:sprint_day_tasks(*)")
    .order("day_number", { ascending: true })

  if (error) {
    console.error("[sprintPlanService] Failed to fetch sprint day plans:", error)
    throw new SprintPlanError(`Failed to load sprint curriculum: ${error.message}`, error)
  }

  if (!data) return []

  return data.map((plan: any) => ({
    ...plan,
    tasks: (plan.tasks || []).sort((a: SprintDayTask, b: SprintDayTask) => a.task_order - b.task_order),
  }))
}

/**
 * Fetches a specific day plan (Day 1..50) with its ordered tasks.
 */
export async function fetchSprintDayPlan(dayNumber: number): Promise<SprintDayPlan | null> {
  const { data, error } = await (supabase as any)
    .from("sprint_day_plans")
    .select("*, tasks:sprint_day_tasks(*)")
    .eq("day_number", dayNumber)
    .maybeSingle()

  if (error) {
    console.error(`[sprintPlanService] Failed to fetch plan for Day ${dayNumber}:`, error)
    throw new SprintPlanError(`Failed to load Day ${dayNumber} plan: ${error.message}`, error)
  }

  if (!data) return null

  return {
    ...data,
    tasks: (data.tasks || []).sort((a: SprintDayTask, b: SprintDayTask) => a.task_order - b.task_order),
  }
}

/**
 * Resolves the active day plan dynamically based on the sprint's start_date.
 * Uses calculateSprintDayStatus without hardcoding any day.
 */
export async function fetchCurrentSprintDayPlan(startDate?: string): Promise<SprintDayPlan | null> {
  const status = calculateSprintDayStatus(startDate)
  const targetDay = status.status === "not_started" ? 1 : status.currentDay
  return fetchSprintDayPlan(targetDay)
}
