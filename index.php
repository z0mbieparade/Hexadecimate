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

  <link rel="stylesheet" href="css/style.css">
</head>
<body>
<script>
	<?php if(!$setup){ ?>
		console.log('You have not created your settings.php file, please copy settings_default.php to settings.php and update it with correct settings.');
	<?php }?>
</script>
<div id="title" class="fg14">Hexadecimate - generate various browser safe/hex color combos. <a href="z0m.bi" class="fg03" target="_blank">z0m.bi</a></div>
<div id="settings">
  <label for="masonry">Masonry: <input id="masonry" type="checkbox"/></label>
  <label for="cols">Columns: <input id="cols" type="number" min="0" style="width:3rem"/></label>
  <label for="labels">Labels: <select id="labels">
    <option value="names">Browser Colors (black)</option>
    <option value="hex">Hex Codes (#000000)</option>
    <option value="short_hex">Short Hex Codes (#000)</option>
    <option value="sherwin_ai">AI Generated Names (Dorkwood)</options>
  </select></label>
  <label for="muck">Muck: <input id="muck" type="number" min="0" max="10" style="width:3rem" /></label>
  <label for="font_size">Font Size: <input id="font_size" type="number" min="10" style="width:3rem" /></label>
  <label for="letter_spacing">Letter Spacing Fill: <input id="letter_spacing" type="checkbox"/></label>
  <label for="padding">Padding: <input id="padding" type="number" min="0" style="width:3rem" /></label>
  <label for="margin">Margin: <input id="margin" type="number" min="0" style="width:3rem" /></label>
  <label for="border_style">Border: <select id="border_style">
    <option value="none">None</option>
    <option value="dotted">Dotted</option>
    <option value="dashed">Dashed</option>
    <option value="solid">Solid</option>
  </select></label>
  <label for="border_width">Border Width: <input id="border_width" type="number"min="0" style="width:3rem" /></label>

  <label for="shadow">Shadow: <input id="shadow" type="checkbox"/></label>
  <label for="shadow_blur">Shadow Blur: <input id="shadow_blur" type="number" min="0" style="width:3rem" /></label>
  <label for="shadow_x">Shadow X: <input id="shadow_x" type="number" style="width:3rem" /></label>
  <label for="shadow_y">Shadow Y: <input id="shadow_y" type="number" style="width:3rem" /></label>

  <label for="sort_by">Sort By: <select id="sort_by">
    <option value="hue">Hue</option>
    <option value="saturation">Saturation</option>
    <option value="value">Value</option>
    <option value="red">Red</option>
    <option value="green">Green</option>
    <option value="blue">Blue</option>
    <option value="luminance">Luminance</option>
    <option value="alphanumeric">Alphanumeric</option>
  </select></label>
  <label id="asc_desc_switch" class="switch inside_label">
    <input type="checkbox" id="asc_desc">
    <span class="slider"></span>
  </label>
  <label for="multiplier">Size Multiplier: <input id="multiplier" min="1" max="20" type="number" style="width:3rem" /></label>
  <button id="preview">Preview</button>
  <button id="download">Download</button>
  <button id="random">Randomize</button>
</div>
<div id="preview_canvas"></div>
<div id="sizer"></div>
<script src="https://cdn.jsdelivr.net/npm/canvas-size@1"></script>
<script src="js/jquery-3.3.1.min.js"></script>
<script src="js/class.websafe.js"></script>
<script src="js/script.js"></script>
<?php if(isset($settings['include_footer']) && $settings['include_footer'] !== ''){
  include($settings['include_footer']);
} ?>
</body>
</html>
