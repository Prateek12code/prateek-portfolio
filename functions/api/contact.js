export async function onRequestPost(context) {
  try {
    const { request, env } = context;

    if (request.method !== "POST") {
      return json({ ok: false, error: "Method not allowed" }, 405);
    }

    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return json({ ok: false, error: "Invalid content type" }, 400);
    }

    const data = await request.json();

    const name = (data.name || "").trim();
    const email = (data.email || "").trim();
    const message = (data.message || "").trim();
    const company = (data.company || "").trim(); // honeypot

    // Honeypot trap
    if (company) {
      return json({ ok: true });
    }

    // Validation
    if (name.length < 2) {
      return json({ ok: false, field: "name", error: "Invalid name" }, 400);
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json({ ok: false, field: "email", error: "Invalid email" }, 400);
    }

    if (message.length < 10) {
      return json(
        { ok: false, field: "message", error: "Message too short" },
        400,
      );
    }

    const RESEND_API_KEY = env.RESEND_API_KEY;
    if (!RESEND_API_KEY) {
      return json({ ok: false, error: "Missing API key" }, 500);
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Prateek <hello@prateekcode.me>",
        to: ["prateekshukla@pixxivo.com"],
        reply_to: email,
        subject: `New message from ${name} — prateekcode.me`,
        html: `
          <div style="font-family:system-ui,Arial;">
            <h2>New Portfolio Message</h2>
            <p><b>Name:</b> ${escape(name)}</p>
            <p><b>Email:</b> ${escape(email)}</p>
            <hr/>
            <p style="white-space:pre-wrap;">${escape(message)}</p>
          </div>
        `,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      return json({ ok: false, error: "Resend failed", details: result }, 500);
    }

    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: "Server error" }, 500);
  }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}

function escape(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
