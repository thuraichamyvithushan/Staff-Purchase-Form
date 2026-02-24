const nodemailer = require('nodemailer');
const path = require('path');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const BASE_URL = process.env.BASE_URL;

const _esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const getSubject = (type, data) => {
  switch (type) {
    case 'purchaseRequest': return `New Staff Purchase Request - ${data.request.employeeName} (${data.request.storeName})`;
    case 'reminder': return `REMINDER: Action Required - Staff Purchase Request - ${data.request.employeeName}`;
    case 'responseNotification':
      const prefix = data.action === 'confirm' ? ' CONFIRMED' : (data.action === 'reject' ? ' REJECTED' : ' UPDATE');
      return `${prefix}: Purchase Request - ${data.request.employeeName} (${data.request.storeName})`;
    case 'registrationReceivedUser': return `Registration Received - Huntsman Optics`;
    case 'purchaseRequestConfirmation': return `Purchase Request Received - Huntsman Optics`;
    case 'newRegistrationAdmin': return `ALERT: New User Registration Pending Approval`;
    case 'roleUpdated': return `Access Policy Updated - Huntsman Optics`;
    default: return 'Staff Purchase Request Notification';
  }
};

const getHtmlBody = (type, data) => {
  // Common data extraction
  const request = data.request;
  const token = data.token;
  const user = data.user;

  const bodyBg = '#f1f5f9';
  const containerBg = '#ffffff';
  const primaryRed = '#dc2626';
  const textDark = '#1e293b';
  const textLight = '#64748b';

  const commonStyles = `
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
    line-height: 1.6; 
    color: ${textDark}; 
    background-color: ${bodyBg};
    padding: 40px 20px;
    margin: 0;
  `;

  const header = `
    <div style="background-color: ${containerBg}; border-top: 6px solid ${primaryRed}; border-radius: 16px 16px 0 0; padding: 40px 40px 20px; text-align: center; border-bottom: 1px solid #f1f5f9;">
      <div style="margin-bottom: 20px;">
        <img src="cid:logo" alt="Huntsman Optics" style="height: 60px; width: auto;" />
      </div>
      <h2 style="margin: 0; color: ${textDark}; font-size: 24px; font-weight: 800; letter-spacing: -0.025em;">Staff Purchase Request</h2>
      <p style="margin: 8px 0 0; color: ${textLight}; font-size: 14px; font-weight: 600; text-transform: uppercase; tracking: 0.1em;">Australia Region</p>
    </div>
  `;

  const footer = `
    <div style="text-align: center; margin-top: 30px;">
      <p style="margin: 0; font-size: 11px; color: #94a3b8; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em;">
        © 2026 Huntsman Optics Secure Portal • Australia
      </p>
    </div>
  `;

  if (type === 'purchaseRequest' || type === 'reminder') {
    const requestDetails = `
    <div style="padding: 30px 40px; background-color: ${containerBg};">
      <h3 style="margin-top: 0; color: ${textDark}; font-size: 18px; font-weight: 700; margin-bottom: 20px; display: flex; items-center;">
        <span style="width: 4px; height: 18px; background-color: ${primaryRed}; border-radius: 2px; margin-right: 10px; display: inline-block; vertical-align: middle;"></span>
        <span style="vertical-align: middle;">Request Details</span>
      </h3>
      <table style="width: 100%; border-collapse: separate; border-spacing: 0;">
        <tr><td style="padding: 12px 0; border-bottom: 1px solid #f8fafc; color: ${textLight}; font-size: 14px; font-weight: 500;">Store Name</td><td style="padding: 12px 0; border-bottom: 1px solid #f8fafc; font-weight: 700; text-align: right; color: ${textDark};">${_esc(request.storeName)}</td></tr>
        <tr><td style="padding: 12px 0; border-bottom: 1px solid #f8fafc; color: ${textLight}; font-size: 14px; font-weight: 500;">Employee</td><td style="padding: 12px 0; border-bottom: 1px solid #f8fafc; font-weight: 700; text-align: right; color: ${textDark};">${_esc(request.employeeName)}</td></tr>

        ${request.publicEmail ? `<tr><td style="padding: 12px 0; border-bottom: 1px solid #f8fafc; color: ${textLight}; font-size: 14px; font-weight: 500;">Contact Email</td><td style="padding: 12px 0; border-bottom: 1px solid #f8fafc; font-weight: 700; text-align: right; color: ${textDark};"><a href="mailto:${_esc(request.publicEmail)}" style="color: ${textDark}; text-decoration: none;">${_esc(request.publicEmail)}</a></td></tr>` : ''}
        ${request.email ? `<tr><td style="padding: 12px 0; border-bottom: 1px solid #f8fafc; color: ${textLight}; font-size: 14px; font-weight: 500;">Sight App Email</td><td style="padding: 12px 0; border-bottom: 1px solid #f8fafc; font-weight: 700; text-align: right; color: ${textDark};"><a href="mailto:${_esc(request.email)}" style="color: ${textDark}; text-decoration: none;">${_esc(request.email)}</a></td></tr>` : ''}
        <tr><td style="padding: 12px 0; border-bottom: 1px solid #f8fafc; color: ${textLight}; font-size: 14px; font-weight: 500;">Product Model</td><td style="padding: 12px 0; border-bottom: 1px solid #f8fafc; font-weight: 700; text-align: right; color: ${primaryRed};">${_esc(request.productModel)}</td></tr>
        <tr><td style="padding: 12px 0; border-bottom: 1px solid #f8fafc; color: ${textLight}; font-size: 14px; font-weight: 500;">Discount</td><td style="padding: 12px 0; border-bottom: 1px solid #f8fafc; font-weight: 700; text-align: right; color: ${textDark};">${_esc(request.discount)}</td></tr>
        ${request.serialNumber ? `<tr><td style="padding: 12px 0; border-bottom: 1px solid #f8fafc; color: ${textLight}; font-size: 14px; font-weight: 500;">Serial Number</td><td style="padding: 12px 0; border-bottom: 1px solid #f8fafc; font-weight: 700; text-align: right; color: ${textDark};">${_esc(request.serialNumber)}</td></tr>` : ''}
        ${request.fob ? `<tr><td style="padding: 12px 0; border-bottom: 1px solid #f8fafc; color: ${textLight}; font-size: 14px; font-weight: 500;">FOB</td><td style="padding: 12px 0; border-bottom: 1px solid #f8fafc; font-weight: 700; text-align: right; color: ${textDark};">${_esc(request.fob)}</td></tr>` : ''}
        ${request.rebate ? `<tr><td style="padding: 12px 0; border-bottom: 1px solid #f8fafc; color: ${textLight}; font-size: 14px; font-weight: 500;">Rebate</td><td style="padding: 12px 0; border-bottom: 1px solid #f8fafc; font-weight: 700; text-align: right; color: ${textDark};">${_esc(request.rebate)}</td></tr>` : ''}
        <tr><td style="padding: 12px 0; border-bottom: 1px solid #f8fafc; color: ${textLight}; font-size: 14px; font-weight: 500;">Order Date</td><td style="padding: 12px 0; border-bottom: 1px solid #f8fafc; font-weight: 700; text-align: right; color: ${textDark};">${new Date(request.orderDate).toLocaleDateString('en-AU')}</td></tr>
        <tr><td style="padding: 12px 0; border-bottom: 1px solid #f8fafc; color: ${textLight}; font-size: 14px; font-weight: 500;">Invoice Date</td><td style="padding: 12px 0; border-bottom: 1px solid #f8fafc; font-weight: 700; text-align: right; color: ${textDark};">${new Date(request.invoiceDate).toLocaleDateString('en-AU')}</td></tr>
      </table>
    </div>
    `;

    const confirmationSection = `
    <div style="background-color: #fef2f2; padding: 25px 40px; margin: 0; border-left: 0; border-radius: 0;">
        <h4 style="margin-top: 0; color: #991b1b; font-size: 16px; font-weight: 800;">CONFIRMATION & ACCEPTANCE</h4>
        <p style="margin-bottom: 12px; font-size: 14px; color: #b91c1c; font-weight: 500;">By submitting this form, I confirm that:</p>
        <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #b91c1c; font-weight: 500; line-height: 1.8;">
            <li>I agree to register for the Sight App using the same email address provided above.</li>
            <li>I acknowledge that the device must remain in my possession for a minimum period of 14 months.</li>
            <li>I request confirmation of receipt within 30 days.</li>
        </ul>
    </div>
    `;

    const confirmLink = `${BASE_URL}/respond/${token}?action=confirm`;
    const rejectLink = `${BASE_URL}/respond/${token}?action=reject`;

    const actions = `
    <div style="background-color: ${containerBg}; padding: 40px; text-align: center; border-radius: 0 0 16px 16px; border-top: 1px solid #f1f5f9;">
      <p style="margin-bottom: 25px; font-weight: 700; font-size: 16px; color: ${textDark};">Please confirm your details to proceed:</p>
      <div style="margin-bottom: 20px;">
        <a href="${confirmLink}" style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 12px; font-weight: 800; font-size: 16px; display: inline-block; box-shadow: 0 10px 15px -3px rgba(220, 38, 38, 0.4);">I Confirm & Agree</a>
      </div>
      <div>
         <a href="${rejectLink}" style="color: ${textLight}; text-decoration: none; font-size: 13px; font-weight: 600; border-bottom: 1px solid #cbd5e1; padding-bottom: 1px;">Wrong details? Reject Request</a>
      </div>
      <p style="margin-top: 30px; font-size: 12px; color: #94a3b8; font-weight: 500;">Clicking Confirm records your legally binding acceptance of the terms mentioned above.</p>
    </div>
    `;

    return `
      <html>
        <body style="${commonStyles}">
          <div style="max-width: 600px; margin: 0 auto;">
            ${header}
            ${type === 'reminder' ? '<div style="background-color: #fff1f2; color: #be123c; padding: 15px 40px; text-align: center; font-weight: 800; font-size: 14px; border-bottom: 1px solid #ffe4e6; text-transform: uppercase; letter-spacing: 0.05em;">⚠️ Action Required: Reminder Notification</div>' : ''}
            ${requestDetails}
            ${confirmationSection}
            ${actions}
            ${footer}
          </div>
        </body>
      </html>
    `;
  }

  if (type === 'responseNotification') {
    const statusColor = request.status === 'Confirmed' ? '#16a34a' : (request.status === 'Rejected' ? '#dc2626' : '#ca8a04');
    const statusText = request.status === 'Confirmed' ? 'Confirmed' : request.status;

    const requestDetails = `
    <div style="padding: 30px 40px; background-color: ${containerBg};">
      <h3 style="margin-top: 0; color: ${textDark}; font-size: 18px; font-weight: 700; margin-bottom: 20px; display: flex; items-center;">
        <span style="width: 4px; height: 18px; background-color: ${primaryRed}; border-radius: 2px; margin-right: 10px; display: inline-block; vertical-align: middle;"></span>
        <span style="vertical-align: middle;">Request Details</span>
      </h3>
      <table style="width: 100%; border-collapse: separate; border-spacing: 0;">
        <tr><td style="padding: 12px 0; border-bottom: 1px solid #f8fafc; color: ${textLight}; font-size: 14px; font-weight: 500;">Store Name</td><td style="padding: 12px 0; border-bottom: 1px solid #f8fafc; font-weight: 700; text-align: right; color: ${textDark};">${_esc(request.storeName)}</td></tr>
        <tr><td style="padding: 12px 0; border-bottom: 1px solid #f8fafc; color: ${textLight}; font-size: 14px; font-weight: 500;">Employee</td><td style="padding: 12px 0; border-bottom: 1px solid #f8fafc; font-weight: 700; text-align: right; color: ${textDark};">${_esc(request.employeeName)}</td></tr>
        <tr><td style="padding: 12px 0; border-bottom: 1px solid #f8fafc; color: ${textLight}; font-size: 14px; font-weight: 500;">Product Model</td><td style="padding: 12px 0; border-bottom: 1px solid #f8fafc; font-weight: 700; text-align: right; color: ${primaryRed};">${_esc(request.productModel)}</td></tr>
        <tr><td style="padding: 12px 0; border-bottom: 1px solid #f8fafc; color: ${textLight}; font-size: 14px; font-weight: 500;">Discount</td><td style="padding: 12px 0; border-bottom: 1px solid #f8fafc; font-weight: 700; text-align: right; color: ${textDark};">${_esc(request.discount)}</td></tr>
        ${request.serialNumber ? `<tr><td style="padding: 12px 0; border-bottom: 1px solid #f8fafc; color: ${textLight}; font-size: 14px; font-weight: 500;">Serial Number</td><td style="padding: 12px 0; border-bottom: 1px solid #f8fafc; font-weight: 700; text-align: right; color: ${textDark};">${_esc(request.serialNumber)}</td></tr>` : ''}
        ${request.fob ? `<tr><td style="padding: 12px 0; border-bottom: 1px solid #f8fafc; color: ${textLight}; font-size: 14px; font-weight: 500;">FOB</td><td style="padding: 12px 0; border-bottom: 1px solid #f8fafc; font-weight: 700; text-align: right; color: ${textDark};">${_esc(request.fob)}</td></tr>` : ''}
        ${request.rebate ? `<tr><td style="padding: 12px 0; border-bottom: 1px solid #f8fafc; color: ${textLight}; font-size: 14px; font-weight: 500;">Rebate</td><td style="padding: 12px 0; border-bottom: 1px solid #f8fafc; font-weight: 700; text-align: right; color: ${textDark};">${_esc(request.rebate)}</td></tr>` : ''}
        <tr><td style="padding: 12px 0; border-bottom: 1px solid #f8fafc; color: ${textLight}; font-size: 14px; font-weight: 500;">Order Date</td><td style="padding: 12px 0; border-bottom: 1px solid #f8fafc; font-weight: 700; text-align: right; color: ${textDark};">${new Date(request.orderDate).toLocaleDateString('en-AU')}</td></tr>
        <tr><td style="padding: 12px 0; border-bottom: 1px solid #f8fafc; color: ${textLight}; font-size: 14px; font-weight: 500;">Invoice Date</td><td style="padding: 12px 0; border-bottom: 1px solid #f8fafc; font-weight: 700; text-align: right; color: ${textDark};">${new Date(request.invoiceDate).toLocaleDateString('en-AU')}</td></tr>
      </table>
    </div>
    `;

    return `
      <html>
        <body style="${commonStyles}">
          <div style="max-width: 600px; margin: 0 auto;">
            ${header}
            <div style="padding: 40px; text-align: center; background-color: ${containerBg};">
                <div style="margin-bottom: 20px; display: inline-block; padding: 10px 20px; border-radius: 99px; background-color: ${statusColor}10;">
                  <span style="color: ${statusColor}; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; font-size: 14px;">Status: ${statusText}</span>
                </div>
                <h2 style="color: ${textDark}; margin: 0; font-size: 24px; font-weight: 800;">Response Received</h2>
                <p style="color: ${textLight}; margin-top: 8px;">Staff member <strong>${_esc(request.employeeName)}</strong> has responded to the purchase request.</p>
                <p style="color: ${textLight}; font-size: 13px; margin-top: 4px;"><strong>Time:</strong> ${new Date(request.updatedAt).toLocaleString('en-AU', { dateStyle: 'long', timeStyle: 'short' })}</p>
            </div>
            ${requestDetails}
            ${data.note ? `
            <div style="background-color: #f8fafc; padding: 25px 40px; border-top: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9;">
                <p style="margin: 0 0 10px; color: ${textLight}; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em;">Staff Comments</p>
                <div style="background-color: #ffffff; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; color: ${textDark}; font-size: 14px; font-style: italic; line-height: 1.6;">
                    "${_esc(data.note)}"
                </div>
            </div>
            ` : `
            <div style="background-color: #f8fafc; padding: 20px 40px; border-top: 1px solid #f1f5f9;">
                <p style="margin: 0; color: ${textDark}; font-size: 14px; font-weight: 700;">Action Detail:</p>
                <p style="margin: 5px 0 0; color: ${statusColor}; font-size: 13px; font-weight: 500;">
                    ${data.action === 'confirm' ? 'The staff member has confirmed the details and accepted the Sight App terms.' :
        (data.action === 'reject' ? 'The staff member has rejected the request.' :
          'The staff member has updated the request status.')}
                </p>
            </div>
            `}
            <div style="padding: 40px; text-align: center; border-top: 1px solid #f1f5f9; background-color: ${containerBg}; border-radius: 0 0 16px 16px;">
                <p style="color: ${textLight}; font-size: 14px; font-weight: 500;">Login to your Admin Dashboard to view full history and manage responses.</p>
                <div style="margin-top: 25px;">
                  <a href="${BASE_URL}/dashboard" style="background: #1e293b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 14px; display: inline-block;">Open Dashboard</a>
                </div>
            </div>
            ${footer}
          </div>
        </body>
      </html>
    `;
  }

  if (type === 'registrationReceivedUser') {
    return `
      <html>
        <body style="${commonStyles}">
          <div style="max-width: 600px; margin: 0 auto;">
            ${header}
            <div style="padding: 40px; text-align: center; background-color: ${containerBg};">
                <div style="margin-bottom: 20px; display: inline-block; padding: 10px 20px; border-radius: 99px; background-color: #dc262610;">
                  <span style="color: #dc2626; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; font-size: 14px;">Registration Received</span>
                </div>
                <h2 style="color: ${textDark}; margin: 0; font-size: 24px; font-weight: 800;">We've received your request</h2>
                <p style="color: ${textLight}; margin-top: 15px; font-size: 16px;">Hello <strong>${_esc(user.name || user.email)}</strong>,</p>
                <p style="color: ${textLight}; line-height: 1.8;">Your account has been successfully created and is now <strong>Pending Approval</strong> by our administration team. You will receive another email once your access has been granted.</p>
            </div>
            ${footer}
          </div>
        </body>
      </html>
    `;
  }

  if (type === 'newRegistrationAdmin') {
    return `
      <html>
        <body style="${commonStyles}">
          <div style="max-width: 600px; margin: 0 auto;">
            ${header}
            <div style="padding: 40px; text-align: center; background-color: ${containerBg};">
                <div style="margin-bottom: 20px; display: inline-block; padding: 10px 20px; border-radius: 99px; background-color: #dc262610;">
                  <span style="color: #dc2626; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; font-size: 14px;">New Admin User</span>
                </div>
                <h2 style="color: ${textDark}; margin: 0; font-size: 24px; font-weight: 800;">Action Required: Approve User</h2>
                <p style="color: ${textLight}; margin-top: 15px;">A new staff member has registered for the portal and is waiting for role assignment.</p>
            </div>
            <div style="padding: 30px 40px; background-color: #f8fafc; border-top: 1px solid #f1f5f9;">
               <table style="width: 100%;">
                 <tr><td style="color: ${textLight}; font-size: 12px; font-weight: 700; text-transform: uppercase;">Name</td><td style="text-align: right; font-weight: 700; color: ${textDark};">${_esc(user.name)}</td></tr>
                 <tr><td style="color: ${textLight}; font-size: 12px; font-weight: 700; text-transform: uppercase;">Email</td><td style="text-align: right; font-weight: 700; color: ${textDark};">${_esc(user.email)}</td></tr>
                 <tr><td style="color: ${textLight}; font-size: 12px; font-weight: 700; text-transform: uppercase;">Time</td><td style="text-align: right; font-weight: 700; color: ${textDark};">${new Date().toLocaleString('en-AU')}</td></tr>
               </table>
            </div>
            <div style="padding: 40px; text-align: center; background-color: ${containerBg}; border-radius: 0 0 16px 16px;">
                <a href="${BASE_URL}/dashboard/staff" style="background: #dc2626; color: white; padding: 14px 28px; text-decoration: none; border-radius: 12px; font-weight: 800; font-size: 14px; display: inline-block;">Manage Access Policies</a>
            </div>
            ${footer}
          </div>
        </body>
      </html>
    `;
  }

  if (type === 'roleUpdated') {
    const roleCapitalized = data.role.charAt(0).toUpperCase() + data.role.slice(1);
    const isPromotionFromPending = data.oldRole === 'pending';

    return `
      <html>
        <body style="${commonStyles}">
          <div style="max-width: 600px; margin: 0 auto;">
            ${header}
            <div style="padding: 40px; text-align: center; background-color: ${containerBg};">
                <div style="margin-bottom: 20px; display: inline-block; padding: 10px 20px; border-radius: 99px; background-color: #16a34a10;">
                  <span style="color: #16a34a; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; font-size: 14px;">
                    ${isPromotionFromPending ? 'Access Granted' : 'Role Updated'}
                  </span>
                </div>
                <h2 style="color: ${textDark}; margin: 0; font-size: 24px; font-weight: 800;">
                  ${isPromotionFromPending ? 'Welcome to the Portal' : 'Your Role has Changed'}
                </h2>
                <p style="color: ${textLight}; margin-top: 15px; font-size: 16px;">Hello <strong>${_esc(data.userName || 'Team Member')}</strong>,</p>
                <p style="color: ${textLight}; line-height: 1.8;">
                  ${isPromotionFromPending
        ? `Your registration has been approved by <strong>${_esc(data.sender)}</strong>. You now have <strong>${_esc(roleCapitalized)}</strong> access to the Huntsman Optics Staff Portal.`
        : `Your access policy has been updated by <strong>${_esc(data.sender)}</strong>. Your new role is <strong>${_esc(roleCapitalized)}</strong>.`
      }
                </p>
            </div>
            <div style="padding: 40px; text-align: center; background-color: ${containerBg}; border-radius: 0 0 16px 16px; border-top: 1px solid #f1f5f9;">
                <p style="color: ${textLight}; font-size: 14px; font-weight: 500; margin-bottom: 25px;">You can now log in and access the features assigned to your new role.</p>
                <a href="${BASE_URL}/dashboard" style="background: #dc2626; color: white; padding: 14px 28px; text-decoration: none; border-radius: 12px; font-weight: 800; font-size: 14px; display: inline-block;">Go to Dashboard</a>
            </div>
            ${footer}
          </div>
        </body>
      </html>
    `;
  }

  if (type === 'purchaseRequestConfirmation') {
    const requestDetails = `
    <div style="padding: 30px 40px; background-color: ${containerBg};">
      <h3 style="margin-top: 0; color: ${textDark}; font-size: 18px; font-weight: 700; margin-bottom: 20px; display: flex; items-center;">
        <span style="width: 4px; height: 18px; background-color: ${primaryRed}; border-radius: 2px; margin-right: 10px; display: inline-block; vertical-align: middle;"></span>
        <span style="vertical-align: middle;">Request Summary</span>
      </h3>
      <table style="width: 100%; border-collapse: separate; border-spacing: 0;">
        <tr><td style="padding: 12px 0; border-bottom: 1px solid #f8fafc; color: ${textLight}; font-size: 14px; font-weight: 500;">Store</td><td style="padding: 12px 0; border-bottom: 1px solid #f8fafc; font-weight: 700; text-align: right; color: ${textDark};">${_esc(request.storeName)}</td></tr>
        <tr><td style="padding: 12px 0; border-bottom: 1px solid #f8fafc; color: ${textLight}; font-size: 14px; font-weight: 500;">Product</td><td style="padding: 12px 0; border-bottom: 1px solid #f8fafc; font-weight: 700; text-align: right; color: ${primaryRed};">${_esc(request.productModel)}</td></tr>
        <tr><td style="padding: 12px 0; border-bottom: 1px solid #f8fafc; color: ${textLight}; font-size: 14px; font-weight: 500;">Date</td><td style="padding: 12px 0; border-bottom: 1px solid #f8fafc; font-weight: 700; text-align: right; color: ${textDark};">${new Date(request.createdAt).toLocaleDateString('en-AU')}</td></tr>
      </table>
    </div>
    `;

    return `
      <html>
        <body style="${commonStyles}">
          <div style="max-width: 600px; margin: 0 auto;">
            ${header}
            <div style="padding: 40px; text-align: center; background-color: ${containerBg};">
                <div style="margin-bottom: 20px; display: inline-block; padding: 10px 20px; border-radius: 99px; background-color: #ca8a0410;">
                  <span style="color: #ca8a04; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; font-size: 14px;">Status: Under Review</span>
                </div>
                <h2 style="color: ${textDark}; margin: 0; font-size: 24px; font-weight: 800;">Thank you for your submission</h2>
                <p style="color: ${textLight}; margin-top: 15px; font-size: 16px;">Hello <strong>${_esc(request.employeeName)}</strong>,</p>
                <p style="color: ${textLight}; line-height: 1.8;">We have received your staff purchase request. Our administration team is currently reviewing the details. You will be notified once the request has been processed.</p>
            </div>
            ${requestDetails}
            <div style="padding: 40px; text-align: center; border-radius: 0 0 16px 16px; border-top: 1px solid #f1f5f9; background-color: ${containerBg};">
              <p style="color: #64748b; font-size: 13px;">This is an automated confirmation of your request receipt. No further action is required at this time.</p>
            </div>
            ${footer}
          </div>
        </body>
      </html>
    `;
  }

  return '';
};

const sendEmail = async (to, type, data) => {
  if (!process.env.EMAIL_USER) {
    console.log(`[DEV] Mock sending email to ${to} for type ${type}`);
    return true;
  }

  const mailOptions = {
    from: `Huntsman Optics Portal <${process.env.EMAIL_USER}>`,
    to: to,
    subject: getSubject(type, data),
    html: getHtmlBody(type, data),
    attachments: [
      {
        filename: 'logo.png',
        path: path.join(__dirname, '../../frontend/public/assets/logo.png'),
        cid: 'logo'
      }
    ]
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to} [${type}]`);
    return true;
  } catch (error) {
    console.error('Email send failed:', error.message);
    throw error;
  }
};

module.exports = { sendEmail };
