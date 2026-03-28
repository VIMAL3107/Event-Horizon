import sys
from pypdf import PdfReader

try:
    # Use existing PDF file if any?
    import os
    pdfs = [f for f in os.listdir('.') if f.endswith('.pdf')]
    if not pdfs:
        # Search in backend
        pdfs = [os.path.join('backend', f) for f in os.listdir('backend') if f.endswith('.pdf')]
    
    if pdfs:
        print(f"Testing PDF: {pdfs[0]}")
        reader = PdfReader(pdfs[0])
        text = ""
        for page in reader.pages:
            text += page.extract_text() or ""
        print(f"Extracted {len(text)} characters.")
    else:
        print("No PDF files found to test.")
except Exception as e:
    print(f"PDF Extraction Error: {e}")
