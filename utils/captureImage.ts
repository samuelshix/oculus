import html2canvas from "html2canvas";
import CreateNFT from "../components/CreateNFT";

const exportAsImage = async (el: HTMLDivElement) => {
    const canvas = await html2canvas(el);
    const context = canvas.getContext("2d");
    const image = canvas.toDataURL("image/png", 1.0);
    const imageData = context?.getImageData(0, 0, canvas.width, canvas.height);
    const buffer = imageData?.data.buffer
    // download the image
    // downloadImage(image, "test.png");
    const NFT = await CreateNFT(buffer);
    console.log(NFT, NFT.json, NFT.address)
    return el
};
const downloadImage = async (el: HTMLDivElement) => {
    const canvas = await html2canvas(el);
    const context = canvas.getContext("2d");
    const image = canvas.toDataURL("image/png", 1.0);
    const fakeLink = window.document.createElement("a");

    fakeLink.download = "test.png";

    fakeLink.href = image;

    document.body.appendChild(fakeLink);
    fakeLink.click();
    document.body.removeChild(fakeLink);

    fakeLink.remove();
}

export default exportAsImage;
// "browserslist": {
//     "production": [
//       "chrome >= 67",
//       "edge >= 79",
//       "firefox >= 68",
//       "opera >= 54",
//       "safari >= 14"
//     ]
//   }