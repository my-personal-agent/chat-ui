import {
  Archive,
  CodeIcon,
  FileIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  FileTypeIcon,
  ImageIcon,
  MusicIcon,
  VideoIcon,
} from "lucide-react";

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export function getFileIcon(filename: string) {
  const extension = filename.split(".").pop()?.toLowerCase();

  // Image files
  if (
    [
      "jpg",
      "jpeg",
      "png",
      "gif",
      "bmp",
      "webp",
      "svg",
      "ico",
      "tiff",
      "tif",
    ].includes(extension || "")
  ) {
    return <ImageIcon className="w-4 h-4 text-blue-500" />;
  }

  // Video files
  if (
    [
      "mp4",
      "avi",
      "mov",
      "wmv",
      "flv",
      "webm",
      "mkv",
      "m4v",
      "3gp",
      "ogv",
    ].includes(extension || "")
  ) {
    return <VideoIcon className="w-4 h-4 text-red-500" />;
  }

  // Audio files
  if (
    ["mp3", "wav", "flac", "aac", "ogg", "m4a", "wma", "opus", "oga"].includes(
      extension || ""
    )
  ) {
    return <MusicIcon className="w-4 h-4 text-green-500" />;
  }

  // PDF files
  if (extension === "pdf") {
    return <FileTextIcon className="w-4 h-4 text-red-600" />;
  }

  // Spreadsheet files
  if (
    ["xlsx", "xls", "csv", "ods", "xlsm", "xlsb", "xltx", "xltm"].includes(
      extension || ""
    )
  ) {
    return <FileSpreadsheetIcon className="w-4 h-4 text-green-600" />;
  }

  // Document files
  if (
    ["doc", "docx", "odt", "rtf", "txt", "pages", "dotx", "dotm"].includes(
      extension || ""
    )
  ) {
    return <FileTypeIcon className="w-4 h-4 text-blue-600" />;
  }

  // Archive files
  if (
    [
      "zip",
      "rar",
      "7z",
      "tar",
      "gz",
      "bz2",
      "xz",
      "lzma",
      "cab",
      "iso",
    ].includes(extension || "")
  ) {
    return <Archive className="w-4 h-4 text-orange-500" />;
  }

  // Code files
  if (
    [
      "js",
      "ts",
      "jsx",
      "tsx",
      "py",
      "java",
      "cpp",
      "c",
      "h",
      "hpp",
      "html",
      "css",
      "scss",
      "sass",
      "less",
      "json",
      "jsonl",
      "xml",
      "php",
      "rb",
      "go",
      "rs",
      "swift",
      "kt",
      "dart",
      "vue",
      "svelte",
      "sql",
      "sh",
      "bash",
      "ps1",
      "yaml",
      "yml",
      "toml",
      "ini",
      "cfg",
      "md",
      "mdx",
      "tex",
      "r",
      "m",
      "scala",
      "clj",
      "hs",
      "elm",
      "lua",
      "pl",
      "cs",
      "vb",
      "fs",
      "coffee",
      "styl",
      "pug",
      "ejs",
      "hbs",
    ].includes(extension || "")
  ) {
    return <CodeIcon className="w-4 h-4 text-purple-500" />;
  }

  // Default file icon
  return <FileIcon className="w-4 h-4 text-gray-500" />;
}
