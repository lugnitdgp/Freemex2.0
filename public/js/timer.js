$(document).ready(function(){

    var timer=()=>{
        
        endTime=$("#endTime").val();
        endTime= Date.parse(endTime)/1000;
        

        startTime=$('#startTime').val();
        startTime=Date.parse(startTime)/1000;
        
        // getting the system date and calc the difference
        var now=new Date()
        now.setMinutes(now.getMinutes() + 330)
        now = now.toISOString()
        now= Math.ceil(Date.parse(now)/1000)

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

        //timer ended and page reload
        if(days==0 && hours==0 && minutes==0 && seconds==0){
            console.log("here")
            location.reload()
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
    }

    var setTimer=setInterval(timer,1000);

    // Handles the entry of timer
    $('.timer_form').on('submit', function(event){
        event.preventDefault();
        console.log("data:",$(this).serialize())
        $('#loader').fadeIn();
        $.ajax({
            type: $(this).attr('method'),
            url: this.action,
            data: $(this).serialize(),
            context: this,
            success: function() {
                alert("timer added successfully");
                location.reload();
            }
        });
        return false;
    });
});