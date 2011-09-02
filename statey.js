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
        states.enter = function(stateName) {
            var startState = stateMap[stateName];
            if (typeof startState == 'undefined') {
                throw 'invalid state name';
            }
            startState.activate.apply(startState, Array.prototype.slice.call(arguments, 1));
        }
        if (arguments.length > 2) {
            var args = Array.prototype.slice.call(arguments, 2);
            states.enter.apply(this, args);
        }
        return states;
    }
}
