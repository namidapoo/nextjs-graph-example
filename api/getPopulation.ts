import { type ApiResponse, requestApi } from "./utils";

// 人口データの型定義
type PopulationData = {
	boundaryYear: number;
	data: {
		label: string;
		data: {
			year: number;
			value: number;
			rate?: number;
		}[];
	}[];
};

/**
 * 指定した都道府県の人口データを取得
 * @param prefCode 都道府県コード
 * @returns 人口データ（総人口・年少人口・生産年齢人口・老年人口のデータを含む）
 */
export const getPopulation = async (
	prefCode: number,
): Promise<PopulationData> => {
	const data = await requestApi<ApiResponse<PopulationData>>(
		`/api/v1/population/composition/perYear?prefCode=${prefCode}`,
	);
	return data.result;
};
