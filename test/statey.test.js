var assert = require('assert'); 
var EventEmitter = require('events').EventEmitter;
var statey = require('../statey');

var Socket = function() {}
Socket.prototype.__proto__ = EventEmitter.prototype;

module.exports = {
    'can activate with parameter': function() {
        var activateCalled = false;
        var machine = statey.build({
                clients: []
            },
            [{
                name: 'new',
                activate: function(data) {
                    activateCalled = data == 42;
                },
                deactivate: function(myState) {
                },
            }
        ], 'new', 42);
        assert.ok(activateCalled);
    },
    'no startstate causes initially stopped machine': function() {
        var activateCalled = false;
        var machine = statey.build({
                clients: []
            },
            [{
                name: 'new',
                activate: function(data) {
                    activateCalled = true;
                },
                deactivate: function(myState) {
                },
            }
        ]);
        assert.ok(!activateCalled);
    },
    'initially stopped machine can be started with parameter': function() {
        var activateCalled = false;
        var machine = statey.build({
                clients: []
            },
            [{
                name: 'new',
                activate: function(data) {
                    activateCalled = data == 42;
                },
                deactivate: function(myState) {
                },
            }
        ]);
        machine.enter('new', 42);
        assert.ok(activateCalled);
    },
    'global state is accessible': function() {
        var activateCalled = false;
        var machine = statey.build({
                ok: 1
            },
            [{
                name: 'new',
                activate: function(data) {
                    activateCalled = this.global.ok === 1;
                },
                deactivate: function(myState) {
                },
            }
        ], 'new', 42);
        assert.ok(activateCalled);
    },
    'can goto state': function() {
        var socket = new Socket();
        var gotoCalled = false;
        var machine = statey.build({
                clients: []
            },
            [{
                name: 'new',
                activate: function(data) {
                    this.goto('authenticated', 42);
                },
                deactivate: function(params) {
                },
            }, {
                name: 'authenticated',
                activate: function(params) {
                    gotoCalled = params == 42;
                },
                deactivate: function() {
                },
            }
        ], 'new', socket);
        assert.ok(gotoCalled);
    },
    'goto triggers deactivate': function() {
        var socket = new Socket();
        var gotoCalled = false;
        var machine = statey.build({
                clients: []
            },
            [{
                name: 'new',
                activate: function(data) {
                    this.goto('authenticated', 42);
                },
                deactivate: function(params) {
                    gotoCalled = params == 42;
                },
            }, {
                name: 'authenticated',
                activate: function(params) {
                },
                deactivate: function() {
                },
            }
        ], 'new', socket);
        assert.ok(gotoCalled);
    },
    'terminate triggers deactivate': function() {
        var socket = new Socket();
        var gotoCalled = false;
        var machine = statey.build({
                clients: []
            },
            [{
                name: 'new',
                activate: function(data) {
                    this.terminate(42);
                },
                deactivate: function(params) {
                    gotoCalled = params == 42;
                },
            }
        ], 'new', socket);
        assert.ok(gotoCalled);
    },
}
