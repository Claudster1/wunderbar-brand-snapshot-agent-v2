import { z } from "zod";

/** Same rules as POST /api/snapshot — shared with transcript recovery. */
export const snapshotAnswersRecordSchema = z
  .record(z.string(), z.unknown())
  .refine(
    (obj) => {
      const meaningful = Object.values(obj).filter(
        (v) => v !== null && v !== undefined && v !== ""
      );
      return meaningful.length >= 3;
    },
    { message: "At least 3 answered questions are required to generate a report." }
  );
