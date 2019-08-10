//restrict character size for the button
loadAll(true);
 
//Get and create new category
$('#add_but').click(function(){
	var category = $('input').val();
	var inp_cat = category.replace(/ /g, "_");
	if(inp_cat != 0 && isValid(category)){
		chrome.storage.sync.get(['indexHash','checkList'],function(result){
		
			//Store the index for the new category in an object
			//The index is the length of the hashtable before inserted
			//Check for duplicates
			var sub = result.indexHash;
			if(!(inp_cat in sub)){
				sub[inp_cat] = Object.size(sub);
				chrome.storage.sync.set({'indexHash':sub});

				//Create a new array for the new category
				var temp_arr = result.checkList;
				temp_arr.push([inp_cat]);
				chrome.storage.sync.set({'checkList':temp_arr});

				//Create a button for the new category and restrict string length
				var short = category;
				if(category.length > 14){
					short = category.substring(0,15) + "...";
				}
				$('#buttonlist').append('<button id="'+inp_cat+'" class="catBut">'+short+'</button>');
				
				updateSpacing(result.checkList.length);

				//Visually display the new category in html
				$('#list').append('<div>'+
							'<h2>'+category+'</h2>'+
							'<button class="removeCat">&#215</button>'+
							'<div id="items"></div>'+
							'<div id="createBox">'+
								'<div class="form" style="display: none;">'+
									'<input id="c1" type="checkbox">'+
									'<input id="c2" type="text" style="width:170px;height:8px;">'+
								'</div>'+
							'</div>');
			}
			//Clear input bar
			$('#input').val('');
		});
	} else{
		alert('Categories cannot  be empty or contain special characters!');
	}
	
});

$('#input').keypress(function(e){
	if(e.which === 13){
		$('#add_but').click();
	}
});

//Show the input forms when creatBox is clicked
$(document).on('click','#createBox',function(){
	$(this).children().css('display','inline');
	$(this).children().children().next().focus();
});

//Hide the input forms when outside is clicked
$(document).on('click', function (e) {
	var clickid = event.target.id;
	if(!(clickid == "createBox" || clickid=="c2")){
		$('.form').hide();
	}
});

//Hide the rename forms when outside is clicked
$(document).on('click', function (e) {
	var clickClass = event.target.className;
	var clickid = event.target.id;
	var tagName = event.target.nodeName;

	if(!(clickid == "createBox" || clickid=="c2")){
		$('.form').hide();
	}

	if(!(clickClass == "renameBox" || tagName == "A3")|| clickid == "z5"){
		$('[id=itemSpaces]').show();
		$('.renameBox').hide();
	}

	if(!(clickClass == "catRename" || tagName == 'H2')){
		$('h2').show();
		$('.catRename').remove();
	}
});

//Initializing the categories and items
//@arr is a 1D array with index 0 the category name and the rest items underneath
function addCat_Items(arr,num){
	var category = arr[0];
	var divId = 'items';
	if(num > -1) divId += num;
	$('#list').append('<div>'+
						'<h2>'+category.replace(/_/g, ' ')+'</h2>'+
						'<button class="removeCat">&#215</button>'+
						'<table id="'+divId+'"></table>'+
						'<div id="createBox">'+
							'<div class="form" style="display: none;">'+
								'<input id="c1" type="checkbox">'+
								'<input id="c2" type="text" style="width:170px;height:8px;">'+
							'</div>'+
						'</div>');
	var str = '';
	for(var i=1; i<arr.length; i++){
			str += '<div class="itemSpace"><input id="z5" type="checkbox"><a3>'+arr[i]+'</a3></div>';
	}
	var idName = '#items';
	if(num > -1) idName += num;
	$(idName).append(str);
	alternateColors();
}

//Load the buttons for the button area
//@arr is a 2D array with categories and items
function loadAllButtons(arr){
	var str = '';
	for(var i=0; i<arr.length; i++){
		var category = arr[i][0];
		var name = category.replace(/_/g, ' ');
		var short = name;
		if(category.length > 14){
			short = category.substring(0,15) + "...";
		}
		str += '<button title="'+name+'" id="'+category+'" class="catBut">'+short+'</button>';
	}
	$('#buttonlist').append(str);
	updateSpacing(arr.length);
}

//Update the items when a new categroy is clicked
//Update the startCategory
//what if category is a name for one of our id?
$(document).on('click','.catBut',function(){
	if($(this).css('background-color') != 'rgb(135, 206, 235)'){
		var category = this.id;
		chrome.storage.sync.set({'startCategory':category});
		$('.catBut').css('background-color','white');
		$(this).css('background-color','#87CEEB');
		$('#list').empty();
		loadAll(false);
	}else{
		$(this).blur();
	}
});

$(document).on('keypress','#c2',function(e){
	if(e.which === 13){
		//Get value, get category name of parent h1, insert into checklist
		var input = $(this).val();

		if(input != ''){
			var category = $(this).parent().parent().prev().prev().prev().text().replace(/ /g, "_");

			chrome.storage.sync.get(['indexHash','checkList'],function(result){
				var index = result.indexHash[category];
				var items = result.checkList[index];
				items.push(input);
				var temp = result.checkList;
				temp[index] = items;
				chrome.storage.sync.set({'checkList': temp});
			});

			$(this).parent().parent().prev().append('<div class="itemSpace"><input id="z5" type="checkbox"><a3>'+input+'</a3');
			$(this).val('');
			alternateColors();
		}
	}
});

function loadAll(init){
	$('#input').focus();
	chrome.storage.sync.get(['startCategory','indexHash','checkList'],function(result){
		var startCat = result.startCategory;
		var items = result.checkList;
		if(init){
			loadAllButtons(items);
			$("#"+startCat).css('background-color','#87CEEB');
		}
		if (items.length != 0){
			if(startCat == 'All'){
				for(var i=0; i<items.length; i++){
					addCat_Items(items[i],i);
				}
			} else{
				var index = result.indexHash[startCat];
				var items_ = result.checkList[index];
				addCat_Items(items_,-1);
			}
		}
	});
}

//Deleting items with checkboxes
$('body').on('change',':checkbox',function(){
	if(this.id != 'c1'){
		var category = $(this).parent().parent().prev().prev().text().replace(/ /g, "_");
		var message = $(this).next().text();
		chrome.storage.sync.get(['checkList','indexHash'],function(result){
			var index = result.indexHash[category];
			var items = result.checkList[index];
			for(var i=1; i<items.length; i++){
				if(items[i] == message){
					items.splice(i,1);
					break;
				}
			}
			var temp_arr = result.checkList;
			temp_arr[index] = items;
			chrome.storage.sync.set({'checkList':temp_arr});
		});
		$(this).parent().remove();
		alternateColors();
	}
}); 

//Delete category
$(document).on('click','h2',function(evt){
	
	if (evt.detail === 1){
		var category = $(this).text();
		$(this).hide();
		$(this).before('<input type="text" placeholder="Category" class="catRename">');
		$(this).prev().val(category);
	}
	/*else if (evt.detail === 3) {
		$(this).parent().hide();

		var category = $(this).text().replace(/ /g, "_");

		chrome.storage.sync.get(['indexHash','checkList','startCategory'],function(result){
			//Shift index in index hash back by one if greater than current index and del original
			var tempHash = result.indexHash;
			var index = tempHash[category];

			for(var key in result.indexHash){
				if(result.indexHash[key] > index){
					tempHash[key] = result.indexHash[key] - 1;
				}
			}
			delete tempHash[category];
			chrome.storage.sync.set({'indexHash':tempHash});
			
			//Remove from checkList
			var tempList = result.checkList;
			tempList.splice(index,1);
			chrome.storage.sync.set({'checkList':tempList});

			//if current start category is the same, set it to All
			if(result.startCategory == category){
				chrome.storage.sync.set({'startCategory':'All'});
				loadAll(false);
				$('#All').css('background-color','yellow');
			}

			$("#"+category).hide();
			$(this).parent().hide();
		});
	}*/
});

//Rename checklist items [class^='job']
$(document).on('click','[class^=itemSpace]',function(){
	$(this).hide();

	var message = $(this).children().next().text();
	if(this.id == "itemSpaces"){
		$(this).next().show();
	} else{
		$(this).attr('id','itemSpaces');
		$(this).after('<input class="renameBox" type="text" placeholder="Text">');
	}
	$(this).next().show().focus();
	$(this).next().val(message);
});

//Renamebox enter function
$(document).on('keypress','.renameBox',function(e){
	if(e.which === 13){
		var category = $(this).parent().prev().prev().text().replace(/ /g, "_");
		var message = $(this).prev().children().next().text();
		var new_mess = $(this).val();

			chrome.storage.sync.get(['indexHash','checkList'],function(result){
				var new_arr = result.checkList;
				var index = result.indexHash[category];
				var items = result.checkList[index];
				for(var i=1; i<items.length; i++){
					if(items[i] == message){
						items[i] = new_mess;
						break;
					}
				}
				new_arr[index] = items;
				chrome.storage.sync.set({'checkList': new_arr});
			});
			$(this).val('');
			$(this).hide();
			$(this).prev().children().next().text(new_mess);
			$(this).prev().show();
		}
	
});


//enter function for renaming the category
$(document).on('keypress','.catRename',function(e){
	if(e.which === 13){
		var org_cat = $(this).next().text().replace(/ /g, "_");
		var new_cat = $(this).val();

		if(isValid(new_cat) && new_cat != ''){
			chrome.storage.sync.get(['indexHash','checkList','startCategory'],function(result){
				var category = new_cat.replace(/ /g, "_");
				var temp_hash = result.indexHash;
				if(!(category in temp_hash)){
					var short = new_cat;
					if(short.length > 14){
						short = short.substring(0,15) + "...";
					}
					$('#'+org_cat).text(short);
					$('#'+org_cat).attr('id',category);

					var index = result.indexHash[org_cat];
					var items = result.checkList[index];

					delete temp_hash[org_cat];
					temp_hash[category] = index;

					var temp_arr = result.checkList;
					temp_arr[index][0] = category;

					chrome.storage.sync.set({'indexHash': temp_hash});
					chrome.storage.sync.set({'checkList': temp_arr});

					if(result.startCategory == category){
						chrome.storage.sync.set({'startCategory': category});
					}
				}else{
					alert('There already exists a category under this title. Please choose a new title.');
				}
			});
			$(this).next().show();
			$(this).next().text(new_cat);
			$(this).hide();
		} else{
			alert('Categories cannot be empty or contain special characters!');
		}
	}
});

//Remove categories by clicking the x button
$(document).on('click','.removeCat',function(event){
	if(event.detail === 2){
		$(this).parent().hide();

		var category = $(this).prev().text().replace(/ /g, "_");

		chrome.storage.sync.get(['indexHash','checkList','startCategory'],function(result){
			//Shift index in index hash back by one if greater than current index and del original
			var tempHash = result.indexHash;
			var index = tempHash[category];
			
			for(var key in result.indexHash){
				if(result.indexHash[key] > index){
					tempHash[key] = result.indexHash[key] - 1;
				}
			}
			delete tempHash[category];
			chrome.storage.sync.set({'indexHash':tempHash});
				
			//Remove from checkList
			var tempList = result.checkList;
			tempList.splice(index,1);
			chrome.storage.sync.set({'checkList':tempList});

			//if current start category is the same, set it to All
			if(result.startCategory == category){
				chrome.storage.sync.set({'startCategory':'All'});
				loadAll(false);
				$('#All').css('background-color','#87CEEB');
			}
			$("#"+category).remove();
			updateSpacing(result.checkList.length);
		});
	}
});
	

//Testing interface
$('#see').click(function(){
	chrome.storage.sync.get(['checkList','indexHash'],function(result){
		/*var build = '';
		for(var key in result.indexHash){
			build += key + ' ' + result.indexHash[key];
		}

		alert(build);
		*/

		var build = '';
		for(var i=0; i<result.checkList.length;i++){
			for(var j=0; j<result.checkList[i].length;j++){
				build += result.checkList[i][j] + " ";
			}
			build += "\n";
		}
		alert(build);
	});
});

//Make sure the colors alternate correctly (not as efficient)
function alternateColors(){
	var length = $('.itemSpace').length;
	var ev_od = 'even';
	if(length%2 == 0){
		ev_od = 'odd';
	}
	$('.itemSpace').css('background-color','white');
	$('.itemSpace:nth-last-of-type('+ev_od+')').css('background-color','#f0eded');
}


//Adjust the spacing between category buttons
function updateSpacing(size){
	var numBut = size+2;
	var but_size = numBut * 75;
	var over = (Math.abs(but_size-245)/numBut)*-1;
	$('.catBut').css('margin-right',over);
	$('#All').css('margin-right',over-3);
}

Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

function isValid(str){
    var regex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g;
	return !regex.test(str);
}

//Set popup the href of the a tag that is pressed
$('.menuBut').click(function(){
	chrome.browserAction.setPopup({popup: 'html/'+ $(this).attr('href')});
});