import "dotenv/config";
import express from "express";
import SendMail from "./functions/email";

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 8000;

/**
 * For more read please visit here 'cuz I also don't know what it does
 * https://stackoverflow.com/questions/46155/whats-the-best-way-to-validate-an-email-address-in-javascript
 *
 * @param email
 * @returns boolean
 */
const validateEmail = (email: string) => {
  return /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()\.,;\s@\"]+\.{0,1})+([^<>()\.,;:\s@\"]{2,}|[\d\.]+))$/.test(
    email
  );
};

app.post("/send/email", (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).send("Email is required");

  const isValid = validateEmail(email);

  if (isValid) {
    const sendEmail = new SendMail();
    sendEmail.email = email;
    sendEmail
      .sendEmail()
      .then((_) => {
        res.send("Invoice sent");
      })
      .catch((err) => {
        console.log(err);
        res.status(400).send("Error");
      });
  } else {
    res.status(400).send("Invalid email");
  }
});

app.listen(PORT, () => {
  console.log("Listening on http://localhost:" + PORT);
});
