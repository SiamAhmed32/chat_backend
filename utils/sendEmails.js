// options = {
//   email: "user@example.com",
//   subject: "Welcome!",
//   message: "<h1>Hello!</h1>"
// }

// Declares an async function that accepts one parameter options
// options is an object that will contain email, subject, message
// Called from your controller like await sendEmail({ email, subject, message })

const { Resend } = require("resend");

const sendEmail = async (options) => {
  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    const { data, error } = await resend.emails.send({
      from: `Chat App <${process.env.EMAIL_FROM}>`,
      to: [options.email],
      subject: options.subject,
      html: options.message,
    });

    if (error) {
      console.error("Resend Error Detail:", error);
      throw new Error("Email provider failed to send email.");
    }

    return data;
  } catch (error) {
    throw new Error("Internal server error during email dispatch.");
  }
};

module.exports = sendEmail;

// ### The Complete Data Flow
// ```
// Controller calls sendEmail({ email, subject, message })
//         ↓
// Resend client sends HTTP request to Resend's servers
//         ↓
// Resend returns { data, error }
//         ↓
//     error? → throw error → controller catches → sends 500 to frontend
//     data?  → return data → controller sends 200 to frontend
