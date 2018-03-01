/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext*/

/**
 * Console helper.
 *
 * @since 3.0
 */
Ext.define('NX.Console', {
  singleton: true,

  /**
   * @private
   */
  console: undefined,

  /**
   * Disable all application console output.
   *
   * @public
   * @property {Boolean}
   */
  disable: false,

  /**
   * Set to true to enable console 'trace'.
   *
   * @public
   * @property {Boolean}
   */
  traceEnabled: false,

  /**
   * Set to false to disable console 'debug'.
   *
   * @public
   * @property {Boolean}
   */
  debugEnabled: true,

  /**
   * Set up the console environment.
   */
  constructor: function () {
    this.console = NX.global.console || {};

    // apply default empty functions to console if missing
    Ext.applyIf(this.console, {
      log: Ext.emptyFn,
      info: Ext.emptyFn,
      warn: Ext.emptyFn,
      error: Ext.emptyFn
    });

    // use ?debug to enable
    this.debugEnabled = NX.global.location.href.search("[?&]debug") > -1;

    // use ?debug&trace to enable
    this.traceEnabled = NX.global.location.href.search("[?&]trace") > -1;
  },

  /**
   * Output a message to console at given level.
   *
   * @public
   * @param {String} level
   * @param {Array} args
   */
  log: function (level, args) {
    var c = this.console;
    switch (level) {
      case 'trace':
        if (this.traceEnabled) {
          c.log.apply(c, args);
        }
        break;

      case 'debug':
        if (this.debugEnabled) {
          c.log.apply(c, args);
        }
        break;

      case 'info':
        c.info.apply(c, args);
        break;

      case 'warn':
        c.warn.apply(c, args);
        break;

      case 'error':
        c.error.apply(c, args);
        break;
    }
  },

  /**
   * Outputs a trace message.
   *
   * @public
   * @param {String/Object/Array} message
   */
  trace: function() {
    this.log('trace', Array.prototype.slice.call(arguments));
  },

  /**
   * Outputs a debug message.
   *
   * @public
   * @param {String/Object/Array} message
   */
  debug: function () {
    this.log('debug', Array.prototype.slice.call(arguments));
  },

  /**
   * Outputs an info message.
   *
   * @public
   * @param {String/Object/Array} message
   */
  info: function () {
    this.log('info', Array.prototype.slice.call(arguments));
  },

  /**
   * Outputs a warn message.
   *
   * @public
   * @param {String/Object/Array} message
   */
  warn: function () {
    this.log('warn', Array.prototype.slice.call(arguments));
  },

  /**
   * Outputs an error message.
   *
   * @public
   * @param {String/Object/Array} message
   */
  error: function () {
    this.log('error', Array.prototype.slice.call(arguments));
  },

  /**
   * Helper to record event details to console.
   *
   * @internal
   * @param event
   */
  recordEvent: function(event) {
    this.log(event.level, [event.level, event.logger, event.message.join(' ')]);
  }
});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext*/

/**
 * Global logging helper.
 *
 * @since 3.0
 */
Ext.define('NX.Log', {
  singleton: true,
  requires: [
    'NX.Console'
  ],

  /**
   * Reference to attached logging controller.
   *
   * @private
   * @property {NX.controller.Logging}
   */
  controller: undefined,

  /**
   * Queue of events logged before controller is attached.
   * This is deleted upon attachment after events are passed to the controller.
   *
   * @private
   */
  eventQueue: [],

  /**
   * Attach to the logging controller.
   *
   * @internal
   * @param {NX.controller.Logging} controller
   */
  attach: function (controller) {
    var me = this;
    me.controller = controller;

    // reply queued events and clear
    Ext.each(me.eventQueue, function (event) {
      me.controller.recordEvent(event);
    });
    delete me.eventQueue;
  },

  /**
   * Record a log event.
   *
   * @public
   * @param {String} level
   * @param {String} logger
   * @param {String/Array} message
   */
  recordEvent: function (level, logger, message) {
    var me = this,
        event = {
          timestamp: Date.now(),
          level: level,
          logger: logger,
          message: message
        };

    // if controller is attached, delegate to record the event
    if (me.controller) {
      me.controller.recordEvent(event);
    }
    else {
      // else queue the event and emit to console
      me.eventQueue.push(event);
      NX.Console.recordEvent(event);
    }
  }
});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext, NX*/

/**
 * Adds logging support helpers to objects.
 *
 * @since 3.0
 */
Ext.define('NX.LogAware', {
  requires: [
    'NX.Log'
  ],

  /**
   * Log a message at the given level.
   *
   * @param {String} level
   * @param {Array} args
   */
  log: function (level, args) {
    //<if debug>
//    NX.Log.recordEvent(level, Ext.getClassName(this), args);
    //</if>
  },

  /**
   * Log a trace message.
   *
   * @public
   * @param {String/Object/Array} message
   */
  logTrace: function () {
    //<if debug>
//    this.log('trace', Array.prototype.slice.call(arguments));
    //</if>
  },

  /**
   * Log a debug message.
   *
   * @public
   * @param {String/Object/Array} message
   */
  logDebug: function () {
    //<if debug>
//    this.log('debug', Array.prototype.slice.call(arguments));
    //</if>
  },

  /**
   * Log an info message.
   *
   * @public
   * @param {String/Object/Array} message
   */
  logInfo: function () {
    //<if debug>
//    this.log('info', Array.prototype.slice.call(arguments));
    //</if>
  },

  /**
   * Log a warn message.
   *
   * @public
   * @param {String/Object/Array} message
   */
  logWarn: function () {
    //<if debug>
//    this.log('warn', Array.prototype.slice.call(arguments));
    //</if>
  },

  /**
   * Log an error message.
   *
   * @public
   * @param {String/Object/Array} message
   */
  logError: function () {
    //<if debug>
//    this.log('error', Array.prototype.slice.call(arguments));
    //</if>
  }
});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext, NX*/

/**
 * I18n helper.
 *
 * @since 3.0
 */
Ext.define('NX.I18n', {
  singleton: true,
  mixins: {
    logAware: 'NX.LogAware'
  },

  /**
   * @private
   * @property {Object}
   */
  keys: {},

  /**
   * @private
   * @property {Object}
   */
  bundles: {},

  /**
   * @public
   * @param {Object} strings
   */
  register: function (strings) {
    Ext.apply(this.keys, strings.keys);
    Ext.apply(this.bundles, strings.bundles);
  },

  /**
   * Resolves a string from a key.
   *
   * If the key begins with '@' then the remainder is assumed to be a reference to another key and will be resolved.
   *
   * @public
   * @param {String} key
   */
  get: function (key) {
    var text = this.keys[key];
    if (text === null || text === undefined) {
      this.logWarn('Missing I18n key:', key);
      return 'MISSING_I18N:' + key;
    }
    // resolve references
    if (text.charAt(0) === '@') {
      return this.get(text.substring(1, text.length));
    }
    else {
      return text;
    }
  },

  /**
   * @public
   * @param {String} key
   * @param {Object...} values
   * @returns {String}
   */
  format: function (key) {
    var text = this.get(key);
    if (text) {
      var params = Array.prototype.slice.call(arguments);
      // replace first element with text
      params.shift();
      params.unshift(text);
      text = Ext.String.format.apply(this, params);
    }
    return text;
  },

  /**
   * Render a bundle string.
   *
   * @param {Object/String} bundle
   * @param {String} key
   * @param {Object...} [params]
   * @returns {String}
   */
  render: function (bundle, key) {
    var resources, text, params;

    // resolve bundle
    if (Ext.isObject(bundle)) {
      bundle = Ext.getClassName(bundle);
    }

    //<if debug>
//    this.logTrace('Resolving bundle:', bundle, 'key:', key);
    //</if>

    resources = this.bundles[bundle];
    if (resources === undefined) {
      this.logWarn('Missing I18n bundle:', bundle);
      return 'MISSING_I18N:' + bundle + ':' + key;
    }

    // resolve text
    text = resources[key];
    if (text === undefined) {
      // handle bundle extension
      var extend = resources['$extend'];
      if (extend !== undefined) {
        params = Array.prototype.slice.call(arguments, 1);
        params.unshift(extend);
        return this.render.apply(this, params);
      }

      this.logWarn('Missing I18n bundle key:', bundle, ':', key);
      return 'MISSING_I18N:' + bundle + ':' + key;
    }

    // resolve references
    if (text.charAt(0) === '@') {
      if (text.indexOf(':') !== -1) {
        // bundle ref <bundle>:[key]
        var items = text.substring(1, text.length).split(':', 2);

        // default to given key if ref missing key
        if (items[1] === '') {
          items[1] = key;
        }

        params = Array.prototype.slice.call(arguments, 2);
        params.unshift(items[1]);
        params.unshift(items[0]);
        return this.render.apply(this, params);
      }
      else {
        // key ref <key>
        text = this.get(text.substring(1, text.length));
      }
    }

    // optionally format with parameters
    if (arguments.length > 2) {
      params = Array.prototype.slice.call(arguments, 2);
      params.unshift(text);
      text = Ext.String.format.apply(this, params);
    }

    return text;
  }
});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext, NX*/

/**
 * Application strings
 *
 * @since 3.0
 */
Ext.define('NX.app.PluginStrings', {
  '@aggregate_priority': 90,

  singleton: true,

  requires: [
    'NX.I18n'
  ],

  //
  // Note: Symbols follow the following naming convention:
  // <Class>_<Name>_<Component or Attribute>
  //

  keys: {
    // Buttons
    Button_Back: 'Back',
    Button_Cancel: 'Cancel',
    Button_Close: 'Close',
    Button_Create: 'Create',
    Button_Discard: 'Discard',
    Button_Next: 'Next',
    Button_Save: 'Save',

    // Header
    Header_Panel_Logo_Text: 'Nexus Repository Manager',
    Header_BrowseMode_Title: 'Browse',
    Header_BrowseMode_Tooltip: 'Browse server contents',
    Header_AdminMode_Title: 'Administration',
    Header_AdminMode_Tooltip: 'Server administration and configuration',
    Header_QuickSearch_Empty: 'Search components',
    Header_QuickSearch_Tooltip: 'Quick component keyword search',
    Header_Refresh_Tooltip: 'Refresh current view and data',
    Refresh_Message: 'Refreshed',
    Header_UserMode_Title: 'User',
    User_Tooltip: 'Hi, {0}. Manage your user account.',
    Header_SignIn_Text: 'Sign in',
    Header_SignIn_Tooltip: 'Sign in',
    Header_SignOut_Text: 'Sign out',
    Header_SignOut_Tooltip: 'Sign out',
    Header_Help_Tooltip: 'Help',
    Help_Feature_Text: 'Help for: ',
    Header_Help_Feature_Tooltip: 'Help and documentation for the currently selected feature',
    Header_Help_About_Text: 'About',
    Header_Help_About_Tooltip: 'About Nexus Repository Manager',
    Header_Help_Documentation_Text: 'Documentation',
    Header_Help_Documentation_Tooltip: 'Product documentation',
    Header_Help_KB_Text: 'Knowledge base',
    Header_Help_KB_Tooltip: 'Knowledge base',
    Header_Help_Community_Text: 'Community',
    Header_Help_Community_Tooltip: 'Community information',
    Header_Help_Issues_Text: 'Issue tracker',
    Header_Help_Issues_Tooltip: 'Issue and bug tracker',
    Header_Help_Support_Text: 'Support',
    Header_Help_Support_Tooltip: 'Product support',

    // Footer
    Footer_Panel_HTML: 'Copyright &copy; 2008-present, Sonatype Inc. All rights reserved.',

    // Sign in
    SignIn_Title: 'Sign In',
    User_SignIn_Mask: 'Signing in&hellip;',
    SignIn_Username_Empty: 'Username',
    SignIn_Password_Empty: 'Password',
    SignIn_Submit_Button: 'Sign in',
    SignIn_Cancel_Button: '@Button_Cancel',

    // Filter box
    Grid_Plugin_FilterBox_Empty: 'Filter',

    // Dialogs
    Dialogs_Info_Title: 'Information',
    Dialogs_Error_Title: 'Error',
    Dialogs_Error_Message: 'Operation failed',
    Add_Submit_Button: '@Button_Create',
    Add_Cancel_Button: '@Button_Cancel',
    ChangeOrderWindow_Submit_Button: '@Button_Save',
    ChangeOrderWindow_Cancel_Button: '@Button_Cancel',

    // Server
    User_ConnectFailure_Message: 'Operation failed as server could not be contacted',
    State_Reconnected_Message: 'Server reconnected',
    State_Disconnected_Message: 'Server disconnected',
    UiSessionTimeout_Expire_Message: 'Session is about to expire',
    UiSessionTimeout_Expired_Message: 'Session expired after being inactive for {0} minutes',
    User_SignedIn_Message: 'User signed in: {0}',
    User_SignedOut_Message: 'User signed out',
    User_Credentials_Message: 'Incorrect username or password, or no permission to use the application.',
    Util_DownloadHelper_Download_Message: 'Download initiated',
    Windows_Popup_Message: 'Window pop-up was blocked!',

    // License
    State_Installed_Message: 'License installed',
    State_Uninstalled_Message: 'License uninstalled',
    State_License_Expiry: 'Your license will expire in {0} days. <a href="http://links.sonatype.com/products/nexus/pro/store">Contact us to renew.</a>',
    State_License_Expired: 'Your license has expired. <a href="http://links.sonatype.com/products/nexus/pro/store">Contact us to renew.</a>',
    State_License_Invalid_Message: 'Your license has been detected as missing or invalid. Upload a valid license to proceed.',

    // About modal
    AboutWindow_Title: 'About Nexus Repository Manager',
    AboutWindow_About_Title: 'Copyright',
    AboutWindow_License_Tab: 'License',

    // Authentication modal
    Authenticate_Title: 'Authenticate',
    Authenticate_Help_Text: 'You have requested an operation which requires validation of your credentials.',
    User_Controller_Authenticate_Mask: 'Authenticate&hellip;',
    User_View_Authenticate_Submit_Button: 'Authenticate',
    User_Retrieving_Mask: 'Retrieving authentication token&hellip;',
    Authenticate_Cancel_Button: '@Button_Cancel',

    // Expiry modal
    ExpireSession_Title: 'Session',
    ExpireSession_Help_Text: 'Session is about to expire',
    UiSessionTimeout_Expire_Text: 'Session will expire in {0} seconds',
    SignedOut_Text: 'Your session has expired. Please sign in.',
    ExpireSession_Cancel_Button: '@Button_Cancel',
    ExpireSession_SignIn_Button: 'Sign in',

    // Unsaved changes modal
    UnsavedChanges_Title: 'Unsaved changes',
    UnsavedChanges_Help_HTML: '<p>Do you want to discard your changes?</p>',
    UnsavedChanges_Discard_Button: 'Discard changes',
    UnsavedChanges_Back_Button: 'Go back',
    Menu_Browser_Title: 'You will lose your unsaved changes',

    // Unsupported browser
    UnsupportedBrowser_Title: 'The browser you are using is not supported',
    UnsupportedBrowser_Alternatives_Text: 'Below is a list of alternatives that are supported by this web application',
    UnsupportedBrowser_Continue_Button: 'Ignore and continue',

    // 404
    Feature_NotFoundPath_Text: 'Path "{0}" not found',
    Feature_NotFound_Text: 'Path not found',

    // Buttons
    SettingsForm_Save_Button: '@Button_Save',
    SettingsForm_Discard_Button: '@Button_Discard',
    Ldap_LdapServerConnectionAdd_Text: '@Button_Next',

    // Item selector
    Form_Field_ItemSelector_Empty: 'Filter',

    // Settings form
    SettingsForm_Load_Message: 'Loading',
    SettingsForm_Submit_Message: 'Saving',

    // Browse -> Welcome
    Dashboard_Title: 'Welcome',
    Dashboard_Description: 'Welcome to Nexus Repository Manager!',

    // Field validation messages
    Util_Validator_Text: 'Only letters, digits, underscores(_), hyphens(-), and dots(.) are allowed and may not start with underscore or dot.',
    Util_Validator_Hostname: 'Hostname must be valid',

    // Wizard
    Wizard_Next: '@Button_Next',
    Wizard_Back: '@Button_Back',
    Wizard_Cancel: '@Button_Cancel',
    Wizard_Screen_Progress: '{0} of {1}'
  }
}, function(obj) {
  NX.I18n.register(obj);
});


/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext, NX*/

/**
 * Core plugin configuration.
 *
 * @since 3.0
 */
Ext.define('NX.app.PluginConfig', {
  '@aggregate_priority': 100,

  requires: [
    'NX.app.PluginStrings'
  ],

  controllers: [
    'Content',
    'Dashboard',
    'Help',
    'Main',
    'Menu',
    'MenuGroup',
    'Refresh',
    'SettingsForm',
    'UiSessionTimeout',
    'User',

    {
      id: 'Branding',
      // branding is active in also when we are unlicensed or browser is not supported
      active: true
    },
    {
      id: 'Unlicensed',
      active: function () {
        return NX.app.Application.supportedBrowser() &&
            (NX.app.Application.unlicensed() || NX.app.Application.licenseExpired());
      }
    },
    {
      id: 'UnsupportedBrowser',
      active: function () {
        return NX.app.Application.unsupportedBrowser();
      }
    },

    // dev controllers (visible when ?debug and rapture capability debugAllowed = true)
    {
      id: 'dev.Conditions',
      active: function () {
        return NX.app.Application.debugMode;
      }
    },
    {
      id: 'dev.Developer',
      active: function () {
        return NX.app.Application.debugMode;
      }
    },
    {
      id: 'dev.Permissions',
      active: function () {
        return NX.app.Application.debugMode;
      }
    },
    {
      id: 'dev.Stores',
      active: function () {
        return NX.app.Application.debugMode;
      }
    },
    {
      id: 'dev.Logging',
      active: function () {
        return NX.app.Application.debugMode;
      }
    }
  ]
});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext*/

/**
 * Validation helpers.
 *
 * @since 3.0
 */
Ext.define('NX.util.Validator', {
  singleton: true,
  requires: [
      'Ext.form.field.VTypes',
      'NX.I18n'
  ],

  /**
   * @private
   */
  default_url_options: {
    protocols: ['http', 'https', 'ftp'],
    require_tld: false,
    require_protocol: false,
    allow_underscores: false
  },

  /**
   * @private
   */
  nxNameRegex : /^[a-zA-Z0-9\-]{1}[a-zA-Z0-9_\-\.]*$/,

  /**
   * Removes the constraint for a maximum of 6 characters in the last element of the domain name, otherwise
   * is the same as default ExtJS email vtype.
   * @private
   */
  nxEmailRegex : /^(")?(?:[^\."])(?:(?:[\.])?(?:[\w\-!#$%&'*+/=?^_`{|}~]))*\1@(\w[\-\w]*\.){1,5}([A-Za-z]){2,60}$/,

  /**
   * A regular expression to detect a valid hostname according to RFC 1123.
   * See also http-headers-patterns.properties and HostnameValidator.java for other uses of this regex.
   * @private
   */
  nxRfc1123HostRegex: new RegExp(
    "^(((([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]))|" +
     "(\\[(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}\\])|" +
     "(\\[((?:[0-9A-Fa-f]{1,4}(?::[0-9A-Fa-f]{1,4})*)?)::((?:[0-9A-Fa-f]{1,4}(?::[0-9A-Fa-f]{1,4})*)?)\\])|" +
     "(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\\-]*[a-zA-Z0-9])\\.)*([A-Za-z0-9]|" +
     "[A-Za-z0-9][A-Za-z0-9\\-]*[A-Za-z0-9]))(:([0-9]+))?$"
  ),

  /**
   * @public
   * @param vtype {object}
   */
  registerVtype: function(vtype) {
    Ext.apply(Ext.form.field.VTypes, vtype);
  },

  constructor: function () {
    var me = this;

    me.vtypes = [
      {
        'nx-name': function(val) {
          return NX.util.Validator.nxNameRegex.test(val);
        },
        'nx-nameText': NX.I18n.get('Util_Validator_Text'),
        'nx-email': function(val) {
          return NX.util.Validator.nxEmailRegex.test(val);
        },
        'nx-emailText': Ext.form.field.VTypes.emailText,
        'nx-hostname': function(val) {
          return NX.util.Validator.nxRfc1123HostRegex.test(val);
        },
        'nx-hostnameText': NX.I18n.get('Util_Validator_Hostname')
      }
    ];

    Ext.each(me.vtypes, function(vtype) {
      me.registerVtype(vtype);
    });
  },

  /**
   * Validate if given string is a URL.
   * Based on: https://github.com/chriso/validator.js (MIT license)
   *
   * @public
   * @param {String} str
   * @param {Object} options (optional)
   * @returns {boolean}
   */
  isURL: function (str, options) {

    // Apply options
    options = options || {};
    options = Ext.applyIf(options, this.default_url_options);

    // Short-circuit when empty
    if (Ext.isEmpty(str)) {
      return options.allow_blank;
    }

    // Ensure that the URL is of proper length
    if (str.length >= 2083) {
      return false;
    }

    // Check the URL syntax
    var separators = '-?-?' + (options.allow_underscores ? '_?' : '');
    var url = new RegExp('^(?!mailto:)(?:(?:' + options.protocols.join('|') + ')://)' +
        (options.require_protocol ? '' : '?') +
        '(?:\\S+(?::\\S*)?@)?(?:(?:(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}(?:\\.(?:[0-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))|(?:(?:www.)?)?(?:(?:[a-z\\u00a1-\\uffff0-9]+' +
        separators + ')*[a-z\\u00a1-\\uffff0-9]+)(?:\\.(?:[a-z\\u00a1-\\uffff0-9]+' + separators +
        ')*[a-z\\u00a1-\\uffff0-9]+)*(?:\\.(?:[a-z\\u00a1-\\uffff]{1,}))' + (options.require_tld ? '' : '?') +
        ')|localhost)(?::(\\d{1,5}))?(?:(?:/|\\?|#)[^\\s]*)?$', 'i');
    var match = str.match(url),
        port = match ? match[1] : 0;

    return !!(match && (!port || (port > 0 && port <= 65535)));
  }

});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext, NX*/

/**
 * An URL **{@link Ext.form.field.Text}**.
 *
 * @since 3.0
 */
Ext.define('NX.ext.form.field.Url', {
  extend: 'Ext.form.field.Text',
  alias: 'widget.nx-url',
  requires: [ 'NX.util.Validator' ],

  validator: function (value) {
    var valid = NX.util.Validator.isURL(value, {
      protocols: ['http', 'https'],
      require_protocol: true,
      allow_underscores: true,
      allow_blank: this.allowBlank
    });

    if (valid || isHandledByBlankValidation(value)) {
      return true;
    }

    function isHandledByBlankValidation(value) {
      return (Ext.isEmpty(value) && !this.allowBlank);
    }

    return 'This field should be a URL in the format "http:/' + '/www.example.com"';
  },

  useTrustStore: function (field) {
    if (Ext.String.startsWith(field.getValue(), 'https://')) {
      return {
        name: 'useTrustStoreFor' + Ext.String.capitalize(field.getName()),
        url: field
      };
    }
    return undefined;
  }

});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext, NX*/

/**
 * Date format related utils.
 *
 * @since 3.0
 */
Ext.define('NX.util.DateFormat', {
  singleton: true,

  mixins: [
    'NX.LogAware'
  ],

  /**
   * @private
   */
  defaultPatterns: {
    date: {
      // 2013-Mar-06
      'short': 'Y-M-d',

      // Wednesday, March 06, 2013
      'long': 'l, F d, Y'
    },

    time: {
      // 15:49:57
      'short': 'H:i:s',

      // 15:49:57-0700 PST (GMT-0700)
      'long': 'H:i:s T (\\G\\M\\TO)'
    },

    datetime: {
      // 2013-Mar-06 15:49:57
      'short': 'Y-M-d H:i:s',

      // Wednesday, March 06, 2013 15:50:19 PDT (GMT-0700)
      'long': 'l, F d, Y H:i:s T (\\G\\M\\TO)'
    }
  },

  /**
   * Return the date format object for the given name.
   *
   * Date format objects currently have a 'short' and 'long' variants.
   *
   *      @example
   *      var longDatetimePattern = NX.util.DateFormat.forName('datetime')['long'];
   *      var shortDatePattern = NX.util.DateFormat.forName('date')['short'];
   *
   * @public
   * @param name
   * @return {*} Date format object.
   */
  forName: function (name) {
    var format = this.defaultPatterns[name];

    // if no format, complain and return the full ISO-8601 format
    if (!name) {
      this.logWarn('Missing named format:', name);
      return 'c';
    }

    // TODO: Eventually let this customizable by user, for now its hardcoded

    return format;
  },

  /**
   * Formats the passed timestamp using the specified format pattern.
   *
   * @public
   * @param {Number} value The value to format converted to a date by the Javascript's built-in Date#parse method.
   * @param {String} [format] Any valid date format string. Defaults to {@link Ext.Date#defaultFormat}.
   * @return {String} The formatted date string
   */
  timestamp: function (value, format) {
    format = format || NX.util.DateFormat.forName('datetime')['long'];
    return value ? Ext.util.Format.date(new Date(value), format) : undefined;
  },

  /**
   * Returns a timestamp rendering function that can be reused to apply a date format multiple times efficiently.
   *
   * @public
   * @param {String} format Any valid date format string. Defaults to {@link Ext.Date#defaultFormat}.
   * @return {Function} The date formatting function
   */
  timestampRenderer: function (format) {
    return function (value) {
      return NX.util.DateFormat.timestamp(value, format);
    };
  },

  /**
   * @public
   * @returns {String} time zone
   */
  getTimeZone: function () {
    var me = this;

    if (!me.timeZone) {
      me.timeZone = new Date().toTimeString();
      me.timeZone = me.timeZone.substring(me.timeZone.indexOf(" "));
    }

    return me.timeZone;
  }

});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext, NX*/

/**
 * Wizard screen.
 *
 * @since 3.0
 * @abstract
 */
Ext.define('NX.wizard.Screen', {
  extend: 'Ext.container.Container',
  alias: 'widget.nx-wizard-screen',
  requires: [
    'NX.I18n'
  ],
  mixins: {
    logAware: 'NX.LogAware'
  },

  config: {
    /**
     * @cfg {String}
     */
    title: undefined,

    /**
     * @cfg {String}
     */
    description: undefined,

    /**
     * @cfg {String[]/Object[]}
     */
    buttons: undefined,

    /**
     * @cfg {Object[]}
     */
    fields: undefined
  },

  layout: 'fit',

  /**
   * @override
   */
  initComponent: function () {
    var me = this,
        items = [],
        buttons = [];

    // NOTE: title is handled by controller, rendered in NX.wizard.Panel, arguably should be part of step not screen

    // add optional description
    if (me.description) {
      items.push({
        xtype: 'container',
        itemId: 'description',
        html: me.description
      });
    }

    // add optional form fields
    if (me.fields) {
      Ext.Array.push(items, me.fields);
    }

    // add optional buttons
    if (me.buttons) {
      Ext.Array.each(me.buttons, function (button) {
        if (button === 'next') {
          buttons.push({
            text: NX.I18n.get('Wizard_Next'),
            action: 'next',
            ui: 'nx-primary',
            formBind: true
          });
        }
        else if (button === 'back') {
          buttons.push({
            text: NX.I18n.get('Wizard_Back'),
            action: 'back',
            ui: 'default'
          });
        }
        else if (button === 'cancel') {
          buttons.push({
            text: NX.I18n.get('Wizard_Cancel'),
            action: 'cancel',
            ui: 'default'
          })
        }
        else if (Ext.isObject(button)) {
          // custom button configuration
          buttons.push(button);
        }
        else {
          me.logWarn('Invalid button:', button);
        }
      });
    }

    Ext.apply(me, {
      items: {
        xtype: 'form',
        itemId: 'fields',
        items: items,
        buttonAlign: 'left',
        buttons: buttons
      }
    });

    me.callParent(arguments);
  },

  /**
   * @returns {Ext.container.Container}
   */
  getDescriptionContainer: function() {
    return this.down('#description');
  },

  /**
   * @return {Ext.toolbar.Toolbar}
   */
  getButtonsContainer: function() {
    return this.down('form').getDockedItems('toolbar[dock="bottom"]')[0];
  }
});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext, NX*/

/**
 * Wizard form screen.
 *
 * @since 3.0
 * @abstract
 */
Ext.define('NX.wizard.FormScreen', {
  extend: 'NX.wizard.Screen',
  alias: 'widget.nx-wizard-formscreen',

  /**
   * Returns the screen form.
   *
   * @return {Ext.form.Basic}
   */
  getForm: function() {
    return this.down('form').getForm();
  }
});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext, NX*/

/**
 * Nexus managed controller.
 *
 * @since 3.0
 * @see NX.app.Application#syncManagedControllers
 */
Ext.define('NX.app.Controller', {
  extend: 'Ext.app.Controller',
  mixins: {
    logAware: 'NX.LogAware'
  },

  /**
   * Event fired when a controller is being destroyed.
   *
   * @event destroy
   * @param {NX.app.Controller} controller  The controller being destroyed.
   */

  /**
   * Optional callback to invoke when a controller is being destroyed.
   *
   * @protected
   * @property {Function}
   */
  onDestroy: undefined,

  /**
   * Optional callback to invoke when a controller has fully destroyed.
   *
   * @protected
   * @property {Function}
   */
  destroy: undefined
});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext*/

/**
 * Custom modal dialog window.
 *
 * @since 3.0
 */
Ext.define('NX.view.ModalDialog', {
  extend: 'Ext.window.Window',
  alias: 'widget.nx-modal-dialog',

  layout: 'fit',
  autoShow: true,
  modal: true,
  constrain: true,
  closable: true,
  resizable: false,

  // Standard modal widths
  statics: {
    SMALL_MODAL: 320,
    MEDIUM_MODAL: 480,
    LARGE_MODAL: 640
  }
});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext*/

/**
 * Sign-in window.
 *
 * @since 3.0
 */
Ext.define('NX.view.SignIn', {
  extend: 'NX.view.ModalDialog',
  alias: 'widget.nx-signin',
  requires: [
    'NX.I18n'
  ],

  /**
   * @override
   */
  initComponent: function () {
    var me = this;

    me.ui = 'nx-inset';
    me.title = NX.I18n.get('SignIn_Title');
    me.defaultFocus = 'username';

    me.setWidth(NX.view.ModalDialog.SMALL_MODAL);

    Ext.apply(me, {
      items: {
        xtype: 'form',
        defaultType: 'textfield',
        defaults: {
          anchor: '100%'
        },
        items: [
          {
            name: 'username',
            itemId: 'username',
            emptyText: NX.I18n.get('SignIn_Username_Empty'),
            allowBlank: false,
            // allow cancel to be clicked w/o validating this to be non-blank
            validateOnBlur: false
          },
          {
            name: 'password',
            itemId: 'password',
            inputType: 'password',
            emptyText: NX.I18n.get('SignIn_Password_Empty'),
            allowBlank: false,
            // allow cancel to be clicked w/o validating this to be non-blank
            validateOnBlur: false
          }
        ],

        buttonAlign: 'left',
        buttons: [
          { text: NX.I18n.get('SignIn_Submit_Button'), action: 'signin', formBind: true, bindToEnter: true, ui: 'nx-primary' },
          { text: NX.I18n.get('SignIn_Cancel_Button'), handler: me.close, scope: me }
        ]
      }
    });

    me.callParent();
  }

});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext*/

/**
 * Sign-out button.
 *
 * @since 3.0
 */
Ext.define('NX.view.header.SignOut', {
  extend: 'Ext.button.Button',
  alias: 'widget.nx-header-signout',
  requires: [
    'NX.I18n'
  ],

  /**
   * @override
   */
  initComponent: function() {
    Ext.apply(this, {
      text: NX.I18n.get('Header_SignOut_Text'),
      tooltip: NX.I18n.get('Header_SignOut_Tooltip'),
      glyph: 'xf08b@FontAwesome', // fa-sign-out
      hidden: true
    });

    this.callParent();
  }

});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext, NX*/

/**
 * URL related utils.
 *
 * @since 3.0
 */
Ext.define('NX.util.Url', {
  singleton: true,
  requires: [
    'Ext.String'
  ],

  /**
   * Returns the base URL of the Nexus server.  URL never ends with '/'.
   *
   * @public
   * @property {String}
   * @readonly
   */
  baseUrl: NX.app.baseUrl,

  /**
   * Returns a cache-busting urlSuffix provided by the Nexus server.
   *
   * @public
   * @property {String}
   * @readonly
   */
  urlSuffix: NX.app.urlSuffix,

  /**
   * @public
   */
  urlOf: function (path) {
    var baseUrl = this.baseUrl;

    if (!Ext.isEmpty(path)) {
      if (Ext.String.endsWith(baseUrl, '/')) {
        baseUrl = baseUrl.substring(0, baseUrl.length - 1);
      }
      if (!Ext.String.startsWith(path, '/')) {
        path = '/' + path;
      }
      return baseUrl + path;
    }
    return this.baseUrl;
  },

  /**
   * Creates a link.
   *
   * @public
   * @param {String} url to link to
   * @param {String} [text] link text. If omitted, defaults to url value.
   * @param {String} [target] link target. If omitted, defaults to '_blank'
   * @param {String} [id] link id
   */
  asLink: function (url, text, target, id) {
    target = target || '_blank';
    if (Ext.isEmpty(text)) {
      text = url;
    }
    if (id) {
      id = ' id="' + id + '"';
    } else {
      id = '';
    }
    return '<a href="' + url + '" target="' + target + '"' + id + '>' + text + '</a>';
  },

  /**
   * Allows text to be easily copy/pasted.
   *
   * @public
   * @param {String} value to copy
   */
  asCopyWidget: function (value) {
    return '<button onclick="Ext.widget(\'nx-copywindow\', { copyText: \'' + value + '\' });" title="' + value + '"><i class="fa fa-clipboard"></i> copy</button>';
  },

  /**
   * Helper to append cache busting suffix to given url.
   *
   * @param {string} url
   * @returns {string}
   */
  cacheBustingUrl: function(url) {
    return url + '?' + this.urlSuffix;
  }
});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext, NX*/

/**
 * Helpers to interact with Icon controller.
 *
 * @since 3.0
 */
Ext.define('NX.Icons', {
  singleton: true,
  requires: [
    'Ext.DomHelper',
    'NX.util.Url'
  ],
  mixins: {
    logAware: 'NX.LogAware'
  },

  /**
   * Helper to get the CSS class for a named icon with optional variant.
   *
   * @public
   */
  cls: function (name, variant) {
    // translate . -> _ to avoid problems with CSS selector syntax muck
    var cls = 'nx-icon-' + name.replace('.', '_');
    if (variant) {
      cls += '-' + variant;
    }
    return cls;
  },

  /**
   * Helper to get html text for a named icon with variant.
   *
   * @public
   */
  img: function(name, variant) {
    return Ext.DomHelper.markup({
      tag: 'img',
      src: Ext.BLANK_IMAGE_URL,
      cls: this.cls(name, variant)
    });
  },

  /**
   * Helper to get a cache-busted URL for an icon name + variant + optional extension.
   *
   * @param name
   * @param [variant]
   * @param [ext] The file extension to use, png if not set.
   * @returns {string}
   */
  url: function(name, variant, ext) {
    var file = name;

    if (ext === undefined) {
      ext = 'png';
    }
    file += '.' + ext;

    return this.url2(file, variant);
  },

  /**
   * Helper to get a cache-busted URL for an icon file + optional variant.
   *
   * @param file
   * @param [variant]
   * @returns {string}
   */
  url2: function(file, variant) {
    var url = NX.util.Url.baseUrl + '/static/rapture/resources/icons/';
    if (variant) {
      url += variant + '/';
    }
    url += file;
    return NX.util.Url.cacheBustingUrl(url);
  }

});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext, NX*/

/**
 * Authenticate window.
 *
 * @since 3.0
 */
Ext.define('NX.view.Authenticate', {
  extend: 'NX.view.ModalDialog',
  alias: 'widget.nx-authenticate',
  requires: [
    'NX.Icons',
    'NX.I18n'
  ],

  cls: 'nx-authenticate',

  /**
   * @cfg message Message to be shown
   */
  message: undefined,

  /**
   * @protected
   */
  initComponent: function () {
    var me = this;

    me.ui = 'nx-inset';
    me.title = NX.I18n.get('Authenticate_Title');
    me.defaultFocus = 'password';

    me.setWidth(NX.view.ModalDialog.SMALL_MODAL);

    if (!me.message) {
      me.message = NX.I18n.get('Authenticate_Help_Text');
    }

    Ext.apply(this, {
      items: {
        xtype: 'form',
        defaultType: 'textfield',
        defaults: {
          anchor: '100%'
        },
        items: [
          {
            xtype: 'container',
            layout: 'hbox',
            cls: 'message',
            items: [
              { xtype: 'component', html: NX.Icons.img('authenticate', 'x32') },
              { xtype: 'component', html: '<div>' + me.message + '</div>' }
            ]
          },
          {
            name: 'username',
            itemId: 'username',
            emptyText: NX.I18n.get('SignIn_Username_Empty'),
            allowBlank: false,
            readOnly: true
          },
          {
            name: 'password',
            itemId: 'password',
            inputType: 'password',
            emptyText: NX.I18n.get('SignIn_Password_Empty'),
            allowBlank: false,
            // allow cancel to be clicked w/o validating this to be non-blank
            validateOnBlur: false
          }
        ],

        buttonAlign: 'left',
        buttons: [
          { text: NX.I18n.get('User_View_Authenticate_Submit_Button'), action: 'authenticate', formBind: true, bindToEnter: true, ui: 'nx-primary' },
          { text: NX.I18n.get('Authenticate_Cancel_Button'), handler: me.close, scope: me }
        ]
      }
    });

    me.callParent();
  }

});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext*/

/**
 * Expire session window.
 *
 * @since 3.0
 */
Ext.define('NX.view.ExpireSession', {
  extend: 'NX.view.ModalDialog',
  requires: [
    'NX.I18n'
  ],
  alias: 'widget.nx-expire-session',

  cls: 'nx-expire-session',

  /**
   * @override
   */
  initComponent: function () {
    var me = this;

    me.title = NX.I18n.get('ExpireSession_Title');

    me.setWidth(NX.view.ModalDialog.MEDIUM_MODAL);

    Ext.apply(me, {
      items: [
        {
          xtype: 'label',
          // FIXME: Why is this using global 'id'?
          id: 'expire',
          text: NX.I18n.get('ExpireSession_Help_Text')
        }
      ],
      buttonAlign: 'left',
      buttons: [
        { text: NX.I18n.get('ExpireSession_Cancel_Button'), action: 'cancel' },
        {
          text: NX.I18n.get('ExpireSession_SignIn_Button'),
          action: 'signin',
          hidden: true,
          itemId: 'expiredSignIn',
          ui: 'nx-primary',
          handler: function() {
            // FIXME: simplify, me.close()
            this.up('nx-expire-session').close();
          }
        },
        {
          text: NX.I18n.get('Button_Close'),
          action: 'close',
          hidden: true,
          handler: function() {
            // FIXME: simplify, me.close()
            this.up('nx-expire-session').close();
          }
        }
      ]
    });

    me.callParent();
  },

  /**
   * Check to see if the dialog is showing that it is expired.
   *
   * @public
   * @returns {boolean}
   */
  sessionExpired: function() {
    return this.down('#expiredSignIn').isVisible();
  }

});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext*/
/*jslint bitwise: true, plusplus: true*/

/**
 * UTF8 related utils.
 *
 * @since 3.0
 */
Ext.define('NX.util.Utf8', {
  singleton: true,

  /**
   * Encode string as UTF-8.
   *
   * @public
   * @param {String} string
   * @return UTF-8 encoded string.
   */
  encode: function (string) {
    var utftext = "",
        c,
        n;

    string = string.replace(/\r\n/g, "\n");

    for (n = 0; n < string.length; n++) {
      c = string.charCodeAt(n);

      if (c < 128) {
        utftext += String.fromCharCode(c);
      }
      else if ((c > 127) && (c < 2048)) {
        utftext += String.fromCharCode((c >> 6) | 192);
        utftext += String.fromCharCode((c & 63) | 128);
      }
      else {
        utftext += String.fromCharCode((c >> 12) | 224);
        utftext += String.fromCharCode(((c >> 6) & 63) | 128);
        utftext += String.fromCharCode((c & 63) | 128);
      }
    }

    return utftext;
  },

  /**
   * Decode UTF-8 string.
   *
   * @public
   * @param {String} utftext
   * @return String.
   */
  decode: function (utftext) {
    var string = "",
        i = 0,
        c = 0, c2 = 0, c3 = 0;

    while (i < utftext.length) {
      c = utftext.charCodeAt(i);

      if (c < 128) {
        string += String.fromCharCode(c);
        i++;
      }
      else if ((c > 191) && (c < 224)) {
        c2 = utftext.charCodeAt(i + 1);
        string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
        i += 2;
      }
      else {
        c2 = utftext.charCodeAt(i + 1);
        c3 = utftext.charCodeAt(i + 2);
        string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
        i += 3;
      }
    }

    return string;
  }

});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext, NX*/
/*jslint plusplus:true, bitwise:true*/

/**
 * Base64 related utils.
 *
 * @since 3.0
 */
Ext.define('NX.util.Base64', {
  singleton: true,
  requires: [
    'NX.util.Utf8'
  ],

  /**
   * @private
   */
  keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

  /**
   * Encode given input string as BASE-64.
   *
   * @public
   */
  encode: function (input) {
    var output = "",
        chr1, chr2, chr3, enc1, enc2, enc3, enc4,
        i = 0;

    input = NX.util.Utf8.encode(input);

    while (i < input.length) {
      chr1 = input.charCodeAt(i++);
      chr2 = input.charCodeAt(i++);
      chr3 = input.charCodeAt(i++);

      enc1 = chr1 >> 2;
      enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
      enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
      enc4 = chr3 & 63;

      if (isNaN(chr2)) {
        enc3 = enc4 = 64;
      }
      else if (isNaN(chr3)) {
        enc4 = 64;
      }

      output = output
          + this.keyStr.charAt(enc1)
          + this.keyStr.charAt(enc2)
          + this.keyStr.charAt(enc3)
          + this.keyStr.charAt(enc4);
    }

    return output;
  },

  /**
   * Decode given BASE-64 encoded input string.
   *
   * @public
   */
  decode: function (input) {
    var output = "";
    var chr1, chr2, chr3;
    var enc1, enc2, enc3, enc4;
    var i = 0;

    input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

    while (i < input.length) {
      enc1 = this.keyStr.indexOf(input.charAt(i++));
      enc2 = this.keyStr.indexOf(input.charAt(i++));
      enc3 = this.keyStr.indexOf(input.charAt(i++));
      enc4 = this.keyStr.indexOf(input.charAt(i++));

      chr1 = (enc1 << 2) | (enc2 >> 4);
      chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
      chr3 = ((enc3 & 3) << 6) | enc4;

      output = output + String.fromCharCode(chr1);

      if (enc3 !== 64) {
        output = output + String.fromCharCode(chr2);
      }
      if (enc4 !== 64) {
        output = output + String.fromCharCode(chr3);
      }
    }

    output = NX.util.Utf8.decode(output);

    return output;
  }

});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext, NX*/

/**
 * Helpers to interact with Message controller.
 *
 * @since 3.0
 */
Ext.define('NX.Messages', {
  singleton: true,

  /**
   * Add a new custom message.
   *
   * @public
   * @param {Object} message
   */
  add: function (message) {
    NX.getApplication().getMessageController().addMessage(message);
  },

  //
  // High-level helpers
  //

  /**
   * Add a notice message.
   *
   * @public
   * @param {string} message
   */
  notice: function (message) {
    this.add({type: 'default', text: message});
  },

  /**
   * Add an info message.
   *
   * @public
   * @param {string} message
   */
  info: function (message) {
    this.add({type: 'primary', text: message});
  },

  /**
   * Add an error message.
   *
   * @public
   * @param {string} message
   */
  error: function (message) {
    this.add({type: 'danger', text: message});
  },

  /**
   * Add a warning message.
   *
   * @public
   * @param {string} message
   */
  warning: function (message) {
    this.add({type: 'warning', text: message});
  },

  /**
   * Add a success message.
   *
   * @public
   * @param {string} message
   */
  success: function (message) {
    this.add({type: 'success', text: message});
  }
});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext*/

/**
 * Mode selector widget.
 *
 * @since 3.0
 */
Ext.define('NX.view.header.Mode', {
  extend: 'Ext.container.Container',
  alias: 'widget.nx-header-mode',

  config: {
    /**
     * Mode name.
     *
     * @cfg {String}
     */
    name: undefined,

    /**
     * Mode menu title.
     *
     * @cfg {String}
     */
    title: undefined,

    /**
     * Mode button tooltip.
     *
     * @cfg {String}
     */
    tooltip: undefined,

    /**
     * Mode button glyph.
     *
     * @cfg {String}
     */
    glyph: undefined,

    /**
     * If button should auto hide when no features are available for selected mode.
     *
     * @cfg {boolean}
     */
    autoHide: false,

    /**
     * If menu should be collapsed automatically when mode is selected.
     *
     * @cfg {boolean}
     */
    collapseMenu: false
  },

  /**
   * Absolute layout for caret positioning over button.
   */
  layout: 'absolute',

  /**
   * @override
   */
  initComponent: function() {
    var me = this;

    me.addEvents(
        /**
         * Fired when mode has been selected.
         *
         * @event selected
         * @param {NX.view.header.Mode} mode
         */
        'selected'
    );

    Ext.apply(me, {
      items: [
        {
          xtype: 'button',
          ui: 'nx-header',
          cls: 'nx-modebutton',
          scale: 'medium',
          height: 39,
          // min-width here as the user-mode extends past this with user-name
          minWidth: 39,
          toggleGroup: 'mode',
          allowDepress: false,
          tooltip: me.tooltip,
          glyph: me.glyph,
          handler: function(button) {
            me.fireEvent('selected', me);
          },
          // copied autoEl from Ext.button.Button
          autoEl: {
            tag: 'a',
            hidefocus: 'on',
            unselectable: 'on',
            // expose mode name on element for testability to target button by mode name
            'data-name': me.name
          }
        },
        {
          // css magic renders caret look
          xtype: 'container',
          cls: 'nx-caret',
          width: 0,
          height: 0,
          x: 14,
          y: 34
        }
      ]
    });

    me.callParent();
  },

  /**
   * @public
   * @param {String} text
   */
  setText: function(text) {
    this.down('button').setText(text);
  },

  /**
   * @public
   * @param {String} tip
   */
  setTooltip: function(tip) {
    this.down('button').setTooltip(tip);
  },

  /**
   * @public
   * @param {boolean} state
   * @param {boolean} suppressEvent
   */
  toggle: function(state, suppressEvent) {
    this.down('button').toggle(state, suppressEvent);
  }
});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext, NX*/

/**
 * Helpers to interact with **{@link NX.controller.State}** controller.
 *
 * @since 3.0
 */
Ext.define('NX.State', {
  singleton: true,
  requires: [
    'Ext.Version'
  ],
  mixins: {
    observable: 'Ext.util.Observable',
    logAware: 'NX.LogAware'
  },

  /**
   * @constructor
   * @param {Object} config
   */
  constructor: function (config) {
    var me = this;

    me.mixins.observable.constructor.call(me, config);

    me.addEvents(
        /**
         * Fires when any of application context values changes.
         *
         * @event changed
         * @param {NX.State} this
         */
        'changed'
    );
  },

  /**
   * @public
   * @returns {boolean} true, if browser is supported
   */
  isBrowserSupported: function () {
    return this.getValue('browserSupported') === true;
  },

  /**
   * @public
   * @param {boolean} value true, if browser is supported
   */
  setBrowserSupported: function (value) {
    this.setValue('browserSupported', value === true);
  },

  /**
   * @public
   * @returns {boolean} true, if license is required
   */
  requiresLicense: function () {
    return this.getValue('license', {})['required'] === true;
  },

  /**
   * @public
   * @returns {boolean} true, if license is installed
   */
  isLicenseInstalled: function () {
    return this.getValue('license', {})['installed'] === true;
  },

  /**
   * @public
   * @returns {boolean} true, if license is installed and valid
   */
  isLicenseValid: function() {
    return this.isLicenseInstalled() && this.getValue('license', {})['valid'] === true;
  },

  /**
   * @public
   * @returns {number}  of days until license expires, may be null
   */
  getDaysToLicenseExpiry: function() {
    return this.getValue('license', {})['daysToExpiry'];
  },

  /**
   * @public
   * @param {string} feature name
   * @returns {boolean} true, if feature exists
   */
  hasFeature: function(feature) {
    var features = this.getValue('license', {})['features'];
    if (features) {
      return features.indexOf(feature) !== -1;
    }
    return false;
  },

  /**
   * @public
   * @returns {Object} current user, if any
   */
  getUser: function () {
    return this.getValue('user');
  },

  /**
   * @public
   * @param {Object} [user] current user to be set
   * @returns {*}
   */
  setUser: function (user) {
    this.setValue('user', user);
  },

  /**
   * Return status.version
   *
   * @public
   * @returns {string}
   */
  getVersion: function() {
    return this.getValue('status')['version'];
  },

  /**
   * Returns major.minor parts of status.version.
   *
   * @public
   * @returns {string}
   */
  getVersionMajorMinor: function() {
    // Ext.Version doesn't fully support our version scheme, but the major.minor bits it handles fine
    var v = Ext.create('Ext.Version', this.getVersion());
    return v.getMajor() + '.' + v.getMinor();
  },

  /**
   * Return status.edition.
   *
   * @public
   * @returns {string}
   */
  getEdition: function() {
    return this.getValue('status')['edition'];
  },

  /**
   * Return status.edition and status.version suitable for branded display.
   *
   * @public
   * @returns {string}
   */
  getBrandedEditionAndVersion: function() {
    var edition = this.getEdition(),
        version = this.getVersion();

    return edition + ' ' + version;
  },

  /**
   * Return status.buildRevision.
   *
   * @public
   * @returns {string}
   */
  getBuildRevision: function() {
    return this.getValue('status')['buildRevision'];
  },

  /**
   * Return status.buildTimestamp.
   *
   * @public
   * @returns {string}
   */
  getBuildTimestamp: function() {
    return this.getValue('status')['buildTimestamp'];
  },

  /**
   * Return whether or not we're receiving from the server.
   *
   * @returns {boolean}
   */
  isReceiving: function() {
    return this.getValue('receiving');
  },

  getValue: function (key, defaultValue) {
    return this.controller().getValue(key, defaultValue);
  },

  setValue: function (key, value) {
    this.controller().setValue(key, value);
  },

  setValues: function (values) {
    this.controller().setValues(values);
  },

  /**
   * @private
   * @returns {NX.controller.State}
   */
  controller: function () {
    return NX.getApplication().getStateController();
  }

});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext*/

/**
 * Sign-in button.
 *
 * @since 3.0
 */
Ext.define('NX.view.header.SignIn', {
  extend: 'Ext.button.Button',
  alias: 'widget.nx-header-signin',
  requires: [
    'NX.I18n'
  ],

  /**
   * @override
   */
  initComponent: function() {
    Ext.apply(this, {
      text: NX.I18n.get('Header_SignIn_Text'),
      tooltip: NX.I18n.get('Header_SignIn_Tooltip'),
      glyph: 'xf090@FontAwesome' // fa-sign-in
    });

    this.callParent();
  }

});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext, NX*/

/**
 * User controller.
 *
 * @since 3.0
 */
Ext.define('NX.controller.User', {
  extend: 'NX.app.Controller',
  requires: [
    'NX.util.Base64',
    'NX.Messages',
    'NX.State',
    'NX.I18n',
    'NX.view.header.Mode'
  ],

  views: [
    'header.SignIn',
    'header.SignOut',
    'Authenticate',
    'SignIn',
    'ExpireSession'
  ],

  refs: [
    {
      ref: 'signInButton',
      selector: 'nx-header-signin'
    },
    {
      ref: 'signOutButton',
      selector: 'nx-header-signout'
    },
    {
      ref: 'userMode',
      selector: 'nx-header-mode[name=user]'
    },
    {
      ref: 'signIn',
      selector: 'nx-signin'
    },
    {
      ref: 'authenticate',
      selector: 'nx-authenticate'
    }
  ],

  /**
   * @override
   */
  init: function () {
    var me = this;

    me.getApplication().getIconController().addIcons({
      'authenticate': {
        file: 'lock.png',
        variants: ['x16', 'x32']
      }
    });

    me.listen({
      controller: {
        '#State': {
          userchanged: me.onUserChanged
        }
      },
      component: {
        'nx-header-panel': {
          afterrender: me.manageButtons
        },
        'nx-header-signin': {
          click: me.showSignInWindow
        },
        'nx-expire-session button[action=signin]': {
          click: me.showSignInWindow
        },
        'nx-header-signout': {
          click: me.onClickSignOut
        },
        'nx-signin button[action=signin]': {
          click: me.signIn
        },
        'nx-authenticate button[action=authenticate]': {
          click: me.doAuthenticateAction
        }
      }
    });

    me.addEvents(
        /**
         * Fires when a user had been successfully signed-in.
         *
         * @event signin
         * @param {Object} user
         */
        'signin',

        /**
         * Fires before a user is signed out.
         *
         * @event beforesignout
         */
        'beforesignout',

        /**
         * Fires when a user had been successfully signed-out.
         *
         * @event signout
         */
        'signout'
    );
  },

  /**
   * @private
   */
  onUserChanged: function (user, oldUser) {
    var me = this;

    if (user && !oldUser) {
      NX.Messages.add({text: NX.I18n.format('User_SignedIn_Message', user.id), type: 'default'});
      me.fireEvent('signin', user);
    }
    else if (!user && oldUser) {
      NX.Messages.add({text: NX.I18n.get('User_SignedOut_Message'), type: 'default'});
      me.fireEvent('signout');
    }

    me.manageButtons();
  },

  /**
   * Returns true if there is an authenticated user.
   *
   * @public
   * @return {boolean}
   */
  hasUser: function () {
    return Ext.isDefined(NX.State.getUser());
  },

  /**
   * Shows sign-in or authentication window based on the fact that we have an user or not.
   *
   * @public
   * @param {String} [message] Message to be shown in authentication window
   * @param {Object} [options] TODO
   */
  askToAuthenticate: function (message, options) {
    var me = this;

    if (me.hasUser()) {
      me.showAuthenticateWindow(message, Ext.apply(options || {}, {authenticateAction: me.authenticate}));
    }
    else {
      me.showSignInWindow(options);
    }
  },

  /**
   * Shows authentication window in order to retrieve an authentication token.
   *
   * @public
   * @param {String} [message] Message to be shown in authentication window
   * @param {Object} [options] TODO
   */
  doWithAuthenticationToken: function (message, options) {
    var me = this;

    me.showAuthenticateWindow(message,
        Ext.apply(options || {}, {authenticateAction: me.retrieveAuthenticationToken})
    );
  },

  /**
   * Shows sign-in window.
   *
   * @private
   * @param {Object} [options] TODO
   */
  showSignInWindow: function (options) {
    var me = this;

    if (!me.getSignIn()) {
      me.getSignInView().create({options: options});
    }
  },

  /**
   * Shows authenticate window.
   *
   * @private
   * @param {String} [message] Message to be shown in authentication window
   * @param {Object} [options] TODO
   */
  showAuthenticateWindow: function (message, options) {
    var me = this,
        user = NX.State.getUser(),
        win;

    if (!me.getAuthenticate()) {
      win = me.getAuthenticateView().create({message: message, options: options});
      if (me.hasUser()) {
        win.down('form').getForm().setValues({username: user.id});
        win.down('#password').focus();
      }
    }
  },

  /**
   * @private
   */
  signIn: function (button) {
    var me = this,
        win = button.up('window'),
        form = button.up('form'),
        values = form.getValues(),
        b64username = NX.util.Base64.encode(values.username),
        b64password = NX.util.Base64.encode(values.password);

    win.getEl().mask(NX.I18n.get('User_SignIn_Mask'));

    //<if debug>
//    me.logDebug('Sign-in user: "', values.username, '" ...');
    //</if>

    me.doSignIn(b64username, b64password, values, button);
  },

  /**
   * @private
   */
  doAuthenticateAction: function (button) {
    var win = button.up('window');

    // invoke optional authenticateAction callback registered on window
    if (win.options && Ext.isFunction(win.options.authenticateAction)) {
      win.options.authenticateAction.call(this, button);
    }
  },

  // TODO: anything that may change the authentication/session should probably not be
  // TODO: done via extjs as it can batch, and the batch operation could impact the
  // TODO: sanity of the requests if authentication changes mid execution of batch operations

  doSignIn: function(b64username, b64password, values, button) {
    var me = this,
        win = button.up('window');

    Ext.Ajax.request({
      url: NX.util.Url.urlOf('service/rapture/session'),
      method: 'POST',
      params: {
        username: b64username,
        password: b64password
      },
      scope: me,
      suppressStatus: true,
      success: function () {
        win.getEl().unmask();
        NX.State.setUser({id: values.username});
        win.close();

        // invoke optional success callback registered on window
        if (win.options && Ext.isFunction(win.options.success)) {
          win.options.success.call(win.options.scope, win.options);
        }
      },
      failure: function (response) {
        var message = NX.I18n.get('User_Credentials_Message');
        if (response.status === 0) {
          message = NX.I18n.get('User_ConnectFailure_Message');
        }
        win.getEl().unmask();
        NX.Messages.add({
          text: message,
          type: 'warning'
        });
      }
    });
  },

  /**
   * @private
   */
  authenticate: function (button) {
    var me = this,
        win = button.up('window'),
        form = button.up('form'),
        user = NX.State.getUser(),
        values = Ext.applyIf(form.getValues(), {username: user ? user.id : undefined}),
        b64username = NX.util.Base64.encode(values.username),
        b64password = NX.util.Base64.encode(values.password);

    win.getEl().mask(NX.I18n.get('User_Controller_Authenticate_Mask'));

    //<if debug>
//    this.logDebug('Authenticating user "', values.username, '" ...');
    //</if>

    me.doSignIn(b64username, b64password, values, button);
  },

  /**
   * @private
   */
  retrieveAuthenticationToken: function (button) {
    var win = button.up('window'),
        form = button.up('form'),
        user = NX.State.getUser(),
        values = Ext.applyIf(form.getValues(), {username: user ? user.id : undefined}),
        b64username = NX.util.Base64.encode(values.username),
        b64password = NX.util.Base64.encode(values.password);

    win.getEl().mask(NX.I18n.get('User_Retrieving_Mask'));

    //<if debug>
//    this.logDebug('Retrieving authentication token...');
    //</if>

    NX.direct.rapture_Security.authenticationToken(b64username, b64password, function (response) {
      win.getEl().unmask();
      if (Ext.isObject(response) && response.success) {
        win.close();

        // invoke optional success callback registered on window
        if (win.options && Ext.isFunction(win.options.success)) {
          win.options.success.call(win.options.scope, response.data, win.options);
        }
      }
    });
  },

  /**
   * @private
   */
  onClickSignOut: function () {
    var me = this;

    if (me.fireEvent('beforesignout')) {
      me.signOut();
    }
  },

  /**
   * @public
   */
  signOut: function () {
	  var me = this;
	  var currentLocation = window.location.href; 
	  if (currentLocation.indexOf("#") !== -1 ){
	    var url = window.location.href;
	    var parts = url.split("#");
	    var rootUrl = parts[parts.length - 2];
	    window.location = rootUrl + 'service/local/authentication/cas/logout';
	  } 
	  else {
		  window.location = currentLocation + 'service/local/authentication/cas/logout';
	  } 
  },

  manageButtons: function () {
    var me = this,
        user = NX.State.getUser(),
        signInButton = me.getSignInButton(),
        signOutButton = me.getSignOutButton(),
        userMode = me.getUserMode();

    if (signInButton) {
      if (user) {
        signInButton.hide();
        userMode.show();
        userMode.setText(user.id);
        userMode.setTooltip(NX.I18n.format('User_Tooltip', user.id));
        signOutButton.show();
      }
      else {
        signInButton.show();
        userMode.hide();
        signOutButton.hide();
      }
    }
  }

});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext, NX*/

/**
 * Helpers to interact with **{@link NX.controller.User}** controller.
 *
 * @since 3.0
 */
Ext.define('NX.Security', {
  singleton: true,
  requires: [
    'NX.controller.User'
  ],

  /**
   * @private
   * @returns {NX.controller.User}
   */
  controller: function () {
    return NX.getApplication().getController('User');
  },

  /**
   * @see NX.controller.User#hasUser
   */
  hasUser: function () {
    var me = this;
    if (me.controller()) {
      return me.controller().hasUser();
    }
  },

  /**
   * @see NX.controller.User#askToAuthenticate
   */
  askToAuthenticate: function (message, options) {
    var me = this;
    if (me.controller()) {
      me.controller().askToAuthenticate(message, options);
    }
  },

  /**
   * @see NX.controller.User#doWithAuthenticationToken
   */
  doWithAuthenticationToken: function (message, options) {
    var me = this;
    if (me.controller()) {
      me.controller().doWithAuthenticationToken(message, options);
    }
  },

  /**
   * @see NX.controller.User#signOut
   */
  signOut: function () {
	var me = this;
    if (me.controller()) {
      me.controller().signOut();
    }
  }

});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext, NX*/

/**
 * Watches over Ext.Direct communication.
 *
 * @since 3.0
 */
Ext.define('NX.controller.ExtDirect', {
  extend: 'NX.app.Controller',
  requires: [
    'NX.Security',
    'NX.Messages',
    'NX.I18n'
  ],

  /**
   * @override
   */
  init: function() {
    var me = this;

    me.listen({
      direct: {
        '*': {
          beforecallback: me.checkResponse
        }
      }
    });
  },

  /**
   * Checks Ext.Direct response and automatically show warning messages if an error occurred.
   * If response specifies that authentication is required, will show the sign-in window.
   *
   * @private
   */
  checkResponse: function(provider, transaction) {
    var result = transaction.result,
        message;

    // FIXME: Anything that does logging here can cause Ext.Direct log event remoting to spin out of control

    if (Ext.isDefined(result)) {
      if (Ext.isDefined(result.success) && result.success === false) {

        if (Ext.isDefined(result.authenticationRequired) && result.authenticationRequired === true) {
          message = result.message;
          NX.Security.askToAuthenticate();
        }
        else if (Ext.isDefined(result.message)) {
          message = result.message;
        }
        else if (Ext.isDefined(result.messages)) {
          message = Ext.Array.from(result.messages).join('<br/>');
        }
      }

      if (Ext.isDefined(transaction.serverException)) {
        message = transaction.serverException.exception.message;
      }
    }
    else {
      message = NX.I18n.get('User_ConnectFailure_Message');
    }

    if (message) {
      NX.Messages.add({text: message, type: 'warning'});
    }

    // HACK: disabled for now as this causes problems remoting LogEvents
    ////<if debug>
    //var logMsg = transaction.action + ':' + transaction.method + " -> " + (message ? 'Failed: ' + message : 'OK');
    //if (Ext.isDefined(result) && result.errors) {
    //  logMsg += (' Errors: ' + Ext.encode(result.errors));
    //}
    //this.logDebug(logMsg);
    ////</if>
  }

});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext*/

/**
 * Log-event model.
 *
 * @since 3.0
 */
Ext.define('NX.model.LogEvent', {
  extend: 'Ext.data.Model',
  fields: [
    { name: 'timestamp', type: 'int' },
    { name: 'logger', type: 'string' },
    { name: 'level', type: 'string' },
    { name: 'message', type: 'object' }
  ],
  idgen: 'sequential'
});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext*/

/**
 * LogEvent store.
 *
 * @since 3.0
 */
Ext.define('NX.store.LogEvent', {
  extend: 'Ext.data.ArrayStore',
  model: 'NX.model.LogEvent'
});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext, NX*/

/**
 * Allows customizable processing of {@link NX.model.LogEvent}.
 *
 * @since 3.0
 */
Ext.define('NX.util.log.Sink', {
  mixins: {
    stateful: 'Ext.state.Stateful',
    logAware: 'NX.LogAware'
  },

  /**
   * Sink enabled.
   *
   * @property {Boolean}
   * @readonly
   */
  enabled: true,

  /**
   * @constructor
   */
  constructor: function () {
    // setup stateful configuration with class-name, these are not technically singletons but are used as such
    this.mixins.stateful.constructor.call(this, {
      stateful: true,
      stateId: this.self.getName()
    });

    this.callParent(arguments);
    this.initState();
  },

  /**
   * @override
   * @return {Object}
   */
  getState: function() {
    return {
      enabled: this.enabled
    };
  },

  /**
   * Toggle enabled.
   *
   * @public
   * @param {boolean} flag
   */
  setEnabled: function (flag) {
    this.enabled = flag;

    //<if debug>
//    this.logInfo('Enabled:', flag);
    //</if>

    this.saveState();
  },

  /**
   * @public
   * @param {NX.model.LogEvent} event
   */
  receive: function(event) {
    throw 'abstract-method';
  }
});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext, NX*/

/**
 * Assertion helper.
 *
 * @since 3.0
 */
Ext.define('NX.Assert', {
  singleton: true,
  requires: [
    'NX.Console'
  ],

  /**
   * Set to true to disable all assertions.
   *
   * @public
   * @property {Boolean}
   */
  disable: false,

  /**
   * @public
   * @param {Boolean} expression
   * @param {String...} message
   */
  assert: function() {
    //<if assert>
//    if (this.disable) {
//      return;
//    }
//    var args = Array.prototype.slice.call(arguments),
//        expression = args.shift();
//    if (!expression) {
//      args.unshift('Assertion failure:');
//      NX.Console.error.apply(NX.Console, args);
//    }
    //</if>
  }
});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext, NX*/

/**
 * Store {@link NX.util.log.Sink} into {@link NX.store.LogEvent} store.
 *
 * @since 3.0
 */
Ext.define('NX.util.log.StoreSink', {
  extend: 'NX.util.log.Sink',
  requires: [
    'NX.Assert'
  ],

  /**
   * Reference to the event store.
   *
   * @private
   * @property {NX.store.LogEvent}
   */
  store: undefined,

  /**
   * Maximum records to retain in the store.
   *
   * @public
   * @property {Number}
   * @readonly
   */
  maxSize: 200,

  /**
   * @constructor
   * @param {NX.store.LogEvent} store
   */
  constructor: function (store) {
    this.store = store;
    this.callParent(arguments);
  },

  /**
   * Customize state.
   *
   * @override
   * @return {Object}
   */
  getState: function() {
    return Ext.apply(this.callParent(), {
      maxSize: this.maxSize
    });
  },

  /**
   * Set the maximum size of the store.
   *
   * @public
   * @param {Number} maxSize
   */
  setMaxSize: function (maxSize) {
    this.maxSize = maxSize;

    // log here should induce shrinkage, nothing more to do
    this.logDebug('Max size:', maxSize);

    this.saveState();
  },

  /**
   * Array of ordered records for shrinking.
   *
   * @private
   * @property {NX.model.LogEvent[]}
   */
  records: [],

  /**
   * @override
   */
  receive: function (event) {
    //<if assert>
//    NX.Assert.assert(this.store, 'Store not attached');
    //</if>

    // only 1 record, pick off first
    var record = this.store.add(event)[0];

    // maybe shrink
    this.shrink();

    // track records for shrinkage
    this.records.push(record);
  },

  /**
   * Shrink the store after we breach maximum size.
   *
   * @private
   */
  shrink: function () {
    // calculate number of records to purge
    var remove = this.records.length - this.maxSize;

    // maybe purge records
    if (remove > 0) {
      var purged = this.records.splice(0, remove);
      this.store.remove(purged);
    }
  }
});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext, NX*/

/**
 * Welcome dashboard.
 *
 * @since 3.0
 */
Ext.define('NX.view.dashboard.Welcome', {
  extend: 'Ext.container.Container',
  alias: 'widget.nx-dashboard-welcome',
  requires: [
    'NX.Icons'
  ],

  cls: 'nx-dashboard-welcome',
  width: '100%',
  layout: {
    type: 'vbox',
    align: 'center',
    pack: 'start'
  },

  /**
   * @override
   */
  initComponent: function () {
    var me = this;

    me.items = [
      {
        xtype: 'image',
        cls: 'logo',
        src: NX.Icons.url('nexus-clear', 'x200'),
        height: 150,
        width: 150
      }
    ];

    me.callParent();
  }
});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext, NX*/

/**
 * Help button.
 *
 * @since 3.0
 */
Ext.define('NX.view.header.Help', {
  extend: 'Ext.button.Button',
  alias: 'widget.nx-header-help',
  requires: [
    'NX.I18n'
  ],

  /**
   * @override
   */
  initComponent: function () {
    var me = this;

    me.tooltip = NX.I18n.get('Header_Help_Tooltip');
    me.glyph = 'xf059@FontAwesome'; // fa-question-circle

    // hide the menu button arrow
    me.arrowCls = '';

    me.menu = [
      {
        // text and iconCls is dynamic
        tooltip: NX.I18n.get('Header_Help_Feature_Tooltip'),
        action: 'feature'
      },
      '-',
      {
        text: NX.I18n.get('Header_Help_About_Text'),
        iconCls: 'nx-icon-nexus-x16',
        tooltip: NX.I18n.get('Header_Help_About_Tooltip'),
        action: 'about'
      },
      {
        text: NX.I18n.get('Header_Help_Documentation_Text'),
        iconCls: 'nx-icon-help-manual-x16',
        tooltip: NX.I18n.get('Header_Help_Documentation_Tooltip'),
        action: 'docs'
      },
      {
        text: NX.I18n.get('Header_Help_KB_Text'),
        iconCls: 'nx-icon-help-kb-x16',
        tooltip: NX.I18n.get('Header_Help_KB_Tooltip'),
        action: 'kb'
      },
      {
        text: NX.I18n.get('Header_Help_Community_Text'),
        iconCls: 'nx-icon-help-community-x16',
        tooltip: NX.I18n.get('Header_Help_Community_Tooltip'),
        action: 'community'
      },
      {
        text: NX.I18n.get('Header_Help_Issues_Text'),
        iconCls: 'nx-icon-help-issues-x16',
        tooltip: NX.I18n.get('Header_Help_Issues_Tooltip'),
        action: 'issues'
      },
      '-',
      {
        text: NX.I18n.get('Header_Help_Support_Text'),
        iconCls: 'nx-icon-help-support-x16',
        tooltip: NX.I18n.get('Header_Help_Support_Tooltip'),
        action: 'support'
      }
    ];

    me.callParent();
  }

});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext*/

/**
 * A bookmark.
 *
 * @since 3.0
 */
Ext.define('NX.Bookmark', {

  config: {
    /**
     * Bookmark token.
     *
     * @cfg {String}
     */
    token: undefined
  },

  /**
   * @private
   */
  segments: undefined,

  /**
   * @constructor
   */
  constructor: function (config) {
    this.initConfig(config);
  },

  /**
   * Validates token to be a String and calculates segments.
   *
   * @private
   * @param token to apply
   * @returns {String} token
   */
  applyToken: function (token) {
    var me = this;
    if (token && !Ext.isString(token)) {
      throw Ext.Error.raise('Invalid token');
    }
    if (token && (token.trim().length === 0)) {
      token = undefined;
    }
    // avoid nulls
    if (!token) {
      token = undefined;
    }
    me.segments = [];
    if (token) {
      me.segments = token.split(':');
    }
    return token;
  },

  /**
   * @public
   * @param {Number} index of segment
   * @returns {String} segment at index if defined
   */
  getSegment: function (index) {
    return this.segments[index];
  },

  /**
   * @public
   * @returns {Array} list of all segments in this bookmarks
   */
  getSegments: function() {
    return this.segments;
  },

  /**
   * Appends a segment to current segment.
   *
   * @param {String/String[]} segments to append
   * @returns {NX.Bookmark} itself
   */
  appendSegments: function (segments) {
    var me = this;

    if (!segments) {
      throw Ext.Error.raise('Invalid segment: ' + segment);
    }
    if (!Ext.isArray(segments)) {
      segments = [segments];
    }
    Ext.each(segments, function (segment) {
      if (!segment || !Ext.isString(segment)) {
        throw Ext.Error.raise('Invalid segment: ' + segment);
      }
      me.segments.push(segment);
    });

    me.setToken(me.segments.join(':'));

    return me;
  }

});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext, NX*/

/**
 * Helpers to interact with **{@link NX.controller.Bookmarking}** controller.
 *
 * @since 3.0
 */
Ext.define('NX.Bookmarks', {
  singleton: true,
  requires: [
    'NX.Bookmark'
  ],

  /**
   * @private
   * @returns {NX.controller.Bookmarking}
   */
  controller: function () {
    return NX.getApplication().getBookmarkingController();
  },

  /**
   * @see NX.controller.Bookmarking#getBookmark
   */
  getBookmark: function () {
    return this.controller().getBookmark();
  },

  /**
   * @see NX.controller.Bookmarking#bookmark
   */
  bookmark: function (bookmark, caller) {
    return this.controller().bookmark(bookmark, caller);
  },

  /**
   * @see NX.controller.Bookmarking#navigateTo
   */
  navigateTo: function (bookmark, caller) {
    return this.controller().navigateTo(bookmark, caller);
  },

  /**
   * Navigate back by removing one or more segments from the given bookmark.
   * @param bookmark
   * @param segments
   * @param caller
   * @returns {*}
   */
  navigateBackSegments: function(bookmark, segments, caller) {
    return this.controller().navigateTo(NX.Bookmarks.fromSegments(bookmark.getSegments().slice(0, -segments)), caller);
  },

  /**
   * Creates a new bookmark.
   *
   * @public
   * @param {String} token bookmark token
   * @returns {NX.Bookmark} created bookmark
   */
  fromToken: function (token) {
    return Ext.create('NX.Bookmark', { token: token });
  },

  /**
   * Creates a new bookmark from provided segments.
   *
   * @public
   * @param {String[]} segments bookmark segments
   * @returns {NX.Bookmark} created bookmark
   */
  fromSegments: function (segments) {
    var token;
    if (Ext.isDefined(segments)) {
      token = Ext.Array.from(segments).join(':');
    }
    return Ext.create('NX.Bookmark', { token: token });
  },

  /**
   * Encodes the value suitable to be used as a bookmark token.
   * (eliminate spaces and lower case)
   *
   * @param value to be encoded
   * @returns {String} encoded value
   */
  encode: function (value) {
    if (!Ext.isString(value)) {
      throw Ext.Error.raise('Value to be encoded must be a String');
    }
    return value.replace(/\s/g, '');
  }

});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext, NX*/

/**
 * Bookmarking controller.
 *
 * @since 3.0
 */
Ext.define('NX.controller.Bookmarking', {
  extend: 'NX.app.Controller',
  requires: [
    'Ext.History',
    'NX.Bookmark',
    'NX.Bookmarks'
  ],

  /**
   * If this controller had been launched. Becomes true after onLaunch() method is called by ExtJS.
   */
  launched: false,

  /**
   * @override
   */
  init: function () {
    var me = this;

    // The only requirement for this to work is that you must have a hidden field and
    // an iframe available in the page with ids corresponding to Ext.History.fieldId
    // and Ext.History.iframeId.  See history.html for an example.
    Ext.History.useTopWindow = false;
    Ext.History.init();

    me.bindToHistory();

    me.addEvents(
        /**
         * Fires when user navigates to a new bookmark.
         *
         * @event navigate
         * @param {String} bookmark value
         */
        'navigate'
    );
  },

  /**
   * @public
   * @returns {NX.Bookmark} current bookmark
   */
  getBookmark: function () {
    return NX.Bookmarks.fromToken(Ext.History.bookmark || Ext.History.getToken());
  },

  /**
   * Sets bookmark to a specified value.
   *
   * @public
   * @param {NX.Bookmark} bookmark new bookmark
   * @param {Object} [caller] whom is asking to bookmark
   */
  bookmark: function (bookmark, caller) {
    var me = this,
        oldValue = me.getBookmark().getToken();

    if (!me.launched) {
      return;
    }

    if (bookmark && oldValue !== bookmark.getToken()) {
      //<if debug>
//      me.logDebug('Bookmark:', bookmark.getToken(), (caller ? '(' + caller.self.getName() + ')' : ''));
      //</if>

      Ext.History.bookmark = bookmark.getToken();
      Ext.History.add(bookmark.getToken());
    }
  },

  /**
   * Sets bookmark to a specified value and navigates to it.
   *
   * @public
   * @param {NX.Bookmark} bookmark to navigate to
   * @param {Object} [caller] whom is asking to navigate
   */
  navigateTo: function (bookmark, caller) {
    var me = this;

    if (!me.launched) {
      return;
    }

    if (bookmark) {
      //<if debug>
//      me.logDebug('Navigate to:', bookmark.getToken(), (caller ? '(' + caller.self.getName() + ')' : ''));
      //</if>

      me.bookmark(bookmark, caller);
      me.fireEvent('navigate', bookmark);
    }
  },

  /**
   * Navigate to current bookmark.
   *
   * @override
   */
  onLaunch: function () {
    var me = this;

    me.launched = true;

    me.navigateTo(me.getBookmark(), me);
  },

  /**
   * Sets bookmark to a specified value and navigates to it.
   *
   * @private
   * @param {String} token to navigate to
   */
  onNavigate: function (token) {
    var me = this;

    if (token !== Ext.History.bookmark) {
      delete Ext.History.bookmark;
      me.navigateTo(NX.Bookmarks.fromToken(token), me);
    }
  },

  /**
   * Start listening to **{@link Ext.History}** change events.
   *
   * @private
   */
  bindToHistory: function () {
    var me = this;

    Ext.History.on('change', me.onNavigate, me);
  }

});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext*/

/**
 * Filter
 *
 * @since 3.3
 */
Ext.define('NX.util.Filter', {
  singleton: true,

  /**
   * Util to build a div for empty search results.
   *
   * @param searchString
   * @param emptyTemplate
   * @returns {string}
   */
  buildEmptyResult: function(searchString, emptyTemplate) {
    var encoded = Ext.util.Format.htmlEncode(searchString);
    return '<div class="x-grid-empty">' + emptyTemplate.replace(/\$filter/, encoded) + '</div>';
  }
});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext*/

/**
 * A grid plugins that adds filtering capabilities.
 *
 * @since 3.0
 */
Ext.define('NX.ext.grid.plugin.Filtering', {
  extend: 'Ext.AbstractPlugin',
  alias: 'plugin.gridfiltering',
  requires: [
    'Ext.util.Filter'
  ],
  mixins: {
    logAware: 'NX.LogAware'
  },

  /**
   * @private {String} current filtering value
   */
  filterValue: undefined,

  /**
   * @private {Ext.data.Store} store that should filtered
   */
  filteredStore: undefined,

  /**
   * @private {Array} array of field ids that should be used for filtering
   */
  filteredFields: undefined,

  /**
   * @cfg {Function} to be used for filtering (defaults to String contains)
   */
  filterFn: function (valueToBeMatched, filterValue) {
    var stringValue;
    if (valueToBeMatched) {
      stringValue = valueToBeMatched.toString();
      if (stringValue) {
        return stringValue.toLowerCase().indexOf(filterValue.toLowerCase()) !== -1;
      }
    }
    return false;
  },

  /**
   * Returns true if the field value is defined and matches the filtering function.
   *
   * @protected
   * @param filterValue to match
   * @param record record that was used to extract the value to be matched
   * @param fieldName filter field name that was used to extract the value to be matched
   * @param fieldValue to me matched
   */
  matches: function (filterValue, record, fieldName, fieldValue) {
    return this.filterFn(fieldValue, filterValue);
  },

  /**
   * Filters on specified value.
   *
   * @public
   * @param value to filter upon
   */
  filter: function (value) {
    var me = this;

    me.filterValue = value;
    me.applyFilter();
  },

  /**
   * Clears filter.
   *
   * @public
   */
  clearFilter: function () {
    var me = this;

    if (me.filterValue) {
      me.filterValue = undefined;
      me.applyFilter();
    }
  },

  /**
   * Filters on current filter value.
   *
   * @public
   */
  applyFilter: function () {
    var me = this,
        remoteFilter = me.filteredStore.remoteFilter,
        filters = me.filteredStore.filters.items;

    // HACK: when remote filter is on store will not be locally filtered, so we have to trick ExtJS into doing local
    // filtering by setting remoteFilter to false and temporary remove the other filters (will add them back after local
    // filtering is performed)
    if (remoteFilter) {
      me.filteredStore.filters.clear();
      me.filteredStore.remoteFilter = false;
    }
    if (me.filterValue) {
      //<if debug>
//      me.logTrace('Filtering', me.filteredStore.self.getName(), 'on [', me.filterValue, '] using fields:', me.filteredFields);
      //</if>

      me.filteredStore.filter(me.filteringFilter);
    }
    else {
      me.filteredStore.removeFilter(me.filteringFilter);

      //<if debug>
//      me.logTrace('Filtering cleared on', me.filteredStore.self.getName());
      //</if>
    }
    if (remoteFilter) {
      me.filteredStore.remoteFilter = remoteFilter;
      if (filters) {
        me.filteredStore.filters.add(filters);
      }
    }
  },

  /**
   * Clear filter value if store is filtered from outside.
   *
   * @private
   */
  syncFilterValue: function (store, filters) {
    var me = this,
        filteringFilterRemoved = true;

    if (filters) {
      Ext.Array.each(filters, function (filter) {
        if (filter.id === me.filteringFilter.id) {
          filteringFilterRemoved = false;
          return false;
        }
        return true;
      });
    }

    if (me.filterValue && filteringFilterRemoved) {
      me.clearFilter();
      me.grid.fireEvent('filteringautocleared');
    }
  },

  /**
   * Bind plugin to grid.
   *
   * @private
   * @param grid to bind to
   */
  init: function (grid) {
    var me = this;

    me.grid = grid;
    grid.filterable = true;
    grid.filter = Ext.Function.bind(me.filter, me);
    grid.clearFilter = Ext.Function.bind(me.clearFilter, me);

    me.filteringFilter = Ext.create('Ext.util.Filter', {
      id: 'filteringPlugin',
      filterFn: function (record) {
        for (var i = 0; i < me.filteredFields.length; i++) {
          var filteredField = me.filteredFields[i];
          if (filteredField) {
            if (me.matches(me.filterValue, record, filteredField, record.data[filteredField])) {
              return true;
            }
          }
        }
        return false;
      }
    });

    grid.mon(grid, {
      reconfigure: me.onReconfigure,
      scope: me,
      beforerender: {
        fn: me.onBeforeRender,
        single: true,
        scope: me
      }
    });
  },

  /**
   * Handles configuration of grid.
   *
   * @private
   * @param grid that was reconfigure
   */
  onBeforeRender: function (grid) {
    this.onReconfigure(grid, grid.getStore(), grid.columns);
  },

  /**
   * Handles reconfiguration of grid.
   *
   * @private
   * @param grid that was reconfigured
   * @param store new store
   * @param columns new columns
   */
  onReconfigure: function (grid, store, columns) {
    var me = this,
        store = store || me.grid.getStore();

    //<if debug>
//    me.logTrace('Grid', grid.id, 'reconfigured; binding to new store');
    //</if>

    me.reconfigureStore(store, me.extractColumnsWithDataIndex(columns));
  },

  /**
   * Unbinds from current store and register itself to provided store.
   *
   * @private
   * @param store to register itself to
   * @param filteredFields fields to be used while filtering
   */
  reconfigureStore: function (store, filteredFields) {
    var me = this;
    if (me.filteredStore !== store) {
      me.unbindFromStore(me.filteredStore);
      me.bindToStore(store);
    }
    me.filteredFields = filteredFields;
    me.applyFilter();
  },

  /**
   * Register itself as listener of load events on provided store.
   *
   * @private
   * @param store to register itself to
   */
  bindToStore: function (store) {
    var me = this;
    me.filteredStore = store;
    if (store) {
      //<if debug>
//      me.logTrace('Binding to store', me.filteredStore.self.getName());
      //</if>

      me.grid.mon(store, 'load', me.applyFilter, me);
      me.grid.mon(store, 'filterchange', me.syncFilterValue, me);
    }
  },

  /**
   * Remove itself as listener from provided store.
   *
   * @private
   * @param store to remove itself from
   */
  unbindFromStore: function (store) {
    var me = this;
    if (store) {
      //<if debug>
//      me.logTrace('Unbinding from store', me.filteredStore.self.getName());
      //</if>

      me.grid.mun(store, 'load', me.applyFilter, me);
      me.grid.mun(store, 'filterchange', me.syncFilterValue, me);
    }
  },

  /**
   * Returns the dataIndex property of all grid columns.
   *
   * @private
   * @returns {Array} of fields names
   */
  extractColumnsWithDataIndex: function (columns) {
    var filterFieldNames = [];

    if (columns) {
      Ext.each(columns, function (column) {
        if (column.dataIndex) {
          filterFieldNames.push(column.dataIndex);
        }
      });
    }

    if (filterFieldNames.length > 0) {
      return filterFieldNames;
    }
  }
});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext*/

/**
 * Filter plugin for grids.
 *
 * @since 3.0
 */
Ext.define('NX.ext.grid.plugin.FilterBox', {
  extend: 'NX.ext.grid.plugin.Filtering',
  alias: 'plugin.gridfilterbox',
  requires: [
    'NX.I18n',
    'NX.util.Filter'
  ],

  /**
   * @cfg {String} emptyText Text to be used as grid empty text when no records are matching the filter. If text
   * contains "${filter}" it will be replaced with filter value.
   */

  /**
   * @override
   */
  init: function (grid) {
    var me = this,
        tbar = grid.getDockedItems('toolbar[dock="top"]')[0],
        items = [
          '->',
          {
            xtype: 'nx-searchbox',
            emptyText: NX.I18n.get('Grid_Plugin_FilterBox_Empty'),
            searchDelay: 200,
            width: 200,
            listeners: {
              search: me.onSearch,
              searchcleared: me.onSearchCleared,
              scope: me
            }
          }
        ];

    me.callParent(arguments);

    if (tbar) {
      tbar.add(items);
    }
    else {
      grid.addDocked([
        {
          xtype: 'toolbar',
          dock: 'top',
          items: items
        }
      ]);
    }

    me.grid.on('filteringautocleared', me.syncSearchBox, me);
  },

  /**
   * Filter grid.
   *
   * @private
   */
  onSearch: function (searchbox, value) {
    var me = this;

    if (me.emptyText) {
      me.grid.getView().emptyText = NX.util.Filter.buildEmptyResult(value, me.emptyText);
    }
    me.filter(value);
  },

  /**
   * Clear the filter before destroying this plugin.
   *
   * @protected
   */
  destroy: function() {
    var me = this;

    me.clearFilter();

    me.callParent();
  },

  /**
   * Clear filtering on grid.
   *
   * @private
   */
  onSearchCleared: function () {
    var me = this;

    if (me.grid.emptyText) {
      me.grid.getView().emptyText = '<div class="x-grid-empty">' + me.grid.emptyText + '</div>';
    }
    me.clearFilter();
  },

  /**
   * Syncs filtering value with search box.
   *
   * @private
   */
  syncSearchBox: function () {
    var me = this;

    me.grid.down('nx-searchbox').setValue(me.filterValue);
  }

});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext, NX*/
/*jslint plusplus: true*/

/**
 * @since 3.0
 */
Ext.define('NX.util.condition.Condition', {
  mixins: {
    observable: 'Ext.util.Observable',
    logAware: 'NX.LogAware'
  },

  statics: {
    counter: 1
  },

  /**
   * Generated id used by event bus.
   *
   * @property {String}
   */
  id: undefined,

  /**
   * Number of listeners listening to this condition.
   *
   * @private
   * @property {Number}
   */
  listenerCounter: 0,

  /**
   * True when this condition is bounded.
   *
   * @protected
   * @property {Boolean}
   */
  bounded: false,

  /**
   * True when this condition is satisfied.
   *
   * @private
   * @property {Boolean}
   */
  satisfied: false,

  /**
   * @constructor
   * @param {Object} config
   */
  constructor: function (config) {
    var me = this;

    me.id = me.self.getName() + '-' + NX.util.condition.Condition.counter++;

    me.mixins.observable.constructor.call(me, config);

    me.addEvents(
        /**
         * Fires when condition is satisfied.
         *
         * @event satisfied
         * @param {NX.util.condition.Condition} this
         */
        'satisfied',

        /**
         * Fires when condition is not satisfied.
         *
         * @event unsatisfied
         * @param {NX.util.condition.Condition} this
         */
        'unsatisfied'
    );
  },

  // HACK: comment the following lines to let debug messages flow
  /**
   * @override
   */
  logDebug: function () {
    // empty
  },

  /**
   * Sets {@link #bounded} = true.
   *
   * @protected
   * @chainable
   */
  bind: function () {
    var me = this;

    if (!me.bounded) {
      me.setBounded(true);
    }

    return me;
  },

  /**
   * Clears all listeners of this condition and sets {@link #bounded} = false.
   *
   * @protected
   * @chainable
   */
  unbind: function () {
    var me = this;

    if (me.bounded) {
      me.clearListeners();
      Ext.app.EventBus.unlisten(me.id);
      me.setBounded(false);
    }

    return me;
  },

  /**
   * Sets {@link #bounded} = false and makes condition unsatisfied.
   *
   * @protected
   * @param bounded
   */
  setBounded: function (bounded) {
    var me = this;
    if (Ext.isDefined(me.bounded)) {
      if (bounded !== me.bounded) {
        if (!bounded) {
          me.setSatisfied(false);
        }

        //<if debug>
//        me.logDebug((bounded ? 'Bounded:' : 'Unbounded:'), me);
        //</if>

        me.bounded = bounded;
        Ext.defer(function () {
          NX.getApplication().getStateController().fireEvent('conditionboundedchanged', me);
        }, 1);
      }
    }
    else {
      me.bounded = bounded;
    }
  },

  /**
   * @public
   * @returns {boolean} true, if condition is satisfied
   */
  isSatisfied: function () {
    return this.satisfied;
  },

  /**
   * Sets {@link #satisfied} = true and fires 'satisfied' / 'unsatisfied' if satisfied changed.
   *
   * @protected
   * @param {boolean} satisfied if condition is satisfied
   */
  setSatisfied: function (satisfied) {
    var me = this;
    if (Ext.isDefined(me.satisfied)) {
      if (satisfied !== me.satisfied) {
        //<if debug>
//        me.logDebug((satisfied ? 'Satisfied:' : 'Unsatisfied:'), me);
        //</if>

        me.satisfied = satisfied;
        me.fireEvent(satisfied ? 'satisfied' : 'unsatisfied', me);
        Ext.defer(function () {
          NX.getApplication().getStateController().fireEvent('conditionstatechanged', me);
        }, 1);
      }
    }
    else {
      me.satisfied = satisfied;
    }
  },

  /**
   * Additionally, {@link #bind}s when first listener added.
   *
   * @override
   */
  addListener: function (ename, fn, scope, options) {
    var me = this;
    me.mixins.observable.addListener.call(me, ename, fn, scope, options);
    me.listenerCounter++;
    if (me.listenerCounter === 1) {
      me.bind();
    }
    // re-fire event so new listener has the chance to do its job
    me.fireEvent(me.satisfied ? 'satisfied' : 'unsatisfied', me);
  },

  /**
   * Additionally, {@link #unbind}s when no more listeners.
   *
   * @override
   */
  removeListener: function (ename, fn, scope) {
    var me = this;
    me.mixins.observable.removeListener.call(me, ename, fn, scope);
    me.listenerCounter--;
    if (me.listenerCounter === 0) {
      me.unbind();
    }
  }
});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/**
 * A {@link NX.util.condition.Condition} that is never satisfied.
 *
 * @since 3.0
 */
Ext.define('NX.util.condition.NeverSatisfied', {
  extend: 'NX.util.condition.Condition',

  /**
   * @override
   * @returns {String}
   */
  toString: function () {
    return this.self.getName() + '{ never satisfied }';
  }

});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext*/

/**
 * A {@link NX.util.condition.Condition} that is satisfied when all AND-ed {@link NX.util.condition.Condition}s
 * are satisfied.
 *
 * @since 3.0
 */
Ext.define('NX.util.condition.Conjunction', {
  extend: 'NX.util.condition.Condition',

  /**
   * Array of conditions to be AND-ed.
   *
   * @cfg {NX.util.condition.Condition[]}
   */
  conditions: undefined,

  /**
   * @override
   * @returns {NX.util.condition.Conjunction}
   */
  bind: function () {
    var me = this;

    if (!me.bounded) {
      me.callParent();
      me.evaluate();
      Ext.each(me.conditions, function (condition) {
        me.mon(condition, {
          satisfied: me.evaluate,
          unsatisfied: me.evaluate,
          scope: me
        });
      });
    }

    return me;
  },

  /**
   * @private
   */
  evaluate: function () {
    var me = this,
        satisfied = true;

    if (me.bounded) {
      Ext.each(me.conditions, function (condition) {
        satisfied = condition.satisfied;
        return satisfied;
      });
      me.setSatisfied(satisfied);
    }
  },

  /**
   * @overrdie
   * @returns {String}
   */
  toString: function () {
    return this.conditions.join(' AND ');
  }

});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext*/

/**
 * A {@link NX.util.condition.Condition} that is satisfied when a grid, specified by its selector, exists and has a
 * selection. Optionally, a function could be used to provide additional checking when grid has a selection.
 *
 * @since 3.0
 */
Ext.define('NX.util.condition.GridHasSelection', {
  extend: 'NX.util.condition.Condition',

  /**
   * A grid selector as specified by (@link Ext.ComponentQuery#query}.
   *
   * @cfg {String}
   */
  grid: undefined,

  /**
   * An optional function to be called when grid has a selection to perform additional checks on the
   * passed in model.
   *
   * @cfg {Function}
   */
  fn: undefined,

  /**
   * @override
   * @returns {NX.util.condition.GridHasSelection}
   */
  bind: function () {
    var me = this,
        components = {};

    if (!me.bounded) {
      components[me.grid] = {
        cellclick: function(list, td, cellIndex, model) {
          me.evaluate(list, model);
        },
        selection: me.evaluate,
        selectionchange: function(list, selected) {
          me.evaluate(list, selected ? selected[0] : null);
        },
        destroy: me.evaluate
      };
      Ext.app.EventBus.listen({ component: components }, me);
      me.callParent();
    }

    return me;
  },

  /**
   * @private
   */
  evaluate: function (cmp, selection) {
    var me = this,
        satisfied = false;

    if (me.bounded) {
      if (selection) {
        satisfied = true;
        if (Ext.isFunction(me.fn)) {
          satisfied = me.fn(selection) === true;
        }
      }
      me.setSatisfied(satisfied);
    }
  },

  /**
   * @override
   * @returns {String}
   */
  toString: function () {
    return this.self.getName() + '{ grid=' + this.grid + ' }';
  }

});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext, NX*/

/**
 * A {@link NX.util.condition.Condition} that is satisfied applying a function on a state value.
 *
 * @since 3.0
 */
Ext.define('NX.util.condition.WatchState', {
  extend: 'NX.util.condition.Condition',
  requires: [
    'NX.State'
  ],

  /**
   * @cfg {String}
   *
   * State value key.
   */
  key: undefined,

  /**
   * An optional function to be called when a state value changes. If not specified, a boolean check
   * against value will be performed.
   *
   * @cfg {Function}
   */
  fn: undefined,

  /**
   * @override
   * @returns {NX.util.condition.WatchState}
   */
  bind: function () {
    var me = this,
        controller, listeners;

    if (!me.bounded) {
      if (!Ext.isDefined(me.fn)) {
        me.fn = function (value) {
          return value;
        };
      }
      controller = NX.getApplication().getController('State');
      listeners = { scope: me };
      listeners[me.key.toLowerCase() + 'changed'] = me.evaluate;
      me.mon(controller, listeners);
      me.callParent();
      me.evaluate(NX.State.getValue(me.key));
    }

    return me;
  },

  /**
   * @private
   */
  evaluate: function (value, oldValue) {
    var me = this;

    if (me.bounded) {
      me.setSatisfied(me.fn(value, oldValue));
    }
  },

  /**
   * @override
   * @returns {String}
   */
  toString: function () {
    return this.self.getName() + '{ key=' + this.key + ' }';
  }

});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext*/

/**
 * A {@link NX.util.condition.Condition} that is satisfied when any of OR-ed {@link NX.util.condition.Condition}s
 * is satisfied.
 *
 * @since 3.0
 */
Ext.define('NX.util.condition.Disjunction', {
  extend: 'NX.util.condition.Condition',

  /**
   * Array of conditions to be OR-ed.
   *
   * @cfg {NX.util.condition.Condition[]}
   */
  conditions: undefined,

  /**
   * @override
   * @returns {NX.util.condition.Disjunction}
   */
  bind: function () {
    var me = this;

    if (!me.bounded) {
      me.callParent();
      me.evaluate();
      Ext.each(me.conditions, function (condition) {
        me.mon(condition, {
          satisfied: me.evaluate,
          unsatisfied: me.evaluate,
          scope: me
        });
      });
    }

    return me;
  },

  /**
   * @private
   */
  evaluate: function () {
    var me = this,
        satisfied = false;

    if (me.bounded) {
      Ext.each(me.conditions, function (condition) {
        if(condition.satisfied){
          satisfied = true;
          return false;
        }
        return true;
      });
      me.setSatisfied(satisfied);
    }
  },

  /**
   * @override
   * @returns {String}
   */
  toString: function () {
    return this.conditions.join(' OR ');
  }

});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext, NX*/

/**
 * A {@link NX.util.condition.Condition} that is satisfied when specified store has records.
 *
 * @since 3.0
 */
Ext.define('NX.util.condition.StoreHasRecords', {
  extend: 'NX.util.condition.Condition',

  /**
   * Id of store to be monitored.
   *
   * @cfg {String}
   */
  store: undefined,

  /**
   * @override
   * @returns {NX.util.condition.StoreHasRecords}
   */
  bind: function () {
    var me = this,
        store;

    if (!me.bounded) {
      store = NX.getApplication().getStore(me.store);
      me.mon(store, {
        datachanged: me.evaluate,
        beforeload: Ext.pass(me.evaluate, [undefined]),
        scope: me
      });
      me.callParent();
      me.evaluate(store);
    }

    return me;
  },

  /**
   * @private
   */
  evaluate: function (store) {
    var me = this;

    if (me.bounded) {
      me.setSatisfied(Ext.isDefined(store) && (store.getCount() > 0));
    }
  },

  /**
   * @override
   * @returns {String}
   */
  toString: function () {
    return this.self.getName() + '{ store=' + this.store + ' }';
  }

});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext*/

/**
 * A {@link NX.util.condition.Condition} that is satisfied when a {@link NX.view.SettingsForm}, specified by its
 * selector, exists and has a record. Optionally, a function could be used to provide additional checking when form has
 * a record.
 *
 * @since 3.0
 */
Ext.define('NX.util.condition.FormHasRecord', {
  extend: 'NX.util.condition.Condition',

  /**
   * A form selector as specified by (@link Ext.ComponentQuery#query}.
   *
   * @cfg {String}
   */
  form: undefined,

  /**
   * An optional function to be called when form has a record to perform additional checks on the passed in model.
   *
   * @cfg {Function}
   */
  fn: undefined,

  /**
   * @override
   * @returns {NX.util.condition.FormHasRecord}
   */
  bind: function () {
    var me = this,
        components = {}, queryResult;

    if (!me.bounded) {
      components[me.form] = {
        afterrender: me.evaluate,
        recordloaded: me.evaluate,
        destroy: me.evaluate
      };
      Ext.app.EventBus.listen({ component: components }, me);
      me.callParent();
      queryResult = Ext.ComponentQuery.query(me.form);
      if (queryResult && queryResult.length > 0) {
        me.evaluate(queryResult[0]);
      }
    }

    return me;
  },

  /**
   * @private
   */
  evaluate: function (form) {
    var me = this,
        satisfied = false,
        model;

    if (me.bounded) {
      if (Ext.isDefined(form) && form.isXType('form')) {
        model = form.getRecord();
        if (model) {
          satisfied = true;
          if (Ext.isFunction(me.fn)) {
            satisfied = me.fn(model) === true;
          }
        }
      }
      me.setSatisfied(satisfied);
    }
  },

  /**
   * @override
   * @returns {String}
   */
  toString: function () {
    return this.self.getName() + '{ form=' + this.form + ' }';
  }

});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext, NX*/

/**
 * A {@link NX.util.condition.Condition} that is satisfied when user has a specified permission.
 *
 * @since 3.0
 */
Ext.define('NX.util.condition.IsPermitted', {
  extend: 'NX.util.condition.Condition',

  /**
   * @private
   * @property {String}
   */
  permission: undefined,

  /**
   * @override
   * @returns {NX.util.condition.IsPermitted}
   */
  bind: function () {
    var me = this,
        controller;

    if (!me.bounded) {
      controller = NX.getApplication().getController('Permissions');
      me.mon(controller, {
        changed: me.evaluate,
        scope: me
      });
      me.callParent();
      me.evaluate();
    }

    return me;
  },

  /**
   * @private
   */
  evaluate: function () {
    var me = this;

    if (me.bounded) {
      me.setSatisfied(NX.Permissions.check(me.permission));
    }
  },

  /**
   * @override
   * @returns {String}
   */
  toString: function () {
    return this.self.getName() + '{ permission=' + this.permission + ' }';
  },

  /**
   * Sets permission and re-evaluate.
   *
   * @public
   * @param {String} permission
   */
  setPermission: function(permission) {
    this.permission = permission;
    this.evaluate();
  }

});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext*/

/**
 * Access point for available {NX.util.condition.Condition}s.
 *
 * @since 3.0
 */
Ext.define('NX.Conditions', {
  singleton: true,
  requires: [
    'NX.util.condition.Conjunction',
    'NX.util.condition.Disjunction',
    'NX.util.condition.FormHasRecord',
    'NX.util.condition.GridHasSelection',
    'NX.util.condition.IsPermitted',
    'NX.util.condition.StoreHasRecords',
    'NX.util.condition.WatchState',
    'NX.util.condition.NeverSatisfied'
  ],

  /**
   * @param {String} permission permission
   * @returns {NX.util.condition.IsPermitted}
   */
  isPermitted: function (permission) {
    return Ext.create('NX.util.condition.IsPermitted', { permission: permission });
  },

  /**
   * @param {String} store id of store that should have records
   * @returns {NX.util.condition.StoreHasRecords}
   */
  storeHasRecords: function (store) {
    return Ext.create('NX.util.condition.StoreHasRecords', { store: store });
  },

  /**
   * @param {String} grid a grid selector as specified by {@link Ext.ComponentQuery#query}
   * @param {Function} [fn] to be called when grid has a selection to perform additional checks on the passed in model
   * @returns {NX.util.condition.GridHasSelection}
   */
  gridHasSelection: function (grid, fn) {
    return Ext.create('NX.util.condition.GridHasSelection', { grid: grid, fn: fn });
  },

  /**
   * @param {String} form a {@link NX.view.SettingsForm} selector as specified by {@link Ext.ComponentQuery#query}
   * @param {Function} [fn] to be called when form has a record to perform additional checks on the passed in model
   * @returns {NX.util.condition.FormHasRecord}
   */
  formHasRecord: function (form, fn) {
    return Ext.create('NX.util.condition.FormHasRecord', { form: form, fn: fn });
  },

  /**
   * @param {String} key state value key
   * @param {Function} [fn] An optional function to be called when a state value changes. If not specified, a boolean
   * check against value will be performed
   * @returns {NX.util.condition.WatchState}
   */
  watchState: function (key, fn) {
    return Ext.create('NX.util.condition.WatchState', { key: key, fn: fn });
  },

  /**
   * Takes as parameter {@link NX.util.condition.Condition}s to be AND-ed.
   *
   * @returns {NX.util.condition.Conjunction}
   */
  and: function () {
    return Ext.create('NX.util.condition.Conjunction', { conditions: Array.prototype.slice.call(arguments) });
  },

  /**
   * Takes as parameter {@link NX.util.condition.Condition}s to be OR-ed.
   *
   * @returns {NX.util.condition.Disjunction}
   */
  or: function () {
    return Ext.create('NX.util.condition.Disjunction', { conditions: Array.prototype.slice.call(arguments) });
  },

  /**
   * No-op condition that is never satisfied.
   *
   * @returns {NX.util.condition.NeverSatisfied}
   */
  never: function() {
    return Ext.create('NX.util.condition.NeverSatisfied');
  }

});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext*/

/**
 * Stores developer panel controller.
 *
 * @since 3.0
 */
Ext.define('NX.controller.dev.Stores', {
  extend: 'NX.app.Controller',
  requires: [
    'Ext.data.StoreManager'
  ],

  refs: [
    {
      ref: 'stores',
      selector: 'nx-dev-stores'
    }
  ],

  /**
   * @override
   */
  init: function () {
    var me = this;

    me.listen({
      component: {
        'nx-dev-stores combobox': {
          change: me.onStoreSelected
        },
        'nx-dev-stores button[action=load]': {
          click: me.loadStore
        },
        'nx-dev-stores button[action=clear]': {
          click: me.clearStore
        }
      }
    });
  },

  /**
   * @private
   */
  onStoreSelected: function (combobox) {
    var storeId = combobox.getValue(),
        panel = this.getStores(),
        grid = panel.down('grid'),
        store, columns = [];

    if (storeId) {
      store = Ext.data.StoreManager.get(storeId);
      if (store) {
        Ext.each(store.model.getFields(), function (field) {
          columns.push({
            text: field.name,
            dataIndex: field.name,
            renderer: function(value) {
              if (Ext.isObject(value) || Ext.isArray(value)) {
                try {
                  return Ext.encode(value);
                }
                catch (e) {
                  console.error('Failed to encode value:', value, e);
                }
              }
              return value;
            }
          });
        });
        panel.removeAll(true);
        panel.add({
          xtype: 'grid',
          autoScroll: true,
          store: store,
          columns: columns
        });
      }
    }
  },

  /**
   * @private
   */
  loadStore: function () {
    var panel = this.getStores(),
        grid = panel.down('grid');

    if (grid) {
      grid.getStore().load();
    }
  },

  /**
   * @private
   */
  clearStore: function () {
    var panel = this.getStores(),
        grid = panel.down('grid');

    if (grid) {
      grid.getStore().removeAll();
    }
  }

});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext, NX*/

/**
 * Array related utils.
 *
 * @since 3.0
 */
Ext.define('NX.util.Array', {
  singleton: true,
  requires: [
    'Ext.Array'
  ],

  /**
   * Check if one array contains all elements from another.
   *
   * @public
   * @param {Array} array1
   * @param {Array} array2
   * @return {boolean} true if array1 contains all elements from array2.
   */
  containsAll: function(array1, array2) {
    var i;
    for (i=0; i<array2.length; i++) {
      if (!Ext.Array.contains(array1, array2[i])) {
        return false;
      }
    }
    return true;
  }
});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext*/

/**
 * Permissions helper.
 *
 * @since 3.0
 */
Ext.define('NX.Permissions', {
  singleton: true,
  requires: [
    'NX.Assert',
    'NX.util.Array'
  ],
  mixins: {
    logAware: 'NX.LogAware'
  },

  /**
   * Map between permission and permitted boolean value.
   *
   * @private
   */
  permissions: undefined,

  /**
   * Map of permission to implied calculated value.
   *
   * @private
   */
  impliedCache: undefined,

  /**
   * @public
   * @returns {boolean} True, if permissions had been set (loaded from server)
   */
  available: function() {
    return Ext.isDefined(this.permissions);
  },

  /**
   * Sets permissions.
   *
   * @public
   * @param {Object} permissions
   */
  setPermissions: function(permissions) {
    var me = this;

    // defensive copy
    me.permissions = Ext.clone(permissions);

    // reset implied cache
    me.impliedCache = {};

    //<if debug>
//    me.logDebug('Permissions installed');
    //</if>
  },

  /**
   * Resets all permissions.
   *
   * @public
   */
  resetPermissions: function() {
    var me = this;

    //<if debug>
//    me.logDebug('Resetting permissions');
    //</if>

    delete me.permissions;
    delete me.impliedCache;
  },

  /**
   * Check if the current subject has the expected permission.
   *
   * @public
   * @param {String} expectedPermission
   * @returns {boolean} True if user is authorized for expected permission.
   */
  check: function(expectedPermission) {
    var me = this,
        hasPermission = false;

    //<if assert>
//    NX.Assert.assert(expectedPermission.search('undefined') === -1, 'Invalid permission check:', expectedPermission);
    //</if>

    // short-circuit if permissions are not installed
    if (!me.available()) {
      return false;
    }

    // check for exact match first
    if (me.permissions[expectedPermission] !== undefined) {
      return me.permissions[expectedPermission];
    }

    // or use cached implied if we know it
    if (me.impliedCache[expectedPermission] !== undefined) {
      //<if debug>
//      me.logTrace('Using cached implied permission:', expectedPermission, 'is:', me.impliedCache[expectedPermission]);
      //</if>
      hasPermission = me.impliedCache[expectedPermission];
    }
    else {
      // otherwise calculate if permission is implied or not
      Ext.Object.each(me.permissions, function (permission, permitted) {
        if (permitted && me.implies(permission, expectedPermission)) {
          hasPermission = true;
          return false; // break
        }
        return true; // continue
      });

      // cache calculated implied
      me.impliedCache[expectedPermission] = hasPermission;

      //<if debug>
//      me.logTrace('Cached implied permission:', expectedPermission, 'is:', hasPermission);
      //</if>
    }

    return hasPermission;
  },

  /**
   * Returns true if permission1 implies permission2 using same logic as WildcardPermission.
   *
   * @private
   * @param {string} permission1    Granted permission
   * @param {string} permission2    Permission under-test
   * @return {boolean}
   */
  implies: function(permission1, permission2) {
    var parts1 = permission1.split(':'),
        parts2 = permission2.split(':'),
        part1, part2, i;

    //<if debug>
//    this.logTrace('Checking if:', permission1, 'implies:', permission2);
    //</if>

    for (i = 0; i < parts2.length; i++) {
      // If this permission has less parts than the other permission, everything after the number of parts contained
      // in this permission is automatically implied, so return true
      if (parts1.length - 1 < i) {
        return true;
      }
      else {
        part1 = parts1[i].split(',');
        part2 = parts2[i].split(',');
        if (!Ext.Array.contains(part1, '*') && !NX.util.Array.containsAll(part1, part2)) {
          return false;
        }
      }
    }

    // If this permission has more parts than the other parts, only imply it if all of the other parts are wildcards
    for (; i < parts1.length; i++) {
      part1 = parts1[i].split(',');
      if (!Ext.Array.contains(part1, '*')) {
        return false;
      }
    }

    return true;
  },

  /**
   * Check if any permission exists with given prefix and is permitted.
   *
   * This does not perform any implied checking, use with caution.
   *
   * @public
   * @param {string} prefix
   */
  checkExistsWithPrefix: function(prefix) {
    var me = this,
        exists = false;

    // short-circuit if permissions are not installed
    if (!me.available()) {
      return false;
    }

    Ext.Object.each(me.permissions, function(permission, permitted) {
      if (Ext.String.startsWith(permission, prefix) && permitted === true) {
        exists = true;
        return false; // break
      }
      return true; // continue
    });

    return exists;
  }
});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext*/

/**
 * Feature model.
 *
 * @since 3.0
 */
Ext.define('NX.model.Feature', {
  extend: 'Ext.data.Model',

  idProperty: 'path',

  // FIXME: define types so its clear what this data is!  Also consider comments for further clarity.

  fields: [
    { name: 'path' },
    { name: 'text' },
    {
      /**
       * Mode name.
       */
      name: 'mode',
      type: 'string',

      // FIXME: why is this defaulting to 'admin'?
      defaultValue: 'admin'
    },
    { name: 'weight', defaultValue: 100 },
    { name: 'group', defaultValue: false },
    { name: 'view', defaultValue: undefined },
    { name: 'helpKeyword', defaultValue: undefined },
    { name: 'visible', defaultValue: true },
    { name: 'expanded', defaultValue: true },
    { name: 'bookmark', defaultValue: undefined },
    { name: 'iconName', defaultValue: undefined },
    { name: 'description', defaultValue: undefined },
    { name: 'authenticationRequired', defaultValue: true }
  ]
});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext*/

/**
 * Unsaved changes window.
 *
 * @since 3.0
 */
Ext.define('NX.view.UnsavedChanges', {
  extend: 'NX.view.ModalDialog',
  requires: [
    'NX.I18n'
  ],
  alias: 'widget.nx-unsaved-changes',

  /**
   * Panel with content to be saved.
   *
   * @public
   */
  content: null,

  /**
   * Function to call if content is to be discarded.
   *
   * @public
   */
  callback: Ext.emptyFn,

  /**
   * @override
   */
  initComponent: function () {
    var me = this;

    me.title = NX.I18n.get('UnsavedChanges_Title');
    me.defaultFocus = 'nx-discard';

    me.setWidth(NX.view.ModalDialog.SMALL_MODAL);

    Ext.apply(me, {
      items: {
        xtype: 'panel',
        ui: 'nx-inset',
        html: NX.I18n.get('UnsavedChanges_Help_HTML'),
        buttonAlign: 'left',
        buttons: [
          {
            text: NX.I18n.get('UnsavedChanges_Discard_Button'),
            ui: 'nx-primary',
            itemId: 'nx-discard',
            handler: function () {
              // Discard changes and load new content
              me.content.resetUnsavedChangesFlag(true);
              me.callback();
              me.close();
            }
          },
          { text: NX.I18n.get('UnsavedChanges_Back_Button'), handler: me.close, scope: me }
        ]
      }
    });

    me.callParent();
  }

});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext*/

/**
 * Panel shown in case a bookmarked feature cannot be shown (403 like).
 *
 * @since 3.0
 */
Ext.define('NX.view.feature.NotVisible', {
  extend: 'Ext.container.Container',
  alias: 'widget.nx-feature-notvisible',
  requires: [
    'NX.I18n'
  ],

  cls: [
    'nx-feature-notvisible',
    'nx-hr'
  ],

  layout: {
    type: 'vbox',
    align: 'center',
    pack: 'center'
  },

  /**
   * @override
   */
  initComponent: function () {
    var me = this;

    me.items = [
      {
        xtype: 'label',
        cls: 'title',
        text: me.text
      },
      {
        xtype: 'label',
        cls: 'description',
        // TODO: i18n
        text: 'Sorry you are not permitted to use the feature you selected.  Please select another feature.'
      }
    ];

    me.callParent();
  }

});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext*/

/**
 * Feature store.
 *
 * @since 3.0
 */
Ext.define('NX.store.Feature', {
  extend: 'Ext.data.ArrayStore',
  model: 'NX.model.Feature',

  sorters: { property: 'path', direction: 'ASC' }
});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext*/

/**
 * Feature menu tree panel.
 *
 * @since 3.0
 */
Ext.define('NX.view.feature.Menu', {
  extend: 'Ext.tree.Panel',
  alias: 'widget.nx-feature-menu',

  width: 220,
  ui: 'nx-feature-menu',

  stateful: true,
  stateId: 'nx-feature-menu',

  store: 'FeatureMenu',
  rootVisible: false,
  lines: false
});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext*/

/**
 * Feature menu tree model.
 *
 * @since 3.0
 */
Ext.define('NX.model.FeatureMenu', {
  extend: 'Ext.data.TreeModel',

  // FIXME: define types so its clear what this data is!  Also consider comments for further clarity.

  // FIXME: Set ID for module... unsure what this should be in a tree though

  fields: [
    { name: 'path' },
    {
      /**
       * Mode name.
       */
      name: 'mode',
      type: 'string'
    },
    { name: 'text' },
    { name: 'weight', defaultValue: 100 },
    { name: 'group', defaultValue: false },
    { name: 'view' },
    { name: 'bookmark' },
    { name: 'iconName' }
  ]
});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext*/

/**
 * Feature menu tree store.
 *
 * @since 3.0
 */
Ext.define('NX.store.FeatureMenu', {
  extend: 'Ext.data.TreeStore',
  model: 'NX.model.FeatureMenu',

  root: {
    expanded: true,
    text: 'Features',
    children: []
  }

});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext, NX*/

/**
 * Features registration controller.
 *
 * @since 3.0
 */
Ext.define('NX.controller.Features', {
  extend: 'NX.app.Controller',

  models: [
    'Feature'
  ],
  stores: [
    'Feature',
    'FeatureMenu'
  ],

  statics: {
    /**
     * Always returns true.
     *
     * @returns {boolean}
     */
    alwaysVisible: function () {
      return true;
    },

    /**
     * Always returns false.
     *
     * @returns {boolean}
     */
    alwaysHidden: function () {
      return false;
    }
  },

  /**
   * Registers features.
   *
   * @param {Array/Object} features to be registered
   * @param {Ext.util.Observable} [owner] to be watched to automatically unregister the features if owner is destroyed
   */
  registerFeature: function (features, owner) {
    var me = this;

    if (features) {
      if (owner) {
        owner.on('destroy', Ext.pass(me.unregisterFeature, [features], me), me);
      }
      Ext.each(Ext.Array.from(features), function (feature) {
        var clonedFeature = Ext.clone(feature),
            path;

        if (!clonedFeature.path) {
          throw Ext.Error.raise('Feature missing path');
        }

        if (!clonedFeature.mode) {
          clonedFeature.mode = 'admin';
        }

        if (!clonedFeature.view && clonedFeature.group === true) {
          clonedFeature.view = 'NX.view.feature.Group';
        }

        // complain if there is no view configuration
        if (!clonedFeature.view) {
          me.logError('Missing view configuration for feature at path:', clonedFeature.path);
        }

        path = clonedFeature.path;
        if (path.charAt(0) === '/') {
          path = path.substr(1, path.length);
        }

        me.configureIcon(path, clonedFeature);

        path = clonedFeature.mode + '/' + path;
        clonedFeature.path = '/' + path;

        // auto-set bookmark
        if (!clonedFeature.bookmark) {
          clonedFeature.bookmark = NX.Bookmarks.encode(path).toLowerCase();
        }

        // generate default context-help keyword
        if (!clonedFeature.helpKeyword) {
          clonedFeature.helpKeyword = path.replace(/\//g, ' ').toLowerCase();
        }

        if (Ext.isDefined(clonedFeature.visible)) {
          if (!Ext.isFunction(clonedFeature.visible)) {
            if (clonedFeature.visible) {
              clonedFeature.visible = NX.controller.Features.alwaysVisible;
            }
            else {
              clonedFeature.visible = NX.controller.Features.alwaysHidden;
            }
          }
        }
        else {
          clonedFeature.visible = NX.controller.Features.alwaysVisible;
        }

        me.getStore('Feature').addSorted(me.getFeatureModel().create(clonedFeature));
      });
    }
  },

  /**
   * Un-registers features.
   *
   * @param {Object[]/Object} features to be unregistered
   */
  unregisterFeature: function (features) {
    var me = this;

    if (features) {
      Ext.each(Ext.Array.from(features), function (feature) {
        var clonedFeature = Ext.clone(feature),
            path, model;

        if (!clonedFeature.mode) {
          clonedFeature.mode = 'admin';
        }
        path = clonedFeature.path;
        if (path.charAt(0) === '/') {
          path = path.substr(1, path.length);
        }
        path = clonedFeature.mode + '/' + path;
        clonedFeature.path = '/' + path;

        model = me.getStore('Feature').getById(clonedFeature.path);
        if (model) {
          me.getStore('Feature').remove(model);
        }
      });
    }
  },

  /**
   * @private
   * @param feature
   */
  configureIcon: function (path, feature) {
    var defaultIconName = 'feature-' + feature.mode + '-' + path.toLowerCase().replace(/\//g, '-').replace(/\s/g, '');

    // inline icon registration for feature
    if (feature.iconConfig) {
      var icon = feature.iconConfig;
      delete feature.iconConfig;
      if (icon.name) {
        feature.iconName = icon.name;
      }
      else {
        icon.name = defaultIconName;
      }
      this.getApplication().getIconController().addIcon(icon);
    }

    // default icon name if not set
    if (!feature.iconName) {
      feature.iconName = defaultIconName;
    }
  }

});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext*/

/**
 * Store containing {@link NX.model.Feature} records for selected feature group (children of feature node).
 *
 * @since 3.0
 */
Ext.define('NX.store.FeatureGroup', {
  extend: 'Ext.data.ArrayStore',
  model: 'NX.model.Feature',

  sorters: { property: 'path', direction: 'ASC' }
});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext*/

/**
 * Panel shown in case a bookmarked feature is not found (404 like).
 *
 * @since 3.0
 */
Ext.define('NX.view.feature.NotFound', {
  extend: 'Ext.container.Container',
  alias: 'widget.nx-feature-notfound',
  requires: [
    'NX.I18n'
  ],

  cls: [
    'nx-feature-notfound',
    'nx-hr'
  ],

  layout: {
    type: 'vbox',
    align: 'center',
    pack: 'center'
  },

  /**
   * @override
   */
  initComponent: function () {
    var me = this;

    me.items = [
      {
        xtype: 'label',
        cls: 'title',
        text: me.path ? NX.I18n.format('Feature_NotFoundPath_Text', me.path) : NX.I18n.get('Feature_NotFound_Text')
      },
      {
        xtype: 'label',
        cls: 'description',
        // TODO: i18n
        text: 'Sorry the feature you have selected does not exist.  Please make another selection.'
      }
    ];

    me.callParent();
  }

});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext, NX*/

/**
 * Menu controller.
 *
 * @since 3.0
 */
Ext.define('NX.controller.Menu', {
  extend: 'NX.app.Controller',
  requires: [
    'NX.Bookmarks',
    'NX.controller.User',
    'NX.controller.Features',
    'NX.Permissions',
    'NX.Security',
    'NX.State',
    'NX.view.header.Mode',
    'NX.I18n'
  ],

  views: [
    'feature.Menu',
    'feature.NotFound',
    'feature.NotVisible',
    'UnsavedChanges'
  ],

  models: [
    'Feature'
  ],
  stores: [
    'Feature',
    'FeatureMenu',
    'FeatureGroup'
  ],

  refs: [
    {
      ref: 'featureMenu',
      selector: 'nx-feature-menu'
    },
    {
      ref: 'featureContent',
      selector: 'nx-feature-content'
    },
    {
      ref: 'headerPanel',
      selector: 'nx-header-panel'
    }
  ],

  /**
   * Currently selected mode name.
   *
   * @private
   * @type {String}
   */
  mode: undefined,

  /**
   * All available {@link NX.view.header.Mode modes}.
   *
   * @private
   * @type {Ext.util.MixedCollection}
   */
  availableModes: undefined,

  /**
   * @private
   * @type {Boolean}
   */
  bookmarkingEnabled: true,

  /**
   * Current selected path.
   *
   * @private {String}
   */
  currentSelectedPath: undefined,

  /**
   * True if menu should auto navigate to first available feature.
   *
   * @private {Boolean}
   */
  navigateToFirstFeature: false,

  /**
   * @override
   */
  init: function () {
    var me = this;

    // initialize privates
    me.availableModes = Ext.create('Ext.util.MixedCollection');

    me.getApplication().getIconController().addIcons({
      'feature-notfound': {
        file: 'exclamation.png',
        variants: ['x16', 'x32']
      }
    });

    me.listen({
      controller: {
        '#Permissions': {
          changed: me.refreshMenu
        },
        '#State': {
          changed: me.onStateChange
        },
        '#Bookmarking': {
          navigate: me.navigateTo
        },
        '#User': {
          beforesignout: me.warnBeforeSignOut,
          signout: me.onSignOut
        },
        '#Refresh': {
          beforerefresh: me.warnBeforeRefresh
        }
      },
      component: {
        'nx-feature-menu': {
          select: me.onSelection,
          itemclick: me.onItemClick,
          afterrender: me.onAfterRender,
          beforecellclick: me.warnBeforeMenuSelect
        },
        'nx-main #quicksearch': {
          beforesearch: me.warnBeforeSearch
        },
        '#breadcrumb button': {
          click: me.warnBeforeButtonClick
        },
        'nx-actions button[handler]': {
          click: me.warnBeforeButtonClick
        },
        'nx-actions menuitem[handler]': {
          click: me.warnBeforeButtonClick
        },
        'nx-header-mode': {
          afterrender: me.registerMode,
          destroy: me.unregisterMode,
          selected: me.warnBeforeModeSelect
        }
      },
      store: {
        '#Feature': {
          update: me.refreshMenu
        }
      }
    });

    me.addEvents(
        /**
         * Fires when a feature is selected.
         *
         * @event featureselected
         * @param {NX.model.Feature} selected feature
         */
        'featureselected'
    );

    // Warn people about refreshing or closing their browser when there are unsaved changes
    me.warnBeforeUnload();
  },

  /**
   * Unregister Application listener.
   *
   * @override
   */
  destroy: function() {
    var me = this;

    me.getApplication().un('controllerschanged', me.refreshMenu, me);

    me.callParent(arguments);
  },

  /**
   * Register as Application listener and rebuild menu.
   */
  onAfterRender: function () {
    var me = this;

    me.getApplication().on('controllerschanged', me.refreshMenu, me);
    me.refreshMenu();
  },

  /**
   * @public
   * @returns {NX.Bookmark} a bookmark for current selected feature (if any)
   */
  getBookmark: function () {
    var me = this,
        selection = me.getFeatureMenu().getSelectionModel().getSelection();

    return NX.Bookmarks.fromToken(selection.length ? selection[0].get('bookmark') : me.mode);
  },

  /**
   * Select a feature when the associated menu item is clicked
   *
   * @private
   */
  onItemClick: function (panel, featureMenuModel) {
    this.selectMenuItem(featureMenuModel, true);
  },

  /**
   * Select a feature when the associated menu item is selected. This differs
   * from onItemClick in that an already selected feature will not be reselected.
   *
   * @private
   */
  onSelection: function (panel, featureMenuModel) {
    this.selectMenuItem(featureMenuModel, false);
  },

  /**
   * (Re)select a feature
   *
   * @private
   */
  selectMenuItem: function (featureMenuModel, reselect) {
    var me = this,
      path = featureMenuModel.get('path');

    if (reselect || path !== me.currentSelectedPath || featureMenuModel.get('group')) {
      me.currentSelectedPath = path;

      //<if debug>
//      me.logInfo('Selected feature:', path);
      //</if>

      if (me.bookmarkingEnabled) {
        me.bookmark(featureMenuModel);
      }
      me.selectFeature(me.getStore('Feature').getById(featureMenuModel.get('path')));
      me.populateFeatureGroupStore(featureMenuModel);
    }
  },

  /**
   * @private
   */
  selectFeature: function (featureModel) {
    var path;

    if (featureModel) {
      path = featureModel.get('path');
      if (path && path.length > 0) {
        this.fireEvent('featureselected', featureModel);
      }
    }
  },

  /**
   * Updates the {@link NX.store.FeatureGroup} store with children of selected feature.
   *
   * @private
   * @param {NX.model.FeatureMenu} record
   */
  populateFeatureGroupStore: function (record) {
    var me = this,
        features = [],
        featureStore = me.getStore('Feature');

    // add all children of the record to the group store, but do not include the node for the current record
    record.eachChild(function (node) {
      node.cascadeBy(function (child) {
        features.push(featureStore.getById(child.get('path')));
      });
    });

    me.getStore('FeatureGroup').loadData(features);
  },

  /**
   * @private
   */
  navigateTo: function (bookmark) {
    var me = this,
        node, mode, feature, menuBookmark, queryIndex;

    if (bookmark) {
      // Get the path (minus an optional filter string)
      if (bookmark.getSegments().length) {
        queryIndex = bookmark.getSegment(0).indexOf('=');
        if (queryIndex !== -1) {
          menuBookmark = bookmark.getSegment(0).slice(0, bookmark.getSegment(0).indexOf('='));
        }
        else {
          menuBookmark = bookmark.getSegment(0);
        }
      }

      //<if debug>
//      me.logInfo('Navigate to:', menuBookmark);
      //</if>

      mode = me.getMode(bookmark);
      // if we are navigating to a new mode, sync it
      if (me.mode !== mode) {
        me.mode = mode;
        me.refreshModes();
      }
      if (menuBookmark) {
        node = me.getStore('FeatureMenu').getRootNode().findChild('bookmark', menuBookmark, true);
      }
      // in case that we do not have a bookmark to navigate to or we have to navigate to first feature,
      // find the first feature
      if (!node && (!Ext.isDefined(menuBookmark) || me.navigateToFirstFeature)) {
        if (!me.mode) {
          me.selectFirstAvailableMode();
          me.refreshModes();
        }
        node = me.getStore('FeatureMenu').getRootNode().firstChild;

        //<if debug>
//        me.logDebug('Automatically selected:', node.get('bookmark'));
        //</if>
      }
      // select the bookmarked feature in menu, if available
      if (node) {
        me.bookmarkingEnabled = me.navigateToFirstFeature;
        me.navigateToFirstFeature = false;
        me.getFeatureMenu().selectPath(node.getPath('text'), 'text', undefined, function () {
          me.bookmarkingEnabled = true;
        });
      }
      else {
        delete me.currentSelectedPath;
        // if the feature to navigate to is not available in menu check out if is hidden (probably no permissions)
        if (menuBookmark) {
          feature = me.getStore('Feature').findRecord('bookmark', menuBookmark, 0, false, false, true);
        }
        me.getFeatureMenu().getSelectionModel().deselectAll();
        if (feature) {
          if (feature.get('authenticationRequired') && NX.Permissions.available()) {
            //<if debug>
//            me.logDebug('Asking user to authenticate as feature exists but is not visible');
            //</if>

            NX.Security.askToAuthenticate();
          }
          me.selectFeature(me.createNotAvailableFeature(feature));
        }
        else {
          // as feature does not exist at all, show teh 403 like content
          me.selectFeature(me.createNotFoundFeature(menuBookmark));
        }
      }
    }
  },

  /**
   * @private
   */
  onSignOut: function () {
    this.navigateToFirstFeature = true;
  },

  /**
   * On a state change check features visibility and trigger a menu refresh if necessary.
   *
   * @private
   */
  onStateChange: function () {
    var me = this,
        shouldRefresh = false;

    me.getStore('Feature').each(function (feature) {
      var visible, previousVisible;
      if (feature.get('mode') === me.mode) {
        visible = feature.get('visible')();
        previousVisible = me.getStore('FeatureMenu').getRootNode().findChild('path', feature.get('path'), true) !== null;
        shouldRefresh = (visible !== previousVisible);
      }
      return !shouldRefresh;
    });

    if (shouldRefresh) {
      me.refreshMenu();
    }
  },

  /**
   * @private
   */
  bookmark: function (node) {
    var me = this,
        bookmark = node.get('bookmark');

    if (NX.Bookmarks.getBookmark().getToken() !== bookmark) {
      NX.Bookmarks.bookmark(NX.Bookmarks.fromToken(bookmark), me);
    }
  },

  /**
   * Refresh modes and feature menu.
   *
   * @public
   */
  refreshMenu: function () {
    var me = this;

    //<if debug>
//    me.logDebug('Refreshing menu; mode:', me.mode);
    //</if>

    me.refreshVisibleModes();
    me.refreshTree();
    me.navigateTo(NX.Bookmarks.getBookmark());
  },

  /**
   * Find mode switcher widget for given name.
   *
   * @private
   * @param {String} name
   * @returns {NX.view.header.Mode|undefined}
   */
  findModeSwitcher: function(name) {
    return this.availableModes.findBy(function(item) {
      return item.name === name;
    });
  },

  /**
   * Refreshes modes buttons based on the fact that there are features visible for that mode or not.
   * In case that current mode is no longer visible, auto selects a new one.
   *
   * @private
   */
  refreshVisibleModes: function () {
    var me = this,
        visibleModes = [],
        feature;

    me.getStore('Feature').each(function (rec) {
      feature = rec.getData();
      if (feature.visible() && !feature.group && visibleModes.indexOf(feature.mode) === -1) {
        visibleModes.push(feature.mode);
      }
    });

    //<if debug>
//    me.logDebug('Visible modes:', visibleModes);
    //</if>

    me.availableModes.each(function (mode) {
      mode.toggle(false, true);
      if (mode.autoHide) {
        if (visibleModes.indexOf(mode.name) > -1) {
          mode.show();
        }
        else {
          mode.hide();
        }
      }
    });

    me.refreshModeButtons();
  },

  /**
   * @private
   */
  refreshModeButtons: function () {
    var me = this,
        mode;

    me.availableModes.each(function (mode) {
      mode.toggle(false, true);
    });

    if (me.mode) {
      mode = me.findModeSwitcher(me.mode);
      if (!mode || mode.isHidden()) {
        delete me.mode;
      }
    }
    if (me.mode) {
      mode = me.findModeSwitcher(me.mode);
      mode.toggle(true, true);
    }
  },

  // NOTE: refreshTree() is only used externally by coreui.controller.Search

  /**
   * @public
   */
  refreshTree: function () {
    var me = this,
        menuTitle = me.mode,
        groupsToRemove = [],
        feature, segments, parent, child, mode;

    //<if debug>
//    me.logDebug('Refreshing tree; mode:', me.mode);
    //</if>

    Ext.suspendLayouts();

    mode = me.findModeSwitcher(me.mode);
    if (mode && mode.title) {
      menuTitle = mode.title;
    }
    me.getFeatureMenu().setTitle(menuTitle);

    me.getStore('FeatureMenu').getRootNode().removeAll();

    // create leafs and all parent groups of those leafs
    me.getStore('Feature').each(function (rec) {
      feature = rec.getData();
      // iterate only visible features
      if ((me.mode === feature.mode) && feature.visible()) {
        segments = feature.path.split('/');
        parent = me.getStore('FeatureMenu').getRootNode();
        for (var i = 2; i < segments.length; i++) {
          child = parent.findChild('path', segments.slice(0, i + 1).join('/'), false);
          if (child) {
            if (i < segments.length - 1) {
              child.data = Ext.apply(child.data, {
                leaf: false
              });
            }
          }
          else {
            if (i < segments.length - 1) {
              // create the group
              child = parent.appendChild({
                text: segments[i],
                leaf: false,
                // expand the menu by default
                expanded: true
              });
            }
            else {
              // create the leaf
              child = parent.appendChild(Ext.apply(feature, {
                leaf: true,
                iconCls: NX.Icons.cls(feature.iconName, 'x16'),
                qtip: feature.description
              }));
            }
          }
          parent = child;
        }
      }
    });

    // remove all groups without children
    me.getStore('FeatureMenu').getRootNode().cascadeBy(function (node) {
      if (node.get('group') && !node.hasChildNodes()) {
        groupsToRemove.push(node);
      }
    });
    Ext.Array.each(groupsToRemove, function (node) {
      node.parentNode.removeChild(node, true);
    });

    me.getStore('FeatureMenu').sort([
      { property: 'weight', direction: 'ASC' },
      { property: 'text', direction: 'ASC' }
    ]);

    Ext.resumeLayouts(true);
  },

  /**
   * @private
   */
  createNotAvailableFeature: function (feature) {
    return this.getFeatureModel().create({
      text: feature.get('text'),
      path: feature.get('path'),
      description: feature.get('description'),
      iconName: feature.get('iconName'),
      view: {
        xtype: 'nx-feature-notvisible',
        // FIXME: i18n
        text: feature.get('text') + ' feature is not available as '
            + (NX.State.getValue('user') ? ' you do not have the required permissions' : ' you are not logged in')
      },
      visible: NX.controller.Features.alwaysVisible
    });
  },

  /**
   * @private
   */
  createNotFoundFeature: function (bookmark) {
    return this.getFeatureModel().create({
      text: 'Not found',
      path: '/Not Found',
      description: bookmark,
      iconName: 'feature-notfound',
      view: {
        xtype: 'nx-feature-notfound',
        path: bookmark
      },
      visible: NX.controller.Features.alwaysVisible
    });
  },

  /**
   * @private
   */
  getMode: function (bookmark) {
    if (bookmark && bookmark.getSegment(0)) {
      return bookmark.getSegment(0).split('/')[0];
    }
    return undefined;
  },

  /**
   * Change mode.
   *
   * @public
   * @param {String} mode to change to
   */
  changeMode: function (mode) {
    var me = this;

    //<if debug>
//    me.logDebug('Mode changed:', mode);
    //</if>

    me.mode = mode;
    me.refreshTree();
    me.navigateTo(NX.Bookmarks.fromToken(me.getStore('FeatureMenu').getRootNode().firstChild.get('bookmark')));
    NX.Bookmarks.bookmark(me.getBookmark());
  },

  /**
   * Register a mode button.
   *
   * @private
   * @param {NX.view.header.Mode} mode
   */
  registerMode: function (mode) {
    this.availableModes.add(mode);
  },

  /**
   * Unregister a mode button.
   *
   * @private
   * @param {NX.view.header.Mode} mode
   */
  unregisterMode: function (mode) {
    this.availableModes.remove(mode);
  },

  /**
   * @private
   */
  selectFirstAvailableMode: function () {
    var me = this;
    me.availableModes.each(function (mode) {
      if (!mode.isHidden()) {
        me.mode = mode.name;
        return false;
      }
      return true;
    });

    //<if debug>
//    me.logDebug('Auto selecting mode:', me.mode);
    //</if>
  },

  /**
   * @private
   */
  refreshModes: function () {
    this.refreshModeButtons();
    this.refreshTree();
  },

  /**
   * Check for unsaved changes before opening a menu item.
   *
   * @private
   */
  warnBeforeMenuSelect: function(tree, td, cellIndex, record) {
    var me = this;

    return me.warnBeforeNavigate(
      function () {
        me.getFeatureMenu().getSelectionModel().select(record);
        me.getFeatureMenu().fireEvent('itemclick', me.getFeatureMenu(), record);
      }
    );
  },

  /**
   * Check for unsaved changes before switching modes.
   *
   * @private
   * @param {NX.view.header.Mode} mode
   */
  warnBeforeModeSelect: function(mode) {
    var me = this;

    var cb = function() {
      mode.toggle(true);
      me.changeMode(mode.name);
    };

    if (me.warnBeforeNavigate(cb)) {
      me.changeMode(mode.name);
    }
    else {
      mode.toggle(true);
    }
  },

  /**
   * Check for unsaved changes before doing a search.
   *
   * @private
   */
  warnBeforeSearch: function() {
    var me = this,
      button = me.getHeaderPanel().down('nx-header-quicksearch');

    return me.warnBeforeNavigate(
      function() {
        button.fireEvent('search', button, button.getValue());
      }
    );
  },

  /**
   * Check for unsaved changes before clicking a button.
   *
   * @private
   */
  warnBeforeButtonClick: function(button, e) {
    return this.warnBeforeNavigate(
      function() {
        button.handler.call(button.scope, button, e);
      }
    );
  },

  /**
   * Check for unsaved changes before refreshing the view.
   *
   * @private
   */
  warnBeforeRefresh: function() {
    var me = this,
      button = me.getHeaderPanel().down('nx-header-refresh');

    return me.warnBeforeNavigate(
      function() {
        button.fireEvent('click');
      }
    );
  },

  /**
   * Check for unsaved changes before signing out.
   *
   * @private
   */
  warnBeforeSignOut: function() {
    return this.warnBeforeNavigate(
      function() {
        NX.getApplication().getController('User').signOut();
      }
    );
  },

  /**
   * Check for unsaved changes. Warn the user, and stop or continue navigation.
   *
   * @private
   * @param {Function} callback
   */
  warnBeforeNavigate: function(callback) {
    var me = this,
      dirty = me.hasDirt(),
      content = me.getFeatureContent();

    // If true, we’ve already warned the user about the unsaved changes. Don’t warn again.
    if (content.discardUnsavedChanges) {
      // Reset the flag and continue with navigation
      content.resetUnsavedChangesFlag();
      return true;
    }

    // Load the content, but warn first if there are unsaved changes
    if (dirty) {
      // Show modal and stop navigation
      me.showUnsavedChangesModal(callback);
      return false;

    } else {
      // Continue with navigation
      return true;
    }
  },

  /**
   * Show warning modal about unsaved changes, and take action.
   *
   * @private
   * @param {Function} callback
   */
  showUnsavedChangesModal: function(callback) {
    var content = this.getFeatureContent();

    Ext.create('NX.view.UnsavedChanges', {
      content: content,
      callback: function() {
        // Run the callback
        callback();

        // Reset the unsaved changes flag
        content.resetUnsavedChangesFlag();
      }
    });
  },

  /**
   * Are any forms dirty?
   *
   * @private
   */
  hasDirt: function() {
    var dirty = false,
      forms = Ext.ComponentQuery.query('form[settingsForm=true]');

    // Check for dirty content
    if (forms.length !== 0) {
      Ext.Array.each(forms, function (form) {
        if (form.isDirty()) {
          dirty = true;
          return false; // break
        }
      });
    }

    return dirty;
  },

  /**
   * Warn people about refreshing or closing their browser when there are unsaved changes.
   *
   * @private
   */
  warnBeforeUnload: function() {
    var me = this;

    window.onbeforeunload = function() {
      if (me.hasDirt()) {
        return NX.I18n.get('Menu_Browser_Title');
      }
    };
  }
});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext, NX*/

/**
 * Header panel.
 *
 * @since 3.0
 */
Ext.define('NX.view.header.Panel', {
  extend: 'Ext.container.Container',
  alias: 'widget.nx-header-panel',
  requires: [
    'NX.I18n',
    'NX.State'
  ],

  cls: 'nx-header-panel',

  layout: {
    type: 'vbox',
    align: 'stretch',
    pack: 'start'
  },

  /**
   * @override
   */
  initComponent: function () {
    var me = this;

    me.items = [
      { xtype: 'nx-header-branding', hidden: true },
      {
        xtype: 'toolbar',

        // set height to ensure we have uniform size and not depend on what is in the toolbar
        height: 40,

        anchor: '100%',

        defaults: {
          scale: 'medium'
        },

        items: [
          { xtype: 'nx-header-logo' },
          {
            xtype: 'container',
            layout: {
              type: 'vbox',
              pack: 'center'
            },
            items: [
              {
                xtype: 'label',
                cls: 'productname',
                text: NX.I18n.get('Header_Panel_Logo_Text')
              },
              {
                xtype: 'label',
                cls: 'productspec',
                text: NX.State.getBrandedEditionAndVersion()
              }
            ]
          }
        ]
      }
    ];

    me.callParent();
  }
});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext, NX*/

/**
 * Remote {@link NX.util.log.Sink}.
 *
 * Sends events to server via Ext.Direct.
 *
 * @since 3.0
 */
Ext.define('NX.util.log.RemoteSink', {
  extend: 'NX.util.log.Sink',

  // default to disabled
  enabled: false,

  /**
   * @override
   */
  receive: function (event) {
    // copy event to transform message
    var copy = Ext.clone(event);
    copy.message = copy.message.join(' ');
    NX.direct.rapture_LogEvent.recordEvent(copy);
  }
});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext, NX*/

/**
 * Console {@link NX.util.log.Sink}.
 *
 * Emits events to the browser console.
 *
 * @since 3.0
 */
Ext.define('NX.util.log.ConsoleSink', {
  extend: 'NX.util.log.Sink',
  requires: [
    'NX.Console'
  ],

  // default to disabled
  enabled: false,

  /**
   * @override
   */
  receive: function (event) {
    NX.Console.recordEvent(event);
  }
});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext, NX*/

/**
 * Logging controller.
 *
 * @since 3.0
 * @see NX.util.log.Sink
 */
Ext.define('NX.controller.Logging', {
  extend: 'NX.app.Controller',
  requires: [
    'NX.Log',
    'NX.util.log.StoreSink',
    'NX.util.log.ConsoleSink',
    'NX.util.log.RemoteSink'
  ],
  mixins: {
    stateful: 'Ext.state.Stateful'
  },

  stores: [
    'LogEvent'
  ],

  /**
   * Map of named sinks.
   *
   * @private
   * @property {Object}
   * @readonly
   */
  sinks: {},

  /**
   * Array of configured sinks.
   *
   * Mirrors {@link #sinks} values, but in array form for faster evaluation.
   *
   * @private
   * @property {NX.util.log.Sink[]}
   * @readonly
   */
  sinkRefs: undefined,

  /**
   * Logging threshold.
   *
   * @private
   * @property {String}
   */
  threshold: 'debug',

  /**
   * @constructor
   */
  constructor: function () {
    this.mixins.stateful.constructor.call(this, {
      stateful: true,
      stateId: this.self.getName()
    });

    this.callParent(arguments);
    this.initState();
  },

  /**
   * @override
   */
  init: function () {
    this.sinks = {
      store: Ext.create('NX.util.log.StoreSink', this.getStore('LogEvent')),
      console: Ext.create('NX.util.log.ConsoleSink'),
      remote: Ext.create('NX.util.log.RemoteSink')
    };
    // build array of all sink objects for faster evaluation
    this.sinkRefs = Ext.Object.getValues(this.sinks);
  },

  /**
   * Attach to {@link NX.Log} helper.
   *
   * @override
   */
  onLaunch: function () {
    NX.Log.attach(this);
    this.logInfo('Attached');
  },

  /**
   * @override
   * @return {Object}
   */
  getState: function() {
    return {
      threshold: this.threshold
    };
  },

  /**
   * Returns sink by name, or undefined.
   *
   * @public
   * @param {String} name
   */
  getSink: function(name) {
    return this.sinks[name];
  },

  /**
   * Get the logging threshold.
   *
   * @public
   * @returns {String}
   */
  getThreshold: function () {
    return this.threshold;
  },

  /**
   * Set the logging threshold.
   *
   * @public
   * @param {String} threshold
   */
  setThreshold: function (threshold) {
    this.threshold = threshold;
    this.saveState();
  },

  /**
   * Mapping of {@link NX.model.LogLevel} weights.
   *
   * @private
   * @property {Object}
   */
  levelWeights: {
    all: 1,
    trace: 2,
    debug: 3,
    info: 4,
    warn: 5,
    error: 6,
    off: 7
  },

  /**
   * Check if given level exceeds configured threshold.
   *
   * @private
   * @param {String} level
   * @return {Boolean}
   */
  exceedsThreshold: function (level) {
    return this.levelWeights[level] >= this.levelWeights[this.threshold];
  },

  /**
   * Record a log-event.
   *
   * @public
   * @param event
   */
  recordEvent: function (event) {
    // ignore events that do not exceed threshold
    if (!this.exceedsThreshold(event.level)) {
      return;
    }

    // pass events to all enabled sinks
    for (var i=0; i<this.sinkRefs.length; i++) {
      if (this.sinkRefs[i].enabled) {
        this.sinkRefs[i].receive(event);
      }
    }
  }
});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext*/

/**
 * Icon model.
 *
 * @since 3.0
 */
Ext.define('NX.model.Icon', {
  extend: 'Ext.data.Model',

  idProperty: 'cls',
  fields: [
    { name: 'cls', type: 'string' },
    { name: 'name', type: 'string' },
    { name: 'file', type: 'string' },
    { name: 'variant', type: 'string' },
    { name: 'height', type: 'int' },
    { name: 'width', type: 'int' },
    { name: 'url', type: 'string' },
    { name: 'preload', type: 'boolean' }
  ]
});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext, NX*/

/**
 * Support for sections of the style guild.
 *
 * @since 3.0
 */
Ext.define('NX.view.dev.styles.StyleSection', {
  extend: 'Ext.panel.Panel',

  ui: 'nx-light',
  bodyPadding: '5px 5px 5px 5px',

  /**
   * Render a block of HTML.
   *
   * @protected
   */
  html: function(html, cfg) {
    var obj = {
      xtype: 'container',
      html: html
    };
    if (cfg) {
      Ext.apply(obj, cfg);
    }
    return obj;
  },

  /**
   * Render a label with HTML.
   *
   * @protected
   */
  label: function(html, cfg) {
    var obj = {
      xtype: 'label',
      html: html
    };
    if (cfg) {
      Ext.apply(obj, cfg);
    }
    return obj;
  }
});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext, NX*/

/**
 * Picker styles.
 *
 * @since 3.0
 */
Ext.define('NX.view.dev.styles.Pickers', {
  extend: 'NX.view.dev.styles.StyleSection',
  requires: [
    'Ext.data.ArrayStore'
  ],

  title: 'Pickers',

  /**
   * @protected
   */
  initComponent: function () {
    var me = this,
        store;

    store = Ext.create('Ext.data.ArrayStore', {
      fields: [
        'id',
        'name'
      ],
      data: [
        [ 'foo', 'Foo' ],
        [ 'bar', 'Bar' ],
        [ 'baz', 'Baz' ]
      ]
    });

    me.items = [
      {
        xtype: 'nx-itemselector',
        name: 'realms',
        buttons: ['up', 'add', 'remove', 'down'],
        fromTitle: 'Available',
        toTitle: 'Selected',
        store: store,
        valueField: 'id',
        displayField: 'name',
        delimiter: null
      }
    ];

    me.callParent();
  }
});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext*/

/**
 * List of current state.
 *
 * @since 3.0
 */
Ext.define('NX.view.dev.State', {
  extend: 'Ext.grid.Panel',
  alias: 'widget.nx-dev-state',

  title: 'State',
  store: 'State',
  emptyText: 'No values',
  viewConfig: {
    deferEmptyText: false
  },

  columns: [
    { text: 'key', dataIndex: 'key', width: 250 },
    { text: 'hash', dataIndex: 'hash' },
    { text: 'value', dataIndex: 'value', flex: 1,
      renderer: function (value) {
        return Ext.JSON.encode(value);
      }
    }
  ]
});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext, NX*/

/**
 * The foundation class for new drilldowns. Extend this.
 *
 * @since 3.0
 */
Ext.define('NX.view.drilldown.Drilldown', {
  extend: 'Ext.container.Container',
  alias: 'widget.nx-drilldown',
  itemId: 'nx-drilldown',

  requires: [
    'NX.Icons'
  ],

  // List of masters to use (xtype objects)
  masters: null,

  // List of actions to use in the detail view
  actions: null,

  items: [],

  /**
   * @override
   */
  initComponent: function() {
    var me = this;

    me.on('beforerender', me.loadDrilldown);

    me.callParent();
  },

  /**
   * @private
   * Initialize the items array of this component
   */
  loadDrilldown: function(me) {
    var items = [],
      views;

    // Normalize the list of masters. Clone the list to avoid memory leaks.
    if (!me.masters) {
      views = [];
    }
    else if (!Ext.isArray(me.masters)) {
      views = [Ext.clone(me.masters)];
    }
    else {
      views = Ext.Array.clone(me.masters);
    }

    if (!me.skipDetail) {
      if (me.detail) {
        // Use a custom detail panel
        views.push(me.detail);
      }
      else {
        // Use the default tab panel
        views.push(
            {
              xtype: 'nx-drilldown-details',
              header: false,
              plain: true,

              layout: {
                type: 'vbox',
                align: 'stretch',
                pack: 'start'
              },

              tabs: Ext.clone(me.tabs),
              actions: Ext.isArray(me.actions) ? Ext.Array.clone(me.actions) : me.actions
            }
        );
      }
    }

    // Stack all panels onto the items array
    for (var i = 0; i < views.length; ++i) {
      items.push(me.createDrilldownItem(i, views[i], undefined));
    }

    // Add components to the container
    me.add({
      xtype: 'container',

      defaults: {
        flex: 1
      },

      layout: {
        type: 'hbox',
        align: 'stretch'
      },

      items: items
    });

    // Add resize events
    me.addEvents('syncsize');
  },

  /**
   * @private
   * Create a new drilldown item
   */
  createDrilldownItem: function(index, browsePanel, createPanel) {
    return {
      xtype: 'nx-drilldown-item',
      itemClass: NX.Icons.cls(this.iconName) + (index === 0 ? '-x32' : '-x16'),
      items: [
        {
          xtype: 'container',
          layout: 'fit',
          itemId: 'browse' + index,
          items: browsePanel
        },
        {
          xtype: 'container',
          layout: 'fit',
          itemId: 'create' + index,
          items: createPanel
        },
        {
          type: 'container',
          layout: 'fit',
          itemId: 'nothin' + index
        }
      ]
    };
  }
});

// NOTE: Electing MIT license
/*global Ext*/

/*
 *	Notification extension for Ext JS 4.0.2+
 *	Version: 2.1.3
 *
 *	Copyright (c) 2011 Eirik Lorentsen (http://www.eirik.net/)
 *
 *	Follow project on GitHub: https://github.com/EirikLorentsen/Ext.ux.window.Notification
 *
 *	Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php) 
 *	and GPL (http://opensource.org/licenses/GPL-3.0) licenses.
 *
 */

Ext.define('Ext.ux.window.Notification', {
	extend: 'Ext.window.Window',
	alias: 'widget.uxNotification',

	cls: 'ux-notification-window',
	autoClose: true,
	autoHeight: true,
	plain: false,
	draggable: false,
	shadow: false,
	focus: Ext.emptyFn,

	// For alignment and to store array of rendered notifications. Defaults to document if not set.
	manager: null,

	useXAxis: false,

	// Options: br, bl, tr, tl, t, l, b, r
	position: 'br',

	// Pixels between each notification
	spacing: 6,

	// Pixels from the managers borders to start the first notification
	paddingX: 30,
	paddingY: 10,

	slideInAnimation: 'easeIn',
	slideBackAnimation: 'bounceOut',
	slideInDuration: 1500,
	slideBackDuration: 1000,
	hideDuration: 500,
	autoCloseDelay: 7000,
	stickOnClick: true,
	stickWhileHover: true,

	// Private. Do not override!
	isHiding: false,
	isFading: false,
	destroyAfterHide: false,
	closeOnMouseOut: false,

	// Caching coordinates to be able to align to final position of siblings being animated
	xPos: 0,
	yPos: 0,

	statics: {
		defaultManager: {
			el: null
		}
	},

	initComponent: function() {
		var me = this;

		// Backwards compatibility
		if (Ext.isDefined(me.corner)) {
			me.position = me.corner;
		}
		if (Ext.isDefined(me.slideDownAnimation)) {
			me.slideBackAnimation = me.slideDownAnimation;
		}
		if (Ext.isDefined(me.autoDestroyDelay)) {
			me.autoCloseDelay = me.autoDestroyDelay;
		}
		if (Ext.isDefined(me.autoHideDelay)) {
			me.autoCloseDelay = me.autoHideDelay;
		}
		if (Ext.isDefined(me.autoHide)) {
			me.autoClose = me.autoHide;
		}
		if (Ext.isDefined(me.slideInDelay)) {
			me.slideInDuration = me.slideInDelay;
		}
		if (Ext.isDefined(me.slideDownDelay)) {
			me.slideBackDuration = me.slideDownDelay;
		}
		if (Ext.isDefined(me.fadeDelay)) {
			me.hideDuration = me.fadeDelay;
		}

		// 'bc', lc', 'rc', 'tc' compatibility
		me.position = me.position.replace(/c/, '');

		me.updateAlignment(me.position);

		me.setManager(me.manager);

		me.callParent(arguments);
	},

	onRender: function() {
		var me = this;
		me.callParent(arguments);

		me.el.hover(
			function () {
				me.mouseIsOver = true;
			},
			function () {
				me.mouseIsOver = false;
				if (me.closeOnMouseOut) {
					me.closeOnMouseOut = false;
					me.close();
				}
			},
			me
		);

	},
	
	updateAlignment: function (position) {
		var me = this;

		switch (position) {
			case 'br':
				me.paddingFactorX = -1;
				me.paddingFactorY = -1;
				me.siblingAlignment = "br-br";
				if (me.useXAxis) {
					me.managerAlignment = "bl-br";
				} else {
					me.managerAlignment = "tr-br";
				}
				break;
			case 'bl':
				me.paddingFactorX = 1;
				me.paddingFactorY = -1;
				me.siblingAlignment = "bl-bl";
				if (me.useXAxis) {
					me.managerAlignment = "br-bl";
				} else {
					me.managerAlignment = "tl-bl";
				}
				break;
			case 'tr':
				me.paddingFactorX = -1;
				me.paddingFactorY = 1;
				me.siblingAlignment = "tr-tr";
				if (me.useXAxis) {
					me.managerAlignment = "tl-tr";
				} else {
					me.managerAlignment = "br-tr";
				}
				break;
			case 'tl':
				me.paddingFactorX = 1;
				me.paddingFactorY = 1;
				me.siblingAlignment = "tl-tl";
				if (me.useXAxis) {
					me.managerAlignment = "tr-tl";
				} else {
					me.managerAlignment = "bl-tl";
				}
				break;
			case 'b':
				me.paddingFactorX = 0;
				me.paddingFactorY = -1;
				me.siblingAlignment = "b-b";
				me.useXAxis = 0;
				me.managerAlignment = "t-b";
				break;
			case 't':
				me.paddingFactorX = 0;
				me.paddingFactorY = 1;
				me.siblingAlignment = "t-t";
				me.useXAxis = 0;
				me.managerAlignment = "b-t";
				break;
			case 'l':
				me.paddingFactorX = 1;
				me.paddingFactorY = 0;
				me.siblingAlignment = "l-l";
				me.useXAxis = 1;
				me.managerAlignment = "r-l";
				break;
			case 'r':
				me.paddingFactorX = -1;
				me.paddingFactorY = 0;
				me.siblingAlignment = "r-r";
				me.useXAxis = 1;
				me.managerAlignment = "l-r";
				break;
			}
	},
	
	getXposAlignedToManager: function () {
		var me = this;

		var xPos = 0;

		// Avoid error messages if the manager does not have a dom element
		if (me.manager && me.manager.el && me.manager.el.dom) {
			if (!me.useXAxis) {
				// Element should already be aligned vertically
				return me.el.getLeft();
			} else {
				// Using getAnchorXY instead of getTop/getBottom should give a correct placement when document is used
				// as the manager but is still 0 px high. Before rendering the viewport.
				if (me.position == 'br' || me.position == 'tr' || me.position == 'r') {
					xPos += me.manager.el.getAnchorXY('r')[0];
					xPos -= (me.el.getWidth() + me.paddingX);
				} else {
					xPos += me.manager.el.getAnchorXY('l')[0];
					xPos += me.paddingX;
				}
			}
		}

		return xPos;
	},

	getYposAlignedToManager: function () {
		var me = this;

		var yPos = 0;

		// Avoid error messages if the manager does not have a dom element
		if (me.manager && me.manager.el && me.manager.el.dom) {
			if (me.useXAxis) {
				// Element should already be aligned horizontally
				return me.el.getTop();
			} else {
				// Using getAnchorXY instead of getTop/getBottom should give a correct placement when document is used
				// as the manager but is still 0 px high. Before rendering the viewport.
				if (me.position == 'br' || me.position == 'bl' || me.position == 'b') {
					yPos += me.manager.el.getAnchorXY('b')[1];
					yPos -= (me.el.getHeight() + me.paddingY);
				} else {
					yPos += me.manager.el.getAnchorXY('t')[1];
					yPos += me.paddingY;
				}
			}
		}

		return yPos;
	},

	getXposAlignedToSibling: function (sibling) {
		var me = this;

		if (me.useXAxis) {
			if (me.position == 'tl' || me.position == 'bl' || me.position == 'l') {
				// Using sibling's width when adding
				return (sibling.xPos + sibling.el.getWidth() + sibling.spacing);
			} else {
				// Using own width when subtracting
				return (sibling.xPos - me.el.getWidth() - me.spacing);
			}
		} else {
			return me.el.getLeft();
		}

	},

	getYposAlignedToSibling: function (sibling) {
		var me = this;

		if (me.useXAxis) {
			return me.el.getTop();
		} else {
			if (me.position == 'tr' || me.position == 'tl' || me.position == 't') {
				// Using sibling's width when adding
				return (sibling.yPos + sibling.el.getHeight() + sibling.spacing);				
			} else {
				// Using own width when subtracting
				return (sibling.yPos - me.el.getHeight() - sibling.spacing);
			}
		}
	},

	getNotifications: function (alignment) {
		var me = this;

		if (!me.manager.notifications[alignment]) {
			me.manager.notifications[alignment] = [];
		}

		return me.manager.notifications[alignment];
	},

	setManager: function (manager) {
		var me = this;

		me.manager = manager;

		if (typeof me.manager == 'string') {
			me.manager = Ext.getCmp(me.manager);
		}

		// If no manager is provided or found, then the static object is used and the el property pointed to the body document.
		if (!me.manager) {
			me.manager = me.statics().defaultManager;

			if (!me.manager.el) {
				me.manager.el = Ext.getBody();
			}
		}
		
		if (typeof me.manager.notifications == 'undefined') {
			me.manager.notifications = {};
		}
	},
	
	beforeShow: function () {
		var me = this;

		if (me.stickOnClick) {
			if (me.body && me.body.dom) {
				Ext.fly(me.body.dom).on('click', function () {
					me.cancelAutoClose();
					me.addCls('notification-fixed');
				}, me);
			}
		}

		if (me.autoClose) {
			me.task = new Ext.util.DelayedTask(me.doAutoClose, me);
			me.task.delay(me.autoCloseDelay);
		}

		// Shunting offscreen to avoid flicker
		me.el.setX(-10000);
		me.el.setOpacity(1);
		
	},

	afterShow: function () {
		var me = this;

		me.callParent(arguments);

		var notifications = me.getNotifications(me.managerAlignment);

		if (notifications.length) {
			me.el.alignTo(notifications[notifications.length - 1].el, me.siblingAlignment, [0, 0]);
			me.xPos = me.getXposAlignedToSibling(notifications[notifications.length - 1]);
			me.yPos = me.getYposAlignedToSibling(notifications[notifications.length - 1]);
		} else {
			me.el.alignTo(me.manager.el, me.managerAlignment, [(me.paddingX * me.paddingFactorX), (me.paddingY * me.paddingFactorY)], false);
			me.xPos = me.getXposAlignedToManager();
			me.yPos = me.getYposAlignedToManager();
		}

		Ext.Array.include(notifications, me);

		// Repeating from coordinates makes sure the windows does not flicker into the center of the viewport during animation
		me.el.animate({
			from: {
				x: me.el.getX(),
				y: me.el.getY()
			},
			to: {
				x: me.xPos,
				y: me.yPos,
				opacity: 1
			},
			easing: me.slideInAnimation,
			duration: me.slideInDuration,
			dynamic: true
		});

	},
	
	slideBack: function () {
		var me = this;

		var notifications = me.getNotifications(me.managerAlignment);
		var index = Ext.Array.indexOf(notifications, me)

		// Not animating the element if it already started to hide itself or if the manager is not present in the dom
		if (!me.isHiding && me.el && me.manager && me.manager.el && me.manager.el.dom && me.manager.el.isVisible()) {

			if (index) {
				me.xPos = me.getXposAlignedToSibling(notifications[index - 1]);
				me.yPos = me.getYposAlignedToSibling(notifications[index - 1]);
			} else {
				me.xPos = me.getXposAlignedToManager();
				me.yPos = me.getYposAlignedToManager();
			}

			me.stopAnimation();

			me.el.animate({
				to: {
					x: me.xPos,
					y: me.yPos
				},
				easing: me.slideBackAnimation,
				duration: me.slideBackDuration,
				dynamic: true
			});
		}
	},

	cancelAutoClose: function() {
		var me = this;

		if (me.autoClose) {
			me.task.cancel();
		}
	},

	doAutoClose: function () {
		var me = this;

		if (!(me.stickWhileHover && me.mouseIsOver)) {
			// Close immediately
			me.close();
		} else {
			// Delayed closing when mouse leaves the component.
			me.closeOnMouseOut = true;
		}
	},

	removeFromManager: function () {
		var me = this;

		if (me.manager) {
			var notifications = me.getNotifications(me.managerAlignment);
			var index = Ext.Array.indexOf(notifications, me);
			if (index != -1) {
				// Requires Ext JS 4.0.2
				Ext.Array.erase(notifications, index, 1);

				// Slide "down" all notifications "above" the hidden one
				for (;index < notifications.length; index++) {
					notifications[index].slideBack();
				}
			}
		}
	},

	hide: function () {
		var me = this;

		if (me.isHiding) {
			if (!me.isFading) {
				me.callParent(arguments);
				// Must come after callParent() since it will pass through hide() again triggered by destroy()
				me.isHiding = false;
			}
		} else {
			// Must be set right away in case of double clicks on the close button
			me.isHiding = true;
			me.isFading = true;

			me.cancelAutoClose();

			if (me.el) {
				me.el.fadeOut({
					opacity: 0,
					easing: 'easeIn',
					duration: me.hideDuration,
					remove: me.destroyAfterHide,
					listeners: {
						afteranimate: function () {
							me.isFading = false;
							me.removeCls('notification-fixed');
							me.removeFromManager();
							me.hide(me.animateTarget, me.doClose, me);
						}
					}
				});
			}
		}

		return me;
	},

	destroy: function () {
		var me = this;
		if (!me.hidden) {
			me.destroyAfterHide = true;
			me.hide(me.animateTarget, me.doClose, me);
		} else {
			me.callParent(arguments);
		}
	}

});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext*/

/**
 * Notification window.
 *
 * @since 3.0
 */
Ext.define('NX.view.message.Notification', {
  extend: 'Ext.ux.window.Notification',
  alias: 'widget.nx-message-notification',

  minWidth: 200,
  maxWidth: 400,
  autoShow: true,

  manager: 'default',

  // top-right, but do not obscure the header toolbar
  position: 'tr',
  paddingX: 10,
  paddingY: 55,

  stickWhileHover: true,
  slideInDuration: 800,
  slideBackDuration: 1500,
  autoCloseDelay: 4000,
  slideInAnimation: 'elasticIn',
  slideBackAnimation: 'elasticIn'
});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext, NX*/

/**
 * Message controller.
 *
 * @since 3.0
 */
Ext.define('NX.controller.Message', {
  extend: 'NX.app.Controller',
  requires: [
    'NX.Icons'
  ],

  views: [
    'message.Notification'
  ],

  /**
   * @protected
   */
  init: function () {
    var me = this;

    me.getApplication().getIconController().addIcons({
      'message-default': {
        file: 'bell.png',
        variants: ['x16', 'x32'],
        preload: true
      },
      'message-primary': {
        file: 'information.png',
        variants: ['x16', 'x32'],
        preload: true
      },
      'message-danger': {
        file: 'exclamation.png',
        variants: ['x16', 'x32'],
        preload: true
      },
      'message-warning': {
        file: 'warning.png',
        variants: ['x16', 'x32'],
        preload: true
      },
      'message-success': {
        file: 'accept.png',
        variants: ['x16', 'x32'],
        preload: true
      }
    });
  },

  /**
   * Internal customization of {@link NX.view.message.Notification} window options.
   *
   * At the moment, mainly intended for use by functional tests that need to
   * override default settings.
   *
   * @internal
   * @property {Object}
   */
  windowOptions: {},

  /**
   * @public
   * @param {object} message
   * @param {string} message.type
   * @param {string} message.text
   */
  addMessage: function (message) {
    if (!message.type) {
      message.type = 'default';
    }

    message.timestamp = new Date();

    // show transient message notification
    if (!this.messageExists(message)) {
      var cfg = Ext.clone(this.windowOptions);
      this.getView('message.Notification').create(Ext.apply(cfg, {
        ui: 'nx-message-' + message.type,
        iconCls: NX.Icons.cls('message-' + message.type, 'x16'),
        title: Ext.String.capitalize(message.type),
        html: message.text
      }));
    }
  },

  /**
   * Query to see if the message is already displayed so that we can prevent duplicates.
   * @private
   * @param message
   */
  messageExists: function (message) {
    var selector = 'nx-message-notification[title=' + Ext.String.capitalize(message.type) + ']';
    var existingMessage = Ext.Array.filter(Ext.ComponentQuery.query(selector), function (foundMessage) {
          return Ext.String.trim(foundMessage.body.el.dom.innerText) == message.text;
        }
    );
    return existingMessage.length > 0;
  }
});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext*/

/**
 * List of permissions.
 *
 * @since 3.0
 */
Ext.define('NX.view.dev.Permissions', {
  extend: 'Ext.grid.Panel',
  requires: [
    'NX.Permissions'
  ],
  alias: 'widget.nx-dev-permissions',

  title: 'Permissions',
  store: 'Permission',
  emptyText: 'No permissions',

  viewConfig: {
    deferEmptyText: false,
    markDirty: false
  },

  columns: [
    { text: 'permission', dataIndex: 'id', flex: 1, editor: { xtype: 'textfield', allowBlank: false } },
    {
      xtype: 'nx-iconcolumn',
      text: 'Permitted',
      dataIndex: 'permitted',
      width: 100,
      align: 'center',
      editor: 'checkbox',
      iconVariant: 'x16',
      iconName: function (value) {
        return value ? 'permission-granted' : 'permission-denied';
      }
    }
  ],

  plugins: [
    { pluginId: 'editor', ptype: 'rowediting', clicksToEdit: 1, errorSummary: false },
    'gridfilterbox'
  ],

  tbar: [
    { xtype: 'button', text: 'Add', action: 'add' },
    { xtype: 'button', text: 'Delete', action: 'delete', disabled: true }
  ]
});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext, NX*/

/**
 * Font styles.
 *
 * @since 3.0
 */
Ext.define('NX.view.dev.styles.Fonts', {
  extend: 'NX.view.dev.styles.StyleSection',
  requires: [
    'Ext.XTemplate'
  ],

  title: 'Fonts',
  layout: {
    type: 'vbox',
    defaultMargins: {top: 4, right: 0, bottom: 0, left: 0}
  },

  /**
   * @protected
   */
  initComponent: function () {
    var me = this;

    var faceExampleTpl = Ext.create('Ext.XTemplate',
        '<div>',
        '<span class="nx-section-header">{text}</span>',
        '<p class="{clz}">',
        'Trusted applications at the speed of deployment<br/>',
        'abcdefghijklmnopqrstuvwxyz<br/>',
        'ABCDEFGHIJKLMNOPQRSTUVWXYZ<br/>',
        ',1234567890?¿¡;.:*@#£$%&/()=[]+',
        '</p>',
        '</div>'
    );

    function faceExample(name, clz) {
      return me.html(faceExampleTpl.apply({
          text: name,
          clz: clz
        })
      );
    }

    // Create a table
    var tableTemplate = Ext.create('Ext.XTemplate',
        '<table cellpadding="5">',
        '<thead>{thead}</thead>',
        '<tbody>{tbody}</tbody>',
        '</table>'
    );

    // Create a table head
    var theadTemplate = Ext.create('Ext.XTemplate',
        '<tpl for=".">',
        '<th>{.}</th>',
        '</tpl>'
    );

    // Create a table body
    var tbodyTemplate = Ext.create('Ext.XTemplate',
        '<tpl foreach=".">',
        '<tr>',
        '<td>{$}</td>',
        '<tpl for=".">',
        '<tpl if="clz">',
        '<td class="{clz}">{text}</td>',
        '<tpl else>',
        '<td>{.}</td>',
        '</tpl>',
        '</tpl>',
        '</tr>',
        '</tpl>'
    );

    me.items = [
      {
        xtype: 'panel',
        title: 'Faces',
        ui: 'nx-subsection',
        layout: {
          type: 'hbox',
          defaultMargins: {top: 0, right: 20, bottom: 0, left: 0}
        },
        items: [
          faceExample('Proxima Nova Regular', 'nx-proxima-nova-regular'),
          faceExample('Proxima Nova Bold', 'nx-proxima-nova-bold'),
          faceExample('Courier New', 'nx-courier-new-regular')
        ]
      },
      {
        xtype: 'panel',
        title: 'Styles',
        ui: 'nx-subsection',
        items: [
          me.html(tableTemplate.apply({
            thead: theadTemplate.apply(['Name', 'Description', 'Font & Weight', 'Use Cases', 'Pixels', 'Sample']),
            tbody: tbodyTemplate.apply({
              'h1': [
                'Header', 'Proxima Nova Light', 'Logo', '20', { text: 'Sonatype Nexus', clz: 'nx-sample-h1' }
              ],
              'h2': [
                'Header', 'Proxima Nova Bold', 'Page Title', '26', { text: 'Development', clz: 'nx-sample-h2' }
              ],
              'h3': [
                'Header', 'Proxima Nova Bold', 'Header', '22', { text: 'Development', clz: 'nx-sample-h3' }
              ],
              'h4': [
                'Header', 'Proxima Nova Bold', 'Sub-Header', '18', { text: 'Development', clz: 'nx-sample-h4' }
              ],
              'h5': [
                'Header', 'Proxima Nova Bold', 'Sub-Header', '13', { text: 'Development', clz: 'nx-sample-h5' }
              ],
              'p/ul/ol': [
                'Body', 'Proxima Nova Regular', 'Body text, lists, default size', '13', { text: 'Development', clz: 'nx-sample-body' }
              ],
              'code': [
                'Code', 'Courier New Regular', 'Code examples', '13', { text: 'Development', clz: 'nx-sample-code' }
              ],
              'utility': [
                'Small Text', 'Proxima Nova Regular', 'Labels, Side-Nav', '10', { text: 'Development', clz: 'nx-sample-utility' }
              ]
            })
          }))
        ]
      }
    ];

    me.callParent();
  }
});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext, NX*/

/**
 * An password **{@link Ext.form.field.Text}**.
 *
 * @since 3.0
 */
Ext.define('NX.ext.form.field.Password', {
  extend: 'Ext.form.field.Text',
  alias: 'widget.nx-password',

  inputType: 'password'
});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext, NX*/

/**
 * Helpers to open browser windows.
 *
 * @since 3.0
 */
Ext.define('NX.Windows', {
  singleton: true,
  requires: [
    'NX.Messages',
    'NX.I18n'
  ],
  mixins: {
    logAware: 'NX.LogAware'
  },

  /**
   * Open a new browser window.
   *
   * @public
   * @return Browser window object or {@code null} if unable to open.
   */
  open: function(url, name, specs, replace) {
    var win;

    // apply default window specs if omitted, helps keep windows user-controllable on most browsers
    if (specs === undefined) {
      specs = 'menubar=yes,location=yes,resizable=yes,scrollbars=yes,status=yes';
    }

    //<if debug>
//    this.logDebug('Opening window: url=' + url + ', name=' + name + ', specs=' + specs + ', replace=' + replace);
    //</if>

    win = NX.global.open(url, name, specs, replace);
    if (win === null) {
      NX.Messages.add({text: NX.I18n.get('Windows_Popup_Message'), type: 'danger'});
    }
    return win;
  }
});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext, NX*/

/**
 * About window.
 *
 * @since 3.0
 */
Ext.define('NX.view.AboutWindow', {
  extend: 'NX.view.ModalDialog',
  alias: 'widget.nx-aboutwindow',
  requires: [
    'NX.I18n',
    'NX.Icons',
    'NX.State',
    'NX.util.Url'
  ],

  cls: 'nx-aboutwindow',

  /**
   * @override
   */
  initComponent: function () {
    var me = this;

    me.layout = {
      type: 'vbox',
      align: 'stretch'
    };

    me.height = 480;
    me.width = NX.view.ModalDialog.LARGE_MODAL;

    me.title = NX.I18n.get('AboutWindow_Title');

    me.items = [
      {
        xtype: 'container',
        cls: 'summary',
        layout: {
          type: 'hbox',
          align: 'stretch'
        },
        items: [
          {
            xtype: 'component',
            cls: 'logo',
            html: NX.Icons.img('nexus', 'x100')
          },
          {
            xtype: 'nx-info',
            itemId: 'aboutInfo',
            flex: 1
          }
        ]
      },
      {
        xtype: 'tabpanel',
        ui: 'nx-light',
        flex: 1,
        items: [
          {
            title: NX.I18n.get('AboutWindow_About_Title'),
            xtype: 'uxiframe',
            src: NX.util.Url.urlOf('/COPYRIGHT.html')
          },
          {
            title: NX.I18n.get('AboutWindow_License_Tab'),
            xtype: 'uxiframe',
            src: NX.util.Url.urlOf('/LICENSE.html')
          }
        ]
      }
    ];

    me.buttons = [
      { text: NX.I18n.get('Button_Close'), action: 'close', ui: 'nx-primary', handler: function () { me.close(); }}
    ];
    me.buttonAlign = 'left';

    me.callParent();

    // populate initial details
    me.down('#aboutInfo').showInfo({
      'Version': NX.State.getVersion(),
      'Edition': NX.State.getEdition(),
      'Build Revision': NX.State.getBuildRevision(),
      'Build Timestamp': NX.State.getBuildTimestamp()
    });
  }

});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext, NX*/

/**
 * Help controller.
 *
 * @since 3.0
 */
Ext.define('NX.controller.Help', {
  extend: 'NX.app.Controller',
  requires: [
    'NX.Icons',
    'NX.I18n',
    'NX.Windows'
  ],

  views: [
    'header.Help',
    'AboutWindow'
  ],

  refs: [
    {
      ref: 'featureHelp',
      selector: 'nx-header-help menuitem[action=feature]'
    }
  ],

  /**
   * The base-url for help links.
   *
   * @private
   * @property {String}
   * @readonly
   */
  baseUrl: 'http://links.sonatype.com/products/nexus',

  /**
   * @private
   * @property {NX.model.Feature}
   */
  selectedFeature: undefined,

  /**
   * @override
   */
  init: function () {
    var me = this;

    me.getApplication().getIconController().addIcons({
      'help-support': {
        file: 'support.png',
        variants: ['x16', 'x32']
      },
      'help-issues': {
        file: 'bug.png',
        variants: ['x16', 'x32']
      },
      'help-manual': {
        file: 'book_picture.png',
        variants: ['x16', 'x32']
      },
      'help-community': {
        file: 'users_4.png',
        variants: ['x16', 'x32']
      },
      'help-kb': {
        file: 'brain_trainer.png',
        variants: ['x16', 'x32']
      }
    });

    me.listen({
      controller: {
        '#Menu': {
          featureselected: me.onFeatureSelected
        }
      },
      component: {
        'nx-header-help menuitem[action=feature]': {
          click: me.onFeatureHelp
        },
        'nx-header-help menuitem[action=about]': {
          click: me.onAbout
        },
        'nx-header-help menuitem[action=docs]': {
          click: me.onDocs
        },
        'nx-header-help menuitem[action=support]': {
          click: me.onSupport
        },
        'nx-header-help menuitem[action=issues]': {
          click: me.onIssues
        },
        'nx-header-help menuitem[action=community]': {
          click: me.onCommunity
        },
        'nx-header-help menuitem[action=kb]': {
          click: me.onKnowledgeBase
        }
      }
    });
  },

  /**
   * Update help menu content.
   *
   * @private
   * @param {NX.model.Feature} feature selected feature
   */
  onFeatureSelected: function (feature) {
    var me = this,
        text = feature.get('text'),
        iconName = feature.get('iconName'),
        featureHelp = me.getFeatureHelp();

    me.selectedFeature = feature;

    featureHelp.setText(NX.I18n.get('Help_Feature_Text') + text);
    featureHelp.setIconCls(NX.Icons.cls(iconName, 'x16'));
  },

  /**
   * @private
   * @param {String} section
   */
  openUrl: function(section) {
    NX.Windows.open(this.baseUrl + '/' + section);
  },

  /**
   * Create a help url for the given keyword.
   * @param keyword
   * @returns {string}
   */
  createUrl: function(keyword) {
    return this.baseUrl + '/docs-search/' + NX.State.getVersionMajorMinor() + '/' + keyword;
  },

  /**
   * @private
   */
  onFeatureHelp: function() {
    var me = this,
        keyword = me.selectedFeature.get('helpKeyword'),
        url = me.createUrl(keyword);

    NX.Windows.open(url);
  },

  /**
   * @private
   */
  onAbout: function() {
    Ext.widget('nx-aboutwindow');
  },

  /**
   * @private
   */
  onDocs: function() {
    NX.Windows.open(this.baseUrl + '/docs/' + NX.State.getVersionMajorMinor());
  },

  /**
   * @private
   */
  onSupport: function() {
    this.openUrl('support');
  },

  /**
   * @private
   */
  onIssues: function() {
    this.openUrl('issues');
  },

  /**
   * @private
   */
  onCommunity: function() {
    this.openUrl('community');
  },

  /**
   * @private
   */
  onKnowledgeBase: function() {
    this.openUrl('kb');
  }
});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext*/

/**
 * Developer Conditions grid.
 *
 * @since 3.0
 */
Ext.define('NX.view.dev.Conditions', {
  extend: 'Ext.grid.Panel',
  alias: 'widget.nx-dev-conditions',

  title: 'Conditions',
  store: 'NX.store.dev.Condition',
  emptyText: 'No condition',
  viewConfig: {
    deferEmptyText: false
  },

  columns: [
    { text: 'id', dataIndex: 'id', flex: 1 },
    { text: 'condition', dataIndex: 'condition', flex: 3 },
    {
      xtype: 'nx-iconcolumn',
      text: 'satisfied',
      dataIndex: 'satisfied',
      width: 80,
      align: 'center',
      iconVariant: 'x16',
      iconName: function (value) {
        return value ? 'permission-granted' : 'permission-denied';
      }
    }
  ],

  plugins: [
    'gridfilterbox'
  ],

  tbar : [
    { xtype: 'checkbox', itemId: 'showSatisfied', boxLabel: 'Show Satisfied', value: true },
    { xtype: 'checkbox', itemId: 'showUnsatisfied', boxLabel: 'Show Unsatisfied', value: true }
  ]

});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext*/

/**
 * A single panel in a drilldown series
 *
 * @since 3.0
 */

Ext.define('NX.view.drilldown.Item', {
  extend: 'Ext.panel.Panel',
  alias: 'widget.nx-drilldown-item',

  itemName: null,
  itemClass: null,
  itemBookmark: null,
  cardIndex: 0,

  layout: 'card',

  /**
   * @public
   * Set the name of this drilldown item (appears in the breadcrumb)
   */
  setItemName: function(text) {
    this.itemName = text;
  },

  /**
   * @public
   * Set the icon class of this drilldown item (appears in the breadcrumb)
   */
  setItemClass: function(cls) {
    this.itemClass = cls;
  },

  /**
   * @public
   * Set the page to load when the breadcrumb segment associated with this drilldown item is clicked
   */
  setItemBookmark: function(bookmark, scope) {
    this.itemBookmark = (bookmark ? { obj: bookmark, scope: scope } : null);
  },

  /**
   * @public
   * Set the currently selected card (will not change the active index by itself)
   */
  setCardIndex: function(index) {
    this.cardIndex = index;
  }
});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext*/

/**
 * Footer branding panel.
 *
 * @since 3.0
 */
Ext.define('NX.view.footer.Branding', {
  extend: 'Ext.container.Container',
  alias: 'widget.nx-footer-branding'

  // intentionally empty, placeholder for where branding footer content is dynamically inserted
});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext*/

/**
 * Logging dev-panel.
 *
 * @since 3.0
 */
Ext.define('NX.view.dev.Logging', {
  extend: 'Ext.grid.Panel',
  alias: 'widget.nx-dev-logging',

  title: 'Logging',
  store: 'LogEvent',
  emptyText: 'No events in buffer',
  viewConfig: {
    deferEmptyText: false,
    // allow browser text selection
    enableTextSelection: true
  },
  multiSelect: true,

  stateful: true,
  stateId: 'nx-dev-logging',

  columns: [
    {text: 'level', dataIndex: 'level'},
    {text: 'logger', dataIndex: 'logger', flex: 1},
    {
      text: 'message',
      dataIndex: 'message',
      flex: 3,
      renderer: function(value) {
        return value.join(' ');
      }
    },
    {text: 'timestamp', dataIndex: 'timestamp', width: 130}
  ],

  tbar: [
    {
      xtype: 'button',
      text: 'Clear events',
      action: 'clear',
      glyph: 'xf12d@FontAwesome' /* fa-eraser */
    },
    {
      xtype: 'button',
      text: 'Export selection',
      action: 'export',
      glyph: 'xf019@FontAwesome' /* fa-download */
    },
    '-',
    {
      xtype: 'label',
      text: 'Threshold:'
    },
    {
      xtype: 'combo',
      itemId: 'threshold',
      store: 'LogLevel',
      width: 80,
      displayField: 'name',
      valueField: 'name',
      queryMode: 'local',
      allowBlank: false,
      editable: false
    },
    '-',
    {
      xtype: 'checkbox',
      itemId: 'buffer',
      boxLabel: 'Buffer'
    },
    {
      xtype: 'numberfield',
      itemId: 'bufferSize',
      width: 50,
      allowDecimals: false,
      allowExponential: false,
      minValue: -1,
      maxValue: 999,
      value: 200,

      // listen for key events
      enableKeyEvents: true,

      // disable the spinner muck
      hideTrigger: true,
      mouseWheelEnabled: false,
      keyNavEnabled: false
    },
    '-',
    {
      xtype: 'checkbox',
      itemId: 'console',
      boxLabel: 'Mirror console'
    },
    {
      xtype: 'checkbox',
      itemId: 'remote',
      boxLabel: 'Remote events'
    }
  ],

  plugins: [
    {
      ptype: 'rowexpander',
      rowBodyTpl: Ext.create('Ext.XTemplate',
          '<table class="nx-rowexpander">',
          '<tr>',
          '<td class="x-selectable">{[this.render(values)]}</td>',
          '</tr>',
          '</table>',
          {
            compiled: true,
            render: function (values) {
              return Ext.encode(values.message);
            }
          })
    },
    {ptype: 'gridfilterbox'}
  ]
});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext*/

/**
 * A **{@link Ext.form.FieldSet}** that enable/disable contained items on expand/collapse.
 *
 * @since 3.0
 */
Ext.define('NX.ext.form.OptionalFieldSet', {
  extend: 'Ext.form.FieldSet',
  alias: 'widget.nx-optionalfieldset',
  cls: 'nx-optionalfieldset',

  /**
   * @override
   */
  initComponent: function () {
    var me = this;

    me.on('add', me.setupMonitorOnChange, me);

    me.callParent(arguments);

    // When state changes, repeat the evaluation
    me.on('collapse', me.enableContainedItems, me);
    me.on('expand', me.enableContainedItems, me);
    me.on('afterrender', me.enableContainedItems, me);
  },

  /**
   * @private
   */
  enableContainedItems: function (container, enable) {
    var me = this;

    if (!Ext.isDefined(enable)) {
      enable = !container.collapsed;
    }

    if (container.items) {
      container.items.each(function (item) {
        if (enable) {
          if (!item.disabledOnCollapse && !item.isXType('container')) {
            item.enable();
          }
          delete item.disabledOnCollapse;
          if (item.isXType('nx-optionalfieldset')) {
            if (item.collapsedOnCollapse === false) {
              item.expand();
            }
            delete item.collapsedOnCollapse;
          }
        }
        else {
          if (!Ext.isDefined(item.disabledOnCollapse)) {
            item.disabledOnCollapse = item.isDisabled();
          }
          if (!item.isXType('container')) {
            item.disable();
          }
          if (item.isXType('nx-optionalfieldset')) {
            if (!Ext.isDefined(item.collapsedOnCollapse)) {
              item.collapsedOnCollapse = item.collapsed;
            }
            item.collapse();
          }
        }
        if (!item.isXType('nx-optionalfieldset')) {
          me.enableContainedItems(item, enable);
        }
        if (Ext.isFunction(item.validate)) {
          item.validate();
        }
      });
    }
  },

  /**
   * @private
   * Watch for change events for contained components in order to automatically expand the toggle/checkbox.
   */
  setupMonitorOnChange: function(container, component) {
    var me = this;

    if (me === container) {
      me.mon(component, 'change', function(field, value) {
        if (value && me.collapsed) {
          me.expand();
          if (me.checkboxCmp) {
            me.checkboxCmp.resetOriginalValue();
          }
        }
      });
    }
  }

});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext, NX*/

/**
 * Message notification styles.
 *
 * @since 3.0
 */
Ext.define('NX.view.dev.styles.Messages', {
  extend: 'NX.view.dev.styles.StyleSection',
  requires: [
    'NX.Icons'
  ],

  title: 'Messages',
  layout: {
    type: 'hbox',
    defaultMargins: {top: 0, right: 4, bottom: 0, left: 0}
  },

  /**
   * @protected
   */
  initComponent: function () {
    var me = this;

    function message(type) {
      var style = 'nx-message-' + type;
      var icon = NX.Icons.cls('message-' + type, 'x16');
      return {
        xtype: 'window',
        ui: style,
        iconCls: icon,
        title: type,
        html: "ui: '" + style + "'",
        hidden: false,
        collapsible: false,
        floating: false,
        closable: false,
        draggable: false,
        resizable: false,
        width: 200
      };
    }

    me.items = [
      message('default'),
      message('primary'),
      message('danger'),
      message('warning'),
      message('success')
    ];

    me.callParent();
  }
});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext, NX*/

/**
 * Modal dialogs styles.
 *
 * @since 3.0
 */
Ext.define('NX.view.dev.styles.Modals', {
  extend: 'NX.view.dev.styles.StyleSection',
  requires: [
    'NX.I18n'
  ],

  title: 'Modals',

  layout: {
    type: 'hbox',
    defaultMargins: {top: 0, right: 4, bottom: 0, left: 0}
  },

  /**
   * @protected
   */
  initComponent: function () {
    var me = this;

    me.items = [
      {
        xtype: 'window',

        title: NX.I18n.get('SignIn_Title'),

        hidden: false,
        collapsible: false,
        floating: false,
        closable: false,
        draggable: false,
        resizable: false,
        width: 320,
        cls: 'fixed-modal',

        items: {
          xtype: 'form',
          ui: 'nx-inset',
          defaultType: 'textfield',
          defaults: {
            anchor: '100%'
          },
          items: [
            {
              name: 'username',
              itemId: 'username',
              emptyText: NX.I18n.get('SignIn_Username_Empty'),
              allowBlank: false,
              // allow cancel to be clicked w/o validating this to be non-blank
              validateOnBlur: false
            },
            {
              name: 'password',
              itemId: 'password',
              inputType: 'password',
              emptyText: NX.I18n.get('SignIn_Password_Empty'),
              allowBlank: false,
              // allow cancel to be clicked w/o validating this to be non-blank
              validateOnBlur: false
            }
          ],

          buttonAlign: 'left',
          buttons: [
            { text: NX.I18n.get('SignIn_Submit_Button'), formBind: true, bindToEnter: true, ui: 'nx-primary' },
            { text: NX.I18n.get('SignIn_Cancel_Button') }
          ]
        }
      },
      {
        xtype: 'window',

        title: 'Session',

        hidden: false,
        collapsible: false,
        floating: false,
        closable: false,
        draggable: false,
        resizable: false,
        width: 320,
        cls: 'fixed-modal',

        items: [
          {
            xtype: 'label',
            text: 'Session is about to expire',
            style: {
              'color': 'red',
              'font-size': '20px',
              'margin': '10px'
            }
          }
        ],
        buttons: [
          { text: 'Cancel' }
        ]
      }
    ];

    me.callParent();
  }
});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext, NX*/

/**
 * Menu styles.
 *
 * @since 3.0
 */
Ext.define('NX.view.dev.styles.Menus', {
  extend: 'NX.view.dev.styles.StyleSection',

  title: 'Menus',
  layout: {
    type: 'hbox',
    defaultMargins: {top: 0, right: 4, bottom: 0, left: 0}
  },

  /**
   * @protected
   */
  initComponent: function () {
    var me = this;

    function menu(text, iconCls, tooltip, action) {
      return {
        text: text,
        iconCls: iconCls,
        tooltip: tooltip,
        action: action
      };
    }

    me.items = [
      {
        xtype: 'menu',
        floating: false,
        items: [
          menu('Help for [Feature]', 'nx-icon-search-default-x16', 'Help for the current feature', 'feature'),
          '-',
          menu('About', 'nx-icon-nexus-x16', 'About Nexus Repository Manager', 'about'),
          menu('Documentation', 'nx-icon-help-manual-x16', 'Product documentation', 'docs'),
          menu('Knowledge Base', 'nx-icon-help-kb-x16', 'Knowledge base', 'kb'),
          menu('Community', 'nx-icon-help-community-x16', 'Community information', 'community'),
          menu('Issue Tracker', 'nx-icon-help-issues-x16', 'Issue and bug tracker', 'issues'),
          '-',
          menu('Support', 'nx-icon-help-support-x16', 'Product support', 'support')
        ]
      }
    ];

    me.callParent();
  }
});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext, NX*/

/**
 * Form styles.
 *
 * @since 3.0
 */
Ext.define('NX.view.dev.styles.Forms', {
  extend: 'NX.view.dev.styles.StyleSection',

  title: 'Forms',
  layout: {
    type: 'hbox',
    defaultMargins: {top: 0, right: 4, bottom: 0, left: 0}
  },

  /**
   * @protected
   */
  initComponent: function () {
    var me = this;

    me.items = [
      // basic form layout
      {
        xtype: 'form',
        items: [
          { xtype: 'textfield', value: 'Text Input', allowBlank: false, fieldLabel: '[Label]', helpText: '[Optional description text]', width: 200 },
          { xtype: 'textarea', value: 'Text Input', allowBlank: false, fieldLabel: '[Label]', helpText: '[Optional description text]', width: 200 },
          { xtype: 'checkbox', boxLabel: 'Checkbox', checked: true, fieldLabel: null, helpText: null },
          { xtype: 'radio', boxLabel: 'Radio Button', checked: true, fieldLabel: null, helpText: null }
        ],
        buttons: [
          { text: 'Submit', ui: 'nx-primary' },
          { text: 'Discard' }
        ]
      },

      // form example from extjs example/themes
      {
        xtype: 'form',
        frame: true,
        collapsible: true,

        tools: [
          {type:'toggle'},
          {type:'close'},
          {type:'minimize'},
          {type:'maximize'},
          {type:'restore'},
          {type:'gear'},
          {type:'pin'},
          {type:'unpin'},
          {type:'right'},
          {type:'left'},
          {type:'down'},
          {type:'refresh'},
          {type:'minus'},
          {type:'plus'},
          {type:'help'},
          {type:'search'},
          {type:'save'},
          {type:'print'}
        ],

        bodyPadding: '10 20',

        defaults: {
          anchor    : '98%',
          msgTarget : 'side',
          allowBlank: false
        },

        items: [
          {
            xtype: 'label',
            text: 'Plain Label'
          },
          {
            fieldLabel: 'TextField',
            xtype: 'textfield',
            name: 'someField',
            emptyText: 'Enter a value'
          },
          {
            fieldLabel: 'ComboBox',
            xtype: 'combo',
            store: ['Foo', 'Bar']
          },
          {
            fieldLabel: 'DateField',
            xtype: 'datefield',
            name: 'date'
          },
          {
            fieldLabel: 'TimeField',
            name: 'time',
            xtype: 'timefield'
          },
          {
            fieldLabel: 'NumberField',
            xtype: 'numberfield',
            name: 'number',
            emptyText: '(This field is optional)',
            allowBlank: true
          },
          {
            fieldLabel: 'TextArea',
            xtype: 'textareafield',
            name: 'message',
            cls: 'x-form-valid',
            value: 'This field is hard-coded to have the "valid" style (it will require some code changes to add/remove this style dynamically)'
          },
          {
            fieldLabel: 'Checkboxes',
            xtype: 'checkboxgroup',
            columns: [100, 100],
            items: [
              {boxLabel: 'Foo', checked: true, inputId: 'fooChkInput'},
              {boxLabel: 'Bar'}
            ]
          },
          {
            fieldLabel: 'Radios',
            xtype: 'radiogroup',
            columns: [100, 100],
            items: [
              {boxLabel: 'Foo', checked: true, name: 'radios'},
              {boxLabel: 'Bar', name: 'radios'}
            ]
          },
          {
            hideLabel: true,
            xtype: 'htmleditor',
            name: 'html',
            enableColors: false,
            value: 'Mouse over toolbar for tooltips.<br /><br />The HTMLEditor IFrame requires a refresh between a stylesheet switch to get accurate colors.',
            height: 110
          },
          {
            xtype: 'fieldset',
            title: 'Plain Fieldset',
            items: [
              {
                hideLabel: true,
                xtype: 'radiogroup',
                items: [
                  {boxLabel: 'Radio A', checked: true, name: 'radiogrp2'},
                  {boxLabel: 'Radio B', name: 'radiogrp2'}
                ]
              }
            ]
          },
          {
            xtype: 'fieldset',
            title: 'Collapsible Fieldset',
            collapsible: true,
            items: [
              { xtype: 'checkbox', boxLabel: 'Checkbox 1' },
              { xtype: 'checkbox', boxLabel: 'Checkbox 2' }
            ]
          },
          {
            xtype: 'fieldset',
            title: 'Checkbox Fieldset',
            checkboxToggle: true,
            items: [
              { xtype: 'radio', boxLabel: 'Radio 1', name: 'radiongrp1' },
              { xtype: 'radio', boxLabel: 'Radio 2', name: 'radiongrp1' }
            ]
          }
        ],

        buttons: [
          {
            text: 'Toggle Enabled',
            handler: function () {
              this.up('form').items.each(function (item) {
                item.setDisabled(!item.disabled);
              });
            }
          },
          {
            text: 'Reset Form',
            handler: function () {
              this.up('form').getForm().reset();
            }
          },
          {
            text: 'Validate',
            handler: function () {
              this.up('form').getForm().isValid();
            }
          }
        ]
      }
    ];

    me.callParent();
  }
});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext, NX*/

/**
 * Tab styles.
 *
 * @since 3.0
 */
Ext.define('NX.view.dev.styles.Tabs', {
  extend: 'NX.view.dev.styles.StyleSection',

  title: 'Tabs',
  layout: {
    type: 'vbox',
    defaultMargins: {top: 4, right: 0, bottom: 0, left: 0}
  },

  /**
   * @protected
   */
  initComponent: function () {
    var me = this;

    function tabStyle(name) {
      var proto = {
        xtype: 'tabpanel',
        width: 400,
        height: 80,
        activeTab: 0,
        ui: name,
        items: [
          { title: 'Settings', items: { xtype: 'panel', html: 'A simple tab', ui: 'nx-inset' } },
          { title: 'Routing', items: { xtype: 'panel', html: 'Another one', ui: 'nx-inset' } },
          { title: 'Smart Proxy', items: { xtype: 'panel', html: 'Yet another', ui: 'nx-inset' } },
          { title: 'Health Check', items: { xtype: 'panel', html: 'And one more', ui: 'nx-inset' } }
        ]
      };

      return {
        xtype: 'container',
        layout: {
          type: 'vbox',
          defaultMargins: {top: 4, right: 0, bottom: 0, left: 0}
        },

        items: [
          me.label('ui: ' + name),
          Ext.clone(proto),
          me.label('ui: ' + name + '; plain: true'),
          Ext.apply(proto, { plain: true })
        ]
      };
    }

    me.items = [
      tabStyle('default'),
      tabStyle('nx-light')
    ];

    me.callParent();
  }
});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext, NX*/

/**
 * Other styles.
 *
 * @since 3.0
 */
Ext.define('NX.view.dev.styles.Other', {
  extend: 'NX.view.dev.styles.StyleSection',

  title: 'Other',
  layout: {
    type: 'vbox',
    defaultMargins: {top: 4, right: 0, bottom: 0, left: 0}
  },

  /**
   * @protected
   */
  initComponent: function () {
    var me = this;

    me.items = [
      me.label('date picker'),
      {
        xtype: 'datepicker'
      },

      me.label('sliders'),
      {
        xtype: 'slider',
        hideLabel: true,
        value: 50,
        margin: '5 0 0 0',
        anchor: '100%'
      },
      {
        xtype: 'slider',
        vertical: true,
        value: 50,
        height: 100,
        margin: '5 0 0 0'
      }
    ];

    me.callParent();
  }
});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext, NX*/

/**
 * Panel styles.
 *
 * @since 3.0
 */
Ext.define('NX.view.dev.styles.Panels', {
  extend: 'NX.view.dev.styles.StyleSection',

  title: 'Panels',

  layout: {
    type: 'vbox',
    defaultMargins: {top: 4, right: 0, bottom: 0, left: 0}
  },

  /**
   * @protected
   */
  initComponent: function () {
    var me = this;

    function panelStyle(ui) {
      return {
        layout: {
          type: 'hbox',
          defaultMargins: {top: 0, right: 4, bottom: 0, left: 0}
        },

        items: [
          {
            xtype: 'panel',
            title: ui,
            ui: ui,
            height: 100,
            width: 200,
            items: [
              {
                xtype: 'container',
                html: 'ui: ' + ui
              }
            ]
          },
          {
            xtype: 'panel',
            title: ui + ' framed',
            ui: ui,
            frame: true,
            height: 100,
            width: 200,
            items: [
              {
                xtype: 'container',
                html: 'ui: ' + ui + '; frame: true'
              }
            ]
          }
        ]
      };
    }

    me.items = [
      panelStyle('default'),
      panelStyle('light'),

      // TODO: Consider adding flag to disable 'frame: true' example for subsection
      panelStyle('nx-subsection')
    ];

    me.callParent();
  }
});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext, NX*/

/**
 * Grid styles.
 *
 * @since 3.0
 */
Ext.define('NX.view.dev.styles.Grids', {
  extend: 'NX.view.dev.styles.StyleSection',
  requires: [
    'Ext.data.ArrayStore'
  ],

  title: 'Grids',

  /**
   * @protected
   */
  initComponent: function () {
    var me = this,
        store;

    store = Ext.create('Ext.data.ArrayStore', {
      fields: [
        'id',
        'name'
      ],
      data: [
        ['foo', 'Foo'],
        ['bar', 'Bar'],
        ['baz', 'Baz']
      ]
    });

    me.items = [
      {
        xtype: 'grid',
        store: store,
        height: 200,
        width: 200,
        columns: [
          { text: 'ID', dataIndex: 'id' },
          { text: 'Name', dataIndex: 'name' }
        ]
      }
    ];

    me.callParent();
  }
});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext, NX*/

/**
 * Tooltip styles.
 *
 * @since 3.0
 */
Ext.define('NX.view.dev.styles.Tooltips', {
  extend: 'NX.view.dev.styles.StyleSection',

  title: 'Tooltips',

  /**
   * @protected
   */
  initComponent: function () {
    var me = this;

    me.items = [
      { xtype: 'button', text: 'Mouse over me', tooltip: 'This is a tooltip' }
    ];

    me.callParent();
  }
});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext, NX*/

/**
 * Toolbar styles.
 *
 * @since 3.0
 */
Ext.define('NX.view.dev.styles.Toolbars', {
  extend: 'NX.view.dev.styles.StyleSection',

  title: 'Toolbars',

  /**
   * @protected
   */
  initComponent: function () {
    var me = this;

    function toolbar(scale) {
      var obj = {
        xtype: 'toolbar',
        items: [
          'text',
          {
            xtype: 'button',
            text: 'plain'
          },
          {
            xtype: 'button',
            text: 'with glyph',
            glyph: 'xf1b2@FontAwesome'
          },
          {
            xtype: 'button',
            text: 'with icon',
            iconCls: 'nx-icon-help-kb-x16'
          },
          ' ', // spacer
          {
            xtype: 'button',
            text: 'button menu',
            menu: [
              { text: 'plain' },
              { text: 'with glyph', glyph: 'xf059@FontAwesome' },
              { text: 'with icon', iconCls: 'nx-icon-help-kb-x16'}
            ]
          },
          '-', // sep
          {
            xtype: 'splitbutton',
            text: 'split button',
            menu: Ext.widget('menu', {
              items: [
                {text: 'Item 1'},
                {text: 'Item 2'}
              ]
            })
          },
          {
            xtype: 'button',
            enableToggle: true,
            pressed: true,
            text: 'toggle button'
          },
          '->', // spring
          {
            xtype: 'nx-searchbox',
            width: 200
          }
        ]
      };

      if (scale) {
        Ext.apply(obj, {
          defaults: {
            scale: scale
          }
        });
      }

      return obj;
    }

    me.items = [
      me.label('default'),
      toolbar(undefined),
      me.label('scale: medium'),
      toolbar('medium'),
      me.label('scale: large'),
      toolbar('large')
    ];

    me.callParent();
  }
});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext, NX*/

/**
 * Color styles.
 *
 * @since 3.0
 */
Ext.define('NX.view.dev.styles.Colors', {
  extend: 'NX.view.dev.styles.StyleSection',
  requires: [
    'Ext.XTemplate'
  ],

  title: 'Colors',

  /**
   * @protected
   */
  initComponent: function () {
    var me = this;

    var rowTemplate = Ext.create('Ext.XTemplate',
        '<div>',
        '<tpl for=".">',
        '<div class="nx-hbox">{.}</div>',
        '</tpl>',
        '</div>'
    );

    var columnTemplate = Ext.create('Ext.XTemplate',
        '<div>',
        '<tpl for=".">',
        '<div class="nx-vbox">{.}</div>',
        '</tpl>',
        '</div>'
    );

    var labelTemplate = Ext.create('Ext.XTemplate',
        '<span class="{clz}">{text}</span>'
    );

    var paletteTemplate = Ext.create('Ext.XTemplate',
        '<div style="margins: 0 20px 20px 0">',
        '<tpl for="."><div style="float: left;">{.}</div></tpl>',
        '</div>'
    );

    var colorTemplate = Ext.create('Ext.XTemplate',
        '<div>',
        '<div height="40" width="80" class="{clz}"></div>',
        '<div>{name}</div>',
        '<div>{value}</div>',
        '</div>'
    );

    me.items = [
      {
        xtype: 'container',
        layout: {
          type: 'vbox',
          padding: 4
        },
        items: [
          me.html(columnTemplate.apply([
            labelTemplate.apply({text: 'Shell', clz: 'nx-section-header' }),
            paletteTemplate.apply([
              colorTemplate.apply({clz: 'nx-color black', name: 'Black', value: '#000000'}),
              colorTemplate.apply({clz: 'nx-color night-rider', name: 'Night Rider', value: '#333333'}),
              colorTemplate.apply({clz: 'nx-color charcoal', name: 'Charcoal', value: '#444444'}),
              colorTemplate.apply({clz: 'nx-color dark-gray', name: 'Dark Gray', value: '#777777'}),
              colorTemplate.apply({clz: 'nx-color gray', name: 'Gray', value: '#AAAAAA'}),
              colorTemplate.apply({clz: 'nx-color light-gray', name: 'Light Gray', value: '#CBCBCB'}),
              colorTemplate.apply({clz: 'nx-color gainsboro', name: 'Gainsboro', value: '#DDDDDD'}),
              colorTemplate.apply({clz: 'nx-color smoke', name: 'Smoke', value: '#EBEBEB'}),
              colorTemplate.apply({clz: 'nx-color light-smoke', name: 'Light Smoke', value: '#F4F4F4'}),
              colorTemplate.apply({clz: 'nx-color white', name: 'White', value: '#FFFFFF'})
            ])
          ])),

          me.html(rowTemplate.apply([
            columnTemplate.apply([
              labelTemplate.apply({text: 'Severity', clz: 'nx-section-header' }),
              paletteTemplate.apply([
                colorTemplate.apply({clz: 'nx-color cerise', name: 'Cerise', value: '#DB2852'}),
                colorTemplate.apply({clz: 'nx-color sun', name: 'Sun', value: '#F2862F'}),
                colorTemplate.apply({clz: 'nx-color energy-yellow', name: 'Energy Yellow', value: '#F5C649'}),
                colorTemplate.apply({clz: 'nx-color cobalt', name: 'Cobalt', value: '#0047B2'}),
                colorTemplate.apply({clz: 'nx-color cerulean-blue', name: 'Cerulean Blue', value: '#2476C3'})
              ])
            ]),
            columnTemplate.apply([
              labelTemplate.apply({text: 'Forms', clz: 'nx-section-header' }),
              paletteTemplate.apply([
                colorTemplate.apply({clz: 'nx-color citrus', name: 'Citrus', value: '#84C900'}),
                colorTemplate.apply({clz: 'nx-color free-speech-red', name: 'Free Speech Red', value: '#C70000'})
              ])
            ]),
            columnTemplate.apply([
              labelTemplate.apply({text: 'Tooltip', clz: 'nx-section-header' }),
              paletteTemplate.apply([
                colorTemplate.apply({clz: 'nx-color energy-yellow', name: 'Energy Yellow', value: '#F5C649'}),
                colorTemplate.apply({clz: 'nx-color floral-white', name: 'Floral White', value: '#FFFAEE'})
              ])
            ])
          ])),

          me.html(columnTemplate.apply([
            labelTemplate.apply({text: 'Dashboard', clz: 'nx-section-header' }),
            paletteTemplate.apply([
              colorTemplate.apply({clz: 'nx-color pigment-green', name: 'Pigment Green', value: '#0B9743'}),
              colorTemplate.apply({clz: 'nx-color madang', name: 'Madang', value: '#B6E9AB'}),
              colorTemplate.apply({clz: 'nx-color venetian-red', name: 'Venetian Red', value: '#BC0430'}),
              colorTemplate.apply({clz: 'nx-color beauty-bush', name: 'Beauty Bush', value: '#EDB2AF'}),
              colorTemplate.apply({clz: 'nx-color navy-blue', name: 'Navy Blue', value: '#006BBF'}),
              colorTemplate.apply({clz: 'nx-color cornflower', name: 'Cornflower', value: '#96CAEE'}),
              colorTemplate.apply({clz: 'nx-color east-side', name: 'East Side', value: '#B087B9'}),
              colorTemplate.apply({clz: 'nx-color blue-chalk', name: 'Blue Chalk', value: '#DAC5DF'})
            ])
          ])),

          me.html(rowTemplate.apply([
            columnTemplate.apply([
              labelTemplate.apply({text: 'Buttons', clz: 'nx-section-header' }),
              paletteTemplate.apply([
                colorTemplate.apply({clz: 'nx-color white', name: 'White', value: '#FFFFFF'}),
                colorTemplate.apply({clz: 'nx-color light-gainsboro', name: 'Light Gainsboro', value: '#E6E6E6'}),
                colorTemplate.apply({clz: 'nx-color light-gray', name: 'Light Gray', value: '#CBCBCB'}),
                colorTemplate.apply({clz: 'nx-color silver', name: 'Silver', value: '#B8B8B8'}),
                colorTemplate.apply({clz: 'nx-color suva-gray', name: 'Suva Gray', value: '#919191'}),
                colorTemplate.apply({clz: 'nx-color gray', name: 'Gray', value: '#808080'})
              ]),
              paletteTemplate.apply([
                colorTemplate.apply({clz: 'nx-color denim', name: 'Denim', value: '#197AC5'}),
                colorTemplate.apply({clz: 'nx-color light-cobalt', name: 'Light Cobalt', value: '#0161AD'}),
                colorTemplate.apply({clz: 'nx-color dark-denim', name: 'Dark Denim', value: '#14629E'}),
                colorTemplate.apply({clz: 'nx-color smalt', name: 'Smalt', value: '#014E8A'}),
                colorTemplate.apply({clz: 'nx-color dark-cerulean', name: 'Dark Cerulean', value: '#0F4976'}),
                colorTemplate.apply({clz: 'nx-color prussian-blue', name: 'Prussian Blue', value: '#013A68'})
              ]),
              paletteTemplate.apply([
                colorTemplate.apply({clz: 'nx-color light-cerise', name: 'Light Cerise', value: '#DE3D63'}),
                colorTemplate.apply({clz: 'nx-color brick-red', name: 'Brick Red', value: '#C6254B'}),
                colorTemplate.apply({clz: 'nx-color old-rose', name: 'Old Rose', value: '#B2314F'}),
                colorTemplate.apply({clz: 'nx-color fire-brick', name: 'Fire Brick', value: '#9E1E3C'}),
                colorTemplate.apply({clz: 'nx-color shiraz', name: 'Shiraz', value: '#85253B'}),
                colorTemplate.apply({clz: 'nx-color falu-red', name: 'Falu Red', value: '#77162D'})
              ]),
              paletteTemplate.apply([
                colorTemplate.apply({clz: 'nx-color sea-buckthorn', name: 'Sea Buckthorn', value: '#F39244'}),
                colorTemplate.apply({clz: 'nx-color tahiti-gold', name: 'Tahiti Gold', value: '#DA792B'}),
                colorTemplate.apply({clz: 'nx-color zest', name: 'Zest', value: '#C17536'}),
                colorTemplate.apply({clz: 'nx-color rich-gold', name: 'Rich Gold', value: '#AE6122'}),
                colorTemplate.apply({clz: 'nx-color afghan-tan', name: 'Afghan Tan', value: '#925829'}),
                colorTemplate.apply({clz: 'nx-color russet', name: 'Russet', value: '#83491A'})
              ]),
              paletteTemplate.apply([
                colorTemplate.apply({clz: 'nx-color elf-green', name: 'Elf Green', value: '#23A156'}),
                colorTemplate.apply({clz: 'nx-color dark-pigment-green', name: 'Dark Pigment Green', value: '#0B893D'}),
                colorTemplate.apply({clz: 'nx-color salem', name: 'Salem', value: '#1C8145'}),
                colorTemplate.apply({clz: 'nx-color jewel', name: 'Jewel', value: '#096E31'}),
                colorTemplate.apply({clz: 'nx-color fun-green', name: 'Fun Green', value: '#156134'}),
                colorTemplate.apply({clz: 'nx-color dark-jewel', name: 'Dark Jewel', value: '#0C4F26'})
              ])
            ]),
            columnTemplate.apply([
              labelTemplate.apply({text: 'Font Awesome Icons', clz: 'nx-section-header' }),
              paletteTemplate.apply([
                colorTemplate.apply({clz: 'nx-color navy-blue', name: 'Navy Blue', value: '#006BBF'}),
                colorTemplate.apply({clz: 'nx-color smalt', name: 'Smalt', value: '#014E8A'}),
                colorTemplate.apply({clz: 'nx-color prussian-blue', name: 'Prussian Blue', value: '#013A68'})
              ]),
              paletteTemplate.apply([
                colorTemplate.apply({clz: 'nx-color white', name: 'White', value: '#FFFFFF'}),
                colorTemplate.apply({clz: 'nx-color gainsboro', name: 'Gainsboro', value: '#DDDDDD'}),
                colorTemplate.apply({clz: 'nx-color gray', name: 'Gray', value: '#AAAAAA'})
              ])
            ])
          ]))
        ]
      }
    ];

    me.callParent();
  }
});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext, NX*/

/**
 * Button styles.
 *
 * @since 3.0
 */
Ext.define('NX.view.dev.styles.Buttons', {
  extend: 'NX.view.dev.styles.StyleSection',
  requires: [
    'Ext.XTemplate'
  ],

  title: 'Buttons',
  layout: {
    type: 'vbox',
    defaultMargins: {top: 4, right: 0, bottom: 0, left: 0}
  },

  /**
   * @protected
   */
  initComponent: function () {
    var me = this;

    var colorSampleTpl = Ext.create('Ext.XTemplate',
        '<table>',
        '<tpl for=".">',
        '<tr>',
        '<td><div class="nx-color {.}"></div></td>',
        '<td><div style="padding: 0 10px 0 0">$color-{.}</div></td>',
        '</tr>',
        '</tpl>',
        '</table>'
    );

    function button(ui, text, disabled, pressed, menu) {
      var button = {
        xtype: 'button',
        text: text,
        ui: ui,
        margin: "0 10 10 0",
        width: 100
      };

      // Initialize optional button parameters
      if (disabled) {
        button['disabled'] = true;
      }
      if (pressed) {
        button['pressed'] = true;
        button['enableToggle'] = true;
      }
      if (menu) {
        button['menu'] = [
          { text: 'First' },
          '-',
          { text: 'Second' }
        ];
      }
      else {
        button['glyph'] = 'xf036@FontAwesome';
      }

      return button;
    }

    function buttonStyle(name, colors) {
      return {
        xtype: 'container',
        layout: {
          type: 'hbox',
          defaultMargins: {top: 0, right: 4, bottom: 0, left: 0}
        },
        items: [
          me.label('ui: ' + name, { width: 80 }),
          button(name, name, false, false, false),
          button(name, name, true, false, false),
          button(name, name, false, false, true),
          me.html(colorSampleTpl.apply(colors))
        ]
      };
    }

    me.items = [
      buttonStyle('default', ['white', 'light-gainsboro', 'light-gray', 'silver', 'suva-gray', 'gray']),
      buttonStyle('nx-plain', ['white', 'light-gainsboro', 'light-gray', 'silver', 'suva-gray', 'gray']),
      buttonStyle('nx-primary', ['denim', 'light-cobalt', 'dark-denim', 'smalt', 'dark-cerulean', 'prussian-blue']),
      buttonStyle('nx-danger', ['light-cerise', 'brick-red', 'old-rose', 'fire-brick', 'shiraz', 'falu-red']),
      buttonStyle('nx-warning', ['sea-buckthorn', 'tahiti-gold', 'zest', 'rich-gold', 'afghan-tan', 'russet']),
      buttonStyle('nx-success', ['elf-green', 'dark-pigment-green', 'salem', 'jewel', 'fun-green', 'dark-jewel'])
    ];

    me.callParent();
  }
});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext*/

/**
 * Visual style sheet for the application.
 *
 * @since 3.0
 */
Ext.define('NX.view.dev.Styles', {
  extend: 'Ext.panel.Panel',
  alias: 'widget.nx-dev-styles',
  requires: [
    'NX.view.dev.styles.Colors',
    'NX.view.dev.styles.Fonts',
    'NX.view.dev.styles.Buttons',
    'NX.view.dev.styles.Forms',
    'NX.view.dev.styles.Messages',
    'NX.view.dev.styles.Modals',
    'NX.view.dev.styles.Menus',
    'NX.view.dev.styles.Tabs',
    'NX.view.dev.styles.Pickers',
    'NX.view.dev.styles.Tooltips',
    'NX.view.dev.styles.Panels',
    'NX.view.dev.styles.Toolbars',
    'NX.view.dev.styles.Grids',
    'NX.view.dev.styles.Other'
  ],
  mixins: {
    logAware: 'NX.LogAware'
  },

  title: 'Styles',

  layout: {
    type: 'vbox',
    defaultMargins: {top: 0, right: 4, bottom: 10, left: 0}
  },

  defaults: {
    width: '100%'
  },

  /**
   * @protected
   */
  initComponent: function () {
    var me = this;

    // build guide components on activate as this is a heavy view
    me.on('activate', function () {
      var sections = [
        'Colors',
        'Fonts',
        'Buttons',
        'Forms',
        'Messages',
        'Modals',
        'Menus',
        'Tooltips',
        'Tabs',
        'Pickers',
        'Panels',
        'Toolbars',
        'Grids',
        'Other'
      ];

      me.logDebug('Creating style guide');

      // TODO: See if suspending layouts here actually helps anything?
      //Ext.AbstractComponent.suspendLayouts();
      //try {
      Ext.Array.each(sections, function (section) {
        me.add(Ext.create('NX.view.dev.styles.' + section));
      });
      //}
      //finally {
      //  Ext.AbstractComponent.resumeLayouts(true);
      //}

      me.logDebug('Style guide ready');
    });

    // and destroy on deactivate to save memory
    me.on('deactivate', function () {
      me.removeAll(true);

      me.logDebug('Destroyed style guide');
    });

    me.callParent();
  }
});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext*/

/**
 * Contains various buttons to execute actions for development/testing.
 *
 * @since 3.0
 */
Ext.define('NX.view.dev.Tests', {
  extend: 'Ext.panel.Panel',
  alias: 'widget.nx-dev-tests',

  title: 'Tests',

  layout: {
    type: 'vbox',
    padding: 4,
    defaultMargins: {top: 0, right: 0, bottom: 4, left: 0}
  },

  items: [
    { xtype: 'button', text: 'clear local state', action: 'clearLocalState' },
    { xtype: 'button', text: 'javascript error', action: 'testError' },
    { xtype: 'button', text: 'ext error', action: 'testExtError' },
    { xtype: 'button', text: 'message types', action: 'testMessages' },
    { xtype: 'button', text: 'toggle unsupported browser', action: 'toggleUnsupportedBrowser'},
    { xtype: 'button', text: 'show license expiry warning', action: 'showLicenseWarning'},
    { xtype: 'button', text: 'show quorum warning', action: 'showQuorumWarning'}
  ]
});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext*/

/**
 * Icon store.
 *
 * @since 3.0
 */
Ext.define('NX.store.Icon', {
  extend: 'Ext.data.Store',
  model: 'NX.model.Icon'
});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext*/

/**
 * A hostname **{@link Ext.form.field.Text}**.
 *
 * @since 3.3
 */
Ext.define('NX.ext.form.field.Hostname', {
  extend: 'Ext.form.field.Text',
  alias: 'widget.nx-hostname',

  vtype: 'nx-hostname',
  maskRe: /\S/
});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext*/

/**
 * A toolbar to hold actions for master/detail panels
 *
 * @since 3.0
 */
Ext.define('NX.view.drilldown.Actions', {
  extend: 'Ext.toolbar.Toolbar',
  alias: 'widget.nx-actions',
  cls: 'nx-actions',
  dock: 'top'
});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext*/

/**
 * **{@link Ext.form.field.Checkbox}** override, that changes default width overridden in {@link Ext.form.field.Base}.
 *
 * @since 3.0
 */
Ext.define('NX.ext.form.field.Checkbox', {
  override: 'Ext.form.field.Checkbox',

  width: undefined,

  initComponent: function () {
    var me = this;

    if (me.helpText && ! me.isHelpTextPlaced) {
      me.boxLabel = '<span class="nx-boxlabel">' + me.helpText + '</span>';
      me.isHelpTextPlaced = true;
    }

    me.callParent(arguments);
  }

});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext, NX*/

/**
 * Renders icon in a column.
 *
 * Icon must be registered first with NX.controller.Icon.
 *
 * @since 3.0
 */
Ext.define('NX.ext.grid.column.Icon', {
  extend: 'Ext.grid.column.Column',
  alias: 'widget.nx-iconcolumn',
  requires: [
    'Ext.DomHelper',
    'NX.Icons'
  ],

  hideable: false,
  sortable: false,
  menuDisabled: true,
  resizable: false,
  draggable: false,
  stateId: 'icon',

  /**
   * @cfg {String} iconVariant
   */
  /**
   * @cfg {Number} iconHeight
   */
  /**
   * @cfg {Number} iconWidth
   */
  /**
   * @cfg {String} iconNamePrefix
   */

  /**
   * @override
   */
  defaultRenderer: function(value, meta, record) {
    var me = this,
        cls,
        height = me.iconHeight,
        width = me.iconWidth,
        spec;

    cls = me.iconCls(value, meta, record);

    if (me.iconVariant) {
      switch (me.iconVariant) {
        case 'x16':
          height = width = 16;
          break;
        case 'x32':
          height = width = 32;
          break;
      }
    }

    spec = {
      tag: 'img',
      // NOTE: Chrome is displaying borders around <img> w/o src
      src: Ext.BLANK_IMAGE_URL,
      cls: cls,
      alt: me.iconName(value, meta, record)
    };
    if (height) {
      spec.height = height;
    }
    if (width) {
      spec.width = width;
    }

    return Ext.DomHelper.markup(spec);
  },

  /**
   * @protected
   */
  iconName: function(value, meta, record) {
    return value;
  },

  /**
   * @protected
   */
  iconCls: function(value, meta, record) {
    var me = this,
        name = me.iconName(value, meta, record);

    if (me.iconNamePrefix) {
      name = me.iconNamePrefix + name;
    }

    return NX.Icons.cls(name, me.iconVariant);
  }
});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext, NX*/

/**
 * Permission model.
 *
 * @since 3.0
 */
Ext.define('NX.model.Permission', {
  extend: 'Ext.data.Model',
  requires: [
    'NX.Permissions'
  ],

  idProperty: 'id',
  fields: [
    { name: 'id', type: 'string' },
    { name: 'permitted', type: 'bool', defaultValue: true }
  ]

});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext*/

/**
 * Permission store.
 *
 * @since 3.0
 */
Ext.define('NX.store.Permission', {
  extend: 'Ext.data.Store',
  model: 'NX.model.Permission',

  proxy: {
    type: 'direct',
    paramsAsHash: false,

    api: {
      read: 'NX.direct.rapture_Security.getPermissions'
    },

    reader: {
      type: 'json',
      root: 'data',
      idProperty: 'id',
      successProperty: 'success'
    }
  },

  sortOnLoad: true,
  sorters: { property: 'id', direction: 'ASC' }

});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext, NX*/

/**
 * Permissions developer panel controller.
 *
 * @since 3.0
 */
Ext.define('NX.controller.dev.Permissions', {
  extend: 'NX.app.Controller',
  requires: [
    'NX.Permissions'
  ],

  stores: [
    'Permission'
  ],
  models: [
    'Permission'
  ],
  views: [
    'dev.Permissions'
  ],

  refs: [
    {
      ref: 'grid',
      selector: 'nx-dev-permissions'
    }
  ],

  /**
   * @protected
   */
  init: function () {
    var me = this;

    me.getApplication().getIconController().addIcons({
      'permission-granted': {
        file: 'tick.png',
        variants: ['x16', 'x32']
      },
      'permission-denied': {
        file: 'cross.png',
        variants: ['x16', 'x32']
      }
    });

    me.listen({
      component: {
        'nx-dev-permissions': {
          beforeedit: me.beforeEdit,
          canceledit: me.cancelEdit,
          validateedit: me.update,
          selectionchange: me.onSelectionChange
        },
        'nx-dev-permissions button[action=add]': {
          click: me.add
        },
        'nx-dev-permissions button[action=delete]': {
          click: me.deleteModel
        }
      }
    });
  },

  /**
   * @private
   */
  add: function () {
    var me = this,
        grid = me.getGrid(),
        editor = grid.getPlugin('editor'),
        model = me.getPermissionModel().create();

    editor.cancelEdit();
    grid.getStore().insert(0, model);
    editor.startEdit(model, 0);
  },

  /**
   * @private
   */
  deleteModel : function () {
    var grid = this.getGrid(),
        editor = grid.getPlugin('editor');

    editor.cancelEdit();
    grid.getStore().remove(grid.getSelectionModel().getSelection());
  },

  /**
   * @private
   */
  beforeEdit: function (editor, context) {
    var idField = editor.editor.form.findField('id');

    if (context.record.get('id')) {
      idField.disable();
    }
    else {
      idField.enable();
    }
  },

  /**
   * @private
   */
  cancelEdit: function (editor, context) {
    if (!context.record.get('id')) {
      context.store.remove(context.record);
    }
  },

  /**
   * @private
   */
  update: function (editor, context) {
    context.record.set('permitted', context.newValues['permitted']);
    context.record.commit();
  },

  onSelectionChange: function (selectionModel, records) {
    var deleteButton = this.getGrid().down('button[action=delete]');

    deleteButton.setDisabled(!records.length);
  }

});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext*/

/**
 * An regular expression **{@link Ext.form.field.Text}**.
 *
 * @since 3.0
 */
Ext.define('NX.ext.form.field.RegExp', {
  extend: 'Ext.form.field.Text',
  alias: 'widget.nx-regexp',

  validator: function (value) {
    try {
      new RegExp(value);
    }
    catch (err) {
      return err.message;
    }
    return true;
  }

});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext*/

/**
 * Filter plugin for grids where filtering is handled remotely. 
 *
 * @since 3.0
 */
Ext.define('NX.ext.grid.plugin.RemoteFilterBox', {
  extend: 'Ext.AbstractPlugin',
  alias: 'plugin.remotegridfilterbox',
  requires: [
    'NX.I18n',
    'NX.util.Filter'
  ],

  /**
   * @cfg {String} emptyText Text to be used as grid empty text when no records are matching the filter. If text
   * contains "${filter}" it will be replaced with filter value.
   */

  /**
   * @override
   */
  init: function (grid) {
    var me = this,
        tbar = grid.getDockedItems('toolbar[dock="top"]')[0],
        items = [
          '->',
          {
            xtype: 'nx-searchbox',
            emptyText: NX.I18n.get('Grid_Plugin_FilterBox_Empty'),
            searchDelay: 200,
            width: 200,
            listeners: {
              search: me.onSearch,
              searchcleared: me.onSearchCleared,
              scope: me
            }
          }
        ];
    me.grid = grid;

    me.callParent(arguments);

    if (tbar) {
      tbar.add(items);
    }
    else {
      grid.addDocked([
        {
          xtype: 'nx-actions',
          dock: 'top',
          items: items
        }
      ]);
    }

    me.grid.on('filteringautocleared', me.syncSearchBox, me);
  },

  /**
   * Syncs filtering value with search box.
   *
   * @private
   */
  syncSearchBox: function () {
    var me = this;

    me.grid.down('nx-searchbox').setValue(me.filterValue);
  },

  /**
   * Clears the present search.
   */
  clearSearch: function() {
    var me = this;

    me.grid.down('nx-searchbox').clearSearch();
  },

  /**
   * @private
   * Filter grid.
   *
   * @private
   * @param {NX.ext.SearchBox} searchBox component
   * @param {String} value to be searched
   */
  onSearch: function(searchBox, value) {
    var grid = searchBox.up('grid'),
        store = grid.getStore(),
        emptyText = grid.getView().emptyTextFilter;

    if (!grid.emptyText) {
      grid.emptyText = grid.getView().emptyText;
    }
    grid.getView().emptyText = NX.util.Filter.buildEmptyResult(value, emptyText);
    grid.getSelectionModel().deselectAll();
    store.addFilter([
      {
        id: 'filter',
        property: 'filter',
        value: value
      }
    ]);
  },

  /**
   * Clear filtering on grid.
   *
   * @private
   * @param {NX.ext.SearchBox} searchBox component
   */
  onSearchCleared: function(searchBox) {
    var grid = searchBox.up('grid'),
        store = grid.getStore();

    if (grid.emptyText) {
      grid.getView().emptyText = grid.emptyText;
    }
    grid.getSelectionModel().deselectAll();
    // we have to remove filter directly as store#removeFilter() does not work when store#remoteFilter = true
    if (store.filters.removeAtKey('filter')) {
      if (store.filters.length) {
        store.filter();
      }
      else {
        store.clearFilter();
      }
    }
  }

});

// Fixes bug where hover on a submenu causes it to disappear
//
// NOTE: This is a bug specifically in Chrome v43. Once v44 is released, check to see if this is fixed.
// https://www.sencha.com/forum/showthread.php?301116-Submenus-disappear-in-Chrome-43-beta
//
Ext.define('Ext.patch.Ticket_17866', {
  override: 'Ext.menu.Menu',
  onMouseLeave: function(e) {
    var me = this;


    // BEGIN FIX
    var visibleSubmenu = false;
    me.items.each(function(item) {
      if(item.menu && item.menu.isVisible()) {
        visibleSubmenu = true;
      }
    });
    if(visibleSubmenu) {
      //console.log('apply fix hide submenu');
      return;
    }
    // END FIX


    me.deactivateActiveItem();


    if (me.disabled) {
      return;
    }


    me.fireEvent('mouseleave', me, e);
  }
});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext*/

/**
 * Log-level model.
 *
 * @since 3.0
 */
Ext.define('NX.model.LogLevel', {
  extend: 'Ext.data.Model',
  idProperty: 'name',
  fields: [
    { name: 'name', type: 'string' }
  ]
});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext*/

/**
 * Log-level store.
 *
 * @since 3.0
 */
Ext.define('NX.store.LogLevel', {
  extend: 'Ext.data.Store',
  model: 'NX.model.LogLevel',
  data: [
    { name: 'all' },
    { name: 'trace' },
    { name: 'debug' },
    { name: 'info' },
    { name: 'warn' },
    { name: 'error' },
    { name: 'off' }
  ]
});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext, NX*/

/**
 * Helper to facilitate browser-based file downloads.
 *
 * @since 3.0
 */
Ext.define('NX.util.DownloadHelper', {
  singleton: true,
  requires: [
    'NX.Messages',
    'NX.Windows',
    'NX.I18n'
  ],
  mixins: {
    logAware: 'NX.LogAware'
  },

  /**
   * ExtJS component identifier for nested iframe.
   *
   * @private
   */
  windowId: 'nx-download-frame',

  /**
   * Window names in IE are very picky, using '_' instead of '-' so that its its a valid javascript identifier.
   *
   * @private
   */
  windowName: 'nx_download_frame',

  /**
   * Get the hidden download frame.
   *
   * @private
   * @returns {Ext.Element}
   */
  getFrame: function() {
    var me = this, frame;

    // create the download frame if needed
    frame = Ext.get(me.windowId);
    if (!frame) {
      frame = Ext.getBody().createChild({
        tag: 'iframe',
        cls: 'x-hidden',
        id: me.windowId,
        name: me.windowName
      });

      //<if debug>
//      me.logDebug('Created download-frame:', frame);
      //</if>
    }

    return frame;
  },

  /**
   * @public
   * @param {String} url URL to download
   */
  downloadUrl: function (url) {
    var me = this;

    //<if debug>
//    me.logDebug('Downloading URL:', url);
    //</if>

    // resolve the download frame
    me.getFrame();

    // TODO: Consider changing this to a dynamic form or 'a' link and automatically submit/click
    // TODO: ... to make use of html5 download attribute and avoid needing to _open_ more windows
    // TODO: ... IE might not like this very much though?

    // TODO: Form method could be handy to GET/POST w/params vs link to just GET?

    // FIXME: This may produce js console warnings "Resource interpreted as Document but transferred with MIME type application/zip"

    // open new window in hidden download-from to initiate download
    if (NX.Windows.open(url, me.windowName) !== null) {
      NX.Messages.add({text: NX.I18n.get('Util_DownloadHelper_Download_Message'), type: 'success'});
    }
  }
});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext*/

/**
 * **{@link Ext.form.field.Base}** override, that changes default label width.
 *
 * @since 3.0
 */
Ext.define('NX.ext.form.field.Base', {
  override: 'Ext.form.field.Base',

  // FIXME: This is not the best way to ensure that forms are limited width
  width: 600,
  labelAlign: 'top',
  labelStyle: 'font-weight: bold;',
  msgTarget: 'under',

  /**
   * @cfg {boolean} [hideIfUndefined=false]
   * If field should auto hide in case it has no value. Functionality applies only for read only field.
   */
  hideIfUndefined: false,

  // used to track if helpText has already been placed
  isHelpTextPlaced: false,

  initComponent: function () {
    var me = this;

    if (me.helpText && !me.isHelpTextPlaced) {
      me.beforeSubTpl = '<span class="nx-boxlabel">' + me.helpText + '</span>';
      me.isHelpTextPlaced = true;
    }

    me.callParent(arguments);
  },

  setValue: function (value) {
    var me = this;
    me.callParent(arguments);
    if (me.readOnly && me.hideIfUndefined) {
      if (value) {
        me.show();
      }
      else {
        me.hide();
      }
    }
  }

});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext, NX*/

/**
 * Wizard step.
 *
 * @since 3.0
 * @abstract
 */
Ext.define('NX.wizard.Step', {
  alias: 'widget.nx-wizard-step',
  requires: [
    'NX.Assert'
  ],
  mixins: {
    observable: 'Ext.util.Observable',
    logAware: 'NX.LogAware'
  },

  config: {
    /**
     * Class name of screen.
     *
     * @cfg {String}
     */
    screen: undefined,

    /**
     * Automatically reset step when moving back.
     *
     * @cfg {Boolean}
     */
    resetOnBack: false,

    /**
     * Set to false to disable step.
     *
     * @cfg {Boolean}
     */
    enabled: true
  },

  /**
   * The controller which the step is attached to.
   *
   * @protected {NX.wizard.Controller}
   */
  controller: undefined,

  /**
   * Step name.
   *
   * @private {String}
   */
  name: undefined,

  /**
   * Screen class.
   *
   * @private {Ext.Class}
   */
  screenClass: undefined,

  /**
   * Screen xtype.
   *
   * @private {String}
   */
  screenXtype: undefined,

  /**
   * @constructor
   */
  constructor: function (config) {
    var me = this;
    me.mixins.observable.constructor.call(me, config);
    me.initConfig(config);

    me.name = Ext.getClassName(me);
    me.screenClass = Ext.ClassManager.get(me.screen);
    // TODO: Sort out if this is proper api to get xtype from class, this may not be portable to new versions of extjs
    me.screenXtype = me.screenClass.xtype;
  },

  /**
   * Returns step name.  Defaults to class-name.
   *
   * @return {String}
   */
  getName: function () {
    return this.name;
  },

  /**
   * Returns screen class.
   *
   * @return {Ext.Class}
   */
  getScreenClass: function () {
    return this.screenClass;
  },

  /**
   * Returns screen xtype.
   *
   * @return {String}
   */
  getScreenXtype: function () {
    return this.screenXtype;
  },

  /**
   * Returns screen component.
   *
   * @return {NX.wizard.Screen|undefined}
   */
  getScreenCmp: function () {
    var xtype = this.screenXtype,
        matches = Ext.ComponentQuery.query(xtype);

    if (matches.length === 0) {
      return undefined;
    }

    //<if assert>
//    NX.Assert.assert(matches.length === 1, 'Expected 1 component matching:', xtype, '; found:', matches.length);
    //</if>

    return matches[0];
  },

  /**
   * Create screen component or component configuration.
   *
   * @return {Object|NX.wizard.Screen}
   */
  createScreenCmp: function () {
    return {
      xtype: this.screenXtype
    };
  },

  //
  // Lifecycle
  //

  /**
   * Attach step to controller and initialize step.
   *
   * @param {NX.wizard.Controller} controller
   */
  attach: function (controller) {
    var me = this;

    me.controller = controller;

    // TODO: We could probably simplify this by logic in controller for nx-wizard-screen
    // TODO: and could probably do with some better eventing between screen + step and avoid this global listener bloat

    // setup core screen event handlers
    me.controller.control(me.screenXtype, {
      activate: {
        fn: me.doActivate,
        scope: me
      }
    });

    // initialize step
    me.init();

    //<if debug>
//    me.logDebug('Attached');
    //</if>
  },

  /**
   * Initialize state.
   *
   * @protected
   * @template
   */
  init: Ext.emptyFn,

  /**
   * @private
   * @type {boolean}
   */
  prepared: false,

  /**
   * @private
   */
  doActivate: function() {
    var me = this;

    //<if debug>
//    me.logDebug('Activate');
    //</if>

    if (!me.prepared) {
      //<if debug>
//      me.logDebug('Preparing');
      //</if>

      me.prepare();
      me.prepared = true;
    }
  },

  /**
   * Prepare state.
   *
   * @protected
   * @template
   */
  prepare: Ext.emptyFn,

  /**
   * Refresh state.
   *
   * @template
   */
  refresh: Ext.emptyFn,

  /**
   * Reset state.
   */
  reset: function() {
    this.prepared = false;
    this.enabled = true;

    //<if debug>
//    this.logDebug('Reset');
    //</if>
  },

  //
  // Events
  //

  /**
   * Helper to register listeners relative to screen component.
   *
   * Special handling for '$screen' selector to reference the screen itself.
   *
   * @protected
   * @param {Object} selectors
   */
  control: function (selectors) {
    var me = this,
        xtype = me.screenXtype,
        ctrl = me.controller;

    Ext.Object.each(selectors, function (selector, listeners) {
      var q;
      if (selector === '$screen') {
        q = xtype;
      }
      else {
        q = xtype + ' ' + selector;
      }
      ctrl.control(q, me.normalizeListeners(listeners));
    });
  },

  /**
   * Normalize listeners to ensure scope to step, unless otherwise configured.
   *
   * @private
   * @param {Object} listeners
   * @return {Object}
   */
  normalizeListeners: function(listeners) {
    var me = this,
        entry,
        listener;

    for (entry in listeners) {
      if (listeners.hasOwnProperty(entry)) {
        listener = listeners[entry];

        // if listener is a function convert to object and apply scope
        if (Ext.isFunction(listener)) {
          listener = {
            fn: listener,
            scope: me
          };
          listeners[entry] = listener;
        }
        else {
          // else apply scope if not specified
          Ext.applyIf(listener, {
            scope: me
          });
        }
      }
    }

    return listeners;
  },

  /**
   * Helper to register listeners on controller.
   *
   * @protected
   * @param {Object} to
   */
  listen: function (to) {
    var me = this,
        domain,
        selectors,
        selector,
        ctrl = me.controller;

    // normalize all listeners
    for (domain in to) {
      if (to.hasOwnProperty(domain)) {
        selectors = to[domain];
        for (selector in selectors) {
          if (selectors.hasOwnProperty(selector)) {
            me.normalizeListeners(selectors[selector]);
          }
        }
      }
    }

    ctrl.listen(to);
  },

  //
  // Context
  //

  /**
   * Get the shared context.
   *
   * @returns {Ext.util.MixedCollection}
   */
  getContext: function() {
    return this.controller.getContext();
  },

  /**
   * Get shared context value.
   *
   * @protected
   * @param {String} name
   * @return {Object|undefined}
   */
  get: function (name) {
    return this.getContext().get(name);
  },

  /**
   * Set shared context value.
   *
   * @protected
   * @param {String} name
   * @param {Object} value
   */
  set: function (name, value) {
    this.getContext().add(name, value);
  },

  /**
   * Unset shared context value.
   *
   * @protected
   * @param {String} name
   */
  unset: function (name) {
    this.getContext().removeAtKey(name);
  },

  //
  // Navigation
  //

  /**
   * Request move to next step.
   *
   * @protected
   */
  moveNext: function () {
    this.controller.moveNext();
  },

  /**
   * Request move to previous step.
   *
   * @protected
   */
  moveBack: function () {
    this.controller.moveBack();

    // optionally reset when moving back
    if (this.resetOnBack) {
      this.reset();
    }
  },

  /**
   * Request cancel.
   *
   * @protected
   */
  cancel: function () {
    this.controller.cancel();
  },

  /**
   * Inform finished.
   *
   * @protected
   */
  finish: function () {
    this.controller.finish();
  },

  //
  // Helpers
  //

  /**
   * Return a store from controller by name.
   *
   * @protected
   * @param {String} name
   * @returns {Ext.data.Store}
   */
  getStore: function(name) {
    return this.controller.getStore(name);
  },

  /**
   * Display content mask.
   *
   * @protected
   * @param {String} message
   */
  mask: function (message) {
    this.controller.mask(message);
  },

  /**
   * Remove content mask.
   *
   * @protected
   */
  unmask: function () {
    this.controller.unmask();
  }
});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext*/

// TODO: This is a placeholder view for what to display to the user when a license is required and missing or invalid

/**
 * Unlicensed uber mode panel.
 *
 * @since 3.0
 */
Ext.define('NX.view.Unlicensed', {
  extend: 'Ext.container.Container',
  alias: 'widget.nx-unlicensed',

  cls: 'nx-unlicensed',
  layout: 'border',

  items: [
    {
      xtype: 'nx-header-panel',
      region: 'north',
      collapsible: false
    },
    {
      xtype: 'panel',
      region: 'center',
      layout: {
        type: 'vbox',
        align: 'center',
        pack: 'center'
      },
      items: [
        {
          xtype: 'label',
          cls: 'title',
          html: 'Product License Required'
        },
        {
          xtype: 'label',
          cls: 'description',
          text: 'A license is required to use this product.'
        }
      ]
    },
    {
      xtype: 'nx-footer',
      region: 'south',
      hidden: false
    },
    {
      xtype: 'nx-dev-panel',
      region: 'south',
      collapsible: true,
      collapsed: true,
      resizable: true,
      resizeHandles: 'n',

      // keep initial constraints to prevent huge panels
      height: 300,

      // default to hidden, only show if debug enabled
      hidden: true
    }
  ]

});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext*/

/**
 * An field that allows ordering records in a store.
 *
 * @since 3.0
 */
Ext.define('NX.ext.form.field.ItemOrderer', {
  extend: 'Ext.ux.form.MultiSelect',
  alias: 'widget.nx-itemorderer',
  requires: [
    'Ext.button.Button',
    'Ext.ux.form.MultiSelect'
  ],

  /**
   * @cfg {Boolean} [hideNavIcons=false] True to hide the navigation icons
   */
  hideNavIcons: false,

  /**
   * @cfg {Array} buttons Defines the set of buttons that should be displayed on the right of MultiSelect field.
   * Defaults to <tt>['top', 'up', 'down', 'bottom']</tt>. These names are used to look up the button text labels in
   * {@link #buttonsText} and the glyph in {@link #buttonsGlyph}.
   * This can be overridden with a custom Array to change which buttons are displayed or their order.
   */
  buttons: ['top', 'up', 'down', 'bottom'],

  /**
   * @cfg {Object} buttonsText The tooltips for the {@link #buttons}.
   * Labels for buttons.
   */
  buttonsText: {
    top: 'Move to Top',
    up: 'Move Up',
    down: 'Move Down',
    bottom: 'Move to Bottom'
  },

  /**
   * @cfg {Object} buttonsGlyph The glyphs for the {@link #buttons}.
   * Glyphs for buttons.
   */
  buttonsGlyph: {
    top: 'xf102@FontAwesome' /* fa-angle-double-up */,
    up: 'xf106@FontAwesome' /* fa-angle-up */,
    down: 'xf107@FontAwesome' /* fa-angle-down */,
    bottom: 'xf103@FontAwesome' /* fa-angle-double-down */
  },

  layout: {
    type: 'hbox',
    align: 'stretch'
  },

  initComponent: function () {
    var me = this;

    me.ddGroup = me.id + '-dd';
    me.callParent();

    // bindStore must be called after the orderField has been created because
    // it copies records from our configured Store into the orderField's Store
    me.bindStore(me.store);
  },

  setupItems: function () {
    var me = this;

    me.orderField = Ext.create('Ext.ux.form.MultiSelect', {
      // We don't want the multiselects themselves to act like fields,
      // so override these methods to prevent them from including
      // any of their values
      submitValue: false,
      getSubmitData: function () {
        return null;
      },
      getModelData: function () {
        return null;
      },
      flex: 1,
      dragGroup: me.ddGroup,
      dropGroup: me.ddGroup,
      title: me.title,
      store: {
        model: me.store.model,
        data: []
      },
      displayField: me.displayField,
      valueField: me.valueField,
      disabled: me.disabled,
      listeners: {
        boundList: {
          scope: me,
          drop: me.syncValue
        }
      }
    });

    return [
      me.orderField,
      {
        xtype: 'container',
        margins: '0 4',
        layout: {
          type: 'vbox',
          pack: 'center'
        },
        items: me.createButtons()
      }
    ];
  },

  createButtons: function () {
    var me = this,
        buttons = [];

    if (!me.hideNavIcons) {
      Ext.Array.forEach(me.buttons, function (name) {
        buttons.push({
          xtype: 'button',
          tooltip: me.buttonsText[name],
          glyph: me.buttonsGlyph[name],
          handler: me['on' + Ext.String.capitalize(name) + 'BtnClick'],
          navBtn: true,
          scope: me,
          margin: '4 0 0 0'
        });
      });
    }
    return buttons;
  },

  /**
   * Get the selected records from the specified list.
   *
   * Records will be returned *in store order*, not in order of selection.
   * @param {Ext.view.BoundList} list The list to read selections from.
   * @return {Ext.data.Model[]} The selected records in store order.
   *
   */
  getSelections: function (list) {
    var store = list.getStore();

    return Ext.Array.sort(list.getSelectionModel().getSelection(), function (a, b) {
      a = store.indexOf(a);
      b = store.indexOf(b);

      if (a < b) {
        return -1;
      }
      else if (a > b) {
        return 1;
      }
      return 0;
    });
  },

  onTopBtnClick: function () {
    var me = this,
        list = me.orderField.boundList,
        store = list.getStore(),
        selected = me.getSelections(list);

    store.suspendEvents();
    store.remove(selected, true);
    store.insert(0, selected);
    store.resumeEvents();
    list.refresh();
    me.syncValue();
    list.getSelectionModel().select(selected);
  },

  onBottomBtnClick: function () {
    var me = this,
        list = me.orderField.boundList,
        store = list.getStore(),
        selected = me.getSelections(list);

    store.suspendEvents();
    store.remove(selected, true);
    store.add(selected);
    store.resumeEvents();
    list.refresh();
    me.syncValue();
    list.getSelectionModel().select(selected);
  },

  onUpBtnClick: function () {
    var me = this,
        list = me.orderField.boundList,
        store = list.getStore(),
        selected = me.getSelections(list),
        rec,
        i = 0,
        len = selected.length,
        index = 0;

    // Move each selection up by one place if possible
    store.suspendEvents();
    for (; i < len; ++i, index++) {
      rec = selected[i];
      index = Math.max(index, store.indexOf(rec) - 1);
      store.remove(rec, true);
      store.insert(index, rec);
    }
    store.resumeEvents();
    list.refresh();
    me.syncValue();
    list.getSelectionModel().select(selected);
  },

  onDownBtnClick: function () {
    var me = this,
        list = me.orderField.boundList,
        store = list.getStore(),
        selected = me.getSelections(list),
        rec,
        i = selected.length - 1,
        index = store.getCount() - 1;

    // Move each selection down by one place if possible
    store.suspendEvents();
    for (; i > -1; --i, index--) {
      rec = selected[i];
      index = Math.min(index, store.indexOf(rec) + 1);
      store.remove(rec, true);
      store.insert(index, rec);
    }
    store.resumeEvents();
    list.refresh();
    me.syncValue();
    list.getSelectionModel().select(selected);
  },

  syncValue: function () {
    var me = this;
    me.mixins.field.setValue.call(me, me.setupValue(me.orderField.store.getRange()));
  },

  setValue: function (value) {
    // do nothing as we always show all records, unselected
  },

  onBindStore: function (store) {
    var me = this;

    if (me.orderField) {
      if (store.getCount()) {
        me.populateStore(store);
      }
      else {
        me.store.on('load', me.populateStore, me);
      }
    }
  },

  populateStore: function (store) {
    var me = this,
        orderStore = me.orderField.store;

    me.storePopulated = true;

    orderStore.removeAll();
    orderStore.add(store.getRange());
    me.syncValue();

    orderStore.fireEvent('load', orderStore);
  },

  onEnable: function () {
    var me = this;

    me.callParent();
    me.orderField.enable();

    Ext.Array.forEach(me.query('[navBtn]'), function (btn) {
      btn.enable();
    });
  },

  onDisable: function () {
    var me = this;

    me.callParent();
    me.orderField.disable();

    Ext.Array.forEach(me.query('[navBtn]'), function (btn) {
      btn.disable();
    });
  },

  onDestroy: function () {
    var me = this;

    if (me.store) {
      me.store.un('load', me.populateStore, me);
    }
    me.bindStore(null);
    me.callParent();
  }

});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext*/

/**
 * Header branding panel.
 *
 * @since 3.0
 */
Ext.define('NX.view.header.Branding', {
  extend: 'Ext.container.Container',
  alias: 'widget.nx-header-branding'

  // intentionally empty, placeholder for where branding header content is dynamically inserted
});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext, NX*/

/**
 * Logo image.
 *
 * @since 3.0
 */
Ext.define('NX.view.header.Logo', {
  extend: 'Ext.Img',
  requires: [
    'NX.Icons'
  ],
  alias: 'widget.nx-header-logo',

  autoEl: 'span',
  height: 32,
  width: 32,

  /**
   * @protected
   */
  initComponent: function() {
    this.setSrc(NX.Icons.url('nexus', 'x32'));
    this.callParent();
  }
});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext*/

/**
 * A search box.
 *
 * @since 3.0
 */
Ext.define('NX.ext.SearchBox', {
  extend: 'Ext.form.field.Trigger',
  alias: 'widget.nx-searchbox',
  requires: [
    'Ext.util.KeyNav'
  ],

  emptyText: 'search',
  submitValue: false,

  /**
   * Number of milliseconds to trigger searching.
   *
   * @cfg {Number}
   */
  searchDelay: 1000,

  // TODO: Only show clear trigger if we have text
  trigger1Cls: 'nx-form-fa-times-circle-trigger',

  /**
   * @override
   */
  initComponent: function () {
    var me = this;

    Ext.apply(me, {
      checkChangeBuffer: me.searchDelay
    });

    me.callParent(arguments);

    me.on('change', me.onValueChange, me);

    me.addEvents(
        /**
         * Fires before a search is performed.
         *
         * @event beforesearch
         */
        'beforesearch',

        /**
         * Fires when a search values was typed. Fires with a delay of **{@link #searchDelay}**.
         *
         * @event search
         * @param {NX.ext.SearchBox} this search box
         * @param {String} search value
         */
        'search',

        /**
         * Fires when a search value had been cleared.
         *
         * @event searchcleared
         * @param {NX.ext.SearchBox} this search box
         */
        'searchcleared'
    );
  },

  /**
   * @override
   */
  initEvents: function () {
    var me = this;

    me.callParent();

    me.keyNav = new Ext.util.KeyNav(me.inputEl, {
      esc: {
        handler: me.clearSearch,
        scope: me,
        defaultEventAction: false
      },
      enter: {
        handler: me.onEnter,
        scope: me,
        defaultEventAction: false
      },
      scope: me,
      forceKeyDown: true
    });
  },

  /**
   * Clear search.
   *
   * @private
   */
  onTrigger1Click: function () {
    this.clearSearch();
  },

  /**
   * Search on ENTER.
   *
   * @private
   */
  onEnter: function () {
    var me = this;

    me.search(me.getValue());
  },

  /**
   * Trigger search.
   *
   * @private
   */
  onValueChange: function (trigger, value) {
    var me = this;

    if (value) {
      me.search(value);
    }
    else {
      me.clearSearch();
    }
    me.resetOriginalValue();
  },

  /**
   * Search for value and fires a 'search' event.
   *
   * @public
   * @param value to search for
   */
  search: function (value) {
    var me = this;

    if (value !== me.getValue()) {
      me.setValue(value);
    }
    else {
      if (me.fireEvent('beforesearch', me)) {
        me.fireEvent('search', me, value);
      }
    }
  },

  /**
   * Clears the search and fires a 'searchcleared' event.
   *
   * @public
   */
  clearSearch: function () {
    var me = this;

    if (me.getValue()) {
      me.setValue(undefined);
    }
    me.fireEvent('searchcleared', me);
  }

});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext*/

/**
 * Help button.
 *
 * @since 3.0
 */
Ext.define('NX.view.header.QuickSearch', {
  extend: 'NX.ext.SearchBox',
  alias: 'widget.nx-header-quicksearch',
  requires: [
    'NX.I18n'
  ],

  /**
   * @override
   */
  initComponent: function() {
    Ext.apply(this, {
      itemId: 'quicksearch',
      cls: 'nx-quicksearch',
      width: 200,
      emptyText: NX.I18n.get('Header_QuickSearch_Empty'),
      // field tooltip
      inputAttrTpl: "data-qtip='" + NX.I18n.get('Header_QuickSearch_Tooltip') + "'"
    });

    this.callParent();
  }
});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext*/

/**
 * Main uber mode panel.
 *
 * @since 3.0
 */
Ext.define('NX.view.Main', {
  extend: 'Ext.panel.Panel',
  alias: 'widget.nx-main',
  requires: [
    'NX.I18n',
    'NX.Icons',
    'NX.view.header.QuickSearch'
  ],

  layout: 'border',

  /**
   * @override
   */
  initComponent: function () {
    var me = this;

    me.items = [
      {
        xtype: 'panel',
        layout: {
          type: 'vbox',
          align: 'stretch'
        },
        items: [
          {
            xtype: 'panel',
            ui: 'nx-database-freeze-warning',
            id: 'nx-database-freeze-warning',
            iconCls: NX.Icons.cls('drilldown-warning', 'x16'),
            hidden: true
          },
          {
            xtype: 'panel',
            ui: 'nx-license-warning',
            id: 'nx-license-warning',
            iconCls: NX.Icons.cls('drilldown-warning', 'x16'),
            hidden: true
          },
          {
            xtype: 'nx-header-panel'
          }
        ],
        region: 'north',
        collapsible: false
      },

      {
        xtype: 'nx-feature-menu',
        region: 'west',
        border: false,
        resizable: true,
        resizeHandles: 'e'
      },

      {
        xtype: 'nx-feature-content',
        region: 'center',
        border: true
      },

      {
        xtype: 'nx-footer',
        region: 'south',
        hidden: false
      },

      {
        xtype: 'nx-dev-panel',
        region: 'south',
        collapsible: true,
        collapsed: true,
        resizable: true,
        resizeHandles: 'n',

        // keep initial constraints to prevent huge panels
        height: 300,

        // default to hidden, only show if debug enabled
        hidden: true
      }
    ];

    me.callParent();

    me.down('nx-header-panel>toolbar').add([
      // 2x pad
      ' ', ' ',
      {
        xtype: 'nx-header-mode',
        name: 'browse',
        title: NX.I18n.get('Header_BrowseMode_Title'),
        tooltip: NX.I18n.get('Header_BrowseMode_Tooltip'),
        glyph: 'xf1b2@FontAwesome', /* fa-cube */
        autoHide: true,
        collapseMenu: true
      },
      {
        xtype: 'nx-header-mode',
        name: 'admin',
        title: NX.I18n.get('Header_AdminMode_Title'),
        tooltip: NX.I18n.get('Header_AdminMode_Tooltip'),
        glyph: 'xf013@FontAwesome', /* fa-gear */
        autoHide: true,
        collapseMenu: false
      },
      ' ',
      {xtype: 'nx-header-quicksearch', hidden: true},
      '->',
      {xtype: 'nx-header-refresh', ui: 'nx-header'},
      {xtype: 'nx-header-help', ui: 'nx-header'},
      {
        xtype: 'nx-header-mode',
        name: 'user',
        title: NX.I18n.get('Header_UserMode_Title'),
        glyph: 'xf007@FontAwesome', // fa-user
        autoHide: false,
        collapseMenu: false
      },
      {xtype: 'nx-header-signin', ui: 'nx-header'},
      {xtype: 'nx-header-signout', ui: 'nx-header'}
    ]);
  }

});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext*/

/**
 * Footer panel.
 *
 * @since 3.0
 */
Ext.define('NX.view.footer.Panel', {
  extend: 'Ext.container.Container',
  alias: 'widget.nx-footer',
  requires: [
    'NX.I18n'
  ],

  cls: 'nx-footer',

  /**
   * @override
   */
  initComponent: function() {
    Ext.apply(this, {
      layout: {
        type: 'vbox',
        align: 'stretch',
        pack: 'start'
      },

      items: [
        {
          xtype: 'container',
          cls: 'copyright',
          html: NX.I18n.get('Footer_Panel_HTML')
        },
        { xtype: 'nx-footer-branding', hidden: true }
      ]
    });

    this.callParent();
  }
});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext*/

/**
 * Main uber mode controller.
 *
 * @since 3.0
 */
Ext.define('NX.controller.Main', {
  extend: 'NX.app.Controller',

  views: [
    'Main',
    'header.Panel',
    'header.Branding',
    'header.Logo',
    'footer.Panel',
    'footer.Branding'
  ],

  refs: [
    {
      ref: 'viewport',
      selector: 'viewport'
    },
    {
      ref: 'main',
      selector: 'nx-main'
    }
  ],

  /**
   * @override
   */
  init: function () {
    var me = this;

    me.getApplication().getIconController().addIcons({
      'nexus': {
        file: 'nexus.png',
        variants: ['x16', 'x24', 'x32', 'x48', 'x100']
      },
      'sonatype': {
        file: 'sonatype.png',
        variants: ['x16', 'x24', 'x32', 'x48', 'x100']
      }
    });

    me.listen({
      component: {
        'viewport': {
          afterrender: me.onLaunch
        }
      }
    });
  },

  /**
   * Show {@link NX.view.Main} view from {@link Ext.container.Viewport}.
   *
   * @override
   */
  onLaunch: function () {
    var me = this,
        viewport = me.getViewport();

    if (viewport) {
      //<if debug>
//      me.logDebug('Showing main view');
      //</if>

      viewport.add({ xtype: 'nx-main' });
    }
  },

  /**
   * Removes {@link NX.view.Main} view from {@link Ext.container.Viewport}.
   *
   * @override
   */
  onDestroy: function () {
    var me = this,
        viewport = me.getViewport();

    if (viewport) {
      //<if debug>
//      me.logDebug('Removing main view');
      //</if>

      viewport.remove(me.getMain());
    }
  }

});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext, NX*/

/**
 * A {@link Ext.grid.column.Column} which renders its value as a link.
 *
 * @since 3.0
 */
Ext.define('NX.ext.grid.column.CopyLink', {
  extend: 'Ext.grid.column.Column',
  alias: ['widget.nx-copylinkcolumn'],
  requires: [
    'NX.util.Url'
  ],

  stateId: 'copylink',

  constructor: function () {
    var me = this;

    me.listeners = {
      click: function() {
        // Prevent drilldown from triggering
        return false;
      }
    };

    me.callParent(arguments);
  },

  /**
   * Renders value as a link.
   */
  defaultRenderer: function (value) {
    if (value) {
      value = value.replace(/\$baseUrl/, NX.util.Url.baseUrl);
      return NX.util.Url.asCopyWidget(value);
    }
    return undefined;
  },

  /**
   * @protected
   */
  target: function (value) {
    return value;
  }

});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext*/

/**
 * Content panel.
 *
 * @since 3.0
 */
Ext.define('NX.view.feature.Content', {
  extend: 'Ext.panel.Panel',
  alias: 'widget.nx-feature-content',

  itemId: 'feature-content',
  ui: 'nx-feature-content',
  cls: 'nx-feature-content',
  layout: 'fit',

  /**
   * @private
   * If false, show a warning modal when you’re about to discard unsaved changes by navigating away
   */
  discardUnsavedChanges: false,

  header: {
    items: [
      {
        xtype: 'panel',
        layout: { type: 'hbox' },
        itemId: 'breadcrumb'
      }
    ]
  },

  listeners: {
    afterrender: function(obj) {
      obj.rendered = true;
      obj.showRoot();
    }
  },

  /**
   * Show the feature root (hide the breadcrumb)
   */
  showRoot: function() {
    var me = this;
    var breadcrumb = me.down('#breadcrumb');

    if (!me.rendered) {
      return;
    }

    breadcrumb.removeAll();
    breadcrumb.add(
      {
        xtype: 'label',
        cls: 'nx-feature-name',
        text: me.currentTitle
      },
      {
        xtype: 'label',
        cls: 'nx-feature-description',
        text: me.currentDescription
      }
    );
  },

  /**
   * The currently set title, so subpanels can access it
   * @param text
   */
  currentTitle: undefined,

  /**
   * Custom handling for title since we are using custom header component.
   *
   * @override
   * @param text
   */
  setTitle: function(text) {
    var me = this;

    me.callParent(arguments);

    me.currentTitle = text;
  },

  /**
   * Set description text.
   *
   * @public
   * @param text
   */
  setDescription: function(text) {
    this.currentDescription = text;
  },

  /**
   * The currently set iconCls, so we can remove it when changed.
   *
   * @private
   */
  currentIconCls: undefined,

  /**
   * @public
   * Reset the discardUnsavedChanges flag (false by default)
   */
  resetUnsavedChangesFlag: function(enable) {
    var me = this;

    if (enable) {
      me.discardUnsavedChanges = true;
    }
    else {
      me.discardUnsavedChanges = false;
    }
  }
});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext*/

/**
 * The developer panel.
 *
 * @since 3.0
 */
Ext.define('NX.view.dev.Panel', {
  extend: 'Ext.panel.Panel',
  requires: [
    'NX.view.dev.Styles'
  ],
  alias: 'widget.nx-dev-panel',

  title: 'Developer',
  glyph: 'xf188@FontAwesome', // fa-bug
  ui: 'nx-developer',
  stateful: true,
  stateId: 'nx-dev-panel',

  tools: [
    { type: 'maximize', tooltip: 'Maximize' }
  ],

  layout: 'fit',
  items: {
    xtype: 'tabpanel',
    tabPosition: 'bottom',

    stateful: true,
    stateId: 'nx-dev-panel.tabs',
    stateEvents: [ 'tabchange' ],

    /**
     * @override
     */
    getState: function() {
      return {
        activeTabId: this.items.findIndex('id', this.getActiveTab().id)
      };
    },

    /**
     * @override
     */
    applyState: function(state) {
      this.setActiveTab(state.activeTabId);
    },

    items: [
      { xtype: 'nx-dev-tests' },
      { xtype: 'nx-dev-styles' },
      { xtype: 'nx-dev-icons' },
      { xtype: 'nx-dev-features' },
      { xtype: 'nx-dev-permissions' },
      { xtype: 'nx-dev-state' },
      { xtype: 'nx-dev-stores' },
      { xtype: 'nx-dev-logging' }
    ]
  }
});

/*
 Any code delivered as a result of the subject support
 incident is delivered as is and is not officially supported.
 Any such code is subject to the standard license agreement
 between the customer and Sencha.  It is the customer’s
 responsibility to implement and maintain the workaround/override.
 In addition, the customer will be responsible for removing the
 workaround or override at the proper time when the appropriate
 official release is available.

 BY USING THIS CODE YOU AGREE THAT IT IS DELIVERED "AS IS",
 WITH NO WARRANTIES WHATSOEVER, INCLUDING, BUT NOT LIMITED TO,
 IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
 PURPOSE, TITLE AND NON-INFRINGEMENT.
 */

Ext.define('Ext.patch.Ticket_15227', {
  override: 'Ext.view.Table',
  getMaxContentWidth: function(header) {
    var me = this,
      cells = me.el.query(header.getCellInnerSelector()),
      originalWidth = header.getWidth(),
      i = 0,
      ln = cells.length,
      columnSizer = me.body.select(me.getColumnSizerSelector(header)),
      max = Math.max,
      widthAdjust = 0,
      maxWidth;

    if (ln > 0) {
      if (Ext.supports.ScrollWidthInlinePaddingBug) {
        widthAdjust += me.getCellPaddingAfter(cells[0]);
      }
      else {
        // add a pixel to fix Chrome
        widthAdjust += 1;
      }
      if (me.columnLines) {
        widthAdjust += Ext.fly(cells[0].parentNode).getBorderWidth('lr');
      }
    }

    // Set column width to 1px so we can detect the content width by measuring scrollWidth
    columnSizer.setWidth(1);

    // We are about to measure the offsetWidth of the textEl to determine how much
    // space the text occupies, but it will not report the correct width if the titleEl
    // has text-overflow:ellipsis.  Set text-overflow to 'clip' before proceeding to
    // ensure we get the correct measurement.
    header.titleEl.setStyle('text-overflow', 'clip');

    // Allow for padding round text of header
    maxWidth = header.textEl.dom.offsetWidth + header.titleEl.getPadding('lr');

    // revert to using text-overflow defined by the stylesheet
    header.titleEl.setStyle('text-overflow', '');

    for (; i < ln; i++) {
      maxWidth = max(maxWidth, cells[i].scrollWidth);
    }

    // in some browsers, the "after" padding is not accounted for in the scrollWidth
    maxWidth += widthAdjust;

    // 40 is the minimum column width.  TODO: should this be configurable?
    maxWidth = max(maxWidth, 40);

    // Set column width back to original width
    columnSizer.setWidth(originalWidth);

    return maxWidth;
  }
});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext*/

/**
 * Refresh button.
 *
 * @since 3.0
 */
Ext.define('NX.view.header.Refresh', {
  extend: 'Ext.button.Button',
  alias: 'widget.nx-header-refresh',
  requires: [
    'NX.I18n'
  ],

  /**
   * @override
   */
  initComponent: function() {
    Ext.apply(this, {
      tooltip: NX.I18n.get('Header_Refresh_Tooltip'),
      glyph: 'xf021@FontAwesome' // fa-refresh
    });

    this.callParent();
  }
});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext, NX*/

/**
 * Refresh controller.
 *
 * @since 3.0
 */
Ext.define('NX.controller.Refresh', {
  extend: 'NX.app.Controller',
  requires: [
    'NX.Messages',
    'NX.I18n'
  ],

  views: [
    'header.Refresh'
  ],

  /**
   * @override
   */
  init: function () {
    var me = this;

    me.listen({
      component: {
        'nx-header-refresh': {
          click: me.refresh
        }
      }
    });

    me.addEvents(
      /**
       * Fires before the refresh is performed.
       *
       * @event beforerefresh
       */
      'beforerefresh',

      /**
       * Fires when refresh should be performed.
       *
       * @event refresh
       */
      'refresh'
    );
  },

  /**
   * Fire refresh event.
   *
   * @public
   */
  refresh: function () {
    var me = this;

    if (me.fireEvent('beforerefresh')) {
      me.fireEvent('refresh');

      // Show a message here, so that if the current view doesn't actually support
      // request that users don't think the feature is broken and spam-click the refresh button
      NX.Messages.add({ text: NX.I18n.get('Refresh_Message'), type: 'default' });
    }
  }

});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext*/

/**
 * Renderer helpers.
 *
 * @since 3.0
 */
Ext.define('NX.ext.grid.column.Renderers', {
  singleton: true,

  /**
   * Renderer which will use no-data glyph if given value is undefined or null.
   */
  optionalData: function(value) {
    return value ? value : '<span class="x-fa fa-ban" style="opacity: 0.33;"/>';
  }
});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext, NX*/

/**
 * Permissions management controller.
 *
 * @since 3.0
 */
Ext.define('NX.controller.Permissions', {
  extend: 'NX.app.Controller',
  requires: [
    'NX.State',
    'NX.Permissions'
  ],

  stores: [
    'Permission'
  ],

  /**
   * @override
   */
  init: function () {
    var me = this;

    me.listen({
      controller: {
        '#State': {
          userchanged: me.fetchPermissions,
          permissionschanged: me.loadPermissions
        }
      },
      store: {
        '#Permission': {
          load: me.firePermissionsChanged,
          update: me.onUpdate,
          remove: me.firePermissionsChanged
        }
      }
    });

    me.addEvents(
        /**
         * Fires when permissions change.
         *
         * @event changed
         * @param {NX.Permissions} permissions  Permissions helper.
         */
        'changed'
    );
  },

  /**
   * Prime initial set of permissions from state.
   *
   * @override
   */
  onLaunch: function () {
    var me = this,
        rawData = NX.State.getValue('permissions');

    //<if debug>
//    me.logTrace('Initial permissions:', rawData);
    //</if>

    me.getStore('Permission').loadRawData(rawData, false);
    NX.Permissions.setPermissions(me.getPermissions());

    //<if debug>
//    me.logInfo('Permissions primed');
    //</if>
  },

  /**
   * @private
   */
  onUpdate: function (store, record, operation) {
    if (operation === Ext.data.Model.COMMIT) {
      this.firePermissionsChanged();
    }
  },

  /**
   * @private
   */
  fetchPermissions: function () {
    var me = this;

    NX.Permissions.resetPermissions();
    //<if debug>
//    me.logDebug('Fetching permissions...');
    //</if>
    me.getStore('Permission').load();
  },

  /**
   * @private
   */
  loadPermissions: function (permissions) {
    var me = this;

    //<if debug>
//    me.logDebug('Loading permissions...');
    //</if>

    me.getStore('Permission').loadRawData(permissions, false);
    me.firePermissionsChanged();
  },

  /**
   * @private
   */
  firePermissionsChanged: function () {
    var me = this;

    NX.Permissions.setPermissions(me.getPermissions());

    //<if debug>
//    me.logDebug('Permissions changed; Firing event');
    //</if>

    me.fireEvent('changed', NX.Permissions);
  },

  /**
   * @private
   * @return {Object} permissions
   */
  getPermissions: function () {
    var store = this.getStore('Permission'),
        perms = {};

    store.clearFilter();
    store.each(function (rec) {
      perms[rec.get('id')] = rec.get('permitted');
    });

    return perms;
  }

});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext*/

/**
 * KeyNav controller.
 *
 * @since 3.0
 */
Ext.define('NX.controller.KeyNav', {
  extend: 'NX.app.Controller',
  requires: [
    'Ext.util.KeyNav'
  ],

  /**
   * @override
   */
  init: function () {
    var me = this;

    me.listen({
      component: {
        'form button[bindToEnter=true]': {
          afterrender: me.installEnterKey
        }
      }
    });

    me.disableBackspaceNav();
  },

  /**
   * Install a key nav that will trigger click on any form buttons marked with "bindToEnter: true",
   * (usually submit button) on ENTER.
   *
   * @private
   */
  installEnterKey: function (button) {
    var form = button.up('form');

    button.keyNav = Ext.create('Ext.util.KeyNav', form.el, {
      enter: function () {
        if (!button.isDisabled()) {
          button.fireEvent('click', button);
        }
      }
    });
  },

  /**
   * Disable backspace as a means for navigating back. Allow backspace when an enabled
   * input field has focus.
   *
   * @private
   */
  disableBackspaceNav: function() {
    var parent = Ext.isIE ? document : window;
    Ext.EventManager.on(parent, 'keydown', function (e, focused) {
      // Check for least-likely to most-likely conditions in order to avoid costly evaluations - fail fast to increase performance
      var isBackspace = e.getKey() === e.BACKSPACE;
      if ( isBackspace && !isBackspaceAllowed() ) {
        e.stopEvent();
      }

      /**
       * Returns true if a backspace should be allowed.
       *
       * @inner
       * @private
       * @returns {boolean}
       */
      function isBackspaceAllowed() {
        // isEditable is false if focused.readOnly is undefined; this traps the case where no field has focus,
        //  and the short-circuit avoids costly field checking
        var isEditable = (focused.readOnly !== undefined && !focused.readOnly),
            isEnabled = !focused.disabled,
            isTypingAllowed = isEditable && isEnabled;

        return isTypingAllowed && isFieldAllowed();
      }

      /**
       * Returns true if the field should allow backspaces.
       *
       * ExtJS use the role attribute to map to multiple UI field types:
       *  textbox ==> normal text field (`input[type=text]`); multi-line text area (`textarea`)
       *  spinbutton ==> normal text field ('input[type=text]`) with accompanying up/down arrows for selecting numeric values
       *  combobox ==> text field that allows typing in addition to list selection (`input[type=text]`);
       *      text field that only allows list selection (`input[type=text,readOnly=readOnly]`)
       *
       * Field types disallowed by exclusion:
       *  checkbox ==> rendered by ExtJS as a button with accompanying label (`input[type=button]`)
       *
       * @inner
       * @private
       * @returns {boolean}
       */
      function isFieldAllowed() {
        var roleAttribute = focused.attributes["role"],
            role = roleAttribute && roleAttribute.value,
            rolesAllowed = ['textbox', 'spinbutton', 'combobox'],
            rePattern = '^' + rolesAllowed.join('|') + '$',
            re = new RegExp(rePattern, 'i');

        return re.test(role);
      }
    });
  }

});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext, NX*/

/**
 * **{@link Ext.form.action.DirectSubmit}** overrides (see inline comments marked with &lt;override/&gt;
 *
 * See: https://support.sencha.com/index.php#ticket-16118
 *
 * See: https://support.sencha.com/index.php#ticket-16102
 *
 * @since 3.0
 */
Ext.define('NX.ext.form.action.DirectSubmit', {
  override: 'Ext.form.action.DirectSubmit',

  submitEmptyText: false,

  doSubmit: function () {
    var me = this,
        form = me.form,
        api = form.api,
        fn = api.submit,
        callback = Ext.Function.bind(me.onComplete, me),
        formInfo = me.buildForm(),
        options, formEl;

    if (!Ext.isFunction(fn)) {
      //<debug>
      var fnName = fn;
      //</debug>

      api.update = fn = Ext.direct.Manager.parseMethod(fn);
      //<override> avoid cleanup as that resets values of file upload fields
      //me.cleanup(formInfo);
      //</override>

      //<debug>
      if (!Ext.isFunction(fn)) {
        Ext.Error.raise('Cannot resolve Ext.Direct API method ' + fnName);
      }
      //</debug>
    }

    if (me.timeout || form.timeout) {
      options = {
        timeout: me.timeout * 1000 || form.timeout * 1000
      };
    }

    //<override> call using field values if direct function formHandler = false
    //fn.call(NX.global, formInfo.formEl, callback, me, options);
    if (fn.directCfg.method.formHandler) {
      formEl = formInfo.formEl;
    }
    else {
      formEl = me.getParams(true);
      Ext.Object.each(formEl, function (key, value) {
        if (Ext.typeOf(value) === 'date') {
          formEl[key] = Ext.Date.format(value, 'Y-m-d\\TH:i:s.uP');
        }
      });
    }
    fn.call(NX.global, formEl, callback, me, options);
    //</override>
    me.cleanup(formInfo);
  }

});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext*/

Ext.define('NX.model.dev.Condition', {
  extend: 'Ext.data.Model',
  fields: [
    { name: 'id', type: 'string' },
    { name: 'condition', defaultValue: undefined },
    { name: 'satisfied', type: 'boolean' }
  ]
});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext*/

Ext.define('NX.store.dev.Condition', {
  extend: 'Ext.data.Store',
  model: 'NX.model.dev.Condition'
});

/**
 * https://support.sencha.com/index.php#ticket-18960
 */
Ext.define('Ext.patch.Ticket_18960', {
  override: 'Ext.grid.RowEditor',

  renderColumnData: function(field, record, activeColumn) {
    var me = this,
        grid = me.editingPlugin.grid,
        headerCt = grid.headerCt,
        view = me.scrollingView,
        store = view.dataSource,
        column = activeColumn || field.column,
        value = record.get(column.dataIndex),
        renderer = column.editRenderer || column.renderer,
        scope = column.usingDefaultRenderer && !column.scope ? column : column.scope,
        metaData,
        rowIdx,
        colIdx;

    // honor our column's renderer (TemplateHeader sets renderer for us!)
    if (renderer) {
      metaData = { tdCls: '', style: '' };
      rowIdx = store.indexOf(record);
      colIdx = headerCt.getHeaderIndex(column);

      value = renderer.call(
              scope || headerCt.ownerCt,
          value,
          metaData,
          record,
          rowIdx,
          colIdx,
          store,
          view
      );
    }

    field.setRawValue(value);
    field.resetOriginalValue();
  }
});

/*global Ext, window*/

/**
 * @class Ext.ux.ActivityMonitor
 * @author Arthur Kay (http://www.akawebdesign.com)
 * @singleton
 * @version 1.0
 *
 * GitHub Project: https://github.com/arthurakay/ExtJS-Activity-Monitor
 *
 * The MIT License (MIT)
 *
 * Copyright (c) <2011> Arthur Kay
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 */
Ext.define('Ext.ux.ActivityMonitor', {

  ui: null,
  runner: null,
  task: null,
  lastActive: null,

  ready: false,
  verbose: false,
  interval: (1000 * 60 * 1), //1 minute
  maxInactive: (1000 * 60 * 5), //5 minutes

  constructor: function (config) {
    if (!config) {
      config = {};
    }

    Ext.apply(this, config, {
      runner: new Ext.util.TaskRunner(),
      ui: Ext.getBody(),
      task: {
        run: this.monitorUI,
        interval: config.interval || this.interval,
        scope: this
      }
    });

    this.callParent(arguments);
  },

  isActive: Ext.emptyFn,
  isInactive: Ext.emptyFn,

  start: function () {
    this.ui.on('mousemove', this.captureActivity, this);
    this.ui.on('mousedown', this.captureActivity, this);
    this.ui.on('keydown', this.captureActivity, this);

    this.lastActive = new Date();
    this.log('ActivityMonitor has been started.');

    this.runner.start(this.task);
  },

  stop: function () {
    this.runner.stop(this.task);
    this.lastActive = null;

    this.ui.un('mousemove', this.captureActivity);
    this.ui.un('mousedown', this.captureActivity, this);
    this.ui.un('keydown', this.captureActivity);

    this.log('ActivityMonitor has been stopped.');
  },

  captureActivity: function (eventObj, el, eventOptions) {
    this.lastActive = new Date();
  },

  monitorUI: function () {
    var now = new Date(),
        inactive = (now - this.lastActive);

    if (inactive >= this.maxInactive) {
      this.log('MAXIMUM INACTIVE TIME HAS BEEN REACHED');
      this.stop(); //remove event listeners

      this.isInactive();
    }
    else {
      this.log('CURRENTLY INACTIVE FOR ' + inactive + ' (ms)');
      this.isActive();
    }
  },

  log: function (msg) {
    if (this.verbose) {
      window.console.log(msg);
    }
  }

});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext, NX*/

/**
 * UI Session Timeout controller.
 *
 * @since 3.0
 */
Ext.define('NX.controller.UiSessionTimeout', {
  extend: 'NX.app.Controller',
  requires: [
    'Ext.ux.ActivityMonitor',
    'NX.Messages',
    'NX.Security',
    'NX.State',
    'NX.I18n',
    'NX.State'
  ],

  views: [
    'ExpireSession'
  ],

  refs: [
    {
      ref: 'expireSessionWindow',
      selector: 'nx-expire-session'
    }
  ],

  SECONDS_TO_EXPIRE: 30,

  activityMonitor: undefined,

  expirationTicker: undefined,

  /**
   * @override
   */
  init: function () {
    var me = this;

    me.listen({
      controller: {
        '#State': {
          userchanged: me.setupTimeout,
          uisettingschanged: me.onUiSettingsChanged,
          receivingchanged: me.setupTimeout
        }
      },
      component: {
        'nx-expire-session': {
          afterrender: me.startTicking
        },
        'nx-expire-session button[action=cancel]': {
          click: me.setupTimeout
        }
      }
    });
  },

  /**
   * @override
   */
  onLaunch: function () {
    this.setupTimeout();
  },

  /**
   * Reset UI session timeout when uiSettings.sessionTimeout changes.
   *
   * @private
   * @param {Object} uiSettings
   * @param {Number} uiSettings.sessionTimeout
   * @param {Object} oldUiSettings
   * @param {Number} oldUiSettings.sessionTimeout
   */
  onUiSettingsChanged: function (uiSettings, oldUiSettings) {
    uiSettings = uiSettings || {};
    oldUiSettings = oldUiSettings || {};

    if (uiSettings.sessionTimeout !== oldUiSettings.sessionTimeout) {
      this.setupTimeout();
    }
  },

  /**
   * @private
   */
  setupTimeout: function () {
    var me = this,
        user = NX.State.getUser(),
        uiSettings = NX.State.getValue('uiSettings') || {},
        sessionTimeout = user ? uiSettings['sessionTimeout'] : undefined;

    me.cancelTimeout();
    if ((user && NX.State.isReceiving()) && sessionTimeout > 0) {
      //<if debug>
//      me.logDebug('Session expiration enabled for', sessionTimeout, 'minutes');
      //</if>

      me.activityMonitor = Ext.create('Ext.ux.ActivityMonitor', {
        // check every second
        interval: 1000,
        maxInactive: ((sessionTimeout * 60) - me.SECONDS_TO_EXPIRE) * 1000,
        isInactive: Ext.bind(me.showExpirationWindow, me)
      });
      me.activityMonitor.start();
    }
  },

  /**
   * @private
   */
  cancelTimeout: function () {
    var me = this,
        expireSessionView = me.getExpireSessionWindow();

    // close the window if the session has not yet expired or if the server is disconnected
    if (expireSessionView && (!expireSessionView.sessionExpired() || !NX.State.isReceiving())) {
      expireSessionView.close();
    }

    if (me.activityMonitor) {
      me.activityMonitor.stop();
      delete me.activityMonitor;

      //<if debug>
//      me.logDebug('Activity monitor disabled');
      //</if>
    }

    if (me.expirationTicker) {
      me.expirationTicker.destroy();
      delete me.expirationTicker;

      //<if debug>
//      me.logDebug('Session expiration disabled');
      //</if>
    }
  },

  /**
   * @private
   */
  showExpirationWindow: function () {
    NX.Messages.add({text: NX.I18n.get('UiSessionTimeout_Expire_Message'), type: 'warning'});
    this.getExpireSessionView().create();
  },

  /**
   * @private
   */
  startTicking: function (win) {
    var me = this;

    me.expirationTicker = Ext.util.TaskManager.newTask({
      run: function (count) {
        win.down('label').setText(NX.I18n.format('UiSessionTimeout_Expire_Text', me.SECONDS_TO_EXPIRE - count));
        if (count === me.SECONDS_TO_EXPIRE) {
          win.down('label').setText(NX.I18n.get('SignedOut_Text'));
          win.down('button[action=close]').show();
          win.down('button[action=signin]').show();
          win.down('button[action=cancel]').hide();
          NX.Messages.add({
            text: NX.I18n.format('UiSessionTimeout_Expired_Message', NX.State.getValue('uiSettings')['sessionTimeout']),
            type: 'warning'
          });
          NX.Security.signOut();
        }
      },
      interval: 1000,
      repeat: me.SECONDS_TO_EXPIRE
    });
    me.expirationTicker.start();
  }

});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext*/

/**
 * **{@link Ext.form.action.DirectLoad}** overrides.
 *
 * See: https://support.sencha.com/index.php#ticket-17182
 *
 * @since 3.0
 */
Ext.define('NX.ext.form.action.DirectLoad', {
  override: 'Ext.form.action.DirectLoad',

  /**
   * @override
   * Bail out if form was already destroyed.
   */
  onComplete: function () {
    if (!this.form.isDestroyed) {
      this.callParent(arguments);
    }
  }

});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext*/

/**
 * An **{@link Ext.form.field.Display}** that converts a date in ISO-8601 format to a date before display.
 *
 * @since 3.0
 */
Ext.define('NX.ext.form.field.DateDisplayField', {
  extend: 'Ext.form.field.Display',
  alias: 'widget.nx-datedisplayfield',

  config: {
    /**
     * @cfg {String} Format for Date output, defaults to ISO 8601.
     */
    format: 'c'
  },
  
  /**
   * @override
   */
  setValue: function (value) {
    if (value) {
      arguments[0] = Ext.Date.format(Ext.Date.parse(value, 'c'), this.format);
    }
    this.callParent(arguments);
  }

});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext*/

/**
 * Nexus viewport.
 *
 * @since 3.0
 */
Ext.define('NX.view.Viewport', {
  extend: 'Ext.container.Viewport',

  layout: 'fit',

  items: []
});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext*/

/**
 * A **{@link Ext.form.field.ComboBox}** with an extra button that allows value to be cleared.
 *
 * @since 3.0
 */
Ext.define('NX.ext.form.field.ClearableComboBox', {
  extend: 'Ext.form.field.ComboBox',
  alias: 'widget.nx-clearablecombobox',

  // TODO: Only show clear trigger if we have text
  trigger2Cls: Ext.baseCSSPrefix + 'form-clear-trigger',

  /**
   * @private
   * Clear value.
   */
  onTrigger2Click: function () {
    this.reset();
  }

});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext, NX*/

/**
 * A form field that allows managing multiple values.
 *
 * @since 3.0
 */
Ext.define('NX.ext.form.field.ValueSet', {
  extend: 'Ext.form.FieldContainer',
    alias: 'widget.nx-valueset',
  requires: [
    'Ext.data.SequentialIdGenerator',
    'Ext.data.Store',
    'Ext.util.KeyNav',
    'NX.Icons'
  ],
  mixins: {
    field: 'Ext.form.field.Field'
  },

  statics: {
    idGenerator: Ext.create('Ext.data.SequentialIdGenerator'),
    generateId: function () {
      return 'nx-valueset-valuefield-' + NX.ext.form.field.ValueSet.idGenerator.generate();
    }
  },

  // FIXME: This is not the best way to ensure that forms are limited width
  width: 600,

  /**
   * @cfg {Number} [minValues=0] Minimum number of selections allowed.
   */
  minValues: 0,

  /**
   * @cfg {Number} [maxValues=Number.MAX_VALUE] Maximum number of values allowed.
   */
  maxValues: Number.MAX_VALUE,

  /**
   * @cfg {String} [blankText="This field is required"] Default text displayed when the control contains no values.
   */
  blankText: 'At least one value is required',

  /**
   * @cfg {String} [minValuesText="Minimum {0} value(s) required"]
   * Validation message displayed when {@link #minValues} is not met.
   * The {0} token will be replaced by the value of {@link #minValues}.
   */
  minValuesText: 'Minimum {0} value(s) required',

  /**
   * @cfg {String} [maxValuesText="Maximum {0} value(s) allowed"]
   * Validation message displayed when {@link #maxValues} is not met
   * The {0} token will be replaced by the value of {@link #maxValues}.
   */
  maxValuesText: 'Maximum {0} values(s) allowed',

  /**
   * @cfg {Boolean} [allowBlank=true] `false` to require at least one value, `true` to allow no value.
   */
  allowBlank: true,

  /**
   * @cfg {Boolean} [sorted=false] `true` to sort values, `false` to use adding order
   */
  sorted: false,

  /**
   * @cfg {Ext.form.field.Field} [input=true] Field to be used to add values. If not defined an
   * {@link Ext.form.field.Text} will be used.
   */
  input: undefined,

  /**
   * The default text to place into an empty field.
   * See {@link Ext.form.field.Text#emptyText}
   *
   * @cfg {String} emptyText
   */
  emptyText: undefined,

  converter: {
    toValues: undefined,
    fromValues: undefined
  },

  /**
   * @cfg {String} [glyphAddButton="xf055@FontAwesome"]
   */
  glyphAddButton: 'xf055@FontAwesome' /* fa-plus-circle */,

  /**
   * @cfg {String} [glyphDeleteButton="xf056@FontAwesome"]
   */
  glyphDeleteButton: 'xf056@FontAwesome' /* fa-minus-circle */,

  /**
   * @private {Ext.data.Store} Stores managed values
   */
  store: undefined,

  /**
   * @override
   */
  initComponent: function () {
    var me = this,
        valueFieldId = NX.ext.form.field.ValueSet.generateId();

    if (!Ext.isDefined(me.input)) {
      me.input = {
        xtype: 'textfield'
      };
    }
    Ext.apply(me.input, {
      valueFieldId: valueFieldId,
      submitValue: false,
      isFormField: false,
      flex: 1,
      inputFor: me.name
    });
    if (me.emptyText) {
      me.input.emptyText = me.emptyText;
    }
    if (!me.converter) {
      me.converter = {};
    }
    if (!me.converter.toValues || !Ext.isFunction(me.converter.toValues)) {
      me.converter.toValues = function (values) {
        return values;
      };
    }
    if (!me.converter.fromValues || !Ext.isFunction(me.converter.fromValues)) {
      me.converter.fromValues = function (values) {
        return values;
      };
    }

    me.items = [
      {
        xtype: 'panel',
        layout: 'hbox',
        items: [
          me.input,
          {
            xtype: 'button',
            listeners: {
              click: function() {
                // Add an item to the list of values
                me.addValue();

                // Unsticky the input field’s error message
                me.items.items[0].items.items[0].resumeEvents();

                if (me.items.items[0].items.items[0].isValid()) {
                  me.validate();
                }
              },
              mouseover: function() {
                // Sticky the input field’s error message
                me.items.items[0].items.items[0].suspendEvents(false);
              },
              mouseout: function() {
                // Unsticky the input field’s error message
                me.items.items[0].items.items[0].resumeEvents();

                if (me.items.items[0].items.items[0].isValid()) {
                  me.validate();
                }
              },
              scope: me
            },
            ui: 'nx-plain',
            glyph: me.glyphAddButton
          }
        ]
      },
      me.values = {
        xtype: 'grid',
        hideHeaders: true,
        ui: 'nx-borderless',
        columns: [
          { text: 'Value', dataIndex: 'value', flex: 1 },
          {
            xtype: 'actioncolumn',
            width: 25,
            items: [
              {
                icon: NX.Icons.url('cross', 'x16'),
                tooltip: 'Delete',
                handler: function (grid, rowIndex) {
                  me.removeValue(rowIndex);
                }
              }
            ]
          }
        ],
        store: me.store = Ext.create('Ext.data.Store', {
          storeId: valueFieldId,
          fields: ['value'],
          idProperty: 'value',
          sorters: me.sorted ? { property: 'value', direction: 'ASC' } : undefined
        })
      }
    ];

    me.callParent(arguments);

    me.on('afterrender', function () {
      me.valueField = me.down('component[valueFieldId=' + valueFieldId + ']');
      me.mon(me.valueField, 'blur', function (input) {
        if (input.isValid()) {
          me.validate();
        }
      });
      me.mon(me.valueField, 'change', function (input, newValue) {
        if (!newValue || newValue === '') {
          me.validate();
        }
      });
      Ext.create('Ext.util.KeyNav', me.valueField.el, {
        enter: me.addValue,
        scope: me
      });
    });
  },

  /**
   * @private
   * Add value form input field to set of values.
   */
  addValue: function () {
    var me = this,
        valueToAdd;

    if (!me.valueField.isValid()) {
      return;
    }

    valueToAdd = me.valueField.getValue();

    if (valueToAdd && me.store.find('value', valueToAdd) === -1) {
      me.store.add({ value: valueToAdd });
      me.valueField.setValue(undefined);
    }

    me.valueField.focus();

    me.syncValue();
  },

  /**
   * @private
   * Remove value form input field to set of values.
   * @param {Number} rowIndex of value to be deleted
   */
  removeValue: function (rowIndex) {
    var me = this;

    me.store.removeAt(rowIndex);
    me.syncValue();
  },

  getSubmitData: function () {
    var me = this,
        data = null,
        val;

    if (!me.disabled && me.submitValue && !me.isFileUpload()) {
      val = me.getSubmitValue();
      if (val !== null) {
        data = {};
        data[me.getName()] = val;
      }
    }
    return data;
  },

  getSubmitValue: function () {
    return this.getValue();
  },

  isValid: function () {
    var me = this,
        disabled = me.disabled,
        validate = me.forceValidation || !disabled;

    return validate ? me.validateValue() : disabled;
  },

  validateValue: function () {
    var me = this,
        errors = me.getErrors(),
        isValid = Ext.isEmpty(errors);

    if (isValid) {
      me.clearInvalid();
    }
    else {
      me.markInvalid(errors);
    }

    return isValid;
  },

  markInvalid: function (errors) {
    this.items.items[0].items.items[0].markInvalid(errors);
  },

  getErrors: function () {
    var me = this,
        format = Ext.String.format,
        errors = [],
        numValues = me.store.getCount();

    if (!me.allowBlank && numValues < 1) {
      errors.push(me.blankText);
    }
    if (numValues < me.minValues) {
      errors.push(format(me.minValuesText, me.minValues));
    }
    if (numValues > me.maxValues) {
      errors.push(format(me.maxValuesText, me.maxValues));
    }
    return errors;
  },

  /**
   * Clear any invalid styles/messages.
   */
  clearInvalid: function () {
    // Clear the message and fire the 'valid' event
    this.items.items[0].items.items[0].clearInvalid();
  },

  /**
   * @inheritdoc Ext.form.field.Field#setValue
   */
  setValue: function (value) {
    var me = this;

    me.loadValues(value);
    me.syncValue();
  },

  /**
   * @private
   * @returns {Array} store values as an array
   */
  getValues: function () {
    var values = [];

    this.store.each(function (model) {
      values.push(model.get('value'));
    });

    return values;
  },

  /**
   * @private
   * Loads values into the store.
   * @param value to be converted and loaded into store
   */
  loadValues: function (value) {
    var me = this,
        converted;

    me.store.removeAll();
    if (value) {
      converted = me.converter.toValues(value);
      Ext.each(converted, function (value) {
        me.store.add({ value: value });
      });
    }
  },

  /**
   * @private
   * Synchronizes the submit value with the current state of the store.
   */
  syncValue: function () {
    var me = this;
    me.mixins.field.setValue.call(me, me.converter.fromValues(me.getValues()));
  }

}, function () {

  this.borrow(Ext.form.field.Base, ['setError']);

});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext*/

/**
 * State model.
 *
 * @since 3.0
 */
Ext.define('NX.model.State', {
  extend: 'Ext.data.Model',
  idProperty: 'key',
  fields: [
    { name: 'key', type: 'string' },
    { name: 'value', defaultValue: undefined },
    { name: 'hash', type: 'string' }
  ]
});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext*/

/**
 * State store.
 *
 * @since 3.0
 */
Ext.define('NX.store.State', {
  extend: 'Ext.data.Store',
  model: 'NX.model.State'
});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext*/

/**
 * Helpers to show dialog boxes.
 *
 * @since 3.0
 */
Ext.define('NX.Dialogs', {
  singleton: true,
  requires: [
    'NX.I18n'
  ],

  /**
   * Show information dialog.
   *
   * @public
   */
  showInfo: function (title, message, options) {
    options = options || {};

    // set default configuration
    Ext.applyIf(options, {
      title: title || NX.I18n.get('Dialogs_Info_Title'),
      msg: message,
      buttons: Ext.Msg.OK,
      icon: Ext.MessageBox.INFO,
      closable: true
    });

    Ext.Msg.show(options);
  },

  /**
   * Show error dialog.
   *
   * @public
   */
  showError: function (title, message, options) {
    options = options || {};

    // set default configuration
    Ext.applyIf(options, {
      title: title || NX.I18n.get('Dialogs_Error_Title'),
      msg: message || NX.I18n.get('Dialogs_Error_Message'),
      buttons: Ext.Msg.OK,
      icon: Ext.MessageBox.ERROR,
      closable: true
    });

    Ext.Msg.show(options);
  },

  /**
   * Show confirmation dialog.
   *
   * @public
   */
  askConfirmation: function (title, message, onYesFn, options) {
    options = options || {};
    Ext.Msg.show({
      title: title,
      msg: message,
      buttons: Ext.Msg.YESNO,
      icon: Ext.MessageBox.QUESTION,
      closable: false,
      animEl: options.animEl,
      fn: function (buttonName) {
        if (buttonName === 'yes' || buttonName === 'ok') {
          if (Ext.isDefined(onYesFn)) {
            onYesFn.call(options.scope);
          }
        }
      }
    });
  }

});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext, NX*/

/**
 * State controller.
 *
 * @since 3.0
 */
Ext.define('NX.controller.State', {
  extend: 'NX.app.Controller',
  requires: [
    'Ext.direct.Manager',
    'NX.Dialogs',
    'NX.Messages',
    'NX.I18n'
  ],

  models: [
    'State'
  ],
  stores: [
    'State'
  ],

  /**
   * @private
   */
  disconnectedTimes: 0,

  /**
   * Max number of times to show a warning, before disabling the UI.
   *
   * @private
   */
  maxDisconnectWarnings: 3,

  /**
   * True when state is received from server.
   *
   * @private
   */
  receiving: false,

  /**
   * @override
   */
  init: function () {
    var me = this;

    me.listen({
      controller: {
        '#State': {
          userchanged: me.onUserChanged,
          uisettingschanged: me.onUiSettingsChanged,
          licensechanged: me.onLicenseChanged,
          serveridchanged: me.reloadWhenServerIdChanged
        }
      },
      store: {
        '#State': {
          add: me.onEntryAdded,
          update: me.onEntryUpdated,
          remove: me.onEntryRemoved
        }
      }
    });

    me.addEvents(
        /**
         * Fires when any of application context values changes.
         *
         * @event changed
         */
        'changed'
    );
  },

  /**
   * Install initial state, primed from app.js
   *
   * @override
   */
  onLaunch: function () {
    var me = this;

    //<if debug>
//    me.logTrace('Initial state:', NX.app.state);
    //</if>

    var uiSettings = NX.app.state['uiSettings'];

    NX.State.setBrowserSupported(
        !Ext.isIE || (Ext.isIE9p && Ext.isIE11m)
    );
    NX.State.setValue('debug', NX.app.debug);
    NX.State.setValue('receiving', false);

    // set uiSettings by the end so it does not start state pulling till all initial state hashes are known
    // this avoids unnecessary sending of state from server
    delete NX.app.state['uiSettings'];
    NX.State.setValues(NX.app.state);
    NX.State.setValues({ uiSettings: uiSettings });

    //<if debug>
//    me.logInfo('State primed');
    //</if>
  },

  /**
   * @public
   * @returns {Boolean} true when status is being received from server
   */
  isReceiving: function () {
    return this.receiving;
  },

  getValue: function(key, defaultValue) {
    var model = this.getStore('State').getById(key),
        value;

    if (model) {
      value = model.get('value');
      if (Ext.isDefined(value)) {
        return value;
      }
    }
    return defaultValue;
  },

  /**
   * @public
   * @param {String} key
   * @param {Object} value
   * @param {String} [hash]
   */
  setValue: function (key, value, hash) {
    var me = this,
        model = me.getStore('State').getById(key);

    if (!model) {
      if (Ext.isDefined(value)) {
        me.getStore('State').add(me.getStateModel().create({ key: key, value: value, hash: hash }));
      }
    }
    else {
      if (Ext.isDefined(value) && value !== null) {
        if (!Ext.Object.equals(value, model.get('value'))) {
          model.set('value', value);
        }
        if (!Ext.Object.equals(hash, model.get('hash'))) {
          model.set('hash', hash);
        }
      }
      else {
        me.getStore('State').remove(model);
      }
    }
    me.getStore('State').commitChanges();
    if (me.statusProvider) {
      if (Ext.isDefined(value) && hash) {
        me.statusProvider.baseParams[key] = hash;
      }
      else {
        delete me.statusProvider.baseParams[key];
      }
    }
  },

  setValues: function (map) {
    var me = this,
        hash, valueToSet;

    if (map) {
      Ext.Object.each(map, function (key, value) {
        valueToSet = value;
        if (Ext.isObject(value) && Ext.isDefined(value.hash) && Ext.isDefined(value.value)) {
          hash = value.hash;
          valueToSet = value.value;
        }
        if (Ext.isDefined(valueToSet)) {
          if (!Ext.isPrimitive(valueToSet) && !Ext.isArray(valueToSet)
              && Ext.ClassManager.getByAlias('nx.state.' + key)) {
            valueToSet = Ext.ClassManager.instantiateByAlias('nx.state.' + key, valueToSet);
          }
        }
        me.setValue(key, valueToSet, hash);
      });
    }
  },

  onEntryAdded: function (store, models) {
    var me = this;
    Ext.each(models, function (model) {
      me.notifyChange(model.get('key'), model.get('value'));
    });
  },

  onEntryUpdated: function (store, model, operation, modifiedFieldNames) {
    if ((operation === Ext.data.Model.EDIT) && modifiedFieldNames.indexOf('value') > -1) {
      this.notifyChange(model.get('key'), model.get('value'), model.modified.value);
    }
  },

  onEntryRemoved: function (store, model) {
    this.notifyChange(model.get('key'), undefined, model.get('value'));
  },

  notifyChange: function (key, value, oldValue) {
    var me = this;

    //<if debug>
//    me.logTrace('Changed:', key, '->', (value ? value : '(deleted)'));
    //</if>

    me.fireEvent(key.toLowerCase() + 'changed', value, oldValue);
    me.fireEvent('changed', key, value, oldValue);
  },

  /**
   * Reset state pooling when uiSettings.statusInterval changes.
   *
   * @private
   */
  onUiSettingsChanged: function (uiSettings, oldUiSettings) {
    var me = this,
        newStatusInterval, oldStatusInterval;

    uiSettings = uiSettings || {};
    oldUiSettings = oldUiSettings || {};

    if (uiSettings.debugAllowed !== oldUiSettings.debugAllowed) {
      NX.State.setValue('debug', uiSettings.debugAllowed && (NX.global.location.search === '?debug'));
    }

    if (uiSettings.title !== oldUiSettings.title) {
      NX.global.document.title = NX.global.document.title.replace(oldUiSettings.title, uiSettings.title);
    }

    if (me.statusProvider) {
      oldStatusInterval = me.statusProvider.interval;
    }

    newStatusInterval = uiSettings.statusIntervalAnonymous;
    if (NX.State.getUser()) {
      newStatusInterval = uiSettings.statusIntervalAuthenticated;
    }

    if (newStatusInterval > 0) {
      if (newStatusInterval !== oldStatusInterval) {
        if (me.statusProvider) {
          me.statusProvider.disconnect();
          me.receiving = false;
        }
        me.statusProvider = Ext.direct.Manager.addProvider({
          type: 'polling',
          url: NX.direct.api.POLLING_URLS.rapture_State_get,
          interval: newStatusInterval * 1000,
          baseParams: {
          },
          listeners: {
            data: me.onServerData,
            scope: me
          }
        });

        //<if debug>
//        me.logDebug('State pooling configured for', newStatusInterval, 'seconds');
        //</if>
      }
    }
    else {
      if (me.statusProvider) {
        me.statusProvider.disconnect();
      }

      //<if debug>
//      me.logDebug('State pooling disabled');
      //</if>
    }
  },

  /**
   * On sign-in/sign-out update status interval.
   *
   * @private
   */
  onUserChanged: function (user, oldUser) {
    var uiSettings;

    if (Ext.isDefined(user) !== Ext.isDefined(oldUser)) {
      uiSettings = NX.State.getValue('uiSettings');
      this.onUiSettingsChanged(uiSettings, uiSettings);
    }
  },

  /**
   * Called when there is new data from state callback.
   *
   * @private
   */
  onServerData: function (provider, event) {
    var me = this;
    if (event.data) {
      me.onSuccess(event);
    }
    else {
      me.onError(event);
    }
  },

  /**
   * Called when state pooling was successful.
   *
   * @private
   */
  onSuccess: function (event) {
    var me = this,
        serverId = me.getValue('serverId'),
        state;

    me.receiving = true;

    // re-enable the UI we are now connected again
    if (me.disconnectedTimes > 0) {
      me.disconnectedTimes = 0;
      NX.Messages.add({text: NX.I18n.get('State_Reconnected_Message'), type: 'success' });
    }

    NX.State.setValue('receiving', true);

    // propagate event data
    state = event.data.data;

    if (!me.reloadWhenServerIdChanged(serverId, state.serverId ? state.serverId.value : serverId)) {
      me.setValues(state);
    }

    // TODO: Fire global refresh event
  },

  /**
   * Called when state pooling failed.
   *
   * @private
   */
  onError: function (event) {
    var me = this;

    if (event.code === 'xhr') {
      if (event.xhr.status === 402) {
        NX.State.setValue('license', Ext.apply(Ext.clone(NX.State.getValue('license')), { installed: false }));
      }
      else {
        me.receiving = false;

        // we appear to have lost the server connection
        me.disconnectedTimes = me.disconnectedTimes + 1;

        NX.State.setValue('receiving', false);

        if (me.disconnectedTimes <= me.maxDisconnectWarnings) {
          NX.Messages.add({ text: NX.I18n.get('State_Disconnected_Message'), type: 'warning' });
        }

        // Give up after a few attempts and disable the UI
        if (me.disconnectedTimes > me.maxDisconnectWarnings) {
          NX.Messages.add({text: NX.I18n.get('State_Disconnected_Message'), type: 'danger' });

          // Stop polling
          me.statusProvider.disconnect();

          // FIXME: i18n
          // Show the UI with a modal dialog error
          NX.Dialogs.showError(
              'Server disconnected',
              'There is a problem communicating with the server',
              {
                buttonText: {
                  ok: 'Retry'
                },

                fn: function () {
                  // retry after the dialog is dismissed
                  me.statusProvider.connect();
                }
              }
          );
        }
      }
    }
    else if (event.type === 'exception') {
      NX.Messages.add({ text: event.message, type: 'danger' });
    }
  },

  /**
   * Refreshes status from server on demand.
   *
   * @public
   */
  refreshNow: function () {
    var me = this;
    if (me.statusProvider) {
      me.statusProvider.disconnect();
      me.statusProvider.connect();
    }
  },

  /**
   * Show messages about license.
   *
   * @private
   * @param {Object} license
   * @param {Number} license.installed
   * @param {Object} oldLicense
   * @param {Number} oldLicense.installed
   */
  onLicenseChanged: function (license, oldLicense) {
    if (license && oldLicense) {
      if (license.installed && !oldLicense.installed) {
        NX.Messages.add({ text: NX.I18n.get('State_Installed_Message'), type: 'success' });
      }
      else if (!license.installed && oldLicense.installed) {
        NX.Messages.add({ text: NX.I18n.get('State_Uninstalled_Message'), type: 'warning' });
      }
    }
  },

  reloadWhenServerIdChanged: function (serverId, oldServerId) {
    if (oldServerId && (serverId !== oldServerId)) {
      // FIXME: i18n
      NX.Dialogs.showInfo(
          'Server restarted',
          'Application will be reloaded as server has been restarted',
          {
            fn: function () {
              NX.global.location.reload();
            }
          }
      );
      return true;
    }
    return false;
  }

});

/**
 * https://support.sencha.com/index.php#ticket-22557
 */
Ext.define('Ext.patch.Ticket_22557_2', {
  override: 'Ext.grid.header.Container',
  onHeaderCtEvent: function(e, t) {
    var me = this,
      headerEl = e.getTarget('.' + Ext.grid.column.Column.prototype.baseCls),
      header,
      targetEl,
      isTriggerClick;

    if (headerEl && !me.ddLock) {
      header = Ext.getCmp(headerEl.id);
      if (header) {
        targetEl = header[header.clickTargetName];
        if (e.within(targetEl)) {
          if (e.type === 'click') {
            isTriggerClick = header.onTitleElClick(e, targetEl);
            if (isTriggerClick) {
              me.onHeaderTriggerClick(header, e, t);
            } else {
              me.onHeaderClick(header, e, t);
            }
          }
          else if (e.type === 'contextmenu') {
            me.onHeaderContextMenu(header, e, t);
          } else if (e.type === 'dblclick') {
            header.onTitleElDblClick(e, targetEl.dom);
          }
        }
      }
    }
  }
});

/**
 * https://support.sencha.com/index.php#ticket-21425
 */
Ext.define('Ext.patch.Ticket_21425', {
  override: 'Ext.util.History',

  getHash: function() {
    // HACK: Firefox decodes the hash when accessed directly, so we need to use
    // location.href to get it instead
    // return this.win.location.hash.substr(1);
    return location.href.split('#').splice(1).join('#');
  }
});

/**
 * https://support.sencha.com/index.php#ticket-22557
 */
Ext.define('Ext.patch.Ticket_22557_1', {
  override : 'Ext.view.Table',

  getMaxContentWidth: function(header) {
    return this.callParent(arguments) + 4;
  }
});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext*/

/**
 * **{@link Ext.grid.column.Date}** override, that sets format.
 *
 * @since 3.0
 */
Ext.define('NX.ext.grid.column.Date', {
  override: 'Ext.grid.column.Date',

  format: 'Y-M-d H:i:s'

});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext*/

/**
 * **{@link Ext.form.field.Number}** override, that disables mouse wheel interactions for all numeric fields.
 *
 * @since 3.1.0
 */
Ext.define('NX.ext.form.field.Number', {
  override: 'Ext.form.field.Number',

 mouseWheelEnabled: false

});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext*/

/**
 * An email **{@link Ext.form.field.Text}**.
 *
 * @since 3.0
 */
Ext.define('NX.ext.form.field.Email', {
  extend: 'Ext.form.field.Text',
  alias: 'widget.nx-email',

  vtype: 'nx-email',
  maxLength: 254

});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext*/

/**
 * **{@link Ext.form.FieldContainer}** override, that changes default label width.
 *
 * @since 3.0
 */
Ext.define('NX.ext.form.FieldContainer', {
  override: 'Ext.form.FieldContainer',

  labelAlign: 'top',
  labelStyle: 'font-weight: bold;',
  msgTarget: 'under',

  initComponent: function () {
    var me = this;

    if (me.helpText) {
      me.afterLabelTpl = '<span style="font-size: 10px;">' + me.helpText + '</span>';
    }

    me.callParent(arguments);
  }

});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext*/

/**
 *  **{@link Ext.direct.RemotingProvider}** overrides.
 *
 *  @since 3.0
 */
Ext.define('NX.ext.direct.RemotingProvider', {
  override: 'Ext.direct.RemotingProvider',

  /**
   * Avoid buffering if "enableBuffer" option is false.
   *
   * @override
   */
  queueTransaction: function(transaction) {
    if (transaction.callbackOptions && transaction.callbackOptions.enableBuffer === false) {
      this.sendRequest(transaction);
      return;
    }
    this.callParent(arguments);
  }
});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext, NX*/

/**
 * About window.
 *
 * @since 3.0
 */
Ext.define('NX.view.CopyWindow', {
  extend: 'NX.view.ModalDialog',
  alias: 'widget.nx-copywindow',
  requires: [
    'NX.I18n',
    'NX.Icons'
  ],

  layout: {
    type: 'vbox',
    align: 'stretch'
  },

  ui: 'nx-inset',

  /**
   * @property
   * The text to be selected for copying
   */
  copyText: '',

  /**
   * @property
   * The message to use when prompting the user to copy/paste
   */
  defaultMessage: 'Copy to clipboard: #{key}, Enter',

  /**
   * @override
   */
  initComponent: function () {
    var me = this,
        message = this.format(this.defaultMessage);

    me.width = NX.view.ModalDialog.MEDIUM_MODAL;

    me.title = message;
    me.items = {
      xtype: 'form',
      defaults: {
        anchor: '100%'
      },
      items: {
        xtype: 'textfield',
        name: 'url',
        value: me.copyText,
        selectOnFocus: true
      },
      buttonAlign: 'left',
      buttons: [
        {
          text: NX.I18n.get('Button_Close'),
          action: 'close',
          bindToEnter: true,
          handler: function () {
            me.close();
          }
        }
      ]
    };
    me.defaultFocus = 'textfield';

    me.callParent();
  },

  /**
   * @private
   * @param Substitute the keyboard shortcut for copy, given the current platform
   * @returns {string}
   */
  format: function (message) {
    var copyKey = (/mac os x/i.test(navigator.userAgent) ? '⌘' : 'Ctrl') + '+C';
    return message.replace(/#{\s*key\s*}/g, copyKey);
  }

});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext, NX*/

/**
 * Copy window controller
 *
 * @since 3.0
 */
Ext.define('NX.controller.Copy', {
  extend: 'NX.app.Controller',

  views: [
    'CopyWindow'
  ],

  refs: [
    {
      ref: 'copyModal',
      selector: 'nx-copywindow'
    }
  ],

  /**
   * @override
   */
  init: function () {
    var me = this;

    me.listen({
      component: {
        'nx-copywindow button[action=close]': {
          click: me.copyToClipboard
        }
      }
    });
  },

  copyToClipboard: function() {
    this.getCopyModal().close();
  }
});

/**
 * https://support.sencha.com/index.php#ticket-18964
 */
Ext.define('Ext.patch.Ticket_18964', {
  override: 'Ext.view.BoundList',

  getRefItems: function() {
    var me = this,
        result = [];

    if (me.pagingToolbar) {
      result.push(me.pagingToolbar);
    }
    // HACK: Disable including this, seems this value is 'true' for itemselector
    // HACK: which totally messes up component queries
    //if (me.loadMask) {
    //  result.push(me.loadMask);
    //}
    return result;
  }
});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext, NX, Image*/

/**
 * Main uber mode controller.
 *
 * @since 3.0
 */
Ext.define('NX.controller.Icon', {
  extend: 'NX.app.Controller',
  requires: [
    'Ext.Error',
    'Ext.util.CSS',
    'NX.util.Url',
    'NX.Icons'
  ],

  models: [
    'Icon'
  ],

  stores: [
    'Icon'
  ],

  /**
   * @private
   */
  stylesheet: undefined,

  /**
   * @override
   */
  onLaunch: function() {
    var me = this;

    // install stylesheet after all other controllers have had a chance to init & add icons.
    me.installStylesheet();

    // HACK: preload some additional image resources
    me.preloadImage(NX.util.Url.cacheBustingUrl(NX.util.Url.baseUrl + '/static/rapture/resources/images/shared/icon-error.png'));
    me.preloadImage(NX.util.Url.cacheBustingUrl(NX.util.Url.baseUrl + '/static/rapture/resources/images/shared/icon-info.png'));
    me.preloadImage(NX.util.Url.cacheBustingUrl(NX.util.Url.baseUrl + '/static/rapture/resources/images/shared/icon-question.png'));
    me.preloadImage(NX.util.Url.cacheBustingUrl(NX.util.Url.baseUrl + '/static/rapture/resources/images/shared/icon-warning.png'));
  },

  /**
   * @private
   * @param {String} url
   */
  preloadImage: function(url) {
    var img;

    //<if debug>
//    this.logTrace('Preloading:', url);
    //</if>

    img = new Image();
    img.src = url;
  },

  /**
   * Generate and install stylesheet for icons when the applications is launching.
   *
   * @private
   */
  installStylesheet: function () {
    var me = this,
        styles = [];

    //<if debug>
//    me.logDebug('Installing stylesheet');
    //</if>

    // build styles for each icon in store
    me.getStore('Icon').each(function (record) {
      var img, style = me.buildIconStyle(record.data);
      //me.logDebug('Adding style: ' + style);
      styles.push(style);

      // Optionally pre-load icon
      if (record.data.preload) {
        me.preloadImage(record.data.url);
      }
    });

    // create the style sheet
    me.stylesheet = Ext.util.CSS.createStyleSheet(styles.join(' '), 'nx-icons');

    //<if debug>
//    me.logDebug('Stylesheet installed with', me.stylesheet.cssRules.length, 'rules');
    //</if>
  },

  /**
   * Build style for given icon.
   *
   * @private
   */
  buildIconStyle: function (icon) {
    var style;

    style = '.' + icon.cls + ' {';
    style += 'background: url(' + icon.url + ') no-repeat center center !important;';
    style += 'height: ' + icon.height + 'px;';
    style += 'width: ' + icon.width + 'px;';
    // needed to get iconCls lined up in trees when height/width is set
    style += 'vertical-align: middle;';
    style += '}';

    return style;
  },

  /**
   * Add new icons.
   *
   * @public
   * @param icons Array or object.
   */
  addIcons: function (icons) {
    var me = this;
    if (Ext.isArray(icons)) {
      Ext.Array.each(icons, function (icon) {
        me.addIcon(icon);
      });
    }
    else if (Ext.isObject(icons)) {
      Ext.Object.each(icons, function (key, value) {
        var copy = Ext.clone(value);
        copy.name = key;
        me.addIcon(copy);
      });
    }
    else {
      Ext.Error.raise('Expected array or object, found: ' + icons);
    }
  },

  /**
   * Add a new icon.
   *
   * @public
   */
  addIcon: function (icon) {
    var me = this;

    // If icon contains 'variants' field then create an icon for each variant
    if (Ext.isArray(icon.variants)) {
      var copy = Ext.clone(icon);
      delete copy.variants;
      Ext.each(icon.variants, function (variant) {
        copy.variant = variant;
        me.addIcon(copy);
      });
      return;
    }

    me.configureIcon(icon);

    // complain if height/width are missing as this could cause the image not to display
    if (!icon.height) {
      me.logWarn('Icon missing height:', icon.css);
    }
    if (!icon.width) {
      me.logWarn('Icon missing width:', icon.css);
    }

    // TODO: complain if we are overwriting an icon

    me.getStore('Icon').add(icon);
  },

  /**
   * Apply basic icon configuration.
   *
   * @private
   */
  configureIcon: function (icon) {
    var variant = icon.variant;

    // automatically apply 'x<size>'
    if (Ext.isString(variant)) {
      if (variant.charAt(0) === 'x' && variant.length > 1) {
        var size = Ext.Number.from(variant.substring(1), -1);
        if (size === -1) {
          throw Ext.Error.raise('Invalid variant format: ' + variant);
        }
        icon.height = icon.width = size;
      }
    }

    icon.url = NX.Icons.url2(icon.file, icon.variant);
    icon.cls = NX.Icons.cls(icon.name, icon.variant);
  },

  /**
   * Find an icon by name with optional variant.
   *
   * @public
   */
  findIcon: function (name, variant) {
    var store = this.getStore('Icon'),
        recordId;

    recordId = store.findBy(function (record, id) {
      // find matching icon name
      if (name === record.get('name')) {
        // if icon has a variant match that too
        if (variant) {
          if (variant === record.get('variant')) {
            // match
            return true;
          }
        }
      }

      // no match
      return false;
    });

    if (recordId === -1) {
      return null;
    }
    return store.getAt(recordId);
  }
});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext*/

/**
 * **{@link Ext.form.field.Display}** override, that changes default width overridden in {@link Ext.form.field.Base}.
 *
 * @since 3.0
 */
Ext.define('NX.ext.form.field.Display', {
  override: 'Ext.form.field.Display',

  width: undefined

});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext, NX*/

/**
 * Nexus application.
 *
 * @since 3.0
 */
Ext.define('NX.app.Application', {
  extend: 'Ext.app.Application',

  requires: [
    'Ext.Ajax',
    'Ext.Error',
    'Ext.direct.Manager',
    'Ext.state.Manager',
    'Ext.state.LocalStorageProvider',
    'Ext.util.LocalStorage',
    'NX.view.Viewport',
    'NX.util.Url',
    'NX.I18n',
    'NX.State'
  ],

  mixins: {
    logAware: 'NX.LogAware'
  },

  uses: [
    // framework patches
    'Ext.patch.Ticket_15227',
    'Ext.patch.Ticket_17866',
    'Ext.patch.Ticket_18960',
    'Ext.patch.Ticket_18964',
    'Ext.patch.Ticket_21425',
    'Ext.patch.Ticket_22557_1',
    'Ext.patch.Ticket_22557_2',

    // direct overrides
    'NX.ext.direct.RemotingProvider',
    'NX.ext.form.action.DirectLoad',
    'NX.ext.form.action.DirectSubmit',

    // form overrides
    'NX.ext.form.FieldContainer',
    'NX.ext.form.field.Base',
    'NX.ext.form.field.Checkbox',
    'NX.ext.form.field.Display',
    'NX.ext.form.field.Number',

    // custom form fields
    'NX.ext.form.OptionalFieldSet',
    'NX.ext.form.field.Email',
    'NX.ext.form.field.Password',
    'NX.ext.form.field.RegExp',
    'NX.ext.form.field.Url',
    'NX.ext.form.field.ClearableComboBox',
    'NX.ext.form.field.DateDisplayField',
    'NX.ext.form.field.ValueSet',
    'NX.ext.SearchBox',
    'Ext.ux.form.ItemSelector',

    // grid plugins
    'NX.ext.grid.plugin.FilterBox',
    'NX.ext.grid.plugin.RemoteFilterBox',
    'NX.ext.grid.plugin.Filtering',

    // grid overrides
    'NX.ext.grid.column.Date',

    // custom grid columns
    'NX.ext.grid.column.Icon',
    'NX.ext.grid.column.CopyLink'
  ],

  name: 'NX',

  /**
   * Store application instance in "NX.application".
   */
  appProperty: 'application',

  /**
   * Relative to /index.html
   */
  appFolder: 'static/rapture/NX',

  paths: {
    'Ext.ux': 'static/rapture/Ext/ux',
    'Ext.patch': 'static/rapture/Ext/patch'
  },

  /**
   * Always active controllers.
   */
  controllers: [
    'Copy',
    'Logging',
    'State',
    'Bookmarking',
    'ExtDirect',
    'Features',
    'Icon',
    'KeyNav',
    'Message',
    'Permissions'
  ],

  /**
   * Managed controller configurations.
   *
   * @private
   * @property {Ext.util.MixedCollection}
   */
  managedControllers: undefined,

  statics: {
    alwaysActive: function () {
      return true;
    },
    defaultActivation: function () {
      return NX.app.Application.supportedBrowser();
    },
    supportedBrowser: function () {
      return NX.State.isBrowserSupported();
    },
    unsupportedBrowser: function () {
      return !NX.app.Application.supportedBrowser();
    },
    licensed: function () {
      return !NX.State.requiresLicense() || NX.State.isLicenseValid();
    },
    unlicensed: function () {
      return !NX.app.Application.licensed();
    },
    licenseExpired: function() {
      var daysToLicenseExpiry = NX.State.getDaysToLicenseExpiry();
      return NX.app.Application.licensed() && daysToLicenseExpiry ? daysToLicenseExpiry < 0 : false; 
    },
    debugMode: function () {
      return NX.State.getValue('debug') === true;
    },
    bundleActive: function (symbolicName) {
      return NX.State.getValue('activeBundles').indexOf(symbolicName) > -1;
    }
  },

  /**
   * Flag to indicate that app is ready.
   *
   * @public
   * @property {Boolean}
   * @readonly
   */
  ready: false,

  /**
   * @override
   * @param {NX.app.Application} app this class
   */
  init: function (app) {
    var me = this;

    //<if debug>
//    me.logInfo('Initializing');
//    me.logDebug(me.managedControllers.getCount(), 'managed controllers');
    //</if>

    // Configure blank image URL
    Ext.BLANK_IMAGE_URL = NX.util.Url.baseUrl + '/static/rapture/resources/images/s.gif';

    Ext.Ajax.defaultHeaders = {
      // HACK: Setting request header to allow analytics to tell if the request came from the UI or not
      // HACK: This has some issues, will only catch ajax requests, etc... but may be fine for now
      'X-Nexus-UI': 'true'
    };

    app.initErrorHandler();
    app.initDirect();
    app.initState();
  },

  /**
   * Hook into browser error handling (in order to log them).
   *
   * @private
   */
  initErrorHandler: function () {
    var me = this,
        originalOnError = NX.global.onerror;

    // FIXME: This needs further refinement, seems like javascript errors are lost in Firefox (but show up fine in Chrome)

    // pass unhandled errors to application error handler
    Ext.Error.handle = function (err) {
      me.handleError(err);
    };

    // FIXME: This will catch more errors, but duplicates messages for ext errors
    // FIXME: Without this however some javascript errors will go unhandled
    NX.global.onerror = function (msg, url, line) {
      me.handleError({ msg: msg + ' (' + url + ':' + line + ')' });

      // maybe delegate to original onerror handler?
      if (originalOnError) {
        originalOnError(msg, url, line);
      }
    };

    //<if debug>
//    me.logDebug('Configured error handling');
    //</if>
  },

  /**
   * Handle application error.
   *
   * @private
   */
  handleError: function (error) {
    NX.Messages.add({
      type: 'danger',
      text: this.errorAsString(error)
    });
  },

  /**
   * Customize error to-string handling.
   *
   * Ext.Error.toString() assumes instance, but raise(String) makes anonymous object.
   *
   * @private
   */
  errorAsString: function (error) {
    var className = error.sourceClass || '',
        methodName = error.sourceMethod ? '.' + error.sourceMethod + '(): ' : '',
        msg = error.msg || '(No description provided)';
    return className + methodName + msg;
  },

  /**
   * Initialize Ex.Direct remote providers.
   *
   * @private
   */
  initDirect: function () {
    var remotingProvider;

    remotingProvider = Ext.direct.Manager.addProvider(NX.direct.api.REMOTING_API);

    // configure Ext.Direct buffer-window milliseconds
    remotingProvider.enableBuffer = 10;

    // disable retry
    remotingProvider.maxRetries = 0;

    // default request timeout to 60 seconds
    remotingProvider.timeout = 60 * 1000;

    //<if debug>
//    this.logDebug('Configured Ext.Direct');
    //</if>
  },

  /**
   * Initialize state manager.
   *
   * @private
   */
  initState: function () {
    var me = this,
        provider;

    // If local storage is supported install state provider
    if (Ext.util.LocalStorage.supported) {
      provider = Ext.create('Ext.state.LocalStorageProvider');
      Ext.state.Manager.setProvider(provider);
      //<if debug>
//      me.logDebug('Configured state provider: local');
      //</if>
    }
    else {
      //<if debug>
//      me.logWarn('Local storage not supported; state management not supported');
      //</if>
    }

    //<if debug>
//    if (provider) {
//      provider.on('statechange', function (provider, key, value, opts) {
//        me.logTrace('State changed:', key, '->', (value ? value : '(deleted)'));
//      });
//    }
    //</if>
  },

  /**
   * Starts the application.
   *
   * @public
   */
  start: function () {
    var me = this, becomeReady;

    //<if debug>
//    me.logInfo('Starting');
    //</if>

    Ext.create('NX.view.Viewport');

    me.syncManagedControllers();
    me.listen({
      controller: {
        '#State': {
          changed: me.syncManagedControllers
        }
      }
    });

    becomeReady = function () {
      // hide the loading mask after we have loaded
      Ext.get('loading').remove();
      Ext.fly('loading-mask').animate({ opacity: 0, remove: true });

      // mark app as ready
      me.logInfo('Ready');
      me.ready = true;
    };

    // FIXME: Need a better way to know when the UI is actually rendered so we can hide the mask
    // HACK: for now increasing delay slightly to cope with longer loading times
    Ext.defer(becomeReady, 500);
  },

  /**
   * Fired when synchronizing controllers and changes were detected.
   *
   * @event controllerschanged
   */

  /**
   * Create / Destroy managed controllers based on their active status.
   *
   * @private
   */
  syncManagedControllers: function () {
    var me = this,
        ref, initializedControllers = [],
        changes = false;

    //<if debug>
//    me.logDebug('Refreshing controllers');
    //</if>

    // destroy all controllers that are become inactive
    me.managedControllers.eachKey(function (key) {
      ref = me.managedControllers.get(key);
      if (!ref.active()) {
        if (ref.controller) {
          changes = true;

          //<if debug>
//          me.logDebug('Destroying controller:', key);
          //</if>

          ref.controller.fireEvent('destroy', ref.controller);

          // private reference to controller.eventbus
          ref.controller.eventbus.unlisten(ref.controller.id);

          if (Ext.isFunction(ref.controller.onDestroy)) {
            ref.controller.onDestroy();
          }
          me.controllers.remove(ref.controller);
          ref.controller.clearManagedListeners();
          if (Ext.isFunction(ref.controller.destroy)) {
            ref.controller.destroy();
          }
          delete ref.controller;
        }
      }
    });

    // create & init all controllers that become active
    me.managedControllers.eachKey(function (key) {
      ref = me.managedControllers.get(key);
      if (ref.active()) {
        if (!ref.controller) {
          changes = true;

          //<if debug>
//          me.logDebug('Initializing controller:', key);
          //</if>

          ref.controller = me.getController(key);
          initializedControllers.push(ref.controller);
        }
      }
    });

    // launch any initialized controller
    Ext.each(initializedControllers, function (controller) {
      controller.onLaunch(me);
    });
    // finish init on any initialized controller
    Ext.each(initializedControllers, function (controller) {
      controller.finishInit(me);
    });

    if (changes) {
      // TODO shall we do this on each refresh?
      me.getIconController().installStylesheet();
      me.fireEvent('controllerschanged');
    }
  }
});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext, NX*/

/**
 * Nexus application loader.
 *
 * @since 3.0
 */
Ext.define('NX.app.Loader', {
  requires: [
    'NX.app.Application',
    'Ext.app.Controller',
    'Ext.util.MixedCollection'
  ],
  mixins: {
    logAware: 'NX.LogAware'
  },

  /**
   * Discovered plugin controllers.
   *
   * @private
   * @property {Ext.util.MixedCollection}
   */
  controllers: undefined,

  /**
   * Load the application.
   *
   * @public
   */
  load: function (config) {
    var me = this, App;

    //<if debug>
//    me.logInfo('Loading');
    //</if>

    // sanity check config
    if (!Ext.isArray(config.pluginConfigs)) {
      Ext.Error.raise("Invalid config property 'pluginConfigs' (expected array): " + config.pluginConfigs);
    }
    if (!Ext.isObject(config.state)) {
      Ext.Error.raise("Invalid config property: 'state' (expected object): " + config.state);
    }

    //<if debug>
//    me.logDebug('ExtJS version:', Ext.getVersion('extjs'));
    //</if>

    me.controllers = Ext.create('Ext.util.MixedCollection');

    // attach initial application state
    NX.app.state = config.state;
    NX.app.debug = false;
    if (NX.global.location.search === '?debug') {
      if (NX.app.state.uiSettings.value.debugAllowed) {
        NX.app.debug = true;

        //<if debug>
//        me.logInfo('Debug mode enabled');
        //</if>
      }
      else {
        me.logWarn('Debug mode disallowed');
      }
    }

    // apply all plugin configurations
    //<if debug>
//    me.logDebug('Plugin configs:', config.pluginConfigs);
    //</if>

    Ext.each(config.pluginConfigs, function (className) {
      me.applyPluginConfig(className);
    });

    // launch the application
    App = Ext.ClassManager.get('NX.app.Application');
    Ext.onReady(function () {
      //<if debug>
//      me.logDebug('Received Ext.ready event');
      //</if>

      Ext.app.Application.instance = new App({
        managedControllers: me.controllers
      });

      //<if debug>
//      me.logInfo('Application loaded');
      //</if>

      Ext.app.Application.instance.start();

      //<if debug>
//      me.logInfo('Application started');
      //</if>
    });
  },

  /**
   * Apply plugin customizations.
   *
   * @private
   * @param {String} className
   */
  applyPluginConfig: function (className) {
    var me = this,
        config;

    //<if debug>
//    me.logDebug('Applying plugin config:', className);
    //</if>

    config = Ext.create(className);

    // find all controllers
    if (config.controllers) {
      Ext.each(config.controllers, function (config) {
        var controller = me.defineController(config);
        me.controllers.add(controller);
      });
    }

    // resolve all controllers
    if (me.controllers) {
      //<if debug>
//      me.logDebug(me.controllers.getCount(), 'plugin controllers:');
      //</if>

      me.controllers.each(function (controller) {
        // attach full class-name to controller defs
        controller.type = Ext.app.Controller.getFullName(controller.id, 'controller', 'NX').absoluteName;

        //<if debug>
//        me.logDebug('  + ' + controller.id + (controller.id !== controller.type ? ' (' + controller.type + ')' : ''));
        //</if>

        // require all controllers, to avoid warning in console
        Ext.require(controller.type);
      });
    }
  },

  /**
   * Define controller from configuration.
   *
   * @private
   * @param {String|Object} config
   * @return {Object} controller configuration
   */
  defineController: function(config) {
    // simple definition of controller class-name
    if (Ext.isString(config)) {
      return {
        id: config,
        active: NX.app.Application.defaultActivation
      };
    }

    // advanced configuration of controller
    if (!Ext.isObject(config)) {
      Ext.Error.raise('Invalid controller definition: ' + config);
    }

    // require 'id' parameter
    if (!Ext.isString(config.id) || config.id.length === 0) {
      Ext.Error.raise('Invalid controller definition: ' + config + '; required property: id');
    }

    // require or normalize 'active' parameter
    if (Ext.isBoolean(config.active)) {
      var flag = config.active;
      config.active = function() {
        return flag;
      };
    }
    else if (!Ext.isFunction(config.active)) {
      Ext.Error.raise('Invalid controller definition: ' + config.id + '; required property: active (boolean or function)');
    }

    return config;
  }
});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext, NX*/

/**
 * Unsupported browser uber mode panel.
 *
 * @since 3.0
 */
Ext.define('NX.view.UnsupportedBrowser', {
  extend: 'Ext.container.Container',
  alias: 'widget.nx-unsupported-browser',
  requires: [
    'NX.I18n',
    'NX.Icons'
  ],

  cls: 'nx-unsupported-browser',
  layout: 'border',

  /**
   * @override
   */
  initComponent: function () {
    var me = this;

    me.items = [
      {
        xtype: 'nx-header-panel',
        region: 'north',
        collapsible: false
      },

      {
        xtype: 'container',
        region: 'center',
        layout: {
          type: 'vbox',
          align: 'center',
          pack: 'center'
        },
        items: [
          {
            xtype: 'label',
            cls: 'title',
            text: NX.I18n.get('UnsupportedBrowser_Title')
          },
          {
            xtype: 'label',
            cls: 'description',
            text: NX.I18n.get('UnsupportedBrowser_Alternatives_Text')
          },
          {
            xtype: 'container',
            cls: 'icons',
            layout: {
              type: 'hbox'
            },
            items: [
              { xtype: 'image', width: 72, height: 72, src: NX.Icons.url('chrome', 'x72') },
              { xtype: 'image', width: 72, height: 72, src: NX.Icons.url('firefox', 'x72') },
              { xtype: 'image', width: 72, height: 72, src: NX.Icons.url('ie', 'x72') },
              { xtype: 'image', width: 72, height: 72, src: NX.Icons.url('opera', 'x72') },
              { xtype: 'image', width: 72, height: 72, src: NX.Icons.url('safari', 'x72') }
            ]
          },
          { xtype: 'button', text: NX.I18n.get('UnsupportedBrowser_Continue_Button'), action: 'continue' }
        ]
      },
      {
        xtype: 'nx-footer',
        region: 'south',
        hidden: false
      },
      {
        xtype: 'nx-dev-panel',
        region: 'south',
        collapsible: true,
        collapsed: true,
        resizable: true,
        resizeHandles: 'n',

        // keep initial constraints to prevent huge panels
        height: 300,

        // default to hidden, only show if debug enabled
        hidden: true
      }
    ];

    me.callParent();
  }

});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext*/

/**
 * Stores developer panel controller.
 *
 * @since 3.0
 */
Ext.define('NX.view.dev.Stores', {
  extend: 'Ext.panel.Panel',
  alias: 'widget.nx-dev-stores',
  requires: [
    'Ext.data.Store',
    'Ext.data.StoreManager'
  ],

  title: 'Stores',
  layout: 'fit',

  /**
   * @override
   */
  initComponent: function () {
    var me = this;

    Ext.apply(me, {
      items: [
        {
          xtype: 'label',
          text: 'No store selected',
          padding: '10 10 10 10'
        }
      ],

      tbar: [
        {
          xtype: 'combo',
          name: 'storeId',
          width: 300,
          emptyText: 'select a store',
          queryMode: 'local',
          displayField: 'id',
          valueField: 'id',
          trigger2Cls: 'x-form-search-trigger',
          onTrigger2Click: function () {
            this.getStore().load();
          },
          store: Ext.create('Ext.data.Store', {
            fields: ['id'],
            data: Ext.data.StoreManager,
            proxy: {
              type: 'memory',
              reader: {
                type: 'json',
                read: function (data) {
                  var stores = [];

                  data.each(function (store) {
                    stores.push({
                      id: store.storeId
                    });
                  });

                  return this.readRecords(stores);
                }
              }
            },
            sorters: {property: 'id', direction: 'ASC'}
          })
        },
        {
          xtype: 'button',
          text: 'Load store',
          action: 'load',
          glyph: 'xf0ab@FontAwesome' /* fa-arrow-circle-down */
        },
        {
          xtype: 'button',
          text: 'Clear store',
          action: 'clear',
          glyph: 'xf12d@FontAwesome' /* fa-eraser */
        }
      ]
    });

    me.callParent();
  }

});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext, NX*/

/**
 * Wizard grid screen.
 *
 * @since 3.0
 * @abstract
 */
Ext.define('NX.wizard.GridScreen', {
  extend: 'NX.wizard.Screen',
  alias: 'widget.nx-wizard-gridscreen',
  requires: [
    'NX.Assert'
  ],

  config: {
    /**
     * @cfg {Object} {@link Ext.grid.Panel} configuration object.
     */
    grid: undefined
  },

  /**
   * @override
   */
  initComponent: function () {
    var me = this;

    //<if assert>
//    NX.Assert.assert(me.grid, 'Missing required config: grid');
    //</if>

    Ext.applyIf(me.grid, {
      xtype: 'grid'
    });

    me.fields = me.fields || [];
    me.fields.push(me.grid);

    me.callParent(arguments);

    var view = me.getGrid().getView();

    // when grid loads sync
    view.on('refresh', function (view) {
      me.syncSizeToScreen(view);
    });

    // when screen is activated sync
    me.on('activate', function () {
      me.syncSizeToScreen(view);
    });

    // when wizard panel resizes sync
    me.on('added', function () {
      var panel = me.up('nx-wizard-panel');
      panel.on('resize', function () {
        me.syncSizeToScreen(view);
      });
    });
  },

  /**
   * @return {Ext.grid.Panel}
   */
  getGrid: function () {
    return this.down('grid');
  },

  /**
   * @private
   * @param {Ext.view.Table} view
   */
  syncSizeToScreen: function (view) {
    //console.log('syncing size');

    Ext.suspendLayouts();
    try {
      var table,
          contentHeight,
          visibleHeight,
          maxHeight;

      // ref: Ext.view.Table.hasVerticalScroll()
      table = view.getEl().down('table');
      if (!table) {
        return;
      }

      contentHeight = table.getHeight();
      visibleHeight = view.getHeight();
      maxHeight = this.calculateMaxHeight(view);

      if (contentHeight > maxHeight) {
        // content is larger than can display, needs to be set to max visible to scroll
        view.setHeight(maxHeight);
        view.setAutoScroll(true);
      }
      else if (visibleHeight < contentHeight) {
        // content fits into visible height, use content height
        view.setHeight(contentHeight);
        view.setAutoScroll(false);
      }
      else if (contentHeight < visibleHeight) {
        // content is smaller than visible, use content height
        view.setHeight(contentHeight);
        view.setAutoScroll(false);
      }

      //console.log('content,visible,max,current', contentHeight, visibleHeight, maxHeight, view.getHeight());
    }
    finally {
      Ext.resumeLayouts(true);
    }
  },

  /**
   * @private
   * @param {Ext.view.Table} view
   * @returns {number}
   */
  calculateMaxHeight: function (view) {
    var me = this,
        panel = me.up('nx-wizard-panel'),
        screenContainer = panel.getScreenContainer(),
        screenHeader = panel.getScreenHeader(),
        buttonsContainer = me.getButtonsContainer(),
        max;

    //function logheight(name, comp) {
    //  var el = comp.getEl();
    //  console.log(
    //      name,
    //      //me.heightOf(comp),
    //      'hf', el.getHeight(false),
    //      'ht', el.getHeight(true),
    //      'hf-ht', el.getHeight(false) - el.getHeight(true),
    //      'p', el.getPadding('tb'),
    //      'b', el.getBorderWidth('tb'),
    //      'm', el.getMargin('tb')
    //  );
    //}

    //logheight('panel', panel);
    //logheight('view', view);
    //logheight('screen-container', screenContainer);
    //logheight('screen-header', screenHeader);
    //logheight('screen-form', me.down('form'));
    //logheight('grid-headers', view.getHeaderCt());
    //logheight('buttons-container', buttonsContainer);

    function h(comp) {
      var el = comp.getEl(),
          hf = el.getHeight(false),
          hc = el.getHeight(true),
          m = el.getMargin('tb');
      return hf + (hf - hc) + m;
    }

    //Object.is replacement, as not supported in all browsers, derived from
    //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is
    function is(x, y) {
      if (x === y) {
        return x !== 0 || 1 / x === 1 / y;
      } else {
        return x !== x && y !== y;
      }
    };

    // calculate the height of all fields (except the grid)
    var grid = me.getGrid();
    var fieldsHeight = 0;
    me.down('#fields').items.each(function(item) {
      if (!is(item, grid)) {
        //logheight('field', item);

        fieldsHeight += h(item);
      }
    });

    // FIXME: where do these come from?
    var mysteryPixels = 6;
    var screenContainerEl = screenContainer.getEl();

    max = panel.getHeight(true) -
        h(screenHeader) -
        (screenContainerEl.getHeight(false) - screenContainerEl.getHeight(true)) -
        fieldsHeight -
        h(view.getHeaderCt()) -
        h(buttonsContainer) -
        mysteryPixels;

    //console.log('max:', max);
    return max;
  }
});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext, NX*/

/**
 * A tab panel that sorts tabs based on weight and title and not show the tab bar if only one tab.
 *
 * @since 3.0
 */
Ext.define('NX.ext.tab.SortedPanel', {
  extend: 'Ext.tab.Panel',
  alias: 'widget.nx-sorted-tabpanel',

  listeners: {
    /**
     * @private
     * Reorders tabs sorting them by weight / title.
     * Show the tab bar in case of more then one tab.
     *
     * @param me this tab panel
     * @param component added tab
     */
    add: function (me, component) {
      var thisTitle = component.title || '',
          thisWeight = component.weight || 1000,
          position = 0;

      me.suspendEvents();
      me.remove(component, false);

      me.items.each(function (item) {
        var thatTitle = item.title || '',
            thatWeight = item.weight || 1000;

        if (thisWeight < thatWeight
            || (thisWeight === thatWeight && thisTitle < thatTitle)) {
          return false;
        }
        position++;
        return true;
      });

      me.insert(position, component);
      me.resumeEvents();
    }
  },

  // FIXME: This doesn't belong here, this is styling treatment for master/detail tabs only
  /**
   * @override
   */
  onAdd: function(item, index) {
    item.tabConfig = item.tabConfig || {};
    Ext.applyIf(item.tabConfig, {
      // HACK: force tabs to follow scss style for borders
      border: null
    });

    this.callParent([item, index]);
  }
});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext*/

/**
 * Abstract change order window.
 *
 * @since 3.0
 */
Ext.define('NX.view.ChangeOrderWindow', {
  extend: 'NX.view.ModalDialog',
  alias: 'widget.nx-changeorderwindow',
  requires: [
    'NX.ext.form.field.ItemOrderer',
    'NX.I18n'
  ],
  ui: 'nx-inset',

  displayField: 'name',
  valueField: 'id',

  /**
   * @override
   */
  initComponent: function () {
    var me = this;

    me.setWidth(NX.view.ModalDialog.MEDIUM_MODAL);

    me.items = {
      xtype: 'form',
      items: {
        xtype: 'nx-itemorderer',
        store: me.store,
        displayField: me.displayField,
        valueField: me.valueField,
        delimiter: null,
        height: 400,
        width: 400
      },
      buttonAlign: 'left',
      buttons: [
        { text: NX.I18n.get('ChangeOrderWindow_Submit_Button'), action: 'save', formBind: true, ui: 'nx-primary' },
        { text: NX.I18n.get('ChangeOrderWindow_Cancel_Button'), handler: function () {
          this.up('window').close();
        }}
      ]
    };

    me.callParent();
  }

});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext*/

/**
 * Conditions developer panel controller.
 *
 * @since 3.0
 */
Ext.define('NX.controller.dev.Conditions', {
  extend: 'NX.app.Controller',
  requires: [
    'Ext.util.Filter'
  ],

  stores: [
    'NX.store.dev.Condition'
  ],
  views: [
    'dev.Conditions'
  ],

  refs: [
    {
      ref: 'showSatisfied',
      selector: 'nx-dev-conditions #showSatisfied'
    },
    {
      ref: 'showUnsatisfied',
      selector: 'nx-dev-conditions #showUnsatisfied'
    },
    {
      ref: 'devPanelTabs',
      selector: 'nx-dev-panel tabpanel'
    },
    {
      ref: 'devConditionsPanel',
      selector: 'nx-dev-panel nx-dev-conditions'
    }
  ],

  /**
   * @override
   */
  init: function () {
    var me = this;

    me.excludeSatisfiedFilter = Ext.create('Ext.util.Filter', {
      id: 'excludeSatisfiedFilter',
      filterFn: function (record) {
        return record.get('satisfied') !== true;
      }
    });
    me.excludeUnsatisfiedFilter = Ext.create('Ext.util.Filter', {
      id: 'excludeUnsatisfiedFilter',
      filterFn: function (record) {
        return record.get('satisfied') !== false;
      }
    });

    me.listen({
      controller: {
        '#State': {
          conditionboundedchanged: me.boundedChanged,
          conditionstatechanged: me.stateChanged
        }
      },
      component: {
        'nx-dev-conditions #showSatisfied': {
          change: me.syncSatisfiedFilter
        },
        'nx-dev-conditions #showUnsatisfied': {
          change: me.syncUnsatisfiedFilter
        }
      }
    });
  },

  /**
   * @override
   */
  onLaunch: function () {
    var devPanelTab = this.getDevPanelTabs();

    if (devPanelTab) {
      devPanelTab.add({ xtype: 'nx-dev-conditions' });
    }
  },

  /**
   * @override
   */
  onDestroy: function () {
    var me = this,
        devConditionsPanel = me.getDevConditionsPanel();

    if (devConditionsPanel) {
      me.getDevPanelTabs().remove(devConditionsPanel);
    }
  },

  syncSatisfiedFilter: function () {
    var me = this,
        value = me.getShowSatisfied().getValue(),
        store = me.getStore('NX.store.dev.Condition');

    if (value) {
      store.removeFilter(me.excludeSatisfiedFilter);
    }
    else {
      store.addFilter(me.excludeSatisfiedFilter);
    }
  },

  syncUnsatisfiedFilter: function () {
    var me = this,
        value = me.getShowUnsatisfied().getValue(),
        store = me.getStore('NX.store.dev.Condition');

    if (value) {
      store.removeFilter(me.excludeUnsatisfiedFilter);
    }
    else {
      store.addFilter(me.excludeUnsatisfiedFilter);
    }
  },

  boundedChanged: function (condition) {
    var store = this.getStore('NX.store.dev.Condition'),
        model;

    if (condition.bounded) {
      store.add({ id: condition.id, condition: condition });
      store.filter();
    }
    else {
      model = store.getById(condition.id);
      if (model) {
        store.remove(model);
      }
    }
  },

  stateChanged: function (condition) {
    var store = this.getStore('NX.store.dev.Condition'),
        model = store.getById(condition.id);

    if (model) {
      model.set('satisfied', condition.isSatisfied());
      model.commit();
      store.filter();
    }
  }

});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext, NX*/

/**
 * Master/Detail tabs.
 *
 * @since 3.0
 */
Ext.define('NX.view.drilldown.Details', {
  extend: 'Ext.panel.Panel',
  alias: 'widget.nx-drilldown-details',
  requires: [
    'NX.Icons',
    'NX.Bookmarks',
    'NX.ext.tab.SortedPanel',
    'NX.view.drilldown.Actions'
  ],

  /**
   * @override
   */
  initComponent: function() {
    var me = this;

    me.items = [
      {
        xtype: 'panel',
        itemId: 'info',
        ui: 'nx-drilldown-message',
        cls: 'nx-drilldown-info',
        iconCls: NX.Icons.cls('drilldown-info', 'x16'),
        hidden: true
      },
      {
        xtype: 'panel',
        itemId: 'warning',
        ui: 'nx-drilldown-message',
        cls: 'nx-drilldown-warning',
        iconCls: NX.Icons.cls('drilldown-warning', 'x16'),
        hidden: true
      },
      {
        xtype: 'nx-actions',
        items: me.actions
      },
      {
        xtype: 'nx-sorted-tabpanel',
        itemId: 'tab',
        ui: 'nx-light',
        cls: 'nx-hr',
        activeTab: 0,
        layoutOnTabChange: true,
        flex: 1,
        items: me.tabs
      }
    ];

    me.callParent();

    me.on('afterrender', me.calculateBookmarks, me);
  },

  showInfo: function(message) {
    var infoPanel = this.down('>#info');

    infoPanel.setTitle(message);
    infoPanel.show();
  },

  clearInfo: function() {
    var infoPanel = this.down('>#info');

    infoPanel.hide();
  },

  showWarning: function(message) {
    var warningPanel = this.down('>#warning');

    warningPanel.setTitle(message);
    warningPanel.show();
  },

  clearWarning: function() {
    var warningPanel = this.down('>#warning');

    warningPanel.hide();
  },

  addTab: function(tab) {
    var me = this,
        tabPanel = me.down('>#tab');

    tabPanel.add(tab);
    me.calculateBookmarks();
  },

  removeTab: function(tab) {
    var me = this,
        tabPanel = me.down('>#tab');

    tabPanel.remove(tab);
    me.calculateBookmarks();
  },

  /**
   * @public
   * @returns {String} bookmark token of selected tab
   */
  getBookmarkOfSelectedTab: function() {
    var tabPanel = this.down('>#tab');

    return tabPanel.getActiveTab().bookmark;
  },

  /**
   * @public
   * Finds a tab by bookmark & sets it active (if found).
   * @param {String} bookmark of tab to be activated
   */
  setActiveTabByBookmark: function(bookmark) {
    var me = this,
        tabPanel = me.down('>#tab'),
        tab = me.down('> tabpanel > panel[bookmark=' + bookmark + ']');

    if (tabPanel && tab) {
      tabPanel.setActiveTab(tab);
    }
  },

  /**
   * @private
   * Calculates bookmarks of all tabs based on tab title.
   */
  calculateBookmarks: function() {
    var tabPanel = this.down('>#tab');

    tabPanel.items.each(function(tab) {
      if (tab.title) {
        tab.bookmark = NX.Bookmarks.encode(tab.title).toLowerCase();
      }
    });
  }

});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext, NX*/

/**
 * Abstract Master/Detail controller.
 *
 * @since 3.0
 */
Ext.define('NX.controller.Drilldown', {
  extend: 'NX.app.Controller',
  requires: [
    'NX.Conditions',
    'NX.Dialogs',
    'NX.Bookmarks',
    'NX.view.drilldown.Drilldown',
    'NX.view.drilldown.Item',
    'NX.State'
  ],

  views: [
    'drilldown.Drilldown',
    'drilldown.Details'
  ],

  permission: undefined,

  /**
   * @protected
   * Get the human-readable name of a model
   */
  getDescription: Ext.emptyFn,

  /**
   * @override
   * An array of xtypes which represent the masters available to this drilldown
   */
  masters: null,

  /**
   * @override
   * The xtype of the detail panel used by this drilldown. Only needed when no masters exist.
   */
  detail: null,

  /**
   * @cfg {Function} optional function to be called on delete
   */
  deleteModel: undefined,

  /**
   * @override
   */
  onLaunch: function () {
    this.getApplication().getIconController().addIcons({
      'drilldown-info': {
        file: 'information.png',
        variants: ['x16', 'x32']
      },
      'drilldown-warning': {
        file: 'warning.png',
        variants: ['x16', 'x32']
      }
    });
  },

  /**
   * @override
   */
  init: function () {
    var me = this,
        componentListener = {};

    // Normalize lists into an array
    if (!me.masters) {
      me.masters = [];
    }

    // Add event handlers to each list
    for (var i = 0; i < me.masters.length; ++i) {
      componentListener[me.masters[i]] = {
        selection: me.onSelection,
        cellclick: me.onCellClick
      };
    }

    // Drilldown
    componentListener[(me.masters[0] || me.detail) + ' ^ nx-drilldown'] = {
      syncsize: me.syncSizeToOwner,
      activate: function() {
        me.currentIndex = 0;
        me.reselect();
        me.syncSizeToOwner();
      }
    };

    // New button
    componentListener[me.masters[0] + ' ^ nx-drilldown button[action=new]'] = {
      afterrender: me.bindNewButton
    };

    // Delete button
    componentListener[me.masters[0] + ' ^ nx-drilldown button[action=delete]'] = {
      afterrender: me.bindDeleteButton,
      click: me.onDelete
    };

    // Back button
    componentListener[(me.masters[0] || me.detail) + ' ^ nx-drilldown nx-addpanel button[action=back]'] = {
      click: function() {
        me.showChild(0, true);
      }
    };

    me.listen({
      component: componentListener,
      controller: {
        '#Bookmarking': {
          navigate: me.onNavigate
        }
      }
    });

    if (me.icons) {
      me.getApplication().getIconController().addIcons(me.icons);
    }
    if (me.features) {
      me.getApplication().getFeaturesController().registerFeature(me.features, me);
    }
  },

  /**
   * @private
   */
  getDrilldown: function() {
    return Ext.ComponentQuery.query('#nx-drilldown')[0];
  },

  /**
   * @private
   */
  getDrilldownItems: function() {
    return Ext.ComponentQuery.query('nx-drilldown-item');
  },

  /**
   * @private
   */
  getDrilldownDetails: function() {
    return Ext.ComponentQuery.query('nx-drilldown-details')[0];
  },

  /**
   * @public
   * Load all of the stores associated with this controller
   */
  loadStores: function () {
    var me = this;
    if (this.getFeature()) {
      Ext.each(this.stores, function(store){
        //<if debug>
//        me.logDebug('Loading Drilldown store: ', store);
        //</if>
        me.getStore(store).load();
      });
    }
  },

  /**
   * @public
   */
  reselect: function () {
    var lists = Ext.ComponentQuery.query('nx-drilldown-master');

    if (lists.length) {
      this.navigateTo(NX.Bookmarks.getBookmark());
    }
  },

  /**
   * @private
   * When a list item is clicked, display the new view and update the bookmark
   */
  onCellClick: function(view, td, cellIndex, model, tr, rowIndex, e) {
    var index = Ext.ComponentQuery.query('nx-drilldown-master').indexOf(view.up('grid'));

    //if the cell target is a link, let it do it's thing
    if(e && e.getTarget('a')) {
      return false;
    }
    this.loadView(index + 1, true, model);
  },

  /**
   * @public
   * A model changed, focus on the new row and update the name of the related drilldown
   */
  onModelChanged: function (index, model) {
    var me = this,
        lists = Ext.ComponentQuery.query('nx-drilldown-master'),
        view, firstCell, firstCellImgs;

    // If the list hasn’t loaded, don't do anything
    if (!lists[index]) {
      return;
    }

    view = lists[index].getView();
    firstCell = view.getCellByPosition({row:view.getRowId(model), column:0});
    firstCellImgs = firstCell ? firstCell.dom.getElementsByTagName('img') : null;

    lists[index].getSelectionModel().select([model], false, true);
    me.setItemName(index + 1, me.getDescription(model));
    if (firstCellImgs && firstCellImgs.length) {
      this.setItemClass(index + 1, firstCellImgs[0].className);
    }
  },

  /**
   * @public
   * Make the detail view appear
   *
   * @param index The zero-based view to load
   * @param animate Whether to animate the panel into view
   * @param model An optional record to select
   */
  loadView: function (index, animate, model) {
    var me = this,
      lists = Ext.ComponentQuery.query('nx-drilldown-master');

    // Don’t load the view if the feature is not ready
    if (!me.getFeature()) {
      return;
    }

    // Model specified, select it in the previous list
    if (model && index > 0) {
      lists[index - 1].fireEvent('selection', lists[index - 1], model);
      me.onModelChanged(index - 1, model);
    }
    // Set all child bookmarks
    for (var i = 0; i <= index; ++i) {
      me.setItemBookmark(i, NX.Bookmarks.fromSegments(NX.Bookmarks.getBookmark().getSegments().slice(0, i + 1)), me);
    }

    // Show the next view in line
    me.showChild(index, animate);
    me.bookmark(index, model);
  },

  /**
   * @public
   * Make the create wizard appear
   *
   * @param index The zero-based step in the create wizard
   * @param animate Whether to animate the panel into view
   * @param cmp An optional component to load
   */
  loadCreateWizard: function (index, animate, cmp) {
    var me = this;

    // Reset all non-root bookmarks
    for (var i = 1; i <= index; ++i) {
      me.setItemBookmark(i, null);
    }

    // Show the specified step in the wizard
    me.showCreateWizard(index, animate, cmp);
  },

  /**
   * @private
   * Bookmark specified model
   */
  bookmark: function (index, model) {
    var lists = Ext.ComponentQuery.query('nx-drilldown-master'),
        bookmark = NX.Bookmarks.getBookmark().getSegments(),
        segments = [],
        i = 0;

    // Add the root element of the bookmark
    segments.push(bookmark.shift());

    // Find all parent models and add them to the bookmark array
    while (i < lists.length && i < index - 1) {
      segments.push(bookmark.shift());
      ++i;
    }

    // Add the currently selected model to the bookmark array
    if (model) {
      segments.push(encodeURIComponent(model.getId()));
    }

    // Set the bookmark
    NX.Bookmarks.bookmark(NX.Bookmarks.fromSegments(segments), this);
  },

  /**
   * Reselect on user navigation.
   *
   * @protected
   */
  onNavigate: function () {
    this.reselect();
  },

  /**
   * @public
   * @param {NX.Bookmark} bookmark to navigate to
   */
  navigateTo: function (bookmark) {
    var me = this,
        lists = Ext.ComponentQuery.query('nx-drilldown-master'),
        list_ids = bookmark.getSegments().slice(1),
        index, modelId, store;

    // Don’t navigate if the feature view hasn’t loaded
    if (!me.getFeature || !me.getFeature()) {
      return;
    }

    if (lists.length && list_ids.length) {
      //<if debug>
//      me.logDebug('Navigate to: ' + bookmark.getSegments().join(':'));
      //</if>

      modelId = decodeURIComponent(list_ids.pop());
      index = list_ids.length;
      store = lists[index].getStore();

      if (store.isLoading()) {
        // The store hasn’t yet loaded, load it when ready
        me.mon(store, 'load', function() {
          me.selectModelById(index, modelId);
          me.mun(store, 'load');
        });
      } else {
        me.selectModelById(index, modelId);
      }
    } else {
      me.loadView(0, false);
    }
  },

  /**
   * @private
   * @param index of the list which owns the model
   * @param modelId to select
   */
  selectModelById: function (index, modelId) {
    var me = this,
        lists = Ext.ComponentQuery.query('nx-drilldown-master'),
        store, model;

    // If the list hasn’t loaded, don't do anything
    if (!lists[index]) {
      return;
    }

    // If the store doesn't have any records in it, do nothing
    store = lists[index].getStore();
    if (!store.getCount()) {
      return;
    }

    // getById() throws an error if a model ID is found, but not cached, check for content first
    model = me.getById(store, modelId);
    if (model === null) {
      // check for integer model id
      model = me.getById(store, parseInt(modelId));
    }
    if (model === null) {
      if (Ext.isFunction(me.findAndSelectModel)) {
        me.findAndSelectModel(index, modelId);
      }
      return;
    }

    me.selectModel(index, model);
  },

  /**
   * Selects a raw in specified list or loads the model in settings panel.
   *
   * @protected
   * @param index of the list which owns the model
   * @param model to select
   */
  selectModel: function (index, model) {
    var me = this,
        lists = Ext.ComponentQuery.query('nx-drilldown-master');

    if (index + 1 !== me.currentIndex) {
      me.loadView(index + 1, false, model);
    }
    else {
      lists[index].fireEvent('selection', lists[index], model);
      me.onModelChanged(index, model);
      me.refreshBreadcrumb();
    }
  },

  /**
   * Finds the model using other means that local store cache and selects the model if found.
   * Should be overridden by subclasses, usually to call into server to get the model by id.
   *
   * @protected
   * @param index of the list which owns the model
   * @param modelId to find and select
   */
  findAndSelectModel: function(index, modelId) {
    var me = this,
        lists = Ext.ComponentQuery.query('nx-drilldown-master'),
        store = lists[index].getStore(),
        modelType = store.model.modelName.replace(/^.*?model\./, '').replace(/\-.*$/, '');

    NX.Messages.add({
      text: modelType + " (" + modelId + ") not found",
      type: 'warning'
    });
  },

  /**
   * @private
   * Get a model from the specified store with the specified ID. Avoids exceptions
   * that arise from using Ext.data.Store.getById() with buffered stores.
   */
  getById: function (store, modelId) {
    var index = store.findBy(function(record) {
      return record.getId() === modelId;
    });

    if (index !== -1) {
      return store.getAt(index);
    }

    return null;
  },

  /**
   * @private
   */
  onDelete: function () {
    var me = this,
        selection = Ext.ComponentQuery.query('nx-drilldown-master')[0].getSelectionModel().getSelection(),
        description;

    if (Ext.isDefined(selection) && selection.length > 0) {
      description = me.getDescription(selection[0]);
      NX.Dialogs.askConfirmation('Confirm deletion?', description, function () {
        me.deleteModel(selection[0]);

        // Reset the bookmark
        NX.Bookmarks.bookmark(NX.Bookmarks.fromToken(NX.Bookmarks.getBookmark().getSegment(0)));
      }, {scope: me});
    }
  },

  /**
   * @protected
   * Enable 'New' when user has 'create' permission.
   */
  bindNewButton: function (button) {
    button.mon(
        NX.Conditions.isPermitted(this.permission + ':create'),
        {
          satisfied: button.enable,
          unsatisfied: button.disable,
          scope: button
        }
    );
  },

  /**
   * @protected
   * Enable 'Delete' when user has 'delete' permission.
   */
  bindDeleteButton: function (button) {
    button.mon(
        NX.Conditions.isPermitted(this.permission + ':delete'),
        {
          satisfied: button.enable,
          unsatisfied: button.disable,
          scope: button
        }
    );
  },

  // Constants which represent card indexes
  BROWSE_INDEX: 0,
  CREATE_INDEX: 1,
  BLANK_INDEX: 2,

  /**
   * @private
   * Given N drilldown items, this panel should have a width of N times the current screen width
   */
  syncSizeToOwner: function () {
    var me = this,
      drilldown = me.getDrilldown(),
      owner = drilldown.ownerCt.body.el,
      container = drilldown.down('container');

    container.setSize(owner.getWidth() * container.items.length, owner.getHeight());
    me.slidePanels(me.currentIndex, false);
  },

  /**
   * @public
   * Shift this panel to display the referenced step in the create wizard
   *
   * @param index The index of the create wizard to display
   * @param animate Set to “true�? if the view should slide into place, “false�? if it should just appear
   * @param cmp An optional component to load into the panel
   */
  showCreateWizard: function (index, animate, cmp) {
    var me = this,
      drilldown = me.getDrilldown(),
      items = me.padItems(index), // Pad the drilldown
      createContainer;

    // Add a component to the specified drilldown item (if specified)
    if (cmp) {
      createContainer = drilldown.down('#create' + index);
      createContainer.removeAll();
      createContainer.add(cmp);
    }

    // Show the proper card
    items[index].setCardIndex(me.CREATE_INDEX);

    me.slidePanels(index, animate);
  },

  /**
   * @public
   * Shift this panel to display the referenced master or detail panel
   *
   * @param index The index of the master/detail panel to display
   * @param animate Set to “true�? if the view should slide into place, “false�? if it should just appear
   */
  showChild: function (index, animate) {
    var me = this,
      items = me.getDrilldownItems(),
      item = items[index],
      createContainer;

    // Show the proper card
    item.setCardIndex(me.BROWSE_INDEX);

    // Destroy any create wizard panels
    for (var i = 0; i < items.length; ++i) {
      createContainer = items[i].down('#create' + i);
      createContainer.removeAll();
    }

    me.slidePanels(index, animate);
  },

  /**
   * @private
   * Hide all except the specified panel. Focus on a default form field, if available.
   *
   * This is needed to restrict focus to the visible panel only.
   */
  hideAllExceptAndFocus: function (index) {
    var me = this,
      items = me.getDrilldownItems(),
      form;

    // Hide everything that’s not the specified panel
    for (var i = 0; i < items.length; ++i) {
      if (i != index) {
        items[i].getLayout().setActiveItem(me.BLANK_INDEX);
      }
    }

    // Set focus on the default field (if available) or the panel itself
    form = items[index].down('nx-addpanel[defaultFocus]');
    if (form) {
      form.down('[name=' + form.defaultFocus + ']').focus();
    } else {
      me.getDrilldown().focus();
    }
  },

  /**
   * @private
   * Slide the drilldown to reveal the specified panel
   */
  slidePanels: function (index, animate) {
    var me = this,
      drilldown = me.getDrilldown(),
      feature = drilldown.up('nx-feature-content'),
      items = me.getDrilldownItems(),
      item = items[index];

    if (item && item.el) {

      // Restore the current card
      me.currentIndex = index;
      item.getLayout().setActiveItem(item.cardIndex);

      var left = feature.el.getX() - (index * feature.el.getWidth());
      if (animate) {
        // Suspend layouts until the drilldown animation is complete
        Ext.suspendLayouts();

        drilldown.animate({
          easing: 'easeInOut',
          duration: NX.State.getValue('animateDuration', 200),
          to: {
            x: left
          },
          callback: function() {
            // Update the breadcrumb
            me.refreshBreadcrumb();

            // Put focus on the panel we’re navigating to
            me.hideAllExceptAndFocus(me.currentIndex);

            // Destroy any create wizard panels after current
            for (var i = index + 1; i < items.length; ++i) {
              items[i].down('#create' + i).removeAll();
            }

            // Resume layouts
            Ext.resumeLayouts(true);

            // Resize the breadcrumb to fit the window
            me.resizeBreadcrumb();
          }
        });
      } else {
        // Show the requested panel, without animation
        drilldown.setX(left, false);

        // Update the breadcrumb
        me.refreshBreadcrumb();
        me.resizeBreadcrumb();

        // Put focus on the panel we’re navigating to
        me.hideAllExceptAndFocus(index);

        // Destroy any create wizard panels after current
        for (var i = index + 1; i < items.length; ++i) {
          items[i].down('#create' + i).removeAll();
        }
      }
    }
  },

  /**
   * @private
   * Pad the number of items in this drilldown to the specified index
   */
  padItems: function (index) {
    var me = this,
      drilldown = me.getDrilldown(),
      items = me.getDrilldownItems(),
      itemContainer;

    // Create new drilldown items (if needed)
    if (index > items.length - 1) {
      itemContainer = drilldown.down('container');

      // Create empty panels if index > items.length
      for (var i = items.length; i <= index; ++i) {
        itemContainer.add(drilldown.createDrilldownItem(i, undefined, undefined));
      }

      // Resize the panel
      me.syncSizeToOwner();
    }

    return me.getDrilldownItems();
  },

  /**
   * @private
   * Update the breadcrumb based on the itemName and itemClass of drilldown items
   */
  refreshBreadcrumb: function() {
    var me = this,
      content = me.getDrilldown().up('#feature-content'),
      breadcrumb = content.down('#breadcrumb'),
      items = me.getDrilldownItems(),
      objs = [];

    if (me.currentIndex == 0) {
      // Feature's home page, no breadcrumb required
      content.showRoot();
    } else {
      // Make a breadcrumb (including icon and 'home' link)
      objs.push({
          xtype: 'button',
          scale: 'large',
          ui: 'nx-drilldown',
          text: content.currentTitle,
          handler: function() {
            me.slidePanels(0, true);

            // Set the bookmark
            var bookmark = items[0].itemBookmark;
            if (bookmark) {
              NX.Bookmarks.bookmark(bookmark.obj, bookmark.scope);
            }
          }
        }
      );

      // Create the rest of the links
      for (var i = 1; i <= me.currentIndex && i < items.length; ++i) {
        // do no create breadcrumb for items that do not have a name
        if (!items[i].itemName) {
          return;
        }
        objs.push(
          // Separator
          {
            xtype: 'label',
            cls: 'nx-breadcrumb-separator',
            text: '/'
          },
          {
            xtype: 'image',
            height: 16,
            width: 16,
            cls: 'nx-breadcrumb-icon ' + items[i].itemClass
          },

          // Create a closure within a closure to decouple 'i' from the current context
          (function(j) {
            return {
              xtype: 'button',
              scale: 'medium',
              ui: 'nx-drilldown',
              // Disabled if it’s the last item in the breadcrumb
              disabled: (i === me.currentIndex ? true : false),
              text: items[j].itemName,
              handler: function() {
                var bookmark = items[j].itemBookmark;
                if (bookmark) {
                  NX.Bookmarks.bookmark(bookmark.obj, bookmark.scope);
                }
                me.slidePanels(j, true);
              }
            };
          })(i)
        );
      }

      breadcrumb.removeAll();
      breadcrumb.add(objs);
    }
  },

  /*
   * @private
   * Resize the breadcrumb, truncate individual elements with ellipses as needed
   */
  resizeBreadcrumb: function() {
    var me = this,
      padding = 60, // Prevent truncation from happening too late
      parent = me.getDrilldown().ownerCt,
      breadcrumb = me.getDrilldown().up('#feature-content').down('#breadcrumb'),
      buttons, availableWidth, minimumWidth;

    // Is the breadcrumb clipped?
    if (parent && breadcrumb.getWidth() + padding > parent.getWidth()) {

      // Yes. Take measurements and get a list of buttons sorted by length (longest first)
      buttons = breadcrumb.query('button').splice(1);
      availableWidth = parent.getWidth();

      // What is the width of the breadcrumb, sans buttons?
      minimumWidth = breadcrumb.getWidth() + padding;
      for (var i = 0; i < buttons.length; ++i) {
        minimumWidth -= buttons[i].getWidth();
      }

      // Reduce the size of the longest button, until all buttons fit in the specified width
      me.reduceButtonWidth(buttons, availableWidth - minimumWidth);
    }
  },

  /*
   * @private
   * Reduce the width of a set of buttons, longest first, to a specified width
   *
   * @param buttons The list of buttons to resize
   * @param width The desired resize width (sum of all buttons)
   * @param minPerButton The minimum to resize each button (until all buttons are at this minimum)
   */
  reduceButtonWidth: function(buttons, width, minPerButton) {
    var me = this,
      currentWidth = 0,
      setToWidth;

    // Sort the buttons by width
    buttons = buttons.sort(function(a,b) {
      return b.getWidth() - a.getWidth();
    });

    // Calculate the current width of the buttons
    for (var i = 0; i < buttons.length; ++i) {
      currentWidth += buttons[i].getWidth();
    }

    // Find the next button to resize
    for (var i = 0; i < buttons.length; ++i) {

      // Shorten the longest button
      if (i < buttons.length - 1 && buttons[i].getWidth() > buttons[i+1].getWidth()) {

        // Will resizing this button make it fit?
        if (currentWidth - (buttons[i].getWidth() - buttons[i+1].getWidth()) <= width) {

          // Yes.
          setToWidth = width;
          for (var j = i + 1; j < buttons.length; ++j) {
            setToWidth -= buttons[j].getWidth();
          }
          buttons[i].setWidth(setToWidth);

          // Exit the algorithm
          break;
        }
        else {
          // No. Set the width of this button to that of the next button, and re-run the algorithm.
          buttons[i].setWidth(buttons[i+1].getWidth());
          me.reduceButtonWidth(buttons, width, minPerButton);
        }
      }
      else {
        // All buttons are the same length, shorten all by the same length
        setToWidth = Math.floor(width / buttons.length);
        for (var j = 0; j < buttons.length; ++j) {
          buttons[j].setWidth(setToWidth);
        }

        // Exit the algorithm
        break;
      }
    }
  },

  /**
   * @public
   * Set the name of the referenced drilldown item
   */
  setItemName: function (index, text) {
    var me = this,
      items = me.padItems(index);

    items[index].setItemName(text);
  },

  /**
   * @public
   * Set the icon class of the referenced drilldown item
   */
  setItemClass: function (index, cls) {
    var me = this,
      items = me.padItems(index);

    items[index].setItemClass(cls);
  },

  /**
   * @public
   * Set the bookmark of the breadcrumb segment associated with the referenced drilldown item
   */
  setItemBookmark: function (index, bookmark, scope) {
    var me = this,
      items = me.padItems(index);

    items[index].setItemBookmark(bookmark, scope);
  },

  /**
   * @public
   */
  showInfo: function (message) {
    this.getDrilldownDetails().showInfo(message);
  },

  /**
   * @public
   */
  clearInfo: function () {
    this.getDrilldownDetails().clearInfo();
  },

  /**
   * @public
   */
  showWarning: function (message) {
    this.getDrilldownDetails().showWarning(message);
  },

  /**
   * @public
   */
  clearWarning: function () {
    this.getDrilldownDetails().clearWarning();
  },

  /**
   * Add a tab to the default detail panel
   *
   * Note: this will have no effect if a custom detail panel has been specified
   */
  addTab: function (tab) {
    var me = this;
    if (!me.detail) {
      me.getDrilldownDetails().addTab(tab);
    }
  },

  /**
   * Remove a panel from the default detail panel
   *
   * Note: this will have no effect if a custom detail panel has been specified
   */
  removeTab: function (tab) {
    var me = this;
    if (!me.detail) {
      me.getDrilldownDetails().removeTab(tab);
    }
  }
});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext*/

/**
 * List of all known features.
 *
 * @since 3.0
 */
Ext.define('NX.view.dev.Features', {
  extend: 'Ext.grid.Panel',
  alias: 'widget.nx-dev-features',

  title: 'Features',
  store: 'Feature',
  emptyText: 'No features',

  columns: [
    { text: 'mode', dataIndex: 'mode', editor: 'textfield' },
    { text: 'path', dataIndex: 'path', editor: 'textfield', flex: 1 },
    { text: 'bookmark', dataIndex: 'bookmark', editor: 'textfield', flex: 1 },
    { text: 'weight', dataIndex: 'weight', width: 80, editor: 'textfield' },
    { text: 'view', dataIndex: 'view', editor: 'textfield', hidden: true },
    { text: 'help keyword', dataIndex: 'helpKeyword', editor: 'textfield', flex: 1 },
    { text: 'description', dataIndex: 'description', editor: 'textfield', flex: 1 },
    { text: 'iconName', dataIndex: 'iconName', editor: 'textfield' },
    {
      xtype: 'nx-iconcolumn',
      dataIndex: 'iconName',
      width: 48,
      iconVariant: 'x16'
    },
    {
      xtype: 'nx-iconcolumn',
      dataIndex: 'iconName',
      width: 48,
      iconVariant: 'x32'
    }
  ],

  plugins: [
    { ptype: 'rowediting', clicksToEdit: 1 },
    'gridfilterbox'
  ],

  viewConfig: {
    deferEmptyText: false,
    markDirty: false
  }
});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext*/

/**
 * Abstract settings form.
 *
 * @since 3.0
 */
Ext.define('NX.view.SettingsForm', {
  extend: 'Ext.form.Panel',
  requires: [
    'NX.I18n'
  ],
  alias: 'widget.nx-settingsform',
  ui: 'nx-subsection',
  frame: true,

  /**
   * Set trackResetOnLoad by default.
   *
   * @private
   */
  constructor: function (config) {
    config = config || {};
    config.trackResetOnLoad = true;
    this.callParent([config]);
  },

  /**
   * @cfg {boolean} [settingsForm=true] Marker that we have a settings form
   * ({NX.controller.SettingsForm} controller kicks in)
   */
  settingsForm: true,

  /**
   * @cfg {boolean} [settingsFormSubmit=true] True if settings form should be submitted automatically when 'submit'
   * button is clicked. Set this to false if custom processing is needed.
   */
  settingsFormSubmit: true,

  /**
   * @cfg {boolean} [settingsFormSubmitOnEnter=false] True if form should be submitted on Enter.
   */
  settingsFormSubmitOnEnter: false,

  /**
   * @cfg {String/Function} Text to be used when displaying submit/load messages. If is a function it will be called
   * with submit/load response data as parameter and it should return a String.
   * If text contains "${action}", it will be replaced with performed action.
   */
  settingsFormSuccessMessage: undefined,

  /**
   * @cfg {String} [settingsFormLoadMessage] Text to be used as mask while loading data.
   */
  settingsFormLoadMessage: undefined,

  /**
   * @cfg {String} [settingsFormSubmitMessage] Text to be used as mask while submitting data.
   */
  settingsFormSubmitMessage: undefined,

  /**
   * @cfg {NX.util.condition.Condition} The condition to be satisfied in order for this form to be editable.
   */
  editableCondition: undefined,

  /**
   * @cfg {String} Optional text to be shown in case that form is not editable (condition is not satisfied).
   */
  editableMarker: undefined,

  autoScroll: true,
  waitMsgTarget: true,

  defaults: {
    xtype: 'textfield',
    allowBlank: false
  },

  buttonAlign: 'left',

  buttons: 'defaultButtons',

  /**
   * @override
   */
  initComponent: function () {
    var me = this;

    if (me.buttons === 'defaultButtons') {
      me.buttons = [
        {
          text: NX.I18n.get('SettingsForm_Save_Button'),
          action: 'save',
          ui: 'nx-primary',
          bindToEnter: false
        },
        {
          text: NX.I18n.get('SettingsForm_Discard_Button'),
          action: 'discard'
        }
      ];
    }

    Ext.applyIf(me, {
      settingsFormLoadMessage: NX.I18n.get('SettingsForm_Load_Message'),
      settingsFormSubmitMessage: NX.I18n.get('SettingsForm_Submit_Message')
    });

    if (me.buttons && Ext.isArray(me.buttons) && me.buttons[0] && Ext.isDefined(me.buttons[0].bindToEnter)) {
      me.buttons[0].bindToEnter = me.settingsFormSubmitOnEnter;
    }

    me.callParent();

    me.addEvents(
        /**
         * Fires when a record is loaded via {@link Ext.form.Panel#loadRecord}.
         *
         * @event recordloaded
         * @param {Ext.form.Panel} this form
         * @param {Ext.data.Model} loaded record
         */
        'recordloaded',

        /**
         * Fires after form was loaded via configured api.
         *
         * @event loaded
         * @param {Ext.form.Panel} this form
         * @param {Ext.form.action.Action} load action
         */
        'loaded',

        /**
         * Fires after form was submitted via configured api.
         *
         * @event submitted
         * @param {Ext.form.Panel} this form
         * @param {Ext.form.action.Action} submit action
         */
        'submitted'
    );
  },

  /**
   * Fires 'recordloaded' after record was loaded.
   *
   * @override
   */
  loadRecord: function (record) {
    var me = this;

    me.callParent(arguments);
    me.fireEvent('recordloaded', me, record);
  },

  /**
   * Sets the read only state for all fields of this form.
   *
   * @public
   * @param {boolean} editable
   */
  setEditable: function (editable) {
    var me = this,
        itemsToDisable = me.getChildItemsToDisable(),
        bottomBar;

    if (editable) {
      Ext.Array.each(itemsToDisable, function (item) {
        var enable = true,
            form;

        if (item.resetEditable) {
          if (Ext.isFunction(item.setReadOnly)) {
            item.setReadOnly(false);
          }
          else {
            if (Ext.isDefined(item.resetFormBind)) {
              item.formBind = item.resetFormBind;
            }
            if (item.formBind) {
              form = item.up('form');
              if (form && !form.isValid()) {
                enable = false;
              }
            }
            if (enable) {
              item.enable();
            }
          }
        }
        if (Ext.isDefined(item.resetEditable)) {
          delete item.resetEditable;
          delete item.resetFormBind;
        }
      });
    }
    else {
      Ext.Array.each(itemsToDisable, function (item) {
        if (Ext.isFunction(item.setReadOnly)) {
          if (item.resetEditable !== false && !item.readOnly) {
            item.setReadOnly(true);
            item.resetEditable = true;
          }
        }
        else {
          if (item.resetEditable !== false && !item.disabled) {
            item.disable();
            item.resetFormBind = item.formBind;
            delete item.formBind;
            item.resetEditable = true;
          }
        }
      });
    }

    bottomBar = me.getDockedItems('toolbar[dock="bottom"]')[0];
    if (bottomBar) {
      if (editable) {
        if (bottomBar.editableMarker) {
          bottomBar.remove(bottomBar.editableMarker);
          bottomBar.editableMarker = undefined;
        }
      }
      else {
        if (me.editableMarker) {
          bottomBar.editableMarker = Ext.widget({
            xtype: 'label',
            text: me.editableMarker,
            // TODO replace style with css class?
            style: {
              fontSize: '10px',
              fontWeight: 'bold'
            }
          });
          bottomBar.add(bottomBar.editableMarker);
        }
      }
    }
  }

});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext, NX*/

/**
 * Customized actioncolumn.
 *
 * @since 3.0
 */
Ext.define('NX.ext.grid.column.Action', {
  extend: 'Ext.grid.column.Action',
  alias: 'widget.nx-actioncolumn',

  /**
   * @override
   */
  initComponent: function () {
    var me = this;

    me.handler = function (grid, ri, ci, item, e, record, row) {
      me.fireEvent('actionclick', me, grid, ri, ci, item, record, row);
    };

    me.callParent();
  }
});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext*/

/**
 * List of all known icons.
 *
 * @since 3.0
 */
Ext.define('NX.view.dev.Icons', {
  extend: 'Ext.grid.Panel',
  alias: 'widget.nx-dev-icons',

  title: 'Icons',
  store: 'Icon',
  emptyText: 'No icons',

  viewConfig: {
    deferEmptyText: false
  },

  columns: [
    { text: 'cls', dataIndex: 'cls', width: 200 },
    { text: 'name', dataIndex: 'name' },
    { text: 'file', dataIndex: 'file' },
    { text: 'variant', dataIndex: 'variant', width: 50 },
    { text: 'size', xtype: 'templatecolumn', tpl: '{height}x{width}', width: 80 },
    { text: 'url', xtype: 'templatecolumn', tpl: '<a href="{url}" target="_blank">{url}</a>', flex: 1 },
    { text: 'img src', xtype: 'templatecolumn', tpl: '<img src="{url}"/>' },
    {
      xtype: 'nx-iconcolumn',
      text: 'img class',
      dataIndex: 'cls',
      iconCls: function(value) {
        return value;
      }
    }
  ],

  plugins: [
    { ptype: 'rowediting', clicksToEdit: 1 },
    'gridfilterbox'
  ]

});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext, NX*/

/**
 * Branding controller.
 *
 * @since 3.0
 */
Ext.define('NX.controller.Branding', {
  extend: 'NX.app.Controller',
  requires: [
    'NX.State'
  ],

  views: [
    'header.Branding'
  ],

  refs: [
    { ref: 'viewport', selector: 'viewport' },
    { ref: 'headerBranding', selector: 'nx-header-branding' },
    { ref: 'footerBranding', selector: 'nx-footer-branding' }
  ],

  /**
   * @override
   */
  init: function() {
    var me = this;

    me.listen({
      controller: {
        '#State': {
          brandingchanged: me.onBrandingChanged
        }
      },
      component: {
        'nx-header-branding': {
          afterrender: me.renderHeaderBranding
        },
        'nx-footer-branding': {
          afterrender: me.renderFooterBranding
        }
      }
    });
  },

  /**
   * Render header/footer branding when branding configuration changes.
   *
   * @private
   */
  onBrandingChanged: function() {
    this.renderHeaderBranding();
    this.renderFooterBranding();
  },

  /**
   * Render header branding.
   *
   * @private
   */
  renderHeaderBranding: function() {
    var branding = NX.State.getValue('branding'),
        headerBranding = this.getHeaderBranding();

    if (headerBranding) {
      if (branding && branding['headerEnabled']) {
        headerBranding.update(branding['headerHtml']);
        headerBranding.show();
      }
      else {
        headerBranding.hide();
      }
    }
  },

  /**
   * Render footer branding.
   *
   * @private
   */
  renderFooterBranding: function() {
    var branding = NX.State.getValue('branding'),
        footerBranding = this.getFooterBranding();

    if (footerBranding) {
      if (branding && branding['footerEnabled']) {
        footerBranding.update(branding['footerHtml']);
        footerBranding.show();
      }
      else {
        footerBranding.hide();
      }
    }
  }

});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext, NX, console*/

/**
 * Developer controller.
 *
 * @since 3.0
 */
Ext.define('NX.controller.dev.Developer', {
  extend: 'NX.app.Controller',
  requires: [
    'Ext.state.Manager',
    'NX.State',
    'NX.Messages'
  ],

  views: [
    'dev.Panel',
    'dev.Tests',
    'dev.Styles',
    'dev.Icons',
    'dev.Features',
    'dev.State',
    'dev.Stores',
    'dev.Logging'
  ],

  refs: [
    {
      ref: 'branding',
      selector: 'nx-header-branding'
    },
    {
      ref: 'developer',
      selector: 'nx-dev-panel'
    }
  ],

  /**
   * @protected
   */
  init: function () {
    var me = this;

    me.listen({
      controller: {
        '#State': {
          debugchanged: me.manageDeveloperPanel
        }
      },
      component: {
        'nx-dev-panel': {
          afterrender: me.manageDeveloperPanel
        },
        'nx-dev-panel tool[type=maximize]': {
          click: me.onMaximize
        },

        // Tests actions
        'nx-dev-tests button[action=testError]': {
          click: me.testError
        },
        'nx-dev-tests button[action=testExtError]': {
          click: me.testExtError
        },
        'nx-dev-tests button[action=testMessages]': {
          click: me.testMessages
        },
        'nx-dev-tests button[action=toggleUnsupportedBrowser]': {
          click: me.toggleUnsupportedBrowser
        },
        'nx-dev-tests button[action=showLicenseWarning]': {
          click: me.showLicenseWarning
        },
        'nx-dev-tests button[action=showQuorumWarning]': {
          click: me.showQuorumWarning
         },
        'nx-dev-tests button[action=clearLocalState]': {
          click: me.clearLocalState
        }
      }
    });
  },

  /**
   * @override
   */
  onLaunch: function () {
    var me = this;
    Ext.each(Ext.ComponentQuery.query('nx-dev-panel'), function (panel) {
      me.manageDeveloperPanel(panel);
    });
  },

  /**
   * Show/Hide developer panel based on debug state.
   *
   * @private
   * @param {Ext.Panel} developerPanel
   */
  manageDeveloperPanel: function (developerPanel) {
    var debug = NX.State.getValue('debug');

    developerPanel = developerPanel || this.getDeveloper();

    if (developerPanel) {
      if (debug) {
        developerPanel.show();
      }
      else {
        developerPanel.hide();
      }
    }
  },

  /**
   * Maximimze developer panel.
   *
   * @private
   */
  onMaximize: function(tool) {
    var panel = tool.up('nx-dev-panel'),
        tabs = panel.down('tabpanel'),
        win;

    panel.remove(tabs, false);

    win = Ext.create('Ext.window.Window', {
      title: panel.title,
      iconCls: panel.iconCls,
      glyph: panel.glyph,

      maximized: true,
      autoScroll: true,
      closable: false,

      layout: 'fit',
      items: tabs,
      tools: [
        {
          type: 'close',
          handler: function () {
            win.hide(panel, function () {
              win.remove(tabs, false);
              panel.add(tabs);
              win.destroy();
            });
          }
        }
      ]
    });

    win.show(panel);
  },

  /**
   * Attempts to call a object's method that doesn't exist to produce a low-level javascript error.
   *
   * @private
   */
  testError: function () {
    console.log_no_such_method();
  },

  /**
   * Raises an Ext.Error so we can see how that behaves.
   *
   * @private
   */
  testExtError: function () {
    Ext.Error.raise('simulated error');
  },

  /**
   * Adds messages for each of the major types to view styling, etc.
   *
   * @private
   */
  testMessages: function () {
    Ext.each(['default', 'primary', 'danger', 'warning', 'success'], function (type) {
      NX.Messages.add({
        type: type,
        text: 'test of ' + type
      });
    });
  },

  /**
   * Toggle the unsupported browser application state.
   *
   * @private
   */
  toggleUnsupportedBrowser: function() {
    NX.State.setBrowserSupported(!NX.State.isBrowserSupported());
  },

  /**
   * Set state such that a License warning element is shown in the UI.
   */
  showLicenseWarning : function() {
    var me = this,
        licenseWarnings = me.getController('NX.proui.controller.LicenseWarnings');

    licenseWarnings.daysToWarn = 10000;
    licenseWarnings.updateLicenseExpiryWarning();
  },

  /**
   * Modify state so that the database quorum warning is shown in the UI.
   *
   * @private
   */
  showQuorumWarning: function () {
    NX.State.setValue('quorum', { 'quorumPresent': false});
  },

  /**
   * Clear local browser state.
   *
   * @private
   */
  clearLocalState: function() {
    var provider = Ext.state.Manager.getProvider();
    // HACK: provider.state is private
    Ext.Object.each(provider.state, function (key, value) {
      provider.clear(key);
    });
  }

});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext*/

/**
 * Unlicensed uber mode controller.
 *
 * @since 3.0
 */
Ext.define('NX.controller.Unlicensed', {
  extend: 'NX.app.Controller',
  requires: [
    'NX.Bookmarks',
    'NX.Messages',
    'NX.I18n'
  ],
  
  
  /**
   * Show {@link NX.view.Unlicensed} view from {@link Ext.container.Viewport}.
   *
   * @override
   */
  onLaunch: function () {
    var me = this;
    //<if debug>
//    me.logDebug('Adding unlicensed listeners');
    //</if>
    Ext.History.on('change', me.forceLicensing);
    me.forceLicensing();
  },

  /**
   * Removes {@link NX.view.Unlicensed} view from {@link Ext.container.Viewport}.
   *
   * @override
   */
  onDestroy: function () {
    var me = this;
    //<if debug>
//    me.logDebug('Removing unlicensed listeners');
    //</if>
    Ext.History.un('change', me.forceLicensing);
  },

  /**
   * Show a message and force navigation to the Licensing page, preventing all other navigation in the UI.
   */
  forceLicensing: function () {
    NX.Messages.add({text: NX.I18n.get('State_License_Invalid_Message'), type: 'danger'});
    NX.Bookmarks.navigateTo(NX.Bookmarks.fromToken('admin/system/licensing'));
  }

});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext, NX*/

/**
 * Content (features area) controller.
 *
 * @since 3.0
 */
Ext.define('NX.controller.Content', {
  extend: 'NX.app.Controller',
  requires: [
    'NX.Icons',
    'NX.State'
  ],

  views: [
    'feature.Content'
  ],

  refs: [
    {
      ref: 'featureContent',
      selector: 'nx-feature-content'
    }
  ],

  /**
   * @override
   */
  init: function () {
    var me = this;

    me.listen({
      controller: {
        '#Menu': {
          featureselected: me.onFeatureSelected
        }
      },
      component: {
        'nx-feature-content': {
          resize: function (obj) {
            var drilldown;
            if (obj) {
              drilldown = obj.down('nx-drilldown');
              if (drilldown) {
                drilldown.fireEvent('syncsize');
              }
            }
          }
        }
      }
    });
  },

  /**
   * Update content to selected feature view.
   *
   * @private
   * @param {NX.model.Feature} feature selected feature
   */
  onFeatureSelected: function (feature) {
    var me = this,
        content = me.getFeatureContent(),
        view = feature.get('view'),
        text = feature.get('text'),
        iconName = feature.get('iconName'),
        description = feature.get('description'),
        cmp;

    // create new view and replace any current view
    if (Ext.isString(view)) {
      cmp = me.getView(view).create({});
    }
    else {
      cmp = Ext.widget(view);
    }
    me.mon(cmp, 'destroy', function () {
      //<if debug>
//      me.logTrace('Destroyed:', cmp.self.getName());
      //</if>
    });

    // remove the current contents
    content.removeAll();

    // update title and icon
    content.setTitle(text);
    content.setIconCls(NX.Icons.cls(iconName, 'x32'));

    // Reset unsaved changes flag
    content.resetUnsavedChangesFlag();

    // set browser title
    NX.global.document.title = text + ' - ' + NX.State.getValue('uiSettings').title;

    // update description
    if (description === undefined) {
      description = '';
    }
    content.setDescription(description);

    // Update the breadcrumb
    content.showRoot();

    // install new feature view
    content.add(cmp);

    // fire activate event to view component
    cmp.fireEvent('activate', cmp);

    //<if debug>
//    me.logInfo('Content changed to:', text, 'class:', cmp.self.getName());
    //</if>
  }

});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext*/

/**
 * Abstract settings panel.
 *
 * @since 3.0
 */
Ext.define('NX.view.SettingsPanel', {
  extend: 'Ext.panel.Panel',
  alias: 'widget.nx-settingsPanel',
  autoScroll: true,

  cls: 'nx-hr',

  layout: {
    type: 'vbox',
    align: 'stretch'
  },

  // TODO maxWidth: 1024,

  /**
   * @override
   */
  initComponent: function() {
    var me = this;

    me.items = {
      xtype: 'panel',
      ui: 'nx-inset',

      items: me.settingsForm || []
    };

    me.callParent();
  },

  /**
   * @override
   * @param form The form to add to this settings panel
   */
  addSettingsForm: function(form) {
    this.down('panel').add(form);
  },

  /**
   * Remove all settings forms from this settings panel.
   *
   * @override
   */
  removeAllSettingsForms: function() {
    this.down('panel').removeAll();
  },

  /**
   * Loads an {@link Ext.data.Model} into this form
   * (internally just calls {@link NX.view.SettingsForm#loadRecord}).
   *
   * @public
   * @param model The model to load
   */
  loadRecord: function(model) {
    var settingsForm = this.down('nx-settingsform');
    if (settingsForm) {
      settingsForm.loadRecord(model);
    }
  }

});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext*/

/**
 * Extension of Ext.ux.form.ItemSelector to allow better control over button configurations.
 *
 * @since 3.0
 */
Ext.define('NX.ext.form.field.ItemSelector', {
  extend: 'Ext.ux.form.ItemSelector',
  alias: 'widget.nx-itemselector',
  requires: [
    'Ext.ux.form.MultiSelect',
    'NX.I18n'
  ],

  // FIXME: This is not the best way to ensure that forms are limited width
  width: 600,
  height: 253,

  disabledCls: 'nx-itemselector-disabled',
  invalidCls: 'nx-invalid',

  /**
   * Override super *private* impl so we can control the button configuration.
   *
   * @override
   * @private
   */
  createButtons: function () {
    var me = this,
        buttons = me.callSuper();

    if (!me.hideNavIcons) {
      var i = 0;
      Ext.Array.forEach(me.buttons, function (name) {
        me.customizeButton(name, buttons[i++]);
      });
    }

    return buttons;
  },

  /**
   * Replace iconCls with glyph.
   *
   * @private
   *
   * @param name
   * @param button
   */
  customizeButton: function (name, button) {
    // remove icon
    delete button.iconCls;

    // replace with glyph
    switch (name) {
      case 'top':
        button.glyph = 'xf102@FontAwesome'; // fa-angle-double-up
        break;
      case 'up':
        button.glyph = 'xf106@FontAwesome'; // fa-angle-up
        break;
      case 'add':
        button.glyph = 'xf105@FontAwesome'; // fa-angle-right
        break;
      case 'remove':
        button.glyph = 'xf104@FontAwesome'; // fa-angle-left
        break;
      case 'down':
        button.glyph = 'xf107@FontAwesome'; // fa-angle-down
        break;
      case 'bottom':
        button.glyph = 'xf103@FontAwesome'; // fa-angle-double-down
        break;
    }
  },

  createList: function (title) {
    var me = this,
        tbar;

    // only create filter box for from field
    if (!me.fromField) {
      tbar = {
        xtype: 'nx-searchbox',
        emptyText: NX.I18n.get('Form_Field_ItemSelector_Empty'),
        searchDelay: 200,
        listeners: {
          search: me.onSearch,
          searchcleared: me.onSearchCleared,
          scope: me
        }
      };
    }

    return Ext.create('Ext.ux.form.MultiSelect', {
      // We don't want the multiselects themselves to act like fields,
      // so override these methods to prevent them from including
      // any of their values
      submitValue: false,
      isDirty: Ext.emptyFn,
      getSubmitData: function () {
        return null;
      },
      getModelData: function () {
        return null;
      },
      cls: 'nx-multiselect',
      flex: 1,
      dragGroup: me.ddGroup,
      dropGroup: me.ddGroup,
      title: title,
      store: {
        model: me.store.model,
        data: []
      },
      displayField: me.displayField,
      valueField: me.valueField,
      disabled: me.disabled,
      listeners: {
        boundList: {
          scope: me,
          itemdblclick: me.onItemDblClick,
          drop: me.syncValue
        }
      },
      tbar: tbar
    });
  },

  /**
   * Ext.ux.form.ItemSelector defers setting value if store is not loaded,
   * which messes up the logic in Ext.form.Basic.setValues()
   * when Ext.form.Basic.trackResetOnLoad is true.
   *
   * @override
   */
  setValue: function(value) {
    this.callParent(arguments);

    // HACK: force original value to reset, to prevent always dirty forms when store has not loaded when form initially sets values.
    this.resetOriginalValue();
  },

  // HACK: avoid exceptions when the store is reloaded
  populateFromStore: function (store) {
    var me = this,
        fromStore = me.fromField.store;

    if (fromStore) {
      fromStore.removeAll();
    }
    me.callParent(arguments);
  },

  /**
   * @private
   */
  onSearch: function (searchbox, value) {
    var me = this;

    me.fromField.store.filter({ id: 'filter', filterFn: function (model) {
      var stringValue = model.get(me.displayField);
      if (stringValue) {
        stringValue = stringValue.toString();
        return stringValue.toLowerCase().indexOf(value.toLowerCase()) !== -1;
      }
      return false;
    }});
  },

  /**
   * @private
   */
  onSearchCleared: function () {
    this.fromField.store.clearFilter();
  },

  // HACK: Looks like original item selector forgot to unbind from store which results in NPEs in #populateFromStore
  onDestroy: function () {
    var me = this;

    if (me.store) {
      me.store.un('load', me.populateFromStore, me);
    }
    this.callParent();
  }

});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext, NX*/

/**
 * Wizard panel.
 *
 * @since 3.0
 * @abstract
 */
Ext.define('NX.wizard.Panel', {
  extend: 'Ext.panel.Panel',
  alias: 'widget.nx-wizard-panel',
  requires: [
    'NX.I18n'
  ],

  cls: 'nx-wizard-panel',

  autoScroll: true,
  layout: {
    type: 'vbox',
    align: 'stretch'
  },

  items: {
    xtype: 'container',
    itemId: 'container',
    cls: 'screencontainer',
    frame: true,
    layout: 'card'
  },

  // screen header (title + progress)
  dockedItems: {
    xtype: 'toolbar',
    itemId: 'header',
    cls: 'screenheader',
    dock: 'top',
    items: [
      {
        xtype: 'label',
        itemId: 'title',
        cls: 'title'
      },
      '->',
      {
        xtype: 'label',
        itemId: 'progress',
        cls: 'progress'
      }
    ]
  },

  /**
   * @returns {Ext.container.Container}
   */
  getScreenHeader: function () {
    return this.down('#header');
  },

  /**
   * @param {String} title
   */
  setTitle: function (title) {
    this.getScreenHeader().down('#title').setText(title);
  },

  /**
   * @param {number} current  Current screen number.
   * @param {number} total    Total number of screens.
   */
  setProgress: function (current, total) {
    this.getScreenHeader().down('#progress').setText(NX.I18n.format('Wizard_Screen_Progress', current, total)
    );
  },

  /**
   * @returns {Ext.panel.Panel}
   */
  getScreenContainer: function () {
    return this.down('#container');
  }
});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext, NX*/

/**
 * Controls forms marked with settingsForm = true by adding save/discard/refresh functionality using form configured
 * api.
 *
 * @since 3.0
 */
Ext.define('NX.controller.SettingsForm', {
  extend: 'NX.app.Controller',
  requires: [
    'Ext.ComponentQuery',
    'NX.Messages'
  ],

  /**
   * @override
   */
  init: function () {
    var me = this;

    me.listen({
      controller: {
        '#Refresh': {
          refresh: me.onRefresh
        }
      },
      component: {
        'form[settingsForm=true]': {
          afterrender: me.loadForm,
          load: me.loadForm,
          dirtychange: me.updateButtonState,
          validitychange: me.updateButtonState
        },
        'form[settingsForm=true][editableCondition]': {
          afterrender: me.bindEditableCondition
        },
        'form[settingsForm=true][settingsFormSubmit=true] button[action=add]': {
          click: me.submitForm
        },
        'form[settingsForm=true][settingsFormSubmit=true] button[action=submit]': {
          click: me.submitForm
        },
        'form[settingsForm=true][settingsFormSubmit=true] button[action=save]': {
          click: me.submitForm
        },
        'form[settingsForm=true][settingsFormSubmit=true] button[action=discard]': {
          click: me.discardChanges
        },
        'form[settingsForm=true] field[bindGroup]': {
          validitychange: me.updateEnableState
        }
      }
    });
  },

  /**
   * @private
   */
  onRefresh: function () {
    var me = this,
        forms = Ext.ComponentQuery.query('form[settingsForm=true]');

    if (forms) {
      Ext.each(forms, function (form) {
        me.loadForm(form);
      });
    }
  },

  /**
   * Loads the form if form's api load function is defined.
   *
   * @private
   */
  loadForm: function (form, options) {
    if (!form.isDestroyed && form.rendered) {
      if (form.api && form.api.load) {
        // Load the form
        form.load(Ext.applyIf(options || {}, {
          waitMsg: form.settingsFormLoadMessage,
          success: function (basicForm, action) {
            // Form is valid
            form.isValid();

            form.fireEvent('loaded', form, action);
          },
          failure: function (basicForm, action) {
            form.isValid();
          }
        }));
      }
      else {
        form.isValid();
      }
    }
  },

  /**
   * Submits the form containing the button, if form's api submit function is defined.
   *
   * @private
   */
  submitForm: function (button) {
    var me = this,
        form = button.up('form');

    if (form.api && form.api.submit) {
      form.submit({
        waitMsg: form.settingsFormSubmitMessage,
        success: function (basicForm, action) {
          var title = me.getSettingsFormSuccessMessage(form, action);
          if (title) {
            NX.Messages.add({ text: title, type: 'success' });
          }
          form.fireEvent('submitted', form, action);
          me.loadForm(form);
        }
      });
    }
  },

  /**
   * Discard any changes to this form
   *
   * @private
   */
  discardChanges: function (button) {
    var form = button.up('form');

    if (form.api && form.api.load) {
      form.fireEvent('load', form);
    }
    else {
      form.getForm().reset();
      form.isValid();
    }
  },

  /**
   * Calculates title based on form's {NX.view.SettingsForm#getSettingsFormSuccessMessage}.
   *
   * @private
   * @param {NX.view.SettingsForm} form
   * @param {Ext.form.action.Action} action
   */
  getSettingsFormSuccessMessage: function (form, action) {
    var title;

    if (form.settingsFormSuccessMessage) {
      if (Ext.isFunction(form.settingsFormSuccessMessage)) {
        title = form.settingsFormSuccessMessage(action.result.data);
      }
      else {
        title = form.settingsFormSuccessMessage.toString();
      }
      title = title.replace(/\$action/, action.type.indexOf('submit') > -1 ? 'updated' : 'refreshed');
    }
    return title;
  },

  /**
   * Toggle editable on settings form hen editable condition is satisfied (if specified).
   *
   * @private
   * @param {NX.view.SettingsForm} form
   */
  bindEditableCondition: function (form) {
    if (Ext.isDefined(form.editableCondition)) {
      form.mon(
          form.editableCondition,
          {
            satisfied: function () {
              form.setEditable(true);
            },
            unsatisfied: function () {
              form.setEditable(false);
            },
            scope: form
          }
      );
    }
  },

  /**
   * Enable/Disable components marked with a "groupBind" property by checking that all fields marked with "bindGroup"
   * that matches, are valid.
   *
   * @private
   * @param {Ext.form.field.Base} field a field with a "bindGroup" property. "bindGroup" can be a space separated list of
   * groups
   */
  updateEnableState: function(field) {
    var form = field.up('form');

    if (Ext.isString(field['bindGroup'])) {
      Ext.Array.each(field['bindGroup'].split(' '), function(group) {
        var bindables = form.query('component[groupBind=' + group + ']'),
            validatables = form.query('field[bindGroup~=' + group + ']'),
            enabled;

        Ext.Array.each(bindables, function(bindable) {
          if (!Ext.isDefined(enabled)) {
            enabled = true;
            Ext.Array.each(validatables, function(validatable) {
              return enabled = validatable.isValid();
            });
          }
          if (enabled) {
            bindable.enable();
          }
          else {
            bindable.disable();
          }
        });
      });
    }
  },

  /**
   * Update the state of the add|save|submit and discard buttons based on form being dirty/valid.
   *
   * @private
   */
  updateButtonState: function(form) {
    var dirty = form.isDirty(),
        valid = form.isValid(),
        saveButton = form.owner.down('button[action=save]'),
        discardButton = form.owner.down('button[action=discard]');

    if (saveButton) {
      saveButton.setDisabled(!valid || !dirty);
    }

    if (discardButton) {
      discardButton.setDisabled(!dirty);
    }
  }

});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext*/

/**
 * Info entry.
 *
 * @since 3.0
 */
Ext.define('NX.view.info.Entry', {
  extend: 'Ext.Component',
  alias: 'widget.nx-info',
  requires: [
    'Ext.XTemplate'
  ],

  /**
   * @override
   */
  initComponent: function () {
    var me = this;

    me.tpl = Ext.create('Ext.XTemplate', [
      '<div class="nx-info">',
      '<table>',
      '<tpl for=".">',
      '<tr class="nx-info-entry">',
      '<td class="nx-info-entry-name">{name}</td>',
      '<td class="nx-info-entry-value">{value}</td>',
      '</tr>',
      '</tpl>',
      '</tr>',
      '</table>',
      '</div>'
    ]);

    me.callParent();
  },

  /**
   * @public
   * @param {Object} info
   */
  showInfo: function (info) {
    var entries = [];
    Ext.Object.each(info, function (key, value) {
      if (!Ext.isEmpty(value)) {
        entries.push(
            {
              name: key,
              value: value
            }
        );
      }
    });
    if (this.getEl()) {
      this.tpl.overwrite(this.getEl(), entries);

      // FIXME: what 'panel' is this intended to re-layout?
      this.up('panel').doComponentLayout();
    }
    else {
      this.html = this.tpl.apply(entries);
    }
  }

});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext*/

/**
 * Info panel.
 *
 * @since 3.0
 */
Ext.define('NX.view.info.Panel', {
  extend: 'Ext.panel.Panel',
  alias: 'widget.nx-info-panel',

  // FIXME: What is this for?
  titled: null,

  framed: true,
  autoScroll: true,
  header: false,

  // FIXME: Reduce use of nested panels

  /**
   * @private
   */
  initComponent: function() {
    var me = this,
      inset,
      subsection;

    subsection = {
      xtype: 'panel',
      ui: 'nx-subsection',
      title: me.titled,
      frame: me.framed,
      items: { xtype: 'nx-info' }
    };

    inset = {
      xtype: 'panel',
      ui: 'nx-inset',

      items: subsection
    };

    if (me.framed) {
      me.items = inset;
    }
    else {
      me.items = subsection;
    }

    me.callParent();
  },

  /**
   * @public
   */
  setTitle: function(title) {
    var me = this;
    me.titled = title;
    me.down('panel').down('panel').setTitle(title);
  },

  /**
   * @public
   */
  showInfo: function (info) {
    this.down('nx-info').showInfo(info);
  },

  /**
   * @public
   * Add an additional component to enhance the info.
   */
  addSection: function(component) {
    this.down('nx-info').up('panel').add(component);
  }
});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext, NX*/

/**
 * Unsupported browser uber mode controller.
 *
 * @since 3.0
 */
Ext.define('NX.controller.UnsupportedBrowser', {
  extend: 'NX.app.Controller',
  requires: [
    'NX.State'
  ],

  views: [
    'UnsupportedBrowser',
    'header.Panel',
    'header.Branding',
    'header.Logo',
    'footer.Panel',
    'footer.Branding'
  ],

  refs: [
    {
      ref: 'viewport',
      selector: 'viewport'
    },
    {
      ref: 'unsupportedBrowser',
      selector: 'nx-unsupported-browser'
    }
  ],

  /**
   * @override
   */
  init: function () {
    var me = this;

    me.listen({
      component: {
        'viewport': {
          afterrender: me.onLaunch
        },
        'nx-unsupported-browser button[action=continue]': {
          click: me.onContinue
        }
      }
    });
  },

  /**
   * Show {@link NX.view.UnsupportedBrowser} view from {@link Ext.container.Viewport}.
   *
   * @override
   */
  onLaunch: function () {
    var me = this,
        viewport = me.getViewport();

    if (viewport) {
      //<if debug>
//      me.logDebug('Showing unsupported browser view');
      //</if>

      viewport.add({ xtype: 'nx-unsupported-browser' });
    }
  },

  /**
   * Removes {@link NX.view.UnsupportedBrowser} view from {@link Ext.container.Viewport}.
   *
   * @override
   */
  onDestroy: function () {
    var me = this,
        viewport = me.getViewport();

    if (viewport) {
      //<if debug>
//      me.logDebug('Removing unsupported browser view');
      //</if>

      viewport.remove(me.getUnsupportedBrowser());
    }
  },

  onContinue: function () {
    NX.State.setBrowserSupported(true);
  }

});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext, NX*/

/**
 * Shows an icon display of features in the {@link NX.store.FeatureGroup} store.
 *
 * @since 3.0
 */
Ext.define('NX.view.feature.Group', {
  extend: 'Ext.container.Container',
  alias: 'widget.nx-feature-group',
  requires: [
    'NX.Icons'
  ],

  cls: [
    'nx-feature-group',
    'nx-inset'
  ],

  autoScroll: true,

  items: {
    xtype: 'container',
    frame: true,
    cls: 'nx-subsection',

    items: {
      xtype: 'dataview',

      store: 'FeatureGroup',
      tpl: [
        '<tpl for=".">',
        '<div class="item-wrap">',
        '{[ NX.Icons.img(values.iconName, "x32") ]}',
        '<span>{text}</span>',
        '</div>',
        '</tpl>'
      ],

      itemSelector: 'div.item-wrap',
      trackOver: true,
      overItemCls: 'x-item-over',
      selectedItemCls: 'x-item-selected'
    }
  }

});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext, NX*/

/**
 * Menu group controller.
 *
 * @since 3.0
 */
Ext.define('NX.controller.MenuGroup', {
  extend: 'NX.app.Controller',
  requires: [
    'NX.Bookmarks'
  ],

  views: [
    'feature.Group'
  ],

  /**
   * @override
   */
  init: function () {
    var me = this;

    me.listen({
      component: {
        'nx-feature-group dataview': {
          selectionchange: me.onSelection
        }
      }
    });
  },

  /**
   * Invoked when {@link NX.view.feature.Group} item is selected.
   *
   * @private
   * @param {NX.view.feature.Group} view
   * @param {NX.model.Feature[]} records
   */
  onSelection: function (view, records) {
    var feature;

    if (records.length > 0) {
      feature = records[0];
      NX.Bookmarks.navigateTo(NX.Bookmarks.fromToken(feature.get('bookmark')), this);
    }
  }

});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext, NX*/

/**
 * Wizard controller support.
 *
 * @since 3.0
 * @abstract
 */
Ext.define('NX.wizard.Controller', {
  extend: 'NX.app.Controller',
  requires: [
    'NX.Assert'
  ],

  /**
   * Registered steps.
   *
   * @private
   * @type {NX.wizard.Step[]}
   */
  steps: undefined,

  /**
   * Active step index.
   *
   * @private
   * @type {Number}
   */
  activeStepIndex: undefined,

  /**
   * Shared context.
   *
   * @private
   * @type {Ext.util.MixedCollection}
   */
  context: undefined,

  /**
   * @override
   */
  init: function () {
    var me = this;

    // initialize privates
    me.steps = [];
    me.activeStepIndex = 0;
    me.context = Ext.create('Ext.util.MixedCollection');

    // listen for events for logging consistency
    //<if debug>
//    me.context.on({
//      add: function(index, value, key) {
//        me.logDebug('Set', key, '=', value);
//      },
//      remove: function(value, key) {
//        me.logDebug('Unset', key);
//      }
//    });
    //</if>

    me.addRef([
      {
        ref: 'content',
        selector: 'nx-feature-content'
      },
      {
        ref: 'panel',
        selector: 'nx-wizard-panel'
      }
    ]);

    me.listen({
      controller: {
        '#Refresh': {
          // FIXME: handle-global refresh, this is not ideal as this calls all wizards even if not activated
          refresh: me.refresh
        }
      }
    });

    me.callParent();
  },

  /**
   * Reset when controller is destroyed.
   *
   * @override
   */
  onDestroy: function() {
    this.reset();
  },

  /**
   * Register a step.
   *
   * @protected
   * @param {String|Object} config
   */
  registerStep: function(config) {
    var step;

    //<if debug>
//    this.logDebug('Register step:', config);
    //</if>

    if (Ext.isString(config)) {
      step = Ext.create(config);
    }
    else {
      step = Ext.widget(config);
    }

    step.attach(this);
    this.steps.push(step);
  },

  /**
   * Register steps.
   *
   * @param {String[]|Object[]} configs
   */
  registerSteps: function(configs) {
    var me = this;
    Ext.Array.each(configs, function(config) {
      me.registerStep(config);
    });
  },

  /**
   * Get a step by name.
   *
   * @param {String} name
   * @return {NX.wizard.Step} Step with name or null if not found.
   */
  getStep: function(name) {
    var s = this.steps,
        i;

    for (i = 0; i < s.length; i++) {
      if (name === s[i].getName()) {
        return s[i];
      }
    }

    this.logWarn('Missing step:', name);

    return null;
  },

  /**
   * Return the index of given step.
   *
   * @param {NX.wizard.Step} step
   * @return {number}
   */
  getStepIndex: function(step) {
    var s = this.steps,
        i;

    for (i = 0; i < s.length; i++) {
      if (step.getName() === s[i].getName()) {
        return i;
      }
    }

    return -1;
  },

  /**
   * Returns the active step.
   *
   * @return {NX.wizard.Step}
   */
  getActiveStep: function() {
    return this.steps[this.activeStepIndex];
  },

  /**
   * Load wizard.
   *
   * @protected
   */
  load: function() {
    var s = this.steps,
        i,
        panel;

    //<if debug>
//    this.logDebug('Loading');
    //</if>

    panel = this.getPanel().getScreenContainer();
    for (i = 0; i < s.length; i++) {
      panel.add(s[i].createScreenCmp());
    }

    this.restore();
  },

  /**
   * @private
   */
  refresh: function() {
    //<if debug>
//    this.logDebug('Refreshing');
    //</if>

    this.getActiveStep().refresh();
  },

  //
  // Context
  //

  /**
   * Returns shared context.
   *
   * @returns {Ext.util.MixedCollection}
   */
  getContext: function() {
    return this.context;
  },

  //
  // Navigation
  //

  // TODO: fire navigation events?

  /**
   * Move to specific step index.
   *
   * @param {number} index
   * @return {boolean} True if moved
   */
  moveTo: function(index) {
    if (index < 0 || index + 1 > this.steps.length) {
      this.logError('Index out of bounds:', index);
      return false;
    }

    //<if debug>
//    this.logDebug('Moving to:', index);
    //</if>

    var panel = this.getPanel(),
        container,
        cards,
        screen;

    // panel may not exist if controller being destroyed
    if (!panel) {
      return false;
    }

    container = panel.getScreenContainer();
    cards = container.getLayout();

    // move and resolve screen component
    screen = cards.setActiveItem(index);
    if (screen === false) {
      screen = cards.getActiveItem();
    }

    this.activeStepIndex = index;

    this.updateScreenHeader(screen, index);

    return true;
  },

  /**
   * Update the title and progress for the current screen.
   *
   * @private
   * @param {NX.wizard.Screen} screen
   * @param {number} index
   */
  updateScreenHeader: function(screen, index) {
    var panel = this.getPanel(),
        s = this.steps,
        enabledSteps = 0,
        screenNumber = 1,
        i;

    // calculate number of enabled steps and displayed screen number
    for (i = 0; i < s.length; i++) {
      if (s[i].enabled) {
        enabledSteps++;
        if (i < index) {
          screenNumber++;
        }
      }
    }

    panel.setTitle(screen.getTitle());
    panel.setProgress(screenNumber, enabledSteps);
  },

  /**
   * Move to step with given name.
   *
   * @param {String} name
   * @return {boolean} True if moved
   */
  moveToStepNamed: function(name) {
    var me = this,
        step;

    //<if debug>
//    me.logDebug('Moving to step with name:', name);
    //</if>

    step = me.getStep(name);

    if (!step) {
      this.logError('Missing step with name:', name);
      return false;
    }

    return me.moveTo(me.getStepIndex(step));
  },

  /**
   * Move to the next enabled step.
   *
   * @return {boolean}  True if moved
   */
  moveNext: function() {
    var current = this.activeStepIndex,
        max = this.steps.length,
        i;

    if (current + 1 >= max) {
      this.logError('No next step');
      return false;
    }

    for (i = current + 1; i < max; i++) {
      if (this.steps[i].enabled) {
        return this.moveTo(i);
      }
    }

    this.logError('No enabled next step');
    return false;
  },

  /**
   * Move to the previous step.
   *
   * @return {boolean}  True if moved
   */
  moveBack: function() {
    var current = this.activeStepIndex,
        i;
        
    if (current <= 0) {
      this.logError('No back step');
      return false;
    }

    for (i = current - 1; i >= 0; i--) {
      if (this.steps[i].enabled) {
        return this.moveTo(i);
      }
    }

    this.logError('No enabled back step');
    return false;
  },

  /**
   * Reset state to initial.
   */
  reset: function() {
    var s = this.steps,
        i;

    //<if debug>
//    this.logDebug('Resetting');
    //</if>

    // Reset all steps
    for (i = 0; i < s.length; i++) {
      s[i].reset();
    }

    // Reset context
    this.context.removeAll();

    // Move to starting position
    this.moveTo(0);

    //<if debug>
//    this.logDebug('Reset');
    //</if>
  },

  /**
   * Cancel and reset.
   */
  cancel: function() {
    //<if debug>
//    this.logDebug('Canceled');
    //</if>

    this.reset();
  },

  /**
   * Finish and reset.
   */
  finish: function() {
    //<if debug>
//    this.logDebug('Finished');
    //</if>

    this.reset();
  },

  /**
   * Restore state to last known.
   */
  restore: function() {
    this.moveTo(this.activeStepIndex);

    //<if debug>
//    this.logDebug('Restored');
    //</if>
  },

  //
  // Helpers
  //

  /**
   * Display screen mask.
   *
   * @param {string} message
   */
  mask: function(message) {
    this.getContent().getEl().mask(message);
  },

  /**
   * Remove screen mask.
   */
  unmask: function() {
    this.getContent().getEl().unmask();
  }
});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext*/

/**
 * Logging dev-panel controller.
 *
 * @since 3.0
 */
Ext.define('NX.controller.dev.Logging', {
  extend: 'NX.app.Controller',
  requires: [
    'Ext.util.Format',
    'NX.Windows'
  ],

  stores: [
    'LogEvent',
    'LogLevel'
  ],

  refs: [
    {
      ref: 'panel',
      selector: 'nx-dev-logging'
    }
  ],

  /**
   * @override
   */
  init: function () {
    var me = this;

    // helper to lookup sink by name via Logging controller
    function sink(name) {
      return me.getController('Logging').getSink(name);
    }

    me.listen({
      component: {
        'nx-dev-logging button[action=clear]': {
          click: function (button) {
            me.getStore('LogEvent').removeAll();
          }
        },

        'nx-dev-logging combobox[itemId=threshold]': {
          afterrender: function (combo) {
            combo.select(me.getController('Logging').getThreshold());
          },
          select: function (combo) {
            me.getController('Logging').setThreshold(combo.getValue());
          }
        },

        'nx-dev-logging checkbox[itemId=buffer]': {
          afterrender: function (checkbox) {
            checkbox.setValue(sink('store').enabled);
          },
          change: function (checkbox) {
            sink('store').setEnabled(checkbox.getValue());
          }
        },

        'nx-dev-logging numberfield[itemId=bufferSize]': {
          afterrender: function (field) {
            field.setValue(sink('store').maxSize);
          },

          // update the max-size when enter or loss of focus
          blur: function(field, event) {
            sink('store').setMaxSize(field.getValue());
          },
          keypress: function (field, event) {
            if (event.getKey() === event.ENTER) {
              sink('store').setMaxSize(field.getValue());
            }
          }
        },

        'nx-dev-logging checkbox[itemId=console]': {
          afterrender: function (checkbox) {
            checkbox.setValue(sink('console').enabled);
          },
          change: function (checkbox) {
            sink('console').setEnabled(checkbox.getValue());
          }
        },

        'nx-dev-logging checkbox[itemId=remote]': {
          afterrender: function (checkbox) {
            checkbox.setValue(sink('remote').enabled);
          },
          change: function (checkbox) {
            sink('remote').setEnabled(checkbox.getValue());
          }
        },

        'nx-dev-logging button[action=export]': {
          click: me.exportSelection
        }
      }
    });
  },

  /**
   * Export selected rows to window.
   *
   * @private
   */
  exportSelection: function() {
    var win,
        doc,
        selected;

    win = NX.Windows.open('', '', 'width=640,height=480');
    if (win !== null) {
      doc = win.document;
      selected = Ext.Array.pluck(this.getPanel().getSelectionModel().getSelection(), 'data');

      doc.write('<html><head>');
      doc.write('<title>' + Ext.util.Format.plural(selected.length, 'Logging Event') + '</title>');
      doc.write('</head><body>');
      doc.write('<pre>');

      Ext.Array.each(selected, function(data) {
        doc.write(data.timestamp + ' ' + data.level + ' ' + data.logger + ' ' + data.message.join(' ') + '<br/>');
      });

      doc.write('<pre>');
      doc.write('</body></html>');
    }
  }
});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext*/

/**
 * Abstract add window.
 *
 * @since 3.0
 */
Ext.define('NX.view.AddPanel', {
  extend: 'Ext.panel.Panel',
  alias: 'widget.nx-addpanel',
  requires: [
    'NX.I18n'
  ],

  cls: 'nx-hr',

  layout: {
    type: 'vbox',
    align: 'stretch'
  },

  autoScroll: true,

  /**
   * @override
   */
  initComponent: function () {
    var me = this;

    // Create default buttons if they do not exist
    if (Ext.isDefined(me.settingsForm) && !Ext.isArray(me.settingsForm)) {
      if (!me.settingsForm.buttons) {
        me.settingsForm.buttons = [
          { text: NX.I18n.get('Add_Submit_Button'), action: 'add', formBind: true, ui: 'nx-primary', bindToEnter:  me.items.settingsFormSubmitOnEnter },
          { text: NX.I18n.get('Add_Cancel_Button'), handler: function () {
            this.up('nx-drilldown').showChild(0, true);
          }}
        ];
      }
    }

    // Add settings form to the panel
    me.items = {
      xtype: 'panel',
      ui: 'nx-inset',

      items: me.settingsForm
    };

    me.callParent();
  }

});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext*/

/**
 * Abstract add window.
 *
 * @since 3.0
 */
Ext.define('NX.view.AddWindow', {
  extend: 'Ext.window.Window',
  alias: 'widget.nx-addwindow',
  requires: [
    'NX.I18n'
  ],

  layout: 'fit',
  autoShow: true,
  modal: true,
  constrain: true,
  width: 630,
  minWidth: 630,

  /**
   * @override
   */
  initComponent: function () {
    var me = this;

    if (Ext.isDefined(me.items) && !Ext.isArray(me.items)) {
      if (!me.items.buttons) {
        me.items.buttons = [
          { text: NX.I18n.get('Add_Submit_Button'), action: 'add', formBind: true, ui: 'nx-primary', bindToEnter: me.items.settingsFormSubmitOnEnter },
          { text: NX.I18n.get('Add_Cancel_Button'), handler: function () {
            this.up('window').close();
          }}
        ];
      }
    }

    me.maxHeight = Ext.getBody().getViewSize().height - 100;

    me.callParent();
  }

});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext, NX*/

/**
 * Master/Detail tabs.
 *
 * @since 3.0
 */
Ext.define('NX.view.drilldown.Master', {
  extend: 'Ext.grid.Panel',
  alias: 'widget.nx-drilldown-master',

  maskElement: 'body',

  /**
   * @private
   */
  initComponent: function() {
    var me = this;

    me.callParent();

    me.on('render', this.loadStore, this);

    // Refresh drilldown affordances on load, and when a column is added
    me.on('viewready', function(view) {
      view.refreshDrilldown(view.headerCt);
    });
    me.headerCt.on('columnschanged', me.refreshDrilldown);
  },

  loadStore: function() {
    this.getStore().load();
  },

  /**
   * @private
   * Put a drilldown affordance ‘>’ at the end of each item in the list
   *
   * @param ct The content header for the grid
   */
  refreshDrilldown: function(ct) {
    var firstIdx,
        columns = ct.items.items.filter(function(e, idx) {
          if (e.cls && e.cls === 'nx-drilldown-affordance') {
            if (!firstIdx) {
              firstIdx = idx;
            }
            return true;
          }
          return false;
        });

    // skip adding affordance if the column already exists and is teh last one
    if (columns.length === 1 && firstIdx + 1 === ct.items.items.length) {
      return;
    }

    this.suspendEvents(false);

    // Remove drilldown affordance columns
    columns.forEach(function(e) {
      ct.remove(e);
    });

    // Add a drilldown affordance to the end of the list
    ct.add(
        {
          width: 28,
          hideable: false,
          sortable: false,
          menuDisabled: true,
          resizable: false,
          draggable: false,
          stateId: 'affordance',
          cls: 'nx-drilldown-affordance',

          defaultRenderer: function () {
            return Ext.DomHelper.markup({
              tag: 'span',
              cls: 'x-fa fa-angle-right'
            });
          }
        }
    );

    this.resumeEvents();
  }
});

/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
/*global Ext*/

/**
 * Dashboard controller.
 *
 * @since 3.0
 */
Ext.define('NX.controller.Dashboard', {
  extend: 'NX.app.Controller',
  requires: [
    'NX.I18n'
  ],

  views: [
    'dashboard.Welcome'
  ],

  /**
   * @override
   */
  init: function () {
    this.getApplication().getFeaturesController().registerFeature({
      path: '/Welcome',
      mode: 'browse',
      view: 'NX.view.dashboard.Welcome',
      text: NX.I18n.get('Dashboard_Title'),
      description: NX.I18n.get('Dashboard_Description'),
      iconConfig: {
        file: 'house.png',
        variants: ['x16', 'x32']
      },
      weight: 10,
      authenticationRequired: false
    });
  }

});

