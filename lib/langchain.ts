import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";

export async function fetchAndExtractPdfText (fileUrl: string) {

    console.log('INICIA FETCH')
    const response = await fetch(fileUrl)

    console.log('UPLOAD THING FILE fetched: ', response)
    const blob = await response.blob()

    const arrayBuffer = await blob.arrayBuffer()

    const loader = new PDFLoader(new Blob([arrayBuffer]))

    const docs = await loader.load()

    // combine all pages
    return docs.map((doc) => doc.pageContent).join('\n')

}