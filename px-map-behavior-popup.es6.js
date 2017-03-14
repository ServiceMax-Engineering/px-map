(function() {
  'use strict';

  /****************************************************************************
   * BEHAVIORS
   ****************************************************************************/

  /* Ensures the behavior namespace is created */
  const namespace = (window.PxMapBehavior = window.PxMapBehavior || {});

  /**
   *
   * @polymerBehavior PxMapBehavior.Popup
   */
  const PopupImpl = {
    properties: {
      /**
       * Will be `true` when the popup becomes visible, and `false` when the
       * popup is not visible.
       */
      active: {
        type: Boolean,
        value: false,
        readOnly: true
      },

      /**
       * The name of a control or another element on the map that will handle
       * this popup's content. If this attribute is provided, the popup will
       * not open as box with a pointer over its parent when the parent is
       * clicked. The popup will fire an event that should be captured above
       * with its content to place into a control.
       */
      bindToControl: {
        type: String
      }
    },

    addInst(parent) {
      if (parent && parent.getPopup() !== this.elementInst) {
        parent.bindPopup(this.elementInst);
      }
    },

    removeInst(parent) {
      if (parent && parent.getPopup() === this.elementInst) {
        parent.unbindPopup(this.elementInst);
      }
    }
  };
  /* Bind Popup behavior */
  namespace.Popup = [
    namespace.Layer,
    PopupImpl
  ];

  /**
   *
   * @polymerBehavior PxMapBehavior.InfoPopup
   */
  const InfoPopupImpl = {
    properties: {
      /**
       * Title text to display in bold at the top of the popup. Should be kept
       * relatively short (25 characters or less) to keep the popup from
       * growing too large.
       *
       * @type {String}
       */
      title: {
        type: String,
        observer: 'shouldUpdateInst'
      },

      /**
       * Description text to place in the body of the popup. Try to keep the
       * description to a reasonable size to keep the popup from growing
       * too large.
       *
       * To display more information, bind to the popup's
       * `active` property for notifications on when this popup is shown
       * and display additional information in the UI of your app.
       *
       * @type {String}
       */
      description: {
        type: String,
        observer: 'shouldUpdateInst'
      },

      /**
       * The URL for an image to place inside the popup. Use a small, square
       * thumbnail-style image (e.g. 75px by 75px).
       *
       * @type {String}
       */
      imgSrc: {
        type: String,
        observer: 'shouldUpdateInst'
      }
    },

    createInst(options) {
      return new PxMap.InfoPopup(options);
    },

    updateInst(lastOptions, nextOptions) {
      let updates = {};

      if (lastOptions.title !== nextOptions.title) {
        updates.title = nextOptions.title;
      }
      if (lastOptions.description !== nextOptions.description) {
        updates.description = nextOptions.description;
      }
      if (lastOptions.imgSrc !== nextOptions.imgSrc) {
        updates.imgSrc = nextOptions.imgSrc;
      }

      if (Object.keys(updates).length) {
        this.elementInst.updateSettings(updates);
      }
    },

    getInstOptions() {
      return {
        title: this.title,
        description: this.description,
        imgSrc: this.imgSrc
      };
    }
  };
  /* Bind InfoPopup behavior */
  namespace.InfoPopup = [
    namespace.Popup,
    InfoPopupImpl
  ];

  /**
   *
   * @polymerBehavior PxMapBehavior.DataPopup
   */
  const DataPopupImpl = {
    properties: {
      /**
       * Title text to display in bold at the top of the popup. Should be kept
       * relatively short (25 characters or less) to keep the popup from
       * growing too large.
       */
      title: {
        type: String,
        observer: 'shouldUpdateInst'
      },

      /**
       * A list of key/valye pairs to display in a data table. Must be in the
       * format of an object with human-readable keys and associated values.
       *
       * For example, to show the name and location of a place, set this
       * attribute to:
       * '{ "Name" : "Tokyo", "Location" : "Japan" }'
       *
       * @type {Object}
       */
      data: {
        type: Object,
        value: function() { return {}; },
        observer: 'shouldUpdateInst'
      }
    },

    createInst(options) {
      return new PxMap.DataPopup(options);
    },

    updateInst(lastOptions, nextOptions) {
      let updates = {};

      if (lastOptions.title !== nextOptions.title) {
        updates.title = nextOptions.title;
      }
      if (lastOptions.data !== nextOptions.data) {
        updates.data = nextOptions.data;
      }

      if (Object.keys(updates).length) {
        this.elementInst.updateSettings(updates);
      }
    },

    getInstOptions() {
      return {
        title: this.title,
        data: this.data
      };
    }
  };
  /* Bind DataPopup behavior */
  namespace.DataPopup = [
    namespace.Popup,
    DataPopupImpl
  ];

  /****************************************************************************
   * KLASSES
   ****************************************************************************/

  /* Ensures the klass namespace is created */
  const klass = (window.PxMap = window.PxMap || {});

  /**
   *
   * @class PxMap.InfoPopup
   */
  class InfoPopup extends L.Popup {
    constructor(settings={}, config={}) {
      super();
      this._createPopup(settings, config);
      return this;
    }

    // Note `createPopup` is an internet explorer native method, but deprecated
    // so hopefully it won't cause grief
    _createPopup(settings={}, config={}) {
      this.settings = settings;
      let {title, description, imgSrc} = settings;
      let content = this._generatePopupContent(title, description, imgSrc);

      let defaultConfig = {
        className: 'map-popup-info'
      };
      let composedConfig = {};
      Object.assign(composedConfig, defaultConfig, config);

      this.initialize(composedConfig);
      this.setContent(content);
    }

    _generatePopupContent(title, description, imgSrc) {
      let tmplFnIf = (fn, ...vals) =>
        vals.length && vals[0] !== undefined ? fn.call(this, ...vals) : '';

      let imgTmpl = (imgSrc) => `
        <div class="map-box-info__image">
          <img src="${imgSrc}" />
        </div>
      `;
      let titleTmpl = (title) => `
        <p class="map-box-info__title">${title}</p>
      `;
      let descriptionTmpl = (description) => `
        <p class="map-box-info__description">${description}</p>
      `;

      return `
        <section class="map-box-info">
          ${tmplFnIf(imgTmpl, imgSrc)}
          <div class="map-box-info__content">
            ${tmplFnIf(titleTmpl, title)}
            ${tmplFnIf(descriptionTmpl, description)}
          </div>
        </section>
      `;
    }

    updateSettings(settings={}) {
      Object.assign(this.settings, settings);
      let {title, description, imgSrc} = this.settings;
      let content = this._generatePopupContent(title, description, imgSrc);
      this.setContent(content);
      this.update();
    }
  };
  /* Bind InfoPopup klass */
  klass.InfoPopup = InfoPopup;

  /**
   *
   * @class PxMap.DataPopup
   */
  class DataPopup extends L.Popup {
    constructor(settings={}, config={}) {
      super();
      this._createPopup(settings, config);
      return this;
    }

    // Note `createPopup` is an internet explorer native method, but deprecated
    // so hopefully it won't cause grief
    _createPopup(settings={}, config={}) {
      this.settings = settings;
      let {title, data} = this.settings;
      let content = this._generatePopupContent(title, data);

      let defaultConfig = {
        className: 'map-popup-data',
        maxWidth: 400,
        minWidth: 300
      };
      let composedConfig = {};
      Object.assign(composedConfig, defaultConfig, config);

      this.initialize(composedConfig);
      this.setContent(content);
    }

    _generatePopupContent(title, data) {
      let tmplFnIf = (fn, ...vals) =>
        vals.length && vals[0] !== undefined ? fn.call(this, ...vals) : '';

      let titleTmpl = (title) => `
        <div class="map-data-box__header">
          <h3 class="map-data-box__header__text">${title}</h3>
        </div>
      `;
      let dataTmpl = (data) => {
        let dataList = Object.keys(data).reduce((accum, key) => {
          return accum.concat([dataItemTmpl(key, data[key])]);
        }, []).join('');

        return `
          <div class="map-data-box__table">
            ${dataList}
          </div>
        `;
      };
      let dataItemTmpl = (label, value) => `
        <div class="map-data-box__table__cell"><p>${label}</p></div>
        <div class="map-data-box__table__cell"><p>${value}</p></div>
      `;

      return `
        <section class="map-box-data">
          ${tmplFnIf(titleTmpl, title)}
          ${tmplFnIf(dataTmpl, data)}
        </section>
      `;
    }

    updateSettings(settings={}) {
      Object.assign(this.settings, settings);
      let {title, data} = this.settings;
      let content = this._generatePopupContent(title, data);

      this.setContent(content);
      this.update();
    }
  };
  /* Bind DataPopup klass */
  klass.DataPopup = DataPopup;

})();