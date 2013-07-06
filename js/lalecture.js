var vm;
var loggedUser;
$(function () {
    ko.bindingHandlers.uibutton = {
        init: function(element, valueAccessor) {
            var $element = $(element), config = valueAccessor();
            $element.button();
        }
    }
	$('#saveStud').button().hide();
	$('#prevStuds').button();
	$('#nextStuds').button();
    $('#logoutBtn').button();
    $('#studModal').dialog({
        autoOpen: false,
        closeOnEscape: true,
        modal: true,
        width: 600,
        height: 550,
        title: "Exam Review"
    });
	CheckForArrayFilter(); //Adds Array.filter if browser doesn't support by default
	vm = new viewModel();
	var rawStudents = lscache.get('students');
	for (studIdx in rawStudents) {
		vm.Users.push(ko.mapping.fromJS(rawStudents[studIdx], {}, new Student))
	}
	vm.Users.push(new Lecturer('Admin', 'Foo'));
	vm.loginObj(new User());
	vm.svm.studentFormObj(new Student());
	var rawLoggedUser = lscache.get('loggedUser');
    if (rawLoggedUser != null)
    {
        if (rawLoggedUser.uid != undefined)
        {
            loggedUser = ko.mapping.fromJS(rawLoggedUser, {}, new Student);
        }
        else
        {
            loggedUser = ko.mapping.fromJS(rawLoggedUser, {}, new Lecturer);
        }
    }
	if (loggedUser != null) {
		vm.loggedUser(vm.Users().filter(function (element) {
			return (element.username() == loggedUser.username());
		})[0]);
	}
	$('#studentTabs').tabs({active: 0});
	$('#adminTabs').tabs({active: 0,  activate: function (event, ui) {
        vm.currentTab($('#adminTabs').tabs('option', 'active'));
    }});
	if (vm.loggedUser())
	{
		if (vm.loggedUser() instanceof Lecturer)
		{
			$('.login').hide(0);
			$('#studentTabs').tabs({active: 0}).hide(0);
		}
		else if (vm.loggedUser() instanceof Student)
		{
			$('.login').hide(0);
			$('#adminTabs').tabs({active: 0}).hide(0);
		}
		else
		{
			$('#studentTabs').hide(0);
			$('#adminTabs').hide(0);
		}
	}
	else 
	{
		$('#studentTabs').tabs({active: 0}).hide(0);
		$('#adminTabs').hide(0);
	}
	$('#resetBtn,#submitBtn,#addStud,#resetStud,#editStud,#removeStud').button();
	ko.applyBindings(vm);
});
var user;

function login () {
	user = vm.Users().filter(function(element) {
		return (element.username() == vm.loginObj().username());
	});
	if (user.length == 0 || vm.loginObj().password() != user[0].password())
	{
		$('#errorMsg').text('Bad user/password combination');
	}
	else {
		if ($('#errorMsg').text() != "") 
		{
			$('#errorMsg').text("");
		}
		if (user[0] instanceof Lecturer){
            console.log(user);
			$('.login').hide(800, 'swing', function () {
				$('#adminTabs').show(800);
				vm.loggedUser(user[0]);
                loggedUser = user[0];
				lscache.set('loggedUser', ko.mapping.toJS(vm.loggedUser), 15);
			});
		}
        else if (user[0] instanceof Student) {
            console.log(user);
            $('.login').hide(800, 'swing', function () {
                $('#studentTabs').show(800);
                vm.loggedUser(user[0]);
                loggedUser = user[0];
                lscache.set('loggedUser', ko.mapping.toJS(vm.loggedUser), 15);
            });
        }
	}
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

function logout () {
    lscache.remove('loggedUser');
    location.reload();
}

