//Load all of the URLs and titles
chrome.storage.sync.get(['savedLinks'],function(result){
	var temp = result.savedLinks;
	for(var key in temp){
		$('#text_space').append('<div class="container">'+
									'<button>&#215;</button>'+
									'&nbsp<a href="'+key+'">'+temp[key]+'</a>'+
								'</div>');
	}
});


$(document).on('click',':button',function(){
	var url = $(this).next().attr('href');
	chrome.storage.sync.get(['savedLinks'],function(result){
		var temp = result.savedLinks;
		delete temp[url];
		chrome.storage.sync.set({'savedLinks': temp});
	});
	$(this).parent().remove();
});


//Open a new window with the URL clicked
$(document).on('click','.container',function(e){
	if(e.target.nodeName != "BUTTON"){
		window.open($(this).children().next().attr('href'));
	}
});

//Set popup the href of the a tag that is pressed
$('.menuBut').click(function(){
	chrome.browserAction.setPopup({popup: 'html/'+ $(this).attr('href')});
});

Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};