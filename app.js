const express = require("express");
const ejs = require("ejs");
const mysql = require("mysql");
const path = require("path");
const request = require('request');
const {
    json,
    urlencoded
} = require("body-parser");
const {
    response
} = require("express");



// defining database

const con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'HACKATHON2021',
    multipleStatements: true
});

// connnecting database

con.connect(function (err) {
    if (err) {
        console.log(err);
    } else {
        console.log("sql database connected");
    }
});

const app = express();
app.set('view engine', 'ejs');
app.use(express.urlencoded({
    extended: true
}));
app.use(express.json());
app.use(express.static(__dirname + "/public"));

var Person = {};

app.get("/", function (req, res) {
    res.render("home");
});

app.get("/start-application-page", function (req, res) {
    res.render("start-application")
})

app.post("/start-application-page", function (req, res) {
    const fname = req.body.fname;
    const lname = req.body.lname;
    const birthDate = req.body.birthDate;
    const gender = req.body.gender;
    const phoneNo = req.body.phoneNo;
    const email = req.body.email;

    Person.fname = fname;
    Person.lname = lname;
    Person.birthDate = birthDate;
    Person.gender = gender;
    Person.phoneNo = phoneNo;
    Person.email = email;

    res.redirect("/about-you");

});

app.get("/about-you", function (req, res) {
    var fullName = Person.fname + " " + Person.lname;
    res.render("about-you", {
        userName: fullName,
    })
});

app.post("/about-you", function (req, res) {
    const maritalStatus = req.body.maritalStatus;
    const address = req.body.address;
    const state = req.body.state;
    const pinCode = req.body.pinCode;
    const Country = req.body.Country;

    Person.maritalStatus = maritalStatus;
    Person.address = address;
    Person.state = state;
    Person.pinCode = pinCode;
    Person.Country = Country;

    res.redirect("/dependents");

});


app.get("/dependents", function (req, res) {

    var message = 0
    if (req.query.value) {
        message = {
            "value": req.query.value
        };
        JSON.stringify(message);
    }

    var fullName = Person.fname + " " + Person.lname;
    res.render("dependents", {
        userName: fullName,
        number : message.value
    });
})

app.post("/dependents", function(req, res) {
    var type = req.body.numDeps;
    if(type == 'numDeps') {
        var numberDependents = req.body.numDependents;
        res.redirect(`/dependents?value=${numberDependents}`)
    } else if(type == 'zero') {
        Person.numberDependents = 0;
        Person.numberDependentsAge = [];
        res.redirect("/co-borrower")
    } 
    
    else {
        var number = parseInt(req.body.number);
        var ages = req.body.ages;
        if(!number) {
            Person.numberDependents = 0;
            Person.numberDependentsAge = []
        } else {
            Person.numberDependents = number;
            Person.numberDependentsAge = Array(ages);
        }
        
        
        res.redirect("/co-borrower");
    }
})


app.get("/co-borrower", function (req, res) {
    var fullName = Person.fname + " " + Person.lname;
    res.render("co-borrower", {
        userName: fullName
    });
})

app.post("/co-borrower", function (req, res) {
    const formType = req.body.formType;
    if (formType == "co-borrower") {
        const coName = req.body.coName;
        const coAge = req.body.coAge;
        const coIncome = req.body.coIncome;

        Person.coName = coName;
        Person.coAge = coAge;
        Person.coIncome = coIncome;
    } else {
        Person.coName = "";
        Person.coAge = 0;
        Person.coIncome = 0;
    }
    res.redirect("/review-about-you");
})

app.get("/review-about-you", function (req, res) {
    var fullName = Person.fname + " " + Person.lname;
    res.render("review-about-you", {
        userName: fullName,
        user: Person
    })
})

app.get("/your-goals", function (req, res) {
    var fullName = Person.fname + " " + Person.lname;
    res.render("your-goals", {
        userName: fullName
    });
})

app.get("/loan-type", function (req, res) {
    var fullName = Person.fname + " " + Person.lname;
    res.render("loan-type", {
        userName: fullName
    });
})

app.get("/car-loan", function (req, res) {
    var fullName = Person.fname + " " + Person.lname;
    res.render("car-loan", {
        userName: fullName
    });
})

app.get("/home-loan", function (req, res) {
    var fullName = Person.fname + " " + Person.lname;
    res.render("home-loan", {
        userName: fullName
    });
})

app.post("/car-loan", function (req, res) {
    var carBrand = req.body.carBrand;
    var carModel = req.body.carModel;
    var purchasePrice = req.body.purPrice;
    var downPayment = req.body.downPayment;
    var loanAmount = req.body.loanAmount;

    Person.loanType = 'car';
    Person.s_b_name = carBrand;
    Person.c_m_name = carModel;
    Person.purchasePrice = purchasePrice;
    Person.downPayment = downPayment;
    Person.loanAmount = loanAmount;

    res.redirect("/calculate-credit-score")

})

app.post("/home-loan", function (req, res) {

    var state = req.body.state;
    var city = req.body.city;
    var purchasePrice = req.body.purPrice;
    var downPayment = req.body.downPayment;
    var loanAmount = req.body.loanAmount;

    Person.loanType = 'home';
    Person.s_b_name = state;
    Person.c_m_name = city;
    Person.purchasePrice = purchasePrice;
    Person.downPayment = downPayment;
    Person.loanAmount = loanAmount;

    res.redirect("/calculate-credit-score")
})

app.get("/calculate-credit-score", function(req, res) {
    var fullName = Person.fname + " " + Person.lname;
    res.render("calculate-credit-score", {
        userName: fullName
    }); 
}) 

app.post("/calculate-credit-score", function(req, response) {
    var age = req.body.age;
    var income = req.body.income;

    request(`https://31j0q0noye.execute-api.us-east-1.amazonaws.com/hackathon/creditscore?age=${age}&annualIncome=${income}`, {json: true}, function(err, res, body) {
        if(!err) {
            JSON.stringify(body);
            console.log(body);
            Person.creditScore = body.creditScore;
            var eligiblityStatus = body.eligiblityStatus;
            if(eligiblityStatus === 1) {
                response.redirect("/credit-score-success")
            } else {
                response.redirect("/credit-score-failure")
            }
            
        } else {
            console.log(err);
        }
    })

})

app.get("/credit-score-success", function(req, res) {
    var fullName = Person.fname + " " + Person.lname;
    res.render("credit-score-success", {
        userName: fullName,
        creditScore: Person.creditScore
    });
})

app.get("/credit-score-failure", function(req, res) {
    var fullName = Person.fname + " " + Person.lname;
    res.render("credit-score-failure", {
        userName: fullName,
        creditScore: Person.creditScore
    });
})

app.post("/credit-score-failure", function(req, res) {
    Person = {};
    res.redirect("/");
})

app.get("/verification", function(req, res) {
    var message = ""
    if (req.query.value) {
        message = {
            "value": req.query.value
        };
        JSON.stringify(message);
    }
    var fullName = Person.fname + " " + Person.lname;
    res.render("verification", {
        userName: fullName,
        message : message
    });
})

app.post("/verification", function(req, response) {
    var aadhar = req.body.aadhar;
    var pan = req.body.panNo;


    request(`https://31j0q0noye.execute-api.us-east-1.amazonaws.com/hackathon/panverify?pancard=${pan}`, {json: true}, function(err, res, body) {
        if(!err) {
            JSON.stringify(body);
            console.log(body);
            var validPanNo = body.validPan;
            if(validPanNo == 'True') {
                Person.panNo = pan;
                Person.aadhar = aadhar;
                response.redirect("/submit")
            } else {
                response.redirect("/verification?value=Enter Valid PAN")
            }
            
        } else {
            console.log(err);
        }
    })

})

app.get("/submit", function(req, res) {
    var fullName = Person.fname + " " + Person.lname;
    res.render("submit", {
        userName: fullName
    });
})

app.post("/submit", function(req, res) {
    console.log(Person)
    Person.userId = randomIdGenerator()

    con.query(`insert into user values(${Person.userId}, '${Person.fname}', '${Person.lname}', '${Person.bithDate}', '${Person.gender}', ${Person.phoneNo}, '${Person.email}', '${Person.maritalStatus}', '${Person.address}', '${Person.state}', ${Person.pinCode}, '${Person.Country}', ${Person.numberDependents}, '${Person.coName}', ${Person.coAge}, ${Person.coIncome}, '${Person.loanType}', '${Person.s_b_name}', '${Person.c_m_name}', ${Person.purchasePrice}, ${Person.downPayment}, ${Person.loanAmount}, ${Person.creditScore}, ${Person.aadhar}, '${Person.panNo}');`, function(err) {
        if(!err) {
            res.redirect("/thanks");
        } else {
            console.log(err);
        }
    })


})

app.get("/thanks", function(req, res) {
    var fullName = Person.fname + " " + Person.lname;
    res.render("thanks", {
        userName: fullName,
        refNumber : Person.userId
    });
})

app.post("/thanks", function(req, res) {
    Person = {};
    res.redirect("/")
})

app.get("/edit", function(req, res) {
    var fullName = Person.fname + " " + Person.lname;
    res.render("edit", {
        userName: fullName,
        user: Person
    });
})

app.post("/edit", function(req, res) {
    Person.fname = req.body.fname;
    Person.lanme = req.body.lname;
    Person.birthDate = req.body.birthDate;
    Person.phoneNo = req.body.phoneNo;
    Person.email = req.body.email;
    Person.maritalStatus = req.body.maritalStatus;
    Person.address = req.body.address;
    Person.coName = req.body.coName;
    Person.coAge = req.body.coAge;
    Person.coIncome = req.body.coIncome;

    res.redirect("/review-about-you");
})

app.get("/admin", function(req, res) {
    con.query(`select user_id, fname, lname, dob, gender, ph_no from user;`, function(err, result) {
        res.render("admin", {
            users: result
        })
    })
})

app.get("/admin/:userId", function(req, res) {
    const userId = req.params.userId;
    con.query(`select * from user where user_id=${userId}`, function(err, result) {
        if(!err) {
            res.render("user", {
                user: result[0]
            })
        } else {
            console.log(err);
        }
    })

})

// Starting the server

app.listen(5000, function () {
    console.log("server started on port 5000");
});

function randomIdGenerator() {
    var min = 1000000000
    var max = 9999999999
    return Math.floor(Math.random() * (max - min + 1)) + min;
}