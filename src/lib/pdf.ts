import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist';
// ?worker bundles the pdf.js worker as a same-origin .js chunk — no CDN (offline-safe),
// and no reliance on the host serving .mjs with a correct MIME type
import PdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?worker';

export type { PDFDocumentProxy } from 'pdfjs-dist';

export async function loadPdf(blob: Blob) {
	GlobalWorkerOptions.workerPort ??= new PdfWorker();
	return getDocument({ data: await blob.arrayBuffer() }).promise;
}
