const app = require("./app/app");

const PORT = process.env.PORT || 3000;

app.listen(PORT, (err) => {
  if (err) {
    console.error("❌ Error iniciando servidor:", err);
  } else {
    console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
  }
});
