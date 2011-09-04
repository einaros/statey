module.exports = {
    build: function(global, states, startStateName) {        
        var stateMap = {};
        
        var machineState = {
            activeClients: 0
        }
        
        var stateApi = {
            goto: function(stateName, userState) {
                this.deactivate(userState);
                var targetState = stateMap[stateName];
                if (typeof targetState == 'undefined') {
                    throw 'invalid state name';
                }
                targetState.activate(userState);
            },
            terminate: function(userState) {
                try {
                    this.deactivate(userState);
                }
                finally
                {
                    machineState.activeClients -= 1;                    
                }
            }
        }
        
        states.forEach(function(state) {
            stateMap[state.name] = state;
            state.global = global;
            for (var name in stateApi) {
                state[name] = stateApi[name];
            }
        });

        if (typeof startStateName != 'string' || stateMap[startStateName] == null) throw 'invalid start state';

        var machine = {
          start: function() {
              try {
                  var startState = stateMap[startStateName];
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
        return machine;
    }
}
