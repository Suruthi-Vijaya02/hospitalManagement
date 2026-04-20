const twilio = require('twilio');
const https = require('https');
const http = require('http');

const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

/**
 * Verify that a URL is publicly reachable before sending to Twilio
 * @param {string} url
 * @returns {Promise<boolean>}
 */
const isUrlReachable = (url) => {
    return new Promise((resolve) => {
        const lib = url.startsWith('https') ? https : http;
        const req = lib.request(url, { method: 'HEAD', timeout: 5000 }, (res) => {
            resolve(res.statusCode >= 200 && res.statusCode < 400);
        });
        req.on('error', () => resolve(false));
        req.on('timeout', () => {
            req.destroy();
            resolve(false);
        });
        req.end();
    });
};

/**
 * Send a WhatsApp message via Twilio Sandbox
 * @param {string} toPhone  - E.164 format e.g. +91XXXXXXXXXX
 * @param {string} message  - Message body
 * @param {string|null} mediaUrl - Publicly accessible file URL (optional)
 * @returns {object} { success, sid } or { success, error }
 */
const sendWhatsApp = async (toPhone, message, mediaUrl = null) => {
    try {
        const payload = {
            from: process.env.TWILIO_WHATSAPP_FROM,
            to: `whatsapp:${toPhone}`,
            body: message,
        };

        // ── Media attachment logic ──────────────────────────────────────────
        if (mediaUrl) {
            const isLocal =
                mediaUrl.includes('localhost') ||
                mediaUrl.includes('127.0.0.1');

            if (isLocal) {
                // Local URL — Twilio cannot reach this, skip silently
                console.warn(`[WhatsApp] Skipping media — local URL not reachable by Twilio: ${mediaUrl}`);

            } else {
                // Public URL — verify it's actually reachable before sending
                console.log(`[WhatsApp] Verifying media URL: ${mediaUrl}`);
                const reachable = await isUrlReachable(mediaUrl);

                if (reachable) {
                    payload.mediaUrl = [mediaUrl];
                    console.log(`[WhatsApp] Media URL verified ✅`);
                } else {
                    // URL not reachable — send text only, don't block
                    console.warn(`[WhatsApp] Media URL not reachable ⚠️ — sending text only: ${mediaUrl}`);
                }
            }
        }
        // ───────────────────────────────────────────────────────────────────

        const result = await client.messages.create(payload);

        console.log(
            `[WhatsApp] ✅ Sent to ${toPhone} | SID: ${result.sid} | Media: ${payload.mediaUrl ? payload.mediaUrl[0] : 'none'
            }`
        );

        return { success: true, sid: result.sid };

    } catch (error) {
        let errorMsg = error.message;

        // Friendly error messages for common Twilio errors
        if (error.code === 21614) errorMsg = 'Phone number is not WhatsApp-enabled or not opted into sandbox';
        if (error.code === 21606) errorMsg = 'Twilio WhatsApp FROM number is incorrect in .env';
        if (error.code === 63016) errorMsg = 'Media URL invalid or unreachable by Twilio servers';
        if (error.code === 21211) errorMsg = `Invalid phone number format: ${toPhone} — must be E.164 e.g. +91XXXXXXXXXX`;

        console.error(`[WhatsApp] ❌ Failed for ${toPhone} | Code: ${error.code || 'N/A'} | ${errorMsg}`);
        return { success: false, error: errorMsg };
    }
};

module.exports = { sendWhatsApp };