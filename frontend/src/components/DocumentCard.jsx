import { useState } from "react";
import api from "../lib/api";
import supabase from "../lib/supabase";
import { useTheme } from "../lib/ThemeContext";

export default function DocumentCard({ doc, userId, onDelete }) {
  const [deleting, setDeleting] = useState(false);
  const { dark } = useTheme();

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${doc.file_name}"? This will also remove all extracted data.`)) return;
    setDeleting(true);
    try {
      const url = new URL(doc.file_url);
      const filePath = url.pathname.split("/career-documents/")[1];
      await supabase.storage.from("career-documents").remove([filePath]);
      await supabase.from("documents").delete().eq("id", doc.id);
      // Check remaining docs - only clear AI data if no documents left
      const { data: remaining } = await supabase.from("documents").select("id").eq("user_id", userId);
      if (!remaining || remaining.length === 0) {
        await api.delete("/api/documents/clear-data");
      }
      onDelete();
    } catch (err) {
      console.error("Delete failed:", err.message);
    }
    setDeleting(false);
  };

  const getFileIcon = (type) => {
    if (type?.includes("pdf")) return "📄";
    if (type?.includes("word")) return "📝";
    if (type?.includes("image")) return "🖼️";
    return "📁";
  };

  const getFileColor = (type) => {
    if (type?.includes("pdf")) return "from-red-500 to-red-600 shadow-red-500/20";
    if (type?.includes("word")) return "from-blue-500 to-blue-600 shadow-blue-500/20";
    if (type?.includes("image")) return "from-green-500 to-green-600 shadow-green-500/20";
    return "from-gray-500 to-gray-600 shadow-gray-500/20";
  };

  const getFileBg = (type) => {
    if (dark) return "bg-gray-800/60 hover:bg-gray-800 border border-gray-700";
    if (type?.includes("pdf")) return "bg-red-50";
    if (type?.includes("word")) return "bg-blue-50";
    if (type?.includes("image")) return "bg-green-50";
    return "bg-gray-50";
  };

  return (
    <div className={`group flex items-center justify-between p-4 rounded-2xl ${getFileBg(doc.file_type)} transition-all duration-300 hover:shadow-lg hover:scale-[1.01] mb-3`}>
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getFileColor(doc.file_type)} flex items-center justify-center shadow-lg shrink-0`}>
          <span className="text-xl">{getFileIcon(doc.file_type)}</span>
        </div>
        <div>
          <p className={`font-medium transition-colors ${dark ? "text-gray-100 group-hover:text-white" : "text-gray-800 group-hover:text-primary-700"}`}>{doc.file_name}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-xs ${dark ? "text-gray-500" : "text-gray-400"}`}>{new Date(doc.upload_date).toLocaleDateString()}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${dark ? "bg-gray-700 text-gray-300" : "bg-white/80 text-gray-500"}`}>
              {doc.file_type?.includes("pdf") ? "PDF" : doc.file_type?.includes("word") ? "DOCX" : "Image"}
            </span>
          </div>
        </div>
      </div>
      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
        <a href={doc.file_url} target="_blank" rel="noreferrer" className="btn-success flex items-center gap-1.5 py-2 px-4 text-xs">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          View
        </a>
        <button onClick={handleDelete} disabled={deleting} className="btn-danger flex items-center gap-1.5 py-2 px-4 text-xs">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          {deleting ? "Deleting..." : "Delete"}
        </button>
      </div>
    </div>
  );
}
