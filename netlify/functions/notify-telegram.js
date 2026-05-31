const TELEGRAM_BOT_TOKEN = "8285747673:AAH9Hcro1w55g0JaG9KiiKT3IjbMuFnPydA";
const TELEGRAM_CHAT_ID = "7648804394";

async function sendTelegram(message) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: "HTML",
    }),
  });
  return res.json();
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const order = JSON.parse(event.body);

    const message = `
🔔 <b>ORDER BARU MASUK!</b>

👤 <b>Nama:</b> ${order.nama}
📱 <b>No WA:</b> ${order.nowa}
📦 <b>Paket:</b> ${order.paket}
💰 <b>Harga:</b> Rp ${Number(order.harga).toLocaleString("id-ID")}
📅 <b>Mulai:</b> ${order.tanggal_mulai || "-"}
📅 <b>Selesai:</b> ${order.tanggal_selesai || "-"}
📝 <b>Catatan:</b> ${order.catatan || "-"}
🆔 <b>ID Order:</b> <code>${order.id}</code>

⏰ ${new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })} WIB
    `.trim();

    await sendTelegram(message);

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
