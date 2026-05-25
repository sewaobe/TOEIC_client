export const createIdempotencyKey = (scope: string) =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `flashcard-${scope}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
