/*This file contains all the functions that suporrt scheduler*/
/*npm packages used fs,node-schedule,nodemailer,moment-timezone,mysql2*/
var fs = require('fs'); //To access file system properties
var schedule = require('node-schedule'); //used to do cron job
var nodemailer = require('nodemailer'); //used for sendind mail
const moment=require('moment-timezone'); //getting date formatted
const mysql = require('mysql2'); //used for database connection
//log setup
var log = require('log4node');
log.reconfigure({level: 'info', file: 'test.log'});

//Database connection setup
var getconnection = () => {
    const connnection = mysql.createConnection({
        host: 'vena.cr8is1efqgka.ap-south-1.rds.amazonaws.com',
        user: 'venavena',
        password: 'NovaGlobal',
        database: 'venaProject'
    });
    return connnection;
}//getconnection

//Getting current data and time
var getCurrentDateandTime = ()=>{
    var curr_year=moment().tz("Asia/Kolkata").format('YYYY');
    var curr_month=moment().tz("Asia/Kolkata").format('MM');
    var curr_day=moment().tz("Asia/Kolkata").format('DD');

    curr_moment= curr_year +"-" + curr_month +"-" + curr_day;
    return curr_moment;
}//getCurrentDateandTime

/*sending template to mail*/
var mailforwarding = function(details,date) {
    var mcontent = fs.readFileSync('./scheduleMailer_template.html');  //reading contents of the files
    var result1 = mcontent.toString().replace("$DATE$",details[0].start_date); //replacing contents of the file using token

    //html template creation
    var html1 = '<table border="1"> <tr> <th width="50px">No</th> <th>schedule_name</th> <th>schedule_type</th> </tr>';
    if(details.length > 0){
        for(var get_detail = 0; get_detail < details.length; get_detail++)
        {
            var rowline='<tr> <td>' + (get_detail+1)+ '</td> <td>' + details[get_detail].schedule_name + '</td>';
            html1=html1+ rowline;
            if(details[get_detail].schedule_type == 1) {
                var rowline1 = '<td> Time based </td> </tr>';
                html1=html1+rowline1;
            }
            else if(details[get_detail].schedule_type == 2){
                var rowline1 = '<td> Metric based </td> </tr>';
                html1=html1+rowline1;
            }
        }
    }else{
        var norows='<tr> <td colspan="1">No user</td> </tr>';
        html1=html1+ norows;
    }
    html1=html1 + '</table>';

    var result2 = result1.toString().replace("$ASSETLIST$", html1); //replacing $ASSETLIST$ token with html table
    var subject = fs.readFileSync('./subject.html'); //reading file content
    var result = subject.toString().replace("$DAYS$",date); //replacing contents of the file using token
    mailer(result2,result); //mailer function call
}//mailforwarding

//mailer function
var mailer = function (result2,result) {
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'sandeshmahale@gmail.com',
            pass: 'sanjay@123'
        }
    });
    var mailOptions = {
        from: 'sandeshmahale@gmail.com',
        to: 'sandesh@nova-global.in',
        subject: result,
        html: result2
    };
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            log.info("error sending mail");
        } else {
            log.info('Email sent to: sandesh@nova-global.in');
        }
    });
}//mailer

//Getting after 30days data and time
var getafter30daysDateandTime = ()=>{
    startdate = moment();
    var new_date = moment(startdate, "DD-MM-YYYY").add(30, 'days');

    var after30_day = new_date.format('DD');
    var after30_month = new_date.format('MM');
    var curr_year = new_date.format('YYYY');
    after30_moment= curr_year +"-" + after30_month +"-" + after30_day;
    return after30_moment;
}//getafter30daysDateandTime

//Getting after 10days date and time
var getafter10daysDateandTime = ()=>{
    startdate = moment();
    var new_date = moment(startdate, "DD-MM-YYYY").add(10, 'days');

    var after10_day = new_date.format('DD');
    var after10_month = new_date.format('MM');
    var curr_year = new_date.format('YYYY');
    after10_moment= curr_year +"-" + after10_month+ "-" + after10_day;
    return after10_moment;
}//getafter10daysDateandTime

module.exports={
    getCurrentDateandTime,
    getconnection,
    getafter10daysDateandTime,
    getafter30daysDateandTime,
    mailforwarding
}//exports