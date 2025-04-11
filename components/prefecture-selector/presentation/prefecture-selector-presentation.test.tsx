import { composeStories } from "@storybook/react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
	type OnUrlUpdateFunction,
	withNuqsTestingAdapter,
} from "nuqs/adapters/testing";
import { describe, expect, it, vi } from "vitest";
import {
	groupPrefecturesByRegion,
	regionMapping,
} from "../lib/group-prefectures-by-region";
import * as stories from "./prefecture-selector-presentation.stories";

const { WithData } = composeStories(stories);
const mockPrefectures = WithData.args.prefectures ?? [];

describe("表示の確認", () => {
	it("トップレベルの「すべて選択」ボタンと「選択をクリア」ボタンが表示される", () => {
		// Arrange, Act
		render(<WithData />, {
			wrapper: withNuqsTestingAdapter(),
		});
		// Assert
		const selectAllButton = screen.getByRole("button", {
			name: /47都道府県をすべて選択/,
		});
		const clearButton = screen.getByRole("button", { name: "選択をクリア" });
		expect(selectAllButton).toBeInTheDocument();
		expect(clearButton).toBeInTheDocument();
	});

	it("地域名の見出し（h3）がすべて表示される", () => {
		// Arrange, Act
		render(<WithData />, {
			wrapper: withNuqsTestingAdapter(),
		});
		// Assert
		const expectedRegions = groupPrefecturesByRegion(mockPrefectures).map(
			(g) => g.region,
		);
		for (const regionName of expectedRegions) {
			expect(
				screen.getByRole("heading", { level: 3, name: regionName }),
			).toBeInTheDocument();
		}
		const regionHeadings = screen.getAllByRole("heading", { level: 3 });
		expect(regionHeadings).toHaveLength(expectedRegions.length);
	});

	it("都道府県ボタンが合計 47 個表示される", () => {
		// Arrange, Act
		render(<WithData />, {
			wrapper: withNuqsTestingAdapter(),
		});
		// Assert
		// すべて選択、選択をクリアの文言を除外してボタンをフィルタリング
		const prefectureButtons = screen.getAllByRole("button", {
			name: /^(?!.*(すべて選択|選択をクリア)).*$/,
		});
		expect(prefectureButtons).toHaveLength(47);
	});

	it("初期状態で、URLクリパラメータと都道府県ボタンの選択状態が同期されている", async () => {
		// Arrange, Act
		render(<WithData />, {
			wrapper: withNuqsTestingAdapter({
				searchParams: "?prefCodes=1",
			}),
		});
		// Assert
		const button = screen.getByRole("button", { name: /^北海道$/ });
		expect(button).toHaveAttribute("aria-pressed", "true");
	});
});

describe("インタラクションの確認", () => {
	it("都道府県ボタンをクリックすると、URL のクエリパラメータに都道府県コードが追加される", async () => {
		// Arrange
		const user = userEvent.setup();
		const onUrlUpdate = vi.fn<OnUrlUpdateFunction>();
		render(<WithData />, {
			wrapper: withNuqsTestingAdapter({ onUrlUpdate }),
		});
		const button = screen.getByRole("button", { name: /^北海道$/ });
		// Act
		await user.click(button);
		// Assert
		expect(onUrlUpdate).toHaveBeenCalledOnce();
		const event = onUrlUpdate.mock.calls[0][0];
		expect(event.searchParams.get("prefCodes")).toBe("1");
		expect(event.options.history).toBe("replace");
		expect(event.options.shallow).toBe(false);
	});

	it("選択済みの都道府県ボタンをクリックすると、URL のクエリパラメータから都道府県コードが削除される", async () => {
		// Arrange
		const user = userEvent.setup();
		const onUrlUpdate = vi.fn<OnUrlUpdateFunction>();
		render(<WithData />, {
			wrapper: withNuqsTestingAdapter({
				searchParams: "?prefCodes=1",
				onUrlUpdate,
			}),
		});
		const button = screen.getByRole("button", { name: /^北海道$/ });
		// Act
		await user.click(button);
		// Assert
		expect(onUrlUpdate).toHaveBeenCalledOnce();
		const event = onUrlUpdate.mock.calls[0][0];
		expect(event.queryString).toBe("");
		expect(event.searchParams.get("prefCodes")).toBe(null);
		expect(event.options.history).toBe("replace");
		expect(event.options.shallow).toBe(false);
	});

	it("すでにパラメータが存在する場合に別の都道府県ボタンをクリックすると、元のパラメータを維持したまま新たな都道府県コードが追加される", async () => {
		// Arrange
		const user = userEvent.setup();
		const onUrlUpdate = vi.fn<OnUrlUpdateFunction>();
		const initialCodes = [1, 2];
		const expectedCodesAfterClick = [1, 2, 47];
		render(<WithData />, {
			wrapper: withNuqsTestingAdapter({
				searchParams: `?prefCodes=${initialCodes.join(",")}`,
				onUrlUpdate,
			}),
		});
		const button = screen.getByRole("button", { name: /^沖縄県$/ });
		// Act
		await user.click(button);
		// Assert
		expect(onUrlUpdate).toHaveBeenCalledOnce();
		const event = onUrlUpdate.mock.calls[0][0];
		const updatedCodes =
			event.searchParams.get("prefCodes")?.split(",").map(Number) ?? [];
		expect(updatedCodes).toEqual(
			expect.arrayContaining(expectedCodesAfterClick),
		);
		expect(updatedCodes).toHaveLength(expectedCodesAfterClick.length);
		expect(event.options.history).toBe("replace");
		expect(event.options.shallow).toBe(false);
	});

	it("すべて選択ボタンをクリックすると、URL のクエリパラメータにすべての都道府県コードが追加される", async () => {
		// Arrange
		const user = userEvent.setup();
		const onUrlUpdate = vi.fn<OnUrlUpdateFunction>();
		const allPrefCodes = mockPrefectures.map((pref) => pref.prefCode);
		render(<WithData />, {
			wrapper: withNuqsTestingAdapter({ onUrlUpdate }),
		});
		const button = screen.getByRole("button", {
			name: /47都道府県をすべて選択/,
		});
		// Act
		await user.click(button);
		// Assert
		expect(onUrlUpdate).toHaveBeenCalledOnce();
		const event = onUrlUpdate.mock.calls[0][0];
		const updatedCodes =
			event.searchParams.get("prefCodes")?.split(",").map(Number) ?? [];
		expect(updatedCodes).toEqual(expect.arrayContaining(allPrefCodes));
		expect(updatedCodes).toHaveLength(allPrefCodes.length);
		expect(event.options.history).toBe("replace");
		expect(event.options.shallow).toBe(false);
	});

	it("選択をクリアボタンをクリックすると、URL のクエリパラメータが空になる", async () => {
		// Arrange
		const user = userEvent.setup();
		const onUrlUpdate = vi.fn<OnUrlUpdateFunction>();
		render(<WithData />, {
			wrapper: withNuqsTestingAdapter({
				searchParams: "?prefCodes=1,2,3",
				onUrlUpdate,
			}),
		});
		const button = screen.getByRole("button", { name: /選択をクリア/ });
		// Act
		await user.click(button);
		// Assert
		expect(onUrlUpdate).toHaveBeenCalledOnce();
		const event = onUrlUpdate.mock.calls[0][0];
		expect(event.queryString).toBe("");
		expect(event.searchParams.get("prefCodes")).toBe(null);
		expect(event.options.history).toBe("replace");
		expect(event.options.shallow).toBe(false);
	});

	it("地域をまとめて選択すると、URL のクエリパラメータに都道府県コード群が追加される", async () => {
		// Arrange
		const user = userEvent.setup();
		const onUrlUpdate = vi.fn<OnUrlUpdateFunction>();
		const hokkaidoTohokuCodes = regionMapping.北海道・東北;
		render(<WithData />, {
			wrapper: withNuqsTestingAdapter({ onUrlUpdate }),
		});
		const button = screen.getByRole("button", {
			name: /北海道・東北をすべて選択/,
		});
		// Act
		await user.click(button);
		// Assert
		expect(onUrlUpdate).toHaveBeenCalledOnce();
		const event = onUrlUpdate.mock.calls[0][0];
		const updatedCodes =
			event.searchParams.get("prefCodes")?.split(",").map(Number) ?? [];
		expect(updatedCodes).toEqual(expect.arrayContaining(hokkaidoTohokuCodes));
		expect(updatedCodes).toHaveLength(hokkaidoTohokuCodes.length);
	});

	it("個別の都道府県ボタンをクリックすると、aria-pressed属性がtrueに更新される", async () => {
		// Arrange
		const user = userEvent.setup();
		const onUrlUpdate = vi.fn<OnUrlUpdateFunction>();
		render(<WithData />, {
			wrapper: withNuqsTestingAdapter({ searchParams: "", onUrlUpdate }),
		});
		const button = screen.getByRole("button", { name: /^北海道$/ });
		expect(button).not.toHaveAttribute("aria-pressed", "true");
		// Act
		await user.click(button);
		// Assert
		expect(button).toHaveAttribute("aria-pressed", "true");
	});

	it("選択済み件数のテキストが、URL のクエリパラメータと同期している", async () => {
		// Arrange
		const user = userEvent.setup();
		const onUrlUpdate = vi.fn<OnUrlUpdateFunction>();
		render(<WithData />, {
			wrapper: withNuqsTestingAdapter({ onUrlUpdate }),
		});
		// 空白などを除外してテキストをチェック
		const liveRegion = screen.getByText((_content, node) => {
			if (!node || !node.textContent) return false;
			const normalizedText = node.textContent.replace(/\s+/g, "");
			return normalizedText === "選択済み:0/47";
		});
		expect(liveRegion).toHaveAttribute("aria-live", "polite");
		const button = screen.getByRole("button", { name: /^北海道$/ });
		// Act
		await user.click(button);
		// Assert
		const newLiveRegion = screen.getByText((_content, node) => {
			if (!node || !node.textContent) return false;
			const normalizedText = node.textContent.replace(/\s+/g, "");
			return normalizedText === "選択済み:1/47";
		});
		expect(newLiveRegion).toHaveAttribute("aria-live", "polite");
	});
});
