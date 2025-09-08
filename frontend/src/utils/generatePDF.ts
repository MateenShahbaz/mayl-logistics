import jsPDF from "jspdf";
import QRCode from "qrcode";
import JsBarcode from "jsbarcode";

// helper: convert image url → base64
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
  const doc = new jsPDF();

  const copies = parseInt(order.airwayBillsCopy, 10) || 1;
  const perPage = 3;
  let sectionCount = 0;

  // get logo
  const logoBase64 = await getBase64Image("/images/logo/web-logo.png");

  for (let i = 0; i < copies; i++) {
    if (sectionCount === perPage) {
      doc.addPage();
      sectionCount = 0;
    }

    const yOffset = sectionCount * 90 + 10;

    // barcodes
    const refCanvas = document.createElement("canvas");
    JsBarcode(refCanvas, order.refNumber || "0000", { format: "CODE128" });
    const refBarcode = refCanvas.toDataURL("image/png");

    const orderCanvas = document.createElement("canvas");
    JsBarcode(orderCanvas, order.orderNumber || "0000", { format: "CODE128" });
    const orderBarcode = orderCanvas.toDataURL("image/png");

    // qr code
    const qrCodeData = await QRCode.toDataURL(order.orderNumber || "000000");

    // section outer border (lighter gray, 1px)
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.2);
    doc.rect(10, yOffset, 190, 85);

    // ---------- TOP ROW (Logo + Barcodes) ----------
    doc.addImage(logoBase64, "PNG", 12, yOffset + 2, 20, 12);
    doc.addImage(refBarcode, "PNG", 100, yOffset + 2, 45, 12);
    doc.addImage(orderBarcode, "PNG", 150, yOffset + 2, 45, 12);

    // ---------- CONSIGNEE / SHIPMENT / ORDER INFO ----------
    doc.setFillColor(220, 220, 220);
    doc.rect(10, yOffset + 18, 190, 6, "F");

    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("Consignee Information", 15, yOffset + 22);
    doc.text("Shipment Information", 85, yOffset + 22);
    doc.text("Order Information", 145, yOffset + 22);

    doc.setFont("helvetica", "normal");
    let rowY = yOffset + 28;

    // Consignee Info
    doc.text(`Name: ${order.customer.name}`, 15, rowY);
    doc.text(`Contact: ${order.customer.contactNumber}`, 15, rowY + 5);

    const deliveryText = doc.splitTextToSize(
      `Delivery: ${order.customer.deliveryAddress}`,
      70
    );
    doc.text(deliveryText, 15, rowY + 10);

    // Shipment Info
    doc.text(`Pieces: ${order.items}`, 85, rowY);
    doc.text(`Order Ref: ${order.refNumber}`, 85, rowY + 5);
    doc.setFont("helvetica", "bold");
    doc.text(`Tracking No: ${order.orderNumber}`, 85, rowY + 10);
    doc.setFont("helvetica", "normal");
    doc.text(`Origin: Lahore`, 85, rowY + 15);
    doc.text(`Destination: Lahore`, 85, rowY + 20);

    // Order Info
    doc.setFont("helvetica", "bold");
    doc.text(`Amount: ${order.amount}/-`, 145, rowY);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 145, rowY + 5);
    doc.text(`Order Type: ${order.orderType}`, 145, rowY + 10);

    // ---------- SHIPPER INFO ----------
    // 🔽 move it more below (was +50, now +60 for extra spacing)
    const shipperY = yOffset + 60;

    doc.setFillColor(220, 220, 220);
    doc.rect(10, shipperY - 5, 190, 6, "F");

    doc.setFont("helvetica", "bold");
    doc.text("Shipper Information", 15, shipperY - 1);

    doc.setFont("helvetica", "normal");
    doc.text(`Name: ${order.merchant}`, 15, shipperY + 5);

    const pickupText = doc.splitTextToSize(
      `Pickup: ${order.shipperInfo.pickupAddress}`,
      140
    );
    doc.text(pickupText, 15, shipperY + 10);

    const pickupHeight = pickupText.length * 3.5; // tighter line gap
    const returnY = shipperY + 10 + pickupHeight + 3;

    const returnText = doc.splitTextToSize(
      `Return: ${order.shipperInfo.returnAddress}`,
      140
    );
    doc.text(returnText, 15, returnY);

    // ---------- QR CODE BELOW ----------
    doc.addImage(qrCodeData, "PNG", 175, shipperY + 3, 18, 18);

    sectionCount++;
  }

  doc.save("order.pdf");
};
