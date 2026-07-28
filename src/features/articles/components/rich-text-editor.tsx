"use client";

import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { LinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
import { ListItemNode, ListNode } from "@lexical/list";
import {
  $convertFromMarkdownString,
  $convertToMarkdownString,
  TRANSFORMERS,
} from "@lexical/markdown";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
} from "@lexical/list";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { FORMAT_TEXT_COMMAND, REDO_COMMAND, UNDO_COMMAND } from "lexical";

export function RichTextEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <LexicalComposer
      initialConfig={{
        namespace: "MikoziArticleSection",
        nodes: [
          LinkNode,
          ListNode,
          ListItemNode,
          HeadingNode,
          QuoteNode,
          CodeNode,
          CodeHighlightNode,
        ],
        editorState: () => {
          if (value) $convertFromMarkdownString(value, TRANSFORMERS);
        },
        onError(error) {
          throw error;
        },
        theme: {
          paragraph: "rich-editor-paragraph",
          quote: "rich-editor-quote",
          link: "rich-editor-link",
          list: {
            ul: "rich-editor-list",
            ol: "rich-editor-list",
            listitem: "rich-editor-list-item",
          },
          text: {
            bold: "rich-editor-bold",
            italic: "rich-editor-italic",
            strikethrough: "rich-editor-strike",
            code: "rich-editor-code",
          },
        },
      }}
    >
      <div className="rich-editor">
        <EditorToolbar />
        <div className="rich-editor-canvas">
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                className="rich-editor-input"
                aria-label="Story text"
              />
            }
            placeholder={
              <div className="rich-editor-placeholder">
                Write the article text here…
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          <ListPlugin />
          <LinkPlugin />
          <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
          <OnChangePlugin
            ignoreSelectionChange
            onChange={(state) =>
              state.read(() => onChange($convertToMarkdownString(TRANSFORMERS)))
            }
          />
        </div>
      </div>
    </LexicalComposer>
  );
}

function EditorToolbar() {
  const [editor] = useLexicalComposerContext();

  function addLink() {
    const url = window.prompt("Enter the link URL");
    if (url?.trim()) editor.dispatchCommand(TOGGLE_LINK_COMMAND, url.trim());
  }

  return (
    <div className="rich-editor-toolbar" role="toolbar" aria-label="Formatting">
      <button
        type="button"
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}
        aria-label="Bold"
      >
        <strong>B</strong>
      </button>
      <button
        type="button"
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}
        aria-label="Italic"
      >
        <em>I</em>
      </button>
      <button
        type="button"
        onClick={() =>
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough")
        }
        aria-label="Strikethrough"
      >
        <s>S</s>
      </button>
      <button
        type="button"
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "code")}
        aria-label="Inline code"
      >
        Code
      </button>
      <span aria-hidden="true" />
      <button
        type="button"
        onClick={() =>
          editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)
        }
        aria-label="Bulleted list"
      >
        • List
      </button>
      <button
        type="button"
        onClick={() =>
          editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)
        }
        aria-label="Numbered list"
      >
        1. List
      </button>
      <button type="button" onClick={addLink} aria-label="Add link">
        Link
      </button>
      <span aria-hidden="true" />
      <button
        type="button"
        onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
        aria-label="Undo"
      >
        Undo
      </button>
      <button
        type="button"
        onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
        aria-label="Redo"
      >
        Redo
      </button>
    </div>
  );
}
