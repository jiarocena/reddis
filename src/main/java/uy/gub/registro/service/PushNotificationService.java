package uy.gub.registro.service;

import jakarta.annotation.PostConstruct;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.springframework.stereotype.Service;
import uy.gub.registro.model.PushSubscription;
import uy.gub.registro.repository.PushSubscriptionRepository;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.security.*;
import org.bouncycastle.jce.interfaces.ECPrivateKey;
import org.bouncycastle.jce.interfaces.ECPublicKey;
import java.security.spec.ECGenParameterSpec;
import java.util.Base64;
import java.util.List;

import nl.martijndwars.webpush.Notification;
import nl.martijndwars.webpush.PushService;
import nl.martijndwars.webpush.Subscription;
import nl.martijndwars.webpush.Utils;

@Service
public class PushNotificationService {

    private final PushSubscriptionRepository subscriptionRepo;
    private ECPublicKey publicKey;
    private ECPrivateKey privateKey;
    private PushService pushService;

    public PushNotificationService(PushSubscriptionRepository subscriptionRepo) {
        this.subscriptionRepo = subscriptionRepo;
    }

    @PostConstruct
    public void init() {
        // Register BouncyCastle Provider
        if (Security.getProvider(BouncyCastleProvider.PROVIDER_NAME) == null) {
            Security.addProvider(new BouncyCastleProvider());
        }

        loadOrCreateVapidKeys();

        this.pushService = new PushService();
        this.pushService.setPublicKey(publicKey);
        this.pushService.setPrivateKey(privateKey);
        this.pushService.setSubject("mailto:admin@reddis.uy");
    }

    private void loadOrCreateVapidKeys() {
        File keyFile = new File("vapid.keys");
        if (keyFile.exists()) {
            try {
                List<String> lines = Files.readAllLines(keyFile.toPath());
                if (lines.size() >= 2) {
                    byte[] pubBytes = Base64.getUrlDecoder().decode(lines.get(0));
                    byte[] privBytes = Base64.getUrlDecoder().decode(lines.get(1));
                    this.publicKey = (ECPublicKey) Utils.loadPublicKey(pubBytes);
                    this.privateKey = (ECPrivateKey) Utils.loadPrivateKey(privBytes);
                    System.out.println("VAPID keys cargadas exitosamente desde archivo.");
                    return;
                }
            } catch (Exception e) {
                System.err.println("No se pudieron cargar las llaves VAPID: " + e.getMessage());
            }
        }

        // Generate dynamically
        try {
            KeyPairGenerator kpg = KeyPairGenerator.getInstance("EC", BouncyCastleProvider.PROVIDER_NAME);
            ECGenParameterSpec gps = new ECGenParameterSpec("secp256r1");
            kpg.initialize(gps);
            KeyPair kp = kpg.generateKeyPair();
            this.publicKey = (ECPublicKey) kp.getPublic();
            this.privateKey = (ECPrivateKey) kp.getPrivate();

            byte[] pubBytes = Utils.encode(this.publicKey);
            byte[] privBytes = Utils.encode(this.privateKey);

            String pubBase64 = Base64.getUrlEncoder().withoutPadding().encodeToString(pubBytes);
            String privBase64 = Base64.getUrlEncoder().withoutPadding().encodeToString(privBytes);

            Files.write(keyFile.toPath(), List.of(pubBase64, privBase64));
            System.out.println("Nuevas VAPID keys generadas y guardadas en vapid.keys.");
        } catch (Exception e) {
            System.err.println("Error generando llaves VAPID: " + e.getMessage());
        }
    }

    public String getPublicKeyBase64() {
        if (publicKey == null) return "";
        byte[] pubBytes = Utils.encode(publicKey);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(pubBytes);
    }

    /**
     * Envia una notificacion push de manera asincrona a un usuario especifico.
     */
    public void sendPushNotification(Long usuarioId, String title, String body, String url) {
        List<PushSubscription> subs = subscriptionRepo.findByUsuarioId(usuarioId);
        if (subs.isEmpty()) return;

        // Run in a separate thread to not block the chat request
        new Thread(() -> {
            String payload = String.format("{\"title\":\"%s\",\"body\":\"%s\",\"url\":\"%s\"}", 
                escapeJson(title), escapeJson(body), escapeJson(url));

            for (PushSubscription sub : subs) {
                try {
                    Subscription subscription = new Subscription(
                        sub.getEndpoint(),
                        new Subscription.Keys(sub.getP256dh(), sub.getAuth())
                    );
                    Notification notification = new Notification(subscription, payload);
                    var response = pushService.send(notification);
                    if (response.getStatusLine().getStatusCode() == 410) {
                        // Subscription expired/gone
                        subscriptionRepo.delete(sub);
                    }
                } catch (Exception e) {
                    System.err.println("Error enviando push notification a sub ID: " + sub.getId() + " - " + e.getMessage());
                }
            }
        }).start();
    }

    private String escapeJson(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r");
    }
}
