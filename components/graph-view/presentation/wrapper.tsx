"use client";
import dynamic from "next/dynamic";

export const ClientOnlyGraphViewPresentation = dynamic(
	() =>
		import("./graph-view-presentation").then(
			(mod) => mod.GraphViewPresentation,
		),
	{ ssr: false },
);
