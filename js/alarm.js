//!%) nonrepeating time alarm
//?%) repeated time alarm
//if has %) as 2nd and 3rd, is alarm

//If you have time, to make efficiency, if reepeated alarm fire
//when app is online, make it know that it is AM/PM instead of making it fing out 
chrome.alarms.getAll(function(result){
	if(result.length != 0){
		for(var i=0; i<result.length; i++){
			var name = result[i].name;

			if(name.substring(1,3) == '%)'){
				var sub = name.substring(3,name.length-8) + ' at ' + name.substring(name.length-8);
				if(name.substring(0,1) == '?'){
					$('#alarms').append('<div><input id="z7" type="checkbox"><a3 style="color:green;">'+sub+'</a3><br></div>');
				} else if(name.substring(0,1) == '!'){
					$('#alarms').append('<div><input id="z5" type="checkbox"><a3>'+sub+'</a3><br></div>');
				}
			}else{
				var time = Math.round((1*result[i].scheduledTime - Date.now())/1000);
				var text;
				if(time != 0){
					text = ' in ~'+time+'sec';
					if(result[i].periodInMinutes != null){
						text += ' every '+result[i].periodInMinutes + 'sec';
					}
				}
				$('#countdowns').append('<div><input id="c2" type="checkbox"><a3>'+name+'</a3><a3>'+text+'</a3><br></div>');
			}
		}
	}	
});


//Activities fired from the add button depending on inputs
$('#add_button').click(function(){
	
	//Get inputted data
	var inp_min = $('#minutes1').val();
	var inp_time = document.getElementById("time1").value;
	var inp_mes = $('#message1').val();
	var repeat = $("#repeat1").is(':checked');

	//Make sure that there is a message and that there is only a value in either minute or time box
	if((inp_mes.length != 0) && (((inp_min.length == 0) && (inp_time.length != 0)) || 
		((inp_min.length != 0) && (inp_time.length == 0)))){

		//Text variable for appending to visual div
		var text = inp_min + " minute(s)";

		//Create a single fire or repetitive fire alarm
		if(inp_min.length !=0){
			var alarmInfo;
			if(repeat){
				alarmInfo = {
					periodInMinutes: 1 * inp_min
				};
				text = " every " + text;
			} else{
				alarmInfo = {
					when: Date.now() + (60000 * inp_min)
				};
			}
			chrome.alarms.create(inp_mes, alarmInfo);

			/* Create a checkbox with a parent div and sibiling texts 
			   First <a3> tag determines the name of the alarm
			   Second <a3> tag provides additional countdown information */
			$('#countdowns').append('<div><input id="c2" type="checkbox"><a3>'+inp_mes+'</a3><a3> in '+text+'</a3><br></div>');
		} 

		//Fired if a time is entered rather than countdown minutes
		else{
			createTimeAlarm(inp_time,inp_mes,repeat);
		}
	} else{
		alert('Please have either minutes filled or time filled!');
	}
	//Clear the input forms
	$('[id$="1"]').val('');
});


//repeat!!!! at 03:12 AM
 $(document).on('click','[id^="z"]',function(){
 	var mes = $(this).next().text();
 	var name = mes.substring(0,mes.length-12);
 	var time = mes.substring(mes.length-8);
 	var fin_name = "%)"+name+time;
 	if(this.id == 'z7'){ //Repeats
		fin_name = "?"+fin_name;
 	} else{ //Once
 		fin_name = "!"+fin_name;
 	}
 	chrome.alarms.clear(fin_name);
 	$(this).parent().hide();
 });

 $(document).on('click','#c2',function(){
 	var mes = $(this).next().text();
 	chrome.alarms.clear(mes);
 	$(this).parent().hide();
 });

$('#get').click(function(){
	chrome.alarms.getAll(function(result){
		alert(getText(result));
	});
});

function createTimeAlarm(inp_time,inp_mes,repeat){
	//Date now
	var date = new Date();
	var now_date = date.toLocaleDateString();

	//Alarm time assuming the date is the same
	var alarm_str = now_date + " " + inp_time;
	var alarm_time = new Date(alarm_str);       //Milliseconds for alarm time
			
	//Get time now
	var now_time = date.getTime();

	/* Check if the date is today or tomorrow
	   Alarm time has to be greater than current time
	   If alarm time is less, then increase the day by one */
	if(alarm_time <= now_time){
		var temp_date = new Date();
		temp_date.setDate(temp_date.getDate() + 1);
		var tom_date = temp_date.toLocaleDateString();
		var tom_str = tom_date + " " + inp_time;
		alarm_time = new Date(tom_str);
	}
	var diff = alarm_time - now_time;
	var set_minutes = toMinutes(diff);

	//Create the time alarm
	var alarmInfo = {
			when: Date.now() + diff
	};

	if(repeat){
		var stime = toStandardTime(inp_time);
		var sub = inp_mes + ' at ' + stime;
		inp_mes = "?%)" + inp_mes + stime; //?%) means that the alarm is time and repeated
		$('#alarms').append('<div><input id="z7" type="checkbox"><a3 style="color:green;">'+sub+'</a3><br></div>');
	} else{
		var stand = toStandardTime(inp_time);
		var sub = inp_mes + " at " + stand;
		$('#alarms').append('<div><input id="z5" type="checkbox"><a3>'+sub+'</a3><br></div>');
		inp_mes = "!%)" + inp_mes + stand; //!%) means that it is a nonrepeating time alarm
	}
	chrome.alarms.create(inp_mes, alarmInfo);	
}

//Takes result from chrome.alarms.getAll and converts to a readable strip
function getText(result){
	var text = '';
	for(var i=0; i<result.length; i++){
		var time = Math.round((1*result[i].scheduledTime - Date.now())/1000);
		if(time != 0){
			text += '<a3>'+result[i].name+' in ~'+time+'sec';
			if(result[i].periodInMinutes != null){
				text += ' every '+result[i].periodInMinutes + 'sec';
			}
			text += '</a3>';
		}
	}
	return text;
}

//Converts military time to standard time
function toStandardTime(mtime){
	var mhour = mtime.substring(0,2);
  	var mmin = mtime.substring(3);

	var ampm = 'PM';
	if((0 <= mhour) && (mhour<12)){
		ampm = 'AM';
	}
	if (mhour == 0){
		mtime = '12:' + mmin + ' AM';
	}
  	else if(mhour == 24){
    	mtime = '12:00 AM';
  	}
  	else if (ampm == 'PM' && mhour != 12){
		mhour -= 12;
		mtime = mhour + mtime.substring(2) + " " + ampm;
    	if(mhour < 10 && mhour>=0){
      		mtime = "0" + mtime;
    	}
	} else{
		mtime += " " + ampm;
	}
	return mtime;
}

//Converts from milliseconds to minutes
function toMinutes(milli){
	return milli/60000;
}
