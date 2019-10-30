<?php
/**
 * Created by PhpStorm.
 * User: ReeseWills
 * Date: 10/22/17
 * Time: 18:31
 */
session_unset();
session_destroy();
require 'database_signin.php';

$username = (string) $_POST['username'];
$password = (string) $_POST['password'];
$hash_pass = password_hash($password, PASSWORD_DEFAULT);
$stmt = $mysqli->prepare("INSERT INTO users (username, password) values ('$username', '$hash_pass')");

if(!stmt){
    printf("Query Prep Failed: %\n", $mysqli->error);
    exit;
}
$stmt->bind_param('ss', $username, $hash_pass);
$stmt->execute();
$stmt->close();
header("Location: front_page.html");

exit;

?>