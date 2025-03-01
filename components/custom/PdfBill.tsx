"use client";
import { Button } from "@/components/ui/button";
import { BillType } from "@/lib/models";
import pdfMake from "pdfmake";
import { FaRegFilePdf } from "react-icons/fa6";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const _pdfMake = pdfMake as any;

_pdfMake.fonts = {
  // download default Roboto font from cdnjs.com
  Roboto: {
    normal:
      "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf",
    bold: "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Medium.ttf",
    italics:
      "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Italic.ttf",
    bolditalics:
      "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-MediumItalic.ttf",
  },
};

export function generateBillPDF(data: BillType) {
  // Define the document structure
  const docDefinition = {
    content: [
      {
        text: "AAROVY",
        style: "header",
        alignment: "center",
        bold: true,
      },
      {
        text: `Flat/Meter No.: ${data.flat}`,
        alignment: "center",
        margin: [0, 5],
      },
      {
        text: [
          `For the month of ${data.month} ${data.year}, `,
          `Recorded on dt. ${data.recordedOn}`,
        ],
        alignment: "center",
        margin: [0, 5],
      },
      {
        text: `Name of the Guest: ${data.guestName}`,
        alignment: "center",
        margin: [0, 5],
      },
      {
        table: {
          headerRows: 0,
          widths: ["75%", "25%"],
          body: [
            [
              { text: "Description", alignment: "center", bold: true },
              { text: "Value", alignment: "center", bold: true },
            ],
            [
              "A. Opening unit",
              { text: data.openingUnit.toString(), alignment: "right" },
            ],
            [
              "B. Closing unit",
              { text: data.closingUnit.toString(), alignment: "right" },
            ],
            [
              "C. Used unit",
              { text: data.usedUnit.toString(), alignment: "right" },
            ],
            [
              "D. Common tenants",
              { text: data.commonTenants.toString(), alignment: "right" },
            ],
            [
              "E. Common open unit",
              { text: data.commonOpenUnit.toString(), alignment: "right" },
            ],
            [
              "F. Common close unit",
              { text: data.commonCloseUnit.toString(), alignment: "right" },
            ],
            [
              "G. Common used unit ((F-E)/D)",
              { text: data.commonUsedUnit.toString(), alignment: "right" },
            ],
            [
              "H. Chargeable unit (C+G)",
              { text: data.chargeableUnit.toString(), alignment: "right" },
            ],
            [
              "I. Main meter billed",
              { text: data.mainMeterBilled.toString(), alignment: "right" },
            ],
            [
              "J. Main meter consumed unit",
              {
                text: data.mainMeterConsumedUnit.toString(),
                alignment: "right",
              },
            ],
            [
              "K. Rate per unit (I/J)",
              { text: data.ratePerUnit.toString(), alignment: "right" },
            ],
            [
              "L. Subtotal (I+J+K)",
              { text: data.subTotal.toString(), alignment: "right" },
            ],
            [
              "M. Other misc. charges",
              { text: data.otherMiscCharges.toString(), alignment: "right" },
            ],
            [
              "N. Society maintenance charges",
              {
                text: data.societyMaintenanceCharges.toString(),
                alignment: "right",
              },
            ],
            [
              "O. Parking charges",
              { text: data.parkingCharges.toString(), alignment: "right" },
            ],
            [
              "P. House rent for month",
              { text: data.houseRent.toString(), alignment: "right" },
            ],
            [
              "Q. Arrears",
              { text: data.arrears.toString(), alignment: "right" },
            ],
            [
              "R. Adjustment",
              { text: data.adjustment.toString(), alignment: "right" },
            ],
            [
              "S. Grand total (L+M+N+O+P+Q+H)",
              { text: data.grandTotal.toString(), alignment: "right" },
            ],
          ],
        },
        layout: {
          paddingLeft: function () {
            return 8;
          },
          paddingRight: function () {
            return 8;
          },
          paddingTop: function () {
            return 5;
          },
          paddingBottom: function () {
            return 5;
          },
        },
      },

      {
        text: "Kindly deposit by 5th of every month. UPI ID: aarovy@axl",
        alignment: "center",
        margin: [0, 20],
        bold: true,
      },
    ],
    styles: {
      header: {
        fontSize: 18,
        bold: true,
        margin: [0, 10],
      },
    },
  };

  // Create the PDF document
  const pdfDoc = _pdfMake.createPdf(docDefinition);

  // Return an object with methods to handle the PDF
  return {
    open: () => pdfDoc.open(),
    download: (filename = `bill_${data.year}_${data.month}_${data.flat}.pdf`) =>
      pdfDoc.download(filename),
    print: () => pdfDoc.print(),
  };
}

export default function BillsPDFPage(props: { bill: BillType }) {
  return (
    <div className="mt-2">
      {/* <Button
        onClick={() => {
          // Test PDF generation
          generateBillPDF(props.bill).download();
        }}
      >
        Generate PDF
      </Button> */}
      <Button
        className="w-full"
        onClick={() => {
          // Generate PDF and get blob URL
          generateBillPDF(props.bill).open();
        }}
      >
        <FaRegFilePdf className="mr-2" /> Generate PDF
      </Button>
    </div>
  );
}
