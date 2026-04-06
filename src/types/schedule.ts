export interface ScheduledWorkout {
  scheduleId: string;
  userId: string;
  planId: string;
  planTitle: string;
  scheduledDate: string;
  scheduledTime: string | null;
  completed: boolean;
  sessionId: string | null;
  createdAt: string;
}
