<?php
 
/*
 * examples/mysql/loaddata.php
 * 
 * This file is part of EditableGrid.
 * http://editablegrid.net
 *
 * Copyright (c) 2011 Webismymind SPRL
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://editablegrid.net/license
 */
      
require_once('config.php');         

// Database connection                                   
$mysqli = mysqli_init();
$mysqli->options(MYSQLI_OPT_CONNECT_TIMEOUT, 5);
$mysqli->real_connect($config['db_host'],$config['db_user'],$config['db_password'],$config['db_name']); 
         
// Get all parameters provided by the javascript
$tableval = $mysqli->real_escape_string(strip_tags($_POST['tablename']));
$cols = $_POST['columnlist'];
$vals = $_POST['valuelist'];

$query = "INSERT INTO ".$tableval." (".implode($cols,",").") VALUES (".implode($vals,",").")";
                     
// This very generic. So this script can be used to update several tables.
$return=false;
if ( $stmt = $mysqli->prepare($query) ) {
	$return = $stmt->execute();
	$stmt->close();
	if($stm = $mysqli->query("SELECT MAX(id) AS ID FROM ".$tableval)){
		while($row = mysqli_fetch_assoc($stm)){ 
			$mxid = $row["ID"];
		}
	}	
	$stm->close();
}    
$mysqli->close();        

echo $return ? $mxid : "error";
