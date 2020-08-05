$(document).ready(function(){

    var timer=()=>{
        
        // set the count end timer: new Date(year,month,day,hr,min,sec,millisec)
        // var endTime= new Date(0,0,0,0,0,0,0);
        // endTime=$("#endTime").val();
        let endTime = new Date(2020,7,10,2,30,0,0); // A random time. Needs to be assigned from backend.
        endTime= Date.parse(endTime)/1000;
        // startTime=$('#startTime').val();
        let startTime = new Date(2020,7,7,2,30,0,0); // A random time. Needs to be assigned from backend.
        startTime=Date.parse(startTime)/1000;
        // getting the system date and calc the difference
        var now= new Date();
        now= Date.parse(now)/1000

        //if event ended
        if(now>=endTime){
            var timeLeft= now-endTime;
        }
        //if event not yet started
        else if(startTime>=now){
            var timeLeft= (startTime-now);
        }
        //if event ongoing
        else{
            var timeLeft= endTime-now;
        }

        if (timeLeft<0){
            days=0;
            hours=0;
            minutes=0;
            seconds=0;
        }
        else{
            var days= Math.floor(timeLeft/86400);

            var hours= Math.floor((timeLeft-(days*86400))/3600);

            var minutes = Math.floor((timeLeft-(days*86400)-(hours*3600))/60);

            var seconds= Math.floor(timeLeft-(days*86400)-(hours*3600)-(minutes*60));
        }

        if(days < 10)
            days = "0" + days;
        
        if(hours < 10)
            hours = "0" + hours;
        
        if(minutes < 10)
            minutes = "0" + minutes;
        
        if(seconds < 10)
            seconds = "0" + seconds;

        $("#days").text(days);
        $("#hours").text(hours);
        $("#minutes").text(minutes);
        $("#seconds").text(seconds)

        //timer ended and page reload
        if(days=="0" && hours=="0" && minutes=="0" && seconds=="0"){
            location.reload()
        }
    }

    var setTimer=setInterval(timer,1000);

});