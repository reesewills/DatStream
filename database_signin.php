<?php
/**
 * Created by PhpStorm.
 * User: ReeseWills
 * Date: 10/22/17
 * Time: 17:45
 *
 **/
$mysqli = new mysqli('localhost', 'g9', 'z63yQHFd7dnErnwG', 'g9');

//connection failed for some reason
if($mysqli->connect_errno) {
printf("Connection Failed: %s\n", $mysqli->connect_error);
exit;
}
?>