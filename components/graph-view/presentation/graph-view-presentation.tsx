"use client";

import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import type { FC } from "react";
import "highcharts/modules/accessibility.js";
import type { getPopulation } from "@/api/getPopulation";
import type { getPrefectures } from "@/api/getPrefectures";

type PopulationData = Awaited<ReturnType<typeof getPopulation>>;
type Prefecture = Awaited<ReturnType<typeof getPrefectures>>[number];

type Props = {
	population: PopulationData[];
	prefectures: Prefecture[];
	selectedPrefCodes: number[];
};

const baseOtions = {
	chart: {
		type: "line",
		spacingTop: 20,
		spacingBottom: 20,
		spacingLeft: 20,
		spacingRight: 20,
	},
	title: {
		text: "",
	},
	xAxis: {
		title: { text: "年度", margin: 15 },
		type: "linear",
		tickInterval: 5,
		labels: {
			style: {
				fontSize: "12px",
			},
		},
	},
	yAxis: {
		title: {
			text: "人口 (万人)",
			margin: 8,
		},
		labels: {
			formatter: function () {
				return `${Highcharts.numberFormat((this.value as number) / 10000, 0, ".", ",")}`;
			},
			style: {
				fontSize: "10px",
			},
		},
	},
	tooltip: {
		headerFormat:
			'<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; gap: 12px;">' +
			'<span style="font-size: 13px; font-weight: bold; color: {point.color}; max-width: 70%;">{series.name}</span>' +
			'<span style="font-size: 12px; color: #666; min-width: 50px; text-align: right;">{point.x}年</span>' +
			"</div>",
		pointFormat:
			'<div style="font-size: 12px; font-weight: bold;">{point.y:,.0f}人</div>',
		backgroundColor: "rgba(255, 255, 255, 0.95)",
		borderWidth: 1,
		borderRadius: 8,
		padding: 12,
		shadow: true,
		useHTML: true,
	},
	credits: {
		enabled: false,
	},
	responsive: {
		rules: [
			{
				condition: {
					maxWidth: 600,
				},
				chartOptions: {
					chart: {
						spacingLeft: 0,
						spacingRight: 0,
					},
					legend: {
						layout: "horizontal",
						align: "center",
						verticalAlign: "bottom",
					},
					yAxis: {
						title: {
							margin: 5,
						},
						labels: {
							style: {
								fontSize: "9px",
							},
						},
					},
				},
			},
		],
	},
} satisfies Highcharts.Options;

export const GraphViewPresentation: FC<Props> = ({
	population,
	prefectures,
	selectedPrefCodes,
}) => {
	const showEmptyState = selectedPrefCodes.length === 0;
	const series = population
		.map((popData, index) => {
			const prefCode = selectedPrefCodes[index];
			const pref = prefectures.find((p) => p.prefCode === prefCode);
			if (!pref) {
				return null;
			}
			const totalPopulationData = popData.data.find(
				(dataItem) => dataItem.label === "総人口",
			);
			if (!totalPopulationData) {
				return null;
			}
			const seriesData = totalPopulationData.data.map((point) => ({
				x: point.year,
				y: point.value,
			}));
			return {
				name: pref.prefName,
				data: seriesData,
				type: "line",
			} as Highcharts.SeriesOptionsType;
		})
		.filter(
			(seriesItem): seriesItem is Highcharts.SeriesOptionsType =>
				seriesItem !== null,
		);

	const options = {
		...baseOtions,
		series,
		xAxis: {
			...baseOtions.xAxis,
			title: {
				...baseOtions.xAxis.title,
				text: showEmptyState ? "" : "年度",
			},
			labels: {
				...baseOtions.xAxis.labels,
				enabled: !showEmptyState,
			},
			gridLineWidth: showEmptyState ? 0 : 1,
			lineWidth: showEmptyState ? 0 : 1,
			tickWidth: showEmptyState ? 0 : 1,
		},
		yAxis: {
			...baseOtions.yAxis,
			title: {
				...baseOtions.yAxis.title,
				text: showEmptyState ? "" : "人口 (万人)",
			},
			labels: {
				...baseOtions.yAxis.labels,
				enabled: !showEmptyState,
			},
			gridLineWidth: showEmptyState ? 0 : 1,
		},
	};

	return (
		<div
			style={{
				padding: "20px",
				margin: "10px 0",
				borderRadius: "8px",
				boxShadow: "0 4px 8px rgba(0, 0, 0, 0.05)",
				backgroundColor: "#fff",
				position: "relative",
				minHeight: "400px",
			}}
		>
			<HighchartsReact highcharts={Highcharts} options={options} />

			{showEmptyState && (
				<div
					style={{
						position: "absolute",
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						flexDirection: "column",
						gap: "12px",
					}}
				>
					<p
						style={{
							fontSize: "16px",
							color: "#666",
							textAlign: "center",
							fontWeight: "500",
						}}
					>
						都道府県を選択してください
					</p>
				</div>
			)}
		</div>
	);
};
