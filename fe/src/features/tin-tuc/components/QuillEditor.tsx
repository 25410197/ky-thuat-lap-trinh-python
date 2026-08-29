"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@mantine/core";
import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
  loading: () => <Skeleton h={320} radius="sm" />,
});

const TOOLBAR = [
  [{ header: [2, 3, false] }],
  ["bold", "italic", "underline"],
  [{ list: "ordered" }, { list: "bullet" }],
  ["blockquote", "link", "image"],
  ["clean"],
];

interface QuillEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function QuillEditor({ value, onChange }: QuillEditorProps) {
  return <ReactQuill theme="snow" value={value} onChange={onChange} modules={{ toolbar: TOOLBAR }} />;
}
