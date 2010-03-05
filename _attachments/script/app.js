;(function($)
{
    // User class taken from swinger, by quirkey
    // Copyright (c) 2009 Aaron Quint
    // http://github.com/quirkey/swinger
  User = {
    _current_user: false,
    isLoggedIn: function() {
      return !!this._current_user;
    },
    current: function(callback, force) {
      var user = this;
      if (!this._current_user || force === true) {
        $.couch.session({
          success: function(session) {
            if (session.userCtx && session.userCtx.name) {
              user._current_user = session.userCtx;
              callback(user._current_user);
            } else {
              user._current_user = false;
              callback(false);
            }
          }
        });
      } else {
        callback(user._current_user);
      }
    },
    login: function(name, password, callback) {
      $.couch.login({
        name : name,
        password : password,
        success: function() {
          User.current(callback, true);
        },
        error: function(code, error, reason) {
          showNotification('error', reason);
        }
      });
    },
    logout: function(callback) {
      var user = this;
      $.couch.logout({
        success: function() {
          user._current_user = false;
          callback();
        },
        error: function(code, error, reason) {
          showNotification('error', reason);
        }
      });
    },
    signup: function(name, email, password, callback) {
      $.couch.signup({name: name, email: email}, password, {
        success: function() {
          User.login(name, password, callback);
        },
        error: function(code, error, reason) {
          showNotification('error', reason);
        }
      })
    }
  };


})(jQuery);

$(function() {
    User.current(function(user) {
        if (user) {
            $('#basic_account').html("Hello " + user.name);
        } else { 
            $('#basic_account').html("Hello anon");
        }


    });
});
