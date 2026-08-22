import { seedData } from "./seed";
import { validateSunshineWalletData } from "./validate";

export * from "./seed";
export * from "./validate";

/** Validated once on import so every mock consumer receives a coherent graph. */
export const mockData = validateSunshineWalletData(seedData);
