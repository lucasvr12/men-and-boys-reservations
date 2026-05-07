import fs from 'fs';
fetch("https://men-and-boys-reservations.vercel.app/api/admin/customers")
  .then(res => res.text())
  .then(text => fs.writeFileSync("scratch/test-customers.json", text))
  .catch(err => console.error(err));
