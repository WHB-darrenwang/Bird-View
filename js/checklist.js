//DO NOT USE '%!(' IN ANY INPUTS--it is the unique key to split the string
//Public variables don't update within the chrome methods, thus, making this less efficient

//Load all checklist items from the chrome storage
chrome.storage.sync.get(['checkListItem','checkListRemove'],function(result){
	//Extract data and put it into arrays
	var items = result.checkListItem.split('%!(');
	var remove = result.checkListRemove.split(',');

	//Set null to the removed index
	var remLen = remove.length;
	if (remLen != 0){
		for(var i=0; i<remLen-1; i++){
			items[remove[i]] = null;
		}
		chrome.storage.sync.set({'checkListRemove': ''});
	}

	//Show indexes that are not null and update new checklist items
	var counter = 0, final_items = '';
	for(var i=0; i<items.length-1; i++){
		if(items[i] != null){
			final_items += items[i] + '%!(';

			//Creates a unique ID div with a checkbox, text, and line break
			$('#list').append('<div id="d'+counter+'"> <input id="c'+counter+'" type="checkbox"><a>'+items[i]+'</a><br></div>');
			counter++;
		}
	}
	chrome.storage.sync.set({'itemLength': counter,'checkListItem': final_items});
});

//Add inputted checklist items
setTimeout(function(){
	$('#add_but').click(function(){

		chrome.storage.sync.get(['checkListItem','itemLength'],function(result){

			//Get inputted text
			var input = $('input').val();

			var items = result.checkListItem;
			var length = result.itemLength;

			if(input.length != 0){
				items += input + '%!(';
				$('#list').append('<div id="d'+length+'"><input id="c'+length+'" type="checkbox"><a>'+input+'</a><br></div>');
				length ++;
				chrome.storage.sync.set({'checkListItem': items,'itemLength': length});
				$('#input').val('');
			}
		});
	});

	$('#input').keypress(function(e){
		if(e.which === 13){
			$('#add_but').click();
		}
	});
});

//Remove/hide checklist items
$('body').on('change',':checkbox',function(){
	var id = $(this).attr('id').substring(1);
	chrome.storage.sync.get(['checkListRemove'],function(result){
		var get = result.checkListRemove;
		get += id + ',';
		chrome.storage.sync.set({'checkListRemove':get});
	});
	$('#d'+id).hide();
}); 

//Set popup to the main menu
$('#back').click(function(){
	chrome.browserAction.setPopup({popup: 'html/popup.html'});
});