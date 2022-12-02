<?php
require('settings_default.php');
$set = $settings;
$setup = false;
if(file_exists('settings.php')){
	include('settings.php');
	foreach($settings as $key => $val){
		$set[$key] = $val;
	}
	$setup = true;
}
if(file_exists('../all_settings.php')){
	include('../all_settings.php');
	if(isset($all_settings['Hexadecimate'])){
		foreach($all_settings['Hexadecimate'] as $key => $val){
			$set[$key] = $val;
		}
		$setup = true;
	}
}
$settings = $set;
?>
<!DOCTYPE html>
<html lang="en">
  <title><?php echo $settings['title']; ?></title>
  <meta property="og:title" content="<?php echo $settings['title']; ?>">
  <meta property="og:description" content="Generate various browser safe/hex color combos.">
  <meta property="og:image" content="<?php echo $settings['Hexadecimate_site_path']; ?>/css/card_img.png">
  <meta property="og:url" content="<?php echo $settings['Hexadecimate_site_path']; ?>">
  <meta property="og:type" content="website">

  <meta name="twitter:title" content="<?php echo $settings['title']; ?>">
  <meta name="twitter:description" content="Generate various browser safe/hex color combos.">
  <meta name="twitter:image" content="<?php echo $settings['Hexadecimate_site_path']; ?>css/card_img.png">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:creator" content="@rotterz">

	<link rel="apple-touch-icon" sizes="180x180" href="css/favicon_io/apple-touch-icon.png">
	<link rel="icon" type="image/png" sizes="32x32" href="css/favicon_io/favicon-32x32.png">
	<link rel="icon" type="image/png" sizes="16x16" href="css/favicon_io/favicon-16x16.png">
	<link rel="manifest" href="css/favicon_io/site.webmanifest">

  <link rel="stylesheet" href="css/style.css">
</head>
<body>
<script>
	<?php if(!$setup){ ?>
		console.log('You have not created your settings.php file, please copy settings_default.php to settings.php and update it with correct settings.');
	<?php }?>
</script>
<div id="title" class="fg14">Hexadecimate - generate various browser safe/hex color combos. <a href="https://z0m.bi" class="fg03" target="_blank">z0m.bi</a></div>
<div id="settings">
	<div id="inputs"></div>
	<button id="preview">Preview</button>
  <button id="download">Download</button>
  <button id="random">Randomize</button>
  <button id="reset">Reset</button>
</div>
<div id="preview_canvas"></div>
<div id="sizer"></div>
<script src="js/jquery-3.3.1.min.js"></script>
<script src="js/ua-parser.min.js"></script>
<script src="js/class.settings.js"></script>
<script src="js/class.websafe.js"></script>
<script src="js/script.js"></script>
<?php if(isset($settings['include_footer']) && $settings['include_footer'] !== ''){
  include($settings['include_footer']);
} ?>
</body>
</html>
