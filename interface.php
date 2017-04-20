<?php
error_reporting(E_ALL);


//datenbankverbindung herstellen
function db_connect(){

  try{
    $pdo = new PDO('mysql:host=mysqlsvr47.world4you.com;dbname=4487546db1', 'sql4487546', 'epd4+pm');
  }catch(Exception $exception ) { return false; }

  return $pdo;

}

//datenbankabfrage machen, return ist JSON
function get_from_db($stmt){

  if(!isset($stmt)) return '{"error" : "kein statement übergeben"}';
  $pdo = db_connect();
   if($pdo){

  $statement = $pdo->query($stmt);
  if(! $statement) return false;

  $all = $statement->fetchAll(PDO::FETCH_CLASS);


 return json_encode($all);

 } else return '{"error" : "Verbindung zu DB konnte nicht aufgebaut werden!!!"}';

}

function insert_update($stmt){

  if(!isset($stmt)) return '{"error" : "kein statement übergeben"}';

   $db = db_connect();
    if($db){

      try {
        $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        try {
            $db->beginTransaction();
            $db->exec($stmt);
            $return_id = $db->lastInsertId();
            $db->commit();

        } catch(PDOExecption $e) {
            $dbh->rollback();
            return '{error: "' . $e->getMessage() . '"}';
        }


      } catch (Exception $e) {
        $db->rollBack();
        return '{ "error" : "' . $e->getMessage(). '"}';
      }

      if($return_id==0) return '{"done" : "true"}';
      return ('{"id" : "'.$return_id.'"}');


    } else return '{"error" : "Verbindung zu DB konnte nicht aufgebaut werden!!!"}';


}



if( isset($_POST["type"])){
  switch($_POST["type"]){
    case "get_eaters":
    /*
    Personen - Abfrage aller Personen
    *********************************

    REQUEST: POST
    {
    	type: "get_eaters"
    }

    RESPONSE: JSON(STR)
    {
    	username: STR,
    	eaters:[
    		OBJ{
    		id: INT,
    		name: STR,
    		avatar: INT
    		},
    		....
    		]
    }
*/

        echo get_from_db("SELECT * FROM eaters WHERE deleted = FALSE" );

      break;
    case "get_eaterpreferences":
    /* Person - Likes/Dislikes/Allergien Abfrage
    *****************************************

    REQUEST: POST
    {
    	type: "get_eaterpreferences"
    	id: INT
    }

    RESPONSE: JSON(STR)
    {

    	likes: [ingredient_id(INT), ingredient_id(INT), ingredient_id(INT),...],
    	dislikes: [ingredient_id(INT), ingredient_id(INT), ingredient_id(INT),...],
    	allergens: [allergen_code(CHAR), allergen_code(CHAR),...]


    }
*/
      break;
    case "set_eater":
/*
    Person - neu anlegen/update
    ***************************

    REQUEST: POST as JSON(STR)
    {
    	type: "set_eater"
    	do: "new" or "update"
    	username: STR,
    	eater: OBJ{
    		name: STR,
    		avatar: INT
    		}
    }

    RESPONSE: JSON(STR)
    {
    	error: STR,
    	id: INT
    }
    */

    $eater_name = $_POST["eater"]["name"];
    $eater_avatar = $_POST["eater"]["avatar"];

      if($_POST["do"]=="new"){
        $stmt = "INSERT INTO eaters (eater_name, eater_avatar, deleted) VALUES('".$eater_name."','".$eater_avatar."', FALSE)";
    }else if($_POST["do"]=="update"){
        $eater_id = $_POST["eater"]["id"];
        $stmt ="UPDATE eaters SET eater_name='".$eater_name."', eater_avatar='".$eater_avatar."' WHERE eater_id=".$eater_id;
    }

    echo insert_update($stmt);



      break;
    case "delete_eater":

    /*Person - l�schen
    ****************
    REQUEST: POST
    {
    	type: "delete_eater"
    	id: INT
    }

    RESPONSE: JSON(STR)
    {
    	done: BOOLEAN

    }
*/
      $eater_id = $_POST["id"];
      $stmt = "UPDATE eaters SET deleted = TRUE WHERE eater_id = ".$eater_id;
      echo insert_update($stmt);
      break;

    case "get_ingredients":
    /*
    Zutaten - Abfrage nach Kategorie
    ********************************

    REQUEST: POST
    {
      type: "get_ingredients",
      categorie: STR("vegetables", "fruits", "milk", "meat_fish", "cereals", "spices" )

    }

    RESPONSE: JSON(STR)
    {
      ingredients:[
        OBJ{
        id: INT,
        names: [STR,STR,STR,STR]
        pic: STR
        },
        ....
        ]
    }
          */
      $categorie = $_POST["categorie"];
      $stmt = "SELECT * FROM ingredients WHERE categorie = '".$categorie."'";
      echo get_from_db($stmt);
      break;
    case "check_allergens":

    /*Zutaten - Check Allergene
    ***************************
    REQUEST: POST
    {
    	type: "check_allergens"
    	allergen_code: CHAR
    }
    RESPONSE: JSON(STR)
    {
    	ingredients: [ingredient_id(INT), ingredient_id(INT),...]
    }

*/
    $allergen = $_POST["allergen_code"];
    $stmt = "SELECT ingredient_id FROM ingredient_allergens WHERE allergen_id = '".$allergen."'";
    echo get_from_db($stmt);
      break;
    case 'file':

      break;
    default:
      echo '{"error" : "type-parameter ist ungültig: '.$_POST["type"].'"}';

  }


}

/*
Rezeptdatei hochladen
*********************
GET: type: "uploadrecipes"

REQUEST: POST as JSON(STR)
{
	username: STR,
	dataname: STR,
	recipes: [
			OBJ{
			r_name: STR,
			r_description_short: STR,
			r_description: STR,
			r_portions: INT,
			r_level: INT(1-5),
			r_duration: TIME,
			r_foto: ?,
			r_ingredients: [STR,STR,STR,...]
			},
			...
		]
}

RESPONSE: JSON(STR)
{
	done: BOOLEAN,
	errors: STR

}
*/

$upload_success = null;
 $upload_error = '';

 var_dump($_FILES);

 if (!empty($_FILES['file'])) {

   $target_dir = "data/recipes/";
$target_file = $target_dir . basename($_FILES["file"]["name"]);
$uploadOk = 1;
$imageFileType = pathinfo($target_file,PATHINFO_EXTENSION);
// Check if image file is a actual image or fake image
if(isset($_POST["submit"])) {
    $check = getimagesize($_FILES["file"]["tmp_name"]);
    if($check !== false) {
        echo "File is an image - " . $check["mime"] . ".";
        $uploadOk = 1;
    } else {
        echo "File is not an image.";
        $uploadOk = 0;
    }

    if (move_uploaded_file($_FILES["file"]["tmp_name"], $target_file)) {
        echo "The file ". basename( $_FILES["file"]["name"]). " has been uploaded.";
    } else {
        echo "Sorry, there was an error uploading your file.";
    }
}
   /*
     the code for file upload;
     $upload_success – becomes "true" or "false" if upload was unsuccessful;
     $upload_error – an error message of if upload was unsuccessful;
   */
 }else echo "no files";


?>
