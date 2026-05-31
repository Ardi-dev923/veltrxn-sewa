const TELEGRAM_BOT_TOKEN = "8285747673:AAH9Hcro1w55g0JaG9KiiKT3IjbMuFnPydA";
const TELEGRAM_CHAT_ID = "7648804394";
const SUPABASE_URL = "https://ldzuqptezibchbaxuroa.supabase.co";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

async function sendTelegram(message) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: "HTML",
    }),
  });
}

exports.handler = async () => {
  try {
    // Hitung tanggal besok
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0]; // format: YYYY-MM-DD

    // Ambil order yang tanggal_selesai = besok
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/orders?tanggal_selesai=eq.${tomorrowStr}&status=eq.aktif&select=*`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );

    const orders = await res.json();

    if (!orders || orders.length === 0) {
      return { statusCode: 200, body: "Tidak ada order yang habis besok." };
    }

    for (const order of orders) {
      const message = `
⚠️ <b>PENGINGAT H-1 SEWA HABIS!</b>

👤 <b>Nama:</b> ${order.nama}
📱 <b>No WA:</b> ${order.nowa}
📦 <b>Paket:</b> ${order.paket}
💰 <b>Harga:</b> Rp ${Number(order.harga).toLocaleString("id-ID")}
📅 <b>Sewa Selesai:</b> ${order.tanggal_selesai}
🆔 <b>ID Order:</b> <code>${order.id}</code>

⏰ Segera hubungi pelanggan untuk perpanjangan!
      `.trim();

      await sendTelegram(message);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ notified: orders.length }),
    };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
