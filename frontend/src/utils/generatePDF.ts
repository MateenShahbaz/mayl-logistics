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
    JsBarcode(refCanvas, order.refNumber || "0000", {
      format: "CODE128",
      displayValue: true,
      font: "monospace",
      fontSize: 15,
      textMargin: 4,
      margin: 4,
      width: 1.5,
      height: 45,
    });
    const refBarcode = refCanvas.toDataURL("image/png");

    const orderCanvas = document.createElement("canvas");
    JsBarcode(orderCanvas, order.orderNumber || "0000", {
      format: "CODE128",
      displayValue: true,
      font: "monospace",
      fontSize: 15,
      textMargin: 4,
      margin: 4,
      width: 1.5,
      height: 45,
    });
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

      const refCanvas = document.createElement("canvas");
      JsBarcode(refCanvas, order.refNumber || "0000", {
        format: "CODE128",
        displayValue: true,
        font: "monospace",
        fontSize: 15,
        textMargin: 4,
        margin: 4,
        width: 1.5,
        height: 45,
      });
      const refBarcode = refCanvas.toDataURL("image/png");

      const orderCanvas = document.createElement("canvas");
      JsBarcode(orderCanvas, order.orderNumber || "0000", {
        format: "CODE128",
        displayValue: true,
        font: "monospace",
        fontSize: 15,
        textMargin: 4,
        margin: 4,
        width: 1.5,
        height: 45,
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
  },
  riderInfo?: {
    name: string;
    phoneNo: string;
    employeeCode: string;
  }
) => {
  const doc = new jsPDF("p", "mm", "a4");

  // ✅ Logo
  const logoBase64 = await getBase64Image("/images/logo/dark-logo.png");
  doc.addImage(logoBase64, "PNG", 15, 10, 35, 15);

  // ✅ Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Load Sheet", 105, 18, { align: "center" });

  // ✅ QR Code
  const qrCodeData = await QRCode.toDataURL(
    shipperInfo.loadsheetNumber || "N/A"
  );
  doc.addImage(qrCodeData, "PNG", 170, 10, 20, 20);

  // ✅ Shipper + Rider Info Table
  autoTable(doc, {
    startY: 35,
    margin: { left: 15, right: 15 },
    head: [["Shipper Info", "Rider Info"]],
    body: [
      [
        `Shipper: ${shipperInfo.shipperName}`,
        `Rider Name: ${riderInfo?.name || "N/A"}`,
      ],
      [
        `Loadsheet #: ${shipperInfo.loadsheetNumber}`,
        `Employee Code: ${riderInfo?.employeeCode || "N/A"}`,
      ],
      [
        `Person Of Contact: ${shipperInfo.personOfContact}`,
        `Phone: ${riderInfo?.phoneNo || "N/A"}`,
      ],
      [`Pickup Address: ${shipperInfo.pickupAddress}`, ""],
      [`Phone No: ${shipperInfo.phoneNo}`, ""],
      [`Origin: ${shipperInfo.origin}`, ""],
      [`Total Shipment(s): ${orders.length}`, ""],
      [
        `Total Amount: ${orders
          .reduce((sum, o) => sum + (o.amount || 0), 0)
          .toFixed(2)}`,
        "",
      ],
    ],
    styles: { fontSize: 10, cellPadding: 2, lineWidth: 0.2 },
    columnStyles: {
      0: { cellWidth: 90 },
      1: { cellWidth: 90 },
    },
    headStyles: { fillColor: [220, 220, 220], textColor: 0, fontStyle: "bold" },
    theme: "grid",
  });

  // ✅ Orders Table
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
    styles: { fontSize: 9, cellPadding: 2, lineWidth: 0.2 },
    headStyles: { fillColor: [220, 220, 220], textColor: 0, fontStyle: "bold" },
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
  doc.text("Rider Signature ___________________", 15, finalY + 35);
  doc.text("Office Signature ___________________", 150, finalY + 35);

  doc.save("loadsheet.pdf");
};

// export const deliveryRouteSheetPdf = (
//   tableData: any[],
//   courierId: string,
//   sheetNumber: string,
//   createdAt: string
// ) => {
//   const doc = new jsPDF("p", "mm", "a4");
//   doc.setFont("helvetica");
//   doc.setFontSize(10);

//   const pageWidth = doc.internal.pageSize.getWidth();
//   const pageHeight = doc.internal.pageSize.getHeight();

//   // ======= HEADER =======
//   doc.setFontSize(14);
//   doc.setFont("helvetica", "bold");
//   doc.text("Courier Route Sheet", 14, 10);

//   const disclaimer =
//     "Rider is responsible for lost or mishandled shipments. No excuse for missing COD/parcels. Every delivery requires signature/stamp; non-delivery must have remarks. Negligence will face action.";

//   doc.setFont("helvetica", "normal");
//   doc.setFontSize(6);

//   const disclaimerWidth = pageWidth - 110;
//   const disclaimerX = pageWidth - disclaimerWidth - 14;
//   const disclaimerY = 10;

//   const disclaimerLines = doc.splitTextToSize(disclaimer, disclaimerWidth);
//   doc.text(disclaimerLines, disclaimerX, disclaimerY, {
//     maxWidth: disclaimerWidth,
//   });

//   const leftX = 14;
//   const rightX = pageWidth - 70;
//   const formattedDate = new Date(createdAt).toLocaleDateString();
//   doc.setFontSize(10);
//   doc.text(`Courier ID: ${courierId || "-"}`, leftX, 16);
//   doc.text(`Branch: Lahore`, rightX, 16);

//   doc.setFontSize(9);
//   doc.text(`Sheet Number: ${sheetNumber}`, leftX, 21);
//   doc.text(`Date: ${formattedDate}`, rightX, 21);

//   doc.text(`Total Records: ${tableData.length}`, leftX, 26);
//   doc.text(
//     `Total Amount: ${tableData.reduce(
//       (acc, it) => acc + (it.amount || 0),
//       0
//     )}`,
//     rightX,
//     26
//   );

//   // ======= LAYOUT VARS =======
//   const marginLeft = 10;
//   const marginRight = 10;
//   const gapBetweenBoxes = 8;
//   const usableWidth = pageWidth - marginLeft - marginRight;
//   const boxWidth = (usableWidth - gapBetweenBoxes) / 2;
//   const startYInitial = 32;
//   let startY = startYInitial;

//   const refTotal = 90;
//   const colProps = { count: 8, tracking: 38, info: 20, ref: 20 };
//   const colWidths = {
//     count: (colProps.count / refTotal) * boxWidth,
//     tracking: (colProps.tracking / refTotal) * boxWidth,
//     info: (colProps.info / refTotal) * boxWidth,
//     ref: (colProps.ref / refTotal) * boxWidth,
//   };

//   const headerHeight = 7;
//   const bodyLineHeight = 5;
//   const minBodyLines = 3;
//   const innerPadding = 1;
//   const rowSpacing = 0.5;
//   const bottomMargin = 25;

//   const drawBox = (
//     row: any,
//     x: number,
//     y: number,
//     width: number,
//     height: number,
//     indexSerial: number
//   ) => {
//     doc.roundedRect(x, y, width, height, 2, 2);

//     const v1 = x + colWidths.count;
//     const v2 = v1 + colWidths.tracking;
//     const v3 = v2 + colWidths.info;
//     doc.setLineWidth(0.3);
//     doc.line(v1, y, v1, y + height);
//     doc.line(v2, y, v2, y + height);
//     doc.line(v3, y, v3, y + height);

//     const headerY = y + headerHeight;
//     doc.line(x, headerY, x + width, headerY);

//     const colX = {
//       count: x + innerPadding,
//       tracking: v1 + innerPadding,
//       info: v2 + innerPadding,
//       ref: v3 + innerPadding,
//     };

//     doc.setFontSize(7);

//     doc.text(String(indexSerial), colX.count, y + 5);

//     doc.setFont("helvetica", "bold");
//     doc.text(
//       String(row.orderNumber || row.trackingNo || "-"),
//       colX.tracking,
//       y + 5,
//       { maxWidth: colWidths.tracking - innerPadding }
//     );
//     doc.setFont("helvetica", "normal");

//     doc.text("Order Info", colX.info, y + 5);

//     doc.setFont("helvetica", "bold");
//     doc.text(String(row.refNumber || "-"), colX.ref, y + 5, {
//       maxWidth: colWidths.ref - innerPadding,
//     });
//     doc.setFont("helvetica", "normal");

//     const trackingMaxW = colWidths.tracking - innerPadding * 1.5;
//     const address = row.customer?.deliveryAddress || row.address || "";
//     const addressLines = address
//       ? doc.splitTextToSize(String(address), trackingMaxW)
//       : [];

//     const firstBodyY = headerY + bodyLineHeight;
//     doc.setFontSize(6);
//     doc.text("Pcs:", colX.count, firstBodyY);
//     doc.text(`${row.items || 1}`, colX.count + 2, firstBodyY + 2);
//     doc.text("Wt:", colX.count, firstBodyY + 6);
//     doc.text(`${row.actualWeight ?? 0}`, colX.count + 2, firstBodyY + 8);
//     doc.setFontSize(6);
//     const addressLineHeight = 3.2;
//     let addrY = firstBodyY;
//     addressLines.forEach((line: any) => {
//       doc.text(line, colX.tracking, addrY, { maxWidth: trackingMaxW });
//       addrY += addressLineHeight;
//     });

//     doc.text(
//       `${row.customer?.contactNumber || row.phone || "-"}`,
//       colX.info,
//       firstBodyY
//     );
//     doc.setFontSize(6);
//     doc.text(`Mayl logistics COD`, colX.info, firstBodyY + bodyLineHeight);
//     doc.setFontSize(7);

//     doc.text("Status:", colX.ref, firstBodyY);
//   };

//   const addFooter = () => {
//     const footerY = pageHeight - 12;
//     const colWidth = pageWidth / 4;
//     const roles = ["Courier Officer", "Security Officer", "Ops Supervisor", "AMO"];

//     doc.setFontSize(8);
//     roles.forEach((role, i) => {
//       const x = i * colWidth + 10;
//       doc.text(`${role}: ____________________`, x, footerY);
//     });
//   };

//   for (let i = 0; i < tableData.length; i += 2) {
//     const left = tableData[i];
//     const right = tableData[i + 1];

//     const leftAddrLines = doc.splitTextToSize(
//       String(left?.customer?.deliveryAddress || left?.address || ""),
//       colWidths.tracking - innerPadding
//     );
//     const rightAddrLines = right
//       ? doc.splitTextToSize(
//           String(right?.customer?.deliveryAddress || right?.address || ""),
//           colWidths.tracking - innerPadding
//         )
//       : [];

//     const leftNeededLines = Math.max(minBodyLines, leftAddrLines.length);
//     const rightNeededLines = Math.max(minBodyLines, rightAddrLines.length);
//     const neededBodyLines = Math.max(leftNeededLines, rightNeededLines);
//     const rowHeight =
//       headerHeight + neededBodyLines * bodyLineHeight + innerPadding * 2 + 1;

//     if (startY + rowHeight + bottomMargin > pageHeight) {
//       addFooter();
//       doc.addPage();
//       startY = startYInitial;
//     }

//     drawBox(left, marginLeft, startY, boxWidth, rowHeight, i + 1);
//     if (right) {
//       drawBox(
//         right,
//         marginLeft + boxWidth + gapBetweenBoxes,
//         startY,
//         boxWidth,
//         rowHeight,
//         i + 2
//       );
//     }

//     startY += rowHeight + rowSpacing;
//   }

//   addFooter();
//   doc.save(`RouteSheetDelivery.pdf`);
// };

export const deliveryRouteSheetPdf = (
  tableData: any[],
  courierId: string,
  sheetNumber: string,
  createdAt: string
) => {
  const doc = new jsPDF("p", "mm", "a4");
  doc.setFont("helvetica");
  doc.setFontSize(10);

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // ======= HEADER FUNCTION =======
  const addHeader = () => {
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Courier Route Sheet", 14, 10);

    const disclaimer =
      "Rider is responsible for lost or mishandled shipments. No excuse for missing COD/parcels. Every delivery requires signature/stamp; non-delivery must have remarks. Negligence will face action.";

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6);

    const disclaimerWidth = pageWidth - 110;
    const disclaimerX = pageWidth - disclaimerWidth - 14;
    const disclaimerY = 10;

    const disclaimerLines = doc.splitTextToSize(disclaimer, disclaimerWidth);
    doc.text(disclaimerLines, disclaimerX, disclaimerY, {
      maxWidth: disclaimerWidth,
    });

    const leftX = 14;
    const rightX = pageWidth - 70;
    const formattedDate = new Date(createdAt).toLocaleDateString();
    doc.setFontSize(10);
    doc.text(`Courier ID: ${courierId || "-"}`, leftX, 16);
    doc.text(`Branch: Lahore`, rightX, 16);

    doc.setFontSize(9);
    doc.text(`Sheet Number: ${sheetNumber}`, leftX, 21);
    doc.text(`Date: ${formattedDate}`, rightX, 21);

    doc.text(`Total Records: ${tableData.length}`, leftX, 26);
    doc.text(
      `Total Amount: ${tableData.reduce(
        (acc, it) => acc + (it.amount || 0),
        0
      )}`,
      rightX,
      26
    );
  };

  // ======= FOOTER FUNCTION =======
  const addFooter = () => {
    const footerY = pageHeight - 12;
    const colWidth = pageWidth / 4;
    const roles = ["Courier Officer", "Security Officer", "Ops Supervisor", "AMO"];

    doc.setFontSize(8);
    roles.forEach((role, i) => {
      const x = i * colWidth + 10;
      doc.text(`${role}: ____________________`, x, footerY);
    });
  };

  // Call header on first page
  addHeader();

  // ======= LAYOUT VARS =======
  const marginLeft = 10;
  const marginRight = 10;
  const gapBetweenBoxes = 8;
  const usableWidth = pageWidth - marginLeft - marginRight;
  const boxWidth = (usableWidth - gapBetweenBoxes) / 2;
  const startYInitial = 32;
  let startY = startYInitial;

  const refTotal = 90;
  const colProps = { count: 8, tracking: 38, info: 20, ref: 20 };
  const colWidths = {
    count: (colProps.count / refTotal) * boxWidth,
    tracking: (colProps.tracking / refTotal) * boxWidth,
    info: (colProps.info / refTotal) * boxWidth,
    ref: (colProps.ref / refTotal) * boxWidth,
  };

  const headerHeight = 7;
  const bodyLineHeight = 5;
  const minBodyLines = 3;
  const innerPadding = 1;
  const rowSpacing = 0.5;
  const bottomMargin = 25;

  const drawBox = (
    row: any,
    x: number,
    y: number,
    width: number,
    height: number,
    indexSerial: number
  ) => {
    doc.roundedRect(x, y, width, height, 2, 2);

    const v1 = x + colWidths.count;
    const v2 = v1 + colWidths.tracking;
    const v3 = v2 + colWidths.info;
    doc.setLineWidth(0.3);
    doc.line(v1, y, v1, y + height);
    doc.line(v2, y, v2, y + height);
    doc.line(v3, y, v3, y + height);

    const headerY = y + headerHeight;
    doc.line(x, headerY, x + width, headerY);

    const colX = {
      count: x + innerPadding,
      tracking: v1 + innerPadding,
      info: v2 + innerPadding,
      ref: v3 + innerPadding,
    };

    doc.setFontSize(7);

    doc.text(String(indexSerial), colX.count, y + 5);

    doc.setFont("helvetica", "bold");
    doc.text(
      String(row.orderNumber || row.trackingNo || "-"),
      colX.tracking,
      y + 5,
      { maxWidth: colWidths.tracking - innerPadding }
    );
    doc.setFont("helvetica", "normal");

    doc.text("Order Info", colX.info, y + 5);

    doc.setFont("helvetica", "bold");
    doc.text(String(row.refNumber || "-"), colX.ref, y + 5, {
      maxWidth: colWidths.ref - innerPadding,
    });
    doc.setFont("helvetica", "normal");

    const trackingMaxW = colWidths.tracking - innerPadding * 1.5;
    const address = row.customer?.deliveryAddress || row.address || "";
    const addressLines = address
      ? doc.splitTextToSize(String(address), trackingMaxW)
      : [];

    const firstBodyY = headerY + bodyLineHeight;
    doc.setFontSize(6);
    doc.text("Pcs:", colX.count, firstBodyY);
    doc.text(`${row.items || 1}`, colX.count + 2, firstBodyY + 2);
    doc.text("Wt:", colX.count, firstBodyY + 6);
    doc.text(`${row.actualWeight ?? 0}`, colX.count + 2, firstBodyY + 8);
    doc.setFontSize(6);
    const addressLineHeight = 3.2;
    let addrY = firstBodyY;
    addressLines.forEach((line: any) => {
      doc.text(line, colX.tracking, addrY, { maxWidth: trackingMaxW });
      addrY += addressLineHeight;
    });

    doc.text(
      `${row.customer?.contactNumber || row.phone || "-"}`,
      colX.info,
      firstBodyY
    );
    doc.setFontSize(6);
    doc.text(`Mayl logistics COD`, colX.info, firstBodyY + bodyLineHeight);
    doc.setFontSize(7);

    doc.text("Status:", colX.ref, firstBodyY);
  };

  for (let i = 0; i < tableData.length; i += 2) {
    const left = tableData[i];
    const right = tableData[i + 1];

    const leftAddrLines = doc.splitTextToSize(
      String(left?.customer?.deliveryAddress || left?.address || ""),
      colWidths.tracking - innerPadding
    );
    const rightAddrLines = right
      ? doc.splitTextToSize(
          String(right?.customer?.deliveryAddress || right?.address || ""),
          colWidths.tracking - innerPadding
        )
      : [];

    const leftNeededLines = Math.max(minBodyLines, leftAddrLines.length);
    const rightNeededLines = Math.max(minBodyLines, rightAddrLines.length);
    const neededBodyLines = Math.max(leftNeededLines, rightNeededLines);
    const rowHeight =
      headerHeight + neededBodyLines * bodyLineHeight + innerPadding * 2 + 1;

    if (startY + rowHeight + bottomMargin > pageHeight) {
      addFooter();
      doc.addPage();
      addHeader();
      startY = startYInitial;
    }

    drawBox(left, marginLeft, startY, boxWidth, rowHeight, i + 1);
    if (right) {
      drawBox(
        right,
        marginLeft + boxWidth + gapBetweenBoxes,
        startY,
        boxWidth,
        rowHeight,
        i + 2
      );
    }

    startY += rowHeight + rowSpacing;
  }

  addFooter();
  doc.save(`RouteSheetDelivery.pdf`);
};