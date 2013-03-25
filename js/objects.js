var User = function(username, passwd)
{
	this.username = username;
	this.password = passwd;
}

var Student = function(id, username, password, email) {
	User.call(this, username, password);
	this.id = id;
	this.email = email;
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
}