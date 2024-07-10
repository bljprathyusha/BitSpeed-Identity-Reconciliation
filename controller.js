const Contact = require('./models/Contact')
const { Op } = require('sequelize')

const defineRelations = () => {
    Contact.belongsTo(Contact, { foreignKey: 'linkedId', as: "primaryContact" });
}

const createNewContact = ({ userEmail, userPhoneNumber }) => {
    return new Promise((resolve, reject) => {
        Contact.create({ "email":userEmail, "phoneNumber":userPhoneNumber }).then((response) => {
            resolve({
                "contact": {
                    "primaryContatctId": response.id,
                    "emails": [response.email],
                    "phoneNumbers": [response.phoneNumber],
                    "secondaryContactIds": []
                }
            })

        })
            .catch((err) => {
                reject(err)
            })
    })
}
const createSecondaryContact = ({userEmail,userPhoneNumber,primaryContactId})=>{
    return new Promise((resolve,reject)=>{
        Contact.create({ "email":userEmail, "phoneNumber":userPhoneNumber,"linkedId":primaryContactId,"linkPrecedence":"secondary"}).then((response) => {
            resolve(res)
        })
        .catch(err=>{
            reject(err);
        })
    })
}


const identify = async (req, res) => {
   try{ 
    const userEmail = req.body.email
    const userPhoneNumber = req.body.phoneNumber
    const whereClause = []
    let result = {};
    if (!userEmail && !userPhoneNumber) res.status(400).send("Either of email or phone number must be provided")
    if (userEmail)
        whereClause.push({ email: userEmail })
    if (userPhoneNumber)
        whereClause.push({ phoneNumber: userPhoneNumber })
    const matchedContacts = await Contact.findAll({
        where: {
            [Op.or]: whereClause
        }
    })
    if (matchedContacts.length == 0)
        result = await createNewContact({ userEmail, userPhoneNumber })
    else {
        const primaryContactId = matchedContacts.find(c=>c.linkPrecedence==="primary")?.id ||matchedContacts[0]?.linkedId
        const emailExists = matchedContacts.some(c => c.email === userEmail)
        const phoneExists = matchedContacts.some(c => c.phoneNumber === userPhoneNumber)
        result=matchedContacts
        if(!emailExists || !phoneExists)
           await createSecondaryContact({userEmail,userPhoneNumber,primaryContactId})

    }
    res.send(result)
    }
    catch(e){
        res.status(404).send("Something wrong")
    }

}
module.exports = { defineRelations, identify }