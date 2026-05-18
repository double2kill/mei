import { useCallback, useLayoutEffect, useRef, useState } from "react";

export function useHanziDraftEditor() {
  const [draft, setDraft] = useState("");
  const taRef = useRef<HTMLTextAreaElement>(null);
  const lastSel = useRef({ start: 0, end: 0 });
  const pendingCaret = useRef<number | null>(null);

  const captureSel = useCallback(() => {
    const el = taRef.current;
    if (!el) return;
    lastSel.current = {
      start: el.selectionStart,
      end: el.selectionEnd,
    };
  }, []);

  useLayoutEffect(() => {
    if (pendingCaret.current == null) return;
    const pos = pendingCaret.current;
    pendingCaret.current = null;
    const el = taRef.current;
    if (!el) return;
    const clamped = Math.max(0, Math.min(pos, el.value.length));
    el.focus();
    el.setSelectionRange(clamped, clamped);
    lastSel.current = { start: clamped, end: clamped };
  }, [draft]);

  const insertAtCursor = useCallback((ch: string) => {
    if (!ch) return;
    setDraft((d) => {
      const el = taRef.current;
      const active = el != null && document.activeElement === el;
      let a = active ? el.selectionStart : lastSel.current.start;
      let b = active ? el.selectionEnd : lastSel.current.end;
      a = Math.max(0, Math.min(a, d.length));
      b = Math.max(a, Math.min(b, d.length));
      const next = d.slice(0, a) + ch + d.slice(b);
      const pos = a + ch.length;
      pendingCaret.current = pos;
      lastSel.current = { start: pos, end: pos };
      return next;
    });
  }, []);

  const resetDraft = useCallback(() => {
    setDraft("");
    lastSel.current = { start: 0, end: 0 };
    pendingCaret.current = null;
  }, []);

  const onTextareaChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setDraft(e.target.value);
      lastSel.current = {
        start: e.target.selectionStart,
        end: e.target.selectionEnd,
      };
    },
    [],
  );

  return {
    draft,
    setDraft,
    taRef,
    insertAtCursor,
    resetDraft,
    captureSel,
    onTextareaChange,
  };
}
