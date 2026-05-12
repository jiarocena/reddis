package uy.gub.registro.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String fromEmail;

    @Value("${reddis.mail.enabled:false}")
    private boolean mailEnabled;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    /**
     * Send confirmation email SYNCHRONOUSLY so registration can report failures.
     * Returns "OK" on success, or an error description on failure.
     */
    public String sendConfirmationEmail(String toEmail, String nombre, String confirmUrl) {
        System.out.println("📧 MAIL CONFIG → enabled=" + mailEnabled + ", from=" + fromEmail);

        if (!mailEnabled) {
            String msg = "MAIL_ENABLED=false → email no enviado a " + toEmail;
            System.out.println("⚠️ " + msg);
            System.out.println("   Link de confirmación: " + confirmUrl);
            return "DISABLED: " + msg;
        }
        if (fromEmail == null || fromEmail.isBlank()) {
            String msg = "MAIL_USERNAME vacío → email no enviado a " + toEmail;
            System.out.println("⚠️ " + msg);
            return "NO_SENDER: " + msg;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, "Comunidad sin Barreras");
            helper.setTo(toEmail);
            helper.setSubject("Confirmá tu cuenta — Comunidad sin Barreras");

            String html = """
                <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a1a2e; border-radius: 16px; overflow: hidden;">
                    <div style="background: linear-gradient(135deg, #fbbf24, #f59e0b); padding: 32px; text-align: center;">
                        <h1 style="margin: 0; color: #1a1a2e; font-size: 24px;">Comunidad sin Barreras</h1>
                        <p style="margin: 8px 0 0; color: #1a1a2e; opacity: 0.8; font-size: 14px;">REDDIS — Red Digital de Inclusión Social</p>
                    </div>
                    <div style="padding: 32px; color: #e0e0e0;">
                        <h2 style="color: #fbbf24; margin-top: 0;">¡Hola %s!</h2>
                        <p style="line-height: 1.6; font-size: 15px;">
                            Gracias por registrarte en <strong>Comunidad sin Barreras</strong>.
                            Para activar tu cuenta, hacé clic en el botón:
                        </p>
                        <div style="text-align: center; margin: 32px 0;">
                            <a href="%s"
                               style="display: inline-block; background: linear-gradient(135deg, #fbbf24, #f59e0b);
                                      color: #1a1a2e; text-decoration: none; padding: 14px 40px; border-radius: 8px;
                                      font-weight: 700; font-size: 16px;">
                                Confirmar mi cuenta
                            </a>
                        </div>
                        <p style="font-size: 13px; color: #999; line-height: 1.5;">
                            Si no creaste esta cuenta, podés ignorar este email.
                        </p>
                    </div>
                    <div style="padding: 16px 32px; background: rgba(255,255,255,0.05); text-align: center; font-size: 12px; color: #666;">
                        Comunidad sin Barreras — Uruguay
                    </div>
                </div>
                """.formatted(nombre, confirmUrl);

            helper.setText(html, true);
            mailSender.send(message);

            System.out.println("✅ Email de confirmación enviado a: " + toEmail);
            return "OK";

        } catch (Exception e) {
            System.err.println("❌ Error enviando email a " + toEmail);
            System.err.println("   Causa: " + e.getClass().getSimpleName() + " → " + e.getMessage());
            if (e.getCause() != null) {
                System.err.println("   Causa raíz: " + e.getCause().getMessage());
            }
            e.printStackTrace();
            return "SMTP_ERROR: " + e.getMessage();
        }
    }

    public boolean isEnabled() {
        return mailEnabled;
    }

    public String getFromEmail() {
        return fromEmail;
    }

    // Synchronous test method for diagnostics
    public void sendTestEmail(String toEmail) {
        System.out.println("🔧 TEST MAIL → enabled=" + mailEnabled + ", from=" + fromEmail);

        if (!mailEnabled) throw new RuntimeException("MAIL_ENABLED is false");
        if (fromEmail == null || fromEmail.isBlank()) throw new RuntimeException("MAIL_USERNAME is empty");

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, false, "UTF-8");
            helper.setFrom(fromEmail, "REDDIS Test");
            helper.setTo(toEmail);
            helper.setSubject("Test REDDIS - Prueba de email");
            helper.setText("Si recibís esto, el email funciona correctamente. — REDDIS");
            mailSender.send(message);
            System.out.println("✅ TEST EMAIL enviado a: " + toEmail);
        } catch (Exception e) {
            System.err.println("❌ TEST EMAIL falló: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Error SMTP: " + e.getMessage());
        }
    }
}
