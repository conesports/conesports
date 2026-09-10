"use client";

import { useEffect, useRef } from "react";

export function RichTextEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (html: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) ref.current.innerHTML = value;
    // initial HTML only — later edits flow through onInput
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function command(cmd: string, arg?: string) {
    ref.current?.focus();
    document.execCommand(cmd, false, arg);
    onChange(ref.current?.innerHTML ?? "");
  }

  function addLink() {
    const href = window.prompt("Link URL");
    if (!href) return;
    command("createLink", href);
  }

  return (
    <div>
      <div className="mb-2 flex flex-wrap gap-2">
        <button type="button" className="border px-2 py-1" onClick={() => command("formatBlock", "h2")}>
          Heading
        </button>
        <button type="button" className="border px-2 py-1" onClick={() => command("formatBlock", "h3")}>
          Subheading
        </button>
        <button type="button" className="border px-2 py-1" onClick={() => command("bold")}>
          Bold
        </button>
        <button type="button" className="border px-2 py-1" onClick={() => command("insertUnorderedList")}>
          List
        </button>
        <button type="button" className="border px-2 py-1" onClick={() => command("insertOrderedList")}>
          Numbered
        </button>
        <button type="button" className="border px-2 py-1" onClick={addLink}>
          Link
        </button>
      </div>
      <div
        ref={ref}
        className="min-h-48 border px-3 py-2"
        contentEditable
        suppressContentEditableWarning
        onInput={() => onChange(ref.current?.innerHTML ?? "")}
      />
    </div>
  );
}
