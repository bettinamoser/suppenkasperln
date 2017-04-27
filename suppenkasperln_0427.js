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

/*************** Get Data From DB Functions ****************************/

var getIngredients = function(){
  $.ajax({
    data: {type:"get_ingredients"},
    success: function(responseData){
      //console.log('data from server',responseData);
      var ingredients = JSON.parse(responseData);

			if(ingredients.error){ console.log(ingredients.error); return; }

			ingredients.forEach(function(val){
        //console.log('length', $('#'+val.ingredient_cat).length);
        if( ! $('div[data-cat="'+val.ingredient_cat+'"]').length){
        //  console.log('div erstellnen...')
          //h3 erstellen
          $('<h3>')
            .attr('data-cat',val.ingredient_cat)
            .html(categorieNames[val.ingredient_cat])
            .appendTo('#ingredientAccordion');
          //div erstellen
          $('<div>')
            .attr('data-cat',val.ingredient_cat)
            .appendTo('#ingredientAccordion');
        }

        var imgName = $('<span>')
                      .attr('data-img-id', val.ingredient_id)
                      .addClass('ingredientName')
                      .html(val.ingredient_name)
                      .hide();

        var img = $('<img>')
                    .attr('src', ingredientsPath+val.ingredient_cat+'/'+val.ingredient_img)
                    .attr('title', val.ingredient_name)
                    .attr('data-id', val.ingredient_id)
                    .addClass('ingredient');

        $('div[data-cat="'+val.ingredient_cat+'"]','#ingredientAccordion').append(img).append(imgName);

          $('.ingredient').tooltip();

        /*** Drag&Drop Ingredients ***/
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


        $('#dropIngredients').droppable({
          accept: '.ingredient',
          over: function(event, ui){
            //$(this).css({backgroundColor: 'magenta'});

          },
          drop: function(event, ui){
            console.log('something was dropped');

           $(this).append(ui.draggable.detach().removeClass('ingredient').addClass('ingredientDropped'));
          // ui.draggable.helper.addClass('ingredientDropped');

          },
          out: function(event, ui){

          }

        }); //ingredient droppable


			});

      /*** Accordion for Categories of Ingredients ***/

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

    },
    error: function(error){
      console.log('ajax anfrage fehlgeschlagen');
    }
  });
}

var getEaters = function(){
  $.ajax({
    data: {type:"get_eaters"},
    success: function(responseData){
      console.log(responseData);

      var eaters=JSON.parse(responseData);
      eaters.forEach(function(val,index){
        console.log('index',index);
        console.log('val',val);
        $('<img>')
//          .addClass('eater')
          .addClass('avatar')
          .attr('src', eatersPath+val.eater_avatar)
          .attr('title', val.eater_name)
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
            console.log('ajax anfrage gemacht');
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
  $('#eatersAll').removeClass('active');
  $('#eaters').addClass('active');

  $('#detailAvatar').remove();

  $('<object>')
    .attr('data',$(this).attr('src'))
    .attr('id', 'detailAvatar')
    .appendTo('#eaterOptions');


    $('<input>')
      .attr('type','text')
      .attr('id','eaterName')
      .val($(this).attr('title'))
      .appendTo('#eaterOptions');

});


//*** Ingredient Click ***/
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




$( document ).ready(function() {

/********************** Get Initial Data from Server **************************/

  getIngredients();
  getEaters();
  getRecipes();








}); //DOM Ready
