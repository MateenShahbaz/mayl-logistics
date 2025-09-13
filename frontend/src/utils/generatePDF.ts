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

export const generatePDFForOrders = async (orders: any[]) => {
  const doc = new jsPDF("p", "mm", "a4");
  const perPage = 3; // 3 airway bills per page
  const sectionHeight = 90;

  const logoBase64 = await getBase64Image("/images/logo/dark-logo.png");
  let sectionCount = 0;

  for (const order of orders) {
    const copies = parseInt(order.airwayBillsCopy, 10) || 1;

    for (let i = 0; i < copies; i++) {
      if (sectionCount === perPage) {
        doc.addPage();
        sectionCount = 0;
      }

      const yOffset = sectionCount * sectionHeight + 10;

      // Draw section border
      doc.setDrawColor(150);
      doc.rect(10, yOffset, 190, sectionHeight - 5);

      // Generate barcodes
      const refCanvas = document.createElement("canvas");
      JsBarcode(refCanvas, order.refNumber || "0000", { format: "CODE128" });
      const refBarcode = refCanvas.toDataURL("image/png");

      const orderCanvas = document.createElement("canvas");
      JsBarcode(orderCanvas, order.orderNumber || "0000", {
        format: "CODE128",
      });
      const orderBarcode = orderCanvas.toDataURL("image/png");

      const qrCodeData = await QRCode.toDataURL(order.orderNumber || "000000");

      // Header images
      doc.addImage(logoBase64, "PNG", 12, yOffset + 2, 35, 15);
      doc.addImage(refBarcode, "PNG", 73, yOffset + 2, 40, 12);
      doc.addImage(orderBarcode, "PNG", 145, yOffset + 2, 40, 12);

      // Table 1
      autoTable(doc, {
        startY: yOffset + 18,
        margin: { left: 12, right: 12 },
        head: [
          [
            "Consignee Information",
            "Shipment Information",
            "Order Information",
          ],
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
      });

      const tableY = doc.lastAutoTable?.finalY || yOffset + 30;
      doc.addImage(qrCodeData, "PNG", 167, yOffset + 26, 24, 24);

      // Table 2
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
        },
        columnStyles: {
          0: { cellWidth: 93 },
          1: { cellWidth: 93 },
        },
        pageBreak: "avoid",
      });

      sectionCount++;
    }
  }

  doc.save("orders.pdf");
};

export const generateLoadSheetPDF = async (
  orders: any[],
  shipperInfo: {
    shipperName: string;
    loadsheetNumber: string;
    personOfContact: string;
    pickupAddress: string;
    phoneNo: string;
    origin: string;
  }
) => {
  const doc = new jsPDF("p", "mm", "a4");

  // ✅ Company Logo (left side)
  const logoBase64 = await getBase64Image("/images/logo/dark-logo.png");
  doc.addImage(logoBase64, "PNG", 15, 10, 35, 15);

  // ✅ Title (center)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Load Sheet", 105, 18, { align: "center" });

  // ✅ QR Code (top-right corner)
  const qrCodeData = await QRCode.toDataURL(
    shipperInfo.loadsheetNumber || "N/A"
  );
  doc.addImage(qrCodeData, "PNG", 170, 10, 20, 20); // smaller & above table

  autoTable(doc, {
    startY: 35, // push table below QR code
    margin: { left: 15, right: 15 },
    body: [
      ["Shipper", shipperInfo.shipperName],
      ["Loadsheet Number", shipperInfo.loadsheetNumber],
      ["Person Of Contact", shipperInfo.personOfContact],
      ["Pickup Address", shipperInfo.pickupAddress],
      ["Phone No", shipperInfo.phoneNo],
      ["Origin", shipperInfo.origin],
      ["Total Shipment(s)", orders.length.toString()],
      [
        "Total Amount",
        orders.reduce((sum, o) => sum + (o.amount || 0), 0).toFixed(2),
      ],
    ],
    styles: { fontSize: 10, cellPadding: 2, lineWidth: 0.2 },
    columnStyles: {
      0: { cellWidth: 50, fontStyle: "bold" },
      1: { cellWidth: 130 },
    },
    theme: "grid",
  });

  // ✅ Orders Table (Colored Head Only)
  autoTable(doc, {
    startY: (doc.lastAutoTable?.finalY ?? 60) + 5,
    margin: { left: 15, right: 15 },
    head: [
      [
        "S.No",
        "Tracking No",
        "Order Reference",
        "Consignee Detail",
        "Booking Date",
        "Destination",
        "Invoice Amount",
      ],
    ],
    body: orders.map((o, index) => [
      index + 1,
      o.orderNumber,
      o.refNumber,
      `${o.customer.name} - ${o.customer.contactNumber}`,
      new Date(o.createdAt || Date.now()).toISOString().split("T")[0],
      o.customer.deliverCity,
      o.amount?.toFixed(2) || "0.00",
    ]),
    styles: {
      fontSize: 9,
      cellPadding: 2,
      lineWidth: 0.2,
      fillColor: false, // ❌ no background for body
    },
    headStyles: {
      fillColor: [220, 220, 220], // ✅ light gray header
      textColor: 0,
      fontStyle: "bold",
    },
    theme: "grid",
  });

  // ✅ Footer
  const finalY = (doc.lastAutoTable?.finalY ?? 40) + 20;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);

  doc.text("No of Shipments Received: _______________________", 15, finalY);
  doc.text("Client Signature ___________________", 150, finalY);

  doc.setFont("helvetica", "bold");
  doc.text("For Office Use", 105, finalY + 15, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.text("Rider Name: ___________________", 15, finalY + 35);
  doc.text("Shipment Picked at: ___________________", 15, finalY + 45);

  doc.text("Rider Signature ___________________", 15, finalY + 65);
  doc.text("Office Signature ___________________", 150, finalY + 65);

  doc.save("loadsheet.pdf");
};
