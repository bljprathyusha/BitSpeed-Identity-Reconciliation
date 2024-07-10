require('dotenv').config()
const  Contact  = require('./models/Contact')
const sequelize = require('./connection')

const defineRelations = () =>{
    Contact.belongsTo(Contact,{foreignKey:'linkedId',as:"primaryContact"});
}
sequelize.authenticate()
.then(async(res)=>{
   defineRelations();
    // await sequelize.sync({force:true}).then(res=>{
    //     Contact.bulkCreate([{email:"prat@gmail.com",phoneNumber:"1254"},{email:"hari@gmail.com",phoneNumber:"1254",linkedId:1,linkedPreference:"secondary"}])
    // })
    
})
