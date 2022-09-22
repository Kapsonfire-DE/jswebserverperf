import { Buchta } from "buchta";

// Buchta will create routes, just empty folder where are your app files ( default is public )
const app = new Buchta();

app.get("/", (_req, res) => {
    res.send("hi");
});

app.get("/id/:id/", (req, res) => {
    res.send(`${req.params.get("id")} ${req.query.get("name")}`);
})

app.post("/json/", async (req, res) => {
    // In Bun 0.1.12 and 0.1.13 is issue with `.json()` and `.text()`
    res.send(JSON.stringify(await req.originalReq.json()));
});

app.run();
