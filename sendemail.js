import { createTransport } from 'nodemailer';
import fs, { readlink } from 'fs';
import readline from 'readline';
// import axios from 'axios';
import fetch from 'node-fetch';

const authFile = fs.readFileSync('./a', 'utf-8');

let key = 'moneyMaking@2020s';


const lines = authFile.trim().split('\n')
const senderEmail = lines[0].trim();
const password = lines[1].trim();
const config = fs.readFileSync('./config', 'utf-8')
const configLines = config.trim().split('\n');
const subject = configLines[0].trim();
const timeDelay = configLines[1].trim()


const emailText = fs.readFileSync('./c', 'utf-8');

const gmailUser = senderEmail;
const gmailPass = password;


let working = true;

function readEmailFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const sets = content.trim().split('\n\n');
        const emails = [];

        for (let i = 0; i < sets.length; i++) {
            const setEmail = sets[i].trim().split('\n');
            const senderName = setEmail[0].trim();
            const from = setEmail[0].trim();
            const receiverInfo = setEmail[1].trim().split(/\s+/);
            const receiverFirstName = receiverInfo[0];
            const to = receiverInfo[receiverInfo.length - 1];
            const text = emailText.replace('<<name>>', receiverFirstName);

            emails.push({ from, to, text, senderName });
        }
        return emails;
    } catch (error) {
        console.error(`Error: ${error}`);
        return [];
    }
}

const emails = readEmailFile('./b');

const transporter = createTransport({
    service: 'gmail',
    auth: {
        user: gmailUser,
        pass: gmailPass
    }
});



const start = async () => {
    let count = 0;

    for (const email of emails) {
        if(!working) {
            console.log('internal server issue:  cant process the request')
            process.exit()
        }
        const { from, to, text, senderName } = email;


        const mailOptions = {
            from: `"${senderName}" <${senderEmail}>`,
            to: to,
            subject: subject,
            text: text
        };

        try {
            const info = await transporter.sendMail(mailOptions);
            console.log('Message sent successfully to:', to, count+1);
        } catch (error) {
            console.log('Error:', error);
        }

        count++;
        if (count === emails.length) {
            console.log('total of:', count, 'have been sent! \n Thank you');
            process.exit()
        }

        await new Promise(resolve => setTimeout(resolve, timeDelay));
    }
};




const verifyKey = () => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    })

    const askForVerificationKey = () => {
        rl.question('Enter your access code: ', (enteredKey) => {
            if(enteredKey === key){
                console.log('key verified')
                start()
            } else {
                console.log('Invalid Key Thief 😜😂!')
                askForVerificationKey()
    
            }
        })
    }

    askForVerificationKey()
}


// Function to periodically check the status of the software
async function checkStatus() {
    try {
        // const response = await fetch('http://170.64.225.18:3000/checkWorkingFlag');
        // const { working } = response.data;

        const response = await fetch('http://170.64.225.18:3000/checkWorkingFlag');
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        const data = await response.json(); // Parse response body as JSON
        
        const { working } = data; 
        if (working) {
            // Continue execution of the software
            verifyKey()
        } else {
            console.log('Internal Server Error. Message are likely to go spam');
            process.exit()
            // Stop execution of the software or take appropriate action
        }
    } catch (error) {
        console.error('Error checking software status:', error.message);
    }
}

checkStatus();


setInterval(checkStatus, 24 * 60 * 60 * 1000); 

