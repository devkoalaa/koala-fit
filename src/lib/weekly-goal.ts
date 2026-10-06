/** "2–3" quando há teto acima da meta, senão só "2". */
export function formatWeeklyGoal(goal: number, goalMax: number | null): string {
  return goalMax != null && goalMax > goal ? `${goal}–${goalMax}` : `${goal}`;
}
