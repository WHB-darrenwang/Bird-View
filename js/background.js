'use strict';

chrome.runtime.onInstalled.addListener(function() {
  chrome.storage.sync.set(
    {
      //Checklist items (still undone)
      checkListItem:'',
      //Checklist items that need to be removed
      checkListRemove:'',
      //Counter for the length of current unhidden checklist items
      itemLength:''
    }, 
    function(){
      console.log('Data set!');
    }
  );
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
      chrome.declarativeContent.onPageChanged.addRules([{
        conditions: [new chrome.declarativeContent.PageStateMatcher({
          pageUrl: {hostContains : '.'},
        })
        ],
            actions: [new chrome.declarativeContent.ShowPageAction()]
      }]);
    });
  
});
/*
//Chrome extension onAlarm doesn't run when computer is off
//Check if repeated alarms are running when chrome is open
chrome.runtime.onStartup.addListener(function(){
  chrome.storage.sync.get(['reTimeAlarms'],function(result){
    var items = result.reTimeAlarms.split('?%)');
    if(items.length!=0){
      for(var i=1; i<items.length; i++){
        chrome.alarms.get(items[i],function(result){
          //If the repeated alarm is not in the list, send message to alarm.js to make it
          if(typeof result != 'object'){
            var len = items[1].length;
            var inp_time = items[1].substring(len-8,len-2);
            var inp_mes = items[1].substring(0,len-8);
            alert('here ' + inp_mes + inp_time);
            createTimeAlarm(inp_time,inp_mes,true,false);
          }
        });
      } 
    }
  });
});*/
chrome.alarms.onAlarm.addListener(function(alarm){

  var name = alarm.name;
  var time = name.substring(name.length-8);
  if(name.substring(0,1) == '?'){
    var inp_time = toMilitary(time);
    var inp_mes = name.substring(3,name.length-8);
    createTimeAlarm(inp_time,inp_mes,true);
  }
  if(name.substring(1,3) == '%)'){
    name = name.substring(3,name.length-8);
  }
/*
  var notinfo = {
      type: 'basic',
      iconUrl: '../images/128.png',
      title: name,
      message: 'at '
  };
  chrome.notifications.create('alarm',notinfo);
*/
  var message = name + ' at ' + time;
  alert(message);
});

function createTimeAlarm(inp_time,inp_mes,repeat){
  //Date now
  var date = new Date();
  var now_date = date.toLocaleDateString();

  //Alarm time assuming the date is the same
  var alarm_str = now_date + " " + inp_time;  //inp_time is military
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
    inp_mes = "?%)" + inp_mes + toStandardTime(inp_time); //?%) means that the alarm is time and repeated
  } else{
    var stand = toStandardTime(inp_time);
    var sub = inp_mes + " at " + stand;
    $('#alarms').append('<input id="a2" type="checkbox"><a3>'+sub+'</a3>');
    inp_mes = "!%)" + inp_mes + stand; //!%) means that it is a nonrepeating time alarm
  }
  chrome.alarms.create(inp_mes, alarmInfo); 
}

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

function toMilitary(time){
  var hour = time.substring(0,2);
  var min = time.substring(3,5);
  var ampm = time.substring(6);
  if(hour == 12 && ampm == 'AM'){
    hour = '00'; 
  } else if(hour != 12 && ampm == 'PM'){
    hour = hour - 0 + 12;
  }
  var final_ = hour+":"+min;
  return final_;
}

function toMinutes(milli){
  return milli/60000;
}
