import { mockPrefectures } from "@/components/prefecture-selector/mock/prefectures";
import { composeStories } from "@storybook/react";
import { render } from "@testing-library/react";
import { withNuqsTestingAdapter } from "nuqs/adapters/testing";
import { describe, it } from "vitest";
import { populationDataFactory } from "../mock/factory";
import * as stories from "./graph-view-presentation.stories";

const { WithData } = composeStories(stories);

describe("表示の確認", () => {
	it("レンダリングが成功する", () => {
		// Arrange, Act, Assert
		// Recharts内部の描画はライブラリ側の責務なので、ここではレンダリングに成功することだけ確認する
		render(
			<WithData
				selectedPrefCodes={[13]}
				prefectures={mockPrefectures}
				population={[populationDataFactory.build()]}
			/>,
			{
				wrapper: withNuqsTestingAdapter(),
			},
		);
	});
});
