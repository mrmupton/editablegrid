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
      
require_once('datasource/config.php');         

// Database connection                                   
$mysqli = mysqli_init();
$mysqli->options(MYSQLI_OPT_CONNECT_TIMEOUT, 5);
$mysqli->real_connect($config['db_host'],$config['db_user'],$config['db_password'],$config['db_name']); 
                      
// Get all parameters provided by the javascript
$tableval = $mysqli->real_escape_string(strip_tags($_POST['tablename']));
$cols = $mysqli->real_escape_string(strip_tags($_POST['columnlist']));
$vals = $mysqli->real_escape_string(strip_tags($_POST['valuelist']));
                                                
// Here, this is a little tips to manage date format before update the table
if ($coltype == 'date') {
   if ($value === "") 
  	 $value = NULL;
   else {
      $date_info = date_parse_from_format('d/m/Y', $value);
      $value = "{$date_info['year']}-{$date_info['month']}-{$date_info['day']}";
   }
}                      

// This very generic. So this script can be used to update several tables.
$return=false;
if ( $stmt = $mysqli->prepare("INSERT INTO ".$tableval." (".implode($cols,",").") VALUES (".implode($vals,",").")")) {
	$return = $stmt->execute();
	$stmt->close();
	$stm = $mysqli->prepare("SELECT MAX(id) AS ID FROM ".$tableval);
	$stm->execute();
	$mxid = $stm->fetch_object->ID;
	$stm->close();
}    
$mysqli->close();        

echo $return ? $mxid : "error";