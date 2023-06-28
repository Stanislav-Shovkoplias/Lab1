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
var addTwoNumbers = function(l1, l2) {
    // Will try to calculate big number immediately to new list
    let ans = new ListNode();
    let currentNode = ans;
    let sumdigits = 0; // Place to save sum of two digits
    let overflow = 0; // Overflow bit

    while ( l1 !== null || l2 !== null || overflow) {
        sumdigits = 0;
        if (l1 !== null) { // Getting digit from first number
            sumdigits += l1.val;
            l1 = l1.next;
        }

        if (l2 !== null) { // Getting digit from second number
            sumdigits += l2.val;
            l2 = l2.next;
        }

        sumdigits += overflow; // Adding overflow bit
        overflow = 0;

        if (sumdigits >= 10) { // Detecting overflow (> 10)
            overflow++;
            sumdigits = sumdigits % 10;
        }


        currentNode.val = sumdigits; // Assigning value to node
        if (l1 !== null || l2 !== null || overflow) { // Creating next node
            currentNode.next = new ListNode();
            currentNode = currentNode.next;
        }
    }

    return ans;
};

