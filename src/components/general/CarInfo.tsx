import Image from "next/image";
import React from "react";

interface Document {
  id: string;
  url: string;
  title: string;
}

interface CarInfoProps {
  documents: Document[];
  description?: string;
}

const isDataUrl = (url: string) => url.startsWith("data:");

const dataUrlToObjectUrl = (dataUrl: string) => {
  const arr = dataUrl.split(",");
  if (arr.length < 2) return null;
  const mime = arr[0].match(/:(.*?);/)?.[1] || "application/octet-stream";
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  const blob = new Blob([u8arr], { type: mime });
  return URL.createObjectURL(blob);
};

const CarInfo: React.FC<CarInfoProps> = ({ documents, description }) => {
  const getDocumentIcon = (url: string) => {
    if (url.toLowerCase().endsWith('.pdf')) {
      return "/icons/file-pdf.svg";
    }
    return "/icons/file-contract.svg";
  };

  return (
    <div className="p-5 bg-[#efeaea] m-5 rounded-xl mt-5">
      <p className="text-[#000000] text-md mb-2 font-medium">About this item</p>
      <p className="text-[#666666] text-sm">
        {description || "No description available."}
      </p>
      {documents.length > 0 && (
        <>
          <h2 className="font-semibold text-lg mt-3 mb-2">Support Documents</h2>
          <div className="justify-start flex flex-wrap items-center gap-7 text-sm text-[#666666]">
            {documents.map((doc) => (
              <button
                key={doc.id}
                onClick={(e) => {
                  e.preventDefault();
                  if (!doc.url) return;
                  if (isDataUrl(doc.url)) {
                    const objUrl = dataUrlToObjectUrl(doc.url);
                    if (objUrl) {
                      window.open(objUrl, "_blank", "noopener,noreferrer");
                    }
                  } else {
                    window.open(doc.url, "_blank", "noopener,noreferrer");
                  }
                }}
                className="flex gap-2 items-center hover:text-[#EE8E32] transition-colors cursor-pointer"
              >
                <Image
                  src={getDocumentIcon(doc.url)}
                  alt="document icon"
                  width={20}
                  height={20}
                />
                <span className="text-sm">{doc.title}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default CarInfo;
