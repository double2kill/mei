import { EntryListPage } from "./EntryListPage";
import { evaEntries } from "../data";

export function EvaPage() {
  return <EntryListPage heading="Eva" entries={evaEntries} />;
}
