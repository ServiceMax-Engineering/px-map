(function() {
  'use strict';

  /****************************************************************************
   * BEHAVIORS
   ****************************************************************************/

  /* Ensures the behavior namespace is created */
  window.PxMapBehavior = (window.PxMapBehavior || {});

  /**
   *
   * @polymerBehavior PxMapBehavior.Element
   */
  PxMapBehavior.ElementImpl = {
    beforeRegister() {
      /**
       * A reference to this element's instance. The instance can be configured and
       * attached to the map or to another instance. Events emitted by this instance
       * will be intercepted and retargeted so they appear to come from directly from
       * this custom element.
       *
       * @property elementInst
       * @type {Object|null}
       */
      this.elementInst = null;
    },

    shouldAddInst(parent) {
      // Create the instance, if it doesn't already exist
      if (!this.elementInst) {
        const options = this.__initialOptions = this.getInstOptions();
        this.elementInst = this.createInst(options);
        this.fire('px-map-layer-instance-created');
      }

      // @TODO: Bind events
      this.__instEvents = (this.__instEvents || []);
      this.__instEventsElementsMap = (this.__instEventsElementsMap || new WeakMap());

      // Add the instance to its parent
      if (this.elementInst && parent || !parent.hasLayer(this.elementInst)) {
        this.addInst(parent);
      };
    },

    shouldRemoveInst(parent) {
      // @TODO: Unbind events
      this.unbindAllEvents(this.__instEvents, this.__instEventsElementsMap);
      this.__instEvents = null;
      this.__instEventsElementsMap = null;

      if (this.elementInst) {
        this.removeInst(parent ? parent : undefined);
      };
    },

    // Simple observer trigger for dynamic properties that should be synced
    // to the instance

    shouldUpdateInst() {
      if (!this.elementInst && this.__elAttached && this.canAddInst()) {
        this.notifyInstReady(this.canAddInst());
      }
      if (!this.elementInst) return;

      const lastOptions = this.__lastOptions || this.__initialOptions;
      const nextOptions = this.getInstOptions();

      this.updateInst(lastOptions, nextOptions);

      // Set `lastOptions` to `nextOptions` so the next time this method is called
      // it will have access to the last options
      this.__lastOptions = nextOptions;
    },

    // Should be implemented by behaviors/components that extend...

    createInst() {
      throw new Error('The `createInst` method must be implemented.')
    },

    updateInst() {
      throw new Error('The `updateInst` method must be implemented.')
    },

    getInstOptions() {
      throw new Error('The `getInstOptions` method must be implemented.')
    },

    addInst() {
      throw new Error('The `bindInst` method must be implemented.')
    },

    removeInst() {
      throw new Error('The `unbindInst` method must be implemented.')
    },

    // Helper methods

    extendObj(obj, ...properties) {
      if (!obj || !(obj instanceof Object)) throw new Error('The first parameter of `extendObj` must be an object to be mutated.');
      if (properties.length) {
        Object.assign(obj, ...properties);
      }
      return obj;
    },

    addProperties(...properties) {
      this.properties = this.properties || {};
      if (properties.length) {
        this.extend(this.properties, ...properties)
      }
      return this.properties;
    },

    bindEvents(evts, target) {
      if ((typeof evts !== 'object') || !Object.keys(evts).length) return;

      const el = target || this.elementInst;
      if (!el || !el.on) return;

      const boundEvts = this.__instEvents;
      const boundEvtEls = this.__instEventsElementsMap;

      for (let evtName in evts) {
        let evtReference = {name: evtName, fn: evts[evtName]};
        el.on(evtReference.name, evtReference.fn);
        boundEvts.push(evtReference);
        boundEvtEls.set(evtReference, el);
      }
    },

    unbindAllEvents(boundEvts, boundEvtEls) {
      if (!boundEvts || !boundEvts.length || !boundEvtEls) return;

      for (let evt of boundEvts) {
        let el = boundEvtEls.get(evt);
        if (!el || !el.off) continue;

        let {name, fn} = evt;
        el.off(name, fn);

        boundEvtEls.delete(evt);
      }
    }
  };
  /* Bind Element behavior */
  PxMapBehavior.Element = [PxMapBehavior.ElementImpl];
})();
