import fs from 'fs';
fetch("https://men-and-boys-reservations.vercel.app/api/customers", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    phone: "8180000000",
    name: "TestUser2"
  })
})
  .then(res => res.text())
  .then(text => fs.writeFileSync("scratch/test-post.json", text))
  .catch(err => console.error(err));
