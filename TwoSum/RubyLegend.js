/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var twoSum = function(nums, target) {
    let resMap = new Map();
    for (let i = 0; i < nums.length; i++) {
        let target_num = target - nums[i];
        let result = resMap.get(target_num);
        if (result !== undefined)
            return [i, result];
        else
            resMap.set(nums[i], i);
    }
};

// Test cases
console.log(twoSum([1,2,3,4,5,6], 5))
console.log(twoSum([5,1], 7))
