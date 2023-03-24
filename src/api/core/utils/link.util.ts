export const genLink = (length) => {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    // linkData.forEach(l => {
    //     switch () {
    //         case 1: 
    //         if()
    //     }
    // })
    return result;
}