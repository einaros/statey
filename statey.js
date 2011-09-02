module.exports = {
    build: function(global, states, start) {
        var stateMap = {};
        var api = {
            goto: function(stateName, userState) {
                this.deactivate(userState);
                var targetState = stateMap[stateName];
                if (typeof targetState == 'undefine') {
                    throw 'invalid state name';
                }
                targetState.activate(userState);
            }
        }
        states.forEach(function(state) {
            stateMap[state.name] = state;
            state.global = global;
            for (var name in api) {
                state[name] = api[name];
            }
        });
        var startState = stateMap[start];
        var args = Array.prototype.slice.call(arguments, 3);
        startState.activate.apply(startState, args);
        return states;
    }
}
