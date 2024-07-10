require('dotenv').config()
const express = require('express')
const sequelize = require('./connection')
const router = require('./router')
const controller = require('./controller')

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json());
app.use('/', router);

controller.defineRelations();
//sequelize.sync({ force: true }); 
const startServer = async () => {
    try {
        await sequelize.authenticate()
            .then(async (resp) => {
                console.log('DB connected successfully')
            })

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    }
    catch (e) {
        console.log("Error connecting", e);
    }
}
startServer();

