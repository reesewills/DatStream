<?php
/**
 * Created by PhpStorm.
 * User: ReeseWills
 * Date: 10/22/17
 * Time: 17:39
 */
session_unset();
session_destroy();
require 'database_signin.php';

// This is a good example of how you can implement password-based user authentication in your web application.
if(isset($_POST['username']) and isset($_POST['password'])) {
    $incoming_password = (string)$_POST['password'];
    $thisUser = $_POST['username'];
    $stmt = $mysqli->prepare("SELECT * FROM users WHERE username='$thisUser'");
    $stmt->execute();
    $stmt->bind_result($user_id, $username, $pwd_hash);
    $stmt->fetch();

    echo $pwd_hash;
    if (password_verify($incoming_password, $pwd_hash)) {
        $_SESSION['username'] = $user_id;
    } else {
        header("Location: front_page.html");
        exit;
    }
    header("Location: front_page.html");
    exit;
}
?>