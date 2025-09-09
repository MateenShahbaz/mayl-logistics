import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import QRCode from "qrcode";
import JsBarcode from "jsbarcode";

// extend jsPDF type
declare module "jspdf" {
  interface jsPDF {
    lastAutoTable?: { finalY: number };
  }
}

const getBase64Image = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = (err) => reject(err);
    img.src = url;
  });
};

export const generatePDF = async (order: any) => {
  const doc = new jsPDF("p", "mm", "a4");

  const copies = parseInt(order.airwayBillsCopy, 10) || 1;
  const perPage = 3;
  const sectionHeight = 90;
  let sectionCount = 0;

  const logoBase64 = await getBase64Image("/images/logo/dark-logo.png");

  for (let i = 0; i < copies; i++) {
    if (sectionCount === perPage) {
      doc.addPage();
      sectionCount = 0;
    }

    const yOffset = sectionCount * sectionHeight + 10;

    doc.setDrawColor(150);
    doc.rect(10, yOffset, 190, sectionHeight - 5);

    const refCanvas = document.createElement("canvas");
    JsBarcode(refCanvas, order.refNumber || "0000", { format: "CODE128" });
    const refBarcode = refCanvas.toDataURL("image/png");

    const orderCanvas = document.createElement("canvas");
    JsBarcode(orderCanvas, order.orderNumber || "0000", { format: "CODE128" });
    const orderBarcode = orderCanvas.toDataURL("image/png");

    const qrCodeData = await QRCode.toDataURL(order.orderNumber || "000000");

    doc.addImage(logoBase64, "PNG", 12, yOffset + 2, 35, 15);
    doc.addImage(refBarcode, "PNG", 73, yOffset + 2, 40, 12);
    doc.addImage(orderBarcode, "PNG", 145, yOffset + 2, 40, 12);

    autoTable(doc, {
      startY: yOffset + 18,
      margin: { left: 12, right: 12 },
      head: [
        ["Consignee Information", "Shipment Information", "Order Information"],
      ],
      body: [
        [
          {
            content: `Name: ${order.customer.name}\nContact: ${order.customer.contactNumber}\nDelivery: ${order.customer.deliveryAddress}`,
            styles: { fontStyle: "bold" },
          },

          {
            content: `Pieces: ${order.items}\nOrder Ref: ${order.refNumber}\nTracking No: ${order.orderNumber}\nOrigin: Lahore\nDestination: Lahore\nReturn City: Lahore`,
            styles: { fontStyle: "bold" },
          },

          {
            content: `Date: ${new Date().toLocaleDateString()}\nOrder Type: ${
              order.orderType
            }\nAmount: ${order.amount}/-`,
            styles: { fontStyle: "bold" },
          },
        ],
      ],
      styles: { fontSize: 7, cellPadding: 2, valign: "top", lineWidth: 0.2 },
      headStyles: {
        fillColor: [220, 220, 220],
        textColor: 0,
        lineWidth: 0.2,
        halign: "center",
      },
      bodyStyles: {
        minCellHeight: 27,
        textColor: 0,
      },
      columnStyles: {
        0: { cellWidth: 63 },
        1: { cellWidth: 63 },
        2: { cellWidth: 60 },
      },
      didDrawCell: (data) => {
        if (
          data.section === "body" &&
          data.row.index < data.table.body.length - 1
        ) {
          const spacing = 2;
          doc.setDrawColor(255, 255, 255);
          doc.setLineWidth(spacing);
          doc.line(
            data.cell.x,
            data.cell.y + data.cell.height,
            data.cell.x + data.cell.width,
            data.cell.y + data.cell.height
          );
        }
      },
    });

    const tableY = doc.lastAutoTable?.finalY || yOffset + 30;
    doc.addImage(qrCodeData, "PNG", 167, yOffset + 26, 24, 24);

    autoTable(doc, {
      startY: tableY + 2,
      margin: { left: 12, right: 12 },
      head: [["Shipper Information", "Additional Information"]],
      body: [
        [
          `Name: ${order.merchant}\nPhone Number: ${order.shipperInfo.mobile}\nPickup Address: ${order.shipperInfo.pickupAddress}\nReturn Address: ${order.shipperInfo.returnAddress}`,

          `Remarks: ${order.notes || "N/A"}\n\nOrder Details: ${
            order.orderDetail || "N/A"
          }`,
        ],
      ],
      styles: { fontSize: 7, cellPadding: 2, valign: "top", lineWidth: 0.2 },
      headStyles: {
        fillColor: [220, 220, 220],
        textColor: 0,
        lineWidth: 0.2,
        halign: "center",
        fontStyle: "bold",
      },
      bodyStyles: {
        minCellHeight: 22,
        textColor: 0,
        lineWidth: 0.2,
      },
      columnStyles: {
        0: { cellWidth: 93 },
        1: { cellWidth: 93 },
      },
      pageBreak: "avoid",
    });

    sectionCount++;
  }

  doc.save("order.pdf");
};
