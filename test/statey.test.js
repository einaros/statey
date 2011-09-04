var assert = require('assert'); 
var EventEmitter = require('events').EventEmitter;
var statey = require('../statey');
require('should');

var Socket = function() {}
Socket.prototype.__proto__ = EventEmitter.prototype;

module.exports = {
    'machine does not start immediately': function() {
        var notActivated = true;
        var machine = statey.build({
                clients: []
            },
            [{
                name: 'new',
                activate: function(data) {
                    notActivated = false;
                },
                deactivate: function(myState) {
                },
            }
        ], 'new');
        notActivated.should.be.ok;
    },
    'no startstate causes error': function() {
        var exceptionThrown = false;
        try {
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
        }
        catch(e) {
          exceptionThrown = true;
        }
        exceptionThrown.should.be.ok;
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
        ], 'new');
        machine.start(42);
        activateCalled.should.be.ok;
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
        ], 'new').start(42);
        activateCalled.should.be.ok;
    },
    'can goto state': function() {
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
        ], 'new').start();
        gotoCalled.should.be.ok;
    },
    'goto triggers deactivate': function() {
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
        ], 'new').start();
        gotoCalled.should.be.ok;
    },
    'terminate triggers deactivate': function() {
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
        ], 'new').start();
        gotoCalled.should.be.ok;
    },
    'machine tracks number of active runners': function() {
        var socket = new Socket();
        var machine = statey.build({},
            [{
                name: 'new',
                activate: function(socket) {
                    socket.on('endit', this.terminate.bind(this));
                },
                deactivate: function(params) {
                },
            }
        ], 'new').start(socket);
        machine.count().should.equal(1);
        socket.emit('endit');
        machine.count().should.equal(0);
    },
    'machine updates active count when an exception arises during machine start': function() {
        var machine = statey.build({},
            [{
                name: 'new',
                activate: function() {
                    throw 'error and such';
                },
                deactivate: function(params) {
                },
            }
        ], 'new');
        try {
            machine.start();
        }
        catch(e) {}
        machine.count().should.equal(0);
    },
}
