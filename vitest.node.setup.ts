import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import ResizeObserver from "resize-observer-polyfill";
import { afterEach } from "vitest";

global.ResizeObserver = ResizeObserver;

afterEach(() => {
	cleanup();
});
