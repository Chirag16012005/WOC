import axios from 'axios';

const sendMail = async (to, subject, text, html = null) => {
    try {
        const payload = {
            sender: {
                name: 'Service Bee',
                email: process.env.BREVO_SENDER_EMAIL || 'noreply@servicebee.com',
            },
            to: [{ email: to }],
            subject,
            textContent: text,
        };

        if (html) {
            payload.htmlContent = html;
        }

        const response = await axios.post(
            'https://api.brevo.com/v3/smtp/email',
            payload,
            {
                headers: {
                    'api-key': process.env.BREVO_API_KEY,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
            }
        );

        console.log('Email sent via Brevo API:', response.data.messageId);
        return { success: true, messageId: response.data.messageId };
    } catch (error) {
        const errMsg = error.response?.data?.message || error.message;
        console.error('Error sending email:', errMsg);
        return { success: false, error: errMsg };
    }
};

export const sendOTPEmail = async (to, otp, name) => {
    const subject = 'Your OTP for Service Bee';
    const text = `Your OTP for Service Bee is: ${otp}. It is valid for 10 minutes.`;
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 30px; border: 1px solid #f5a623; border-radius: 10px;">
            <div style="text-align: center; margin-bottom: 20px;">
                <span style="font-size: 48px;">🐝</span>
                <h1 style="color: #f5a623; margin: 5px 0;">Service Bee</h1>
            </div>
            <h2 style="color: #333;">Hello ${name},</h2>
            <p style="color: #555;">Your One-Time Password (OTP) for signing up is:</p>
            <div style="text-align: center; margin: 25px 0;">
                <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #f5a623; background: #fff8ee; padding: 15px 25px; border-radius: 8px; border: 2px dashed #f5a623;">${otp}</span>
            </div>
            <p style="color: #555;">This OTP is valid for <strong>10 minutes</strong>. Do not share it with anyone.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="color: #aaa; font-size: 12px; text-align: center;">Service Bee – Your trusted service marketplace</p>
        </div>
    `;
    return await sendMail(to, subject, text, html);
};

export default sendMail;
