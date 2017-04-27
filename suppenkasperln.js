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
var categories = [];
var ingredients = [];

var persons = [];

var activeRecipes = [];

/********************** Konstruktor Klassen **********************/

var Person = function(options){
  this.name = 'testperson';
  this.img = 'eater_boy1.svg';
  this.likes = [];
  this.dislikes = [];
  this.allergens = [];

  this.selected = false;

};

Person.prototype.save = function(){

};

Person.prototype.delete = function(){

};

Person.prototype.showPreferences = function(){

};

Person.prototype.showEmotions = function(){

};

var Recipe = function(options){
      this.name = '';
      this.filename = '';
      this.ingredients = [{ingredient:'testkarotte',amount:'2'},{ingredient:'testkiwi',amount:'3'}];
      this.descriptionShort = '';
      this.description = '';
      this.portions = 4;
      this.level = 2;
      this.duration = '30 min';
      this.foto = 'no-img.jpg';

  };

  var testrezept = new Recipe('asdf');



Recipe.prototype.display = function(){

}

Recipe.prototype.searchIngredient = function(ingredient){

  for(var key in this.ingredients)
  {
    if(this.ingredients[key].ingredient == ingredient ) console.log('found ingredient: ',this.ingredients[key].ingredient);
  }
}

testrezept.searchIngredient('testkarotte');


Recipe.prototype.searchIngredients = function(ingredients){

}

Recipe.prototype.searchAllergens = function(allergenCodes){

}




/*********************** Functions ******************************/

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
      'ui-accordion':'',
      'ui-accordion-header':'',
      'ui-accordion-content':''
    },
    heightStyle: 'fill',
    icons: {
          header: "ui-icon-circle-arrow-e",
          activeHeader: "ui-icon-circle-arrow-s"
          }
  });

}


var initializeEaters = function(responseData){
  //console.log(responseData);

  var eaters=JSON.parse(responseData);
  eaters.forEach(function(val,index){
    //console.log('index',index);
    //console.log('val',val);
    $('<img>')
//          .addClass('eater')
      .addClass('avatar')
      .attr('src', eatersPath+val.eater_avatar)
      .attr('title', val.eater_name)
      .attr('name', val.eater_name)
      .attr('data-id', val.eater_id)
      .appendTo('#eaterOrigin');




  });

  $('.avatar').tooltip();

//  $('.avatar').tooltip('open');

  /*** Drag&Drop Persons ***/

  $('.avatar').draggable({
    classes: {
      "ui-draggable-dragging": "avatarDraggable"
    },
//   snap: ".chair",
  //  snapTolerance: 50,
    helper: 'clone',
   zIndex: 11,
    revert: 'invalid'
  }); //ingredient draggable

  /*

    $( ".originAvatar" ).draggable({
      snap: "ui.widget-header",
      snapTolerance: 50,
      revert: "invalid",
      start: function(event, ui){
         ui.helper.removeClass('originAvatar').addClass('sittingAvatar');
      }
    }); //originAvatar draggable

    $( ".tinyAvatar" ).draggable({
      snap: "ui.widget-header",
      zIndex: 10,
      snapTolerance: 50,
      revert: "invalid",
      start: function(event, ui){

      }
    }); //tinyAvatar draggable

    $( ".sittingAvatar" ).draggable({
      snap: "ui.widget-header",
      snapTolerance: 200,
      revert: "invalid"
    }); //sittingAvatar draggable

    */


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
         //ui.draggable.removeClass('sittingAvatar').addClass('tinyAvatar');


      },
      drop: function( event, ui ) {

          $(this).append(ui.draggable.detach());
          ui.draggable.show();

      },
      out: function(event, ui ){
        //ui.draggable.removeClass('tinyAvatar').addClass('sittingAvatar');

      }
    }); //droppable origin
}

var initializeRecipes = function(responseData){

  var filenames = JSON.parse(responseData);

//  console.log(filenames);

  filenames.forEach( function(val) {
    //console.log(val);
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
      .appendTo(label);

    //  $( 'input[type="checkbox"]' ).checkboxradio();


}

var loadRecipes = function(){
  var n = $('input[type=checkbox]:checked').length;
  console.log('checked Boxes: ',n);

  $('input[type=checkbox]:checked').each(function(index,val){
    console.log(val);
    file = $(val).attr('data-filename');
    $.getJSON(file, function(data){
      //console.log(data);
      for(var i=0; i < data.recipes.length; i++)
      {
        console.log(data.recipes[i]);
        var recipe = data.recipes[i];
      }

    });



  })
}




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

var getRecipes = function(){
  $.ajax({
    data: {type:"files"},
    success: initializeRecipes,
    error: function(error){
      console.log('get_recipes anfrage fehlgeschlagen: ',error);
    }

    });

}






/************************* Event Handler *****************************/

//function for uploading recipes-data
var handleDroppedRecipes = function(e){
        console.log('something was dropped');
        var files = e.originalEvent.dataTransfer.files;
        var sendData = new FormData();
        $.each(files, function(i,file){
          console.log( file );
          sendData.append('file', file);

        });


      //upload rezeptdatei
      $.ajax({
          dataType: 'script',
          cache: false,
          contentType: false,
          processData: false,
          data: sendData,
          success: function(responseData){
            console.log('data from server',responseData);

          },
          error: function(error){
            console.log('ajax anfrage fehlgeschlagen', error);

          },
          complete: function(){
          //  console.log('ajax anfrage gemacht');
          }


        });

};


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
$(document).on('click','.avatar',function(){
  console.log('avatar geklickt');
  $('.active').removeClass('active');
  $('#ingredients').removeClass('active');
  $('#eaters').addClass('active');

  $('#detailAvatar').remove();

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

});

//remove ingredient from dropzone and position it in right categorie
$(document).on('dblclick','.ingredientDropped',function(){
  console.log('remove ingredient from dropzone');

  $('div[data-cat="'+$(this).attr('data-cat')+'"]','#ingredientAccordion').append($(this).detach().removeClass('ingredientDropped').addClass('ingredient'));
});

/*
$(document).on('dblclick','.avatarDropped',function(){
  console.log('remove avatar from chair');

  $('#eaterOrigin').append($(this).detach().removeClass('sittingAvatar').addClass('avatar'));
});
*/

//*** Ingredient tooltip ***/
$(document).on('mouseover','.ingredient',function(event){
/*  $('span[data-img-id="'+$(this).attr('data-id')+'"]')
  .css({left:event.pageX, top:event.pageY})
  .show();*/
});

$(document).on('mouseout','.ingredient',function(event){
  /*
$('span[data-img-id="'+$(this).attr('data-id')+'"]').hide();
*/
});

$(document).on('change','input[type="checkbox"]',function(event){
  loadRecipes();
})




$( document ).ready(function() {
/*
  $( "#save" ).button({
  icon: { icon: "ui-icon-disk" }
});

$( "#delete" ).button({
icon: { icon: "ui-icon-close" }
});
*/


/********************** Get Initial Data from Server **************************/

  getIngredients();
  getEaters();
  getRecipes();








}); //DOM Ready
