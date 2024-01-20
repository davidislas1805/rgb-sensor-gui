/************************Custom serial string functions***************************/

// Get id message from decoded serial string
function deconcatSerialString(decoded_serial_string){
    if(!decoded_serial_string.includes(": ")){
        return decoded_serial_string;
    }
    let deconcat_string = decoded_serial_string.split(": ");
    let stringObject = {
        id: deconcat_string[0],
        msg: deconcat_string[1].split(", ")
    };
    return stringObject;
}

module.exports = {deconcatSerialString};