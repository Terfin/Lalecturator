var vm;

$(function () {
	var loggedUser;
	CheckForArrayFilter();
	vm = new viewModel();
	vm.Users.push(new Lecturer('Admin', 'Foo'));
	vm.Users.push(new Student(3, 'Moshe', 'Foo', 'omg@gmail.com'));
	loggedUser = lscache.get('loggedUser');
	if (loggedUser != null) {
		vm.loggedUser(vm.Users().filter(function (element) {
			return (element.username == loggedUser.username);
		})[0]);
	}
	$('#userTabs').tabs({active: 0});
	$('#adminTabs').tabs({active: 0});
	if (vm.loggedUser())
	{
		if (vm.loggedUser() instanceof Lecturer)
		{
			$('.login').hide(0);
			$('#userTabs').tabs({active: 0}).hide(0);
		}
		else if (vm.loggedUser() instanceof Student)
		{
			$('.login').hide(0);
			$('#adminTabs').tabs({active: 0}).hide(0);
		}
		else
		{
			$('#userTabs').hide(0);
			$('#adminTabs').hide(0);
		}
	}
	else 
	{
		//	$('#userTabs').tabs({active: 0}).hide(0);
		$('#adminTabs').hide(0);
	}
	$('#resetBtn,#submitBtn,#addStud,#resetStud,#editStud,#removeStud').button();
	ko.applyBindings(vm);
});
var user;

function login () {
	user = vm.Users().filter(function(element) {
		return (element.username == vm.loginObj().username());
	});
	if (user.length == 0 || vm.loginObj().password() != user[0].password)
	{
		$('#errorMsg').text('Bad user/password combination');
	}
	else {
		if ($('#errorMsg').text() != "") 
		{
			$('#errorMsg').text("");
		}
		if (user[0] instanceof Lecturer){
			$('.login').hide(400, 'swing', function () {
				$('#adminTabs').show(400);
				lscache.set('loggedUser', user[0], 15);
			});
		}
	}
}

function resetLS () {
	lscache.set('loggedUser', loggedUser, 15);
}

function addStudent () {
	$('form.addStudent input[type=text]').each(function () {
		console.log(this.id)
		if (this.value == '')
		{
			$(this).css("border", "2px solid #FF0000");
		}
		else if (this.id == "idNum" && isNaN(this.value)) {
			$(this).css("border", "2px solid #FF0000");
		}
		else if (this.id == "email" && (this.value.match(/@/g) == null || this.value.match(/@/g).length != 1)) {
			$(this).css("border", "2px solid #FF0000");
		}
		else {
			$(this).css("border", "");
		}
	});
	var stId = $('#idnum').val();
	var stName = $('#name').val();
	var stPasswd = $('#passwd').val();
	var stMail = $('#email').val();
}

function CheckForArrayFilter () {
	if (!Array.prototype.filter)
	{
	  Array.prototype.filter = function(fun /*, thisp */)
	  {
	    "use strict";

	    if (this === void 0 || this === null)
	      throw new TypeError();

	    var t = Object(this);
	    var len = t.length >>> 0;
	    if (typeof fun !== "function")
	      throw new TypeError();

	    var res = [];
	    var thisp = arguments[1];
	    for (var i = 0; i < len; i++)
	    {
	      if (i in t)
	      {
	        var val = t[i]; // in case fun mutates this
	        if (fun.call(thisp, val, i, t))
	          res.push(val);
	      }
	    }

	    return res;
	  };
	}
}