import requests
import PyPDF2
import docx
try:
    import pdfplumber
    HAS_PDFPLUMBER = True
except ImportError:
    HAS_PDFPLUMBER = False
from io import BytesIO

def extract_text(file_url: str, file_type: str) -> str:
    print(f"🔗 Fetching URL: {file_url}")
    print(f"📁 File type: {file_type}")
    response = requests.get(file_url)
    print(f"📡 Response status: {response.status_code}, size: {len(response.content)} bytes")
    content = response.content

    ft = file_type.lower()

    if ft.startswith("image/") or any(img in ft for img in ["png", "jpeg", "webp"]):
        print(f"🖼️ Image file detected ({file_type}), will use vision AI")
        return ""

    if "pdf" in ft:
        text = extract_pdf(content)
        print(f"📄 PDF extracted: {len(text)} chars")
        if not text.strip():
            print("⚠️ Scanned PDF detected, will use vision AI")
            return ""
        return text

    if "docx" in ft or "wordprocessingml" in ft:
        text = extract_docx(BytesIO(content))
        print(f"📝 DOCX extracted: {len(text)} chars")
        return text

    print(f"⚠️ Unknown file type '{file_type}', will use vision AI")
    return ""

def extract_pdf(content: bytes) -> str:
    # Try pdfplumber first - much better at certificates and styled PDFs
    if HAS_PDFPLUMBER:
        try:
            with pdfplumber.open(BytesIO(content)) as pdf:
                text = "\n".join(
                    page.extract_text(x_tolerance=2, y_tolerance=2) or ""
                    for page in pdf.pages
                )
            if text.strip():
                print("📄 pdfplumber extraction succeeded")
                return text
        except Exception as e:
            print(f"pdfplumber failed: {e}")

    # Fallback to PyPDF2
    try:
        reader = PyPDF2.PdfReader(BytesIO(content))
        text = "\n".join(page.extract_text() or "" for page in reader.pages)
        if text.strip():
            print("📄 PyPDF2 extraction succeeded")
        return text
    except Exception as e:
        print(f"❌ PDF extraction error: {e}")
        return ""
