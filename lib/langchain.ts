import { WebPDFLoader } from "@langchain/community/document_loaders/web/pdf";

export async function fetchAndExtractPdfText(fileUrl: string): Promise<string> {
  const response = await fetch(fileUrl);
  if (!response.ok) {
    throw new Error(`PDF fetch failed: ${response.status} ${response.statusText}`);
  }
  const blob = await response.blob();
  const loader = new WebPDFLoader(blob, { splitPages: true });
  const docs = await loader.load();
  return docs.map((doc) => doc.pageContent).join("\n");
}