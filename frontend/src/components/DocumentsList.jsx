import { useTheme } from "../lib/ThemeContext";
import DocumentCard from "./DocumentCard";

export default function DocumentsList({ documents, userId, onDelete }) {
  const { dark } = useTheme();

  if (documents.length === 0) {
    return (
      <div className={`rounded-2xl p-12 text-center animate-fade-in ${dark ? "bg-gray-900 border border-gray-800" : "glass-card"}`}>
        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 ${dark ? "bg-gray-800" : "bg-gradient-to-br from-gray-100 to-gray-200"}`}>
          <svg className={`w-10 h-10 ${dark ? "text-gray-600" : "text-gray-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className={`text-lg font-display font-semibold mb-1 ${dark ? "text-white" : "text-gray-900"}`}>No documents yet</h3>
        <p className={`text-sm max-w-sm mx-auto ${dark ? "text-gray-500" : "text-gray-400"}`}>
          Upload your resume, certificates, internship letters, or project reports to get started.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-lg font-display font-semibold ${dark ? "text-white" : "text-gray-900"}`}>
          Uploaded Documents
        </h3>
        <span className="badge-primary">{documents.length} file{documents.length !== 1 ? "s" : ""}</span>
      </div>
      <div className="space-y-2">
        {documents.map((doc, index) => (
          <div key={doc.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 0.05}s` }}>
            <DocumentCard doc={doc} userId={userId} onDelete={onDelete} />
          </div>
        ))}
      </div>
    </div>
  );
}
