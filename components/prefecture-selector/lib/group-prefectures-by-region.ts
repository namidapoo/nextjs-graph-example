import type { getPrefectures } from "@/api/getPrefectures";

type Prefecture = Awaited<ReturnType<typeof getPrefectures>>[number];
type RegionGroup = {
	region: string;
	prefectures: Prefecture[];
};

export const regionMapping = {
	"北海道・東北": [1, 2, 3, 4, 5, 6, 7],
	"関東": [8, 9, 10, 11, 12, 13, 14],
	"中部": [15, 16, 17, 18, 19, 20, 21, 22, 23],
	"近畿": [24, 25, 26, 27, 28, 29, 30],
	"中国・四国": [31, 32, 33, 34, 35, 36, 37, 38, 39],
	"九州・沖縄": [40, 41, 42, 43, 44, 45, 46, 47],
} as const satisfies Record<string, number[]>;

/**
 * 都道府県一覧を地域ごとにグルーピングする関数
 *
 * @param prefectures - 都道府県のリスト
 * @returns 地域ごとのグループの配列
 */
export function groupPrefecturesByRegion(
	prefectures: Prefecture[],
): RegionGroup[] {
	return Object.entries(regionMapping).map(([region, codes]) => {
		const regionPrefectures = prefectures.filter((pref) => {
			return codes.some((code) => code === pref.prefCode);
		});
		return {
			region,
			prefectures: regionPrefectures,
		};
	});
}
