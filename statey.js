module.exports = {
    build: function(global, states, startStateName) {
        // build machine instance
        function buildMachineInstance() {
            var machine = {
                states: {}
            };
            for (var stateIndex in states) {
                var state = states[stateIndex];
                var machineState = machine.states[state.name] = {
                    machine: machine
                };
                for (var memberName in state) {
                    if (typeof state[memberName] == 'function') {
                        machineState[memberName] = state[memberName].bind(machineState);
                    }
                    else machineState[memberName] = state[memberName];                    
                }
            }
            return machine;
        }

        // remove listeners
        function removeStateListeners(state) {
            if (typeof state.__listenersToRemove == 'undefined') return;
            if (state.__listenersToRemove.length == 0) return;
            state.__listenersToRemove.forEach(function(listener) {
                listener.emitter.removeListener(listener.event, listener.handler);
            });
        }

        // internal state
        var machineState = {
            activeClients: 0
        }
        
        // mixin api accessible by the states
        var stateApi = {
            goto: function(stateName, userState) {
                this.deactivate(userState);
                removeStateListeners(this);
                var targetState = this.machine.states[stateName];
                if (typeof targetState == 'undefined') {
                    throw 'invalid state name';
                }
                targetState.activate(userState);
            },
            terminate: function(userState) {
                try {
                    this.deactivate(userState);
                    removeStateListeners(this);
                }
                finally
                {
                    machineState.activeClients -= 1;                    
                }
            },
            recordListeners: function() {
                var cbIndex = -1;
                for (var i in arguments) {
                    if (typeof arguments[i] == 'function') {
                        cbIndex = i;
                        break;
                    }
                }
                if (cbIndex == -1) return;
                var emitters = Array.prototype.slice.call(arguments, 0, cbIndex);
                var toRemove = this.__listenersToRemove = this.__listenersToRemove || [];
                var tempListeners = [];
                emitters.forEach((function(emitter) {
                    var newListenerHandler = function(event, handler) {
                        toRemove.push({
                            emitter: emitter,
                            event: event,
                            handler: handler
                        });
                    }
                    emitter.on('newListener', newListenerHandler);
                    tempListeners.push({
                        emitter: emitter,
                        event: 'newListener',
                        handler: newListenerHandler
                    });
                }).bind(this));
                try {
                    arguments[cbIndex].call(this);                    
                }
                finally {
                    tempListeners.forEach(function(listener) {
                        listener.emitter.removeListener(listener.event, listener.handler);
                    });
                }
            }
        }
        
        // build machine
        var foundStartState = false;
        states.forEach(function(state) {
            if (state.name === startStateName) foundStartState = true;
            state.global = global;
            for (var name in stateApi) {
                state[name] = stateApi[name];
            }
        });            

        // detect error in start state
        if (typeof startStateName != 'string' || foundStartState == false) throw 'invalid start state';

        // machine API
        var machineApi = {
          start: function() {
              try {
                  var instance = buildMachineInstance();
                  var startState = instance.states[startStateName];
                  machineState.activeClients += 1;
                  startState.activate.apply(startState, arguments);                  
              }
              catch (e) {
                  machineState.activeClients -= 1;
                  throw e;
              }
              return this;
          },
          count: function() {
              return machineState.activeClients;
          }
        }
        return machineApi;
    }
}
