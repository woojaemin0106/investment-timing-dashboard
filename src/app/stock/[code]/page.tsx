import StockDetailView from "@/components/StockDetailView/StockDetailView";

interface Props {
  params: Promise<{ code: string }>;
}

export default async function StockPage({ params }: Props) {
  const { code } = await params;
  return <StockDetailView code={code} />;
}
