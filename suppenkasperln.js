
var handleDropped = function(e){
    console.log('something was dropped');
  var files = e.originalEvent.dataTransfer.files;
  var sendData = new FormData();
  $.each(files, function(i,file){
    console.log( file );
    sendData.append('file', file);

  });


//upload rezeptdatei
$.ajax({
    url: 'http://www.bettinamoser.at/suppenkasperln/interface.php',
    type: 'POST',
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



$( document ).ready(function() {
    console.log('hier bin ich, teste ajax');
    $('#dropRecipes').on('drag dragstart dragend dragenter dragover dragleave drop', function(e){
      e.preventDefault();
      e.stopPropagation();
    });

    $('#dropRecipes').on('drop', handleDropped);


    $( function() {
  $( "#eater1" ).draggable({ snap: true });
  $( "#eater2" ).draggable({ snap: ".ui-widget-header" });
  $( "#eater3" ).draggable({ snap: ".ui-widget-header", snapMode: "outer" });
  $( "#eater4" ).draggable({ grid: [ 20, 20 ] });
  $( "#eater5" ).draggable({ grid: [ 80, 80 ] });
} );


});
