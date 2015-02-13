/* jshint jquery: true */

'use strict';

var FIREBASE_URL = 'https://addressbook-c8.firebaseio.com',
    $hidden      = $('.hidden'),
    $create      = $('#createButton'),
    fb           = new Firebase(FIREBASE_URL),
    usersFb;


if (fb.getAuth()) {
  $('.login').remove();
  $('.app').toggleClass('hidden'),
  $('.hidden-button').toggle();

  usersFb = fb.child('users/' + fb.getAuth().uid + '/data/friends');

  usersFb.once('value', function (res){
    var data = res.val();
    Object.keys(data).forEach(function (uuid){
      addRowToTable(uuid, data[uuid]);
    });
  });
}

$create.on('click', revealForm);

$('.button').click(function () {
  var $loginForm = $('.loginForm'),
      email      = $loginForm.find('[type="email"]').val(),
      pass       = $loginForm.find('[type="password"]').val(),
      data       = {email: email, password: pass};

  registerAndLogin(data, function (err, auth) {
    if (err) {
      $('.error').text(err);
    } else {
      location.reload(true);
    }
  });
  $('.hidden-button').toggle();
  $('.loginForm').hide();
});

$('.login form').submit(function (event) {
  var $loginForm = $(event.target),
      email      = $loginForm.find('[type="email"]').val(),
      pass       = $loginForm.find('[type="password"]').val(),
      data       = {email: email, password: pass};

      event.preventDefault();

  fb.authWithPassword(data, function(err, auth) {
    if (err) {
      $('.error').text(err);
    } else {
      location.reload(true);
    }
  });
});

$('.logout').click(function (){
  fb.unauth();
  location.reload(true);
});

function registerAndLogin(obj, cb) {
  fb.createUser(obj, function(err) {
    if (!err) {
      fb.authWithPassword(obj, function (err, auth){
        if (!err) {
          cb(null, auth);
        } else {
          cb(err);
        }
      });
    } else {
      cb(err);
    }
  });
}

function revealForm() {
  $hidden.show();
}

$('#submit').on('click', function(event){
  event.preventDefault();
  $hidden.toggle();

  var contactFirstName   = $('#firstName').val();
  var contactNickname    = $('#nickname').val();
  var contactLastName    = $('#lastName').val();
  var contactPhone       = $('#phone').val();
  var contactEmail       = $('#email').val();
  var contactTwitter     = $('#twitter').val();
  var contactPhoto       = $('#photoUrl').val();

  $('#firstName').val('');
  $('#nickname').val('');
  $('#lastName').val('');
  $('#phone').val('');
  $('#email').val('');
  $('#twitter').val('');
  $('#photoUrl').val('');

  var $tr = $('<tr><td>' + contactFirstName + '</td><td>' + contactNickname + '</td><td>' + contactLastName + '</td><td>' + contactPhone + '</td><td>' + contactEmail + '</td><td>'+ contactTwitter+'</td><td><img src="'+ contactPhoto+'" class="image"</td><td><button class="removeBtn">Remove</button><td></tr>');

  addFriendToDb(req, function(res) {
    $tr.attr('data-uuid', res.name);
    $('tbody').append($tr);
  });
});

function addFriendToDb(data, cd) {
  var uuid = usersFb.push(data).key();
  cb({name: uuid});
}


function addRowToTable(uuid, obj){
  var $tr = $('<tr><td class="firstName">' + obj.firstName + '</td><td class="nickname">' + obj.nickname + '</td><td class="lastName">' + obj.lastName + '</td><td>' + obj.phone + '</td><td class="email">'+ obj.email + '</td><td class="twitter">'+ obj.twitter+'</td><td class="photo"><img src="'+ obj.photoUrl + '" class="image"></td><td class="remove"><button class="removeBtn">Remove</button><td></tr>');
  $tr.attr('data-uuid', uuid);
  $('tbody').append($tr);
}

$('tbody').on('click', '.removeBtn', function(evt){

  var $tr = $(evt.target).closest('tr'),
      uuid = $tr.data('uuid');

  $tr.remove();

  usersFb.child(uuid).remove();
});
