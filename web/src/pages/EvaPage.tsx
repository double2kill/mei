import { EntryListPage } from "./EntryListPage";
import { evaEntries } from "../data-helpers";

export function EvaPage() {
  return <EntryListPage heading="Eva" entries={evaEntries} />;
}
