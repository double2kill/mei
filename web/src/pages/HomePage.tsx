import { EntryListPage } from "./EntryListPage";
import { homeEntries } from "../data-helpers";

export function HomePage() {
  return <EntryListPage heading="湄开六度" entries={homeEntries} />;
}
