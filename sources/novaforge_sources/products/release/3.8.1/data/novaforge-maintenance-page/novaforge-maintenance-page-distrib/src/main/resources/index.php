<?php
$locale = $_GET['locale'];
if (!isset($locale)) {
	$locale = explode(',',$_SERVER['HTTP_ACCEPT_LANGUAGE']);
	$locale = strtolower(substr(chop($locale[0]),0,2));
}
if($locale == "fr")
{
	include("maintenance_fr.php");
}
else
{
	include("maintenance_en.php");
}
?>

