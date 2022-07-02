const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const ismail = require("ismail")

const port = 3000

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

const mongoose = require('mongoose');
const { stringify } = require('querystring')
const { nextTick } = require('process')
const { dir } = require('console')
mongoose.connect('mongodb://localhost:27017/superHeros');
const con = mongoose.connection

con.on('error', console.error.bind(console, "connection error"));
con.once('open', () => console.log("Connected to db"))

const user = mongoose.Schema({
    firstName: String,
    lastName: String,
    mail: String,
    password: String
})
const User = mongoose.model("Users", user)
app.set("view engine", "ejs");
app.use('/', express.static(__dirname + '/files'))
app.get("/", (req, res) => res.render("welcomePage.ejs"))
app.get('/registerPage', (req, res) => res.render("register.ejs"))
app.get('/loginPage', (req, res) => res.render("login.ejs"))


app.post("/homePage", (req, res) => {
    checkLogin(req, res)
})

async function getInfo(email) {
    let user = await User.findOne({ mail: email })
    return user;
}
async function checkLogin(req, res) {
    let data = await getInfo(req.body.mail)
    if (req.body.mail == "" || req.body.password == "")
        res.send('<script>alert("please fill up all the fields");window.location.href = "/loginPage" </script>');
    else if (user == {})
        res.send('<script>alert("wrong Email mybe try to register");window.location.href = "/loginPage" </script>');
    else if (req.body.password != data.password) {
        console.log(req.body.password + "+" + user.password);
        res.send('<script>alert("wrong Password");window.location.href = "/loginPage" </script>');
    }
    else if (req.body.mail == "123@gmail.com" && req.body.password == "1234")
        res.redirect("adminPage")
    else {
        res.redirect("/homePage")
    }
}

app.post('/loginPage', (req, res) => {
    checkRegister(req, res)
})

async function addNewUser(req) {
    let data = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        mail: req.body.mail,
        password: req.body.password
    })
    data.save()
}

async function checkRegister(req, res) {
    if (req.body.firstName.length > 20 || req.body.firstName.length < 2) {
        res.send('<script>alert("First name must be between 2 to 20 chars"); window.location.href = "/registerPage" </script>');
    }
    else if (req.body.lastName.length > 20 || req.body.lastName.length < 2) {
        res.send('<script>alert("Last name must be between 2 to 20 chars"); window.location.href = "/registerPage" </script>');
    }
    else if (!ismail(req.body.mail)) {
        res.send('<script>alert("invalid mail"); window.location.href = "/registerPage" </script>');
    }
    else if (getInfo(req.body.mail).mail == "") {
        res.send('<script>alert("Email aready in use"); window.location.href = "/registerPage" </script>');
    }
    else if (req.body.password != req.body.confirmPass) {
        res.send('<script>alert("your paasswords dont match");window.location.href = "/registerPage" </script>');
    }
    else {
        await addNewUser(req);
        res.render("loginPage")
    }

}

const superHero = mongoose.Schema({
    name: String,
    superPower: String,
    photoLink: String
})
const SuperHero = mongoose.model("SuperHero", superHero)


app.get('/homePage', (req, res) => {
    showTable(req, res)
})

async function showTable(req, res) {
    let sInfo = await SuperHero.find()
    res.render("homePage", { info: sInfo })
}
app.get('/homePage/:name', async (req, res) => {
    let name = req.params.name
    console.log(name)
    let infoo = await SuperHero.find({ name: name })
    res.send(infoo.info)
})

app.use('/', express.static(__dirname + '/functionAndInfo'))
app.get('/adminAdd', (req, res) => {
    res.render("addHero")
})
app.post('/adminAdd', (req, res) => {
    console.log("we are here");
    const superHero = new SuperHero({
        name: req.body.name,
        superPower: req.body.powers,
        photoLink: req.body.link
    })
    superHero.save()
    console.log("done new hero added")
    res.redirect('/adminPage')

})
async function add1Hero(req, res) {
    const superHero = new SuperHero({
        name: req.body.name,
        superPower: req.body.powers,
        photoLink: req.body.link
    })
    superHero.save()
    res.redirect('/adminPage')
}
app.post('/adminDelete', (req, res) => {
    deleteHero(req)
    res.redirect('/adminPage')
})
app.get('/adminDelete', (req, res) => {
    res.render("deleteHero")
})

async function deleteHero(req) {
    let heroName = req.body.name
    await SuperHero.deleteOne({ name: heroName })
}

app.get('/adminPage', (req, res) => {
    res.render("adminPage")
})
app.post('/adminPage', (req, res) => {
    res.render("adminPage")
})

// url param 





app.listen(port, () => console.log(`listening to port ${port}`))