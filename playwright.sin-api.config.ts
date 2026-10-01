import { e2eConfig } from "./playwright.config";

// Build without API_ORIGIN: see playwright.config.ts.
export default e2eConfig("sin-api");
