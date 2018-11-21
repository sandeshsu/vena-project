/*
This is the main file for scheduling the maintenance
*/
/*npm packages used node-schedule, log4node, express, moment-timezone*/
var func = require('./libraries/lib'); //accessing functions from lib file
var schedule = require('node-schedule'); //used to do cron job
var express = require('express');
var app = express();
const moment=require('moment-timezone');//getting date formatted
var log = require('log4node'); //used for writting log file
log.reconfigure({level: 'info', file: 'test.log'});

var date= func.getCurrentDateandTime(); //Getting current date
log.info("scheduler started at " +date);

/*
Checks schedules everyday at 8.00AM and scheduling maintenance 30days prior to the schedule maintenance date
and sends mail
*/
var checkingdetails_of_30days_onwords = schedule.scheduleJob('0 0 8 * * *', function (req, res) {

    var after30days_date = func.getafter30daysDateandTime(); //getting 30days after date
    console.log("started... check log file of 30 days");
    log.info(" Checking schedules of 30 days before date of schedule on " + after30days_date);  //log

    var startdate = moment(); //current date
    var present_day = parseInt(startdate.format('DD'));  //retriving only day
    var present_day_moment=(present_day+31); //Getting after 30 days date

    /*Establishing Database connection*/
    var connection = func.getconnection();
    connection.connect();
    var get_schedule_details_query = "SELECT * FROM dat_schedules where start_date=\'" + after30days_date + "'";
    connection.query(get_schedule_details_query, (err,result) => {
        if (err) {
            log.error("error caught in Db query" +get_schedule_details_query);
        }
        if (result.length > 0) { //checking if result is present
            log.info(result.length + " Schedule found on " +after30days_date);
            var sch_details = [];
            for(var dbdetail = 0 ; dbdetail < result.length; dbdetail++) { //Getting results pushed in array
                sch_details.push(result[dbdetail]);
            }
            var stdate = moment(after30days_date, "DD-MM-YYYY");
            var st_day = stdate.format('DD'); //retriving only day
            var date = present_day_moment - st_day;  //difference between present day and date of schedule maintenance
            /*function call for sending mail*/
            func.mailforwarding(sch_details, date);

        } else {
            log.info(" No Schedule found on " +after30days_date);
        }
    });
});//checkingdetails_of_30days_onwords

/*
Checks schedules everyday at 8.02AM and scheduling maintenance from 10th day onwords till the date of schedule maintenance
and sends mail
*/
var checkingdetails_of_10days_onwords = schedule.scheduleJob('0 2 8 * * *', function () {

    var startdate = moment(); //current date
    var present_day = startdate.format('DD');  //retriving only day
    var after10days_date = func.getafter10daysDateandTime(); //Getting 10days after date
    console.log("started... check log file of 10 days");

    var days = [0,1,2,3,4,5,6,7,8,9];
    var length = days.length;
    for (var tenday_onwards = length; tenday_onwards--;) { //Checking from 10 day onwards till the date of schedule maintenance
        startdate = moment(); //current date
        var after10daysonwards_date = moment(startdate, "DD-MM-YYYY").add(tenday_onwards, 'days');
        var after10_day = after10daysonwards_date.format('DD');
        var after10_month = after10daysonwards_date.format('MM');
        var curr_year = after10daysonwards_date.format('YYYY');

        var after10_moment= curr_year +"-" + after10_month+ "-" + after10_day; //getting YYYY-MM-DD Format

        /*Establishing Database connection*/
        var connection = func.getconnection();
        connection.connect();
        var get_schedule_details_query = "SELECT * FROM dat_schedules where start_date =\'" + after10_moment + "'";
        connection.query(get_schedule_details_query, (err, result) => {
            if (err) {
                log.error("error caught in db query" +get_schedule_details_query);
            }
            if (result.length > 0)  { //checking if result is present
                var sch_details = [];
                for (var dbdetail = 0; dbdetail < result.length; dbdetail++) { //Getting results pushed in array
                    sch_details.push(result[dbdetail]);
                }
                var stdate = moment(result[0].start_date); //Getting result of start_date from database
                var st_day = stdate.format('DD'); //retriving only day

                var date = st_day - present_day; //difference between date of schedule maintenance and present day
                log.info(" Checking schedules of " +date+ " day/days before date of schedule on " + after10days_date);
                log.info(result.length + " Schedule found on " +after10_moment);
                /*function call for sending mail*/
                func.mailforwarding(sch_details, date);
            }
        });
    }
});//checkingdetails_of_10days_onwords