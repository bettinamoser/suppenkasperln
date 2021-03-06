/*************************setup*************************************/
$.ajaxSetup({
  url: 'http://www.bettinamoser.at/suppenkasperln/interface.php',
  type: 'POST'
});

var categorieNames = {
  'vegetables':'Gemüse',
  'fruits':'Obst',
  'meat_fish':'Fleisch und Fisch',
  'cereals':'Getreide und Getreideprodukte',
  'milk':'Milch und tierische Produkte',
  'spices':'Gewürze und Kräuter'
};

var ingredientsPath = 'img/ingredients/';
var eatersPath = 'img/eaters/';
var recipePhotoPath = 'data/recipes/';

var persons = []; //array where all persons are included index=eater_id

var loadedRecipes = []; //array where all loaded recipes are included
//var activeRecipes = []; //index: recipe index, val is boolean
var recipeFiles = []; //which recipe belongs to which file

var allLikes = []; //array for all Likes(values are not unique!)
var allDisLikes = []; //array for all DisLikes(values are not unique!)
var allAllergens = []; //array for all Allergens(values are not unique!)


/********************** Konstruktor Klassen **********************/

var Person = function(optionsObj){
  this.options = $.extend({
  name : 'testperson',
  id : 0,
  img : 'eater_boy1.svg',
  likes : [],
  dislikes : [],
  allergens : [],
  selected : false,
  },optionsObj);

  persons[this.options.id] = this;

};




Person.prototype.setPreferencesFromDB = function(){
    var thisPerson = this;
  $.ajax({
    data: {type:"get_eaterpreferences", id: this.options.id},
    success: function(responseData){
      console.log(responseData);

      var prefs = JSON.parse(responseData);
    //  console.log(thisPerson);
      prefs.forEach(function(val){

        if(val.likes==0){ //meaning dislikes
          thisPerson.setPreference(val.ingredient_name,'dislikes');
          console.log('dislike ',val.ingredient_name, thisPerson.options.name);
        }
        if(val.likes == 1){ //meaning likes
          thisPerson.setPreference(val.ingredient_name,'likes');
          console.log('like ',val.ingredient_name, thisPerson.options.name);
        }

      });
      //console.log('all Likes', allLikes);
    //  console.log('all DisLikes', allDisLikes);
    },
    error: function(error){
      console.log('get_eaterpreferences anfrage fehlgeschlagen', error);
    }

  });
};

Person.prototype.setPreference = function(ingredient,prefType){
  if(prefType == 'likes'){
    if ( this.options.likes.indexOf(ingredient) <= -1){
       this.options.likes.push(ingredient);
    }
    allLikes.push(ingredient);

  }else if(prefType == 'dislikes'){
    if ( this.options.dislikes.indexOf(ingredient) <= -1) this.options.dislikes.push(ingredient);
    allDisLikes.push(ingredient);

  }


};

Person.prototype.removePreference = function(ingredient,prefType){
  if(prefType == 'likes'){
   this.options.likes.splice(ingredient,1);
  allLikes.splice(ingredient,1);
  }else if (prefType == 'dislikes'){
  this.options.dislikes.splice(ingredient,1);
 allDisLikes.splice(ingredient,1);
}

};

Person.prototype.save = function(){

};

Person.prototype.delete = function(){
  deleteEaterFromDB(this.options.id);

};

Person.prototype.showEmotions = function(){

  //$('.avatar[data-id="'+this.options.id+'"]')


}



Person.prototype.searchIngredient = function(ingredient){

  if(this.options.likes.indexOf(ingredient) > -1){
    return 'like';
  }
  if(this.options.dislikes.indexOf(ingredient) > -1){
    return 'dislike';
  }

  return 'none';


  /*
  var thinkingBubble = $('<div>')
                        .addClass('thinkingBubble')
                        .attr('data-id',this.id);
  var thinkingLikes = $('<div>')
                        .addClass('thinkingLikes')
                        .attr('data-id',this.id);
  var thinkingDisLikes = $('<div>')
                        .addClass('thinkingDisLikes')
                        .attr('data-id',this.id);
  var thinkingAllergens = $('<div>')
                        .addClass('thinkingAllergens')
                        .attr('data-id',this.id); */
/*  for(var i=0; ingredients.length >= i; i++)
  {
  //likes?
  if(this.options.likes.indexOf(ingredients[i]) > -1){

  };
  //dislikes?
  if(this.options.dislikes.indexOf(ingredients[i]) > -1){


  };
  //allergene?
  if(this.options.allergens.indexOf(ingredients[i]) > -1){

  };
  //display thinking bubble
}
*/

};

var Recipe = function(optionsObj){
  //console.log('optionen vorher',optionsObj);
  this.sortNumber = 0;
  this.active = false;
  this.options = $.extend({
      name : '',
      filename : '',
      ingredients : [{ingredient:'testkarotte',amount:'2'},{ingredient:'testkiwi',amount:'3'}],
      descriptionShort : '',
      description : '',
      portions : 4,
      level : 2,
      duration : '30 min',
      foto : 'no-img.jpg',
      //sortNumber: 0,
      index: -1
    }, optionsObj);


  this.options.index = loadedRecipes.push(this)-1; //save array index to object
  console.log('recipeIndex',this.options.index );
  console.log('recipeFiles',recipeFiles);
  recipeFiles[this.options.filename].push(this.options.index);


  };

  Recipe.prototype.getCount = function(type){
    switch(type){
      case 'likes':
          var likes = this.searchIngredients(allLikes);
          this.setLikes(likes);
          console.log('sortnumber refreshed 3',this.sortNumber);
          return likes.length;
      case 'dislikes':
          var dislikes = this.searchIngredients(allDisLikes);
          this.setDisLikes(dislikes);
          console.log('sortnumber refreshed 3',this.sortNumber);
          return dislikes.length;
      case 'allergens':
          return false;

      default:
        return false;

    }
  }


Recipe.prototype.appendToScreen = function(){

  var likesDiv = $('<div>')
  .append($('<img>').attr('src','img/heart.png'))
  .append($('<span>').html(this.getCount('likes')));

  var disLikesDiv = $('<div>')
  .append($('<img>').attr('src','img/broken_heart.png'))
  .append($('<span>').html(this.getCount('dislikes')));

  var allergensDiv = $('<div>')
  .append($('<img>').attr('src','img/warning.png'))
  .append($('<span>').html(this.getCount('allergens')));

  prefsDiv = $('<div>')
    .append(likesDiv)
    .append(disLikesDiv)
    .append(allergensDiv);



          $('<div>')
            .addClass('recipe')
            .attr('data-index',this.options.index)
            .attr('data-filename',this.options.filename)
            .append($('<h3>').html(this.options.name))
            .append($('<p>').html(this.options.descriptionShort))
            .append(prefsDiv)
            .appendTo('#recipes');

}

//returns true if ingredient was found
Recipe.prototype.searchIngredient = function(ingredient){

  for(var key in this.options.ingredients)
  {
    if(this.options.ingredients[key].ingredient == ingredient ){ console.log('found ingredient: ',this.options.ingredients[key].ingredient); return true;}
  }
  //console.error('ingredient not found');
  return false; //ingredient was not found!
}


//returns array of found ingredients
Recipe.prototype.searchIngredients = function(ingredients){
  var ret = [];

  for(var key in ingredients)
  {
    if(this.searchIngredient(ingredients[key])) ret.push(ingredients[key]);
  }

  return ret;

}

Recipe.prototype.searchAllergens = function(allergenCodes){
  //get data from interface
  getIngredientsOfAllergens();

  for(var key in allergenCodes)
  {

  }

}

Recipe.prototype.setLikes = function(likes){
  if(typeof(this.options.likes) == 'undefined') this.options.likes = [];
  //this.options.likes = [];
  this.options.likes.push(likes);

    this.refreshSortNumber();
    console.log('sortnumber refreshed 2',this.sortNumber);

};

Recipe.prototype.removeLikes = function(likes){
  forEach(likes, function(val){
    var index = this.options.likes.indexOf(val);
    if(index){
      this.options.likes.splice(index,1);
      this.refreshSortNumber();
    }
  });

};

Recipe.prototype.refreshSortNumber = function(){
  this.sortNumber = ((this.options.dislikes)? (-this.options.dislikes.length):0) + ((this.options.likes)? (this.options.likes.length):0);
  console.log('sortnumber refreshed',this.sortNumber);
}

Recipe.prototype.setDisLikes = function(dislikes){
  if(typeof(this.options.dislikes) == 'undefined') this.options.dislikes = [];
  this.options.dislikes.push(dislikes);
  this.refreshSortNumber();
  console.log('sortnumber refreshed 2',this.sortNumber);
  //console.log('dislikes sortnumber',this.sortNumber, dislikes.length);
  //this.sortNumber-=dislikes.length;

};
Recipe.prototype.setAllergens = function(allergen_codes){
  this.options.allergens.push(allergen_codes);
  this.sortNumber=this.sortNumber-3;

};

Recipe.prototype.remove = function(){
  //loadedRecipes.splice(loadedRecipes[this.options.index],1);

}





/*********************** Functions ******************************/
/*
Array.prototype.unique = function(){
  var unique = [];
  $.each(this, function(i, el){
      if($.inArray(el, unique) === -1) unique.push(el);
  });
  return unique;

};*/

var showRecipeEmotions = function(event){
  console.log('this object: ',loadedRecipes[$(this).attr('data-index')]);

  //ingredient highlighting

  //person - show thinking bubble
  //person - edit avatar

}

var sortRecipes = function(recipesArray){
  //1 like zählt 1
  //1 dislike zählt -1
  //1 allergen zählt -3
//  var sortedArray = recipesArray;
console.log('vor dem sortieren:', recipesArray);
   recipesArray.sort(function(a,b){return b.sortNumber-a.sortNumber});
   console.log('nach dem sortieren:', recipesArray);
}

var initializeAllergens = function(responseData){
  var data = JSON.parse(responseData);
  if(data.error){ console.log(data.error); return; }


}

var initializeIngredients = function(responseData){
  var ingredients = JSON.parse(responseData);

  if(ingredients.error){ console.log(ingredients.error); return; }

  ingredients.forEach(function(val){

    //falls noch nicht im DOM: h3 erstellen - für accordion bereich
    if( ! $('h3[data-cat="'+val.ingredient_cat+'"]').length){
      $('<h3>')
        .attr('data-cat',val.ingredient_cat)
        .html(categorieNames[val.ingredient_cat])
        .appendTo('#ingredientAccordion');
      }

      //falls noch nicht im DOM: div erstellen - für accordion für accordion bereich
    if( ! $('div[data-cat="'+val.ingredient_cat+'"]').length){
      $('<div>')
        .attr('data-cat',val.ingredient_cat)
        .appendTo('#ingredientAccordion');
    }

    var imgName = $('<span>')
                  .attr('data-img-id', val.ingredient_id)
                  .addClass('ingredientName')
                  .html(val.ingredient_name)
                  .hide();

      //Bild für Zutat erstellen
    var img = $('<img>')
                .attr('src', ingredientsPath+val.ingredient_cat+'/'+val.ingredient_img)
                .attr('title', val.ingredient_name) //für tooltip
                .attr('name', val.ingredient_name) //für tooltip
                .attr('data-id', val.ingredient_id)
                .attr('data-cat',val.ingredient_cat)
                .addClass('ingredient');
    //Bild im DOM einhängen
    $('div[data-cat="'+val.ingredient_cat+'"]','#ingredientAccordion').append(img).append(imgName);

    //Tooltip für Zutatenname
      $('.ingredient').tooltip();

    /*** Drag&Drop Ingredients ***/
    //Zutat als Draggable definieren
    $('.ingredient').draggable({
      classes: {
        "ui-draggable-dragging": "ingredientDraggable"
      },
     snap: "#dropIngredients",
      snapTolerance: 50,
      helper: 'clone',
     zIndex: 11,
      revert: 'invalid'
    }); //ingredient draggable

    //dropzone für Zutaten definieren
    $('#dropIngredients').droppable({
      accept: '.ingredient',
      over: function(event, ui){
      },
      drop: function(event, ui){
        console.log('something was dropped');
       $(this).append(ui.draggable.detach().removeClass('ingredient').addClass('ingredientDropped'));
      },
      out: function(event, ui){
      }

    }); //ingredient droppable


  });

  /*** Accordion for Categories of Ingredients ***/
  //Accordion erstellen
  $('#ingredientAccordion').accordion({
    classes: {
      'ui-widget':'ingredientsAccordionWidget',
      'ui-accordion-header':'ingredientsAccordionHeader',
      'ui-accordion-content':'ingredientsAccordionContent'
    },
    heightStyle: 'fill',
    icons: {
          header: "ui-icon-circle-arrow-e",
          activeHeader: "ui-icon-circle-arrow-s"
          }
  });

}


var initializeEaters = function(responseData){
  console.log(responseData);

  var eaters=JSON.parse(responseData);
  eaters.forEach(function(val,index){

    p = new Person({
      name : val.eater_name,
      id: val.eater_id,
      img : eatersPath+val.eater_avatar,
      selected : false
    });

    p.setPreferencesFromDB();

    console.log(p);

  /*  $('<object>')
      .addClass('avatar')
      .attr('data',eatersPath+val.eater_avatar)
      .attr('title', val.eater_name)
      .attr('name', val.eater_name)
      .attr('data-id', val.eater_id)
      .appendTo('#eaterOrigin');*/


    $('<img>')
    //          .addClass('eater')
      .addClass('avatar')
      .attr('src', eatersPath+val.eater_avatar)
      .attr('title', val.eater_name)
      .attr('name', val.eater_name)
      .attr('data-id', val.eater_id)
      .appendTo('#eaterOrigin');




  });

  defineDragDropPersons();


  $('.avatar').tooltip();

    getRecipes();

}


  /*** Drag&Drop Persons ***/
var defineDragDropPersons = function(){
  $('.avatar').draggable({
    classes: {
      "ui-draggable-dragging": "avatarDraggable"
    },
      // snap: ".chair",
    //snapTolerance: 50,
    helper: 'clone',
   zIndex: 11,
    revert: 'invalid'
  }); // draggable

    $( ".chair" ).droppable({
      /*classes: {
        "ui-droppable-active": "ui-state-active",
        "ui-droppable-hover": "ui-state-hover"
      },*/
      accept: ".avatar",
      drop: function( event, ui ) {
          $(this).parent().append(ui.draggable.detach().addClass('avatarDropped'));

        var _this = $(this);
        ui.draggable.position({
          my: "bottom",
          at: "bottom",
          of: _this,
          using: function(pos) {
            //$(this).animate(pos, 200, "linear");
            $(this).css({top:pos.top,left:pos.left});
          }
        });
        ui.draggable.show();

      },
      over: function(event, ui){
      // ui.draggable.removeClass('tinyAvatar').addClass('sittingAvatar');
       ui.draggable.addClass('avatarDropped');
       ui.draggable.show();
      },
      out: function(event, ui ){
        ui.draggable.removeClass('avatarDropped');
        ui.draggable.hide();
    //   ui.draggable.removeClass('sittingAvatar').addClass('tinyAvatar');
      }
    }); //droppable chair


    $( "#eaterOrigin" ).droppable({
      /*classes: {
        "ui-droppable-active": "ui-state-active",
        "ui-droppable-hover": "ui-state-hover"
      },*/
    //  accept: ".sittingAvatar",
      accept: ".avatar",
      over: function(event, ui){
      },
      drop: function( event, ui ) {

          $(this).append(ui.draggable.detach());
          ui.draggable.show();

      },
      out: function(event, ui ){

      }
    }); //droppable origin

}

var initializeRecipes = function(responseData){

  var filenames = JSON.parse(responseData);

  //  console.log(filenames);

  filenames.forEach( function(val) {

    recipeFiles[val]=[];
    //console.log(recipeFiles);
    createRecipeCheckbox(val,val);

  })

    loadRecipes();

}

var createRecipeCheckbox = function(fileLocation, fileDescription){

    var label = $('<label>')
      .attr('for',fileDescription)
      .html(fileDescription)
      .appendTo('#fileCheckboxes');

    $('<input>')
      .attr('type','checkbox')
      .attr('name', fileDescription)
      .attr('data-filename', fileLocation)
    //  .prop('checked','checked')
      .appendTo(label);


    //  $( 'input[type="checkbox"]' ).checkboxradio();


}

var loadRecipes = function(){


  //var n = $('input[type=checkbox]:checked').length;
  console.log('recipe files: ',recipeFiles);
//for(var file in recipeFiles){

Object.keys(recipeFiles).forEach(function(filename, index){

  $.getJSON(filename, function(data){

    for(var i=0; i < data.recipes.length; i++)
    {
      var recipe = data.recipes[i];
      //objekt für rezept erstellen
      var r = new Recipe({
        name : recipe.name,
        filename : filename,
        ingredients : recipe.ingredients,
        descriptionShort : recipe.descriptionShort,
        description : recipe.description,
        portions : recipe.portions,
        level : recipe.level,
        duration : recipe.duration,
        foto : recipePhotoPath+recipe.foto
      });

      //  r.appendToScreen();
    } //for
}); //getJSONfile

});


}

var refreshRecipes = function(){

  console.log('removing recipes ', $('.recipe','#recipes'));
  $('.recipe','#recipes').remove();

  //  console.log('active recipes ', activeRecipes);

//sortRecipes(loadedRecipes);

$.each(loadedRecipes,function(index, val){
  if(val.active == true){
    console.log('adding to screen: ',loadedRecipes[index]);
    loadedRecipes[index].appendToScreen();

  }else console.log('not active: ',loadedRecipes[index]);
});
/*
  sortedRecipes.forEach(function(val,index){
  if(val==true){
        console.log('adding: ',loadedRecipes[index]);
        loadedRecipes[index].appendToScreen();
    }

  });
  */


}

var initializeEaterPreferences = function(ing){
  var ingData = JSON.parse(ing);
  if( ingData.length > 0 ){
  ingData.forEach(function(val, index){
    var pref='#likes';
    console.log('likes',val.likes);
    if(val.likes==0) pref='#dislikes';
    $('.ingredient[data-id="'+val.ingredient_id+'"]').clone().appendTo(pref,'#eaterPreferences');
    });
  }else console.log('keine likes/dislikes');

}

/*********************** Database Querys ********************************/


var getIngredients = function(){
  $.ajax({
    data: {type:"get_ingredients"},
    success: initializeIngredients,
    error: function(error){
      console.log('get_ingredients anfrage fehlgeschlagen', error);
    }
  });
}

var getEaters = function(){
  $.ajax({
    data: {type:"get_eaters"},
    success: initializeEaters,
    error: function(error){
      console.log('get_eaters anfrage fehlgeschlagen: ',error);
    }

    });

}

var deleteEaterFromDB = function(eaterId){
  $.ajax({
    data: {type:"delete_eater", id:eaterId},
    success: function(responseData){
      console.log('eater_deleted');
    },
    error: function(error){
      console.log('get_eaters anfrage fehlgeschlagen: ',error);
    }

    });

}

var getEaterPreferences = function(eaterId){
  $.ajax({
    data: {type:"get_eaterpreferences",id:eaterId},
    success: initializeEaterPreferences,
    error: function(error){
      console.log('get_eaterpreferences anfrage fehlgeschlagen: ',error);
    }

    });

}

var getRecipes = function(){
  $.ajax({
    data: {type:"files"},
    success: initializeRecipes,
    error: function(error){
      console.log('get_recipes anfrage fehlgeschlagen: ',error);
    }

    });

}

var getIngredientsOfAllergens = function(allergen){
  $.ajax({
    data: {type:"check_allergens", allergen_code: allergen},
    success: initializeAllergens,
    error: function(error){
      console.log('get_allergens anfrage fehlgeschlagen: ',error);
    }

    });

}






/************************* Event Handler *****************************/

/* function for uploading recipes-data */
var handleDroppedRecipes = function(e){
        console.log('something was dropped');
        var files = e.originalEvent.dataTransfer.files;
        var sendData = new FormData();
        $.each(files, function(i,file){
          console.log( file );
          sendData.append('file', file);

        });


      $.ajax({
          dataType: 'script',
          cache: false,
          contentType: false,
          processData: false,
          data: sendData,
          success: function(responseData){
            //var success = JSON.parse(responseData);
            console.log('data from server',responseData);

          },
          error: function(error){
            console.log('ajax anfrage fehlgeschlagen', error);

          },
          complete: function(){ }

        });

};

var handlePersonDetail = function(){
  console.log('avatar geklickt');

  $('.active').removeClass('active');
  $('#ingredients').removeClass('active');
  $('#eaters').addClass('active');
  $('#delete').attr('data-eaterId',$(this).attr('data-id'));

  $('#detailAvatar').remove();
  $('#eaterName').remove();
  $('.ingredient','#eaterPreferences').remove();

  //console.log($('.ingredient','#eaterPreferences'));

  console.log('data-id: ',$(this).attr('data-id'));

  getEaterPreferences($(this).attr('data-id'));

  $('<object>')
    .attr('data',$(this).attr('src'))
    .attr('id', 'detailAvatar')
    .appendTo('#eaterOptions');


    $('<input>')
      .attr('type','text')
      .attr('id','eaterName')
      .val($(this).attr('name'))
      //.val($(this).attr('title'))
      .appendTo('#eaterOptions');

}

var handleMouseOverIngredient = function(event){

  var ingredientName = $(this).attr('name');

  //highlight avatar
  $.each($('.avatar'), function(index, val){
  //  console.log('object of person ',persons[$(this).attr('data-id')]);
    var p = persons[$(this).attr('data-id')];

    switch(p.searchIngredient(ingredientName)){
      case 'like':
          $(this).addClass('highlightLike');
        break;
      case 'dislike':
          $(this).addClass('highlightDislike');
        break;
      case 'none':
        break;
    }

  });

  //highlight recipe
  $.each(loadedRecipes, function(index,recipe){
    if(recipe.searchIngredient(ingredientName)){
      console.log('data-index ',recipe.options.index);
      $('.recipe[data-index="'+recipe.options.index+'"]').addClass('highlight');
    }
  })

}

var handleMouseOverEater = function(event){

  var eaterId = $(this).attr('data-id');
  $.each($('.ingredientDropped'), function(index, val){
    console.log('name of ingredient ', $(this).attr('name'));
    var p = persons[eaterId];


    switch(p.searchIngredient($(this).attr('name'))){
      case 'like':
          $(this).addClass('highlightLike');
        break;
      case 'dislike':
          $(this).addClass('highlightDislike');
        break;
      case 'none':
        break;
    }

  });
}

var handleMouseOverRecipe = function(event){

  var rIndex = $(this).attr('data-index');
  var recipe = loadedRecipes[rIndex];

  $.each($('.ingredientDropped'), function(index, val){
    console.log('name of ingredient ', $(this).attr('name'));
    var ingredientName = $(this).attr('name');

    if(recipe.searchIngredient(ingredientName)){
      $(this).addClass('highlight');
    }

  });
}




/****************************** Event Listener ********************************/

$(document).on('drag dragstart dragend dragenter dragover dragleave drop','#dropRecipes', function(e){
  e.preventDefault();
  e.stopPropagation();
})

/*** Drop RecipeData ***/
$(document).on('drop', '#dropRecipes', handleDroppedRecipes);


/*** Tab Navigation ***/
$(document).on('click','.tab',function(){
  $('.tabSelected').removeClass('tabSelected');
  $(this).addClass('tabSelected');

  $('.active').removeClass('active');
  var activeDiv = $('a',this).attr('href');
  $(activeDiv).addClass('active');

});

/*** Open Detail-Display on Person Click ***/
$(document).on('click','.avatar', handlePersonDetail);

//remove ingredient from dropzone and position it in right categorie
$(document).on('dblclick','.ingredientDropped',function(){
  console.log('remove ingredient from dropzone');

  $('div[data-cat="'+$(this).attr('data-cat')+'"]','#ingredientAccordion').append($(this).detach().removeClass('ingredientDropped').addClass('ingredient'));
});


//*** Ingredient Mouseover ***/
$(document).on('mouseover','.ingredient', handleMouseOverIngredient );
$(document).on('mouseover','.ingredientDropped', handleMouseOverIngredient );

$(document).on('mouseout','.ingredient' ,function(event){
  $('.highlightDislike').removeClass('highlightDislike');
  $('.highlightLike').removeClass('highlightLike');
});

$(document).on('mouseout','.ingredientDropped' ,function(event){
  $('.highlightDislike').removeClass('highlightDislike');
  $('.highlightLike').removeClass('highlightLike');
  $('.highlight').removeClass('highlight');
});



//*** Person Mouseover ***/
$(document).on('mouseover','.avatar', handleMouseOverEater);

$(document).on('mouseout','.avatar' ,function(event){
  $('.highlightDislike').removeClass('highlightDislike');
  $('.highlightLike').removeClass('highlightLike');
});

/*** Recipe Mouseover ***/

$(document).on('mouseover','.recipe', handleMouseOverRecipe);
$(document).on('mouseout','.recipe', function(event){
    $('.highlight').removeClass('highlight');

});




$(document).on('change','input[type="checkbox"]:checked',function(event){
  console.log('checked filename',$(this).attr('data-filename'));

  console.log(recipeFiles[$(this).attr('data-filename')]);
  //  console.log(recipeFiles);


  $.each(recipeFiles[$(this).attr('data-filename')], function(index,val){
      loadedRecipes[val].active = true;
    //activeRecipes[val] = true;
  });

  refreshRecipes();
})

$(document).on('change','input[type="checkbox"]:not(:checked)',function(event){
  console.log('checkbox unchecked');
  $.each(recipeFiles[$(this).attr('data-filename')], function(index,val){
    loadedRecipes[val].active = false;
    //activeRecipes[val] = false;
  });

  refreshRecipes();
})

$(document).on('click','.recipe', showRecipeEmotions);

$(document).on('click','#delete', function(event){
  event.preventDefault();
  console.log('delete: ',$(this).attr('data-eaterId'));
  delete persons[$(this).attr('data-eaterId')];

});






$( document ).ready(function() {

$( "#save" ).button();
$( "#save" ).button({
  icon: "ui-icon-disk"
});
$( "#delete" ).button();
$( "#delete" ).button({
icon:  "ui-icon-close"
});



/********************** Get Initial Data from Server **************************/

  getIngredients();
  getEaters();



}); //DOM Ready
