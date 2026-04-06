export interface ApiError {
  code: string;
  message: string;
}

export interface WaterLog {
  logId: string;
  userId: string;
  date: string;
  glasses: number;
  updatedAt: string;
}
