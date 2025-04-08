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
		text: "都道府県の人口推移",
		style: {
			fontSize: "18px",
			fontWeight: "bold",
			margin: "20px",
		},
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
			text: "人口数",
			margin: 15,
		},
		labels: {
			formatter: function () {
				return `${Highcharts.numberFormat(this.value as number, 0, "", ",")}人`;
			},
			style: {
				fontSize: "12px",
			},
		},
	},
	tooltip: {
		headerFormat:
			'<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; gap: 20px;">' +
			'<span style="font-size: 13px; font-weight: bold; color: {point.color}; max-width: 70%;">{series.name}</span>' +
			'<span style="font-size: 12px; color: #666; min-width: 50px; text-align: right;">{point.x}年</span>' +
			"</div>",
		pointFormat:
			'<div style="font-size: 12px; font-weight: bold; text-align: center;">{point.y:,.0f}人</div>',
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
					legend: {
						layout: "horizontal",
						align: "center",
						verticalAlign: "bottom",
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
	};

	return (
		<div
			style={{
				padding: "20px",
				margin: "10px 0",
				borderRadius: "8px",
				boxShadow: "0 4px 8px rgba(0, 0, 0, 0.05)",
				backgroundColor: "#fff",
			}}
		>
			<HighchartsReact highcharts={Highcharts} options={options} />
		</div>
	);
};
