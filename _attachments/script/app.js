;(function($)
{
    // User class taken from swinger, by quirkey
    // Copyright (c) 2009 Aaron Quint
    // http://github.com/quirkey/swinger
    // MIT License
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
            alert(reason);
         // showNotification('error', reason);
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
    // check for login when we load the page
    User.current(function(user) {
        if (user) {
            $('#account #user .name').html(user.name);
            $('#account #user').show();
            $('#account .form').hide();
        };
    });

    // bind logout to the log out link
    $('#account .logout').click (function() {
        User.logout(function() {
            $('#account #user').hide();
             $('#account .form').show();
        });
        return false;
    });

    // bind the form toggling to the login link
    var a = $('#account a.login');
    a.bind('click', { link: a }, function(e) {
        var top = e.data.link.offset().top + e.data.link.height();
        var form = $('#loginform');
        var left = e.data.link.offset().left - form.width() + e.data.link.width();
        form.css('left', left);
        form.css('top', top);
        form.toggle();
        return false;
    });

    // override the submit event for the form.
   $('#loginform').submit(function() {
     User.login( // there must be a cleaner way to do this!
         $('#loginform input[type="text"]').val(),
        $('#loginform input[type="password"]').val(),
        function(user) {
            $('#loginform input[type="text"]').val('');
            $('#loginform input[type="password"]').val();

            $('#account #user .name').html(user.name);
            $('#account #user').show();
            $('#account div.form').hide();
        });
        return false;
    });
});
