export async function sendSMS(to, body) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !from) {
    console.error("Twilio credentials missing");
    return { error: "Twilio credentials missing" };
  }

  try {
    const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${auth}`
      },
      body: new URLSearchParams({
        To: to,
        From: from,
        Body: body
      })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Error sending SMS");
    
    return { success: true, sid: data.sid };
  } catch (error) {
    console.error("SMS Error:", error);
    return { error: error.message };
  }
}
