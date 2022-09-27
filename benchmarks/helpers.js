export function shrinkPackageName(str) {
    let pkgs = str.split('/');
    if(pkgs.length > 2) pkgs = pkgs.slice(0,2);
    return pkgs.join('/');
}


export function getResults(str) {
    const regexErrors = /((1|3|4|5)xx|others)[^\d]+(\d+)/gm;
    let m;
    while ((m = regexErrors.exec(str)) !== null) {
        // This is necessary to avoid infinite loops with zero-width matches
        if (m.index === regexErrors.lastIndex) {
            regexErrors.lastIndex++;
        }

        if(parseInt(m[3],10) > 0) return -1;
    }


    const catchNumber = /Reqs\/sec\s+(\d+[.|,]\d+)/m
    const format = Intl.NumberFormat('en-US').format;

    return format(catchNumber.exec(str)[1]);

}