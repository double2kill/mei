import { PageStatus } from "../components/PageStatus";
import { useScreenEntries } from "../hooks/useContentApi";
import { EntryListPage } from "./EntryListPage";

export function EvaPage() {
  const { entries, loading, error } = useScreenEntries("eva");
  if (loading || error) return <PageStatus loading={loading} error={error} />;
  return <EntryListPage heading="Eva" entries={entries} />;
}
