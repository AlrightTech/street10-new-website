import Image from "next/image";
import React from "react";

const CarInfo = () => {
  return (
    <div className="p-5 bg-[#efeaea] m-5 rounded-xl mt-5">
      <p className="text-[#000000] text-md mb-2 font-medium">About this item</p>
      <p className="text-[#666666] text-sm">
        Lorem Ipsum is simply dummy text of the printing and typesetting
        industry. Lorem Ipsum has been the industry&apos;s standard dummy text
        ever since the 1500s,
      </p>
      <h2 className="font-semibold text-lg mt-3 mb-2">Support Documents</h2>
      <div className="justify-start flex items-center gap-7 text-sm  text-[#666666]">
        <p className="flex gap-2">
          <Image src="/icons/file-pdf.svg" alt="icon" width={20} height={20} />
          Certificate of Authenticity (PDF)
        </p>
        <p className="flex gap-2">
          <Image
            src="/icons/file-contract.svg"
            alt="icon"
            width={20}
            height={20}
          />
          Ownership Proof
        </p>
        <p className="flex gap-2">
          {" "}
          <Image
            src="/icons/document-3-fill.svg"
            alt="icon"
            width={20}
            height={20}
          />
          Exhibition Record
        </p>
        <p className="flex gap-2">
          <Image
            src="/icons/dollar-solid.svg"
            alt="icon"
            width={20}
            height={20}
          />
          Appraisal Report
        </p>
      </div>
    </div>
  );
};

export default CarInfo;
