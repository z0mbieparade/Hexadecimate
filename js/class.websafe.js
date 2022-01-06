class Websafe
{
  constructor()
  {
    this.muck_char = {
      'A':'@',
      'I':'1',
      'Z':'2',
      'E':'3',
      'S':'$',
      'B':'8',
      'O':'0'
    };

    let max_canvas_sizes = {
      Desktop: {
        Chrome: {
          "73+": {
            width_height: 65535,
            area: 268435456
          },
          "72-": {
            width_height:32767,
            area: 268435456
          }
        },
        Edge:{
          "80+": {
            width_height: 65535,
            area: 268435456
          },
          "13": {
            width_height: 16384,
            area: 268435456
          }
        },
        Firefox: {
          width_height: 32767,
          area: 124992400
        },
        Safari: {
          width: 4194303,
          height: 8388607,
          area: 268435456
        },
        other: {
          width_height: 8192,
          area: 67108864
        }
      },
      iOS: {
        width: 4194303,
        height: 8388607,
        area: 16777216
      },
      Android: {
        68: {
          5: {
            width_height: 32767,
            area: 130005604
          },
          6: {
            width_height: 32767,
            area: 117418896
          },
          "7+": {
            width_height: 32767,
            area: 201299344
          }
        },
        91: {
          5: {
            width_height: 65535,
            area: 124992400
          },
          6: {
            width_height: 65535,
            area: 268435456
          },
          7: {
            width_height: 65535,
            area: 201299344
          },
          "8+": {
            width_height:65535,
            area:268435456
          }
        },
        other: {
          width_height: 8192,
          area: 67108864
        }
      },
      other: {
        width_height: 8192,
        area: 67108864
      }
    }

    var parser = new UAParser();
    let ua_res = parser.getResult();
    let is_mobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    let canvas_size, version, browser;
    let canvas_size_other = is_mobile ? max_canvas_sizes.other : max_canvas_sizes.Desktop.other;

    if(!is_mobile && max_canvas_sizes.Desktop[ua_res.browser.name])
    {
      canvas_size = max_canvas_sizes.Desktop[ua_res.browser.name];
      version = ua_res.browser.version ? ua_res.browser.version : ua_res.browser.major;
      browser = ua_res.browser.name;
    }
    else if(max_canvas_sizes[ua_res.os.name])
    {
      canvas_size = max_canvas_sizes[ua_res.os.name];
      version = ua_res.os.version ? ua_res.os.version : null;
      browser = ua_res.os.name;
      canvas_size_other = ua_res.os.name === 'Android' ? max_canvas_sizes.Android.other : canvas_size_other;
    }
    else if(!is_mobile)
    {
      canvas_size = max_canvas_sizes.Desktop.other;
    }
    else
    {
      canvas_size = max_canvas_sizes.other;
    }

    if(!canvas_size.width_height && !canvas_size.width && version)
    {
      let v_arr = version.split('.');

      if(browser === 'Chrome'){
        canvas_size = +v_arr[0] >= 73 ? canvas_size['73+'] : canvas_size['73-'];
      } else if(browser === 'Edge'){
        canvas_size = +v_arr[0] >= 80 ? canvas_size['80+'] : canvas_size['13'];
      } else if(browser === 'Android'){
        if(+v_arr[0] >= 91)
        {
          if(canvas_size[91][+v_arr[1]])
          {
            canvas_size = canvas_size[91][+v_arr[1]];
          }
          else if(+v_arr[1] >= 8)
          {
            canvas_size = canvas_size[91]['8+'];
          }
          else
          {
            canvas_size = max_canvas_sizes.Android.other;
          }
        }
        else if(+v_arr[0] >= 68)
        {
          if(canvas_size[68][+v_arr[1]])
          {
            canvas_size = canvas_size[91][+v_arr[1]];
          }
          else if(+v_arr[1] >= 7)
          {
            canvas_size = canvas_size[68]['7+'];
          }
          else
          {
            canvas_size = max_canvas_sizes.Android.other;
          }
        }
        else
        {
          canvas_size = max_canvas_sizes.Android.other;
        }
      }
    }
    else if(!canvas_size.width_height && !canvas_size.width)
    {
      canvas_size = canvas_size_other;
    }

    if(!canvas_size.width && canvas_size.width_height)
    {
      canvas_size.width = canvas_size.width_height;
      canvas_size.height = canvas_size.width_height;
    }

    if(!canvas_size.area)
    {
      canvas_size.area = canvas_size.width * canvas_size.height;
    }

    this.max_canvas_size = canvas_size;
    this.max_canvas_size.browser = browser;
    this.max_canvas_size.version = version;
  }

  muck(txt)
  {
    if(this.options.muck < 1 || (this.options.labels !== 'names' && this.options.labels !== 'sherwin_ai'))
    {
      return txt;
    }
    else
    {
      let new_txt = '';
      for(let i = 0; i < txt.length; i++)
      {
        let muck = Math.floor(Math.random() * 10),
            letter = txt[i].toUpperCase();

        if(muck < this.options.muck && this.muck_char[letter])
        {
          new_txt += this.muck_char[letter];
        }
        else
        {
          new_txt += letter
        }
      }

      return new_txt;
    }
  }

  set_options(options, gen_image_callback)
  {
    let muck_str = '';
    for(let letter in this.muck_char)
    {
      muck_str += letter + this.muck_char[letter];
    }
    $('#measure').text(muck_str);

    this.options = {...{
      cols: 5,
      labels: 'hex',
      muck: 0,
      masonry: false,
      sort_by: 'hue', //other options: luminance
      asc_desc: true, //sort direction, true: A-Z, false: Z-A
      font_size: 20,
      letter_spacing: true,
      border_style: 'dotted',
      shadow: false,
      border_width: 1,
      shadow_blur: 5,
      shadow_x: 0,
      shadow_y: 5,
      margin: 0,
      padding: 4,
      multiplier: 10, //how much bigger to make the download
      width: $(window).width() - 8,
      max_colors: false //to limit colors for testing
    }, ...options};

    let colors = [];
    if(this.options.labels === 'names')
    {
      colors = [
        {hex:"f0f8ff",name:"aliceblue"},
        {hex:"faebd7",name:"antiquewhite"},
        {hex:"00ffff",name:"aqua"},
        {hex:"7fffd4",name:"aquamarine"},
        {hex:"f0ffff",name:"azure"},
        {hex:"f5f5dc",name:"beige"},
        {hex:"ffe4c4",name:"bisque"},
        {hex:"000000",name:"black"},
        {hex:"ffebcd",name:"blanchedalmond"},
        {hex:"0000ff",name:"blue"},
        {hex:"8a2be2",name:"blueviolet"},
        {hex:"a52a2a",name:"brown"},
        {hex:"deb887",name:"burlywood"},
        {hex:"5f9ea0",name:"cadetblue"},
        {hex:"7fff00",name:"chartreuse"},
        {hex:"d2691e",name:"chocolate"},
        {hex:"ff7f50",name:"coral"},
        {hex:"6495ed",name:"cornflowerblue"},
        {hex:"fff8dc",name:"cornsilk"},
        {hex:"dc143c",name:"crimson"},
        {hex:"00ffff",name:"cyan"},
        {hex:"00008b",name:"darkblue"},
        {hex:"008b8b",name:"darkcyan"},
        {hex:"b8860b",name:"darkgoldenrod"},
      //  {hex:"a9a9a9",name:"darkgray"},
        {hex:"006400",name:"darkgreen"},
        {hex:"a9a9a9",name:"darkgrey"},
        {hex:"bdb76b",name:"darkkhaki"},
        {hex:"8b008b",name:"darkmagenta"},
        {hex:"556b2f",name:"darkolivegreen"},
        {hex:"ff8c00",name:"darkorange"},
        {hex:"9932cc",name:"darkorchid"},
        {hex:"8b0000",name:"darkred"},
        {hex:"e9967a",name:"darksalmon"},
        {hex:"8fbc8f",name:"darkseagreen"},
        {hex:"483d8b",name:"darkslateblue"},
      //  {hex:"2f4f4f",name:"darkslategray"},
        {hex:"2f4f4f",name:"darkslategrey"},
        {hex:"00ced1",name:"darkturquoise"},
        {hex:"9400d3",name:"darkviolet"},
        {hex:"ff1493",name:"deeppink"},
        {hex:"00bfff",name:"deepskyblue"},
      //  {hex:"696969",name:"dimgray"},
        {hex:"696969",name:"dimgrey"},
        {hex:"1e90ff",name:"dodgerblue"},
        {hex:"b22222",name:"firebrick"},
        {hex:"fffaf0",name:"floralwhite"},
        {hex:"228b22",name:"forestgreen"},
        {hex:"ff00ff",name:"fuchsia"},
        {hex:"dcdcdc",name:"gainsboro"},
        {hex:"f8f8ff",name:"ghostwhite"},
        {hex:"ffd700",name:"gold"},
        {hex:"daa520",name:"goldenrod"},
      //  {hex:"808080",name:"gray"},
        {hex:"008000",name:"green"},
        {hex:"adff2f",name:"greenyellow"},
        {hex:"808080",name:"grey"},
        {hex:"f0fff0",name:"honeydew"},
        {hex:"ff69b4",name:"hotpink"},
        {hex:"cd5c5c",name:"indianred"},
        {hex:"4b0082",name:"indigo"},
        {hex:"fffff0",name:"ivory"},
        {hex:"f0e68c",name:"khaki"},
        {hex:"e6e6fa",name:"lavender"},
        {hex:"fff0f5",name:"lavenderblush"},
        {hex:"7cfc00",name:"lawngreen"},
        {hex:"fffacd",name:"lemonchiffon"},
        {hex:"add8e6",name:"lightblue"},
        {hex:"f08080",name:"lightcoral"},
        {hex:"e0ffff",name:"lightcyan"},
        {hex:"fafad2",name:"lightgoldenrodyellow"},
      //  {hex:"d3d3d3",name:"lightgray"},
        {hex:"90ee90",name:"lightgreen"},
        {hex:"d3d3d3",name:"lightgrey"},
        {hex:"ffb6c1",name:"lightpink"},
        {hex:"ffa07a",name:"lightsalmon"},
        {hex:"20b2aa",name:"lightseagreen"},
        {hex:"87cefa",name:"lightskyblue"},
      //  {hex:"778899",name:"lightslategray"},
        {hex:"778899",name:"lightslategrey"},
        {hex:"b0c4de",name:"lightsteelblue"},
        {hex:"ffffe0",name:"lightyellow"},
        {hex:"00ff00",name:"lime"},
        {hex:"32cd32",name:"limegreen"},
        {hex:"faf0e6",name:"linen"},
        {hex:"ff00ff",name:"magenta"},
        {hex:"800000",name:"maroon"},
        {hex:"66cdaa",name:"mediumaquamarine"},
        {hex:"0000cd",name:"mediumblue"},
        {hex:"ba55d3",name:"mediumorchid"},
        {hex:"9370db",name:"mediumpurple"},
        {hex:"3cb371",name:"mediumseagreen"},
        {hex:"7b68ee",name:"mediumslateblue"},
        {hex:"00fa9a",name:"mediumspringgreen"},
        {hex:"48d1cc",name:"mediumturquoise"},
        {hex:"c71585",name:"mediumvioletred"},
        {hex:"191970",name:"midnightblue"},
        {hex:"f5fffa",name:"mintcream"},
        {hex:"ffe4e1",name:"mistyrose"},
        {hex:"ffe4b5",name:"moccasin"},
        {hex:"ffdead",name:"navajowhite"},
        {hex:"000080",name:"navy"},
        {hex:"fdf5e6",name:"oldlace"},
        {hex:"808000",name:"olive"},
        {hex:"6b8e23",name:"olivedrab"},
        {hex:"ffa500",name:"orange"},
        {hex:"ff4500",name:"orangered"},
        {hex:"da70d6",name:"orchid"},
        {hex:"eee8aa",name:"palegoldenrod"},
        {hex:"98fb98",name:"palegreen"},
        {hex:"afeeee",name:"paleturquoise"},
        {hex:"db7093",name:"palevioletred"},
        {hex:"ffefd5",name:"papayawhip"},
        {hex:"ffdab9",name:"peachpuff"},
        {hex:"cd853f",name:"peru"},
        {hex:"ffc0cb",name:"pink"},
        {hex:"dda0dd",name:"plum"},
        {hex:"b0e0e6",name:"powderblue"},
        {hex:"800080",name:"purple"},
        {hex:"ff0000",name:"red"},
        {hex:"bc8f8f",name:"rosybrown"},
        {hex:"4169e1",name:"royalblue"},
        {hex:"8b4513",name:"saddlebrown"},
        {hex:"fa8072",name:"salmon"},
        {hex:"f4a460",name:"sandybrown"},
        {hex:"2e8b57",name:"seagreen"},
        {hex:"fff5ee",name:"seashell"},
        {hex:"a0522d",name:"sienna"},
        {hex:"c0c0c0",name:"silver"},
        {hex:"87ceeb",name:"skyblue"},
        {hex:"6a5acd",name:"slateblue"},
      //  {hex:"708090",name:"slategray"},
        {hex:"708090",name:"slategrey"},
        {hex:"fffafa",name:"snow"},
        {hex:"00ff7f",name:"springgreen"},
        {hex:"4682b4",name:"steelblue"},
        {hex:"d2b48c",name:"tan"},
        {hex:"008080",name:"teal"},
        {hex:"d8bfd8",name:"thistle"},
        {hex:"ff6347",name:"tomato"},
        {hex:"40e0d0",name:"turquoise"},
        {hex:"ee82ee",name:"violet"},
        {hex:"f5deb3",name:"wheat"},
        {hex:"ffffff",name:"white"},
        {hex:"f5f5f5",name:"whitesmoke"},
        {hex:"ffff00",name:"yellow"},
        {hex:"9acd32",name:"yellowgreen"}
      ];
    }
    else if(this.options.labels === 'sherwin_ai')
    {
      //colors borrowed from:
      //https://www.aiweirdness.com/new-paint-colors-invented-by-neural-17-05-17/
      //https://www.aiweirdness.com/160985569682/

      colors = [
        {rgb:[171,37,34],name:"Sticks Red"},
        {rgb:[129,102,100],name:"Coral Gray"},
        {rgb:[222,222,213],name:"Rover White"},
        {rgb:[239,212,202],name:"Corcaunitiol Orange"},
        {rgb:[231,137,165],name:"Ghastly Pink"},
        {rgb:[151,124,112],name:"Power Gray"},
        {rgb:[199,173,140],name:"Navel Tan"},
        {rgb:[221,215,236],name:"Bock Coe White"},
        {rgb:[133,104,85],name:"Homestar Brown"},
        {rgb:[144,106,74],name:"Snader Brown"},
        {rgb:[237,217,177],name:"Golder Craam"},
        {rgb:[232,223,215],name:"Hurky White"},
        {rgb:[223,173,179],name:"Burf Pink"},
        {rgb:[230,216,198],name:"Rose Hork"},
        {rgb:[211,226,214],name:"Black Hand"},
        {rgb:[6,193,214],name:"Gray Pubic"},
        {rgb:[116,70,60],name:"Ferry Purple"},
        {rgb:[184,174,17],name:"Ice Gray"},
        {rgb:[130,96,62],name:"Gray Pock"},
        {rgb:[167,168,169],name:"Barial Blue"},
        {rgb:[124,130,72],name:"Stoomy Brown"},
        {rgb:[112,113,84],name:"Clardic Fug"},
        {rgb:[201,199,165],name:"Snowbonk"},
        {rgb:[97,93,68],name:"Catbabel"},
        {rgb:[190,174,155],name:"Bunflow"},
        {rgb:[121,114,124],name:"Ronching Blue"},
        {rgb:[221,196,199],name:"Bank Butt"},
        {rgb:[171,166,170],name:"Caring Tan"},
        {rgb:[233,191,141],name:"Stargoon"},
        {rgb:[176,138,110],name:"Sink"},
        {rgb:[216,200,185],name:"Stummy Beige"},
        {rgb:[61,63,66],name:"Dorkwood"},
        {rgb:[178,184,196],name:"Flower"},
        {rgb:[201,172,143],name:"Sand Dan"},
        {rgb:[48,94,83],name:"Grade Bat"},
        {rgb:[175,150,147],name:"Light of Blast"},
        {rgb:[176,99,108],name:"Grass Bat"},
        {rgb:[204,205,194],name:"Sindis Poop"},
        {rgb:[219,209,179],name:"Dope"},
        {rgb:[157,101,106],name:"Testing"},
        {rgb:[226,181,132],name:"Burble Simp"},
        {rgb:[197,162,171],name:"Stank Bean"},
        {rgb:[190,164,116],name:"Turdly"},
        {rgb:[227,223,224],name:"Boo Snow"},
        {rgb:[179,86,61],name:"Red Grof"},
        {rgb:[228,189,214],name:"Pink Bom"},
        {rgb:[166,181,160],name:"Greenwater Chamiweed"},
        {rgb:[69,74,61],name:"Sudden Pine"},
        {rgb:[237,228,218],name:"Enkerwash"},
        {rgb:[172,189,130],name:"Clear Paste"},
        {rgb:[112,130,148],name:"Felthy Blue"},
        {rgb:[248,215,120],name:"Bright Beach"},
        {rgb:[235,229,198],name:"Bull Cream"},
        {rgb:[168,124,99],name:"Coper Panty"},
        {rgb:[134,100,80],name:"Primple Brown"},
        {rgb:[123,164,145],name:"Stoned Blue"},
        {rgb:[123,134,124],name:"Sing Gray"},
        {rgb:[231,219,205],name:"Rose Colon"},
        {rgb:[215,193,171],name:"Stamped Candy"},
        {rgb:[134,130,109],name:"Mown Poupe"},
        {rgb:[154,47,47],name:"Farty Red"},
        {rgb:[3,228,230],name:"Dad"},
        {rgb:[81,52,76],name:"Dorky Brown"},
        {rgb:[187,191,172],name:"Bleedwood"},
        {rgb:[110,117,72],name:"Parp Green"},
        {rgb:[157,179,186],name:"Flipper"},
        {rgb:[236,203,161],name:"Lemon Nose"},
        {rgb:[187,198,197],name:"Shy Bather"},
        {rgb:[85,90,79],name:"Spiced Rope"},
        {rgb:[170,167,210],name:"Polar Forest Ma Pepper"},
        {rgb:[186,206,229],name:"Windled Waters"},
        {rgb:[225,175,134],name:"Dry Custard"}
      ];
    }
    else
    {
      let carr = ['00', '33', '99', 'CC', 'FF'];
      carr.forEach(function(a){
      	carr.forEach(function(b){
      		carr.forEach(function(c){
      			colors.push({
      				hex: a + b + c,
              short_hex: a[0] + b[0] + c[0]
      			});
      		})
      	})
      })
    }

    let _this = this;
    this.colors = colors.map(function(c)
    {
      c.rgb = c.rgb ? c.rgb : _this.hexToRGB(c.hex);
      c.hex = c.hex ? c.hex : _this.RGBtoHex(c.rgb);
      c.hsv = _this.RGBtoHSV(c.rgb);
      c.luminance = _this.luminance(c.rgb);
      return _this.textColorHex(c);
    }).sort(function(a,b){
      if(_this.options.sort_by === 'hue') return _this.options.asc_desc ? a.hsv[0] - b.hsv[0] : b.hsv[0] - a.hsv[0];
      if(_this.options.sort_by === 'saturation') return _this.options.asc_desc ? a.hsv[1] - b.hsv[1] : b.hsv[1] - a.hsv[1];
      if(_this.options.sort_by === 'value') return _this.options.asc_desc ? a.hsv[2] - b.hsv[2] : b.hsv[2] - a.hsv[2];
      if(_this.options.sort_by === 'red') return _this.options.asc_desc ? a.rgb[0] - b.rgb[0] : b.rgb[0] - a.rgb[0];
      if(_this.options.sort_by === 'green') return _this.options.asc_desc ? a.rgb[1] - b.rgb[1] : b.rgb[1] - a.rgb[1];
      if(_this.options.sort_by === 'blue') return _this.options.asc_desc ? a.rgb[2] - b.rgb[2] : b.rgb[2] - a.rgb[2];
      if(_this.options.sort_by === 'luminance') return _this.options.asc_desc ? a.luminance - b.luminance : b.luminance - a.luminance;
      if(_this.options.sort_by === 'alphanumeric'){
        if(_this.options.labels === 'names' || _this.options.labels === 'sherwin_ai'){
          return _this.options.asc_desc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
        } else if(_this.options.labels === 'short_hex'){
          return _this.options.asc_desc ? a.hex.localeCompare(b.short_hex) : b.hex.localeCompare(a.short_hex);
        } else {
          return _this.options.asc_desc ? a.hex.localeCompare(b.hex) : b.hex.localeCompare(a.hex);
        }
      }
    }).splice(0, this.options.max_colors ? this.options.max_colors : colors.length);

    _this.generate_html(gen_image_callback);
  }

  //this does some stuff to decide wtf the most contrasty text color should be.
  textColorHex(color)
  {
    let invertedRGB = this.invertRGB(color.rgb),
        invertedLum = this.luminance(invertedRGB),
        invertedBW = color.luminance > .55 ? [0,0,0] : [255,255,255],
        lumDiff = Math.abs(color.luminance - invertedLum),
        howMix = 1;

    if(lumDiff < .1) //colors have similar luminance
    {
      howMix = lumDiff + .3; //increase BW mix
    }
    else if(lumDiff < .3) //colors have similar luminance
    {
      howMix = lumDiff + .1; //increase BW mix
    }
    else if(lumDiff > .7 && color.luminance > .5) //colors have different luminance, and it's a brighter color
    {
      if(color.rgb[0] == color.rgb[1] && color.rgb[0] == color.rgb[2])
      {
        //this is a shade, not a color, leave it be.
      }
      else
      {
        let invertHSV = [Math.abs(color.hsv[0] - 180), (color.hsv[1] < .8 ? color.hsv[1] + .2 : 1), lumDiff / 2];
        invertedRGB = this.HSVtoRGB(invertHSV);
      }
    }

    let textRGB = this.colorMixer(invertedRGB, invertedBW, howMix);

    //color.invertedRGB = this.invertRGB(color.rgb);
    //color.invertedBW = invertedBW;
    color.textRGB = textRGB;
    color.text = this.RGBtoHex(textRGB);

    return color;
  }

  //this is perceived luminance, since blue is visually darker than yellow
  luminance(rgb)
  {
    return Math.sqrt(0.299 * (rgb[0] * rgb[0]) + 0.587 * (rgb[1] * rgb[1]) + 0.114 * (rgb[2] * rgb[2])) / 255;
  }

  hexToRGB(hex)
  {
    let hex_arr = hex.match(/.{1,2}/g);
    let rgb = [
        parseInt(hex_arr[0], 16),
        parseInt(hex_arr[1], 16),
        parseInt(hex_arr[2], 16)
    ];

    return rgb;
  }

  RGBtoHex(rgb)
  {
    let componentToHex = function(c)
    {
      let hex = c.toString(16);
      return hex.length == 1 ? "0" + hex : hex;
    }

    return componentToHex(rgb[0]) + componentToHex(rgb[1]) + componentToHex(rgb[2]);
  }

  invertRGB(rgb)
  {
    return rgb.map(function(c){
      return 255 - c;
    });
  }

  //rgbA and rgbB are arrays, amountToMix ranges from 0.0 to 1.0
  //example (red): rgbA = [255,0,0]
  colorMixer(rgbA, rgbB, amountToMix)
  {
    let colorChannelMixer = function(colorChannelA, colorChannelB, amountToMix)
    {
      let channelA = colorChannelA * amountToMix;
      var channelB = colorChannelB * (1 - amountToMix);
      return parseInt(channelA + channelB);
    }
      let r = colorChannelMixer(rgbA[0], rgbB[0], amountToMix);
      let g = colorChannelMixer(rgbA[1], rgbB[1], amountToMix);
      let b = colorChannelMixer(rgbA[2], rgbB[2], amountToMix);
      return [r, g, b];
  }

  invertHex(hex, luminance)
  {
    let pad_zero = function(str, len)
    {
      len = len || 2;
      let zeros = new Array(len).join('0');
      return (zeros + str).slice(-len);
    }

    let ri = (255 - parseInt(hex.slice(0, 2), 16)).toString(16),
        gi = (255 - parseInt(hex.slice(2, 4), 16)).toString(16),
        bi = (255 - parseInt(hex.slice(4, 6), 16)).toString(16);

    return pad_zero(ri) + pad_zero(gi) + pad_zero(bi)
  }

  RGBtoHSV(rgb)
  {
    let max = Math.max.apply(Math, rgb);
    let min = Math.min.apply(Math, rgb);

    let chr = max-min;
    let hue = 0;
    let val = max;
    let sat = 0;

    if (val > 0)
    {
      sat = chr/val; //Calculate Saturation only if Value isn't 0

      if (sat > 0)
      {
        if (rgb[0] == max)
        {
          hue = 60 * (((rgb[1] - min) - (rgb[2] - min)) / chr);
          if (hue < 0) { hue += 360 }
        }
        else if (rgb[1] == max)
        {
          hue = 120 + 60 * (((rgb[2] - min) - (rgb[0] - min)) / chr);
        }
        else if (rgb[2] == max)
        {
          hue = 240 + 60 * (((rgb[0] - min) - (rgb[1] - min)) / chr);
        }
      }
    }

    return [hue, sat, val/255];
  }

  HSVtoRGB(hsv)
  {
    let r, g, b, i, f, p, q, t,
    h = hsv[0]/360, s = hsv[1], v = hsv[2];

    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    return [r*255, g*255, b*255];
  }

  download(filename, text)
  {
    let element = document.createElement('a');

    if(filename.match('\.html$'))
    {
      element.setAttribute('href', 'data:text/html;charset=utf-8,' + encodeURIComponent(text));
    }
    else if(filename.match('\.png$'))
    {
      element.setAttribute('href', text);
    }
    else if(filename.match('\.json$'))
    {
      element.setAttribute('href', 'data:text/json;charset=utf-8,' + encodeURIComponent(text));
    }
    else
    {
      element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    }
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  }

  generate_html(gen_image_callback)
  {
    if(this.color_looper){
      clearInterval(this.color_looper);
      this.color_looper = false;
    }

    let _this = this,
        col_count = 0,
        sizer_html = '';

    $('#sizer').empty().removeAttr('style');

    if(this.options.masonry && this.options.cols > 0)
    {
      //console.log('generate_html masonry cols > 0', this.options);

      let cols_html = [];
      let col_longest_text = [];
      this.colors.forEach(function(c)
      {
        cols_html[col_count] = cols_html[col_count] || '';
        col_longest_text[col_count] = col_longest_text[col_count] || '';

        let col = '#' + c.hex;
        if(_this.options.labels === 'names' || _this.options.labels === 'sherwin_ai'){
          col = c.name;
        } else if(_this.options.labels === 'short_hex'){
          col = '#' + c.short_hex
        }

        if(col_longest_text[col_count].length < col.length)
        {
          col_longest_text[col_count] = col;
        }

        cols_html[col_count] += '<span style="background-color:#' + c.hex + ';'
        cols_html[col_count] += 'padding:' + _this.options.padding + 'px;';
        cols_html[col_count] += 'margin:' + _this.options.margin + 'px;"';
        cols_html[col_count] += ' color="' + c.text + '" class="color">' + _this.muck(col);
        cols_html[col_count] += '</span>';

        col_count++;
        if(col_count >= _this.options.cols){
          col_count = 0;
        }
      });

      for(let col in cols_html){
        sizer_html += '<div class="col">' + cols_html[col] + '</div>';
      }

      $('#sizer').html(sizer_html).addClass('masonry').removeClass('no_cols');

      $('#sizer .col').each(function(i, col)
      {
        let col_width = (col.clientWidth - (_this.options.padding * 2));
        let letter_width = col_width / col_longest_text[i].length;

        $(col).find('span.color').each(function(j, elm)
        {
          //(original height / original width) x new width = new height
          let text_width = $(elm).text().length * letter_width;
          let font_size = (16 / text_width) * col_width;

          $(elm).css({
            'font-size': font_size + 'px',
            'line-height': font_size + _this.options.padding + 'px',
            'outline': _this.options.border_width + 'px ' + _this.options.border_style + ' #' + $(elm).attr('color'),
            'color': '#' + $(elm).attr('color')
          });
        });
      });

      this.options.width = $('#sizer')[0].clientWidth;
      $('#sizer').css({
        'width': this.options.width + 'px',
        'max-width': this.options.width + 'px',
        'min-width': this.options.width + 'px'
      });

      if(gen_image_callback)
      {
        setTimeout(function(){
          _this.generate_image(gen_image_callback);
        }, 500);
      }
    }
    else if(this.options.masonry && this.options.cols < 1)
    {
      //console.log('generate_html masonry 0 cols', this.options);

      this.colors.forEach(function(c)
      {
        let col = '#' + c.hex;
        if(_this.options.labels === 'names' || _this.options.labels === 'sherwin_ai'){
          col = c.name ? c.name : '#' + c.hex;
        } else if(_this.options.labels === 'short_hex'){
          col = '#' + c.short_hex
        }

        sizer_html += '<span color="' + c.text + '" bkg="' + c.hex + '" class="color">';
        sizer_html += '<span class="color_fill">' + col.repeat(40) + '</span>';
        sizer_html += '<span class="color_name">' + _this.muck(col) + '</span></span>';
      });

      $('#sizer').html(sizer_html).addClass('masonry').addClass('no_cols');

      let col_p = [];

      let make_color = function(i, options)
      {
        options = $.extend({
          total_width: null,
          font_size: null,
          border: null,
          type: ''
        }, options)

        if(options.total_width)
        {
          options.total_width = Math.abs(options.total_width);
        }

        let $color = $('#sizer span.color').eq(i);
        let resize = false;

        if(!$color.length)
        {
          return false;
        }
        else
        {
          let txt = $color.find('.color_name').text();
          let letter_spacing = Math.floor(Math.random() * 10);
          let text_width = txt.length * 8;
          let font_size = 16;

          if(!options.font_size)
          {
            if(!options.total_width)
            {
              font_size = Math.floor((Math.random() * _this.options.font_size) + Math.floor(_this.options.font_size / 2));
            }
            else
            {
              font_size = ((16 / text_width) * (options.total_width - 4 - (_this.options.padding * 2)));
              letter_spacing = 0;

              if(font_size > _this.options.font_size * 2)
              {
                let old_font_size = font_size;
                let old_letter_width = Math.floor(font_size / 2);

                font_size = _this.options.font_size * 1.5;

                let new_letter_width = Math.floor(font_size / 2);
                letter_spacing = old_letter_width - new_letter_width;

                resize = true;
              }
            }
          }
          else
          {
            font_size = options.font_size;
          }

          let p = $color.removeAttr('style').css({
            'background-color': '#' + $color.attr('bkg'),
            'color': '#' + $color.attr('color'),
            'outline': _this.options.border_width + 'px ' + _this.options.border_style + ' #' + $color.attr('color'),
            'padding': _this.options.padding + 'px',
            'font-size': font_size + 'px',
            'line-height': (font_size + (_this.options.padding * 2)) + 'px',
            'letter-spacing': _this.options.letter_spacing ? letter_spacing + 'px' : '',
            'margin': _this.options.margin + 'px',
            'z-index': '-' + i
          }).attr('type', options.type).attr('i', i).position();

          $color.find('.color_fill').removeAttr('style');

          if(options.total_width)
          {
            p = $color.css({
              'width': (options.total_width - 4 - (_this.options.padding * 2)) + 'px'
            }).position();
          }

          if(_this.options.shadow && (_this.options.shadow_x !== 0 || _this.options.shadow_y !== 0 || _this.options.shadow_blur !== 0))
          {
            $color.css({
              'box-shadow': _this.options.shadow_x + 'px ' + _this.options.shadow_y + 'px ' + _this.options.shadow_blur + 'px rgba(0,0,0,.5)'
            });
          }

          let shortest = p.top;
          let tallest = 0;
          let padding_top = 0;
          let margin_top = 0;
          let margin_left = _this.options.margin;
          let new_top = p.top;
          let new_left = p.left;

          if(p.left === 0)//first item in row
          {
            margin_left = Math.floor((Math.random() * _this.options.font_size * 3) + _this.options.font_size);
            new_left = p.left + margin_left;

            $color.css({
              outline: '1px solid #F00'
            });
          }

          if(p.top === 0) //first row
          {
            margin_top = Math.floor((Math.random() * _this.options.font_size) + _this.options.padding);
            padding_top = Math.floor((Math.random() * _this.options.font_size * 2) + _this.options.padding);
            new_top = margin_top;
          }
          else
          {
            let x_left = Math.floor(p.left + margin_left + 2);
            let x_right = Math.floor(p.left + margin_left) + Math.floor($color[0].clientWidth) - 4;

            //this is for calcing the top/padding-top of items based on the row above them
            for(let x = x_left; x < x_right; x++)
            {
              shortest = col_p[x] && col_p[x] < shortest ? col_p[x] : shortest;
              tallest = col_p[x] && col_p[x] > tallest ? col_p[x] : tallest;
            }

            padding_top = tallest - shortest < _this.options.padding ? _this.options.padding : tallest - shortest + _this.options.padding;
            margin_top = shortest - p.top;
            new_top = p.top + margin_top;

            //console.log(txt, 'left', x_left, 'right', x_right, 'short', shortest, 'tall', tallest);
          }

          if(!options.total_width && padding_top > $color[0].clientWidth)
          {
            resize = true;
          }
          else if(margin_top !== 0)
          {
            p = $color.css({
              'margin-top': margin_top + 'px',
              'margin-left': margin_left + 'px',
              'padding-top': padding_top + 'px'
            }).position();

            $color.find('.color_fill').css({
              'display': 'block',
              'font-size': (font_size / 2) + 'px',
              'line-height': (font_size / 2) + 'px',
              'height': (padding_top - _this.options.padding) + 'px',
              'width': ($color[0].clientWidth - (_this.options.padding * 2)) + 'px',
              //'outline': '1px solid #F00'
            })

            p.top = new_top;
            p.left = new_left;
          }

          let ret = {
            txt: $color.find('.color_name').text(),
            resize: resize,
            padding_top: padding_top,
            margin_top: margin_top,
            width: Math.floor($color[0].clientWidth),
            height: Math.floor($color[0].clientHeight),
            left: Math.floor(p.left),
            top: Math.floor(p.top),
            font_size: font_size
          };

          if(options.border)
          {
            $color.css({
              'outline': options.border
            });
            console.log(txt, options, ret)
          }

          return ret;
        }
      }

      let get_info = function(i)
      {
        let $color = $('#sizer span.color').eq(i);

        if(!$color.length)
        {
          return false;
        }
        else
        {
          let p = $color.position();
          let font_size = 16;

          if($color[0].style && $color[0].style['font-size'])
          {
            font_size = +$color[0].style['font-size'].replace('px', '')
          }

          return {
            txt: $color.text(),
            width: Math.floor($color[0].clientWidth),
            height: Math.floor($color[0].clientHeight),
            left: Math.floor(p.left),
            top: Math.floor(p.top),
            font_size: font_size
          }
        }
      }

      this.xy = [];

      let loops = 0;
      this.color_looper = setInterval(function()
      {
        if(loops >= $('#sizer span.color').length)
        {
          clearInterval(_this.color_looper);
          _this.color_looper = false;

          _this.options.width = $('#sizer')[0].clientWidth;

          $('#sizer').css({
            'width': _this.options.width + 'px',
            'max-width': _this.options.width + 'px',
            'min-width': _this.options.width + 'px'
          });

          if(gen_image_callback)
          {
            setTimeout(function(){
              _this.generate_image(gen_image_callback);
            }, 500);
          }
        }
        else
        {
          let current = false;
          if(loops === 0)
          {
            current = make_color(0);
          } else {
            current = get_info(loops);
          }

          let next = make_color(loops + 1);

          if(current)
          {
            if(next.top > current.top) //last item
            {
              current = make_color(loops, {
                total_width: _this.options.width - current.left - 4 - (_this.options.margin * 2),
                type: 'last'
              });

              if(current.resize)
              {

                let txt_len = current.txt.length + (next ? next.txt.length : 0);
                let new_width_perc = current.txt.length / txt_len;
                let new_width = Math.floor(current.width * new_width_perc);

                //console.log('RESIZE', current, txt_len, current.txt + next.txt, new_width_perc, new_width);

                current = make_color(loops, {
                  total_width: new_width,
                  //border: '1px solid #00F',
                  type: 'last resize'
                });

                //console.log('RESIZED', current);

                if(next)
                {
                  next = make_color(loops + 1, {
                    total_width: current.width - new_width,
                    //border: '1px solid #0F0',
                    type: 'last resize'
                  });
                }
              }
            }
            else //not last item
            {
              current = make_color(loops, {
                type: 'not-last'
              });

              if(current.resize)
              {
                let new_width = next.left - current.left;

                current = make_color(loops, {
                  total_width: new_width,
                  type: 'not-last resize'
                });
              }
            }

            for(let x = current.left; x < current.left + current.width; x++)
            {
              col_p[x] = col_p[x] || 0;
              col_p[x] = col_p[x] > current.top + current.height ? col_p[x] : current.top + current.height;

              _this.xy.push([x, col_p[x]]);
            }
          }

          loops++;
        }
      }, 50);
    }
    else
    {
      //console.log('generate_html', this.options);

      let open_row = false;
      this.colors.forEach(function(c){
        if(col_count === 0 && _this.options.cols > 0){
          sizer_html += '<div class="row">';
          open_row = true;
        }
        col_count++;

        let col = '#' + c.hex;
        if(_this.options.labels === 'names' || _this.options.labels === 'sherwin_ai'){
          col = c.name;
        } else if(_this.options.labels === 'short_hex'){
          col = '#' + c.short_hex
        }

        sizer_html += '<span style="background-color:#' + c.hex + ';'
        sizer_html += 'padding:' + _this.options.padding + 'px;';
        sizer_html += 'margin:' + _this.options.margin + 'px;"';
        sizer_html += ' color="' + c.text + '" class="color">' + _this.muck(col);
        sizer_html += '</span>';

      	if(col_count >= _this.options.cols && _this.options.cols > 0){
          sizer_html += '</div>';
          open_row = false;
          col_count = 0;
        }
      });

      if(open_row){
        sizer_html += '</div>';
      }

      $('#sizer').html(sizer_html).removeClass('masonry').removeAttr('style').css({
        'font-size': this.options.font_size + 'px',
        'line-height': this.options.font_size + 'px'
      });

      setTimeout(function()
      {
        if(_this.options.cols > 0)
        {
          $('#sizer').removeClass('no_cols');

          let width = 0;
          $('#sizer span.color').each(function(i, elm)
          {
            $(this).css({
              'color': '#' + $(this).attr('color'),
              'outline': _this.options.border_width + 'px ' + _this.options.border_style + ' #' + $(this).attr('color')
            });

            if(_this.options.shadow && (_this.options.shadow_x !== 0 || _this.options.shadow_y !== 0 || _this.options.shadow_blur !== 0))
            {
              $(this).css({
                'box-shadow': _this.options.shadow_x + 'px ' + _this.options.shadow_y + 'px ' + _this.options.shadow_blur + 'px rgba(0,0,0,.5)'
              });
            }

            width = elm.clientWidth > width ? elm.clientWidth : width;
          });

          $('#sizer span.color').css({width: width + 'px'});
        }
        else
        {
          $('#sizer span.color').each(function(i, elm)
          {
            $(this).css({
              'color': '#' + $(this).attr('color'),
              'outline': _this.options.border_width + 'px ' + _this.options.border_style + ' #' + $(this).attr('color')
            });

            if(_this.options.shadow && (_this.options.shadow_x !== 0 || _this.options.shadow_y !== 0 || _this.options.shadow_blur !== 0))
            {
              $(this).css({
                'box-shadow': _this.options.shadow_x + 'px ' + _this.options.shadow_y + 'px ' + _this.options.shadow_blur + 'px rgba(0,0,0,.5)'
              });
            }
          });

          $('#sizer').addClass('no_cols');
        }

        _this.options.width = $('#sizer')[0].clientWidth;

        $('#sizer').css({
          'width': _this.options.width + 'px',
          'max-width': _this.options.width + 'px',
          'min-width': _this.options.width + 'px'
        });

        if(gen_image_callback)
        {
          setTimeout(function(){
            _this.generate_image(gen_image_callback);
          }, 100);
        }
      }, 100);
    }
  }

  generate_image(callback, options)
  {
    let _this = this;
    options = $.extend(this.options, options);

    let shadow = (options.shadow && (options.shadow_x !== 0 || options.shadow_y !== 0 || options.shadow_blur !== 0)),
    canvas_margin = {
      top: (this.options.border_width / 2),
      right: (this.options.border_width / 2),
      bottom: (this.options.border_width / 2),
      left: (this.options.border_width / 2)
    };

    if(shadow)
    {
      canvas_margin.top = options.shadow_blur - options.shadow_y > canvas_margin.top ? options.shadow_blur - options.shadow_y : canvas_margin.top;
      canvas_margin.right = options.shadow_blur + options.shadow_x > canvas_margin.right ? options.shadow_blur + options.shadow_x : canvas_margin.right;
      canvas_margin.bottom = options.shadow_blur + options.shadow_y > canvas_margin.bottom ? options.shadow_blur + options.shadow_y : canvas_margin.bottom;
      canvas_margin.left = options.shadow_blur - options.shadow_x > canvas_margin.left ? options.shadow_blur - options.shadow_x : canvas_margin.left;
    }

    canvas_margin.top = canvas_margin.top * options.multiplier;
    canvas_margin.right = canvas_margin.right * options.multiplier;
    canvas_margin.bottom = canvas_margin.bottom * options.multiplier;
    canvas_margin.left = canvas_margin.left * options.multiplier;

    let canvas = document.createElement('canvas'),
        context = canvas.getContext && canvas.getContext('2d'),
        height = ($('#sizer')[0].clientHeight * options.multiplier) + canvas_margin.top + canvas_margin.bottom,
        width = ($('#sizer')[0].clientWidth * options.multiplier) + canvas_margin.left + canvas_margin.right,
        padding = this.options.padding * options.multiplier;

    let dot_line = function(fromx, fromy, tox, toy, color)
    {
      let x_len = Math.abs(fromx - tox);
      let y_len = Math.abs(fromy - toy);

      let x_inc = x_len > y_len ? 1 : x_len / y_len;
      let y_inc = y_len > x_len ? 1 : y_len / x_len;

      //let i_inc = options.border_width * 2 * options.multiplier;
      let radius = (options.border_width * options.multiplier) / 2;
      let i_inc = radius * 3;

      context.beginPath();

      for(let i = 0; i < (x_len > y_len ? x_len : y_len); i = i + i_inc)
      {
        let x = Math.round(fromx < tox ? fromx + (i * x_inc) : fromx - (i * x_inc));
        let y = Math.round(fromy < toy ? fromy + (i * y_inc) : fromy - (i * y_inc));

        context.arc(x, y, radius, 0, 2 * Math.PI, false);
      }

      context.fillStyle = color;
      context.fill();
    }

    let dash_line = function(fromx, fromy, tox, toy, color)
    {
      let x_len = Math.abs(fromx - tox),
          y_len = Math.abs(fromy - toy),
          len = x_len > y_len ? x_len : y_len,
          dash_count = len / (options.border_width * 3 * options.multiplier),
          dash_count_up = Math.ceil(dash_count),
          dash_count_down = Math.floor(dash_count);

      //we need an odd number for dash_count
      if(dash_count_up % 2 !== 0)
      {
        dash_count = dash_count_up;
      }
      else if(dash_count_down % 2 !== 0)
      {
        dash_count = dash_count_down;
      }
      else
      {
        dash_count = dash_count_down + 1;
      }

      dash_count = dash_count < 3 ? 3 : dash_count;

      let x_inc = (x_len / dash_count);
      let y_inc = (y_len / dash_count);

      context.strokeStyle = color;
      context.lineWidth = options.border_width * options.multiplier;
      context.beginPath();

      for(let i = 0; i < dash_count; i++)
      {
        if(i % 2 !== 0) continue;

        let x = Math.round(fromx < tox ? fromx + (i * x_inc) : fromx - (i * x_inc));
        let y = Math.round(fromy < toy ? fromy + (i * y_inc) : fromy - (i * y_inc));

        let x2 = Math.round(fromx < tox ? fromx + ((i + 1) * x_inc) : fromx - ((i + 1) * x_inc));
        let y2 = Math.round(fromy < toy ? fromy + ((i + 1) * y_inc) : fromy - ((i + 1) * y_inc));

        context.moveTo(x, y);
        context.lineTo(x2, y2);

      }

      context.stroke();
    }

    let border = function(tx, ty, bx, by, color) {
        if(options.border_style === 'none' || options.border_width < 1)
        {
          return;
        }

        let half_border = 0;

        if(options.border_width * options.multiplier > 1)
        {
          half_border = (options.border_width * options.multiplier) / 2;
        }

        if(options.border_style === 'solid')
        {
          context.strokeStyle = color;
          context.lineWidth = options.border_width * options.multiplier;

          context.beginPath();

          //top ->
          context.moveTo(tx - half_border, ty);
          context.lineTo(bx + half_border, ty);

          //right V
          context.moveTo(bx, ty);
          context.lineTo(bx, by);

          //<- bottom
          context.moveTo(bx + half_border, by);
          context.lineTo(tx - half_border, by);

          //left ^
          context.moveTo(tx, by);
          context.lineTo(tx, ty);
          context.stroke();
        }
        else if(options.border_style === 'dotted')
        {
          dot_line(tx, ty, bx, ty, color);
          dot_line(bx, ty, bx, by, color);
          dot_line(bx, by, tx, by, color);
          dot_line(tx, by, tx, ty, color);
        }
        else if(options.border_style === 'dashed')
        {
          dash_line(tx - half_border, ty, bx + half_border, ty, color);
          dash_line(bx, ty, bx, by, color);
          dash_line(bx + half_border, by, tx - half_border, by, color);
          dash_line(tx, by, tx, ty, color);
        }
    }

    let letter_spacing = function(text, font_size, width, x, y, color)
    {
      context.font = font_size + 'px "November", monospace';
      context.fillStyle = color;

      if(options.letter_spacing)
      {
        let l_space = (width - ((text.length) * (font_size / 2))) / (text.length)
        let lx = x + (l_space / 2);

        for(let l = 0; l < text.length; l++)
        {
          context.fillText(text[l], lx, y);
          lx = lx + (font_size / 2) + l_space;
        }
      }
      else
      {
        let lx = x + (width - (text.length * (font_size / 2))) / 2;
        context.fillText(text, lx, y);
      }
    }

    if (!context) {
      alert('Your browser does not support canvas.');
      return false;
    }

    let is_valid_size = true;
    let errors = [];
    if(width > this.max_canvas_size.width)
    {
      errors.push('too wide, max width for your browser is ' + this.max_canvas_size.width + 'px, and your canvas is ' + width + 'px')
      is_valid_size = false;
    }

    if(height > this.max_canvas_size.height)
    {
      errors.push('too tall, max width for your browser is ' + this.max_canvas_size.height + 'px, and your canvas is ' + height + 'px')
      is_valid_size = false;
    }

    if(width * height > this.max_canvas_size.area)
    {
      errors.push('too large, max area for your browser is ' + this.max_canvas_size.area + 'px, and your canvas is ' + (width * height) + 'px')
      is_valid_size = false;
    }

    if(!is_valid_size) //because browsers all have different max canvas sizes because why not
    {
      console.log(this.max_canvas_size);
      if(!confirm('Your canvas is: ' + errors.join(', ') + '. Try adjusting some of the settings to fix the issue, or try anyway? (Your browser may freeze.)'))
      {
        return false;
      }
    }

    context.imageSmoothingEnabled = true;
    context.clearRect(0, 0, canvas.width, canvas.height);
    canvas.height = height;
    canvas.width = width;
    context.font = (this.options.font_size * options.multiplier) + 'px "November", monospace';
    context.textBaseline = 'middle';

    if(shadow)
    {
      context.shadowOffsetX = options.shadow_x * options.multiplier;
      context.shadowOffsetY = options.shadow_y * options.multiplier;
      context.shadowBlur = options.shadow_blur * options.multiplier;
      context.shadowColor = "rgba(0, 0, 0, 0)";
    }

    if(options.masonry && options.cols < 1)
    {
      //console.log('generate_image: masonry 0 cols', options);

      let $colors = $('#sizer span.color');
      for(let i = $colors.length - 1; i >= 0; i--) //loop backwards, because that's how layers are ordered
      {
        let elem = $colors[i],
            color = _this.colors[+$(elem).attr('i')],
            txt = $(elem).find('.color_name').text().toUpperCase(),
            font_size = +elem.style['font-size'].replace('px', '') * options.multiplier,
            w = elem.clientWidth * options.multiplier,
            h = elem.clientHeight * options.multiplier,
            p = $(elem).position(),
            margin_top = (elem.style['margin-top'] ? +elem.style['margin-top'].replace('px', '') : 0) * options.multiplier,
            margin_left = (elem.style['margin-left'] ? +elem.style['margin-left'].replace('px', '') : 0) * options.multiplier,
            tx = (p.left * options.multiplier) + margin_left + canvas_margin.left,
            ty = (p.top * options.multiplier) + margin_top + canvas_margin.top;


        if(shadow) context.shadowColor = "rgba(0, 0, 0, 0.5)";
        context.fillStyle = elem.style['background-color'];
        context.fillRect(tx, ty, w, h);
        if(shadow) context.shadowColor = "rgba(0, 0, 0, 0)";
        border(tx, ty, tx + w, ty + h, elem.style['color']);

        let name_x = tx + padding,
            name_y = ty + h - padding - (font_size / 2);

        if(!txt.includes('Q')) //this fucking letter is taller than the rest
        {
          name_y = name_y + (font_size * .0525);
        }

        letter_spacing(
          txt,
          font_size,
          w - (padding * 2),
          name_x,
          name_y,
          elem.style['color']
        );

        let small_font = font_size / 2,
            extra_from_y = ty + padding + small_font,
            extra_to_y = name_y - (padding * 2) - small_font;

        //make extra text above name
        if(extra_to_y - extra_from_y > small_font)
        {
          for(let y = extra_from_y; y < extra_to_y; y = y + small_font + (options.multiplier * 2))
          {
            letter_spacing(
              txt,
              small_font,
              w - (padding * 2),
              name_x,
              y,
              'rgba(' + color.textRGB.join(',') + ',.5)'
            );
          }
        }
        else
        {
          extra_from_y = ty + padding,
          extra_to_y = name_y - (font_size / 2) - (padding * 2),
          small_font = (extra_to_y - extra_from_y) / 2;

          if(small_font > 0)
          {
            letter_spacing(
              txt,
              small_font,
              w - (padding * 2),
              name_x,
              extra_from_y + small_font,
              'rgba(' + color.textRGB.join(',') + ',.5)'
            );
          }
        }
      }
    }
    else
    {
      //console.log('generate_image', options);

      $('#sizer span.color').each(function(i, elem)
      {
        let txt = $(elem).text().toUpperCase(),
            p = $(elem).position(),
            tx = ((p.left + options.margin) * options.multiplier) + canvas_margin.left,
            ty = ((p.top + options.margin) * options.multiplier) + canvas_margin.top,
            w = elem.clientWidth * options.multiplier,
            h = elem.clientHeight * options.multiplier,
            font_size = _this.options.font_size * options.multiplier;

        if(options.masonry)
        {
          font_size = +elem.style['font-size'].replace('px', '') * options.multiplier;
          context.font = font_size + 'px "November", monospace';
        }

        let padding_top = (h - font_size) / 2

        if(!txt.includes('Q')) //this fucking letter is taller than the rest
        {
          padding_top = padding_top + (font_size * .0525);
        }

        context.fillStyle = elem.style['background-color'];
        context.fillRect(tx, ty, w, h);
        border(tx, ty, tx + w, ty + h, elem.style['color']);

        letter_spacing(
          txt,
          font_size,
          w - (padding * 2),
          tx + padding,
          ty + padding_top + (font_size / 2),
          elem.style['color']
        );
      });
    }

    //to show the bottom of the masonry 0 cols
    /*if(this.xy)
    {
      console.log(this.xy);

      context.beginPath();
      context.fillStyle = '#F00';
      for(let i = 0; i < this.xy.length; i++)
      {
        if(i % 2 === 0) continue;
        context.fillRect(this.xy[i][0], this.xy[i][1], 2, 2);
      }
    }*/

    callback(canvas);
  }
}
