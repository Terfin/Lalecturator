var User = function(username, passwd)
{
	this.username = username;
	this.password = passwd;
}

var Student = function(uid, username, password, email) {
	this.uid = uid;
	this.email = email;
	User.call(this, username, password);
}

var Lecturer = function(username, password) {
	User.call(this, username, password);
}

var viewModel = function() {
	var self = this;
	self.Users = ko.observableArray([]);
	self.Lecturers = ko.computed(function () {
		return ko.utils.arrayFilter(self.Users(), function(item) {
			return item instanceof Lecturer;
		});
	});
	self.Students = ko.computed(function () {
		return ko.utils.arrayFilter(self.Users(), function(item) {
			return item instanceof Student;
		});
	});

	self.loggedUser = ko.observable();
	self.loginObj = ko.observable({
		username: ko.observable(),
		password: ko.observable()
	});
	self.UserFormObj = ko.observable({
		uid: ko.observable(),
		name: ko.observable(),
		email: ko.observable(),
		password: ko.observable()
	});
	ko.bindingHandlers.uibutton = {
		init: function(element, valueAccessor) {
			var $element = $(element), config = valueAccessor();
			$element.button();
		}
	}
}