import { useState, useRef } from "react";
import api from "../lib/api";
import supabase from "../lib/supabase";
import { useTheme } from "../lib/ThemeContext";

export default function UploadDocument({ userId, onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const fileInputRef = useRef(null);
  const { dark } = useTheme();

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return setError("Please select a file");

    const allowed = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/png",
      "image/jpg",
      "image/jpeg",
    ];
    if (!allowed.includes(file.type)) return setError("Only PDF, DOCX, PNG, JPG, JPEG allowed");

    setUploading(true);
    setError("");
    setProgress(30);

    const filePath = `${userId}/${Date.now()}_${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from("career-documents")
      .upload(filePath, file);

    if (uploadError) {
      setError(uploadError.message);
      setUploading(false);
      setProgress(0);
      return;
    }

    setProgress(60);

    const { data: { publicUrl } } = supabase.storage
      .from("career-documents")
      .getPublicUrl(filePath);

    const { data: doc, error: dbError } = await supabase
      .from("documents")
      .insert([{ user_id: userId, file_name: file.name, file_url: publicUrl, file_type: file.type }])
      .select()
      .single();

    if (dbError) {
      setError(dbError.message);
      setUploading(false);
      setProgress(0);
      return;
    }

    setProgress(80);
    setUploading(false);
    setProcessing(true);

    try {
      await api.post("/api/documents/process", {
        document_id: doc.id,
        file_url: publicUrl,
        file_type: file.type,
      });
    } catch (err) {
      const msg = err.response?.data?.error || err.message || "Document analysis failed";
      setError(`Upload succeeded but AI analysis failed: ${msg}`);
      setProcessing(false);
      setProgress(0);
      onUploadSuccess();
      return;
    }

    setProgress(100);
    setProcessing(false);
    setDone(true);
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setTimeout(() => {
      setProgress(0);
      setDone(false);
      onUploadSuccess();
    }, 2000);
  };

  const handleDragOver = (e) => { e.preventDefault(); setDragOver(true); };
  const handleDragLeave = () => setDragOver(false);
  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) setFile(droppedFile);
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className={`rounded-2xl p-6 transition-all duration-300 hover:shadow-xl ${dark ? "bg-gray-900 border border-gray-800" : "glass-card"}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #6366f1, #ff5a3c)" }}>
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        <div>
          <h3 className={`text-lg font-display font-semibold ${dark ? "text-white" : "text-gray-900"}`}>Upload Career Document</h3>
          <p className={`text-xs ${dark ? "text-gray-400" : "text-gray-500"}`}>Resume, Certificates, Internship Letters, Project Reports</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2 mb-4">
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
          <button onClick={() => setError("")} className="ml-auto text-red-400 hover:text-red-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {done && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2 mb-4 animate-fade-in">
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>✅ Document analyzed! Skills, certificates and career paths have been updated.</span>
        </div>
      )}

      {processing && (
        <div className={`border px-4 py-3 rounded-xl text-sm flex items-center gap-2 mb-4 animate-fade-in ${dark ? "bg-indigo-950/50 border-indigo-800 text-indigo-300" : "bg-primary-50 border-primary-200 text-primary-700"}`}>
          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span>🤖 AI is analyzing your document...</span>
        </div>
      )}

      <form onSubmit={handleUpload}>
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`drop-zone ${dragOver ? "dragover" : ""} ${file ? "border-primary-500" : ""} ${dark ? "border-gray-700 hover:border-coral-500" : ""}`}
          style={dark ? { background: file ? "rgba(99,102,241,0.05)" : "transparent" } : {}}
        >
          {file ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: "linear-gradient(135deg, #6366f1, #ff5a3c)" }}>
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <p className={`font-medium ${dark ? "text-gray-100" : "text-gray-800"}`}>{file.name}</p>
                <p className={`text-sm ${dark ? "text-gray-400" : "text-gray-400"}`}>{formatFileSize(file.size)}</p>
              </div>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                className="text-xs text-red-500 hover:text-red-700 font-medium"
              >
                Remove file
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${dark ? "bg-gray-800" : "bg-gray-100"}`}>
                <svg className={`w-7 h-7 ${dark ? "text-gray-500" : "text-gray-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div>
                <p className={`font-medium ${dark ? "text-gray-300" : "text-gray-700"}`}>
                  <span style={{ background: "linear-gradient(135deg, #ff5a3c, #ff9d38)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Click to upload</span> or drag and drop
                </p>
                <p className={`text-sm mt-1 ${dark ? "text-gray-500" : "text-gray-400"}`}>PDF, DOCX, PNG, JPG (max 50MB)</p>
              </div>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.png,.jpg,.jpeg"
            onChange={(e) => setFile(e.target.files[0])}
            className="hidden"
          />
        </div>

        {(uploading || processing || progress > 0) && (
          <div className="mt-4 animate-fade-in">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span>{uploading ? "Uploading..." : processing ? "Analyzing with AI..." : "Complete"}</span>
              <span>{progress}%</span>
            </div>
            <div className={`w-full h-2 rounded-full overflow-hidden ${dark ? "bg-gray-800" : "bg-gray-100"}`}>
              <div
                className="h-full gradient-bg-primary rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={!file || uploading || processing}
          className="btn-primary w-full mt-4"
        >
          {uploading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Uploading...</span>
            </span>
          ) : processing ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Analyzing...</span>
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <span>Upload & Analyze</span>
            </span>
          )}
        </button>
      </form>
    </div>
  );
}
