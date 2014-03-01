/**
 * nwf.enchant.js v1.0.0
 * 2014/02/17
 * Copyright 2014 Ubiquitous Entertainment Inc.
 */

(function() {

enchant.nwf = {};

enchant.nwf.WiiUGamePadButtonsEnumeration = [
    nwf.input.ControllerButton.GAMEPAD_A,
    nwf.input.ControllerButton.GAMEPAD_B,
    nwf.input.ControllerButton.GAMEPAD_DOWN,
    nwf.input.ControllerButton.GAMEPAD_L,
    nwf.input.ControllerButton.GAMEPAD_LEFT,
    nwf.input.ControllerButton.GAMEPAD_L_STICK,
    nwf.input.ControllerButton.GAMEPAD_MINUS,
    nwf.input.ControllerButton.GAMEPAD_PLUS,
    nwf.input.ControllerButton.GAMEPAD_POWER,
    nwf.input.ControllerButton.GAMEPAD_R,
    nwf.input.ControllerButton.GAMEPAD_RIGHT,
    nwf.input.ControllerButton.GAMEPAD_R_STICK,
    nwf.input.ControllerButton.GAMEPAD_SYNC,
    nwf.input.ControllerButton.GAMEPAD_UP,
    nwf.input.ControllerButton.GAMEPAD_X,
    nwf.input.ControllerButton.GAMEPAD_Y,
    nwf.input.ControllerButton.GAMEPAD_ZL,
    nwf.input.ControllerButton.GAMEPAD_ZR
];

enchant.nwf.WiiUGamePadControllersEnumeration = [
    nwf.input.WiiUGamePad.GAMEPAD_1
];

enchant.nwf.WiiUGamePadDirectionButtonsEnumeration = [
    nwf.input.ControllerButton.GAMEPAD_RIGHT,
    nwf.input.ControllerButton.GAMEPAD_UP,
    nwf.input.ControllerButton.GAMEPAD_LEFT,
    nwf.input.ControllerButton.GAMEPAD_DOWN
];

enchant.nwf.WiiRemoteButtonsEnumeration = [
    nwf.input.ControllerButton.WII_REMOTE_1,
    nwf.input.ControllerButton.WII_REMOTE_2,
    nwf.input.ControllerButton.WII_REMOTE_A,
    nwf.input.ControllerButton.WII_REMOTE_B,
    nwf.input.ControllerButton.WII_REMOTE_DOWN,
    nwf.input.ControllerButton.WII_REMOTE_LEFT,
    nwf.input.ControllerButton.WII_REMOTE_MINUS,
    nwf.input.ControllerButton.WII_REMOTE_PLUS,
    nwf.input.ControllerButton.WII_REMOTE_RIGHT,
    nwf.input.ControllerButton.WII_REMOTE_UP
];

enchant.nwf.WiiRemoteDirectionButtonsEnumeration = [
    nwf.input.ControllerButton.WII_REMOTE_RIGHT,
    nwf.input.ControllerButton.WII_REMOTE_UP,
    nwf.input.ControllerButton.WII_REMOTE_LEFT,
    nwf.input.ControllerButton.WII_REMOTE_DOWN
];

enchant.nwf.WiiRemoteControllersEnumeration = [
    nwf.input.WiiRemote.REMOTE_1,
    nwf.input.WiiRemote.REMOTE_2,
    nwf.input.WiiRemote.REMOTE_3,
    nwf.input.WiiRemote.REMOTE_4
];

enchant.nwf.NunchukButtonsEnumeration = [
    nwf.input.ControllerButton.NUNCHUK_C,
    nwf.input.ControllerButton.NUNCHUK_Z
];

enchant.nwf.ClassicControllerButtonsEnumeration = [
    nwf.input.ControllerButton.CLASSIC_A,
    nwf.input.ControllerButton.CLASSIC_B,
    nwf.input.ControllerButton.CLASSIC_DOWN,
    nwf.input.ControllerButton.CLASSIC_L,
    nwf.input.ControllerButton.CLASSIC_LEFT,
    nwf.input.ControllerButton.CLASSIC_MINUS,
    nwf.input.ControllerButton.CLASSIC_PLUS,
    nwf.input.ControllerButton.CLASSIC_R,
    nwf.input.ControllerButton.CLASSIC_RESERVED,
    nwf.input.ControllerButton.CLASSIC_RIGHT,
    nwf.input.ControllerButton.CLASSIC_UP,
    nwf.input.ControllerButton.CLASSIC_X,
    nwf.input.ControllerButton.CLASSIC_Y,
    nwf.input.ControllerButton.CLASSIC_ZL,
    nwf.input.ControllerButton.CLASSIC_ZR
];

/**
 * @scope enchant.AnalogInputSource.prototype
 */
enchant.AnalogInputSource = enchant.Class.create(enchant.InputSource, {
    /**
     * @name enchant.AnalogInputSource
     * @class
     * An InputSource that wraps inputs with multiple numeric values.
     * @param {String} identifier AnalogInputSource ID.
     * @constructs
     * @extends enchant.InputSource
     */
    initialize: function(identifier) {
        enchant.InputSource.call(this, identifier);
    }
});

/**
 * @scope enchant.AnalogInputManager.prototype
 */
enchant.AnalogInputManager = enchant.Class.create(enchant.InputManager, {
    /**
     * @name enchant.AnalogInputManager
     * @class
     * An InputManager that manages changing multiple numeric values.
     * @param {*} valueStore The object that stores the input values.
     * @param {String} eventNameSuffix The event name suffix.
     * @param {String[]} propertyNames The property name of the value you want to monitor.
     * @param {*} [source=this] The input source to add to the event.
     * @constructs
     * @extends enchant.InputManager
     */
    initialize: function(valueStore, eventNameSuffix, propertyNames, source) {
        enchant.InputManager.call(this, valueStore, source);
        /**
         * The property name of the value you want to monitor.
         * @type String[]
         */
        this.propertyNames = propertyNames;
        /**
         * eventNameSuffix The event name suffix.
         * @type String
         */
        this.eventNameSuffix = eventNameSuffix;

        propertyNames.forEach(function(propertyName) {
            valueStore[propertyName] = null;
        });
    },
    _update: function(name) {
        var inputEvent, updateEvent;
        inputEvent = new enchant.Event(enchant.Event.INPUT_CHANGE);
        inputEvent.source = this.source;
        this.broadcastEvent(inputEvent);
        updateEvent = new enchant.Event(name + this.eventNameSuffix);
        updateEvent.source = this.source;
        this.broadcastEvent(updateEvent);
    },
    /**
     * Changes the input state.
     * Gets and updates the content set for propertyNames.
     * @param {String} name The input name.
     * @param {*} data The input state.
     */
    changeState: function(name, data) {
        var i, l, propertyName,
            propertyNames = this.propertyNames,
            valueStore = this.valueStore;
        for (i = 0, l = propertyNames.length; i < l; i++) {
            propertyName = propertyNames[i];
            valueStore[propertyName] = data[propertyName];
        }
        this._update(name);
    }
});

/**
 * @scope enchant.nwf.ISControllerConnection.prototype
 */
enchant.nwf.ISControllerConnection = enchant.Class.create(enchant.BinaryInputSource, {
    /**
     * @name enchant.nwf.ISControllerConnection
     * @class
     * A class that wraps controller connections.
     * @param {String} constant A constant that specifies an instance of each controller derived from the nwf.input.IController class.
     * @constructs
     * @extends enchant.BinaryInputSource
     */
    initialize: function(constant) {
        enchant.BinaryInputSource.call(this, constant);
    }
});

function addCreateInstancesMethod(Constructor) {
    Constructor.createInstances = function(ids) {
        return ids.map(function(id) {
            return new Constructor(id);
        });
    };
}

/**
 * @scope enchant.nwf.ISButton.prototype
 */
enchant.nwf.ISButton = enchant.Class.create(enchant.BinaryInputSource, {
    /**
     * @name enchant.nwf.ISButton
     * @class
     * A class that wraps button input.
     * @param {Number} id A constant defined in nwf.input.ControllerButton.
     * @constructs
     * @extends enchant.BinaryInputSource
     */
    initialize: function(id) {
        enchant.BinaryInputSource.call(this, id);
    }
});

enchant.nwf.ISButton._inherited = addCreateInstancesMethod;

addCreateInstancesMethod(enchant.nwf.ISButton);

function addGetByMethod(Constructor) {
    Constructor._instances = {};
    Constructor.getByName = function(name) {
        if (!Constructor._instances[name]) {
            Constructor._instances[name] = new Constructor(name);
        }
        return Constructor._instances[name];
    };
}

/**
 * @scope enchant.nwf.ISAnalogControl.prototype
 */
enchant.nwf.ISAnalogControl = enchant.Class.create(enchant.AnalogInputSource, {
    /**
     * @name enchant.nwf.ISAnalogControl
     * @class
     * InputSource that wraps inputs with multiple numeric values, such as sticks and gyros.
     * @param {String} identifier The input name.
     * @constructs
     * @extends enchant.AnalogInputSource
     */
    initialize: function() {
        enchant.AnalogInputSource.apply(this, arguments);
    }
});
enchant.nwf.ISAnalogControl._inherited = addGetByMethod;

addGetByMethod(enchant.nwf.ISAnalogControl);

/**
 * @scope enchant.nwf.ISBatteryLevel.prototype
 */
enchant.nwf.ISBatteryLevel = enchant.Class.create(enchant.nwf.ISAnalogControl, {
    /**
     * @name enchant.nwf.ISBatteryLevel
     * @class
     * InputSource that wraps the remaining battery life as an input.
     * @param {String} identifier Battery name.
     * @constructs
     * @extends enchant.nwf.ISAnalogControl
     */
    initialize: function(identifier) {
        enchant.nwf.ISAnalogControl.call(this, identifier);
    }
});

/**
 * @scope enchant.nwf.ISStick.prototype
 */
enchant.nwf.ISStick = enchant.Class.create(enchant.nwf.ISAnalogControl, {
    /**
     * @name enchant.nwf.ISStick
     * @class
     * InputSource that wraps stick inputs.
     * @param {String} identifier Stick name.
     * @constructs
     * @extends enchant.nwf.ISAnalogControl
     */
    initialize: function(identifier) {
        enchant.nwf.ISAnalogControl.call(this, identifier);
    }
});

/**
 * @scope enchant.nwf.ISAccelerometer.prototype
 */
enchant.nwf.ISAccelerometer = enchant.Class.create(enchant.nwf.ISAnalogControl, {
    /**
     * @name enchant.nwf.ISAccelerometer
     * @class
     * InputSource that wraps accelerometer inputs.
     * @param {String} identifier Accelerometer name.
     * @constructs
     * @extends enchant.nwf.ISAnalogControl
     */
    initialize: function(identifier) {
        enchant.nwf.ISAnalogControl.call(this, identifier);
    }
});

/**
 * @scope enchant.nwf.ISGyroscope.prototype
 */
enchant.nwf.ISGyroscope = enchant.Class.create(enchant.nwf.ISAnalogControl, {
    /**
     * @name enchant.nwf.ISGyroscope
     * @class
     * InputSource that wraps gyro sensor inputs.
     * @param {String} identifier Gyro sensor name.
     * @constructs
     * @extends enchant.nwf.ISAnalogControl
     */
    initialize: function(identifier) {
        enchant.nwf.ISAnalogControl.call(this, identifier);
    }
});

/**
 * @scope enchant.nwf.ISDPD.prototype
 */
enchant.nwf.ISDPD = enchant.Class.create(enchant.nwf.ISAnalogControl, {
    /**
     * @name enchant.nwf.ISDPD
     * @class
     * InputSource that wraps DPD inputs.
     * @param {String} identifier DPD name.
     * @constructs
     * @extends enchant.nwf.ISAnalogControl
     */
    initialize: function(identifier) {
        enchant.nwf.ISAnalogControl.call(this, identifier);
    }
});

/**
 * @scope enchant.nwf.IMControllerConnection.prototype
 */
enchant.nwf.IMControllerConnection = enchant.Class.create(enchant.BinaryInputManager, {
    /**
     * @name enchant.nwf.IMControllerConnection
     * @class
     * A class that manages controller connections.
     * @param {*} flagStore An object that stores connection states.
     * @param {Function} ISConnection ISConnection constructor that corresponds to the controller to monitor.
     * @param {nwf.input.IController[]} nwfControllers The array of NWF controller objects to monitor.
     * @param {String} name Controller name.
     * @param {*} [source=this] The input source to add to the event.
     * @constructs
     * @extends enchant.BinaryInputManager
     */
    initialize: function(flagStore, ISConnection, nwfControllers, name, source) {
        enchant.BinaryInputManager.call(this, flagStore, 'connected', 'disconnected', source);
        var iSConnections = ISConnection.instances;
        this._name = name;
        this._addConnectionEventListeners(nwfControllers, iSConnections);
        this._bind(iSConnections);
        this._dispatchConnectedEvent(nwfControllers);

        this._inputSources = iSConnections;
    },
    _addConnectionEventListeners: function(nwfControllers, iSConnections) {
        nwfControllers.forEach(function(nwfController, i) {
            var iSConnection = iSConnections[i];
            this._addConnectionEventListener(nwfController, nwf.events.ControllerEvent.CONTROLLER_CONNECTED, iSConnection, true);
            this._addConnectionEventListener(nwfController, nwf.events.ControllerEvent.CONTROLLER_DISCONNECTED, iSConnection, false);
        }, this);
    },
    _addConnectionEventListener: function(nwfController, eventType, iSConnection, state) {
        nwfController.addEventListener(eventType, function() {
            iSConnection.notifyStateChange(state);
        });
    },
    _bind: function(iSConnections) {
        iSConnections.forEach(function(iSConnection, i) {
            this.bind(iSConnection, this._getControllerIdentifier(i));
        }, this);
    },
    _getControllerIdentifier: function(i) {
        return this._name + (i + 1);
    },
    _dispatchConnectedEvent: function(nwfControllers) {
        nwfControllers.forEach(function(nwfController, i) {
            var name = this._getControllerIdentifier(i);
            if (nwfController.connected && !this.valueStore[name]) {
                this.changeState(name, true);
            }
        }, this);
    },
    /**
     * Destroys references to the NWF Control object and its binding to InputSource.
     * The object no longer operates after this method is called.
     */
    destruct: function() {
        this.clearEventListener();

        this._inputSources.forEach(function(inputSource) {
            this.unbind(inputSource);
        }, this);

        delete this._inputSources;
    }
});

/**
 * @scope enchant.nwf.IMButton.prototype
 */
enchant.nwf.IMButton = enchant.Class.create(enchant.BinaryInputManager, {
    /**
     * @name enchant.nwf.IMButton
     * @class
     * Class that manages button inputs.
     * @param {*} flagStore The object that stores the input values.
     * @param {nwf.input.IController} nwfController The NWF Controller object.
     * @param {enchant.nwf.ISButton[]} buttonInputSources Array of the ISButton corresponding to the button you want to monitor.
     * @param {String[]} buttonNames Array of the names corresponding to the button you want to monitor.
     * @param {*} [source=this] The input source to add to the event.
     * @constructs
     * @extends enchant.BinaryInputManager
     */
    initialize: function(flagStore, nwfController, iSButtons, buttonNames, source) {
        enchant.BinaryInputManager.call(this, flagStore, 'buttondown', 'buttonup', source);
        var buttonIds = iSButtons.map(function(iSButton) {
            return iSButton.identifier;
        });
        this._addButtonEventListeners(nwfController.buttons, iSButtons, buttonIds);
        this._bind(iSButtons, buttonIds, buttonNames);

        this._inputSources = iSButtons;
        this._nwfControl = nwfController.buttons;
    },
    _addButtonEventListeners: function(nwfButtonControl, iSButtons, buttonIds) {
        this._addButtonEventListener(nwfButtonControl, iSButtons, buttonIds, nwf.events.ButtonControlEvent.PRESS, true);
        this._addButtonEventListener(nwfButtonControl, iSButtons, buttonIds, nwf.events.ButtonControlEvent.RELEASE, false);
    },
    _addButtonEventListener: function(nwfButtonControl, iSButtons, buttonIds, eventType, state) {
        nwfButtonControl.addEventListener(eventType, function(e) {
            var i = buttonIds.indexOf(e.button);
            if (i !== -1) {
                iSButtons[i].notifyStateChange(state);
            }
        });
    },
    _bind: function(iSButtons, buttonIds, buttonNames) {
        var dic = this._createInputNameDictionary(buttonIds, buttonNames);
        iSButtons.forEach(function(iSButton) {
            this.bind(iSButton, dic[iSButton.identifier]);
        }, this);
    },
    _createInputNameDictionary: function(ids, names) {
        var ret = {};
        ids.forEach(function(id, i) {
            ret[id] = names[i];
        });
        return ret;
    },
    /**
     * Destroys references to the NWF Control object and its binding to InputSource.
     * The object no longer operates after this method is called.
     */
    destruct: function() {
        this.clearEventListener();

        this._inputSources.forEach(function(inputSource) {
            this.unbind(inputSource);
        }, this);
        this._nwfControl.removeAllEventListeners();

        delete this._inputSources;
        delete this._nwfControl;
    }
});

/**
 * @scope enchant.nwf.IMRotatableButton.prototype
 */
enchant.nwf.IMRotatableButton = enchant.Class.create(enchant.nwf.IMButton, {
    /**
     * @name enchant.nwf.IMRotatableButton
     * @class
     * Class that manages button inputs, including the rotatable +Control Pad.
     * @param {*} flagStore The object that stores the input values.
     * @param {nwf.input.IController} nwfController The NWF Controller object.
     * @param {enchant.nwf.ISButton[]} buttonInputSources Array of the ISButton corresponding to the button you want to monitor.
     * @param {Number[]} directionButtonIds Array of IDs representing the right, up, left, and down buttons.
     * @param {String[]} buttonNames Array of the names corresponding to the button you want to monitor.
     * @param {*} [source=this] The input source to add to the event.
     * @constructs
     * @extends enchant.nwf.IMButton
     */
    initialize: function(flagStore, nwfController, iSButton, directionButtonIds, buttonNames, source) {
        enchant.nwf.IMButton.call(this, flagStore, nwfController, iSButton, buttonNames, source);
        this._directionInputSources = this._collectDirectionInputSources(iSButton, directionButtonIds);
        this._rotation = 0;
        this._inversion = false;
    },
    /**
     * Specifies the direction of rotation for the +Control Pad.
     * @type Number
     */
    rotation: {
        get: function() {
            return this._rotation;
        },
        set: function(rotation) {
            this._rotation = rotation;
            this._rebindDirections(this._rotation, this._inversion);
        }
    },
    /**
     * Specifies the up/down inversion of the +Control Pad.
     * @type Boolean
     */
    inversion: {
        get: function() {
            return this._inversion;
        },
        set: function(inversion) {
            this._inversion = inversion;
            this._rebindDirections(this._rotation, this._inversion);
        }
    },
    _collectDirectionInputSources: function(iSButton, directionButtonIds) {
        return iSButton
            .filter(function(iSButton) {
                return directionButtonIds.indexOf(iSButton.identifier) !== -1;
            })
            .sort(function(iSButton1, iSButton2) {
                return directionButtonIds.indexOf(iSButton1.identifier) - directionButtonIds.indexOf(iSButton2.identifier);
            });
    },
    _rebindDirections: function(rotation, inversion) {
        var directions = [ 'right', 'up', 'left', 'down' ],
            list = (function(list, inv) {
                return (inv ? [ list[0], list[3], list[2], list[1] ] : list);
            }(this._directionInputSources, inversion));

        list.slice(rotation).concat(list.slice(0, rotation))
            .forEach(function(inputSource, i) {
                this.unbind(inputSource);
                this.bind(inputSource, directions[i]);
            }, this);
    },
    /**
     * Destroys references to the NWF Control object and its binding to InputSource.
     * The object no longer operates after this method is called.
     */
    destruct: function() {
        enchant.nwf.IMButton.prototype.destruct.call(this);

        delete this._directionInputSources;
    }
});

/**
 * @scope enchant.nwf.IMBatteryLevel.prototype
 */
enchant.nwf.IMBatteryLevel = enchant.Class.create(enchant.AnalogInputManager, {
    /**
     * @name enchant.nwf.IMBatteryLevel
     * @class
     * Class that manages remaining battery life.
     * @param {*} valueStore The object that stores the input values.
     * @param {nwf.input.IController} nwfController The NWF Controller object.
     * @param {*} [source=this] The input source to add to the event.
     * @constructs
     * @extends enchant.AnalogInputManager
     */
    initialize: function(valueStore, nwfController, source) {
        enchant.AnalogInputManager.call(this, valueStore, 'changed', [ 'batteryLevel' ], source);
        var iSBatteryLevel = enchant.nwf.ISBatteryLevel.getByName(nwfController.name + 'batterylevel');
        this._addLevelChangeEventListener(nwfController, iSBatteryLevel);
        this._bind(iSBatteryLevel);
        this._init(nwfController, iSBatteryLevel);

        this._inputSource = iSBatteryLevel;
    },
    _init: function(nwfController, iSBatteryLevel) {
        iSBatteryLevel.notifyStateChange(nwfController);
    },
    _bind: function(iSBatteryLevel) {
        this.bind(iSBatteryLevel, 'batterylevel');
    },
    _addLevelChangeEventListener: function(nwfController, iSBatteryLevel) {
        nwfController.addEventListener(nwf.events.ControllerEvent.BATTERY_LEVEL_CHANGE, function() {
            iSBatteryLevel.notifyStateChange(nwfController);
        });
    },
    /**
     * Destroys references to the NWF Control object and its binding to InputSource.
     * The object no longer operates after this method is called.
     */
    destruct: function() {
        this.clearEventListener();

        this.unbind(this._inputSource);

        delete this._inputSource;
    }
});

/**
 * @scope enchant.nwf.IMStick.prototype
 */
enchant.nwf.IMStick = enchant.Class.create(enchant.AnalogInputManager, {
    /**
     * @name enchant.nwf.IMStick
     * @class
     * Class that manages stick inputs.
     * @param {*} valueStore The object that stores the input values.
     * @param {nwf.input.IController} nwfController The NWF Controller object.
     * @param {String} stickName Stick name.
     * @param {*} [source=this] The input source to add to the event.
     * @constructs
     * @extends enchant.AnalogInputManager
     */
    initialize: function(valueStore, nwfController, stickName, source) {
        enchant.AnalogInputManager.call(this, valueStore, 'move', [
            'angle', 'movementX', 'movementY', 'screenX', 'screenY'
        ], source);
        var nwfStickControl = nwfController[stickName],
            bindName = stickName.toLowerCase(),
            iSStick = enchant.nwf.ISStick.getByName(nwfController.name + stickName);
        this._addMoveEventListener(nwfStickControl, iSStick);
        this._bind(iSStick, bindName);
        this._waiting = false;
        this._bindName = bindName;

        this._inputSource = iSStick;
        this._nwfControl = nwfStickControl;

        enchant.nwf.IMStick.instances.push(this);
        enchant.Core.instance.addEventListener(enchant.Event.EXIT_FRAME, enchant.nwf.IMStick.neutralListener);
    },
    _bind: function(iSStick, name) {
        this.bind(iSStick, name);
    },
    _addMoveEventListener: function(nwfStickControl, iSStick) {
        nwfStickControl.addEventListener(nwf.events.MovementControlEvent.MOVE, function() {
            this._waiting = true;
            iSStick.notifyStateChange(nwfStickControl);
        }.bind(this));
    },
    /**
     * Destroys references to the NWF Control object and its binding to InputSource.
     * The object no longer operates after this method is called.
     */
    destruct: function() {
        this.clearEventListener();

        this.unbind(this._inputSource);
        this._nwfControl.removeAllEventListeners();

        delete this._inputSource;
        delete this._nwfControl;

        var i = enchant.nwf.IMStick.instances.indexOf(this);
        if (i !== -1) {
            enchant.nwf.IMStick.instances.splice(i, 1);
        }
    }
});
/**
 * Array that holds IMStick instances.
 * @static
 */
enchant.nwf.IMStick.instances = [];
/**
 * Event handler that monitors whether sticks have returned to center.
 * @static
 */
enchant.nwf.IMStick.neutralListener = function() {
    var i, l, instance, nwfStickControl,
        instances = enchant.nwf.IMStick.instances;
    for (i = 0, l = instances.length; i < l; i++) {
        instance = instances[i];
        nwfStickControl = instance._nwfControl;
        if (instance._waiting && nwfStickControl.movementX === 0 && nwfStickControl.movementY === 0) {
            instance.changeState(instance._bindName, nwfStickControl);
            instance._waiting = false;
        }
    }
};

/**
 * @scope enchant.nwf.IMAccelerometer.prototype
 */
enchant.nwf.IMAccelerometer = enchant.Class.create(enchant.AnalogInputManager, {
    /**
     * @name enchant.nwf.IMAccelerometer
     * @class
     * Class that manages accelerometer inputs.
     * @param {*} valueStore The object that stores the input values.
     * @param {nwf.input.IController} nwfController Instance of the NWF controller class.
     * @param {*} [source=this] The input source to add to the event.
     * @constructs
     * @extends enchant.BinaryInputManager
     */
    initialize: function(valueStore, nwfController, source) {
        enchant.AnalogInputManager.call(this, valueStore, 'update', [
            'accelerationLength', 'accelerationSpeed', 'accelerationX', 'accelerationY', 'accelerationZ'
        ], source);
        var iSAccelerometer = enchant.nwf.ISAccelerometer.getByName(nwfController.name + 'accelerometer');
        this._addMoveEventListener(nwfController.accelerometer, iSAccelerometer);
        this._bind(iSAccelerometer);

        this._inputSource = iSAccelerometer;
        this._nwfControl = nwfController.accelerometer;
    },
    _bind: function(iSAccelerometer) {
        this.bind(iSAccelerometer, 'acceleration');
    },
    _addMoveEventListener: function(nwfAccelerometerControl, iSAccelerometer) {
        nwfAccelerometerControl.addEventListener(nwf.events.AccelerometerControlEvent.UPDATE, function() {
            iSAccelerometer.notifyStateChange(nwfAccelerometerControl);
        });
    },
    /**
     * Destroys references to the NWF Control object and its binding to InputSource.
     * The object no longer operates after this method is called.
     */
    destruct: function() {
        this.clearEventListener();

        this.unbind(this._inputSource);
        this._nwfControl.removeAllEventListeners();

        delete this._inputSource;
        delete this._nwfControl;
    }
});

/**
 * @scope enchant.nwf.IMGyroscope.prototype
 */
enchant.nwf.IMGyroscope = enchant.Class.create(enchant.AnalogInputManager, {
    /**
     * @name enchant.nwf.IMGyroscope
     * @class
     * Class that manages gyro sensor inputs.
     * @param {*} valueStore The object that stores the input values.
     * @param {nwf.input.IController} nwfController The NWF Controller object.
     * @param {*} [source=this] The input source to add to the event.
     * @constructs
     * @extends enchant.AnalogInputManager
     */
    initialize: function(valueStore, nwfController, source) {
        enchant.AnalogInputManager.call(this, valueStore, 'update', [
            'angleX', 'angleY', 'angleZ', 'dirVectorX', 'dirVectorY', 'dirVectorZ', 'rotationRateX', 'rotationRateY', 'rotationRateZ'
        ], source);
        var iSGyroscope = enchant.nwf.ISGyroscope.getByName(nwfController.name + 'gyroscope');
        this._addMoveEventListener(nwfController.gyroscope, iSGyroscope);
        this._bind(iSGyroscope);

        this._calibrator = new enchant.nwf.GyroscopeCalibrator(nwfController.gyroscope);

        [ enchant.Event.CALIBRATION_SUCCESS, enchant.Event.CALIBRATION_FAILURE ]
            .forEach(function(eventType) {
                this._calibrator.addEventListener(eventType, function(e) {
                    this.dispatchEvent(e);
                    this.broadcastEvent(e);
                }.bind(this));
            }, this);

        this._inputSource = iSGyroscope;
        this._nwfControl = nwfController.gyroscope;
    },
    /**
     * Calibrates the gyro sensor.
     * @param {Number} [retry=0] Number of retry attempts if calibration fails.
     * @return {enchant.Deferred} Deferred object to start after calibration.
     */
    calibrate: function(retry) {
        return this._calibrator.calibrate(retry);
    },
    _bind: function(iSGyroscope) {
        this.bind(iSGyroscope, 'gyro');
    },
    _addMoveEventListener: function(nwfGyroscopeControl, iSGyroscope) {
        nwfGyroscopeControl.addEventListener(nwf.events.GyroscopeControlEvent.UPDATE, function() {
            iSGyroscope.notifyStateChange(nwfGyroscopeControl);
        });
    },
    /**
     * Destroys references to the NWF Control object and its binding to InputSource.
     * The object no longer operates after this method is called.
     */
    destruct: function() {
        this.clearEventListener();

        this.unbind(this._inputSource);
        this._nwfControl.removeAllEventListeners();
        this._calibrator.destruct();

        delete this._inputSource;
        delete this._nwfControl;
        delete this._calibrator;
    }
});

/**
 * @scope enchant.nwf.GyroscopeCalibrator.prototype
 */
enchant.nwf.GyroscopeCalibrator = enchant.Class.create(enchant.EventTarget, {
    /**
     * @name enchant.nwf.GyroscopeCalibrator
     * @class
     * Class that calibrates the gyro sensor.
     * @constructs
     * @extends enchant.EventTarget
     */
    initialize: function(nwfGyroscope) {
        enchant.EventTarget.call(this);
        this._nwfGyroscope = nwfGyroscope;
    },
    /**
     * Calibrates the gyro sensor.
     * @param {Number} [retry=0] Number of retry attempts if calibration fails.
     * @return {enchant.Deferred} Deferred object to start after calibration.
     * @private
     */
    calibrate: function(retry) {
        var nwfGyroscope = this._nwfGyroscope,
            deferred = new enchant.Deferred(),
            tried = 0;
        retry = retry || 0;

        var onsuccess = function() {
            removeListeners();
            var evt = new enchant.Event(enchant.Event.CALIBRATION_SUCCESS);
            this.dispatchEvent(evt);
            deferred.call(evt);
        }.bind(this);

        var onfailure = function() {
            var evt;
            tried++;
            if (tried > retry) {
                removeListeners();
                evt = new enchant.Event(enchant.Event.CALIBRATION_FAILURE);
                this.dispatchEvent(evt);
                deferred.fail(evt);
            } else {
                nwfGyroscope.calibrate();
            }
        }.bind(this);

        function removeListeners() {
            nwfGyroscope.removeEventListener(nwf.events.GyroscopeControlEvent.CALIBRATION_FAIL, onfailure);
            nwfGyroscope.removeEventListener(nwf.events.GyroscopeControlEvent.CALIBRATION_SUCCESS, onsuccess);
        }

        nwfGyroscope.addEventListener(nwf.events.GyroscopeControlEvent.CALIBRATION_FAIL, onfailure);
        nwfGyroscope.addEventListener(nwf.events.GyroscopeControlEvent.CALIBRATION_SUCCESS, onsuccess);

        setTimeout(function() {
            nwfGyroscope.calibrate();
        }, 10);

        return deferred;
    },
    /**
     * Destroys references to the target GyroscopeControl object.
     * The object no longer operates after this method is called.
     * Normally called automatically by nwf.enchant.js itself.
     */
    destruct: function() {
        this.clearEventListener();

        delete this._nwfGyroscope;
    }
});

/**
 * @scope enchant.nwf.IMDPD.prototype
 */
enchant.nwf.IMDPD = enchant.Class.create(enchant.AnalogInputManager, {
    /**
     * @name enchant.nwf.IMDPD
     * @class
     * Class that manages DPD inputs.
     * @param {*} valueStore The object that stores the input values.
     * @param {nwf.input.IController} nwfController The NWF Controller object.
     * @param {*} [source=this] The input source to add to the event.
     * @constructs
     * @extends enchant.AnalogInputManager
     */
    initialize: function(valueStore, nwfController, source) {
        enchant.AnalogInputManager.call(this, valueStore, 'update', [
            'distance', 'distanceDifference', 'distanceSpeed',
            'pointerAccuracy', 'pointerDifference', 'pointerRotation', 'pointerSpeed',
            'pointerHorizon', 'pointerHorizonDifference', 'pointerHorizonSpeed',
            'pointerX', 'pointerY', 'screenX', 'screenY'
        ], source);
        var iSDPD = enchant.nwf.ISDPD.getByName(nwfController.name + 'dpd');
        this._addMoveEventListener(nwfController.cursor, iSDPD);
        this._bind(iSDPD);

        this._inputSource = iSDPD;
        this._nwfControl = nwfController.cursor;
    },
    _bind: function(iSDPD) {
        this.bind(iSDPD, 'pointer');
    },
    _addMoveEventListener: function(nwfDPDControl, iSDPD) {
        nwfDPDControl.addEventListener(nwf.events.DPDControlEvent.UPDATE, function() {
            iSDPD.notifyStateChange(nwfDPDControl);
        });
    },
    /**
     * Destroys references to the NWF Control object and its binding to InputSource.
     * The object no longer operates after this method is called.
     */
    destruct: function() {
        this.clearEventListener();

        this.unbind(this._inputSource);
        this._nwfControl.removeAllEventListeners();

        delete this._inputSource;
        delete this._nwfControl;
    }
});

/**
 * @scope enchant.nwf.ControllerInputContainer.prototype
 */
enchant.nwf.ControllerInputContainer = enchant.Class.create(enchant.EventTarget, {
    /**
     * @name enchant.nwf.ControllerInputContainer
     * @class
     * Class for the collection of controller inputs.
     * @param {nwf.input.IController} nwfController The NWF Controller object.
     * @param {Object} managerConstructors Associative array of the constructors for the input names and managers to monitor.
     * @constructs
     * @extends enchant.EventTarget
     */
    initialize: function(nwfController, managerConstructors) {
        enchant.EventTarget.call(this);

        /**
         * Controller name.
         * @type String
         */
        this.name = nwfController.name;

        this._managers = {};
        for (var managerName in managerConstructors) {
            this._addManager(managerName, managerConstructors[managerName], nwfController);
        }

        this._nwfController = nwfController;
    },
    /**
     * Indicates whether the controller is connected.
     * @type Boolean
     */
    connected: {
        get: function() {
             return this._nwfController.connected;
        }
    },
    /**
     * Adds EventTarget to the recipients of notifications of ControllerInputContainer input changes.
     * @param {enchant.EventTarget} eventTarget The EventTarget you want to add.
     */
    bindTo: function(eventTarget) {
        for (var prop in this._managers) {
            this._managers[prop].addBroadcastTarget(eventTarget);
        }
    },
    /**
     * Deletes EventTarget from the recipients of notifications of ControllerInputContainer input changes.
     * @param {enchant.EventTarget} eventTarget The EventTarget you want to delete.
     */
    unbindFrom: function(eventTarget) {
        for (var prop in this._managers) {
            this._managers[prop].removeBroadcastTarget(eventTarget);
        }
    },
    _addManager: function(managerName, ManagerConstructor, nwfController, flagStore) {
        flagStore = flagStore || (this[managerName] = {});
        var manager = new ManagerConstructor(flagStore, nwfController, this);
        this._managers[managerName] = manager;

        manager.addBroadcastTarget(this);
    },
    _removeManager: function(managerName) {
        var manager = this._managers[managerName];
        manager.destruct();
        while (manager.broadcastTarget.length) {
            manager.removeBroadcastTarget(manager.broadcastTarget[0]);
        }

        delete this._managers[managerName];
    },
    /**
     * Destroys any managers held by the object itself in addition to references.
     * The object no longer operates after this method is called.
     */
    destruct: function() {
        this.clearEventListener();

        for (var prop in this._managers) {
            this._removeManager(prop);
        }
        this._nwfController.removeAllEventListeners();

        delete this._nwfController;
    }
});

/**
 * @scope enchant.nwf.ExtensionControllerInputContainer.prototype
 */
enchant.nwf.ExtensionControllerInputContainer = enchant.Class.create(enchant.nwf.ControllerInputContainer, {
    /**
     * @name enchant.nwf.ExtensionControllerInputContainer
     * @class
     * Class for the collection of extension controller inputs.
     * @param {nwf.input.IController} nwfController The NWF Controller object.
     * @param {Object} inputParams Associative array of the constructors for the input names and managers to monitor.
     * @constructs
     * @extends enchant.nwf.ControllerInputContainer
     */
    initialize: function(nwfController, inputParams) {
        enchant.nwf.ControllerInputContainer.call(this, nwfController, inputParams);
    },
    /**
     * Removes extension controllers from the system.
     */
    remove: function() {
        this.destruct();
    }
});

/**
 * @scope enchant.nwf.ControllerManager.prototype
 */
enchant.nwf.ControllerManager = enchant.Class.create(enchant.EventTarget, {
    /**
     * @name enchant.nwf.ControllerManager
     * @class
     * Class that manages controllers by type.
     * @param {Function} IMConnection IMControllerConnection constructor that corresponds to the controller to monitor.
     * @param {Function} InputContainer ControllerInputContainer constructor that corresponds to the controller to monitor.
     * @param {Function} NWFControllerClass NWF IController subclass that corresponds to the controller to monitor.
     * @param {Number[]} controllersEnumeration Array of constants representing the controllers to monitor.
     * @constructs
     * @extends enchant.EventTarget
     */
    initialize: function(ConnectionManager, InputContainer, NWFControllerClass, controllersEnumeration) {
        enchant.EventTarget.call(this);
        var nwfControllers = this._collectControllers(NWFControllerClass, controllersEnumeration);
        /**
         * Associative array that holds the connection status of the controllers.
         * @type Object
         */
        this.connection = {};
        /**
         * Manages the connection state of the controllers.
         * @type enchant.nwf.IMControllerConnection
         */
        this.connectionManager = new ConnectionManager(this.connection, nwfControllers);
        this.connectionManager.addBroadcastTarget(this);
        /**
         * Array of controllers.
         * @type enchant.nwf.ControllerInputContainer[]
         */
        this.controllers = nwfControllers.map(function(nwfController) {
            return new InputContainer(nwfController);
        });
    },
    _collectControllers: function(NWFControllerClass, controllersEnumeration) {
        if (controllersEnumeration) {
            return controllersEnumeration.map(function(constant) {
                return NWFControllerClass.getController(constant);
            });
        } else {
            return [ NWFControllerClass.getController() ];
        }
    },
    /**
     * Destroys any ControllerInputContainers and managers held by the object itself in addition to references to the ControllerInputContainers.
     * The object no longer operates after this method is called.
     */
    destruct: function() {
        this.connectionManager.destruct();
        this.controllers.forEach(function(controller) {
            controller.destruct();
        });

        this.controllers = [];
    }
});

/**
 * @scope enchant.nwf.Vibrator.prototype
 */
enchant.nwf.Vibrator = enchant.Class.create(enchant.EventTarget, {
    /**
     * @name enchant.nwf.Vibrator
     * @class
     * Object that controls the rumble feature of the controller.
     * @param {enchant.nwf.Vibrator} vibrator Vibrator object.
     * @constructs
     * @extends enchant.EventTarget
     */
    initialize: function(nwfController) {
        enchant.EventTarget.call(this);
        this.tl = new enchant.nwf.VibratorTimeline(this);
        this.tl.setTimeBased();
        this._nwfController = nwfController;

        enchant.nwf.Vibrator.instances.push(this);
        enchant.Core.instance.addEventListener(enchant.Event.ENTER_FRAME, enchant.nwf.Vibrator.tickListener);
    },
    /**
     * Vibrates the controller for the specified amount of time.
     * @param {Number} time Vibration time (in milliseconds).
     * @param {Boolean} [force=false] Whether to overwrite the vibration already scheduled for the controller.
     * @return {enchant.VibratorTimeline} Timeline held by the object itself.
     */
    vibrate: function(time, force) {
        return this.tl.vibrate(time, force);
    },
    /**
     * Stops the controller for the specified amount of time.
     * @param {Number} time Stop time (in milliseconds).
     * @param {Boolean} [force=false] Whether to overwrite the vibration already scheduled for the controller.
     * @return {enchant.VibratorTimeline} Timeline held by the object itself.
     */
    rest: function(time, force) {
        return this.tl.rest(time, force);
    },
    /**
     * Stops the controller.
     * @return {enchant.VibratorTimeline} Timeline held by the object itself.
     */
    stop: function() {
        return this.tl.stop();
    },
    /**
     * Clears the timeline and destroy references to the NWF controller object.
     * The object no longer operates after this method is called.
     */
    destruct: function() {
        this.clearEventListener();

        this.tl.destruct();

        delete this._nwfController;
    }
});
/**
 * List of generated Vibrator objects.
 * @type enchant.Vibrator[]
 * @static
 */
enchant.nwf.Vibrator.instances = [];
/**
 * Listener that triggers an enterframe event in the Vibrator object.
 * Automatically added as the Core event listener when a Vibrator object is created.
 * @type Function
 * @static
 */
enchant.nwf.Vibrator.tickListener = function(e) {
    var i, l, instance,
        instances = enchant.nwf.Vibrator.instances;
    for (i = 0, l = instances.length; i < l; i++) {
        instance = instances[i];
        instance.dispatchEvent(e);
    }
};

/**
 * @scope enchant.nwf.VibratorTimeline.prototype
 */
enchant.nwf.VibratorTimeline = enchant.Class.create(enchant.Timeline, {
    /**
     * @name enchant.nwf.VibratorTimeline
     * @class
     * Timeline that controls the rumble feature of the controller.
     * @param {enchant.nwf.Vibrator} vibrator Vibrator object.
     * @constructs
     * @extends enchant.Timeline
     */
    initialize: function(vibrator) {
        enchant.Timeline.call(this, vibrator);
    },
    /**
     * Vibrates the controller for the specified amount of time.
     * @param {Number} time Vibration time (in milliseconds).
     * @param {Boolean} [force=false] Whether to overwrite the vibration already scheduled for the controller.
     * @return {enchant.VibratorTimeline} The object itself.
     */
    vibrate: function(time, force) {
        return this
            .then(function() {
                this._nwfController.startVibrate(time, 0, !!force);
            })
            .delay(time);
    },
    /**
     * Stops the controller for the specified amount of time.
     * Similar processes are also possible with {@link enchant.Timeline#delay}.
     * @param {Number} time Stop time (in milliseconds).
     * @param {Boolean} [force=false] Whether to overwrite the vibration already scheduled for the controller.
     * @return {enchant.VibratorTimeline} The object itself.
     */
    rest: function(time, force) {
        return this
            .then(function() {
                this._nwfController.startVibrate(0, time, !!force);
            })
            .delay(time);
    },
    /**
     * Stops the controller.
     * @return {enchant.VibratorTimeline} The object itself.
     */
    stop: function() {
        return this
            .then(function() {
                this._nwfController.stopVibrate();
            });
    },
    /**
     * Clears the timeline and deletes all event listeners.
     */
    destruct: function() {
        this.clearEventListener();

        this.clear();
    }
});

/**
 * @scope enchant.nwf.ISNunchukButton.prototype
 */
enchant.nwf.ISNunchukButton = enchant.Class.create(enchant.nwf.ISButton, {
    /**
     * @name enchant.nwf.ISNunchukButton
     * @class
     * An InputSource that wraps input from the buttons on the Nunchuk controller.
     * @param {Number} id IDs for the controller buttons defined in nwf.input.ControllerButton.
     * @constructs
     * @extends enchant.nwf.ISButton
     */
    initialize: function(id) {
        enchant.nwf.ISButton.call(this, id);
    }
});

/**
 * @scope enchant.nwf.IMNunchukButton.prototype
 */
enchant.nwf.IMNunchukButton = enchant.Class.create(enchant.nwf.IMButton, {
    /**
     * @name enchant.nwf.IMNunchukButton
     * @class
     * Class for managing the buttons included in the Nunchuk controller.
     * @param {*} flagStore The object that stores the input values.
     * @param {nwf.input.Nunchuk} nwfNunchuk The NWF Nunchuk Controller object.
     * @param {enchant.nwf.NunchukInput} source The NunchukInput object to associate.
     * @constructs
     * @extends enchant.nwf.IMButton
     */
    initialize: function(flagStore, nwfNunchuk, source) {
        enchant.nwf.IMButton.call(this, flagStore, nwfNunchuk,
            enchant.nwf.ISNunchukButton.createInstances(enchant.nwf.NunchukButtonsEnumeration),
            [ 'c', 'z' ], source);
    }
});

/**
 * @scope enchant.nwf.IMNunchukAccelerometer.prototype
 */
enchant.nwf.IMNunchukAccelerometer = enchant.Class.create(enchant.nwf.IMAccelerometer, {
    /**
     * @name enchant.nwf.IMNunchukAccelerometer
     * @class
     * Class for managing the accelerometer included in the Nunchuk controller.
     * @param {*} valueStore The object that stores the input values.
     * @param {nwf.input.Nunchuk} nwfNunchuk The NWF Nunchuk Controller object.
     * @param {enchant.nwf.NunchukInput} source An associated NunchukInput object.
     * @constructs
     * @extends enchant.nwf.IMAccelerometer
     */
    initialize: function(valueStore, nwfController, source) {
        enchant.nwf.IMAccelerometer.call(this, valueStore, nwfController, source);
    }
});

/**
 * @scope enchant.nwf.IMNunchukStick.prototype
 */
enchant.nwf.IMNunchukStick = enchant.Class.create(enchant.nwf.IMStick, {
    /**
     * @name enchant.nwf.IMNunchukStick
     * @class
     * Class for managing the stick control input included in the Nunchuk controller.
     * @param {*} valueStore The object that stores the input values.
     * @param {nwf.input.Nunchuk} nwfNunchuk The NWF Nunchuk Controller object.
     * @param {enchant.nwf.NunchukInput} source The NunchukInput object to associate.
     * @constructs
     * @extends enchant.nwf.IMStick
     */
    initialize: function(valueStore, nwfController, source) {
        enchant.nwf.IMStick.call(this, valueStore, nwfController, 'stick', source);
    }
});

/**
 * @scope enchant.nwf.NunchukInput.prototype
 */
enchant.nwf.NunchukInput = enchant.Class.create(enchant.nwf.ExtensionControllerInputContainer, {
    /**
     * @name enchant.nwf.NunchukInput
     * @class
     * Class for the collection of Nunchuk Controller input.
     * @param {nwf.input.Nunchuk} nwfNunchuk The NWF Nunchuk Controller object.
     * @constructs
     * @extends enchant.nwf.ExtensionControllerInputContainer
     */
    initialize: function(nwfNunchuk) {
        enchant.nwf.ExtensionControllerInputContainer.call(this, nwfNunchuk, {
            accelerometer: enchant.nwf.IMNunchukAccelerometer,
            stick: enchant.nwf.IMNunchukStick,
            buttons: enchant.nwf.IMNunchukButton
        });
    }
});

/**
 * @scope enchant.nwf.ISClassicControllerButton.prototype
 */
enchant.nwf.ISClassicControllerButton = enchant.Class.create(enchant.nwf.ISButton, {
    /**
     * @name enchant.nwf.ISClassicControllerButton
     * @class
     * An InputSource that wraps input from the buttons on the Classic Controller.
     * @param {Number} id IDs for the controller buttons defined in nwf.input.ControllerButton.
     * @constructs
     * @extends enchant.nwf.ISButton
     */
    initialize: function(id) {
        enchant.nwf.ISButton.call(this, id);
    }
});

/**
 * @scope enchant.nwf.IMClassicControllerButton.prototype
 */
enchant.nwf.IMClassicControllerButton = enchant.Class.create(enchant.nwf.IMButton, {
    /**
     * @name enchant.nwf.IMClassicControllerButton
     * @class
     * A class that manages inputs from the buttons on the Classic Controller.
     * @param {*} flagStore The object that stores the input values.
     * @param {nwf.input.ClassicController} nwfClassicController The NWF Classic Controller object.
     * @param {enchant.nwf.ClassicControllerInput} source ClassicControllerInput object to associate.
     * @constructs
     * @extends enchant.nwf.IMButton
     */
    initialize: function(flagStore, nwfClassicController, source) {
        enchant.nwf.IMButton.call(this, flagStore, nwfClassicController,
            enchant.nwf.ISClassicControllerButton.createInstances(enchant.nwf.ClassicControllerButtonsEnumeration),
            [ 'a', 'b', 'down', 'l', 'left', 'minus', 'plus', 'r', 'reserved', 'right', 'up', 'x', 'y', 'zl', 'zr' ], source);
    }
});

/**
 * @scope enchant.nwf.IMClassicControllerStick.prototype
 */
enchant.nwf.IMClassicControllerStick = enchant.Class.create(enchant.nwf.IMStick, {
    /**
     * @name enchant.nwf.IMClassicControllerStick
     * @class
     * A class that manages stick input from the Classic Controller.
     * @param {*} valueStore The object that stores the input values.
     * @param {nwf.input.ClassicController} nwfController The NWF Classic Controller object.
     * @param {String} stickName The name corresponding to the stick to monitor.
     * @param {enchant.nwf.ClassicControllerInput} source ClassicControllerInput object to associate.
     * @constructs
     * @extends enchant.nwf.IMStick
     */
    initialize: function(valueStore, nwfController, stickName, source) {
        enchant.nwf.IMStick.call(this, valueStore, nwfController, stickName, source);
    }
});

/**
 * @scope enchant.nwf.IMClassicControllerLeftStick.prototype
 */
enchant.nwf.IMClassicControllerLeftStick = enchant.Class.create(enchant.nwf.IMClassicControllerStick, {
    /**
     * @name enchant.nwf.IMClassicControllerLeftStick
     * @class
     * A class that manages inputs from the left stick on the Classic Controller.
     * @param {*} valueStore The object that stores the input values.
     * @param {nwf.input.ClassicController} nwfController The NWF Classic Controller object.
     * @param {enchant.nwf.ClassicControllerInput} source ClassicControllerInput object to associate.
     * @constructs
     * @extends enchant.nwf.IMClassicControllerStick
     */
    initialize: function(valueStore, nwfController, source) {
        enchant.nwf.IMStick.call(this, valueStore, nwfController, 'leftStick', source);
    }
});

/**
 * @scope enchant.nwf.IMClassicControllerRightStick.prototype
 */
enchant.nwf.IMClassicControllerRightStick = enchant.Class.create(enchant.nwf.IMClassicControllerStick, {
    /**
     * @name enchant.nwf.IMClassicControllerRightStick
     * @class
     * A class that manages inputs from the right stick on the Classic Controller.
     * @param {*} valueStore The object that stores the input values.
     * @param {nwf.input.ClassicController} nwfController The NWF Classic Controller object.
     * @param {enchant.nwf.ClassicControllerInput} source ClassicControllerInput object to associate.
     * @constructs
     * @extends enchant.nwf.IMClassicControllerStick
     */
    initialize: function(valueStore, nwfController, source) {
        enchant.nwf.IMStick.call(this, valueStore, nwfController, 'rightStick', source);
    }
});

/**
 * @scope enchant.nwf.ClassicControllerInput.prototype
 */
enchant.nwf.ClassicControllerInput = enchant.Class.create(enchant.nwf.ExtensionControllerInputContainer, {
    /**
     * @name enchant.nwf.ClassicControllerInput
     * @class
     * Class for the collection of Classic Controller input.
     * @param {nwf.input.ClassicController} nwfClassicController The NWF Classic Controller object.
     * @constructs
     * @extends enchant.nwf.ExtensionControllerInputContainer
     */
    initialize: function(nwfClassicController) {
        enchant.nwf.ExtensionControllerInputContainer.call(this, nwfClassicController, {
            lstick: enchant.nwf.IMClassicControllerLeftStick,
            rstick: enchant.nwf.IMClassicControllerRightStick,
            buttons: enchant.nwf.IMClassicControllerButton
        });
    }
});

/**
 * @scope enchant.nwf.ISWiiRemoteConnection.prototype
 */
enchant.nwf.ISWiiRemoteConnection = enchant.Class.create(enchant.nwf.ISControllerConnection, {
    /**
     * @name enchant.nwf.ISWiiRemoteConnection
     * @class
     * A class that wraps Wii Remote connections.
     * @param {Number} id ID defined in nwf.input.WiiRemote.
     * @constructs
     * @extends enchant.nwf.ISControllerConnection
     */
    initialize: function(id) {
        enchant.nwf.ISControllerConnection.call(this, id);
    }
});
/**
 * List of generated ISWiiRemoteConnection objects.
 * @type enchant.nwf.ISWiiRemoteConnection[]
 * @static
 */
enchant.nwf.ISWiiRemoteConnection.instances = enchant.nwf.WiiRemoteControllersEnumeration.map(function(constant) {
    return new enchant.nwf.ISWiiRemoteConnection(constant);
});

/**
 * @scope enchant.nwf.ISWiiRemoteButton.prototype
 */
enchant.nwf.ISWiiRemoteButton = enchant.Class.create(enchant.nwf.ISButton, {
    /**
     * @name enchant.nwf.ISWiiRemoteButton
     * @class
     * An InputSource that wraps input from the buttons on the Wii Remote.
     * @param {Number} id IDs for the controller buttons defined in nwf.input.ControllerButton.
     * @constructs
     * @extends enchant.nwf.ISButton
     */
    initialize: function(id) {
        enchant.nwf.ISButton.call(this, id);
    }
});

/**
 * @scope enchant.nwf.IMWiiRemoteConnection.prototype
 */
enchant.nwf.IMWiiRemoteConnection = enchant.Class.create(enchant.nwf.IMControllerConnection, {
    /**
     * @name enchant.nwf.IMWiiRemoteConnection
     * @class
     * A class that manages Wii Remote connections.
     * @param {*} flagStore An object that stores connection states.
     * @param {nwf.input.WiiRemote[]} nwfWiiRemoteControllers The array of NWF WiiRemote objects to monitor.
     * @param {*} [source=this] The input source to add to the event.
     * @constructs
     * @extends enchant.nwf.IMControllerConnection
     */
    initialize: function(flagStore, nwfWiiRemoteControllers, source) {
        enchant.nwf.IMControllerConnection.call(this, flagStore, enchant.nwf.ISWiiRemoteConnection,
            nwfWiiRemoteControllers, 'wiiremote', source);
    }
});

/**
 * @scope enchant.nwf.IMWiiRemoteButton.prototype
 */
enchant.nwf.IMWiiRemoteButton = enchant.Class.create(enchant.nwf.IMRotatableButton, {
    /**
     * @name enchant.nwf.IMWiiRemoteButton
     * @class
     * Class that manages inputs from the buttons on the Wii Remote.
     * @param {*} flagStore The object that stores the input values.
     * @param {nwf.input.WiiRemote} nwfWiiRemote NWF WiiRemote object.
     * @param {enchant.nwf.WiiRemoteInput} source WiiRemoteInput object to associate.
     * @constructs
     * @extends enchant.nwf.IMRotatableButton
     */
    initialize: function(flagStore, nwfWiiRemote, source) {
        enchant.nwf.IMRotatableButton.call(this, flagStore, nwfWiiRemote,
            enchant.nwf.ISWiiRemoteButton.createInstances(enchant.nwf.WiiRemoteButtonsEnumeration),
            enchant.nwf.WiiRemoteDirectionButtonsEnumeration,
            [ '1', '2', 'a', 'b', 'down', 'left', 'minus', 'plus', 'right', 'up' ], source);
    }
});

/**
 * @scope enchant.nwf.IMWiiRemoteAccelerometer.prototype
 */
enchant.nwf.IMWiiRemoteAccelerometer = enchant.Class.create(enchant.nwf.IMAccelerometer, {
    /**
     * @name enchant.nwf.IMWiiRemoteAccelerometer
     * @class
     * Class for managing the accelerometers on the Wii Remote.
     * @param {*} valueStore The object that stores the input values.
     * @param {nwf.input.WiiRemote} nwfWiiRemote NWF WiiRemote object.
     * @param {enchant.nwf.WiiRemoteInput} source WiiRemoteInput object to associate.
     * @constructs
     * @extends enchant.nwf.IMAccelerometer
     */
    initialize: function(valueStore, nwfController, source) {
        enchant.nwf.IMAccelerometer.call(this, valueStore, nwfController, source);
    }
});

/**
 * @scope enchant.nwf.IMWiiRemoteGyroscope.prototype
 */
enchant.nwf.IMWiiRemoteGyroscope = enchant.Class.create(enchant.nwf.IMGyroscope, {
    /**
     * @name enchant.nwf.IMWiiRemoteGyroscope
     * @class
     * Class for managing the gyro sensors on the Wii Remote.
     * @param {*} valueStore The object that stores the input values.
     * @param {nwf.input.WiiRemote} nwfWiiRemote NWF WiiRemote object.
     * @param {enchant.nwf.WiiRemoteInput} source WiiRemoteInput object to associate.
     * @constructs
     * @extends enchant.nwf.IMGyroscope
     */
    initialize: function(valueStore, nwfController, source) {
        enchant.nwf.IMGyroscope.call(this, valueStore, nwfController, source);
    }
});

/**
 * @scope enchant.nwf.IMWiiRemoteDPD.prototype
 */
enchant.nwf.IMWiiRemoteDPD = enchant.Class.create(enchant.nwf.IMDPD, {
    /**
     * @name enchant.nwf.IMWiiRemoteDPD
     * @class
     * Class for managing DPD on the Wii Remote.
     * @param {*} valueStore The object that stores the input values.
     * @param {nwf.input.WiiRemote} nwfWiiRemote NWF WiiRemote object.
     * @param {enchant.nwf.WiiRemoteInput} source WiiRemoteInput object to associate.
     * @constructs
     * @extends enchant.nwf.IMDPD
     */
    initialize: function(valueStore, nwfController, source) {
        enchant.nwf.IMDPD.call(this, valueStore, nwfController, source);
    }
});

/**
 * @scope enchant.nwf.WiiRemoteInput.prototype
 */
enchant.nwf.WiiRemoteInput = enchant.Class.create(enchant.nwf.ControllerInputContainer, {
    /**
     * @name enchant.nwf.WiiRemoteInput
     * @class
     * A class that collects Wii Remote inputs.
     * @param {nwf.input.WiiRemote} nwfWiiRemote NWF WiiRemote object.
     * @constructs
     * @extends enchant.nwf.ControllerInputContainer
     */
    initialize: function(nwfWiiRemote) {
        enchant.nwf.ControllerInputContainer.call(this, nwfWiiRemote, {
            accelerometer: enchant.nwf.IMWiiRemoteAccelerometer,
            gyroscope: enchant.nwf.IMWiiRemoteGyroscope,
            buttons: enchant.nwf.IMWiiRemoteButton,
            pointer: enchant.nwf.IMWiiRemoteDPD
        });

        this.mode = enchant.nwf.WiiRemoteInput.MODE_FULL;

        this.vibrator = new enchant.nwf.Vibrator(nwfWiiRemote);

        this._addManager('batteryLevel', enchant.nwf.IMBatteryLevel, nwfWiiRemote, this);

        this._bounds = [ this ];
        this.extension = null;

        this._addExtensionListener(nwfWiiRemote);
        this._dispatchExtensionConnectedEvent(nwfWiiRemote);
    },
    /**
     * Adds EventTarget to the recipients of notifications of WiiRemoteInput input changes.
     * @param {enchant.EventTarget} eventTarget The EventTarget you want to add.
     */
    bindTo: function(eventTarget) {
        enchant.nwf.ControllerInputContainer.prototype.bindTo.call(this, eventTarget);

        if (this._bounds.indexOf(eventTarget) === -1) {
            this._bounds.push(eventTarget);
        }
    },
    /**
     * Deletes EventTarget from the recipients of notifications of WiiRemoteInput input changes.
     * @param {enchant.EventTarget} eventTarget The EventTarget you want to delete.
     */
    unbindFrom: function(eventTarget) {
        enchant.nwf.ControllerInputContainer.prototype.unbindFrom.call(this, eventTarget);

        var i;
        if ((i = this._bounds.indexOf(eventTarget)) !== -1) {
            this._bounds.splice(i, 1);
        }
    },
    /**
     * Calibrates the gyro sensor.
     * @param {Number} [retry=0] Number of retry attempts if calibration fails.
     * @return {enchant.Deferred} Deferred object to start after calibration.
     * @private
     */
    calibrate: function(retry) {
        return this._managers.gyroscope.calibrate(retry);
    },
    _dispatchEventToBounds: function(evt) {
        this._bounds.forEach(function(bound) {
            bound.dispatchEvent(evt);
        });
    },
    _attachExtension: function(nwfWiiRemote, nwfExtensionController) {
        if (this.extension) {
            return;
        }
        var ExtensionControllerInput, e;
        switch (nwfExtensionController.type) {
            case nwf.input.ControllerType.NUNCHUK:
                ExtensionControllerInput = enchant.nwf.NunchukInput;
                break;
            case nwf.input.ControllerType.CLASSIC:
                ExtensionControllerInput = enchant.nwf.ClassicControllerInput;
                break;
            default:
                return;
        }

        e = new enchant.Event(enchant.Event.EXTENSIONCONTROLLER_CONNECTED);

        this.extension = e.extension = new ExtensionControllerInput(nwfExtensionController);

        this._dispatchEventToBounds(e);
    },
    /**
     * Specifies the direction of rotation for the +Control Pad.
     * @type {Number}
     * @type Number
     */
    directionRotation: {
        get: function() {
            return this._managers.buttons.rotation;
        },
        set: function(rotation) {
            this._managers.buttons.rotation = rotation;
        }
    },
    /**
     * Specifies the up/down inversion of the +Control Pad.
     * @type {Boolean}
     * @type Boolean
     */
    directionInversion: {
        get: function() {
            return this._managers.buttons.inversion;
        },
        set: function(inversion) {
            this._managers.buttons.inversion = inversion;
        }
    },
    /**
     * WiiRemote operation mode.
     * Corresponds to nwf.input.WiiRemote#mode.
     * The default value is {@link enchant.nwf.WiiRemoteInput.MODE_FULL}.
     * @type Number
     */
    mode: {
        get: function() {
            return this._nwfController.mode;
        },
        set: function(mode) {
            this._nwfController.mode = mode;
        }
    },
    _detachExtension: function() {
        if (!this.extension) {
            return;
        }
        this.extension.remove();
        this.extension = null;

        this._dispatchEventToBounds(new enchant.Event(enchant.Event.EXTENSIONCONTROLLER_DISCONNECTED));
    },
    _addExtensionListener: function(nwfWiiRemote) {
        nwfWiiRemote.addEventListener(nwf.events.ControllerEvent.EXTENSION_CONTROLLER_ADDED, function(e) {
            this._attachExtension(nwfWiiRemote, e.target.extensionController);
        }.bind(this));
        nwfWiiRemote.addEventListener(nwf.events.ControllerEvent.EXTENSION_CONTROLLER_REMOVED, function() {
            this._detachExtension();
        }.bind(this));
    },
    _dispatchExtensionConnectedEvent: function(nwfWiiRemote) {
        if (nwfWiiRemote.extensionController && !this.extension) {
            this._attachExtension(nwfWiiRemote, nwfWiiRemote.extensionController);
        }
    },
    /**
     * Destroys any managers and vibrators held by the object itself in addition to references to the managers.
     * Disconnects and destroys the object when an extension controller is connected.
     * The object no longer operates after this method is called.
     */
    destruct: function() {
        enchant.nwf.ControllerInputContainer.prototype.destruct.call(this);

        this.vibrator.destruct();

        if (this.extension) {
            this.extension.remove();
            this.extension = null;
        }
    }
});
/**
 * A constant that indicates the WiiRemote operation mode.
 * Corresponds to nwf.input.WiiRemote.MODE_LITE.
 * @type Number
 * @static
 * @constant
 */
enchant.nwf.WiiRemoteInput.MODE_LITE = nwf.input.WiiRemote.MODE_LITE;
/**
 * A constant that indicates the WiiRemote operation mode.
 * Corresponds to nwf.input.WiiRemote.MODE_NORMAL.
 * @type Number
 * @static
 * @constant
 */
enchant.nwf.WiiRemoteInput.MODE_NORMAL= nwf.input.WiiRemote.MODE_NORMAL;
/**
 * A constant that indicates the WiiRemote operation mode.
 * Corresponds to nwf.input.WiiRemote.MODE_FULL.
 * @type Number
 * @static
 * @constant
 */
enchant.nwf.WiiRemoteInput.MODE_FULL = nwf.input.WiiRemote.MODE_FULL;

/**
 * @scope enchant.nwf.WiiRemoteManager.prototype
 */
enchant.nwf.WiiRemoteManager = enchant.Class.create(enchant.nwf.ControllerManager, {
    /**
     * @name enchant.nwf.WiiRemoteManager
     * @class
     * Class for managing the Wii Remote.
     * @constructs
     * @extends enchant.nwf.ControllerManager
     */
    initialize: function() {
        enchant.nwf.ControllerManager.call(this, enchant.nwf.IMWiiRemoteConnection, enchant.nwf.WiiRemoteInput, nwf.input.WiiRemote,
            enchant.nwf.WiiRemoteControllersEnumeration);
    }
});

/**
 * @scope enchant.nwf.ISWiiUGamePadConnection.prototype
 */
enchant.nwf.ISWiiUGamePadConnection = enchant.Class.create(enchant.nwf.ISControllerConnection, {
    /**
     * @name enchant.nwf.ISWiiUGamePadConnection
     * @class
     * A class that wraps Wii U GamePad connections.
     * @param {Number} id ID defined in nwf.input.WiiUGamePad.
     * @constructs
     * @extends enchant.nwf.ISControllerConnection
     */
    initialize: function(id) {
        enchant.nwf.ISControllerConnection.call(this, id);
    }
});
/**
 * List of generated ISWiiUGamePadConnection objects.
 * @type enchant.nwf.ISWiiUGamePadConnection[]
 * @static
 */
enchant.nwf.ISWiiUGamePadConnection.instances = enchant.nwf.WiiUGamePadControllersEnumeration.map(function(constant) {
    return new enchant.nwf.ISWiiUGamePadConnection(constant);
});

/**
 * @scope enchant.nwf.ISWiiUGamePadButton.prototype
 */
enchant.nwf.ISWiiUGamePadButton = enchant.Class.create(enchant.nwf.ISButton, {
    /**
     * @name enchant.nwf.ISWiiUGamePadButton
     * @class
     * An InputSource that wraps input from the buttons on the Wii U GamePad.
     * @param {Number} id IDs for the controller buttons defined in nwf.input.ControllerButton.
     * @constructs
     * @extends enchant.nwf.ISButton
     */
    initialize: function(id) {
        enchant.nwf.ISButton.call(this, id);
    }
});

/**
 * @scope enchant.nwf.IMWiiUGamePadConnection.prototype
 */
enchant.nwf.IMWiiUGamePadConnection = enchant.Class.create(enchant.nwf.IMControllerConnection, {
    /**
     * @name enchant.nwf.IMWiiUGamePadConnection
     * @class
     * A class that manages Wii U GamePad connections.
     * @param {*} flagStore An object that stores connection states.
     * @param {nwf.input.WiiUGamePad[]} nwfWiiUGamePadControllers The array of NWF WiiUGamePad objects to monitor.
     * @param {*} [source=this] The input source to add to the event.
     * @constructs
     * @extends enchant.nwf.IMControllerConnection
     */
    initialize: function(flagStore, nwfWiiUGamePadControllers, source) {
        enchant.nwf.IMControllerConnection.call(this, flagStore, enchant.nwf.ISWiiUGamePadConnection,
            nwfWiiUGamePadControllers, 'wiiugamepad', source);
    }
});

/**
 * @scope enchant.nwf.IMWiiUGamePadButton.prototype
 */
enchant.nwf.IMWiiUGamePadButton = enchant.Class.create(enchant.nwf.IMRotatableButton, {
    /**
     * @name enchant.nwf.IMWiiUGamePadButton
     * @class
     * Class that manages inputs from the buttons on the Wii Remote.
     * @param {*} flagStore The object that stores the input values.
     * @param {nwf.input.WiiUGamePad} nwfWiiUGamePad NWF WiiUGamePad object.
     * @param {enchant.nwf.WiiUGamePadInput} source WiiUGamePadInput object to associate.
     * @constructs
     * @extends enchant.nwf.IMRotatableButton
     */
    initialize: function(flagStore, nwfWiiUGamePad, source) {
        enchant.nwf.IMRotatableButton.call(this, flagStore, nwfWiiUGamePad,
            enchant.nwf.ISWiiUGamePadButton.createInstances(enchant.nwf.WiiUGamePadButtonsEnumeration),
            enchant.nwf.WiiUGamePadDirectionButtonsEnumeration,
            [ 'a', 'b', 'down', 'l', 'left', 'lstick', 'minus', 'plus', 'power', 'r', 'right', 'rstick', 'sync', 'up', 'x', 'y', 'zl', 'zr' ], source);
    }
});

/**
 * @scope enchant.nwf.IMWiiUGamePadStick.prototype
 */
enchant.nwf.IMWiiUGamePadStick = enchant.Class.create(enchant.nwf.IMStick, {
    /**
     * @name enchant.nwf.IMWiiUGamePadStick
     * @class
     * Class for managing the sticks on the Wii U GamePad.
     * @param {*} valueStore The object that stores the input values.
     * @param {nwf.input.WiiUGamePad} nwfController NWF WiiUGamePad object.
     * @param {enchant.nwf.WiiUGamePadInput} source WiiUGamePadInput object to associate.
     * @constructs
     * @extends enchant.nwf.IMStick
     */
    initialize: function(valueStore, nwfController, stickName, source) {
        enchant.nwf.IMStick.call(this, valueStore, nwfController, stickName, source);
    }
});

/**
 * @scope enchant.nwf.IMWiiUGamePadLStick.prototype
 */
enchant.nwf.IMWiiUGamePadLStick = enchant.Class.create(enchant.nwf.IMWiiUGamePadStick, {
    /**
     * @name enchant.nwf.IMWiiUGamePadLStick
     * @class
     * Class for managing the left stick on the Wii U GamePad.
     * @param {*} valueStore The object that stores the input values.
     * @param {nwf.input.WiiUGamePad} nwfController NWF WiiUGamePad object.
     * @param {enchant.nwf.WiiUGamePadInput} source WiiUGamePadInput object to associate.
     * @constructs
     * @extends enchant.nwf.IMWiiUGamePadStick
     */
    initialize: function(valueStore, nwfController, source) {
        enchant.nwf.IMWiiUGamePadStick.call(this, valueStore, nwfController, 'leftStick', source);
    }
});

/**
 * @scope enchant.nwf.IMWiiUGamePadRStick.prototype
 */
enchant.nwf.IMWiiUGamePadRStick = enchant.Class.create(enchant.nwf.IMWiiUGamePadStick, {
    /**
     * @name enchant.nwf.IMWiiUGamePadRStick
     * @class
     * Class for managing the right stick on the Wii U GamePad.
     * @param {*} valueStore The object that stores the input values.
     * @param {nwf.input.WiiUGamePad} nwfController NWF WiiUGamePad object.
     * @param {enchant.nwf.WiiUGamePadInput} source WiiUGamePadInput object to associate.
     * @constructs
     * @extends enchant.nwf.IMWiiUGamePadStick
     */
    initialize: function(valueStore, nwfController, source) {
        enchant.nwf.IMWiiUGamePadStick.call(this, valueStore, nwfController, 'rightStick', source);
    }
});

/**
 * @scope enchant.nwf.IMWiiUGamePadAccelerometer.prototype
 */
enchant.nwf.IMWiiUGamePadAccelerometer = enchant.Class.create(enchant.nwf.IMAccelerometer, {
    /**
     * @name enchant.nwf.IMWiiUGamePadAccelerometer
     * @class
     * Class for managing the accelerometers on the Wii U GamePad.
     * @param {*} valueStore The object that stores the input values.
     * @param {nwf.input.WiiUGamePad} nwfController NWF WiiUGamePad object.
     * @param {enchant.nwf.WiiUGamePadInput} source WiiUGamePadInput object to associate.
     * @constructs
     * @extends enchant.nwf.IMAccelerometer
     */
    initialize: function(valueStore, nwfController, source) {
        enchant.nwf.IMAccelerometer.call(this, valueStore, nwfController, source);
    }
});

/**
 * @scope enchant.nwf.IMWiiUGamePadGyroscope.prototype
 */
enchant.nwf.IMWiiUGamePadGyroscope = enchant.Class.create(enchant.nwf.IMGyroscope, {
    /**
     * @name enchant.nwf.IMWiiUGamePadGyroscope
     * @class
     * Class for managing the gyro sensors on the Wii U GamePad.
     * @param {*} valueStore The object that stores the input values.
     * @param {nwf.input.WiiUGamePad} nwfController NWF WiiUGamePad object.
     * @param {enchant.nwf.WiiUGamePadInput} source WiiUGamePadInput object to associate.
     * @constructs
     * @extends enchant.nwf.IMGyroscope
     */
    initialize: function(valueStore, nwfController, source) {
        enchant.nwf.IMGyroscope.call(this, valueStore, nwfController, source);
    }
});

/**
 * @scope enchant.nwf.WiiUGamePadInput.prototype
 */
enchant.nwf.WiiUGamePadInput = enchant.Class.create(enchant.nwf.ControllerInputContainer, {
    /**
     * @name enchant.nwf.WiiUGamePadInput
     * @class
     * A class that collects Wii U GamePad inputs.
     * @param {nwf.input.WiiUGamePad} nwfWiiUGamePad NWF WiiUGamePad object.
     * @constructs
     * @extends enchant.nwf.ControllerInputContainer
     */
    initialize: function(nwfWiiUGamePad) {
        enchant.nwf.ControllerInputContainer.call(this, nwfWiiUGamePad, {
            accelerometer: enchant.nwf.IMWiiUGamePadAccelerometer,
            gyroscope: enchant.nwf.IMWiiUGamePadGyroscope,
            lstick: enchant.nwf.IMWiiUGamePadLStick,
            rstick: enchant.nwf.IMWiiUGamePadRStick,
            buttons: enchant.nwf.IMWiiUGamePadButton
        });

        this.vibrator = new enchant.nwf.Vibrator(nwfWiiUGamePad);

        this._addManager('batteryLevel', enchant.nwf.IMBatteryLevel, nwfWiiUGamePad, this);
    },
    /**
     * Specifies the direction of rotation for the +Control Pad.
     * @type {Number}
     * @type Number
     */
    directionRotation: {
        get: function() {
            return this._managers.buttons.rotation;
        },
        set: function(rotation) {
            this._managers.buttons.rotation = rotation;
        }
    },
    /**
     * Specifies the up/down inversion of the +Control Pad.
     * @type {Boolean}
     * @type Boolean
     */
    directionInversion: {
        get: function() {
            return this._managers.buttons.inversion;
        },
        set: function(inversion) {
            this._managers.buttons.inversion = inversion;
        }
    },
    /**
     * Destroys any managers and vibrators held by the object itself in addition to references to the managers.
     * The object no longer operates after this method is called.
     */
    destruct: function() {
        enchant.nwf.ControllerInputContainer.prototype.destruct.call(this);

        this.vibrator.destruct();
    }
});

/**
 * @scope enchant.nwf.WiiUGamePadManager.prototype
 */
enchant.nwf.WiiUGamePadManager = enchant.Class.create(enchant.nwf.ControllerManager, {
    /**
     * @name enchant.nwf.WiiUGamePadManager
     * @class
     * Class for managing the WiiU GamePad.
     * @constructs
     * @extends enchant.nwf.ControllerManager
     */
    initialize: function() {
        enchant.nwf.ControllerManager.call(this, enchant.nwf.IMWiiUGamePadConnection, enchant.nwf.WiiUGamePadInput, nwf.input.WiiUGamePad,
            enchant.nwf.WiiUGamePadControllersEnumeration);
    }
});

/**
 * @scope enchant.nwf.VirtualScreen.prototype
 */
enchant.nwf.VirtualScreen = enchant.Class.create(enchant.Group, {
    /**
     * @name enchant.nwf.VirtualScreen
     * @class
     * Group that collects objects to display as a virtual screen.
     * It has a feature for rendering itself and its children to the HTML Canvas element.
     * @constructs
     * @extends enchant.Group
     */
    initialize: function(width, height) {
        enchant.Group.call(this);
        /**
         * Screen width.
         * @type Number
         */
        this.width = width;
        /**
         * Screen height.
         * @type Number
         */
        this.height = height;

        this._colorManager = new enchant.DetectColorManager(16, 256);

        var layer = this;

        function onchildadded(e) {
            var child = e.node;
            enchant.CanvasLayer._attachCache(child, layer, onchildadded, onchildremoved);
        }

        function onchildremoved(e) {
            var child = e.node;
            enchant.CanvasLayer._detachCache(child, layer, onchildadded, onchildremoved);
        }

        this.addEventListener(enchant.Event.CHILD_ADDED, onchildadded);
        this.addEventListener(enchant.Event.CHILD_REMOVED, onchildremoved);

        enchant.Core.instance.addEventListener(enchant.Event.ENTER_FRAME, function(e) {
            var push = Array.prototype.push;
            var nodes = this.childNodes.slice();
            var node;
            while (nodes.length) {
                node = nodes.pop();
                node.age++;
                node.dispatchEvent(e);
                if (node.childNodes) {
                    push.apply(nodes, node.childNodes);
                }
            }
        }.bind(this));
    },
    /**
     * Renders itself and its children.
     * @param {CanvasRenderingContext2D} context Rendering context.
     */
    render: function(context) {
        context.clearRect(0, 0, this.width, this.height);
        enchant.CanvasRenderer.instance.render(context, this, new enchant.Event(enchant.Event.RENDER));
    }
});

/**
 * @scope enchant.nwf.TVScreen.prototype
 */
enchant.nwf.TVScreen = enchant.Class.create(enchant.EventTarget, {
    /**
     * @name enchant.nwf.TVScreen
     * @class
     * Class for controlling the video output to the TV.
     * If the screen size is omitted, video is stretched across the entire TV screen.
     * It can duplicate the enchant-stage rendering results.
     * It can also output overlaid rendering results that are independent of the enchant-stage.
     * Because the rendering results to the {@link enchant.CanvasLayer} for each scene are only copied, DOM rendering is not supported.
     * @param {String} canvasId The ID of the HTMLCanvasElement retrieved from the HTML on the TV.
     * @param {Number} [width] Screen width.
     * @param {Number} [height] Screen height.
     * @constructs
     * @extends enchant.EventTarget
     */
    initialize: function(canvasId, width, height) {
        enchant.EventTarget.call(this);
        /**
         * The HTMLCanvasElement that renders the video for the TV.
         * @type HTMLCanvasElement
         */
        this._element = enchant.nwf.TVScreen.getGlobalObject().document.getElementById(canvasId);
        /**
         * The context for the HTMLCanvasElement that renders the video for the TV.
         * @type CanvasRenderingContext2D
         */
        this.context = this._element.getContext('2d');

        /**
         * Renderer that duplicates the scene rendering.
         * @type enchant.nwf.MirroringRenderer
         */
        this.mirroringRenderer = new enchant.nwf.MirroringRenderer();

        var metrics;
        if (typeof width === 'number') {
            this.width = width;
            this.height = height;
        } else {
            metrics = enchant.nwf.TVScreen.calculateResolution(enchant.nwf.STRETCH);
            this.width = metrics.width;
            this.height = metrics.height;
        }
        /**
         * VirtualScreen that holds Entity.
         * @type enchant.nwf.VirtualScreen
         */
        this._virtualScreen = new enchant.nwf.VirtualScreen(this.width, this.height);

        this._virtualScreen.cvsRender = function() {
            if (this.mirroring) {
                this.mirroringRenderer.render(this._element, this.context, this.width, this.height);
            }
        }.bind(this);

        /**
         * Flag indicating whether to duplicate the scene.
         * @type Boolean
         */
        this.mirroring = false;

        this._renderHandler = function(e) {
            this._renderFunc(e);
        }.bind(this);

        this.startRendering();
    },
    /**
     * How to duplicate the scene.
     * {@link enchant.nwf.TVScreen.FIT} or {@link enchant.nwf.TVScreen.FILL} or {@link enchant.nwf.TVScreen.STRETCH} can be specified.
     * @type String
     */
    mirroringType: {
        get: function() {
            return this.mirroringRenderer.renderingType;
        },
        set: function(type) {
            this.mirroringRenderer.renderingType = type;
        }
    },
    /**
     * Screen width.
     * @type Number
     */
    width: {
        get: function() {
            return this._width;
        },
        set: function(width) {
            this._width = this._element.width = width;
        }
    },
    /**
     * Screen height.
     * @type Number
     */
    height: {
        get: function() {
            return this._height;
        },
        set: function(height) {
            this._height = this._element.height = height;
        }
    },
    /**
     * List of child entities.
     * @type enchant.Node[]
     */
    childNodes: {
        get: function() {
            return this._virtualScreen.childNodes;
        },
        set: function(childNodes) {
            this._virtualScreen.childNodes = childNodes;
        }
    },
    /**
     * First child node.
     * @type enchant.Node
     */
    firstChild: {
        get: function() {
            return this._virtualScreen.firstChild;
        }
    },
    /**
     * Last child node.
     * @type enchant.Node
     */
    lastChild: {
        get: function() {
            return this._virtualScreen.lastChild;
        }
    },
    /**
     * Adds a child node.
     * @param {enchant.Node} node The node to add.
     */
    addChild: function() {
        return enchant.Group.prototype.addChild.apply(this._virtualScreen, arguments);
    },
    /**
     * Deletes a child node.
     * @param {enchant.Node} node The node to delete.
     */
    removeChild: function() {
        return enchant.Group.prototype.removeChild.apply(this._virtualScreen, arguments);
    },
    /**
     * Inserts a child node.
     * @param {enchant.Node} node The node to insert.
     * @param {enchant.Node} [reference] The node prior to the insertion position.
     */
    insertBefore: function() {
        return enchant.Group.prototype.insertBefore.apply(this._virtualScreen, arguments);
    },
    /**
     * Starts screen rendering.
     */
    startRendering: function() {
        enchant.Core.instance.addEventListener(enchant.Event.EXIT_FRAME, this._renderHandler);
    },
    /**
     * Stops screen rendering.
     */
    stopRendering: function() {
        enchant.Core.instance.removeEventListener(enchant.Event.EXIT_FRAME, this._renderHandler);
    },
    _renderFunc: function() {
        this._virtualScreen.render(this.context);
    }
});
/**
 * Constant that specifies a rectangle that fits within the region while maintaining the aspect ratio.
 * Used for either {@link enchant.nwf.TVScreen.calculateResolution} or {@link enchant.nwf.TVScreen#mirroringType}.
 * @type String
 * @static
 * @constant
 */
enchant.nwf.TVScreen.FIT = 'fit';
/**
 * Constant that specifies a rectangle that completely fills the area while maintaining the aspect ratio.
 * Used for either {@link enchant.nwf.TVScreen.calculateResolution} or {@link enchant.nwf.TVScreen#mirroringType}.
 * @type String
 * @static
 * @constant
 */
enchant.nwf.TVScreen.FILL = 'fill';
/**
 * Constant that specifies a rectangle that completely fills the area while not maintaining the aspect ratio.
 * Used for either {@link enchant.nwf.TVScreen.calculateResolution} or {@link enchant.nwf.TVScreen#mirroringType}.
 * @type String
 * @static
 * @constant
 */
enchant.nwf.TVScreen.STRETCH = 'stretch';
/**
 * Generates and returns a TVScreen with the mirroring settings.
 * @param {String} canvasId The ID of the HTMLCanvasElement retrieved from the HTML on the TV.
 * @param {String} [type] Rectangle type.
 * @param {*} [rect] Object that holds the width and height values as the width and height properties.
 * @return {enchant.nwf.TVScreen} The object that was generated.
 * @static
 */
enchant.nwf.TVScreen.createMirroringScreen = function(canvasId, type, rect) {
    var metrics = enchant.nwf.TVScreen.calculateResolution(type, rect);
    var screen = new enchant.nwf.TVScreen(canvasId, metrics.width, metrics.height);
    screen.mirroringType = type;
    screen.mirroring = true;
    return screen;
};
/**
 * Gets the global object for the HTML on the TV.
 * @return {Window} The global object for the HTML on the TV.
 * @static
 */
enchant.nwf.TVScreen.getGlobalObject = function() {
    return nwf.display.DisplayManager.getInstance().getTVDisplay().window;
};
/**
 * Utility method the calculates a screen size that matches the size of the HTML on the TV according to the arguments.
 * The first argument can be {@link enchant.nwf.TVScreen.FIT} or {@link enchant.nwf.TVScreen.FILL} or {@link enchant.nwf.TVScreen.STRETCH}.
 * @param {String} [type] Rectangle type.
 * @param {*} [rect] Object that holds the width and height values as the width and height properties.
 * @return {Object} Object that holds the width and height values as the width and height properties.
 * @static
 */
enchant.nwf.TVScreen.calculateResolution = function(type, rect) {
    var scale, width, height,
        nwfTVDisplay = nwf.display.DisplayManager.getInstance().getTVDisplay();
    if (type === enchant.nwf.TVScreen.FIT && rect) {
        scale = Math.min(nwfTVDisplay.width / rect.width, nwfTVDisplay.height / rect.height);
        width = Math.floor(rect.width * scale);
        height = Math.floor(rect.height * scale);
    } else {
        width = nwfTVDisplay.width;
        height = nwfTVDisplay.height;
    }
    return {
        width: width,
        height: height
    };
};

/**
 * @scope enchant.nwf.MirroringRenderer.prototype
 */
enchant.nwf.MirroringRenderer = enchant.Class.create({
    /**
     * @name enchant.nwf.MirroringRenderer
     * @class
     * Renderer that duplicates the enchant-stage rendering results.
     * Only the rendering results to the {@link enchant.CanvasLayer} for each scene are copied.
     * @constructs
     */
    initialize: function() {
        this.renderingType = enchant.nwf.TVScreen.STRETCH;
    },
    /**
     * Indicates the method for rendering mirroring.
     * @type String
     */
    renderingType: {
        get: function() {
            return this._renderingType;
        },
        set: function(type) {
            this._renderingType = type;
            var renderFunc = this['_' + type + 'Render'];
            this._currentRenderFunc = renderFunc;
        }
    },
    _fillRender: function(context, scenes, coreWidth, coreHeight, screenWidth, screenHeight) {
        var i, l, scene, cvsLayer,
            sw = screenWidth / coreWidth,
            sh = screenHeight / coreHeight,
            s = Math.max(sw, sh),
            clipWidth = ~~(screenWidth / s),
            clipHeight = ~~(screenHeight / s),
            ox = (coreWidth - clipWidth) >> 1,
            oy = (coreHeight - clipHeight) >> 1;

        for (i = 0, l = scenes.length; i < l; i++) {
            scene = scenes[i];
            cvsLayer = scene._layers.Canvas;

            if (scene.backgroundColor) {
                context.fillStyle = scene.backgroundColor;
                context.fillRect(0, 0, screenWidth, screenHeight);
            }
            if (cvsLayer) {
                context.drawImage(cvsLayer._element, ox, oy, clipWidth, clipHeight, 0, 0, screenWidth, screenHeight);
            }
        }
    },
    _fitRender: function(context, scenes, coreWidth, coreHeight, screenWidth, screenHeight) {
        var i, l, scene, cvsLayer,
            sw = screenWidth / coreWidth,
            sh = screenHeight / coreHeight,
            s = Math.min(sw, sh),
            destWidth = ~~(coreWidth * s),
            destHeight = ~~(coreHeight * s),
            ox = (screenWidth - destWidth) >> 1,
            oy = (screenHeight - destHeight) >> 1;

        for (i = 0, l = scenes.length; i < l; i++) {
            scene = scenes[i];
            cvsLayer = scene._layers.Canvas;

            if (scene.backgroundColor) {
                context.fillStyle = scene.backgroundColor;
                context.fillRect(ox, oy, destWidth, destHeight);
            }
            if (cvsLayer) {
                context.drawImage(cvsLayer._element, 0, 0, coreWidth, coreHeight, ox, oy, destWidth, destHeight);
            }
        }
    },
    _stretchRender: function(context, scenes, coreWidth, coreHeight, width, height) {
        var i, l, scene, cvsLayer;
        for (i = 0, l = scenes.length; i < l; i++) {
            scene = scenes[i];
            cvsLayer = scene._layers.Canvas;

            if (scene.backgroundColor) {
                context.fillStyle = scene.backgroundColor;
                context.fillRect(0, 0, width, height);
            }
            if (cvsLayer) {
                context.drawImage(cvsLayer._element, 0, 0, coreWidth, coreHeight, 0, 0, width, height);
            }
        }
    },
    /**
     * Renders mirroring.
     * @param {HTMLCanvasElement} element The Canvas element.
     * @param {CanvasRenderingContext2D} context context.
     * @param {Number} screenWidth Screen width.
     * @param {Number} screenHeight Screen height.
     */
    render: function(element, context, screenWidth, screenHeight) {
        var core = enchant.Core.instance,
            scenes = core._scenes,
            coreWidth = core.width,
            coreHeight = core.height;

        context.clearRect(0, 0, screenWidth, screenHeight);

        this._currentRenderFunc(context, scenes, coreWidth, coreHeight, screenWidth, screenHeight);
    }
});

/**
 * @scope enchant.nwf.FSRef.prototype
 */
enchant.nwf.FSRef = enchant.Class.create({
    /**
     * @name enchant.nwf.FSRef
     * @class
     * An object with properties that reference the children of the node representing the object itself.
     * @param {enchant.nwf.FSNode} The target node.
     * @constructs
     */
    initialize: function(fsNode) {
        (fsNode.isDirectory ? fsNode.ls() : []).forEach(function(node) {
            this[node.name] = new enchant.nwf.FSRef(node);
        }, this);
        /**
         * The node representing the object itself.
         * @type enchant.nwf.FSNode
         */
        this.to = fsNode;
    }
});

/**
 * @scope enchant.nwf.FSNode.prototype
 */
enchant.nwf.FSNode = enchant.Class.create(enchant.EventTarget, {
    /**
     * @name enchant.nwf.FSNode
     * @class
     * Node representing a directory or file on the file system.
     * @property {Boolean} isDirectory Indicates whether the node is a directory.
     * @property {Boolean} isFile Indicates whether the node is a file.
     * @param {String} name The node name.
     * @param {nwf.io.Directory|nwf.io.File} nwfIOEntry NWF io object that is the target of operations.
     * @param {enchant.nwf.FSDirectoryNode} parent Node of the parent directory.
     * @constructs
     * @extends enchant.EventTarget
     */
    initialize: function(name, nwfIOEntry, parent) {
        enchant.EventTarget.call(this);
        this.name = name;
        this._nwfIOEntry = nwfIOEntry;
        this._parent = parent;
    },
    /**
     * Node of the parent directory.
     * @type enchant.nwf.FSDirectoryNode
     */
    parent: {
        get: function() {
            return this._parent;
        }
    },
    /**
     * Node of the root directory.
     * @type enchant.nwf.FSRootDirectoryNode
     */
    root: {
        get: function() {
            return this.parent.root;
        }
    },
    /**
     * Changes the file or directory name.
     * @param name New name.
     * @return {enchant.nwf.FSNode} The object itself.
     */
    rename: function(name) {
        this._nwfIOEntry.rename(name);
        this.name = name;
        return this;
    },
    /**
     * Deletes a file or directory.
     */
    remove: function() {
        this.parent._nwfIOEntry.remove(this.name);
        this.parent._removeEntry(this);
    },
    /**
     * Destroys references to the NWF io object and its parents.
     * The object no longer operates after this method is called.
     * Normally called automatically from {@link enchant.nwf.FSRootDirectoryNode#destruct}.
     */
    destruct: function() {
        this.clearEventListener();

        delete this._nwfIOEntry;
        delete this._parent;
    }
});

/**
 * @scope enchant.nwf.FSFileNode.prototype
 */
enchant.nwf.FSFileNode = enchant.Class.create(enchant.nwf.FSNode, {
    /**
     * @name enchant.nwf.FSFileNode
     * @class
     * Node representing a file on the file system.
     * @param {String} name Filename.
     * @param {nwf.io.File} nwfFile NWF file that is the target of operations.
     * @param {enchant.nwf.FSDirectoryNode} parent Node of the parent directory.
     * @constructs
     * @extends enchant.nwf.FSNode
     */
    initialize: function(name, nwfFile, parent) {
        enchant.nwf.FSNode.call(this, name, nwfFile, parent);
    },
    isDirectory: {
        get: function() {
            return false;
        }
    },
    isFile: {
        get: function() {
            return true;
        }
    },
    /**
     * Indicates whether the file exists.
     * @type Boolean
     */
    exists: {
        get: function() {
            return this._nwfIOEntry.exists;
        }
    },
    /**
     * Actual path to the directory on the file system.
     * @type String
     */
    path: {
        get: function() {
            return this.parent.path + this.name;
        }
    },
    /**
     * Writes the file.
     * @param {Blob} blob The data to write.
     * @return {enchant.Deferred} The Deferred object that starts when file writing ends.
     */
    write: function(blob) {
        var deferred = this._createFileProcessDeferred();
        this._nwfIOEntry.save(blob);
        return deferred;
    },
    /**
     * Loads the file.
     * @return {enchant.Deferred} The Deferred object that starts when file loading ends.
     */
    read: function() {
        var deferred = this._createFileProcessDeferred();
        this._nwfIOEntry.read();
        return deferred;
    },
    _createFileProcessDeferred: function() {
        var deferred = new enchant.Deferred(),
            nwfIOEntry = this._nwfIOEntry,
            that = this;

        function onsuccess(e) {
            var evt = new enchant.Event(enchant.Event.FILE_PROCESS_SUCCESS);
            evt.data = e.data;
            that.dispatchEvent(evt);
            deferred.call(e.data);
            removeListeners();
        }

        function onfailure(e) {
            var evt = new enchant.Event(enchant.Event.FILE_PROCESS_FAILURE);
            evt.errorID = e.errorID;
            that.dispatchEvent(evt);
            deferred.fail(e.errorID);
            removeListeners();
        }

        function removeListeners() {
            nwfIOEntry.removeEventListener(nwf.events.IOEvent.READ_COMPLETE, onsuccess);
            nwfIOEntry.removeEventListener(nwf.events.IOEvent.SAVE_COMPLETE, onsuccess);
            nwfIOEntry.removeEventListener(nwf.events.IOEvent.ERROR, onfailure);
        }

        this._nwfIOEntry.addEventListener(nwf.events.IOEvent.READ_COMPLETE, onsuccess);
        this._nwfIOEntry.addEventListener(nwf.events.IOEvent.SAVE_COMPLETE, onsuccess);
        this._nwfIOEntry.addEventListener(nwf.events.IOEvent.ERROR, onfailure);

        return deferred;
    }
});
/**
 * Splits the filename into an identifier and a filename extension and returns both.
 * @param {String} fileName Filename.
 * @return {String[]} [file identifier, filename extension]
 */
enchant.nwf.FSFileNode.splitFileName = function(fileName) {
    return (fileName.match(/(.+)\.(\w+)$/) || [ null, fileName, '' ]).slice(1);
};
/**
 * Connects the file identifier to the filename extension and returns it.
 * @param {String} name Identifier.
 * @param {String} ext Filename extension.
 * @return {String} Filename.
 */
enchant.nwf.FSFileNode.joinFileName = function(name, ext) {
    return name + (ext ? '.' : '') + ext;
};

/**
 * @scope enchant.nwf.FSDirectoryNode.prototype
 */
enchant.nwf.FSDirectoryNode = enchant.Class.create(enchant.nwf.FSNode, {
    /**
     * @name enchant.nwf.FSDirectoryNode
     * @class
     * Node representing the directory in the file system.
     * @param {String} name Directory name.
     * @param {nwf.io.Directory} nwfFile NWF directory object that is the target of investigation.
     * @param {enchant.nwf.FSDirectoryNode} parent Node of the parent directory.
     * @constructs
     * @extends enchant.nwf.FSNode
     */
    initialize: function(name, nwfDirectory, parent) {
        enchant.nwf.FSNode.call(this, name, nwfDirectory, parent);
        this._dirEntries = [];
        this._fileEntries = [];
    },
    isDirectory: {
        get: function() {
            return true;
        }
    },
    isFile: {
        get: function() {
            return false;
        }
    },
    /**
     * Actual path to the directory in the file system.
     * @type String
     */
    path: {
        get: function() {
            return this.parent.path + this.name + '/';
        }
    },
    /**
     * Returns a list of the nodes that are children of the object.
     * @return {enchant.nwf.FSNode[]} List of children.
     */
    ls: function() {
        return this._dirEntries.concat(this._fileEntries);
    },
    /**
     * Creates child directories.
     * @param {String} name Directory name.
     * @return {enchant.nwf.FSDirectoryNode} The created directory.
     */
    mkdir: function(name) {
        return this._addEntry(new enchant.nwf.FSDirectoryNode(name, this._nwfIOEntry.create(name), this));
    },
    /**
     * Recursively creates child directories.
     * @param {String} path Relative path of the directory.
     * @return {enchant.nwf.FSDirectoryNode} The directory that was created last.
     */
    mkdirs: function(path) {
        return path.split('/').reduce(function(entry, path) {
            return entry.mkdir(path);
        }, this);
    },
    /**
     * Gets the child node.
     * Returns null when no directories or files exist for the specified name.
     * @param {String} name Name of the child you want to get.
     * @return {enchant.nwf.FSNode} Child node.
     */
    get: function(name) {
        return this._findEntry(this._dirEntries, name) ||
            this._findEntry(this._fileEntries, name);
    },
    /**
     * Searches among multiple FSNodes and returns the one with the specified name.
     * Returns null if no FSNode has the specified name.
     * @param {enchant.nwf.FSNode[]} entries Target FSNode array.
     * @param {String} name Name of the FSNode you want to get.
     * @return {enchant.nwf.FSNode} The FSNode found.
     */
    _findEntry: function(entries, name) {
        var entry;
        for (var i = 0, l = entries.length; i < l; i++) {
            entry = entries[i];
            if (entry.name === name) {
                return entry;
            }
        }
        return null;
    },
    /**
     * Returns a reference object that represents the object itself.
     * @return {enchant.nwf.FSRef} The reference object.
     */
    ref: function() {
        return new enchant.nwf.FSRef(this);
    },
    _addEntry: function(entry) {
        var entries;
        if (entry.isFile) {
            entries = this._fileEntries;
        } else {
            entries = this._dirEntries;
        }
        entries.push(entry);
        return entry;
    },
    _removeEntry: function(entry) {
        var entries, i;
        if (entry.isFile) {
            entries = this._fileEntries;
        } else {
            entries = this._dirEntries;
        }
        i = entries.indexOf(entry);
        if (entry && i !== -1) {
            entries.splice(i, 1);
        }
    },
    /**
     * Creates a new file.
     * @param {String} fileName Name of the file to create.
     * @return {enchant.nwf.FSFileNode} Node representing the file created.
     */
    createFile: function(fileName) {
        return this._addEntry(new enchant.nwf.FSFileNode(fileName, new nwf.io.File(fileName, this._nwfIOEntry), this));
    }
});

/**
 * @scope enchant.nwf.FSRootDirectoryNode.prototype
 */
enchant.nwf.FSRootDirectoryNode = enchant.Class.create(enchant.nwf.FSDirectoryNode, {
    /**
     * @name enchant.nwf.FSRootDirectoryNode
     * @class
     * Node representing the root directory of the file system.
     * @param {String} name Directory name.
     * @param {nwf.io.Directory} nwfDirectory NWF directory object that is the target of operations.
     * @param {String} rootPath Path on the file system.
     * @constructs
     * @extends enchant.nwf.FSDirectoryNode
     */
    initialize: function(name, nwfDirectory, rootPath) {
        enchant.nwf.FSDirectoryNode.call(this, name, nwfDirectory, null);
        this._rootPath = rootPath;

        injectInit(this, [
            'ls', 'mkdir', 'mkdirs', 'get', 'ref',
            'createFile', '_addEntry', '_removeEntry'
        ]);
    },
    path: {
        get: function() {
            return this._rootPath;
        }
    },
    parent: {
        get: function() {
            return this;
        }
    },
    root: {
        get: function() {
            return this;
        }
    },
    /**
     * Execute processes in preparation for the start of file operations.
     * Called automatically when methods that require initialization are called for the first time, such as {@link enchant.nwf.FSDirectoryNode#ls} and {@link enchant.nwf.FSDirectoryNode#get}.
     */
    init: function() {
        (function lsrec(currentNode, nwfDirectory) {
            nwfDirectory.listFiles()
                .map(function(file) {
                    var fileName = enchant.nwf.FSFileNode.joinFileName(file.fileName, file.fileExtension);
                    return new enchant.nwf.FSFileNode(fileName, file, currentNode);
                })
                .forEach(function(fileNode) {
                    currentNode._addEntry(fileNode);
                });
            nwfDirectory.listSubDirectories()
                .map(function(dir) {
                    return new enchant.nwf.FSDirectoryNode(dir.directoryName, dir, currentNode);
                })
                .forEach(function(dirNode) {
                    currentNode._addEntry(dirNode);
                    lsrec(dirNode, dirNode._nwfIOEntry);
                });
        }(this, this._nwfIOEntry));
    },
    rename: function() {
        throw new Error('root directory can not be renamed');
    },
    remove: function() {
        throw new Error('root directory can not be deleted');
    },
    /**
     * Recursively destroys references to the NWF io object and its children.
     * The object no longer operates after this method is called.
     * Normally called automatically by nwf.enchant.js itself.
     */
    destruct: function() {
        (function destructrec(currentNode, childNodes) {
            childNodes
                .filter(function(node) {
                    return node.isFile;
                })
                .forEach(function(node) {
                    currentNode._removeEntry(node);
                    node.destruct();
                });
            childNodes
                .filter(function(node) {
                    return node.isDirectory;
                })
                .forEach(function(node) {
                    currentNode._removeEntry(node);
                    destructrec(node, node.ls());
                    node.destruct();
                });
        }(this, this.ls()));

        this.clearEventListener();

        delete this._nwfIOEntry;
    }
});

/**
 * @scope enchant.nwf.BlobUtil
 */
/**
 * An object that brings together the utility functions for conversions between Blobs and strings or images.
 * @namespace
 * @type Object
 */
enchant.nwf.BlobUtil = {
    /**
     * Creates a Blob from a string.
     * @param {String} string The string you want to convert to a Blob.
     * @param {String} [mime="text/plain"] mimetype.
     * @return {Blob} The Blob created.
     */
    createBlobFromString: function(string, mime) {
        mime = mime || 'text/plain';
        return new Blob([ string ], { type: mime });
    },
    /**
     * Creates a Blob from an HTMLImage.
     * @param {HTMLImageElement} htmlImage The HTMLImageElement you want to convert to a Blob.
     * @return {Blob} The Blob created.
     */
    createBlobFromHTMLImage: function(htmlImage) {
        var cvs = document.createElement('canvas');
        cvs.width = htmlImage.width;
        cvs.height = htmlImage.height;
        cvs.getContext('2d').drawImage(htmlImage, 0, 0);
        return this.createBlobFromCanvas(cvs);
    },
    /**
     * Creates a Blob from a Surface.
     * @param {enchant.Surface} surface The Surface you want to convert to a Blob.
     * @return {Blob} The Blob created.
     */
    createBlobFromSurface: function(surface) {
        return this.createBlobFromCanvas(surface.clone()._element);
    },
    /**
     * Creates a Blob from an HTMLCanvas.
     * @param {HTMLCanvasElement} canvas The HTMLCanvasElement you want to convert to a Blob.
     * @return {Blob} The Blob created.
     */
    createBlobFromCanvas: function(canvas) {
        var i, l,
            rx = /data:(.+\/.+);base64,/,
            data = canvas.toDataURL(),
            bin = atob(data.replace(rx, '')),
            mime = data.match(rx)[1],
            array = new Uint8Array(bin.length),
            buffer = array.buffer;
        for (i = 0, l = array.length; i < l; i++) {
            array[i] = bin.charCodeAt(i);
        }
        return new Blob([ buffer ], { type: mime });
    },
    /**
     * Creates a string from a Blob.
     * @param {Blob} Data.
     * @return {enchant.Deferred} The Deferred object that passes the string that was created to next.
     */
    createStringFromBlob: function(blob) {
        return enchant.Deferred
            .next(function() {
                var d = new enchant.Deferred(),
                    fileReader = new FileReader();
                /** @ignore */
                fileReader.onload = function() {
                    d.call(fileReader.result);
                };
                /** @ignore */
                fileReader.onerror = function(e) {
                    d.fail(e);
                };
                fileReader.readAsText(blob);
                return d;
            });
    },
    /**
     * Creates an HTMLImage from a Blob.
     * @param {Blob} Data.
     * @return {enchant.Deferred} The Deferred object that passes the HTMLImageElement that was created to next.
     */
    createHTMLImageFromBlob: function(blob) {
        return enchant.Deferred
            .next(function() {
                var d = new enchant.Deferred(),
                    fileReader = new FileReader();
                /** @ignore */
                fileReader.onload = function() {
                    d.call(fileReader.result);
                };
                /** @ignore */
                fileReader.onerror = function(e) {
                    d.fail(e);
                };
                fileReader.readAsDataURL(blob);
                return d;
            })
            .next(function(result) {
                var d = new enchant.Deferred(),
                    image = new Image();
                image.onload = function() {
                    d.call(image);
                };
                image.onerror = function(e) {
                    d.fail(e);
                };
                image.src = result;
                return d;
            });
    },
    /**
     * Creates a Surface from a Blob.
     * @param {Blob} Data.
     * @return {enchant.Deferred} The Deferred object that passes the Surface that was created to next.
     */
    createSurfaceFromBlob: function(blob) {
        return this.createHTMLImageFromBlob(blob)
            .next(function(image) {
                var sf = new enchant.Surface(image.width, image.height);
                sf.context.drawImage(image, 0, 0);
                return sf;
            });
    },
    /**
     * Creates an HTMLCanvas from a Blob.
     * @param {Blob} Data.
     * @return {enchant.Deferred} The Deferred object that passes the HTMLCanvasElement that was created to next.
     */
    createCanvasFromBlob: function(blob) {
        return this.createHTMLImageFromBlob(blob)
            .next(function(image) {
                var cvs = document.createElement('canvas');
                cvs.width = image.width;
                cvs.height = image.height;
                cvs.getContext('2d').drawImage(image, 0, 0);
                return cvs;
            });
    }
};

// borrowed from nwf io example
if (typeof window.Blob !== 'function') {
    /**#nocode+*/
    /**
     * Wrap a Blob object inside a function to turn it into a constructor, using the *deprecated* BlobBuilder object.
     * @param {Array} blobParts     An Array of data objects to put into the new Blob object. This can be any number of ArrayBuffer, ArrayBufferView (typed array), Blob, or DOMString objects, in any order.
     * @param {Object} options      An object that provides the properties for the new Blob. Used to specify type, eg 'text\/html' or 'application/octet-binary'
     * @see http://www.w3.org/TR/FileAPI/#dfn-Blob
     * @see https://developer.mozilla.org/en-US/docs/DOM/Blob
     */
    window.Blob = function(blobParts, options) {
        var type = options ? (options.type || '') : '';
        var builder = new window.WebKitBlobBuilder();
        if (blobParts) {
            for (var i = 0; i < blobParts.length; i++) {
                builder.append(blobParts[i]);
            }
        }
        // returns an actual Blob object, so now we can use 'new Blob()'
        return builder.getBlob(type);
    };
    /**#nocode-*/
}

/**
 * @scope enchant.nwf.MiiverseHelper.prototype
 */
enchant.nwf.MiiverseHelper = enchant.Class.create(enchant.EventTarget, {
    /**
     * @name enchant.nwf.MiiverseHelper
     * @class
     * Miiverse helper class.
     * @constructs
     * @extends enchant.EventTarget
     */
    initialize: function() {
        enchant.EventTarget.call(this);
        /**
         * nwf.mv.Miiverse object.
         * {@type nwf.mv.Miiverse}
         */
        this.nwfMiiverse = nwf.mv.Miiverse.getInstance();
        /**
         * enchant.nwf.MiiverseRequestQueue object.
         * {@type enchant.nwf.MiiverseRequestQueue}
         */
        this.requestQueue = new enchant.nwf.MiiverseRequestQueue();
        /**
         * Indicates whether requests can be made.
         * nwf.mv.Miiverse#isReady| true when initialization finishes successfully.
         * {@type Boolean}
         */
        this.isAvailable = this.nwfMiiverse.isReady;
        this._initializing = null;

        injectInit(this, [
            'getCommunitiesByBuilder', 'getPostsByBuilder',
            'getCommunities', 'getPosts', 'sendPost'
        ]);
    },
    /**
     * Adds the event handler that is deleted when it is called to the success/failure event of the nwf.mv.Miiverse request.
     * @param {String} nwfSuccEventType Event type supported by nwf.mv.Miiverse.
     * @param {String} nwfFailEventType Event type supported by nwf.mv.Miiverse.
     * @param {Function} onsuccess Success event handler.
     * @param {Function} onfailure Failure event handler.
     */
    _listenMiiversePairEventsOnce: function(nwfSuccEventType, nwfFailEventType, onsuccess, onfailure) {
        var succOnce, failOnce;

        this.nwfMiiverse.addEventListener(nwfSuccEventType, (succOnce = function() {
            remove.call(this);
            onsuccess.apply(this, arguments);
        }), this.nwfMiiverse);

        this.nwfMiiverse.addEventListener(nwfFailEventType, (failOnce = function() {
            remove.call(this);
            onfailure.apply(this, arguments);
        }), this.nwfMiiverse);

        function remove() {
            this.removeEventListener(nwfSuccEventType, succOnce);
            this.removeEventListener(nwfFailEventType, failOnce);
        }
    },
    /**
     * Adds Miiverse-related asynchronous requests to the queue.
     * @param {String} needs Property name of the event for the Deferred argument.
     * @param {String} succEventType Event type when a request succeeds.
     * @param {String} failEventType Event type when a request fails.
     * @param {Function} flint Function that includes the process for starting the request.
     * @return {enchant.Deferred} The Deferred object that passes the request results to next.
     */
    enqueueMiiverseRequest: function(needs, succEventType, failEventType, flint) {
        var user = new enchant.Deferred(),
            internal = new enchant.Deferred();

        this.requestQueue.enqueue(internal, function() {
            this._listenMiiversePairEventsOnce(succEventType, failEventType,
                    function(e) {
                        user.call(e[needs]);
                        internal.call(e[needs]);
                    },
                    function(e) {
                        user.fail(e.errorCode);
                        internal.fail(e.errorCode);
                    });

            setTimeout(flint, 10);
        }.bind(this));

        if (this._initializing) {
            return this._initializing
                .next(function() {
                    return user;
                });
        } else {
            return user;
        }
    },
    /**
     * Adds a process that initializes nwf.mv.Miiverse#initialize to the queue.
     * Called automatically when method that require initialization are called for the first time, such as {@link enchant.nwf.MiiverseHelper#getCommunities}, {@link enchant.nwf.MiiverseHelper#getPosts} and {@link enchanl.nwf.MiiverseHelper#sendPosts}.
     */
    init: function() {
        if (!this.nwfMiiverse.isReady) {
            this._initializing = this.enqueueMiiverseRequest('posts',
                    nwf.events.MiiverseEvent.INITIALIZATION_SUCCESS,
                    nwf.events.MiiverseEvent.INITIALIZATION_FAILED,
                    function() {
                        this._initializing = null;
                        this.nwfMiiverse.initialize();
                    }.bind(this))
                .next(function() {
                    this.isAvailable = true;
                }.bind(this));
        }
    },
    /**
     * Uses a builder object to set search conditions and search communities.
     * Calling {@link enchant.nwf.MVSearchParamBuilder#request} after calling the configuration methods starts the request.
     * @return {enchant.nwf.CommunitySearchParamBuilder} Builder object.
     * @see enchant.nwf.CommunitySearchParamBuilder
     */
    getCommunitiesByBuilder: function() {
        return new enchant.nwf.CommunitySearchParamBuilder(this);
    },
    /**
     * Uses a builder object to set search conditions and search posts.
     * Calling {@link enchant.nwf.MVSearchParamBuilder#request} after calling the configuration methods starts the request.
     * @return {enchant.nwf.PostSearchParamBuilder} Builder object.
     * @see enchant.nwf.PostSearchParamBuilder
     */
    getPostsByBuilder: function() {
        return new enchant.nwf.PostSearchParamBuilder(this);
    },
    /**
     * Searches for and gets Miiverse communities.
     * @param {nwf.mv.MiiverseCommunitySearchParam} nwfCommunitySearchParam MiiverseCommunitySearchParam object that represents the search conditions.
     * @return {enchant.Deferred} Deferred object that passes the retrieved nwf.mv.MiiverseDownloadedCommunity array to next.
     */
    getCommunities: function(nwfCommunitySearchParam) {
        return this.enqueueMiiverseRequest('communities',
                nwf.events.MiiverseEvent.DOWNLOAD_COMMUNITY_SUCCESS,
                nwf.events.MiiverseEvent.DOWNLOAD_COMMUNITY_FAILED,
                function() {
                    this.nwfMiiverse.getCommunityList(nwfCommunitySearchParam);
                }.bind(this));
    },
    /**
     * Searches for and gets Miiverse posts.
     * @param {nwf.mv.MiiverseSearchParam} nwfPostSearchParam MiiverseSearchParam object that represents the search conditions.
     * @return {enchant.Deferred} Deferred object that passes the retrieved nwf.mv.MiiverseDownloadedPost array to next.
     */
    getPosts: function(nwfPostSearchParam) {
        return this.enqueueMiiverseRequest('posts',
                nwf.events.MiiverseEvent.DOWNLOAD_POST_SUCCESS,
                nwf.events.MiiverseEvent.DOWNLOAD_POST_FAILED,
                function() {
                    this.nwfMiiverse.getPostList(nwfPostSearchParam);
                }.bind(this));
    },
    /**
     * Posts data to Miiverse.
     * @param {nwf.mv.MiiverseUploadPost} nwfUploadPost MiiverseUploadPost object to post to Miiverse.
     * @param {Boolean} [withForm=false] Indicates whether to start the post app provided by the Wii U.
     * @return {enchant.Deferred} The Deferred object to start after posting.
     */
    sendPost: function(nwfUploadPost, withForm) {
        return this.enqueueMiiverseRequest('nothing',
                nwf.events.MiiverseEvent.UPLOAD_POST_SUCCESS,
                nwf.events.MiiverseEvent.UPLOAD_POST_FAILED,
                function() {
                    this.nwfMiiverse.sendPost(nwfUploadPost, withForm);
                }.bind(this));
    },
    /**
     * Posts data to Miiverse by way of the post app provided by the Wii U.
     * The same as when the second argument to {@link enchant.nwf.MiiverseHelper#sendPost} is set to true.
     * @param {nwf.mv.MiiverseUploadPost} nwfUploadPost MiiverseUploadPost object to post to Miiverse.
     * @return {enchant.Deferred} The Deferred object to start after posting.
     */
    sendPostByForm: function(nwfUploadPost) {
        return this.sendPost(nwfUploadPost, true);
    },
    /**
     * Posts data to Miiverse without going through the post app provided by the Wii U.
     * The same as when the second argument to {@link enchant.nwf.MiiverseHelper#sendPost} is set to false.
     * @param {nwf.mv.MiiverseUploadPost} nwfUploadPost MiiverseUploadPost object to post to Miiverse.
     * @return {enchant.Deferred} The Deferred object to start after posting.
     */
    sendPostSilently: function(nwfUploadPost) {
        return this.sendPost(nwfUploadPost, false);
    },
    /**
     * Destroys references to the NWF mv object.
     * The object no longer operates after this method is called.
     */
    destruct: function() {
        throw new Error('not implemented');
    }
});

/**
 * @scope enchant.nwf.MiiverseRequestQueue.prototype
 */
enchant.nwf.MiiverseRequestQueue = enchant.Class.create({
    /**
     * @name enchant.nwf.MiiverseRequestQueue
     * @class
     * The queue that holds and processes Miiverse requests in order.
     * @constructs
     */
    initialize: function() {
        /**
         * The Deferred object that is the head of the queue.
         * @type enchant.Deferred
         */
        this.head = null;
        /**
         * The number of requests waiting in the queue.
         * @type Number
         */
        this.queueCount = 0;
    },
    /**
     * Runs post-processing when the queue is finished.
     * Added automatically when there are additions to the queue.
     * @param {*} arg Value inherited from the previous process.
     * @return {*} Value inherited from the previous process.
     */
    _finalizeRequest: function(arg) {
        this.queueCount--;
        if (this.queueCount === 0) {
            this.head = null;
        }
        return arg;
    },
    /**
     * Adds a Deferred object to the queue.
     * @param {enchant.Deferred} deferred The Deferred object to add to the queue.
     * @param {Function} flint Function that includes the process for deferred to start the requests waiting.
     */
    enqueue: function(deferred, flint) {
        this.queueCount++;
        if (this.head === null) {
            this.head = enchant.Deferred
                .next(flint)
                .next(function() {
                    return deferred;
                });
        } else {
            this.head
                .next(flint)
                .next(function() {
                    return deferred;
                });
        }
        this.head
            .next(this._finalizeRequest.bind(this))
            .error(this._finalizeRequest.bind(this));
    },
    /**
     * Destroys the state currently held by the object itself.
     * The object no longer operates after this method is called.
     */
    destruct: function() {
        throw new Error('not implemented');
    }
});

/**
 * @scope enchant.nwf.MVSearchParamBuilder.prototype
 */
enchant.nwf.MVSearchParamBuilder = enchant.Class.create({
    /**
     * @name enchant.nwf.MVSearchParamBuilder
     * @class
     * Utility class for constructing nwf.mv.MiiverseSearchParam and nwf.mv.MiiverseCommunitySearchParam.
     * @param {Function} NWFSearchParamConstructor Either nwf.mv.MiiverseSearchParam or nwf.mv.MiiverseCommunitySearchParam.
     * @param {enchant.nwf.MiiverseHelper} miiverseHelper MiiverseHelper object.
     * @param {Function} requestMethod MiiverseHelper method that is called during {@link enchant.nwf.MVSearchParamBuilder#request}.
     * @see enchant.nwf.PostSearchParamBuilder
     * @see enchant.nwf.CommunitySearchParamBuilder
     * @constructs
     */
    initialize: function(NWFSearchParamConstructor, miiverseHelper, requestMethod) {
        this.nwfSearchParam = new NWFSearchParamConstructor();
        this.miiverseHelper = miiverseHelper;
        this._requesMethod = requestMethod;

        this.bitMixer = new enchant.nwf.BitMixer();
    },
    /**
     * Sets an upper limit for the number of search results.
     * @param {Number} maxNum The upper limit number.
     * @return {enchant.nwf.MVSearchParamBuilder} The object itself.
     */
    limits: function(maxNum) {
        this.nwfSearchParam.maxNum = maxNum;
        return this;
    },
    /**
     * Specifies the community to search.
     * @param {Number} community Community ID.
     * @return {enchant.nwf.MVSearchParamBuilder} The object itself.
     */
    community: function(communityID) {
        this.nwfSearchParam.communityID = communityID;
        return this;
    },
    /**
     * Starts the search.
     * @return {enchant.Deferred} The Deferred object that passes the search results to next.
     */
    request: function() {
        this.nwfSearchParam.filter = this.bitMixer.value;
        return this._requesMethod.call(this.miiverseHelper, this.nwfSearchParam);
    },
    /**
     * Destroys references to the NWF object.
     * The object no longer operates after this method is called.
     */
    destruct: function() {
        throw new Error('not implemented');
    }
});

/**
 * @scope enchant.nwf.CommunitySearchParamBuilder.prototype
 */
enchant.nwf.CommunitySearchParamBuilder = enchant.Class.create(enchant.nwf.MVSearchParamBuilder, {
    /**
     * @name enchant.nwf.CommunitySearchParamBuilder
     * @class
     * Utility class for constructing nwf.mv.MiiverseCommunitySearchParam.
     * @param {enchant.nwf.MiiverseHelper} miiverseHelper MiiverseHelper object.
     * @extends enchant.nwf.MVSearchParamBuilder
     * @constructs
     */
    initialize: function(miiverseHelper) {
        enchant.nwf.MVSearchParamBuilder.call(this, nwf.mv.MiiverseCommunitySearchParam, miiverseHelper,
            enchant.nwf.MiiverseHelper.prototype.getCommunities);
    },
    /**
     * Configures to search the communities created by the user who is logged in at the time of execution.
     * @return {enchant.nwf.CommunitySearchParamBuilder} The object itself.
     */
    createdByUser: function() {
        this.bitMixer.enable(nwf.mv.MiiverseCommunitySearchParam.FLAG_FILTER_BY_SELF);
        return this;
    },
    /**
     * Configures to search communities added as favorites by the user who is logged in at the time of execution.
     * @return {enchant.nwf.CommunitySearchParamBuilder} The object itself.
     */
    favoritedByUser: function() {
        this.bitMixer.enable(nwf.mv.MiiverseCommunitySearchParam.FLAG_FILTER_BY_FAVORITE);
        return this;
    },
    /**
     * Configures to search the official community of the application being run.
     * @return {enchant.nwf.CommunitySearchParamBuilder} The object itself.
     */
    officialCommunity: function() {
        this.bitMixer.enable(nwf.mv.MiiverseCommunitySearchParam.FLAG_FILTER_BY_OFFICIAL);
        return this;
    }
});

/**
 * @scope enchant.nwf.PostSearchParamBuilder.prototype
 */
enchant.nwf.PostSearchParamBuilder = enchant.Class.create(enchant.nwf.MVSearchParamBuilder, {
    /**
     * @name enchant.nwf.PostSearchParamBuilder
     * @class
     * Utility class for constructing nwf.mv.MiiverseSearchParam.
     * @param {enchant.nwf.MiiverseHelper} miiverseHelper MiiverseHelper object.
     * @extends enchant.nwf.MVSearchParamBuilder
     * @constructs
     */
    initialize: function(miiverseHelper) {
        enchant.nwf.MVSearchParamBuilder.call(this, nwf.mv.MiiverseSearchParam, miiverseHelper,
            enchant.nwf.MiiverseHelper.prototype.getPosts);
    },
    /**
     * Specifies the user for the search.
     * @param {Number} prencipal The principal ID of the target user.
     * @return {enchant.nwf.PostSearchParamBuilder} The object itself.
     */
    user: function(principal) {
        this.nwfSearchParam.pID = principal;
        return this;
    },
    /**
     * @param {Number} language The ID for the target language.
     * @return {enchant.nwf.PostSearchParamBuilder} The object itself.
     */
    language: function(language) {
        this.nwfSearchParam.languageID = language;
        return this;
    },
    /**
     * Configures searches for posts that have strings as data.
     * @return {enchant.nwf.PostSearchParamBuilder} The object itself.
     */
    textData: function() {
        this.bitMixer.enableExclusive(
            nwf.mv.MiiverseSearchParam.FILTER_BODY_TEXT ||
            nwf.mv.MiiverseSearchParam.FILTER_BODY_MEMO,
            nwf.mv.MiiverseSearchParam.FILTER_BODY_TEXT);
        return this;
    },
    /**
     * Configures searches for posts that have memos as data.
     * @return {enchant.nwf.PostSearchParamBuilder} The object itself.
     */
    memoData: function() {
        this.bitMixer.enableExclusive(
            nwf.mv.MiiverseSearchParam.FILTER_BODY_TEXT ||
            nwf.mv.MiiverseSearchParam.FILTER_BODY_MEMO,
            nwf.mv.MiiverseSearchParam.FILTER_BODY_MEMO);
        return this;
    },
    /**
     * Configures searches for posts that have either strings or memos as data.
     * @return {enchant.nwf.PostSearchParamBuilder} The object itself.
     */
    textOrMemoData: function() {
        this.bitMixer.disable(
            nwf.mv.MiiverseSearchParam.FILTER_BODY_TEXT ||
            nwf.mv.MiiverseSearchParam.FILTER_BODY_MEMO);
        return this;
    },
    /**
     * Configures searches to include posts that include spoilers.
     * @return {enchant.nwf.PostSearchParamBuilder} The object itself.
     */
    glantsSpoiler: function() {
        this.bitMixer.enable(nwf.mv.MiiverseSearchParam.FILTER_WITH_SPOILER);
        return this;
    },
    /**
     * Configures searches to exclude posts that include spoilers.
     * @return {enchant.nwf.PostSearchParamBuilder} The object itself.
     */
    deniesSpoiler: function() {
        this.bitMixer.disable(nwf.mv.MiiverseSearchParam.FILTER_WITH_SPOILER);
        return this;
    },
    /**
     * Configures searches within all posts.
     * @return {enchant.nwf.PostSearchParamBuilder} The object itself.
     */
    postFromEveryone: function() {
        this.bitMixer.disable(
            nwf.mv.MiiverseSearchParam.FILTER_FROM_FRIEND ||
            nwf.mv.MiiverseSearchParam.FILTER_FROM_FOLLOW ||
            nwf.mv.MiiverseSearchParam.FILTER_FROM_SELF);
        return this;
    },
    /**
     * Configures to search within posts made by users followed by the user who is logged in at the time of execution.
     * @return {enchant.nwf.PostSearchParamBuilder} The object itself.
     */
    postFromFollow: function() {
        this.bitMixer.enable(nwf.mv.MiiverseSearchParam.FILTER_FROM_FOLLOW);
        return this;
    },
    /**
     * Configures to search within posts made by friends of the user who is logged in at the time of execution.
     * @return {enchant.nwf.PostSearchParamBuilder} The object itself.
     */
    postFromFriend: function() {
        this.bitMixer.enable(nwf.mv.MiiverseSearchParam.FILTER_FROM_FRIEND);
        return this;
    },
    /**
     * Configures to search within posts made by the user who is logged in at the time of execution.
     * @return {enchant.nwf.PostSearchParamBuilder} The object itself.
     */
    postFromUser: function() {
        this.bitMixer.enable(nwf.mv.MiiverseSearchParam.FILTER_FROM_SELF);
        return this;
    }
});

/**
 * @scope enchant.nwf.BitMixer.prototype
 */
enchant.nwf.BitMixer = enchant.Class.create({
    /**
     * @name enchant.nwf.BitMixer
     * @class
     * A utility class for constructing bit flags.
     * @constructs
     */
    initialize: function() {
        this.value = 0;
    },
    /**
     * Disables bits in the specified range, and then enables the specified bit.
     * @param {Number} range A numeric value that indicates the range of bits to disable.
     * @param {Number} bit A numeric value that indicates the bit to enable.
     */
    enableExclusive: function(range, bit) {
        this.value = this.value & ~range | bit;
    },
    /**
     * Enables the specified bit.
     * @param {Number} bit A numeric value that indicates the bit to enable.
     */
    enable: function(bit) {
        this.value |= bit;
    },
    /**
     * Disables the specified bit.
     * @param {Number} bit A numeric value that indicates the bit to disable.
     */
    disable: function(bit) {
        this.value &= ~bit;
    }
});

/**
 * @scope enchant.nwf.StatGraph
 */
enchant.nwf.StatGraph = enchant.Class.create(enchant.Group, {
    /**
     * @name enchant.nwf.StatGraph
     * @class
     * A class that gets the rendering time and renders graphs.
     * @constructs
     * @extends enchant.Group
     */
    initialize: function() {
        enchant.Group.call(this);
        this.width = enchant.nwf.StatGraph.WIDTH;
        this.height = enchant.nwf.StatGraph.HEIGHT;

        this.loggedData = [];
        this.logSize = this.width;
        this._top = 0;

        this._backgroundColor = '#004c00';
        this._label = this._createLabel();
        this.addChild(this._label);

        this.addEventListener(enchant.Event.ENTER_FRAME, this.log);

        this.enable();
    },
    _createLabel: function() {
        var label = new enchant.Label('0ms');
        label.font = '8px monospace';
        label.textAlign = 'right';
        label.width = this.width;
        label.height = label._boundHeight;
        label.y = this.height - label.height;
        label.color = '#ffffff';
        return label;
    },
    /**
     * Enables acquisition of rendering time.
     */
    enable: function() {
        this._enabled = true;
        nwf.system.Performance.enable();
    },
    /**
     * Disables acquisition of rendering time.
     */
    disable: function() {
        this._enabled = false;
        nwf.system.Performance.disable();
    },
    log: function() {
        var core = enchant.Core.instance;
        if (core.frame % core.fps !== 0) {
            return;
        }
        var value = (this._enabled ? nwf.system.Performance.averageRenderTime : 0);
        this._label.text = value + 'ms';
        this.loggedData.unshift(value);
        this.loggedData = this.loggedData.slice(0, this.logSize);
        if (value > this._top) {
            this._top = value;
        }
    },
    cvsRender: function(ctx) {
        var i, l, value,
            log = this.loggedData,
            x = this.width - 1,
            bottom = this.height - 8;

        ctx.save();
        ctx.fillStyle = '#ff00ff';
        for (i = 0, l = log.length; i < l; i++) {
            value = log[i] >> 1;
            ctx.fillRect(x, bottom - value, 1, value);
            x--;
        }
        ctx.restore();
    }
});

enchant.nwf.StatGraph.WIDTH = 48;
enchant.nwf.StatGraph.HEIGHT = 36;

/**
 * @scope enchant.nwf.Sound.prototype
 */
enchant.nwf.Sound = enchant.Class.create(enchant.WebAudioSound, {
    /**
     * @name enchant.nwf.Sound
     * @class
     * A sound class that supports the specified playback device.
     * Uses WebAudio to control the audio.
     * Overwrites enchant.Sound.
     * @constructs
     * @extends enchant.WebAudioSound
     */
    initialize: function() {
        enchant.WebAudioSound.call(this);
    },
    play: function(dup) {
        if (enchant.nwf.Sound.isDestination(this.connectTarget) ||
            enchant.nwf.Sound.isOutputDeviceNode(this.connectTarget)) {
            this.connectTarget = enchant.nwf.Sound.destination;
        }

        enchant.WebAudioSound.prototype.play.call(this, dup);
    },
    /**
     * Plays back audio from the specified device.
     * Use either "tv" or "pad" to specify the device.
     * @param {String} [display="pad"] An identifier that specifies the device.
     */
    playOn: function(target, dup) {
        var device = enchant.nwf.Sound.getOutputDeviceNode(target);

        if (enchant.nwf.Sound.isDestination(this.connectTarget) ||
            enchant.nwf.Sound.isOutputDeviceNode(this.connectTarget)) {
            this.connectTarget = device;
        }

        enchant.WebAudioSound.prototype.play.call(this, dup);
    },
    /**
     * Duplicates instances.
     * @return {enchant.nwf.Sound} A duplicated instance.
     */
    clone: function() {
        var sound = new enchant.nwf.Sound();
        sound.buffer = this.buffer;
        return sound;
    }
});

/**
 * WebAudio API AudioContext.
 * @type AudioContext
 * @static
 */
enchant.nwf.Sound.audioContext = enchant.WebAudioSound.audioContext;
/**
 * WebAudio API AudioDestinationNode.
 * @type AudioDestinationNode
 * @static
 */
enchant.nwf.Sound.destination = enchant.WebAudioSound.destination;
/**
 * An associative array that holds the AudioOutputDeviceNode elements of the NWF custom API.
 * @type Object
 * @static
 */
enchant.nwf.Sound.outputDeviceNodes = {};
/**
 * An associative array that holds the other names of the output devices.
 * @type Object
 * @static
 */
enchant.nwf.Sound.outputDeviceNameAlias = {
    tv: 'TV',
    pad: nwf.input.WiiUGamePad.getController().name
};
/**
 * Gets the AudioOutputDeviceNode.
 * @param {String|enchant.nwf.WiiUGamePadInput} target The object corresponding to the outputDeviceNode you want to get.
 * @return {AudioOutputDeviceNode} outputDeviceNode.
 * @static
 */
enchant.nwf.Sound.getOutputDeviceNode = function(target) {
    var name;
    if (target instanceof enchant.nwf.ControllerInputContainer) {
        name = target.name;
    } else {
        name = this.outputDeviceNameAlias[target] || target;
    }
    if (!this.outputDeviceNodes[name]) {
        this.outputDeviceNodes[name] = this.audioContext.createOutputDeviceNode(name);
        this.outputDeviceNodes[name].connect(this.destination);
    }
    return this.outputDeviceNodes[name];
};

(function(AudioOutputDeviceNodeConstructor) {
    /**
     * Determines whether the object is an AudioOutputDeviceNode.
     * @param {*} audioNode The object for which the determination is to be made.
     * @return {Boolean} Determination result.
     * @static
     */
    enchant.nwf.Sound.isOutputDeviceNode = function(audioNode) {
        return audioNode instanceof AudioOutputDeviceNodeConstructor;
    };
}(enchant.nwf.Sound.getOutputDeviceNode('TV').constructor));

/**
 * Determines whether the object is an AudioDestinationNode.
 * @param {*} audioNode The object for which the determination is to be made.
 * @return {Boolean} Determination result.
 * @static
 */
enchant.nwf.Sound.isDestination = function(audioNode) {
    return audioNode === this.destination;
};

/**
 * Loads the audio file and creates a Sound object.
 * @param {String} src Path to the file.
 * @param {String} type MIME type for the audio file.
 * @param {Function} [callback] Callback called when the loading completes.
 * @param {Function} [onerror] Callback called when the loading fails.
 * @return {enchant.nwf.Sound} The instance created.
 * @static
 */
enchant.nwf.Sound.load = function(src, type, callback, onerror) {
    var sound = new enchant.nwf.Sound();
    enchant.WebAudioSound.load(src, type, function() {
        sound.buffer = this.buffer;
        callback.apply(sound, arguments);
    }, onerror);
    return sound;
};

enchant.Sound = enchant.nwf.Sound;

function injectInit(context, methodNames) {
    function deleteInjectMethods() {
        methodNames.concat('init').forEach(function(name) {
            delete this[name];
        }, this);
    }
    methodNames.forEach(function(name) {
        this[name] = function() {
            deleteInjectMethods.call(this);
            this.init();
            return this[name].apply(this, arguments);
        };
    }, context);
    var _init = context.init;
    context.init = function() {
        deleteInjectMethods.call(this);
        _init.apply(this, arguments);
    };
}

/**
 * An event that occurs when an extension controller is connected.
 * Objects to issue:  Objects specified by {@link enchant.nwf.WiiRemoteInput} and {@link enchant.nwf.ControllerInputContainer#bindTo}.
 * @type String
 */
enchant.Event.EXTENSIONCONTROLLER_CONNECTED = 'extensioncontrollerconnected';
/**
 * An event that occurs when an extension controller is disconnected.
 * Objects to issue:  Objects specified by {@link enchant.nwf.WiiRemoteInput} and {@link enchant.nwf.ControllerInputContainer#bindTo}.
 * @type String
 */
enchant.Event.EXTENSIONCONTROLLER_DISCONNECTED = 'extensioncontrollerdisconnected';
/**
 * An event that occurs when the first Wii Remote is connected.
 * Object to issue : {@link enchant.nwf.WiiRemoteManager}
 * @type String
 */
enchant.Event.REMOTE1_CONNECTED = 'wiiremote1connected';
/**
 * An event that occurs when the first Wii Remote is disconnected.
 * Object to issue : {@link enchant.nwf.WiiRemoteManager}
 * @type String
 */
enchant.Event.REMOTE1_DISCONNECTED = 'wiiremote1disconnected';
/**
 * An event that occurs when the second Wii Remote is connected.
 * Object to issue : {@link enchant.nwf.WiiRemoteManager}
 * @type String
 */
enchant.Event.REMOTE2_CONNECTED = 'wiiremote2connected';
/**
 * An event that occurs when the second Wii Remote is disconnected.
 * Object to issue : {@link enchant.nwf.WiiRemoteManager}
 * @type String
 */
enchant.Event.REMOTE2_DISCONNECTED = 'wiiremote2disconnected';
/**
 * An event that occurs when the third Wii Remote is connected.
 * Object to issue : {@link enchant.nwf.WiiRemoteManager}
 * @type String
 */
enchant.Event.REMOTE3_CONNECTED = 'wiiremote3connected';
/**
 * An event that occurs when the third Wii Remote is disconnected.
 * Object to issue : {@link enchant.nwf.WiiRemoteManager}
 * @type String
 */
enchant.Event.REMOTE3_DISCONNECTED = 'wiiremote3disconnected';
/**
 * An event that occurs when the fourth Wii Remote is connected.
 * Object to issue : {@link enchant.nwf.WiiRemoteManager}
 * @type String
 */
enchant.Event.REMOTE4_CONNECTED = 'wiiremote4connected';
/**
 * An event that occurs when the fourth Wii Remote is disconnected.
 * Object to issue : {@link enchant.nwf.WiiRemoteManager}
 * @type String
 */
enchant.Event.REMOTE4_DISCONNECTED = 'wiiremote4disconnected';
/**
 * An event that occurs when the Wii U GamePad is connected.
 * Object to issue : {@link enchant.nwf.WiiUGamePadManager}
 * @type String
 */
enchant.Event.GAMEPAD1_CONNECTED = 'wiiugamepad1connected';
/**
 * An event that occurs when the Wii U GamePad is disconnected.
 * Object to issue : {@link enchant.nwf.WiiUGamePadManager}
 * @type String
 */
enchant.Event.GAMEPAD1_DISCONNECTED = 'wiiugamepad1disconnected';
/**
 * An event that occurs when files are read/written successfully.
 * Object to issue : {@link enchant.nwf.FSFileNode}
 * @type String
 */
enchant.Event.FILE_PROCESS_SUCCESS = 'fileprocesssuccess';
/**
 * An event that occurs when files fail to be read and written.
 * Object to issue : {@link enchant.nwf.FSFileNode}
 * @type String
 */
enchant.Event.FILE_PROCESS_FAILURE = 'fileprocessfailure';
/**
 * An event that occurs when gyro sensor calibration succeeds.
 * Objects to issue:  Objects specified by {@link enchant.nwf.GyroscopeCalibrator}, {@link enchant.nwf.IMGyroscope}, {@link enchant.nwf.WiiUGamePadInput}, {@link enchant.nwf.WiiRemoteInput}, and {@link enchant.nwf.ControllerInputContainer#bindTo}.
 */
enchant.Event.CALIBRATION_SUCCESS = 'calibrationsuccess';
/**
 * An event that occurs when gyro sensor calibration fails.
 * Objects to issue:  Objects specified by {@link enchant.nwf.GyroscopeCalibrator}, {@link enchant.nwf.IMGyroscope}, {@link enchant.nwf.WiiUGamePadInput}, {@link enchant.nwf.WiiRemoteInput}, and {@link enchant.nwf.ControllerInputContainer#bindTo}.
 */
enchant.Event.CALIBRATION_FAILURE = 'calibrationfailure';
/**
 * An event that occurs when there are changes in the accelerometer values of the controller.
 * Objects to issue:  Objects specified by {@link enchant.nwf.IMAccelerometer}, {@link enchant.nwf.WiiUGamePadInput}, {@link enchant.nwf.WiiRemoteInput}, {@link enchant.nwf.NunchukInput}, and {@link enchant.nwf.ControllerInputContainer#bindTo}.
 * @type String
 */
enchant.Event.ACCELERATION_UPDATE = 'accelerationupdate';
/**
 * An event that occurs when there are changes in the remaining battery life of the controller.
 * Objects to issue:  Objects specified by , {@link enchant.nwf.IMBatteryLevel}, {@link enchant.nwf.WiiUGamePadInput}, {@link enchant.nwf.WiiRemoteInput}, and {@link enchant.nwf.ControllerInputContainer#bindTo}.
 * @type String
 */
enchant.Event.BATTERYLEVEL_CHANGED = 'batterylevelchanged';
/**
 * An event that occurs when there are changes in the gyro sensor values of the controller.
 * Objects to issue:  Objects specified by , {@link enchant.nwf.IMGyroscope}, {@link enchant.nwf.WiiUGamePadInput}, {@link enchant.nwf.WiiRemoteInput}, and {@link enchant.nwf.ControllerInputContainer#bindTo}.
 * @type String
 */
enchant.Event.GYRO_UPDATE = 'gyroupdate';
/**
 * An event that occurs when there are changes in the pointer position of the controller.
 * Objects to issue:  Objects specified by {@link enchant.nwf.IMDPD}, {@link enchant.nwf.WiiRemoteInput}, and {@link enchant.nwf.ControllerInputContainer#bindTo}.
 * @type String
 */
enchant.Event.POINTER_UPDATE = 'pointerupdate';
/**
 * An event that occurs when there are changes in the tilt of the controller's stick.
 * Objects to issue:  Objects specified by {@link enchant.nwf.IMNunchukStick}, {@link enchant.nwf.NunchukInput}, and {@link enchant.nwf.ControllerInputContainer#bindTo}.
 * @type String
 */
enchant.Event.STICK_MOVE = 'stickmove';
/**
 * An event that occurs when there are changes in the tilt of the controller's left stick.
 * Objects to issue:  Objects specified by {@link enchant.nwf.IMWiiUGamePadLStick}, {@link enchant.nwf.IMClassicControllerLStick}, {@link enchant.nwf.WiiUGamePadInput}, {@link enchant.nwf.ClassicControllerInput}, and {@link enchant.nwf.ControllerInputContainer#bindTo}.
 * @type String
 */
enchant.Event.LEFT_STICK_MOVE = 'leftstickmove';
/**
 * An event that occurs when there are changes in the tilt of the controller's right stick.
 * Objects to issue:  Objects specified by {@link enchant.nwf.IMWiiUGamePadRStick}, {@link enchant.nwf.IMClassicControllerRStick}, {@link enchant.nwf.WiiUGamePadInput}, {@link enchant.nwf.ClassicControllerInput}, and {@link enchant.nwf.ControllerInputContainer#bindTo}.
 * @type String
 */
enchant.Event.RIGHT_STICK_MOVE = 'rightstickmove';
/**
 * An event that occurs when the 1 button of a controller is pressed.
 * Objects to issue:  Objects specified by {@link enchant.nwf.IMButton}, {@link enchant.nwf.WiiRemoteInput}, and {@link enchant.nwf.ControllerInputContainer#bindTo}.
 */
enchant.Event.ONE_BUTTON_DOWN = '1buttondown';
/**
 * An event that occurs when the 1 button of a controller is released.
 * Objects to issue:  Objects specified by {@link enchant.nwf.IMButton}, {@link enchant.nwf.WiiRemoteInput}, and {@link enchant.nwf.ControllerInputContainer#bindTo}.
 */
enchant.Event.ONE_BUTTON_UP = '1buttonup';
/**
 * An event that occurs when the 2 button of a controller is pressed.
 * Objects to issue:  Objects specified by {@link enchant.nwf.IMButton}, {@link enchant.nwf.WiiRemoteInput}, and {@link enchant.nwf.ControllerInputContainer#bindTo}.
 */
enchant.Event.TWO_BUTTON_DOWN = '2buttondown';
/**
 * An event that occurs when the 2 button of a controller is released.
 * Objects to issue:  Objects specified by {@link enchant.nwf.IMButton}, {@link enchant.nwf.WiiRemoteInput}, and {@link enchant.nwf.ControllerInputContainer#bindTo}.
 */
enchant.Event.TWO_BUTTON_UP = '2buttonup';
/**
 * An event that occurs when the A button of a controller is pressed.
 * Objects to issue:  Objects specified by {@link enchant.nwf.IMButton}, {@link enchant.nwf.WiiUGamePadInput}, {@link enchant.nwf.WiiRemoteInput}, {@link enchant.nwf.ClassicControllerInput}, and {@link enchant.nwf.ControllerInputContainer#bindTo}.
 * @type String
 */
enchant.Event.A_BUTTON_DOWN = 'abuttondown';
/**
 * An event that occurs when the A button of a controller is released.
 * Objects to issue:  Objects specified by {@link enchant.nwf.IMButton}, {@link enchant.nwf.WiiUGamePadInput}, {@link enchant.nwf.WiiRemoteInput}, {@link enchant.nwf.ClassicControllerInput}, and {@link enchant.nwf.ControllerInputContainer#bindTo}.
 * @type String
 */
enchant.Event.A_BUTTON_UP = 'abuttonup';
/**
 * An event that occurs when the B button of a controller is pressed.
 * Objects to issue:  Objects specified by {@link enchant.nwf.IMButton}, {@link enchant.nwf.WiiUGamePadInput}, {@link enchant.nwf.WiiRemoteInput}, {@link enchant.nwf.ClassicControllerInput}, and {@link enchant.nwf.ControllerInputContainer#bindTo}.
 * @type String
 */
enchant.Event.B_BUTTON_DOWN = 'bbuttondown';
/**
 * An event that occurs when the B button of a controller is released.
 * Objects to issue:  Objects specified by {@link enchant.nwf.IMButton}, {@link enchant.nwf.WiiUGamePadInput}, {@link enchant.nwf.WiiRemoteInput}, {@link enchant.nwf.ClassicControllerInput}, and {@link enchant.nwf.ControllerInputContainer#bindTo}.
 * @type String
 */
enchant.Event.B_BUTTON_UP = 'bbuttonup';
/**
 * An event that occurs when the down button of a controller is pressed.
 * Objects to issue:  Objects specified by {@link enchant.nwf.IMButton}, {@link enchant.nwf.WiiUGamePadInput}, {@link enchant.nwf.WiiRemoteInput}, {@link enchant.nwf.ClassicControllerInput}, and {@link enchant.nwf.ControllerInputContainer#bindTo}.
 * @type String
 */
enchant.Event.DOWN_BUTTON_DOWN = 'downbuttondown';
/**
 * An event that occurs when the down button of a controller is released.
 * Objects to issue:  Objects specified by {@link enchant.nwf.IMButton}, {@link enchant.nwf.WiiUGamePadInput}, {@link enchant.nwf.WiiRemoteInput}, {@link enchant.nwf.ClassicControllerInput}, and {@link enchant.nwf.ControllerInputContainer#bindTo}.
 * @type String
 */
enchant.Event.DOWN_BUTTON_UP = 'downbuttonup';
/**
 * An event that occurs when the L button of a controller is pressed.
 * Objects to issue:  Objects specified by , {@link enchant.nwf.IMButton}, {@link enchant.nwf.WiiUGamePadInput}, {@link enchant.nwf.ClassicControllerInput}, and {@link enchant.nwf.ControllerInputContainer#bindTo}.
 * @type String
 */
enchant.Event.L_BUTTON_DOWN = 'lbuttondown';
/**
 * An event that occurs when the L button of a controller is released.
 * Objects to issue:  Objects specified by , {@link enchant.nwf.IMButton}, {@link enchant.nwf.WiiUGamePadInput}, {@link enchant.nwf.ClassicControllerInput}, and {@link enchant.nwf.ControllerInputContainer#bindTo}.
 * @type String
 */
enchant.Event.L_BUTTON_UP = 'lbuttonup';
/**
 * An event that occurs when the left button of a controller is pressed.
 * Objects to issue:  Objects specified by {@link enchant.nwf.IMButton}, {@link enchant.nwf.WiiUGamePadInput}, {@link enchant.nwf.WiiRemoteInput}, {@link enchant.nwf.ClassicControllerInput}, and {@link enchant.nwf.ControllerInputContainer#bindTo}.
 * @type String
 */
enchant.Event.LEFT_BUTTON_DOWN = 'leftbuttondown';
/**
 * An event that occurs when the left button of a controller is released.
 * Objects to issue:  Objects specified by {@link enchant.nwf.IMButton}, {@link enchant.nwf.WiiUGamePadInput}, {@link enchant.nwf.WiiRemoteInput}, {@link enchant.nwf.ClassicControllerInput}, and {@link enchant.nwf.ControllerInputContainer#bindTo}.
 * @type String
 */
enchant.Event.LEFT_BUTTON_UP = 'leftbuttonup';
/**
 * An event that occurs when the left stick of a controller is pressed.
 * Objects to issue:  Objects specified by , {@link enchant.nwf.IMButton}, {@link enchant.nwf.WiiUGamePadInput}, {@link enchant.nwf.ClassicControllerInput}, and {@link enchant.nwf.ControllerInputContainer#bindTo}.
 * @type String
 */
enchant.Event.LSTICK_BUTTON_DOWN = 'lstickbuttondown';
/**
 * An event that occurs when the left stick of a controller is released.
 * Objects to issue:  Objects specified by , {@link enchant.nwf.IMButton}, {@link enchant.nwf.WiiUGamePadInput}, {@link enchant.nwf.ClassicControllerInput}, and {@link enchant.nwf.ControllerInputContainer#bindTo}.
 * @type String
 */
enchant.Event.LSTICK_BUTTON_UP = 'lstickbuttonup';
/**
 * An event that occurs when the minus button of a controller is pressed.
 * Objects to issue:  Objects specified by {@link enchant.nwf.IMButton}, {@link enchant.nwf.WiiUGamePadInput}, {@link enchant.nwf.WiiRemoteInput}, {@link enchant.nwf.ClassicControllerInput}, and {@link enchant.nwf.ControllerInputContainer#bindTo}.
 * @type String
 */
enchant.Event.MINUS_BUTTON_DOWN = 'minusbuttondown';
/**
 * An event that occurs when the minus button of a controller is released.
 * Objects to issue:  Objects specified by {@link enchant.nwf.IMButton}, {@link enchant.nwf.WiiUGamePadInput}, {@link enchant.nwf.WiiRemoteInput}, {@link enchant.nwf.ClassicControllerInput}, and {@link enchant.nwf.ControllerInputContainer#bindTo}.
 * @type String
 */
enchant.Event.MINUS_BUTTON_UP = 'minusbuttonup';
/**
 * An event that occurs when the plus button of a controller is pressed.
 * Objects to issue:  Objects specified by {@link enchant.nwf.IMButton}, {@link enchant.nwf.WiiUGamePadInput}, {@link enchant.nwf.WiiRemoteInput}, {@link enchant.nwf.ClassicControllerInput}, and {@link enchant.nwf.ControllerInputContainer#bindTo}.
 * @type String
 */
enchant.Event.PLUS_BUTTON_DOWN = 'plusbuttondown';
/**
 * An event that occurs when the plus button of a controller is released.
 * Objects to issue:  Objects specified by {@link enchant.nwf.IMButton}, {@link enchant.nwf.WiiUGamePadInput}, {@link enchant.nwf.WiiRemoteInput}, {@link enchant.nwf.ClassicControllerInput}, and {@link enchant.nwf.ControllerInputContainer#bindTo}.
 * @type String
 */
enchant.Event.PLUS_BUTTON_UP = 'plusbuttonup';
/**
 * An event that occurs when the POWER Button of a controller is pressed.
 * Objects to issue:  Objects specified by {@link enchant.nwf.IMButton}, {@link enchant.nwf.WiiUGamePadInput}, and {@link enchant.nwf.ControllerInputContainer#bindTo}.
 * @type String
 */
enchant.Event.POWER_BUTTON_DOWN = 'powerbuttondown';
/**
 * An event that occurs when the POWER Button of a controller is released.
 * Objects to issue:  Objects specified by {@link enchant.nwf.IMButton}, {@link enchant.nwf.WiiUGamePadInput}, and {@link enchant.nwf.ControllerInputContainer#bindTo}.
 * @type String
 */
enchant.Event.POWER_BUTTON_UP = 'powerbuttonup';
/**
 * An event that occurs when the R Button of a controller is pressed.
 * Objects to issue:  Objects specified by , {@link enchant.nwf.IMButton}, {@link enchant.nwf.WiiUGamePadInput}, {@link enchant.nwf.ClassicControllerInput}, and {@link enchant.nwf.ControllerInputContainer#bindTo}.
 * @type String
 */
enchant.Event.R_BUTTON_DOWN = 'rbuttondown';
/**
 * An event that occurs when the R Button of a controller is released.
 * Objects to issue:  Objects specified by , {@link enchant.nwf.IMButton}, {@link enchant.nwf.WiiUGamePadInput}, {@link enchant.nwf.ClassicControllerInput}, and {@link enchant.nwf.ControllerInputContainer#bindTo}.
 * @type String
 */
enchant.Event.R_BUTTON_UP = 'rbuttonup';
/**
 * An event that occurs when the right button of a controller is pressed.
 * Objects to issue:  Objects specified by {@link enchant.nwf.IMButton}, {@link enchant.nwf.WiiUGamePadInput}, {@link enchant.nwf.WiiRemoteInput}, {@link enchant.nwf.ClassicControllerInput}, and {@link enchant.nwf.ControllerInputContainer#bindTo}.
 * @type String
 */
enchant.Event.RIGHT_BUTTON_DOWN = 'rightbuttondown';
/**
 * An event that occurs when the right button of a controller is released.
 * Objects to issue:  Objects specified by {@link enchant.nwf.IMButton}, {@link enchant.nwf.WiiUGamePadInput}, {@link enchant.nwf.WiiRemoteInput}, {@link enchant.nwf.ClassicControllerInput}, and {@link enchant.nwf.ControllerInputContainer#bindTo}.
 * @type String
 */
enchant.Event.RIGHT_BUTTON_UP = 'rightbuttonup';
/**
 * An event that occurs when the right stick of a controller is pressed.
 * Objects to issue:  Objects specified by , {@link enchant.nwf.IMButton}, {@link enchant.nwf.WiiUGamePadInput}, {@link enchant.nwf.ClassicControllerInput}, and {@link enchant.nwf.ControllerInputContainer#bindTo}.
 * @type String
 */
enchant.Event.RSTICK_BUTTON_DOWN = 'rstickbuttondown';
/**
 * An event that occurs when the right stick of a controller is released.
 * Objects to issue:  Objects specified by , {@link enchant.nwf.IMButton}, {@link enchant.nwf.WiiUGamePadInput}, {@link enchant.nwf.ClassicControllerInput}, and {@link enchant.nwf.ControllerInputContainer#bindTo}.
 * @type String
 */
enchant.Event.RSTICK_BUTTON_UP = 'rstickbuttonup';
/**
 * An event that occurs when the SYNC button of a controller is pressed.
 * Objects to issue:  Objects specified by {@link enchant.nwf.IMButton}, {@link enchant.nwf.WiiUGamePadInput}, and {@link enchant.nwf.ControllerInputContainer#bindTo}.
 * @type String
 */
enchant.Event.SYNC_BUTTON_DOWN = 'syncbuttondown';
/**
 * An event that occurs when the SYNC button of a controller is released.
 * Objects to issue:  Objects specified by {@link enchant.nwf.IMButton}, {@link enchant.nwf.WiiUGamePadInput}, and {@link enchant.nwf.ControllerInputContainer#bindTo}.
 * @type String
 */
enchant.Event.SYNC_BUTTON_UP = 'syncbuttonup';
/**
 * An event that occurs when the up button of a controller is pressed.
 * Objects to issue:  Objects specified by {@link enchant.nwf.IMButton}, {@link enchant.nwf.WiiUGamePadInput}, {@link enchant.nwf.WiiRemoteInput}, {@link enchant.nwf.ClassicControllerInput}, and {@link enchant.nwf.ControllerInputContainer#bindTo}.
 * @type String
 */
enchant.Event.UP_BUTTON_DOWN = 'upbuttondown';
/**
 * An event that occurs when the up button of a controller is released.
 * Objects to issue:  Objects specified by {@link enchant.nwf.IMButton}, {@link enchant.nwf.WiiUGamePadInput}, {@link enchant.nwf.WiiRemoteInput}, {@link enchant.nwf.ClassicControllerInput}, and {@link enchant.nwf.ControllerInputContainer#bindTo}.
 * @type String
 */
enchant.Event.UP_BUTTON_UP = 'upbuttonup';
/**
 * An event that occurs when the X Button of a controller is pressed.
 * Objects to issue:  Objects specified by , {@link enchant.nwf.IMButton}, {@link enchant.nwf.WiiUGamePadInput}, {@link enchant.nwf.ClassicControllerInput}, and {@link enchant.nwf.ControllerInputContainer#bindTo}.
 * @type String
 */
enchant.Event.X_BUTTON_DOWN = 'xbuttondown';
/**
 * An event that occurs when the X Button of a controller is released.
 * Objects to issue:  Objects specified by , {@link enchant.nwf.IMButton}, {@link enchant.nwf.WiiUGamePadInput}, {@link enchant.nwf.ClassicControllerInput}, and {@link enchant.nwf.ControllerInputContainer#bindTo}.
 * @type String
 */
enchant.Event.X_BUTTON_UP = 'xbuttonup';
/**
 * An event that occurs when the Y Button of a controller is pressed.
 * Objects to issue:  Objects specified by , {@link enchant.nwf.IMButton}, {@link enchant.nwf.WiiUGamePadInput}, {@link enchant.nwf.ClassicControllerInput}, and {@link enchant.nwf.ControllerInputContainer#bindTo}.
 * @type String
 */
enchant.Event.Y_BUTTON_DOWN = 'ybuttondown';
/**
 * An event that occurs when the Y Button of a controller is released.
 * Objects to issue:  Objects specified by , {@link enchant.nwf.IMButton}, {@link enchant.nwf.WiiUGamePadInput}, {@link enchant.nwf.ClassicControllerInput}, and {@link enchant.nwf.ControllerInputContainer#bindTo}.
 * @type String
 */
enchant.Event.Y_BUTTON_UP = 'ybuttonup';
/**
 * An event that occurs when the ZL Button of a controller is pressed.
 * Objects to issue:  Objects specified by , {@link enchant.nwf.IMButton}, {@link enchant.nwf.WiiUGamePadInput}, {@link enchant.nwf.ClassicControllerInput}, and {@link enchant.nwf.ControllerInputContainer#bindTo}.
 * @type String
 */
enchant.Event.ZL_BUTTON_DOWN = 'zlbuttondown';
/**
 * An event that occurs when the ZL Button of a controller is released.
 * Objects to issue:  Objects specified by , {@link enchant.nwf.IMButton}, {@link enchant.nwf.WiiUGamePadInput}, {@link enchant.nwf.ClassicControllerInput}, and {@link enchant.nwf.ControllerInputContainer#bindTo}.
 * @type String
 */
enchant.Event.ZL_BUTTON_UP = 'zlbuttonup';
/**
 * An event that occurs when the ZR Button of a controller is pressed.
 * Objects to issue:  Objects specified by , {@link enchant.nwf.IMButton}, {@link enchant.nwf.WiiUGamePadInput}, {@link enchant.nwf.ClassicControllerInput}, and {@link enchant.nwf.ControllerInputContainer#bindTo}.
 * @type String
 */
enchant.Event.ZR_BUTTON_DOWN = 'zrbuttondown';
/**
 * An event that occurs when the ZR Button of a controller is released.
 * Objects to issue:  Objects specified by , {@link enchant.nwf.IMButton}, {@link enchant.nwf.WiiUGamePadInput}, {@link enchant.nwf.ClassicControllerInput}, and {@link enchant.nwf.ControllerInputContainer#bindTo}.
 * @type String
 */
enchant.Event.ZR_BUTTON_UP = 'zrbuttonup';
/**
 * An event that occurs when the C Button of a controller is pressed.
 * Objects to issue:  Objects specified by {@link enchant.nwf.IMButton}, {@link enchant.nwf.NunchukInput}, and {@link enchant.nwf.ControllerInputContainer#bindTo}.
 * @type String
 */
enchant.Event.C_BUTTON_DOWN = 'cbuttondown';
/**
 * An event that occurs when the C Button of a controller is released.
 * Objects to issue:  Objects specified by {@link enchant.nwf.IMButton}, {@link enchant.nwf.NunchukInput}, and {@link enchant.nwf.ControllerInputContainer#bindTo}.
 * @type String
 */
enchant.Event.C_BUTTON_UP = 'cbuttonup';
/**
 * An event that occurs when the Z Button of a controller is pressed.
 * Objects to issue:  Objects specified by {@link enchant.nwf.IMButton}, {@link enchant.nwf.NunchukInput}, and {@link enchant.nwf.ControllerInputContainer#bindTo}.
 * @type String
 */
enchant.Event.Z_BUTTON_DOWN = 'zbuttondown';
/**
 * An event that occurs when the Z Button of a controller is released.
 * Objects to issue:  Objects specified by {@link enchant.nwf.IMButton}, {@link enchant.nwf.NunchukInput}, and {@link enchant.nwf.ControllerInputContainer#bindTo}.
 * @type String
 */
enchant.Event.Z_BUTTON_UP = 'zbuttonup';
/**
 * An event that occurs when the RESERVED button of a controller is pressed.
 * Objects to issue:  Objects specified by {@link enchant.nwf.IMButton}, {@link enchant.nwf.ClassicControllerInput}, and {@link enchant.nwf.ControllerInputContainer#bindTo}.
 * @type String
 */
enchant.Event.RESERVED_BUTTON_DOWN = 'reservedbuttondown';
/**
 * An event that occurs when the RESERVED button of a controller is released.
 * Objects to issue:  Objects specified by {@link enchant.nwf.IMButton}, {@link enchant.nwf.ClassicControllerInput}, and {@link enchant.nwf.ControllerInputContainer#bindTo}.
 * @type String
 */
enchant.Event.RESERVED_BUTTON_UP = 'reservedbuttonup';

var _init = enchant.Core.prototype.initialize;
enchant.Core.prototype.initialize = function() {
    _init.apply(this, arguments);
    this.wiiRemote = new enchant.nwf.WiiRemoteManager();
    this.wiiUGamePad = new enchant.nwf.WiiUGamePadManager();
    this.appCommon = new enchant.nwf.FSRootDirectoryNode('common',
            nwf.io.Directory.appCommonSaveDirectory,
            nwf.io.Directory.appCommonSaveDirectory.systemPath);
};

function destructNwfObjects() {
    enchant.Core.instance.wiiRemote.destruct();
    enchant.Core.instance.wiiUGamePad.destruct();
    enchant.Core.instance.appCommon.destruct();
}

/**
 * Destroys the nwf.enchant.js object held by Core.
 * @function
 */
enchant.Core.prototype.destructNwfObjects = destructNwfObjects;

window.addEventListener('beforeunload', destructNwfObjects, false);

// !! dirty patch !!
// it will be integrated to future version of enchant.js
enchant.Deferred._insert = function(queue, ins) {
    if (queue._next instanceof enchant.Deferred) {
        ins._tail._next = queue._next;
    }
    queue._next = ins;
};

}());
