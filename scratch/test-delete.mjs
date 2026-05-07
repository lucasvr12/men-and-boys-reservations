import fs from 'fs';
fetch("https://men-and-boys-reservations.vercel.app/api/admin/appointments/random_id", {
  method: "DELETE",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    branch: "Carrizalejo",
    phone: "1234567890",
    date: "2026-05-10",
    time: "10:00",
    status: "Cancelada"
  })
})
  .then(res => res.text())
  .then(text => fs.writeFileSync("scratch/test-delete-res.json", text))
  .catch(err => console.error(err));
