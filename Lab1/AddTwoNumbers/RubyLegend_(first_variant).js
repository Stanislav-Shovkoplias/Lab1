/**
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.next = (next===undefined ? null : next)
 * }
 */
/**
 * @param {ListNode} l1
 * @param {ListNode} l2
 * @return {ListNode}
 */

// This will also work, but will fail on large numbers
var addTwoNumbers = function(l1, l2) {
    let first_num = 0;
    let power = 0;  // Initial power of 10
    while ( l1 !== null ) { // Decrypting first number
        first_num = l1.val * Math.pow(10, power) + first_num;
        l1 = l1.next;
        power++;
    }
    console.log(first_num)

    let second_num = 0;
    power = 0;
    while ( l2 !== null ) { // Decrypting second number
        second_num = l2.val * Math.pow(10, power) + second_num;
        l2 = l2.next;
        power++;
    }
    console.log(second_num)


    let sum = first_num + second_num; // Adding it
    console.log(sum)
    let ans = new ListNode(); // Creating new linked list
    let current_node = ans;

    while ( sum != 0 ) {
        let num = sum % 10; // Getting one digit at a time
        sum = Math.floor(sum / 10);

        console.log("New sum: " + sum + ", num: " + num)

        current_node.val = num;
        if (sum != 0) { // Creating next node (if needed)
            current_node.next = new ListNode()
            current_node = current_node.next
        }
    }
};
