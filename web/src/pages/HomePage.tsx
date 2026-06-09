import { PageStatus } from "../components/PageStatus";
import { useScreenEntries } from "../hooks/useContentApi";
import { EntryListPage } from "./EntryListPage";

export function HomePage() {
  const { entries, loading, error } = useScreenEntries("home");
  if (loading || error) return <PageStatus loading={loading} error={error} />;
  return <EntryListPage heading="湄开六度" entries={entries} />;
}
