export const borrowDetails = (
    username: string,
    bookTitle: string,
    borrowedAt: string,
    dueAt: string
): { html: string } => {
    return {
        html: `<!DOCTYPE html>
<html lang="en" style="margin:0; padding:0;">
<head>
  <meta charset="UTF-8" />
  <title>Book Borrowed - Library</title>
  <style>
    body {
      font-family: "Segoe UI", Arial, sans-serif;
      background-color: #f4f4f7;
      margin: 0;
      padding: 0;
      color: #333333;
    }
    .container {
      max-width: 600px;
      margin: 30px auto;
      background: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 6px 16px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(90deg, #2563eb, #1e40af);
      color: #ffffff;
      text-align: center;
      padding: 26px;
    }
    .header h1 {
      margin: 0;
      font-size: 26px;
      font-weight: 700;
    }
    .content {
      padding: 30px;
    }
    .content p {
      font-size: 16px;
      line-height: 1.6;
      margin: 0 0 18px;
    }
    .details-box {
      margin: 22px 0;
      padding: 20px;
      background: #f9fafb;
      border-radius: 8px;
      border: 1px solid #e5e7eb;
    }
    .details-box table {
      width: 100%;
      border-collapse: collapse;
    }
    .details-box td {
      padding: 8px 0;
      font-size: 15px;
    }
    .label {
      font-weight: 600;
      color: #111827;
      width: 40%;
    }
    .value {
      color: #374151;
    }
    .highlight {
      font-weight: 600;
      font-size: 16px;
    }
    .notice {
      margin-top: 24px;
      padding: 16px 18px;
      background: #eef2ff;
      border-left: 5px solid #2563eb;
      border-radius: 6px;
      font-size: 14px;
      color: #1e3a8a;
    }
    .footer {
      background: #f9fafb;
      text-align: center;
      padding: 16px;
      font-size: 13px;
      color: #6b7280;
    }
  </style>
</head>

<body>
  <div class="container">

    <!-- Header -->
    <div class="header">
      <h1>📚 Library</h1>
      <p style="margin-top:6px; font-size:14px;">
        Book Borrow Confirmation
      </p>
    </div>

    <!-- Content -->
    <div class="content">
      <p>
        Hello <strong>${username}</strong>,
      </p>

      <p>
        This email confirms that you have successfully borrowed a book from the Library.
        Please find the details below:
      </p>

      <!-- Book Details -->
      <div class="details-box">
        <table>
          <tr>
            <td class="label">Book Title</td>
            <td class="value highlight">${bookTitle}</td>
          </tr>
          <tr>
            <td class="label">Borrowed On</td>
            <td class="value">${borrowedAt}</td>
          </tr>
          <tr>
            <td class="label">Due Date</td>
            <td class="value highlight">${dueAt}</td>
          </tr>
        </table>
      </div>

      <!-- Notice -->
      <div class="notice">
        Please ensure the book is returned on or before the due date to avoid
        late return penalties or restrictions on future borrowing.
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p>
        &copy; 2025 Library Management System<br />
        This is an automated message. Please do not reply.
      </p>
    </div>

  </div>
</body>
</html>`
    };
};

export const renewBookDetail = (username: string, bookTitle: string, borrowedAt: string, renewedAt: string, returnAt: string): { html: string } => {
    return {
        html: `<!DOCTYPE html>
<html lang="en" style="margin:0; padding:0;">
<head>
  <meta charset="UTF-8" />
  <title>Book Renewal - Library</title>
  <style>
    body {
      font-family: "Segoe UI", Arial, sans-serif;
      background-color: #f4f4f7;
      margin: 0;
      padding: 0;
      color: #333333;
    }
    .container {
      max-width: 600px;
      margin: 30px auto;
      background: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 6px 16px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(90deg, #2563eb, #1e40af);
      color: #ffffff;
      text-align: center;
      padding: 26px;
      }
    .header h1 {
      margin: 0;
      font-size: 26px;
      font-weight: 700;
      }
    .content {
      padding: 30px;
      }
    .content p {
      font-size: 16px;
      line-height: 1.6;
      margin: 0 0 18px;
      }
      .details-box {
      margin: 22px 0;
      padding: 20px;
      background: #f9fafb;
      border-radius: 8px;
      border: 1px solid #e5e7eb;
    }
    .details-box table {
      width: 100%;
      border-collapse: collapse;
      }
      .details-box td {
      padding: 8px 0;
      font-size: 15px;
    }
    .label {
      font-weight: 600;
      color: #111827;
      width: 40%;
    }
    .value {
      color: #374151;
      }
      .highlight {
      font-weight: 600;
      font-size: 16px;
    }
    .notice {
      margin-top: 24px;
      padding: 16px 18px;
      background: #fef3f2;
      border-left: 5px solid #dc2626;
      border-radius: 6px;
      font-size: 14px;
      color: #b91c1c;
      }
      .footer {
      background: #f9fafb;
      text-align: center;
      padding: 16px;
      font-size: 13px;
      color: #6b7280;
    }
    </style>
</head>

<body>
<div class="container">

    <!-- Header -->
    <div class="header">
    <h1>📚 Library</h1>
      <p style="margin-top:6px; font-size:14px;">
        Book Renewal Confirmation
      </p>
      </div>

      <!-- Content -->
    <div class="content">
    <p>
        Hello <strong>${username}</strong>,
      </p>
      
      <p>
        This email confirms that you have successfully renewed a book from the Library.
        Please find the details below:
      </p>
      
      <!-- Book Details -->
      <div class="details-box">
        <table>
          <tr>
            <td class="label">Book Title</td>
            <td class="value highlight">${bookTitle}</td>
          </tr>
          <tr>
            <td class="label">Borrowed On</td>
            <td class="value">${borrowedAt}</td>
            </tr>
          <tr>
            <td class="label">Renewed On</td>
            <td class="value">${renewedAt}</td>
            </tr>
            <tr>
            <td class="label">Return By</td>
            <td class="value highlight">${returnAt}</td>
          </tr>
          </table>
      </div>

      <!-- Notice -->
      <div class="notice">
        You have reached the maximum limit for renewing this book. Please ensure that it is returned on or before the "Return By" date.
        Failure to do so may result in a late return penalty or restrictions on future borrowing.
      </div>
      </div>
      
      <!-- Footer -->
      <div class="footer">
      <p>
        &copy; 2025 Library Management System<br />
        This is an automated message. Please do not reply.
      </p>
    </div>
    
  </div>
</body>
</html>
`
    }
}

export const bookReturnDetail = (
    username: string,
    bookTitle: string,
    borrowedAt: string,
    returnedAt: string
): { html: string } => {
    return {
        html: `<!DOCTYPE html>
<html lang="en" style="margin:0; padding:0;">
<head>
  <meta charset="UTF-8" />
  <title>Book Returned - Library</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Merienda:wght@300..900&family=Orbitron:wght@400..900&family=Science+Gothic:wght@100..900&family=Tektur:wght@400..900&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: "Tektur", sans-serif;
      background-color: #f4f4f7;
      margin: 0;
      padding: 0;
      color: #333333;
    }
    .container {
      max-width: 600px;
      margin: 30px auto;
      background: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 6px 16px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(90deg, #2563eb, #1e40af);
      color: #ffffff;
      text-align: center;
      padding: 26px;
    }
    .header h1 {
      margin: 0;
      font-size: 26px;
      font-weight: 700;
    }
    .content {
      padding: 30px;
    }
    .content p {
      font-size: 16px;
      line-height: 1.6;
      margin: 0 0 18px;
    }
    .details-box {
      margin: 22px 0;
      padding: 20px;
      background: #f9fafb;
      border-radius: 8px;
      border: 1px solid #e5e7eb;
    }
    .details-box table {
      width: 100%;
      border-collapse: collapse;
    }
    .details-box td {
      padding: 8px 0;
      font-size: 15px;
    }
    .label {
      font-weight: 600;
      color: #111827;
      width: 40%;
    }
    .value {
      color: #374151;
    }
    .highlight {
      font-weight: 600;
      font-size: 16px;
    }
    .notice {
      margin-top: 24px;
      padding: 16px 18px;
      background: #d1fae5;
      border-left: 5px solid #10b981;
      border-radius: 6px;
      font-size: 14px;
      color: #065f46;
    }
    .footer {
      background: #f9fafb;
      text-align: center;
      padding: 16px;
      font-size: 13px;
      color: #6b7280;
    }
  </style>
</head>

<body>
  <div class="container">

    <!-- Header -->
    <div class="header">
      <h1>📚 Library</h1>
      <p style="margin-top:6px; font-size:14px;">
        Book Return Confirmation
      </p>
    </div>

    <!-- Content -->
    <div class="content">
      <p>
        Hello <strong>${username}</strong>,
      </p>

      <p>
        This email confirms that you have successfully returned a book to the Library.
        Please find the details below:
      </p>

      <!-- Book Details -->
      <div class="details-box">
        <table>
          <tr>
            <td class="label">Book Title</td>
            <td class="value highlight">${bookTitle}</td>
          </tr>
          <tr>
            <td class="label">Borrowed On</td>
            <td class="value">${borrowedAt}</td>
          </tr>
          <tr>
            <td class="label">Returned On</td>
            <td class="value highlight">${returnedAt}</td>
          </tr>
        </table>
      </div>

      <!-- Notice -->
      <div class="notice">
        Thank you for returning the book on time. Your account has been updated accordingly. We look forward to serving you again!
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p>
        &copy; 2025 Library Management System<br />
        This is an automated message. Please do not reply.
      </p>
    </div>

  </div>
</body>
</html>
`
    };
};