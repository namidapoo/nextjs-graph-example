import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(() => {
	cleanup();
});

// テストでHighchartsReactをレンダリングする際に必要なCSS.supportsをモック
if (!window.CSS || typeof window.CSS.supports !== "function") {
	Object.defineProperty(window, "CSS", {
		value: {
			supports: () => true,
		},
		writable: true,
	});
}
