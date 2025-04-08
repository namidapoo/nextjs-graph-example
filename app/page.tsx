import { GraphView } from "@/components/graph-view/container/graph-view";
import { PrefectureSelector } from "@/components/prefecture-selector/container/prefecture-selector";
import { searchParamsCache } from "@/lib/search-params";
import type { SearchParams } from "nuqs";
import { type FC, Suspense } from "react";

type PageProps = {
	searchParams: Promise<SearchParams>;
};

const Page: FC<PageProps> = async ({ searchParams }) => {
	const parsedSearchParams = await searchParamsCache.parse(searchParams);
	const hasPrefectures = parsedSearchParams.prefCodes.length > 0;

	return (
		<main className="mx-auto min-h-screen max-w-6xl p-4 md:px-6 lg:px-8">
			<h1 className="font-bold text-2xl">日本の都道府県別人口推移</h1>
			<PrefectureSelector />
			<Suspense
				fallback={<div>Loading...</div>}
				key={hasPrefectures ? "has-prefectures" : "no-prefectures"}
			>
				<GraphView />
			</Suspense>
		</main>
	);
};

export default Page;
