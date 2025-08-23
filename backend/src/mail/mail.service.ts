import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { CreateMailDto } from './dto/create-mail.dto';
import { UpdateMailDto } from './dto/update-mail.dto';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail', // You can change this to your preferred email service
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('EMAIL_PASS'),
      },
    });
  }

  async sendVerificationEmail(email: string, code: string): Promise<boolean> {
    try {
      const mailOptions = {
        from: this.configService.get<string>('EMAIL_USER'),
        to: email,
        subject: 'Verify Your Email - OTP Code',
        html: this.getOTPEmailTemplate(code),
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  private getOTPEmailTemplate(otp: string): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
          }
          .container {
            background-color: #ffffff;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 10px;
          }
          .otp-code {
            background-color: #3498db;
            color: white;
            font-size: 32px;
            font-weight: bold;
            text-align: center;
            padding: 20px;
            border-radius: 8px;
            letter-spacing: 5px;
            margin: 20px 0;
          }
          .content {
            text-align: center;
            margin-bottom: 30px;
          }
          .warning {
            background-color: #f8f9fa;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .footer {
            text-align: center;
            font-size: 12px;
            color: #666;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
          }
          .button {
            display: inline-block;
            background-color: #27ae60;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            margin: 10px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">SQL Query Builder</div>
            <h1>Email Verification Required</h1>
          </div>
          
          <div class="content">
            <p>Hello!</p>
            <p>Thank you for signing up. To complete your registration, please use the verification code below:</p>
            
            <div class="otp-code">
              ${otp}
            </div>
            
            <p>Enter this code in the verification field to activate your account.</p>
            
            <div class="warning">
              <strong>Important:</strong>
              <ul style="text-align: left; margin: 10px 0;">
                <li>This code will expire in 10 minutes</li>
                <li>Do not share this code with anyone</li>
                <li>If you didn't request this verification, please ignore this email</li>
              </ul>
            </div>
            
            <p>If you're having trouble, you can copy and paste the code above into the verification field.</p>
          </div>
          
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>&copy; 2025 SQL Query Builder. All rights reserved.</p>
            <p>If you have any questions, please contact our support team.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  async sendPasswordResetEmail(email: string, resetToken: string): Promise<boolean> {
    try {
      const resetUrl = `${this.configService.get<string>('FRONTEND_URL')}/reset-password?token=${resetToken}`;
      
      const mailOptions = {
        from: this.configService.get<string>('EMAIL_USER'),
        to: email,
        subject: 'Password Reset Request',
        html: this.getPasswordResetTemplate(resetUrl),
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Error sending password reset email:', error);
      return false;
    }
  }

  private getPasswordResetTemplate(resetUrl: string): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
          }
          .container {
            background-color: #ffffff;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 10px;
          }
          .button {
            display: inline-block;
            background-color: #e74c3c;
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
            font-weight: bold;
          }
          .content {
            text-align: center;
            margin-bottom: 30px;
          }
          .warning {
            background-color: #f8f9fa;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .footer {
            text-align: center;
            font-size: 12px;
            color: #666;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">SQL Query Builder</div>
            <h1>Password Reset Request</h1>
          </div>
          
          <div class="content">
            <p>Hello!</p>
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            
            <a href="${resetUrl}" class="button">Reset Password</a>
            
            <div class="warning">
              <strong>Security Notice:</strong>
              <ul style="text-align: left; margin: 10px 0;">
                <li>This link will expire in 1 hour</li>
                <li>If you didn't request this reset, please ignore this email</li>
                <li>Your password will remain unchanged until you create a new one</li>
              </ul>
            </div>
            
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background-color: #f8f9fa; padding: 10px; border-radius: 4px; font-family: monospace;">
              ${resetUrl}
            </p>
          </div>
          
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>&copy; 2025 SQL Query Builder. All rights reserved.</p>
            <p>If you have any questions, please contact our support team.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}
