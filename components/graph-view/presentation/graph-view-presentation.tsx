"use client";

import type { getPopulation } from "@/api/getPopulation";
import type { getPrefectures } from "@/api/getPrefectures";
import type React from "react";
import type { FC } from "react";
import {
	CartesianGrid,
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	type TooltipProps,
	XAxis,
	YAxis,
} from "recharts";

type PopulationData = Awaited<ReturnType<typeof getPopulation>>;
type Prefecture = Awaited<ReturnType<typeof getPrefectures>>[number];

type ChartDataPoint = {
	year: number;
	[key: string]: number;
};

type Props = {
	population: PopulationData[];
	prefectures: Prefecture[];
	selectedPrefCodes: number[];
};

const COLORS: string[] = [
	"#7cb5ec",
	"#434348",
	"#90ed7d",
	"#f7a35c",
	"#8085e9",
	"#f15c80",
	"#e4d354",
	"#2b908f",
	"#f45b5b",
	"#91e8e1",
];

// カスタムツールチップコンポーネント
interface CustomTooltipPayload {
	name: string;
	value: number;
	color?: string;
}
interface CustomTooltipProps extends TooltipProps<number, string> {}

const CustomTooltip: FC<CustomTooltipProps> = ({ active, payload, label }) => {
	if (!active || !payload || payload.length === 0) return null;
	// 複数項目が含まれている場合は、最初の項目のみ表示（個別ツールチップに相当）
	const item = payload[0] as CustomTooltipPayload;

	// インラインスタイル
	const tooltipContainerStyle: React.CSSProperties = {
		backgroundColor: "rgba(255, 255, 255, 0.95)",
		border: "1px solid #ccc",
		borderRadius: "8px",
		padding: "12px",
		boxShadow: "0px 0px 8px rgba(0, 0, 0, 0.1)",
	};
	const headerStyle: React.CSSProperties = {
		display: "flex",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: "8px",
		gap: "20px",
	};
	const headerNameStyle: React.CSSProperties = {
		fontSize: "13px",
		fontWeight: "bold",
		maxWidth: "70%",
	};
	const headerValueStyle: React.CSSProperties = {
		fontSize: "12px",
		color: "#666",
		minWidth: "50px",
		textAlign: "right",
	};
	const pointStyle: React.CSSProperties = {
		fontSize: "12px",
		fontWeight: "bold",
		textAlign: "center",
	};

	const formatNumber = (num: number): string =>
		new Intl.NumberFormat().format(num);

	return (
		<div style={tooltipContainerStyle}>
			<div style={headerStyle}>
				<span style={{ ...headerNameStyle, color: item.color }}>
					{item.name}
				</span>
				<span style={headerValueStyle}>{label}年</span>
			</div>
			<div style={pointStyle}>{formatNumber(item.value)}人</div>
		</div>
	);
};

export const GraphViewPresentation: FC<Props> = ({
	population,
	prefectures,
	selectedPrefCodes,
}) => {
	// 各シリーズ（都道府県毎）のデータを組み立てる
	type SeriesData = {
		prefName: string;
		data: { year: number; value: number }[];
	};

	const seriesData: SeriesData[] = population
		.map((popData, index) => {
			const prefCode = selectedPrefCodes[index];
			const pref = prefectures.find((p) => p.prefCode === prefCode);
			if (!pref) return null;
			const totalPopulationData = popData.data.find(
				(dataItem) => dataItem.label === "総人口",
			);
			if (!totalPopulationData) return null;
			const dataPoints = totalPopulationData.data.map((point) => ({
				year: point.year,
				value: point.value,
			}));
			return { prefName: pref.prefName, data: dataPoints };
		})
		.filter((seriesItem): seriesItem is SeriesData => seriesItem !== null);

	// 全シリーズは全て同じ年度データを持つと仮定
	const years: number[] =
		seriesData.length > 0 ? seriesData[0].data.map((point) => point.year) : [];

	// 各年度毎に、各都道府県の人口をまとめたオブジェクトを生成
	const chartData: ChartDataPoint[] = years.map((year) => {
		const dataPoint: ChartDataPoint = { year };
		for (const series of seriesData) {
			const pointData = series.data.find((p) => p.year === year);
			dataPoint[series.prefName] = pointData ? pointData.value : 0;
		}
		return dataPoint;
	});

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
			<h2
				style={{
					fontSize: "18px",
					fontWeight: "bold",
					margin: "20px",
				}}
			>
				都道府県の人口推移
			</h2>
			<ResponsiveContainer width="100%" height={400}>
				<LineChart
					data={chartData}
					margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
				>
					<XAxis
						dataKey="year"
						label={{
							value: "年度",
							position: "insideBottom",
							offset: -10,
							style: { fontSize: "12px" },
						}}
						tick={{ fontSize: 12 }}
					/>
					<YAxis
						tickFormatter={(value: number) =>
							`${new Intl.NumberFormat().format(value)}人`
						}
						label={{
							value: "人口数",
							angle: -90,
							position: "insideLeft",
							offset: 10,
							style: { fontSize: "12px" },
						}}
						tick={{ fontSize: 12 }}
					/>
					{/* カスタムツールチップ（個別ツールチップ表示） */}
					<Tooltip
						content={<CustomTooltip />}
						cursor={{ stroke: "#ccc", strokeWidth: 1 }}
					/>
					<CartesianGrid strokeDasharray="3 3" />
					{seriesData.map((series, index) => (
						<Line
							key={series.prefName}
							type="monotone"
							dataKey={series.prefName}
							name={series.prefName}
							stroke={COLORS[index % COLORS.length]}
							dot={{ r: 3 }}
							activeDot={{ r: 5 }}
						/>
					))}
				</LineChart>
			</ResponsiveContainer>
		</div>
	);
};

export default GraphViewPresentation;
