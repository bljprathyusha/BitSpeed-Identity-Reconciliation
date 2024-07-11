# Identity Reconciliation
## Problem Statement : 
  [BitSpeed Backend Task](https://drive.google.com/file/d/1m57CORq21t0T4EObYu2NqSWBVIP4uwxO/view)

## Solution : 
  ### Tech Stack : 
        Node.js,MySql
  ### Test Cases Handled : createdAt, updatedAt are automatically handled by Sequelize ORM
      **Case-1:** Both email and phoneNumber are given.
                  - If email and phoneNumber are **non-null** and **non-empty** values 
                      - **Case-1a:** Either of email or phone Number exists in DB and other field is new data - Creates a new secondary contact with this data,linking it to the primary contact with findPrimaryContact() method and fetches primary and all secondary contact details in response format.
                      - **Case-1b:** Both fields exists in DB and both point to same object : Fetches primary and all secondary contact details in response format.
                      - **Case-1c:** Both fields exists in DB and both point to different object : If multiple primary contacts exists then oldest one is made primary and others are made secondary and linked to the primary contact and fetches primary and all secondary contact details in response format.
                      - **Case-1d:** Both email and phoneNumber are not there in DB - Creates new data in DB with linkedId as null and linkedPrecedence as primary and fetches same data in response format with secondaryIds[] as empty.
      **Case-2:** Either of email or phone Number given and other field is null.
                  - **Case-2a:** Given field exists in DB: Fetches primary and all secondary contact details in response format.
                  - **Case-2b:** Given field does not exists in DB: Create new contact with other field as null with linkedId as null and linkedPrecedence as primary and fetches same data in response format with secondaryIds[] as empty.
      **Case-3:** Both email and phoneNumber is null then it gives 400 Bad Request error.
  ### Test Cases Unhandled : 
    **Case-1:** Empty string is not considered as null. If you give either field as empty string it trests it as a new combination.
    **Case-2:** A primary contact may have email or phoneNumber as null. E.g : If the non-null field value doesn't exist in db it is created as primary.
                  
