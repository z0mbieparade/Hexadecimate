var ws = new Websafe();
var settings = new Settings({
  masonry: {
    label: 'Masonry',
    type: 'bool',
    default: true,
  },
  cols: {
    label: 'Columns',
    type: 'int',
    default: 5,
    max: 15,
    min: 0
  },
  labels: {
    label: 'Labels',
    type: 'enum',
    values: [
      {val: 'names', txt: 'Browser Colors (black)'},
      {val: 'hex', txt: 'Hex Codes (#000000)'},
      {val: 'short_hex', txt: 'Short Hex Codes (#000)'},
      {val: 'sherwin_ai', txt: 'AI Generated Names (Dorkwood)'}
    ],
    default: 'names',
    on_change: function(val)
    {
      if(val === 'hex' || val === 'short_hex')
      {
        settings.disable('muck');
      }
      else
      {
        settings.enable('muck');
      }
    }
  },
  muck: {
    label: 'Muck',
    type: 'int',
    default: 1,
    min: 0,
    max: 10
  },
  font_size: {
    label: 'Font Size',
    type: 'int',
    default: 15,
    min: 5,
    max: 50
  },
  letter_spacing: {
    label: 'Letter Spacing',
    type: 'bool',
    default: true,
  },
  padding: {
    label: 'Padding',
    type: 'int',
    default: 4,
    min: 0,
    max: 20
  },
  margin: {
    label: 'Margin',
    type: 'int',
    default: 3,
    min: 0,
    max: 20
  },
  border_style: {
    label: 'Border',
    type: 'enum',
    values: [
      {val: 'none', txt: 'None'},
      {val: 'solid', txt: 'Solid'},
      {val: 'dotted', txt: 'Dotted'},
      {val: 'dashed', txt: 'Dashed'}
    ],
    default: 'dashed',
    on_change: function(val)
    {
      if(val === 'none')
      {
        settings.disable('border_width');
      }
      else
      {
        settings.enable('border_width');
      }
    }
  },
  border_width: {
    label: 'Border Width',
    type: 'int',
    default: 1,
    min: 0,
    max: 10
  },
  shadow: {
    label: 'Shadow',
    type: 'bool',
    default: false,
    on_change: function(val)
    {
      if(val)
      {
        settings.enable('shadow_blur');
        settings.enable('shadow_x');
        settings.enable('shadow_y');
      }
      else
      {
        settings.disable('shadow_blur');
        settings.disable('shadow_x');
        settings.disable('shadow_y');
      }
    }
  },
  shadow_blur: {
    label: 'Shadow Blur',
    type: 'int',
    default: 5,
    min: 0,
    max: 30
  },
  shadow_x: {
    label: 'Shadow X',
    type: 'int',
    default: 5,
    min: -40,
    max: 40
  },
  shadow_y: {
    label: 'Shadow Y',
    type: 'int',
    default: 0,
    min: -40,
    max: 40
  },
  sort_by: {
    label: 'Sort By',
    type: 'enum',
    values: [
      {val: 'hue', txt: 'Hue'},
      {val: 'saturation', txt: 'Saturation'},
      {val: 'value', txt: 'Value'},
      {val: 'red', txt: 'Red'},
      {val: 'green', txt: 'Green'},
      {val: 'blue', txt: 'Blue'},
      {val: 'luminance', txt: 'Luminance'},
      {val: 'alphanumeric', txt: 'Alphanumeric'}
    ],
    default: 'hue'
  },
  asc_desc: {
    type: 'bool',
    ui_type: 'switch',
    ui_subtype: 'inside_label',
    default: false
  },
  multiplier: {
    label: 'Size Multiplier',
    type: 'int',
    default: 10,
    min: 0,
    max: 10,
    skip_random: true
  }
}, {
  app_name: 'Hexadecimate',
  local_storage: true
});

let set = {};

$(document).ready(function()
{
  settings.build_settings($('#settings #inputs'), set);

  $('#preview').on('click', function(){
    $('#preview_canvas').empty();
    $('#sizer').removeClass('hide_sizer');
    let s = settings.get_settings({multiplier: 1});
    console.log(s);
    ws.set_options(s, function(canvas){
      $('#preview_canvas').empty().append(canvas);
      $('#sizer').addClass('hide_sizer');
    });
  })

  $('#random').on('click', function(){
    $('#preview_canvas').empty();
    $('#sizer').removeClass('hide_sizer');
    let s = settings.rand_settings({multiplier: 1});
    console.log(JSON.stringify(s));
    ws.set_options(s, function(canvas){
      $('#preview_canvas').empty().append(canvas);
      $('#sizer').addClass('hide_sizer');
    });
  })

  $('#download').on('click', function(){
    ws.generate_image(function(canvas){
      ws.download("websafe.png", canvas.toDataURL("image/png"));
    }, {multiplier: settings.settings.multiplier.value});
  })

  $('#reset').on('click', function(){
    $('#preview_canvas').empty();
    $('#sizer').removeClass('hide_sizer');
    settings.reset_to_default();
    let s = settings.get_settings({multiplier: 1});
    ws.set_options(s, function(canvas){
      $('#preview_canvas').empty().append(canvas);
      $('#sizer').addClass('hide_sizer');
    });
  })

  setTimeout(function()
  {
    $('#preview').click();
  }, 100);
});
