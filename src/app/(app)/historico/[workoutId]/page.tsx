import { notFound, redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/db/client";
import { workouts, routines, sets, cardioSessions, exercises } from "@/db/schema";
import { formatDateBR } from "@/lib/date";
import { getAllTimePersonalRecords } from "@/lib/personal-records";
import { Card } from "@/design-system/components/Card";

const FEELING_EMOJI: Record<number, string> = { 1: "😩", 2: "🙁", 3: "😐", 4: "🙂", 5: "😄" };

export default async function WorkoutDetailPage({
  params,
}: {
  params: Promise<{ workoutId: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { workoutId } = await params;

  const [workout] = await db
    .select()
    .from(workouts)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, user.id)))
    .limit(1);
  if (!workout) notFound();
  if (workout.durationMinutes == null) redirect(`/treino/${workoutId}`);

  const routine = workout.routineId
    ? (await db.select().from(routines).where(eq(routines.id, workout.routineId)).limit(1))[0]
    : undefined;

  const loggedSets = await db
    .select({
      exerciseId: sets.exerciseId,
      exerciseName: exercises.name,
      setNumber: sets.setNumber,
      reps: sets.reps,
      weightKg: sets.weightKg,
    })
    .from(sets)
    .innerJoin(exercises, eq(sets.exerciseId, exercises.id))
    .where(eq(sets.workoutId, workoutId))
    .orderBy(exercises.name, sets.setNumber);

  const cardio = await db
    .select({
      exerciseName: exercises.name,
      durationSeconds: cardioSessions.durationSeconds,
      distanceMeters: cardioSessions.distanceMeters,
      inclinePercent: cardioSessions.inclinePercent,
    })
    .from(cardioSessions)
    .innerJoin(exercises, eq(cardioSessions.exerciseId, exercises.id))
    .where(eq(cardioSessions.workoutId, workoutId));

  const allTimeRecords = await getAllTimePersonalRecords(user.id);
  const recordsToday = new Set(
    allTimeRecords.filter((r) => r.date === workout.date).map((r) => `${r.exerciseId}:${r.metric}`),
  );

  const exerciseGroups = Object.values(
    loggedSets.reduce<Record<string, { exerciseId: string; exerciseName: string; sets: typeof loggedSets }>>(
      (acc, s) => {
        acc[s.exerciseId] ??= { exerciseId: s.exerciseId, exerciseName: s.exerciseName, sets: [] };
        acc[s.exerciseId].sets.push(s);
        return acc;
      },
      {},
    ),
  );

  const totalVolume = loggedSets.reduce((sum, s) => sum + Number(s.weightKg) * s.reps, 0);

  return (
    <div className="flex flex-1 flex-col gap-4 px-4 pt-6">
      <div>
        <p className="text-sm text-text-secondary">{formatDateBR(workout.date)}</p>
        <h1 className="text-2xl font-bold text-text">{routine?.name ?? "Treino livre"}</h1>
        <p className="text-sm text-text-secondary">
          {workout.durationMinutes} min · {Math.round(totalVolume)} kg de volume
          {workout.feeling && ` · ${FEELING_EMOJI[workout.feeling]}`}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {exerciseGroups.map((group) => (
          <Card key={group.exerciseId}>
            <p className="mb-2 font-semibold text-text">
              {group.exerciseName}
              {recordsToday.has(`${group.exerciseId}:max_weight`) && (
                <span className="ml-2 text-sm text-accent">🏆 recorde</span>
              )}
            </p>
            <div className="flex flex-col gap-1">
              {group.sets.map((s) => (
                <div key={s.setNumber} className="flex justify-between text-sm text-text-secondary">
                  <span>Série {s.setNumber}</span>
                  <span>
                    {s.reps} reps × {s.weightKg} kg
                  </span>
                </div>
              ))}
            </div>
          </Card>
        ))}

        {cardio.map((c, i) => (
          <Card key={i}>
            <p className="font-semibold text-text">{c.exerciseName}</p>
            <p className="text-sm text-text-secondary">
              {Math.round(c.durationSeconds / 60)} min
              {c.distanceMeters && ` · ${(Number(c.distanceMeters) / 1000).toFixed(1)} km`}
              {c.inclinePercent && ` · ${c.inclinePercent}% inclinação`}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
