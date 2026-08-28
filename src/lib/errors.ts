export class AppError extends Error {
  public statusCode: number;
  public code?: string;

  constructor(message: string, statusCode: number = 500, code?: string) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
  }
}

export function isAppError(err: unknown): err is AppError {
  return err instanceof AppError;
}

export interface ApiSuccess<T = unknown> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: string;
  code?: string;
}

export function jsonOk<T>(data: T, init?: ResponseInit): Response {
  return new Response(JSON.stringify({ success: true, data }), {
    status: 200,
    headers: { "Content-Type": "application/json", ...init?.headers },
    ...init,
  });
}

export function jsonError(error: AppError | string, statusCode?: number): Response {
  const isErr = error instanceof AppError;
  const message = isErr ? error.message : String(error);
  const code = isErr ? error.code : undefined;
  const status = isErr ? error.statusCode : (statusCode || 500);

  return new Response(JSON.stringify({ success: false, error: message, code }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export function handleApiError(err: unknown): Response {
  if (err instanceof AppError) {
    return jsonError(err);
  }

  if (err instanceof Error) {
    console.error("[API Error]", err);
    return jsonError(new AppError("Internal server error", 500));
  }

  return jsonError(new AppError("Unknown error", 500));
}
