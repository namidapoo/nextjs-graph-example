import { getPopulation } from "@/api/getPopulation";
import { getPrefectures } from "@/api/getPrefectures";
import { searchParamsCache } from "@/lib/search-params";
import type { FC } from "react";
import { GraphViewPresentation } from "../presentation/graph-view-presentation";

export const GraphView: FC = async () => {
	const searchParams = searchParamsCache.all();
	if (searchParams.prefCodes.length === 0) {
		return (
			<GraphViewPresentation
				population={[]}
				prefectures={[]}
				selectedPrefCodes={[]}
			/>
		);
	}

	// 都道府県一覧と人口データを並行して取得
	const [prefectures, population] = await Promise.all([
		// `getPrefectures`は実際にはリクエストの重複排除でキャッシュを利用するだけ
		getPrefectures(),
		Promise.all(
			searchParams.prefCodes.map((prefCode) => getPopulation(prefCode)),
		),
	]);

	return (
		<GraphViewPresentation
			population={population}
			prefectures={prefectures}
			selectedPrefCodes={searchParams.prefCodes}
		/>
	);
};
