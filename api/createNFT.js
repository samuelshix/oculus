import html2canvas from "html2canvas";
import CreateNFT from "../components/CreateNFT";

const exportAsImage = async (el) => {
    const canvas = await html2canvas(el);
    const context = canvas.getContext("2d");
    const image = canvas.toDataURL("image/png", 1.0);
    const imageData = context?.getImageData(0, 0, canvas.width, canvas.height);
    const buffer = imageData?.data.buffer
    // download the image
    // downloadImage(image, "test.png");
    const NFT = await CreateNFT(buffer);
    console.log(NFT, NFT.json, NFT.address)
    return buffer
};
const downloadImage = (blob: string, fileName: string) => {
    const fakeLink = window.document.createElement("a");
    fakeLink.download = fileName;

    fakeLink.href = blob;

    document.body.appendChild(fakeLink);
    fakeLink.click();
    document.body.removeChild(fakeLink);

    fakeLink.remove();
}

export default exportAsImage;
