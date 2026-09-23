import { format } from "date-fns";
import api from "../api/axios";

export const printInvoice = async (invoiceID) => {
  try {
    // Get invoice
    const response = await api.get(`/Invoice/${invoiceID}`);

    const inv =
      response?.data?.invoice ??
      response?.data?.data ??
      response?.data;

    if (!inv) {
      throw new Error("Invoice data not found");
    }

    // Get items
    const itemsResponse = await api.get("/Item/GetList");

    const items = Array.isArray(itemsResponse.data)
      ? itemsResponse.data
      : itemsResponse?.data?.data || [];

    // Get company
    const storedCompany = localStorage.getItem("company");

    const company = storedCompany
      ? JSON.parse(storedCompany)
      : {
          currencySymbol: "$",
        };

    const currency = company?.currencySymbol || "$";

    // Create iframe
    const iframe = document.createElement("iframe");

    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";

    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;

    const html = `
      <html>
        <head>
          <style>
            * {
              box-sizing: border-box;
            }

            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              padding: 30px;
              color: #333;
            }

            .invoice-title {
              text-align: center;
              margin-bottom: 30px;
            }

            .invoice-title h1 {
              margin: 0;
              font-size: 34px;
              font-weight: bold;
              letter-spacing: 2px;
              color: #222;
            }

            .invoice-title p {
              margin: 8px 0 0;
              font-size: 16px;
              color: #555;
            }

            .header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              border-bottom: 2px solid #333;
              padding-bottom: 15px;
              margin-bottom: 30px;
            }

            .brand {
              font-size: 26px;
              font-weight: bold;
              color: #1976d2;
            }

            .inv-details {
              text-align: right;
              font-size: 14px;
              line-height: 1.7;
            }

            .billed-to {
              margin-bottom: 30px;
              line-height: 1.6;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }

            th {
              background: #f5f5f5;
              border: 1px solid #ddd;
              padding: 12px;
              font-size: 13px;
              text-align: left;
            }

            td {
              border: 1px solid #ddd;
              padding: 12px;
              font-size: 14px;
            }

            .text-right {
              text-align: right;
            }

            .totals-box {
              width: 300px;
              margin-top: 25px;
              margin-left: auto;
            }

            .row {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
            }

            .grand-total {
              border-top: 2px solid #333;
              margin-top: 10px;
              padding-top: 10px;
              font-weight: bold;
              font-size: 18px;
            }

            .footer-notes {
              margin-top: 50px;
              border-top: 1px solid #ddd;
              padding-top: 15px;
              font-size: 13px;
              color: #666;
            }

            @media print {
              body {
                padding: 20px;
              }
            }
          </style>

          <title>Invoice ${inv.invoiceNo || inv.invoiceID}</title>
        </head>

        <body>

          <div class="invoice-title">
            <h1>INVOICE</h1>
            <p>
              <strong>Invoice No:</strong>
              ${inv.invoiceNo || inv.invoiceID || "-"}
            </p>
          </div>

          <div class="header">

            <div class="brand">
              InvoiceApp
            </div>

            <div class="inv-details">
              <div>
                <strong>Date:</strong>
                ${
                  inv.invoiceDate
                    ? format(
                        new Date(inv.invoiceDate),
                        "dd MMM yyyy"
                      )
                    : "-"
                }
              </div>
            </div>

          </div>

          <div class="billed-to">
            <strong>Billed To:</strong><br/>

            ${inv.customerName || "-"}<br/>

            ${inv.address || ""}

            ${
              inv.address && inv.city
                ? "<br/>"
                : ""
            }

            ${inv.city || ""}
          </div>

          <table>

            <thead>
              <tr>
                <th>Item Name</th>
                <th>Description</th>
                <th class="text-right">Qty</th>
                <th class="text-right">Rate</th>
                <th class="text-right">Disc %</th>
                <th class="text-right">Amount</th>
              </tr>
            </thead>

            <tbody>

              ${
                Array.isArray(inv.items)
                  ? inv.items
                      .map((line) => {
                        const item = items.find(
                          (i) =>
                            Number(i.itemId) ===
                            Number(line.itemId)
                        );

                        const itemName =
                          line.itemName ||
                          item?.itemName ||
                          "-";

                        const description =
                          line.description ||
                          item?.description ||
                          "-";

                        const qty =
                          Number(line.quantity) || 0;

                        const rate =
                          Number(line.salesRate) || 0;

                        const disc =
                          Number(line.discountPct) || 0;

                        const amount =
                          Number(line.amount) ||
                          qty *
                            rate *
                            (1 - disc / 100);

                        return `
                          <tr>

                            <td>
                              ${itemName}
                            </td>

                            <td>
                              ${description}
                            </td>

                            <td class="text-right">
                              ${qty}
                            </td>

                            <td class="text-right">
                              ${currency}${rate.toFixed(2)}
                            </td>

                            <td class="text-right">
                              ${disc.toFixed(2)}%
                            </td>

                            <td class="text-right">
                              ${currency}${amount.toFixed(2)}
                            </td>

                          </tr>
                        `;
                      })
                      .join("")
                  : ""
              }

            </tbody>

          </table>

          <div class="totals-box">

            <div class="row">
              <span>Sub Total</span>

              <span>
                ${currency}${(
                  Number(inv.subTotal) || 0
                ).toFixed(2)}
              </span>
            </div>

            <div class="row">
              <span>
                Tax (${Number(inv.taxPercentage) || 0}%)
              </span>

              <span>
                ${currency}${(
                  Number(inv.taxAmount) || 0
                ).toFixed(2)}
              </span>
            </div>

            <div class="row grand-total">

              <span>Total Amount</span>

              <span>
                ${currency}${(
                  Number(inv.invoiceAmount) || 0
                ).toFixed(2)}
              </span>

            </div>

          </div>

          <div style="clear: both;"></div>

          ${
            inv.notes
              ? `
                <div class="footer-notes">
                  <strong>Notes:</strong><br/>
                  ${inv.notes}
                </div>
              `
              : ""
          }

        </body>
      </html>
    `;

    doc.open();
    doc.write(html);
    doc.close();

    iframe.onload = () => {
      if (iframe.contentWindow) {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
      }
    };

    iframe.contentWindow.onafterprint = () => {
      if (iframe.parentNode) {
        iframe.parentNode.removeChild(iframe);
      }
    };
  } catch (error) {
    console.error("Print Error:", error);
    throw error;
  }
};