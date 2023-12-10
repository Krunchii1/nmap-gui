export const validateCommandSyntax = (command) => {
    // Regular expression to check for valid nmap command syntax
    const cmdArr = command.split(" ")
    var flagsArr = [];
    var element;
    for (element of cmdArr) {
        if (element.startsWith('-')){
            flagsArr.push(element)
        }
    }

    const isFirst = cmdArr[0].trim() === 'nmap';

    if (!isFirst) {
        return 'Invalid command.'
    }
    
    // Flags are only valid from profiles or the common types of scans (stealth, regular, host, OS, port, aggressive)
    const validFlags = ['-T4', '-A', '-v', '-sn', '-F', '--traceroute', '-sS', '-O', '-sV', '-p']
    const portRegex = /^(\d+|-)(,(\d+|-))*$/;
    const isIPorDomainRegex = /(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)|((?!-)[A-Za-z0-9-]{1,63}(?<!-)\.?)+((?=[A-Za-z]{2,})[A-Za-z0-9-]{2,})/g;
    
    // Regular scan
    if (!cmdArr[1].startsWith('-')){
        for (var i = 1; i < cmdArr.length - 1; i++) {
            if (!isIPorDomainRegex.test(cmdArr[i].trim())) {
                return 'Invalid command.'
            }
        }
    }

    // Valid flags
    var flag;
    for (flag of flagsArr) {
        if (!validFlags.includes(flag)) {
            return 'Invalid flag.'
        }
    }

    // Port scan
    if (flagsArr.includes('-p')) {
        var idx = cmdArr.indexOf('-p');
        if (!portRegex.test(cmdArr[idx+1])){
            return 'Maybe you got your ports wrong.'
        }
    }

    // Valid target
    if (flagsArr.length > 0){
        var difference = cmdArr.filter(x => !flagsArr.includes(x));
        for (var i = 1; i < difference.length - 1; i++) {
            if (!isIPorDomainRegex.test(difference[i])) {
                return 'Invalid target.'
            }
        }
    }
        

    // Add more validation rules as needed

    return null; // Validation successful
};
