/* jshint jquery: true */
/* global async: false */

'use strict';

//var $        = require('jquery'),
    //_        = require('lodash'),
    //Firebase = require('firebase');

'use strict';
var FIREBASE_URL = 'https://addressbook-c8.firebaseio.com/',
    $hidden      = $('.hidden'),
    $form        = $('form'),
    $create      = $('#createButton'),
    fb           = new Firebase(FIREBASE_URL),
    usersFbUrl;


if (fb.getAuth()) {
  $('.login').remove();
  $('.app').toggleClass('hidden'),
  $('.hidden-button').toggle();

  $.get(FIREBASE_URL + 'users/' + fb.getAuth().uid + '/data/addresslist.json', function(res){
    if(res !== null) {
      Object.keys(res).forEach(function(uuid){
        addRowToTable(uuid,res[uuid]);
      });
    }
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
    }firebase
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

  var url = FIREBASE_URL + 'users/' + fb.getAuth().uid + '/data/addresslist.json';
  var data = JSON.stringify({firstName: contactFirstName, nickname: contactNickname, lastName: contactLastName, phone: contactPhone, email: contactEmail, twitter: contactTwitter, photoUrl: contactPhoto});
  debugger;
  $.post(url, data, function(res){
  $tr.attr('data-uuid', res.name);
  $('tbody').append($tr);
  });
});

  function addRowToTable(uuid, obj){
    var $tr = $('<tr><td class="firstName">' + obj.firstName + '</td><td class="nickname">' + obj.nickname + '</td><td class="lastName">' + obj.lastName + '</td><td>' + obj.phone + '</td><td class="email">'+ obj.email + '</td><td class="twitter">'+ obj.twitter+'</td><td class="photo"><img src="'+ obj.photoUrl + '" class="image"></td><td class="remove"><button class="removeBtn">Remove</button><td></tr>');
    $tr.attr('data-uuid', uuid);
    $('tbody').append($tr);
  }

  $('tbody').on('click', '.removeBtn', function(evt){

  var $tr = $(evt.target).closest('tr');
  $tr.remove();

  var uuid = $tr.data('uuid');
  var url = 'https://addressbook-c8.firebaseio.com/users/' + fb.getAuth().uid + '/data/addresslist/' + uuid + '.json';
  $.ajax(url, {type: 'DELETE'});
  });
