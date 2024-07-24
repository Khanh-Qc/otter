// Unlimited number of parameters in arrow function
const sumAllNum = (...args) => {
    let sum = 0 ;
    for (const element of args) {
        sum += element
    }
    return sum ;
}

console.log(`Sum all element: ${sumAllNum(40,102,20)}`)

// Anonymos function
const square = (n) => {
    return n * n ;
}
console.log(`Calc square of n: ${square(2)}`)

// Self invoking function
(function(n) {
    console.log(n * n)
  })(2) // 4, but instead of just printing if we want to return and store the data, we do as shown below
  
  let squaredNum = (function(n) {
    return n * n
  })(10)
  
  console.log(squaredNum)