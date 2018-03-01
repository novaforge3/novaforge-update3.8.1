<?php
$userLocale = $_GET["locale"];
$welcomePage = "welcome";
$welcomePageLocale = $welcomePage."_".$userLocale.".html";

if(!file_exists($welcomePageLocale))
{
	$welcomePageLocale = $welcomePage.".html";
}
?>
<?xml version="1.0" encoding="utf-8" standalone="no"?>

<!DOCTYPE html
  PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:exsl="http://exslt.org/common" xmlns:ng="http://docbook.org/docbook-ng">
   <head>
      <meta http-equiv="Refresh" content="0; URL=<?php echo $welcomePageLocale; ?>"/>
      <title>NovaForge 3 Welcome Page</title>
   </head>
   <body>
                        If not automatically redirected, <a href="<?php echo $welcomePageLocale; ?>">click here</a>.
   </body>
</html>
