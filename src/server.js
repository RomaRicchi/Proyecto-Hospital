const app =require("./app/index");

const port = app.get("port")

app.listen(3030, () => {
    console.log(`>>>>>>>>> Server running :) on port ${3030}`)
})