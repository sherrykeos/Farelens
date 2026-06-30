"""Transactional email via Brevo's API, with a safe local-dev fallback.

If BREVO_API_KEY isn't set (e.g. local dev, CI, before you've created a
Brevo account), send_email() just logs the email instead of raising —
every caller already handles the "not actually delivered" case by also
returning the relevant token/link in the API response outside production
(see forgot_password / signup in app/api/v1/auth.py). Once BREVO_API_KEY
is set, the exact same call sites start sending real email with zero
code changes elsewhere.
"""
import logging
import os

import httpx

logger = logging.getLogger("app")

BREVO_API_KEY = os.getenv("BREVO_API_KEY")
BREVO_API_URL = "https://api.brevo.com/v3/smtp/email"
SENDER_EMAIL = os.getenv("BREVO_SENDER_EMAIL", "no-reply@airline-ml-pricing.example")
SENDER_NAME = os.getenv("BREVO_SENDER_NAME", "Airline ML Pricing")


def send_email(to_email: str, subject: str, html_body: str) -> bool:
    """Returns True if actually sent via Brevo, False if it only logged
    (no API key configured) or the send failed."""
    if not BREVO_API_KEY:
        logger.info("BREVO_API_KEY not set — logging email instead of sending. To: %s | Subject: %s", to_email, subject)
        return False

    try:
        response = httpx.post(
            BREVO_API_URL,
            headers={"api-key": BREVO_API_KEY, "Content-Type": "application/json"},
            json={
                "sender": {"email": SENDER_EMAIL, "name": SENDER_NAME},
                "to": [{"email": to_email}],
                "subject": subject,
                "htmlContent": html_body,
            },
            timeout=10,
        )
        response.raise_for_status()
        return True
    except httpx.HTTPError:
        logger.exception("Failed to send email via Brevo to %s", to_email)
        return False


def render_branded_email(
    heading: str,
    body_lines: list[str],
    cta_text: str | None = None,
    cta_url: str | None = None,
    footnote: str | None = None,
) -> str:
    """Wraps content in a consistent branded HTML shell. Email clients
    (Gmail, Outlook) strip <style> blocks unpredictably, so every style is
    inlined — the one reliable way to get consistent rendering."""
    body_html = "".join(f'<p style="margin:0 0 16px;color:#334155;font-size:15px;line-height:1.6;">{line}</p>' for line in body_lines)

    cta_html = ""
    if cta_text and cta_url:
        cta_html = f"""
        <div style="text-align:center;margin:28px 0;">
          <a href="{cta_url}"
             style="display:inline-block;background:#6366f1;color:#ffffff;text-decoration:none;
                    font-weight:600;font-size:15px;padding:14px 32px;border-radius:8px;">
            {cta_text}
          </a>
        </div>
        <p style="margin:0 0 16px;color:#94a3b8;font-size:13px;line-height:1.5;word-break:break-all;">
          Or copy this link: <a href="{cta_url}" style="color:#6366f1;">{cta_url}</a>
        </p>
        """

    footnote_html = ""
    if footnote:
        footnote_html = f'<p style="margin:24px 0 0;color:#94a3b8;font-size:13px;line-height:1.5;">{footnote}</p>'

    return f"""
    <div style="background:#0f172a;padding:40px 16px;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
      <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:28px 32px;">
          <span style="color:#ffffff;font-size:20px;font-weight:700;">✈️ AirlineML</span>
        </div>
        <div style="padding:32px;">
          <h1 style="margin:0 0 20px;color:#0f172a;font-size:20px;font-weight:700;">{heading}</h1>
          {body_html}
          {cta_html}
          {footnote_html}
        </div>
        <div style="background:#f8fafc;padding:20px 32px;text-align:center;">
          <p style="margin:0;color:#94a3b8;font-size:12px;">
            AirlineML Dynamic Pricing &middot; This is an automated message, please don't reply.
          </p>
        </div>
      </div>
    </div>
    """
