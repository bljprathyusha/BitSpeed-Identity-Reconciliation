const Contact = require('./models/Contact')
const { Op } = require('sequelize')

const defineRelations = () => {
    Contact.belongsTo(Contact, { foreignKey: 'linkedId', as: "primaryContact" });
}

const createNewContact = ({ userEmail, userPhoneNumber }) => {
    return new Promise((resolve, reject) => {
        Contact.create({ "email": userEmail, "phoneNumber": userPhoneNumber }).then((response) => {
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
const createSecondaryContact = ({ userEmail, userPhoneNumber, primaryContactId }) => {
    return new Promise((resolve, reject) => {
        Contact.create({ "email": userEmail, "phoneNumber": userPhoneNumber, "linkedId": primaryContactId, "linkPrecedence": "secondary" }).then((response) => {
            resolve(response)
        })
            .catch(err => {
                reject(err);
            })
    })
}
const findPrimaryContact = (primaryContactIds, matchedContacts) => {
    return new Promise((resolve, reject) => {
        //finds the oldest created primary contact if there are multiple 
        Contact.findOne({
            where: {
                id: { [Op.in]: primaryContactIds } //alternative way-> id : Math.min(...primaryContactIds) as id is autoincremented and no need of order in query
            },
            order: [['createdAt', 'ASC']]
        }).then(async (res) => {
            const oldestPrimaryContact = res;
            if (primaryContactIds.length > 1) {
                //set all other primary contacts and its decendents to secondary and linkedId to the correct primary contact
                primaryContactIds.splice(primaryContactIds.indexOf(oldestPrimaryContact.id), 1);
                await Contact.update({
                    linkedId: oldestPrimaryContact.id,
                    linkPrecedence: "secondary"
                }, {
                    where: {
                        [Op.or]: [{ id: { [Op.in]: primaryContactIds } }, { linkedId: { [Op.in]: primaryContactIds } }]
                    }
                })
            }
            resolve(oldestPrimaryContact)
        }).catch((err) => reject(err))
    })
}
const findAllLinkedContacts = async (matchedContacts) => {
    let primaryContactIds = new Set()
    let reference = {};
    let emailIds = new Set();
    let phoneNumbers = new Set();
    let secondaryIds = new Set();
    matchedContacts.map(c => {
        (c.linkPrecedence === "primary") ? primaryContactIds.add(c.id) : primaryContactIds.add(c.linkedId)
    })
    primaryContactIds = Array.from(primaryContactIds);
    reference = await findPrimaryContact(primaryContactIds, matchedContacts)
    const linkedSecContacts = await Contact.findAll({
        where: {
            linkedId: reference.id
        }
    })
    linkedSecContacts.forEach(c => {
        if (c.email !== reference.email) emailIds.add(c.email);
        if (c.phoneNumber !== reference.phoneNumber) phoneNumbers.add(c.phoneNumber);
        secondaryIds.add(c.id);
    })
    emailIds = Array.from(emailIds)
    emailIds.unshift(reference.email)
    phoneNumbers = Array.from(phoneNumbers)
    phoneNumbers.unshift(reference.phoneNumber)

    return {
        "contact": {
            "primaryContatctId": reference.id,
            "emails": emailIds,
            "phoneNumbers": phoneNumbers,
            "secondaryContactIds": Array.from(secondaryIds)
        }
    }

}
const identify = async (req, res) => {
    try {
        const userEmail = req.body.email
        const userPhoneNumber = req.body.phoneNumber
        const whereClause = []
        let result = {};
        if (!userEmail && !userPhoneNumber) return res.status(400).send("Either of email or phone number must be provided")
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
            const primaryContactId = matchedContacts.find(c => c.linkPrecedence === "primary")?.id || matchedContacts[0]?.linkedId
            const emailExists = userEmail == null || matchedContacts.some(c => c.email === userEmail)
            const phoneExists = userPhoneNumber == null || matchedContacts.some(c => c.phoneNumber === userPhoneNumber)
            if (!emailExists || !phoneExists)
                await createSecondaryContact({ userEmail, userPhoneNumber, primaryContactId })
            result = await findAllLinkedContacts(matchedContacts);
        }
        return res.send(result)
    }
    catch (e) {
        return res.status(404).send("Something wrong")
    }

}
module.exports = { defineRelations, identify }