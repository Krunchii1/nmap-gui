const express = require('express')
const app = express()
const port = 3000
const bodyParser = require('body-parser');
const cors = require('cors');
const exec = require('child_process').exec
const { validateCommandSyntax } = require('../client/src/validation/commandValidation.js')

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors())


app.post('/scan', (req, res) => {
    const { command } = req.body;

    const validationError = validateCommandSyntax(command);
    if (validationError) {
        return res.status(400).json({ error: validationError });
    }
    
    // Execute the nmap command using child_process.exec
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error('Error executing nmap command:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            const formattedOutput = formatNmapOutput(stdout);
            res.status(200).json({ result: formattedOutput });
        }
    });
});

function formatNmapOutput(rawOutput) {
    // Modify this function based on your requirements to format the nmap output
    // For example, you might want to add HTML line breaks for better display in the client
    const formattedOutput = rawOutput.replace(/\n/g, '<br>');
    return formattedOutput;
}

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})