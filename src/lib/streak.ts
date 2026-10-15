import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { streakState, trainingSchedule, workouts } from "@/db/schema";
import { addDays, startOfWeek, toISODate, weekdayOf, type Weekday } from "@/lib/date";

export type StreakSummary = {
  currentStreak: number;
  longestStreak: number;
  protectorsAvailable: number;
};

// "covered": scheduled day that was missed but made up by an off-schedule workout the same week.
export type DayStatus = "done" | "bonus" | "covered" | "pending" | "missed" | "off-schedule";

export type WeekDayInfo = {
  date: string;
  weekday: Weekday;
  status: DayStatus;
};

async function getSchedule(userId: string): Promise<Set<Weekday>> {
  const rows = await db
    .select({ weekday: trainingSchedule.weekday })
    .from(trainingSchedule)
    .where(eq(trainingSchedule.userId, userId));
  return new Set(rows.map((r) => r.weekday));
}

async function getWorkoutDates(userId: string): Promise<string[]> {
  const rows = await db
    .selectDistinct({ date: workouts.date })
    .from(workouts)
    .where(eq(workouts.userId, userId));
  return rows.map((r) => r.date).sort();
}

/**
 * Brings streak_state up to date through the last fully-closed Mon-Sun week
 * (the week containing "today" is always left open, since bonus workouts
 * later in that week can still retroactively cover an earlier miss). Safe to
 * call on every page load / after logging a workout — closed weeks are never
 * re-processed twice because lastValidDate always advances past them.
 */
export async function reconcileStreak(userId: string): Promise<StreakSummary> {
  const [existing] = await db
    .select()
    .from(streakState)
    .where(eq(streakState.userId, userId))
    .limit(1);

  const state = existing ?? {
    userId,
    currentStreak: 0,
    longestStreak: 0,
    lastValidDate: null as string | null,
    streakProtectorsAvailable: 0,
    weeksTowardProtector: 0,
  };

  const schedule = await getSchedule(userId);
  const workoutDates = await getWorkoutDates(userId);
  const workoutDateSet = new Set(workoutDates);

  const today = toISODate();
  const currentWeekStart = startOfWeek(today);

  let nextWeekStart: string;
  if (state.lastValidDate) {
    nextWeekStart = addDays(startOfWeek(state.lastValidDate), 7);
  } else if (workoutDates.length > 0) {
    nextWeekStart = startOfWeek(workoutDates[0]);
  } else {
    // Nothing trained yet, nothing to reconcile.
    if (!existing) await db.insert(streakState).values(state).onConflictDoNothing();
    return {
      currentStreak: state.currentStreak,
      longestStreak: state.longestStreak,
      protectorsAvailable: state.streakProtectorsAvailable,
    };
  }

  let { currentStreak, longestStreak, streakProtectorsAvailable, weeksTowardProtector } = state;
  let lastValidDate = state.lastValidDate;

  while (nextWeekStart < currentWeekStart) {
    const weekDates = Array.from({ length: 7 }, (_, i) => addDays(nextWeekStart, i));
    const scheduledDaysInWeek = weekDates.filter((d) => schedule.has(weekdayOf(d)));

    if (scheduledDaysInWeek.length > 0) {
      const missedScheduled = scheduledDaysInWeek.filter((d) => !workoutDateSet.has(d));
      const coveredDirect = new Set(scheduledDaysInWeek.filter((d) => workoutDateSet.has(d)));
      const bonusWorkoutDates = weekDates.filter(
        (d) => workoutDateSet.has(d) && !scheduledDaysInWeek.includes(d),
      );

      const coveredByBonus = new Set(missedScheduled.slice(0, bonusWorkoutDates.length));
      const stillMissed = missedScheduled.slice(bonusWorkoutDates.length);
      const stillMissedSet = new Set(stillMissed);

      let weekWasClean = true;

      for (const d of scheduledDaysInWeek) {
        if (coveredDirect.has(d) || coveredByBonus.has(d)) {
          currentStreak += 1;
        } else if (stillMissedSet.has(d)) {
          if (streakProtectorsAvailable > 0) {
            streakProtectorsAvailable -= 1;
            currentStreak += 1;
          } else {
            currentStreak = 0;
          }
          weekWasClean = false;
        }
        longestStreak = Math.max(longestStreak, currentStreak);
      }

      if (weekWasClean) {
        weeksTowardProtector += 1;
        if (weeksTowardProtector >= 2) {
          streakProtectorsAvailable = Math.min(2, streakProtectorsAvailable + 1);
          weeksTowardProtector = 0;
        }
      } else {
        weeksTowardProtector = 0;
      }
    }

    lastValidDate = weekDates[6];
    nextWeekStart = addDays(nextWeekStart, 7);
  }

  const next = {
    userId,
    currentStreak,
    longestStreak,
    lastValidDate,
    streakProtectorsAvailable,
    weeksTowardProtector,
  };

  await db
    .insert(streakState)
    .values(next)
    .onConflictDoUpdate({ target: streakState.userId, set: next });

  return {
    currentStreak: next.currentStreak,
    longestStreak: next.longestStreak,
    protectorsAvailable: next.streakProtectorsAvailable,
  };
}

/**
 * Live (unpersisted) status for the Mon-Sun week containing today, including
 * bonus-day makeup logic — safe to compute fresh on every render since the
 * week hasn't closed yet.
 */
export async function getCurrentWeekStatus(userId: string): Promise<{
  days: WeekDayInfo[];
  scheduledCount: number;
  doneCount: number;
}> {
  const schedule = await getSchedule(userId);
  const workoutDates = await getWorkoutDates(userId);
  const workoutDateSet = new Set(workoutDates);

  const today = toISODate();
  const weekStart = startOfWeek(today);
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const scheduledDaysInWeek = weekDates.filter((d) => schedule.has(weekdayOf(d)));

  const missedScheduled = scheduledDaysInWeek.filter((d) => !workoutDateSet.has(d) && d < today);
  const bonusWorkoutDates = weekDates.filter(
    (d) => workoutDateSet.has(d) && !scheduledDaysInWeek.includes(d),
  );
  const coveredByBonus = new Set(missedScheduled.slice(0, bonusWorkoutDates.length));

  const days: WeekDayInfo[] = weekDates.map((d) => {
    const weekday = weekdayOf(d);
    const isScheduled = schedule.has(weekday);

    let status: DayStatus;
    if (!isScheduled) {
      status = workoutDateSet.has(d) ? "bonus" : "off-schedule";
    } else if (workoutDateSet.has(d)) {
      status = "done";
    } else if (coveredByBonus.has(d)) {
      status = "covered";
    } else if (d < today) {
      status = "missed";
    } else {
      status = "pending";
    }

    return { date: d, weekday, status };
  });

  const doneCount = days.filter((d) => d.status === "done" || d.status === "covered").length;

  return { days, scheduledCount: scheduledDaysInWeek.length, doneCount };
}

export async function getStreakSummary(userId: string): Promise<StreakSummary> {
  return reconcileStreak(userId);
}
