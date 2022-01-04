var ws = new Websafe();
var default_settings = {
  cols: 0,
  labels: 'names',
  muck: 1,
  font_size: 15,
  letter_spacing: true,
  masonry: true,
  padding: 4,
  margin: 0,
  border_style: 'solid',
  border_width: 3,
  shadow: true,
  shadow_blur: 5,
  shadow_x: 0,
  shadow_y: 5,
  sort_by: 'hue',
  asc_desc: false,
  multiplier: 10
}

var get_options = function(override)
{
  return {...{
    cols: +$('#cols').val(),
    labels: $('#labels').val(),
    muck: +$('#muck').val(),
    font_size: +$('#font_size').val(),
    letter_spacing: $('#letter_spacing').prop('checked') ? true : false,
    padding: +$('#padding').val(),
    margin: +$('#margin').val(),
    border_style: $('#border_style').val(),
    border_width: +$('#border_width').val(),
    shadow: $('#shadow').prop('checked') ? true : false,
    shadow_blur: +$('#shadow_blur').val(),
    shadow_x: +$('#shadow_x').val(),
    shadow_y: +$('#shadow_y').val(),
    masonry: $('#masonry').prop('checked') ? true : false,
    sort_by: $('#sort_by').val(),
    asc_desc: $('#asc_desc').prop('checked') ? true : false,
    multiplier: +$('#multiplier').val(),
    //max_colors: 10 //to limit colors for testing
  }, ...override};
}

var rand_options = function(override)
{
  let new_settings = {
    cols: Math.round(Math.random() * 6),
    labels: ['names', 'hex', 'short_hex', 'sherwin_ai'][Math.round(Math.random() * 3)],
    muck: Math.round(Math.random() * 5),
    font_size: Math.round((Math.random() * 35) + 12),
    letter_spacing: Math.round(Math.random() * 1) ? true : false,
    padding: Math.round((Math.random() * 10) + 4),
    margin: Math.round(Math.random() * 10),
    border_style: ['none', 'solid', 'dotted', 'dashed'][Math.round(Math.random() * 3)],
    border_width: Math.round(Math.random() * 5),
    shadow: Math.round(Math.random() * 1) ? true : false,
    shadow_blur: Math.round(Math.random() * 15),
    shadow_x: Math.round(Math.random() * 15),
    shadow_y: Math.round(Math.random() * 15),
    masonry: Math.round(Math.random() * 1) ? true : false,
    sort_by: ['hue','saturation','value','red','green','blue','luminance','alphanumeric'][Math.round(Math.random() * 7)],
    asc_desc: Math.round(Math.random() * 1) ? true : false
  };

  for(let key in new_settings)
  {
    if($('#' + key).attr('type') === 'checkbox')
    {
      $('#' + key).prop('checked', new_settings[key] ? true : false);
    }
    else
    {
      $('#' + key).val(new_settings[key]);
    }
  }

  console.log('Randomize', JSON.stringify(new_settings));

  return {...new_settings, ...override};
}

$(document).ready(function()
{
  for(let key in default_settings){
    if($('#' + key).attr('type') === 'checkbox')
    {
      $('#' + key).prop('checked', default_settings[key] ? true : false);
    }
    else
    {
      $('#' + key).val(default_settings[key]);
    }
  }

  $('#preview').on('click', function(){
    $('#preview_canvas').empty();
    $('#sizer').removeClass('hide_sizer');
    ws.set_options(get_options({multiplier: 1}), function(canvas){
      $('#preview_canvas').empty().append(canvas);
      $('#sizer').addClass('hide_sizer');
    });
  })

  $('#random').on('click', function(){
    $('#preview_canvas').empty();
    $('#sizer').removeClass('hide_sizer');
    ws.set_options(rand_options({multiplier: 1}), function(canvas){
      $('#preview_canvas').empty().append(canvas);
      $('#sizer').addClass('hide_sizer');
    });
  })

  $('#download').on('click', function(){
    ws.generate_image(function(canvas){
      ws.download("websafe.png", canvas.toDataURL("image/png"));
    }, {multiplier: +$('#multiplier').val()});
  })

  setTimeout(function()
  {
    $('#random').click();
  }, 100);
});
