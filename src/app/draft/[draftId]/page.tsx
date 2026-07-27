import { DraftExperience } from "@/components/draft/DraftExperience";

export default async function DraftPage({
  params,
}: {
  params: Promise<{ draftId: string }>;
}) {
  const { draftId } = await params;
  return <DraftExperience draftId={draftId} />;
}
