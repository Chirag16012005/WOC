import nodemailer from 'nodemailer';

const sendMail = async (to, subject, text, html = null) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
            port: parseInt(process.env.SMTP_PORT) || 587,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });



        const mailOptions = {
            from: `"Service Bee" <${process.env.SMTP_USER}>`,

            to,
            subject,
            text,
        };

        if (html) {
            mailOptions.html = html;
        }

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending email:', error);
        return { success: false, error: error.message };
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
