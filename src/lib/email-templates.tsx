import * as React from "react"

interface PaymentConfirmationEmailProps {
  customerName: string
  amount: number
  currency: string
  date: string
  transactionId: string
}

export const PaymentConfirmationEmail: React.FC<PaymentConfirmationEmailProps> = ({
  customerName,
  amount,
  currency,
  date,
  transactionId,
}) => (
  <html>
    <head>
      <style>{`
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 40px 20px;
          text-align: center;
          border-radius: 10px 10px 0 0;
        }
        .logo {
          font-size: 32px;
          font-weight: bold;
          margin-bottom: 10px;
        }
        .content {
          background: #f9fafb;
          padding: 40px 30px;
          border-left: 1px solid #e5e7eb;
          border-right: 1px solid #e5e7eb;
        }
        .success-icon {
          text-align: center;
          margin-bottom: 30px;
        }
        .success-icon svg {
          width: 64px;
          height: 64px;
          color: #10b981;
        }
        h1 {
          color: #1f2937;
          font-size: 24px;
          margin-bottom: 20px;
          text-align: center;
        }
        .details {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 25px;
          margin: 25px 0;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          padding: 12px 0;
          border-bottom: 1px solid #f3f4f6;
        }
        .detail-row:last-child {
          border-bottom: none;
        }
        .detail-label {
          color: #6b7280;
          font-weight: 500;
        }
        .detail-value {
          color: #1f2937;
          font-weight: 600;
        }
        .amount {
          font-size: 28px;
          color: #667eea;
        }
        .features {
          background: #f0fdf4;
          border: 1px solid #86efac;
          border-radius: 8px;
          padding: 20px;
          margin: 25px 0;
        }
        .features h3 {
          color: #166534;
          margin-top: 0;
          font-size: 16px;
        }
        .feature-item {
          display: flex;
          align-items: center;
          margin: 10px 0;
          color: #166534;
        }
        .feature-item svg {
          width: 20px;
          height: 20px;
          margin-right: 10px;
          color: #16a34a;
        }
        .button {
          display: inline-block;
          background: #667eea;
          color: white;
          padding: 14px 32px;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          margin: 20px 0;
        }
        .button:hover {
          background: #5568d3;
        }
        .footer {
          background: #1f2937;
          color: #9ca3af;
          padding: 30px 20px;
          text-align: center;
          border-radius: 0 0 10px 10px;
          font-size: 14px;
        }
        .footer a {
          color: #667eea;
          text-decoration: none;
        }
        .center {
          text-align: center;
        }
      `}</style>
    </head>
    <body>
      <div className="header">
        <div className="logo">Discord SaaS</div>
        <p style={{ margin: 0, opacity: 0.9 }}>Event Tracking Platform</p>
      </div>

      <div className="content">
        <div className="success-icon">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <h1>Payment Successful!</h1>

        <p style={{ textAlign: "center", color: "#6b7280", fontSize: "16px" }}>
          Hi {customerName}, thank you for upgrading to Pro plan!
        </p>

        <div className="details">
          <div className="detail-row">
            <span className="detail-label">Amount Paid</span>
            <span className="detail-value amount">
              ${(amount / 100).toFixed(2)} {currency.toUpperCase()}
            </span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Date</span>
            <span className="detail-value">{date}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Transaction ID</span>
            <span className="detail-value" style={{ fontSize: "12px", fontFamily: "monospace" }}>
              {transactionId}
            </span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Plan</span>
            <span className="detail-value" style={{ color: "#667eea" }}>Pro Plan</span>
          </div>
        </div>

        <div className="features">
          <h3>Your Pro Features Are Now Active:</h3>
          <div className="feature-item">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Unlimited Events
          </div>
          <div className="feature-item">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Advanced Analytics
          </div>
          <div className="feature-item">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Priority Support
          </div>
          <div className="feature-item">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Discord Notifications
          </div>
        </div>

        <div className="center">
          <a href="https://localhost:3000/dashboard" className="button">
            Go to Dashboard
          </a>
        </div>

        <p style={{ color: "#6b7280", fontSize: "14px", textAlign: "center", marginTop: "30px" }}>
          A notification has also been sent to your Discord server. You can start using all Pro features immediately!
        </p>
      </div>

      <div className="footer">
        <p>
          If you have any questions, please contact us at{" "}
          <a href="mailto:support@yourdomain.com">support@yourdomain.com</a>
        </p>
        <p style={{ marginTop: "20px", fontSize: "12px" }}>
          Discord SaaS - Real-time Event Tracking
        </p>
      </div>
    </body>
  </html>
)
