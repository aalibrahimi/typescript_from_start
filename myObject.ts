const User = {
    name: "Ali",
    email: "aalibrahimi0@gmail.com",
    isActive: true,
}

function createUser(User: {name: string, isPaid: boolean, email: string}){}

let newUser =  { 
    name: "ali", 
    isPaid: false,
    email: "aalibrahimi01@gmail.com"
}

createUser(newUser)

function createCourse():{name: string, price: number}{
    return {name : "reactjs", price: 399}
}

export {}