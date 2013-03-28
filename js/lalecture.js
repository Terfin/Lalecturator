var vm;

$(function () {
	$('#saveStud').button().hide();
	$('#prevStuds').button();
	$('#nextStuds').button();
	var loggedUser;
	CheckForArrayFilter(); //Adds Array.filter if browser doesn't support by default
	vm = new viewModel();
	vm.Users.push(new Lecturer('Admin', 'Foo'));
	vm.loginObj(new User());
	vm.UserFormObj(new Student())
	loggedUser = lscache.get('loggedUser');
	if (loggedUser != null) {
		vm.loggedUser(vm.Users().filter(function (element) {
			return (element.username == loggedUser.username);
		})[0]);
	}
	$('#userTabs').tabs({active: 0});
	$('#adminTabs').tabs({active: 0})
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
	$('#studSelect').buttonset();
	vm.studentsByPage.subscribe(function () {
		try {
			$('#studSelect').buttonset('destroy').buttonset();
		}
		catch (err) {
			$('#studSelect').buttonset();
		}
	});
});
var user;

function login () {
	user = vm.Users().filter(function(element) {
		return (element.username == vm.loginObj().username);
	});
	if (user.length == 0 || vm.loginObj().password != user[0].password)
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
				vm.loggedUser(user[0]);
				lscache.set('loggedUser', user[0], 15);
			});
		}
	}
}

function resetLS () {
	user = lscache.get('loggedUser');
	if (user != null)
	{
		lscache.set('loggedUser', vm.loggedUser(), 15);
	}
}



function notStudent (studId) {
	var student = vm.Students().filter(function (elem) {
		return elem.uid == studId;
	})
	return (student.length == 0);
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

