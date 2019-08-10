chrome.storage.sync.get(['savedLinks'],function(result){
	var title = document.title;
	var name = prompt("Name: ", title);
	var url = document.location.href;
	if(name != null){
		var temp = result.savedLinks;
		temp[document.location.href] = name;
		chrome.storage.sync.set({'savedLinks': temp});
	}	
});