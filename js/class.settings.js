class Settings
{

  constructor(settings, options)
  {
    this.options = {...{
      app_name: '',
      local_storage: true
    }, ...options};
    this.settings = settings;

    this.update_settings_timer = null;

    /*
    var settings =
    {
      checkbox: {
        label: 'Checkbox',
        type: 'bool',
        default: true,
        skip_random: true //leave out of rand_settings
      },
      number: {
        label: 'Number',
        type: 'int',
        default: 0,
        min: 0,
        max: 100
      },
      dropdown: {
        label: 'Dropdown',
        type: 'enum',
        values: [
          {val: 'val1', txt: 'Value 1'},
          {val: 'val2', txt: 'Value 2'},
          {val: 'val3', txt: 'Value 3'},
        ],
        default: 'val1',
        on_change: function(val){}
      },
      switch: {
        type: 'bool',
        ui_type: 'switch',
        ui_subtype: 'inside_label',
        default: false
      }
    };
    */

    if(this.options.local_storage)
    {
      let settings_key = 'settings';
      if(this.options.app_name) settings_key = this.options.app_name + '_settings';
      let local_settings = localStorage.getItem(settings_key);

      if(local_settings)
      {
        try {
          this.local_settings = JSON.parse(local_settings);
        }
        catch(e)
        {
          this.local_settings = false;
        }
      }
    }
  }

  update_settings()
  {
    if(this.options.local_storage)
    {
      let _this = this;
      clearTimeout(this.update_settings_timer);
      this.update_settings_timer = setTimeout(function()
      {
        let settings_key = 'settings';
        if(_this.options.app_name) settings_key = _this.options.app_name + '_settings';
        let vals = _this.get_settings();
        _this.local_settings = vals;
        localStorage.setItem(settings_key, JSON.stringify(vals));
      }, 1000);
    }
  }

  //call on document ready
  build_settings($settings, set)
  {
    let _this = this;
    this.$settings = $settings;
    $settings.empty();
    set = set || {};

    for(let key in this.settings)
    {
      if(this.local_settings && this.local_settings[key] !== undefined)
      {
        this.settings[key].value = set[key] !== undefined ? set[key] : this.local_settings[key];
      }
      else
      {
        this.settings[key].value = set[key] !== undefined ? set[key] : this.settings[key].default;
      }

      let $label = $('<label>'), $set;

      if(this.settings[key].type === 'enum')
      {
        $label.attr('for', key).text(this.settings[key].label + ':');
        $set = $('<select></select>').attr('id', key);

        if(this.settings[key].values && this.settings[key].values.length)
        {
          for(let i = 0; i < this.settings[key].values.length; i++)
          {
            $set.append('<option value="' + this.settings[key].values[i].val + '">' + this.settings[key].values[i].txt + '</option>');
          }
        }

        $set.val(this.settings[key].value);
      }
      else
      {
        $set = $('<input>').attr('id', key);
        $label.attr('for', key);

        if(this.settings[key].label) $label.text(this.settings[key].label + ': ');

        if(this.settings[key].type === 'int')
        {
          $set.attr('type', 'number');
          if(this.settings[key].min) $set.attr('min', this.settings[key].min);
          if(this.settings[key].max) $set.attr('max', this.settings[key].max);

          $set.val(this.settings[key].value);
        }
        else if(this.settings[key].type === 'bool')
        {
          $set.attr('type', 'checkbox');
          $set.prop('checked', this.settings[key].value);

          if(this.settings[key].ui_type === 'switch')
          {
            $label.attr('id', key + '_switch').addClass('switch');
            this.settings[key].add_after = '<span class="slider"></span>';
            if(this.settings[key].ui_subtype) $label.addClass(this.settings[key].ui_subtype);
          }
        }
      }

      $set.on('change.input_change', function()
      {
        let id = $(this).attr('id');
        let val = $(this).val();
        if(_this.settings[id].type === 'bool')
        {
          val = $(this).prop('checked');
        }

        _this.settings[id].value = val;
        if(_this.settings[id].on_change) _this.settings[id].on_change(val);
        _this.update_settings();
      })

      $label.append($set);
      if(this.settings[key].add_after) $label.append(this.settings[key].add_after);

      $settings.append($label);
    }

    for(let key in this.settings)
    {
      if(this.settings[key].on_change) $settings.find('#' + key).change();
    }

    _this.update_settings();
  }

  reset_to_default()
  {
    if(this.options.local_storage)
    {
      let settings_key = 'settings';
      if(this.options.app_name) settings_key = this.options.app_name + '_settings';
      localStorage.removeItem(settings_key);
    }

    for(let key in this.settings)
    {
      this.settings[key].value = this.settings[key].default;
      if(this.settings[key].on_change) this.$settings.find('#' + key).change();
    }
  }

  enable(field)
  {
    this.$settings.find('#' + field).removeAttr('disabled')
      .parent().removeAttr('disabled');
    this.settings[field].disable = false;
  }

  disable(field)
  {
    this.$settings.find('#' + field).attr('disabled', 'disabled')
      .parent().attr('disabled','disable');
    this.settings[field].disable = true;
  }

  get_settings(override)
  {
    let vals = {};
    for(let key in this.settings)
    {
      vals[key] = this.settings[key].value;
    }

    return {...vals, ...override};
  }

  rand_settings(override)
  {
    let vals = {};
    for(let key in this.settings)
    {
      if(this.settings[key].skip_random) continue;

      if(this.settings[key].type === 'bool')
      {
        vals[key] = Math.round(Math.random() * 1) ? true : false;
      }
      else if(this.settings[key].type === 'int')
      {
        vals[key] = Math.round((Math.random() * this.settings[key].max) + this.settings[key].min);
      }
      else if(this.settings[key].type === 'enum' && this.settings[key].values.length)
      {
        let rand_val = Math.round(Math.random() * (this.settings[key].values.length - 1));
        if(!this.settings[key].values[rand_val])
        {
          console.error(this.settings[key].values, rand_val);
        }
        else
        {
          vals[key] = this.settings[key].values[rand_val].val;
        }
      }
    }

    for(let key in vals)
    {
      if(this.$settings.find('#' + key).attr('type') === 'checkbox')
      {
        this.$settings.find('#' + key).prop('checked', vals[key] ? true : false);
      }
      else
      {
        this.$settings.find('#' + key).val(vals[key]);
      }

      if(this.settings[key].on_change)
      {
        this.$settings.find('#' + key).change();
      }
    }

    return {...vals, ...override};
  }
}
