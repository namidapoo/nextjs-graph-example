"use client";
import type { getPrefectures } from "@/api/getPrefectures";
import { cn } from "@/lib/utils";
import { parseAsArrayOf, parseAsInteger, useQueryState } from "nuqs";
import type { FC } from "react";
import { groupPrefecturesByRegion } from "../lib/group-prefectures-by-region";

type Props = {
	prefectures: Awaited<ReturnType<typeof getPrefectures>>;
};

export const PrefectureSelectorPresentation: FC<Props> = ({ prefectures }) => {
	const regionGroups = groupPrefecturesByRegion(prefectures);
	const [selectedPrefCodes, setSelectedPrefCodes] = useQueryState<number[]>(
		"prefCodes",
		parseAsArrayOf(parseAsInteger).withDefault([]).withOptions({
			shallow: false,
		}),
	);

	// 選択済みの都道府県数を計算
	const selectedCount = selectedPrefCodes.length;

	// 都道府県の選択状態を切り替える
	const handleTogglePrefecture = (prefCode: number) => {
		const isSelected = selectedPrefCodes.includes(prefCode);
		if (isSelected) {
			setSelectedPrefCodes(
				selectedPrefCodes.filter((code) => code !== prefCode),
			);
		} else {
			setSelectedPrefCodes([...selectedPrefCodes, prefCode]);
		}
	};

	// すべての都道府県を選択
	const handleSelectAll = () => {
		const allPrefCodes = prefectures.map((pref) => pref.prefCode);
		setSelectedPrefCodes(allPrefCodes);
	};

	// 地域内のすべての都道府県を選択
	const handleSelectRegion = (prefCodes: number[]) => {
		const newSelection = [...new Set([...selectedPrefCodes, ...prefCodes])];
		setSelectedPrefCodes(newSelection);
	};

	// 選択をクリア
	const handleClearSelection = () => {
		setSelectedPrefCodes(null);
	};

	return (
		<div className="p-4">
			<div className="mb-3 flex items-center justify-between">
				<p className="text-gray-600 text-sm" aria-live="polite">
					選択済み: <span className="font-medium">{selectedCount}</span> / 47
				</p>
				<div className="flex gap-2">
					<button
						type="button"
						className="cursor-pointer rounded-md bg-gray-100 px-3 py-2 text-sm transition-colors hover:bg-gray-200"
						aria-label="47都道府県をすべて選択"
						onClick={handleSelectAll}
					>
						すべて選択
					</button>
					<button
						type="button"
						className="cursor-pointer rounded-md bg-gray-100 px-3 py-2 text-sm transition-colors hover:bg-gray-200"
						onClick={handleClearSelection}
					>
						選択をクリア
					</button>
				</div>
			</div>
			<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
				{regionGroups.map((group) => (
					<div key={group.region} className="rounded-lg border p-3">
						<div className="mb-2 flex items-center justify-between">
							<h3 className="font-medium text-gray-700 text-sm">
								{group.region}
							</h3>
							<button
								type="button"
								className="cursor-pointer text-gray-500 text-xs hover:text-gray-700"
								aria-label={`${group.region}をすべて選択`}
								onClick={() =>
									handleSelectRegion(group.prefectures.map((p) => p.prefCode))
								}
							>
								すべて選択
							</button>
						</div>
						<div className="flex flex-wrap gap-1">
							{group.prefectures.map((pref) => {
								const isSelected = selectedPrefCodes.includes(pref.prefCode);
								return (
									<button
										type="button"
										key={pref.prefCode}
										className={cn(
											"cursor-pointer rounded-full border px-2 py-1 text-xs transition-colors",
											isSelected
												? "border-blue-300 bg-blue-100 text-blue-700"
												: "border-gray-200 bg-gray-100 text-gray-600 hover:bg-gray-200",
										)}
										aria-pressed={isSelected}
										onClick={() => handleTogglePrefecture(pref.prefCode)}
									>
										{pref.prefName}
									</button>
								);
							})}
						</div>
					</div>
				))}
			</div>
		</div>
	);
};
