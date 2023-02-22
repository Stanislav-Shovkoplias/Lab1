/**
 * @param {string} digits
 * @return {string[]}
 */
const l = ["", "", "abc", "def", "ghi", "jkl", "mno", "pqrs", "tuv", "wxyz"] 

var letterCombinations = function(digits) {
    if(digits.length==0)
        return [];

    var res = [""];
    for(var i = 0; i<digits.length; ++i){
        var num = digits[i]-'0';
        var tmp = []
        for(var j = 0; j<res.length; ++j)
            for(var k = 0; k<l[num].length; ++k)
                tmp.push(res[j]+l[num][k]);
        res=tmp;
    }
    return res;
};
