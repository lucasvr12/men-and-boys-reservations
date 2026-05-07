import fs from 'fs';
fetch("https://men-and-boys-reservations.vercel.app/api/admin/appointments")
  .then(res => res.text())
  .then(text => fs.writeFileSync("scratch/admin-apps.json", text))
  .catch(err => console.error(err));
