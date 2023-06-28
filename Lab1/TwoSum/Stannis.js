/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var twoSum = function(nums, target) {
    let mp = []
    
    for (let i = 0; i < nums.length; i++) {
        let diff = target - nums[i]
        
        if (mp.includes(diff)) {
            return [i, mp.indexOf(diff)]
        }
        
        mp.push(nums[i])
    }
};
