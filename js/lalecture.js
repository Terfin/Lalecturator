var vm;
var loggedUser;

/**
 * JQUERY START.
 * lscache is a beta JS library that is used to turn localstorage into a session manager by enabling timeout for stored items.
 */
$(function () {
    ko.bindingHandlers.uibutton = { // Adds the UIButton binding which autocreates the JQUERYUI Button upon element creation.
        init: function(element, valueAccessor) {
            var $element = $(element), config = valueAccessor();
            $element.button();
        }
    }
	$('#saveStud').button().hide();
	$('#prevStuds').button();
	$('#nextStuds').button();
    $('#logoutBtn').button();
    $('#studModal').dialog({ //EXAM REVIEW MODAL
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
	for (var i = 0; i < rawStudents.length; i++) { // Retrieves all the students and maps them back into the right observables.
		vm.Users.push(ko.mapping.fromJS(rawStudents[i], {
            'exams' : {
                create: function (opts)
                {
                    return { id: ko.observable(opts.data.id), Name: ko.computed(function () {
                        var exam = vm.evm.exams().filter(function (exam)
                        {
                            return exam.id() == opts.data.id;
                        });
                        return exam[0].name();
                    }), Score: ko.observable(opts.data.Score)};
                }
            }
        }, new Student))
	}
	vm.Users.push(new Lecturer('Admin', 'Foo')); //mock lecturer user.
	vm.loginObj(new User()); // Reset the login object into a new user.
	vm.svm.studentFormObj(new Student()); // Resets the student form object which is used to add users by the lecturer.
	var rawLoggedUser = lscache.get('loggedUser'); // Get the logged user if any.
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
		vm.loggedUser(vm.Users().filter(function (element) { //In order to ensure data integrity, we want to set the actual loggedUser (in the main VM) to the actual student or lecturer.
			return (element.username() == loggedUser.username());
		})[0]);
	}
	$('#studentTabs').tabs({active: 0}); // Creates the student tabs and selects the first tab.
	$('#adminTabs').tabs({active: 0,  activate: function (event, ui) { // creates the admin stabs and
        vm.currentTab($('#adminTabs').tabs('option', 'active')); //Used in the view.
    }});
	if (vm.loggedUser()) // If login succeeded or there was a logged in user already, render the appropriate tabs set according to the type of the user.
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


/**
 * Login function, called from the login form.
 * In case of validated user, it renders the appropriate tabs.
 * Replicated function code is known. Could be optimized by calling a third function from both here and the JQUERY START.
 */
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

function CheckForArrayFilter () { // Adds array filter in case of using IE 8 or below. Taken from MDN (Mozilla Dev Network)
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


function logout () { // Just logout, clears the localstorage from the loggedUser entry and reloads the page.
    lscache.remove('loggedUser');
    location.reload();
}

