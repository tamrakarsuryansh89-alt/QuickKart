import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach } from "vitest";

// every test starts with a clean browser storage
beforeEach(() => localStorage.clear());
afterEach(() => localStorage.clear());