// test comment
import { type ApiResponse, requestApi } from "./utils";

// 都道府県の型定義
type Prefecture = {
	prefCode: number;
	prefName: string;
};

/**
 * 都道府県一覧を取得
 * @returns 都道府県一覧データ
 */
export const getPrefectures = async (): Promise<Prefecture[]> => {
	const data = await requestApi<ApiResponse<Prefecture[]>>(
		"/api/v1/prefectures",
	);
	return data.result;
};
